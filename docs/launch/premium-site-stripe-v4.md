# Desk Overflow — premium website + Stripe payments deployment (November 3, 2026)

## Public site
- Home: https://www.deskoverflow.com/
- Solutions: https://www.deskoverflow.com/solutions/
- Industries: https://www.deskoverflow.com/industries/
- Pricing: https://www.deskoverflow.com/pricing/
- About: https://www.deskoverflow.com/about/
- Contact: https://www.deskoverflow.com/contact/
- Payments explainer: https://www.deskoverflow.com/checkout/
- Privacy, terms, SMS disclosures: linked in footer

The rebuilt site uses `assets/v4.css`, `assets/v4.js`, the shared chat-intake widget, and the existing Apps Script intake endpoint. External photography is illustrative. No customer dashboard, autonomous agent or live booking engine has been activated as part of the marketing site.

## Live intake
Public `assets/intake-config.js` provides the Apps Script deployment URL. The private Apps Script handles storage into the `Website inquiries` spreadsheet and sends a link/reference alert to its configured `NOTIFY_EMAIL`. The business owner tested the prior chat-intake flow as working. The newly rebuilt Contact page has the same required fields and submission contract, but a fresh production test is still needed.

IMPORTANT: `NOTIFY_EMAIL` is a **private Script Property**, and may still point to an older personal Gmail account. To send future alerts to `desktopoverflow@gmail.com`, update the Apps Script project under Project Settings → Script Properties → NOTIFY_EMAIL; share the private inquiry sheet with the business Gmail account. Public email fallback links already use `desktopoverflow@gmail.com`.

## Stripe connection and security
- Correct separate Stripe test-mode account: **Desktop Overflow**, context `acct_1UXkOuGzho3dgSTh` (verify public business name should display as **Desk Overflow**).
- Do not use the separately connected `chancm02 Studios` account for this business.
- A sandbox-only one-time test product (USD $1.00) and active Stripe-hosted payment link were created. Public link on /checkout/ is expressly marked test-only; no real payment or service purchase can occur through it.
- The private Stripe secret API key is not in GitHub. GitHub Pages is static and does not execute secret-bearing Checkout Session creation or verify webhooks.
- There is **no live merchant account connection in the current Stripe integration**, so public plan cards deliberately request a reviewed plan rather than charge a customer.
- Proposed plans currently listed for discussion: Essential $349/mo + $399 one-time setup; Growth $599/mo + $599 setup; Premium $899/mo + $999 setup. Included minutes/feature sets are also provisional. Confirm costs, tax and contract terms before publishing checkout links.
- A different historical sandbox product of $499/mo plus $500 setup exists and should not be confused with the current proposal or automatically activated.

## Production billing path
1. Customer submits inquiry or guided chat message and receives direct follow-up.
2. Discuss actual call volume, deployment feasibility, routing and optional HighLevel add-ons. Issue exact itemized order and MSA for signature.
3. Activate/verifiy the *live* Stripe merchant profile for Desk Overflow, set correct branding/support email, verify Iowa/state tax handling, sales tax registrations where required, payout account, and terms/refund/cancellation policies.
4. Create a one-time setup invoice or Stripe Payment Link for the approved signed order, sent only to that customer. If charging month one in advance, contract must specify fulfillment start and acceptance clearly.
5. Configure and test the AI system, telephony, SMS consent/A2P if needed, calendar integrations, and permissions.
6. After separate Go-Live approval, create and activate the recurring subscription on the agreed schedule, rather than starting it automatically with a generic public Payment Link.
7. Track paid invoices, charge failures, refunds/cancellations and revenue using Stripe's dashboard or verified webhooks and the signed order as source of truth.

## QA
- GitHub repository HTML/static checks performed: all seven marketing pages and three legal pages have balanced `div` structures and correct relative assets/pages.
- Public URLs and assets were fetched successfully after publishing, including `/checkout/`.
- Stripe sandbox link was confirmed via Stripe API as active and `livemode: false`.
- No real charges made, no customer accounts activated, and no private billing credentials published.
- Automated screenshot/click QA could not run because the optional browser agent had insufficient credits. Visual acceptance and fresh intake end-to-end test remain unverified. Use an Incognito window for independent review.
