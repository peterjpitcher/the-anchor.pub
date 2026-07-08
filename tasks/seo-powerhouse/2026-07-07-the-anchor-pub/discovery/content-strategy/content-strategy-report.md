# Content Strategy Report — The Anchor (www.the-anchor.pub)

- **Agent:** Content Strategist (seo-powerhouse Full Overhaul)
- **Date:** 7 July 2026
- **Data track:** WITHOUT-DATA — no GSC, GA4, CrUX or SEO-tool data this run. All demand and cannibalisation verdicts are inferred from crawl evidence, the codebase, and manual SERP intent checks; confidence is capped accordingly and no volumes, rankings or traffic figures are stated.
- **Evidence base:** `evidence/url-inventory.csv`, `evidence/page-metadata.csv`, `evidence/technical-signals.csv`, `evidence/internal-link-issues.md`, `evidence/internal-link-summary.csv`, `evidence/broken-internal-links.csv`, `evidence/audit-summary.md`, codebase at `/Users/peterpitcher/Cursor/OJ-The-Anchor.pub`, `docs/SSOT.md`, `SSOT.json`, `inputs/input-summary.md`. Strategy Lead output was not yet available when this report was written; findings are built directly from evidence.
- **Word-count caveat:** `word_count` in `url-inventory.csv` includes template boilerplate; figures are comparable within a template, not absolute copy lengths.

---

## 1. Content Inventory Summary

240 URLs crawled (0 fetch errors), 189 in the sitemap. Distribution against the three commercial priorities (evidence: `evidence/audit-summary.md` template table, `evidence/url-inventory.csv`):

| Cluster | Pages | State |
|---|---|---|
| **Sunday roast / food** | /sunday-roast (wc 2,249), /food-menu (3,056), /pizza-menu, food-menu/gluten-free, /vegan + 8 indexable food blog posts | Strong. FAQPage schema on all money pages. Cannibalisation risk inside the cluster (see §6). |
| **Private hire** | /private-hire pillar (wc 2,002) + 8 occasion pages + 15 `/private-hire/near/*` landmark pages + /function-room-hire + /private-party-venue + /corporate-events + /christmas-parties (4,603) + /corporate-christmas-parties + ~14 support blog posts | Broadest cluster on the site (25+ URLs). Biggest overlap risk: /private-hire vs /function-room-hire target the same head term (§6.1). Pillar has **no FAQ block / FAQPage schema** — the only priority money page without one. |
| **Events / whats-on** | /whats-on (1,233) + evergreen pages (quiz-night, music-bingo, cash-bingo, karaoke, live-music, live-sport) + dated `/events/*` pages (Event schema present) | Healthy. Evergreen + dated-event split is correct. One legacy defect: /blog/sports-update (§5). |
| **Near-Heathrow (traffic engine)** | /near-heathrow pillar (1,813) + 4 terminal pages (1,945–2,216) + /restaurants-near-heathrow (2,359) + layover/pre-flight/family/fish-chips/luggage/coach-parking + 11 `/pub-near-*-heathrow` hotel pages + /heathrow-hotels-pub + /plane-spotting-heathrow + ~15 blog guides | Dense to the point of internal competition. 11 hotel pages are near-duplicates from one template (§5.3). Two family-dining pages duplicate each other (§6.2). |
| **Local town pages** | 14 `{town}-pub` pages (wc 1,194–1,733) + /pubs-in-stanwell | Serviceable local coverage; differentiated titles; no action beyond linking. |
| **Blog** | 63 indexable posts (43 dated 2026, 1 from 2025, 19 undated in frontmatter), 79 deliberately `noindex: true` archive posts, 26 tag pages (all noindexed per June work) | Corpus is in good shape after the June refresh: min indexable post wc 806, median 2,403; zero posts under 800 words; no stale-year titles. |

**June-2026 open editorial items — verification (brief requirement):**

| June open item | Status verified 7 Jul 2026 | Evidence |
|---|---|---|
| Body copy owed for /near-heathrow, /restaurants-near-heathrow, /private-hire | **DONE.** wc 1,813 / 2,359 / 2,002 with substantive H2 structures and FAQ sections (private-hire lacks FAQ — see F6) | `url-inventory.csv`, `page-metadata.csv` h2 columns |
| 6 seasonal evergreen rewrites (easter-sunday, mothers-day, fathers-day, valentines-day, halloween, new-years-eve) | **DONE.** wc 1,100–1,595, all using the A11 `SeasonalDynamicDetails` system | `app/valentines-day/page.tsx:10` imports `@/components/seasonal/SeasonalDynamicDetails`; url-inventory wc |
| R2 thin-hotel-page disposition | **STILL OPEN.** 11 pages live, near-identical (§5.3) | `app/pub-near-hilton-heathrow/page.tsx` (23 lines — name/slug only), `components/features/HotelProximityPage.tsx` |
| "/restaurants-near-heathrow 9 draught beers" claim | **FIXED** on that page ("a good range of draught lagers and beers", `app/restaurants-near-heathrow/page.tsx:450`). **New drift found:** /our-pub names "seven draught lines" with specific brands + "Pints start from £4.95" (`app/our-pub/page.tsx:398`), against SSOT.json `drinks/stock_summary/draught`: "Use POS/API before naming current draught products." |
| 2 content files with hardcoded prices | **WORSE THAN RECORDED.** 4 app pages + ~10 indexable blog posts carry hardcoded food/drink prices (F3) | grep evidence in §5.1 |
| 2 blog posts missing from sitemap | **RESOLVED-WITH-DEFECT.** Both 301 to `/blog/eating-near-heathrow-prices-compared`, which is `noindex: true` — a redirect into a noindexed target (F7) | `technical-signals.csv` rows for both URLs; `content/blog/eating-near-heathrow-prices-compared/index.md` frontmatter |

---

## 2. Keyword Cluster Analysis

No volume/difficulty figures are available this run — Difficulty and Opportunity are **inferred** from SERP composition (manual intent checks, 7 Jul 2026) and page evidence, per the shared contract. Validated keyword targets for new/rewritten pages are **blocked on keyword-plan validation**.

| Cluster | Representative terms | Intent | Difficulty (inferred) | Current coverage | Opportunity | Priority |
|---|---|---|---|---|---|---|
| Sunday roast near Heathrow / Staines / Surrey | sunday roast near heathrow, best sunday roast staines, sunday lunch near heathrow | Commercial/transactional | Low-medium — SERP is local pubs + Tripadvisor + listicles; site already surfaces multiple URLs (SERP check §3) | /sunday-roast + 3 blog posts | Consolidate roles, fix stale snippets, protect walk-in message | **P1** |
| Function room / private hire near Heathrow & Staines | function room hire near heathrow, private hire pub staines, party venue near heathrow | Commercial/transactional | Medium — directories (BigVenueBook, UseYourLocal) + hotels dominate; a differentiated pub page can win (SERP check §3) | /private-hire, /function-room-hire, /private-party-venue + blogs | Resolve head-term duplication; add FAQ/answer block to pillar | **P1** |
| Occasion + landmark private hire | wake venue near [crematorium], christening reception near [church], baby shower venue heathrow | Transactional, high-consideration | Low — few venues target these; directories weak | 8 occasion + 15 near/* pages, wc 1,452–1,585, differentiated titles | Maintain; expand thin /private-hire/retirement-parties (wc 1,096) | P2 |
| Events near Heathrow | quiz night near heathrow, bingo near me, karaoke pub | Transactional/local | Low | Evergreen pages + dated event pages with Event schema | Keep; add FAQPage to /whats-on | P3 |
| Eat near Heathrow (travellers) | restaurants near heathrow, where to eat near heathrow, food near terminal 5 | Commercial/informational mixed | Medium-high — airport official pages + Tripadvisor | /restaurants-near-heathrow + terminal pages + blog guides | Already strong; AEO extraction blocks (§9) | P2 |
| Pub near [Heathrow hotel] | pub near hilton heathrow, pub near premier inn heathrow | Navigational-commercial, very long tail | Low competition, low individual demand (inferred, no volume data) | 11 near-duplicate template pages + /heathrow-hotels-pub | Differentiate or consolidate — current state is doorway-pattern risk | P2 |
| Plane spotting Heathrow | heathrow plane spotting, where to watch planes heathrow, myrtle avenue | Informational→visit | Medium — YouTube/forums/guides | /plane-spotting-heathrow + /blog/heathrow-plane-spotting-locations (2026, merged June) | Protect; prime AI-citation target (§9) | P2 (protect) |
| Heathrow practical (parking, layover, luggage) | cheap parking near heathrow, heathrow layover what to do | Commercial/informational | Medium | /heathrow-parking + blog guides | Maintain freshness discipline (dated claims already present) | P3 |
| Local town pub | pub in staines, stanwell moor pub, pub near ashford | Navigational/local | Low | 14 town pages | Add roast/private-hire contextual links (internal-link fix) | P3 |

---

## 3. SERP Snapshot

Manual checks, **intent and competitor composition only** (shared contract: no volume/difficulty/position claims from manual checks). Location: results as served to a US-region search API, so local-pack composition is not verifiable this run — noted as a limitation.

| Field | Check 1 | Check 2 |
|---|---|---|
| Query | "sunday roast near heathrow airport" | "function room hire near heathrow staines" |
| Date checked | 7 Jul 2026 | 7 Jul 2026 |
| Search location | non-localised API (limitation) | non-localised API (limitation) |
| Top page types | The Anchor's own blog listicle, own money pages, Tripadvisor forum, heathrow.com directory, Heathrow Express listicle | The Anchor money page + blog, venue directories (BigVenueBook, UseYourLocal), hotel meeting pages (Radisson, Hyatt), competitor pub (Swan Staines) |
| Dominant intent | Commercial (find a specific roast venue) | Transactional (shortlist venues, get quote) |
| Notable observation | **The index surfaced the retired URL `/sunday-lunch` with the pre-May-2026 title ("The Anchor - Heathrow Pub & Dining") and stale snippet claims: "£14.99–15.99… pre-ordering by 1pm Saturday with a £5 deposit… served 12pm–5pm".** All contradict SSOT §4 (walk-in 1pm–6pm, no pre-order, no prepayment, live prices). Also surfaced the redirected `/blog/best-places-to-eat-near-heathrow` with its old title. | Old cached title for /function-room-hire ("Venue Hire Near Heathrow \| Function Room Hire Staines \| … Heathrow Pub & Dining") still shown, confirming stale-snippet lag rather than on-site defect. |
| Gap in results | No competitor pub owns "roast near Heathrow" content; directories thin | Directories rank on breadth; no venue page answers price/deposit/parking questions directly in extractable form |
| Can the site compete? | Already visible with multiple URLs — the risk is self-competition and stale snippets, not absence | Yes — visible; differentiation is transparent pricing model + free parking + occasion depth |
| Confidence | Medium (single-check, non-localised) | Medium |

**Implication:** the priority is not new content — it is consolidating which URL owns each head term, and getting stale titles/snippets recrawled (title-template fix F2 will force refreshed snippets sitewide).

---

## 4. Existing Content Assessment (priority pages)

Scored with the content-review-framework rubric (Relevance / Quality / Technical / Competitiveness, 1–5). All scores are manual-inspection based; confidence Medium unless noted.

| Page | R | Q | T | C | Verdict | Notes |
|---|---|---|---|---|---|---|
| /sunday-roast | 5 | 5 | 4 | 4 | **Keep & optimise** | Excellent structure (roast line-up, walk-in message, carvery comparison, FAQs, FAQPage schema). Defect: title contains banned "The Anchor Pub" (F1) and is 85 chars (F2). |
| /restaurants-near-heathrow | 5 | 4 | 4 | 4 | **Keep & optimise** | June body copy landed; terminal-by-terminal directions; FAQPage. Title 84 chars, double brand (F2). |
| /near-heathrow | 5 | 4 | 4 | 4 | **Keep & optimise** | Pillar works; links terminals. Title 81 chars, double brand (F2). |
| /private-hire | 5 | 4 | 3 | 4 | **Keep & optimise** | Only priority money page with **no FAQ section and no FAQPage schema** (`page-metadata.csv` h2 list; `technical-signals.csv` FAQPage=False). H1/title duplicate /function-room-hire's target (F5). |
| /function-room-hire | 4 | 4 | 4 | 3 | **Rewrite (retarget)** | Title "Function Room Hire Near Heathrow \| The Anchor Pub" collides with /private-hire H1 "Function Room Hire Near Heathrow & Staines" (F5) and contains banned phrase (F1). |
| /plane-spotting-heathrow | 5 | 5 | 5 | 4 | **Keep** (protect) | FAQPage present, supported by merged 2026 blog guide. Top AI-citation asset (§9). |
| /whats-on | 4 | 4 | 3 | 4 | **Keep & optimise** | Good hub; no FAQ block/schema; add one for "what's on near Heathrow tonight/this weekend" extraction. |
| /heathrow-family-dining (wc 881) + /family-friendly-pub-heathrow (wc 835) | 3 | 3 | 3 | 2 | **Merge** | Both target "Family Friendly Pub Near Heathrow \| Kids Menu" — near-identical titles (`page-metadata.csv`). Two thin pages splitting one term (F8). |
| 11 × /pub-near-*-heathrow | 3 | 3 | 3 | 2 | **Differentiate or consolidate** | See §5.3 (F4). |
| /private-hire/retirement-parties (wc 1,096) | 4 | 3 | 4 | 3 | **Refresh/expand** | Thinnest occasion page — siblings run 1,516–2,994. |
| /blog/sports-update | 2 | 2 | 2 | 2 | **Redirect (needs approval)** | See §5.2 (F9). |
| /blog/fish-chips-guide | 3 | 3 | 3 | 3 | **Keep & optimise** | Title carries banned "The Anchor Pub" (F1); overlaps /fish-and-chips-heathrow — retitle toward "best fish and chips [local]" guide angle; flagged `soft_404_candidate` in url-inventory (phrase heuristic — verify). |
| /fish-and-chips-heathrow | 4 | 4 | 4 | 3 | **Keep & optimise** | Title leads "Fish and Chips Staines" while URL/H1 say Heathrow — split targeting on one page; pick one primary (Heathrow) and let the blog guide take Staines. |
| Homepage | 4 | 4 | 4 | 4 | **Keep** | Title good (51 chars). H1 "Eat, Drink, Enjoy." carries no keyword — acceptable brand choice, low priority. |

---

## 5. Major Findings

### 5.1 F3 — Hardcoded food/drink prices across live pages and indexable blog posts (SSOT defect)

SSOT.md line 3: *"Never hardcode or quote a price… always pull live."* Found hardcoded **food/drink** prices (deposits/ULEZ/parking are permitted where confirmed):

**App pages (code):**
- `app/m25-junction-14-pub/page.tsx:299–314` — menu list with prices ("Fish & Chips - 14.99", "Beef & Ale Pie - 14.99", "Chicken Goujon Wrap - 9.99", etc.)
- `app/our-pub/page.tsx:398` — "Pints start from £4.95" + names seven specific draught brands (SSOT.json: "Use POS/API before naming current draught products")
- `app/christmas-parties/client-components.tsx:777,815–817` — cheeseboard +£3/£7.95, "All the Trimmings Board (serves 4) - £11.95", "XL … £21.95", "Pigs in blankets (3) - £3.95pp"
- `app/private-hire/engagement-parties/page.tsx:297` — "welcome prosecco packages start at £7.99 per person"

**Indexable blog posts (content/blog/*/index.md):** roast "from £16" and wellington "£20" (best-sunday-roast-near-heathrow, best-sunday-roast-surrey, 50th/60th-birthday posts, vegetarian-pub-food-near-heathrow); pizza "from £11" (pizza-near-heathrow); burgers "from £11/£14" (best-pub-food-near-heathrow — note this URL 301s to the noindexed archive, lower urgency); trimmings boards £11.95/£21.95 (cheap-christmas-parties-heathrow, christmas-party-food-ideas); "unlimited tea and coffee at £4.49 per head" (60th-birthday); quiz "£3 pp / £25 bar tab" (quiz-nights-near-heathrow — event pricing, verify against event records).

**Factual contradictions vs SSOT §7:**
- `content/blog/cheap-christmas-parties-heathrow/index.md` — "£10pp deposit for groups of **six or more**" (SSOT threshold: **10+**).
- `content/blog/christmas-party-venues-heathrow-2026/index.md` — deposit "typically £100–200 depending on group size" (SSOT §12: private-hire deposit **£250**; general policy £10pp at 10+).

Severity High, Known, confidence High. Fix type: **Content process fix** (price-sweep checklist + a lint/test that greps indexable content for `£\d` food-price patterns, mirroring `tests/ssot-drift-guard.test.ts`) plus one-off corrections. Editorial rewrites route to `editorial-team`.

### 5.2 F9 — /blog/sports-update: stale Sky Sports targeting (banned-claim adjacency)

`content/blog/sports-update/index.md` — indexable, in sitemap, dated 2025-01-06, title "Sports Bar Near Heathrow | Sky Sports Update at The Anchor", keywords include "sky sports pub stanwell moor", hero alt text features Sky/TNT logos. The body correctly announces Sky/TNT **ending** Jan 2025, but the page is optimised to attract Sky-sport searchers the venue cannot serve (SSOT banned claim: no Sky/TNT). It is the only pre-2026 indexable post. Verdict: **Redirect** 301 → /live-sport (which correctly positions terrestrial-only). Live indexation change — **requires owner approval** per Pruning Safety Rules; log in Risk Register. Severity Medium, Known, High confidence.

### 5.3 F4 — 11 hotel-proximity pages are near-duplicates (June R2 disposition still open)

Every `/pub-near-*-heathrow` page renders `components/features/HotelProximityPage.tsx` (388 lines) varying only `hotelName`, `shortName`, `slug` and an optional one-phrase `brandNote` (`app/pub-near-hilton-heathrow/page.tsx` is 23 lines). Word counts confirm: 1,492–1,520 across all 11 (`url-inventory.csv`). The template comment itself says per-hotel distances were omitted "because we do not [have verified data]". Plus /heathrow-hotels-pub (wc 1,658) as a 12th page on the same theme.

Without GSC I cannot verify whether Google indexes or ignores them (stated limitation). Options, in order of recommendation:
1. **Differentiate (preferred, protects existing equity):** add verified per-hotel data — drive time from that hotel, typical taxi fare band, nearest terminal(s) the hotel serves, walking feasibility, one hotel-specific FAQ. Requires a small data file; template already structured for it.
2. **Consolidate:** 301 all 11 into /heathrow-hotels-pub with a per-hotel table. Destroys 11 long-tail entry points; only if differentiation is refused. Requires owner approval (indexation change).

Severity Medium, inferred (no indexation data), confidence Medium. Fix type: **Template/system fix**.

### 5.4 F7 — Two legacy blog URLs 301 into a noindexed target

`/blog/best-places-to-eat-near-heathrow` and `/blog/best-pub-food-near-heathrow` 301 → `/blog/eating-near-heathrow-prices-compared`, which is `noindex: true` by design (June archive decision). Redirecting indexed URLs into a noindex page discards their equity — search engines eventually drop both source and target (the old source URL still appears in search results with its stale title, observed 7 Jul 2026 SERP check). The content's indexable owner is `/restaurants-near-heathrow` (the price guide exists to keep that page focused, per its own intro copy). **Repoint both 301s to /restaurants-near-heathrow.** Also update the 20 internal links still pointing at the two legacy URLs (`broken-internal-links.csv`: 10 + 10 rows). Severity Medium, Known, High confidence. One-off fix (redirect map + links).

### 5.5 F1/F2 — Title system: banned phrase in the sitewide default + sitewide truncation

- `app/layout.tsx:66` — **default title is `'The Anchor Pub | Stanwell Moor | Near Heathrow'`** — the SSOT-banned brand form, as the sitewide fallback. 10 pages/posts also carry "The Anchor Pub" in visible metadata: /function-room-hire, /sunday-roast, /private-party-venue, /join-our-team (+2 role variants), /blog/family-friendly-sunday-roast-heathrow, /blog/fish-chips-guide, /blog/ultimate-guide-to-traveling-as-a-digital-nomad-wit, /blog/pub-jobs-heathrow (`page-metadata.csv`).
- `app/layout.tsx:67` — template `'%s | The Anchor Stanwell Moor'` stacks onto page titles that already contain "| The Anchor" (and blog titles that add "| Blog"), producing 102 double-brand titles and **211/240 titles over 60 chars (median 81, p90 96, max 121)** (`page-metadata.csv`). Every SERP snippet truncates; CTR and intent-match suffer sitewide; stale-snippet refresh (F-SERP above) is also gated on this.

Recommended: change template to `'%s | The Anchor'`; strip brand and "| Blog" from page-level `title` strings; fix the default title string. **Template/system fix**, Severity High, Known, High confidence. (Implementation overlaps the on-page/technical specialist — flagged for shared ticket.)

### 5.6 F5/F8 — Cannibalisation inside the two top commercial clusters (see §6)

---

## 6. Cannibalisation Issues

No GSC this run, so no query-split evidence — these are **structural** duplications observed in titles/H1s (`page-metadata.csv`), which is the strongest available signal. Confidence Medium; verify against GSC when access returns before any merge.

| Keyword/topic | Competing pages | Recommended resolution |
|---|---|---|
| "function room hire near heathrow" | /private-hire (H1 "Function Room Hire Near Heathrow & Staines") vs /function-room-hire (H1 "Function Room Hire Near Heathrow") | Two money pages, one head term. Keep /private-hire as the pillar for "private hire pub / venue hire"; **retarget /function-room-hire's title/H1 to "function room" + room-configuration angle it already owns** (Configure Your Space, pricing, capacities) or merge into /private-hire if GSC later shows a split. Do not 301 without data. |
| "family friendly pub near heathrow" | /heathrow-family-dining (881) vs /family-friendly-pub-heathrow (835) | **Merge** into one page (keep the stronger URL /family-friendly-pub-heathrow — exact-match, cleaner), 301 the other, combine content. Indexation change — owner approval + Risk Register. |
| "sunday roast near heathrow" | /sunday-roast (money) vs /blog/best-sunday-roast-near-heathrow (2026 listicle) vs /blog/family-friendly-sunday-roast-heathrow | Deliberate money-page + honest-listicle pattern is legitimate (the listicle can win "best…" intent the landing page can't). Keep both, but: listicle must lead with The Anchor + link the money page prominently (it does); retitle /blog/family-friendly-sunday-roast-heathrow toward "sunday roast with kids" long-tail and remove banned "The Anchor Pub" from its title. |
| "function room hire heathrow pricing/comparison" | /blog/function-room-hire-heathrow-pricing vs /blog/function-room-hire-heathrow-comparison vs /blog/function-room-hire-near-heathrow-staines | Three 2026 posts in one micro-topic. **Merge pricing + comparison into one definitive guide** (301 the weaker), keep the Staines-angle guide distinct. Approval required. |
| "fish and chips near heathrow/staines" | /fish-and-chips-heathrow (money, title says "Staines") vs /blog/fish-chips-guide | Fix the money-page title to lead Heathrow; blog guide takes the "best fish and chips [area]" informational angle. |
| "dog friendly pub near heathrow" | /dog-friendly-pub-heathrow (money) vs /blog/dog-friendly-pub (post with near-identical title) vs 2 dog blog guides | Retitle /blog/dog-friendly-pub to its actual angle (visiting with your dog — walks/tips) or merge into /blog/dog-friendly-walks-near-heathrow. |
| "party venue near heathrow" | /private-party-venue (money) vs /blog/a-personal-pub-for-personal-celebrations ("Best Party Venue Near Heathrow Airport") vs /blog/private-party-venues-near-heathrow | The legacy "a-personal-pub…" post duplicates the newer listicle's target. Merge it into /blog/private-party-venues-near-heathrow (301). Approval required. |
| "pizza near heathrow" | /pizza-menu vs /blog/pizza-near-heathrow | Acceptable money+listicle pair; ensure the blog table's "From £11" price claims are removed (F3). |
| "quiz night near heathrow" | /quiz-night vs /blog/quiz-nights-near-heathrow | Acceptable pair; blog carries £3pp/£25 figures — verify against event records (F3). |

---

## 7. Internal-Link Analysis

Fed by `evidence/internal-link-summary.csv` / `evidence/internal-link-issues.md` (31,875 links; PageRank not computed — networkx import error; no impressions data this run).

| URL | Inbound | Outbound | Orphan? | Impressions | Issue | Recommended link action |
|---|---|---|---|---|---|---|
| (all 240 pages) | ≥1 | — | **0 orphans** | unavailable | None — every page has ≥1 inbound | No action |
| /private-hire | 1,565 | — | no | unavailable | Highest-inbound page on site (nav+footer) — matches P1 priority | Confirm intentional; fine |
| /leave-review | 473 | — | no | unavailable | 473 sitewide links to a page that client-redirects to google.com (wc 20; also 236 rows in `broken-internal-links.csv`) | Footer link is a conversion tool, not SEO — add `rel="nofollow"` or make it a direct external link; technical ticket |
| /cdn-cgi/l/email-protection | 530 | — | no | unavailable | Cloudflare email-obfuscation 404 target (244 broken-link rows) | Technical ticket (not content) |
| /blog/best-places-to-eat-near-heathrow + /blog/best-pub-food-near-heathrow | 10 + 10 | — | no | unavailable | Contextual links point at 301s into a noindexed target (F7) | Update the ~20 links to final owner URL after repointing redirect |
| /blog/plane-spotting-heathrow-guide (9), /blog/pub-jobs-heathrow (6), 16 tag-redirect links | — | — | no | unavailable | Links to redirected URLs | Sweep internal links to final URLs (one pass) |
| /live-sport/world-cup → **/menus** | 1 | — | — | unavailable | Anchor "View Menu" hits a 404 (`broken-internal-links.csv` row; /menus 404 in url-inventory) | Point to /food-menu — one-line fix |
| /food-menu/gluten-free, /food-menu/vegan | 245 each | — | no | unavailable | Anchor text concatenates card title+subtitle ("Gluten-free optionsGluten-free choices…") — template markup issue | Fix card component anchor composition (template fix) |
| Nav/footer sinks (25 pages ≥192 inbound incl. /music-bingo 780, /fish-and-chips-heathrow 710) | — | — | no | unavailable | Boilerplate volume swamps contextual signals; not a defect per se | When adding content links (above), use descriptive varied anchors; no nav surgery recommended this run |

**System observation:** anchor-text concentration is ~100% boilerplate-driven for most targets (`internal-link-issues.md`). The cheapest wins are contextual in-copy links: town pages → /sunday-roast and /private-hire with descriptive anchors; blog guides → occasion pages. These are pre-approved small fixes under the operating model.

---

## 8. Content Architecture Recommendations

1. **Pillar-cluster is already correct on paper** — /private-hire (pillar) → occasions → near/* landmarks; /near-heathrow (pillar) → terminals → traveller pages. The defect is that two pillars (/private-hire, /function-room-hire) claim the same head term (§6.1) — resolve by retargeting, not new pages.
2. **Adopt an explicit "money page + honest listicle" rule** (Content process fix): every commercial term gets at most ONE landing page and at most ONE "best/guide" blog post; the post must name The Anchor first with disclosure and link the landing page in the intro. Several June posts already follow this; the legacy stragglers (§6) don't.
3. **Blog governance is working** — 79 noindexed archive posts, tags noindexed, refreshed 2026 dates. Add two rules: (a) never 301 an indexable URL into a `noindex` target (F7); (b) announcement-style posts (e.g. sports-update) get an expiry action (redirect or noindex) at write time.
4. **URL structure needs no changes.** Do not create new near/* or hotel pages until the existing template-uniqueness question (F4) is settled.
5. **No net-new pages recommended this run.** The site has ~240 URLs for a single pub; every priority cluster has coverage. The wins are consolidation, differentiation, metadata, and answer-block extraction. (Demand-validated gaps, if any, come back through `keyword-plan` — §10.)

---

## 9. AEO / AI-answer readiness (handoff to `ai-seo`)

Pages that should win AI citations, with what's missing (site-wide: FAQPage schema is broadly present; AI crawlers were unblocked in June per input-summary):

| Page / entity | Target AI answers | Missing extractable element |
|---|---|---|
| /plane-spotting-heathrow + /blog/heathrow-plane-spotting-locations | "Where can I watch planes at Heathrow?", "pub with runway views" | Strong already; add a 2–3 sentence quotable summary block naming The Anchor, Myrtle Avenue context, and free parking near the top |
| /sunday-roast | "Sunday roast near Heathrow", "do I need to book a Sunday roast at The Anchor?" | Concise answer block stating walk-in 1pm–6pm, no pre-order — the exact facts the stale SERP snippet gets wrong; dates on claims |
| /near-heathrow + terminal pages | "pub near Terminal 5", "how far is the nearest pub from Heathrow?" | One-line distance/time answer per terminal page top ("The Anchor is ~7 minutes by car from Terminal 5…") in plain extractable prose |
| /restaurants-near-heathrow | "where to eat near Heathrow outside the airport" | Quotable comparison sentence + dated claims; keep prices pointed at live menu |
| /private-hire | "how much does it cost to hire a pub near Heathrow?", "venue deposit?" | **No FAQ at all** — add FAQ + FAQPage covering quote-on-enquiry model, £250 deposit, capacities (SSOT §12), free parking |
| /heathrow-parking | "cheap parking near Heathrow" | Already has dated pricing ("as of February 2026" pattern in blog) — mirror dated-claim pattern on the page |

No "quick answer" block component exists in the codebase (grep: 0 hits in app/components) — the noindexed price-guide post uses a manual blockquote pattern. Recommend a reusable `QuickAnswer` component (Template/system fix) so answer blocks are consistent and schema-matched. Hand the full list + entity map to the `ai-seo` skill.

---

## 10. Content Briefs (top priorities)

Target keywords for every brief are **blocked on keyword-plan validation** (no GSC/volume source this run — orchestrator to run `keyword-plan`, then route writing to `editorial-team`). Briefs are written to be executable the moment keywords are validated.

### Brief 1 — /private-hire FAQ + answer block (One-off page fix; Effort Small)
- **Purpose:** close the only FAQ/schema gap on a P1 money page; earn AI citations for venue-hire cost/deposit questions.
- **Intent:** transactional. **Conversion goal:** enquiry form / phone call.
- **Outline addition:** H2 "Private hire questions, answered" — 6–8 Q&As: cost model (quote-on-enquiry, minimum-spend bands from live approved source — NO hardcoded food prices), £250 deposit (SSOT §12), capacities (10–150; 250 venue max), parking (20 free spaces), accessibility (per SSOT — no accessible-toilet claim), timing/how to book. FAQPage schema matching visible copy. Add a 2-sentence QuickAnswer block above the fold.
- **Internal links:** occasion pages, /function-room-hire, /corporate-events. **Differentiation:** transparent deposit + free parking vs hotel per-head packages.
- **Tone guardrails:** SSOT voice; "The Anchor" only.

### Brief 2 — /function-room-hire retarget (One-off page fix; Effort Medium)
- **Purpose:** stop head-term collision with /private-hire (§6.1).
- **New angle:** the room/space configuration page — capacities, layouts, what's included, room-specific FAQs. Title ≤60 chars, no "The Anchor Pub", primary keyword pending keyword-plan (candidates: "function room hire", "pub function room" variants).
- **Acceptance:** title/H1 no longer duplicate /private-hire; cross-links both ways with distinct anchors.

### Brief 3 — Family pages merge (Merge; Effort Medium; NEEDS APPROVAL — indexation change)
- Merge /heathrow-family-dining into /family-friendly-pub-heathrow; combine kids-menu, garden, terminal-proximity content into one ~1,200-word-unique page with FAQ; 301 the loser; update internal links. Risk: losing whichever URL has backlinks — check backlinks first (Authority agent) per Pruning Safety Rules.

### Brief 4 — Hotel-page differentiation data pass (Template/system fix; Effort Medium)
- Add per-hotel verified fields to `HotelProximityPage`: drive time, taxi fare band, nearest terminal(s), walkability note, 1 hotel-specific FAQ. Owner supplies/verifies data (do not invent distances — the template comment's constraint stands). Acceptance: ≥150 genuinely unique words per page; FAQ mentions the hotel's terminal.

### Brief 5 — Blog price-claim sweep + drift guard (Content process fix; Effort Medium)
- Remove/replace all hardcoded food/drink prices in §5.1 list with "live menu" references (pattern already used in eating-near-heathrow-prices-compared); fix the two deposit contradictions to SSOT §7/§12 wording; extend `tests/ssot-drift-guard.test.ts` (or a sibling test) to fail on `£\d` food-price patterns in indexable content and on "The Anchor Pub" in titles.

### Brief 6 — /blog/sports-update disposition (Redirect; Effort Small; NEEDS APPROVAL)
- 301 → /live-sport. /live-sport already carries the terrestrial-only positioning. Update the 0 internal links (none found beyond nav patterns — verify at implementation).

### Brief 7 — Function-room blog merge (Merge; Effort Medium; NEEDS APPROVAL)
- Merge /blog/function-room-hire-heathrow-pricing + /blog/function-room-hire-heathrow-comparison into one "Function room hire near Heathrow: costs & venue comparison (2026)" guide; 301 the weaker; keep function-room-hire-near-heathrow-staines as the geo variant. All prices as bands sourced from the live approved source only.

### Brief 8 — Title system rewrite (Template/system fix; Effort Medium — shared with Technical)
- `app/layout.tsx`: template → `'%s | The Anchor'`; default title → SSOT-compliant string without "The Anchor Pub". Strip redundant brand/"| Blog" from page metadata titles; retitle the 10 banned-phrase pages (§5.5). Acceptance: 0 titles contain "The Anchor Pub"; ≥90% of titles ≤60 chars; re-crawl confirms.

---

## 11. What was checked and found healthy (no action)

- June body copy for the 3 priority pages: landed (§1 table).
- 6 seasonal evergreen pages: rewritten on the A11 seasonal system; word counts 1,100–1,595; in sitemap.
- Blog corpus: 63 indexable posts, none thin (<800), all dated 2025-2026 in frontmatter, 79-post archive correctly noindexed, tag pages noindexed, tag consolidation redirects in place.
- Occasion + landmark private-hire pages: differentiated titles and venue-specific copy; only retirement-parties is thin.
- Events architecture: Event schema on dated pages and /whats-on; evergreen pages carry FAQPage.
- Zero orphan pages; zero missing-alt images (crawl-wide).

---

```json
{ "findings": [
  { "finding": "Sitewide default title in root layout is 'The Anchor Pub | Stanwell Moor | Near Heathrow' — SSOT-banned brand form as the site fallback; 10 further pages/posts carry 'The Anchor Pub' in titles/H1s (incl. /sunday-roast, /function-room-hire, /private-party-venue)", "evidence": "app/layout.tsx:66; evidence/page-metadata.csv grep 'The Anchor Pub' = 10 URLs", "source": "codebase inspection + collect-site-evidence.py", "dataStatus": "Known", "severity": "High", "confidence": "High", "impactArea": "SEO", "owner": "Content", "effort": "Small", "dependencies": "Developer", "fixType": "Template/system fix", "recommendedAction": "Replace default title string; retitle the 10 pages; add drift-guard test for 'The Anchor Pub' in metadata", "validationStep": "Re-crawl: 0 titles/H1s contain 'The Anchor Pub'", "riskRollback": "None — string changes, revertible" },
  { "finding": "Title template '%s | The Anchor Stanwell Moor' stacks on page titles already containing brand: 102 double-brand titles, 211/240 titles >60 chars (median 81, max 121) — sitewide SERP truncation and stale-snippet persistence", "evidence": "app/layout.tsx:67; evidence/page-metadata.csv title_length distribution", "source": "codebase inspection + collect-site-evidence.py", "dataStatus": "Known", "severity": "High", "confidence": "High", "impactArea": "SEO", "owner": "Content", "effort": "Medium", "dependencies": "Developer", "fixType": "Template/system fix", "recommendedAction": "Template → '%s | The Anchor'; strip redundant brand/'| Blog' from page-level titles", "validationStep": "Re-crawl: ≥90% titles ≤60 chars, 0 double-brand", "riskRollback": "Low — metadata only; keep old strings in git for revert" },
  { "finding": "Hardcoded food/drink prices on 4 live app pages and ~10 indexable blog posts, violating SSOT pricing policy; plus two blog posts contradict SSOT deposit policy ('£10pp for six or more' vs 10+; 'deposit £100–200' vs £250 private-hire deposit)", "evidence": "app/m25-junction-14-pub/page.tsx:299-314; app/our-pub/page.tsx:398; app/christmas-parties/client-components.tsx:815-817; app/private-hire/engagement-parties/page.tsx:297; content/blog/{best-sunday-roast-near-heathrow,best-sunday-roast-surrey,50th/60th-birthday-party-ideas-venues,pizza-near-heathrow,cheap-christmas-parties-heathrow,christmas-party-food-ideas,vegetarian-pub-food-near-heathrow,quiz-nights-near-heathrow}/index.md; docs/SSOT.md:3,191-194,359", "source": "codebase grep + docs/SSOT.md", "dataStatus": "Known", "severity": "High", "confidence": "High", "impactArea": "revenue", "owner": "Editorial", "effort": "Medium", "dependencies": "Content team; live-price source for replacement copy", "fixType": "Content process fix", "recommendedAction": "Price-sweep all listed files to live-menu references; correct the two deposit claims to SSOT wording; extend ssot-drift-guard test to catch £-price patterns in indexable content", "validationStep": "Grep returns 0 food/drink £-prices in indexable content; drift-guard test passes", "riskRollback": "None — copy edits, revertible" },
  { "finding": "/private-hire and /function-room-hire both target 'Function Room Hire Near Heathrow' in title+H1 — two money pages competing for the P1 private-hire head term", "evidence": "evidence/page-metadata.csv: /private-hire H1 'Function Room Hire Near Heathrow & Staines', /function-room-hire H1 'Function Room Hire Near Heathrow'", "source": "collect-site-evidence.py", "dataStatus": "Known", "severity": "High", "confidence": "Medium", "impactArea": "SEO", "owner": "Content", "effort": "Medium", "dependencies": "keyword-plan validation; GSC (when available) to confirm split", "fixType": "One-off page fix", "recommendedAction": "Retarget /function-room-hire to room/space-configuration angle; keep /private-hire as head-term pillar; do not 301 without query data", "validationStep": "Titles/H1s no longer duplicate; GSC (when available) shows one URL per query", "riskRollback": "Retitle only — revert strings if rankings wobble" },
  { "finding": "11 /pub-near-*-heathrow hotel pages are near-duplicates: only hotelName/shortName/slug/one-phrase brandNote vary in a 388-line shared template (wc 1,492–1,520 across all 11) — June R2 disposition still open; doorway-pattern risk", "evidence": "app/pub-near-hilton-heathrow/page.tsx (23 lines); components/features/HotelProximityPage.tsx:22-70; evidence/url-inventory.csv wc spread 28 words across 11 pages", "source": "codebase inspection + collect-site-evidence.py", "dataStatus": "Known", "severity": "Medium", "confidence": "Medium", "impactArea": "crawl/indexing", "owner": "Content", "effort": "Medium", "dependencies": "Owner-verified per-hotel data (drive times, terminals); GSC for indexation check when available", "fixType": "Template/system fix", "recommendedAction": "Differentiate template with verified per-hotel fields (preferred) or consolidate into /heathrow-hotels-pub with approval", "validationStep": "≥150 unique words per page; GSC indexation of the 11 URLs once data available", "riskRollback": "Additive content — low risk; consolidation path needs Risk Register entry" },
  { "finding": "/private-hire (P1 money page) has no FAQ section and no FAQPage schema — the only priority money page without one; loses AI-answer citations for venue cost/deposit queries", "evidence": "evidence/page-metadata.csv h2 list for /private-hire; evidence/technical-signals.csv FAQPage absent; SSOT §12 has approved facts (£250 deposit, capacities)", "source": "collect-site-evidence.py + docs/SSOT.md", "dataStatus": "Known", "severity": "Medium", "confidence": "High", "impactArea": "AI visibility", "owner": "Content", "effort": "Small", "dependencies": "editorial-team for copy", "fixType": "One-off page fix", "recommendedAction": "Add 6-8 Q&A FAQ + QuickAnswer block per Brief 1; FAQPage schema matching visible copy", "validationStep": "Rich Results Test passes; FAQ visible on page", "riskRollback": "Additive — remove section to revert" },
  { "finding": "Legacy blog URLs /blog/best-places-to-eat-near-heathrow and /blog/best-pub-food-near-heathrow 301 into noindexed /blog/eating-near-heathrow-prices-compared — equity discarded; old URL still surfacing in search with stale title; 20 internal links still point at the legacy URLs", "evidence": "evidence/technical-signals.csv both rows (301 + robots 'noindex, follow'); content/blog/eating-near-heathrow-prices-compared/index.md 'noindex: true'; evidence/broken-internal-links.csv 10+10 rows; SERP check 7 Jul 2026 surfaced legacy URL", "source": "collect-site-evidence.py + web search (intent check)", "dataStatus": "Known", "severity": "Medium", "confidence": "High", "impactArea": "SEO", "owner": "Content", "effort": "Small", "dependencies": "Developer (redirect map)", "fixType": "One-off page fix", "recommendedAction": "Repoint both 301s to /restaurants-near-heathrow; update the ~20 internal links to final URLs", "validationStep": "curl both URLs → 301 to /restaurants-near-heathrow; broken-internal-links re-run shows 0 rows for these targets", "riskRollback": "Redirect map edit — instantly revertible" },
  { "finding": "/heathrow-family-dining (wc 881) and /family-friendly-pub-heathrow (wc 835) both target 'Family Friendly Pub Near Heathrow | Kids Menu' with near-identical titles — two thin pages splitting one term", "evidence": "evidence/page-metadata.csv titles; evidence/url-inventory.csv word counts", "source": "collect-site-evidence.py", "dataStatus": "Known", "severity": "Medium", "confidence": "Medium", "impactArea": "SEO", "owner": "Content", "effort": "Medium", "dependencies": "Owner approval (indexation change); Authority agent backlink check first", "fixType": "One-off page fix", "recommendedAction": "Merge into /family-friendly-pub-heathrow, 301 the other (Brief 3); log in Risk Register", "validationStep": "Single indexable URL; combined content live; 301 verified", "riskRollback": "Keep merged copy in git; redirect reversible" },
  { "finding": "/blog/sports-update is indexable and optimised for 'Sky Sports pub' queries the venue cannot serve (Sky/TNT ended Jan 2025; SSOT banned claim) — only pre-2026 indexable post, title 'Sports Bar Near Heathrow | Sky Sports Update'", "evidence": "content/blog/sports-update/index.md frontmatter (title, keywords 'sky sports pub stanwell moor', date 2025-01-06); SSOT banned-claims list", "source": "codebase inspection + docs/SSOT.md", "dataStatus": "Known", "severity": "Medium", "confidence": "High", "impactArea": "conversion", "owner": "Content", "effort": "Small", "dependencies": "Owner approval (indexation change)", "fixType": "One-off page fix", "recommendedAction": "301 → /live-sport (terrestrial-only positioning); Risk Register entry", "validationStep": "URL 301s; /live-sport unchanged; no Sky-targeting metadata remains indexable", "riskRollback": "Remove redirect to restore" },
  { "finding": "Three 2026 blog posts compete on 'function room hire heathrow pricing/comparison' (function-room-hire-heathrow-pricing, -comparison, -near-heathrow-staines)", "evidence": "evidence/page-metadata.csv blog titles", "source": "collect-site-evidence.py", "dataStatus": "Known", "severity": "Medium", "confidence": "Medium", "impactArea": "SEO", "owner": "Editorial", "effort": "Medium", "dependencies": "Owner approval (merge/301); editorial-team", "fixType": "One-off page fix", "recommendedAction": "Merge pricing+comparison posts into one guide (Brief 7); keep Staines geo variant", "validationStep": "One definitive guide live; 301 verified", "riskRollback": "Redirect reversible; content kept in git" },
  { "finding": "/our-pub names seven specific draught brands and 'Pints start from £4.95' against SSOT rule 'Use POS/API before naming current draught products' — successor to the fixed '9 draught beers' June item", "evidence": "app/our-pub/page.tsx:398; SSOT.json drinks/stock_summary/draught", "source": "codebase inspection + SSOT.json", "dataStatus": "Known", "severity": "Medium", "confidence": "High", "impactArea": "revenue", "owner": "Content", "effort": "Small", "dependencies": "None", "fixType": "One-off page fix", "recommendedAction": "Replace with non-specific range copy or live-source data; remove pint price", "validationStep": "Page copy has no named draught products or drink prices", "riskRollback": "Copy edit, revertible" },
  { "finding": "Money-page /fish-and-chips-heathrow title leads 'Fish and Chips Staines' while URL/H1 target Heathrow — split targeting on one page; overlaps /blog/fish-chips-guide (which also carries banned 'The Anchor Pub' in title)", "evidence": "evidence/page-metadata.csv both rows; url-inventory soft_404_candidate flag on the blog post (heuristic — verify)", "source": "collect-site-evidence.py", "dataStatus": "Known", "severity": "Low", "confidence": "Medium", "impactArea": "SEO", "owner": "Content", "effort": "Small", "dependencies": "keyword-plan validation for Staines vs Heathrow split", "fixType": "One-off page fix", "recommendedAction": "Retitle money page to lead Heathrow; give the blog guide the Staines/local angle; strip banned phrase", "validationStep": "Titles distinct, ≤60 chars, no banned phrase", "riskRollback": "String revert" },
  { "finding": "Internal link 'View Menu' on /live-sport/world-cup points at /menus which 404s", "evidence": "evidence/broken-internal-links.csv row (target_status 404); evidence/url-inventory.csv /menus status 404", "source": "collect-site-evidence.py", "dataStatus": "Known", "severity": "Low", "confidence": "High", "impactArea": "UX", "owner": "Content", "effort": "Small", "dependencies": "None", "fixType": "One-off page fix", "recommendedAction": "Point link to /food-menu", "validationStep": "Re-crawl: 0 internal links to /menus", "riskRollback": "None" },
  { "finding": "~35 internal links point at redirected URLs (2 legacy eat-near-heathrow posts, plane-spotting-heathrow-guide, pub-jobs-heathrow, 16 tag redirects) and anchor text on food-menu/gluten-free + /vegan cards concatenates title+subtitle ('Gluten-free optionsGluten-free choices…')", "evidence": "evidence/broken-internal-links.csv (redirect rows); evidence/internal-link-issues.md anchor-concentration table", "source": "analyze-internal-links.py output", "dataStatus": "Known", "severity": "Low", "confidence": "High", "impactArea": "crawl/indexing", "owner": "Content", "effort": "Small", "dependencies": "Developer for card component", "fixType": "Template/system fix", "recommendedAction": "One sweep updating links to final URLs; fix card component anchor composition", "validationStep": "broken-internal-links re-run: redirect rows only for deliberate cases", "riskRollback": "None" },
  { "finding": "/whats-on hub and /private-hire lack extractable answer blocks; no reusable QuickAnswer component exists — AI-answer engines have no quotable summary on several priority pages", "evidence": "grep 'Quick answer|Fast answer|QuickAnswer' in app/ components/ = 0 hits; page-metadata h2 lists", "source": "codebase inspection", "dataStatus": "Known", "severity": "Medium", "confidence": "Medium", "impactArea": "AI visibility", "owner": "Content", "effort": "Medium", "dependencies": "Developer (component); ai-seo skill for patterns", "fixType": "Template/system fix", "recommendedAction": "Build QuickAnswer component; deploy on pages listed in §9; hand entity/answer map to ai-seo", "validationStep": "Answer blocks render above the fold and match schema", "riskRollback": "Additive component — removable" },
  { "finding": "Search index still serves stale titles/snippets for retired URLs (/sunday-lunch with pre-May-2026 roast facts: '£14.99–15.99, pre-order by 1pm Saturday, £5 deposit' — all contradicting SSOT walk-in model)", "evidence": "Web search 7 Jul 2026 surfaced https://www.the-anchor.pub/sunday-lunch with old title/snippet; SSOT §4 walk-in rules", "source": "web search (intent check only)", "dataStatus": "inferred", "severity": "Medium", "confidence": "Medium", "impactArea": "conversion", "owner": "Technical", "effort": "Small", "dependencies": "GSC access for URL inspection/removal request", "fixType": "Analytics/governance fix", "recommendedAction": "Verify /sunday-lunch 301s correctly (technical agent); request recrawl of key redirected URLs via GSC when access returns; title-template fix (F2) accelerates snippet refresh", "validationStep": "SERP shows current URL/title for roast queries", "riskRollback": "None" },
  { "finding": "/private-hire/retirement-parties is the thinnest occasion page (wc 1,096 vs siblings 1,516–2,994)", "evidence": "evidence/url-inventory.csv private-hire section word counts", "source": "collect-site-evidence.py", "dataStatus": "Known", "severity": "Low", "confidence": "Medium", "impactArea": "SEO", "owner": "Editorial", "effort": "Small", "dependencies": "editorial-team; keyword-plan validation", "fixType": "One-off page fix", "recommendedAction": "Expand to sibling depth: retirement-specific FAQs, timing, group-size guidance", "validationStep": "wc comparable to siblings; FAQ present", "riskRollback": "Additive" }
] }
```
