# Customer journey v6 — implementation and operator handoff

## Published commercial model for new v6 orders
- Basic guided self-setup: USD499/month at approved Go-Live, no base implementation fee, one location, one English inbound flow, 250 AI-connected minutes per monthly service period.
- Optional done-for-you base setup: USD500 once; one location/agent, approved FAQs, one forwarding/fallback flow, email notices, acceptance tests, one consolidated revision round.
- Fixed add-on monthly AND configuration fees remain separately chargeable as displayed. Self-setup waives ONLY the base implementation fee. No automatic paid overages or new trial-end charge.
- Self-setup includes guide/templates, access/platform-fault support and one launch checklist review. Custom implementation/training is separately scoped. Support review hours M–F 6–9 p.m. Central excluding holidays; initial reply target two business days, not guaranteed resolution. Amend this published scope if operational capacity differs.
- Existing signed orders and existing Stripe products/subscriptions are not migrated or amended.

## Working public surfaces
/signup/ handles base setup choice, add-ons and an itemized proposed total.
/customer/ links to Stripe-hosted email-verified billing, setup and support.
/setup/guide/ stores only known checklist flags on the device; no identity, PII, contract execution or service state is inferred from them.
/onboarding/ collects operating details. /onboarding/data/ collects proposed data preferences.
/onboarding/approvals/ records final-order assent references, routing authorization and Go-Live review separately. The full declaration, submitted document references, version and UTC time are included in the private inquiry message; records exceeding 2000 characters are blocked rather than silently truncated. Contact identity is stored in existing contact fields.
/support/ and /offboarding/ submit requests through the existing verified Google Apps Script/Sheet intake. Billing cancellation can use the Stripe portal OR email without an exit questionnaire.
/customer/usage/ states the actual lack of a connected usage feed. /demo/ is a labeled illustrative walkthrough, not a live synthetic voice test.

## Required operator sequence for customer one
1. Review inquiry and verify authorized business contact using an independently known business channel. Form receipt alone is not identity verification.
2. Confirm carrier, phone ownership, supported integrations, location and expected usage. Exclude regulated workflows from standard scope.
3. Prepare the customer-specific Order using the HTML worksheet and complete the real Data Schedule with actual vendors/locations, retention by type, notices, settings and recipients. Resolve recording/transcription/AI notice and refusal handling for actual jurisdictions.
4. Send the exact final Order, versioned agreement and data schedule to both parties for acceptance. Retain full copies and proof; a public form stores references, not the full contract. Check the returned assent reference and authority, then record provider acceptance. Do not describe the website as a dedicated e-signature platform.
5. Resolve Stripe Tax registrations/effective dates and legally correct product tax classifications. Account Tax registrations were empty and identity live capture due when rechecked. No registration or tax category has been guessed or changed.
6. Invoice only agreed setup items, if any, after acceptance/feasibility. A base-only self-setup request has no setup invoice. Never reuse inactive v5 setup checkout for a new self-setup order. No live customer was created or charged in this implementation.
7. Provision one isolated HighLevel location and named restricted user. Invite customer; test MFA/access isolation. HighLevel is not connected/provisioned by this static site. Do not give agency-admin access or expose credentials in website config.
8. Apply approved template, confirm actual privacy settings and recipients; configure only purchased features. Inspect processor contracts, DPA/subprocessor chain and any necessary BAA before allowing special data. Standard service excludes those workflows.
9. Test the agent using synthetic scenarios: known/unknown question, unavailable booking, timezones, closed hours, notice refusal, urgent request, transfer failure, notification delivery, routing rollback and safe output. Live AI demo requires this service account and telephone provider; the website walkthrough is not that test.
10. Validate actual metering, service-period boundaries, alerts and a no-overage fallback. The website does not enforce a telephony cap. If the platform cannot support the offered limits/fallback, resolve pricing/scope with customer before activation.
11. Verify written number authorization, approved change window and rollback. A website submission cannot change carrier routing.
12. Verify Go-Live approval and recurring-payment authorization separately. Create only the approved monthly subscription/items at confirmed Go-Live. No arbitrary free trial auto-converts.
13. Record activation and billing IDs privately. For an automated provisioning integration, a secured server must verify signed Stripe webhooks, deduplicate events and handle successful/async payments, subscription changes, invoice success/failure, refunds, disputes and fraud signals. No webhook/server/provisioning service was deployed here.
14. Monitor initial calls/notifications, send period statements from actual platform data and resolve support requests within published capacity.
15. Cancellation: honor portal/email request without forcing an exit questionnaire; reconcile renewal and service end. Verify any data export/deletion, forwarding rollback, number transfer and access removal; confirm completion and lawful retention exceptions. Never disclose/export/delete on a public-form claim alone.

## External configuration still needed
- Owner: Stripe identity live capture. Confirm existing applicable tax registration effective dates and product tax classifications, record registrations, then run sandbox tax/checkout/reconciliation before public charging.
- Service platform: existing or newly chosen HighLevel subscription/account connection, appropriate features/permissions, carrier/AI provisioning and approved costs. No paid trial/subscription was purchased.
- Live service: genuine demo number/agent, customer-specific login invitations, actual usage source/cap verification, actual vendor/retention schedule, secure full-document acceptance and retained copies.
- The Stripe-hosted billing login is live. It is not a service-account login, and customer identity/billing changes do not update service recipients. No paid subscription was created to test it.

## Legacy materials
Prior v4/v5 ZIPs, videos and worksheets describing mandatory USD500 base setup are historical; do not advertise them as current v6 pricing. Public site pages and v6 worksheet control new proposed offers, subject to the accepted customer Order. Use the new v6 Stripe products for new orders; no legacy live Payment Link is activated.
