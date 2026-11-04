import io,json,sys,tempfile,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from cryptography.fernet import Fernet
from backend.enrollment.core import Enrollment,Rejected,quote
from backend.enrollment.app import application
class Gateway:
 def __init__(self):self.sessions={};self.created=[]
 def customer(self,doc,key):return 'cus_'+doc['id']
 def checkout(self,doc,customer,key):
  x={'id':'cs_'+doc['id'],'url':'https://checkout.stripe.com/c/pay/example','customer':customer,'mode':'payment' if doc['quote']['setup'] else 'setup','payment_status':'unpaid','amount_subtotal':doc['quote']['setup'],'currency':'usd'};self.sessions[x['id']]=x;self.created.append(key);return x
 def session_url(self,sid):return self.sessions[sid]['url']
 def retrieve_session(self,sid):return self.sessions[sid]
 def setup_succeeded(self,sid):return sid=='seti_good'
 def risk_customer(self,kind,obj):return obj.get('customer')
def business(**extra):
 d=dict(name='Test Owner',title='Owner',business='Synthetic QA',entity='LLC',email='test@example.com',phone='3195550100',billing='123 Test Street',city='Vinton',state='IA',postalCode='52349',service='123 Test Street, Vinton IA 52349',timezone='America/Chicago',businessNumber='3195550101',carrier='Test carrier',coverage='After-hours',calls='Under 25',hours='Mon-Fri 9-5',serviceArea='Test service in test area',recipient='leads@example.com',fallback='Test contact 3195550102',calendar='Not selected',exemption='No',authority=True,documentsRead=True,responsePermission=True,setupMode='self',addons=[],quotes=[]);d.update(extra);return d
class EnrollmentTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.g=Gateway();self.sent=[];self.e=Enrollment(Path(self.temp.name)/'private.sqlite3',Fernet.generate_key(),self.g,lambda email,code:self.sent.append((email,code)),True,['IA'],{'version':'approved-test-only'})
 def tearDown(self):self.temp.cleanup()
 def draft(self,**extra):return self.e.create(business(**extra),'test-ip')
 def verified(self,**extra):
  d=self.draft(**extra);r=self.e.verify(d['id'],d['token'],self.sent[-1][1]);return d,r
 def event(self,sid,kind='checkout.session.completed',ident='evt_1'):
  self.e.event({'id':ident,'type':kind,'data':{'object':{'id':sid}}})
 def test_server_price_ignores_client_amount_and_deduplicates(self):
  q=quote(business(addons=['calendar','calendar'],amount=1));self.assertEqual((q['setup'],q['monthly']),(15000,59800));self.assertEqual(quote(business(setupMode='assisted'))['setup'],50000)
 def test_unknown_addon_is_rejected(self):
  with self.assertRaises(Rejected):quote(business(addons=['free-everything']))
 def test_disabled_service_never_accepts_or_charges(self):
  self.e.ready=False
  with self.assertRaises(Rejected):self.draft()
  self.assertEqual(self.sent,[]);self.assertEqual(self.g.created,[])
 def test_personal_data_is_encrypted_at_rest(self):
  d=self.draft();raw=(Path(self.temp.name)/'private.sqlite3').read_bytes();self.assertNotIn(b'test@example.com',raw)
  with self.e.db() as db:row=db.execute('SELECT body FROM orders').fetchone();self.assertNotIn(b'test@example.com',row['body'])
 def test_email_failure_does_not_claim_success(self):
  self.e.mailer=lambda *a:(_ for _ in ()).throw(RuntimeError())
  with self.assertRaisesRegex(Rejected,'could not send'):self.draft()
 def test_expired_code_and_wrong_token_rejected(self):
  d=self.draft()
  with self.assertRaises(Rejected):self.e.verify(d['id'],'wrong',self.sent[-1][1])
  now=self.e.clock();self.e.clock=lambda:now+601
  with self.assertRaisesRegex(Rejected,'expired'):self.e.verify(d['id'],d['token'],self.sent[-1][1])
 def test_otp_attempt_limit_is_persistent(self):
  d=self.draft();correct=self.sent[-1][1];wrong='000000' if correct!='000000' else '111111'
  for _ in range(5):
   with self.assertRaises(Rejected):self.e.verify(d['id'],d['token'],wrong)
  with self.assertRaisesRegex(Rejected,'attempt limit'):self.e.verify(d['id'],d['token'],correct)
 def test_email_verification_required_before_checkout(self):
  d=self.draft()
  with self.assertRaisesRegex(Rejected,'Verify'):self.e.checkout(d['id'],d['token'],'forged',True)
  self.assertEqual(self.g.created,[])
 def test_exact_order_hash_and_acceptance_required(self):
  d,r=self.verified()
  for digest,accepted in [('forged',True),(r['orderHash'],False)]:
   with self.assertRaises(Rejected):self.e.checkout(d['id'],d['token'],digest,accepted)
  self.assertEqual(self.g.created,[])
 def test_repeated_checkout_reuses_session(self):
  d,r=self.verified();a=self.e.checkout(d['id'],d['token'],r['orderHash'],True);b=self.e.checkout(d['id'],d['token'],r['orderHash'],True);self.assertEqual(a,b);self.assertEqual(len(self.g.created),1)
 def test_unpaid_session_never_provisions_then_paid_event_enqueues_once(self):
  d,r=self.verified(setupMode='assisted');self.e.checkout(d['id'],d['token'],r['orderHash'],True);sid='cs_'+d['id'];self.event(sid)
  with self.e.db() as db:self.assertEqual(db.execute('SELECT count(*) FROM jobs').fetchone()[0],0)
  self.g.sessions[sid]['payment_status']='paid';self.event(sid,'checkout.session.async_payment_succeeded','evt_paid');self.event(sid,'checkout.session.async_payment_succeeded','evt_paid')
  with self.e.db() as db:self.assertEqual(db.execute('SELECT count(*) FROM jobs').fetchone()[0],1)
 def test_incorrect_amount_cannot_provision(self):
  d,r=self.verified(setupMode='assisted');self.e.checkout(d['id'],d['token'],r['orderHash'],True);sid='cs_'+d['id'];self.g.sessions[sid].update(payment_status='paid',amount_subtotal=1)
  with self.assertRaisesRegex(Rejected,'amount mismatch'):self.event(sid)
 def test_zero_setup_requires_successful_setup_intent(self):
  d,r=self.verified();self.e.checkout(d['id'],d['token'],r['orderHash'],True);sid='cs_'+d['id'];self.event(sid)
  with self.e.db() as db:self.assertEqual(db.execute('SELECT count(*) FROM jobs').fetchone()[0],0)
  self.g.sessions[sid]['setup_intent']='seti_good';self.event(sid,ident='evt_method')
  with self.e.db() as db:self.assertEqual(db.execute('SELECT checkout_state FROM orders').fetchone()[0],'method_saved')
 def test_risk_hold_survives_late_success(self):
  d,r=self.verified(setupMode='assisted');self.e.checkout(d['id'],d['token'],r['orderHash'],True);sid='cs_'+d['id'];cus=self.g.sessions[sid]['customer'];self.e.event({'id':'evt_risk','type':'charge.refunded','data':{'object':{'id':'ch_test','customer':cus}}});self.g.sessions[sid]['payment_status']='paid';self.event(sid)
  with self.e.db() as db:self.assertEqual(db.execute('SELECT checkout_state FROM orders').fetchone()[0],'risk_review');self.assertEqual(db.execute("SELECT count(*) FROM jobs WHERE kind='provision'").fetchone()[0],0)
 def test_each_billing_change_keeps_its_own_durable_job(self):
  d,r=self.verified();self.e.checkout(d['id'],d['token'],r['orderHash'],True);cus='cus_'+d['id']
  for n,kind in enumerate(['invoice.paid','invoice.payment_failed']):self.e.event({'id':'evt_bill_'+str(n),'type':kind,'data':{'object':{'id':'in_test','customer':cus}}})
  with self.e.db() as db:self.assertEqual(db.execute('SELECT count(*) FROM jobs').fetchone()[0],2)
 def test_wsgi_blocks_foreign_origin_before_data_submission(self):
  result=[];body=b'{}';out=application({'PATH_INFO':'/v1/enrollments','REQUEST_METHOD':'POST','HTTP_ORIGIN':'https://evil.example','CONTENT_LENGTH':str(len(body)),'wsgi.input':io.BytesIO(body)},lambda status,headers:result.append(status));self.assertTrue(result[0].startswith('409'));self.assertIn(b'Origin not allowed',b''.join(out))
if __name__=='__main__':unittest.main()
