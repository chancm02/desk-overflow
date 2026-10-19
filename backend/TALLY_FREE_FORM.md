# Desk Overflow — Free Tally lead form

**Status:** Setup specification only. Do not replace the website's current email fallback until a published, owner-controlled Tally form has passed a real submission test.

## Fastest route: Tally AI form builder

1. Create or sign into a free Tally account at https://tally.so/.
2. Choose **New form → Create with AI** and paste the prompt below.
3. Review the questions, required fields, consent wording, and mobile preview.
4. Publish the form. Under **Settings → Email notifications**, enable **Self email notifications** to your account email.
5. Under **Integrations → Google Sheets**, connect the existing Google account. Use a **new tab** in the existing private Desk Overflow — Website Lead Inbox workbook if the integration supports selecting that destination. Otherwise let Tally create a new Sheet, rather than risking overwriting the existing `Leads` tab.
6. Under **Share**, copy the published form URL (typically https://tally.so/r/<form-id>) and give it to ChatGPT. The assistant can embed it in the website's existing white form card and keep the navy/mint design.
7. After integration, test from the public website and verify: (a) Tally submission record, (b) email notification, (c) row in Google Sheets. No success claim before those checks.

## Copy/paste prompt for Tally AI

Create a professional, concise lead-generation contact form for **Desk Overflow**, an Iowa-based business offering managed AI phone answering, missed-call and after-hours overflow coverage, customer inquiry intake, and scheduling workflows for service businesses nationwide.

The form title should be **Get Your Desk Overflow Coverage Plan**.

Intro copy: "Tell us a little about your business. We'll review your call-handling needs and contact you to discuss a practical AI answering and scheduling setup. No obligation."

Create the following fields in this order:

1. **Full Name** — required short text.
2. **Business Name** — required short text.
3. **Email Address** — required, validated email.
4. **Phone Number** — required phone-number field.
5. **Business Type** — optional dropdown, with options: HVAC / Plumbing; Roofing / Contracting; Electrical / Home Services; Auto / Repair; Cleaning / Maintenance; Other Service Business.
6. **Average Calls Per Week** — optional dropdown: Not sure; Under 25; 25–75; 76–150; Over 150.
7. **What's your biggest call-handling challenge?** — optional long text, limit to a reasonable paragraph.
8. **Contact permission** — required checkbox, **unchecked by default**, with wording: "I agree that Desk Overflow may contact me by phone or email about this inquiry. This does not authorize marketing texts or automated promotional calls."

Submit button: **Send My Inquiry**.

After a successful submission, display a thank-you message: "Your inquiry was received. Thank you for contacting Desk Overflow. We'll follow up using the contact details you provided." Avoid claiming a specific response time.

Styling: dark navy (#071622) and mint (#5CE7BA) brand accent, tidy neutral/light form fields, clear labels, compact layout suitable for embedding within the existing Desk Overflow site. Prioritize readability and mobile usability.

Do not add payment collection, newsletters, marketing SMS consent, customer testimonials, guarantees about recovered revenue, or unrequested upsells.

## Practical notes

- Tally's free plan supports unlimited responses subject to fair use, free self-notifications, embedded forms, and free Google Sheets integration.
- Tally's free forms retain Tally branding; removal requires the paid tier. Do not attempt to conceal mandatory provider attribution.
- Custom email formatting and respondent auto-replies may require a paid plan. **Self email notifications** to the form owner are free.
- Website visitors should stay on the Desk Overflow website using a standard embed. Avoid separate FormSubmit endpoints or Google Apps Script.
- Privacy page must be updated when the integration goes live: Tally and Google Sheets will process customer inquiry details. Tally says it stores data in Europe.
- Preserve the existing form until the Tally link is provided and live submissions are verified.

References:
- https://tally.so/pricing
- https://tally.so/help/free-ai-form-builder
- https://tally.so/help/embed-your-form
- https://tally.so/help/self-email-notifications
- https://tally.so/help/google-sheets-integration
