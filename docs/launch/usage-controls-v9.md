# Usage controls — v9

Published: current-period booster terms ($99 once/250 minutes), separate recurring upgrades, no automatic paid overages, honest disconnected usage view. Removed legacy recurring minutes250 from new enrollment on both browser and server. Historical Stripe prices and signed orders remain unchanged.

Advanced remains 500 AI-connected minutes and 250 website-chat replies. Unlimited AI is explained, not sold as activated: provider subscription, eligible scope, fair use and telephone costs must be confirmed before changing its offer. Base package prices remain unchanged.

## Required external work before activation

- Owner must obtain the chosen HighLevel agency subscription and eligible per-location AI subscription. No subscription purchased here.
- Configure private customer access, delegated billing permissions and source usage reporting. Agency AI dashboard access is not a customer portal.
- Connect authenticated usage ingestion and durable notifications to both customer and Desk Overflow at 70/80/90/100%. Native AI dollar limits do not replace retail minute allowances; reconcile calendar months versus anniversary periods and delayed records.
- `backend/enrollment/usage.py` is a tested, source-only calculation. It deduplicates completed calls and paid credits, uses explicit periods and rejects conflicting records. Its aggregate seconds rounded up to minutes is only a proposed meter; signed order must match real provider rounding, exclusions, transfers and timestamps. It sends no alerts, charges or routing commands. Durable alert deduplication, worker retries, protected status API and reconciliation are still required.
- Create a distinct one-time Stripe booster price; no recurring component. Not created in this change. Never reuse legacy recurring price_1UXqnvGzho3dgSTh3pjXQhwq for a one-time booster. Verify signed webhook, paid amount, customer and period; credit each payment once, reconcile refunds. No public booster checkout until this works end to end.
- Default extra spending requires approval. Future optional top-ups need separate revocable consent, amount and monthly ceiling, tested concurrency handling and no inferred authority from a configuration form.
- Test fallback at limit and provider outages on the actual number. Never promise an instantaneous hard cap from delayed usage data.
- Existing Stripe identity/tax and enrollment backend release gates remain. Checkout remains disabled.

Frozen v9 documents are new-order proposals. Prior v6/v8 snapshots and accepted orders are unchanged.
