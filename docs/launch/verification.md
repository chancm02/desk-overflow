# Browser verification record

Date: October 21, 2026. Environment: local static server bound to 127.0.0.1:8765. No real emails, calls, payments, lead submissions, forwarding changes or production publication. The actual intake flow is page fields → browser validation → encoded email/Gmail draft and copyable text. There is no persistent intake API until HighLevel migration.

## Findings and completed checks
| Check | Result | Evidence |
|---|---|---|
| Desktop render | PASS | Original logo, navy/mint palette, photograph, layout and calculator render; evidence/desktop-preserved.png |
| Required fields | PASS | Empty submit focused Full Name and displayed browser validation |
| Response permission | PASS | Completed dummy fields with unchecked consent were blocked; focus moved to checkbox |
| Draft preparation | PASS | Synthetic Caller / Example Service Test & Co / owner@example.com / reserved 202-555-0147 generated correct preview with explicit not-sent message |
| Encoding and user text | PASS | Ampersand and literal script-like text remained data in readonly textarea and percent-encoded draft links; no HTML execution observed |
| Copy details | PASS | Button reported copied with instruction to paste and press Send; no email application opened |
| Calculator keyboard | PASS | Right arrow changed calls/day from 3 to 4; 4*30*500*.30 rendered $18,000 |
| Mobile menu | PASS | Expanded through original menu button; inquiry selection closed menu and updated aria-expanded |
| Mobile hero spacing | FIXED / PASS | Illustration overlapped text before fix at narrow widths; original styles retained with one mobile padding/min-height correction |
| Page overflow | PASS | At frame widths 320, 375, 768, 1265, 1440, page scrollWidth equaled clientWidth; no page-wide horizontal overflow |
| Static structure | PASS | All four public pages passed unique ID, label-target, image-alt and local-link checks |
| Existing design preservation | PASS | Original index tag sequence, original CSS prefix, JavaScript and brand assets verified; only service-scope words and appended mobile spacing rule changed |

## Responsive measurements

Frame width includes the browser's scrollbar; tested content viewport may be 15px narrower. These are CSS viewport checks, not physical device or assistive-technology certification.

| Frame width | Hero text bottom | Illustration top | Overlap after fix | Page overflow |
|---|---|---|---|---|
| 320 | 649 | 697 | No | No |
| 375 | 579 | 627 | No | No |
| 768 | 467 | 495 | No | No |
| 1265 | 525 | 75 | Desktop side-by-side | No |
| 1440 | 534 | 75 | Desktop side-by-side | No |

Measurements are document CSS pixels at initial scroll position. [Responsive evidence](evidence/responsive-checks.png) and [desktop evidence](evidence/desktop-preserved.png). Repeat with local server and tests/responsive-qa.html. The harness loads same-origin frames and reports layout geometry; it never submits forms. Do not deploy the local server or use a public tunnel.

## Boundaries still unverified
HighLevel contact persistence, native notification delivery, sender-domain authentication, gateway sandbox events, recurring scheduling, actual Voice AI behavior, call-minute/spend enforcement, carrier fallback, complete keyboard/screen-reader accessibility, physical devices, browser zoom, blocked-image/no-JS email-client behavior and real domain cutover. These are not inferred from local tests. Original email draft remains the actual fallback; simply filling it never sends the inquiry.

## Automated preparation checks
`python tools/check_preparation.py`: PASS for site links/structure, assets JSON syntax and retained design checks.
`python -m unittest discover -s tests -v`: seven PASS covering links, missing rates, budget arithmetic, individual missing gates, truthy text/missing evidence, manual-vs-autopay policy and invalid/nonfinite rates.
`node --check assets/site.js`: PASS. `git diff --check`: PASS.
The offline prerequisite checker is a review aid, not an authenticated approval system or a platform automation. Its output never authorizes a financial transaction or activation.
