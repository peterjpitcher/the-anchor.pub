# Phase 3 SEO Keyword Optimisation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optimise the remaining 39 unmapped pages with validated keyword data from Google Keyword Planner (6 rounds, 240+ keywords), fix 3 cannibalisation issues, and add body copy keywords to 6 additional hotel pages.

**Architecture:** Surgical metadata + body copy edits following the same pattern established in Phase 1+2 (commit `4bf2949`). No structural changes. Each task modifies metadata (title, description, openGraph, twitter), H1/PageTitle, and optionally weaves 1-2 keyword phrases into body copy.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS. All pages use the same component pattern: `metadata` export → `HeroWrapper` → `PageTitle` → body content.

**Reference:** `docs/seo-keyword-reference.md` — the complete keyword-to-page map with all validated volumes.

**SSOT:** `/SSOT.json` — verified brand facts. Key rules:
- Brand: "The Anchor" (general), "The Anchor Pub" (when describing what the business is)
- Tone: Friendly, cheeky, inclusive. British English. "We" language.
- NOT: No Sky Sports, no breakfast, no delivery, no guest ales
- Terminal times: T5=7min, T2/T3=11min, T4=12min
- Free parking: ~20 spaces

---

## Task 1: Fix Cannibalisation — Differentiate Overlapping Pages

These pages target the same keywords as already-optimised pages but are too heavily cross-linked to redirect. Instead, differentiate their keyword targeting.

**Files:**
- Modify: `app/restaurants-near-heathrow/page.tsx`
- Modify: `app/function-room-hire/page.tsx`
- Modify: `app/private-party-venue/page.tsx`
- Modify: `app/pubs-in-stanwell/page.tsx`

**Context:** These pages appear in the main navigation, footer, and are linked from 10+ other pages. Redirects would break too much. Instead, give each a DISTINCT keyword angle that doesn't compete with the primary page.

- [ ] **Step 1: Read all 4 files to understand current titles and content**

- [ ] **Step 2: Differentiate `/restaurants-near-heathrow`**

Currently cannibalises `/food-menu` for "restaurants near heathrow" (5K/mo).

Differentiation: This page should target the **traveller/airport dining** angle. `/food-menu` owns the menu/what-we-serve angle.

Update metadata title to: `Restaurants Near Heathrow Airport | Where to Eat Before You Fly | The Anchor`
Update H1 to include "restaurants near heathrow airport" with traveller framing.
Ensure body copy focuses on pre-flight dining, layover meals, hotel escapes — NOT menu details.

- [ ] **Step 3: Differentiate `/function-room-hire`**

Currently cannibalises `/private-hire` for "function room hire" (5K/mo local).

Differentiation: `/private-hire` is the main venue hire page. `/function-room-hire` should focus on the **room itself** — capacity, layout, AV, accessibility.

Update metadata title to: `Function Room Hire Near Heathrow | 10-50 Guests | The Anchor`
Ensure body copy focuses on room specs, not event types (which `/private-hire` owns).

- [ ] **Step 4: Differentiate `/private-party-venue`**

Currently cannibalises `/private-hire` for "party venue" (5K/mo local).

Differentiation: This page should focus on **parties specifically** (birthdays, celebrations, social events) — not the full range of private hire events.

Update metadata title to: `Private Party Venue Near Heathrow | Birthdays & Celebrations | The Anchor`
Ensure body copy focuses on party-specific content, not wakes/corporate/christenings.

- [ ] **Step 5: Differentiate `/pubs-in-stanwell`**

Currently cannibalises `/stanwell-pub` for "pubs in stanwell" (50/mo).

Differentiation: `/stanwell-pub` is the established page. `/pubs-in-stanwell` should target the broader **Stanwell Moor village** angle.

Update metadata title to: `Pubs in Stanwell Moor | Village Pub & Beer Garden | The Anchor`
H1: Focus on "Stanwell Moor" (the actual village) rather than generic "Stanwell".

- [ ] **Step 6: Run `npx tsc --noEmit` to verify no type errors**

- [ ] **Step 7: Commit**

```bash
git add app/restaurants-near-heathrow/page.tsx app/function-room-hire/page.tsx app/private-party-venue/page.tsx app/pubs-in-stanwell/page.tsx
git commit -m "fix: differentiate keyword targeting on 4 cannibalising pages"
```

---

## Task 2: High-Value Pages — 5K+/mo Keywords (8 pages)

**Files:**
- Modify: `app/pool-darts-pub/page.tsx`
- Modify: `app/egham-pub/page.tsx`
- Modify: `app/windsor-pub/page.tsx`
- Modify: `app/luggage-storage-heathrow/page.tsx`
- Modify: `app/food-menu/gluten-free/page.tsx`
- Modify: `app/live-music/page.tsx`
- Modify: `app/open-mic/page.tsx`
- Modify: `app/corporate-events/page.tsx`

- [ ] **Step 1: Read all 8 files — note current titles, H1s, and opening body copy**

- [ ] **Step 2: Optimise `/pool-darts-pub`**

Keyword: `pool table pub near me` (50,000/mo — LOCAL INTENT)
This is a huge local keyword. Title should include "pool table" and "darts".
- Title: include "Pool Table & Darts Pub Near Heathrow" or similar
- H1: include "pool table pub" naturally
- Body: mention "pool table pub near me" and "darts pub near me" (500/mo) naturally

- [ ] **Step 3: Optimise `/egham-pub`**

Keyword: `pubs in egham` (5,000/mo)
- Title: should start with "Pubs in Egham" or "Pub Near Egham"
- H1: include "pubs in Egham" naturally
- Body: mention "pubs in Egham" and "pubs near Egham" (50/mo) naturally

- [ ] **Step 4: Optimise `/windsor-pub`**

Keyword: `pubs in windsor` (5,000/mo), `pubs near windsor` (500/mo)
- Title: should start with "Pubs in Windsor" or "Pub Near Windsor"
- H1: include keyword naturally
- Body: mention both "pubs in Windsor" and "pubs near Windsor" naturally

- [ ] **Step 5: Optimise `/luggage-storage-heathrow`**

Keyword: `luggage storage heathrow` (5,000/mo)
- Title: include "Luggage Storage Heathrow" or "Luggage Storage Near Heathrow"
- H1: include keyword naturally
- Body: ensure "luggage storage heathrow" appears in opening paragraph

- [ ] **Step 6: Optimise `/food-menu/gluten-free`**

Keyword: `gluten free pub food` (5,000/mo)
- Title: include "Gluten-Free Pub Food"
- H1: include keyword naturally
- Body: mention "gluten free pub food" in opening content

- [ ] **Step 7: Optimise `/live-music`**

Keyword: `live music pub near me` (5,000/mo — LOCAL INTENT)
- Title: include "Live Music Pub Near Heathrow"
- H1: include "live music pub" naturally
- Body: mention "live music pub near me" naturally

- [ ] **Step 8: Optimise `/open-mic`**

Keyword: `open mic night near me` (5,000/mo — LOCAL INTENT)
- Title: include "Open Mic Night Near Heathrow"
- H1: include "open mic night" naturally
- Body: mention "open mic night near me" naturally

- [ ] **Step 9: Optimise `/corporate-events`**

Keyword: `corporate event` (5,000/mo — very generic, unlikely to rank)
- Title: include "Corporate Events Near Heathrow" (more specific than generic)
- H1: include keyword naturally
- Body: focus on "corporate events near Heathrow" angle, not generic "corporate event"
- Note: "corporate events near heathrow" = 0 vol. This page's best angle is proximity to Heathrow for business travellers.

- [ ] **Step 10: Run `npx tsc --noEmit` to verify no type errors**

- [ ] **Step 11: Commit**

```bash
git add app/pool-darts-pub/page.tsx app/egham-pub/page.tsx app/windsor-pub/page.tsx app/luggage-storage-heathrow/page.tsx app/food-menu/gluten-free/page.tsx app/live-music/page.tsx app/open-mic/page.tsx app/corporate-events/page.tsx
git commit -m "feat: keyword-optimise 8 high-value pages (5K+/mo keywords)"
```

---

## Task 3: Medium-Value Pages — 500/mo Keywords (5 pages)

**Files:**
- Modify: `app/food-menu/vegan/page.tsx`
- Modify: `app/horton-pub/page.tsx`
- Modify: `app/sunbury-pub/page.tsx`
- Modify: `app/karaoke/page.tsx`
- Modify: `app/private-hire/engagement-parties/page.tsx`

Note: `/free-parking` already redirects to `/heathrow-parking` (existing redirect in additional-redirects.json). No action needed.

- [ ] **Step 1: Read all 5 files — note current titles, H1s, and opening body copy**

- [ ] **Step 2: Optimise `/food-menu/vegan`**

Keyword: `vegan pub food near me` (500/mo — LOCAL INTENT)
- Title: include "Vegan Pub Food"
- H1: include keyword naturally
- Body: mention "vegan pub food" in opening content

- [ ] **Step 3: Optimise `/horton-pub`**

Keyword: `pubs in horton` (500/mo)
- Title: should use "Pubs in Horton" or "Pub Near Horton" pattern
- H1: include keyword naturally

- [ ] **Step 4: Optimise `/sunbury-pub`**

Keyword: `pubs in sunbury` (500/mo), `pubs near sunbury` (50/mo)
- Title: should use "Pubs in Sunbury" or "Pub Near Sunbury" pattern
- H1: include keyword naturally

- [ ] **Step 5: Optimise `/karaoke`**

Keyword: `karaoke pub near me` (500/mo — LOCAL INTENT)
- Title: include "Karaoke Pub Near Heathrow" or "Karaoke Night Near Heathrow"
- H1: include "karaoke" naturally
- Body: mention "things to do near Heathrow" (500/mo) if not already present

- [ ] **Step 6: Optimise `/private-hire/engagement-parties`**

Keyword: `engagement party venue` (500/mo)
- Title: include "Engagement Party Venue"
- H1: include keyword naturally
- Body: mention "engagement party venue near Heathrow" naturally

- [ ] **Step 7: Run `npx tsc --noEmit` to verify no type errors**

- [ ] **Step 8: Commit**

```bash
git add app/food-menu/vegan/page.tsx app/horton-pub/page.tsx app/sunbury-pub/page.tsx app/karaoke/page.tsx app/private-hire/engagement-parties/page.tsx
git commit -m "feat: keyword-optimise 5 medium-value pages (500/mo keywords)"
```

---

## Task 4: Low-Value Pages — 50/mo Keywords (9 pages)

**Files:**
- Modify: `app/fish-and-chips-heathrow/page.tsx`
- Modify: `app/pizza-menu/page.tsx`
- Modify: `app/longford-pub/page.tsx`
- Modify: `app/heathrow-layover-dining/page.tsx`
- Modify: `app/private-hire/gender-reveal/page.tsx`
- Modify: `app/private-hire/retirement-parties/page.tsx`
- Modify: `app/private-hire/weddings/page.tsx`
- Modify: `app/live-sport/six-nations/page.tsx`
- Modify: `app/live-sport/world-cup/page.tsx`

- [ ] **Step 1: Read all 9 files — note current titles and H1s**

- [ ] **Step 2: For each page, verify the primary keyword appears in the title and H1. If not, make minimal edits:**

| Page | Primary Keyword | Vol |
|------|----------------|-----|
| `/fish-and-chips-heathrow` | fish and chips heathrow | 50 |
| `/pizza-menu` | pizza near heathrow | 50 |
| `/longford-pub` | pubs in longford | 50 |
| `/heathrow-layover-dining` | heathrow layover | 50 |
| `/private-hire/gender-reveal` | gender reveal venue | 50 |
| `/private-hire/retirement-parties` | retirement party venue | 50 |
| `/private-hire/weddings` | wedding venue near heathrow | 50 |
| `/live-sport/six-nations` | six nations pub near me | 50 |
| `/live-sport/world-cup` | world cup pub near me | 50 |

For each: check title contains keyword. If not, update title. Check H1. If not, update H1. No body copy changes needed at 50/mo volume — not worth the effort.

- [ ] **Step 3: Run `npx tsc --noEmit` to verify no type errors**

- [ ] **Step 4: Commit**

```bash
git add app/fish-and-chips-heathrow/page.tsx app/pizza-menu/page.tsx app/longford-pub/page.tsx app/heathrow-layover-dining/page.tsx app/private-hire/gender-reveal/page.tsx app/private-hire/retirement-parties/page.tsx app/private-hire/weddings/page.tsx app/live-sport/six-nations/page.tsx app/live-sport/world-cup/page.tsx
git commit -m "feat: keyword-optimise 9 low-value pages (50/mo keywords)"
```

---

## Task 5: Additional Hotel Pages — Body Copy Enhancement (6 pages)

**Files:**
- Modify: `app/pub-near-crowne-plaza-heathrow/page.tsx`
- Modify: `app/pub-near-ibis-heathrow/page.tsx`
- Modify: `app/pub-near-marriott-heathrow/page.tsx`
- Modify: `app/pub-near-radisson-blu-heathrow/page.tsx`
- Modify: `app/pub-near-sofitel-heathrow/page.tsx`
- Modify: `app/pub-near-travelodge-heathrow/page.tsx`

All returned 0 keyword volume. Same pattern as Phase 2 Group B: add high-volume keywords to body copy for topical authority.

- [ ] **Step 1: Read all 6 files — find opening body paragraph in each**

- [ ] **Step 2: Add one sentence to each page's opening body paragraph including "pubs near Heathrow Airport" (500/mo) or "places to eat near Heathrow" (500/mo) naturally**

Template concept (adapt per hotel): "One of the best pubs near Heathrow Airport, The Anchor is [X] minutes from [Hotel Name] — a proper alternative to hotel dining with real ales, home-cooked food, and free parking."

- [ ] **Step 3: Run `npx tsc --noEmit` to verify no type errors**

- [ ] **Step 4: Commit**

```bash
git add app/pub-near-crowne-plaza-heathrow/page.tsx app/pub-near-ibis-heathrow/page.tsx app/pub-near-marriott-heathrow/page.tsx app/pub-near-radisson-blu-heathrow/page.tsx app/pub-near-sofitel-heathrow/page.tsx app/pub-near-travelodge-heathrow/page.tsx
git commit -m "feat: add high-volume keywords to 6 hotel proximity pages"
```

---

## Task 6: Seasonal Pages — Keyword Alignment (8 pages)

**Files:**
- Modify: `app/mothers-day/page.tsx`
- Modify: `app/new-years-eve/page.tsx`
- Modify: `app/valentines-day/page.tsx`
- Modify: `app/corporate-christmas-parties/page.tsx`
- Modify: `app/boxing-day/page.tsx`
- Modify: `app/halloween/page.tsx`
- Modify: `app/st-patricks-day/page.tsx`
- Modify: `app/summer-garden-parties/page.tsx`

- [ ] **Step 1: Read all 8 files — note current titles and H1s**

- [ ] **Step 2: For each page, verify the validated keyword appears in the title. If not, update:**

| Page | Primary Keyword | Vol |
|------|----------------|-----|
| `/mothers-day` | mothers day lunch near me | 5,000 (local) |
| `/new-years-eve` | new years eve pub near me | 500 (local) |
| `/valentines-day` | valentines day dinner near me | 500 (local) |
| `/corporate-christmas-parties` | corporate christmas party venue | 50 |
| `/boxing-day` | boxing day pub near me | 50 (local) |
| `/halloween` | halloween pub near me | 50 (local) |
| `/st-patricks-day` | st patricks day pub | 50 (local) |
| `/summer-garden-parties` | summer garden party venue | 50 |

For Mother's Day (5K/mo): ensure "Mother's Day Lunch" appears in title and H1.
For NYE and Valentine's (500/mo): ensure keyword appears in title.
For 50/mo pages: title check only, no body copy changes.

- [ ] **Step 3: Run `npx tsc --noEmit` to verify no type errors**

- [ ] **Step 4: Commit**

```bash
git add app/mothers-day/page.tsx app/new-years-eve/page.tsx app/valentines-day/page.tsx app/corporate-christmas-parties/page.tsx app/boxing-day/page.tsx app/halloween/page.tsx app/st-patricks-day/page.tsx app/summer-garden-parties/page.tsx
git commit -m "feat: keyword-optimise 8 seasonal pages"
```

---

## Task 7: Content Hub Pages (2 pages)

**Files:**
- Modify: `app/whats-on/page.tsx` (if not already containing keyword)
- Modify: `app/whats-on/drag-shows/page.tsx`

- [ ] **Step 1: Read both files**

- [ ] **Step 2: Optimise `/whats-on`**

Keyword: `pub events near me` (500/mo — LOCAL INTENT)
- Ensure title includes "pub events" or "events near Heathrow"
- Ensure body mentions "pub events near me" or "things to do near Heathrow" naturally

- [ ] **Step 3: Optimise `/whats-on/drag-shows`**

Keyword: `drag show near me` (500/mo — LOCAL INTENT)
- Ensure title includes "drag show" or "drag shows"
- Ensure body mentions "drag show near me" naturally
- Also consider: `drag brunch near me` (500/mo) if the page covers brunch format

- [ ] **Step 4: Run `npx tsc --noEmit` to verify no type errors**

- [ ] **Step 5: Commit**

```bash
git add app/whats-on/page.tsx app/whats-on/drag-shows/page.tsx
git commit -m "feat: keyword-optimise 2 content hub pages"
```

---

## Task 8: Update Keyword Reference & Final Build

**Files:**
- Modify: `docs/seo-keyword-reference.md`

- [ ] **Step 1: Update all "Not optimised" statuses to "Done" in the keyword reference doc**

- [ ] **Step 2: Run full build**

```bash
npm run build
```

Expected: Clean build with no errors.

- [ ] **Step 3: Commit**

```bash
git add docs/seo-keyword-reference.md
git commit -m "docs: mark all Phase 3 pages as optimised in keyword reference"
```

- [ ] **Step 4: Push to GitHub**

```bash
git push origin main
```
