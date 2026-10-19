
(()=>{'use strict';
const $=id=>document.getElementById(id);
const menu=$('mobileMenu'),nav=$('navlinks');
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
[calls,job,rate].forEach(el=>el?.addEventListener('input',update));update();

})();
