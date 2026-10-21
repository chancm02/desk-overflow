# Onboarding form, test calls and acceptance

## Native onboarding form specification
Create private HighLevel form; required business legal name, DBA, authorized signer, business contact email/phone, service address/area, timezone, office/holiday hours, website, services offered/excluded, approved FAQ answers with version/date/approver, exact price statements agent may use, escalation contacts and availability, callback target time, authorized transfer and fallback numbers, booking services/duration/buffers/lead-time, staff/calendar permissions and blackout rules. Phone and email ownership must be verified independently. Never collect passwords, API keys, card data or customer histories.
Required approvals: scope, AI introduction, recording/transcription choice and disclosure, retention/deletion policy, emergency wording, calendar authority, allowed minutes/spend, billing date, authorized forwarding change, fallback destination. Ask for current carrier/routing type without asking for carrier password. Use secure owner-led connection screens for calendar/payment access. Record missing responses as blocked; form submission is not acceptance or authorization to charge/activate.

## Dummy fixture
Business: Example Service Test; contact: Test Owner; email: owner@example.com; caller name: Synthetic Caller; phone placeholder: +1 202-555-0147. Reserved examples only, never dial or send. Use isolated empty calendar in America/Chicago, weekday 09:00–17:00, 30-minute appointments, 15-minute buffer and 24-hour lead time. FAQ: test service inspection, test service area only; quotes require human. Dummy calls require separately approved real test numbers; all simulated outcomes below remain NOT RUN until evidence is recorded.

## Acceptance matrix
Record case ID, date, environment/account, asset version, synthetic input, expected result, actual result, private evidence link, tester and pass/fail. Do not put recordings or personal data in GitHub.
| ID | Test | Expected |
|---|---|---|
| F1 | Required field, invalid email, permission unchecked | No submission; accessible validation |
| F2 | Valid inquiry, then duplicate submission | Stored contact + one open opportunity + assigned task; no duplicate billing |
| F3 | Alert delivery fails | Lead persists; visible failure/task + alternate review |
| F4 | Embed blocked / no JS / narrow mobile | Honest fallback; no false success |
| C1 | Approved FAQ and unknown question | Exact approved answer; unknown becomes callback |
| C2 | Name/number correction; noisy/silent call | Read-back and accurate record; bounded timeout |
| C3 | Caller requests human; unanswered transfer | One authorized transfer, timeout, fallback and task |
| C4 | Urgent danger / out-of-area / unsupported request | Approved limits/emergency wording; no dispatch promise |
| C5 | Caller prompt injection / asks for other customer data | No disclosure or instruction override |
| C6 | Successful booking; replay same request | One real test-calendar booking; timezone confirmed |
| C7 | Unavailable slot, concurrent booking, disconnected calendar | No false booking; callback task |
| C8 | After hours, holiday, DST, cancellation/reschedule | Correct local schedule and authority checks |
| C9 | Call summary fails / call drops | Failure visible; compare provider log; owner task |
| C10 | Max duration, transfer loop, 90/100% cap, low wallet | Bounded spend behavior and verified fallback |
| P1 | Test-mode setup invoice success / failure / partial / pending | Only settled correct $500 unlocks gate |
| P2 | Duplicate payment event / recurring success | One invoice per event; setup never repeated |
| P3 | Renewal failure / cancellation / refund | Assigned task, correct future schedule state; no surprise retry |
| G1 | Missing signature, acceptance, or activation approval | No forwarding or automatic charge |
| S1 | Customer A tries customer B records | Access denied; scoped roles |
| R1 | AI/provider unavailable, rollback routing | Original human/voicemail route receives approved test call |

P cases require sandbox evidence, C/R cases require approved accounts/numbers. Static website checks cannot prove them.

## Outage and escalation procedure
Before activation record primary owner, alternate contact, customer contact, alert channel, approved acknowledgement target and fallback number privately. Proposed targets (owner must approve): check urgent escalations within 30 minutes during agreed support hours; other tasks next business day. No continuous monitoring or uninterrupted service promise.
On suspected failure: log incident/time/account; check provider logs and test-approved route; alert owner and alternate; stop repeated failing actions; revert affected carrier forwarding to verified original human/voicemail destination using carrier-specific rollback; confirm with approved test call. Never route back into same AI number. Capture callback requests when available. If CRM itself is down, customer uses original phone/voicemail; owner keeps minimal encrypted incident notes and reconciles when restored. Communicate impact, next update time and resolution; perform root-cause review before re-enabling. Do not promise that carrier fallback is automatic unless tested.

## Acceptance record — owner/customer sign-off
Order/version: ___; account/agent/FAQ/calendar versions: ___; test evidence: ___; critical cases all passed: ___; open noncritical issues and accepted limits: ___; disclosure/retention/legal approvals: ___; allowance/fallback verified: ___; setup payment verified: ___; recurring start/date/authorization: ___; customer acceptance signer/date: ___; owner acceptance/date: ___; separate production/forwarding approval and change window: ___; rollback owner/steps: ___.
Any missing critical evidence = NO GO. After activation confirm a single approved real call and CRM outcome, then monitor daily for seven days. Acceptance does not assert legal compliance.
