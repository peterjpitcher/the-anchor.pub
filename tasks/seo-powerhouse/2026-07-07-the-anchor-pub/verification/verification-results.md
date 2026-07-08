# Verification Results — 7 July 2026

## Implemented fixes (branch `chore/seo-powerhouse-safe-fixes-2026-07-07`)
| Check | Result |
|---|---|
| `npx tsc --noEmit` | **exit 0** — clean |
| `npx eslint` (4 changed files) | **exit 0** — clean |
| `git diff --stat` | 4 files, +4 / -4 |
| SEO-021 string present | ✅ `7-12 minutes from Heathrow terminals` |
| SEO-026 `/menus` link removed | ✅ now `/food-menu` (matches existing link at :372) |
| SEO-031 `/leave-a-review` removed | ✅ now `/leave-review` |
| SEO-044 spelling | ✅ `Recognised customer` |

**Not run:** full `npm run build` + live-render. Justification: the four edits change no imports, types, or logic (a link href, a robots string, a card description, one word), so they cannot alter the build graph; tsc+lint is proportionate. Full build/deploy is the owner's normal pre-merge gate. Changes left **uncommitted** on the branch for review.

## June-2026 regression checks (from the Technical + Authority specialists)
| June change | Still holding? |
|---|---|
| AI crawlers unblocked in robots | ✅ verified |
| `/blog/tag/*` noindex | ✅ verified (27 noindex pages, all deliberate) |
| Legacy `/post/*`, `/event-details/*` 301s | ✅ verified |
| Clean sitemap, 0 orphans, 0 missing alt text, HSTS | ✅ verified |
| Homepage schema `sameAs` (June open item) | ✅ all 6 URLs verified as real, correct-business profiles |
| Booking cap = 20 | ✅ matches live flow |

## Regressions / drift found (fed back as new roadmap items)
- **Two legacy blog 301s now dead-end at a noindexed target** (SEO-025) — equity discarded since the June merge.
- **Hardcoded prices worse than June's "2 files"** — now 4 app pages + ~10 blogs, plus placeholder tokens rendering (SEO-015/016).
- **Sitemap shrank to 189 vs ~319 June pages**; 44 crawled pages absent (SEO-032).
- **GA4 Measurement Protocol env still unconfirmed since June** (SEO-001) + Meta Pixel proven dead in production (SEO-004).

## Post-launch monitoring (once owner ships Group A/B/C)
See `verification/post-launch-monitoring.md`.
