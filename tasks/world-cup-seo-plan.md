# Implementation Plan: World Cup Page SEO Optimisation

**Spec:** `seo/world-cup-page-spec.md`
**Branch:** Create `feat/world-cup-seo-optimisation` from `main`
**Complexity:** M (4 files touched, no schema changes, no new dependencies)

---

## Step 1: Section reorder + remove duplicates

**File:** `app/live-sport/world-cup/page.tsx`

Restructure the JSX to match the new section order:

1. Keep HeroWrapper unchanged (H1: "Watch FIFA World Cup 2026 Near Heathrow")
2. Move the fixtures section (currently at line 294, `id="fixtures"`) to immediately after the hero
   - Keep the H2 "World Cup 2026 Fixtures and UK Kick-Off Times"
   - Keep the SectionHeader subtitle but update to include "screenings": "World Cup 2026 screenings, showing status, and table booking links."
   - Replace the paragraph at line 302 with: "Complete World Cup 2026 match schedule with UK kick-off times, showing status at The Anchor, and table booking links. Fixtures sourced from FIFA."
   - Keep the AlertBox "How this fixtures list works" (lines 307-331)
   - Keep the WorldCup2026Fixtures component render
   - Keep the "Book Early for Knockouts" AlertBox
3. Move England fixtures section (lines 256-292) below the fixtures table
   - Update subtitle to: "England fixtures, screenings and table bookings near Heathrow."
   - Add conditional Group L context line: render "England are in Group L alongside Croatia, Ghana and Panama." only if `englandMatches.length > 0`
4. Keep info cards section (lines 163-254) but move below England fixtures — apply content updates (Step 2)
5. Keep CTA buttons section after info cards
6. Keep Food & Drink + Getting Here section
7. Rewrite local area section (Step 4)
8. Update FAQ section (Step 5)
9. Keep final CTA
10. **Delete** the Matchday Essentials FeatureGrid section (lines 357-405) entirely — duplicates info cards
11. **Delete** the intro copy section (lines 146-161) with PageTitle — HeroWrapper already provides the H1, and the keyword-stuffed paragraphs are replaced by the new intro line

**Remove imports:** `PageTitle` (no longer used after removing intro section)

**Verify after:** heading hierarchy is H1 (hero) → H2s (fixtures, England, info card headings, food, local, FAQ, CTA). No duplicate H1s.

## Step 2: Info card content updates

**File:** `app/live-sport/world-cup/page.tsx`

In the "What We're Showing" card:
- Add as first bullet: "Matches we show are on BBC and ITV (no subscription needed)"
- Verify hours line against SSOT. Current page text shows World Cup screening hours which differ from regular SSOT hours — these are event-specific and acceptable as static copy. Ensure Fri shows 4pm-10pm and Sat shows 12pm-10pm per recent commits.

In the "Booking Rules" card:
- Change "No deposits and no minimum spend" to two bullets:
  - "No deposits for groups under 10"  
  - "Groups of 10+: £10 per person deposit, deducted from your bill"

## Step 3: Metadata update

**File:** `app/live-sport/world-cup/page.tsx`

Update the `metadata` export (lines 37-54):
- Title: `World Cup 2026 Fixtures & UK Kick-Off Times | The Anchor Near Heathrow`
- Description: `World Cup 2026 fixtures with UK kick-off times, showing status and table bookings. Watch at The Anchor near Heathrow T5 — 4 screens, sound on, free parking.`
- OG title: `World Cup 2026 Fixtures & UK Kick-Off Times | The Anchor Near Heathrow`
- OG description: `World Cup 2026 fixtures with UK kick-off times and showing status. Watch at The Anchor near Heathrow T5 — 4 screens, sound on, free parking. Book a table.`
- Twitter title/description: match OG values
- Canonical: unchanged (`/live-sport/world-cup`)

## Step 4: Local area section rewrite

**File:** `app/live-sport/world-cup/page.tsx`

Replace the keyword-stuffed paragraph (lines 469-472) with:
"The Anchor is in Stanwell Moor, just off the M25 and {HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5. Free parking for {PARKING.capacity} cars makes us easy to reach from Staines, Ashford, Feltham, Egham, Colnbrook, and Windsor."

Keep the area links grid below unchanged.

## Step 5: FAQ updates

**File:** `app/live-sport/world-cup/page.tsx`

Add two new FAQ items to the `faqs` array:
1. Q: "Is the World Cup 2026 free to watch?" A: "Yes. World Cup 2026 matches are on BBC and ITV in the UK. We show them on our 4 screens with sound on — no subscription needed."
2. Q: "Are you extending opening hours for the World Cup?" A: "Selected knockout matches have extended hours until midnight. Check the fixtures list for specific matches. For all other games, standard opening hours apply."

Update existing FAQ "Which World Cup 2026 matches are you showing?" — work "screening" into the answer naturally: "We show matches (screenings) that kick off during our opening hours..."

## Step 6: Schema fixes

**File:** `app/live-sport/world-cup/page.tsx`

In the `eventSchema` object (lines 82-128):
- Add `'@id': 'https://www.the-anchor.pub/live-sport/world-cup#event'` after `'@type': 'Event'`
- Remove the `performer` field entirely (lines 115-118)

Add BreadcrumbJsonLd import and render:
- Import: `import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'` (same as parent `/live-sport` page)
- Render `<BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'Live Sport', url: '/live-sport' }, { name: 'World Cup 2026', url: '/live-sport/world-cup' }]} />` inside the JSX

## Step 7: "Screening" terminology

**File:** `app/live-sport/world-cup/page.tsx`

Already covered in Steps 1, 3, and 5:
- Fixtures section subtitle updated in Step 1
- England section subtitle updated in Step 1
- FAQ answer updated in Step 5

No separate work needed.

## Step 8: Internal link from `/live-sport` parent

**File:** `app/live-sport/page.tsx`

Add a `<Link>` to `/live-sport/world-cup` in the parent page. Find an appropriate location near the World Cup text mentions (lines 58, 182, 193). Add a prominent card or inline link such as:
"World Cup 2026 fixtures, UK kick-off times, and table bookings →" linking to `/live-sport/world-cup`.

## Step 9: Verify and build

Run the verification pipeline:
1. `npm run lint`
2. `npx tsc --noEmit`
3. `npm run build`

Fix any issues before committing.

---

## Files touched
- `app/live-sport/world-cup/page.tsx` (Steps 1-7 — bulk of the work)
- `app/live-sport/page.tsx` (Step 8 — add internal link)

## Files NOT touched
- `components/features/world-cup/WorldCup2026Fixtures.tsx` — no changes needed
- `lib/world-cup-2026.ts` — no changes needed
- `app/sitemap.ts` — already correct
- `docs/SSOT.md` — no new facts being added that aren't already there

## Commit strategy
Single commit: `feat: optimise world cup page for SEO and user experience`
