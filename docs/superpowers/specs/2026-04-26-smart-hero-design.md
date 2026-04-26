# Smart Hero — Design Spec (v4)

**Date:** 2026-04-26
**Status:** Draft — pending review
**Scope:** Hero context system — smart CTAs + context strip, opt-in rollout

---

## Problem

The current hero sections are inconsistent — some pages have 5+ buttons, tag pills, trust bars, and secondary info; others have almost nothing. CTAs are static and generic ("Book a Table") regardless of time, day, or what's happening at the pub. This means the hero doesn't convert because it's not relevant to the visitor's moment.

## Solution

Add two new client components to HeroWrapper that make heroes time-aware, event-aware, and hours-aware using data already available from the management API. Both features are explicitly opt-in per page. Roll out on key pages first, then classify remaining pages by conversion goal before migrating.

### Three Layers

Every hero has three potential layers:

1. **Static Content** — title, description, breadcrumbs, image. Page-specific, server-rendered. No changes from today. This is the SEO layer.
2. **Smart CTAs** — primary + secondary buttons whose text and destination adapt based on live context. Requires `enableSmartCtas={true}` AND no page CTA overrides.
3. **Context Strip** — compact bar pinned to the bottom of the hero showing live status. Requires `showContextStrip={true}`.

---

## Smart CTA Logic

### Opt-In and Override Rules

Smart CTAs require TWO conditions to activate:

1. `enableSmartCtas={true}` must be passed to HeroWrapper (default: `false`)
2. None of `primaryCta`, `secondaryCta`, or `cta` props are provided

If ANY of those three CTA props exist, or if `enableSmartCtas` is false/absent, the hero renders exactly as it does today. This is all-or-nothing — no partial override.

Pages that use specialised CTA components (`BookTableButton`, `PhoneButton`, `EventBookingButton`) or the advanced `cta` prop keep their existing tracking, analytics, and booking-specific behaviour untouched.

### Smart Cascade

When both opt-in conditions are met, the cascade resolves what to show. Evaluated client-side using `useBusinessHoursContext()` from the existing `BusinessHoursProvider`.

| Priority | Condition | Primary CTA | Secondary CTA |
|----------|-----------|-------------|---------------|
| 1 | Active event today (started but not ended, or starting later today) | "Book [Event Name]" → event page | "Call Us" → tel:01753682707 |
| 2 | Sunday + Sunday lunch available (before cutoff, per existing logic) + bookings accepting | "Book Sunday Lunch" → booking wizard | "View Menu" → /sunday-lunch |
| 3 | Kitchen open + bookings accepting | "Book a Table" → booking wizard | "View Menu" → /food-menu |
| 4 | Kitchen open + bookings NOT accepting | "Call to Book" → tel:01753682707 | "View Menu" → /food-menu |
| 5 | Bar open, kitchen closed + bookings accepting | "Book a Table" → booking wizard | "View Drinks" → /drinks |
| 6 | Bar open, kitchen closed + bookings NOT accepting | "Call Us" → tel:01753682707 | "View Drinks" → /drinks |
| 7 | Currently closed + bookings accepting | "Book a Table" → booking wizard | "View What's On" → /whats-on |
| 8 | Currently closed + bookings NOT accepting | "Call to Book" → tel:01753682707 | "View What's On" → /whats-on |

**Event priority does NOT check bookings accepting.** The event CTA links to the event page, which handles its own booking availability (including "no booking required" events). Suppressing event CTAs because table bookings are disabled would hide walk-in events.

**`bookingsAccepting` resolution:** `currentStatus.services?.bookings?.accepting`. If `services` or `bookings` is absent/undefined, default to `true` (accepting). Rationale: the booking wizard handles unavailability gracefully, so false negatives are worse than false positives.

### CTA Action Model

The resolver returns a discriminated action, not just labels and hrefs.

```typescript
type HeroCtaAction =
  | { kind: 'booking'; label: string; source: string }
  | { kind: 'phone'; label: string; phone: string; source: string }
  | { kind: 'event-link'; label: string; href: string; source: string }
  | { kind: 'link'; label: string; href: string; source: string }
```

**Rendering per kind:**
- `booking` → `<BookTableButton>` (imperative navigation + GTM tracking)
- `phone` → `<PhoneButton>` (tel link + GTM tracking)
- `event-link` → `<Button asChild><Link>` to event page with explicit `trackCTAClick()` call (event page handles its own booking flow)
- `link` → `<Button asChild><Link>` with explicit `trackCTAClick()` call

**Tracking source:** Normalised slug format — route with `/` replaced by `_`, leading slash stripped: `smart_hero_food_menu`, `smart_hero_home`, `smart_hero_whats_on`. Dynamic segments normalised: `smart_hero_events_detail`.

### Event Detection

Uses existing `getEventDateRangeUtc()` from `lib/event-calendar.ts` — no new date/duration parsing.

**`getTodaysActiveEvents(events, now)`** utility:
- Filters events where the date is today (London timezone) AND `end > now` (using `getEventDateRangeUtc()` which handles endDate, duration, and default fallback)
- Returns events sorted by start time
- The cascade uses the first result (earliest active/upcoming event today)

**CTA label logic** (time-aware):
- Event hasn't started yet and starts today after 5pm → "Book [Name] Tonight"
- Event hasn't started yet and starts today before 5pm → "Book [Name] Today"
- Event is currently in progress → "[Name] On Now"
- Event name truncated at 20 characters with ellipsis

### Sunday Lunch Logic

The existing Sunday lunch availability logic in `lib/booking-helpers.ts` is tightly coupled to the 30-day availability fetcher — it fetches API data and caches internally. `resolveHeroContext()` must stay pure.

**Approach:** Extract a pure predicate from the existing pattern:

```typescript
// New pure function in lib/hero-context.ts
function isSundayLunchAvailableNow(
  businessHours: BusinessHours,
  now: Date
): boolean
```

This checks:
- Is it Sunday (London timezone)?
- Does `serviceStatus.sunday_lunch?.isEnabled` say enabled?
- Do `serviceOverrides.sunday_lunch` entries override for today?
- Does today's effective `schedule_config` include a `sunday_lunch` entry?
- Is `now` before the last `sunday_lunch` slot's `ends_at`?

All inputs come from the `BusinessHours` object already in the provider. No fetch. Mirrors the logic in `booking-helpers.ts` but operates on pre-fetched data.

### CTA Label Constraints

- Maximum label length: 30 characters
- Event names truncated at 20 characters with ellipsis
- Buttons use `min-w-[180px]` to maintain consistent width
- Mobile: buttons stack vertically at full width (existing pattern)

---

## Context Strip

A compact bar pinned to the bottom of the hero overlay. Up to 3 information slots. **Opt-in per page** via `showContextStrip={true}` on `HeroWrapper` (default: `false`).

### Slot Layout

| Slot | Content | Source | Colour |
|------|---------|--------|--------|
| 1 — Status | Open/closed + bar hours | `currentStatus.isOpen` for state. Effective schedule for display label ("until 10pm"). | Gold when open, red when closed |
| 2 — Kitchen | Kitchen hours or "Kitchen closed" | `currentStatus.kitchenOpen` for state. Effective schedule for display times. | Default text, red if closed |
| 3 — Event or Note | Active/upcoming event OR special hours note | `heroEvents` prop + `specialHours` | Default text, gold for event name |

### Display Time Labels

**Do NOT compute from `closesIn`.** The `closesIn` field is relative display text (e.g. "2 hours"), not a stable duration for arithmetic. Instead:

- Use effective schedule data (regular hours or special hours for today) to get absolute times ("10pm", "9pm")
- Trust `currentStatus.isOpen` / `currentStatus.kitchenOpen` for open/closed state
- This means: state comes from `currentStatus`, display labels come from schedule data
- Longer-term: add `closesAt` / `opensAt` to the management API for a cleaner solution

### Slot 3 Priority

When both a special hours note and an event exist for today:
- **Special hours note wins.** These are manual operator messages (e.g. "Sunday lunch menu changing — closed today") and take priority over automated event display.
- If no special note and no event today, check for next upcoming event this week (e.g. "Quiz Night this Wednesday")
- If nothing, slot 3 drops — only 2 slots display

### Example States

**Tuesday evening, kitchen open, no event:**
> Open now · Bar until 10pm · Kitchen open until 9pm

**Monday evening, kitchen closed:**
> Open now · Bar until 10pm · Kitchen closed today

**Friday with Music Bingo tonight (in progress):**
> Open now · Bar until 10pm · Music Bingo on now

**Currently closed, quiz night this week:**
> Closed · Opens 4pm today · Quiz Night this Wednesday

**Bank holiday with special hours note:**
> Bank Holiday hours today · Bar 12pm–10pm · Kitchen 12pm–7pm

### Behaviour
- No polling of its own — consumes `useBusinessHoursContext()` from existing `BusinessHoursProvider` which manages its own refresh cycle
- Text-only, no icons or emojis
- Mobile: wraps to multiple lines, `text-sm` instead of `text-base`

### Layout Integration

`HeroSectionServer` currently centres all content vertically. The context strip needs a dedicated bottom slot outside the centred content area.

**Changes to `HeroSectionServer`:**
- Add optional `bottomSlot` prop (ReactNode)
- Render `bottomSlot` AFTER the `flex-1` centred content div, still inside the `relative z-10` container
- Add `pb-14 sm:pb-16` to the hero section when `bottomSlot` is present (prevents strip from overlapping CTAs)
- Strip itself: `absolute bottom-0 left-0 right-0` with `bg-black/40 backdrop-blur-sm` for readability
- Z-index: strip at `z-20`, above the overlay but below modals
- Mobile: `px-4 py-2 text-sm`, desktop: `px-6 py-3 text-base`

---

## Events Prop

### Naming and Scope

The prop is named `heroEvents` (not `todayEvents`). It carries upcoming events with enough lookahead for the context strip to display "Quiz Night this Wednesday" — not just today's events.

**Expected data:** 3–5 upcoming events. Pages that already call `getUpcomingEvents()` pass the result. Pages that don't fetch events pass nothing — `heroEvents` is optional, defaults to `undefined`.

**When `heroEvents` is undefined:**
- Smart CTA cascade skips priority 1 (event today) — falls through to hours-based priorities
- Context strip slot 3 skips event display — shows special note or drops

### No Global Event Fetch

Events are NOT fetched globally. Only pages that already have events data pass it. No new server fetches added to any page in any phase. Phase 4 proposes adding a `todayEvent` field to the business hours API response as a future option.

---

## Page Classification

Before migrating any page beyond Phase 2, classify by conversion goal.

| Category | Example Pages | Smart CTAs? | Context Strip? | Notes |
|----------|---------------|-------------|----------------|-------|
| **Booking-focused** | /book-table, /sunday-lunch | No — keep existing CTAs (incl. `cta` prop) | Yes | Booking pages have specialised flows |
| **Event-focused** | /events/[id] | No — keep event-specific CTAs + tags | Yes | Tags show event metadata — NOT removed |
| **Event listing** | /whats-on | No — keep existing CTAs | Yes | CTA links to #upcoming-events |
| **Private hire** | /private-hire/*, /function-room-hire | No — keep "Enquire Now" | Yes | |
| **Parking** | /heathrow-parking, /parking-near-heathrow | No — keep parking CTAs + proof signals | Optional | Distance/pricing proof stays in hero |
| **Food/drink** | /food-menu, /drinks, /drinks/* | Yes | Yes | Push booking when kitchen open |
| **Local SEO** | /feltham-pub, /staines-pub, /pub-near-* | Yes | Yes | Discovery pages |
| **Informational** | /about, /find-us, /our-pub, /reviews | Yes | Yes | |
| **Legal/utility** | /privacy-policy, /safety-and-respect | No | No | No CTA needed |
| **Blog** | /blog, /blog/tag/[tag] | No | Optional | Content pages, not conversion |
| **Homepage** | / | Yes | Yes | Hours-aware only in Phase 2 (no events data) |

### Proof Signals

- **Context strip** absorbs "open now" status (replaces TrustBar function)
- **Page body** keeps proof points (free parking, distance, ratings)
- **Parking pages** keep proof in hero (exempted)
- **Event pages** keep tags with event metadata (exempted)
- Migration of proof signals per-page during Phase 3, not in bulk

---

## Architecture

### New Pure Functions

**`lib/hero-context.ts`**

```typescript
interface HeroContext {
  isOpen: boolean
  barClosesAt: string | null        // "10pm" — from effective schedule, NOT from closesIn
  kitchenOpen: boolean
  kitchenClosesAt: string | null    // "9pm" — from effective schedule
  bookingsAccepting: boolean        // defaults to true if services.bookings absent
  todayActiveEvent: Event | null    // first active/upcoming event today
  nextUpcomingEvent: Event | null   // next event this week
  specialNote: string | null        // from special hours note field
  sundayLunchAvailable: boolean     // pure check against BusinessHours data
}

// Pure function. All London timezone. No side effects, no fetches.
function resolveHeroContext(
  businessHours: BusinessHours | null,
  events: Event[] | null,
  now: Date
): HeroContext

// Pure function. Returns discriminated actions.
function resolveHeroCtas(
  context: HeroContext,
  route: string
): { primary: HeroCtaAction; secondary: HeroCtaAction }

// Pure function. Uses getEventDateRangeUtc() from lib/event-calendar.ts.
function getTodaysActiveEvents(
  events: Event[],
  now: Date
): Event[]

// Pure function. Mirrors booking-helpers.ts logic but operates on pre-fetched data.
function isSundayLunchAvailableNow(
  businessHours: BusinessHours,
  now: Date
): boolean
```

### New Client Components

**`components/hero/SmartCTAs.tsx`**
- Consumes `useBusinessHoursContext()` (reads existing provider context, does NOT fetch)
- Receives optional `heroEvents` prop
- Calls `resolveHeroCtas()` with context data
- Renders appropriate component per `HeroCtaAction.kind`:
  - `booking` → `BookTableButton`
  - `phone` → `PhoneButton`
  - `event-link` → `Button asChild` + `Link` + explicit tracking
  - `link` → `Button asChild` + `Link` + explicit tracking
- Only rendered when `enableSmartCtas={true}` AND no CTA override props exist

**`components/hero/ContextStrip.tsx`**
- Consumes `useBusinessHoursContext()` (same provider, no duplicate fetch)
- Receives optional `heroEvents` prop
- Calls `resolveHeroContext()` for display data
- Renders compact bar with up to 3 text slots
- No polling — relies on provider's existing refresh cycle

### Changes to Existing Components

**`components/hero/HeroSectionServer.tsx`**
- Add optional `bottomSlot` prop (ReactNode)
- When present: extra bottom padding, render slot after centred content, absolute bottom positioning

**`components/hero/HeroWrapper.tsx`**
- Add `enableSmartCtas` prop (default: `false`)
- Add `showContextStrip` prop (default: `false`)
- Add `heroEvents` prop (optional)
- Smart CTA activation: `enableSmartCtas === true && !primaryCta && !secondaryCta && !cta`
- Context strip activation: `showContextStrip === true`
- Keep ALL existing props (`tags`, `secondaryInfo`, `primaryCta`, `secondaryCta`, `cta`). Nothing removed from the interface.

### Data Sources

**Business hours:** Existing `BusinessHoursProvider` wraps the app at `app/layout.tsx:208`. Components consume via `useBusinessHoursContext()` which reads context without fetching. No new API calls, no new polling.

**Events:** NOT fetched globally. Only pages that already have events data pass it as `heroEvents`. No new server fetches.

### Testing (Jest + RTL)

**Unit tests (Jest):**
- `resolveHeroContext()`:
  - London timezone (BST/GMT transitions)
  - Event in progress (started, not ended)
  - Event ended today (should not match)
  - No end time (fallback from `getEventDateRangeUtc`)
  - Kitchen closed (Monday default)
  - Pub closed (before opening)
  - Sunday before cutoff (lunch available)
  - Sunday after cutoff (lunch not available)
  - Special hours note present
  - Bookings disabled (`services.bookings.accepting === false`)
  - Bookings absent (`services` undefined → default true)
  - Midnight rollover
  - No events data (null → cascade skips priority 1)
- `resolveHeroCtas()`:
  - All cascade priorities including booking-disabled variants
  - Label truncation at 20/30 chars
  - Time-aware labels ("Tonight" vs "Today" vs "On Now")
  - Source normalisation
- `getTodaysActiveEvents()` — event lifecycle states
- `isSundayLunchAvailableNow()` — service status, overrides, schedule config, cutoff

**Integration tests (RTL):**
- `HeroWrapper` with `primaryCta` override → SmartCTAs NOT rendered
- `HeroWrapper` with `cta` override → SmartCTAs NOT rendered
- `HeroWrapper` with `enableSmartCtas={false}` (default) and no CTA props → SmartCTAs NOT rendered
- `HeroWrapper` with `enableSmartCtas={true}` and no CTA props → SmartCTAs rendered
- `HeroWrapper` with `showContextStrip={false}` → no strip
- `HeroWrapper` with `showContextStrip={true}` → strip rendered
- No duplicate `useBusinessHours` fetch when provider present

---

## Migration Plan

### Phase 1: Build core (zero visual changes)
- Create pure functions with full test suite
- Create `SmartCTAs` and `ContextStrip` client components
- Add `bottomSlot` to `HeroSectionServer`
- Add `enableSmartCtas`, `showContextStrip`, `heroEvents` props to `HeroWrapper`
- Both default `false` — **no page files change, no visual changes anywhere**
- RTL integration tests confirm backward compatibility

### Phase 2: Opt-in on 5 key pages
- Enable `showContextStrip={true}` on: homepage, /whats-on, /food-menu, /drinks, /about
- Enable `enableSmartCtas={true}` on: /food-menu, /drinks, /about (remove their CTA props)
- Homepage and /whats-on keep existing CTAs but gain context strip only
- Remove `tags` and `secondaryInfo` from these 5 pages only
- Screenshot before/after, verify mobile, verify GTM tracking
- Move displaced proof signals to page body

### Phase 3: Classify and migrate remaining pages
- Review all 109 pages against classification table
- Migrate local SEO pages — add `enableSmartCtas={true}`, `showContextStrip={true}`, remove CTA props
- Migrate informational pages
- Skip legal/utility, blog, booking, event, private hire, parking pages per classification
- Per-page review of proof signal placement

### Phase 4: Global event awareness (optional, future)
- Add `todayEvent` summary field to management API business hours response
- `BusinessHoursProvider` exposes it automatically
- Smart CTAs and context strip become event-aware on all pages without per-page event fetches

---

## Out of Scope

- Weather-based messaging
- Real-time table availability counts
- Seasonal promotions system
- Beer garden status
- A/B testing infrastructure
- Changes to hero images or image selection logic
- Global events fetch across all pages (deferred to Phase 4)
- Removing tags/secondaryInfo from event or parking pages
- Changes to the `BusinessHoursProvider` refresh cycle
