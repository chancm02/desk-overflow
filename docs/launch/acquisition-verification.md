# Acquisition verification

October 22, 2026. Scope: marketing assets and draft website for collecting the first inquiry before paid HighLevel setup. This report supersedes the October 21 site behavior notes for the changed UI. Owner subsequently approved Google deployment, synthetic alert emails and website publication. No customer calls or charges were made.

## Executed
- Node intake tests: 13 PASS. Valid records preserve every supplied business field and campaign attribution; consent, bad email/short phone and honeypot are rejected. Failed storage never claims receipt. A failed/quota-exhausted email alert leaves the stored record intact with an alert status. Replayed IDs do not duplicate rows or email. Formula-like input is stored as text. Unknown schema, missing configuration and busy lock fail honestly. Tests use local service mocks only.
- Existing preparation tests: 7 PASS. Four-page HTML references/IDs/labels/images pass; base CSS and SVG brand assets remain from the original site. Design checks now allow the requested example section and submission code changes.
- Browser: example tabs switch with click and arrow key, changing selected state and visible panel. Empty form submit focuses the required name field. The unconfigured mode still prepares a synthetic unsent inquiry and clearly says it has not been sent. No email application was opened and no message sent. Hidden campaign/reference fields are populated; exact live persistence remains to test in Google.
- Updated responsive frame widths 320/375/768/1265/1440: no page-wide horizontal overflow. Mobile hero text bottoms 711/641/527 and illustration tops 759/689/555, respectively; no overlap. Desktop hero remains side by side. This is CSS viewport measurement, not physical-device or complete assistive-technology certification.
- Media: three complete MP4s decoded without video errors; browser reports 1080x1920, approximately 27/28/22 seconds, no media error. Midpoint frames were inspected. All 12 brand graphics exported at 1080x1920 or 1080x1080; content bounds finish above footer in the creative source. Square capture and vertical hook visuals were inspected directly. Source and subtitles supplied.
- Real draft-site screenshots captured for desktop, narrow mobile, pricing and the explicitly labeled synthetic lead example. They do not show a working HighLevel account or real customer result.

## Live intake evidence — October 22, 2026
Apps Script version 4 is deployed. Signed-out HTTP tests and a native browser form submission saved all fields and campaign tags in the private Website inquiries tab. Matching reference alerts arrived in the owner inbox. Replay did not duplicate storage or alert; invalid permission was rejected. An initial spreadsheet date/leading-zero coercion issue was fixed by setting plain-text format before writing; the corrected version preserved both values exactly. Legacy Leads records were not overwritten. Private IDs and test evidence remain outside Git.

Storage failure and alert/quota failure paths pass local mocks; they were not deliberately triggered in the live account. Google quotas and outages remain operational limitations.

## Production page
The verified public route is configured. Publication is approved; the final public-page synthetic check will be appended after Pages deployment. Spend $0. No social posts, payments, HighLevel purchase or customer forwarding.
