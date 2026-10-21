# Customer and internal message templates

DRAFTS — bind native HighLevel merge fields and verify recipients before use. Bracket fields are editing placeholders, not API tokens. These texts do not send anything. No marketing SMS or automated outbound AI action belongs in these workflows. For early launch, human review is required before external contract, invoice, cancellation or incident messages.

## Inquiry receipt
Subject: We received your Desk Overflow inquiry

Hello [FIRST NAME],
We received your request for [BUSINESS]. We will review your inbound call needs and contact you by the phone or email you provided. Managed service is $499 per month plus a $500 one-time setup fee. We agree on scope, included minutes and any additional costs in writing before payment. Nothing has been purchased or activated. Texting and outbound promotional AI calls are excluded from launch.
[BUSINESS SIGNATURE]

Send only after a native HighLevel contact record and opportunity are confirmed. Until migration, the existing email-compose form must keep saying the visitor needs to press Send; do not display this receipt for it.

## Qualification questions
Subject: A few details for your call coverage plan

Hello [NAME],
Please confirm your business hours and timezone, services and service area, approximate missed/after-hours calls and typical call duration, existing carrier, current voicemail, and whether you need appointment booking or callback capture. Please share business information only; no customer records, payment details or passwords. We will confirm fit and a written scope before asking you to sign or pay.
[SIGNATURE]

## Proposal ready
Subject: Review your Desk Overflow service plan

Hello [NAME],
Your proposed scope and agreement are available here: [VERIFIED SECURE DOCUMENT LINK]. The order lists $500 setup, $499 monthly, [APPROVED MINUTE ALLOWANCE], exclusions, fallback, support and billing dates. Please review all documents and ask about anything unclear. Signature does not turn on forwarding or begin recurring billing. Configuration and testing follow the agreed setup payment; live activation requires separate acceptance and approval.
[SIGNATURE]

## Setup invoice ready
Subject: Your Desk Overflow setup invoice

Hello [NAME],
Following the signed order [ID VERSION], your one-time $500 setup invoice [PLUS APPROVED DISCLOSED TAX] is available at [VERIFIED GATEWAY LINK]. Enter payment information only on that secure payment page. This is the setup charge only. Monthly service starts on the separately approved activation date, and automatic recurring payment requires its own authorization. Contact us through [VERIFIED BUSINESS CONTACT] if anything differs from the signed scope.
[SIGNATURE]

## Onboarding invitation
Subject: Your Desk Overflow onboarding details

Hello [NAME],
Please complete [VERIFIED PRIVATE ONBOARDING FORM LINK] with your approved business answers, hours, service area, booking rules, escalation contacts and fallback. Do not enter passwords or payment-card details. We will arrange secure calendar authorization separately, configure your flow and schedule test calls before requesting live activation approval.
[SIGNATURE]

## Test and acceptance invitation
Subject: Review your call tests before activation

Hello [NAME],
Your test session is [DATE TIME TIMEZONE]. We will check routine questions, unknown answers, lead accuracy, calendar conflicts, human transfers, fallback and cost limits using approved test data and numbers. You will receive results and known limitations for review. We will not change live forwarding until critical tests pass and you and Desk Overflow separately approve the routing change and billing start.
[SIGNATURE]

## Usage approaching allowance
Subject: Review needed for [BUSINESS] call allowance

Hello [NAME],
As of [TIME TIMEZONE], usage for [PERIOD] is [MINUTES] of [ALLOWANCE]. [AI SPEND] is measured separately from telephone charges. At the agreed threshold, the approved fallback is [DESTINATION DESCRIPTION]. No automatic overage charge is authorized. Please review the secure usage record [LINK] with us if you want to request a written scope change. No change takes effect merely by replying with a question.
[SIGNATURE]

## Payment needs attention
Subject: Your Desk Overflow invoice needs attention

Hello [NAME],
Invoice [ID] for [AMOUNT CURRENCY] dated [DATE] shows [FAILED OR PENDING STATUS]. Please review it through [VERIFIED SECURE LINK]. Do not send card information in a reply. [DISCLOSED RETRY OR NO RETRY DETAILS]. We will contact you about next steps under the agreed grace and service terms; this notice does not change your scope or authorize another charge.
[SIGNATURE]

## Incident notice and update
Subject: Call service issue for [BUSINESS]

At [TIME TIMEZONE], we identified [CONFIRMED IMPACT]. Current call handling is [VERIFIED CURRENT ROUTE OR UNKNOWN]. We have [ACTUAL MITIGATION] and are investigating [KNOWN ISSUE]. Please use [APPROVED ORIGINAL BUSINESS NUMBER OR CALLBACK PROCESS] as applicable. Next update by [TIME WITHIN ACTUAL SUPPORT COVERAGE]. We will confirm recovery after a successful approved test. This message does not assert that every call or record was preserved.
[SIGNATURE]

## Cancellation confirmation
Subject: Desk Overflow cancellation confirmation

Hello [NAME],
We received your request on [DATE]. Service ends [DATE TIME TIMEZONE]. Future recurring schedule status is [VERIFIED CANCELLED/STOPPED STATUS]; final invoice or refund details are [ACTUAL DETAILS]. The routing rollback will be [APPROVED CHANGE AND OPERATOR], confirmed by [TEST]. Data export is available through [SECURE PROCESS] until [APPROVED DATE], with deletion handled under the agreed retention policy and lawful exceptions. Please report any discrepancy to [BUSINESS CONTACT].
[SIGNATURE]

## Internal alert templates
Inquiry: New inquiry [RECORD LINK], assigned [OWNER], review due [NEXT BUSINESS DAY].
Callback: [RECORD LINK], outcome [TYPE], due [TIMEZONE TIME], assigned [STAFF]. No call content in email subject.
Exception: [WORKFLOW/INVOICE/CALL ID], [FAILURE TYPE], record [LINK], owner [NAME], action [REVIEW], due [TIME]. Retry only after checking existing completed action.
Approval: Order [VERSION], missing gates [LIST], NO ACTIVATION until resolved. Payments and forwarding require their own approval records.
