# Desk Overflow — paid customer activation runbook (2026-10-30)

**Status: preparation, not live payments.** No Stripe account or e-signature provider has been connected. Never put API keys, client details, signed agreements, customer payment records or banking information in this public repository.

## Hard gates before payment link is sent
1. Verify customer legal name, business state(s), business use case, and authorized signer.
2. Check the account against restricted industries and complete jurisdiction-specific service/tax review in the private 50-state tracker. Record evidence, review date, and reviewer. Do not infer state tax from a zip code or sales threshold alone.
3. Produce customized MSA v2, DPA v2, Service Order v3, recurring-payment authorization v3. Include signed plan, one-time setup charge, included voice minutes, overage cap, requested add-ons, and the statement that SMS is disabled until approved.
4. Obtain actual e-signatures with date, signer identity, audit trail and copies securely archived. Emailing blank documents is not proof of acceptance.
5. Confirm verified invoicing entity and payment processor business account. Publish accurate business contact details and privacy terms.

## Pricing currently proposed for review
- Essential $349 monthly + $399 setup (250 voice minutes)
- Growth $599 monthly + $599 setup (750 voice minutes)
- Premium $899 monthly + $999 setup (1,500 voice minutes)
- Overage proposal $0.10/minute ONLY with written cap and after metering is verified. Without authorization, notify and agree on adjustments rather than silently charging or disconnecting calls.

## Recommended payment sequence — crucial to MSA consistency
1. Create *draft* Stripe products/prices for each plan: recurring monthly price and separate one-time setup charge. Do not publish a self-service checkout from the website.
2. After signed approval, verify customer-specific tax treatment (including setup fees and add-ons) and collect upfront setup + first service month through a documented secure processor checkout or invoice.
3. **Do not let the processor auto-renew before Go-Live.** A normal subscription created at initial checkout may renew one month later even if implementation is delayed. Instead configure a documented service start/renewal schedule after written Go-Live approval, with care to prevent charging the prepaid first month twice. Verify functionality of chosen Stripe product/API and communicate any schedule changes to customer.
4. Follow MSA v2 cancellation: cancel any time, service remains through current paid term, no surprise extra renewal. Set the processor to cancel at period end where appropriate.
5. Set payment receipt, renewal, failed-payment reminders, tax lines and refund rules consistent with signed agreements. Do not store raw card numbers; processor-hosted checkout only.
6. Reconcile gross billed, tax collected, fees, refunds, net deposit, taxable sales by state and invoice status each month in private ledger. Sales tax is a liability, not revenue.

## Implementation flow
Inquiry saved -> verify fit/state/tax -> proposal + order -> signed MSA/DPA/payment authorization -> setup fee and prepaid first month -> configuration approval -> AI/phone test -> separate signed Go-Live -> service dates and recurring billing -> monthly reconciliation.

## Test checklist
- Correct plan and setup fee; tax calculation approved for location and line items.
- Failed/declined payments don't activate service.
- No duplicate invoice or recurring charge.
- First recurring renewal scheduled for one month after actual Go-Live.
- Customer cancellation effective end of current paid period; no extra renewal.
- No charge for unapproved overages.
- Invoice and receipt separate tax from revenue.
- Signed documents securely available to owner and client.
- HighLevel/A2P features remain disabled until verified.
- Synthetic end-to-end tests with test mode; no live charging without approval.

## Unresolved owner decisions
- Verified legal payee name, business email, statement descriptor and contact details.
- Stripe account connection and payment processor eligibility.
- Electronic signature approach (secure processor workflow or signing provider).
- States and services initially accepted, tax reviews, exact billing timing.
- Insurance deferral acknowledgment and company risk acceptance.

**Do not publish payment links or mark checkout active until all hard gates pass.**
