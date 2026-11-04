"""Enrollment domain logic. No browser-provided price or success URL is trusted.
Not deployed: see README for gates, credentials, worker and release checks.
"""
import hashlib,hmac,json,secrets,sqlite3,time,uuid
from pathlib import Path
from cryptography.fernet import Fernet
CATALOG=json.loads(Path(__file__).with_name('catalog.json').read_text())
VERSION='2026-11-03-v7'
class Rejected(Exception):pass

def quote(data):
    mode=data.get('setupMode','self')
    if mode not in ('self','assisted'):raise Rejected('Choose a supported setup option.')
    ids=data.get('addons',[])
    if not isinstance(ids,list) or any(x not in CATALOG['addons'] for x in ids):raise Rejected('Unsupported add-on.')
    ids=sorted(set(ids));setup=[];monthly=[CATALOG['basic']]
    if mode=='assisted':setup.append(CATALOG['assisted'])
    for key in ids:
        a=CATALOG['addons'][key]
        if a['setup']['amount']:setup.append(a['setup'])
        monthly.append(a['monthly'])
    return dict(setup=sum(x['amount'] for x in setup),monthly=sum(x['amount'] for x in monthly),minutes=500 if 'minutes250'in ids else 250,setup_items=setup,monthly_items=monthly,addons=ids)

class Enrollment:
    def __init__(self,path,key,gateway,mailer,ready=False,states=(),schedule=None):
        self.path=str(path);self.cipher=Fernet(key);self.gateway=gateway;self.mailer=mailer;self.ready=ready;self.states=states;self.schedule=schedule or {};self.clock=time.time
        with self.db() as d:d.executescript('''
        CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY, token TEXT, created REAL, verified INTEGER DEFAULT 0, tries INTEGER DEFAULT 0, code TEXT, body BLOB, digest TEXT, customer TEXT UNIQUE, session TEXT UNIQUE, checkout_state TEXT DEFAULT 'draft');
        CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY, kind TEXT, created REAL);
        CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY, order_id TEXT, kind TEXT, state TEXT DEFAULT 'pending', attempts INTEGER DEFAULT 0, created REAL);
        CREATE TABLE IF NOT EXISTS rates(subject TEXT, period INTEGER, count INTEGER, PRIMARY KEY(subject,period));
        ''')
    def db(self):
        d=sqlite3.connect(self.path,timeout=15);d.row_factory=sqlite3.Row;d.execute('PRAGMA journal_mode=WAL');return d
    def seal(self,v):return self.cipher.encrypt(json.dumps(v,sort_keys=True).encode())
    def open(self,v):return json.loads(self.cipher.decrypt(v))
    def gate(self):
        if not self.ready:raise Rejected('Online enrollment is not available yet. No payment has been created.')
    def rate(self,subject,limit=8):
        bucket=int(self.clock()//600);subject=hashlib.sha256(subject.encode()).hexdigest()
        with self.db() as d:
            d.execute('BEGIN IMMEDIATE');d.execute('INSERT INTO rates VALUES(?,?,1) ON CONFLICT(subject,period) DO UPDATE SET count=count+1',(subject,bucket))
            if d.execute('SELECT count FROM rates WHERE subject=? AND period=?',(subject,bucket)).fetchone()[0]>limit:raise Rejected('Too many attempts. Please try later.')
    def create(self,data,ip=''):
        self.gate();self.rate('create:'+ip)
        limits={'name':70,'title':45,'business':90,'entity':30,'email':100,'phone':30,'billing':110,'city':60,'state':2,'postalCode':10,'service':150,'timezone':45,'businessNumber':30,'carrier':45,'coverage':30,'calls':30,'hours':100,'serviceArea':130,'recipient':100,'fallback':90,'calendar':40,'exemption':25}
        clean={}
        for k,n in limits.items():
            value=data.get(k,'')
            if not isinstance(value,str) or not value.strip() or len(value)>n:raise Rejected('Please check '+k+'.')
            clean[k]=value.strip()
        import re
        from zoneinfo import ZoneInfo,ZoneInfoNotFoundError
        for field in ['email','recipient']:
            if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+',clean[field]):raise Rejected('Please check your business email.')
        for field in ['phone','businessNumber']:
            if not re.fullmatch(r'[0-9()+ .-]{7,30}',clean[field]) or len(re.sub(r'\D','',clean[field]))<7:raise Rejected('Please check phone numbers.')
        try:ZoneInfo(clean['timezone'])
        except ZoneInfoNotFoundError:raise Rejected('Use a valid time zone such as America/Chicago.')
        if clean['state'] not in self.states:raise Rejected('This service location needs a compatibility review before payment.')
        if clean['exemption']!='No' or data.get('quotes'):raise Rejected('Custom requests and exemption claims need a separate scope before payment.')
        if not all(data.get(k) is True for k in ['authority','documentsRead','responsePermission']):raise Rejected('Confirm the information and required acknowledgments.')
        totals=quote(data);clean.update(setupMode=data.get('setupMode','self'),addons=totals['addons'])
        ident=uuid.uuid4().hex;token=secrets.token_urlsafe(32);code=str(secrets.randbelow(1000000)).zfill(6)
        document={'id':ident,'integration_tag':''.join(secrets.choice('abcdefghijklmnopqrstuvwxyz') for _ in range(8)),'version':VERSION,'business':clean,'quote':totals,'data_schedule':self.schedule,'terms_hashes':json.loads((Path(__file__).resolve().parents[2]/'legal/versions/2026-11-03-v6/sha256.json').read_text()),'created_utc':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime(self.clock())),'billing':'Monthly service begins only after successful tests and separate customer Go-Live approval. Setup fees are charged now only if selected. No automatic paid overages. Cancel before another renewal through billing or email.','acceptance':None}
        digest=hashlib.sha256(json.dumps(document,sort_keys=True).encode()).hexdigest()
        with self.db() as d:d.execute('INSERT INTO orders(id,token,created,code,body,digest)VALUES(?,?,?,?,?,?)',(ident,hashlib.sha256(token.encode()).hexdigest(),self.clock(),hashlib.sha256((ident+code).encode()).hexdigest(),self.seal(document),digest))
        try:self.mailer(clean['email'],code)
        except Exception:
            with self.db() as d:d.execute("UPDATE orders SET checkout_state='email_failed' WHERE id=?",(ident,))
            raise Rejected('We could not send the verification email. No payment was created.')
        return {'id':ident,'token':token}
    def authenticated(self,d,ident,token):
        row=d.execute('SELECT * FROM orders WHERE id=?',(ident,)).fetchone()
        if not row or not hmac.compare_digest(row['token'],hashlib.sha256(token.encode()).hexdigest()) or self.clock()-row['created']>3600:raise Rejected('Your enrollment session expired. Please start again.')
        return row
    def verify(self,ident,token,code):
        with self.db() as d:
            d.execute('BEGIN IMMEDIATE');row=self.authenticated(d,ident,token)
            if row['checkout_state']=='email_failed' or self.clock()-row['created']>600 or row['tries']>=5:raise Rejected('The code expired or reached its attempt limit. Please start again.')
            valid=hmac.compare_digest(row['code'],hashlib.sha256((ident+str(code)).encode()).hexdigest())
            d.execute('UPDATE orders SET tries=tries+1,verified=? WHERE id=?',(1 if valid else row['verified'],ident))
            result={'verified':True,'order':self.open(row['body']),'orderHash':row['digest']} if valid else None
        if not valid:raise Rejected('That verification code is not valid.')
        return result
    def checkout(self,ident,token,digest,accepted):
        self.gate()
        with self.db() as d:
            d.execute('BEGIN IMMEDIATE');row=self.authenticated(d,ident,token)
            if not row['verified']:raise Rejected('Verify your email before payment.')
            if accepted is not True or not hmac.compare_digest(row['digest'],str(digest)):raise Rejected('Accept the exact server-generated order before continuing.')
            doc=self.open(row['body'])
            if not doc['acceptance']:
                doc['acceptance']={'hash':row['digest'],'utc':self.clock(),'email_verified':True,'recurring_method_consent':True}
                d.execute('UPDATE orders SET body=? WHERE id=?',(self.seal(doc),ident))
            customer=row['customer']
            if not customer:
                customer=self.gateway.customer(doc,'customer-'+ident)
                d.execute('UPDATE orders SET customer=? WHERE id=?',(customer,ident))
            if row['session']:return {'url':self.gateway.session_url(row['session'])}
            session=self.gateway.checkout(doc,customer,'checkout-'+ident)
            d.execute("UPDATE orders SET session=?,checkout_state='pending' WHERE id=?",(session['id'],ident))
            return {'url':session['url']}
    def event(self,event):
        """Caller must authenticate Stripe signature before calling. Durable job queue,
        no provisioning from browser redirects, no live external side effect here."""
        kind=event['type'];obj=event['data']['object'];sid=obj.get('id');customer=obj.get('customer')
        if kind.startswith('checkout.session.'):
            obj=self.gateway.retrieve_session(sid);customer=obj.get('customer')
        if not customer and kind in ('charge.refunded','charge.dispute.created','radar.early_fraud_warning.created'):
            customer=self.gateway.risk_customer(kind,obj)
        with self.db() as d:
            d.execute('BEGIN IMMEDIATE')
            if d.execute('SELECT 1 FROM events WHERE id=?',(event['id'],)).fetchone():return
            row=d.execute('SELECT * FROM orders WHERE customer=?',(customer,)).fetchone() if isinstance(customer,str) else None
            if row:
                state=None;job=None
                if kind in ('checkout.session.completed','checkout.session.async_payment_succeeded') and obj.get('id')==row['session']:
                    doc=self.open(row['body']);q=doc['quote'];expected='payment' if q['setup'] else 'setup'
                    if obj.get('mode')!=expected:raise Rejected('Checkout mode mismatch.')
                    if q['setup']:
                        if obj.get('payment_status')=='paid':
                            if obj.get('currency')!='usd' or obj.get('amount_subtotal')!=q['setup']:raise Rejected('Checkout amount mismatch.')
                            state='paid';job='provision'
                    elif obj.get('setup_intent') and self.gateway.setup_succeeded(obj['setup_intent']):state='method_saved';job='provision'
                elif kind=='checkout.session.async_payment_failed' and obj.get('payment_status')=='unpaid':state='payment_failed'
                elif kind in ('charge.dispute.created','radar.early_fraud_warning.created','charge.refunded'):state='risk_review';job='reconcile_risk'
                elif kind.startswith('customer.subscription.') or kind in ('invoice.paid','invoice.payment_failed','customer.updated'):job='reconcile_billing'
                # Late/out-of-order payment success must not clear an existing risk hold.
                if row['checkout_state']=='risk_review' and state in ('paid','method_saved'):state=None;job=None
                if state:d.execute('UPDATE orders SET checkout_state=? WHERE id=?',(state,row['id']))
                if job:d.execute('INSERT OR IGNORE INTO jobs(id,order_id,kind,created)VALUES(?,?,?,?)',(('provision-'+row['id']) if job=='provision' else event['id'],row['id'],job,self.clock()))
            d.execute('INSERT INTO events VALUES(?,?,?)',(event['id'],kind,self.clock()))
