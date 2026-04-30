# URL Lifecycle Policy

**Owner:** SEO + Engineering, The Anchor website (`OJ-The-Anchor.pub`)
**Audience:** any developer changing routes, redirects, event lifecycle, blog tags, or one-off pages.
**Last reviewed:** 2026-04-30

This document codifies how URLs are retired on this site. It exists because GSC
"Redirect error", "Page with redirect", and "Crawled - currently not indexed"
reports recur whenever individual decisions are made ad hoc (broad redirects to
`/`, blanket redirects to `/whats-on`, deletes without 410s). Every URL that is
removed, replaced, or restricted should follow one of the cases below.

---

## Decision matrix

For any URL leaving the live surface, classify it into exactly one of these
five outcomes. The right outcome is determined by user intent, search intent,
and whether a meaningful replacement exists.

| Outcome | When to use | Status code | Indexable |
|---|---|---|---|
| **A. 301 to close replacement** | A specific replacement page covers the same intent (e.g. `/contact` → `/find-us`, retired tag → consolidated tag). | 301 | Destination indexed; source eventually drops from index. |
| **B. 301 to category/parent** | The specific URL is gone, but a topical parent is still useful (e.g. retired event → category page, retired drink → `/drinks`). | 301 | Destination indexed; source drops. |
| **C. 410 Gone** | URL is intentionally removed, no replacement, no meaningful traffic, and we want Google to drop it fast. | 410 | Not indexed; eventually dropped. |
| **D. 404 Not Found** | URL was never ours, or removal is acceptable but not deliberate enough to assert "gone forever". | 404 | Not indexed; eventually dropped. |
| **E. Render with `noindex`** | URL still useful for direct visitors (e.g. event ended page with details), but should not compete in search. | 200 | Not indexed; remains crawlable. |

**Default rules of thumb**

- Prefer A over B over E over C over D. The closer the replacement is to user
  intent, the better.
- Never use 302 (temporary) for a permanent removal. 302s do not transfer
  signals.
- Never blanket-redirect everything to `/`. The home page is not a close
  replacement for anything specific.
- Avoid chains. A 301 source whose destination is itself a 301 source is a
  chain. The `redirect-loops` test in `tests/seo-indexing.test.ts` blocks new
  chains landing in JSON config.
- Apex-host removals must apply both host change and path change in a single
  301. Middleware (`middleware.ts`) handles this via
  `lib/middleware-redirects.ts`. See `FINAL-SPEC.md` §P0.1 for the seven URL
  case study.

---

## Policy by content type

### 1. Events from the management API

Driven by `lib/event-seo-strategy.ts` (function `getEventSeoStrategy`). Behaviour:

| Event state | Strategy | Implementation |
|---|---|---|
| Active (future, not cancelled) | Render, indexable, no banner. | Default branch in `getEventSeoStrategy`. |
| Cancelled, ≤ 7 days since event date | Render with cancelled banner, indexable. | `CANCELLED_INDEX_DAYS = 7`. |
| Cancelled, > 7 days since event date | Render with cancelled banner, `noindex`. (E) | Same. |
| Recent past (≤ 30 days), not cancelled | Render with "ended" banner, still indexable. | `PAST_EVENT_REDIRECT_DAYS = 30`. |
| Stale past (> 30 days), next event in same category | 301 to next event in category. (A) | `permanentRedirect(seoStrategy.redirect)` in `app/events/[id]/page.tsx`. |
| Stale past (> 30 days), no next event in category | Render with "ended" banner, `noindex`. (E) | Page stays visible to anyone arriving from a deep link or stale category landing. |
| Draft (`event_status === 'draft'`) | 301 to `/whats-on`. (B) | `app/events/[id]/page.tsx`. |
| API returns 404 / fetch throws | 301 to `/whats-on`. (B) | `app/events/[id]/page.tsx`. |
| Slug differs from canonical segment | 301 to canonical segment. (A) | `getEventCanonicalSegment` check. |

**Rationale for blanket 301 → /whats-on on draft / missing events**

These cases produce no useful single page for a visitor. `/whats-on` is the
closest replacement and is itself a strong topical hub. We deliberately accept
that GSC may report some of these in "Page with redirect" — that is expected
behaviour for retired events, not a defect. Tests in
`tests/event-seo-strategy.test.ts` lock in this behaviour so a future edit
cannot silently demote events to `/`.

### 2. Blog tags

- Consolidation rules live in `config/redirects/tag-redirects.json`.
- Sources: deprecated, niche, or near-duplicate tags.
- Destinations: a small set of canonical tags
  (`sports`, `community`, `seasonal`, `food-and-drink`, `events`, `news`,
  `offers`, `guides`, `private-hire`, `heathrow`, plus a few topic pages such
  as `/quiz-night`).
- Every `tag-redirects.json` source is also excluded from the sitemap by
  `app/sitemap.ts` (`redirectSourceTags` filter), so we never list a redirect
  source in `sitemap.xml`. The `sitemap-vs-redirects` test guards this.
- Broad archive tags that are useful for browsing but weak as standalone
  search landing pages render with `noindex, follow` (case E) and are excluded
  from the sitemap by `isNoindexBlogTag()` in `lib/blog-tag-policy.ts`.
  Current broad noindex tags:

| Tag URL | Preferred indexable page(s) | Reason |
|---|---|---|
| `/blog/tag/events` | `/whats-on`, plus specific event/category pages such as `/quiz-night`, `/music-bingo`, `/cash-bingo` | The archive is a mixed navigation page; event-intent searches should land on the live event hub or specific event pages. |
| `/blog/tag/food-and-drink` | `/food-menu`, `/sunday-lunch`, `/pizza-menu`, `/burger-menu`, `/drinks` | Commercial food/drink intent is better served by current menu pages than a chronological blog archive. |
| `/blog/tag/news` | `/blog` or specific current posts | Generic pub news archives have weak search intent and can dilute stronger local/commercial pages. |
| `/blog/tag/sports` | `/live-sport`, `/live-sport/six-nations`, `/live-sport/f1`, `/live-sport/boxing`, `/live-sport/world-cup` | Sport-intent searches should land on evergreen live-sport pages, not mixed historical posts. |

These noindex tag pages may still render for visitors and may still appear in
internal tag clouds; they should not be re-added to `sitemap.xml` unless they
are rebuilt into genuine search landing pages with a clear keyword target,
current content, and a conversion path.

### 3. Legacy Wix `/post/*` URLs

- `config/redirects/wix-redirects.json` maps every known Wix permalink to its
  current page (case A) or to a topical parent (case B).
- The pattern `/post/:path*` is not a catch-all — only known slugs are mapped,
  so an unmapped `/post/...` returns 404 (case D) by design.
- Wix images (e.g. `images/page-headers/...`) without code references are
  case D. They appear briefly in GSC and drop out as Google stops re-crawling.

### 4. Retired drink / product pages

- Mapped via `config/redirects/drinks-redirects.json` to `/drinks` or a
  closely-related drink (case A or B).
- Removal of a drink page must be paired with a redirect; never simply unlist
  it. Tests guard `sitemap-vs-redirects` so the sitemap does not list both a
  drink and a redirect from that drink.

### 5. One-off pages (`/hr`, `/contact`, `/free-parking`, etc.)

| URL | Destination | Reason |
|---|---|---|
| `/hr` | `/` | Confirmed deliberate fallback; no jobs page exists. (B) |
| `/contact` | `/find-us` | Consolidated to a single contact route. (A) |
| `/free-parking` | `/heathrow-parking` | Topical replacement. (A) |
| `/celebrating-sport-at-the-anchor` | `/whats-on` | Retired campaign, no replacement page. (B) |

When adding a new one-off, prefer case A (a real replacement) over case B (a
parent). If a real replacement does not exist, write the page first.

### 6. Stale past blog posts

- Posts that are excluded by the SSOT or that the SSOT contradicts must be
  redirected to the closest replacement (case A) or to the topical parent
  (case B).
- A post that no longer reflects the SSOT must not be left live. Add
  `noindex: true` to its frontmatter (case E) only as an interim measure;
  redirect or remove + 410 should follow.
- Public blog archive and tag archive pages must surface only indexable posts
  (`getIndexableBlogPosts()`), so intentionally noindexed legacy or promotional
  posts do not dilute indexable archive pages.
- Indexable blog posts should not link through previous/next navigation into
  noindexed archive posts. Direct access to a noindexed post may still render
  with `noindex, follow` for visitors with old links.

Current case-E stale posts added during the GSC indexing cleanup:

| Slug | Reason |
|---|---|
| `winter-hours-cosy-times-at-the-anchor` | 2019 seasonal hours article; likely outdated and not a reliable current-hours page. |
| `what-is-the-history-of-april-fools-day` | Generic dated holiday content with weak local/commercial search intent. |
| `womens-day-2024` | Dated 2024 event/offer article. |

---

## Operating rules

1. **Never blanket-redirect to `/`** unless there is genuinely no closer page.
   `/` is the home page; it should be a destination of last resort.
2. **One hop only.** Apex + path consolidation is flattened in middleware (see
   `lib/middleware-redirects.ts`). Adding a new redirect whose destination is
   itself a redirect source breaks the `redirect-loops` test.
   Broad catch-all redirects in `vercel.json` are not allowed because Vercel
   routing runs before middleware and can recreate chains in production.
3. **Never robots-block as a workaround.** If a URL is wrong, fix the URL or
   redirect it; do not hide it from crawlers via `robots.txt`. (Past incident:
   `Disallow: /*?dpl=*` blocked Vercel deploy-tagged static assets.)
4. **`noindex` is a content statement, not a substitute for a redirect.** Use
   it when the page should remain reachable to direct-link visitors but not
   compete in search.
5. **Document every retirement decision in this file.** A new redirect or 410
   without a row in this matrix is incomplete work.

---

## Verification checklist for any URL retirement PR

- [ ] Decision recorded in this file.
- [ ] If a redirect was added: `npm test -- seo-indexing` still passes
      (`redirect-loops`, `sitemap-vs-redirects`).
- [ ] If a sitemap entry was removed: live `sitemap.xml` no longer lists it
      after deploy.
- [ ] If blog tag indexability changed: `npm test -- seo-indexing` still
      verifies tag robots metadata and sitemap inclusion/exclusion.
- [ ] If middleware rules changed: live `curl -I -L` of every affected URL
      lands on the final destination in one hop on www and one hop on apex.
- [ ] If event lifecycle behaviour changed: `tests/event-seo-strategy.test.ts`
      updated and passing.
