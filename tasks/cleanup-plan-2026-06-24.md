# Repo Cleanup Plan — 2026-06-24

**Status:** Proposed — execute verbatim only after owner approval.
**Scope:** `OJ-The-Anchor.pub` (Next.js 14 marketing site). Read-only audit; nothing has been modified.

---

## 1. Headline

- **Files reviewed:** ~1,757 across four areas (tasks/ 147, docs/ 106, root scratch/caches 1,409, root loose + config/content/scripts 95).
- **Proposed for deletion:** ~2,800+ physical files — overwhelmingly regenerable caches (`jest_dx/` 823, `node-compile-cache/` 578) plus untracked scratch dirs (`output/` 44 MB, `debug-seasonal.log` 8 MB, `.seo-workspace/`, `temp/`, logs).
- **Proposed for archive:** ~290 tracked historical artefacts (all of `tasks/` bar 2 files, ~95 superseded docs).
- **Estimated reclaim:** ~70 MB working tree + ~21 MB removed from git versioning (the two tracked caches) + ~290 stale tracked files out of active browsing.
- **Tidiness gain:** `tasks/`, `docs/`, `scripts/`, and the repo root all collapse to live-only content; ~1,400 cache files stop being versioned.

**Top 6 wins:** (1) untrack `jest_dx/` + `node-compile-cache/` (1,401 tracked cache files, 21 MB in git — VERIFIED tracked); (2) delete `output/` (44 MB) + `debug-seasonal.log` (7.7 MB stale artefact); (3) archive all of `tasks/` except the 2 code-referenced gsc specs; (4) archive `docs/superpowers/` + `docs/plans/` design history (42 files); (5) consolidate 4 keyword docs → 1 and collapse `claims.json`/`updated_graph.fixed.json` into `SSOT.json`; (6) delete root `updated_graph.fixed.json` + the one-off docx scripts.

> **Post-discovery verification (2026-06-24):** Two original claims were wrong and have been corrected below — (a) `debug-seasonal.log` has **no** live writer in source (the previously alleged `lib/seasonal-utils.ts:86` does not exist); it is a stale artefact, just delete it. (b) **No** `.DS_Store` is git-tracked; all are untracked simple deletes. The 1,401 tracked caches and the 6 code/test/CI references to the gsc specs were independently confirmed.

---

## 2. Safe deletes — regenerable caches & untracked scratch

All items below are **gitignored** (verified in `.gitignore`: `*.log`, `temp/`, `output/`, `jest_dx/`, `node-compile-cache/`, `tsx-*/`, `.seo-workspace/`). Untracked items can be removed with no git history impact. One sweep: `git clean -fdX` clears all untracked gitignored scratch (~53 MB).

| Target (glob) | Tracked? | Action | Reason | Referenced by |
|---|---|---|---|---|
| `output/` | untracked | delete (44 MB) | One-off Playwright before/after PNGs (Feb/May). | none found |
| `debug-seasonal.log` | untracked | delete (7.7 MB) | Stale runtime log; **no current source code regenerates it** (verified across app/lib/hooks/scripts). | none found — no live writer |
| `.seo-workspace/` | untracked | delete (1.1 MB) | One-off SEO agent orchestration scratch. | none found |
| `temp/` | untracked | delete (204 KB) | One-off GSC CSV downloads (Mar/Apr). | none found |
| `tsx-501/` | untracked | delete (24 KB) | tsx loader cache, regenerable. | none found |
| `build.log`, `config/build.log`, `config/build-output.log` | untracked | delete | Captured build output; logs do not belong in `config/`. | none found |
| `.claude/changes-manifest.log`, `.redesign-workspace/**/*.log`, `.superpowers/**/*.log` | untracked | delete | Tool/agent run logs, disposable. | none found |
| `content/menu/food.json.backup` | untracked | delete | Stale manual backup; live `food.json` is read by `lib/menu-parser.ts`. | none found |
| `.DS_Store` (anywhere) | untracked (verified: none tracked) | delete | macOS metadata. All `.DS_Store` are untracked — simple delete, no `git rm` needed. Consider adding `.DS_Store` to `.gitignore`. | none |

**Two tracked-but-gitignored caches — untrack, do not just delete:**

| Target | Action | Reason |
|---|---|---|
| `jest_dx/` (823 files, 17 MB) | `git rm -r --cached jest_dx/` then delete working copy | Jest transform/haste cache committed before the ignore rule. `.gitignore` already blocks re-add. Regenerates on `npm test`. |
| `node-compile-cache/` (578 files, 4.4 MB) | `git rm -r --cached node-compile-cache/` then delete working copy | Same situation. Regenerable build cache. |

> Do these two as **one commit**: `git rm -r --cached jest_dx/ node-compile-cache/`.

---

## 3. Old reviews / plans / superseded work

All git-tracked historical artefacts for **shipped** features (SEO overhaul Mar 2026, GSC remediation Jun 2026, book-table/table-booking, join-our-team, world-cup). Git history preserves them, so **archive = move out of working tree** (suggest `docs/archive/`) or drop after a `git tag archive/pre-2026-06-cleanup`. None referenced by code unless noted.

### tasks/ — archive the whole directory except 2 files

| Target | Files | Action | Reason |
|---|---|---|---|
| `tasks/codex-qa-review/` | 57 (~2 MB) | archive | Dated QA review packs for merged features; 3 packs are 376–580 KB. none found. |
| `tasks/gsc-indexing-fix/` **except** `FINAL-SPEC.md` + `url-lifecycle-policy.md` | ~38 | archive | Evidence CSVs, one-off `.mjs`, 84 KB review pack, orchestration handoffs. none found. |
| `tasks/book-table-remove-purpose-chooser/` | 13 | archive | Shipped feature spec + orchestration handoffs. none found. |
| `tasks/book-table-slot-window/` | 12 | archive | Shipped table-booking slot-window work. none found. |
| `tasks/review-book-table/` | 8 | archive | Multi-agent review + defect log; remediated. none found. |
| `tasks/implement-plan/` | 6 | archive | SEO overhaul wave-1 handoffs; shipped 22 Mar. none found. |
| `tasks/gsc-remediation-2026-06-01/` | 3 | archive | Spec + one-off triage `.mjs` + dated 50 KB CSV; shipped 1 Jun. none found. |
| `tasks/SPEC-join-our-team.md` + 4 `*-join-our-team.md` | 5 | archive | Planning docs; page shipped (`content/blog/pub-jobs-heathrow`). none found. |
| `tasks/world-cup-seo-plan.md` | 1 | archive | Loose plan; tracked spec is `seo/world-cup-page-spec.md`. none found. |
| `tasks/seo-powerhouse/sunday-lunch-recommendations.md` | 1 | archive | Recommendations consumed (walk-in shipped 17 May). none found. |

### docs/ — superseded SEO/design history

| Target | Files | Action | Reason |
|---|---|---|---|
| `docs/seo-overhaul/` | 27 | archive | 22 Mar engagement, superseded by Jun work. none found. |
| `docs/seo-audit/` + `docs/seo-audit-2026-04-04.md` + `docs/seo-blueprint-audit.md` | 8 | archive | April one-off audits, superseded. none found. |
| `docs/seo-revenue-growth-spec-2026-04-30.md` | 1 | archive | 71 KB completed-work spec. none found. |
| `docs/gsc-coverage-fix-spec.md` | 1 | archive | Shipped; duplicated under `tasks/gsc-*`. none found. |
| `docs/qa-reviews/` | 2 | archive | seo-revenue QA reports, Apr; shipped. none found. |
| `docs/superpowers/plans/` + `docs/superpowers/specs/` | 33 | archive | Mar–Apr plan/spec pairs for shipped features. none found in code. |
| `docs/plans/` | 9 | archive | Mar plan/design pairs; superseded by current code. none found. |
| `docs/redesign-spec.md` + `docs/redesign-implementation-plan.md` | 2 | archive *(confirm shipped — see §7)* | 10 Jun design-system migration; `.redesign-workspace/` waves suggest executed. none found. |
| `docs/component-standardisation.md` | 1 | archive *(confirm checklist done — §7)* | Living doc; standardisation waves suggest complete. none found. |

### root / config / scripts — stale operational scratch

| Target | Action | Reason |
|---|---|---|
| `scripts/archive/` (~38 one-shot migration scripts) | archive/drop | Self-declared archive of completed migrations; none in `package.json`. |
| `scripts/utils/` (~12 issue-automation + rename/build helpers) | archive | One-off GitHub-issue + rename scripts; none referenced. orangejelly refs are this project's own API (not foreign-brand). |
| `scripts/test-execution.ts` | **delete** | Literally `console.log('Hello from TS script')`. none found. |
| `config/blog-urls.txt` | archive | Wix-era redirect source list; not imported. none found. |
| `config/featured-cocktails-poster.html` | archive | One-off marketing HTML; not served. none found. |
| `updated_graph.fixed.json` (root, tracked, 28 KB) | **delete** | One-off graph export; `grep -rl updated_graph` = nothing. none found. |
| `content/copy-decks/*.md` (2) | archive *(confirm copy shipped — §7)* | "Ready for review" SEO decks, Apr; not imported. none found. |

---

## 4. Consolidations — merge A + B + C → D

1. **All of `tasks/`** *(except `tasks/gsc-indexing-fix/FINAL-SPEC.md` + `tasks/gsc-indexing-fix/url-lifecycle-policy.md`)* → `docs/archive/2026-tasks/` (or git tag `archive/tasks-pre-2026-06`, then `git rm`). *Reason: 144 of 146 tracked files are unreferenced shipped-feature history; biggest chunk is `tasks/codex-qa-review/` (~2 MB).*
2. **`docs/seo-overhaul/` + `docs/seo-powerhouse/` + `docs/seo-audit/` + `docs/seo-audit-2026-04-04.md` + `docs/seo-blueprint-audit.md` + `docs/qa-reviews/`** → `docs/archive/seo-2026/`. *Reason: multiple April SEO engagements/audits on the same site, all superseded by Jun overhaul. `seo-powerhouse/` is a partial rerun of `seo-overhaul/`.*
3. **`docs/superpowers/plans/` + `docs/superpowers/specs/` + `docs/plans/`** → `docs/archive/feature-history/`. *Reason: 42 completed-feature plan/spec pairs with shipped code; declutters `docs/` root.*
4. **`docs/seo-keyword-reference.md` + `docs/keyword-plan-april-2026.md` + `docs/keyword-optimisation-april-2026.md` + `docs/keyword-optimisation-roadmap-may-2026.md`** → **one** `docs/keyword-reference.md` (carry forward the still-current keyword data; archive the dated intermediates). *Reason: four sequential docs on one keyword strategy.*
5. **`scripts/utils/` + `scripts/archive/`** → `scripts/_archive/` (or drop). *Reason: ~50 stale scripts none of `package.json`/docs reference; leaves only the ~8 live utilities.*
6. **`config/blog-urls.txt` + `config/featured-cocktails-poster.html` + `updated_graph.fixed.json`** → `docs/archive/` (or delete). *Reason: unreferenced one-off data/exports that are not config and do not belong in `config/` or root.*

---

## 5. Stale docs — canonical winner named

| Superseded | Canonical winner | Action |
|---|---|---|
| `docs/claims.json` (29 KB brand-claims graph) + root `updated_graph.fixed.json` | **`SSOT.json`** (the imported structured source of truth) | Archive/delete the two graph exports — they duplicate brand facts `SSOT.json` already owns; avoids drift. `grep claims.json` = none in code. |
| `docs/ssot-review-spec.json` (92 KB, "Brand Review Document 2026-03-22") | **`docs/SSOT.md`** | Archive — one-off review export, superseded. none found. |
| `docs/seo-keyword-reference.md` + 3 keyword docs | one merged `docs/keyword-reference.md` | See §4.4. |
| `docs/seo-powerhouse/` | `docs/seo-overhaul/` (then both archived) | See §4.2. |
| `docs/extract-docx.mjs`, `docs/extract-docx-v2.mjs`, `docs/generate-ssot-docx.mjs` | n/a — **delete** | One-off docx scripts (v1+v2 near-dupes); not in `package.json`/code/tests. none found. |

---

## 6. Keep / protected — nothing critical is touched

- **Canonical docs:** `docs/SSOT.md`, `SSOT.json`, `docs/api-integration.md`, `docs/brand-strategy.md`, `CLAUDE.md`, `AGENTS.md`, `README.md`. *(Note: `docs/parking-api.md` is listed as protected in CLAUDE.md but does not exist on disk — see §7.)*
- **Code-referenced specs:** `tasks/gsc-indexing-fix/FINAL-SPEC.md` + `tasks/gsc-indexing-fix/url-lifecycle-policy.md` — cited in `middleware.ts`, `next.config.js`, `lib/middleware-redirects.ts`, `tests/sitemap-events.test.ts`, `tests/seo-indexing.test.ts`, `tests/event-seo-strategy.test.ts` (verified). If the folder is archived, **move these two and update the 6 code/test pointers**.
- **Source:** `app/`, `components/`, `lib/`, `tests/`, `types/`, `hooks/`, `middleware.ts`.
- **Live config:** `config/redirects/*.json` (imported by `app/sitemap.ts`, `lib/middleware-redirects.ts`, `next.config.js`, blog tag pages), `package.json`, next/tailwind/ts/jest/postcss configs, `.env.example`.
- **Live content:** `content/blog/*` (135 posts → `lib/markdown.ts`), `content/menu/food.json` + `drinks.json` (→ `lib/menu-parser.ts`).
- **Live tooling:** `scripts/audit-hero.js`, `scripts/audit-menu-pages.js`, `scripts/optimize-images.js` (wired into `package.json`); plus the reusable `audit-dark-surfaces.mjs`, `check-static-business-hours.js`, `check-managers-special.ts`, `compress-images.mjs`, `public-png-sweep.mjs`.
- **Living references:** `docs/architecture/*` (regenerated by session-setup), `docs/analytics/*`, `docs/image-brief.md`.

---

## 7. Open questions for the owner

1. ~~`debug-seasonal.log` code leak~~ **RESOLVED:** no live writer exists in source (the alleged `lib/seasonal-utils.ts:86` line is not present). The 7.7 MB file is a stale artefact — plain delete, no code fix required. No owner action needed.
2. **`docs/parking-api.md`** is named as protected in `CLAUDE.md` but **does not exist on disk**. Was it removed intentionally (update CLAUDE.md), or lost (restore)?
3. **`docs/redesign-spec.md` + `docs/redesign-implementation-plan.md` + `docs/component-standardisation.md`** (10 Jun, "Approved for implementation"): confirm the redesign shipped before archiving — these are recent.
4. **`content/copy-decks/*.md`** ("Ready for review", Apr 11): confirm the Christmas-parties SEO rewrites were applied to live pages before archiving.
5. **`seo/` (3 tracked .md, last commit 10 May)** + `scripts/test-managers-special.ts` + `scripts/probe-draft-events.ts`: archive vs keep depends on whether world-cup planning / these probes are still wanted. Owner call.
6. **Archive destination:** prefer physical move to `docs/archive/` (browsable), or a `git tag archive/pre-2026-06-cleanup` + `git rm` (cleaner tree, history-only)? Affects how §3–§4 are executed.
