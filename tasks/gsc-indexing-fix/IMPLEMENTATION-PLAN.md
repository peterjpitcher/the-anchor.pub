# GSC Indexing Fix — Implementation Plan

**Source spec:** [`tasks/gsc-indexing-fix/REVIEW-PACK.md`](REVIEW-PACK.md) (signed off by owner; reviewed by external consultant)
**Date:** 2026-04-30
**Status:** Ready to execute
**Repo:** `OJ-The-Anchor.pub`, branch `main`

This plan converts the approved spec into discrete, executable workstreams. It explicitly incorporates the consultant's caveats (capture response headers, don't trust `rg` alone, enumerate before changing, pull P0/P1 guardrails forward, audit-first orphan workflow).

---

## Workstream sequencing

```
PR 1 (mechanical infra + guardrails)
├── A. Cache headers + production verification
├── B. Breadcrumb enumeration → fix
├── C1. CI/regression check: robots.txt + sitemap.xml + redirects
└── C2. GSC CSV audit script (parses CSV properly, classifies URLs)

Parallel research (no PR yet, findings appended to spec)
├── D. Sitemap "Temporary processing error" investigation
└── E1. Orphan-pattern 5-URL spot check

Then, depending on E1 + D outcomes:
├── PR 2: D fixes (if any) + first orphan-link batch (5-10 pages)
├── PR 3+: subsequent orphan-link batches
└── PR N: P0/P1 guardrails (redirect-error chains, URL lifecycle policy)
```

Workstreams A–C are **PR 1**, all mechanical, can be executed and shipped together.
D and E1 are **research tasks** that produce findings appended to the spec.
PR 2+ are **content-edit PRs** that depend on the research outputs.

---

## Workstream A — Cache headers + production verification (R2.1, R2.2)

**Scope:** shorten cache TTL on `robots.txt` and `sitemap.xml` to 5 minutes; capture before/after response headers from production to prove the fix works through Cloudflare.

### A1. Capture baseline (before any change)

**What:** record current response headers and body for `robots.txt` from both apex and www, using command-line fetch (not browser).

**How:**
```bash
mkdir -p tasks/gsc-indexing-fix/evidence
for host in www.the-anchor.pub the-anchor.pub; do
  curl -sI "https://$host/robots.txt" > "tasks/gsc-indexing-fix/evidence/robots-headers-${host}-baseline.txt"
  curl -s  "https://$host/robots.txt" > "tasks/gsc-indexing-fix/evidence/robots-body-${host}-baseline.txt"
done
for host in www.the-anchor.pub the-anchor.pub; do
  curl -sI "https://$host/sitemap.xml" > "tasks/gsc-indexing-fix/evidence/sitemap-headers-${host}-baseline.txt"
done
```

**Acceptance:** evidence files exist and contain `Cache-Control`, `CF-Cache-Status`, `Age`, `Via`, `x-vercel-cache` lines.

### A2. Apply code change to `next.config.js`

**Files:** `next.config.js` (lines 121–128, plus a new sitemap rule).

**Change:**
```js
{
  source: '/robots.txt',
  headers: [
    { key: 'Cache-Control', value: 'public, max-age=300, s-maxage=300, must-revalidate' },
  ],
},
{
  source: '/sitemap.xml',
  headers: [
    { key: 'Cache-Control', value: 'public, max-age=300, s-maxage=300, must-revalidate' },
  ],
},
```

(Add the `sitemap.xml` rule — it does not currently exist; verified with `grep -n "sitemap" next.config.js` → no matches.)

**Acceptance:** `npm run build` succeeds; `git diff next.config.js` shows only the two `Cache-Control` value changes plus the new sitemap rule.

### A3. Owner manual step — Cloudflare cache purge

**Document only.** Manual action by the site owner per [`REVIEW-PACK.md` §15](REVIEW-PACK.md#15-cloudflare-cache-purge--owner-walkthrough-r22). Not part of the automated plan.

### A4. Capture post-deploy verification

**When:** after PR 1 deploys and the owner has done the Cloudflare purge.

**How:**
```bash
for host in www.the-anchor.pub the-anchor.pub; do
  curl -sI "https://$host/robots.txt" > "tasks/gsc-indexing-fix/evidence/robots-headers-${host}-post-fix.txt"
  curl -s  "https://$host/robots.txt" > "tasks/gsc-indexing-fix/evidence/robots-body-${host}-post-fix.txt"
done
for host in www.the-anchor.pub the-anchor.pub; do
  curl -sI "https://$host/sitemap.xml" > "tasks/gsc-indexing-fix/evidence/sitemap-headers-${host}-post-fix.txt"
done
```

**Acceptance:**
- `Cache-Control` header in post-fix file shows `max-age=300, s-maxage=300, must-revalidate`.
- Body diff between baseline and post-fix shows the `Disallow: /*?dpl=*` line removed.
- `CF-Cache-Status` shows `MISS` or `EXPIRED` in the first call after purge (proving purge worked).

---

## Workstream B — Breadcrumb enumeration → fix (R2.3)

**Scope:** produce exact page-by-page breadcrumb-source matrix; only then implement Option A; verify with site-wide HTML scan.

**Consultant requirement:** do not remove any `BreadcrumbJsonLd` instance until the page is proven to have an alternate `BreadcrumbList` source.

### B1. Build the page-by-page breadcrumb-source matrix

**What:** for every page in `app/`, determine which of {HeroWrapper, BreadcrumbJsonLd, inline schema} emit `BreadcrumbList` JSON-LD.

**How:**
```bash
# 1. List all page files
find app -name "page.tsx" -not -path "*backup*" > /tmp/all-pages.txt

# 2. For each page, check for HeroWrapper, BreadcrumbJsonLd, inline schema
echo "page,has_HeroWrapper,has_BreadcrumbJsonLd,has_inline_schema" > tasks/gsc-indexing-fix/evidence/breadcrumb-matrix.csv
while read pagefile; do
  hero=$(grep -c "HeroWrapper" "$pagefile" 2>/dev/null || echo 0)
  bjld=$(grep -c "BreadcrumbJsonLd" "$pagefile" 2>/dev/null || echo 0)
  inline=$(grep -c 'breadcrumbSchema\s*=\s*{' "$pagefile" 2>/dev/null || echo 0)
  echo "$pagefile,$hero,$bjld,$inline" >> tasks/gsc-indexing-fix/evidence/breadcrumb-matrix.csv
done < /tmp/all-pages.txt
```

**Acceptance:** CSV exists and contains rows for every `page.tsx` in `app/`. Manual review classifies each page into one of four states:
- `safe-to-edit`: HeroWrapper + (BreadcrumbJsonLd or inline) → remove the duplicate
- `keep-as-is-no-hero`: BreadcrumbJsonLd or inline only, no HeroWrapper → don't touch
- `keep-as-is-hero-only`: HeroWrapper only → don't touch
- `unknown`: neither → no breadcrumb schema; out of scope

### B2. Confirm rendered output for a sample of `safe-to-edit` pages

**What:** before bulk-removing, build the site and verify our `safe-to-edit` classification matches actual rendered output.

**How:**
```bash
rm -rf .next && npm run build
python3 <<'PY'
import re, json, glob

JID_PATTERN = '"@type":"BreadcrumbList"'

# Sample 5 pages classified as safe-to-edit, check they really have 2 BreadcrumbList
for path in glob.glob(".next/server/app/**/*.html", recursive=True):
    html = open(path, encoding="utf-8", errors="ignore").read()
    blocks = re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', html, re.DOTALL)
    count = sum(1 for b in blocks if 'BreadcrumbList' in b)
    if count > 1:
        print(f"  {count}× BreadcrumbList: {path.replace('.next/server/app/', '')}")
PY > tasks/gsc-indexing-fix/evidence/breadcrumb-duplicates-baseline.txt
```

**Acceptance:** the file shows the duplicate cohort. Cross-check that every page in this list also appears as `safe-to-edit` in the matrix from B1. Any mismatches are investigated before B3.

### B3. Apply Option A edits

**Files (per matrix from B1):**
- `app/blog/[slug]/page.tsx` — remove inline `breadcrumbSchema` (lines 275–298) and from JSON-LD array (line 306)
- `app/heathrow-parking/[terminal]/page.tsx` — same pattern
- For each page in `safe-to-edit` with `BreadcrumbJsonLd` AND HeroWrapper: remove the `<BreadcrumbJsonLd items={...} />` element and clean up imports
- `components/hero/Breadcrumbs.tsx` — fix trailing-slash inconsistency: change home id to match canonical (`https://www.the-anchor.pub` no slash)

**Acceptance:**
- `npm run lint` clean.
- `npx tsc --noEmit` clean.
- `npm run build` clean.
- All affected files are committed with imports cleaned.

### B4. Verify post-edit

**How:**
```bash
rm -rf .next && npm run build
python3 <<'PY'
import re, glob
total = dups = 0
for path in glob.glob(".next/server/app/**/*.html", recursive=True):
    total += 1
    html = open(path, encoding="utf-8", errors="ignore").read()
    blocks = re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', html, re.DOTALL)
    if sum(1 for b in blocks if 'BreadcrumbList' in b) > 1:
        dups += 1
        print(f"  STILL DUP: {path.replace('.next/server/app/', '')}")
print(f"\n{dups} of {total} pages have >1 BreadcrumbList")
PY > tasks/gsc-indexing-fix/evidence/breadcrumb-duplicates-post-fix.txt
```

**Acceptance:** `0 of <N> pages have >1 BreadcrumbList`.

---

## Workstream C — Automated guardrails (P0/P1 pulled forward)

**Scope:** prevent regression of fixes shipped in [`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) and PR 1, and lay foundation for the audit script the orphan sweep needs.

**Consultant requirement:** "automated checks before another large batch of SEO edits ships."

### C1. Add Jest test for robots.txt + sitemap.xml + redirect rules

**File:** `tests/seo-indexing.test.ts` (new).

**What it asserts:**
- Generated `robots.txt` does not contain `Disallow: /*?dpl=*`
- Generated `robots.txt` allows `/_next/static/`
- Sitemap URLs (sampled) are not redirect sources in any of the 6 redirect JSON files
- Sitemap URLs (sampled) are not `noindex` source in any blog post frontmatter
- `app/robots.ts` and `next.config.js` redirect arrays don't contain conflicting rules

**Acceptance:** `npm test -- seo-indexing` passes. The test would have caught the `/drinks/baby-guinness` sitemap-vs-redirect contradiction we fixed in [`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6).

### C2. GSC CSV audit script

**File:** `tasks/gsc-indexing-fix/audit-gsc-csvs.mjs` (new).

**What it does:**
- Walks `temp/GSC Errors/the-anchor.pub-Coverage-Drilldown-2026-04-30 (0..7)/` (or any future export folder)
- Parses every `Table.csv` with a real CSV parser (handles quoted fields with embedded line breaks — consultant requirement)
- Classifies each URL by:
  - Issue category (from Metadata.csv)
  - URL type: `page`, `redirect_source`, `static_asset`, `og_image`, `parameter_variant`, `legacy_wix`, `unknown`
  - Cohort: `tag`, `post`, `event`, `drink`, `private_hire`, `food_menu`, `other`
- Emits a single CSV: `url, issue, url_type, cohort, last_crawled`
- Plus a summary: counts by issue × url_type

**Acceptance:** running the script against the current export reproduces the 596-URL count and produces a structured CSV that the orphan audit (Workstream E) can consume.

---

## Workstream D — Sitemap investigation (R2.7) — research task

**Scope:** diagnose why URL Inspection reports `Sitemaps: Temporary processing error` on some pages.

**No code change in PR 1.** Findings get appended to the spec. Any code change becomes a follow-up PR.

### D1. Direct fetch matrix

**How:**
```bash
mkdir -p tasks/gsc-indexing-fix/evidence/sitemap-tests
for host in www.the-anchor.pub the-anchor.pub; do
  for trail in "" "/"; do
    for ua in "Googlebot/2.1" "Mozilla/5.0"; do
      label="${host}${trail//\//-slash}-${ua// /_}"
      curl -sI -A "$ua" "https://$host/sitemap.xml${trail}" \
        > "tasks/gsc-indexing-fix/evidence/sitemap-tests/headers-${label}.txt"
      curl -s  -A "$ua" "https://$host/sitemap.xml${trail}" \
        > "tasks/gsc-indexing-fix/evidence/sitemap-tests/body-${label}.xml"
    done
  done
done
```

**Acceptance:** evidence files exist. Compare HTTP statuses, body sizes, and bytes-difference. Note any inconsistency.

### D2. XML validation

```bash
xmllint --noout tasks/gsc-indexing-fix/evidence/sitemap-tests/body-www.the-anchor.pub-Mozilla*.xml
```

**Acceptance:** XML is well-formed. Note any errors.

### D3. URL-by-URL validation

For every URL in the sitemap, verify HTTP 200, no redirect, no `noindex`. Use the audit script foundation from C2.

### D4. Repeat-fetch consistency test

```bash
for i in 1 2 3 4 5 6 7 8 9 10; do
  curl -s "https://www.the-anchor.pub/sitemap.xml" | wc -c
done
```

**Acceptance:** all 10 byte counts match. Different counts → dynamic content drift; investigate `app/sitemap.ts`.

### D5. Findings document

Append to spec under §11.4 (sitemap investigation): test results, hypothesis confirmed/rejected, recommended fix(es) for follow-up PR.

---

## Workstream E — Orphan audit + linking sweep (R2.4 + R2.5 + R2.6)

**Scope:** site-wide. Multiple PRs.

**Consultant requirements:**
- Use rendered output / Next route metadata as the source of truth, not just `rg`
- Classify URLs by `url_type` before linking
- Each batched PR includes before/after link-count table + exact anchor text

**Cannot start until** Workstream C2 (audit script) is functional.

### E1. 5-URL stratified spot check (research task)

Sample 5 URLs from the 116 "Crawled — currently not indexed" cohort:
- 1 recent blog post
- 1 older blog post
- 1 tag page
- 1 drinks page
- 1 event page

For each, count incoming internal links using the link graph from C2 + a `next build` rendered output scan.

**Acceptance:** spec updated with results table. Decision threshold from owner approval: 4+ of 5 confirm orphan pattern → proceed; fewer → revise plan.

### E2. Build full link graph (depends on C2 + E1)

Use `app/sitemap.ts` output as the URL universe; for each URL, count incoming links from rendered HTML in `.next/server/app/**/*.html` (post-build) — captures component-generated links the consultant warned about.

Output: `tasks/gsc-indexing-fix/evidence/link-graph.csv` with columns `url, incoming_count, sample_referrers, url_type`.

### E3. Classify, identify orphans (depends on E2)

Apply rules:
- Orphan: 0 incoming links, `url_type=page`, status=200
- Weak: 1–2 incoming, all from sibling/peer pages
- Adequate: 3+ incoming

Drop from candidate set: `url_type ∈ {redirect_source, static_asset, og_image, parameter_variant, legacy_wix}`.

Output: `tasks/gsc-indexing-fix/evidence/orphan-candidates.csv`.

### E4. Map orphans to topical parents (depends on E3)

For each orphan, propose:
- Parent page (highest-authority topical match)
- Anchor text (descriptive, plain English)
- Insertion point on parent page (specific section or paragraph)

Output: `tasks/gsc-indexing-fix/evidence/link-proposals.csv` with columns `orphan_url, parent_page, anchor_text, insertion_section`.

### E5. Batched linking PRs (depends on E4)

PR 2 = first 5–10 link additions, highest commercial intent first.
Each PR includes:
- Before/after link-count table for affected URLs
- Diff of each anchor sentence
- Updated `link-graph.csv` showing the URLs are no longer orphans

PR 3+ = subsequent batches until orphan list is exhausted.

---

## Workstream F — Reviewer P0/P1 guardrails not yet covered

These are explicitly **deferred to follow-up PRs** but listed here so the consultant sees them in the plan, not lost as backlog:

- **Redirect-error chain investigation** — the 7 `/blog/tag/*` URLs flagged "Redirect error". Manual `curl -L -I` chain trace + Vercel function logs review.
- **URL lifecycle policy** — document for the team: when does a removed URL become a redirect, 410, or noindex? Lives at `tasks/gsc-indexing-fix/url-lifecycle-policy.md`.
- **Full audit-script extension** — currently C2 covers GSC CSV parsing. Extend it to validate sitemap canonical-only, run as a CI step.
- **Don't robots-block opengraph-image** — verify current state and add CI check.

These ship after PR 1 + Workstream D + first orphan-link batch.

---

## Acceptance for "round 2 done"

The round 2 work is considered complete when:

1. PR 1 (Workstream A + B + C1 + C2) is merged and deployed.
2. Cloudflare cache purge confirmed via post-deploy command-line capture (Workstream A4).
3. Sitemap investigation findings document (Workstream D5) is committed.
4. Orphan spot-check (Workstream E1) is committed; pattern decision confirmed in spec.
5. At least one batched linking PR (E5 — PR 2) has shipped.
6. Pre-validation in GSC: only re-validate the issue categories where production evidence proves the fix landed.
7. After 14 days, GSC drilldowns re-exported and counts compared per category.

---

## What runs automatically vs needs human review

**Fully automatic (the implement-plan skill executes these):**
- A1, A2 (cache header code change + baseline capture)
- A4 (post-deploy capture, after deploy lands)
- B1, B2, B3, B4 (breadcrumb enumeration + edits + verification)
- C1, C2 (test + audit script)
- D1, D2, D3, D4 (sitemap fetch tests)
- E1, E2, E3 (orphan analysis up to candidate list)

**Needs human review before merging:**
- B3 edit list (consultant requires per-page enumeration validation before any `BreadcrumbJsonLd` removal)
- D5 findings document (consultant + owner read before committing)
- E4 link proposals (copy review for anchor text)
- E5 batched PRs (each PR independently reviewed)

**Manual owner action:**
- A3 Cloudflare cache purge

---

## Risk register

| Risk | Likelihood | Mitigation |
|---|---|---|
| Cloudflare overrides our cache header via page rules | Low | A4 verification will catch it; if so, owner adds cache rule in Cloudflare dashboard |
| B3 misclassifies a page; removing schema breaks something | Low | B1+B2 enumeration + rendered-output verification before any change |
| Breadcrumb fix introduces visible UI change | Very low | Edits only touch JSON-LD scripts, not the visual `<Breadcrumbs>` component output |
| Sitemap investigation finds nothing | Medium | Findings doc still useful; rule out hypotheses one by one |
| Orphan sweep adds links that look engineered to Google | Medium | Strict rules: one link per parent per orphan, sentence-style not link-list, copy review per PR |
| Bulk content edits break build | Low | Each batched PR runs full lint+typecheck+build before merge |

---

## Rollback plan (if something goes wrong post-deploy)

| Workstream | Rollback action |
|---|---|
| A (cache) | `git revert` the next.config.js change. No data state. |
| B (breadcrumb) | `git revert` the affected files. JSON-LD reverts; no UI change. |
| C1 (test) | Test addition; deletion or skip is non-breaking. |
| C2 (script) | Pure tooling, no production impact. |
| D (sitemap) | If a fix shipped: `git revert` and re-investigate. |
| E5 (linking) | Each PR is its own atomic revert. Pure content. |
