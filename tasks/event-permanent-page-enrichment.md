# Scope: feed past-event evidence into the permanent event pages

**Status:** scoped, not started
**Created:** 2026-08-06
**Depends on:** `fix/event-ended-state` (steps 1 to 4) being live
**Complexity:** 3 (M). Four to six files, one new API call, no schema changes.

---

## Why

The permanent pages (`/music-bingo`, `/quiz-night`, `/cash-bingo`, `/karaoke`,
`/live-music`) are the layer meant to accumulate authority. They currently show
only upcoming dates and hand-written FAQs. Every month's proof that the night is
established and well attended is captured on the dated event page and then
thrown away when that page redirects at 30 days.

This is the one item in this workstream with lasting SEO upside. It is also the
reason not to build a per-event archive: the value is in consolidating the
evidence onto five permanent pages, not in maintaining hundreds of thin ones.

## What already exists

`Event` (see `lib/api/events.ts`) already carries the fields:

| Field | Line | Currently used |
|---|---|---|
| `previous_event_summary` | 137 | Dated event page sidebar only |
| `attendance_note` | 138 | Dated event page sidebar only |
| `highlights` | 37 | Both dated and permanent pages |
| `image` / `heroImageUrl` | - | Dated page hero, event cards |
| `performer` / `performer_name` | 122 | Dated page details list |
| `video` | 82 | Dated page |

So the data model needs nothing new. This is a display and aggregation job.

## API feasibility: resolved 2026-08-06

Checked against the live management API server-side. All good:

- **16 months of history available.** 58 past events, oldest 2025-03-28.
- **`category_id` filters past events fine.** One call with
  `category_id=<id>&from_date=2000-01-01` returned 6 past music bingo nights
  (Feb, Mar, Apr, May, Jun, Jul 2026). No management-app change needed for the
  fetch.
- **The public `/api/events` proxy returns upcoming events only.** Use the
  server-side `anchorAPI` client, as `app/sitemap.ts` does, not the proxy.
- **The list endpoint returns a lightweight projection.** `category`,
  `short_description`, `long_description`, `performer_name` and the hero image
  fields all come back null there even when set. `highlights` and `image` do
  come through. If the block needs anything beyond those, it needs a per-event
  detail fetch.

## Blocker: the source fields cannot be filled in

`previous_event_summary` and `attendance_note` **have no input anywhere in the
management app.** Verified 2026-08-06:

- The columns exist (added by
  `supabase/migrations/20260528000000_event_seo_keyword_engine.sql`, 28 May 2026).
- `src/services/events.ts` validates them (300 and 200 char limits).
- `src/app/actions/events.ts:321-322` would save them if the form posted them.
- `src/app/api/events/route.ts:188-189` serves them to this website.
- **Zero `.tsx` files reference either field.** No textarea, no label, nothing.
- **0 of 58 past events have either populated**, which follows.

The columns were created by the SEO keyword engine migration and the form input
was never built. So the question is not "will staff keep these filled in", it is
"someone has to build the field first", and that work is in
`OJ-AnchorManagementTools`, not here.

## What is actually populated on past events today

| Field | Populated |
|---|---|
| `highlights` | 46 / 58 |
| `image` | set on the sample checked |
| `image_alt_text` | 17 / 58 |
| `previous_event_summary` | 0 / 58 |
| `attendance_note` | 0 / 58 |
| `performer_name` | 0 / 58 (null in the list projection) |

This supports a **reduced version buildable today with no management-app
change**: poster, date and `highlights` from the last three nights in the
category. It is weaker evidence than a written recap, but it is real, it is
already there, and it needs no new staff habit.

## Proposed work

1. **`getPastEventsByCategory(categoryId, limit, withinDays)`** in
   `lib/api/events.ts`, mirroring the existing `getUpcomingEventsByCategory`.
   Must filter out drafts and retired events the same way.

2. **`<PreviousNights />`** component in `components/events/`. Renders, from the
   most recent past events in a category:
   - two or three square posters (event images are 1:1, never crop them)
   - `previous_event_summary` as a short quote-style line
   - `attendance_note` where present
   - the host or performer name where consistent across events

3. **Wire into the five permanent pages.** Place it below the upcoming-dates
   section and above the FAQs, so the page reads: what it is, when it is next,
   proof it is a going concern, questions.

4. **Empty state.** If there are no usable past events, render nothing. Do not
   render a heading with an empty body, and do not invent copy.

## Constraints

- **SSOT applies.** Any claim rendered here comes from the management DB. Do not
  write summary copy in the codebase. If `previous_event_summary` is empty, the
  block is empty. See `docs/SSOT.md`.
- **No review or rating markup.** Attendance evidence is body content, not
  structured data. Self-serving review schema is out.
- **Event images are square.** Use `aspect-square` containers.
- **Prices are live from the DB**, never hardcoded, if any price is shown.

## Two ways to sequence this

**Option A, ship the reduced version now.** Poster, date and `highlights` from
the last three nights in the category. No management-app change, no new staff
habit, works with today's data. Weaker than a written recap but real.

**Option B, build the management-app field first.** Add
`previous_event_summary` and `attendance_note` textareas to the event form in
`OJ-AnchorManagementTools`. The server action, validation and API already
handle them, so it is genuinely just the form input plus a place to put it.
Then this task renders the fuller block. Needs staff to write a line after each
event, so it only pays off if that becomes habit.

A and B compose: build A, and the component picks up recap text later if B ever
lands. Recommend A first.

## Explicitly out of scope

- A per-event archive with recaps and photo galleries on every dated event page.
  The site has roughly five live event URLs at any time; per-event archive
  content is ongoing cost against near-zero return at that scale.
- Keeping stale event pages live instead of redirecting them. Settled in
  `tasks/gsc-indexing-fix/url-lifecycle-policy.md` §1.
