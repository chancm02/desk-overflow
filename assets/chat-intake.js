(()=>{'use strict';
// Guided website message capture, NOT a live human/AI chat.
const cfg=window.DESK_OVERFLOW_INTAKE||{};
const ready=cfg.verified===true&&/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(cfg.endpoint||'');
const path=location.pathname;
const root=path.includes('/desk-overflow/')?'/desk-overflow/':'/';
const contact=root+'contact/';
const privacy=root+'privacy.html';
const qs=new URLSearchParams(location.search);
const limit=(v,n)=>String(v||'').slice(0,n);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const btn=document.createElement('button');btn.type='button';btn.className='do-chat-launch';btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-controls','do-chat-panel');btn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9l-6 3V6a2 2 0 0 1 2-2Z"/><path d="M7 10h10M7 14h7"/></svg><span>Chat / Leave a message</span>';
const panel=document.createElement('section');panel.id='do-chat-panel';panel.className='do-chat-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Desk Overflow website message form');panel.hidden=true;
panel.innerHTML='<div class="do-chat-heading"><div><b>Desk Overflow</b><small>Leave a message · We reply by email or phone</small></div><button class="do-chat-close" type="button" aria-label="Close message window">×</button></div>'+
'<div class="do-chat-content"><div class="do-chat-message"><strong>Hi! How can we help your business?</strong>This is a message form, not live support. Choose a topic, then leave your details for our team to review.</div>'+
'<div class="do-chat-options" role="group" aria-label="Choose an inquiry topic"><button type="button" class="do-chat-option" data-topic="AI answering and after-hours calls">AI answering</button><button type="button" class="do-chat-option" data-topic="Pricing and packages">Pricing</button><button type="button" class="do-chat-option" data-topic="Scheduling and calendar integrations">Scheduling</button><button type="button" class="do-chat-option" data-topic="Another question">Something else</button></div>'+
'<form class="do-chat-form" id="do-chat-form" method="POST" enctype="application/x-www-form-urlencoded" accept-charset="UTF-8">'+
'<input type="hidden" name="source" value="Desk Overflow website chat inquiry"><input type="hidden" name="submission_id"><input type="hidden" name="utm_source"><input type="hidden" name="utm_medium"><input type="hidden" name="utm_campaign"><input type="hidden" name="industry" value=""><input type="hidden" name="weekly_call_volume" value="Not sure"><input type="hidden" name="selected_plan" value="Not sure"><div style="position:absolute;left:-9999px" aria-hidden="true"><label for="do-chat-honey">Leave this blank</label><input id="do-chat-honey" type="text" name="_honey" tabindex="-1" autocomplete="off"></div>'+
'<div class="do-chat-field"><label for="do-chat-name">Your name *</label><input id="do-chat-name" name="name" autocomplete="name" maxlength="120" required></div><div class="do-chat-field"><label for="do-chat-business">Business *</label><input id="do-chat-business" name="business" autocomplete="organization" maxlength="150" required></div>'+
'<div class="do-chat-field"><label for="do-chat-email">Email *</label><input id="do-chat-email" name="email" autocomplete="email" type="email" maxlength="150" required></div><div class="do-chat-field"><label for="do-chat-phone">Phone *</label><input id="do-chat-phone" name="phone" autocomplete="tel" type="tel" minlength="7" maxlength="30" pattern="[0-9()+ .-]{7,30}" required></div>'+
'<div class="do-chat-field wide"><label for="do-chat-message">How can we help? *</label><textarea id="do-chat-message" name="message" maxlength="2000" required placeholder="Tell us about your call handling or questions..."></textarea></div>'+
'<label class="do-chat-consent"><input type="checkbox" name="permission_to_respond" value="Yes" required><span>I authorize Desk Overflow to reply about this inquiry by phone or email. I am not agreeing to promotional texts or automated marketing calls.</span></label>'+
'<div class="do-chat-status" id="do-chat-status" role="status" aria-live="polite"></div><button class="do-chat-submit" type="submit">Send my message</button>'+
'<p class="do-chat-help">No payment or subscription is started. Read our <a href="'+escape(privacy)+'">Privacy Policy</a>. '+(!ready?'Online messages are temporarily unavailable. <a href="'+escape(contact)+'">Use the contact page</a>.':'After sending, you will receive a confirmation page.')+'</p></form>'+
'<p class="do-chat-footer">Please do not send passwords, payment details, medical information or sensitive client records.</p></div>';
document.body.append(btn,panel);
const form=panel.querySelector('#do-chat-form'),status=panel.querySelector('#do-chat-status'),submit=form.querySelector('[type=submit]');
const id=form.elements.namedItem('submission_id');
id.value=window.crypto?.randomUUID?.()||('message-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
for(const key of ['utm_source','utm_medium','utm_campaign'])form.elements.namedItem(key).value=limit(qs.get(key),100);
if(ready){form.action=cfg.endpoint;}else{submit.textContent='Open the contact page';submit.type='button';submit.addEventListener('click',()=>{location.href=contact;});}
const close=()=>{panel.hidden=true;btn.setAttribute('aria-expanded','false');btn.focus()};
btn.addEventListener('click',()=>{const open=panel.hidden;panel.hidden=!open;btn.setAttribute('aria-expanded',String(open));if(open)panel.querySelector('#do-chat-name').focus();});
panel.querySelector('.do-chat-close').addEventListener('click',close);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)close()});
let topic='';
panel.querySelectorAll('[data-topic]').forEach(b=>b.addEventListener('click',()=>{topic=b.dataset.topic;panel.querySelectorAll('[data-topic]').forEach(x=>x.setAttribute('aria-pressed',String(b===x)));const msg=form.elements.namedItem('message');if(!msg.value.trim())msg.value=topic+': ';msg.focus();}));
form.addEventListener('submit',e=>{if(!ready){e.preventDefault();location.href=contact;return}
const honey=form.elements.namedItem('_honey');if(honey.value.trim()){e.preventDefault();status.textContent='Please review the form details and try again.';return}
if(!form.reportValidity()){e.preventDefault();return}
const msg=form.elements.namedItem('message').value.trim();if(!msg||msg===topic+':'){e.preventDefault();status.textContent='Please add a little detail about your question.';form.elements.namedItem('message').focus();return}
submit.disabled=true;submit.textContent='Sending your message…';status.textContent='Please wait for the confirmation page. No message is confirmed until it appears.';
});
window.addEventListener('pageshow',()=>{submit.disabled=false;if(ready)submit.textContent='Send my message';});
})();
