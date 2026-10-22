# Acquisition verification

October 22, 2026. Scope: marketing assets and draft website for collecting the first inquiry before paid HighLevel setup. This report supersedes the October 21 site behavior notes for the changed UI. No public endpoint/site changes, real emails, customer calls or charges were made.

## Executed
- Node intake tests: 13 PASS. Valid records preserve every supplied business field and campaign attribution; consent, bad email/short phone and honeypot are rejected. Failed storage never claims receipt. A failed/quota-exhausted email alert leaves the stored record intact with an alert status. Replayed IDs do not duplicate rows or email. Formula-like input is stored as text. Unknown schema, missing configuration and busy lock fail honestly. Tests use local service mocks only.
- Existing preparation tests: 7 PASS. Four-page HTML references/IDs/labels/images pass; base CSS and SVG brand assets remain from the original site. Design checks now allow the requested example section and submission code changes.
- Browser: example tabs switch with click and arrow key, changing selected state and visible panel. Empty form submit focuses the required name field. The unconfigured mode still prepares a synthetic unsent inquiry and clearly says it has not been sent. No email application was opened and no message sent. Hidden campaign/reference fields are populated; exact live persistence remains to test in Google.
- Updated responsive frame widths 320/375/768/1265/1440: no page-wide horizontal overflow. Mobile hero text bottoms 711/641/527 and illustration tops 759/689/555, respectively; no overlap. Desktop hero remains side by side. This is CSS viewport measurement, not physical-device or complete assistive-technology certification.
- Media: three complete MP4s decoded without video errors; browser reports 1080x1920, approximately 27/28/22 seconds, no media error. Midpoint frames were inspected. All 12 brand graphics exported at 1080x1920 or 1080x1080; content bounds finish above footer in the creative source. Square capture and vertical hook visuals were inspected directly. Source and subtitles supplied.
- Real draft-site screenshots captured for desktop, narrow mobile, pricing and the explicitly labeled synthetic lead example. They do not show a working HighLevel account or real customer result.

## Pending required evidence
Owner-approved Google inbox/deployment; Google authorization and scope review; signed-out end-to-end dummy submission; matching private row and alert; duplicate and alert/storage failure testing in the actual deployed handler; verified endpoint configuration; publication approval; final production-page dummy test. Until that passes, automatic capture is NOT LIVE and campaign links should not be posted as if it is.

The browser surfaced an un-attributed MutationObserver error while interacting with the preview. Neither loaded application script uses MutationObserver, and tested behavior completed; the message is not evidence of successful or failed backend storage. No clean-console claim is made. Final public-page verification should check the console and actual submission path again.

## Current release state
assets/intake-config.js has an empty endpoint and verified=false. There is no claim of a saved public lead. The earlier Apps Script editor exposes only myFunction, with intake code nested inside it; corrected top-level handlers are prepared in backend/Code.gs but were not uploaded or deployed in this pass. The private Google Sheet has not been read or modified. Spend $0.
