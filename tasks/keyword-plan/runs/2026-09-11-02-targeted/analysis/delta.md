# Delta: run 2026-09-11-02-targeted

Baseline established. No finalised run precedes this one, so there is no movement to report.

## Windows in this run

- 3m: 2026-06-12 to 2026-09-11

## Property totals


## Incidents

- no window overlaps an incident in the registry

## Site events

- window 3m contains 2026-08-11-live-music-open-mic-purged (content-purge, 2026-08-11), paths ^/(live-music|open-mic|blog/live-music-pubs-near-heathrow)$: Retired pages 301 to /whats-on, so their residual search traffic lands on /whats-on from this date. PR #103.
- window 3m contains 2026-08-11-whats-on-live-music-retired (repositioning, 2026-08-11), paths ^/whats-on$: Live music retired in full; /whats-on retitled to Quiz, Music Bingo & Cash Bingo Near Heathrow. PR #103.
- window 3m contains 2026-08-12-game-night-template (redesign, 2026-08-12), paths ^/(quiz-night|cash-bingo|music-bingo|karaoke)$: Quiz, cash bingo, music bingo and karaoke moved onto one shared game-night template with inline booking (commits 4b03f842, 496b321a).
- window 3m contains 2026-08-17-game-pages-rewritten (repositioning, 2026-08-17), paths ^/(quiz-night|cash-bingo|music-bingo|karaoke)$: The four game pages rewritten around the 17 August 2026 Keyword Planner data; titles changed (commit c9176f3d).
- window 3m contains 2026-08-26-listing-event-schema-dropped (redesign, 2026-08-26), paths ^/(whats-on|quiz-night|cash-bingo|music-bingo|karaoke)$: 33 Event objects removed from listing pages because Google does not support them there (commit bdd8a1e5). Rich-result eligibility on these URLs changed.
- window 3m contains 2026-09-07-event-pages-wave-1 (redesign, 2026-09-07), paths ^/events/: Event detail pages: event sold above the desktop fold, pitch before the booking form, simplified booking (fix/event-pages-wave-1, merged 7 September 2026).
- window 3m contains 2026-09-10-drag-pages-purged (content-purge, 2026-09-10), paths ^/(whats-on/drag-shows|blog/drag-cabaret-nikki)$: Retired and 301'd to /whats-on (docs/SSOT.md section 10, retired entertainment formats).

## Year on year

- not available: no month window in this run
