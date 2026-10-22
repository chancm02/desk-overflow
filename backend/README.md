# Pre customer website intake

Current status: owner-approved Apps Script version 4 deployed and verified on October 22, 2026. Anonymous HTTP and browser submissions saved complete private records and matching inbox alerts. Duplicate and invalid-permission requests were rejected. assets/intake-config.js contains the verified public route. Final production-page verification is recorded in docs/launch/acquisition-verification.md.

The owner wants to acquire the first customer before buying HighLevel. A small owner-controlled Google Apps Script handler and existing private lead inbox are the proposed interim intake, not another CRM. Future customer service remains on HighLevel. Do not deploy Tally, PC hosting or tunnel experiments alongside it.

## Why the earlier deployment failed
The existing Apps Script editor showed the intake code nested inside the default myFunction wrapper. A web app needs top-level doPost/doGet handlers. The replacement Code.gs has those at the top level and uses an explicit private sheet ID, rather than an ambiguous active spreadsheet.

## Maintenance / redeployment checklist
1. Back up the existing script source privately. Replace Code.gs with this complete file at top level, without wrapping it in myFunction.
2. In Project Settings > Script Properties set LEADS_SHEET_ID to the existing private Desk Overflow lead inbox ID and NOTIFY_EMAIL to the owner-approved business alert recipient. Neither belongs in public repository code. The code creates a dedicated Website inquiries tab without overwriting the legacy Leads tab.
3. Review the manifest scopes: Sheets access and sending mail only. No Gmail-read scope or credential access is needed. Owner completes any Google authorization. Do not bypass Google's unverified-app or security warnings; hand those steps to the owner.
4. Create a versioned Web app deployment, execute as the owner and allow anonymous submissions only after reviewing public access. The Sheet itself must remain private. Deploying the public endpoint is a separate approval step; it does not publish the GitHub site.
5. Test the deployment while signed out, using synthetic business data and an approved test notification recipient. Do not use real customer data or reserved sample numbers for actual calls.
6. Confirm every submitted field, time, permission, version, source/campaign tags and request ID in the private Website inquiries tab. Confirm alert delivery and matching reference. Replay the same ID: one row and one alert. Test invalid email/permission, honeypot, duplicate, email quota/failure and storage failure. Keep signed-out test evidence privately.
7. Only after those tests pass, set the public endpoint and verified=true in assets/intake-config.js. The URL is public form routing, not a credential. Update site privacy text for the actual operation; review mobile validation and branded confirmation. Do not use a hidden iframe or no-cors fetch to claim success without confirming storage.
8. Obtain approval to merge/publish the final site. Perform one approved synthetic submission from the final public page and verify row + alert. Start marketing only after that check passes. No purchases, payment checkout or telephone activation are part of this process.

## Operating limits
Storage is the receipt record; notifications are supplementary. Review the private inbox daily and around marketing sessions, including rows marked Pending/Not sent. Google quotas and outages can delay or prevent requests; this is not guaranteed uninterrupted service or a complete anti-spam service. The handler uses a honeypot, bounded fields, permission validation, stable request IDs, locking, formula escaping, duplicate detection and honest failure pages. Monitor abuse and quota consumption; stop campaigns if delivery is uncertain. No caller audio, payment information, passwords or sensitive customer records belong here.

Local tests: node --test tests/intake.test.cjs. Mocks do not prove Google authorization, anonymous access, actual storage or email delivery. Live tests confirmed anonymous access, actual storage, complete attribution, text preservation, replay rejection and matching inbox alerts. Storage and quota failure paths were tested with mocks only.

When HighLevel is authorized, migrate the inquiry form to its native capture only after testing it, update the notice, then disable this external endpoint through its owner account. Handle existing records under the approved retention policy. Avoid permanent parallel lead stores.
