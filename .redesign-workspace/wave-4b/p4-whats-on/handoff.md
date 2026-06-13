# Handoff — Phase 4, PR 4.3: What's On (`/whats-on`)

Branch: `codex/redesign-build`. Uncommitted, no build run.

## Files touched
- `app/whats-on/page.tsx` — full rebuild to spec §7.3 (5 sections).
- `app/whats-on/_components/RegularEventCard.tsx` — new page-local light event card for "The regulars".

## Sections built (spec §7.3, in order)
1. **InteriorHero** — crumb "What's On", kicker "What's on", title "Always something happening", lead (SSOT-safe: quiz/Music Bingo/cash bingo/karaoke/live music, 7 mins from T5, free parking, sentence case). Badges: "Free entry nights" · "Family friendly" · "Free parking". Actions: `Reserve an event table` (primary lg → `/book-table?source=whats_on_hero`) + `See the food menu` (outline lg → `/food-menu`). Both `fullWidth` for mobile.
2. **AmenityStrip** — default SSOT-confirmed items.
3. **Next up** (cream `bg-canvas`, `id="upcoming-events"`) — `SectionHeading` kicker "Next up", script "Don't miss it", title "This month's headline nights", lead. `<UpcomingEvents events={upcomingEvents} />` fed **live** from `getUpcomingEvents(24)`. Featured + 1-col/2-col list handled by the component (mobile stacks). Custom light `emptyState`. Wrapped in `SpeakableContent selector="events-list"` and an `id="events-list"` div (preserves the prior anchor + speakable target).
4. **The regulars** (white `bg-surface`) — `SectionHeading` kicker "The regulars", title "On every month", lead. 3-up `RegularEventCard` grid (`md:grid-cols-3`, mobile 1-col): uppercase gold cadence line (`text-accent-text`) · `font-display text-h4` title · muted meta · optional gold price + `Badge variant="sand"` tag. Whole card is a single `<Link>` (no nested links).
5. **CtaBand** — "Bringing a group?" + group-deposit copy (£10pp, deducted from bill — SSOT §7). `Book a table` (primary → `/book-table?source=whats_on_footer`) + `Private hire` (outline → `/private-hire`).

Internal-linking blocks (`InternalLinkingSection` + `OrganicSearchClusterLinks`) retained between The regulars and the CtaBand to preserve SEO internal links (A4).

## Source of "The regulars" data (O4 compliance)
Local `REGULAR_NIGHTS` array. **No prototype REGULAR_EVENTS fixtures used** (`pages2.jsx` is not in this repo). Every value is from the page's existing verified data / SSOT:
- **Music Bingo with Nikki Manfadge** — host name from existing page copy + `lib/schema.ts`. No price/time shown.
- **Quiz Night — £3 entry, cash prizes** — £3 confirmed in `lib/schema.ts` (`quizNightEventSeries`, `price: "3"`) and long-standing page copy.
- **Cash Prize Bingo — £10 a book, cash jackpot** — £10/book confirmed in `lib/schema.ts` (`bingoEventSeries`, `price: "10"`) and existing copy.

### Omitted as unverified (per O4)
- Exact start/door times, day-of-week for each regular.
- "50,000+ songs", "£3pp"-style per-person phrasings beyond the verified £3 entry / £10 a book.
- Karaoke / live music as fixed monthly regulars (kept only as hero copy, not as a regulars card with invented specifics).
- "From £16" prototype figure — not shipped.

## Events fetch + schema
- Fetch: `getUpcomingEvents(24)` (server-side, `.catch(() => [])`), passed straight into `<UpcomingEvents>`.
- Per-event JSON-LD: the prior listing emitted one `EventSchema` per event via `FilteredUpcomingEvents`. `UpcomingEvents` emits none, so the page now maps `upcomingEvents` → `<EventSchema event={event} />` directly, preserving per-event structured data.
- Preserved unchanged: `BreadcrumbJsonLd`, `SpeakableSchema`, the `CollectionPage` + `quizNightEventSeries` + `bingoEventSeries` + `EventVenue` JSON-LD block (with live `openingHoursSpecification`), and `ScrollDepthTracker` (GTM).
- Metadata + `alternates.canonical: '/whats-on'` preserved verbatim from the previous file.

## Notable changes vs old page
- Replaced legacy dark `FilteredUpcomingEvents` (filter chips, virtualization, venue notices, `card-dark`) with the design-system `UpcomingEvents` (light `FeaturedEvent` + `EventListItem`), per §7.3.3 / §6.2.
- Dropped legacy long-tail marketing sections not in §7.3 (Heathrow positioning, free daily games, special events, seasonal occasion links, recent-events archive, "Never miss an event" social block, the bespoke FAQ accordion, StaticHoursSummary/HeroBadge/PageTitle). Hours/FAQ live on dedicated pages and in JSON-LD; this matches the §7.3 5-section recipe. Internal-link SEO retained via the two linking blocks.

## Verification
- `npx tsc --noEmit` → **clean** (one transient `price`-on-union error during authoring was fixed by typing `REGULAR_NIGHTS` explicitly; no remaining errors in any file). No sibling errors observed.
- Old-token audit on `app/whats-on/page.tsx` + `_components/RegularEventCard.tsx` → **0** legacy colour tokens (`anchor-green-*`, `anchor-cream-text`, `anchor-gold-*`, `card-dark`, `rounded-none`). Phase-0 names used throughout (`bg-canvas`/`bg-surface`, `text-ink-strong`/`text-ink-muted`, `text-accent-text`, `border-line`, `Badge variant="sand"`).
- Em dashes in authored code/comments → **0** (the only `—` is inside the preserved original `metadata.description`, left untouched per A4).
- Phone 01753 682707 preserved (empty-state fallback).
- Not staged, not committed, no build run. `docs/architecture/*` untouched.

## Self-check
- [x] §7.3 sections present and in order.
- [x] UpcomingEvents fed live from the API.
- [x] Regulars from verified/existing data only; no prototype fixtures; no invented figures.
- [x] metadata / JSON-LD (collection, series, venue, per-event, breadcrumb, speakable) / GTM preserved.
- [x] no em dashes (authored); tsc clean for the touched files; no commit/build.
