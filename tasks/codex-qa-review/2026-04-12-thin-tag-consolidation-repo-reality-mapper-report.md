**Ground Truth**
- Spec reviewed fully: [2026-04-12-thin-tag-page-consolidation-design.md](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/docs/superpowers/specs/2026-04-12-thin-tag-page-consolidation-design.md:1)

**1. Redirects: `config/redirects/tag-redirects.json`**
- Parsed [tag-redirects.json](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/config/redirects/tag-redirects.json:1) for exact source/destination matches.
- Result: none of the 10 tags are already redirected.

| Tag | Existing matches |
|---|---|
| `function-room` | `[]` |
| `gender-reveal` | `[]` |
| `wakes` | `[]` |
| `christenings` | `[]` |
| `work-events` | `[]` |
| `plane-spotting` | `[]` |
| `things-to-do` | `[]` |
| `savings` | `[]` |
| `pricing` | `[]` |
| `comparison` | `[]` |

**2. Frontmatter tags: specified posts**
| File | Frontmatter slug | Exact `tags` array |
|---|---|---|
| [function-room-hire-near-heathrow-staines](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/content/blog/function-room-hire-near-heathrow-staines/index.md:15) | `function-room-hire-near-heathrow-staines` | `['private-hire', 'function-room', 'guide']` |
| [gender-reveal-party-ideas-venues](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/content/blog/gender-reveal-party-ideas-venues/index.md:13) | `gender-reveal-party-ideas-venues` | `['private-hire', 'gender-reveal', 'guide']` |
| [wake-venue-near-heathrow](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/content/blog/wake-venue-near-heathrow/index.md:16) | `wake-venues-near-heathrow` | `['private-hire', 'wakes', 'guide']` |
| [christening-party-ideas-venues](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/content/blog/christening-party-ideas-venues/index.md:14) | `christening-party-ideas-venues` | `['private-hire', 'christenings', 'guide']` |
| [heathrow-plane-spotting-locations](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/content/blog/heathrow-plane-spotting-locations/index.md:12) | no `slug` field in frontmatter | `['things-to-do', 'guides', 'heathrow', 'plane-spotting']` |
| [private-room-hire-cost-near-heathrow](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/content/blog/private-room-hire-cost-near-heathrow/index.md:13) | `private-room-hire-cost-near-heathrow` | `['private-hire', 'pricing', 'guide']` |
| [pub-vs-hotel-celebration-venue](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/content/blog/pub-vs-hotel-celebration-venue/index.md:13) | `pub-vs-hotel-celebration-venue` | `['private-hire', 'comparison', 'guide']` |

**3. Search for posts tagged `work-events` or `savings`**
- `work-events` exists on:
  - [retirement-party-ideas-venues](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/content/blog/retirement-party-ideas-venues/index.md:12): `['private-hire', 'work-events', 'guide']`
  - [leaving-party-ideas](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/content/blog/leaving-party-ideas/index.md:13): `['private-hire', 'work-events', 'guide']`
- `savings` exists on:
  - [cheap-heathrow-parking-alternatives](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/content/blog/cheap-heathrow-parking-alternatives/index.md:15): `['travel', 'parking', 'heathrow', 'guides', 'savings']`

**4. `/blog/tags` page**
- [app/blog/tags/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/blog/tags/page.tsx:28) defines:
  - `const tagInfo: Record<string, { name: string; description: string; category: string }>`
- Exact keys in `tagInfo`: `food-and-drink`, `events`, `community`, `sports`, `offers`, `seasonal`, `news`
- Usage:
  - collects all tag counts from `getAllBlogPosts()` at lines [39-48](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/blog/tags/page.tsx:39)
  - groups into exact buckets `Core` and `Other` at lines [50-60](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/blog/tags/page.tsx:50)
  - sorts each bucket by count descending at lines [63-66](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/blog/tags/page.tsx:63)
  - fallback for unknown tags is:
    - `name: tag.replace(/-/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase())`
    - `description: \`Posts about ${tag}\``
    - at lines [102-105](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/blog/tags/page.tsx:102)

**5. Sitemap redirect filtering**
- Confirmed in [app/sitemap.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/sitemap.ts:210):
  - builds `redirectSourceTags` from `tagRedirects`
  - filters tags with `.filter((tag) => !redirectSourceTags.has(tag))`
- Exact relevant lines: [210-225](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/sitemap.ts:210)

**6. `lib/tag-seo-content.ts` thin-page block**
- The comment is at [lib/tag-seo-content.ts:783](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/tag-seo-content.ts:783): `// Thin-page content fixes — tags that previously used generic fallback copy`
- Under that comment there are 16 entries total, not just the 10 thin ones.
- The 10 thin-tag entries are present with these exact `name` values:
  - [christenings](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/tag-seo-content.ts:851): `Christenings & Baptism Celebrations`
  - [work-events](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/tag-seo-content.ts:862): `Work Events & Team Outings`
  - [savings](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/tag-seo-content.ts:873): `Savings & Value Tips`
  - [function-room](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/tag-seo-content.ts:884): `Function Room`
  - [gender-reveal](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/tag-seo-content.ts:895): `Gender Reveal Parties`
  - [things-to-do](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/tag-seo-content.ts:906): `Things to Do Nearby`
  - [plane-spotting](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/tag-seo-content.ts:917): `Plane Spotting`
  - [pricing](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/tag-seo-content.ts:928): `Pricing & Value`
  - [comparison](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/tag-seo-content.ts:939): `Comparisons & Reviews`
  - [wakes](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/tag-seo-content.ts:950): `Wakes & Celebrations of Life`
- The same comment block also includes the 6 keepers:
  - `food-and-drink`, `guides`, `private-hire`, `travel`, `heathrow`, `birthdays`

**Discrepancies With The Spec**
- Spec line [80](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/docs/superpowers/specs/2026-04-12-thin-tag-page-consolidation-design.md:80) says posts tagged `work-events` and `savings` were not found. Actual repo state: `work-events` has 2 posts, `savings` has 1 post.
- Spec line [74](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/docs/superpowers/specs/2026-04-12-thin-tag-page-consolidation-design.md:74) lists slug `wake-venue-near-heathrow`. Actual frontmatter slug is `wake-venues-near-heathrow`.
- Spec line [92](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/docs/superpowers/specs/2026-04-12-thin-tag-page-consolidation-design.md:92) says to remove 10 entries “under the `// Thin-page content fixes` comment.” Actual repo state: that comment heads a 16-entry block, including the 6 tags the spec says to keep.
- Spec line [87](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/docs/superpowers/specs/2026-04-12-thin-tag-page-consolidation-design.md:87) says `/blog/tags` should show surviving tags in a single sorted grid. Current [`app/blog/tags/page.tsx`](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/blog/tags/page.tsx:39) does not filter redirect-source tags at all, so swapping to `getTagSEOContent()` alone would still leave redirected tags in the grid unless extra filtering is added.