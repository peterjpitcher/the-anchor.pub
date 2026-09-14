# Brief tk_000001: Pub quiz (cl_0001), investigate-visibility

Handed to seo-powerhouse from keyword plan run `2026-09-11-02-targeted`, approved by Peter Pitcher
on 14 September 2026. This ticket approves an investigation only. It approves no change to any page.

## Ticket

| Field | Value |
|---|---|
| Ticket | tk_000001 |
| Cluster | cl_0001, Pub quiz |
| Target page | pg_0002, https://www.the-anchor.pub/quiz-night |
| Evidence tier | B: page-level evidence only; no named queries for the cluster |
| Deciding tag | LOW_OBSERVED_VISIBILITY |
| Action | investigate-visibility |
| Priority | 90.0 (score_version 2.1.0) |
| Scenario | not estimable |

## Evidence

**Page total:** 0 clicks, 67 impressions, average position 5.0791 (page /quiz-night, 3 months
2026-06-12 to 2026-09-11, GB, Web search, complete page total, export gsc-3m-p-pg_0002).

**Demand for the head term:** "pub quiz near me", 1,000 to 10,000 a month (Keyword Planner,
precision mode encoded_band, pulled 2026-09-08, United Kingdom national band, not local demand).

**Named queries** (page /quiz-night named-query evidence, 3 months 2026-06-12 to 2026-09-11, GB,
a subset of the page's traffic; 29 rows in total, the five with most impressions shown):

| Query | Clicks | Impressions | Position |
|---|---|---|---|
| trivia night in surrey | 0 | 15 | 3.33 |
| the anchor pub quiz | 0 | 12 | 4.92 |
| pub quiz near me | 0 | 6 | 4.67 |
| anchor pub quiz | 0 | 5 | 4.6 |
| trivia night in london | 0 | 5 | 11 |

**Cluster mapping:** none of the page's 29 named queries matched the cluster's `query_regex`
(`analysis/cluster-performance.csv`), so no cluster-level figures exist for this ticket.

The result page has not been observed for any of these queries.

## The task

Observe the result page for each of the five queries above, and establish what takes the clicks on
searches where /quiz-night appears. Record what is on the page as found. Do not start from an
explanation.

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
- Avoid terms scoped to this cluster: "free pub quiz", "quiz questions". The all-cluster avoid terms
  are listed in `plan.md`.
- No unresolved overlaps in the 3m window.

## Checkpoints

- Measurement: the next keyword-plan run, 8 November to 22 November 2026, with a paired pull on
  /quiz-night.
- Structural: the next expansion, December 2026 to March 2027.

## Evidence files, in the run folder

- `normalised/gsc-queries.csv`, export_id gsc-3m-p-pg_0002
- `analysis/page-performance.csv`, page pg_0002
- `normalised/gkp-rows.csv`, keyword "pub quiz near me"
- `analysis/backlog.csv` and `analysis/diagnostics.csv`, cluster cl_0001
