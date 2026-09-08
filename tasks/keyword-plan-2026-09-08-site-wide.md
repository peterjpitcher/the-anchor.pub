# Keyword Plan: The Anchor, site-wide  (target country: United Kingdom)

**Source:** Google Keyword Planner, UK / English, Google Search only, Aug 2025 to Jul 2026,
14 Discover exports pulled 8 September 2026. 7,383 unique keywords with data,
132 returning no data. All 12 seed batches from
`tasks/keyword-plan-2026-09-08-seeds.md` ran.

## How to read the numbers

The Ads account has no active spend, so Keyword Planner returns **banded** volume, not
point values. Every figure below is a band:

| Export value | Real meaning |
|---|---|
| 50 | 10 to 100 a month |
| 500 | 100 to 1,000 |
| 5,000 | 1,000 to 10,000 |
| 50,000 | 10,000 to 100,000 |
| 500,000 | 100,000 to 1,000,000 |

Never quote the export value as a search volume. Use the band, and treat every band as
**low confidence** on its own.

**Competition and top-of-page bid are paid signals.** They describe advertiser congestion,
not how hard a term is to rank for organically.

**There is still no organic-difficulty evidence.** Only 3 rows of 7,383 returned an
organic position, and they disagree with what Search Console shows (Keyword Planner puts
`plane spotting heathrow` at position 40.76, while the July GSC review had that blog as
the site's single biggest click earner). The Ads-to-GSC link is not producing usable
organic data. Treat all winnability judgements below as reasoned, not measured.

**The forecast export is paid, not organic.** At £20/day it projects 568 clicks and
36,000 impressions a month at £1.09 CPC. That tells us the cluster is cheap to advertise
against. It says nothing about organic performance and must not be quoted as such.

---

## The finding that should change what we do

**The site is built around Heathrow. The demand is not.**

| Term | Band | Paid competition |
|---|---|---|
| pub near heathrow airport | 100 to 1K | Low (16) |
| pubs near heathrow | 100 to 1K | Low (16) |
| restaurants near heathrow airport | 1K to 10K | Low (21) |
| sunday roast near me | 10K to 100K | Low (29) |
| dog friendly pub near me | 10K to 100K | Low (11) |
| pub with pool table near me | 10K to 100K | Low (11) |
| beer garden near me | 10K to 100K | Low (26) |
| fish and chips near me | 100K to 1M | Low (11) |
| pub food near me | 100K to 1M | Low (20) |
| pubs near me | 1M to 10M | Low (28) |

`sunday roast near heathrow`, `fish and chips near heathrow`, `dog friendly pub near
heathrow`, `family friendly pub near heathrow`, `sports pub near heathrow`,
`beer garden near heathrow` and `private hire pub near heathrow` **all returned no data
at all.** We have named pages for most of them.

**The honest reading, which matters more than the raw gap.** "Near me" volume is national
and Google resolves it by proximity and Google Business Profile, not by page copy. We
cannot "win" a 100K-to-1M term; we can only be the pub Google picks inside our own few
miles. The Heathrow-qualified terms are far smaller but are explicit-location queries
where ordinary organic results still appear, and where we are genuinely the closest
answer.

So the split is:

- **Heathrow-qualified terms stay a page job.** Small, ours, winnable through content.
- **"Near me" terms are a Google Business Profile job.** Categories, attributes, photos,
  posts, review velocity, opening hours. The page is the landing spot, not the lever.
- The mistake to avoid is building more Heathrow-qualified pages for phrasings that
  returned zero demand.

---

## Primary Page Targets

| Page | Head term | Close variants | Demand (GKP band) | Paid signal | Intent | Seasonality | Confidence | Why |
|---|---|---|---|---|---|---|---|---|
| `/sunday-roast` | sunday roast near me | best sunday roast near me · roast dinner near me · sunday lunch near me · pubs with sunday roast near me · pub sunday roast near me | 10K-100K head; supporting cluster 1K-10K | Low (20-29), bids £0.27-0.85 | Transactional | Weekly, Sunday peak | Medium | The largest honestly servable cluster on the site. Beats every Heathrow phrasing by two bands |
| `/fish-and-chips-heathrow` | fish and chips near me | best fish and chips near me · fish and chip shop near me · fish and chips restaurant near me | 100K-1M head | Low (5-11) | Transactional | None material | Medium | Biggest single dish term we can serve. The Heathrow-qualified version has no data, so the page name is fighting its own keyword |
| `/beer-garden` | beer garden near me | beer gardens near me · pub with beer garden near me · pubs with gardens near me · best beer gardens near me | 10K-100K head; variants 1K-10K | Low (13-26) | Transactional | Summer peak | Medium | Real, large, and we have a genuinely distinctive garden |
| `/dog-friendly-pub-heathrow` | dog friendly pub near me | dog friendly pubs near me · pubs that take dogs near me · dog friendly carvery near me | 10K-100K head | Low (11) | Transactional | None material | Medium | Same size band as the roast. `dog friendly pub near heathrow` has no data: the URL targets a phrase nobody types |
| `/pool-darts-pub` | pub with pool table near me | pool table near me pub · bars with pool tables near me · darts pub near me | 10K-100K head; darts 100-1K | Low (11), darts Medium (34) | Transactional | None material | Medium | Surprisingly large. Pool carries the page, darts is a supporting term not a head term |
| `/restaurants-near-heathrow` | restaurants near heathrow airport | places to eat near heathrow · pubs near heathrow · pub near heathrow airport · where to eat near heathrow airport | 1K-10K head | Low (15-21) | Transactional | None material | Medium-High | Confirms the July 2026 read. Still the biggest explicit-location term and still ours to win |
| `/private-hire` | function rooms near me | function room hire near me · pubs with function rooms near me · private function rooms near me · function rooms with bar near me | 10K-100K head; hire variants 1K-10K | Low (17-30), bids £0.59-2.80 | Commercial | None material | Medium | `function rooms near me` is a full band above `function room hire near me`, which the July plan used. Swap the head term |
| `/private-hire/wakes` | wake venue near me | funeral wake venues near me · venues for a wake near me · venues for funeral wakes near me | 100-1K across the cluster | Low (12-17), bids £1.55-6.93 | Commercial, high value | None material | Medium-High | Highest bids on the whole site, which means the highest commercial value per enquiry. Confirms the July read |
| `/karaoke` | karaoke near me | karaoke bar near me · karaoke rooms near me | 10K-100K head | Low (28-32) | Transactional | None material | High | Re-confirms the 17 Aug finding. Still the biggest event term by a distance |
| `/quiz-night` | quiz night near me | pub quiz near me · quiz near me | 1K-10K | Low (3-7), bids £0.60-2.38 | Transactional | None material | High | Unchanged from 17 Aug |
| `/join-our-team` | pub jobs near me | bar staff jobs near me · pubs hiring near me · kitchen porter jobs near me | 1K-10K across four terms | Low (10-25), bids £0.09-0.53 | Transactional | None material | Medium | Four separate 1K-10K terms at almost no advertiser competition. Cheapest under-served cluster we own |
| `/drinks` | cocktails near me | none measured | 10K-100K | Medium (41), bids to £2.41 | Transactional | None material | Low-Medium | Single large term with no supporting research. Needs its own round before acting |

---

## Secondary and Question Terms

Mapped to the page that should carry them. All GKP, 8 Sep 2026.

**`/sunday-roast`**
`vegan sunday roast` (1K-10K, Low 15) · `vegetarian roasts near me` (1K-10K, Low 25) ·
`sunday roast near me dog friendly` (100-1K, Low 9) · `best place for a roast near me`
(1K-10K) · `cheap sunday roast near me` (100-1K) · `sunday roast surrey` (100-1K, Low 27)
· `carvery near me` (10K-100K, Low 26)

**Note on carvery.** `carvery near me` sits in the same band as `sunday roast near me`,
and `toby carvery near me` is 100K-1M. We do not run a carvery: roasts are plated and
carved per plate, not self-served from a counter. Do not chase carvery terms. The SSOT
has no carvery claim and inventing one would be a banned claim.

**`/beer-garden` and `/plane-spotting-heathrow`**
`plane spotting heathrow` (1K-10K, Low 1, essentially no advertiser interest) ·
`heated beer garden near me` · `pubs with nice gardens near me` (1K-10K) ·
`pubs near me with playground` (1K-10K, Low 15)

**`/food-menu` and children**
`pub lunch near me` (10K-100K, Low 23) · `best pub food near me` (10K-100K, Low 18) ·
`pub grub near me` (10K-100K) · `stone baked pizza near me` (1K-10K, Low 15) ·
`vegetarian pubs near me` (1K-10K, Low 24) · `vegan pub food near me` (100-1K) ·
`pubs with vegan options near me` (100-1K)

**`/family-friendly-pub-heathrow`**
`family pubs near me` (1K-10K, Low 22) · `family friendly pub near me` (1K-10K, Low 18)

**`/whats-on`**
`what's on near me today` (10K-100K, **High 97**) · `things to do near me weekend`
(1K-10K, **High 100**) · `things to do near heathrow` (100-1K, Low 12)

The High competition on the what's-on terms is paid congestion from ticketing and listings
sites, not organic difficulty, but it does mean the SERP is crowded with aggregators.
Expect little from these.

---

## Local SEO Terms

The August 2026 finding was that town-modified **game-night** terms return no data. That
does not generalise: town-modified **pub** terms mostly do have data.

| Page | Term | Band | Verdict |
|---|---|---|---|
| `/staines-pub` | staines pub / pubs in staines | 1K-10K, Low 14 | Keep and invest |
| `/windsor-pub` | pubs in windsor / windsor pub | 1K-10K, Low 14-15 | Real demand, but 20+ minutes away and a tourist town with entrenched competitors. Low priority |
| `/egham-pub` | egham pub / pubs in egham | 1K-10K, Low 14 (YoY -90%) | Keep, note the year-on-year fall |
| `/feltham-pub` | feltham pub / pubs in feltham | 100-1K, Low 16 | Keep |
| `/ashford-pub` | ashford pub / pubs in ashford middlesex | 100-1K, Low 8-12 | Keep |
| `/sunbury-pub` | sunbury pub / pubs in sunbury | 100-1K, Low 12-13 | Keep |
| `/colnbrook-pub` | colnbrook pub / pubs in colnbrook | 100-1K, Low 13 | Keep |
| `/horton-pub` | horton pub | 100-1K, Low 21 | Keep |
| `/longford-pub` | longford pub | 10-100, Low 5 | Marginal |
| `/wraysbury-pub` | wraysbury pub | 10-100, Low 2 (YoY -90%) | Marginal |
| `/stanwell-pub`, `/pubs-in-stanwell` | stanwell pub / pubs in stanwell | 10-100, Low 11-12 | Marginal, but it is our own village. Keep on brand grounds |
| `/bedfont-pub` | bedfont pub, pubs in bedfont | **NO DATA** | Nothing to target |
| `/m25-junction-14-pub` | m25 junction 14 pub, pub near m25 junction 14, pubs near m25 junction 14 | **NO DATA** | Nothing to target |

The town SERPs are dominated by named-pub queries (`the swan pub staines`,
`kings arms egham`, `two brewers windsor`, all 1K-10K). Competitors win their town terms
through brand recognition. Our town pages compete on the generic phrasing only.

---

## New cluster found: pubs open on Christmas Day

Not in the original seed list. Discovery surfaced it from the seasonal batch.

| Term | Band | Paid competition |
|---|---|---|
| pubs open christmas day | 1K-10K | Low (1) |
| pub open christmas day near me | 1K-10K | Low (2) |
| pubs near me open christmas day | 1K-10K | Low (2) |
| restaurants open christmas day near me | 100-1K | Low (6) |
| pubs open boxing day near me | 100-1K | Low (0) |
| pubs open new year's day | 100-1K | Low (0) |

Competition indices of 0 to 2 mean almost no advertiser wants these. They are pure
"is anywhere open" intent, they spike hard in December, and **we can answer honestly**:
the SSOT confirms we open 25 December, 12pm to 3pm, drinks only.

**The hard constraint.** No food claim of any kind may attach to 25 December. Not
Christmas dinner, not a festive menu, not a roast, not snacks. The Christmas offer window
ends 20 December. Boxing Day and the days between Christmas and New Year are **not
confirmed** and must not be mentioned until they are.

This is a decision for the owner, not a job to start: see the questions in chat.

---

## Avoid / Negative Keywords

Rejected on evidence, not taste.

- **Carvery, in every form.** `carvery near me` 10K-100K, `toby carvery near me` 100K-1M.
  We do not run a carvery. Not in the SSOT, so not claimable.
- **`fish and chips takeaway near me`** (10K-100K) and the whole delivery cluster
  (`fish chips delivery near me`, `hamburger delivery near me`). We do collection by phone
  only, no delivery. Takeaway terms carry delivery intent; the mismatch will bounce.
- **`halal fish and chips near me`** (1K-10K) and `halal chippy near me`. Not an SSOT
  claim. Do not target without an owner-confirmed halal position.
- **All Sky and TNT sport terms.** `pubs with sky sports near me` 1K-10K,
  `football pubs near me` 10K-100K Medium (43), `pubs to watch football near me` 1K-10K.
  Terrestrial only since January 2025. The football demand is real and it is not ours.
- **`wedding venue hire near me`** (100-1K, Medium 64). No wedding positioning.
- **Gluten-free anything.** NGCI wording only, and never for fish and chips.
- **US noise.** 186 keywords were American phrasings Google fanned out to (thanksgiving,
  labor day, memorial day, Five Guys, prime rib). All returned no UK data, which confirms
  the locale filter held. Ignore entirely.
- **Branded competitor terms** (`kings arms egham`, `two brewers windsor`,
  `the swan pub staines`, `wetherspoon windsor`, `greene king pubs near me`). Never target
  another venue's name.
- **`what's on near me today` / `things to do near me weekend`.** Real volume, but paid
  competition 97-100 and aggregator-owned SERPs. Poor return for the effort.

---

## Per-cluster implementation guidance

### 1. `/sunday-roast`
- **Title:** Sunday Roast Near Me | The Anchor Stanwell Moor
- **H1:** Sunday roast, carved fresh, walk in from 1pm
- **Intent:** someone deciding where to eat this Sunday, usually the same morning.
- **Sections:** the six roasts (live prices), the 1pm to 6pm walk-in window, no pre-order
  needed, dog friendly, free parking, how to book for a group, the 15+ deposit.
- **FAQ terms:** vegan sunday roast, dog friendly sunday roast, cheap sunday roast near me,
  do I need to book, what time is the last sitting.
- **Cannibalisation:** `/blog/best-sunday-roast-surrey` keeps `best sunday roast surrey`
  (100-1K). Do not let the venue page target the Surrey listicle phrasing.

### 2. `/fish-and-chips-heathrow`
- **Title:** Fish and Chips Near Me | The Anchor Stanwell Moor
- **Intent:** a specific dish craving, resolved by proximity.
- **The URL is the problem.** It targets `fish and chips near heathrow`, which has no data,
  while `fish and chips near me` is 100K-1M. Renaming the URL is a 301 decision for the
  owner; the title, H1 and copy can be retargeted now without touching the URL.
- **Never claim:** gluten-free batter, a dedicated fryer, delivery, halal.

### 3. `/private-hire`
- **Head term change:** `function rooms near me` (10K-100K) replaces
  `function room hire near heathrow` from the July plan.
- **Supporting:** pubs with function rooms near me · private function rooms near me ·
  function rooms with bar near me · small function rooms near me · halls to hire near me
  (10K-100K, Low 29).
- **Cannibalisation:** the occasion sub-pages must not repeat the generic head term.

### 4. Private-hire occasion sub-pages: rename the targets
Almost every "[occasion] venue hire" phrasing our sub-pages are named after **returned no
data**: `christening venue hire`, `baby shower venue hire`, `baby shower venue near me`,
`retirement party venue hire`, `anniversary party venue hire`,
`milestone birthday party venue`, `private party venue hire near me`,
`room hire for a birthday party`.

The demand is real but phrased differently:

| Sub-page | Target this instead | Band |
|---|---|---|
| `/private-hire/gender-reveal` | gender reveal venues near me | 100-1K, Low 21 |
| `/private-hire/milestone-birthdays` | venue hire for birthday party near me · halls to hire near me for birthday party · hall hire for birthday party near me | 100-1K |
| `/private-hire/engagement-parties` | places for engagement party | 100-1K, Medium 43 |
| `/private-hire/christenings` | (no measured demand in any phrasing) | none |
| `/private-hire/baby-showers` | (no measured demand in any phrasing) | none |
| `/private-hire/retirement-parties` | (no measured demand in any phrasing) | none |
| `/private-hire/anniversary-parties` | (no measured demand in any phrasing) | none |

Four of the ten sub-pages have no measurable search demand under any phrasing tested.
That does not automatically make them worthless: they may still convert visitors who
arrive from the hub. But they should not receive further SEO investment, and they are
candidates for merging into the hub. Owner decision.

### 5. `/join-our-team`
- **Head term:** pub jobs near me (1K-10K).
- Four 1K-10K terms at competition indices of 10 to 25 and bids under 55p. Nobody is
  competing. We have three pages already built.
- **Sections:** current vacancies, what the shifts look like, how to apply, where we are
  and the free parking (a genuine differentiator for staff near Heathrow).

### 6. `/live-sport` and its four sub-pages
Honest targets only, and they are small: `pubs showing six nations near me` (100-1K,
competition 0), `six nations pub near me` (100-1K), `world cup pub near me` (100-1K),
`pubs showing rugby near me` (100-1K), `darts pub near me` (100-1K).
`f1 pub near me` and `boxing pub near me` are 100-1K with medium competition, and
`pub showing f1`, `pub showing boxing`, `pub showing six nations` are all 10-100.

The 10K-100K sport demand is Sky and TNT football, which we cannot serve. Recommend no
further investment beyond keeping the pages accurate. Owner decision on trimming.

---

## Editorial-team handoff

Priority order, highest expected return first.

1. **`/sunday-roast` retarget.** Mode: edit existing. Primary `sunday roast near me`
   (10K-100K, Low 29). Secondary: vegan sunday roast, dog friendly, cheap, best.
   Content type: money page. Must not claim carvery. Prices live from the management DB.
   Internal links: `/book-table`, `/food-menu`, `/beer-garden`.
2. **`/fish-and-chips-heathrow` retarget.** Mode: edit existing. Primary
   `fish and chips near me` (100K-1M, Low 11). Must not claim gluten-free, delivery or
   halal. Fix the Product schema flagged in the September GSC audit at the same time.
3. **`/private-hire` head-term swap.** Mode: edit existing. Primary
   `function rooms near me`. Keep the July FAQPage schema.
4. **Private-hire occasion retargets.** Mode: edit existing, three pages only
   (gender reveal, milestone birthdays, engagement parties).
5. **`/join-our-team`.** Mode: edit existing. Primary `pub jobs near me`.
6. **`/dog-friendly-pub-heathrow` and `/pool-darts-pub` retargets.** Mode: edit existing.
   Both currently aim at Heathrow-qualified phrasings with no data.

---

## Measurement plan

**Baseline is missing.** No Search Console export was pulled in this session, so there is
no current baseline for these terms. Before any of the retargets ship, pull GSC
impressions, clicks and average position for the head terms above, over the last 28 days
and the last 3 months, and record them in this file.

- **Review window:** 6 to 8 weeks after each retarget ships.
- **What confirms success:** impressions rising means the retarget reached the right
  query set; CTR rising means the title and description match the intent; position is the
  slowest to move and the least useful early signal.
- **The near-me caveat.** For proximity-resolved terms, GSC will show us against the
  "near me" query only within our catchment. Do not read low national impressions as
  failure.

---

## Rationale

The data reorders the site's priorities. The Heathrow framing that shapes most of our page
names and URLs turns out to have a fraction of the demand of the plain-English terms for
the same things, and seven Heathrow-qualified phrasings we have built pages around return
no data at all. The biggest honestly servable clusters are the roast, fish and chips, the
beer garden, dogs and the pool table, all of which we already have pages for and all of
which are currently aimed at the wrong phrasing. Meanwhile two genuinely uncontested
clusters sit unclaimed: pub recruitment, and the December "is anywhere open" searches that
our drinks-only Christmas Day hours can answer honestly.

---

## GSC baseline: regex filters

Search Console uses RE2. No lookaheads, no backreferences. `(?i)` makes a pattern
case-insensitive regardless of the case toggle. "Matches regex" is a partial match, so no
anchoring is needed.

Path: Performance, Search results, + New, Query, Custom (regex), Matches regex.

| Cluster | Query regex |
|---|---|
| Sunday roast | `(?i)(sunday (roast\|lunch\|dinner)\|roast dinner\|sunday carvery)` |
| Fish and chips | `(?i)(fish (and\|&\|n) chips\|chippy\|chip shop)` |
| Beer garden | `(?i)(beer garden\|pub garden\|garden pub\|pubs? with .{0,15}garden)` |
| Dog friendly | `(?i)dog.{0,3}friendly` |
| Pool and darts | `(?i)(pool table\|\bdarts\b)` |
| Heathrow, all | `(?i)(heathrow\|terminal ?[2-5])` |
| Heathrow dining only | `(?i)(heathrow\|terminal ?[2-5]).{0,30}(restaurant\|eat\|food\|pub\|dining\|dinner\|lunch)\|(restaurant\|eat\|food\|pub\|dining\|dinner\|lunch).{0,30}(heathrow\|terminal ?[2-5])` |
| Private hire | `(?i)(function room\|venue hire\|private hire\|party venue\|halls? to hire\|room hire)` |
| Wakes | `(?i)(funeral\|wake venue\|venues? for .{0,5}wake\|wake reception)` |
| Occasions | `(?i)(gender reveal\|birthday party\|engagement party\|christening\|baby shower\|retirement (party\|do)\|anniversary party)` |
| Karaoke | `(?i)karaoke` |
| Quiz and bingo | `(?i)(quiz\|trivia\|bingo)` |
| Recruitment | `(?i)(job\|vacanc\|hiring\|recruit\|bar staff\|kitchen porter)` |
| Drinks | `(?i)(cocktail\|drinks menu)` |
| Towns | `(?i)(staines\|stanwell\|ashford\|bedfont\|colnbrook\|egham\|feltham\|horton\|longford\|sunbury\|windsor\|wraysbury)` |
| Open on the day | `(?i)(open .{0,15}(christmas\|boxing day\|new year)\|(christmas\|boxing day\|new year).{0,15}open)` |
| Live sport | `(?i)(six nations\|world cup\|football\|rugby\|formula ?1\|\bf1\b\|sports? (pub\|bar)\|watch the match)` |

Boxing is deliberately absent from the sport pattern: it collides with Boxing Day, and RE2
has no negative lookahead to separate them. Pull boxing separately with
`(?i)boxing (match\|fight\|on tv)` if it is needed.

### Do not baseline from the query tab alone

A query-filtered export puts the numbers in `Queries.csv`, which covers only traffic above
Google's anonymisation threshold. On the 5 September 2026 Christmas export that tab held
**4 of 69 clicks**: 94% were invisible. A query-regex baseline will therefore understate
clicks badly and is a biased sample of the machine-heavy tail.

**For a baseline that sums correctly, filter by Page instead and read `Pages.csv`:**

```
(?i)/(sunday-roast|fish-and-chips-heathrow|beer-garden|dog-friendly-pub-heathrow|pool-darts-pub|restaurants-near-heathrow|private-hire|karaoke|quiz-night|join-our-team|drinks)
```

Use the query regexes to see **which phrasings** we surface for, and the page regex to
record **how much traffic** each page actually earns. Do not mix the two sets of totals.

---

# GSC baseline, pulled 8 September 2026

34 exports: 16 query clusters and one page filter, each at 28 days and 3 months.
Figures below are the **3-month** window unless stated. Clicks and impressions are quoted
from `Chart.csv` (page-filtered pull) and from `Queries.csv` (query-filtered pulls), which
is the correct source in each case: see the anonymisation note below.

## Page baseline (page-filtered export, 3 months)

Total across the filtered set: **829 clicks / 34,813 impressions.**

| Page | Clicks | Impressions | CTR | Avg position |
|---|---:|---:|---:|---:|
| `/beer-garden` | 470 | 7,739 | 6.07% | 9.1 |
| `/restaurants-near-heathrow` | 98 | 10,816 | 0.91% | 13.5 |
| `/join-our-team/bar-staff` | 61 | 1,017 | 6.00% | 8.7 |
| `/sunday-roast` | 60 | 1,413 | 4.25% | 5.8 |
| `/karaoke` | 18 | 602 | 2.99% | 12.7 |
| `/join-our-team` | 18 | 375 | 4.80% | 8.2 |
| `/private-hire/near/slough-crematorium` | 16 | 922 | 1.74% | 18.6 |
| `/join-our-team/kitchen-team` | 15 | 1,665 | 0.90% | 10.2 |
| `/private-hire` | 12 | 1,211 | 0.99% | 22.9 |
| `/pool-darts-pub` | 11 | 486 | 2.26% | 9.6 |
| `/private-hire/gender-reveal` | 9 | 347 | 2.59% | 10.9 |
| `/private-hire/wakes` | 5 | 4,046 | 0.12% | 34.0 |
| `/fish-and-chips-heathrow` | 5 | 655 | 0.76% | 10.3 |
| `/drinks` | 3 | 698 | 0.43% | 12.5 |
| `/dog-friendly-pub-heathrow` | 3 | 535 | 0.56% | 13.7 |
| `/quiz-night` | 3 | 340 | 0.88% | 12.1 |
| `/private-hire/christenings` | 1 | 164 | 0.61% | 31.0 |
| `/private-hire/milestone-birthdays` | 1 | 56 | 1.79% | 25.0 |
| `/private-hire/baby-showers` | 1 | 48 | 2.08% | 15.8 |

28-day window for the same set: **271 clicks / 12,151 impressions.**

## Query-cluster baseline (3 months / 28 days)

| Cluster | Clicks 3mo | Impr 3mo | Clicks 28d | Impr 28d |
|---|---:|---:|---:|---:|
| Heathrow (all) | 1,742 | 79,698 | 569 | 22,189 |
| Towns | 501 | 9,283 | 146 | 3,239 |
| Beer garden | 58 | 1,270 | 19 | 366 |
| Recruitment | 27 | 1,693 | 3 | 250 |
| Sunday roast | 19 | 2,572 | 3 | 800 |
| Fish and chips | 11 | 693 | 4 | 198 |
| Occasions | 4 | 1,000 | 2 | 514 |
| Wakes and funerals | 2 | 2,629 | 1 | 1,011 |
| Karaoke | 2 | 86 | 2 | 53 |
| Quiz and bingo | 1 | 345 | 1 | 166 |
| Pool and darts | 1 | 41 | 0 | 19 |
| **Dog friendly** | **0** | **966** | **0** | **323** |
| **Private hire / function rooms** | **0** | **1,064** | **0** | **196** |
| Drinks and cocktails | 0 | 5 | 0 | 1 |
| Open on the day (Christmas etc.) | 0 | 1 | 0 | 1 |
| Live sport | **filter broken, no data** | | | |

## Corrections to the keyword plan above

**1. "The site is built around Heathrow, the demand is not" was too strong.**
Heathrow queries earn **1,742 clicks and 79,698 impressions in three months**, far and away
the site's biggest source. The accurate, narrower claim is this: that traffic is
**plane spotting and tourism, not dining**. The top Heathrow queries are
`plane spotting heathrow` (125 clicks, position 5.0), `things to do near heathrow airport`
(94, position 5.1), `heathrow viewing area` (94, position 3.3) and
`heathrow plane spotting` (89, position 4.4). The commercial dining terms sit far below:
`places to eat near heathrow airport` 17 clicks, `restaurants near heathrow airport`
16 clicks on 898 impressions at position 9.1. So Heathrow is not the wrong strategy, it is
a **tourism** strategy that currently converts poorly into covers.

**2. The town pages do not work, and GKP alone would have told us to invest in them.**
`/staines-pub` earns **1 click from 1,468 impressions at position 10.4**, a CTR of 0.07%.
`/windsor-pub` gets 10 clicks at position 22.8, `/feltham-pub` 2 clicks at position 9.1.
Meanwhile the town cluster's 501 clicks are almost entirely **branded**:
`the anchor stanwell moor` 193, `the anchor staines` 88, `the anchor stanwell` 52. The
genuinely non-branded town terms earn almost nothing (`pubs in wraysbury` 7,
`pubs in stanwell` 5).

The plan above said "keep and invest" for Staines on the strength of its 1K-10K band. That
was wrong. We are already visible for those terms and nobody clicks. This is a snippet and
intent problem, not a coverage problem, and it should be treated as a CTR job, not as a
reason to build more town content.

**3. Recruitment is already working, not untapped.** `/join-our-team/bar-staff` is the
site's third-best page: 61 clicks at 6.00% CTR. The three job pages together earn 94
clicks. The recommendation stands, but as "extend something that works" rather than
"start something new".

## Two CTR failures worth more than any new page

- **`/restaurants-near-heathrow`: 10,816 impressions, 98 clicks, position 13.5.** The
  single biggest pool of wasted impressions on the site. Position 13.5 is page two.
- **`/private-hire/wakes`: 4,046 impressions, 5 clicks, position 34.0.** Page four. The
  July 2026 plan targeted this page and it has not moved.
- `/dog-friendly-pub-heathrow` and the whole dog-friendly query cluster: **0 clicks on 966
  impressions**. We appear and are never chosen.

## Method note: which tab to trust

With a **page** filter, `Chart.csv` and `Pages.csv` carry every click, while `Queries.csv`
holds only the non-anonymised subset. In this pull that gap was **829 clicks (Chart) versus
141 (Queries tab)**: 83% of clicks came from anonymised queries.

With a **query** filter, Chart and Queries match exactly, because the filter can only
operate on queries Google is willing to name. A query-filtered export is therefore
**entirely** the visible subset, and its totals are a floor, never a census.

## Known gap

The live-sport regex was supplied with a **stray tab character** after the `+`, so
Search Console matched a literal tab and returned zero rows in both windows. Re-run with:

```
(?i)(six nations|world cup|football|rugby|formula ?1|\bf1\b|sports? (pub|bar)|watch the match)
```

Until that lands there is no traffic evidence for `/live-sport` or its four sub-pages.
