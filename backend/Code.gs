/** Desk Overflow pre-customer intake. Deploy only after owner authorization.
 * Script Properties (private): LEADS_SHEET_ID, NOTIFY_EMAIL.
 * No credentials or sheet ID belong in the public site or repository.
 * Deploy Web app: execute as owner, anonymous submissions allowed.
 */
const INTAKE_VERSION = '2026-10-22';
const HOME_URL = 'https://chancm02.github.io/desk-overflow/';
const COLUMNS = ['Received UTC','Submission ID','Name','Business','Email','Phone','Industry','Calls per week','Challenge','Response permission','Privacy version','Source','UTM source','UTM medium','UTM campaign','Status','Alert status'];
function doGet() {
  return response_('Contact Desk Overflow', 'Please use our website to request a call coverage plan. No service or payment is activated by an inquiry.', false);
}
function validateLead_(p) {
  const value = (k,max) => String(p[k] == null ? '' : p[k]).replace(/\u0000/g,'').trim().slice(0,max);
  const d = {id:value('submission_id',80),name:value('name',120),business:value('business',150),email:value('email',150),phone:value('phone',30),industry:value('industry',100),volume:value('weekly_call_volume',60),message:value('message',2000),permission:value('permission_to_respond',10),source:value('source',120),utm_source:value('utm_source',100),utm_medium:value('utm_medium',100),utm_campaign:value('utm_campaign',150)};
  if (!d.name || !d.business || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) || !/^[0-9()+ .-]{7,30}$/.test(d.phone) || d.phone.replace(/\D/g,'').length<7 || d.permission!=='Yes') throw new Error('VALIDATION');
  if (!/^[a-zA-Z0-9-]{12,80}$/.test(d.id)) d.id=Utilities.getUuid();
  return d;
}
function doPost(e) {
  const p=e&&e.parameter||{};
  if(String(p._honey||'').trim())return response_('Please try again','We could not verify this request. Please return to the form or call us.',false);
  let d;
  try { d=validateLead_(p); } catch (_) { return response_('Check your details','Please provide your name, business, valid email, callback number and permission to respond. Your request has not been saved.',false); }
  const lock=LockService.getScriptLock();
  let saved=false, duplicate=false, row=0, sheet;
  try {
    const props=PropertiesService.getScriptProperties();
    const sheetId=props.getProperty('LEADS_SHEET_ID');
    if(!sheetId)throw new Error('CONFIG');
    if(!lock.tryLock(10000))throw new Error('BUSY');
    try {
      const book=SpreadsheetApp.openById(sheetId);
      sheet=book.getSheetByName('Website inquiries')||book.insertSheet('Website inquiries');
      if(sheet.getLastRow()===0){sheet.appendRow(COLUMNS);sheet.setFrozenRows(1);}
      const headers=sheet.getRange(1,1,1,COLUMNS.length).getValues()[0];
      if(JSON.stringify(headers)!==JSON.stringify(COLUMNS))throw new Error('SCHEMA');
      if(sheet.getLastRow()>1){
        const found=sheet.getRange(2,2,sheet.getLastRow()-1,1).createTextFinder(d.id).matchEntireCell(true).findNext();
        duplicate=Boolean(found);
      }
      if(!duplicate){
        sheet.appendRow([new Date().toISOString(),d.id,d.name,d.business,d.email,d.phone,d.industry,d.volume,d.message,d.permission,INTAKE_VERSION,d.source||'Website',d.utm_source,d.utm_medium,d.utm_campaign,'New','Pending'].map(safeCell_));
        SpreadsheetApp.flush();row=sheet.getLastRow();
      }
      saved=true;
    } finally {lock.releaseLock();}
    if(!duplicate){
      let status='Not sent';
      try {
        const recipient=props.getProperty('NOTIFY_EMAIL');
        if(!recipient || MailApp.getRemainingDailyQuota()<1)throw new Error('ALERT_UNAVAILABLE');
        MailApp.sendEmail({to:recipient,subject:'Desk Overflow: new website inquiry',body:'A new inquiry has been saved. Review the private Desk Overflow lead inbox: '+sheet.getParent().getUrl()+'\nReference: '+d.id+'\nPlease review the saved record and follow up. No customer details are included in this alert.'});
        status='Sent';
      }catch(_){console.warn('Inquiry saved; alert unavailable. Review private inbox.');}
      try{sheet.getRange(row,17).setValue(status);}catch(_){console.warn('Alert status update unavailable.');}
    }
    return response_(duplicate?'Inquiry already received':'Your inquiry is saved', 'Thank you. We have recorded your request and will review your call coverage needs. Nothing has been purchased or activated. Reference: '+d.id.slice(0,8),true);
  }catch(_){
    console.error(saved?'Saved inquiry requires review.':'Inquiry storage could not be confirmed.');
    return response_(saved?'Your inquiry is saved':'We could not confirm your inquiry',saved?'Your details were recorded, but a notification may be delayed. No payment or service was activated.':'Please return to the form and retry. If needed, call (319) 536-4100 or email the business directly. We have not confirmed storage.',saved);
  }
}
function safeCell_(v){const s=String(v==null?'':v);return /^[\s]*[=+\-@]/.test(s)?"'"+s:s;}
function esc_(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function response_(title,message,success){
  const html='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Desk Overflow inquiry</title><style>body{margin:0;padding:24px;min-height:100vh;box-sizing:border-box;background:#071622;color:#f8fbff;font:17px/1.6 system-ui;display:grid;place-items:center}main{max-width:570px;padding:38px;border:1px solid #255265;border-radius:20px;background:#0e2636}small{color:#5ce7ba;letter-spacing:.12em}h1{font-size:34px;line-height:1.15}p{color:#c6dce5}a{display:inline-block;margin-top:16px;padding:13px 20px;border-radius:9px;background:#5ce7ba;color:#072c2c;font-weight:750;text-decoration:none}</style><main><small>DESK OVERFLOW</small><h1>'+esc_(title)+'</h1><p>'+esc_(message)+'</p><a target="_top" href="'+HOME_URL+(success?'':'#contact')+'">Return to Desk Overflow</a></main></html>';
  return HtmlService.createHtmlOutput(html).setTitle('Desk Overflow inquiry');
}
