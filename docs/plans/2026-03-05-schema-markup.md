# Schema Markup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 6 schema correctness errors, then add ReserveAction/CommunicateAction coverage across food, event, and private hire pages to drive bookings and enquiries.

**Architecture:** Existing pattern preserved — `DynamicSchema` in root layout for global schemas, inline `JsonLd`/script tags on individual pages. All changes are in lib schema files and page components. No new files created.

**Tech Stack:** Next.js 14 App Router, TypeScript, schema.org JSON-LD, Jest for unit tests.

---

## Phase 1: Correctness Fixes

### Task 1: Fix expired dates in event series and announcement schemas

**Files:**
- Modify: `lib/schema.ts`

**Step 1: Write the failing test**

Create `tests/unit/schema.test.ts`:

```typescript
import { quizNightEventSeries, bingoEventSeries, specialAnnouncementSchema } from '@/lib/schema'

describe('schema dates', () => {
  it('quizNightEventSeries endDate is in the future', () => {
    const endDate = new Date(quizNightEventSeries.endDate)
    expect(endDate.getTime()).toBeGreaterThan(Date.now())
  })

  it('bingoEventSeries endDate is in the future', () => {
    const endDate = new Date(bingoEventSeries.endDate)
    expect(endDate.getTime()).toBeGreaterThan(Date.now())
  })

  it('specialAnnouncementSchema expires in the future', () => {
    const expires = new Date(specialAnnouncementSchema.expires)
    expect(expires.getTime()).toBeGreaterThan(Date.now())
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npx jest tests/unit/schema.test.ts --no-coverage
```

Expected: 3 FAILs — all dates are `2025-12-31`, which is in the past.

**Step 3: Update the three expired dates in `lib/schema.ts`**

Find `"endDate": "2025-12-31"` on `quizNightEventSeries` (around line 216) and change to:
```
"endDate": "2026-12-31",
```

Find `"endDate": "2025-12-31"` on `bingoEventSeries` (around line 267) and change to:
```
"endDate": "2026-12-31",
```

Find `"expires": "2025-12-31"` on `specialAnnouncementSchema` (around line 167) and change to:
```
"expires": "2026-12-31",
```

**Step 4: Run test to verify it passes**

```bash
npx jest tests/unit/schema.test.ts --no-coverage
```

Expected: 3 PASSes.

**Step 5: Commit**

```bash
git add lib/schema.ts tests/unit/schema.test.ts
git commit -m "fix(schema): update expired dates in event series and announcement schemas"
```

---

### Task 2: Fix invalid priceRange values

`"moderate"` is not recognised by Google. UK restaurants use the pound-sign convention (`"££"`).

**Files:**
- Modify: `lib/schema-with-reviews.ts` (line ~87: `"priceRange": "moderate"`)
- Modify: `lib/enhanced-schemas.ts` (line ~168: `"priceRange": "moderate"`)
- Modify: `app/food-menu/page.tsx` (line ~745: `priceRange: 'moderate'`)
- Modify: `app/sunday-lunch/page.tsx` (line ~272: `priceRange: 'moderate'`)

**Step 1: Write the failing test**

Add to `tests/unit/schema.test.ts`:

```typescript
import { getEnhancedSchemas } from '@/lib/schema-with-reviews'

describe('priceRange', () => {
  it('localBusinessSchema uses pound-sign priceRange', async () => {
    const schemas = await getEnhancedSchemas()
    expect(schemas.localBusinessSchema.priceRange).toBe('££')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npx jest tests/unit/schema.test.ts --no-coverage
```

Expected: FAIL — current value is `"moderate"`.

**Step 3: Update all four occurrences**

In `lib/schema-with-reviews.ts` find `"priceRange": "moderate"` and change to `"priceRange": "££"`.

In `lib/enhanced-schemas.ts` find `"priceRange": "moderate"` and change to `"priceRange": "££"`.

In `app/food-menu/page.tsx` find `priceRange: 'moderate'` and change to `priceRange: '££'`.

In `app/sunday-lunch/page.tsx` find `priceRange: 'moderate'` and change to `priceRange: '££'`.

**Step 4: Run test to verify it passes**

```bash
npx jest tests/unit/schema.test.ts --no-coverage
```

Expected: PASS.

**Step 5: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 6: Commit**

```bash
git add lib/schema-with-reviews.ts lib/enhanced-schemas.ts app/food-menu/page.tsx app/sunday-lunch/page.tsx tests/unit/schema.test.ts
git commit -m "fix(schema): change priceRange from 'moderate' to '££' for Google compatibility"
```

---

### Task 3: Remove fake SearchAction from WebSite schema

The site has no `/search` endpoint. This `potentialAction` points to a non-existent URL and may trigger GSC warnings.

**Files:**
- Modify: `lib/schema.ts`

**Step 1: Write the failing test**

Add to `tests/unit/schema.test.ts`:

```typescript
import { webSiteSchema } from '@/lib/schema'

describe('webSiteSchema', () => {
  it('does not include a potentialAction SearchAction', () => {
    expect(webSiteSchema).not.toHaveProperty('potentialAction')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npx jest tests/unit/schema.test.ts --no-coverage
```

Expected: FAIL — `potentialAction` currently exists.

**Step 3: Remove `potentialAction` from `webSiteSchema` in `lib/schema.ts`**

The `webSiteSchema` export (around line 181) currently ends with:
```typescript
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.the-anchor.pub/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
```

Delete those 9 lines entirely. The closing `}` of `webSiteSchema` is the line before `export const restaurantSchema`.

**Step 4: Run test to verify it passes**

```bash
npx jest tests/unit/schema.test.ts --no-coverage
```

Expected: PASS.

**Step 5: Commit**

```bash
git add lib/schema.ts tests/unit/schema.test.ts
git commit -m "fix(schema): remove fake SearchAction from WebSite schema (no search endpoint exists)"
```

---

### Task 4: Fix nutrition info — stop emitting invalid range strings

`NutritionInformation` requires single numeric values. The current function emits ranges like `"850-1100"` which fail validation. Return `undefined` until actual values are available; callers handle `undefined` gracefully.

**Files:**
- Modify: `lib/schema-utils.ts`

**Step 1: Write the failing test**

Create `tests/unit/schema-utils.test.ts`:

```typescript
import { generateNutritionInfo } from '@/lib/schema-utils'

describe('generateNutritionInfo', () => {
  it('returns undefined (no invalid range strings)', () => {
    expect(generateNutritionInfo('Margherita Pizza', 'pizza')).toBeUndefined()
    expect(generateNutritionInfo('Cheeseburger', 'burger')).toBeUndefined()
    expect(generateNutritionInfo('Sunday Roast', 'sunday-roast')).toBeUndefined()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npx jest tests/unit/schema-utils.test.ts --no-coverage
```

Expected: FAIL — function currently returns an object with range strings.

**Step 3: Replace the function body in `lib/schema-utils.ts`**

Find `export function generateNutritionInfo(itemName: string, category: string)` (around line 109). Replace the entire function body with:

```typescript
export function generateNutritionInfo(_itemName: string, _category: string): undefined {
  // NutritionInformation requires single numeric values, not ranges.
  // Return undefined until actual measured values are available.
  return undefined
}
```

The `nutritionDefaults` record and all the logic inside can be deleted — it is only used by this function.

**Step 4: Run test to verify it passes**

```bash
npx jest tests/unit/schema-utils.test.ts --no-coverage
```

Expected: PASS.

**Step 5: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors. The callers (`food-menu/page.tsx`, `sunday-lunch/page.tsx`) use `nutrition: generateNutritionInfo(...)` which accepts `undefined` as a valid property value.

**Step 6: Commit**

```bash
git add lib/schema-utils.ts tests/unit/schema-utils.test.ts
git commit -m "fix(schema): return undefined from generateNutritionInfo to stop emitting invalid range strings"
```

---

### Task 5: Remove dead code — unused homepageFAQSchema import

**Files:**
- Modify: `app/page.tsx`

**Step 1: Confirm the import is unused**

```bash
grep -n "homepageFAQSchema" app/page.tsx
```

Expected: one line for the import, zero uses below it.

**Step 2: Delete the import line**

In `app/page.tsx`, find and delete the line:
```typescript
import { homepageFAQSchema } from '@/lib/enhanced-schemas'
```

**Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 4: Build check**

```bash
npm run build 2>&1 | tail -5
```

Expected: successful build, no unused-import warnings.

**Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "fix(schema): remove unused homepageFAQSchema import from homepage"
```

---

### Task 6: Fix acceptsReservations — string to boolean

**Files:**
- Modify: `lib/schema-with-reviews.ts`

**Step 1: Write the failing test**

Add to `tests/unit/schema.test.ts`:

```typescript
describe('acceptsReservations', () => {
  it('localBusinessSchema acceptsReservations is boolean true', async () => {
    const schemas = await getEnhancedSchemas()
    expect(schemas.localBusinessSchema.acceptsReservations).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npx jest tests/unit/schema.test.ts --no-coverage
```

Expected: FAIL — current value is the string `"true"`.

**Step 3: Update `lib/schema-with-reviews.ts`**

Find `"acceptsReservations": "true"` and change to `"acceptsReservations": true` (remove the quotes).

**Step 4: Run test to verify it passes**

```bash
npx jest tests/unit/schema.test.ts --no-coverage
```

Expected: PASS.

**Step 5: Commit**

```bash
git add lib/schema-with-reviews.ts tests/unit/schema.test.ts
git commit -m "fix(schema): change acceptsReservations from string 'true' to boolean true"
```

---

## Phase 2: Coverage Additions

### Task 7: Add ReserveAction to global LocalBusiness schema

This is the highest-value single addition — every page on the site inherits the booking signal.

**Files:**
- Modify: `lib/schema-with-reviews.ts`

**Step 1: Write the failing test**

Add to `tests/unit/schema.test.ts`:

```typescript
describe('ReserveAction', () => {
  it('localBusinessSchema has potentialAction ReserveAction targeting /book-table', async () => {
    const schemas = await getEnhancedSchemas()
    const action = schemas.localBusinessSchema.potentialAction as any
    expect(action['@type']).toBe('ReserveAction')
    expect(action.target.urlTemplate).toBe('https://www.the-anchor.pub/book-table')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npx jest tests/unit/schema.test.ts --no-coverage
```

Expected: FAIL — no `potentialAction` exists.

**Step 3: Add `potentialAction` to `localBusinessSchemaWithReviews` in `lib/schema-with-reviews.ts`**

After the `"smokingAllowed": false` line (the last property), add:

```typescript
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
        "result": {
          "@type": "FoodEstablishmentReservation"
        }
      }
```

**Step 4: Run test to verify it passes**

```bash
npx jest tests/unit/schema.test.ts --no-coverage
```

Expected: PASS.

**Step 5: Commit**

```bash
git add lib/schema-with-reviews.ts tests/unit/schema.test.ts
git commit -m "feat(schema): add ReserveAction to global LocalBusiness schema"
```

---

### Task 8: Add ReserveAction and provider to food-menu page

**Files:**
- Modify: `app/food-menu/page.tsx` (around lines 718–746 — the inline Restaurant schema)

**Step 1: Locate the Restaurant schema object**

Find the inline `Restaurant` schema object (starting around line 720). It currently ends with:
```typescript
              priceRange: '££'    // after Task 2
```

**Step 2: Add `potentialAction` and link Menu to parent entity**

Add after `priceRange: '££'`:
```typescript
              potentialAction: {
                '@type': 'ReserveAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://www.the-anchor.pub/book-table',
                  actionPlatform: [
                    'https://schema.org/DesktopWebPlatform',
                    'https://schema.org/MobileWebPlatform'
                  ]
                },
                result: { '@type': 'FoodEstablishmentReservation' }
              },
```

Also add `provider` to the Menu schema (the first object in the array, around line 694):
```typescript
              provider: { '@id': 'https://www.the-anchor.pub/#business' },
```

**Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 4: Build check**

```bash
npm run build 2>&1 | tail -5
```

Expected: successful.

**Step 5: Commit**

```bash
git add app/food-menu/page.tsx
git commit -m "feat(schema): add ReserveAction and provider link to food-menu Restaurant schema"
```

---

### Task 9: Add ReserveAction and provider to burger-menu page

**Files:**
- Modify: `app/burger-menu/page.tsx` (around lines 59–77)

**Step 1: Add `provider` and a Restaurant schema with `potentialAction`**

The `menuSchema` object (around line 59) currently has no `provider`. Add it:
```typescript
    const menuSchema = {
        "@context": "https://schema.org",
        "@type": "Menu",
        "name": "Burger Menu",
        "description": "Gourmet burgers served with chips.",
        "provider": { "@id": "https://www.the-anchor.pub/#business" },  // ADD THIS
        "hasMenuSection": [ ... ]
    }
```

After `menuSchema`, add a new `restaurantSchema` object:
```typescript
    const restaurantSchema = {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "@id": "https://www.the-anchor.pub/#business",
        "name": "The Anchor",
        "hasMenu": { "@id": "https://www.the-anchor.pub/burger-menu#menu" },
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
    }
```

Update the `jsonLdSafeStringify` call (line ~77) to include it:
```typescript
dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([menuSchema, restaurantSchema, breadcrumbSchema]) }}
```

Also add `"@id"` to the Menu schema so the Restaurant can reference it:
```typescript
"@id": "https://www.the-anchor.pub/burger-menu#menu",
```

**Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add app/burger-menu/page.tsx
git commit -m "feat(schema): add ReserveAction and provider link to burger-menu schema"
```

---

### Task 10: Add ReserveAction and provider to pizza-menu page

**Files:**
- Modify: `app/pizza-menu/page.tsx` (around lines 47–72)

**Step 1: Apply the same pattern as Task 9**

Add `"@id"` and `"provider"` to the `menuSchema` object:
```typescript
    const menuSchema = {
        "@context": "https://schema.org",
        "@type": "Menu",
        "@id": "https://www.the-anchor.pub/pizza-menu#menu",
        "name": "Pizza Menu",
        "description": "Stone-baked pizzas available for dine-in or takeaway.",
        "provider": { "@id": "https://www.the-anchor.pub/#business" },
        "hasMenuSection": [ ... ]
    }
```

Add a `restaurantSchema` after:
```typescript
    const restaurantSchema = {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "@id": "https://www.the-anchor.pub/#business",
        "name": "The Anchor",
        "hasMenu": { "@id": "https://www.the-anchor.pub/pizza-menu#menu" },
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
    }
```

Update the script tag (line ~72):
```typescript
dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([menuSchema, restaurantSchema, breadcrumbSchema]) }}
```

**Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add app/pizza-menu/page.tsx
git commit -m "feat(schema): add ReserveAction and provider link to pizza-menu schema"
```

---

### Task 11: Fix sunday-lunch Offer URL and add ReserveAction

The Sunday lunch Offer `url` currently points to `/sunday-lunch` (informational). For conversion, it should point to `/book-table`. Also add `ReserveAction` to the Restaurant schema.

**Files:**
- Modify: `app/sunday-lunch/page.tsx`

**Step 1: Fix the Offer URL**

Find the Offer schema (around line 310). Currently:
```typescript
      url: 'https://www.the-anchor.pub/sunday-lunch',
```

Change to:
```typescript
      url: 'https://www.the-anchor.pub/book-table',
```

**Step 2: Add `potentialAction` to the Restaurant schema**

The Restaurant schema starts around line 267. After the `aggregateRating` property (last property, around line 306), add:
```typescript
      potentialAction: {
        '@type': 'ReserveAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://www.the-anchor.pub/book-table',
          actionPlatform: [
            'https://schema.org/DesktopWebPlatform',
            'https://schema.org/MobileWebPlatform'
          ]
        },
        result: { '@type': 'FoodEstablishmentReservation' }
      },
```

**Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 4: Commit**

```bash
git add app/sunday-lunch/page.tsx
git commit -m "feat(schema): fix sunday-lunch Offer URL to /book-table and add ReserveAction"
```

---

### Task 12: Add ReserveAction to event series schemas

**Files:**
- Modify: `lib/schema.ts`

**Step 1: Write the failing test**

Add to `tests/unit/schema.test.ts`:

```typescript
import { quizNightEventSeries, bingoEventSeries } from '@/lib/schema'

describe('event series ReserveAction', () => {
  it('quizNightEventSeries has potentialAction ReserveAction', () => {
    const action = (quizNightEventSeries as any).potentialAction
    expect(action?.['@type']).toBe('ReserveAction')
    expect(action?.target?.urlTemplate).toBe('https://www.the-anchor.pub/book-table')
  })

  it('bingoEventSeries has potentialAction ReserveAction', () => {
    const action = (bingoEventSeries as any).potentialAction
    expect(action?.['@type']).toBe('ReserveAction')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npx jest tests/unit/schema.test.ts --no-coverage
```

Expected: 2 FAILs.

**Step 3: Add `potentialAction` to both event series in `lib/schema.ts`**

In `quizNightEventSeries`, after the `"performer"` property, add:
```typescript
  "potentialAction": {
    "@type": "ReserveAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.the-anchor.pub/book-table",
      "actionPlatform": [
        "https://schema.org/DesktopWebPlatform",
        "https://schema.org/MobileWebPlatform"
      ]
    }
  }
```

In `bingoEventSeries`, after the `"organizer"` property, add the same block.

**Step 4: Run test to verify it passes**

```bash
npx jest tests/unit/schema.test.ts --no-coverage
```

Expected: 2 PASSes.

**Step 5: Commit**

```bash
git add lib/schema.ts tests/unit/schema.test.ts
git commit -m "feat(schema): add ReserveAction to quiz and bingo event series schemas"
```

---

### Task 13: Add ReserveAction to individual Event schemas

`buildEventSchema` already supports `event.potentialAction` from API data (line 114). We need to add a default `ReserveAction` when the event doesn't supply one.

**Files:**
- Modify: `lib/structured-data/event-schema.ts`

**Step 1: Write the failing test**

Create `tests/unit/event-schema.test.ts`:

```typescript
import { buildEventSchema } from '@/lib/structured-data/event-schema'

const minimalEvent = {
  id: 'test-1',
  name: 'Test Event',
  startDate: '2026-06-01T19:00:00Z',
  endDate: '2026-06-01T22:00:00Z',
  offers: { price: '5', priceCurrency: 'GBP' }
} as any

describe('buildEventSchema', () => {
  it('includes a default ReserveAction when event has no potentialAction', () => {
    const schema = buildEventSchema(minimalEvent)
    const action = (schema as any).potentialAction
    expect(action?.['@type']).toBe('ReserveAction')
    expect(action?.target?.urlTemplate).toBe('https://www.the-anchor.pub/book-table')
  })

  it('preserves event.potentialAction when provided', () => {
    const eventWithAction = {
      ...minimalEvent,
      potentialAction: { '@type': 'ReserveAction', target: { urlTemplate: 'https://custom.url' } }
    }
    const schema = buildEventSchema(eventWithAction)
    const action = (schema as any).potentialAction
    expect(action?.target?.urlTemplate).toBe('https://custom.url')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npx jest tests/unit/event-schema.test.ts --no-coverage
```

Expected: first test FAILS (no default ReserveAction), second test PASSes.

**Step 3: Update `lib/structured-data/event-schema.ts`**

The return object currently has (around line 114):
```typescript
    ...(event.potentialAction && { potentialAction: event.potentialAction }),
```

Replace with:
```typescript
    potentialAction: event.potentialAction ?? {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.the-anchor.pub/book-table',
        actionPlatform: [
          'https://schema.org/DesktopWebPlatform',
          'https://schema.org/MobileWebPlatform'
        ]
      }
    },
```

**Step 4: Run test to verify it passes**

```bash
npx jest tests/unit/event-schema.test.ts --no-coverage
```

Expected: both PASSes.

**Step 5: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 6: Commit**

```bash
git add lib/structured-data/event-schema.ts tests/unit/event-schema.test.ts
git commit -m "feat(schema): add default ReserveAction to buildEventSchema for individual events"
```

---

### Task 14: Add CommunicateAction to function-room-hire Service schema

**Files:**
- Modify: `app/function-room-hire/page.tsx` (lines 39–63)

**Step 1: Add `potentialAction` to `functionRoomSchema`**

The `functionRoomSchema` object ends with the `offers` property (line ~62). Add after it:
```typescript
  potentialAction: {
    "@type": "CommunicateAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.the-anchor.pub/private-hire#enquiry",
      "actionPlatform": [
        "https://schema.org/DesktopWebPlatform",
        "https://schema.org/MobileWebPlatform"
      ]
    }
  }
```

**Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add app/function-room-hire/page.tsx
git commit -m "feat(schema): add CommunicateAction to function-room-hire Service schema"
```

---

### Task 15: Add CommunicateAction to private hire sub-pages

Four pages follow the same pattern — each has an `eventVenueSchema` object with no `potentialAction`.

**Files:**
- Modify: `app/private-hire/engagement-parties/page.tsx`
- Modify: `app/private-hire/retirement-parties/page.tsx`
- Modify: `app/private-hire/milestone-birthdays/page.tsx`
- Modify: `app/private-hire/gender-reveal/page.tsx`

**Step 1: For each page, add `potentialAction` to the `eventVenueSchema` object**

Each page defines `eventVenueSchema` inside the component function. After the `"description"` property, add:

```typescript
        "potentialAction": {
            "@type": "CommunicateAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://www.the-anchor.pub/private-hire#enquiry",
                "actionPlatform": [
                    "https://schema.org/DesktopWebPlatform",
                    "https://schema.org/MobileWebPlatform"
                ]
            }
        }
```

Do this for all 4 pages. The pattern is identical in each.

**Step 2: TypeScript check across all four**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Full test suite**

```bash
npm test -- --no-coverage
```

Expected: all tests pass.

**Step 4: Full build**

```bash
npm run build 2>&1 | tail -10
```

Expected: successful build.

**Step 5: Commit**

```bash
git add app/private-hire/engagement-parties/page.tsx app/private-hire/retirement-parties/page.tsx app/private-hire/milestone-birthdays/page.tsx app/private-hire/gender-reveal/page.tsx
git commit -m "feat(schema): add CommunicateAction to all private hire EventVenue schemas"
```

---

## Post-Implementation Validation

After all tasks complete:

1. **TypeScript**: `npx tsc --noEmit` — no errors
2. **Tests**: `npm test -- --no-coverage` — all pass
3. **Build**: `npm run build` — successful
4. **Rich Results Test** — validate these URLs:
   - `https://www.the-anchor.pub/` (LocalBusiness + ReserveAction)
   - `https://www.the-anchor.pub/food-menu` (Restaurant + Menu + ReserveAction)
   - `https://www.the-anchor.pub/whats-on` (EventSeries with future dates)
   - `https://www.the-anchor.pub/function-room-hire` (Service + CommunicateAction)
5. **GSC** — check Enhancements reports after 1–2 weeks for improvements in event and restaurant rich results
