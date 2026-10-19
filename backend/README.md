# Desk Overflow lead collection — private Google Sheets + Apps Script

## Why this exists

GitHub Pages is static and cannot securely accept form data on its own.
The previous FormSubmit.co integration led to blank third-party pages and
never sent the owner an activation email. Do not advertise a broken form.

This replacement uses a **Google Sheet in the business owner's own Google
account** for persistent lead records, with optional email alerts through
Google Apps Script. There are no per-submission vendor fees under ordinary
Google personal-account Apps Script usage, but **Google quotas still apply**.
The script is deployed with the owner's authorization, *not* exposed in GitHub
as an API key.

## Already created

In the connected Google Drive account:

**Desk Overflow — Website Lead Inbox** (private)

[Open the private sheet in your Google Drive account; URL intentionally omitted from this public repo]

Its \`Leads\` tab has timestamp, contact, business, inquiry, consent and status
columns. It is NOT shared publicly.

## Deployment status

The owner supplied a deployed Apps Script web app URL and the website is now configured to submit natively to that /exec endpoint. Deployment cannot be validated by repository inspection alone. Run a real live submission, confirm the branded response, verify a new private Sheet row and email notification. If the handler errors, verify `Code.gs` matches this repository and redeploy a new version.

## One-time owner deployment

1. Open the private Google Sheet above.
2. Choose **Extensions → Apps Script**.
3. Open \`Code.gs\`, replace its contents with the **entire** \`Code.gs\`
   file beside this README, and save.
4. Select **Deploy → New deployment → Web app** (gear icon).
5. **Execute as:** \`Me\`. **Who has access:** \`Anyone\` (not "Only myself").
   The app is public to submit leads, but the underlying Sheet remains private.
6. Click Deploy and approve access to Google Sheets and MailApp for this project.
   Google may show an unverified script warning for your own code; inspect
   the scopes and continue only if you recognize this project and code.
7. Copy the URL ending in \`/exec\`. Never share Apps Script OAuth tokens.
8. Use the deployed /exec URL as the website's HTML form action (already configured for the current deployment).
9. Submit a test inquiry **from the public website**. Verify one new row in
   the private Sheet and an email alert in the owner's inbox. Do not consider
   customer lead capture live until both have been checked.
10. If you later edit Code.gs, use **Deploy → Manage deployments → Edit →
    New version → Deploy**. Editing the code alone does NOT update live
    /exec deployments.

## Website integration

Once deployed, replace the form's \`action\` in \`index.html\` with the
Google Apps Script /exec URL. Remove the temporary email-compose fallback
handler from \`assets/site.js\`. Keep all the existing named inputs and the
required \`permission_to_respond\` checkbox. It uses a normal HTML POST
to avoid CORS and blank AJAX pages. The script provides a branded confirmation
or an honest error, never a false "sent" message.

## Privacy and spam

The service stores lead details in your Google Sheet. Only give authorized
personnel access to the Sheet. Avoid asking for sensitive data on this form.
The provided script includes required fields, a honeypot, basic duplicate
suppression and spreadsheet-formula escaping. Public endpoints can still receive
spam and abuse: monitor usage and errors before ad campaigns. Disable the web app
or tighten protections if spam escalates.

MailApp quotas vary by account and can change. On a consumer Gmail account,
Google currently documents 100 recipients/day; the Sheet is still updated if
the email quota is exhausted. Daily script/runtime and spreadsheet quotas also
apply.

Documentation: https://developers.google.com/apps-script/guides/web
Google quotas: https://developers.google.com/apps-script/guides/services/quotas
