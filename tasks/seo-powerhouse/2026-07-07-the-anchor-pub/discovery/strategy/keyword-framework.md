# Keyword & Intent Framework — The Anchor, 7 July 2026

**Data honesty:** No GSC/GA4/keyword-tool data was available this run. Demand figures below come from exactly two sources: (a) the June 2026 GSC-backed keyword plans (dated, cited as "June GSC" / "June GKP"), and (b) directional inference from SERP composition (marked inferred). Every **new** target term is marked **blocked on keyword-plan validation** — the orchestrator must run `keyword-plan` before content is written against it. Known June lesson: Google Keyword Planner materially under-reports the hyperlocal Heathrow/Staines terms — trust GSC where the two disagree.

## Cluster table

| # | Cluster | Representative terms | Intent | Page type / owner page | Coverage today | Demand evidence | Tier |
|---|---------|---------------------|--------|------------------------|----------------|-----------------|------|
| 1 | Sunday roast near Heathrow/Staines/Stanwell | sunday roast near heathrow · best sunday roast staines · sunday lunch near me (local) · carvery near heathrow* | Commercial/transactional | Landing: /sunday-roast (+ blog listicle support) | Strong — page + blog guide both surface | June GSC: "best sunday roast in heathrow" 246 impr; Surrey cluster ~500/mo Low comp (June GKP) | **1** |
| 2 | Pub near Heathrow / T5 / terminals | pub near heathrow airport · pub near terminal 5 · pub near heathrow with parking | Commercial/navigational | /near-heathrow + /near-heathrow/terminal-{2,3,5} | Strong | June GSC: /near-heathrow pos 6.8 for "pub near heathrow airport" (dated) | **1** |
| 3 | Private hire — occasions | wake venue near heathrow/staines · christening venue staines · retirement party venue · baby shower venue · engagement party venue | Transactional | /private-hire/* occasion pages (25-page cluster live) | Strong structurally; facts drifting | June finding: wake venue = low-comp win; SERP review: directories only | **1** |
| 4 | Christmas parties (small office) | christmas party venue near heathrow · office christmas party staines · christmas party pub 2026 | Commercial, seasonal (Jul–Oct window) | /christmas-parties (+ /corporate-christmas-parties) | Deep page (4,603 words) | Inferred high seasonal demand from hotel/agent SERP density (no volume data) | **1** (timing) |
| 5 | Function/venue hire generic-local | function room hire near heathrow · function room staines · private party venue | Commercial | /private-hire vs /function-room-hire vs /private-party-venue — **three pages, one intent: cannibalisation risk** | Over-covered/duplicated | June GSC: "pubs with private rooms in staines" 302 impr | **1** (fix, not build) |
| 6 | Corporate events / meetings near LHR | corporate event venue heathrow · team offsite near heathrow · meeting venue with parking | Commercial | /corporate-events | Page live | Inferred medium (hotel/agent SERP density); **blocked on keyword-plan validation** | 2 |
| 7 | Plane spotting Heathrow | plane spotting heathrow · heathrow viewing area · myrtle avenue alternative | Informational → venue sub-intent | 2 blog guides + /plane-spotting-heathrow + /beer-garden | Moat — 2 of top results, AI-cited | Traffic dominance known from June diagnosis (GSC-backed then) | **Protect** |
| 8 | Layover / pre-flight dining | food near heathrow before flight · heathrow layover things to do · pre flight meal · restaurants near heathrow with parking | Commercial long-tail | /pre-flight-meal · /heathrow-layover-dining · /restaurants-near-heathrow | Pages live, June body-copy work partially open | Head term "heathrow restaurants" ~5k (June GKP) but intent-split; long-tail is the winnable slice | 2 |
| 9 | Heathrow hotel guests ("pub near [hotel]") | pub near premier inn heathrow · pub near sofitel T5 … | Commercial micro-intents | 11 /pub-near-*-heathrow pages (shared template since June) | Live; R2 thin-page disposition still open | No demand data; June R2 flagged as possibly thin — **needs GSC before investing** | 3 (hold) |
| 10 | Local villages ("X pub") | staines pub · ashford pub · colnbrook pub · wraysbury pub … | Commercial/local | 12 village pages | Live | No data; local-pack led, not organic-led | 3 (maintain) |
| 11 | Weekly events | quiz night staines · karaoke near me · bingo heathrow | Local/navigational | /whats-on + per-event pages | Live | Inferred low search demand; social/repeat-visit driven | 3 (maintain) |
| 12 | Heathrow parking | cheap heathrow parking · park and fly stanwell | Transactional (direct revenue) | /heathrow-parking (+ terminal subpages) | Deep page | Inferred high demand, brutal competition (official + aggregators); no data | 2 (convert, don't chase head) |
| 13 | Beer garden / dog-friendly / family | beer garden near heathrow · dog friendly pub heathrow · family pub near heathrow | Commercial seasonal | /beer-garden, /dog-friendly-pub-heathrow, /family-friendly-pub-heathrow, /heathrow-family-dining | Live | Inferred medium summer demand; supports clusters 1/2/7 | 2 |

\* "carvery near heathrow" is a **new** term idea — The Anchor is not a carvery; only pursue if keyword-plan validates AND copy can stay honest. Blocked on keyword-plan validation.

## Intent mapping rules

- **Transactional/commercial clusters (1–6, 12, 13)** → landing pages with booking/enquiry CTAs, live prices, schema. Blog supports, never leads.
- **Informational cluster (7, and layover guides in 8)** → blog guides; their job is entity authority + cross-sell links into /book-table, /food-menu, /beer-garden. Protect freshness.
- **Navigational (brand, find-us, whats-on)** → keep accurate; not growth targets.

## Priority tiers (opportunity × effort, commercial weighting)

- **Tier 1 — now:** Clusters 1, 2, 3 (owner priorities with existing surface: fix facts, consolidate, convert) + cluster 5 cannibalisation disposition + cluster 4 (Christmas — booking-window timing makes July the right month to polish and push internally).
- **Tier 2 — next quarter:** Clusters 6, 8, 13 body-copy completion (June open items) + 12 conversion optimisation.
- **Tier 3 — maintain/hold:** 9 (await GSC evidence before more hotel-page investment), 10, 11.
- **Protect (continuous):** Cluster 7 — plane-spotting freshness + accuracy; it feeds the entity that AI answers cite for every other cluster.

## New-term validation queue (for `keyword-plan`)

All blocked on keyword-plan validation; do not write content against these until validated: "corporate offsite near heathrow" variants · "restaurants near heathrow with parking" modifier set · "christmas party venue staines 2026" phrasing set · "wake venue" 2ndary geo set (Ashford, Feltham, Egham) · "carvery near heathrow" (honesty check first) · autocomplete/PAA capture for clusters 1–6 (owner manual step, see serp-snapshots.md).

## Existing validated set (June 2026, reusable)

/sunday-roast, /near-heathrow, /private-hire, /restaurants-near-heathrow already have June keyword plans (.seo-workspace deleted, but highlights preserved in memory/input-summary: Surrey roast cluster ~500/Low; "heathrow restaurants" 5k; "restaurants in staines" 5k; GSC long-tail as above). Re-validate only if page targeting changes.
