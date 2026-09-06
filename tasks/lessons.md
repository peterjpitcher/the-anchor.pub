# Lessons

- Owner-approved terrestrial TV screenings must accept bookings without waiting for channel, screen or commentary details. Keep arrivals within existing opening hours and distinguish booking windows from actual match finish times.

- Verify an already-open customer tab after a feed contract changes, not only a fresh navigation. Provide full-page recovery for incompatible client data, and never describe a refresh failure as missing owner approval. Group multi-day fixture lists by London date and keep substantial editorial below the booking choices.

- Games may continue after usual closing if people are still in watching, per the owner on 5 September 2026. Show that condition on cards, booking summaries, calendars and editorial without extending kitchen service or advertising later arrivals.

- Changing a business rule means sweeping the whole repo for it written out in prose, not just changing the constant. On 6 September 2026 the Christmas minimum went from 6 to 4. Updating `CHRISTMAS_MINIMUM_PARTY_SIZE` and the pages that interpolate it left **nine** hardcoded statements of "6 guests" alive in blog posts, `SSOT.json` prose values, a banned-claims key name and `docs/SSOT.md`, all live and indexable. No type or test could catch any of them. Grep case-insensitively for the number, the word ("six"), and the negative form ("under 6") before calling a rule change done.

- Read an owner's scope literally before generalising it. "Drop the minimum to 4 on Tuesday to Thursday" was implemented as a day-dependent rule with weekday and weekend values, a weekday lookup table and date-aware form validation. The owner meant a flat 4. Where an instruction names a subset, ask whether the subset is the rule or just the example, because building the general case costs more to unwind than to clarify.
