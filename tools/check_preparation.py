"""Offline preparation checks only. Does not connect to HighLevel or activate anything."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from decimal import Decimal
import argparse
import json
import subprocess
ROOT = Path(__file__).resolve().parents[1]
GATES = ('legal_approved','contract_completed','setup_payment_settled','onboarding_complete','acceptance_signed','owner_activation_approved','customer_activation_approved','fallback_verified','cost_controls_verified')
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.refs=[]; self.labels=[]; self.images=[]; self.tags=[]
    def handle_starttag(self, tag, attrs):
        d=dict(attrs); self.tags.append(tag)
        if 'id' in d: self.ids.append(d['id'])
        if tag in ('a','link','script','img','video','source','track'): self.refs.append(d.get('href',d.get('src','')))
        if tag=='label' and 'for' in d: self.labels.append(d['for'])
        if tag=='img': self.images.append(d)
def check_site():
    errors=[]; cache={}
    for name in ('index.html','privacy.html','terms.html','thanks.html','marketing/preview.html','marketing/source/creative.html'):
        p=Page();p.feed((ROOT/name).read_text(encoding='utf-8'));cache[name]=p
        if len(p.ids)!=len(set(p.ids)): errors.append(name+': duplicate ID')
        if not all(x in p.ids for x in p.labels):errors.append(name+': missing label target')
        if not all('alt' in x for x in p.images):errors.append(name+': missing image alt')
    for name,p in cache.items():
        for ref in p.refs:
            if not ref:continue
            u=urlsplit(ref)
            if u.scheme or u.netloc:continue
            target=(ROOT/name).parent/unquote(u.path or name)
            if u.path in ('.','./'):target=ROOT/'index.html'
            if target.is_dir():target=target/'index.html'
            if not target.exists():errors.append(name+': missing '+ref);continue
            if u.fragment:
                q=Page();q.feed(target.read_text(encoding='utf-8'))
                if u.fragment not in q.ids:errors.append(name+': missing fragment '+ref)
    return errors
def budget(data):
    numeric=('capital_usd','monthly_revenue_usd','platform_monthly_usd','ai_fixed_monthly_usd','number_monthly_usd','combined_ai_and_inbound_per_minute_usd','transfer_per_minute_usd','transfer_fraction','email_and_storage_monthly_usd','gateway_percent','gateway_fixed_usd','tax_monthly_usd','domain_upfront_usd','test_wallet_upfront_usd','reserve_usd')
    missing=[x for x in numeric if data.get(x) is None]
    if missing: return {'ready_for_cost_review':False,'missing_rates':missing}
    v={k:Decimal(str(data[k])) for k in numeric}
    if any(not x.is_finite() or x<0 for x in v.values()):raise ValueError('Rates and amounts must be finite and nonnegative')
    if v['transfer_fraction']>1 or v['gateway_percent']>1:raise ValueError('Fractions must be between 0 and 1')
    fixed=v['platform_monthly_usd']+v['ai_fixed_monthly_usd']+v['number_monthly_usd']+v['email_and_storage_monthly_usd']+v['tax_monthly_usd']
    initial=fixed+v['domain_upfront_usd']+v['test_wallet_upfront_usd']+v['reserve_usd']
    # Pre-revenue cash floor excludes wallet usage beyond initial funding; report separately.
    runway90=3*fixed+v['domain_upfront_usd']+v['test_wallet_upfront_usd']+v['reserve_usd']
    scenarios=[]
    for m in data['scenarios_minutes']:
        minutes=Decimal(str(m))
        if not minutes.is_finite() or minutes<0:raise ValueError('Minutes must be finite and nonnegative')
        variable=minutes*(v['combined_ai_and_inbound_per_minute_usd']+v['transfer_fraction']*v['transfer_per_minute_usd'])
        fee=v['monthly_revenue_usd']*v['gateway_percent']+v['gateway_fixed_usd']
        cost=fixed+variable+fee
        scenarios.append({'minutes':str(minutes),'monthly_cost_usd':str(cost.quantize(Decimal('.01'))),'contribution_before_labor_usd':str((v['monthly_revenue_usd']-cost).quantize(Decimal('.01')))})
    return {'ready_for_cost_review':data.get('verified_rates') is True,'first_month_cash_floor_usd':str(initial),'ninety_day_cash_floor_usd':str(runway90),'within_startup_capital':initial<=v['capital_usd'],'note':'Cash floors exclude additional usage, unquoted taxes/fees and labor. This is not authorization to buy or charge.','scenarios':scenarios}
def check_release(state):
    required=list(GATES)
    if state.get('billing_mode') not in ('MANUAL_INVOICE','AUTHORIZED_AUTOPAY'):required.append('billing_mode_selected')
    if state.get('billing_mode')=='AUTHORIZED_AUTOPAY':required.append('recurring_authorization_signed')
    missing=[x for x in required if state.get(x) is not True or not str(state.get('evidence_references',{}).get(x,'')).strip()]
    return {'all_documented_prerequisites_present':not missing,'missing_or_undocumented':missing,'note':'Offline checklist only; never authorizes or performs publication, payment or forwarding.'}
def main():
    p=argparse.ArgumentParser();p.add_argument('--budget',type=Path);p.add_argument('--release',type=Path);args=p.parse_args()
    if args.budget:result=budget(json.loads(args.budget.read_text(encoding='utf-8')))
    elif args.release:result=check_release(json.loads(args.release.read_text(encoding='utf-8')))
    else:
        errors=check_site()
        original_css=subprocess.check_output(['git','show','aa96323:assets/site.css'],cwd=ROOT).decode('utf-8')
        original=Page();original.feed(subprocess.check_output(['git','show','aa96323:index.html'],cwd=ROOT).decode('utf-8'))
        current=Page();current.feed((ROOT/'index.html').read_text(encoding='utf-8'))
        same=(ROOT/'assets/site.css').read_text(encoding='utf-8').startswith(original_css.replace('\r\n','\n')) and all(x in current.ids for x in ('heroTitle','how-it-works','contact','pricing'))
        for name in ('logo.svg','logo-light.svg','favicon.svg'):
            same=same and (ROOT/name).read_bytes().replace(b'\r\n',b'\n')==subprocess.check_output(['git','show','aa96323:'+name],cwd=ROOT).replace(b'\r\n',b'\n')
        for path in (ROOT/'docs/launch/assets').glob('*.json'):json.loads(path.read_text(encoding='utf-8'))
        result={'site_errors':errors,'original_brand_and_base_styles_retained':same,'asset_json_valid':True}
        print(json.dumps(result,indent=2));return int(bool(errors) or not same)
    print(json.dumps(result,indent=2));return 0
if __name__=='__main__':raise SystemExit(main())
