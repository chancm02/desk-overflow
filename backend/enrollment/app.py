"""WSGI API; run behind TLS with gunicorn, not the stdlib development server."""
import json,os,smtplib
from email.message import EmailMessage
from pathlib import Path
from .core import Enrollment,Rejected,CATALOG,VERSION
ORIGIN='https://www.deskoverflow.com'

def enabled(name):return os.getenv(name)=='1'
def runtime_configured():
    return all(os.getenv(k) for k in ['ENROLLMENT_DB','ENROLLMENT_ENCRYPTION_KEY','STRIPE_RESTRICTED_KEY','STRIPE_WEBHOOK_SECRET','SMTP_HOST','SMTP_USER','SMTP_PASSWORD','SMTP_FROM','DATA_SCHEDULE_PATH','PROVISIONING_ENDPOINT','PROVISIONING_SECRET','SELLING_STATES'])
def configured():
    return runtime_configured() and all(enabled(k) for k in ['ENROLLMENT_ENABLED','TAX_APPROVED','IDENTITY_VERIFIED','PROVIDER_READY','AUTOMATION_TESTED','CONTRACT_OFFER_APPROVED'])
class StripeGateway:
    def __init__(self):
        from stripe import StripeClient
        self.client=StripeClient(os.environ['STRIPE_RESTRICTED_KEY'],stripe_version='2026-09-30.endive')
    def guard(self):
        a=self.client.v1.accounts.retrieve('acct_1UXkOuGzho3dgSTh')
        if not a.charges_enabled or a.requirements.currently_due:raise Rejected('Merchant verification is not complete.')
        if not self.client.v1.tax.registrations.list({'status':'active','limit':1}).data:raise Rejected('Tax configuration is not ready.')
    def customer(self,doc,key):
        self.guard();v=doc['business'];return self.client.v1.customers.create({'email':v['email'],'name':v['business'],'phone':v['phone'],'address':{'line1':v['billing'],'city':v['city'],'state':v['state'],'postal_code':v['postalCode'],'country':'US'}},options={'idempotency_key':key}).id
    def checkout(self,doc,customer,key):
        self.guard();q=doc['quote'];args={'customer':customer,'mode':'payment' if q['setup'] else 'setup','success_url':ORIGIN+'/checkout/return/','cancel_url':ORIGIN+'/signup/','integration_identifier':'deskoverflow_'+doc['integration_tag'],'client_reference_id':doc['id']}
        # Verify both setup and future recurring catalog items before accepting details.
        for item in q['setup_items']+q['monthly_items']:
            p=self.client.v1.prices.retrieve(item['price'],{'expand':['product']})
            if not p.active or not p.livemode or p.currency!='usd' or p.unit_amount!=item['amount'] or not p.product.active or not p.product.tax_code:raise Rejected('A selected service needs billing configuration.')
        if q['setup']:
            args.update(line_items=[{'price':x['price'],'quantity':1} for x in q['setup_items']],automatic_tax={'enabled':True},payment_intent_data={'setup_future_usage':'off_session'})
        else:args['currency']='usd'
        s=self.client.v1.checkout.sessions.create(args,options={'idempotency_key':key});return {'id':s.id,'url':s.url}
    def session_url(self,sid):
        s=self.client.v1.checkout.sessions.retrieve(sid)
        if s.status!='open' or not s.url:raise Rejected('This checkout is no longer open. Check your Stripe receipt or contact support; do not pay twice.')
        return s.url
    def retrieve_session(self,sid):return self.client.v1.checkout.sessions.retrieve(sid).to_dict()
    def setup_succeeded(self,sid):return self.client.v1.setup_intents.retrieve(sid).status=='succeeded'
    def risk_customer(self,kind,obj):
        charge=obj.get('charge')
        if isinstance(charge,str):return self.client.v1.charges.retrieve(charge).customer
        return None

def mailer(email,code):
    msg=EmailMessage();msg['From']=os.environ['SMTP_FROM'];msg['To']=email;msg['Subject']='Your Desk Overflow verification code';msg.set_content('Your Desk Overflow code is '+code+'. It expires in 10 minutes. If you did not start enrollment, ignore this message. No service is active and no payment has been collected.')
    with smtplib.SMTP(os.environ['SMTP_HOST'],int(os.getenv('SMTP_PORT','587')),timeout=15) as smtp:
        smtp.starttls();smtp.login(os.environ['SMTP_USER'],os.environ['SMTP_PASSWORD']);smtp.send_message(msg)

_service=None
def service():
    global _service
    if _service is None:
        if not runtime_configured():raise Rejected('Online enrollment is not available yet. No payment was created.')
        schedule=json.loads(Path(os.environ['DATA_SCHEDULE_PATH']).read_text())
        for key in ['processors','retention','notices','security','exit','version']:
            if not schedule.get(key):raise Rejected('The service data schedule is not ready.')
        db=Path(os.environ['ENROLLMENT_DB']).resolve();repo=Path(__file__).resolve().parents[2]
        if repo==db or repo in db.parents:raise Rejected('Private storage must be outside the public repository.')
        db.parent.mkdir(mode=0o700,parents=True,exist_ok=True)
        _service=Enrollment(db,os.environ['ENROLLMENT_ENCRYPTION_KEY'].encode(),StripeGateway(),mailer,True,os.environ['SELLING_STATES'].split(','),schedule)
    return _service

def application(env,start_response):
    path=env.get('PATH_INFO','');method=env.get('REQUEST_METHOD','GET');origin=env.get('HTTP_ORIGIN','');code=200;out={};headers=[('Content-Type','application/json'),('Cache-Control','no-store'),('X-Content-Type-Options','nosniff')]
    if origin==ORIGIN:headers += [('Access-Control-Allow-Origin',ORIGIN),('Vary','Origin'),('Access-Control-Allow-Headers','Content-Type, Authorization'),('Access-Control-Allow-Methods','GET, POST, OPTIONS')]
    try:
        if method=='OPTIONS':
            if origin!=ORIGIN:raise Rejected('Origin not allowed.')
            code=204
        elif path=='/healthz' and method=='GET':
            out={'status':'ok','version':VERSION}
        elif path=='/v1/readiness' and method=='GET':
            ready=False
            if configured():
                try:service().gateway.guard();ready=True
                except Exception:pass
            out={'ready':ready,'version':VERSION}
        elif path=='/v1/stripe-webhook' and method=='POST':
            if not runtime_configured():raise Rejected('Service unavailable.')
            import stripe
            size=int(env.get('CONTENT_LENGTH') or 0)
            if size<=0 or size>1000000:raise Rejected('Request too large.')
            raw=env['wsgi.input'].read(size)
            event=stripe.Webhook.construct_event(raw,env.get('HTTP_STRIPE_SIGNATURE',''),os.environ['STRIPE_WEBHOOK_SECRET']).to_dict()
            if event.get('livemode') is not True:raise Rejected('Unexpected Stripe environment.')
            service().event(event);out={'received':True}
        elif method=='POST' and path in ['/v1/enrollments','/v1/verify','/v1/checkout']:
            if origin!=ORIGIN:raise Rejected('Origin not allowed.')
            if not configured():raise Rejected('Online enrollment is not available yet. No payment was created.')
            size=int(env.get('CONTENT_LENGTH') or 0)
            if size<=0 or size>32768:raise Rejected('Request too large.')
            data=json.loads(env['wsgi.input'].read(size));s=service();token=env.get('HTTP_AUTHORIZATION','').removeprefix('Bearer ')
            if path.endswith('/enrollments'):out=s.create(data,env.get('REMOTE_ADDR',''))
            elif path.endswith('/verify'):out=s.verify(data['id'],token,data['code'])
            else:out=s.checkout(data['id'],token,data.get('orderHash'),data.get('accepted'))
        else:code=404;out={'error':'Not found.'}
    except Rejected as e:code=409;out={'error':str(e)}
    except (ValueError,KeyError):code=400;out={'error':'Please check your request.'}
    except Exception:
        # No raw provider responses, customer details, tokens or secrets in logs/responses.
        code=503;out={'error':'We could not complete this step. No activation is confirmed. Please retry or contact support.'}
    status={200:'OK',204:'No Content',400:'Bad Request',404:'Not Found',409:'Conflict',503:'Service Unavailable'}[code]
    body=b'' if code==204 else json.dumps(out).encode();headers.append(('Content-Length',str(len(body))));start_response(str(code)+' '+status,headers);return [body]
