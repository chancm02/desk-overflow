# Archived intake experiments — do not deploy

The active landing page prepares an email; it does not POST to Apps Script.
Code.gs, TALLY_FREE_FORM.md, SELF_HOSTED_PRODUCTION.md and local-test.html are historical experiments, not the launch architecture. Their deployment instructions are superseded by ../docs/launch/highlevel-build.md. No endpoint, private sheet, email alert or tunnel has been verified in this audit.

HighLevel is the planned system of record. Do not deploy these alternatives or operate parallel lead stores. Once HighLevel intake passes acceptance, disable any existing experimental public endpoints in their owner accounts and remove test data under the approved retention policy. Repository changes alone cannot revoke external deployments.
