# Handoff: Brand & Local Pages + Homepage Schema

**Status:** Complete  
**Date:** 2026-04-21

## Changes Made

### Task 1: Homepage Meta Update (`app/layout.tsx`)
- `title.default` updated to: "The Anchor Pub | Stanwell Moor | Near Heathrow" (52ch)
- `description` updated to include 4.6/5 rating, 7 mins from T5, Sunday roasts, quiz nights, karaoke Fridays, beer garden & free parking
- No `alternates.canonical` added to root layout (documented historical bug avoided)

### Task 2: /stanwell-pub (`app/stanwell-pub/page.tsx`)
- Title updated to: "The Anchor | Stanwell Moor Pub | Rated 4.6★ on Google" (55ch)
- Description updated to: local-first copy with rating, Sunday roasts from £19, stone-baked pizzas, dog-friendly beer garden, quiz nights & free parking
- H1 (`PageTitle`) changed from "Stanwell Pub - Traditional British Pub in Stanwell Moor" to "Your Local Pub in Stanwell Moor"

### Task 3: /near-heathrow (`app/near-heathrow/page.tsx`)
- Title updated to: "Pub Near Heathrow Airport | 7 Mins from T5 | The Anchor" (57ch) — singular "Pub" (not "Pubs")
- Description updated to include rating, 7 mins from T5, free parking, beer garden, Sunday roasts, quiz nights & live events

### Task 4: Homepage LocalBusiness Schema (`lib/schema-with-reviews.ts`)
- `sameAs` array added to `localBusinessSchemaWithReviews` with Facebook, Instagram, and WhatPub profile URLs
- `aggregateRating` and `openingHoursSpecification` were already present in the existing schema
- Schema is rendered globally via `DynamicSchema` component in `app/layout.tsx` `<head>`

## Key Findings
- The homepage LocalBusiness schema is rendered via `components/seo/DynamicSchema.tsx` (in `<head>` of root layout), which calls `getEnhancedSchemas()` from `lib/schema-with-reviews.ts` — not from `app/page.tsx`
- `aggregateRating` and `openingHoursSpecification` were already present; only `sameAs` was missing
- Social profile URLs sourced from `lib/schema.ts` `organizationSchema.sameAs` (canonical source)

## Files Modified
- `app/layout.tsx`
- `app/stanwell-pub/page.tsx`
- `app/near-heathrow/page.tsx`
- `lib/schema-with-reviews.ts`
