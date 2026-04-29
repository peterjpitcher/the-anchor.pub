# Handoff: Food & Booking Pages — Meta, CTAs, Schema

**Status:** Complete  
**Date:** 2026-04-21

## Changes Made

### Task 1: Meta Rewrites

**`/book-table`** (`app/book-table/page.tsx`)
- Title: "Book a Table Near Heathrow | Sunday Roast | The Anchor" (57ch) ✓
- Description: "Reserve your table at The Anchor, Stanwell Moor — instant confirmation. Pub food from £8.95, Sunday roast from £19. Dog-friendly, free parking, 7 mins from T5." ✓
- Updated across `metadata`, `openGraph`, and `twitter` blocks.

**`/sunday-lunch`** (`app/sunday-lunch/page.tsx`)
- Title: "Sunday Roast Near Heathrow | From £19 | Book by Saturday" (58ch) ✓
- Description: "Traditional Sunday roast from £19 at The Anchor, Stanwell Moor. Chicken, pork belly & veggie options. Must book by Saturday 1pm. Free parking, 7 mins from T5." ✓
- Updated across `metadata`, `openGraph`, and `twitter` blocks.

**`/food-menu`** (`app/food-menu/page.tsx`)
- Description already contained "Book a table" — updated to "Book a table online." for stronger action signal. ✓

### Task 2: /book-table Hero CTA Swap

- Primary CTA is now a "Book Online" button anchored to `#booking-form` (scroll to form).
- Secondary CTA is now the `PhoneButton` ("Prefer to call? 01753 682707") with `variant="outline"`.
- The booking form `<Section>` now has `id="booking-form"` so the anchor resolves correctly.
- "Find Us" link was removed from the secondary CTA position as part of this swap.

### Task 3: /food-menu and /food-menu/gluten-free — BookTableButton Added to Footer CTA

Both pages now have a "Book a Table" button as the **first** button in the footer `CTASection`:
- `/food-menu` footer CTA: Book a Table → Call → View Drinks Menu
- `/food-menu/gluten-free` footer CTA: Book a Table → Call → View Full Menu

The button uses `/book-table` as its href and renders as a standard CTA link (the CTASection component detects booking buttons via `ordertab.menu` href — since this links to the internal wizard at `/book-table`, it renders as a styled link button, which is correct).

### Task 4: /sunday-lunch — Price Badge Added to Hero

Added `{ label: 'From £19pp', variant: 'success' }` as the first tag in the HeroWrapper `tags` array. This renders as a green badge in the hero tag strip, clearly communicating entry price before booking.

Note: Price is not hardcoded in a constant — it matches the `FALLBACK_MENU` mains data and existing copy throughout the page. No SSOT constant for this price was found in the codebase.

### Task 5: Restaurant/Menu Schema on Dietary Pages

All three dietary pages now have Restaurant + Menu + FAQPage schema:

**`/food-menu/gluten-free`**
- Previously: FAQPage schema only
- Now: FAQPage + Restaurant (with `hasMenu` pointing to gluten-free menu URL) ✓

**`/food-menu/vegan`**
- Previously: No schema at all
- Now: FAQPage + Restaurant (with `hasMenu` pointing to vegan menu URL) ✓
- Added `import { jsonLdSafeStringify } from '@/lib/jsonld'`

**`/food-menu/vegetarian`**
- Previously: No schema at all
- Now: FAQPage + Restaurant (with `hasMenu` pointing to vegetarian menu URL) ✓
- Added `import { jsonLdSafeStringify } from '@/lib/jsonld'`

The Restaurant schema on all dietary pages uses `@id: 'https://www.the-anchor.pub/#business'` to match the main food-menu page's entity identity.

## Files Modified

- `app/book-table/page.tsx`
- `app/sunday-lunch/page.tsx`
- `app/food-menu/page.tsx`
- `app/food-menu/gluten-free/page.tsx`
- `app/food-menu/vegan/page.tsx`
- `app/food-menu/vegetarian/page.tsx`

## Verification

- `npx tsc --noEmit` — zero errors in modified files (pre-existing test file errors unrelated to these changes)
- All imports follow existing patterns in the codebase

## Self-Check

- [x] /book-table meta title and description updated
- [x] /sunday-lunch meta title and description updated
- [x] /food-menu description updated (includes "Book a table online")
- [x] /book-table hero CTA priority swapped (booking over phone)
- [x] /food-menu and /food-menu/gluten-free have BookTableButton in footer CTA
- [x] /sunday-lunch has price badge in hero (From £19pp tag)
- [x] Dietary pages have Restaurant/Menu schema
