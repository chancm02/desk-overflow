# Desk Overflow first customer marketing pack

Prepared October 22, 2026. Files are ready for owner review. No social posts, paid ads, real customer calls or website publication were made. All example caller/lead records are synthetic. No current-customer results or testimonials are claimed.

## Open the pack
Preview marketing/preview.html through the local repository server: http://127.0.0.1:8765/marketing/preview.html. Exported MP4/JPEG files need no paid editing application. Copy drafts from captions/platform-posts.md after reviewing them for the actual community and channel.

## Videos
- videos/01-missed-call-coverage.mp4: 27 seconds, 1080x1920, H.264/30fps, caption-led with silent AAC audio.
- videos/02-how-it-works.mp4: 28 seconds, same format, illustrative process.
- videos/03-pricing-and-setup.mp4: 22 seconds, same format, complete setup/monthly fees.
- Matching SRT and VTT files are under captions/. The words are also visible in the graphics; avoid displaying duplicate captions if the platform adds another overlay.
- Optional voiceover scripts are supplied. No human recording, generated receptionist voice or licensed music is represented. Add your own voice or properly licensed platform audio if desired. Keep example labels and price/usage context visible.

## Graphics and screenshots
- images/square-hook.jpg, square-capture.jpg, square-price.jpg, square-cta.jpg: 1080x1080 graphics for feed posts or a carousel.
- Eight images named vertical-*.jpg: 1080x1920 frames, also usable as story graphics, covers or a carousel where supported.
- site-desktop-preview.jpg, site-mobile-preview.jpg, site-example-lead.jpg, site-pricing.jpg: actual screenshots of the draft local landing page. The lead example is explicitly labeled synthetic; it is not a screenshot of a live HighLevel account or real customer record.
- The existing website stock photograph is not a picture of Desk Overflow staff. Its original Unsplash credit remains on the site. Brand creatives are code-rendered typography and the existing Desk Overflow SVG, with no added stock assets.

## Critical release gate
The public site still uses manual email-compose intake. The corrected Google handler is locally tested but not deployed or verified. assets/intake-config.js remains blank and verified=false. Do not tell prospects that automatic submissions work, or start posting campaign links expecting automatic records, until the authorized signed-out storage-and-notification test and final public-site test both pass.

Review backend/README.md for the exact corrected Google setup. The owner must approve use/deployment of the existing private Google inbox and publication of the website. These are required by the owner's earlier no-production-without-approval constraint. Google account access was observed, but access alone is not deployment authorization. No paid HighLevel account is needed to build or test this interim inquiry flow.

After live intake passes: approve and publish PR #1, perform one synthetic submission from the final URL, verify every field and alert in the private inbox, then use the posting copy. Change URLs in both artwork and captions if a professional domain is selected later. No domain has been purchased.

## Quality checks
Three complete MP4s decoded without video errors. Exported creative dimensions are 1080x1920 or 1080x1080. Browser geometry checks confirmed each creative's content finishes above its footer. Midpoint video frames and representative graphics were visually inspected. The landing page passed updated five-width overflow/hero-spacing checks and local form/example behavior tests; full platform/device upload previews remain the owner's final publishing check.

Reproducible sources: source/creative.html and source/scenes.json. source/build_videos.py uses imageio-ffmpeg from the temporary ignored private/media-python folder; exported files are already built. Do not include private account configuration or customer records in future exports.
