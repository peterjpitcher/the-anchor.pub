# SEO Powerhouse — Review & Upgrade Plan

*Scope: a read-grounded review of the `seo-powerhouse` skill (SKILL.md, 9 agents, 5 references, 4 scripts, evals) against five internal audits, four external research reports, a consolidated candidate list, and adversarial verdicts on each. Every addition below names a target file and a growth mechanism. File paths are to `~/.claude/skills/seo-powerhouse/` unless stated.*

---

## Verdict (the headline answer to A)

**Will seo-powerhouse actually drive organic search growth? Yes — on the first pass, reliably and better than almost any checklist-SEO tool. But as built it is a one-way audit dressed as a closed loop, so it produces excellent roadmaps and then cannot prove, confirm, or compound the wins it recommends.**

What makes the first pass genuinely effective is not generic; it is the disciplined parts most AI-SEO tooling gets wrong:

- **Commercial anchoring is a hard rule, not a slogan.** A finding with no commercial rationale is low priority by default (`agents/_shared-contract.md`), and the whole skill is forced back to "where can this site realistically win commercially" (`SKILL.md`).
- **Evidence-before-strategy has teeth.** Invented volume/DA/CWV/rank numbers are banned with explicit allowed/disallowed phrasings (`agents/_shared-contract.md:38-63`); the GSC Coverage / Page-Indexing report is correctly treated as the most decisive indexation evidence (`SKILL.md:66`).
- **It refuses to optimise a funnel that cannot convert.** A silently-dead contact form is an automatic Tier-1 finding ahead of any ranking work (`SKILL.md:513`; `agents/ux-cro-specialist.md`), and untracked conversions are roadmap-blocking (`agents/analytics-specialist.md`). This prevents a whole class of "ranks but earns nothing" engagements.
- **Findings become validatable tickets.** Every ticket carries acceptance criteria, validation, and risk/rollback (`references/report-templates.md:276-308`); anything that cannot be described to ticket level stays Monitor.
- **The doctrine is 2026-current.** INP (not FID) at p75 field data, a precise search-vs-training AI-bot taxonomy (correctly noting Google-Extended does not control AI Overviews), conversion-handler tracing, FAQ/HowTo deprecation, and self-serving-review-schema bans are all right.

Where it **stops short of driving growth** is structural, and it is the same gap in five places: **the measure → refine half of the loop is fully documented but completely toolless.** `references/operating-model.md` mandates a 6-8 week re-measurement window and says a ticket is only closed once that window is reviewed — but there is no baseline-snapshot artefact, no before/after delta computation, no seasonality control, no GSC/GA4 API to pull the windows, and no re-entry stage in `SKILL.md`. I verified there is **zero** API code in the skill (`searchconsole|googleapis|webmasters|runReport|crux|pagespeed` appear only as source *labels* in contracts/templates, never as a fetch mechanism). So in practice the loop never closes: wins are never confirmed, regressions never caught, and the skill cannot learn which of its own recommendations moved rankings — the one behaviour that compounds growth cycle over cycle.

Three further honest gaps cap the ceiling:

1. **The cheapest, highest-ROI organic wins are left to manual eyeballing.** The skill ingests the exact GSC data for striking-distance (position 5-20) and content-decay detection, and collects the full internal-link edge list, yet **no script computes any of them** (`scripts/score-opportunities.py` scores a hand-authored backlog; `scripts/collect-site-evidence.py` writes `internal-links.csv` but never aggregates it). At scale these get missed.
2. **The two highest-leverage technical risks for the Next.js sites it targets are asserted-but-unmeasured.** The crawler overwrites the raw body with the rendered DOM (`scripts/collect-site-evidence.py:672`) so it cannot diff raw-vs-rendered to catch JS-dependent content, and nothing can obtain CrUX/PSI field data despite the field-data-first mandate.
3. **It does not operate as one system.** Skill Coordination chains only to `keyword-plan` and `editorial-team` (`SKILL.md:79-80`); it never hands off to the five deeper siblings (`ai-seo`, `schema-markup`, `programmatic-seo`, `site-architecture`, `page-cro`) and instead re-implements shallower versions — most damagingly for AEO, where AI search visibility is won in 2026.

Net: a strong, evidence-disciplined audit engine that ships real first-pass wins, held back from being a *growth system* by a missing measurement loop, a few uncomputed data artefacts, and one false capability claim (raw-vs-rendered / hreflang).

---

## What it already does well

| Strength | Evidence |
|---|---|
| Commercial-first prioritisation as a hard rule | `SKILL.md:15,19-23`; `agents/_shared-contract.md:86-88` |
| No-invented-data discipline, enforced at agent + script + grader | `agents/_shared-contract.md:38-63`; `scripts/run-evals.py:279` |
| GSC Coverage / indexation treated as the decisive evidence | `SKILL.md:66,496` |
| Dead conversion path = automatic Tier-1 | `SKILL.md:513`; `agents/ux-cro-specialist.md:39` |
| Untracked conversions = roadmap-blocking; tagging health-check as intake gate | `agents/analytics-specialist.md:36-52`; `references/analytics-tagging-health-check.md` |
| Validatable tickets (acceptance criteria + validation + rollback) | `references/report-templates.md:276-308` |
| Field-data-first CWV using INP at p75 | `references/technical-audit-checklist.md:69-70,284-289` |
| Current AI-bot taxonomy (search vs training; Google-Extended ≠ AI Overviews) | `agents/technical-seo-specialist.md:80-90` |
| Conversion-handler tracing (flags stub/console.log handlers) | `agents/web-developer-analyst.md:61` |
| Systems-thinking routing (one-off vs template/system fix) | `agents/technical-seo-specialist.md:179-192` |
| Safe content pruning (6-verdict tree + safety rules + approval gate) | `references/content-review-framework.md:156-210` |
| Canonical normalisation that kills the common false-positive | `scripts/collect-site-evidence.py:203-250` |

**Do not "add" any of these — they exist and are good. Generic advice on them is noise.**

---

## Where it stops short of driving growth (the honest gaps)

1. **The measure→refine loop has no tooling and never closes.** Documented (`operating-model.md` 6-8wk window; ticket closed only when window reviewed) but toolless: no baseline artefact, no delta computation, no seasonality/YoY control, no Stage 8 re-entry.
2. **No GSC/GA4/CrUX API path.** Manual CSV only (`scripts/import-search-data.py` is "standard library only, no network access"). The 6-8 week re-pull becomes a chore that dies, and the audit is gated on the user remembering to export Coverage.
3. **The cheapest wins are uncomputed.** Striking-distance / CTR-gap / cannibalisation / decay over GSC data, and orphan/PageRank over the link edge list, are *instructed* but not *computed*.
4. **Two flagship technical risks are unmeasured.** Raw-vs-rendered JS-content diff (crawler overwrites raw body, `collect-site-evidence.py:672`) and CrUX/PSI field CWV.
5. **No quantified forecast.** Prioritisation is ordinal (High/Med/Low + a unitless score); no expected-clicks/revenue figure, so "commercial" stops at gut-feel and shipped changes have no target to be judged against.
6. **One false capability claim.** `SKILL.md:70` advertises hreflang capture and Ahrefs/Semrush import that the scripts do not perform.
7. **Not a system.** No handoff contracts to the five deeper siblings; AEO is the lone qualitative, unmeasured exception in an otherwise evidence-backed skill.

---

## Prioritised upgrade roadmap (answer to B)

Only candidates whose adversarial verdict was **add** or **add-if-cheap** appear here. Effort is implementation cost; Tier reflects growth impact × cost × sequencing.

### Tier 1 — do now (highest growth leverage)

| # | Addition | Target file | Growth mechanism | Effort |
|---|---|---|---|---|
| C5 | **Deterministic GSC opportunity miner** — striking-distance (pos 5-20, ranked by `impressions × (CTR_target − CTR_now)`), CTR-gap vs a *stated* CTR-by-position curve, query→multi-URL cannibalisation, and decay (two-period diff). Emits pre-populated backlog rows feeding the scorer. | New `scripts/analyse-search-data.py`; wired into `agents/content-strategist.md §4`, `agents/analytics-specialist.md`, `scripts/score-opportunities.py` | Surfaces the lowest-effort/highest-return ranking gains (title/meta rewrites, near-page-1 pushes) exactly + completely instead of by manual CSV eyeballing — these convert to traffic in weeks. | medium |
| C3 | **Raw-vs-rendered HTML diff**, default-on for JS-heavy sites (framework fingerprint: `__NEXT_DATA__`, `/_next/`, near-empty raw body). Keep raw body, also parse rendered DOM, emit `render-diff.csv` (word/link/title/H1/canonical/schema deltas + `js_dependent` flag) and a "JS-dependent content" issue row. | `scripts/collect-site-evidence.py` (crawl() ~668-684; `write_outputs`; `build_summary_markdown`) | Google indexes rendered HTML and LLM crawlers may not execute JS; per-URL deltas catch content/links/metadata Google may not see — the #1 silent indexation risk on the Next.js sites this skill targets, today asserted-but-unmeasured. | medium |
| C1 | **GSC/GA4 API fetch layer.** Pull Search Analytics (query+page+date, page-regex filter) and GA4 `runReport`, writing the *same* CSV shapes `import-search-data.py` produces (no downstream change). Keep manual CSV as lower-confidence fallback. | New `scripts/fetch-search-data.py`; `SKILL.md:70` + Stage 2; reused by Stage 8 | Exact-window, exact-URL, repeatable pulls are the precondition for baseline/after snapshots, so the re-measurement loop actually runs instead of dying as a manual chore; also fixes the documented window-precision loss in manual exports (`import-search-data.py:374-376`). | high |
| C2 | **Baseline snapshot + before/after delta with seasonality control.** `snapshot-baseline.py` freezes pre-change metrics per URL+query at roadmap finalisation; `measure-delta.py` joins before/after, outputs per-ticket Δ + a **control-adjusted** column (subtract sitewide or YoY movement) + verdict (win/neutral/regression/needs-more-time) + small-sample flags. New **Stage 8: Re-measurement** in `SKILL.md` updates ticket status on workspace resume. | New `scripts/snapshot-baseline.py`, `scripts/measure-delta.py`; `SKILL.md` Stage 8 + Step E; `operating-model.md:382` | The only mechanism by which the skill learns which of its own recommendations moved organic traffic; seasonality adjustment stops calendar swings (a real risk for a Christmas/summer-garden SMB) being misread as SEO wins/losses. Proven ROI is the most durable growth driver. | medium |
| C17 | **Soft-404 detection + Next.js streaming-status guardrail.** Flag 200 pages with empty/near-empty rendered main content or error phrases as soft-404 candidates (run against rendered HTML). Checklist item: `notFound()`/error must fire **before** the first HTML chunk flushes or the 200 locks → soft 404 (check `loading.tsx` / parent layouts awaiting fallible data). Plus a guardrail: do **not** recommend the Indexing API for general pages (JobPosting/BroadcastEvent only). | `scripts/collect-site-evidence.py` (heuristic); `references/technical-audit-checklist.md` (Next.js item + Indexing-API guardrail) | Soft 404s are silently de-indexed and waste crawl budget — a frequent invisible failure on this exact stack; naming the status-lock-on-flush trap turns a "won't index, unknown why" mystery into a one-line fix that recovers indexable inventory. | low |
| C10 | **Handoff contracts to the deeper siblings** — expand Skill Coordination into a routing table. **Lead with the `ai-seo` (AEO) leg** (pass priority clusters/queries, citation-gap findings, target entities, schema state; receive extractable-block + third-party-presence + bot-access + monitoring plan). Lighter routing pointers for `schema-markup`, `programmatic-seo` (route "new pages at scale" *before* the risk gate), `site-architecture`, `page-cro`/`form-cro`. *Correct the audit's mis-attribution: AEO is owned by content/technical, not the authority agent.* | `SKILL.md` Skill Coordination (~72-126); cross-ref notes in `content-strategist.md`, `technical-seo-specialist.md`, `ux-cro-specialist.md` | Siblings go materially deeper (Princeton GEO method, @graph schema, 12 pSEO playbooks, hub-spoke IA); without contracts the orchestrator duplicates them shallowly or drops the opportunity. The AEO leg is where 2026 organic visibility (AI Overviews / answer-engine citation) is actually won. | low |

### Tier 2 — next

| # | Addition | Target file | Growth mechanism | Effort |
|---|---|---|---|---|
| C6 | **Internal-link graph analysis** — orphans (zero inbound, >5% = red flag), inbound counts flagging high-impression money pages with few links, PageRank-to-conversion-page reach, boilerplate authority sinks, anchor concentration, opt-in pillar cohesion. Ship orphan/inbound counts with stdlib `Counter` (no new dep); make NetworkX PageRank optional. | New `scripts/analyze-internal-links.py`; new section in `references/content-review-framework.md`; table in `content-strategist.md §5` | Internal links distribute PageRank and topical-authority signals; the edge list is already collected but never analysed, so under-linked/orphaned money pages — a common, cheap-to-fix cause of weak rankings — go undetected. The skill *promises* orphan findings (`technical-seo-specialist.md:22,100`) it cannot currently compute. | low |
| C8 | **Quantified forecast per opportunity and roadmap tier** — `expected_clicks_delta = current_impressions × (CTR_target − CTR_now)` using the site's own GSC CTR-by-position curve where available, else a labelled "inferred" industry curve; extend to conversions/revenue where GA4 CVR + lead value exist; blank + "no demand source" when no data. | `references/report-templates.md` (ticket block, baseline table, measurement framework); `scripts/score-opportunities.py` (forecast column); `analytics-specialist.md` derives the curve | Converts ordinal ranks into a business case owners act on (execution, not analysis, is the binding constraint on growth) and gives each shipped change a falsifiable target the 6-8 week comparison can judge. | low |
| C16 | **Offline structured-data validation** against Google's required/recommended fields per `@type` (Product→name+offers; Event→name+startDate+location; LocalBusiness→name+address) + flag deprecated types (HowTo). Emit `schema-issues.csv` (url, type, missing_required, missing_recommended, rich_result_eligible). No external API. | `scripts/collect-site-evidence.py` (pass after `extract_types`) or new `scripts/validate-schema.py`; `technical-audit-checklist.md:116`; `technical-seo-specialist.md` schema table | Rich results win SERP real estate and CTR; the crawler extracts `@type` but never validates, so "schema present" is mistaken for "schema valid/eligible". Validating required fields surfaces actionable rich-result gaps at scale. (CTR-level gains on already-ranking pages — real but not a ranking step-change.) | medium |
| C15 | **Internal-link + sitemap status checking** — build a `{url:status}` map post-crawl, emit `broken-internal-links.csv` (source, target, anchor, target_status, redirect_chain_len) for targets ≥400 or with redirect chains; add a sitemap-vs-crawl-vs-(GSC-indexed) three-way diff for orphans/non-indexed. Reuses data already on disk. | `scripts/collect-site-evidence.py` (post-crawl pass; `build_summary_markdown` issue rows) | Broken internal links waste crawl budget and leak equity into 404s; links to redirects dilute equity. Targets are collected but never status-checked. The three-way diff (higher-value half) recovers pages Google isn't indexing — the recurring "crawled, not indexed" problem. | low |
| C11 | **Authority/off-page playbook + backlink import** — `references/authority-playbooks.md` with web-search-executable techniques (unlinked-mention reclamation via `"Brand" -site:brand.com`; link-gap via SERP intersection; broken-link building), 3-4 outreach pitch templates, and an outreach-status tracker. Extend `import-search-data.py` with a `--backlinks` mode ingesting an Ahrefs/Semrush referring-domains CSV. **Fix the false `SKILL.md:70` claim.** | New `references/authority-playbooks.md`; `scripts/import-search-data.py` (`--backlinks`); `SKILL.md:70` | For competitive keywords off-page authority is usually the deciding factor, yet it is the vaguest discipline (named techniques, no method) so it produces prose that rarely converts into shipped links; a real playbook + data path turns it into trackable tickets. (Medium: link results are slow; import half is low-yield for the no-tool users the evals model.) | medium |
| C4 | **PSI + CrUX field-data collector** — keyless CrUX API (field LCP/INP/CLS p75 + verdict) per priority URL/origin + PSI (lab opportunities); degrade gracefully to "data unavailable" for low-traffic origins. Emit `cwv.csv`; wire into the data hierarchy. | New `scripts/collect-cwv.py`; `SKILL.md:70`; `_shared-contract.md:70` | Closes a mandate-without-mechanism: the skill demands field-data-first CWV but ships no way to obtain it, so CWV findings are currently aspirational. (Add-if-cheap: CWV is a confirmed but weak tiebreaker vs indexation/content; small sites often return no field data.) | low |
| C20a | **Cross-run drift baseline** — `build-baseline.py` persists a compact run fingerprint (per-URL status/title/canonical/robots/key-schema/indexation-reason; per-query position/clicks) and diffs against the previous run, surfacing regressions (lost canonicals, new noindex, schema removed, ranking/click drops, pages dropped from index) as automatic Tier-1 "Drift vs last run" findings. *(Only this part of C20; see rejected.)* | New `scripts/build-baseline.py`; "Drift vs last run" section in `report-templates.md`; optional Stage-1 prior-state prompt | Regression detection between runs is higher-value than re-auditing cold for ongoing growth and matches the skill's own repeatable-cycle framing; data already lands in CSV/JSON, so cost is low. | medium |

### Tier 3 — opportunistic / cheap edits

| # | Addition | Target file | Growth mechanism | Effort |
|---|---|---|---|---|
| C13 | **GA4 native AI Assistant channel + maintained AI-traffic regex** (positioned above Referral; note Perplexity→Referral, AI Overviews→Organic, most AI traffic referrer-less; server logs more complete). Add an AI-referral row to the health check. **Drop the unsourced "4.4× conversion" claim** (would violate the no-invented-data rule). | `agents/analytics-specialist.md` (~100); `references/analytics-tagging-health-check.md` | Current guidance predates GA4's native AI channel and omits misclassifications, so AI traffic is under-attributed; accurate capture makes AEO work measurable. Measurement plumbing, not a ranking lever. | low |
| C9 | **Pre-publish cannibalisation field at the gate** — add a required "Existing URL(s) ranking for this term (cite `search-queries.csv`); decision: create-new/expand/merge + reasoning" to the high-risk approval block, and a cannibalisation-verdict line to the editorial-team handoff. | `SKILL.md` (approval block 340-346; editorial-team handoff 112-124) | Formalises an already-present check (the failure is blocked three times pre-publish at `operating-model.md:69`, `content-strategist.md:66`, `editor-qa.md:96`) so the verdict is legible on the gate artefact. Cheap; low marginal impact. | low |
| C18 | **Specific faceted-nav rules** as a *conditional* sub-block gated on "if the site has faceted/filter navigation": prefer robots.txt Disallow *or* canonical (per discoverability intent) over noindex; use `&` separators, reject comma/semicolon/bracket; stable filter order; 404 for empty combos. | `references/technical-audit-checklist.md` (Indexation section) | Precise fix instead of generic "define parameter handling". Low impact for *this* skill (its workload is SMB/local, not large faceted e-commerce), so gate it to add zero noise on common runs. | low |
| C21 | **Auto Tier-1 "verify GSC property" ticket on the no-data track** — extend the existing prerequisite rule so a missing/unverified GSC property raises a Do-now ticket (the GA4 half is already covered at `seo-strategy-lead.md:154` + `analytics-specialist.md:157`; ship only the GSC clause). | `agents/seo-strategy-lead.md:154`; `agents/analytics-specialist.md:157` | Turns "no data" from a permanent state into a one-cycle gap so the next audit is higher-confidence. Measurement hygiene, not a ranking lever; ~1-line edit. | low |

---

## External tooling & repos worth wiring in (from research, with how-to-integrate)

| Tool (licence) | Role | How to integrate |
|---|---|---|
| **GSC Search Analytics API** + `joshcarty/google-searchconsole` (MIT) | Exact-window query/page pulls beyond the 1000-row UI cap | Backs **C1** `fetch-search-data.py`; writes the existing CSV shapes so downstream agents are untouched. Service-account JSON + property as env. |
| **GSC URL Inspection API** (free, 2,000/day) | Ground-truth per-URL `coverageState` | *Optional enhancement to C1*, not a standalone add (verdict on C22 was drop — the Coverage CSV already delivers the decisive insight). Use only once the API auth path from C1 exists. |
| **CrUX API + PageSpeed Insights API** (free; keyless at low volume) | Field LCP/INP/CLS p75 + lab opportunities | Backs **C4** `collect-cwv.py`. Call CrUX for pass/fail, PSI for specific lab fixes. |
| **Playwright (Python)** (Apache-2.0) — already a soft dep | Rendered-DOM capture for the raw-vs-rendered diff | Backs **C3**: keep the raw `httpx`/stdlib body, capture `page.content()`, diff. Default-on by framework fingerprint. |
| **NetworkX** (BSD-3) | `pagerank()` over the crawl edge list | Backs **C6**, but make it *optional* — ship orphan/inbound counts with stdlib `Counter` to preserve the scripts' stdlib-only property. |
| **extruct** (BSD-3) | JSON-LD/Microdata extraction front-end | Backs **C16** schema validation against a bundled required-fields table. No external API. |
| **AgricIDaniel/claude-seo** (MIT) | Public comparator (drift baseline, health score, falsifiability fields) | Reference-only. Borrow the **drift-baseline pattern** (→ C20a). Do not lift code. |
| **advertools / GoAccess** | Log-file & sitemap parsing | **Deliberately not adopted** — verdict on C14 (log analysis) was drop: low impact for sub-10k-URL SMB sites, and these heavy/external-binary deps break the scripts' stdlib-only contract. If ever revisited, write a tiny stdlib `re`+`csv` log parser, large sites only. |
| **DataForSEO / SerpApi (paid)** | Live SERP/volume | Not added: no genuine free tier; the honest substitute (Google Autocomplete + PAA) and the existing GSC data cover the need. Keep `keyword-plan` as the demand-validation handoff. |

---

## AI-search (AEO/GEO) integration recommendations

The skill already covers AEO better than most — current AI-bot taxonomy, an AI Answer-Engine Visibility section, AI-referral tracking with honest caveats, and (critically) it **delegates** the deep work. The right moves are integration and freshness, **not** a new in-house AI harness:

1. **Wire the `ai-seo` handoff (C10, Tier 1).** This is the single highest-leverage AEO change. The sibling `ai-seo` skill owns the Princeton GEO method, per-platform citation sourcing, and a monitoring-tool table; `seo-powerhouse` currently re-implements a thin version. A one-paragraph contract routes AI-citation opportunities there.
2. **Use `ai-seo`'s existing DIY-monitoring procedure rather than building a probe harness.** *Rejected C12 (prompt-test harness) and C19's GEO numbers:* `ai-seo` already documents the four metrics (mention rate, SOV, citation rate, sentiment) and a no-tools monthly procedure; an API-based probe would measure Perplexity/OpenAI *completions* (different system, no AI Overviews coverage) while looking quantitative — the exact overclaim the skill's discipline forbids. Add at most a one-line cross-reference from `analytics-specialist.md:101` to `ai-seo`'s DIY procedure.
3. **Refresh GA4 AI attribution (C13, Tier 3).** Native AI Assistant channel + maintained regex + known misclassifications. Drop the unsourced conversion-multiplier claim.
4. **Keep the existing llms.txt caveat as-is.** *Rejected the C20 llms.txt edit:* both cited lines already say it is a proposed convention not honoured by major crawlers and never a substitute for crawlable HTML + schema; the proposed "97% zero reads" stat would inject an unsourced number into a skill that bans invented metrics.

---

## Cross-skill coordination fixes (handoffs)

Add a routing table to `SKILL.md` Skill Coordination (~72-126) stating which finding triggers which handoff, so the orchestrator routes instead of re-implementing shallowly. Keep `keyword-plan` (demand validation) and `editorial-team` (writing terminal) as-is.

| Sibling | Trigger finding | Pass → Receive |
|---|---|---|
| **`ai-seo`** *(highest value)* | AI-citation opportunity / answer-engine competitor flagged by Strategy Lead or Content Strategist | Priority clusters/queries, citation-gap findings, target entities, schema state → extractable-block fixes, third-party-presence plan, bot-access plan, monitoring plan (back into scored backlog) |
| **`schema-markup`** | Material rich-result/schema work beyond presence/validity | Page type, target rich result, data available → validated @graph JSON-LD |
| **`programmatic-seo`** | "New landing pages at scale" — route **before** the risk gate | Keyword pattern, data source, competitor SERP → thin-content-safe template plan |
| **`site-architecture`** | IA / internal-linking / URL-restructure findings (pairs with C6) | Crawl + orphan list → hub-spoke plan + redirect map |
| **`page-cro` / `form-cro`** | Full-page conversion rework (not a one-off CTA tweak) from the UX/CRO agent | Page, organic traffic source, conversion goal, friction findings → full CRO rework |

*Correction to encode:* the authority audit mis-stated that the authority agent owns AEO; it does not (`authority-specialist.md` is purely backlinks/digital-PR). Land the AEO cross-ref on `content-strategist.md` and `technical-seo-specialist.md`.

---

## Considered and rejected (with one-line why)

| # | Candidate | Verdict | Why rejected |
|---|---|---|---|
| C7 | Rewrite the scoring model (additive/normalised) | drop | Premise is false on the script's own arithmetic — the multiplicative model already surfaces high-upside/low-confidence bets above safe trivia; defaults demote, not inflate; min-max normalisation would *regress* within-run urgency ranking. (Keep only the cosmetic: named threshold bands + a "limitations" paragraph.) |
| C12 | AI-visibility prompt-test harness | drop | Already covered by `analytics-specialist.md:101` + `ai-seo`'s DIY procedure; the only novel part (API probe) measures the wrong system while looking quantitative — degrades the evidentiary discipline. |
| C14 | Server log-file / Crawl Stats analysis | drop | Justified by a false premise (the contract *allows* inferred/Medium-confidence crawl-budget findings); low impact on sub-10k-URL SMB sites; proposed deps break the stdlib-only contract; gated on logs most owners won't supply. |
| C19 | Entity matrix + SERP-feature + cluster map + GEO levers | drop | Two legs already covered (SERP features at `seo-strategy-lead.md:54`; clusters at `content-strategist.md:73`); GEO numbers belong to `ai-seo` and the candidate's figures are factually wrong. (Only a narrow "named-missing-entity matrix" is salvageable, scoped tightly.) |
| C22 | GSC URL Inspection API as a standalone add | drop | Core insight already delivered by the Coverage CSV ingest; depends on a C1 auth layer that doesn't yet exist — fold into C1 as an optional enhancement, not a separate script. |
| C23 | Measurement-loop / AI-visibility eval cases | drop | Three of four sub-claims are already implemented capabilities; an eval can only lock in behaviour the skill instructs. The one real sliver (seasonality/causation caveat) belongs in `operating-model.md` content (it ships free with C2), not a brittle grader presence-check. |
| C20b–d | Falsifiability fields on every finding; llms.txt downgrade; prior-run state as its own item | drop/fold | "Leading indicator" + "Validation step" already exist (`_shared-contract.md:27-28`; `analytics-specialist.md:83`); llms.txt caveat already correct; prior-run state folds into C20a's baseline. |

---

## Suggested implementation sequence

The order maximises compounding: build the data spine first, then the artefacts that ride on it, then hardening.

1. **C1 (API fetch layer)** — the spine. Everything downstream (C2, C5, C8) is easier and more reliable once exact-window pulls exist. Keep manual CSV as fallback so nothing regresses.
2. **C5 (opportunity miner)** — immediate first-pass uplift; runs on data already on disk, so it pays off even before C1 lands.
3. **C3 (raw-vs-rendered diff) + C17 (soft-404 + streaming guardrail)** — same file (`collect-site-evidence.py`), same crawl pass; ship together. Closes the flagship Next.js indexation gaps.
4. **C2 (baseline + delta + Stage 8)** — depends on C1 for clean after-snapshots; this is what finally closes the loop.
5. **C10 (sibling handoffs, AEO-first)** — pure documentation; do alongside the above, no code dependency.
6. **Tier 2 batch:** C6 (link graph) + C15 (broken-link/sitemap diff) in one `collect-site-evidence.py` pass; then C16 (schema validation), C8 (forecast), C11 (authority playbook), C4 (CWV), C20a (drift baseline).
7. **Tier 3 cheap edits:** C13, C9, C18, C21 — batch as a single docs/agent-prompt commit.

After each script lands, add the matching `evals.json` case **only where the skill now instructs the behaviour** (e.g. a delta-table case once C2 ships) — eval the capability, don't manufacture failures against unwritten behaviour.
