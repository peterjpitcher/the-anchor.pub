# Keyword Plan: the-anchor.pub (GB)   run 2026-09-11-02-targeted, mode targeted

## Next required input

Nothing is blocking. Two confirmations would lift limiting flags on the next run:

1. That all five Search Console exports came from property `sc-domain:the-anchor.pub`.
2. That the Keyword Planner pull used Location United Kingdom, Language English, Network Google
   Search, last 12 months. The volume mode needs no confirmation: every value in the export is a
   band code, and `import-gkp.py` recorded 401 of 403 rows as `encoded_band`.

## How to read this plan

**Levels.** Page figures are complete for that page: each export was filtered to one exact URL and
returned exactly one page row. Query figures are a named subset of that page's traffic, never its
total. Cluster rows carry no query figures at all this run, because no named query matched a
cluster's `query_regex`, which is itself a finding and is discussed under per-cluster guidance.

**Completeness.** Coverage is named-query clicks over the same export's total clicks. It is 100%
for `/whats-on` and null for the other four, because null is what you get when the denominator is
zero clicks. Null here means "no clicks to account for", not "we could not measure".

**Precision.** Every demand figure is an encoded band from Google Keyword Planner, printed as its
range with the date it was pulled. The account returns band codes rather than counts, so a single
number is never available and is never invented. Summing bands is meaningless and is not done.

**Curve.** `awr-organic-blended`, the bundled fallback, because this run holds no property-scope
export. It is used only for scenario maths, and every scenario below is "not estimable" anyway.

**Window.** 12 June to 11 September 2026, the Search Console "Last 3 months" preset. That is
shorter than the requested 5 June to 2 October, which is the preset behaving as documented rather
than a fault. Preset windows drift, so this run cannot be compared like for like with a run that
used typed dates.

**Site events.** Seven changes landed inside the window, listed in full under data quality. Four of
them hit the game pages directly. Nothing in this plan is attributed to a change, and nothing is
compared across one.

**Tiers and tags.** All five clusters are evidence tier B: page-level evidence only. Tags are
candidates, not diagnoses. `investigate-visibility` is a look-first ticket and never a licence to
rewrite a page.

**Phases skipped.** Targeted mode: no discovery pass this run, and the demand pull was the single
paste already outstanding. Google Business Profile is not in scope for this run.

## What moved since the last run

Nothing, and that is not a finding: this is the first finalised run, so it establishes the
baseline. `delta.py` reports `BASELINE_ESTABLISHED`. Decay was not evaluated because no earlier
finalised run holds a 3m window ending 2026-06-30 or 2025-09-30.

## Cluster scoreboard

| Cluster | Head term | Demand (band, mode, date) | Target page | Named-query clicks | Impressions | Position | Tier | Tags | Action | Priority | Scenario (clicks a month) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Pub quiz (cl_0001) | pub quiz near me | 1,000 to 10,000 (encoded_band, 2026-09-08) | pg_0002 | | | | B | LOW_OBSERVED_VISIBILITY | investigate-visibility | 90.0 | not estimable |
| Music bingo (cl_0003) | music bingo near me | 100 to 1,000 (encoded_band, 2026-08-17) | pg_0004 | | | | B | LOW_OBSERVED_VISIBILITY | investigate-visibility | 60.0 | not estimable |
| Cash bingo (cl_0004) | pub bingo near me | 100 to 1,000 (encoded_band, 2026-08-17) | pg_0005 | | | | B | LOW_OBSERVED_VISIBILITY | investigate-visibility | 60.0 | not estimable |
| What's on and pub events (cl_0005) | pub events near me | 100 to 1,000 (encoded_band, 2026-09-08) | pg_0001 | | | | B | LOW_OBSERVED_VISIBILITY | investigate-visibility | 60.0 | not estimable |
| Themed quiz nights (cl_0002) | charity quiz night near me | 10 to 100 (encoded_band, 2026-09-13) | pg_0003 | | | | B | | hold | 3.0 | not estimable |

The demand column is the head term's own band, not the cluster's. A 1,000 to 10,000 band on
"pub quiz near me" is national: it is not a claim about Stanwell Moor.

## Page performance

| Page | URL | Window | Clicks | Impressions | CTR | Position | Truncated | Unattributed clicks | Export |
|---|---|---|---|---|---|---|---|---|---|
| pg_0001 | https://www.the-anchor.pub/whats-on | 3m | 7 | 1855 | 0.003774 | 5.145 | false | 0 | gsc-3m-p-pg_0001 |
| pg_0002 | https://www.the-anchor.pub/quiz-night | 3m | 0 | 67 | 0 | 5.0791 | false | 0 | gsc-3m-p-pg_0002 |
| pg_0003 | https://www.the-anchor.pub/quiz-night/themed | 3m | 0 | 0 | | | false | 0 | gsc-3m-p-pg_0003 |
| pg_0004 | https://www.the-anchor.pub/music-bingo | 3m | 0 | 4 | 0 | 2.75 | false | 0 | gsc-3m-p-pg_0004 |
| pg_0005 | https://www.the-anchor.pub/cash-bingo | 3m | 0 | 60 | 0 | 15.195 | false | 0 | gsc-3m-p-pg_0005 |

**The single most important number in this plan is a zero.** Across three months, the four game
pages took 0 organic clicks between them. `/whats-on` took 7.

The named queries say where even those 7 came from. Splitting `normalised/gsc-queries.csv` on
whether the query contains "anchor":

| Export | Named queries | Clicks | Impressions | Brand queries | Brand clicks |
|---|---|---|---|---|---|
| gsc-3m-p-pg_0001 | 47 | 7 | 1855 | 27 | 7 |
| gsc-3m-p-pg_0002 | 29 | 0 | 67 | 2 | 0 |
| gsc-3m-p-pg_0004 | 2 | 0 | 4 | 1 | 0 |
| gsc-3m-p-pg_0005 | 19 | 0 | 60 | 1 | 0 |

All 7 of the clicks are brand clicks. Every organic click any of these pages earned in three months
came from somebody who typed the pub's name, and non-brand search produced none at all. Brand also
dominates the impressions on `/whats-on`: 27 of its 47 named queries carry the pub's name, and they
include every query above 90 impressions.

Position is not the problem, which is what makes this decisive. `/music-bingo` averages 2.75.
`/quiz-night` averages 5.08. Those are first-page positions producing nothing, because the queries
underneath them barely exist: `/quiz-night` was seen 67 times in three months, `/music-bingo` 4.

## Defend and repair

None. No cluster has a brand-flagged head keyword, so no brand or navigational term is in the
repair queue. Worth noting for the next run: the brand terms are the only ones performing, at
position 2 or better, and they are the site's real search asset.

## Primary page targets, secondary and question terms, local terms

Deliberately not issued this run. Handing over target terms would imply the pages should be
rewritten around them, and the evidence does not support that: these pages already hold positions
2 to 5 for the terms they target, and the terms have almost no volume in this area. Reassigning
them to different keywords would be rearranging the same problem. The four `investigate-visibility`
tickets come first, and target terms follow whatever they find.

No local terms section: `config.gbp.enabled` is off for this run, so no Google Business Profile
data was pulled and no local claim can be evidenced.

## Avoid list

- term "live music": Live music is discontinued in full, owner-confirmed 11 August 2026 (docs/SSOT.md section 10). (scope all)
- term "open mic": Open mic is discontinued (docs/SSOT.md section 10, Retired entertainment formats). (scope all)
- term "drag show": Drag cabaret is discontinued, owner-confirmed 9 August 2026; Music Bingo is the only drag night, so drag bingo stays eligible. (scope all)
- term "drag cabaret": Drag cabaret is discontinued, owner-confirmed 9 August 2026 (docs/SSOT.md section 10). (scope all)
- term "games night": Nikki's Games Night is discontinued as a public format (docs/SSOT.md section 10). (scope all)
- term "free pub quiz": The quiz is 3 pounds a player (docs/SSOT.md section 10); a free-quiz target misleads. (scope cl_0001)
- term "quiz questions": Question-writing intent from people running their own quiz, not people coming to one. (scope cl_0001)
- term "how to run": Operator intent (running your own quiz or bingo), not attendance. (scope all)
- term "online bingo": Remote gambling intent; The Anchor runs in-person bingo only. (scope all)
- term "bingo hall": Unqualified bingo searches belong to bingo clubs such as Buzz Bingo Feltham (tasks/keyword-plan-game-nights-2026-08-17.md); The Anchor is not a bingo hall. (scope cl_0004)
- term "bongo": Bongo's Bingo is another operator's club-night brand; its searchers want that brand, not a pub bingo night. Added 11 September 2026 after the auto-fill picked it as the cash bingo head term. (scope all)
- term "wedding": Owner declined wedding receptions (docs/SSOT.md banned claims). (scope all)

Two queries in this run's data are live examples of why the list exists. `/whats-on` was still
being served for "where to find live music pubs in heathrow" (68 impressions, position 26.62) and
"where to find live music pubs in heathrow airport" (55 impressions, position 50.62), months after
live music was retired. Those are 123 impressions we should not want.

## Per-cluster guidance

**No named query matched any cluster's `query_regex` this run.** `join-performance.py` reports 0
named queries joined across all five clusters, while the exports hold 97 query rows. That is a
mapping fault, not an absence of data, and it is the first thing to fix: until the regexes match
the language people actually use, cluster-level evidence cannot be built. Compare what the clusters
expect with what arrived: `/cash-bingo` was found by "pub bingo near me" and "cash bingo near me",
`/quiz-night` by "trivia night in surrey", "pub quiz near me" and "the anchor pub quiz".

**Pub quiz (cl_0001), priority 90.0, investigate-visibility.** 67 impressions, 0 clicks, average
position 5.08. The non-brand queries are regional rather than local: "trivia night in surrey" (15
impressions, position 3.33) and "trivia night in london" (5, position 11). Investigate whether a
first-page position on 50 non-brand impressions is worth any further work at all, or whether this
cluster should be held like cl_0002.

**Music bingo (cl_0003), priority 60.0, investigate-visibility.** 4 impressions in three months at
position 2.75. The page ranks near the top of page one and is seen four times. There is nothing to
optimise here; the question is whether the term exists in this area.

**Cash bingo (cl_0004), priority 60.0, investigate-visibility.** 60 impressions, 0 clicks, average
position 15.2. Its head term "pub bingo near me" brought 31 impressions at position 22.48, which is
page three. This is the one cluster where position is genuinely the constraint, so it is the only
one where a ranking improvement could plausibly change the number.

**What's on and pub events (cl_0005), priority 60.0, investigate-visibility.** 1,855 impressions
and 7 clicks. Most of those impressions are brand queries sitting at position 2, where the pub is
being shown for its own name and the searcher goes elsewhere, most likely to the homepage or the
Google Business Profile. Investigate which result those searchers actually take. If they are
landing on the pub by another route, this is not a loss and the CTR reads as alarming for no
reason.

**Themed quiz nights (cl_0002), priority 3.0, hold.** No data at all: 0 impressions. The page was
first published on 21 August 2026 and existed for 24% of the window, below the 50% floor, so decay
and low visibility are suppressed and no conclusion is drawn. Leave it alone and read it next run.

## Backlog for approval

**Pre-approved small fixes:** none proposed.

**Approval required:**

| Ticket | Cluster | Page | Action | Priority | What it does |
|---|---|---|---|---|---|
| tk_000001 | cl_0001 | pg_0002 | investigate-visibility | 90.0 | Pub quiz |
| tk_000002 | cl_0003 | pg_0004 | investigate-visibility | 60.0 | Music bingo |
| tk_000003 | cl_0004 | pg_0005 | investigate-visibility | 60.0 | Cash bingo |
| tk_000004 | cl_0005 | pg_0001 | investigate-visibility | 60.0 | What's on and pub events |

All four are look-first tickets and none changes a page. Each goes to seo-powerhouse with its
evidence rows attached and no expected answer stated.

**Deferred:** cl_0002 (themed quiz nights), held until it has a full window.

**The recommendation that sits above the backlog.** These four tickets are worth running because
they are cheap and they close the question properly. They are not a growth plan, and this run
should not be read as one. Three months of data say organic search is not a channel for the game
nights: 262 non-brand impressions, 0 clicks, at positions that are already good. That is a demand
problem, not a ranking problem, and no amount of on-page work moves it. Deciding what to do about
it is a business decision and belongs with the owner, not in a keyword backlog.

## Handoffs

- tk_000001 to tk_000004 to **seo-powerhouse**, as `investigate-visibility` tickets, each carrying
  its export id, its query rows and its page row. Per the handoff contract, none states an expected
  answer.
- No `plan-page` tickets: the programmatic gate is not met and nothing here suggests more pages.
- No editorial-team tickets: no content brief is issued this run, for the reason given under
  primary page targets.

## Checkpoints due

- **Measurement, 6 to 8 weeks** (8 November to 22 November 2026): the next keyword-plan run, with
  paired pulls on the same five pages. The single question is whether non-brand clicks are still
  zero.
- **Structural, 3 to 6 months** (December 2026 to March 2027): the next expansion, which should
  test whether the cluster set is right at all, given no named query matched a cluster this run.
- Nothing is overdue: this is the first run.

## Data quality and limitations

**Coverage per export**

| Export | Scope | Window | Query rows | Queries truncated | Page rows | Pages truncated | Coverage (clicks) |
|---|---|---|---|---|---|---|---|
| gsc-3m-p-pg_0001 | page-group | 3m (2026-06-12 to 2026-09-11) | 47 | false | 1 | false | 100.0% |
| gsc-3m-p-pg_0002 | page-group | 3m (2026-06-12 to 2026-09-11) | 29 | false | 1 | false | null |
| gsc-3m-p-pg_0003 | page-group | 3m (2026-06-12 to 2026-09-11) | 0 | false | 0 | false | null |
| gsc-3m-p-pg_0004 | page-group | 3m (2026-06-12 to 2026-09-11) | 2 | false | 1 | false | null |
| gsc-3m-p-pg_0005 | page-group | 3m (2026-06-12 to 2026-09-11) | 19 | false | 1 | false | null |

Scope reads "page-group" because the filter was a regex; each one returned a single page, so the
page figures are complete for that page.

**Limiting flags carried from validation**

- `WINDOW_SHORTER` on all five Search Console exports: 12 June to 11 September against the
  requested 5 June to 2 October. Expected preset behaviour. Year-on-year and decay comparisons
  against a typed-date run are not available.
- `UNATTESTED_FACT` on all six pulls: no `attestations.json`. The property and the Keyword Planner
  settings are recorded as unattested. Config values are not attestations.
- `PAGE_TOO_NEW` on pg_0003: first published 21 August 2026, present for 24% of the window.
- `KEYWORDS_NOT_ALL_RETURNED`: 401 of 461 submitted keywords came back under their own text; the
  rest resolved as aliases, collapsed variants or absent.

**Superseded inputs.** An earlier set of exports pulled the same day was discarded before import:
they carried no Country filter and used a "contains" page filter, so three of them returned seven
pages each. None of their figures appears in this plan. A Keyword Planner Forecasts export was also
supplied and was quarantined to `raw/ignored/`; the forecast tab is never used.

**Site events in the window.** Seven, four of them on the game pages themselves:

- 2026-08-11 live-music-open-mic-purged (content-purge): retired pages 301 to /whats-on, so their
  residual traffic lands there from that date. PR #103.
- 2026-08-11 whats-on-live-music-retired (repositioning): live music retired in full, /whats-on
  retitled. PR #103.
- 2026-08-12 game-night-template (redesign): quiz, cash bingo, music bingo and karaoke moved onto
  one shared template with inline booking (4b03f842, 496b321a).
- 2026-08-17 game-pages-rewritten (repositioning): the four game pages rewritten around the
  17 August Keyword Planner data, titles changed (c9176f3d).
- 2026-08-26 listing-event-schema-dropped (redesign): 33 Event objects removed from listing pages
  (bdd8a1e5); rich-result eligibility changed.
- 2026-09-07 event-pages-wave-1 (redesign): event detail pages reworked.
- 2026-09-10 drag-pages-purged (content-purge): retired and 301'd to /whats-on.

Because four of these landed on the game pages between 11 and 26 August, roughly half of this
window describes pages that no longer exist in the form they were measured in. That weakens any
reading of trend within the window. It does not weaken the headline: a rewrite cannot explain zero
clicks on both sides of it.

**Small-number floors.** 20 clicks and 50 impressions. No tag or regression was raised below them,
which is why four clusters carry a tag on the strength of impressions rather than clicks.

**Not measured.** Google Business Profile, which for "near me" intent is where this traffic
actually resolves; paid search; and any channel other than organic web search.

## Sources

Every figure above traces to a file in `runs/2026-09-11-02-targeted/`. Hashes are in
`analysis/validation.json`.

- `raw/gsc-3m-p-pg_0001` to `raw/gsc-3m-p-pg_0005`: the five Search Console exports, unmodified.
- `raw/gkp-volumes-01.csv`: Keyword Planner historical metrics, 403 rows.
- `raw/ignored/`: the quarantined Keyword Planner Forecasts export, unused.
- `normalised/gsc-queries.csv`: 97 query rows, the source of every query figure and the brand split.
- `normalised/gkp-rows.csv`: 403 rows, 401 `encoded_band`, states 231 returned, 83 zero, 88 absent,
  1 collapsed-variant.
- `analysis/page-performance.csv`: the page table.
- `analysis/cluster-performance.csv`: the cluster rows, all with 0 named queries.
- `analysis/diagnostics.csv` and `analysis/backlog.csv`: tags, actions, priorities and the four tickets.
- `analysis/validation.json`: every limiting flag quoted above.
- `analysis/curve.json`: awr-organic-blended, the bundled fallback.
