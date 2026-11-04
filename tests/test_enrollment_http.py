import io,json,os,unittest
from unittest.mock import patch
from backend.enrollment import app
class HttpTests(unittest.TestCase):
 def request(self,path,body=b'',**extra):
  result={};env={'PATH_INFO':path,'REQUEST_METHOD':'GET','wsgi.input':io.BytesIO(body),'CONTENT_LENGTH':str(len(body)),**extra}
  def start(status,headers):result.update(status=status,headers=dict(headers))
  result['body']=json.loads(b''.join(app.application(env,start)) or b'{}');return result
 def test_health_is_not_payment_readiness(self):
  with patch.dict(os.environ,{},clear=True):
   self.assertEqual(self.request('/healthz')['status'],'200 OK')
   self.assertFalse(self.request('/v1/readiness')['body']['ready'])
 def test_pausing_sales_does_not_disable_signed_payment_events(self):
  import stripe,time,hmac,hashlib
  raw=json.dumps({'id':'evt_test','object':'event','type':'invoice.paid','livemode':True,'data':{'object':{'id':'in_test','object':'invoice'}}}).encode()
  now=int(time.time());secret='whsec_local_test';sig=hmac.new(secret.encode(),str(now).encode()+b'.'+raw,hashlib.sha256).hexdigest()
  class Service:
   def event(self,event):self.seen=event['id']
  svc=Service()
  with patch.object(app,'runtime_configured',return_value=True),patch.object(app,'configured',return_value=False),patch.object(app,'service',return_value=svc),patch.dict(os.environ,{'STRIPE_WEBHOOK_SECRET':secret}):
   res=self.request('/v1/stripe-webhook',raw,REQUEST_METHOD='POST',HTTP_STRIPE_SIGNATURE=f't={now},v1={sig}')
   self.assertEqual(res['status'],'200 OK');self.assertEqual(svc.seen,'evt_test')
   bad=self.request('/v1/stripe-webhook',raw,REQUEST_METHOD='POST',HTTP_STRIPE_SIGNATURE=f't={now},v1=invalid')
   self.assertNotEqual(bad['status'],'200 OK')
