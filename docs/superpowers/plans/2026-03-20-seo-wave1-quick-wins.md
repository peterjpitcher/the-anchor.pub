# SEO Wave 1 — Quick Wins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the 11 highest-impact, lowest-effort SEO fixes from the audit — title tags, expired schema, internal linking, navigation, and llms.txt updates.

**Architecture:** All changes are content/metadata edits — no new components, no API changes, no schema changes. Each task is independent and can be parallelised.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS

**Estimated impact:** +114 organic clicks/month from title/meta alone, plus improved CTR from internal linking fixes.

---

## Workstream A: Title Tag & Metadata Fixes

### Task 1: Fix root layout default title and template

**Files:**
- Modify: `app/layout.tsx:53-55`

- [ ] **Step 1: Update default title and template**

Change lines 53-55 from:
```typescript
title: {
  default: 'Traditional Bar Near Me | The Anchor - Heathrow Pub & Dining | Surrey Bar Near Heathrow',
  template: '%s | The Anchor - Heathrow Pub & Dining'
},
```
To:
```typescript
title: {
  default: 'The Anchor | Pub Near Heathrow | Stanwell Moor',
  template: '%s | The Anchor Stanwell Moor'
},
```

- [ ] **Step 2: Update root layout description to replace "bar" with "pub"**

Change line 57 description to use "pub" consistently (brand is "The Anchor", not "bar"):
```typescript
description: 'The Anchor in Stanwell Moor — traditional pub near Heathrow Airport. Sunday roasts, quiz nights, Music Bingo, dog-friendly beer garden under the flight path. Free parking, 7 mins from T5.',
```

- [ ] **Step 3: Update OpenGraph title**

Change line 68 from:
```typescript
title: 'The Anchor - Heathrow Pub & Dining\'s Premier Entertainment Venue',
```
To:
```typescript
title: 'The Anchor | Pub Near Heathrow Airport | Stanwell Moor',
```

- [ ] **Step 4: Build and verify**

Run: `npm run build`
Expected: Successful build with no errors.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx
git commit -m "fix(seo): replace keyword-stuffed root title with clean 49-char version

The default title was 84 chars and keyword-stuffed. Google was already rewriting it.
New title: 'The Anchor | Pub Near Heathrow | Stanwell Moor' (49 chars).
Template suffix shortened from 41 to 30 chars, giving pages more room."
```

---

### Task 2: Rewrite title tags on 8 underperforming pages

**Files:**
- Modify: `app/quiz-night/page.tsx` (title + H1)
- Modify: `app/near-heathrow/page.tsx` (title)
- Modify: `app/drinks/page.tsx` (title)
- Modify: `app/live-sport/page.tsx` (title)
- Modify: `app/corporate-events/page.tsx` (title)
- Modify: `app/function-room-hire/page.tsx` (title)
- Modify: `app/sunday-lunch/page.tsx` (title)
- Modify: `app/restaurants-near-heathrow/page.tsx` (title)
- Modify: `app/page.tsx` (homepage title)
- Modify: `app/book-table/page.tsx` (title + meta description)
- Modify: `app/food-menu/page.tsx` (title)

For each page, find the `export const metadata` or `export const generateMetadata` and update the `title` field. The new titles are:

| Page | New Title (without template suffix) |
|------|-------------------------------------|
| Homepage (`app/page.tsx`) | `The Anchor Stanwell Moor \| Pub Near Heathrow \| Free Parking` |
| `/quiz-night` | `Quiz Night Wednesdays \| Cash Prizes \| Pub Near Heathrow` |
| `/near-heathrow` | `Closest Pub to Heathrow \| 7 Mins from T5 \| Free Parking` |
| `/drinks` | `Drinks Menu \| Craft Beer, Cocktails & Wine` |
| `/live-sport` | `Live Sport on Big Screens \| Rugby, F1 & Football \| Near Heathrow` |
| `/corporate-events` | `Corporate Event Venue Near Heathrow \| Free Parking \| 10-200 Guests` |
| `/function-room-hire` | `Function Room Hire Near Heathrow \| 10-200 Guests \| Free Parking` |
| `/sunday-lunch` | `Sunday Roast Near Heathrow from £19.99 \| Book by Sat 1pm` |
| `/restaurants-near-heathrow` | `Restaurant Near Heathrow \| Skip Airport Prices \| 7 Mins from T5` |
| `/food-menu` | `Food Menu \| Pub Near Heathrow from £10` |
| `/book-table` | `Book a Table \| Instant Confirmation` |

**Important:** These titles will have ` | The Anchor Stanwell Moor` appended by the template. So `/quiz-night` becomes: "Quiz Night Wednesdays | Cash Prizes | Pub Near Heathrow | The Anchor Stanwell Moor" (76 chars total — acceptable).

- [ ] **Step 1: Update all 11 page titles**

For each page listed above, locate the `metadata` export and change the `title` field. Also update `openGraph.title` and `twitter.title` if they exist.

- [ ] **Step 2: Fix /quiz-night H1** — in PageTitle component, change from "Heathrow Quiz Night Pub & Trivia Night - Stanwell Moor, Staines & Surrey" to "Quiz Night at The Anchor"

- [ ] **Step 3: Fix /book-table meta description** — remove "via our management platform" jargon. Change to: "Book your table at The Anchor near Heathrow. Instant confirmation, free parking for all diners. Food served Tuesday-Sunday."

- [ ] **Step 4: Build and verify**

Run: `npm run build`

- [ ] **Step 5: Commit**

```bash
git add app/quiz-night/page.tsx app/near-heathrow/page.tsx app/drinks/page.tsx app/live-sport/page.tsx app/corporate-events/page.tsx app/function-room-hire/page.tsx app/sunday-lunch/page.tsx app/restaurants-near-heathrow/page.tsx app/page.tsx app/book-table/page.tsx app/food-menu/page.tsx
git commit -m "fix(seo): rewrite title tags on 11 underperforming pages for CTR

Conservative estimate: +114 organic clicks/month from improved SERP display.
All titles now under 65 chars (with template suffix ~30 chars).
Also fixed keyword-stuffed H1 on quiz-night page."
```

---

## Workstream B: Schema Fixes

### Task 3: Fix expired schema dates

**Files:**
- Modify: `app/sunday-lunch/page.tsx:357` — change `availabilityEnds: '2025-12-31'` to `'2026-12-31'`
- Modify: `lib/enhanced-schemas.ts:270` — change `"validThrough": "2025-12-31"` to `"2026-12-31"`

- [ ] **Step 1: Fix sunday-lunch availabilityEnds**

In `app/sunday-lunch/page.tsx`, find line 357:
```typescript
availabilityEnds: '2025-12-31',
```
Change to:
```typescript
availabilityEnds: '2026-12-31',
```

- [ ] **Step 2: Fix over65s offer validThrough**

In `lib/enhanced-schemas.ts`, find line 270:
```typescript
"validThrough": "2025-12-31",
```
Change to:
```typescript
"validThrough": "2026-12-31",
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add app/sunday-lunch/page.tsx lib/enhanced-schemas.ts
git commit -m "fix(seo): update expired schema dates from 2025-12-31 to 2026-12-31

Sunday lunch availabilityEnds and over-65s offer validThrough were expired.
Google may have been suppressing rich results for these pages."
```

---

## Workstream C: Internal Linking & Navigation

### Task 4: Add /sunday-lunch, /drinks, and event page links to homepage

**Files:**
- Modify: `app/page.tsx`

This requires reading the full homepage to find the right insertion points. The agent should:

- [ ] **Step 1: Read the full homepage** (`app/page.tsx`) to understand the current section structure.

- [ ] **Step 2: Add a Sunday Lunch CTA card** — In the section that displays food/dining content (look for "What Makes Us Special", gallery, or similar), add a prominent Link to `/sunday-lunch` with text like "Book Sunday Lunch — from £19.99". This should be a Button component wrapping a Link.

- [ ] **Step 3: Add a /drinks link** — In the same food/dining area or near the food-menu link, add a link to `/drinks` (e.g. "View Drinks Menu").

- [ ] **Step 4: Add persistent event links** — In or near the "What's Coming Up" section, add static links to `/quiz-night`, `/music-bingo`, and `/karaoke` that remain regardless of which dynamic event is showing. These can be small text links or a "Regular Events" subsection with cards.

- [ ] **Step 5: Build and verify**

Run: `npm run build`

- [ ] **Step 6: Visually verify** — Run `npm run dev`, visit localhost:3000, and confirm the new links appear and navigate correctly.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx
git commit -m "feat(seo): add sunday-lunch, drinks, and event links to homepage

Priority revenue pages (/sunday-lunch, /drinks) had no homepage links.
Event pages (/quiz-night, /music-bingo, /karaoke) were nav-only.
These pages have 400-1700 impressions but very low CTR."
```

---

### Task 5: Add /restaurants-near-heathrow to navigation

**Files:**
- Modify: `components/layout/Navigation.tsx`

- [ ] **Step 1: Read Navigation.tsx** and find the "Visit Us" group (around line 122)

- [ ] **Step 2: Add restaurants-near-heathrow** to the Visit Us children array:
```typescript
{ label: 'Restaurants Near Heathrow', href: '/restaurants-near-heathrow' },
```
Place it after the existing items in the Visit Us group.

- [ ] **Step 3: Build and verify**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add components/layout/Navigation.tsx
git commit -m "feat(seo): add /restaurants-near-heathrow to Visit Us nav group

Page has 1,010 impressions but 0.3% CTR. Was completely absent from navigation."
```

---

## Workstream D: NAP & Content Fixes

### Task 6: Fix private-hire image alt texts

**Files:**
- Modify: `app/private-hire/page.tsx` (lines 90, 112, 134, 156, 178, 200)

- [ ] **Step 1: Update all six alt texts**

| Line | Current | New |
|------|---------|-----|
| 90 | `"Respectful wake gathering"` | `"Wake venue at The Anchor near Heathrow"` |
| 112 | `"Christening celebration"` | `"Christening venue at The Anchor near Heathrow"` |
| 134 | `"Wedding reception toast"` | `"Wedding reception venue at The Anchor near Heathrow"` |
| 156 | `"Private party celebration"` | `"Private party venue at The Anchor near Heathrow"` |
| 178 | `"Baby shower celebration"` | `"Baby shower venue at The Anchor near Heathrow"` |
| 200 | `"Professional corporate meeting"` | `"Corporate event venue at The Anchor near Heathrow"` |

- [ ] **Step 2: Build and verify**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add app/private-hire/page.tsx
git commit -m "fix(seo): add venue name and location to private-hire image alts

All six event-type card images had generic alt text without location context.
Adding 'at The Anchor near Heathrow' improves image search visibility."
```

---

## Workstream E: llms.txt Update

### Task 7: Restructure llms.txt

**Files:**
- Modify: `public/llms.txt`

- [ ] **Step 1: Replace llms.txt content**

Replace the entire file with the restructured version from the AI search audit (see `docs/seo-audit/ai-search-optimisation-audit.md` section 3 "Recommended llms.txt Structure"). Key changes:
- Fix email to `manager@the-anchor.pub` (keeping consistent with codebase — this IS the correct email used everywhere)
- Add menu prices and food items
- Add structured sections with ## headings
- Add event information with link to /whats-on for dates
- Add "Unique Features" section (plane spotting, ULEZ, dog-friendly)
- Add "Pages" section with links to all key pages

- [ ] **Step 2: Build and verify**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add public/llms.txt
git commit -m "fix(seo): restructure llms.txt with menu prices, events, and structured sections

Adds food pricing, event descriptions, unique features (plane spotting),
and key page links. Follows llmstxt.org recommended structure."
```

---

## Workstream F: Catch-all Route Fix

### Task 8: Implement proper 404 instead of homepage redirect

**Files:**
- Modify: `app/[...unmatched]/page.tsx`

- [ ] **Step 1: Read the current file** and `lib/routing/buildFallbackHomeRedirect.ts` to understand the redirect logic.

- [ ] **Step 2: Change default behaviour to notFound()**

The catch-all currently redirects ALL unmatched URLs to the homepage. Change it so that only the `?dpl=` Vercel preview parameter case redirects; everything else returns `notFound()`:

```typescript
import { notFound, redirect } from 'next/navigation'
import { buildFallbackHomeRedirect, type FallbackHomeSearchParams } from '@/lib/routing/buildFallbackHomeRedirect'

type UnmatchedPageProps = {
  params: {
    unmatched: string[]
  }
  searchParams?: FallbackHomeSearchParams
}

export default function UnmatchedPage({ params, searchParams }: UnmatchedPageProps) {
  // Vercel preview deploy URLs use ?dpl= parameter — redirect these to homepage
  if (searchParams?.dpl) {
    redirect(buildFallbackHomeRedirect(searchParams))
  }

  // All other unmatched routes should return a proper 404
  notFound()
}
```

- [ ] **Step 3: Ensure app/not-found.tsx exists** — if not, create a basic 404 page. Check if one already exists first.

- [ ] **Step 4: Build and verify**

Run: `npm run build`

- [ ] **Step 5: Commit**

```bash
git add app/[...unmatched]/page.tsx
git commit -m "fix(seo): return proper 404 instead of redirecting unmatched URLs to homepage

The catch-all route was redirecting all unknown URLs to /, creating soft 404
issues in Google Search Console. Now returns notFound() for clean 404 signals.
Only preserves redirect for Vercel ?dpl= preview parameter."
```

---

## Summary

| Task | Workstream | Files Changed | Est. Time |
|------|-----------|---------------|-----------|
| 1 | Root layout title | 1 | 5 min |
| 2 | Page titles (11 pages) | 11 | 30 min |
| 3 | Expired schema dates | 2 | 5 min |
| 4 | Homepage internal links | 1 | 30 min |
| 5 | Navigation update | 1 | 5 min |
| 6 | Private hire alt texts | 1 | 10 min |
| 7 | llms.txt restructure | 1 | 20 min |
| 8 | 404 page fix | 1-2 | 15 min |
| **Total** | | **~20 files** | **~2 hours** |

All tasks are independent and can be executed in parallel by separate agents.
