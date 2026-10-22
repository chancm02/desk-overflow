(()=>{'use strict';
const $=id=>document.getElementById(id);
const menu=$('mobileMenu'),nav=$('navlinks');
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');menu.setAttribute('aria-expanded',String(open));});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');menu?.setAttribute('aria-expanded','false');}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('is-open')){nav.classList.remove('is-open');menu?.setAttribute('aria-expanded','false');menu?.focus();}});
const calls=$('calls'),job=$('job'),rate=$('rate'),out=$('total');
const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
function update(){const n=Number(calls.value),v=Number(job.value),r=Number(rate.value);$('callsVal').textContent=n;$('jobVal').textContent=money.format(v);$('rateVal').textContent=r+'%';out.textContent=money.format(n*30*v*r/100);}
if(calls&&job&&rate&&out){[calls,job,rate].forEach(el=>el.addEventListener('input',update));update();}
const tabs=[...document.querySelectorAll('[data-example]')];
function showExample(target,focus=false){tabs.forEach(tab=>{const active=tab===target;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;$('panel-'+tab.dataset.example).hidden=!active;});if(focus)target.focus();}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>showExample(tab));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();showExample(tabs[next],true);}});});
const form=$('leadForm');if(!form)return;
const query=new URLSearchParams(location.search);
for(const key of ['utm_source','utm_medium','utm_campaign'])form.elements.namedItem(key).value=(query.get(key)||'').slice(0,150);
form.elements.namedItem('submission_id').value=globalThis.crypto?.randomUUID?.()||('request-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10));
const config=window.DESK_OVERFLOW_INTAKE||{};
const ready=config.verified===true&&/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(config.endpoint||'');
const submit=form.querySelector('[type=submit]');
if(ready){form.action=config.endpoint;form.enctype='application/x-www-form-urlencoded';submit.textContent='Send My Request';form.querySelector('.privacy-note').innerHTML='Your details are saved privately for follow-up. <a href="./privacy.html">Privacy</a>';$('intakeHelp').textContent='No purchase or activation. You will see a confirmation after your inquiry has been saved.';}
form.addEventListener('submit',event=>{
 if(!form.reportValidity()){event.preventDefault();return;}
 if(form.elements.namedItem('_honey').value){event.preventDefault();$('intakeStatus').textContent='Please check your details and try again.';return;}
 if(ready){submit.disabled=true;submit.textContent='Saving your request…';$('intakeStatus').textContent='Please wait for the confirmation page. Do not close this tab yet.';return;}
 event.preventDefault();
 const data=new FormData(form),val=k=>String(data.get(k)||'').trim();
 const subject='Desk Overflow - website inquiry from '+val('business');
 const body=['New Desk Overflow inquiry','','Name: '+val('name'),'Business: '+val('business'),'Email: '+val('email'),'Phone: '+val('phone'),'Business type: '+val('industry'),'Calls per week: '+val('weekly_call_volume'),'','Current challenge:',val('message')||'(Not provided)','','Consent to respond: '+val('permission_to_respond')].join('\n');
 $('emailDraftLink').href='mailto:chancm02@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
 $('gmailDraftLink').href='https://mail.google.com/mail/?view=cm&fs=1&to=chancm02%40gmail.com&su='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
 $('inquiryText').value='To: chancm02@gmail.com\nSubject: '+subject+'\n\n'+body;
 $('copyStatus').textContent='';$('emailPreview').hidden=false;$('emailPreview').setAttribute('tabindex','-1');$('emailPreview').focus({preventScroll:true});$('emailPreview').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});
});
window.addEventListener('pageshow',()=>{submit.disabled=false;if(ready){submit.textContent='Send My Request';$('intakeStatus').textContent='';}});
$('copyInquiry')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('inquiryText').value);$('copyStatus').textContent='Copied. Paste into an email and press Send.';}catch(_){$('inquiryText').focus();$('inquiryText').select();$('copyStatus').textContent='Details selected. Copy them into an email and press Send.';}});
})();
