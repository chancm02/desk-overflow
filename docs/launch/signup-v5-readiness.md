# Desk Overflow signup version 5

## Implemented
- Package/add-on selector with independent setup and recurring totals, 250/500-minute allowances and quote-only options.
- Business identity, authorized contact, billing/service locations, carrier, coverage, time zone and tax-exemption-review fields.
- Required authority/document/privacy acknowledgments. Request acknowledgment is not misrepresented as contract execution.
- Complete compact request stored through the existing owner-verified Apps Script endpoint; selected codes, proposed totals, quote requests, document version and UTC acknowledgment are preserved in the saved message. The serializer blocks overlength records instead of allowing silent truncation.
- Onboarding information capture, customer requirements, published service/data/billing terms, payment-return next steps and updated privacy disclosure.
- Six priced add-ons in the LIVE Stripe account, each with separate setup and monthly prices. See stripe-v5-catalog.json. No customer or subscription created.
- A LIVE Stripe setup-only Payment Link with optional one-time add-on setup items was created and immediately deactivated. It collects business and individual names, phone, billing address, signed-order reference, signer title, authority confirmation, terms consent and post-purchase invoice. Monthly prices are disclosed in add-on names and are NOT billed by the setup link.

## Checkout is deliberately review required
Stripe Tax settings are active, but GetTaxRegistrations returned no registrations on November 3 2026. Products lack individual tax_code values and currently inherit the account AIaaS preset; this has not been confirmed as correct for managed telephone-answering/setup and each add-on. Do not treat enabled automatic_tax with no recorded registrations as verified collection. The owner's Iowa registration may be complete outside Stripe; do not assert it is missing or register additional states by inference.

Before enabling public charging: record the existing applicable registration(s) in Stripe after confirming effective date; confirm product/setup classifications and location/exemption handling; verify exact signed-order terms match items and limits; review the completed Stripe terms/consent page; run sandbox checkout and reconciliation. The intended merchant still reports identity-document live capture currently due; owner must complete that securely in Stripe Dashboard.

The link is inactive and its URL is not published. No arbitrary trial-end subscription is started. For first customers, complete the actual signed order and tax review, then issue a customer-specific hosted invoice/link. Manually start only approved monthly items at documented Go-Live with separate recurring authorization. Metadata flags and frontend checkboxes are not server authorization controls.

## Data and access
Public inquiry/onboarding forms do not request EIN, SSN, card details, passwords, private customer lists or regulated data. SMS registration, exemption certificates, delegated access and DPA annexes are handled separately through arranged secure channels. No secrets or private addresses are committed.

No authenticated customer account portal, custom payment-verification API, webhook service or HighLevel instance was deployed. Return-page visits do not verify payment. Stripe is the authoritative payment/invoice record; existing private Google Sheet is the inquiry record. Do not advertise either as automated service fulfillment or a verified hard spending cap.
