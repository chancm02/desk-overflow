
(()=>{'use strict';
const $=id=>document.getElementById(id);
const menu=$('mobileMenu'),nav=$('navlinks');
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav?.classList.contains('is-open')){nav.classList.remove('is-open');menu?.setAttribute('aria-expanded','false');menu?.focus();}});
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');menu.setAttribute('aria-expanded',String(open));});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');menu?.setAttribute('aria-expanded','false');}));
const calls=$('calls'),job=$('job'),rate=$('rate'),out=$('total');
const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
function update(){
 const n=Number(calls.value),v=Number(job.value),r=Number(rate.value);
 $('callsVal').textContent=n;
 $('jobVal').textContent=money.format(v);
 $('rateVal').textContent=r+'%';
 // Monthly illustration = approximate 30 days, not a promise of revenue recovered.
 out.textContent=money.format(n*30*v*r/100);
}
[calls,job,rate].forEach(el=>el?.addEventListener('input',update));if(calls&&job&&rate&&out)update();

const leadForm=$('leadForm');
if(leadForm){
 leadForm.addEventListener('submit',event=>{
  event.preventDefault();
  if(!leadForm.reportValidity())return;
  if(leadForm.elements.namedItem('_honey')?.value)return;
  const data=new FormData(leadForm);
  const val=k=>String(data.get(k)||'').trim();
  const subject='Desk Overflow - website inquiry from '+val('business');
  const body=['New Desk Overflow inquiry','','Name: '+val('name'),'Business: '+val('business'),
   'Email: '+val('email'),'Phone: '+val('phone'),'Business type: '+val('industry'),
   'Calls per week: '+val('weekly_call_volume'),'','Current challenge:',val('message')||'(Not provided)',
   '','Consent to respond: '+val('permission_to_respond')].join('\n');
  $('emailDraftLink').href='mailto:chancm02@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  $('gmailDraftLink').href='https://mail.google.com/mail/?view=cm&fs=1&to=chancm02%40gmail.com&su='+
   encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  $('inquiryText').value='To: chancm02@gmail.com\nSubject: '+subject+'\n\n'+body;
  $('copyStatus').textContent='';
  $('emailPreview').hidden=false;
  $('emailPreview').focus({preventScroll:true});
  $('emailPreview').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});
 });
 $('copyInquiry')?.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText($('inquiryText').value);
   $('copyStatus').textContent='Copied. Paste into an email and press Send.';
  }catch(error){$('inquiryText').focus();$('inquiryText').select();
   $('copyStatus').textContent='Details selected. Copy them into an email and press Send.';}
 });
}
})();
