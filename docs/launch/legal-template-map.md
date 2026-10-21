# Legal template preparation — NOT FOR CUSTOMER USE

The owner confirmed no retained customer legal drafts exist and requested new ones. [customer-agreement-packet.md](customer-agreement-packet.md) is the new editable source: service agreement, service order, data and call handling addendum, recurring payment authorization, and acceptance/forwarding approval. [legal-review-brief.md](legal-review-brief.md) records sources and unresolved questions. These drafts require owner and professional review before use. Keep populated customer documents and signatures out of this public repository.

## HighLevel template assembly map
Create draft-only templates named `DO MSA — LEGAL REVIEW REQUIRED`, `DO Service Order v1 — LEGAL REVIEW REQUIRED`, `DO Data & Call Handling Addendum — LEGAL REVIEW REQUIRED`, `DO Recurring Authorization v1`, and `DO Acceptance v1`. Use the new packet as source; preserve section numbering and record the approved version and review date privately. Exclude the internal owner/counsel decision record from customer execution copies. Do not enable Send, Direct Payment, Auto-Payment or automatic invoice generation during assembly. Native merge-field selectors must be used and previewed; bracket placeholders are editing instructions, not verified HighLevel token syntax.

| Template | Fields / source mapping |
|---|---|
| MSA | [provider legal name/DBA/address], [customer legal name/address], [effective date], source agreement clauses, customer/provider signer name/title/signature/date |
| Service order | MSA reference/version, inbound-only scope, $500 setup, $499/month, [approved included minutes], [usage definition], [overage policy], [billing start], [renewal/cancellation], exclusions, customer responsibilities, support hours, fallback, approval limits |
| Data/call addendum | approved processors, AI/recording/transcription disclosure, jurisdiction review, access/security, retention/deletion periods, incident notice and cooperation, authorized calendar/contact access |
| Acceptance | fields and sign-off in onboarding-acceptance.md, test report version, forwarding change approval, rollback contact, known limits |

## Questions requiring owner and professional review
- Correct contracting legal entity and evidence for website registered-trade-name claim; Iowa business/tax obligations and service taxability.
- Caller location, AI disclosure and call recording/transcription consent across state lines; whether to disable recording/transcription and whether platform permits that while retaining necessary summaries.
- Privacy policy accuracy, processor terms, customer/controller roles, security obligations, retention/deletion duration, export, breaches and sensitive-data restrictions. Exclude healthcare/payment-sensitive use until separately reviewed.
- Scope/limitations, no emergency dispatch, no guaranteed availability/revenue/bookings, third-party outages, support hours and fallback responsibility.
- Recurring authorization, billing start, cancellation, refunds, proration, renewal, usage cap/overage approval, suspension notice, liability/indemnity, dispute resolution and signature enforceability.

Owner approval is required before customer use; professional review remains necessary to resolve legal uncertainty. A signature or technical test cannot establish legal compliance. Preview all populated documents with dummy data; missing values, wrong signer, stale fees or unresolved clauses block sending. Match signed version to stored order before payment.
