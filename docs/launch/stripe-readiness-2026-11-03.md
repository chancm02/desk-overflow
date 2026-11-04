# Live Stripe audit — November 3, 2026 (Central)

## Verified and completed

- Live Iowa state sales tax registration is active; Tax Settings active. No registration was created or changed by this audit.
- All 16 current package/add-on prices match backend/enrollment/catalog.json: USD, active, correct one-time/monthly intervals and amounts, tax exclusive.
- Basic $299/mo + $500 setup; Premium $499/mo + $1,000 setup; Advanced $799/mo + $1,500 setup. Included modules are not separately charged.
- Created inactive product do_v9_minutes250_once with one-time $99 price price_1UXwdhGzho3dgSThTTRnXAaG. No recurrence, renewal or rollover. No payment link or credit activation.
- Archived six superseded v4/v6 and recurring-minute product listings. Default prices remain attached; do not use those legacy price IDs for new orders. Existing accepted orders were not altered.
- Existing billing portal active: invoices, contact/payment-method changes, end-of-period cancellation. Subscription upgrades remain disabled until their service entitlement flow exists.
- One live ephemeral tax calculation used the saved Iowa head-office address as a sample billing address and the current Basic monthly product: $299 + $20.93 tax (7%) = $319.93; taxability_reason standard_rated. This was a calculation, not a charge or tax transaction. It verifies current configuration execution, not legal product classification or every customer address.

## Unresolved account items

- Stripe business_profile.url contains a misspelled domain. Correct to https://www.deskoverflow.com in the Dashboard. Account-update operation is unavailable through this connector.
- Charges/payouts enabled, but currently_due and past_due requirements still include business website, company phone/owners-provided, owner identity/address/DOB and representative executive/title details. User must provide accurate private information through Stripe. Do not infer these or collect them on the public website.
- Current account default tax code is txcd_10000000 (generic electronic services); current products have no explicit tax code. Do not assume the generic default is appropriate. Candidate classifications retrieved from Stripe: txcd_10105002 cloud AIaaS business use; txcd_10103001 SaaS business use; txcd_20120002 mandatory SaaS implementation; txcd_20120001 optional SaaS implementation. Booster/telephone classification also needs review based on actual service delivery. Obtain owner's approval of the applicable product mapping before setting codes. Do not change codes merely to get a desired tax amount.
- No webhook endpoints exist. No hosted enrollment backend, payment reconciliation or service provisioning adapter is connected. Existing setup-only v5 payment link remains inactive. Do not publish it as current checkout.
- Tax threshold monitoring returned no locations, no unattributed locations and computed_at null. No freshness or nationwide obligation conclusion is available. Results only use information available to Stripe. Always review with a qualified tax professional before taking action.

## Next integration work

Deploy and configure the existing enrollment backend, owner-approved tax mapping, restricted credentials, signed webhook endpoint and tested fulfillment adapter. Validate sandbox payment success/failure/replay, exact order and bundle pricing, monthly Go-Live authorization, cancellation and refund/booster reconciliation before exposing payment. No server secrets belong in GitHub Pages. HighLevel subscription and actual service tests remain separate requirements.
