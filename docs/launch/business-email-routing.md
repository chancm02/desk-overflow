# Desk Overflow business email notification routing

Updated November 3, 2026.

## Recipient desired
`desktopoverflow@gmail.com`

The website's fallback `mailto:` and Gmail-compose links have been changed to this business address. The actual Google Apps Script service stores the alert recipient in the private **Script Property** `NOTIFY_EMAIL`, not in publicly hosted website code. GitHub changes do not change this private property.

## Owner action in Google Apps Script
1. Open the **Google Apps Script project** that powers the Desk Overflow Website inquiries Google Sheet.
2. Select **Project Settings** (gear icon).
3. Scroll to **Script Properties**.
4. Edit or create the property named **`NOTIFY_EMAIL`** (match uppercase exactly).
5. Set its value to **`desktopoverflow@gmail.com`**, and save.

Changing an existing Script Property does not usually require a new deployment; the currently running app reads it on each submission with `PropertiesService.getScriptProperties()`. Do not publish the private Sheet ID or its credentials.

The current notification is intentionally privacy-preserving: subject `Desk Overflow: new website inquiry`, body with private spreadsheet link and submission reference, **not** the lead's personal information. Make sure the business Gmail account has permission to open the private Google Sheet, or the notification link won't be useful.

## Verify in production
- Use a private browser window and submit one synthetic chat inquiry or Contact form inquiry with a unique test reference.
- Inspect the private **Website inquiries** sheet for a saved row, matching reference, source, and **Alert status = Sent**.
- Confirm the notification arrived at `desktopoverflow@gmail.com` (also check Spam).
- Confirm no new notification was routed to the old personal inbox.
- If the sheet row is saved but the notification was not received, inspect Apps Script execution logs and mail quota, then check Script Properties.
- Do not claim alerts are confirmed until this end-to-end test passes.

## Operational notes
- Online web inquiries are collected and stored by the Apps Script deployment. If that backend fails, the manual email fallback provides a way to contact the owner but requires the visitor to send the prepared email.
- The site's chat widget is a guided lead form, not a live human or AI conversation.
- Review the private Google Sheet daily as a backup in case Gmail alerts are delayed or quota exhausted.
