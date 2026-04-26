# Smart Hero — Design Spec

**Date:** 2026-04-26
**Status:** Approved
**Scope:** HeroWrapper enhancement — smart CTAs + context strip across all 109 pages

---

## Problem

The current hero sections are inconsistent — some pages have 5+ buttons, tag pills, trust bars, and secondary info; others have almost nothing. CTAs are static and generic ("Book a Table") regardless of time, day, or what's happening at the pub. This means the hero doesn't convert because it's not relevant to the visitor's moment.

## Solution

Add two new client components to HeroWrapper that make every hero time-aware, event-aware, and hours-aware using data already available from the management API.

### Three Layers

Every hero gets exactly three layers:

1. **Static Content** — title, description, breadcrumbs, image. Page-specific, server-rendered. No changes from today. This is the SEO layer.
2. **Smart CTAs** — primary + secondary buttons whose text and destination adapt based on live context (time, events, special hours). Position stays fixed; only label and link change.
3. **Context Strip** — compact bar at the bottom of every hero showing live status. Up to 3 slots separated by dots.

### Consistency Rules

**Always present on every hero:**
- Title (page-specific)
- One-line description
- 1 primary CTA (smart or page override)
- 1 secondary CTA (smart or page override)
- Context strip (up to 3 slots)
- Breadcrumbs

**Removed / not allowed:**
- Tag pills (e.g. "Music Bingo (Nikki)", "Quiz Night £3")
- Secondary info pills (e.g. "Free parking · 20 spaces", "7 min from Heathrow T5")
- More than 2 CTA buttons in the hero
- Extra button rows (Pizza Menu, Sunday Roast Info, Book Private Event)
- TrustBar component below the hero
- `secondaryInfo` prop content

---

## Smart CTA Logic

Priority cascade — highest-priority matching rule wins. Evaluated at render time using live API data.

| Priority | Condition | Primary CTA | Secondary CTA |
|----------|-----------|-------------|---------------|
| 1 | Event happening today | "Book [Event Name] Tonight" → event page | "Call Us" → tel:01753682707 |
| 2 | Sunday + Sunday lunch available | "Book Sunday Lunch" → booking wizard | "View Menu" → /sunday-lunch |
| 3 | Kitchen currently open | "Book a Table" → booking wizard | "View Menu" → /food-menu |
| 4 | Bar open, kitchen closed | "Come for Drinks" → /drinks | "Call Us" → tel:01753682707 |
| 5 | Currently closed | "Book a Table" → booking wizard | "View What's On" → /whats-on |
| 6 | Page has CTA override | Page-specific CTA takes priority | Page-specific secondary |

**Override mechanism:** Pages can opt out of smart CTAs by passing explicit `primaryCta` / `secondaryCta` props to HeroWrapper, as they do today. The smart logic is the default fallback, not a mandate. Pages like /private-hire that need "Enquire Now" keep their own CTAs.

**Initial render:** Show generic CTAs server-side ("Book a Table" / "Call Us"). SmartCTAs hydrates on the client and swaps in the contextual version. No layout shift — button size and position stay the same, only text and href change.

---

## Context Strip

A compact, full-width bar at the bottom of the hero image overlay. Up to 3 information slots.

### Slot Layout

| Slot | Content | Colour |
|------|---------|--------|
| 1 — Status | Open/closed + bar hours (e.g. "Open now · Bar until 10pm") | Gold when open, red when closed |
| 2 — Kitchen | Kitchen hours or "Kitchen closed" | Default text, red if closed |
| 3 — Event/promo | Tonight's event, next upcoming event, or special hours note | Default text, gold for event name |

If there is no event and no special note, slot 3 drops and only 2 slots display.

### Example States

**Tuesday evening, kitchen open, no event:**
> Open now · Bar until 10pm · Kitchen open until 9pm

**Monday evening, kitchen closed:**
> Open now · Bar until 10pm · Kitchen closed today

**Friday with Music Bingo tonight:**
> Open now · Bar until 10pm · Kitchen open until 9pm · Music Bingo tonight at 8pm

**Currently closed, quiz night this week:**
> Closed now · Opens 4pm today · Quiz Night this Wednesday

**Bank holiday with special hours note:**
> Bank Holiday hours today · Bar 12pm–10pm · Kitchen 12pm–7pm

### Behaviour
- Auto-refreshes every 5 minutes (pub status can change through the evening)
- Shares API fetch with SmartCTAs (single request, not two)
- Text-only, no icons or emojis in production (the mockups used emojis for clarity)
- Adapts to mobile: wraps to multiple lines, slightly smaller text

---

## Architecture

### New Components

**`components/hero/SmartCTAs.tsx`** (client component)
- Receives optional page-override CTAs as props
- Fetches `/api/business/hours` on mount (shared with ContextStrip via context or prop drilling)
- Receives today's events from props (server-fetched and passed down)
- Runs priority cascade to determine CTA text and href
- If page override props are provided, uses those instead
- Renders 2 Button components (primary + secondary)

**`components/hero/ContextStrip.tsx`** (client component)
- Receives same API data as SmartCTAs
- Parses current status (open/closed, bar hours, kitchen hours)
- Checks for today's event or next upcoming event
- Checks for special hours notes
- Renders compact bar with up to 3 text slots
- Sets up 5-minute refresh interval

**`components/hero/useHeroContext.ts`** (custom hook)
- Single fetch to `/api/business/hours`
- Merges with events data passed as props
- Computes: isOpen, barHours, kitchenStatus, todayEvent, nextEvent, specialNote
- Returns computed state consumed by both SmartCTAs and ContextStrip
- Handles loading state (returns null/defaults while fetching)

### Changes to Existing Components

**`components/hero/HeroWrapper.tsx`**
- Add optional `todayEvents` prop (server-fetched, passed from page)
- Add optional `ctaOverrides` prop to replace current `primaryCta`/`secondaryCta` pattern
- Remove `tags` prop rendering
- Remove `secondaryInfo` prop rendering
- Render `<ContextStrip>` at bottom of hero overlay
- Render `<SmartCTAs>` in place of current CTA slot
- Keep all existing image, title, description, breadcrumb logic unchanged

**Page files (all 109)**
- Remove `tags` arrays
- Remove `secondaryInfo` JSX blocks
- Remove multi-button `secondaryCta` blocks
- Pages that want default smart CTAs simply remove their CTA props
- Pages that keep CTA overrides (known list):
  - `/private-hire` and subpages — "Enquire Now" → enquiry form
  - `/book-table` — "Book Now" → booking wizard (always, regardless of context)
  - `/events/[id]` — event-specific booking CTA
  - Any other page with a unique conversion goal gets reviewed during Phase 2

### Data Flow

```
Page (server component)
  ├── Fetches events via getUpcomingEvents(3) — passes as todayEvents prop
  └── <HeroWrapper todayEvents={events} route="/whats-on" title="..." ...>
        ├── Image + overlay (server, unchanged)
        ├── Title + description + breadcrumbs (server, unchanged)
        ├── <SmartCTAs todayEvents={events} overrides={pageCtaOverrides} />
        │     └── useHeroContext() → fetches /api/business/hours client-side
        │         → merges with todayEvents
        │         → runs priority cascade
        │         → renders 2 buttons
        └── <ContextStrip todayEvents={events} />
              └── useHeroContext() (shared) → renders 3-slot bar
```

### API Usage

No new API endpoints needed. Uses existing:
- `GET /api/business/hours` — already called by the status bar, well-cached
- Events data passed from server via props (pages already fetch this)

### Performance Considerations

- SmartCTAs and ContextStrip are client components but render inside a server-rendered hero
- Initial server render shows fallback CTAs ("Book a Table" / "Call Us") — no blank state
- Client hydration swaps in smart CTAs — button dimensions stay the same, no layout shift
- Single API call shared between both components via custom hook
- 5-minute refresh is lightweight (the endpoint is already optimised for frequent calls)

---

## Migration Plan

### Phase 1: Build the components
- Create `useHeroContext`, `SmartCTAs`, `ContextStrip`
- Integrate into `HeroWrapper` behind a feature flag or opt-in prop
- Test on homepage and /whats-on

### Phase 2: Clean up all pages
- Remove `tags`, `secondaryInfo`, excess CTA buttons from all 109 pages
- Pages with legitimate CTA overrides (e.g. /private-hire) keep their props
- Remove TrustBar usage from pages where it sits below the hero

### Phase 3: Polish
- Tune the priority cascade based on real usage
- Adjust context strip copy
- Verify mobile responsiveness across all hero sizes

---

## Out of Scope

- Weather-based messaging
- Real-time table availability counts
- Seasonal promotions system
- Beer garden status
- A/B testing infrastructure
- Changes to hero images or image selection logic
