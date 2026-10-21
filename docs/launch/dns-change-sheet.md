# Domain DNS change sheet

DRAFT — NOT APPLIED. Keep the current GitHub Pages site and existing design. No domain has been selected or purchased. Fill the domain and export existing DNS before any approved change. Do not commit a root CNAME file or change Pages settings until publication/cutover is approved.

## Proposed website records

| Host | Type | Value | Status |
|---|---|---|---|
| @ | A | 185.199.108.153 | Ready for approved GitHub Pages cutover |
| @ | A | 185.199.109.153 | Ready for approved GitHub Pages cutover |
| @ | A | 185.199.110.153 | Ready for approved GitHub Pages cutover |
| @ | A | 185.199.111.153 | Ready for approved GitHub Pages cutover |
| www | CNAME | chancm02.github.io | Ready for approved cutover; no repository path |
| _github-pages-challenge-chancm02 | TXT | [TOKEN FROM GITHUB DOMAIN VERIFICATION] | Requires owner/domain settings |
| [HIGHLEVEL SENDING HOST] | TXT/CNAME | [EXACT GENERATED SPF/DKIM/VERIFICATION VALUES] | Requires HighLevel sender setup |
| [MAILBOX HOST] | MX | [BUSINESS MAILBOX PROVIDER VALUES] | Preserve existing records; do not guess |
| _dmarc | TXT | [APPROVED POLICY AND BUSINESS REPORTING ADDRESS] | Prepare only after sender inventory |

Optional IPv6, if selected and checked against current GitHub instructions: 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153. Do not add competing ALIAS/A records or wildcard records. Maintain one SPF record per hostname; merge approved senders rather than creating another SPF record.

## Approved cutover sequence
1. Owner selects domain, confirms business-controlled ownership/recovery and separately approves purchase. No availability or trademark guarantee is made.
2. Export current DNS/TTL/MX and save privately. Record registrar and rollback operator. Verify domain ownership in GitHub using its generated TXT token.
3. In repository Settings > Pages, set the chosen custom domain before pointing public web DNS at Pages, following GitHub's order to reduce takeover risk. This step may create a main-branch CNAME commit and therefore requires publication approval.
4. Apply only reviewed web records above, preserving email records. Wait for propagation and certificate issuance; validate both apex and www, intended redirect, HTTPS and no mixed content.
5. Update canonical/social URLs and approved business contact/sender identity in a reviewed site change. Re-test page assets, form path and inquiry notifications on the final domain.
6. Roll back using saved DNS and Pages settings if critical checks fail. Confirm original site and mailbox routing work. Never remove verification without checking takeover risk.

## Read only verification commands after domain selection
Use PowerShell `Resolve-DnsName -Name [DOMAIN] -Type A`, `Resolve-DnsName -Name www.[DOMAIN] -Type CNAME` and `Resolve-DnsName -Name [DOMAIN] -Type MX`. Check HTTPS in a browser without bypassing certificate warnings. No command here changes records.

[GitHub custom domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) checked October 21, 2026. Recheck before applying. HighLevel email records and any alternative HighLevel web hosting target must be generated in the actual account; no additional hosting is needed for the preserved landing page.
