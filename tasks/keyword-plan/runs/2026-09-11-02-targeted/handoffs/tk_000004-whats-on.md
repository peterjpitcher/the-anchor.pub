# Brief tk_000004: What's on and pub events (cl_0005), investigate-visibility

Handed to seo-powerhouse from keyword plan run `2026-09-11-02-targeted`, approved by Peter Pitcher
on 14 September 2026. This ticket approves an investigation only. It approves no change to any page.

## Ticket

| Field | Value |
|---|---|
| Ticket | tk_000004 |
| Cluster | cl_0005, What's on and pub events |
| Target page | pg_0001, https://www.the-anchor.pub/whats-on |
| Evidence tier | B: page-level evidence only; no named queries for the cluster |
| Deciding tag | LOW_OBSERVED_VISIBILITY |
| Action | investigate-visibility |
| Priority | 60.0 (score_version 2.1.0) |
| Scenario | not estimable |

## Evidence

**Page total:** 7 clicks, 1855 impressions, average position 5.145 (page /whats-on, 3 months
2026-06-12 to 2026-09-11, GB, Web search, complete page total, export gsc-3m-p-pg_0001). Named-query
coverage is 100.0%: the named queries account for all of the export's clicks.

**Demand for the head term:** "pub events near me", 100 to 1,000 a month (Keyword Planner, precision
mode encoded_band, pulled 2026-09-08, United Kingdom national band, not local demand).

**Named queries** (page /whats-on named-query evidence, 3 months 2026-06-12 to 2026-09-11, GB, a
subset of the page's impressions; 47 rows in total, the ten with most impressions shown):

| Query | Clicks | Impressions | Position |
|---|---|---|---|
| the anchor stanwell moor | 1 | 482 | 1.99 |
| the anchor staines | 2 | 294 | 1.97 |
| the anchor heathrow | 1 | 213 | 1.97 |
| the anchor pub heathrow | 1 | 178 | 1.83 |
| the anchor stanwell | 0 | 151 | 2.13 |
| the anchor pub stanwell moor | 1 | 96 | 2 |
| anchor stanwell moor | 0 | 77 | 2 |
| where to find live music pubs in heathrow | 0 | 68 | 26.62 |
| anchor pub heathrow | 1 | 57 | 2 |
| where to find live music pubs in heathrow airport | 0 | 55 | 50.62 |

27 of the 47 named-query rows contain "anchor", and all 7 of the page's clicks fall on those rows.

**Cluster mapping:** none of the page's 47 named queries matched the cluster's `query_regex`
(`analysis/cluster-performance.csv`), so no cluster-level figures exist for this ticket.

The result page has not been observed for any of these queries.

## The task

Observe the result page for the eight queries above that contain "anchor" and have 57 or more
impressions, and establish which result takes the clicks on those searches where /whats-on appears.
Separately, observe the result page for the two queries that contain "live music". Record what is on
each page as found. Do not start from an explanation.

## What would settle it

A dated observation for each of those ten queries, recorded as a `check-done` event against this
ticket in `changes.jsonl`, with: source, locale, device, date, the result features seen,
personalisation (incognito or personalised) and location. An incognito observation made from a
location in the pub's catchment is the one to prefer; a signed-in observation is recorded, and
marked indicative.

## Notes that bear on the work

- Site events on this page inside the window, so the window describes the page before and after
  each: 2026-08-11 live-music-open-mic-purged (content-purge; retired pages 301 to /whats-on),
  2026-08-11 whats-on-live-music-retired (repositioning; /whats-on retitled), 2026-08-26
  listing-event-schema-dropped (redesign), 2026-09-10 drag-pages-purged (content-purge; retired
  pages 301 to /whats-on).
- "live music" is on the avoid list for all clusters: live music is discontinued in full,
  owner-confirmed 11 August 2026. Two of the named queries above contain it.
- No unresolved overlaps in the 3m window.

## Checkpoints

- Measurement: the next keyword-plan run, 8 November to 22 November 2026, with a paired pull on
  /whats-on.
- Structural: the next expansion, December 2026 to March 2027.

## Evidence files, in the run folder

- `normalised/gsc-queries.csv`, export_id gsc-3m-p-pg_0001
- `analysis/page-performance.csv`, page pg_0001
- `normalised/gkp-rows.csv`, keyword "pub events near me"
- `analysis/backlog.csv` and `analysis/diagnostics.csv`, cluster cl_0005
