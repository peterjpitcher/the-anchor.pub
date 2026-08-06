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

## Open question to resolve first

**How much event history does the management API actually return?**

`app/api/events/route.ts` (the public proxy) appears to return upcoming events
only: a local call with `from_date=2025-01-01` returned just the two upcoming
events. The server-side client does better, since `app/sitemap.ts` calls
`anchorAPI.getEvents({ from_date: '2000-01-01' })` and the live sitemap has
included past dates. What is not known is whether the API returns months of
history or only a short tail.

Check this before designing anything else. Roughly:

```
anchorAPI.getEvents({ from_date: '2025-01-01', status: 'scheduled', limit: 100 })
```

called server-side, then count how many results predate today. If the answer is
"only a few weeks", this task needs a management-app change first and should be
re-scoped.

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

## Dependency on staff behaviour

This only works if `previous_event_summary` and `attendance_note` are actually
filled in after each event in the management app. Today they are populated
inconsistently. Two options, in preference order:

1. Make them a prompt in the management app's post-event flow. Better, because
   the content then exists for both layers.
2. Accept partial coverage and let the block render from whatever exists.

If neither happens, this task produces an empty component and should not be
built.

## Explicitly out of scope

- A per-event archive with recaps and photo galleries on every dated event page.
  The site has roughly five live event URLs at any time; per-event archive
  content is ongoing cost against near-zero return at that scale.
- Keeping stale event pages live instead of redirecting them. Settled in
  `tasks/gsc-indexing-fix/url-lifecycle-policy.md` §1.
