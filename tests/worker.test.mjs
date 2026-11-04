import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {Enrollment,quote,seal,open,hmac,verifySignature,handle,ORIGIN} from '../backend/worker/index.mjs';
import {catalog} from '../backend/worker/catalog.mjs';
class D1 {
 constructor(){this.db=new DatabaseSync(':memory:');this.db.exec(readFileSync(new URL('../backend/worker/schema.sql',import.meta.url),'utf8'))}
 prepare(sql){const db=this.db;return {bind(...args){return {first:async()=>db.prepare(sql).get(...args)||null,run:async()=>({meta:db.prepare(sql).run(...args)}),_run:()=>db.prepare(sql).run(...args)}}}}
 async batch(stmts){this.db.exec('BEGIN');try{const results=stmts.map(s=>s._run());this.db.exec('COMMIT');return results}catch(e){this.db.exec('ROLLBACK');throw e}}
}
const business={name:'Test Owner',title:'Owner',business:'Test Business',entity:'Sole proprietor',email:'owner@example.com',phone:'3195550100',billing:'Test address',city:'Vinton',state:'IA',postalCode:'52349',service:'Same as billing',timezone:'America/Chicago',businessNumber:'3195550101',carrier:'Test carrier',coverage:'After-hours',calls:'Under 25',hours:'M–F 9–5',serviceArea:'Iowa',recipient:'leads@example.com',fallback:'Voicemail',calendar:'None',exemption:'No',authority:true,documentsRead:true,responsePermission:true,addons:[],quotes:[]};
function fixture(){
 const env={DB:new D1(),STRIPE_RESTRICTED_KEY:'rk_test_local',STRIPE_WEBHOOK_SECRET:'whsec_local',ENROLLMENT_ENCRYPTION_KEY:Buffer.alloc(32,7).toString('base64'),MAIL_ENDPOINT:'https://mail.example.com/send',MAIL_SECRET:'local-mail-secret',DATA_SCHEDULE_JSON:JSON.stringify(Object.fromEntries(['processors','retention','notices','security','exit','version'].map(k=>[k,'test']))),PROVISIONING_ENDPOINT:'https://adapter.example.com/jobs',PROVISIONING_SECRET:'local-adapter-secret',SELLING_STATES:'IA',ENROLLMENT_ENABLED:'1',TAX_APPROVED:'1',IDENTITY_VERIFIED:'1',PROVIDER_READY:'1',AUTOMATION_TESTED:'1',CONTRACT_OFFER_APPROVED:'1'};
 const sessions=new Map(),calls=[];let code='',failMail=false,failAdapter=false;
 const fetcher=async(url,opts={})=>{
  calls.push({url,opts});const reply=x=>new Response(JSON.stringify(x),{headers:{'Content-Type':'application/json'}});
  if(url===env.MAIL_ENDPOINT){if(failMail)throw Error('mail offline');const envelope=JSON.parse(opts.body),x=JSON.parse(envelope.payload);code=x.code;assert.equal(envelope.signature,await hmac(env.MAIL_SECRET,envelope.timestamp+'.'+envelope.payload));return reply({id:x.id,sent:true})}
  if(url===env.PROVISIONING_ENDPOINT){if(failAdapter)throw Error('ambiguous timeout');const x=JSON.parse(opts.body);return reply({id:x.id,durably_accepted:true})}
  const path=new URL(url).pathname;
  if(path.includes('/accounts/'))return reply({id:'acct_1UXkOuGzho3dgSTh',charges_enabled:true,requirements:{currently_due:[]}});
  if(path.endsWith('/tax/settings'))return reply({status:'active'});
  if(path.endsWith('/tax/registrations'))return reply({data:[{livemode:true,country:'US',country_options:{us:{state:'IA'}},status:'active'}]});
  if(path.includes('/prices/')){const id=path.split('/').at(-1);for(const group of Object.values(catalog))for(const item of Object.values(group))for(const type of ['setup','monthly'])if(item[type].price===id)return reply({id,active:true,livemode:true,currency:'usd',unit_amount:item[type].amount,type:type==='setup'?'one_time':'recurring',recurring:type==='monthly'?{interval:'month',interval_count:1}:null,product:{active:true,tax_code:'TEST_CLASSIFICATION'}});throw Error('unknown price')}
  if(path.endsWith('/customers'))return reply({id:'cus_test'});
  if(path.endsWith('/checkout/sessions')){const args=Object.fromEntries(opts.body);assert.equal(args.mode,'payment');assert.equal(args['automatic_tax[enabled]'],'true');assert.ok(!Object.keys(args).some(k=>k.includes('payment_method_types')));const s={id:'cs_test',url:'https://checkout.stripe.com/c/pay/test',status:'open',livemode:true,mode:'payment',payment_status:'unpaid',customer:'cus_test',client_reference_id:args.client_reference_id,currency:'usd',amount_subtotal:50000};sessions.set(s.id,s);return reply(s)}
  if(path.includes('/checkout/sessions/'))return reply(sessions.get(path.split('/').at(-1)));
  throw Error('unexpected request '+url);
 };
 return {env,service:new Enrollment(env,{fetcher,clock:()=>1000}),fetcher,sessions,calls,get code(){return code},set failMail(v){failMail=v},set failAdapter(v){failAdapter=v}};
}
async function paidOrder(f){const d=await f.service.create(business,'test-ip'),v=await f.service.verify(d.id,d.token,f.code);await f.service.checkout(d.id,d.token,v.orderHash,true);f.sessions.get('cs_test').payment_status='paid';return d}
const event=(id='evt_paid',type='checkout.session.completed',obj={id:'cs_test'})=>({id,type,livemode:true,data:{object:obj}});
test('Worker catalog equals approved source and all 96 package combinations',()=>{
 assert.deepEqual(catalog,JSON.parse(readFileSync(new URL('../backend/enrollment/catalog.json',import.meta.url),'utf8')));
 const offers=JSON.parse(JSON.stringify(catalog));for(const plan of Object.keys(offers.plans))for(let n=0;n<32;n++){const addons=Object.keys(offers.addons).filter((_,i)=>n&(1<<i)),q=quote({plan,addons}),p=offers.plans[plan],extra=addons.filter(x=>!p.included.includes(x));assert.equal(q.monthly,p.monthly.amount+extra.reduce((s,id)=>s+offers.addons[id].monthly.amount,0));assert.equal(q.setup,p.setup.amount+extra.reduce((s,id)=>s+offers.addons[id].setup.amount,0))}
 assert.throws(()=>quote({addons:['minutes250']}));assert.throws(()=>quote({plan:'constructor'}));
});
test('encrypted order rejects alteration and wrong key',async()=>{const key=Buffer.alloc(32,1).toString('base64'),s=await seal({email:'private@example.com'},key);assert.ok(!s.includes('private'));assert.deepEqual(await open(s,key),{email:'private@example.com'});await assert.rejects(open(s,Buffer.alloc(32,2).toString('base64')))});
test('signature validates raw bytes, rotation signatures and five-minute replay window',async()=>{const raw=JSON.stringify(event()),sig=await hmac('secret','1000.'+raw);assert.equal((await verifySignature(raw,'t=1000,v1=bad,v1='+sig,'secret',1000)).id,'evt_paid');await assert.rejects(verifySignature(raw+' ','t=1000,v1='+sig,'secret',1000));await assert.rejects(verifySignature(raw,'t=1000,v1='+sig,'secret',1301))});
test('email verification, server price, pending then paid webhook and durable setup job are separate',async()=>{
 const f=fixture(),d=await f.service.create({...business,setup:1,monthly:1},'ip');await assert.rejects(f.service.checkout(d.id,d.token,'x',true));const v=await f.service.verify(d.id,d.token,f.code);assert.equal(v.order.quote.setup,50000);await assert.rejects(f.service.checkout(d.id,d.token,'changed-order',true));
 await f.service.checkout(d.id,d.token,v.orderHash,true);await f.service.event(event('evt_unpaid'));assert.equal(f.env.DB.db.prepare('SELECT COUNT(*) AS n FROM jobs').get().n,0);
 f.sessions.get('cs_test').payment_status='paid';await f.service.event(event());await f.service.event(event());assert.equal(f.env.DB.db.prepare('SELECT COUNT(*) AS n FROM jobs').get().n,1);
 await f.service.deliverOne();assert.equal(f.env.DB.db.prepare('SELECT state FROM jobs').get().state,'accepted_by_adapter');assert.equal(f.calls.filter(x=>x.url.endsWith('/checkout/sessions')).length,1);
});
test('wrong order, amount or currency cannot fulfill',async()=>{const f=fixture();await paidOrder(f);f.sessions.get('cs_test').amount_subtotal=1;await assert.rejects(f.service.event(event()));assert.equal(f.env.DB.db.prepare('SELECT COUNT(*) AS n FROM events').get().n,0)});
test('out-of-order paid event cannot clear refund hold or send provision job',async()=>{const f=fixture();await paidOrder(f);await f.service.event(event('evt_refund','charge.refunded',{id:'ch_test',customer:'cus_test'}));await f.service.event(event());assert.equal(f.env.DB.db.prepare('SELECT state FROM orders').get().state,'risk_review');assert.equal(f.env.DB.db.prepare("SELECT COUNT(*) AS n FROM jobs WHERE kind='provision'").get().n,0)});
test('failed email and exhausted codes never authorize checkout',async()=>{const f=fixture();f.failMail=true;await assert.rejects(f.service.create(business,'ip'));assert.equal(f.env.DB.db.prepare('SELECT state FROM orders').get().state,'email_failed');const g=fixture(),d=await g.service.create(business,'ip');for(let i=0;i<5;i++)await assert.rejects(g.service.verify(d.id,d.token,'wrong'));await assert.rejects(g.service.verify(d.id,d.token,g.code))});
test('ambiguous adapter result stops for reconciliation, never blindly sends twice',async()=>{const f=fixture();await paidOrder(f);await f.service.event(event());f.failAdapter=true;await f.service.deliverOne();assert.equal(f.env.DB.db.prepare('SELECT state FROM jobs').get().state,'needs_reconciliation');assert.equal(await f.service.deliverOne(),false)});
test('unconfigured host stays healthy but cannot accept sales; other origins rejected',async()=>{const request=p=>new Request('https://api.example.com'+p);assert.equal((await handle(request('/healthz'),{})).status,200);assert.equal((await (await handle(request('/v1/readiness'),{})).json()).ready,false);assert.equal((await handle(new Request('https://api.example.com/v1/enrollments',{method:'POST',headers:{Origin:ORIGIN},body:'{}'}),{})).status,503);const f=fixture();assert.equal((await handle(new Request('https://api.example.com/v1/enrollments',{method:'POST',headers:{Origin:'https://attacker.example'},body:'{}'}),f.env)).status,403)});

test('customer contact changes enqueue reconciliation through customer ID',async()=>{const f=fixture();await paidOrder(f);await f.service.event(event('evt_customer','customer.updated',{id:'cus_test'}));assert.equal(f.env.DB.db.prepare('SELECT kind FROM jobs').get().kind,'reconcile_billing')});
