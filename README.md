# Desk Overflow

Static landing page with existing navy/mint branding and email-compose inquiry fallback. No build step. HighLevel is the selected CRM, inbound AI, calendar, documents and billing platform. No paid account exists yet.

Start with [launch readiness](docs/launch/readiness.md) and the [implementation checklist](docs/launch/implementation-checklist.md). The [customer agreement packet](docs/launch/customer-agreement-packet.md) contains five new editable drafts for owner/legal review. The kit includes native field/form/FAQ specifications, messages, costs, DNS preparation, onboarding and acceptance records.

Local preview: `python -m http.server 8765 --bind 127.0.0.1` from repository root. Do not deploy the archived backend experiments. Do not store credentials, customer data, signatures or recordings here. Changes remain on draft PR #1; merge, publishing, live billing and forwarding require owner approval.

Owner direction: preserve the existing landing-page design. Current changes only repair mobile hero overlap and correct launch-scope wording. Original JavaScript and branding remain unchanged. Integrate HighLevel with only necessary functional changes after authenticated access is available.

Preparation checks: `python tools/check_preparation.py`, `python -m unittest discover -s tests -v`, `node --check assets/site.js`, `git diff --check`. Visit `/tests/responsive-qa.html` on the local server for layout measurements. See [verification evidence](docs/launch/verification.md). JSON files are specifications and dummy fixtures, not native platform imports or a configured Snapshot.
