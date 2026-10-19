/**
 * Desk Overflow — Google Sheets Lead Capture
 *
 * Install:
 * 1. Open the private "Desk Overflow — Website Lead Inbox" Google Sheet.
 * 2. Extensions -> Apps Script, replace the contents of Code.gs with this code.
 * 3. Save, then Deploy -> New deployment -> Web app.
 * 4. Execute as: Me. Who has access: Anyone.
 * 5. Authorize your own Google account, copy the /exec URL.
 * 6. Add that URL as the form action in index.html (see README).
 *
 * This runs in YOUR Google account; it does not publish the sheet.
 * Submitted leads persist in the private "Leads" sheet even if email alerts fail.
 */
const LEADS_TAB_NAME = 'Leads';
const ALERT_RECIPIENT = 'chancm02@gmail.com';
const THANK_YOU_URL = 'https://chancm02.github.io/desk-overflow/thanks.html';
const HOME_URL = 'https://chancm02.github.io/desk-overflow/';

function doGet() {
  return HtmlService.createHtmlOutput(page_(
    'Desk Overflow inquiry endpoint',
    'The lead form is configured. Please return to Desk Overflow to submit an inquiry.',
    false
  )).setTitle('Desk Overflow');
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  try {
    // Ignore simple bots without revealing a private spreadsheet or account details.
    if (p._honey) return reply_('Thank you', 'Your request has been processed.', false);

    const name = clean_(p.name, 120);
    const business = clean_(p.business, 150);
    const email = clean_(p.email, 160);
    const rawPhone = String(p.phone == null ? '' : p.phone).trim().slice(0, 40);
    const phone = safeCell_(rawPhone);
    const industry = clean_(p.industry, 100);
    const volume = clean_(p.weekly_call_volume, 60);
    const inquiry = clean_(p.message, 2000);
    const consent = clean_(p.permission_to_respond, 50);
    const source = 'Desk Overflow website';

    if (!name || !business || !email || !rawPhone ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !/^[0-9()+ .-]{7,40}$/.test(rawPhone) || consent !== 'Yes') {
      return reply_('Please check your details',
        'We could not accept this request. Please return to the form and provide a name, business, valid email, phone number, and contact permission.',
        false);
    }

    // Lightweight duplicate deterrent (not a replacement for mature anti-spam).
    const cache = CacheService.getScriptCache();
    const cacheKey = 'lead_' + hash_(email + '|' + phone + '|' + inquiry);
    if (cache.get(cacheKey)) {
      return reply_('Inquiry already received',
        'An inquiry with these details was recently recorded. Please check your email or call us if you need to update it.',
        true);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LEADS_TAB_NAME);
    if (!sheet) throw new Error('Missing Leads sheet');
    const lock = LockService.getScriptLock();
    lock.waitLock(12000);
    try {
      sheet.appendRow([
        new Date().toISOString(), name, business, email, phone, industry, volume,
        inquiry, consent, source, 'New'
      ]);
    } finally {
      lock.releaseLock();
    }
    cache.put(cacheKey, '1', 120);

    // Email is a convenience; the stored row is the record of receipt.
    try {
      if (MailApp.getRemainingDailyQuota() > 0) {
        MailApp.sendEmail({
          to: ALERT_RECIPIENT,
          replyTo: email,
          subject: 'Desk Overflow - new website inquiry from ' + business,
          body: [
            'A new lead has been safely recorded in the Desk Overflow Website Lead Inbox.',
            '',
            'Name: ' + name,
            'Business: ' + business,
            'Email: ' + email,
            'Phone: ' + phone,
            'Business type: ' + industry,
            'Approx. calls/week: ' + volume,
            'Message: ' + inquiry,
            'Consent: ' + consent,
            '',
            'Review the private Google Sheet for the saved record.'
          ].join('\n')
        });
      }
    } catch (mailError) {
      console.error('Lead saved, email notification failed: ' + mailError);
    }

    return reply_('Your inquiry was received',
      'Thank you for contacting Desk Overflow. We have recorded your request and will follow up using the details you provided.',
      true);
  } catch (err) {
    console.error('Submission rejected before confirming storage: ' + err);
    return reply_('We could not confirm your inquiry',
      'Please return to Desk Overflow and call (319) 536-4100. Your details were not confirmed as recorded.',
      false);
  }
}

function clean_(v, maxLength) {
  let t = String(v == null ? '' : v).trim().replace(/\u0000/g,'').slice(0, maxLength);
  // Prevent CSV/spreadsheet formula injection, including when data is later exported.
  if (/^[=+\-@\t\r]/.test(t)) t = "'" + t;
  return t;
}
function safeCell_(s) {
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}
function hash_(s) {
  const b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s);
  return Utilities.base64EncodeWebSafe(b).slice(0, 40);
}
function reply_(title, message, success) {
  return HtmlService.createHtmlOutput(page_(title, message, success))
    .setTitle('Desk Overflow | Contact');
}
function esc_(s) {
  return String(s).replace(/[&<>"']/g, ch => (
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]
  ));
}
function page_(title, message, success) {
  const label = success ? 'Return to Desk Overflow' : 'Return to the contact form';
  const url = success ? THANK_YOU_URL : HOME_URL + '#contact';
  const link = esc_(url);
  // HTML is a real confirmation/error page instead of a blank cross-domain response.
  return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<style>body{min-height:100vh;margin:0;background:#071622;color:#f6fcff;' +
    'font-family:Arial,sans-serif;display:grid;place-items:center;padding:20px;box-sizing:border-box}' +
    'main{max-width:550px;background:#102d3d;border:1px solid #296472;border-radius:22px;' +
    'padding:40px;text-align:center;box-shadow:0 20px 60px #0005}' +
    'h1{line-height:1.2;font-size:2rem;margin:0 0 14px}p{color:#c9e0e3;line-height:1.65}' +
    'a{display:inline-block;margin-top:20px;background:#5ce7ba;color:#073333;' +
    'border-radius:9px;padding:12px 19px;font-weight:800;text-decoration:none}' +
    '</style></head><body><main><h1>' + esc_(title) +
    '</h1><p>' + esc_(message) + '</p><a target="_top" rel="noopener noreferrer" href="' + link +
    '">' + esc_(label) + '</a></main></body></html>';
}
