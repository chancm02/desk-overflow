# deskoverflow.com hosting

Prepared November 3, 2026. Domain observed Active on Cloudflare Free.
Deployment and DNS verification are pending; this file is not a completion report.

## Intended configuration

- Source: `chancm02/desk-overflow`, production branch `main`.
- Host: Cloudflare Pages, existing Cloudflare account; no paid upgrade.
- Framework preset: None.
- Build command: `node tools/build-site.cjs`.
- Build output: `dist`; repository root is the build root.
- The build publishes only the landing page, public policies, thank-you page,
  logos and runtime assets. Internal documents, backend code, marketing drafts,
  tests, private files and credentials are excluded.
- Custom domains: `deskoverflow.com` and `www.deskoverflow.com`.
- The generated `_redirects` sends the www hostname to the apex using HTTPS.
- Connect each domain through Pages Custom domains so Cloudflare provisions
  the correct DNS target and certificate. Inspect existing records before any
  change; preserve email records and other unrelated services.

## Owner authorization gate

GitHub sign-in is required in the Cloudflare connection flow. Before granting
new app access, inspect the permissions and restrict repository selection to
`desk-overflow`. The owner must approve the actual permissions shown.
No account password, OAuth token or API key belongs in this repository.

## Verification before using the domain in Stripe

1. Cloudflare deployment succeeds with the expected source commit.
2. Apex HTTPS returns the landing page with a valid certificate.
3. www HTTPS redirects to apex, retaining paths and query parameters.
4. CSS, JavaScript, logos, privacy, terms and SMS terms remain accessible.
5. Mobile navigation, pricing links and inquiry validation work.
6. Submit one clearly labeled synthetic inquiry and verify saved record and
   owner alert. No customer data, payments or live calls are involved.
7. Confirm docs, backend and private paths are not published by this build.
8. Enter the verified website address in Stripe; account activation, tax
   registration and billing remain separate decisions.

The existing Apps Script confirmation currently links back to the former
GitHub Pages URL. Inquiry saving is independent of that link; update and
redeploy the backend separately, then verify its return link.
