import importlib.util
import json
import unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('prep',Path(__file__).parents[1]/'tools/check_preparation.py')
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
class PreparationTests(unittest.TestCase):
 def test_assets_and_links(self): self.assertEqual(p.check_site(),[])
 def test_unset_rates_cannot_pass(self):
  d=json.loads((p.ROOT/'docs/launch/assets/budget-input.example.json').read_text());self.assertFalse(p.budget(d)['ready_for_cost_review'])
 def test_budget_arithmetic(self):
  d={k:0 for k in ('capital_usd','monthly_revenue_usd','platform_monthly_usd','ai_fixed_monthly_usd','number_monthly_usd','combined_ai_and_inbound_per_minute_usd','transfer_per_minute_usd','transfer_fraction','email_and_storage_monthly_usd','gateway_percent','gateway_fixed_usd','tax_monthly_usd','domain_upfront_usd','test_wallet_upfront_usd','reserve_usd')}
  d.update(capital_usd=250,monthly_revenue_usd=499,platform_monthly_usd=97,combined_ai_and_inbound_per_minute_usd=.25,scenarios_minutes=[200],verified_rates=True)
  r=p.budget(d);self.assertEqual(r['scenarios'][0]['monthly_cost_usd'],'147.00');self.assertEqual(r['scenarios'][0]['contribution_before_labor_usd'],'352.00');self.assertEqual(r['ninety_day_cash_floor_usd'],'291')
 def test_each_missing_gate_blocks(self):
  state={k:True for k in p.GATES};state['evidence_references']={k:'private:test-reference' for k in p.GATES}
  for k in p.GATES:
   with self.subTest(gate=k):
    removed=dict(state);removed[k]=False;self.assertFalse(p.check_release(removed)['all_documented_prerequisites_present'])
 def test_truthy_text_and_missing_evidence_do_not_pass(self):
  state={k:'yes' for k in p.GATES};self.assertFalse(p.check_release(state)['all_documented_prerequisites_present'])
  state={k:True for k in p.GATES};self.assertFalse(p.check_release(state)['all_documented_prerequisites_present'])
 def test_manual_billing_does_not_require_autopay_authorization(self):
  state={k:True for k in p.GATES};state['evidence_references']={k:'private:test-reference' for k in p.GATES};state['billing_mode']='MANUAL_INVOICE'
  self.assertTrue(p.check_release(state)['all_documented_prerequisites_present'])
  state['billing_mode']='AUTHORIZED_AUTOPAY';self.assertFalse(p.check_release(state)['all_documented_prerequisites_present'])
 def test_nonfinite_and_negative_rates_rejected(self):
  d={k:0 for k in ('capital_usd','monthly_revenue_usd','platform_monthly_usd','ai_fixed_monthly_usd','number_monthly_usd','combined_ai_and_inbound_per_minute_usd','transfer_per_minute_usd','transfer_fraction','email_and_storage_monthly_usd','gateway_percent','gateway_fixed_usd','tax_monthly_usd','domain_upfront_usd','test_wallet_upfront_usd','reserve_usd')};d['scenarios_minutes']=[200]
  for rate in ('NaN','Infinity',-1):
   with self.subTest(rate=rate):
    d['platform_monthly_usd']=rate
    with self.assertRaises(ValueError):p.budget(d)
if __name__=='__main__':unittest.main()
