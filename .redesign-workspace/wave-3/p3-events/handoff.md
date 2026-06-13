# Handoff — Phase 3, PR 3.2 (Events components + PromoCtas)

Branch: `codex/redesign-build`. **Uncommitted, not built** — orchestrator integrates.

## Components created (all new, under `components/events/`)

| File | Role |
|---|---|
| `components/events/event-display.ts` | Shared presentational helpers (relative-day label, price text, low-capacity count, category chip style, image fallback, detail href). No logic duplication — wraps existing helpers. |
| `components/events/FeaturedEvent.tsx` | Headline event — `<Card accent>` split grid (340px square poster at `lg`, `16/10` full-width below). Badge row + name + shortDescription + description + meta row + actions. |
| `components/events/EventListItem.tsx` | `<Card hover accent>` row — 120px thumb (92px `<640px`), date line, name, shortDescription, `EventBookingButton size="sm"`. |
| `components/events/UpcomingEvents.tsx` | Presentational layout: `FeaturedEvent` (first) + remaining as `grid-cols-2` (1-col `<lg`), `gap-6` (= `--space-5`). Takes `events: Event[]` + optional `emptyState`. |

These are NEW files. The legacy `components/UpcomingEvents.tsx` (SEO/JSON-LD coupled, `.card-dark`) was left untouched — Phase 4 swaps consumers to the new `components/events/*` path. Imported by direct path; no barrel/index edits.

## How existing logic/helpers were reused (no duplication)

- **Booking labels:** rendered exclusively via `EventBookingButton` (`components/EventBookingButton.tsx`), which itself calls `getEventBookingCopy(event).label` and handles URL normalisation + GTM (`trackEventBookClick`). No label strings are written or paraphrased in these components. `source` props added: `featured_event`, `event_list_item`.
- **Sold-out / low-capacity:** `isEventSoldOut(event)` from `lib/api/events.ts` drives the danger "Sold out" badge; low-capacity badge derives from `remainingAttendeeCapacity` via `getLowCapacityCount` (threshold `< 12` per §6.2, exported as `LOW_CAPACITY_THRESHOLD`). `bookings_enabled === false` / no-URL disabled states are handled inside `EventBookingButton` (unchanged).
- **Free / price:** `isEventFree(event)` → "Free entry"; otherwise formatted `offers.price`.
- **Dates/times:** `formatEventLocalDate` / `formatEventLocalTime` (`lib/event-calendar.ts`); relative-day boundary computed in Europe/London via `getEventLocalIsoDate` + `nowInLondonComponents` (`lib/time-london.ts`).
- **Image fallback:** `getEventImage` falls back to `DEFAULT_EVENT_IMAGE` (`lib/image-fallbacks.ts`).
- **Category chip:** tinted `{category.color}1f` bg + category-colour text (inline style — colour is dynamic data, not a Tailwind class), with a static Lucide icon map (no dynamic class construction). Falls back to `PartyPopper`.

## PromoCtas (§6.3) — status: ALREADY DONE, no change needed

Phase 2.2 already implemented the §6.3 pill in `components/layout/Navigation.tsx` (`renderPromoCta`, line ~360):
- Strip (inline) + drawer (`block`) variants.
- Styling matches §6.3: `bg-anchor-gold ... text-white`, Outfit 600 `text-sm`, `px-4 py-1.5`, hover `-translate-y-0.5 hover:bg-anchor-gold-dark`, drawer `min-h-[44px] w-full`.
- Scheduling mechanism untouched: `promoCtaButtons` in `app/layout.tsx` (`startsOn`/`endsOn`/`leadDays`), London-time filtering via `nowInLondon`/`parseLondonDate`.

No standalone `PromoCtas` component was needed or created. I left the mechanism and styling alone.

## Verification

- `npx tsc --noEmit` → **clean, 0 errors** project-wide (my files included). No sibling `WeekHours.tsx` errors observed.
- Old-token audit on the four new files (`anchor-bg*`, `gold-light/vivid`, `warm-white`, `text-on-*`, `shadow-luxury*`, `font-serif/merriweather`, `section-spacing`, `card-dark/warm`, `inner-frame`, `btn-friendly`, `font-bold`) → **0 hits**.
- Semantic tokens used throughout (`text-ink-strong`, `text-ink-muted`, `text-accent-text`, `border-line`, `text-h3/h4`, `font-display`). `gap-6` = 1.5rem = spec `--space-5`.
- Labels confirmed sourced from `getEventBookingCopy` via `EventBookingButton` — no string drift.

## For Phase 4 (home / what's-on) to consume

- Import from direct paths: `@/components/events/UpcomingEvents`, `.../FeaturedEvent`, `.../EventListItem`.
- `UpcomingEvents` is **presentational** — fetch server-side via the existing `/api/events` proxy (`limit=3`, hourly revalidate) and pass `events` (and an `emptyState` node) as props. It does NOT fetch.
- Booking buttons already wrap (`whitespace-normal`) and go full-width `<640px` (`max-[640px]:w-full` on list items; FeaturedEvent actions stack full-width `<sm`).
- These components do not render JSON-LD/EventSchema (the legacy `components/UpcomingEvents.tsx` did). Phase 4 should keep emitting event schema separately where required (e.g. via `EventSchema`) so SEO is not lost when swapping in the new layout.
