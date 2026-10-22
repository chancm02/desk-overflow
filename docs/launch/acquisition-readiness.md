# Acquisition readiness before HighLevel

October 22, 2026. Priority changed to obtaining the first customer before purchasing HighLevel. HighLevel remains the intended platform for contracted customer service. This document supersedes account-first sequencing for marketing and inquiry capture only; the service activation and legal gates remain.

## Completed in the draft branch
- Existing landing-page identity retained, with clearer top-of-page pricing, concise inquiry copy, a keyboard-accessible three-step illustrative example, mobile form controls and existing mobile hero spacing safeguards.
- Three vertical MP4s, twelve branded graphics, actual draft-site screenshots, subtitles, optional voiceover scripts, Facebook/TikTok/Reddit drafts, profile copy and a first-week organic posting guide.
- Corrected standalone Google Apps Script intake handler, private property configuration, source/campaign capture, permission checks, duplicate suppression, formula escaping, branded saved/error pages and save-first notifications.
- Found the earlier deployed code nested inside the default myFunction wrapper. Only myFunction was exposed in the editor; a web app requires top-level doPost/doGet.
- Thirteen mocked intake tests and seven offline preparation tests pass. The Google live endpoint is not configured; mocks do not prove delivery.

## Remaining before campaign links are used
1. Owner approves use of the existing private Google inbox, versioned public web-app deployment and required Google authorization. Keep private Sheet access restricted; only the submission handler is public.
2. Configure the corrected script with private sheet ID and notification recipient; deploy a reviewed version. Test signed-out with dummy data. Verify all fields, source tags, permission/version, request reference, one private record and notification. Replay ID and confirm no duplicate.
3. Populate assets/intake-config.js only after verification, with the public endpoint and verified=true. Check final policy text, failure fallback and mobile submission.
4. Owner approves merge/publication. After publication, repeat a synthetic submission from the actual public URL and verify storage/alert before posting. No social publishing is authorized by this preparation task.

Until these steps pass, the current form continues to prepare an email the visitor must send. Automatic capture is not yet live. Marketing assets do not imply a configured AI phone agent; illustrative labels must remain visible. No purchase, charge, forwarding activation or marketing message was performed. Spend $0.

## Customer workflow after inquiry
Review saved request → personal qualification conversation → approved scope and legal documents → agreed setup payment → owner authorizes HighLevel spend/setup → onboarding and tests → customer acceptance → separately approved activation and recurring billing. Confirm a realistic implementation timeline before accepting an order; do not promise immediate activation or uninterrupted service.

## Review links
- marketing/preview.html and marketing/README.md for deliverables
- backend/README.md for exact intake deployment and tests
- docs/launch/customer-agreement-packet.md for drafts requiring review
- docs/launch/readiness.md for customer-service activation prerequisites
