# Schema Markup Implementation Design

**Date:** 2026-03-05
**Status:** Approved
**Goal:** Fix schema correctness errors and add missing coverage to drive food searches → bookings (P1), event bookings (P2), and private hire enquiries (P3).

---

## Approach

Fix-first, then add coverage. Correctness errors (expired dates, invalid values) may be suppressing rich results entirely. Fixing these is the highest-leverage first step. Coverage additions then build on a clean foundation.

Existing architecture is preserved: `DynamicSchema` in root layout for global schemas, inline `JsonLd` / script tags on individual pages for page-specific schemas, `FAQAccordionWithSchema` for FAQ schemas. No `@graph` consolidation — not worth the refactor cost.

---

## Phase 1: Correctness Fixes

### Fix 1 — Expired dates (`lib/schema.ts`)
- `specialAnnouncementSchema.expires`: `"2025-12-31"` → `"2026-12-31"`
- `quizNightEventSeries.endDate`: `"2025-12-31"` → `"2026-12-31"`
- `bingoEventSeries.endDate`: `"2025-12-31"` → `"2026-12-31"`

Expired `endDate` causes Google to drop event rich results entirely. Most urgent fix.

### Fix 2 — `priceRange` (`lib/schema-with-reviews.ts`, `lib/enhanced-schemas.ts`)
- `"priceRange": "moderate"` → `"priceRange": "££"`

Google's Restaurant rich results recognise the pound-sign convention for UK venues. `"moderate"` is not a recognised value.

### Fix 3 — Remove fake SearchAction (`lib/schema.ts`)
- Remove `potentialAction` from `webSiteSchema`

The site has no `/search` endpoint. Misleading markup can trigger GSC warnings.

### Fix 4 — Nutrition info (`lib/schema-utils.ts`)
- `generateNutritionInfo` currently returns range strings like `"850-1100"` which are invalid for `NutritionInformation` (requires single numeric values)
- Change function to return `undefined` until actual values are available
- All callers already handle `undefined` gracefully

### Fix 5 — Dead code (`app/page.tsx`)
- Remove unused `homepageFAQSchema` import (confirmed unused in prior audit)

### Fix 6 — `acceptsReservations` type (`lib/schema-with-reviews.ts`)
- `"acceptsReservations": "true"` (string) → `"acceptsReservations": true` (boolean)

---

## Phase 2: Coverage Additions

### Priority 1 — Food Searches → Bookings

**Addition 1: `ReserveAction` on global LocalBusiness schema** (`lib/schema-with-reviews.ts`)

Add `potentialAction` to `localBusinessSchemaWithReviews`:
```json
"potentialAction": {
  "@type": "ReserveAction",
  "target": {
    "@type": "EntryPoint",
    "urlTemplate": "https://www.the-anchor.pub/book-table",
    "actionPlatform": [
      "https://schema.org/DesktopWebPlatform",
      "https://schema.org/MobileWebPlatform"
    ]
  },
  "result": { "@type": "FoodEstablishmentReservation" }
}
```

Applies site-wide — every page inherits the booking signal.

**Addition 2: `ReserveAction` on food menu page Restaurant schemas**

Add the same `potentialAction` to the inline `Restaurant` schema on:
- `app/food-menu/page.tsx`
- `app/sunday-lunch/page.tsx`
- `app/burger-menu/page.tsx`
- `app/pizza-menu/page.tsx`

Reinforces the booking signal on pages most likely to appear in food searches.

**Addition 3: Sunday lunch `Offer.url`** (`app/sunday-lunch/page.tsx`)

Add `"url": "https://www.the-anchor.pub/book-table"` to the existing Sunday roast Offer schema. Makes the pre-order booking connection explicit to Google.

**Addition 4: Link Menu schemas to parent Restaurant via `@id`**

Add `"provider": { "@id": "https://www.the-anchor.pub/#business" }` to the Menu schema on:
- `app/food-menu/page.tsx`
- `app/burger-menu/page.tsx`
- `app/pizza-menu/page.tsx`

Tells Google these menus belong to the known LocalBusiness entity.

### Priority 2 — Event Booking

**Addition 5: `ReserveAction` on event series schemas** (`lib/schema.ts`)

Add `potentialAction: ReserveAction` (same pattern as above, targeting `/book-table`) to `quizNightEventSeries` and `bingoEventSeries`.

**Addition 6: `ReserveAction` on individual Event schemas** (`lib/structured-data/event-schema.ts`)

The `EventSchema` component generates real upcoming events from the API. Add `potentialAction: ReserveAction` to each generated event object. Highest conversion value — real, dated events with a clear booking action.

### Priority 3 — Private Hire Enquiries

**Addition 7: `CommunicateAction` on Service and EventVenue schemas**

Add `potentialAction`:
```json
"potentialAction": {
  "@type": "CommunicateAction",
  "target": {
    "@type": "EntryPoint",
    "urlTemplate": "https://www.the-anchor.pub/private-hire",
    "actionPlatform": [
      "https://schema.org/DesktopWebPlatform",
      "https://schema.org/MobileWebPlatform"
    ]
  }
}
```

To:
- `app/function-room-hire/page.tsx` (existing `Service` schema)
- `app/private-hire/engagement-parties/page.tsx`
- `app/private-hire/retirement-parties/page.tsx`
- `app/private-hire/milestone-birthdays/page.tsx`
- `app/private-hire/gender-reveal/page.tsx`

---

## Scope Summary

| Phase | Changes | Files |
|-------|---------|-------|
| 1 — Fixes | 6 corrections | `lib/schema.ts`, `lib/schema-with-reviews.ts`, `lib/enhanced-schemas.ts`, `lib/schema-utils.ts`, `app/page.tsx` |
| 2 — P1 Food | 4 additions | `lib/schema-with-reviews.ts`, `app/food-menu`, `app/sunday-lunch`, `app/burger-menu`, `app/pizza-menu` |
| 2 — P2 Events | 2 additions | `lib/schema.ts`, `lib/structured-data/event-schema.ts` |
| 2 — P3 Private | 1 addition | `app/function-room-hire`, `app/private-hire/*` (4 pages) |

---

## Validation

After Phase 1 and again after Phase 2:
- Run `npx tsc --noEmit` and `npm run build` to confirm no regressions
- Test key pages in Google Rich Results Test
- Monitor GSC Enhancements reports for event, FAQ, and breadcrumb rich results
