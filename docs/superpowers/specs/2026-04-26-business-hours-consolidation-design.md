# Business Hours Component Consolidation

**Date:** 2026-04-26
**Status:** Draft (revised after review)
**Complexity:** M (component rewrite + call-site migration + dead code deletion + tests)

## Problem

`components/BusinessHours.tsx` has 5 internal variants (`full`, `dark`, `condensed`, `compact`, `status`) with significant code duplication across 585 lines. Only 3 variants are used (`full`, `dark`, `condensed`); 2 are dead code. The variants share identical data-fetching and kitchen-resolution logic but diverge in rendering, making maintenance error-prone.

Additionally, 5 related components have zero imports anywhere in the codebase and must be deleted:
- `components/BusinessHoursSection.tsx`
- `components/ui/OpeningHours.tsx`
- `components/KitchenHoursString.tsx`
- `components/KitchenHoursDisplay.tsx`
- `components/BusinessHoursText.tsx`

`components/ui/index.ts` still re-exports `OpeningHours` (line 52) and `BusinessHoursSection` (line 65) — these exports must also be removed.

## Decision

Rewrite `BusinessHours.tsx` with a single rendering path based on the `condensed` variant, incorporating the best elements from each.

## Visual Change Acknowledgement

**This is a breaking visual change across ~25 SEO landing pages.** These pages currently render the `full` variant (status banner, full day names, "Opening Hours" heading, microdata attributes, embedded JSON-LD). After consolidation they will render the condensed-based layout (StatusBar component, abbreviated day names, compact spacing, no embedded schema). This is intentional — the condensed layout is already proven on the highest-traffic pages (homepage, find-us) and provides a more consistent experience site-wide.

## Design

### Props

```typescript
interface BusinessHoursProps {
  showKitchen?: boolean  // default: true
  className?: string     // applied to root wrapper in all states (loading, error, success)
}
```

- No `variant` prop — single rendering path.
- `showKitchen={false}` hides kitchen rows (used on Find Us lower section).
- `className` is a new addition (current component does not accept it). Applied to the outermost `<div>` in loading, error, and success render paths.

### Internal State

- `showUpcoming: boolean` — toggle for "See upcoming changes" section (collapsed by default).

### Data Source

- `useBusinessHoursContext()` from `BusinessHoursProvider` (unchanged).
- Loading state: skeleton placeholder (unchanged from current).
- Error/no data: fallback message with phone number link (unchanged from current).

### Date Semantics

**Timezone:** All date computations use `Europe/London` via Luxon (`DateTime.now().setZone('Europe/London')`), matching existing behaviour.

**Day-to-date mapping:** Each day in the fixed Monday–Sunday list maps to the **next occurrence** of that weekday (including today). This preserves the existing `full` variant logic at `BusinessHours.tsx:90-101`:
- If today is Wednesday, then Monday = next Monday (5 days ahead), Tuesday = next Tuesday (6 days ahead), Wednesday = today.
- This means special hours are matched correctly — Monday's row shows next Monday's special hours, not last Monday's.

**"Current week" definition for upcoming changes:** The main list covers exactly 7 calendar dates (the next occurrence of each weekday). "Beyond the current week" means any special hours entry with a date strictly after the latest date shown in the main list (i.e., > the date mapped to the day before today in the cycle). The upper bound is 30 calendar days from today (inclusive).

**Boundary rules for upcoming changes:**
- Exclude dates already shown in the main Monday–Sunday list.
- Include dates where `specialHours[].date > lastDateInMainList && specialHours[].date <= today + 30 days`.
- Sort ascending by date.

### Layout Structure

```
┌─────────────────────────────────────┐
│         StatusBar (existing)        │  ← imported component, not rebuilt
├─────────────────────────────────────┤
│ Mon             Bar: 4pm - 11pm    │
│                 Kitchen: Closed     │
│ Tue             Bar: 12pm - 11pm   │
│                 Kitchen: 6pm - 9pm │
│ Wed  •          Bar: 12pm - 11pm   │  ← today highlighted
│                 Kitchen: 6pm - 9pm │
│ ...                                │
│ Sun             Bar: 12pm - 10pm   │
│                 Kitchen: 1pm - 6pm │
├─────────────────────────────────────┤
│  See upcoming changes (2)           │  ← only when qualifying entries exist
│  ┌─ Sat 3 May: Closed (Bank Hol) ─┐│
│  └─ Mon 26 May: Special hours ────┘│
└─────────────────────────────────────┘
```

### Row Styling

- Compact spacing from `condensed` variant: `px-3 py-1.5` per row.
- Abbreviated day names: `Mon`, `Tue`, etc.
- Today row: `bg-white/10 ring-1 ring-white/30`.
- Special hours rows: `ring-1 ring-yellow-400/50` with amber note text.
- Bar/kitchen labels right-aligned with `text-xs text-white/60` labels.

### Special Hours Handling

For the main Monday–Sunday list, each day's mapped ISO date is checked against `hours.specialHours[]`. If a matching entry exists, it overrides the regular hours for that day and is displayed with a yellow highlight and note/reason text (unchanged logic).

### "See Upcoming Changes" Section

- Only renders when qualifying special hours entries exist (see Date Semantics above).
- Shows count in the toggle label: "See upcoming changes (3)".
- Collapsed by default; `showUpcoming` state toggles visibility.
- Each entry shows: formatted date label (e.g. "Sat 3 May"), bar hours, kitchen hours (if `showKitchen`), and note/reason.
- For future special hours entries that override only some fields (e.g. kitchen closed but bar hours not specified), the regular hours for that weekday are used as the fallback for unspecified fields. Specifically: derive the weekday from the special hours date, look up `hours.regularHours[weekday]`, and merge.
- Sort: ascending by date.

### Sunday Lunch Notices

Preserved from `condensed` variant. When a Sunday has `sundayLunchInfo.available === false`, an amber notice appears below that day's hours.

### Kitchen Resolution

`resolveKitchenInfo()` logic preserved exactly — this is critical business logic with deliberate `??` (not `||`) handling for `kitchen: null` signals. No changes to this function.

### Schema.org JSON-LD

**Removed from the component.** The `full` variant currently embeds `OpeningHoursSpecification` JSON-LD and `itemProp`/`itemScope` microdata, but:
1. `BusinessHours` is a `'use client'` component — server-rendered JSON-LD is more reliably crawled.
2. 6 pages already generate schema server-side, creating duplicates on those pages.

**Schema coverage audit:**

Currently have server-side `openingHoursSpecification`: 6 pages
- `app/beer-garden/page.tsx`
- `app/drinks/page.tsx`
- `app/plane-spotting-heathrow/page.tsx`
- `app/pubs-in-stanwell/page.tsx`
- `app/sunday-lunch/page.tsx`
- `app/whats-on/page.tsx`

Will lose hours schema after this change: 40 pages (all pages rendering `<BusinessHours />` without server-side schema). Key pages affected:
- `app/page.tsx` (homepage)
- `app/find-us/page.tsx`
- `app/m25-junction-14-pub/page.tsx`
- All 12 `app/pub-near-*/page.tsx` hotel pages
- All 10 town pub pages (`ashford-pub`, `bedfont-pub`, etc.)
- `app/food-menu/page.tsx`, `app/live-sport/page.tsx`, etc.

**Tradeoff accepted:** Removing client-rendered JSON-LD from 40 pages is a short-term schema regression. This is acceptable because:
- Client-rendered JSON-LD is less reliably crawled than server-side.
- The `full` variant's schema was per-day (today only), not a complete weekly specification — limited SEO value.
- Adding `generateOpeningHoursSpecification()` to the 40 affected pages is a mechanical follow-up task.

**Follow-up task (out of scope for this spec):** Add server-side `openingHoursSpecification` to the 40 pages listed above.

## Dead Code Deletion

Delete these files (verified zero imports across the codebase):
1. `components/BusinessHoursSection.tsx`
2. `components/ui/OpeningHours.tsx`
3. `components/KitchenHoursString.tsx`
4. `components/KitchenHoursDisplay.tsx`
5. `components/BusinessHoursText.tsx`

Remove from `components/ui/index.ts`:
- Line 52: `export { OpeningHours, OpenStatus } from './OpeningHours'`
- Line 65: `export { BusinessHoursSection } from '../BusinessHoursSection'`

## Migration

~28 call sites across the codebase. **Important:** the default rendering changes visually for all sites — this is not a no-op migration for the ~25 pages using the default variant.

| Current usage | New usage | Visual change |
|---|---|---|
| `<BusinessHours />` (~25 pages) | No code change needed | **Yes** — switches from `full` layout to condensed-based layout |
| `<BusinessHours variant="condensed" showKitchen={true} />` (2 pages) | `<BusinessHours />` | Minimal — day order changes from rolling to fixed Mon–Sun |
| `<BusinessHours variant="dark" showKitchen={false} />` (1 page) | `<BusinessHours showKitchen={false} />` | Minimal — styling aligns with consolidated design |

### Call Sites

**Visual change, no code change (~25 pages):** All SEO landing pages (hotel pubs, town pubs, M25, etc.) that use `<BusinessHours />` with no variant prop. The rendered output changes from `full` to the consolidated layout.

**Remove variant prop (2 pages):**
- `app/page.tsx:779` — `variant="condensed"` → remove prop
- `app/find-us/page.tsx:298` — `variant="condensed"` → remove prop

**Remove variant, keep showKitchen (1 page):**
- `app/find-us/page.tsx:492` — `variant="dark" showKitchen={false}` → `showKitchen={false}`

## Testing

There are no existing tests for `BusinessHours`. `StatusBar.boundary.test.tsx` tests the `StatusBar` component only and does not protect this consolidation.

### Required: Unit Tests (RTL + Vitest)

Create `tests/unit/BusinessHours.test.tsx` with the following cases:

**Rendering states:**
- Loading state renders skeleton
- Error state renders fallback with phone number
- Success state renders 7 day rows (Mon–Sun)

**`showKitchen` prop:**
- `showKitchen={true}` (default) renders kitchen labels and times
- `showKitchen={false}` hides all kitchen information

**Kitchen resolution (critical business logic):**
- `kitchen: null` renders "No service" (not kitchen times from regular hours)
- `is_kitchen_closed: true` renders "Closed"
- Kitchen with `{ opens, closes }` renders formatted times
- Special hours kitchen overrides regular hours kitchen via `??` semantics

**Special hours:**
- Day with special hours shows yellow highlight and note text
- Day with special hours and `is_closed: true` shows "Closed"

**Sunday lunch:**
- Sunday with `sundayLunchInfo.available === false` shows amber notice
- Sunday with available lunch shows no notice

**Upcoming changes section:**
- Not rendered when no special hours exist beyond main list dates
- Rendered with correct count when qualifying entries exist
- Entries sorted ascending by date
- Entries already in main list are excluded
- Toggle expands/collapses the section
- Future rows use regular hours as fallback for unspecified fields

**`className` prop:**
- Applied to root wrapper in loading state
- Applied to root wrapper in error state
- Applied to root wrapper in success state

### Required: Manual Verification

Verify on 3 representative pages after implementation:
- Homepage (`app/page.tsx`)
- Find Us (`app/find-us/page.tsx`) — both instances
- One SEO landing page (e.g. `app/m25-junction-14-pub/page.tsx`)

Check: layout renders correctly, today highlighting, special hours if applicable, `showKitchen={false}` on Find Us lower section.

## Out of Scope

- Redesigning the `StatusBar` component (separate concern).
- Adding server-side `openingHoursSpecification` to the 40 pages that will lose client-side schema (follow-up task — list above).
- Restyling the component visually beyond what's described (consolidation, not redesign).
