# Unified enrollment API — prepared, NOT deployed or approved for charging

The public GitHub Pages site now uses one five-step wizard. Its current `apiBase` is null, so it saves one complete configuration through the existing verified Apps Script endpoint and collects NO payment. It does not fake email verification, contract execution, account provisioning or live activation. The old separate onboarding/approval URLs point customers to the unified flow.

## What the staged backend implements
- Server-owned catalog and setup/monthly totals; client prices are ignored, unknown add-ons rejected.
- Encrypted SQLite order bodies using a separately held Fernet key. Token/OTP values are hashed, tokens expire after an hour, codes after 10 minutes with five attempts, request rate limiting is persistent. No PII is written into the repository or logs.
- Email code delivery over authenticated TLS SMTP; failed delivery is not claimed as success.
- Immutable server-generated order, data-schedule snapshot and exact v9 terms hashes. The customer must review and separately accept this exact hash before checkout. Changing details requires a new order/verification; no stale price acceptance is reused.
- Stripe-hosted Checkout: payment mode for the selected tier’s managed implementation and extra setup charges. All current v8 plans have a setup fee. Saving a method requires the separate explicit authorization shown in the verified-order step. No first-month charge, arbitrary trial or recurring subscription is created by this implementation.
- StripeClient integration, server checks for merchant readiness, active registrations, live immutable prices and explicit product classification. No tax registration or tax code is guessed.
- Signature-verified Stripe events, authoritative Checkout retrieval, correct subtotal/currency/mode checks, no fulfillment on unpaid asynchronous sessions, verified SetupIntent success for zero-setup orders, event deduplication, durable queue, and risk holds that late success cannot clear. Billing/subscription and risk events each enqueue their own reconciliation job.
- Worker delivery to an operator-configured HTTPS provisioning adapter, signed with timestamp/HMAC and stable Idempotency-Key. Ambiguous timeouts stop for reconciliation instead of blindly creating a second account. Delivery acceptance is not represented as completed provisioning.

## What is still missing before an automated production launch
1. Deploy this WSGI service and worker to approved TLS hosting with persistent private storage, backups, secret management and a validated retention/deletion job. No new hosting subscription was bought. `requirements.txt` dependencies and actual Stripe SDK API calls need installation/integration testing on the chosen host; unit tests here use injected test doubles.
2. Supply secrets securely on that host: restricted Stripe key, Stripe endpoint signing secret, encryption key and SMTP credentials. Never put keys into `assets/enrollment-config.js` or the public repo. Configure authenticated mail delivery/sender domain and abuse limits at the edge. CORS allows only https://www.deskoverflow.com; it is not authentication.
3. Complete merchant identity, approved tax classifications/registrations and supported selling-state review. Validate customer/service location tax sourcing. `SELLING_STATES` is an explicit operator-reviewed allowlist, not an automatic tax/nexus determination.
4. Approve the exact automated contract/standing-offer acceptance mechanism and completed actual provider data schedule. Current v9 terms require customer-specific acceptance; merely setting CONTRACT_OFFER_APPROVED does not revise them or establish legal compliance. Publish a matching new immutable contract version before enabling automatic acceptance. The current backend is an implementation draft, not an assertion that v9 contracts are automatically executed.
5. Implement and deploy the real provisioning adapter (currently absent), verify HighLevel account/API access, approved snapshot, user isolation/invitation, paid-setup task routing, conditional integrations and all provider states. Native HighLevel Create Location API currently documents Agency Pro ($497/month); do not start/upgrade a paid plan without an explicit cost decision. OAuth/PIT/API credentials must be scoped and stored server-side, not pasted into chat or front-end code.
6. The adapter must verify HMAC/timestamp, deduplicate Idempotency-Key durably, create exactly one location/user, apply only purchased features, deliver safe invitations, and expose authoritative progress. Reconcile signed jobs after crashes/timeouts; no double provisioning. Subscriptions/payment failures/refunds/disputes must update the real account according to accepted policy. Secure customer access and authorization must be tested with two independent customers.
7. Implement customer email-authenticated status/resume, service-account access, phone-control verification, actual settings/notice checks, synthetic call/booking/fallback tests and authenticated Go-Live approval. Those provider-specific features are NOT implemented by this backend. A separate Go-Live billing operation must create the approved monthly subscription after the real tests and approval, handle payment authentication and lifecycle events, and enforce the accepted no-overage fallback. Do not trigger it from a return URL or a frontend checkbox.
8. Register required Stripe webhook events and test real sandbox flows: checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed, customer.subscription.created/updated/deleted, invoice.paid, invoice.payment_failed, customer.updated, charge.refunded, charge.dispute.created, radar.early_fraud_warning.created. Verify retries, cancellation, tax reasons, setup failure, provisioning failure, wrong-customer isolation, account invitations and no early renewal. The current handler resolves each customer through Stripe resource IDs and its private mapping.
9. Run a full release test, then set server flags only for actually completed requirements, configure the HTTPS API origin in `assets/enrollment-config.js`, and publish that small frontend change. Until then, public charging remains off.

## Running after configuration
Use Python 3.11+ with an isolated environment and the requirements. From repository root:
`gunicorn backend.enrollment.app:application --bind 0.0.0.0:$PORT --workers 2 --timeout 60`
Run a separate worker process: `python -m backend.enrollment.worker`.
Use the persistent private path specified by ENROLLMENT_DB, outside the public checkout. Back up the encryption key separately; losing it makes records unreadable. Restrict DB directory access. Monitor stale delivering/needs_reconciliation jobs and failed emails without logging PII or tokens. Queue reconciliation is an exceptional failure path, not ordinary onboarding labor.

## References verified during implementation
- https://docs.stripe.com/payments/checkout
- https://docs.stripe.com/payments/save-and-reuse
- https://docs.stripe.com/billing/subscriptions/webhooks
- https://marketplace.gohighlevel.com/docs/ghl/locations/create-location/
- https://marketplace.gohighlevel.com/docs/ghl/users/create-user/

## Deployment preparation update — November 3, 2026

- Added `Dockerfile` (build from repository root with `-f backend/enrollment/Dockerfile`) and `serve.py` to supervise API and worker in one persistent-volume service. Mount private storage at `/data` with write access for UID 10001; set ENROLLMENT_DB=/data/enrollment.sqlite3. Keep one replica because SQLite and its worker share that volume. Store the approved data schedule outside the public checkout, e.g. /data/approved-data-schedule.json. Back up the DB and encryption key separately.
- `/healthz` checks process health only. `/v1/readiness` remains false unless all sales release gates and Stripe checks pass. A healthcheck is not evidence of working payment or provisioning.
- Signed webhook processing and queued reconciliation remain available when ENROLLMENT_ENABLED or other new-sale flags are disabled, provided runtime credentials/configuration remain intact. Do not remove runtime secrets to pause sales.
- Stripe Python 16 SDK event/session resources are converted through `to_dict()` before domain code uses dictionary methods. Signed webhook regression tests run with the real SDK and reject invalid signatures. No live payment or provisioning end-to-end test has passed yet.
- Railway account access was checked. Its trial has expired and project creation was refused pending plan selection; no new project/service/volume or paid subscription was created. The old Revenue Foundry project has unrelated staged deletion changes and was left untouched.
- Stripe restricted key, SMTP credentials, approved tax mapping/data schedule and actual HighLevel provider adapter are still absent. Do not paste secrets into chat. Enter them through the selected host’s encrypted environment-variable controls after approving hosting.
- Test with dependencies installed: `python -m unittest discover -s tests -p 'test_*.py'`. Tests now include real Stripe signature validation; the SDK is a declared required dependency, not an optional test double.
