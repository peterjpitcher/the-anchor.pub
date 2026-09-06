# Lessons

- Owner-approved terrestrial TV screenings must accept bookings without waiting for channel, screen or commentary details. Keep arrivals within existing opening hours and distinguish booking windows from actual match finish times.

- Verify an already-open customer tab after a feed contract changes, not only a fresh navigation. Provide full-page recovery for incompatible client data, and never describe a refresh failure as missing owner approval. Group multi-day fixture lists by London date and keep substantial editorial below the booking choices.

- Games may continue after usual closing if people are still in watching, per the owner on 5 September 2026. Show that condition on cards, booking summaries, calendars and editorial without extending kitchen service or advertising later arrivals.

- Changing a business rule means sweeping the whole repo for it written out in prose, not just changing the constant. On 6 September 2026 the Christmas minimum went from 6 to 4. Updating `CHRISTMAS_MINIMUM_PARTY_SIZE` and the pages that interpolate it left **nine** hardcoded statements of "6 guests" alive in blog posts, `SSOT.json` prose values, a banned-claims key name and `docs/SSOT.md`, all live and indexable. No type or test could catch any of them. Grep case-insensitively for the number, the word ("six"), and the negative form ("under 6") before calling a rule change done.

- Read an owner's scope literally before generalising it. "Drop the minimum to 4 on Tuesday to Thursday" was implemented as a day-dependent rule with weekday and weekend values, a weekday lookup table and date-aware form validation. The owner meant a flat 4. Where an instruction names a subset, ask whether the subset is the rule or just the example, because building the general case costs more to unwind than to clarify.

- Deleting a cached asset does not unpublish it. `content/blog/christmas-events/hero.jpg` was removed and deployed on 6 September 2026; the origin correctly 404s (proved via the deployment URL and a cache-buster) but `https://www.the-anchor.pub/...` still served the file. **Cloudflare sits in front of Vercel**, so `vercel cache purge --type cdn` is not enough: the headers show `x-vercel-cache: MISS` alongside `cf-cache-status: HIT`. With `Cache-Control: public, max-age=31536000, immutable` the object survives at the Cloudflare edge for a year. The known "replacing an image needs a new filename" rule applies to deletion too, and the only fix is a Cloudflare purge of the exact URL, which needs owner access. Check `cf-cache-status`, not just `x-vercel-cache`, before calling an asset gone.

- Verify a deploy by reading the published words, not by asserting a fixture you wrote yourself. The Christmas Day FAQ shipped as "from 12:00 to 15:00" while its test passed, because the test hand-typed '12pm' into its own facts fixture and never touched the code that reads the SSOT. A test that constructs the value it is checking proves nothing. Make the fixture call the same function production calls, then delete the fix and confirm the test actually fails.

- Event booking forms should collect ticket quantities and lead booker details, without guest-by-guest names or a food discussion question (owner decision, 6 September 2026).

- The event booking simplification also removes the whole early-arrival box, including any follow-up confirmation wording. Do not retain food or early-arrival discussion prompts (owner correction, 6 September 2026).
