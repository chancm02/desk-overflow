"""Durable signed job delivery. The provisioner must independently deduplicate the
Idempotency-Key and perform account setup/invitation, not phone activation.
"""
import hashlib,hmac,json,os,time,urllib.request
from .app import service

def run_once(sender=None):
    s=service();s.gate();endpoint=os.environ['PROVISIONING_ENDPOINT']
    if not endpoint.startswith('https://'):raise RuntimeError('Provisioning requires HTTPS.')
    with s.db() as d:
        d.execute('BEGIN IMMEDIATE');row=d.execute("SELECT * FROM jobs WHERE state='pending' ORDER BY created LIMIT 1").fetchone()
        if not row:return False
        d.execute("UPDATE jobs SET state='delivering',attempts=attempts+1 WHERE id=?",(row['id'],));order=d.execute('SELECT * FROM orders WHERE id=?',(row['order_id'],)).fetchone()
        if row['kind']=='provision' and order['checkout_state'] not in ('paid','method_saved'):
            d.execute("UPDATE jobs SET state='held' WHERE id=?",(row['id'],));return True
        payload={'job':row['id'],'kind':row['kind'],'order':s.open(order['body']),'checkout_state':order['checkout_state'],'stripe_customer':order['customer'],'stripe_checkout':order['session']}
    body=json.dumps(payload,sort_keys=True).encode();timestamp=str(int(time.time()));signature=hmac.new(os.environ['PROVISIONING_SECRET'].encode(),timestamp.encode()+b'.'+body,hashlib.sha256).hexdigest()
    req=urllib.request.Request(endpoint,body,{'Content-Type':'application/json','Idempotency-Key':row['id'],'X-Desk-Timestamp':timestamp,'X-Desk-Signature':signature},method='POST')
    try:
        if sender:result=sender(req)
        else:
            with urllib.request.urlopen(req,timeout=20) as res:result=json.load(res)
        if result.get('job')!=row['id'] or result.get('durably_accepted') is not True:raise RuntimeError('Unconfirmed delivery.')
    except Exception:
        # A timeout may have succeeded remotely. Never create a second location by
        # blindly replaying an unverified non-idempotent provider request.
        with s.db() as d:d.execute("UPDATE jobs SET state='needs_reconciliation' WHERE id=?",(row['id'],))
        return True
    with s.db() as d:d.execute("UPDATE jobs SET state='accepted_by_adapter' WHERE id=?",(row['id'],))
    return True

if __name__=='__main__':
    while True:
        if not run_once():time.sleep(2)
