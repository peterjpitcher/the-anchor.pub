# Run log: 2026-09-11-01-legacy (evidence migration)

Mode: legacy migration, feeding the first targeted run `2026-09-11-02-targeted` for the hosted event pages.
Written 11 September 2026.

## What was migrated

| Pull | Source file (checksums in run.json) | What it is |
|---|---|---|
| gsc-16m-p-pg_0001 | the-anchor.pub-Performance-on-Search-2026-09-11 (3).zip | Page filter /whats-on, Last 16 months, no Country filter |
| gsc-16m-p-pg_0002 | the-anchor.pub-Performance-on-Search-2026-09-11 (2).zip | Page filter /quiz-night, Last 16 months, no Country filter |
| gsc-16m-p-pg_0004 | the-anchor.pub-Performance-on-Search-2026-09-11 (1).zip | Page filter /music-bingo, Last 16 months, no Country filter |
| gsc-16m-p-pg_0005 | the-anchor.pub-Performance-on-Search-2026-09-11.zip | Page filter /cash-bingo, Last 16 months, no Country filter |
| gkp-volumes-01 | Keyword Stats 2026-08-17 at 10_06_07.csv | Get search volume, the 60 game-night terms of 17 August 2026 |
| gkp-discover-01 | Keyword Stats 2026-09-08 at 11_53_53.csv | Discover, batch 8 (what's on and things to do) of 8 September 2026 |

## Baseline inventory (legacy, preset window, not comparable with a calendar window)

Window for every Search Console export: 9 May 2025 to 8 September 2026 (Chart.csv), all countries.

| Page | Chart clicks | Chart impressions | Named-query rows | Coverage (named clicks over Chart clicks) |
|---|---|---|---|---|
| /whats-on | 91 | 15,289 | 206 | 0.318681 |
| /quiz-night | 30 | 2,463 | 131 | 0.133333 |
| /music-bingo | 5 | 360 | 18 | 0 |
| /cash-bingo | 6 | 1,009 | 44 | 0 |

Page totals are complete for each page; query rows are a named subset. No table reached the 1,000-row cap.

Keyword Planner: gkp-volumes-01 60 rows (36 returned, 24 absent); gkp-discover-01 1,352 rows (1,243 returned,
83 zero, 26 absent). Every value is band-encoded; the volume mode is banded.

## Data quality

- `COUNTRY_FILTER_MISSING` (limiting) on all four Search Console exports: recorded as all countries.
- The Search Console exports use the Last 16 months preset, so they size clusters and seed the universe only.
- /music-bingo first had impressions on 1 February 2026 and /cash-bingo on 29 September 2025, so both are younger than
  the window (`pages.first_published` is filled).

## Decisions taken in this migration

- Keywords, aliases, demand observations, monthly demand and overlaps promoted to the workspace root by hand.
- The auto-filled head keywords were not promoted. build-universe picked `song bingo` (intent risk: people who want to
  run their own) for Music bingo and `bongo's bingo near me` (another operator's brand) for Cash bingo. Heads set by hand:
  cl_0001 `pub quiz near me`, cl_0003 `music bingo near me`, cl_0004 `pub bingo near me`, cl_0005 `pub events near me`.
  cl_0002 (themed quiz) stays blank until its brief candidates return demand.
- Ten overlaps resolved by the operator: the music bingo phrasings (including drag bingo and rock and roll bingo) to
  cl_0003, `bingo events near me` to cl_0004, `charity quiz night near me` to cl_0002.
- New avoid rule `bongo` (all clusters).
- Nine brief candidates added for cl_0002 (Gavin and Stacey, Only Fools and Horses and themed quiz phrasings).
