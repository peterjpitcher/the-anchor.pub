# SEO Powerhouse — Implementation Contract (canonical interface spec)

This is the **single source of truth** for the upgrade build. Every agent reads this and conforms to the exact filenames, CLI flags, and column names below so scripts and docs never drift. Skill root: `/Users/peterpitcher/.claude/skills/seo-powerhouse` (referred to as `$SKILL`).

## Hard rules (apply to every file)
1. **Stdlib-first.** New scripts must run on a plain Python 3.12 install with no third-party packages. Any optional dependency (`playwright`, `networkx`, `google-api-python-client`, `google-auth`, `certifi`) must be behind a guarded `try/except ImportError` that prints a clear `pip install …` hint and degrades gracefully (never crash; exit 0 with a "data unavailable / install X to enable" note where the feature is optional).
2. **No invented metrics.** Every number a script emits must trace to an input file or a labelled, sourced assumption (e.g. a CTR-by-position curve must be labelled `inferred industry curve (source: <name>)`). This mirrors `$SKILL/agents/_shared-contract.md:38-63`. Never fabricate volume/rank/DA/CWV/conversion figures.
3. **Match existing shapes.** Anything that feeds an existing consumer must reproduce the existing CSV columns exactly (see §Existing I/O). Add new columns only at the end; never reorder or rename existing ones.
4. **Self-verify before returning.** For each script: run `python3 -m py_compile <file>`, `python3 <file> --help`, and one tiny smoke run against a fixture you create in `/tmp`. Report the commands and their output.
5. **British English** in all prose/comments/docstrings. Match the surrounding code style.
6. **Runtime dates are fine in scripts** — Python may use `datetime.now()` at runtime for provenance stamps. (The Date.now ban only applies to the orchestration sandbox, not these scripts.)
7. **Determinism.** No `random`. Stable sort orders so re-runs diff cleanly.

## Existing I/O (do not break these)
- `collect-site-evidence.py` writes into `<output>/`:
  - `url-inventory.csv` — `url,status,final_url,content_type,template,in_sitemap,word_count,internal_link_count,external_link_count,image_count,missing_alt_count,redirect_chain_len,error,collected_at`
  - `page-metadata.csv` — `url,status,title,title_length,meta_description,meta_description_length,canonical,canonical_status,robots_meta,x_robots_tag,h1,h2,h3,word_count,collected_at`
  - `technical-signals.csv` — `url,status,final_url,is_redirect,redirect_chain,canonical,canonical_status,robots_meta,x_robots_tag,in_sitemap,schema_types,content_type,missing_alt_count,collected_at`
  - `schema.json` — `{ "_site": <site>, "<url>": {"schema_types": [...], "jsonld": [<raw JSON-LD strings>]}, ... }`
  - `internal-links.csv` — `source_url,target_url,anchor_text,collected_at`
  - `audit-summary.md` — human summary.
  - Per-page record fields available in code: `status, final_url, redirect_chain, robots_meta, x_robots_tag, title, meta_description, canonical, canonical_status, word_count, internal_links[{target,anchor}], external_links, image_count, images[{src,alt_present}], schema_types, jsonld, template, body`.
- `import-search-data.py` writes: `search-queries.csv` (`query,clicks,impressions,ctr,position,page,date_range`), `landing-pages.csv` (`page,organic_sessions,conversions,revenue_or_leads`), `indexation-summary.csv` (`reason,page_count`), `indexation-urls.csv` (`reason,url`), `data-access.md`. Stdlib only, no network.
- `score-opportunities.py` input backlog rows carry: `id, category, what, why, source` plus six 1-5 fields `business_value, search_opportunity, current_performance_gap, confidence, effort, risk` and optional `decision`. Score = `(bv*so*gap*conf)/(effort+risk)`, denominator floored at 1. Output column order begins `id, priority_score, decision, business_value, search_opportunity, current_performance_gap, confidence, effort, risk, …`.

---

## A. NEW SCRIPTS (one file each — no conflicts)

### A1 `scripts/fetch-search-data.py`  (candidate C1)
Fetch from Google APIs and **write the exact same CSV shapes as `import-search-data.py`** so downstream is untouched.
- Optional deps (guarded): `google-api-python-client`, `google-auth`. If missing → print install hint + how to fall back to manual CSV import; exit 0.
- Auth: `--credentials <service-account.json>` or `GOOGLE_APPLICATION_CREDENTIALS`.
- Flags: `--site <gsc-property>` (required), `--start YYYY-MM-DD`, `--end YYYY-MM-DD`, `--ga4-property <id>` (optional), `--page-regex <re>` (optional GSC filter), `--row-limit <n>` (default 5000, paginate beyond UI's 1000 cap), `--output <dir>`.
- GSC: Search Analytics `query` dimensioned by `query` + `page` + `date` → `search-queries.csv` (identical columns; `date_range` = `start..end`).
- GA4 (if `--ga4-property`): `runReport` organic sessions/conversions/revenue by landing page → `landing-pages.csv`.
- Always write `data-access.md` recording API used, property, **exact window**, fetched-at timestamp, row counts, truncation. Note in the docstring that GBP / Merchant Center are out of scope for now (OAuth/approval) but the auth pattern here is reusable.

### A2 `scripts/analyse-search-data.py`  (candidate C5) — HIGHEST PRIORITY
Deterministic opportunity miner over `search-queries.csv`. **This is the cheapest, fastest win — compute what the skill currently eyeballs.**
- Flags: `--queries <evidence>/search-queries.csv` (required), `--queries-prev <older period csv>` (optional, enables decay), `--ctr-curve <csv: position,ctr>` (optional; else use bundled curve), `--site-url <root>` (optional), `--min-pos 4.5 --max-pos 20.0`, `--output <dir>`.
- Bundled CTR-by-position curve: a labelled constant dict, documented as `inferred industry curve` with a named public source in a comment; clearly not site-specific. If `--ctr-curve` given, prefer it and label `site-specific`.
- Outputs:
  - `opportunities-striking-distance.csv` — `query,page,position,impressions,clicks,ctr,ctr_target,potential_clicks_gain,priority` ranked by `impressions * max(0, ctr_target - ctr)` for rows with `min_pos ≤ position ≤ max_pos`.
  - `opportunities-ctr-gap.csv` — pages already ranking whose actual CTR is materially below curve for their position (`ctr_deficit`, `est_clicks_left_on_table`).
  - `opportunities-cannibalisation.csv` — `query,url_count,urls,impressions_split,clicks_split,note` for queries mapping to >1 URL with meaningful split.
  - `opportunities-decay.csv` — (only if `--queries-prev`) `query,page,clicks_prev,clicks_now,clicks_delta,impr_delta,position_delta,flag`.
  - `backlog-seed.json` — array of backlog rows shaped for `score-opportunities.py` (`id,category,what,why,source` where `source` cites the CSV + the figures). Do **not** pre-fill the six 1-5 scores (leave for the human/orchestrator) — but you MAY add a `suggested_*` hint field. Category ∈ technical/content/measurement.
- `analysis-summary.md` — counts + the top 10 opportunities, each citing its row.

### A3 `scripts/snapshot-baseline.py`  (candidate C2a)
Freeze pre-change metrics at roadmap finalisation.
- Flags: `--queries <search-queries.csv>`, `--landing <landing-pages.csv>` (optional), `--label <e.g. pre-change>` (required), `--note <free text>`, `--output <dir>`.
- Output: `baseline-<label>.json` — `{ "label", "captured_at", "window", "per_url": {url:{clicks,impressions,ctr,position}}, "per_query": {query:{...}}, "notes" }`. Aggregate query rows to per-url and per-query as needed.

### A4 `scripts/measure-delta.py`  (candidate C2b)
Join before/after snapshots → per-entity delta with **seasonality control**.
- Flags: `--before baseline-<x>.json`, `--after baseline-<y>.json` (or `--after-queries <csv>`), `--control sitewide|yoy|none` (default `sitewide`), `--tickets <json mapping ticket_id→{urls:[],queries:[]}>` (optional), `--output <dir>`.
- `control-adjusted delta` = raw delta minus the sitewide median %-movement (or YoY if `--control yoy` with a prior-year snapshot). Document the maths in the docstring + output.
- Output `delta-report.csv` — `entity,entity_type,metric,before,after,abs_delta,pct_delta,control_adjusted_delta,verdict,small_sample_flag` where verdict ∈ `win|neutral|regression|needs-more-time` and `small_sample_flag` set when impressions/clicks below a stated floor. Plus `delta-summary.md` with a per-ticket roll-up if `--tickets` supplied.

### A5 `scripts/analyze-internal-links.py`  (candidate C6)
Internal-link graph analysis over `internal-links.csv` + `url-inventory.csv`.
- Flags: `--links <internal-links.csv>`, `--inventory <url-inventory.csv>`, `--queries <search-queries.csv>` (optional, to flag high-impression low-inbound money pages), `--output <dir>`.
- Stdlib `collections.Counter` for inbound/outbound counts + orphan detection (in inventory/sitemap but ~0 internal inbound). Optional `networkx.pagerank()` if installed (guarded; else leave `pagerank` blank with a note).
- Outputs:
  - `internal-link-summary.csv` — `url,inbound_links,outbound_links,is_orphan,pagerank,impressions_if_known`.
  - `internal-link-issues.md` — orphaned pages (flag if orphan share >5%), high-impression/low-inbound "money pages", boilerplate authority sinks (very high inbound from nav), anchor-text concentration.
  - `backlog-seed-links.json` — backlog rows (same shape as A2) for the actionable issues.

### A6 `scripts/collect-cwv.py`  (candidate C4)
Field CWV via CrUX API + lab via PageSpeed Insights. Uses stdlib `urllib.request` (no SDK).
- Flags: `--urls <file|comma-list>` or `--origin <root>`, `--key <api key>` (optional; CrUX/PSI work keyless at low volume), `--strategy mobile|desktop` (default mobile), `--output <dir>`.
- Per URL/origin call CrUX (field LCP/INP/CLS/TTFB p75 + verdict). For low-traffic URLs CrUX returns 404 → record `source=unavailable`. Optionally call PSI for `lab` opportunities. Wrap all network in try/except → graceful "data unavailable".
- Output `cwv.csv` — `url_or_origin,scope,lcp_p75_ms,inp_p75_ms,cls_p75,ttfb_p75_ms,cwv_verdict,source,top_lab_opportunities`. `source ∈ field|lab|unavailable`. Never invent: missing = blank + `unavailable`.

### A7 `scripts/build-baseline.py`  (candidate C20a)
Cross-run drift fingerprint + diff vs previous run.
- Flags: `--current <evidence dir>` (reads `page-metadata.csv`, `technical-signals.csv`, `schema.json`, and `search-queries.csv` if present), `--previous <prior run-fingerprint.json>` (optional), `--output <dir>`.
- `run-fingerprint.json` — per-URL `{status,title,canonical,canonical_status,robots_meta,x_robots_tag,schema_types,in_sitemap}`; per-query `{position,clicks,impressions}`.
- `drift-report.md` — when `--previous` given, surface **regressions** as auto Tier-1 "Drift vs last run": lost/changed canonicals, new noindex, schema removed, pages dropped from crawl/index, ranking/click drops beyond a stated threshold.

### A8 `scripts/validate-schema.py`  (candidate C16)
Offline structured-data validation over `schema.json`. **No external API.**
- Flags: `--schema <evidence>/schema.json`, `--output <dir>`.
- Bundled required/recommended-field table per `@type` (at minimum: Product → name + offers(price,priceCurrency); Event → name + startDate + location; LocalBusiness/Restaurant → name + address; Organization → name; Article/BlogPosting → headline; BreadcrumbList → itemListElement; Recipe; FAQPage; Review/AggregateRating). Flag: missing required, missing recommended, **deprecated/retired rich results** (HowTo, FAQ rich-result largely retired — note "still valid markup, no longer a rich result"), self-serving Review/AggregateRating on Organization/Product about itself, and compute `rich_result_eligible` (bool).
- Output `schema-issues.csv` — `url,type,missing_required,missing_recommended,deprecated_or_retired,self_serving_review,rich_result_eligible,notes`. Plus `backlog-seed-schema.json` for actionable gaps.

### A9 `scripts/check-reference-freshness.py`  (user item #10)
CI-style skill self-check (skill hygiene, not a traffic lever — keep it lightweight).
- Flags: `--skill-root <default: the skill dir containing this script's parent>`, `--json` (optional machine output).
- Checks: (a) every `scripts/*.py` referenced in `SKILL.md`/`agents/*.md`/`references/*.md` exists, and every script on disk is referenced somewhere (inventory both ways); (b) every `scripts/*.py` passes `py_compile`; (c) `evals/evals.json` is valid JSON; (d) flag date-/recency-sensitive strings that go stale (e.g. literal years, `FID`, `Universal Analytics`, retired-rich-result names) for human review — report as warnings, not failures.
- Exit non-zero only on hard breakage (missing referenced script, syntax error, invalid evals JSON). Print a checklist-style report.

---

## B. EDITED EXISTING SCRIPTS (one owner each)

### B1 `scripts/collect-site-evidence.py`  (C3 + C15 + C17)
- **C3 raw-vs-rendered diff:** today rendered mode overwrites the raw body (`result["body"] = rendered`, ~line 669-672). Change to **keep both**: store `raw_body` and `rendered_body`; parse both; emit `render-diff.csv` — `url,raw_word_count,rendered_word_count,word_delta,raw_link_count,rendered_link_count,link_delta,title_match,h1_match,canonical_match,raw_schema_types,rendered_schema_types,js_dependent`. Set `js_dependent=yes` when rendered materially exceeds raw (stated threshold). **Auto-enable rendered mode** when a framework fingerprint is detected (`__NEXT_DATA__`, `/_next/`, near-empty raw `<body>`) unless `--no-render` is passed; keep `--playwright` working as an explicit override. If Playwright absent, degrade to raw-only + note (cannot diff).
- **C15 internal-link + sitemap status:** after the crawl, build a `{url:status}` map; emit `broken-internal-links.csv` — `source_url,target_url,anchor_text,target_status,redirect_chain_len` for targets `≥400` or redirected. Add a sitemap-vs-crawl(-vs-GSC-indexed if `search-queries.csv`/indexation files present) three-way diff → orphan/non-indexed list, summarised in `audit-summary.md`.
- **C17 soft-404:** heuristic over **rendered** main content — flag 200 responses with empty/near-empty main content or error phrases ("not found", "404", "no longer available") as `soft_404_candidate`. Add `soft_404_candidate` + `js_dependent` columns to `url-inventory.csv` **at the end** (don't reorder).
- Keep every existing output/column intact. New CSVs: `render-diff.csv`, `broken-internal-links.csv`. Update `audit-summary.md` to mention new files + surface the new issue classes.

### B2 `scripts/import-search-data.py`  (C11)
- Add `--backlinks <referring-domains.csv>` mode: auto-detect Ahrefs vs Semrush headers, normalise → `backlinks.csv` — `referring_domain,target_url,anchor,domain_rating,first_seen,link_type`. Stdlib only, no network. Leave all existing modes/columns untouched.

### B3 `scripts/score-opportunities.py`  (C8 + C7-cosmetic)
- **C8 forecast:** add an `expected_clicks_delta` output column = `current_impressions * (ctr_target - ctr_now)` using a CTR-by-position curve (`--ctr-curve` site-specific if given, else bundled labelled `inferred`). Extend to `expected_value_delta` when a row carries `cvr` + `lead_value`/`aov`. Blank + `no demand source` when impressions absent. Append columns at end.
- **C7 cosmetic only (do NOT change the scoring maths):** add **named threshold bands** to the help/docstring and a one-line band label column derived from existing thresholds (`Do now / Schedule / Monitor / Reject`), and add a short "Scoring limitations" paragraph to `--help` and any printed summary (ordinal inputs, multiplicative model favours high-upside bets, denominator floor). The verdict explicitly rejected rewriting to additive/normalised — keep the formula.

---

## C. DOCS / AGENTS / REFERENCES (one owner each — Wave 2)

### C-SKILL `SKILL.md`  (C1 fix, C2 Stage 8, C9, C10, C17, wiring)
- **Fix the false tooling claim** (~line 70): describe what the scripts *actually* do, now including the new ones. Remove/repair the hreflang + Ahrefs/Semrush-import overclaim (hreflang isn't captured; Ahrefs/Semrush import now exists via `--backlinks`).
- **Stage 2 wiring:** prefer `fetch-search-data.py` (API) with `import-search-data.py` (manual CSV) as fallback; after evidence collection run `analyse-search-data.py`, `analyze-internal-links.py`, `validate-schema.py`, and `collect-cwv.py`; note rendered crawl is now default-on for JS sites (C3).
- **NEW Stage 8 — Re-measurement & Drift:** at roadmap finalisation run `snapshot-baseline.py` (label `pre-change`); on a later workspace resume run `snapshot-baseline.py` (label `post-change`) then `measure-delta.py` (+ `build-baseline.py` for cross-run drift); update ticket status (win/neutral/regression/needs-more-time); this is what closes the loop. Cross-link `references/operating-model.md`'s 6-8 week window.
- **Skill Coordination → routing table (C10):** keep `keyword-plan` + `editorial-team`. Add handoffs (lead with AEO): `ai-seo`, `schema-markup`, `programmatic-seo` (route "new pages at scale" **before** the risk gate), `site-architecture`, `page-cro`/`form-cro`. Use the table in the review report. **Delegate, do not duplicate.** Note AEO is owned by content/technical agents, not authority.
- **C9:** add a required cannibalisation field to the high-risk approval block (cite existing ranking URLs from `search-queries.csv`; decision create-new/expand/merge + reasoning) and a cannibalisation-verdict line to the editorial-team handoff.
- **Workspace structure block:** add the new output files (render-diff.csv, broken-internal-links.csv, cwv.csv, schema-issues.csv, internal-link-summary.csv, opportunities-*.csv, baseline-*.json, delta-report.csv, run-fingerprint.json, backlinks.csv).

### C-TECH `references/technical-audit-checklist.md`  (C16, C17, C18)
- C16: schema-validation checklist items + point to `validate-schema.py` / `schema-issues.csv`.
- C17: a Next.js item — `notFound()`/error must fire **before** the first HTML chunk flushes or the 200 locks → soft 404 (check `loading.tsx`/parent layouts awaiting fallible data); + a guardrail: do **not** recommend the Indexing API for general pages (JobPosting/BroadcastEvent only).
- C18: faceted-nav rules as a **conditional** sub-block gated on "if the site has faceted/filter nav" (prefer robots Disallow *or* canonical over noindex per discoverability intent; `&` separators; stable filter order; 404 empty combos).

### C-REPORT `references/report-templates.md`  (C8, C20a)
- Add `expected_clicks_delta` / `expected_value_delta` to the ticket block, baseline table, and Measurement Framework.
- Add a "Drift vs last run" section fed by `build-baseline.py` / `drift-report.md`.

### C-OPS `references/operating-model.md` + `references/content-review-framework.md`  (C2 seasonality, C6)
- operating-model.md: add a seasonality/causation caveat to the 6-8 week re-measurement window (control for sitewide/YoY movement; small-sample caution) and reference Stage 8 + `measure-delta.py`.
- content-review-framework.md: add an internal-link analysis section referencing `analyze-internal-links.py` / `internal-link-issues.md`.

### C-ANALYTICS `agents/analytics-specialist.md` + `references/analytics-tagging-health-check.md`  (C5, C8, C13, C21)
- Wire `analyse-search-data.py` outputs into the analyst's baseline; have the analyst derive the CTR-by-position curve from the site's own GSC data where possible (feeds C8/A2).
- C13: GA4 native **AI Assistant** channel + a maintained AI-traffic referral regex, positioned above Referral; note Perplexity→Referral, AI Overviews→Organic, most AI traffic is referrer-less, server logs are more complete; add an AI-referral row to the health check. **Drop the unsourced "4.4× conversion" claim** (violates no-invented-data). Add a one-line cross-ref to `ai-seo`'s DIY AI-visibility monitoring procedure (mention rate / SOV / citation rate / sentiment) rather than building a probe harness.
- C21: extend the no-data prerequisite so a missing/unverified **GSC property** raises a Do-now Tier-1 ticket (GA4 half already exists at `analytics-specialist.md:157`).

### C-STRATEGY `agents/seo-strategy-lead.md`  (C21 GSC clause, SERP capture ref)
- C21: add the GSC-property verify ticket clause (mirror analytics).
- User #5 (SERP/competitor evidence, lean): reference a compliant SERP-capture approach — GSC + Google Autocomplete + People-Also-Ask + a manual SERP-snapshot template (query, location, top page types, snippet, PAA, local pack, AI Overview present?, competitors, date checked) feeding `discovery/strategy/serp-snapshots.md`. Note paid providers (DataForSEO/SerpApi) as **optional**, no free tier; do not scrape Google directly. (Create `references/serp-capture.md` as the home for this template.)

### C-CONTENT `agents/content-strategist.md`  (C5, C6, C10 cross-ref)
- Wire `analyse-search-data.py` (striking-distance/CTR-gap/cannibalisation/decay) into the content gap workflow.
- Add an internal-link analysis table fed by `analyze-internal-links.py`.
- AEO cross-ref to `ai-seo` (AEO owned here + technical, not authority).

### C-TECHAGENT `agents/technical-seo-specialist.md`  (C16, C17, C3, C10 cross-ref)
- Reference `validate-schema.py` / `render-diff.csv` / soft-404 outputs; AEO/technical cross-ref to `ai-seo` for bot-access/extractable-block work.

### C-UXCRO `agents/ux-cro-specialist.md`  (C10 cross-ref)
- Route full-page conversion rework to `page-cro`/`form-cro` (pass page, organic source, conversion goal, friction findings).

### C-AUTH `agents/authority-specialist.md` + NEW `references/authority-playbooks.md`  (C11)
- Create `references/authority-playbooks.md`: web-search-executable techniques (unlinked-mention reclamation via `"Brand" -site:brand.com`; link-gap via SERP intersection; broken-link building), **local citation checks + GBP audit + partner/supplier link checks** (user #6 detail), 3-4 outreach pitch templates, an outreach-status tracker, and the `--backlinks` import path (B2).
- Point `authority-specialist.md` at the new playbook + `backlinks.csv`. Correct any implication that authority owns AEO (it does not).

### C-EVALS `evals/evals.json` (+ `run-evals.py` only if needed)  (Wave 3)
- Add eval cases **only for behaviours the skill now instructs** (e.g. a delta-table / re-measurement case once Stage 8 ships; an opportunity-miner output case; a schema-validation case). Do not manufacture failures against unwritten behaviour. Keep `run-evals.py` stdlib-only.

### C-CONTRACT `agents/_shared-contract.md`  (C4)
- Add CWV field-data to the data hierarchy and point to `cwv.csv` / `collect-cwv.py`.

---

## Considered-and-rejected (do NOT implement)
C7-rewrite (additive/normalised scoring), C12 (AI prompt-probe harness), C14 (log-file analysis), C19 (entity/SERP/cluster/GEO mega-candidate), C22 (URL Inspection API as standalone — fold into A1 as optional), C20b-d, C23 (brittle eval presence-checks). Rationale in `seo-powerhouse-review.md`.

## Verification gates
- Wave 1 gate: every script `py_compile`s, `--help` works, smoke run produces the named outputs.
- Wave 2 gate: every doc edit references only real filenames/columns from this contract; no dangling references.
- Final gate (orchestrator-run): `python3 scripts/check-reference-freshness.py` passes; `python3 scripts/run-evals.py` still passes; a mini end-to-end on a tiny fixture site produces evidence + analysis + a delta.
