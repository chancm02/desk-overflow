# Desk Overflow

Static landing page, navy/mint branding and email-compose inquiry fallback. No build step. HighLevel is the planned CRM, inbound AI, calendar, documents and billing platform. No paid account exists yet.

Start with [launch readiness](docs/launch/readiness.md), then [HighLevel build](docs/launch/highlevel-build.md), [budget/billing/DNS](docs/launch/costs-billing-domain.md), [onboarding/tests](docs/launch/onboarding-acceptance.md) and [legal mapping](docs/launch/legal-template-map.md).

Local preview: `python -m http.server 8765 --bind 127.0.0.1` from repository root. Do not deploy the archived backend experiments. Do not store credentials, customer data, signatures or recordings here. Changes remain on draft PR #1; merge, publishing, live billing and forwarding require owner approval.

Owner direction: preserve the existing landing page design. HTML, CSS and JavaScript remain at the pre-implementation draft baseline; integrate HighLevel with only necessary functional changes after authenticated access is available.
