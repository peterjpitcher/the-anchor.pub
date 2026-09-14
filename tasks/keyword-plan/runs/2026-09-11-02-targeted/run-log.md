# Run log: 2026-09-11-02-targeted (hosted event pages)

Mode: targeted, five hosted event pages. Supersedes nothing; fed by the legacy migration
`2026-09-11-01-legacy`. Exports received 13 September 2026; backlog approved and run finalised
14 September 2026.

## Inputs

| Pull | Page | Filter | Window | Result |
|---|---|---|---|---|
| gsc-3m-p-pg_0001 | /whats-on | exact regex, United Kingdom, Web | 2026-06-12 to 2026-09-11 | filed, pattern matched |
| gsc-3m-p-pg_0002 | /quiz-night | exact regex, United Kingdom, Web | 2026-06-12 to 2026-09-11 | filed, pattern matched |
| gsc-3m-p-pg_0003 | /quiz-night/themed | exact regex, United Kingdom, Web | 2026-06-12 to 2026-09-11 | filed, pattern matched, no rows |
| gsc-3m-p-pg_0004 | /music-bingo | exact regex, United Kingdom, Web | 2026-06-12 to 2026-09-11 | filed, pattern matched |
| gsc-3m-p-pg_0005 | /cash-bingo | exact regex, United Kingdom, Web | 2026-06-12 to 2026-09-11 | filed, pattern matched |
| gkp-volumes-01 | the 461 keywords in `paste/volumes-01.csv` | Historical metrics | September 1, 2025 to August 31, 2026 | filed, 403 rows |

Raw exports sit under `raw/`, which is gitignored: the repository is public.

## Baseline inventory

Page totals (complete for each page, one exact URL per export, GB):

| Page | Clicks | Impressions | Position | Named-query rows | Coverage |
|---|---|---|---|---|---|
| /whats-on | 7 | 1855 | 5.145 | 47 | 100.0% |
| /quiz-night | 0 | 67 | 5.0791 | 29 | null |
| /quiz-night/themed | 0 | 0 | | 0 | null |
| /music-bingo | 0 | 4 | 2.75 | 2 | null |
| /cash-bingo | 0 | 60 | 15.195 | 19 | null |

Null coverage means the export's click total is zero, so there were no clicks to account for.
No property-scope export was pulled, so there are no property totals this run.

Top non-brand named queries (a subset of each page's traffic):

| Query | Page | Impressions | Position |
|---|---|---|---|
| where to find live music pubs in heathrow | /whats-on | 68 | 26.62 |
| where to find live music pubs in heathrow airport | /whats-on | 55 | 50.62 |
| pub bingo near me | /cash-bingo | 31 | 22.48 |
| trivia night in surrey | /quiz-night | 15 | 3.33 |
| cash bingo near me | /cash-bingo | 7 | 10 |
| pub quiz near me | /quiz-night | 6 | 4.67 |
| trivia night in london | /quiz-night | 5 | 11 |

Truncation: no query or page table reached the row cap. Incidents: none of the windows overlaps an
incident in the registry (registry version 1). Site events: seven inside the window, four of them
on the game pages; listed in `plan.md`.

Keyword Planner: 403 rows imported, 401 of them `encoded_band`. States: 231 returned, 83 zero, 88
absent, 1 collapsed-variant. 401 of 461 submitted keywords came back under their own text.

## Data quality

- `WINDOW_SHORTER` (limiting) on all five Search Console exports: the Last 3 months preset gave
  12 June to 11 September against the requested 5 June to 2 October. Expected preset behaviour.
- `UNATTESTED_FACT` (limiting) on all six pulls: no `attestations.json`. The backlog approval is not
  an attestation of the property or of the Keyword Planner settings, so both stay unattested
  rather than being inferred.
- `PAGE_TOO_NEW` (limiting) on pg_0003: first published 21 August 2026, 24% of the window.
- `join-performance.py` joined 0 named queries to any cluster while the exports hold 97 query rows:
  no cluster `query_regex` matches the language that arrived, so cluster-level evidence could not
  be built. The regexes are due a rewrite at the next expansion.

## Decisions

- A first set of Search Console exports pulled on 13 September was discarded before import. They
  carried no Country filter and a "contains" page filter, so three returned seven pages each and
  `import-gsc.py` classified all four as page-group scope. They were replaced by exports pulled to
  a written spec. None of their figures entered the analysis.
- A Keyword Planner Forecasts export was quarantined to `raw/ignored/` by `sort-inbox.py`; the
  forecast tab is never used.
- Volume mode taken as banded from the data itself: every value in the export is a band code. This
  matches the note in `config.toml` from the 17 August and 8 September exports.
- No target terms and no content briefs issued: the pages already hold positions 2 to 5 for their
  terms, and the evidence does not support rewriting them.
- cl_0002 (themed quiz nights) held: the page existed for under half the window.
- Backlog approved by Peter Pitcher on 14 September 2026: tk_000001 to tk_000004, all four
  `investigate-visibility`, none deferred, none rejected. Handed to seo-powerhouse as briefs under
  `handoffs/`.

## Assumptions

- A query counts as brand when it contains "anchor". All 7 clicks in the run fall on such queries.
- Keyword Planner bands are national demand for the United Kingdom and are never read as demand in
  Stanwell Moor.
