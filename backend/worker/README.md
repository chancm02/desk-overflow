# Free hosted checkout backend (prepared, not deployed)

This replaces the paid always-on Python host for the payment API. Keep the public site on GitHub Pages. Use Cloudflare Workers Free plus D1 Free for encrypted order storage, Web Crypto signature verification and durable payment-event/job records. No PC, tunnel, paid Railway plan or Google Docs storage is required. The Python backend remains a reference/alternative, not another live order writer.

## Current status

- Source implements the existing /v1/enrollments, /v1/verify, /v1/checkout and /v1/readiness frontend contract; apiBase remains null until the hosted integration passes testing.
- All 96 package/add-on combinations are checked against the approved catalog. Hashes point to immutable v9 terms. Customer-specific agreement mechanism, actual provider data schedule and product tax mapping still require approval.
- AES-GCM encrypted customer/order body. Random session token, HMAC-protected short-lived email code, five attempts, hashed IP rate buckets, no browser PII storage. Payment routes require exact order acceptance after email verification. No automatic monthly subscription is created by setup payment.
- Stripe REST calls use restricted server credentials, fixed Stripe origin/version, server-owned prices, active product/tax-code checks, separate setup versus recurring intervals, idempotency keys and dynamic payment methods. Raw-body Stripe webhook signature verified with five-minute tolerance; paid session is retrieved independently; amount/currency/customer/order mapping checked. Replay handling and job writes are transactional. Refund/risk holds cannot be cleared by a late paid event.
- Durable outbox delivery signs the body/timestamp/idempotency key. Ambiguous delivery goes to needs_reconciliation. An adapter acknowledgment is not completed service setup. The real HighLevel adapter, private customer access, usage monitoring and Go-Live monthly billing remain unconnected.
- Optional Google Apps Script mail bridge is supplied separately (google-mail-bridge.gs). It only sends verification emails; it is not the Stripe webhook endpoint, payment database, or existing inquiry backend. Shared HMAC signature, timestamp, recipient validation and remaining MailApp quota checks precede sending. Provider acceptance is not a guarantee of inbox delivery. No test email was sent to a real recipient.

## Deployment after account access

1. Sign in/create a free Cloudflare account. Do not enable a paid Workers plan or paid add-ons. A separate workers.dev API domain is enough; the website/domain need not move.
2. Authenticate the official Wrangler CLI to that account. Create a D1 database named desk-overflow-enrollment. Put the returned ID in wrangler.jsonc; the placeholder is intentionally not deployable production configuration. Apply schema.sql with `wrangler d1 execute desk-overflow-enrollment --remote --file schema.sql` from this directory. This creates schema only; do not replace an existing customer database.
3. Create a **separate** Apps Script mail project owned by the business email. Paste google-mail-bridge.gs, set MAIL_SECRET in Script Properties, authorize MailApp sending, and deploy the web app executing as owner with public access. Its signed requests protect it. Do not overwrite or redeploy the verified inquiry endpoint. Account owner must approve Google permissions/terms.
4. Add runtime secrets with the host's secret controls, never public source: STRIPE_RESTRICTED_KEY, STRIPE_WEBHOOK_SECRET, ENROLLMENT_ENCRYPTION_KEY (random 32-byte AES key, base64), MAIL_ENDPOINT, MAIL_SECRET, DATA_SCHEDULE_JSON, PROVISIONING_ENDPOINT, PROVISIONING_SECRET, SELLING_STATES. Safely back up the encryption key; no platform can recover encrypted records without it. The Stripe connector does not expose a reusable server key.
5. Deploy disabled, verify /healthz and ready:false, register the real HTTPS /v1/stripe-webhook endpoint in Stripe and store its signing secret. Existing Stripe registrations remain untouched. Real sandbox and production accounts require separate secrets/databases/configurations; never simulate purchases in live mode.
6. Configure the same required webhook events as the Python backend README. Set a one-minute Worker cron for the outbox **only after** the actual HMAC/idempotent HighLevel adapter is ready and authorized. No cron is enabled by default. Preserve credentials and DB when pausing new sales so existing payment events still reconcile.
7. Test the real deployed end-to-end flow, quotas/CPU, transactional mail, exact bundle amounts, checkout failure/retry, asynchronous payments, duplicate and out-of-order events, refund/cancellation reconciliation, data isolation and retention, provider failures, actual invitation and tested service. Implement approved retention/deletion and recovery monitoring before launch; none is silently enabled in this source. Apply approved tax codes to actual Stripe products before accepting payment.
8. Only then set the release flags to 1 and publish the verified API URL in assets/enrollment-config.js. Until then the existing working inquiry flow remains the customer path.

## Free-tier limits and verification scope

Cloudflare Workers Free: currently 100,000 requests/day, 10ms CPU/request; D1 and Google mail have their own quotas. Free-tier limits may interrupt signup/processing; monitor quota failures and retry Stripe deliveries safely after recovery. No paid fallback or auto-upgrade is authorized. Keep queries indexed, rate-limit abuse at the platform edge, validate CPU on actual Workers, and preserve backups. Do not promise unlimited traffic, zero interruptions or free HighLevel/Stripe processing.

Tests use Node 24 node:sqlite to exercise real SQL transactions plus mocked Stripe/mail/provider HTTP. This is not proof of a live Cloudflare account, D1 deployment, delivered customer mail, live payment or provisioned service.

Run from repo root: `node --test tests/worker.test.mjs tests/worker-mail.test.mjs`.

Official references: https://developers.cloudflare.com/workers/platform/pricing/ ; https://developers.cloudflare.com/d1/reference/faq/ ; https://developers.google.com/apps-script/guides/services/quotas ; https://docs.stripe.com/webhooks .

Wrangler 4.157.0 dry-run successfully bundled this Worker (about 25 KiB source upload). Dry-run performs no account login, DB provisioning or deployment and does not establish that free-tier CPU limits will be met. The account browser is at Cloudflare sign-in; owner authentication/signup is required before deployment.
