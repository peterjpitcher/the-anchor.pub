# Events Pages — Wave 1 Handoff

## Status: Complete

## Task 1: Meta Rewrites — DONE

All 5 event pages updated with exact recommended titles and descriptions:

| Page | Title | Description |
|------|-------|-------------|
| `/whats-on` | "Quiz, Karaoke & Bingo Every Week \| The Anchor Pub" | Updated |
| `/karaoke` | "Karaoke Fridays Near Heathrow \| Free Entry \| The Anchor" | Updated |
| `/quiz-night` | "Pub Quiz Near Heathrow \| £3 Entry, Cash Prizes \| The Anchor" | Updated |
| `/music-bingo` | "Music Bingo Near Heathrow \| Win Every Round \| The Anchor" | Updated |
| `/live-sport` | "Watch Live Sport Near Heathrow \| Big Screens \| The Anchor" | Updated |

Note: `/live-music` was not in the meta rewrite spec — metadata left unchanged.

OpenGraph and Twitter card titles/descriptions on quiz-night were also updated to match.

## Task 2: Quiz Night Date Prefill — DONE

The booking page (`app/book-table/page.tsx`) **does** support `date` via searchParams (confirmed: `searchParams.date` is read and passed to the booking form).

Implementation: Added `bookingHref` variable in `QuizNightPage` that extracts `YYYY-MM-DD` from `nextEvent.startDate.slice(0, 10)` and passes it as `customHref` to the hero `BookTableButton`. Falls back to `/book-table` if no upcoming event exists.

File modified: `app/quiz-night/page.tsx`

## Task 3: /whats-on Per-Event Booking Links — BLOCKED (by design)

The `/whats-on` page renders upcoming events via the `FilteredUpcomingEvents` / `FilteredUpcomingEventsClient` shared component. Adding per-event booking links (`/book-table?date=YYYY-MM-DD`) to these cards would require modifying the shared client component, which is out of scope for this agent's ownership.

The monthly highlights cards already link to event detail pages (`/events/{slug}`) or category pages (e.g., `/music-bingo`), which contain their own booking CTAs.

**Recommendation for follow-up:** Modify `FilteredUpcomingEventsClient` to add a "Reserve a Table" link on future-dated event cards, linking to `/book-table?date={ISO_DATE}`.

## Task 4: EventSeries Schema on /live-music — DONE

Added `liveMusicEventSeries` export to `lib/schema.ts` (following the same pattern as `quizNightEventSeries` and `bingoEventSeries`).

Injected the schema as a `<script type="application/ld+json">` block at the top of the `LiveMusicPage` return statement in `app/live-music/page.tsx`.

Files modified:
- `lib/schema.ts` — new `liveMusicEventSeries` export
- `app/live-music/page.tsx` — added imports (`liveMusicEventSeries`, `jsonLdSafeStringify`) and schema injection

## Files Modified

- `app/whats-on/page.tsx`
- `app/karaoke/page.tsx`
- `app/quiz-night/page.tsx`
- `app/music-bingo/page.tsx`
- `app/live-sport/page.tsx`
- `app/live-music/page.tsx`
- `lib/schema.ts`

## Self-Check

- [x] All 5 event page meta titles updated to exact recommended text
- [x] All 5 event page meta descriptions updated
- [x] Quiz-night booking date prefill implemented (hero BookTableButton uses `customHref=/book-table?date=YYYY-MM-DD`)
- [x] /whats-on booking links documented as blocked (shared component scope)
- [x] EventSeries schema added to /live-music
- [x] TypeScript: no new type errors in modified files
