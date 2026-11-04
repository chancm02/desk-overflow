import {catalog, termsHashes} from './catalog.mjs';
export const VERSION='2026-11-03-v9', ORIGIN='https://www.deskoverflow.com';
const enc=new TextEncoder(), dec=new TextDecoder();
export class Rejected extends Error {constructor(message,status=409){super(message);this.status=status}}
const bytes=s=>enc.encode(s), hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
export const digest=async s=>hex(await crypto.subtle.digest('SHA-256',bytes(s)));
export async function hmac(key,s){const k=await crypto.subtle.importKey('raw',bytes(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',k,bytes(s)))}
export function equal(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let n=0;for(let i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0}
const b64=b=>btoa(String.fromCharCode(...new Uint8Array(b))), un64=s=>Uint8Array.from(atob(s),x=>x.charCodeAt(0));
export async function seal(value,key){const iv=crypto.getRandomValues(new Uint8Array(12)),k=await crypto.subtle.importKey('raw',un64(key),'AES-GCM',false,['encrypt']);return b64(iv)+'.'+b64(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:bytes(VERSION)},k,bytes(JSON.stringify(value))))}
export async function open(value,key){const [iv,data]=value.split('.'),k=await crypto.subtle.importKey('raw',un64(key),'AES-GCM',false,['decrypt']);return JSON.parse(dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:un64(iv),additionalData:bytes(VERSION)},k,un64(data))))}
export function quote(data){
 const planId=data.plan||'basic',p=Object.hasOwn(catalog.plans,planId)?catalog.plans[planId]:null;if(!p)throw new Rejected('Choose a supported plan.');
 const ids=data.addons||[];if(!Array.isArray(ids)||ids.some(x=>!Object.hasOwn(catalog.addons,x)))throw new Rejected('Unsupported add-on.');
 const selected=[...new Set(ids)].filter(x=>!p.included.includes(x)).sort(),setup=[p.setup],monthly=[p.monthly];
 for(const id of selected){const a=catalog.addons[id];if(a.setup.amount)setup.push(a.setup);monthly.push(a.monthly)}
 return {plan:planId,plan_name:p.name,included:p.included,setup:setup.reduce((s,x)=>s+x.amount,0),monthly:monthly.reduce((s,x)=>s+x.amount,0),minutes:p.minutes,setup_items:setup,monthly_items:monthly,addons:selected};
}
const limits={name:70,title:45,business:90,entity:30,email:100,phone:30,billing:110,city:60,state:2,postalCode:10,service:150,timezone:45,businessNumber:30,carrier:45,coverage:30,calls:30,hours:100,serviceArea:130,recipient:100,fallback:90,calendar:40,exemption:25};
export function validate(data,states){
 const clean={};for(const [key,max] of Object.entries(limits)){const v=data[key];if(typeof v!=='string'||!v.trim()||v.length>max)throw new Rejected('Please check '+key+'.');clean[key]=v.trim()}
 for(const key of ['email','recipient'])if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean[key]))throw new Rejected('Please check your business email.');
 for(const key of ['phone','businessNumber'])if(!/^[0-9()+ .-]{7,30}$/.test(clean[key])||clean[key].replace(/\D/g,'').length<7)throw new Rejected('Please check phone numbers.');
 try{new Intl.DateTimeFormat('en-US',{timeZone:clean.timezone}).format()}catch{throw new Rejected('Use a valid time zone.')}
 clean.faqSource=data.faqSource||'';if(typeof clean.faqSource!=='string'||clean.faqSource.length>150||(clean.faqSource&&!/^https?:\/\//.test(clean.faqSource)))throw new Rejected('Please check the public FAQ URL.');
 if(!states.includes(clean.state)||clean.exemption!=='No'||(data.quotes&&(!Array.isArray(data.quotes)||data.quotes.length)))throw new Rejected('This configuration needs a compatibility review before payment.');
 if(!['authority','documentsRead','responsePermission'].every(k=>data[k]===true))throw new Rejected('Confirm the required acknowledgments.');return clean;
}
const required=['STRIPE_RESTRICTED_KEY','STRIPE_WEBHOOK_SECRET','ENROLLMENT_ENCRYPTION_KEY','MAIL_ENDPOINT','MAIL_SECRET','DATA_SCHEDULE_JSON','PROVISIONING_ENDPOINT','PROVISIONING_SECRET','SELLING_STATES'];
export function runtimeReady(e){return !!e.DB&&required.every(k=>typeof e[k]==='string'&&e[k].length>0)}
export function salesReady(e){return runtimeReady(e)&&['ENROLLMENT_ENABLED','TAX_APPROVED','IDENTITY_VERIFIED','PROVIDER_READY','AUTOMATION_TESTED','CONTRACT_OFFER_APPROVED'].every(k=>e[k]==='1')}
const now=()=>Math.floor(Date.now()/1000), random=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
export class Enrollment {
 constructor(env,{fetcher=fetch,clock=now}={}){this.e=env;this.db=env.DB;this.fetcher=fetcher;this.clock=clock}
 stmt(sql,...args){return this.db.prepare(sql).bind(...args)}
 async rate(subject){const row=await this.stmt('INSERT INTO rates(subject,period,count) VALUES(?,?,1) ON CONFLICT(subject,period) DO UPDATE SET count=count+1 RETURNING count',await digest(subject),Math.floor(this.clock()/600)).first();if(row.count>8)throw new Rejected('Too many attempts. Please try later.',429)}
 async create(data,ip){
  await this.rate('create:'+ip);const business=validate(data,this.e.SELLING_STATES.split(',')),q=quote(data),id=crypto.randomUUID().replaceAll('-',''),token=random();
  // Rejection sampling avoids bias in a short verification code.
  let x;do{x=crypto.getRandomValues(new Uint32Array(1))[0]}while(x>=4294000000);const code=String(x%1000000).padStart(6,'0');
  const schedule=JSON.parse(this.e.DATA_SCHEDULE_JSON);for(const k of ['processors','retention','notices','security','exit','version'])if(!schedule[k])throw new Rejected('The service data schedule is not ready.');
  business.plan=q.plan;business.addons=q.addons;
  const doc={id,integration_tag:Array.from(crypto.getRandomValues(new Uint8Array(8)),n=>String.fromCharCode(97+n%26)).join(''),version:VERSION,business,quote:q,data_schedule:schedule,terms_hashes:termsHashes,created_utc:new Date(this.clock()*1000).toISOString(),billing:'Setup only now. Monthly service starts after successful tests, separate Go-Live approval and recurring authorization. No automatic paid overages.',acceptance:null};
  const hash=await digest(JSON.stringify(doc));await this.stmt('INSERT INTO orders(id,token,created,code,body,digest) VALUES(?,?,?,?,?,?)',id,await digest(token),this.clock(),await hmac(this.e.MAIL_SECRET,id+code),await seal(doc,this.e.ENROLLMENT_ENCRYPTION_KEY),hash).run();
  try{await this.sendMail({id,email:business.email,code,expires_in:600})}
  catch{await this.stmt("UPDATE orders SET state='email_failed' WHERE id=?",id).run();throw new Rejected('We could not send the verification email. No payment was created.')}
  return {id,token};
 }
 async authenticated(id,token){const row=await this.stmt('SELECT * FROM orders WHERE id=?',id).first();if(!row||!equal(row.token,await digest(token||''))||this.clock()-row.created>3600)throw new Rejected('Your enrollment session expired. Please start again.');return row}
 async verify(id,token,code){
  const row=await this.authenticated(id,token);if(row.state==='email_failed'||this.clock()-row.created>600)throw new Rejected('The code expired. Please start again.');
  const attempt=await this.stmt('UPDATE orders SET tries=tries+1 WHERE id=? AND tries<5 RETURNING tries',id).first();if(!attempt)throw new Rejected('The code reached its attempt limit.');
  if(!equal(row.code,await hmac(this.e.MAIL_SECRET,id+String(code))))throw new Rejected('That verification code is not valid.');
  await this.stmt('UPDATE orders SET verified=1 WHERE id=?',id).run();return {verified:true,order:await open(row.body,this.e.ENROLLMENT_ENCRYPTION_KEY),orderHash:row.digest};
 }
 async stripe(path,params=null,key=null){
  const headers={Authorization:'Bearer '+this.e.STRIPE_RESTRICTED_KEY,'Stripe-Version':'2026-09-30.endive'};
  if(key)headers['Idempotency-Key']=key;
  let body;if(params){body=new URLSearchParams();const add=(prefix,v)=>{if(v===null||v===undefined)return;if(typeof v==='object'){for(const [k,x]of Object.entries(v))add(prefix?prefix+'['+k+']':k,x)}else body.append(prefix,String(v))};add('',params);headers['Content-Type']='application/x-www-form-urlencoded'}
  const res=await this.fetcher('https://api.stripe.com/v1/'+path,{method:params?'POST':'GET',headers,body,signal:AbortSignal.timeout(15000)});if(!res.ok)throw new Rejected('The payment provider could not complete this step. Please retry.');return res.json();
 }
 async guard(){
  const [account,settings,registrations]=await Promise.all([this.stripe('accounts/acct_1UXkOuGzho3dgSTh'),this.stripe('tax/settings'),this.stripe('tax/registrations?status=active&limit=100')]);
  if(account.id!=='acct_1UXkOuGzho3dgSTh'||!account.charges_enabled||account.requirements?.currently_due?.length)throw new Rejected('Merchant verification is not complete.');
  if(settings.status!=='active'||!registrations.data?.some(r=>r.livemode&&r.country==='US'&&r.country_options?.us?.state==='IA'&&r.status==='active'))throw new Rejected('Tax configuration is not ready.');
 }
 async checkout(id,token,hash,accepted){
  const row=await this.authenticated(id,token);if(!row.verified||accepted!==true||!equal(row.digest,hash))throw new Rejected('Verify your email and accept the exact order first.');
  if(['risk_review','email_failed','payment_failed','paid'].includes(row.state))throw new Rejected('This order needs review. Do not pay twice.');
  if(row.session){const s=await this.stripe('checkout/sessions/'+encodeURIComponent(row.session));if(s.status!=='open'||!s.url)throw new Rejected('This checkout is no longer open. Check your receipt before paying again.');return {url:s.url}}
  await this.guard();const doc=await open(row.body,this.e.ENROLLMENT_ENCRYPTION_KEY),q=doc.quote;
  for(const [kind,items]of [['one_time',q.setup_items],['recurring',q.monthly_items]])for(const item of items){const p=await this.stripe('prices/'+encodeURIComponent(item.price)+'?expand[]=product');if(!p.active||!p.livemode||p.currency!=='usd'||p.unit_amount!==item.amount||p.type!==kind||!p.product?.active||!p.product.tax_code)throw new Rejected('A selected service needs billing configuration.');if(kind==='recurring'&&(p.recurring?.interval!=='month'||p.recurring.interval_count!==1))throw new Rejected('Recurring interval mismatch.')}
  await this.stmt('UPDATE orders SET accepted_at=COALESCE(accepted_at,?) WHERE id=?',this.clock(),id).run();
  const v=doc.business,customer=row.customer||(await this.stripe('customers',{email:v.email,name:v.business,phone:v.phone,address:{line1:v.billing,city:v.city,state:v.state,postal_code:v.postalCode,country:'US'}},'customer-'+id)).id;
  await this.stmt('UPDATE orders SET customer=? WHERE id=?',customer,id).run();
  const session=await this.stripe('checkout/sessions',{customer,mode:'payment',line_items:q.setup_items.map(x=>({price:x.price,quantity:1})),automatic_tax:{enabled:true},payment_intent_data:{setup_future_usage:'off_session'},integration_identifier:'deskoverflow_'+doc.integration_tag,client_reference_id:id,success_url:ORIGIN+'/checkout/return/',cancel_url:ORIGIN+'/signup/'},'checkout-'+id);
  await this.stmt("UPDATE orders SET session=?,state=CASE WHEN state='risk_review' THEN state ELSE 'pending' END WHERE id=?",session.id,id).run();return {url:session.url};
 }
 async sendMail(payload){
  // Apps Script web apps do not expose request headers. Sign the exact payload
  // string in a JSON envelope, rather than relying on inaccessible headers.
  const url=new URL(this.e.MAIL_ENDPOINT);if(url.protocol!=='https:')throw new Error('Mail requires HTTPS');
  const data=JSON.stringify(payload),timestamp=String(this.clock()),signature=await hmac(this.e.MAIL_SECRET,timestamp+'.'+data);
  const res=await this.fetcher(url.href,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({timestamp,payload:data,signature}),signal:AbortSignal.timeout(15000)});
  if(!res.ok)throw new Error('Mail delivery failed');const result=await res.json();if(result.id!==payload.id||result.sent!==true)throw new Error('Mail delivery not confirmed');
 }
 async signed(url,payload,secret,key,ack){
  const target=new URL(url);if(target.protocol!=='https:'||target.username||target.password)throw new Rejected('The service adapter is not configured.');
  const body=JSON.stringify(payload),timestamp=String(this.clock()),signature=await hmac(secret,timestamp+'.'+body);
  const res=await this.fetcher(url,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json','Idempotency-Key':key,'X-Desk-Timestamp':timestamp,'X-Desk-Signature':signature},body,signal:AbortSignal.timeout(15000)});
  if(!res.ok)throw new Error('Adapter failed');const result=await res.json();if(result.id!==payload.id||result[ack]!==true)throw new Error('Adapter did not confirm');return result;
 }
 async event(event){
  if(event.livemode!==true)throw new Rejected('Unexpected Stripe environment.',400);
  if(await this.stmt('SELECT id FROM events WHERE id=?',event.id).first())return;
  const kind=event.type;let obj=event.data.object,customer=kind==='customer.updated'?obj.id:obj.customer;
  if(kind.startsWith('checkout.session.')){obj=await this.stripe('checkout/sessions/'+encodeURIComponent(obj.id));customer=obj.customer}
  if(!customer&&['charge.refunded','charge.dispute.created','radar.early_fraud_warning.created'].includes(kind)&&typeof obj.charge==='string')customer=(await this.stripe('charges/'+encodeURIComponent(obj.charge))).customer;
  const row=typeof customer==='string'?await this.stmt('SELECT * FROM orders WHERE customer=?',customer).first():null,queries=[];
  if(row&&kind.startsWith('checkout.session.')&&!row.session)throw new Rejected('Checkout mapping is still pending. Retry delivery.',503);
  if(row){
   let state=null,job=null;
   if(['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(kind)&&obj.id===row.session){
    const doc=await open(row.body,this.e.ENROLLMENT_ENCRYPTION_KEY);
    if(obj.payment_status==='paid'){
     if(!obj.livemode||obj.mode!=='payment'||obj.currency!=='usd'||obj.amount_subtotal!==doc.quote.setup||obj.client_reference_id!==row.id)throw new Rejected('Checkout mismatch.');state='paid';job='provision';
    }
   }else if(kind==='checkout.session.async_payment_failed'&&obj.id===row.session&&obj.payment_status==='unpaid')state='payment_failed';
   else if(['charge.refunded','charge.dispute.created','radar.early_fraud_warning.created'].includes(kind)){state='risk_review';job='reconcile_risk'}
   else if(kind.startsWith('customer.subscription.')||['invoice.paid','invoice.payment_failed','customer.updated'].includes(kind))job='reconcile_billing';
   if(state)queries.push(this.stmt("UPDATE orders SET state=CASE WHEN state='risk_review' THEN state ELSE ? END WHERE id=?",state,row.id));
   if(job){const jid=job==='provision'?'provision-'+row.id:event.id;queries.push(this.stmt("INSERT OR IGNORE INTO jobs(id,order_id,kind,created) SELECT ?,id,?,? FROM orders WHERE id=? AND (?<>'provision' OR state='paid')",jid,job,this.clock(),row.id,job))}
  }
  queries.push(this.stmt('INSERT INTO events(id,kind,created) VALUES(?,?,?)',event.id,kind,this.clock()));
  try{await this.db.batch(queries)}catch(error){if(!await this.stmt('SELECT id FROM events WHERE id=?',event.id).first())throw error}
 }
 async deliverOne(){
  const job=await this.stmt("UPDATE jobs SET state='delivering' WHERE id=(SELECT id FROM jobs WHERE state='pending' ORDER BY created LIMIT 1) AND state='pending' RETURNING *").first();if(!job)return false;
  try{
   const row=await this.stmt('SELECT * FROM orders WHERE id=?',job.order_id).first();
   if(!row||(job.kind==='provision'&&row.state!=='paid')){await this.stmt("UPDATE jobs SET state='held' WHERE id=?",job.id).run();return true}
   await this.signed(this.e.PROVISIONING_ENDPOINT,{id:job.id,job:job.id,kind:job.kind,order:await open(row.body,this.e.ENROLLMENT_ENCRYPTION_KEY),accepted_at:row.accepted_at,checkout_state:row.state,stripe_customer:row.customer,stripe_checkout:row.session},this.e.PROVISIONING_SECRET,job.id,'durably_accepted');
   await this.stmt("UPDATE jobs SET state='accepted_by_adapter' WHERE id=?",job.id).run();
  }catch{await this.stmt("UPDATE jobs SET state='needs_reconciliation' WHERE id=?",job.id).run()}
  return true;
 }
}
export async function verifySignature(raw,header,secret,time=now()){
 if(!secret||!header)throw new Rejected('Invalid payment signature.',400);
 const parts=header.split(',').map(x=>x.trim().split('=')),t=parts.find(x=>x[0]==='t')?.[1];if(!/^\d+$/.test(t||'')||Math.abs(time-Number(t))>300)throw new Rejected('Expired payment signature.',400);
 const expected=await hmac(secret,t+'.'+raw);if(!parts.some(([k,v])=>k==='v1'&&equal(v,expected)))throw new Rejected('Invalid payment signature.',400);
 const event=JSON.parse(raw);if(typeof event.id!=='string'||typeof event.type!=='string'||!event.data?.object)throw new Rejected('Invalid payment event.',400);return event;
}
async function bounded(req,max){const reader=req.body?.getReader();if(!reader)throw new Rejected('Request body required.',400);let chunks=[],n=0;for(;;){const {value,done}=await reader.read();if(done)break;n+=value.byteLength;if(n>max){await reader.cancel();throw new Rejected('Request too large.',413)}chunks.push(value)}const all=new Uint8Array(n);let pos=0;for(const c of chunks){all.set(c,pos);pos+=c.length}return dec.decode(all)}
export async function handle(request,env,dependencies={}){
 const origin=request.headers.get('Origin'),url=new URL(request.url),headers={'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin'};
 if(origin===ORIGIN)Object.assign(headers,{'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Allow-Methods':'GET, POST, OPTIONS'});
 let status=200,out={};try{
  const s=new Enrollment(env,dependencies);
  if(request.method==='OPTIONS'){if(origin!==ORIGIN)throw new Rejected('Origin not allowed.',403);return new Response(null,{status:204,headers})}
  if(url.pathname==='/healthz'&&request.method==='GET')out={status:'ok',version:VERSION};
  else if(url.pathname==='/v1/readiness'&&request.method==='GET'){let ready=false;if(salesReady(env))try{await s.guard();ready=true}catch{}out={ready,version:VERSION}}
  else if(url.pathname==='/v1/stripe-webhook'&&request.method==='POST'){
   if(!runtimeReady(env))throw new Rejected('Service unavailable.',503);
   const raw=await bounded(request,1000000),event=await verifySignature(raw,request.headers.get('Stripe-Signature'),env.STRIPE_WEBHOOK_SECRET,s.clock());await s.event(event);out={received:true};
  }else if(request.method==='POST'&&['/v1/enrollments','/v1/verify','/v1/checkout'].includes(url.pathname)){
   if(origin!==ORIGIN)throw new Rejected('Origin not allowed.',403);if(!salesReady(env))throw new Rejected('Online enrollment is not available yet. No payment was created.',503);
   const data=JSON.parse(await bounded(request,32768)),token=request.headers.get('Authorization')?.replace(/^Bearer /,'')||'';
   if(url.pathname==='/v1/enrollments')out=await s.create(data,request.headers.get('CF-Connecting-IP')||'unknown');
   else if(url.pathname==='/v1/verify')out=await s.verify(data.id,token,data.code);else out=await s.checkout(data.id,token,data.orderHash,data.accepted);
  }else throw new Rejected('Not found.',404);
 }catch(error){status=error instanceof Rejected?error.status:error instanceof SyntaxError?400:503;out={error:error instanceof Rejected?error.message:'We could not complete this step. No activation is confirmed. Please retry or contact support.'}}
 return new Response(JSON.stringify(out),{status,headers});
}
export default {fetch:handle,async scheduled(_event,env){if(runtimeReady(env))await new Enrollment(env).deliverOne()}};
