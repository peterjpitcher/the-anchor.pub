# Thin Tag Page Consolidation — Design Spec

**Date:** 2026-04-12
**Status:** Approved (revised after adversarial review)
**Complexity:** M (3) — 6 files + 16 blog posts, no schema changes

## Problem

Google Search Console is flagging 16 blog tag pages as thin content. These tag archive pages used generic fallback copy from `generateFallbackSEOContent()` instead of dedicated content entries.

**Already done:** Custom SEO content entries have been written for all 16 tags in `lib/tag-seo-content.ts`. However, 10 of these tags have only 1-2 blog posts each — even with good intro copy, a page with a single blog card will still be flagged as thin.

## Solution

Two-pronged approach:
1. **6 tags keep their custom content** — they have enough posts to justify indexing
2. **10 thin tags get 301-redirected** into parent tags, consolidating link equity

### Prerequisite: `guide` → `guides` tag standardisation

**Found during adversarial review:** 16 blog posts use `guide` (singular) in their frontmatter tags, while 27 posts use `guides` (plural). The system treats these as two separate tags — `lib/markdown.ts` does no singular/plural normalisation, and tag matching in `app/blog/tag/[tag]/page.tsx` line 62 is exact string inclusion.

This must be fixed first because the `pricing` and `comparison` redirects target `/blog/tag/guides`, but the affected posts have `guide` (singular) and would not appear on the destination page.

## Surviving Tags (keep indexed)

| Tag | Posts (total on disk) | Posts (live as of 2026-04-12) | Content status |
|-----|-------|------|---------------|
| `food-and-drink` | 55 | 55 | Custom entry in `tagSEOContent` ✓ |
| `guides` | 27 (+16 after guide→guides rename = 43) | ~27 | Custom entry in `tagSEOContent` ✓ |
| `private-hire` | 17 | 7 | Custom entry in `tagSEOContent` ✓ |
| `travel` | 6 | 6 | Custom entry in `tagSEOContent` ✓ |
| `heathrow` | 6 | 6 | Custom entry in `tagSEOContent` ✓ |
| `birthdays` | 5 | 4 | Custom entry in `tagSEOContent` ✓ |

**Note on post counts:** Several blog posts have future `publishDate` values. `lib/markdown.ts` line 129 excludes unpublished posts at runtime. Live counts will increase as posts go live over the coming weeks. The consolidation plan is based on total posts on disk, not current live counts.

## Consolidation Map (301 redirect)

| Thin tag | Posts | → Parent tag | Parent gains | Rationale |
|----------|-------|-------------|-------------|-----------|
| `function-room` | 1 | `private-hire` | +0 (already tagged) | Subset of private hire |
| `gender-reveal` | 1 | `private-hire` | +0 (already tagged) | Subset of private hire |
| `wakes` | 1 | `private-hire` | +0 (already tagged) | Subset of private hire |
| `christenings` | 2 | `private-hire` | +0 (already tagged) | Subset of private hire |
| `work-events` | 2 | `private-hire` | +0 (already tagged) | Subset of private hire |
| `plane-spotting` | 1 | `heathrow` | +0 (already tagged) | Heathrow proximity content |
| `things-to-do` | 1 | `heathrow` | +0 (already tagged) | Local area / Heathrow |
| `savings` | 1 | `guides` | +0 (already tagged) | Practical advice content |
| `pricing` | 1 | `guides` | +1 (after guide→guides fix) | Practical advice content |
| `comparison` | 1 | `guides` | +1 (after guide→guides fix) | Practical advice content |

**Net effect:** `private-hire` +0, `heathrow` +0, `guides` +2 (after guide→guides rename). The consolidation value is primarily in removing thin pages from the index and consolidating link equity, not in bulking up parent pages.

## Changes Required

### Change 0: Standardise `guide` → `guides` across all blog posts
**Files:** 16 blog post frontmatter files in `content/blog/*/index.md`

Rename `  - guide` to `  - guides` in frontmatter tags of these posts:

1. `content/blog/30th-birthday-party-ideas-venues/index.md`
2. `content/blog/40th-birthday-party-ideas-venues/index.md`
3. `content/blog/50th-birthday-party-ideas-venues/index.md`
4. `content/blog/60th-birthday-party-ideas-venues/index.md`
5. `content/blog/christening-party-ideas-venues/index.md`
6. `content/blog/function-room-hire-near-heathrow-staines/index.md`
7. `content/blog/gender-reveal-party-ideas-venues/index.md`
8. `content/blog/how-to-plan-christening-reception/index.md`
9. `content/blog/how-to-plan-surprise-birthday-party/index.md`
10. `content/blog/leaving-party-ideas/index.md`
11. `content/blog/private-party-venues-near-heathrow/index.md`
12. `content/blog/private-room-hire-cost-near-heathrow/index.md`
13. `content/blog/pub-vs-hotel-celebration-venue/index.md`
14. `content/blog/pub-with-private-room-near-heathrow/index.md`
15. `content/blog/retirement-party-ideas-venues/index.md`
16. `content/blog/wake-venue-near-heathrow/index.md`

Also add a redirect for any cached/indexed URLs:

```json
{ "source": "/blog/tag/guide", "destination": "/blog/tag/guides", "permanent": true }
```

### Change 1: Add 301 redirects for thin tags
**File:** `config/redirects/tag-redirects.json`

Append 10 new entries following the existing pattern:

```json
{ "source": "/blog/tag/function-room", "destination": "/blog/tag/private-hire", "permanent": true },
{ "source": "/blog/tag/gender-reveal", "destination": "/blog/tag/private-hire", "permanent": true },
{ "source": "/blog/tag/wakes", "destination": "/blog/tag/private-hire", "permanent": true },
{ "source": "/blog/tag/christenings", "destination": "/blog/tag/private-hire", "permanent": true },
{ "source": "/blog/tag/work-events", "destination": "/blog/tag/private-hire", "permanent": true },
{ "source": "/blog/tag/plane-spotting", "destination": "/blog/tag/heathrow", "permanent": true },
{ "source": "/blog/tag/things-to-do", "destination": "/blog/tag/heathrow", "permanent": true },
{ "source": "/blog/tag/savings", "destination": "/blog/tag/guides", "permanent": true },
{ "source": "/blog/tag/pricing", "destination": "/blog/tag/guides", "permanent": true },
{ "source": "/blog/tag/comparison", "destination": "/blog/tag/guides", "permanent": true }
```

### Change 2: Verify blog post parent tags
**Files:** Multiple `content/blog/*/index.md`

All posts with consolidated tags have been verified against actual frontmatter. Parent tag status:

| Post slug | Tags (verified) | Parent tag present? | Action |
|-----------|----------------|--------------------|---------| 
| `function-room-hire-near-heathrow-staines` | `[private-hire, function-room, guide]` | `private-hire` ✓ | guide→guides only (Change 0) |
| `gender-reveal-party-ideas-venues` | `[private-hire, gender-reveal, guide]` | `private-hire` ✓ | guide→guides only (Change 0) |
| `wake-venue-near-heathrow` | `[private-hire, wakes, guide]` | `private-hire` ✓ | guide→guides only (Change 0) |
| `christening-party-ideas-venues` | `[private-hire, christenings, guide]` | `private-hire` ✓ | guide→guides only (Change 0) |
| `heathrow-plane-spotting-locations` | `[things-to-do, guides, heathrow, plane-spotting]` | `heathrow` ✓, `guides` ✓ | No change needed |
| `private-room-hire-cost-near-heathrow` | `[private-hire, pricing, guide]` | `private-hire` ✓ | guide→guides (Change 0) adds `guides` parent |
| `pub-vs-hotel-celebration-venue` | `[private-hire, comparison, guide]` | `private-hire` ✓ | guide→guides (Change 0) adds `guides` parent |
| `retirement-party-ideas-venues` | `[private-hire, work-events, guide]` | `private-hire` ✓ | guide→guides only (Change 0) |
| `leaving-party-ideas` | `[private-hire, work-events, guide]` | `private-hire` ✓ | guide→guides only (Change 0) |
| `cheap-heathrow-parking-alternatives` | `[travel, parking, heathrow, guides, savings]` | `guides` ✓ | No change needed |

**Result:** No manual parent-tag additions needed. The guide→guides rename in Change 0 handles the two posts (`pricing`, `comparison`) that need `guides` as a parent tag.

### Change 3: Wire `/blog/tags` page to use `getTagSEOContent()` and filter redirected tags
**File:** `app/blog/tags/page.tsx`

**Current state:** Hardcoded `tagInfo` record (lines 28-37) with only 7 "Core" entries. All other tags fall into an "Other" bucket with auto-generated display names. No filtering of redirect-source tags.

**Target state:**
1. Remove the hardcoded `tagInfo` record and "Core"/"Other" category grouping
2. Replace with calls to `getTagSEOContent()` from `lib/tag-seo-content.ts` for display names and descriptions
3. Import `tagRedirects` from `config/redirects/tag-redirects.json` and build an exclusion set to filter redirect-source tags from the grid (same pattern as `app/sitemap.ts` lines 211-215)
4. Display all surviving tags in a single sorted grid (sort by post count descending)
5. Update the hero count (`tagCounts.size`) to use the filtered set

**Note:** `getTagSEOContent()` returns `name` and `description` but no `category` field. This is fine because we're removing the category grouping.

### Change 4: Filter redirected tags from individual tag page cloud
**File:** `app/blog/tag/[tag]/page.tsx`

**Current state:** The "Explore More Topics" tag cloud (lines 164-183) renders ALL tags from all posts, including consolidated thin tags. Users clicking a thin tag in this cloud get 301-redirected. Additionally, `getTagSEOContent()` is called at line 179 to render each tag's display name.

**Target state:**
1. Import `tagRedirects` and build the same exclusion set as Change 3
2. Filter the `allTags` set to exclude redirect-source tags before rendering the cloud
3. Optionally: filter `generateStaticParams()` (lines 23-34) to skip redirect-source tags, reducing build waste (not functionally required — redirects fire before page render)

### Change 5: Remove consolidated `tagSEOContent` entries
**File:** `lib/tag-seo-content.ts`

Remove these 10 specific entries by key name from the `tagSEOContent` record (all located under the `// Thin-page content fixes` comment at line 783):

**Remove:** `christenings`, `work-events`, `savings`, `function-room`, `gender-reveal`, `things-to-do`, `plane-spotting`, `pricing`, `comparison`, `wakes`

**Keep (also under the same comment block):** `food-and-drink`, `guides`, `private-hire`, `travel`, `heathrow`, `birthdays`

These entries are safe to remove only AFTER Changes 3 and 4 add redirect-source filtering to both tag cloud surfaces. Without that filtering, removing entries would cause the tag clouds to render fallback names for consolidated tags that still appear in the UI.

Also remove the existing `guide` entry (line 662, key `'guide'`) since all posts will be renamed to `guides` and a redirect is in place.

## Files Changed (summary)

| File | Change |
|------|--------|
| 16 × `content/blog/*/index.md` | `guide` → `guides` in frontmatter tags |
| `config/redirects/tag-redirects.json` | +11 redirects (1 guide→guides + 10 thin tags) |
| `app/blog/tags/page.tsx` | Replace `tagInfo` with `getTagSEOContent()`, add redirect filtering |
| `app/blog/tag/[tag]/page.tsx` | Filter redirected tags from "Explore More Topics" cloud |
| `lib/tag-seo-content.ts` | Remove 10 consolidated entries + 1 `guide` entry |

## Files NOT Changed

| File | Why |
|------|-----|
| `app/sitemap.ts` | Already filters out redirected tags via `redirectSourceTags` set |
| `app/robots.ts` | No tag-specific rules needed |
| `next.config.js` | Already loads `tag-redirects.json` — no config change needed. `normaliseRedirect()` correctly converts `permanent: true` to `statusCode: 301` |

## Verification

After implementation:
1. `npm run build` passes
2. `npm test` passes
3. Spot-check redirects work: visit `/blog/tag/wakes` → should 301 to `/blog/tag/private-hire`
4. Spot-check `guide` redirect: visit `/blog/tag/guide` → should 301 to `/blog/tag/guides`
5. Spot-check surviving tags render custom content: `/blog/tag/food-and-drink` shows new heroContent
6. `/blog/tags` page shows proper names for all tags and does NOT show redirected tags
7. Individual tag pages' "Explore More Topics" cloud does NOT show redirected tags
8. Sitemap excludes all 11 redirected tags (10 thin + guide)
9. `/blog/tag/guides` page shows correct post count (will increase as future-dated posts go live)

**Note on post counts during verification:** Several blog posts have `publishDate` values in the future (mid-to-late April 2026). Live post counts on tag pages will be lower than total-on-disk counts until those posts publish. This is expected behaviour — verify against live posts, not total files.

## Post-Deploy (Manual)

1. Request re-indexing in GSC for the 6 surviving tag URLs
2. Monitor "Page with redirect" entries in GSC — the 11 redirected tags should appear briefly then resolve
3. Monitor thin content flags — should clear within 1-2 crawl cycles

## Adversarial Review Log

This spec was reviewed by 4 adversarial reviewers on 2026-04-12:
- **Codex Repo Reality Mapper** — verified all file contents, frontmatter tags, redirect state
- **Codex Assumption Breaker** — challenged 7 assumptions, found guide/guides mismatch and tag cloud filtering gaps
- **Codex Spec Trace Auditor** — traced all 4 changes through codebase, found future publishDate discrepancy and category field gap
- **Claude Integration & Architecture Reviewer** — confirmed redirect infrastructure, tag normalisation behaviour, and internal link impact

Reports: `tasks/codex-qa-review/2026-04-12-thin-tag-consolidation-*.md`
