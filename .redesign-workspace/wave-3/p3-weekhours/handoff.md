# Handoff — PR 3.1 WeekHours (wave 3)

## Deliverable
- New `components/WeekHours.tsx` (uncommitted, in working tree). Nothing staged/committed; no build run.

## How I reused the hours data logic
I **replicated** the resolution logic from `components/BusinessHours.tsx` rather than extracting a shared
helper. Reasons:
- Extraction would have required editing `BusinessHours.tsx` (re-pointing it at the helper), which carries a
  behaviour-change risk the brief told me to avoid. A clean extraction wasn't possible without touching it.
- The replicated functions are verbatim copies: `getSpecialHoursForDate`, `formatTime`, `resolveKitchenInfo`,
  `getSundayLunchInfoForDate`, and the "today + next 6 days" build loop. Same `useBusinessHoursContext()`
  source, same static fallback (`STATIC_BAR_HOURS_SUMMARY` / `_KITCHEN_` / `_REVIEW_NOTE` from
  `lib/business-hours-fallback`) on loading + error.
- **I did NOT touch `BusinessHours.tsx`** (or any other file).

Note for orchestrator: the duplicated resolution block is a candidate for a future shared helper
(e.g. `lib/week-hours-data.ts`) once both components can be refactored together safely — out of scope here.

## null-kitchen handling (preserved)
`resolveKitchenInfo` uses **property-presence** (`Object.prototype.hasOwnProperty.call(entry, 'kitchen')`),
not `??` on inner fields — so an explicit `kitchen: null` on the special-hours entry is taken as the resolved
value and never falls through to the regular-hours kitchen. `is_kitchen_closed === true` is also honoured.
The render helper `kitchenLineText()` maps `kitchenClosed === true` **and** falsy `kitchen` (incl. `null`) to
the literal text **"Kitchen closed"**. So `kitchen: null` ⇒ "Kitchen closed". Verified by code path.

## Layout (spec §6.1)
- Header: `<Badge variant="success|danger" dot>` reading `Open now` / `Closed now` (driven by
  `hours.currentStatus.isOpen`) + status text.
- 2-col list `grid-cols-1 sm:grid-cols-2` (1-col under 640px). Each row: left = day name (`font-medium`) +
  date sub (`Today` highlighted `text-accent-text font-semibold`, else `text-ink-muted`); right = bar times
  (`font-semibold`; "Closed" in `text-anchor-danger`), kitchen line (`text-xs text-ink-muted`; a special-hours
  `note`/`reason` — or Sunday-lunch-unavailable message — replaces it when present), plane window line
  (`text-xs text-accent-text` + 13px lucide `<Plane size={13}>`) from `getPlaneSpottingWindowForDate(iso)`
  (hidden when `window === 'unknown'`).
- Today's row: `bg-anchor-sand text-ink`.
- Footer note rendered verbatim per spec.
- 12-hour time format (reused `formatTime`). British English copy.
- Accessibility: each `<li>` has an `aria-label` summarising day + open/closed + kitchen in text, so state is
  never colour-only. Plane icon is `aria-hidden` with adjacent text.

## Verification
- `npx tsc --noEmit` → **0 errors** (whole project clean; no sibling event-file errors present at this point).
- Old-token / hardcoded-hex audit on `components/WeekHours.tsx` → **0 hits** (grep for
  `anchor-green-raised|anchor-cream|gold-bright|gold-dark|text-white|bg-white/|text-yellow|amber-|red-[0-9]|#hex`).
  Tokens used: `bg-surface`, `bg-anchor-sand`, `bg-anchor-danger/[0.08]`, `border-line`,
  `border-anchor-danger/30`, `text-ink`, `text-ink-muted`, `text-accent-text`, `text-anchor-danger`,
  `rounded-md` (DS light-card radius — `rounded-card` is not a Tailwind token in Phase 0).

## Constraints honoured
- No event files touched (`Event*`, `EventBookingButton`, event cards). StatusBar untouched. No barrel/index
  edits — `Badge` imported by direct path `@/components/ui/primitives/Badge`. No new deps. No `docs/architecture/*`
  changes. Nothing staged or committed; no build run.

## Wiring note for orchestrator
`WeekHours` requires a `<BusinessHoursProvider>` ancestor (same as `BusinessHours.tsx`/`StatusBar`) — it reads
context only, with no standalone fetch. Place it inside the existing provider on the homepage Find Us section.
