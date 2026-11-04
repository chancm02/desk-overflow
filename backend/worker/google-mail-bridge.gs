/** Standalone Apps Script project. Do not replace the existing inquiry backend.
 * Set MAIL_SECRET in Script Properties; never put the value in source.
 * Deploy as Web App, execute as owner. Anonymous access is safe only with this
 * signature check. Authorization is for MailApp sending, not reading Gmail.
 */
function doPost(e) {
  function response(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
  var lock = null;
  try {
    if (!e || !e.postData || e.postData.contents.length > 4096) return response({sent:false});
    var envelope = JSON.parse(e.postData.contents), secret = PropertiesService.getScriptProperties().getProperty('MAIL_SECRET');
    if (!secret || !/^\d+$/.test(String(envelope.timestamp)) || Math.abs(Date.now()/1000-Number(envelope.timestamp)) > 300 || typeof envelope.payload !== 'string' || typeof envelope.signature !== 'string') return response({sent:false});
    var expected = Utilities.computeHmacSha256Signature(String(envelope.timestamp)+'.'+envelope.payload, secret, Utilities.Charset.UTF_8).map(function(n){return ('0'+((n+256)%256).toString(16)).slice(-2);}).join('');
    var diff = expected.length ^ envelope.signature.length;
    for (var i=0;i<expected.length;i++) diff |= expected.charCodeAt(i) ^ (envelope.signature.charCodeAt(i)||0);
    if (diff) return response({sent:false});
    var p = JSON.parse(envelope.payload);
    if (!/^[a-f0-9]{32}$/.test(p.id) || !/^[^\s@\r\n]+@[^\s@\r\n]+\.[^\s@\r\n]+$/.test(p.email) || p.email.length>100 || !/^\d{6}$/.test(p.code) || p.expires_in!==600) return response({sent:false});
    lock = LockService.getScriptLock(); if (!lock.tryLock(3000)) return response({sent:false});
    var cache = CacheService.getScriptCache(), key='mail-'+p.id;
    if (cache.get(key)) return response({id:p.id,sent:true});
    if (MailApp.getRemainingDailyQuota()<1) return response({sent:false});
    MailApp.sendEmail({to:p.email,subject:'Your Desk Overflow verification code',body:'Your Desk Overflow code is '+p.code+'. It expires in 10 minutes. If you did not start enrollment, ignore this message. No service is active and no payment has been collected.',name:'Desk Overflow',replyTo:'desktopoverflow@gmail.com'});
    cache.put(key,'sent',600); return response({id:p.id,sent:true});
  } catch (_) { return response({sent:false}); }
  finally { if (lock) lock.releaseLock(); }
}
