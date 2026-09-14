# Brief tk_000002: Music bingo (cl_0003), investigate-visibility

Handed to seo-powerhouse from keyword plan run `2026-09-11-02-targeted`, approved by Peter Pitcher
on 14 September 2026. This ticket approves an investigation only. It approves no change to any page.

## Ticket

| Field | Value |
|---|---|
| Ticket | tk_000002 |
| Cluster | cl_0003, Music bingo |
| Target page | pg_0004, https://www.the-anchor.pub/music-bingo |
| Evidence tier | B: page-level evidence only; no named queries for the cluster |
| Deciding tag | LOW_OBSERVED_VISIBILITY |
| Action | investigate-visibility |
| Priority | 60.0 (score_version 2.1.0) |
| Scenario | not estimable |

## Evidence

**Page total:** 0 clicks, 4 impressions, average position 2.75 (page /music-bingo, 3 months
2026-06-12 to 2026-09-11, GB, Web search, complete page total, export gsc-3m-p-pg_0004). Both
figures sit below the run's small-number floors of 20 clicks and 50 impressions.

**Demand for the head term:** "music bingo near me", 100 to 1,000 a month (Keyword Planner,
precision mode encoded_band, pulled 2026-08-17, United Kingdom national band, not local demand).

**Named queries** (page /music-bingo named-query evidence, 3 months 2026-06-12 to 2026-09-11, GB,
a subset of the page's traffic; 2 rows in total, both shown):

| Query | Clicks | Impressions | Position |
|---|---|---|---|
| music bingo near me | 0 | 3 | 2.33 |
| bingo anchor | 0 | 1 | 4 |

**Cluster mapping:** neither named query matched the cluster's `query_regex`
(`analysis/cluster-performance.csv`), so no cluster-level figures exist for this ticket.

The result page has not been observed for either query.

## The task

Observe the result page for both queries above, and establish what takes the clicks on searches
where /music-bingo appears. Record what is on the page as found. Do not start from an explanation.

## What would settle it

A dated observation for each query, recorded as a `check-done` event against this ticket in
`changes.jsonl`, with: source, locale, device, date, the result features seen, personalisation
(incognito or personalised) and location. An incognito observation made from a location in the
pub's catchment is the one to prefer; a signed-in observation is recorded, and marked indicative.

## Notes that bear on the work

- Site events on this page inside the window, so the window describes the page before and after
  each: 2026-08-12 game-night-template (redesign), 2026-08-17 game-pages-rewritten (repositioning,
  titles changed), 2026-08-26 listing-event-schema-dropped (redesign).
- The all-cluster avoid terms in `plan.md` apply. Drag cabaret and drag show are avoided; drag bingo
  stays eligible, because Music Bingo is the only drag night.
- No unresolved overlaps in the 3m window.

## Checkpoints

- Measurement: the next keyword-plan run, 8 November to 22 November 2026, with a paired pull on
  /music-bingo.
- Structural: the next expansion, December 2026 to March 2027.

## Evidence files, in the run folder

- `normalised/gsc-queries.csv`, export_id gsc-3m-p-pg_0004
- `analysis/page-performance.csv`, page pg_0004
- `normalised/gkp-rows.csv`, keyword "music bingo near me"
- `analysis/backlog.csv` and `analysis/diagnostics.csv`, cluster cl_0003
