# Brief tk_000003: Cash bingo (cl_0004), investigate-visibility

Handed to seo-powerhouse from keyword plan run `2026-09-11-02-targeted`, approved by Peter Pitcher
on 14 September 2026. This ticket approves an investigation only. It approves no change to any page.

## Ticket

| Field | Value |
|---|---|
| Ticket | tk_000003 |
| Cluster | cl_0004, Cash bingo |
| Target page | pg_0005, https://www.the-anchor.pub/cash-bingo |
| Evidence tier | B: page-level evidence only; no named queries for the cluster |
| Deciding tag | LOW_OBSERVED_VISIBILITY |
| Action | investigate-visibility |
| Priority | 60.0 (score_version 2.1.0) |
| Scenario | not estimable |

## Evidence

**Page total:** 0 clicks, 60 impressions, average position 15.195 (page /cash-bingo, 3 months
2026-06-12 to 2026-09-11, GB, Web search, complete page total, export gsc-3m-p-pg_0005).

**Demand for the head term:** "pub bingo near me", 100 to 1,000 a month (Keyword Planner, precision
mode encoded_band, pulled 2026-08-17, United Kingdom national band, not local demand).

**Named queries** (page /cash-bingo named-query evidence, 3 months 2026-06-12 to 2026-09-11, GB, a
subset of the page's traffic; 19 rows in total, five of those with most impressions shown):

| Query | Clicks | Impressions | Position |
|---|---|---|---|
| pub bingo near me | 0 | 31 | 22.48 |
| cash bingo near me | 0 | 7 | 10 |
| where to meet people | 0 | 3 | 1 |
| bar bingo near me | 0 | 2 | 40.5 |
| bingo near me | 0 | 2 | 3 |

**Cluster mapping:** none of the page's 19 named queries matched the cluster's `query_regex`
(`analysis/cluster-performance.csv`), so no cluster-level figures exist for this ticket.

The result page has not been observed for any of these queries.

## The task

Observe the result page for each of the five queries above, and establish which results rank above
/cash-bingo and what takes the clicks on those searches. Record what is on the page as found. Do not
start from an explanation.

## What would settle it

A dated observation for each of the five queries, recorded as a `check-done` event against this
ticket in `changes.jsonl`, with: source, locale, device, date, the result features seen,
personalisation (incognito or personalised) and location. An incognito observation made from a
location in the pub's catchment is the one to prefer; a signed-in observation is recorded, and
marked indicative.

## Notes that bear on the work

- Site events on this page inside the window, so the window describes the page before and after
  each: 2026-08-12 game-night-template (redesign), 2026-08-17 game-pages-rewritten (repositioning,
  titles changed), 2026-08-26 listing-event-schema-dropped (redesign).
- Avoid terms scoped to this cluster: "bingo hall". Avoid terms scoped to all clusters that bear on
  bingo: "online bingo" and "bongo". The full list is in `plan.md`.
- No unresolved overlaps in the 3m window.

## Checkpoints

- Measurement: the next keyword-plan run, 8 November to 22 November 2026, with a paired pull on
  /cash-bingo.
- Structural: the next expansion, December 2026 to March 2027.

## Evidence files, in the run folder

- `normalised/gsc-queries.csv`, export_id gsc-3m-p-pg_0005
- `analysis/page-performance.csv`, page pg_0005
- `normalised/gkp-rows.csv`, keyword "pub bingo near me"
- `analysis/backlog.csv` and `analysis/diagnostics.csv`, cluster cl_0004
