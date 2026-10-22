# Desk Overflow

The priority is obtaining the first customer before purchasing HighLevel. The existing landing-page identity is retained. HighLevel remains the intended CRM, AI, calendar, contract and payment platform for customer service after an agreed implementation.

Start with [acquisition readiness](docs/launch/acquisition-readiness.md), [marketing pack](marketing/README.md), and [preview gallery](marketing/preview.html). New deliverables include three vertical MP4s, twelve brand graphics, four real draft-site screenshots, subtitles, voiceover scripts and Facebook/TikTok/Reddit posting copy. No posts or paid ads have been published.

The landing page has clearer pricing, an illustrative call/lead/next-step example and a better mobile contact flow. The interim [Apps Script intake](backend/README.md) saves inquiries to the existing private Google inbox and sends owner alerts. Anonymous and browser tests verified complete records and actual alert receipt. The owner approved deployment and website publication. See the verification report for the final public-page check.

Local preview: `python -m http.server 8765 --bind 127.0.0.1`. Open `/marketing/preview.html` for assets and `/tests/responsive-qa.html` for layout measurements. Checks: `node --test tests/intake.test.cjs`, `python -m unittest discover -s tests -v`, `python tools/check_preparation.py`, `node --check assets/site.js`, `git diff --check`. See [current verification](docs/launch/acquisition-verification.md).

The [customer agreement packet](docs/launch/customer-agreement-packet.md), [HighLevel implementation checklist](docs/launch/implementation-checklist.md) and [activation readiness report](docs/launch/readiness.md) remain prepared for the later service phase. Legal drafts require owner and professional review. JSON specifications are not platform imports or a functioning Snapshot.

Credentials, customer data, signed documents and private account settings stay out of this repository. Old Tally/PC/tunnel experiments are not part of the current plan. No domain or paid account has been purchased. Website publication is approved. Real billing, purchases and customer forwarding still require separate approval.
