# Business Hours Component Consolidation

**Date:** 2026-04-26
**Status:** Approved
**Complexity:** S (single component rewrite + call-site migration)

## Problem

`components/BusinessHours.tsx` has 5 internal variants (`full`, `dark`, `condensed`, `compact`, `status`) with significant code duplication across 585 lines. Only 3 variants are used (`full`, `dark`, `condensed`); 2 are dead code. The variants share identical data-fetching and kitchen-resolution logic but diverge in rendering, making maintenance error-prone.

Additionally, 5 related components were already identified as dead code and deleted:
- `components/BusinessHoursSection.tsx`
- `components/ui/OpeningHours.tsx`
- `components/KitchenHoursString.tsx`
- `components/KitchenHoursDisplay.tsx`
- `components/BusinessHoursText.tsx`

## Decision

Rewrite `BusinessHours.tsx` with a single rendering path based on the `condensed` variant, incorporating the best elements from each.

## Design

### Props

```typescript
interface BusinessHoursProps {
  showKitchen?: boolean  // default: true
  className?: string
}
```

- No `variant` prop — single rendering path.
- `showKitchen={false}` hides kitchen rows (used on Find Us lower section).

### Internal State

- `showUpcoming: boolean` — toggle for "See upcoming changes" section (collapsed by default).

### Data Source

- `useBusinessHoursContext()` from `BusinessHoursProvider` (unchanged).
- Loading state: skeleton placeholder (unchanged from current).
- Error/no data: fallback message with phone number link (unchanged from current).

### Day Order

Fixed Monday–Sunday (from `full` variant), not "next 7 days from today" (from `condensed` variant). Today is highlighted with a `bg-white/10 ring-1 ring-white/30` treatment and a `(Today)` marker — matching current condensed styling.

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
│  See upcoming changes (2)           │  ← only when special hours exist
│  ┌─ Sat 3 May: Closed (Bank Hol) ─┐│     beyond current week, ≤30 days
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

For the main Monday–Sunday list, each day computes its ISO date and checks for a matching special hours entry (unchanged logic). If a special hours override exists for that day, it's displayed with yellow highlight and note text.

### "See Upcoming Changes" Section

- Only renders when `specialHours` entries exist with dates beyond the current week and within 30 days from today.
- Shows count in the toggle label: "See upcoming changes (3)".
- Collapsed by default; expands to show only the affected dates (not all 30 days).
- Each entry shows: date label, bar hours, kitchen hours (if `showKitchen`), and note/reason.

### Sunday Lunch Notices

Preserved from `condensed` variant. When a Sunday has `sundayLunchInfo.available === false`, an amber notice appears below that day's hours.

### Kitchen Resolution

`resolveKitchenInfo()` logic preserved exactly — this is critical business logic with deliberate `??` (not `||`) handling for `kitchen: null` signals. No changes to this function.

### Schema.org JSON-LD

**Removed from the component.** The `full` variant currently embeds `OpeningHoursSpecification` JSON-LD, but:
1. `BusinessHours` is a client component — server-rendered JSON-LD is more reliably crawled.
2. Several pages already generate schema server-side via `generateOpeningHoursSpecification()` in `lib/schema-utils.ts`, creating duplicates.

Pages that need opening hours schema should use the existing server-side utility. Pages not currently generating it can be added as a follow-up task.

## Migration

~28 call sites across the codebase:

| Current usage | New usage |
|---|---|
| `<BusinessHours />` | No change (default behaviour preserved) |
| `<BusinessHours variant="condensed" showKitchen={true} />` | `<BusinessHours />` |
| `<BusinessHours variant="dark" showKitchen={false} />` | `<BusinessHours showKitchen={false} />` |

### Call Sites

**No change needed (~25 pages):** All SEO landing pages (hotel pubs, town pubs, M25, etc.) that use `<BusinessHours />` with no variant prop.

**Remove variant prop (2 pages):**
- `app/page.tsx:779` — `variant="condensed"` → remove prop
- `app/find-us/page.tsx:298` — `variant="condensed"` → remove prop

**Remove variant, keep showKitchen (1 page):**
- `app/find-us/page.tsx:492` — `variant="dark" showKitchen={false}` → `showKitchen={false}`

### Barrel Export Cleanup

Remove `OpeningHours` and `BusinessHoursSection` exports from `components/ui/index.ts`. These were removed earlier but may have been reverted by a linter — verify and re-remove during implementation.

## Testing

- Existing `StatusBar.boundary.test.tsx` is unaffected (tests `StatusBar`, not `BusinessHours`).
- Manual verification on 3 representative pages: homepage, find-us, one SEO landing page (e.g. m25-junction-14-pub).
- Check: loading skeleton, error fallback, today highlighting, special hours display, showKitchen toggle, upcoming changes toggle.

## Out of Scope

- Redesigning the `StatusBar` component (separate concern, already consolidated).
- Adding server-side opening hours schema to pages that don't have it (follow-up task).
- Restyling the component visually beyond what's described (consolidation, not redesign).
