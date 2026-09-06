# Spec: event detail and event category pages

Date: 6 September 2026
Status: decisions taken 6 September 2026 (section 3). Wave 1 built locally and unverified (section 16); everything else is unstarted.
Scope: `app/events/[id]` (event detail) and `/quiz-night`, `/cash-bingo`, `/music-bingo`, `/karaoke`, `/whats-on` (category and hub pages).
Discovery was read-only. Wave 1 has since been written to branch `fix/event-pages-wave-1`: uncommitted, unpushed, not deployed, and no live booking, SMS or payment was ever made.

---

## 1. What this spec is for

Two jobs, in the owner's words: drive as many people as possible to these pages, and make the pages convert to a booking.

They are separate problems with separate evidence, and this spec treats them separately. Sections 7 to 9 are conversion. Sections 10 and 11 are demand. Section 12 is how we will know. Section 16 records what has already been built.

## 2. One honest caveat before the work

The measured collapse in event attendance was not caused by these pages.

| Measure | With SMS nudge | Without | Source |
|---|---|---|---|
| Average seats per event | 49.4 (Jun to Sep 2025) | 13.2 (Jun to Sep 2026) | `tasks/event-attendance-recovery-plan-2026-08-08.md` §1 |
| Average bookings per event | 29.1 (Jun to Dec 2025) | 4.4 (Jan to Aug 2026) | same |

The SMS non-booker nudge was deleted on 17 January 2026 in commit `113e8d2b`. Over the same period Meta spent £318 for 4 attributed bookings (`tasks/event-ads-conversion-discovery-2026-08-08.md` §1).

So: this page work is worth doing, and everything below stands on its own evidence. But on its own it is the smaller of two channels.

**Answered on 6 September 2026:** the owner confirmed the nudge will be rebuilt if needed. That work sits in `OJ-AnchorManagementTools` and nothing in this spec depends on it. The caveat is recorded rather than removed, because it is the reason to read the success criteria in section 12 as absolute counts against a near-zero baseline rather than as a percentage lift this spec can claim.

## 3. Decisions taken, 6 September 2026

Owner answers to the six questions this spec opened with. Each one closes a ticket that was blocked.

| # | Question | Owner answer | What it unblocks |
|---|---|---|---|
| 1 | Suppress the Christmas lightbox on `/events/*` and `/whats-on`? | Agreed | EV-000 moves from owner decision to approved |
| 2 | Remove the sell-out claim on `/music-bingo`, or record it as true? | Agreed, remove | EV-008 resolved. The claim is now banned in `docs/SSOT.md` §10 |
| 3 | Artwork for the 10 events with none? | Owner is producing it | EV-007(b) is owner-run. EV-007(a), the website category fallback, still needed |
| 4 | Is the SMS non-booker nudge being rebuilt? | "Yes, rebuild if needed" | The §2 caveat is answered. Work belongs in `OJ-AnchorManagementTools`, not here |
| 5 | Link `/karaoke` from `/whats-on` with honest cadence? | Yes | EV-019 approved |
| 6 | Which capacity is right? | Quiz night, cash bingo and music bingo are all **60**. Party nights such as the Halloween party are **150**. Tasting nights are **25**. | §14 resolved, and the SSOT is corrected |

The live event records agree with answer 6 exactly: every quiz, cash bingo and music bingo record carries `maximumAttendeeCapacity: 60`, the 31 October Halloween party carries 150, and the 20 November tasting night carries 25. Checked against `GET /api/events?limit=50` on 6 September 2026.

**One capacity was not owner-stated.** Karaoke. Its record carries 60 while `docs/SSOT.md` said 50. Corrected to 60 on the authority of §8, which says the management app holds the only true capacities, and flagged in the document as needing confirmation at the next review rather than presented as an owner decision.

**On answer 4.** The rebuild is a management-app change, in the paired repository, and nothing in this spec depends on it. It is recorded here so the §2 caveat is not left hanging: the bigger lever is being addressed separately, which makes this page work worth doing rather than a substitute for it.

**On capacities, standing instruction added 6 September 2026.** Capacities are always pulled from the management app. They must be consistent between events of the same category; if they are not, that is a data fault to raise with the owner rather than a number to choose between. Checked across all 15 upcoming events on 6 September: every category is internally consistent, so no input was needed.

### 3.1 The independent developer review, and what it changed

A separate developer review was commissioned and delivered on 6 September 2026 (`OJ-AnchorManagementTools/outputs/event-spec-review-2026-09-06/developer-review.md`, 31 findings, R01 to R31). Its verdict was that the small fixes are deliverable but the broader programme was **not implementation-ready** until its state, data, approval and operating contracts were settled.

I did not accept it on trust. Every factual claim it made was re-checked against the code. **Five of my own claims were wrong and are corrected in this document.** They are marked "Corrected after review" at the ticket.

| What I claimed | What is actually true | Ticket |
|---|---|---|
| The events hub can be a day out of date | The 300s fetch already drives the route's revalidation, so there is no 24-hour staleness. `lib/api/client.ts:660-667` | EV-002, downgraded to tidying |
| `doorTime` is emitted as literal `null` | It is **absent**. I misread Python's `.get()` returning `None` for a missing key | EV-005, half withdrawn |
| The live seat count is computed and thrown away | True on the detail page only. `GameNightBooking.tsx:17` already renders it on all four category pages at a threshold of 20 | EV-012, narrowed to "extend" |
| The booking success state is a dead end | It already renders **Manage Booking** and the PayPal payment path | EV-013, narrowed |
| `/whats-on` hardcodes an absolute canonical | It uses `canonical: '/whats-on'`, a relative path. A convention deviation, not the homepage-canonical bug | EV-024, downgraded |

Two further corrections the review forced, neither of which was a wrong fact but both of which would have produced broken work:

- **EV-003 would have shipped a passing test and a broken feature.** `getUpcomingEventsByCategory` already swallows failures into `[]` at `lib/api/events.ts:847-849`. A page-level fix with a page-level test would prove nothing about a real outage. The ticket now requires the failure to be injected beneath the API helper.
- **The section 17 acceptance rule would have broken booking recovery.** "No `management.orangejelly.co.uk` in any rendered output" would have deleted the customer's own Manage Booking and payment links. The rule is now scoped to JSON-LD and metadata.

One legal overstatement corrected: CMA banned practice 7 concerns falsely claiming **limited-time** availability. It is neither a blanket ban on static availability lines nor a guarantee that a database-fed number is lawful. The requirement is truthful description of bookable inventory. See EV-012.

What the review added that was missing entirely: the event state matrix, the capacity precedence contract, the booking outcome matrix, a concrete Turnstile recovery policy, monitoring ownership, release and rollback, and test isolation strong enough to keep a verification run from creating a real booking. Those are now sections 7, 17 and 20.

---

## 4. Evidence, and where it runs out

Every number below names its file. Nothing here is estimated.

### Traffic

| URL | Clicks | Impressions | CTR | Avg position | Period | Source |
|---|---:|---:|---:|---:|---|---|
| `/karaoke` | 17 | 662 | 2.57% | 11.84 | 1 May to 24 Aug 2026 | `docs/evidence/gsc-baseline-2026-09-01/destination-hubs--Pages.csv` |
| `/cash-bingo` | 6 | 324 | 1.85% | 9.58 | same | same |
| `/quiz-night` | 3 | 400 | 0.75% | 11.45 | same | same |
| 18 retired event pages | 0 | 3 | - | - | same | `retired-event-pages--Chart.csv` |
| All four game pages | 124 clicks in 16 months | | | | to 19 Aug 2026 | `tasks/email-signup-spec-2026-08-19.md:306` |

### Conversion

| Measure | Value | Period | Source |
|---|---|---|---|
| Completed event bookings | zero recorded | 5 Aug to 1 Sep 2026 | `tasks/growth-pressure-map-2026-09-02.md` |
| `event_booking_completed` in GA4 | 10 | 90 days to 10 Aug 2026 | `tasks/growth-plan-2026-08-10.md:20` |
| Completed table bookings, comparator | 41 rising to 48 | same 28-day comparison | `tasks/growth-pressure-map-2026-09-02.md` |
| Owner-reported attendance | 20 to 25 people | Aug 2026 | `tasks/event-attendance-recovery-plan-2026-08-08.md` |

### Limits of this evidence, stated plainly

- There is **no GSC data at all** for `/music-bingo`, `/whats-on`, `/quiz-night/themed` or any live `/events/*` page. The only baseline export filters to `heathrow-hotels-pub|quiz-night|cash-bingo|karaoke` (`destination-hubs--Filters.csv`).
- GSC holds nothing before 1 May 2026, so no year-on-year comparison exists until May 2027.
- GA4 sees roughly a third of real traffic after consent losses (`tasks/growth-plan-2026-08-10.md`).
- 36 custom event types never reach GA4 at all, because the published GTM container has no triggers for them and they are only delivered when dispatched with `sendToApi: true` through the Measurement Protocol.

Because of the first bullet, no ticket in this spec is justified by event-page GSC data. They are justified by code, by live output, or by documented practice.

---

## 5. Diagnosis

The pages are not badly built. They were rewritten around measured search demand on 17 August 2026 (`c9176f3d`), share a real template layer (`lib/game-nights/`, `components/features/GameNight/`), and the booking form was cut back to four typed fields today. The problems are narrower and more specific than "the pages need work":

1. **Capability already built, never surfaced.** Add-to-calendar, seat scarcity and the events feed all exist in code and are shown to nobody.
2. **Source data is missing, so the templates render empty slots.** Two thirds of the forthcoming programme has no artwork.
3. **Structured data publishes the wrong facts,** including an internal admin URL and, on some pages, the wrong performer.
4. **A handful of small defects** each quietly send a visitor away from the thing they came to do, the worst of which drops a full-screen Christmas overlay across the booking button ten seconds after the page loads.
5. **One claim was repeated five times on a live page and could not be evidenced.** Resolved: the owner confirmed on 6 September that Music Bingo does not reliably sell out, and `docs/SSOT.md` now bans the claim outright.

**A sixth item, added after the developer review:** several of the things I called missing were in fact **present but incomplete**, and several of the things I called defects were **overstated**. Section 3.1 lists the five claims of mine that were wrong. The pattern is worth naming, because it changes how the work should be estimated: this is mostly a job of extending and constraining what already exists, not of building what is absent.

## 6. Scope

**In scope:** the event detail template, the four game category pages, `/whats-on`, the Event and category structured data, the metadata for those routes, and the measurement needed to tell whether any of it worked.

**Out of scope, and why.** These are prior decisions. Do not re-open them in implementation.

| Excluded | Reason | Source |
|---|---|---|
| Town-modified pages (`/karaoke-staines` etc.) | 24 town terms returned no search data at all | `tasks/keyword-plan-game-nights-2026-08-17.md` |
| Per-event archive with recaps and galleries | ~5 live event URLs at a time; ongoing cost against near-zero return | `tasks/event-permanent-page-enrichment.md` |
| Redirecting a past event page to the next date | Owner decision, 6 Aug 2026. Routing to the next date is an on-page link, never a redirect | `tasks/gsc-indexing-fix/url-lifecycle-policy.md` |
| Redirecting retired slugs to dated pages | Withdrawn; dated CMS slugs are unstable and degrade to 301-to-404 | `tasks/spec-2026-09-05-gsc-triage.md` §3 |
| A seated-or-standing choice in the form | Owner decision, 6 Sep 2026 | `docs/SSOT.md` §"Online event booking" |
| Guest names, food question, early-arrival box | Owner decisions, 6 Sep 2026, already removed | `tasks/lessons.md` |
| Recurring EventSeries schema for karaoke | Owner-confirmed, 11 Aug 2026 | `docs/SSOT.md:473` |
| Review or rating markup on event proof blocks | Self-serving review schema is out | `tasks/event-permanent-page-enrichment.md` |
| Exit-intent or scroll pop-up on event pages | Would cannibalise the more valuable conversion | `tasks/email-signup-spec-2026-08-19.md` |
| Live music and drag cabaret keywords or content | Both formats discontinued | `docs/SSOT.md:460`, `:507` |

---

## 7. Contracts every ticket must honour

Added after the developer review, which correctly found that the tickets described upcoming, bookable, happy-path events and left the rest undefined. These contracts bind every ticket in sections 8 to 11.

### 7.1 Event state matrix

`lib/event-presentation.ts:63` is already the single source of truth for how an event page renders, and its own header comment says any new booking surface must read its flag from there rather than recomputing "is this event over" locally. Before it existed, an ended event still rendered a booking policy card, booking FAQs and a "Ready to book" band while the JSON-LD advertised it as `InStock`.

**So every new surface in this spec adds a flag to `EventPresentation`. None of them may test the date or status inline.**

| Surface | Upcoming, bookable | Upcoming, blocked or past cutoff | Sold out | Cancelled | Ended |
|---|---|---|---|---|---|
| Booking form | yes | no, phone instead | no, waitlist | no | no |
| Booking policy and FAQs | yes | yes, may still book by phone | yes | no | no |
| Primary CTA and closing band | yes | phone | waitlist | no | "next one" link |
| Scarcity count (EV-012) | yes, per 7.2 | no | sold-out state | no | no |
| Add to calendar (EV-011) | yes | yes | no | **no** | **no** |
| Share (EV-014) | yes | yes | yes | no | no |
| Schema `offers` | yes | yes | `SoldOut` availability | omit | omit |
| Schema `eventStatus` | `EventScheduled` | `EventScheduled` | `EventScheduled` | `EventCancelled` | unchanged, keep `startDate` |
| Indexing | index | index | index | index 7 days, then noindex | index, never redirect |

Existing owner decisions this preserves: a past event page stays live, stays indexed and is never redirected to the next date; routing to the next date is an on-page link only. Google's own guidance is that when the event status changes you must **not** remove `startDate`.

`postponed` and `rescheduled` are already normalised by `lib/event-lifecycle.ts:18` but are not distinguished by `getEventPhase`, which returns `upcoming` for both. **Resolve their treatment explicitly before any ticket that renders them is accepted.** Do not leave it to fall through.

### 7.2 Capacity and scarcity

Full contract in EV-012. The rule that binds everything else: **capacities and remaining counts always come from the management app**, never computed locally, never inferred, never hardcoded in page code. Verified consistent within every category on 6 September 2026.

### 7.3 Read failures

Full contract in EV-003. The rule: the API helper layer must preserve the difference between loaded-and-empty, not-found, unavailable and partial. A page-level catch cannot see a failure the helper already swallowed.

### 7.4 Booking outcomes

The form already has multiple result states. This spec must not collapse them. Each maps to exact UI, retry and analytics behaviour, and post-confirmation content appears only after authoritative confirmation.

| Outcome | UI | Retry | Post-confirmation content |
|---|---|---|---|
| `confirmed`, free or pay on the night | green confirmation, Manage Booking | none | yes |
| `confirmed`, paid | confirmation plus receipt path | none | yes |
| `pending_payment` | hold notice, PayPal section, payment link | resume payment | **no** |
| `full_with_waitlist_option` | waitlist offer | join waitlist | no |
| `blocked` | red alert, reason, phone number | correct and resubmit | no |
| Capacity changed under the request | pause, retain input, show new availability, require a second explicit click | explicit re-submit | no |
| Duplicate submit | idempotency key collapses it to one booking | no second booking | unchanged |
| Response lost after a successful write | must not create a second booking | safe retry via the same idempotency key | unchanged |

The idempotency key is a SHA-256 of the logical payload and already distinguishes seated from standing preferences. Do not add a seated-or-standing choice: that is a settled owner decision.

### 7.5 Turnstile recovery

EV-016 originally said "after a reasonable interval", which is not implementable. The contract: start timing when the widget mounts; at 10 seconds with no token, show an accessible explanation plus 01753 682707 while keeping the entered details; on widget error or token expiry, show the same and offer a retry that resets the widget; if a token arrives late, clear the message and enable submit. Never bypass server-side validation. Monitoring must distinguish widget failure from a management verification outage.

### 7.6 Public identity versus customer links

Public SEO identity fields (JSON-LD, metadata) must not carry management URLs. Customer booking-management and payment URLs on that domain are legitimate and must survive. See section 17.

---

## 8. Workstream A: defects to fix first

Nothing else in this spec is worth doing until these are done. Each was verified in the working tree or in live output today.

### EV-000 The Christmas lightbox covers the booking CTA on every event page
- **Problem.** `ChristmasLightbox` is mounted globally in `app/layout.tsx:284`. Its suppression list (`components/features/christmas/ChristmasLightbox.tsx:39-48`) is `/christmas-parties`, `/book-table`, `/book-event`, `/booking-confirmation`, `/quiz-night`, `/cash-bingo`, `/music-bingo`, `/karaoke`. **`/events/*` and `/whats-on` are not on it.** A 10-second timer (`:188`) plus desktop exit intent fires a full-screen overlay over the event detail page and the events hub.
- **Observed.** At 375x812 on `/events/detention-disco-back-to-school-music-bingo-2026-09-11` the overlay covers the H1, the price and both CTAs. Reproduced twice. It does not fire on `/quiz-night` or `/karaoke`, consistent with the suppression list.
- **Why it matters.** Somebody deliberately suppressed this on every booking surface they could think of and missed the two event ones. It is the single largest conversion defect found in this review: on the two pages where a visitor is closest to booking an event, the booking action is covered ten seconds in. It also carries mobile intrusive-interstitial risk.
- **Change.** Add `/events` and `/whats-on` to `SUPPRESSED_ROUTE_PREFIXES`.
- **One reported problem that turned out not to exist.** The live check reported the overlay carried no `role="dialog"` and no `aria-modal`. **That is wrong.** Verified in the browser on 6 September: when the panel is genuinely open, `document.querySelector('[aria-modal="true"]:not([data-state="closed"])')` matches. The component applies it only while open, exactly as its comments say. No accessibility work is needed here and none should be estimated.
- **Acceptance.** The lightbox does not appear on any `/events/*` route or on `/whats-on` after 30 seconds at 375x812 with `christmas_2026_lightbox_seen` cleared, **and it still appears on a control route that is not suppressed**. Without the control, the test proves nothing: a stale suppression key produces a passing result on its own.
- **Verified 6 September 2026, browser, 375x812.** `/whats-on` and `/events/quiz-night-2026-10-07`: 18 seconds elapsed, no open modal, zero Christmas text nodes, and the suppression key stayed `null`, so nothing fired. Control on `/sunday-roast` with the same cleared key: modal open, 3 Christmas nodes, key written. A Jest case asserts both prefixes are suppressed.
- **Approval.** **Owner-approved 6 September 2026 (answer 1).** Ship first.
- **Status.** Built and **browser-verified** on `fix/event-pages-wave-1`. Note it reversed a tested prior decision: `lightbox-suppression.test.ts` asserted the lightbox was *allowed* on `/whats-on`. That assertion was moved, not worked around.

### EV-001 Karaoke's sticky CTA sends mobile visitors off the page
- **Problem.** `lib/booking-cta.ts:16` reads `['/quiz-night', '/cash-bingo', '/music-bingo']`. `/karaoke` is absent, so the persistent mobile bar falls through to the generic "Book a table" and sends the visitor to `/book-table` instead of the karaoke booking form further down the same page.
- **Evidence.** Live HTML has 2 `href="#book"` anchors on `/karaoke` and 3 on each sibling.
- **Why it matters.** `/karaoke` has the most organic traffic of the four hubs (17 clicks, 662 impressions) and its sticky CTA is the one that leaks.
- **Change.** Add `/karaoke` to the array.
- **Acceptance.** On `/karaoke` at 375px the sticky bar links to `#book`; a Jest case asserts all four game routes resolve to `#book`.
- **Approval.** Pre-approved small fix.
- **Status.** Built and **browser-verified** on `fix/event-pages-wave-1`: `/karaoke` renders 3 `#book` anchors where it previously rendered 2, the third being the sticky bar's own link. The Jest case in the acceptance criterion is **not yet written**.

### EV-002 The hub's revalidate constant contradicts its fetch layer
- **Corrected after review.** My original claim, that a cancelled date stays wrong for up to 24 hours, is **wrong** and is withdrawn.
- **What is actually true.** `app/whats-on/page.tsx:20` sets `revalidate = 86400`, but `lib/api/client.ts:660-667` sets `next: { revalidate: 300 }` on every server-side fetch by default. Next.js 14 documents that the lowest revalidate value across a route determines the revalidation frequency of the whole route, so the hub already refreshes on the 300s cadence. Verified in code on 6 September 2026.
- **What remains.** A route constant that says one thing while the fetch does another, which is a trap for the next reader.
- **Change.** Set the route default to 300 for consistency. This is tidying, not a defect fix, and it must not be described as one.
- **Acceptance.** `revalidate` is 300 and the seasonal gate still evaluates. **Do not write an acceptance test that claims to prove a freshness improvement**, because there is no staleness to improve. If real freshness ever needs proving, it has to be traced through the framework cache, Vercel and Cloudflare, not asserted from a constant.
- **Approval.** Pre-approved small fix. Severity downgraded from defect to consistency.

### EV-003 The events hub cannot tell an outage from an empty diary
- **Problem.** `app/whats-on/page.tsx:106-107` catches API failure into `[]` and renders "No upcoming events scheduled at the moment." with no phone number and no error signal.
- **Why it matters.** This is a public read path failing open, in a repo whose own rule is that public paths fail closed with a visible error and a fallback. A reader is told the pub has no events when in fact the API is down.
- **Half of this already exists, and it is the good half.** `lib/api/error-kind.ts` already separates a genuine 404 from a transient failure, and `app/events/[id]/page.tsx:324` already calls `rethrowIfTransient`. Its doc comment records why: a bare `catch` used to issue a 308 permanent redirect for every failure mode, so a timeout or a 502 told Google a live bookable event had permanently moved. **Reuse this module. Do not invent a second error taxonomy.**
- **The gap is the list helpers, not the detail lookup.**
- **The page is not the only place that swallows.** `getUpcomingEventsByCategory` catches and returns `[]` at `lib/api/events.ts:847-849`, and `getUpcomingEvents` and `getRecentEvents` do the same. Verified in code on 6 September 2026. **A page-only fix would pass a mocked page test and remain unreachable in a real outage**, which is exactly the failure mode this ticket exists to prevent.
- **Change.** Carry the failure through the API helper layer first. The helpers must distinguish four outcomes and the page must render each differently: loaded-and-empty, not-found, upstream-unavailable, and partial. Only then change the page.

| Outcome | Helper returns | Hub renders |
|---|---|---|
| Loaded, genuinely empty | empty list, `ok` | "No upcoming events scheduled at the moment." |
| Upstream 5xx, timeout, invalid payload | `unavailable` | "We could not load the dates just now", plus 01753 682707 |
| Single event not found | `not-found` | 404 on the detail route, unchanged |
| Partial (some categories failed) | `partial` | render what loaded, plus the unavailable notice |

- **Acceptance.** The failure is injected **beneath the API helper**, not at the page import, and the test asserts the user sees the failure and the phone number. A second test asserts the genuine-empty case still reads as an empty diary. A test that only mocks the page module does not satisfy this ticket.
- **Approval.** Pre-approved. Rule compliance, not an enhancement.

### EV-004 Structured data publishes the internal admin app as the organiser
- **Problem.** Live JSON-LD on every event page carries `"organizer": {"@type":"Organization","name":"The Anchor","url":"https://management.orangejelly.co.uk"}`. `isManagementUrl()` in `lib/structured-data/event-schema.ts:20-23` already guards `bookingUrl`, `potentialAction` and `mainEntityOfPage`, but not `organizer`.
- **Evidence.** Verified live on `/events/quiz-night-2026-10-07` and `/events/detention-disco-back-to-school-music-bingo-2026-09-11`.
- **Change.** Route `organizer.url` through the same guard and substitute `https://www.the-anchor.pub`.
- **Acceptance.** No `management.orangejelly.co.uk` string appears in any rendered JSON-LD on any route; a test asserts it for both an event with and without an organizer URL.
- **Approval.** Pre-approved small fix (schema matching the truth).

### EV-005 Event schema emits a relative image URL
- **Corrected after review. The `doorTime` half of this ticket is withdrawn.** I reported that `doorTime` was emitted as literal `null`. It is not: the property is simply **absent**. My earlier check used Python's `.get()`, which returns `None` for a missing key, and I misread that as a null value. Verified on both live event pages on 6 September 2026: `'doorTime' in event` is `False`.
- **What is actually true.** On an event with no artwork the Event `image` is `["/images/page-headers/whats-on/whats-on.jpg"]`, a relative path. Google requires crawlable image URLs and this project requires absolute URLs in JSON-LD, so this is a real defect. The fallback is also a generic hub photo rather than anything to do with the event.
- **Change.** Absolutise every schema URL. Feed the image from EV-007's category fallback.
- **Not in this ticket.** Adding `doorTime` is a separate optional enhancement and needs a source for the arrival time. It is not a null-value bug and must not be estimated as one. If it is ever added, remember "doors" is banned as customer-facing wording; `doorTime` is a machine property only.
- **Acceptance.** Rendered JSON-LD parses, carries no relative URL, and produces **no critical Rich Results errors** on one event with artwork and one without. Optional warnings are recorded with a reason and are **never** resolved by inventing a fact.
- **Approval.** Pre-approved small fix.

### EV-006 The wrong person is published as the performer
- **Problem.** `/events/quiz-night-2026-10-07` publishes `"performer": {"@type":"Person","name":"Peter Pitcher"}`. `docs/SSOT.md:437` names the quiz host as Question One Quiz Masters.
- **Why it matters.** It is a factual error in machine-readable data about who runs the event, and the same field is correct on music bingo (Nikki Manfadge), so the defect is in the source records rather than the template.
- **Amended after review (R17). No name heuristics.** My original wording said to fall back when the record's performer "is a staff name". There is no authoritative way to detect that, and guessing risks overwriting a legitimate guest host. A present-but-wrong record is a different problem from a missing one, and only the first is fixable at source.
- **Change, website side.** Where the performer is **absent**, use an approved category default only where one is genuinely valid. Quiz can have an occasional guest host and karaoke has no fixed host, so for those, **omit the optional property** rather than assert one. Never pattern-match a name.
- **Change, source side.** Incorrect records are corrected in the management app under its own owner-approved data action. That is the only fix for a wrong-but-present value.
- **If a temporary website exception is ever needed**, it is by stable event ID with documented approval, never by heuristic.
- **Acceptance.** No event page publishes a performer that contradicts `docs/SSOT.md` §10, and no page invents one. Omission is an acceptable outcome.
- **Approval.** Website half pre-approved. Management data change needs the owner.

### EV-007 Two thirds of the forthcoming programme has no artwork
- **Problem.** 10 of the 15 upcoming events return null for every image field. Everything from 7 October onwards, including Halloween and the Christmas Music Bingo. `lib/event-image.ts` returns `null` with no fallback, so the detail page drops to a stock interior photo, listing cards render without a poster, and the Event schema falls back to the generic hub image.
- **Evidence.** `GET /api/events?limit=50`, checked today.
- **Change, amended after review (R18).** Two parts.
  - **(a) Website.** Define an explicit category-key map and a fallback chain per surface (square card, wide hero, social), including a branch for **unknown category** and for **a failed image load**. `public/images/events/` holds 7 files each for quiz-night, cash-bingo and music-bingo, which covers three of six live categories: karaoke, tasting and parties have none. Where no relevant asset exists, fall back to a truthful neutral image rather than a misleading one. Use only evergreen artwork with no baked-in date, price or performer, since a fallback outlives the night it was shot for. Do **not** crop a designed square poster to manufacture a wide hero: keep descriptive photo heroes and square posters as separate assets, per the 1:1 rule.
  - **(b) Source.** The real fix is artwork on the records. The owner is producing it (answer 3). It needs a dated checklist naming the ten records by **stable event ID**, not by date, since dates and slugs move.
- **Acceptance.** No upcoming event page renders without artwork relevant to its category; the fallback is square, per the 1:1 rule, and is never cropped or stretched.
- **Approval.** (a) pre-approved. (b) **owner is producing the artwork (answer 3)**, so the source fix is in hand and the website fallback is still worth building as a permanent guard.
- **Status.** Not built.
- **Note.** There is no karaoke folder in `public/images/events/`. Karaoke needs one image, or it keeps the interior fallback.

### EV-008 A repeated sell-out claim that cannot be evidenced
- **Problem.** `/music-bingo` says the night sells out five times, including in the meta description and as a standalone line, "It genuinely does sell out".
- **Evidence against it.** `docs/SSOT.md` §Music Bingo records capacity 90 and makes no sell-out claim. The live API shows 54 of 60 seats remaining on 11 September and 60 of 60 on both 16 October and 13 November. Recorded attendance is 20 to 25 against a 50 to 60 capacity (`tasks/event-ads-conversion-discovery-2026-08-08.md`).
- **Why it matters.** It is an unevidenced claim in customer-facing copy, which is the exact class the SSOT regime exists to prevent. It also works against conversion: a visitor reads "it sells out", scrolls to the form, and sees every seat free.
- **Change.** Either the owner confirms the claim and it goes into `docs/SSOT.md` as a recorded fact, or all five instances are removed and replaced with EV-012's real, live seat count.
- **Acceptance.** No sell-out claim survives that is not recorded in the SSOT.
- **Approval.** **Owner-approved 6 September 2026 (answer 2): remove.** Recorded in `docs/SSOT.md` §10 as a standing ban, so it cannot drift back.
- **Status.** Built locally on `fix/event-pages-wave-1`. All five instances replaced with copy grounded in communal and group seating. The replacement wording has **not** been through `editorial-team` and should be treated as draft.

### EV-009 Dead code that is also a standing trap
- **Problem.** `app/api/events/[id]/availability/route.ts` has no caller anywhere in the repo, and contains a locally calculated availability fallback, which is the precise pattern the project bans for table bookings. `lib/static-events.ts` (10KB) has zero importers. `getEventSeatAvailabilityLabel` (`lib/event-booking-experience.ts:297`) is exported and used nowhere.
- **Amended after review (R28).** Zero imports proves little about an **HTTP endpoint**, which external callers can hit without any import. Deletion needs evidence beyond a local grep.
- **Change.** For the route: search the whole repository and the paired management repo, check available request logs, identify an owner, then agree deprecation or removal explicitly. Review its unsafe local-calculation fallback **separately** from the cleanup, because the fallback is the real hazard and it should not wait on the deletion decision. For `lib/static-events.ts`: delete, after confirming no dynamic import references it. For `getEventSeatAvailabilityLabel`: EV-012 decides whether it becomes the single resolver or is deleted. **Being unused is not a reason to expose a feature.**
- **Acceptance.** The route is either removed with evidence of no external caller, or documented as deprecated with a date. No importer-less events module. Exactly one scarcity resolver exists.
- **Approval.** Route deletion needs the owner. `lib/static-events.ts` is pre-approved.

### EV-031 A raw database slug is printed to customers
- **Problem.** The event page's "Event information" table renders `Event type music-bingo`, the raw category slug. Verified in the live HTML of `/events/detention-disco-back-to-school-music-bingo-2026-09-11`.
- **Change.** Render the category's display name, which the API already supplies as `category.name` ("Music Bingo"), or drop the row. It duplicates the "Category" row immediately below it.
- **Acceptance.** No raw slug appears in visible copy on any event page.
- **Approval.** Pre-approved.

### EV-032 Em dashes reach customers from the management database
- **Problem.** The served HTML of the same event page contains 16 em dashes, coming from the event description held in the management app, and they appear in the JSON-LD `description` as well. One sits between "plenty of chances to join in" and "no music expertise needed".
- **Why it matters.** No em dashes in customer-facing text is a standing rule, and the website's own hooks enforce it on files this repo writes. Text arriving from the management API bypasses that enforcement entirely.
- **Change, bounded after review (R24).** A blind replacement across serialised output would corrupt JSON-LD escaping, URLs and identifiers.
  - **(a) Website.** Normalise **named prose fields only**, through one tested adapter, before rendering: `description`, `longDescription`, `about`, `highlights`, `faq` question and answer text, `image_alt_text`, and the derived meta description. **Never** apply it to a serialised JSON string, a URL, a slug or an identifier. Preserve existing HTML sanitisation and the safe JSON-LD serialiser, including hostile closing-script text. Replacement punctuation follows editorial approval where it changes meaning; a comma is the default.
  - **(b) Management.** Fix the authoring path. Raise with the paired repository.
- **Acceptance.** The character does not appear in the rendered HTML or JSON-LD of any event page; a test feeds it through the API fixture and asserts it does not survive.
- **Approval.** (a) pre-approved. (b) owner action.

### EV-033 The events hub calls four months "this month"
- **Problem.** `/whats-on` heads its card grid "This month's headline nights". The cards run 11 September to 16 December 2026, fifteen events across four months.
- **Change.** Retitle to something true, and keep it true when the diary changes.
- **Acceptance.** The heading does not assert a period the card list contradicts.
- **Approval.** Pre-approved, wording through `editorial-team`.

### EV-034 Hero images that are upscaled, or downloaded and then hidden
- **Problem, three parts, all observed live.**
  - `/quiz-night` hero source `/images/events/quiz-night/quiz-night-hero-tables-full.jpg` is **640x480**, rendered full-bleed up to 1440px wide and 750x1376 device pixels on mobile, so it is upscaled roughly two to four times and is visibly soft. `sizes="100vw"` also under-requests for the tall mobile crop.
  - `/whats-on` and `/karaoke` heroes are downloaded and then made effectively invisible by stacked gradients (`rgba(12,29,17,0.92)` horizontal over `rgba(12,29,17,0.55)` vertical). Both render as flat green on desktop. The bytes are spent for no visible image.
  - `/karaoke` uses a generic empty-bar photo (`/images/our-pub/the-anchor-main-bar-2026.jpg`) with `alt=""` on a page about karaoke.
- **Why it matters.** The hero is the LCP element on all three. One is too small to look good, two are paid for and never seen, and one is not about the page's subject.
- **Change.** Replace the quiz hero with a source at least 1920px wide and run `npm run optimize:images`. Where the gradient hides the image, either lighten the gradient so the photograph does some work or drop the image and use the flat colour. Give `/karaoke` a karaoke photograph with real alt text, or accept the flat colour.
- **Performance budget, added after review (R31).** "Not upscaled" does not establish fast loading, and "invisible gradient" is a visual judgement rather than a threshold. Before this package, capture production-mode LCP, layout shift, image transfer and request count on the event detail page and one category page. Agree a no-regression allowance against those measurements. A larger hero source can easily make the booking surface slower on mobile, which would be a net loss.
- **Acceptance.** No hero is upscaled beyond its source. No hero image is downloaded at a gradient opacity that makes it invisible. No empty `alt` on an image that carries meaning, while genuinely decorative images keep theirs. Measured LCP and transfer are within the agreed allowance on a throttled mobile profile as well as desktop.
- **Approval.** Owner sign-off on imagery.

### EV-035 Small correctness fixes found in the live check
- `og:type` is missing on `/quiz-night`, `/whats-on` and `/karaoke`, and is `website` on the event detail page. Set a type deliberately per route. Note that `website` is not by itself evidence of a defect, so this is a convention decision rather than a bug: decide the intended type, the image variant and the fallback preview wording per route, then assert the rendered result.
- `/quiz-night` and `/karaoke` share the same generic `og:image` (`/images/page-headers/whats-on/whats-on.jpg`), so both carry a link preview that is about neither.
- On `/karaoke`, a free event, the email helper still reads "So we can send your confirmation and any payment follow-up".
- The event page's `og:description` says "next Friday", a relative phrase that goes stale as soon as the week turns.
- The Google Maps iframe has no `title` attribute, which is an accessibility failure on every page that embeds it.
- The event page's heading outline opens with an H3 ("Event Highlights") before its first H2.
- A `link rel=preload` for a 384px event poster on `/karaoke` is never used, producing a console warning and a wasted fetch.
- **Approval.** All pre-approved.

---

## 9. Workstream B: the event detail page

### EV-010 The desktop fold sells nothing but a poster
- **Corrected after live measurement.** Mobile is fine. At 375x812 the event name, date, price and the "Book tickets" button are all in the first viewport. **Desktop is the problem.** At 1440x900 the poster occupies y150 to y651, the H1 is sliced by the fold at y731 to y913, and the date and price line (y929) and the "Book tickets" button (y1011) are both below it. Nothing above the desktop fold sells the event except the artwork.
- **Evidence for the change.** NN/g eyetracking: about 57% of page-viewing time is spent above the fold and 74% within the first two screenfuls, with a sharp drop after the fold (https://www.nngroup.com/articles/scrolling-and-attention/).
- **Note.** `/quiz-night` and `/karaoke` already get this right at both breakpoints. The defect is in the event detail template only.
- **Change.** Cap the desktop poster height so the H1, the date and price line and the primary CTA all clear the fold at 1440x900. Do not change the mobile layout, which is already correct.
- **Acceptance, tightened after review (R23).** At 1440x900 on an event with artwork, the H1, date, price and booking button are fully visible without scrolling, verified by screenshot. Also check a **long event title**, the cookie bar in place, and one step of browser zoom, because a single width proves very little. The "mobile screenshots identical" assertion applies to **this ticket in isolation**; other tickets deliberately change mobile, so it is not a release-wide gate.
- **Approval.** Template change, owner sign-off on the visual.

### EV-011 Surface add-to-calendar, which is already built
- **Problem.** `lib/event-calendar.ts:257` exports `buildGoogleCalendarUrl` and `:274` exports `buildEventIcs`. `app/api/calendar/event/[id]/route.ts` and `app/api/calendar/upcoming/route.ts` both work. **No page in the repo links to any of them.**
- **Why it matters.** The entire job of an event page is getting somebody to turn up on a specific evening several weeks away. For a monthly recurring night, add-to-calendar is the highest-value action after booking, and it is fully built and hidden.
- **Change.** Add an add-to-calendar control to (a) the event detail page, (b) the booking success state, (c) the upcoming-date cards on the four category pages. Offer the ICS route and the Google Calendar URL.
- **Contract, added after review (R15).** Time zone coverage alone is not enough.
  - Use the **event start**, not the arrival time. Arrival can go in the description; it is not the calendar start.
  - **Stable UID** per event so a re-download updates rather than duplicating, and the ICS carries the public canonical event URL, not a management URL.
  - **Missing end time:** fall back to the event's `duration` if present, otherwise omit `DTEND`. Never invent a finish time.
  - Escape event text properly; an unescaped comma or newline corrupts an ICS file.
  - Cancelled and ended events offer no calendar control at all, per §7.1.
  - A one-off download does **not** update when the event changes. Say so in one short line rather than implying a live subscription.
  - Never gate or hide payment status behind a calendar action.
- **Acceptance.** Verified in Apple Calendar, Outlook and Google Calendar, not merely "opens correctly". Cases: an event crossing midnight, an event either side of a clock change, a known and an unknown end time, and a re-download producing one entry rather than two. Tracking is labelled an action or download, **never** an attendance commitment.
- **Approval.** Pre-approved.

### EV-012 Call the resolver that already exists
- **Corrected twice. This ticket is far smaller than I wrote it.**
- **First correction:** scarcity is not missing. `GameNightBooking.tsx:17` already renders "N places left" on the four category pages at a threshold of 20.
- **Second correction, and the important one:** the capacity precedence contract I drafted **already exists in code, in full**. `getEventSeatAvailabilityLabel` (`lib/event-booking-experience.ts:297`) is booking-mode aware and already handles seated versus standing, the sold-out cases, `is_full`, the schema `SoldOut` flag, and the "N seated, M standing left" split. `getEventSeatsRemaining` (`:286`) already implements field precedence. `getEventRemainingCapacity` (`lib/api/events.ts`) already documents why all three field spellings must be read, and records the incident where reading only `remainingAttendeeCapacity` silenced every scarcity readout on the site.
- **The two resolvers do not disagree.** The doc comment states they agree, because the capacity snapshot assigns `seats_remaining := total_remaining` in both booking modes. My earlier warning about "two behaviours that can disagree" was wrong.
- **So the actual work is one line of wiring.** `getEventSeatAvailabilityLabel` is exported and called from nowhere. Call it on the event detail page. Do not write a new resolver, do not write a new precedence table, and do not delete it.
- **Precedence, for reference only.** It is already implemented; this table documents what the code does rather than specifying new behaviour.

| Situation | Label produced |
|---|---|
| Communal, seated and standing both > 0 | "N seated, M standing left" |
| Communal, seated only | "N seated left" |
| Communal, standing only | "N standing left" |
| `is_full`, schema `SoldOut`, or all remaining 0 | "Sold out" |
| Non-communal, <= 10 remaining | "Only N seats left" |
| Non-communal, > 10 remaining | "N seats available" |
| Any value unknown | `null`, so nothing renders |
| Ended or cancelled | nothing, per §7.1 |

- **Rules that still bind.** Capacity and remaining values always come from the management app; never computed locally. The backend stays authoritative at submit.
- **The legal position, corrected.** My original wording overstated the citation. CMA banned practice 7 concerns **falsely stating limited-time availability**. It is neither a blanket ban on static availability lines nor a guarantee that a database-fed number is lawful, since a live count can still mislead if stale or describing the wrong inventory. The requirement is that a claim accurately describes bookable inventory and its limits. This spec is not legal advice.
- **Acceptance.** The detail page renders the existing label. Tested at the threshold, above, below, at zero, at null, and seated-full-standing-available. No new resolver exists. No static scarcity string exists anywhere.
- **Approval.** Owner sign-off on **where** it appears on the detail page. The wording and thresholds are already shipped behaviour on the category pages, so they need no new decision.

### EV-013 Extend the confirmation state without breaking what it already does
- **Corrected after review. The success state is not empty.** `ManagementEventBookingForm.tsx:902-910` already renders a **Manage Booking** button from `result.manage_booking_url`, and the `pending_payment` state at `:914` already renders the PayPal section and a payment link. Verified in code on 6 September 2026. My original "dead end" framing was wrong and would have invited a rewrite that deleted working recovery paths.
- **What is actually missing.** Add to calendar, directions, and a contextual next action. Nothing more.
- **Hard constraint.** Manage Booking and the payment links must survive this ticket. See the narrowed acceptance rule in section 17: they are customer booking URLs on the management domain and they are legitimate.
- **Confirmed-only rule.** Post-confirmation content appears **only** after authoritative confirmation from the backend. A hold, a pending payment, a manual review or a waitlist response must not render calendar or "see you there" content.
- **Change.** Extend the existing `confirmed` state with add-to-calendar (EV-011) and directions. Offer food only where the kitchen is genuinely open **and serving at a time compatible with the event**, resolved through `lib/hours-utils.ts` effective service windows, not from a kitchen-open-that-day flag. Where food is unsuitable, fall back to directions and calendar rather than promising a meal.
- **Acceptance.** Manage Booking and PayPal still render in their existing states, asserted by test. Calendar and directions render only on `confirmed`. The food action is absent when the kitchen is closed or its service window does not reach the event, covered in both time zones.
- **Approval.** Pre-approved, except the food cross-sell wording which needs the owner.

### EV-014 The share button is hidden from the people most likely to share
- **Problem.** `app/events/[id]/page.tsx:746` renders the share control inside a `hidden lg:block` sidebar. It does not exist on mobile.
- **Change.** Make it available at all breakpoints. It still reads `showShareButton` from `getEventPresentation`, so an ended or cancelled event continues to hide it, per §7.1.
- **Acceptance, extended after review (R23).** Share control present and functional at 375px, **plus** its fallback states: Web Share API unsupported, permission denied, and a clipboard-copy fallback with a visible confirmation. Keyboard reachable with visible focus.
- **Approval.** Pre-approved.

### EV-015 On mobile the form arrives before the pitch
- **Problem.** The two-column grid uses CSS `order` so the booking form renders above the description on mobile (`page.tsx:630, 639, 702`).
- **Why it matters.** A visitor who has not yet decided meets a form before they learn what the night is.
- **Change.** On mobile, order should be: hero facts, highlights, about, then the form, with the hero CTA anchoring down to it. Desktop keeps the sticky sidebar form.
- **Acceptance, corrected after review (R23).** The change must be in **DOM order**, not a CSS `order` swap, because CSS visual order does not change reading or keyboard order and a screen reader user would still meet the form first. Assert DOM order at 375px puts "About This Event" before `#event-booking`, assert tab order matches, and assert the desktop layout is unchanged. Also confirm the sticky bar does not cover the anchor target when the hero CTA jumps to the form.
- **Approval.** Owner sign-off, because this reverses a deliberate earlier decision.

### EV-016 A failed captcha makes the page unbookable and says nothing
- **Problem.** The submit button is `disabled` until a Turnstile token exists (`ManagementEventBookingForm.tsx:870`). If the widget fails to load there is no message and no route forward.
- **Why it matters.** This is a public write path failing silently rather than closed-and-visible.
- **Change.** Implement the recovery contract in §7.5, which replaces my original "reasonable interval" with a concrete policy: 10 seconds, an accessible explanation plus the phone number, retained input, a retry that resets the widget, and a late-arriving token clearing the message. Never bypass server-side validation.
- **Acceptance.** Four cases: script blocked, token delayed then arriving, token expired immediately before submit then retried successfully, and a verification outage. Each asserts the user sees an explanation and 01753 682707, and that entered details survive. Monitoring distinguishes widget failure from a management verification outage.
- **Approval.** Pre-approved, rule compliance.

### EV-017 No social proof at the point of decision
- **Problem.** The rating badge (`HeroBadge`) appears on `/karaoke` and `/live-sport` only. The three pages that actually sell tickets do not show it, and no event detail page shows any proof at all. `previous_event_summary` and `attendance_note` are null on every one of the 15 upcoming events.
- **Change.** Show the existing rating as visible page copy near the booking action on the event detail template and the four category pages.
- **Hard constraint.** Do **not** emit `aggregateRating` or `review` JSON-LD. Google restricts those to sites capturing reviews about other businesses (https://developers.google.com/search/docs/appearance/structured-data/local-business). The site is currently clean, verified today, and must stay that way.
- **Labelling, added after review (R30).** The rating is **venue-wide**, not event-specific, and must be labelled as such rather than implying people rated this night. Name its source and give it a refresh owner; a stale rating is a false claim. It is not proof about a specific event and must not be presented as one.
- **Acceptance.** Rating visible near the CTA and labelled venue-wide with its source. No `aggregateRating` or self-referential `review` markup in any rendered JSON-LD sitewide. Verified clean today.
- **Approval.** Pre-approved.

### EV-018 The facts must be text, not only pixels in the poster
- **Problem.** Themed nights carry their hook in the poster image ("Detention Disco", "Screams and Soundtracks"). Where the theme, day, time or price exists only inside the artwork, no search engine, screen reader or AI assistant can read it.
- **Evidence.** Google's AI features guidance says no special files or schema are needed and names "making sure that important content is available in textual form" as a listed best practice (https://developers.google.com/search/docs/appearance/ai-features).
- **Change.** Guarantee an editorial floor: every event page renders the theme, day, date, start time, price and how to pay as text, independent of the artwork. `image_alt_text` from the API must be used and must not be the only place a fact appears.
- **Missing-fact policy, added after review (R30).** "All six facts" needs a rule for when a fact does not exist. Price, day, date and start time come from the record and are always present. **Theme and payment method may be absent: omit them rather than inventing them.** Never fill a gap from the poster image, from a previous event, or from inference.
- **Acceptance.** With images disabled, every fact the record actually holds is readable on every upcoming event page, and no page asserts a fact the record does not hold.
- **Approval.** Pre-approved.

---

## 10. Workstream C: the category pages

### EV-019 Karaoke is indexed, sitemapped, and unlinked from its own hub
- **Problem.** `/whats-on` has no in-body link to `/karaoke`. `REGULAR_NIGHTS` (`app/whats-on/page.tsx:69-100`) lists music bingo, quiz and cash bingo only, and the events cluster in `lib/seo/organic-search-map.ts:199-226` lists live-sport, quiz-night and music-bingo. The three `href="/karaoke"` occurrences on the live hub are all nav and footer chrome. The exclusion is deliberate (`lib/game-nights/index.ts:24-35` filters non-promotable nights out of destination lists) but the effect is a page orphaned from the hub it belongs to.
- **Why it matters.** `/karaoke` earns more organic clicks than `/quiz-night` and `/cash-bingo` put together (17 against 9) on fewer impressions (662 against 724), so its click-through rate is 2.57% where theirs are 0.75% and 1.85%. No GSC data exists for `/music-bingo`, so it is excluded rather than assumed to be zero. Karaoke is also the largest keyword cluster on the site at roughly 56,150 searches a month (`tasks/keyword-plan-game-nights-2026-08-17.md`).
- **The tension to resolve.** `docs/SSOT.md:467` is explicit: karaoke is not a regular feature in 2026, never imply a weekly, monthly or Friday slot, and no recurring EventSeries schema. So the page cannot be promoted as a fixture.
- **Change.** Link `/karaoke` from `/whats-on` under an honest "runs occasionally, see the next confirmed night" label. That satisfies the SSOT and stops the orphan. Do not add EventSeries.
- **Amended after review (R21).** My original instruction said not to add it to `REGULAR_NIGHTS` and to build a separate occasional-nights treatment. Wave 1 did add it to that array, with cadence "Occasionally" and the section retitled from "On every month" to "Our nights". The rendered result is honest and satisfies the SSOT, but the implementation contradicts the written instruction, so a reviewer cannot tell whether it is an accepted simplification or a failed requirement.
- **Resolution.** Accept the shared card layout, and make the code say so: rename `REGULAR_NIGHTS` to `HUB_NIGHTS` (or similar) so the constant no longer asserts a cadence it does not have. A separate component for one card was never worth it. The instruction, not the implementation, was wrong.
- **Zero-date state.** When karaoke has no confirmed night, the card must still not imply cadence. It links to `/karaoke`, whose own empty state already says karaoke is not in the diary right now. Do not hide the card, because hiding it recreates the orphan.
- **Acceptance.** `/whats-on` body links to `/karaoke` with cadence-honest wording; no recurring schema is emitted for karaoke; a test asserts both.
- **Approval.** **Owner-approved 6 September 2026 (answer 5): link it.**
- **Status.** Built locally on `fix/event-pages-wave-1`. Added as a fourth card with cadence "Occasionally", not "Monthly", and the section retitled from "On every month" to "Our nights" so the heading stays true. The card grid moved from `md:grid-cols-3` to `md:grid-cols-2 lg:grid-cols-4`.

### EV-020 No BreadcrumbList markup on the four game pages
- **Problem.** All four render a visual breadcrumb via `InteriorHero.tsx:86-94` and none emit `BreadcrumbList` JSON-LD. `/whats-on:111` and `/live-sport:89` both do, so the pattern already exists in the repo.
- **Change.** Emit `BreadcrumbList` on the four game pages using the existing component.
- **Acceptance.** All four validate in the Rich Results Test with a breadcrumb; markup matches the visible trail.
- **Approval.** Pre-approved.

### EV-021 Template drift across four pages that share a template
- **Problem.** The quiz page puts its H2 intro after the booking block and gallery, the other three put it before. The find-us and map block sits after the closing CTA band on `/music-bingo` and `/cash-bingo`, before it on `/karaoke`, and is missing entirely from `/quiz-night`. `/quiz-night` is the only one with `InternalLinkingSection`. `/karaoke` has `photos: []` and so no gallery.
- **Downgraded after review (R22).** Calling all of this "drift" was wrong. An empty karaoke gallery is a legitimate content difference, not a defect, and a full-page snapshot test across four pages with different content would be brittle and would encourage empty sections to exist just to satisfy it.
- **Why it still matters.** Where the order genuinely differs for no reason, an improvement has to be made four times.
- **Change.** Agree a shared slot order for sections that are present, and make gallery, map and proof blocks **explicitly optional**. Move only what this release needs. Do not force identical output.
- **Acceptance.** Semantic order and booking reachability are asserted, not a full-page snapshot. A page with no gallery renders no empty gallery.
- **Approval.** **Owner decision: do the narrow ordering fix now, or defer the whole thing.** The broader refactor has limited proven conversion value.

### EV-022 A category page with no upcoming date has nothing to offer
- **Problem.** When a category has no dates the page shows an empty state with a phone number. The waitlist only appears after a failed submit (`ManagementEventBookingForm.tsx:954`).
- **Why it matters.** The category page's whole purpose is to outlive its events. Karaoke has exactly one date in the diary and will spend most of the year in this state.
- **Deferred after review (R12).** "Routed through the existing email path" was hand-waving. The event waitlist is a **sold-out, single-event** mechanism; a category-level "tell me about future dates" subscription is a different product. Nothing currently identifies its storage, category preference, consent wording, duplicate handling, unsubscribe and suppression, retention, fulfilment trigger, or who actually sends the message.
- **Why deferring is the right call.** Collecting an address for a notification nobody has committed to send is worse than not collecting it.
- **Change, only if it proceeds.** Specify endpoint and payload, the appropriate permission and consent wording, abuse protection, accessible error and duplicate states, deletion and suppression behaviour, and the operational process that actually sends the update. Inspect the live schema before proposing any storage change; a production migration takes its own review and application approval.
- **Approval.** **Deferred unless an existing approved subscription service can fulfil the exact promise.** Owner decision.

### EV-023 `/live-sport` is entirely static, with no hero CTA
- **Problem.** It is the only one of the six with no live event data, so it can advertise a finished tournament indefinitely. Its first action sits about two thirds down the page; `InteriorHero` accepts an `actions` prop and this page passes none. It also has no scroll or section tracking.
- **Change.** Add hero actions. Decide whether it pulls live fixtures.
- **Approval.** Owner decision on live fixtures. Hero CTA is pre-approved.
- **Priority.** Lower than the rest of this workstream. Recorded so it is not lost.

---

## 11. Workstream D: structured data and metadata

The defects are in Workstream A. This section records what must **not** be done, because several plausible ideas here are dead ends.

### Do not do these

| Idea | Why not |
|---|---|
| Add FAQPage schema to event detail pages | Google deprecated the FAQ rich result on 7 May 2026 and removed the documentation on 12 June 2026. It earns nothing. Keep FAQ content for readers; expect no rich result. The four category pages already emit it, which is harmless, so leave it. |
| Expand EventSeries onto more category pages | Google requires a unique leaf URL per event and states listing pages are not supported for the event experience. EventSeries earns no documented rich result. |
| Build ItemList carousel markup | Carousels (beta) is available only in EEA countries, Turkey and South Africa. The UK is in none of those. |
| Mark up opening hours, happy hours or offers as Events | Explicitly named a content-guideline violation with manual-action risk. |
| Add `aggregateRating` or `review` for the pub's own ratings | Restricted to sites capturing reviews about other businesses. |
| Add `llms.txt` or AI-specific schema | Google states plainly that no new machine-readable files and no special schema are needed. |
| Add `Event` or `ItemList` markup to `/whats-on` for the 15 events it lists | Google requires markup on single-event leaf pages and states listing pages are not supported for the event experience. The individual event pages already carry it. Adding it to the hub duplicates the entity and gains nothing. |

### EV-024 Metadata conventions
- **Corrected after review.** `/whats-on:45` uses `canonical: '/whats-on'`, a **relative path**, not an absolute URL as I originally wrote. It resolves correctly today. It deviates from the project's `canonical: './'` convention, which is worth aligning, but it is **not** the root-layout absolute-canonical bug and must not be described as an indexing repair. Same for `/live-sport:16`. Align the convention, claim nothing more.
- The event detail title is `stripBrandSuffix(metaTitle || name)` with the layout appending `| The Anchor`, which does not follow the project's own `Page Title | The Anchor Stanwell Moor` convention. Decide whether the convention or the current output is right, then make them agree.
- The Twitter card is `summary_large_image` fed a 1200x1200 square, which Twitter will crop. Serve the landscape variant to Twitter.
- The Event `image` array should carry 16x9, 4x3 and 1x1 where the API has them. Google recommends multiple aspect ratios, minimum 50K pixels, 1920px wide.

### EV-025 The OG title is share copy, not the event name
- **Observed.** `/events/quiz-night-2026-10-07` has `og:title` of "I need you on my Quiz Night team", against a page title of "A Hint of Halloween Quiz Night | 7 October | The Anchor".
- **Assessment.** For a friend-to-friend WhatsApp share this is good copy and probably deliberate. For any bot, aggregator or preview keying off `og:title` it hides the event entirely.
- **Change.** Owner decision. The middle option is to keep the peer-to-peer line but append the event name and date, so both audiences are served.
- **Approval.** Owner decision.

---

## 12. Workstream E: getting more people to the pages

### EV-026 Google Business Profile event posts, the largest unused free surface
- **Evidence.** Google documents Event posts with title, start and end date, a button, and weekly, monthly or custom repeat. It states these "may automatically show on your Business Profile on mobile" and that the feature is available "in English for single-location food and drink businesses in the US, **UK**, Canada, Australia, and New Zealand" (https://support.google.com/business/answer/7342169).
- **Why it matters.** The Anchor is exactly the described case, and this is currently unused. Local results are ranked on relevance, distance and prominence, with Google's explicit instruction to keep hours, special hours, category and attributes complete and current (https://support.google.com/business/answer/7091).
- **Honest limits, sharpened after review (R29).** Google publishes no ranking benefit for posts, so the value is visibility and click-through, not ranking. Two further caveats I originally skipped: the claim that GBP is currently unused is **not independently verified here**, and the recurring-schedule capability was not found in the checked help text. **Check the account's actual capability before promising a recurring programme.**
- **Change.** The simple, verifiable baseline is **one post per confirmed date**, with the button pointing at that event's detail page. Treat recurrence as a bonus if the account supports it. Assign ownership for creation, for cancellation and updates, and for attribution. This is off-site work in the Business Profile, not a code change.
- **Approval.** Owner action.

### EV-027 Slugs that do not name the event
- **Problem.** `/events/quiz-night-2026-10-07` is the URL for "A Hint of Halloween Quiz Night". Compare `/events/screams-and-soundtracks-classic-horror-music-bingo-2026-10-16`, which does name its event.
- **Why it matters.** The slug is generated in the management app and is the one part of a shared link a person reads before clicking.
- **Change.** Management-side authoring guidance, not a website change. Note the standing constraint: dated CMS slugs are unstable, so nothing on the website may hardcode a redirect to one (`tasks/spec-2026-09-05-gsc-triage.md` §3).
- **Approval.** Owner action in the management app.

### EV-028 Keyword work is blocked on data, not on effort
- **What exists.** `tasks/keyword-plan-game-nights-2026-08-17.md` holds a Google Keyword Planner export from August 2026 covering all four formats. Cluster totals: karaoke ~56,150/mo, quiz ~11,300/mo, music bingo ~5,700/mo, cash bingo ~1,200/mo. Two untargeted zero-competition terms are already identified: **drag bingo near me** (500/mo, competition index 0) and **wednesday pub quiz** (500/mo, index 0, and genuinely true of the quiz).
- **What is missing.** There is no GSC data for `/music-bingo`, `/whats-on` or any live `/events/*` page, and the Google Ads account is still not linked to GSC, so there is no organic-difficulty evidence for any of it.
- **Rules that bind any keyword work here.** One cluster per page, never sum close variants because Keyword Planner aggregates them, never state a volume that was not measured, and no town-modified pages: 24 town terms returned no data at all.
- **Corrected after review (R29).** "No GSC data for `/music-bingo`" means **the filtered export contained none**, not that the property holds none. The export filter was `heathrow-hotels-pub|quiz-night|cash-bingo|karaoke`, so those URLs were never going to appear. Request an unfiltered URL-level export before repeating the claim. Separately, Keyword Planner competition is a **paid** signal and is not organic difficulty, and a cluster total is not measured local demand.
- **Change.** Apply the two zero-competition terms now, in existing copy, where they are true. "Drag bingo" may refer **only** to the actual Music Bingo offer; it must not revive the discontinued drag cabaret format. Everything else waits on an unfiltered export with geography and period labelled.
- **Approval.** Pre-approved for the two terms. The wider plan needs data first.

---

## 13. Workstream F: measurement

### EV-029 The event funnel needs a delivery and deduplication contract
- **Problem, restated after review.** A list of helper names is not a contract. The real issue is visible inside one function: `lib/gtm-events.ts:282` fires `event_booking_completed` with `{ sendToApi: true }`, routing it through `/api/analytics` to the Measurement Protocol, and then fires `purchase` **without** that flag, so `purchase` goes only to the dataLayer. Verified in code on 6 September 2026.
- **Correction to my earlier blanket claim.** I wrote that 36 custom event types never reach GA4 because the published GTM container has no triggers for them. That holds for custom names. It does **not** automatically hold for `purchase`, which is a standard GA4 ecommerce name that a container may well already have a trigger for. **Verify the published container directly for `purchase` before relying on either assumption.**
- **The risk this creates.** If both delivery routes end up active for the same conversion, bookings are double counted. The existing decision that `event_booking_completed` must not be registered as a GA4 key event is what currently prevents that, and it stands (`docs/analytics/custom-dimensions.md`).
- **Change.** Produce one table, per event, with: event name, the state that fires it, parameters, consent gate, delivery route (dataLayer/GTM or Measurement Protocol, **never both**), deduplication identifier, GA4 registration, and reporting destination. Then verify against the published container and incoming events.
- **Known trap.** `GameNightBooking.tsx:48-52` documents that `form_view` re-fires on every date switch, so it is not a unique-reach count. Any funnel built on it must say so.
- **Acceptance.** Consent granted, denied and withdrawn all behave correctly. Exactly one delivery route per event. No duplicate `purchase`. No personal data or token in any payload. Verified in DebugView **and** in a GA4 report, because DebugView alone proves neither reporting nor consent behaviour.
- **Approval.** Pre-approved. Needs the analytics operator as well as a developer.

### Success criteria, and the honest baseline

**Corrected after review.** My original comparison was not comparable: eight weeks after release against a 28-day window before it, with a category-click baseline spanning nearly four months. That would let a busier programme, a campaign restart or better tracking read as a page improvement.

**This is a directional monitoring release, not a target-driven one.** The baseline is close to zero, so a percentage target would be meaningless and a fabricated one would be worse. Say so plainly rather than inventing a number.

Before release, freeze: the exact query, the cohort, London reporting dates, and the release date itself. Then report equal-length periods either side.

| Measure | Source | Definition that must be frozen first | Baseline |
|---|---|---|---|
| Completed event bookings | management DB, not GA4 | booking date or event date; cancellations included or not; staff-created bookings excluded; repeat attempts collapsed by idempotency key | zero recorded 5 Aug to 1 Sep 2026 |
| Bookings per event | management DB | normalised by number of events in the period | see above |
| Attendees, separately from bookings | management DB | tickets, not bookings | avg 13.2 seats per event, Jun to Sep 2026 |
| Add-to-calendar actions | new event | an action, explicitly **not** an attendance commitment | none, feature not surfaced |
| Category-page clicks | GSC | equal-length window either side of release | 26 across the three hubs with data, 1 May to 24 Aug 2026 |
| Event detail impressions | GSC | requires an unfiltered URL-level export first | unavailable |

**Confounders to record alongside any result**, because any one of them can move the number more than this work will: the SMS nudge rebuild, GBP posts starting, advertising changes, the event mix, capacity changes, and the Christmas season itself.

**Do not claim causation.** The observational comparison in section 2 does not establish that removing SMS caused the collapse, only that the two coincided. Equally, it does not establish that the pages were blameless. Verification windows stay as the project's operating model defines them: 0 to 48 hours did it ship, 1 to 2 weeks is it being discovered, 6 to 8 weeks did it move, control-adjusted against sitewide movement.

## 14. Priority

I have deliberately **not** run the numeric priority model from the SEO operating model. Two of its six inputs are search opportunity and current performance gap, and for these URLs there is no GSC data at all. The model's own rule is that incomplete evidence stays unscored with no automatic decision, so a computed number here would be false precision.

**The authoritative ordering is the release ledger in section 17.** It replaces the flat list this section used to carry, which the review correctly found contradicted section 8's "every defect first" instruction and left several tickets with no wave at all.

Two principles govern it:

1. **"Defects first" is a risk-based sequence, not a literal dependency on every cosmetic item.** A one-line fix that is proven and safe should not wait for the whole enhancement programme. Package 1 ships on its own.
2. **Factual and reliability work outranks enhancement and marketing work.** Packages 2 and 3 are things that are currently wrong. Packages 4 and 5 are things that could be better.

Sport, keyword work, GBP posts, the SMS rebuild and the subscription capture are **parked as separate deliveries** with their own ownership, not folded into a website release.

---

## 15. Rules this work must not break

Carried forward from the SSOT, the workspace rules and this repo's own history. Every one of these has cost something before.

1. **Availability fails closed.** Never reintroduce locally calculated slots as an outage fallback. `app/api/events/[id]/availability/route.ts` contains exactly that pattern and is why EV-009 deletes it.
2. **Local dev points at the live API.** A test POST creates a real booking and a real SMS. Verify with intercepted requests in an isolated fixture, as the 6 September work did.
3. **Prices always live from the management DB.** Never hardcode. Menu prices display bare, with no currency symbol.
4. **Dates through the project's date module.** `lib/api/events.ts:830` and `app/api/events/route.ts:11` both use `toISOString().split('T')[0]` to build a London business date. Benign today because in BST it widens rather than narrows the window, but it is the banned pattern and this is the repo's most repeated bug class. Fix it while in there. Tests run in Europe/London and UTC; keep both green.
5. **"Doors" is banned wording.** Write "arrive from 6:30pm". The pub is open from 12pm Tuesday to Sunday and 4pm Monday, and "doors 6:30pm" tells a customer the pub is shut.
6. **Event posters are square, 1:1.** Never crop, never stretch.
7. **No em dashes in customer-facing text.**
8. **Cloudflare sits in front of Vercel.** Replacing an asset does not unpublish it. Check `cf-cache-status`, not only `x-vercel-cache`.
9. **`redirects()` runs before middleware.** A pattern rule beats every concrete rule.
10. **`getBannedClaims()` does not negate-check.** A page that truthfully denies a facility gets deindexed. Delete the phrase, do not negate it.
11. **Never diagnose from a raw-HTML grep.** Attribute a claim to the field it came from; a hit inside a `<script>` block is not visible copy.
12. **The paired repository.** Hours, availability, deposits, bookings and Turnstile are owned by `OJ-AnchorManagementTools`. EV-006, EV-007 and EV-027 are management-side and must be raised there, not worked around here.

## 16. Capacities, now settled

Settled by owner answer 6 on 6 September 2026. The SSOT was wrong in three places out of four.

| Format | SSOT said | Owner and records say | Action taken |
|---|---:|---:|---|
| Quiz Night | 80 | **60** | `docs/SSOT.md` and `SSOT.json` corrected |
| Cash Bingo | 60 | **60** | no change needed |
| Music Bingo | 90 | **60** | corrected |
| Karaoke | 50 | **60** (record only, not owner-stated) | corrected on the authority of §8, flagged for confirmation |
| Party nights, e.g. Halloween | not recorded | **150** | new entry added to §10 |
| Tasting Nights | not recorded | **25** | added to the Tasting Nights entry |

This mattered because EV-012 puts a live remaining count in front of customers and the denominator has to be right. It also removes a trap: the retired live-music capacity of 150 sits in the discontinued-formats note, and the new party-night figure is also 150, so the SSOT now says explicitly that they are different things.

The stale figures were also carried in prose comments in `lib/game-nights/quiz-night.ts` and `lib/game-nights/music-bingo.ts`, which is the pattern that has caused repeat regressions here: a rule change needs a repo-wide sweep for the number written out, not just an edit to the canonical source. Both were swept.

**A second contradiction, found in passing and outside this scope.** The live `/api/business/hours` response carries `services.sundayLunch.message`: "Sunday lunch bookings require pre-order with £5 per person deposit by 1pm Saturday." `docs/SSOT.md` and the project rules say Sunday lunch has been walk-in since the 17 May 2026 launch, with no pre-order, no Saturday cutoff and no per-roast prepayment. The website consumes that field. This is management-app data, not website copy, so it belongs in the paired repository, but it is wrong and it is being served today. Flagging rather than fixing, because it is nothing to do with event pages.

## 17. Release ledger

One row per ticket. This is the answer to the review's first required change: no ticket without a repository, an owner, an approval state and a wave.

Repo key: **W** website (`OJ-The-Anchor.pub`), **M** management (`OJ-AnchorManagementTools`), **O** owner action outside both.

| ID | Repo | Owner | Approval | Depends on | Package |
|---|---|---|---|---|---|
| EV-000 lightbox suppression | W | dev | owner-approved 6 Sep | none | 1 verify |
| EV-001 karaoke sticky CTA | W | dev | pre-approved | none | 1 verify |
| EV-008 sell-out claim removed | W | dev + editorial | owner-approved 6 Sep | editorial acceptance | 1 verify |
| EV-019 karaoke hub link | W | dev | owner-approved 6 Sep | R21 structural decision | 1 verify |
| §16 capacities | W | dev | owner-approved 6 Sep | none | 1 verify |
| EV-003 read-failure contract | W | dev | pre-approved | §7.3 | 2 reliability |
| EV-016 Turnstile recovery | W | dev | pre-approved | §7.5 | 2 reliability |
| EV-009 dead code | W | dev | **route deletion needs owner** | external-caller check | 2 reliability |
| EV-004 organizer URL | W | dev | pre-approved | §7.6 | 3 factual |
| EV-005 relative schema image | W | dev | pre-approved | EV-007a | 3 factual |
| EV-031 raw category slug | W | dev | pre-approved | none | 3 factual |
| EV-032 em dash normalisation | W | dev | pre-approved | §24 field list | 3 factual |
| EV-033 "this month" heading | W | dev + editorial | pre-approved | none | 3 factual |
| EV-007a category fallback image | W | dev | pre-approved | category key map | 3 factual |
| EV-002 revalidate consistency | W | dev | pre-approved, downgraded | none | 3 factual |
| EV-024 metadata conventions | W | dev | pre-approved | per-route decisions | 3 factual |
| EV-020 breadcrumb markup | W | dev | pre-approved | none | 3 factual |
| EV-035 small correctness list | W | dev | pre-approved | none | 3 factual |
| EV-011 add to calendar | W | dev | pre-approved | §7.1, §7.4 | 4 conversion |
| EV-012 scarcity on the detail page | W | dev | **owner: threshold and wording** | §7.2 | 4 conversion |
| EV-013 confirmation state | W | dev | pre-approved, food wording owner | §7.1, §7.4, hours | 4 conversion |
| EV-014 mobile share | W | dev | pre-approved | §7.1 | 4 conversion |
| EV-010 desktop fold | W | dev | **owner: visual** | none | 4 conversion |
| EV-015 mobile section order | W | dev | **owner: reverses a prior decision** | none | 4 conversion |
| EV-017 visible social proof | W | dev | pre-approved | rating freshness owner | 4 conversion |
| EV-018 facts as text | W | dev + editorial | pre-approved | missing-fact policy | 4 conversion |
| EV-029 analytics contract | W | dev + analytics operator | pre-approved | §13 | 4 conversion |
| EV-021 template drift | W | dev | **owner: defer or do** | none | 5 optional |
| EV-022 category notification capture | W | dev | **deferred unless a service exists** | storage, consent, fulfilment | 5 optional |
| EV-023 `/live-sport` | W | dev | **owner: in or out of scope** | none | 5 optional |
| EV-034 hero imagery | W | dev | **owner: imagery** | supplied artwork | 5 optional |
| EV-028 keyword work | W | dev | blocked | unfiltered GSC export | 5 optional |
| EV-006 performer records | M | owner | owner action | none | separate |
| EV-007b event artwork | M | owner | in hand | none | separate |
| EV-027 slug authoring | M | owner | owner action | none | separate |
| EV-026 GBP event posts | O | owner | owner action | account capability check | separate |
| SMS non-booker nudge | M | owner | "rebuild if needed" | none | separate |
| `sundayLunch.message` contradiction | M | owner | owner action | none | separate |

**Packages**, following the review's recommended order. Do not hold a proven small fix for the whole programme.

1. **Verify existing Wave 1.** Already written. Needs the structural karaoke decision, editorial acceptance and browser checks.
2. **Booking and feed reliability.** Error propagation, Turnstile recovery, monitoring.
3. **Factual presentation.** Schema identity, images, raw labels, honest headings, metadata.
4. **Bounded conversion additions.** Calendar, scarcity, confirmation state, share, fold, social proof, analytics.
5. **Optional programme.** Capture, template refactor, sport, imagery, keywords, GBP.

---

## 18. Implementation status

Branch `fix/event-pages-wave-1`. **Two commits, uncommitted work in progress on top, nothing pushed and nothing deployed.** `main` is untouched.

**What is live right now, checked 6 September 2026.** A separate session deployed the event booking simplification and applied the standing-ticket migration as production version `20260906143610`, so production already carries the shorter form: no seated-or-standing radio and no per-guest name fields. It does **not** carry any of this branch's work. `https://www.the-anchor.pub/events/quiz-night-2026-10-07` still prints the raw `Event type` slug and still publishes `management.orangejelly.co.uk` as the organiser. Both are fixed locally and neither is deployed.

### Commit 1: owner-decided fixes
`fix(events): stop the Christmas overlay covering event booking CTAs`, 12 files.

| Ticket | Change |
|---|---|
| EV-000 | `/events` and `/whats-on` added to the lightbox suppression list |
| EV-001 | `/karaoke` added to the sticky-CTA route list |
| EV-008 | Five sell-out claims removed, and banned in `docs/SSOT.md` |
| EV-019 | Karaoke card on `/whats-on`, cadence "Occasionally", `REGULAR_NIGHTS` renamed `HUB_NIGHTS` |
| §16 | Capacities corrected in `docs/SSOT.md`, `SSOT.json` and two config comments |

### Commit 2: the library layer
`feat(events): tell an outage from an empty diary, and stop inventing facts`, 17 files, 3,070 insertions. Built by five agents on disjoint files, then gate-reviewed.

| Ticket | Change |
|---|---|
| EV-003 (helpers) | `EventsReadResult` reporting `ok` / `partial` / `unavailable` with a failure reason. Existing helpers kept as backwards-compatible wrappers; all ten callers checked. Reuses `lib/api/error-kind.ts` rather than adding a second taxonomy |
| EV-004 | `organizer.url` guarded, plus `sanitiseMainEntityOfPage` which had the same hole |
| EV-005 | Every schema URL absolutised. `doorTime` correctly left absent |
| EV-006 (website half) | The invented "The Anchor Entertainment" organiser is omitted. No heuristic for a wrong-but-present performer |
| EV-007a | Category image fallback map across square, hero and social |
| EV-011 (foundations) | `showAddToCalendar` flag and a self-gating `AddToCalendar` component |
| EV-016 | Turnstile recovery: 10s timeout, live region, retained input, retry, late-token clearing |
| EV-032 (adapter) | `lib/text/normalise-api-prose.ts`, allow-listed prose fields only |
| EV-035 (part) | Free events no longer promise a payment follow-up |

### Defects found during implementation that no ticket had predicted

Each was found by an agent reading the code it was sent to change, and each is real.

| Found in | Defect |
|---|---|
| `lib/api/events.ts` | `from_date` used `toISOString().split('T')[0]`, so between midnight and 1am BST the query asked from yesterday and offered evenings that had already finished |
| `lib/api/events.ts` | A 200 response whose body is not an events list was handed back as a successful empty array. `error-kind` structurally cannot see it, because nothing throws |
| `lib/structured-data/event-schema.ts` | `sanitiseMainEntityOfPage` checked category paths but never the management host, so a management `@id` was still published |
| `lib/event-calendar.ts` | An end time was invented (start plus two hours) when an event had neither `endDate` nor `duration` |
| `lib/event-calendar.ts` | An unparseable `endDate` reached `toISOString()` and threw a `RangeError` |
| `lib/event-calendar.ts` | `escapeIcsText` missed a lone carriage return, which corrupts an ICS file |
| Two files | Pre-existing em dashes in comments |

### Verified, not just asserted

Every fix was negative-tested: reverted, confirmed the matching test failed, restored. A1 failed 19 of 32, A3 failed 14 of 28, A5 failed 5, 1 and 2 across three reverts, A2 failed on all five, the performer and draft changes failed 2 and 1.

Browser-verified at 375x812 with a cleared suppression key **and a negative control**: `/whats-on` and `/events/quiz-night-2026-10-07` show no overlay after 18 seconds, while `/sunday-roast` still fires it. Without the control the test would have passed on a stale key alone, which is how the first attempt fooled itself.

Rendered JSON-LD checked on a live page: no management URL anywhere in the graph, organiser is the public site, image absolute and category-appropriate, `doorTime` absent.

Generated ICS checked live: stable domain-scoped UID, `DTSTART` 18:00Z for a 7pm BST event, `DTEND` 20:30Z matching the SSOT quiz finish, canonical URL, escaped comma.

Gates at both commits: lint zero warnings including all eight repo audits, typecheck clean, full suite in Europe/London **and** UTC, production build compiled.

### A note on estimating this work

Five of my original claims were wrong (§3.1), and in each case the capability existed already. The pattern held during implementation: the capacity precedence contract, the missing-versus-unavailable distinction, the ICS builder and the calendar routes were all already written. **This was mostly a job of wiring up and constraining what existed, not of building what was absent.** Anything estimated from the first draft of this spec would have been estimated far too high.

---

## 19. Verification and the acceptance matrix

Per the project's definition of done, and the standing rule that a passing build is not a working feature. Generic gates remain necessary but are **not** sufficient: Node 20 lint with zero warnings, typecheck, Jest in both Europe/London and UTC, production build.

The journey checks below are what actually decides acceptance. Scope each package to the rows it touches; do not require all of it for a one-line fix.

| Area | Required cases |
|---|---|
| Routes | All four category pages and the hub; detail with and without artwork; a long title; an unknown category; a valid no-date state |
| Event state | Upcoming, cancelled, postponed, rescheduled, ended, unpublished or missing, bookings disabled, cutoff passed, sold out, and standing-only where supported. Per §7.1 |
| Reads | Genuine empty, timeout, upstream 5xx, invalid payload, partial. No false empty diary and no false permanent 404. Injected **beneath the API helper** |
| Booking | Free and pay-on-night, paid confirmed, hold or pending, manual review, decline or cancel, duplicate submit, lost response after a successful write, stale price or capacity, date switch. Per §7.4 |
| Bot check | Script blocked, delayed token, verification outage, expiry, retry success with input retained. Per §7.5 |
| Time and calendar | London and UTC runtimes; a GMT event and a BST event; an event crossing a clock change or midnight; known and unknown end time; a changed or cancelled date. Stable UID, canonical public link, no invented end time |
| Accessibility | Keyboard reachability, visible focus, error announcement and association, heading and DOM order (not CSS visual order), contrast, zoom and narrow reflow, target size, sticky bar and anchor clearance, share fallback when the API is unsupported or permission is denied |
| Performance | Production-mode LCP, layout shift and image transfer captured **before** the change on the detail page and one category page, then compared after, with an agreed no-regression allowance. Throttled mobile as well as desktop. No extra fetch per card |
| Tracking | Consent granted, denied and withdrawn; exactly one delivery route per event; no duplicate `purchase`; no personal data or token in a payload; verified in DebugView **and** in a report |
| Release | Exact commit and file manifest, clean build, deployment ID and alias, cache behaviour on both Vercel and Cloudflare, tested rollback |

**Schema gate, corrected.** Require valid parsed JSON-LD, truthful required properties, and **no critical Rich Results errors**. Optional warnings are recorded with a reason. Never resolve a warning by inventing a fact, and never assert "no warnings" as a gate, because that invites fabricated data to silence one.

**Visual gate, corrected.** The "mobile screenshots identical" assertion applies to EV-010 **in isolation only**, because other tickets deliberately change mobile. One desktop width does not prove a fold: check a long title, the cookie bar, and browser zoom. CSS visual order is not DOM or keyboard order, so check both.

**Alt text.** An empty `alt` is correct for genuinely decorative imagery. The rule is only that an image carrying meaning must not have one. EV-034's karaoke hero is the case in point.

**Production safety.** No live booking, no live SMS, no live payment, no migration, no deployment. See §20.4 for how that is actually enforced rather than assumed.

## 20. Monitoring, release and rollback

The review was right that "raise something visible" is not an operational contract. This section makes it one.

### 20.1 Monitoring

Reuse the existing `logError` path; do not introduce a new system. Signals, all redacted of customer data and carrying a release and request correlation value:

| Signal | Raised when | Owner | Response |
|---|---|---|---|
| Event feed unavailable | the API helper returns `unavailable` on a hub or category page | site owner | check the management API, expect a spike during an outage rather than an alert per request |
| Turnstile failure | no token after 10s, widget error, or verification outage | site owner | distinguish widget failure from a management verification outage |
| Booking submit blocked | any `blocked` result or 503 from the booking route | site owner | check the management API and the phone fallback is visible |
| Payment pending backlog | `pending_payment` results without a later confirmation | site owner | chase in the management app |

Do not email on every transient client error. Alert on rate, not on instance.

### 20.2 Release

The website deploys manually to Vercel. **A push does not deploy.** Nothing in this spec authorises a deployment.

Release record, per package: the approved commit SHA, the exact file manifest, a clean production build, preview verification, the production deployment ID and alias, live read-only smoke evidence, and the rollback step. Cloudflare sits in front of Vercel, so a purge does not unpublish and `cf-cache-status` must be checked as well as `x-vercel-cache`.

Nothing in this spec requires a database migration. If a later ticket does, in particular EV-022 capture, it names its migration and takes a separate approval.

### 20.3 Rollback

Trigger: any of the booking form failing to render, the booking route returning 5xx above its normal rate, or a rendered page asserting a fact the SSOT contradicts. Action: redeploy the previous Vercel deployment by ID, then confirm through a read-only public GET. No forward-fix under pressure on a booking surface.

### 20.4 Test isolation, which is a production-safety matter

The website points at the **live** management API, so a careless test creates a real booking and a real SMS. Browser-level interception does not intercept server-side fetches. Therefore:

- Use a server-side fixture or dependency injection with an outbound **deny by default** guard.
- Assert that an unhandled external write request **fails the test** rather than escaping.
- Exercise the real page to route to adapter path through fixtures; do not mock away the boundary under test.
- Keep safe public GET smoke checks separate from every mutation test.
- Test payment credentials only in an isolated environment.

---

## 21. Which skills to use when this is implemented

Checked the installed set against this job. Findings, so nobody re-litigates it later.

| Skill | Use it? | Why |
|---|---|---|
| `seo-powerhouse` | Yes, Quick Checkup mode | It supplies the discipline this spec is built on: evidence before recommendation, approval buckets, the implementation-ticket format, the 0-48h / 1-2wk / 6-8wk verification windows, and the only event-aware technical checklist in the set. Do not run Full Overhaul; this is two templates, not a site audit. |
| `page-cro` | Yes, scoped to the two templates | Its seven-dimension framework (value proposition, headline, CTA, hierarchy, trust, objections, friction) is the right lens for EV-010 through EV-018. Note it has no scoring model and is SaaS-shaped, so its Demo Request block is the only directly transferable part. |
| `schema-markup` | Yes, narrow | For EV-004, EV-005 and EV-024 only. Be aware its worked Event example is a virtual USD event and it says nothing useful about recurring events. |
| `editorial-team` | Yes, for any copy change | House rule: all editorial content goes through it, and it checks `docs/SSOT.md` first. EV-008, EV-018 and EV-025 are copy changes. |
| `keyword-plan` | Not yet | It stops and waits for pasted Google Keyword Planner or GSC data. Without that it can only produce unnumbered clusters. Run it per category **after** a fresh GSC export, not during implementation. |
| `ai-seo` | No | Its audit half needs manual multi-platform SERP testing, and Google's own AI features documentation says no special files or schema are needed. The two useful pieces are already folded into EV-018. |
| `analytics-tracking` | No | Generic and SaaS-shaped. This repo already has `lib/gtm-events.ts` and a GA4 setup with known quirks; a generic plan would talk past it. |
| `content-strategy` | No | Wrong altitude. It answers "what should I write", not "how should these templates convert". |

## 22. Decisions still needed, in one list

Everything in this spec that cannot proceed without the owner, consolidated so it can be answered in one pass rather than drip-fed.

### Blocks a ticket that is otherwise ready to build

| # | Decision | Recommendation |
|---|---|---|
| 1 | **EV-012 scarcity on the event detail page.** Where does the remaining-places label go, and does the existing threshold of 20 carry over? | Put it beside the booking action, and keep 20. The wording and threshold are already shipped behaviour on the four category pages, so this is only a placement question. |
| 2 | **EV-010 the desktop fold.** At 1440x900 the poster runs y150 to y651, the H1 is sliced, and the date, price and Book button are all below the fold. Cap the poster height? | Yes. Mobile is already correct and must not change. |
| 3 | **EV-015 mobile section order.** The booking form currently renders above the description on mobile, so an undecided visitor meets a form before the pitch. Reverse it? | Yes, but it reverses a deliberate earlier decision, so it is yours. Must be a DOM change, not a CSS `order` swap, or screen reader and keyboard order stay wrong. |
| 4 | **EV-021 template ordering.** Do the narrow section-order fix now, or defer the whole thing? | Defer. The review was right that an identical-layout snapshot would be brittle and would encourage empty sections. |
| 5 | **EV-023 `/live-sport`.** In scope or out? It is the only one of the six with no live data, so it can advertise a finished tournament indefinitely. | Give it a hero CTA now, decide live fixtures separately. |

### Content and imagery

| # | Decision | Recommendation |
|---|---|---|
| 6 | **Karaoke, parties and tasting nights have no photography.** They fall back to a neutral crowd shot, which is honest but generic. Commission photography? | Karaoke first, since it is the largest keyword cluster on the site and has the weakest page. |
| 7 | **`public/images/private-hire/parties.jpg`** is 1024x1024 and could serve the parties category, but it is private-hire room photography rather than a public party night. Use it? | No. It would imply a room hire rather than the night. |
| 8 | **EV-034 hero imagery.** The `/quiz-night` hero source is 640x480 and is displayed up to 1440px wide, so it is upscaled two to four times. Every category fallback photo is 640x480 or smaller. All clear Google's 50,000 pixel minimum; none reaches the recommended 1920px width. Replace the source photography? | Yes, but capture a performance baseline first: a bigger hero can make the booking surface slower on mobile, which would be a net loss. |
| 9 | **Spaced en dashes.** Should ` , ` style en dashes also become commas, as em dashes now do? | No. The SSOT bans em dashes only, and en dashes carry ranges correctly elsewhere on the site. |

### Cleanup and structure

| # | Decision | Recommendation |
|---|---|---|
| 10 | **`lib/static-events.ts`** has no importer, but `SSOT.json` `meta.sources` still cites it as a provenance record, and you declined an equivalent dead-code cleanup in September. Delete it? | Leave it. Not worth reopening a settled preference for 10KB. |
| 11 | **`app/api/events/[id]/availability/route.ts`** has no caller in this repo, and contains the locally-calculated availability fallback the project bans for table bookings. Zero imports does not prove no external caller for an HTTP endpoint. Remove it? | Check request logs first, then remove. The unsafe fallback is the real hazard and should be reviewed separately from the deletion. |
| 12 | **`DIRECTIONS_URL`** is now duplicated between `components/FindUsSection.tsx` and the booking form. It belongs in `lib/constants.ts` beside `CONTACT.coordinates`. | Move it. Trivial, but two copies of a destination is how they drift. |

### Beyond this repository

| # | Item | Status |
|---|---|---|
| 13 | **EV-007b artwork** for the ten events without any | In hand, owner producing |
| 14 | **EV-006 performer records.** Live quiz records publish the owner as performer; `docs/SSOT.md` §10 names Question One Quiz Masters. The website now omits an absent performer but deliberately does not guess at a wrong one | Management app, owner action |
| 15 | **EV-026 GBP event posts.** Documented, free, and a single-location UK food and drink business is explicitly the supported case. Check the account's actual recurring-post capability before promising a programme | Owner action |
| 16 | **EV-027 slug quality.** `/events/quiz-night-2026-10-07` is the URL for "A Hint of Halloween Quiz Night" | Management app authoring |
| 17 | **The SMS non-booker nudge.** Answered "rebuild if needed" on 6 September. This is the larger of the two channels | Management app |
| 18 | **`services.sundayLunch.message`** in the live `/api/business/hours` response still says Sunday lunch needs pre-order and a £5 deposit by 1pm Saturday, contradicting the walk-in rule since 17 May. The website consumes it | Management app, and it is being served today |

### Not a decision, a warning

**Nothing in this spec authorises a deployment.** The website deploys manually and a push does not deploy. Two things also make this branch unusual: another session shipped to production during this work, and the deploy model itself is contested in the repo, with one document describing manual `vercel --prod` and another describing auto-deploy on push. Confirm which before releasing anything.

---

## 23. Sources for the practice claims in this spec

Every non-repo claim above traces to one of these. Nothing here is folklore.

- Event structured data requirements, recommended properties, image guidance, the unique-leaf-URL rule and the ineligible-content list: https://developers.google.com/search/docs/appearance/structured-data/event
- Self-serving review and rating restriction: https://developers.google.com/search/docs/appearance/structured-data/local-business
- No special files or schema needed for AI features; important content must be textual: https://developers.google.com/search/docs/appearance/ai-features
- Carousels beta availability, EEA plus Turkey and South Africa only: https://developers.google.com/search/docs/appearance/structured-data/carousels-beta
- Business Profile event posts, and UK single-location food-and-drink eligibility: https://support.google.com/business/answer/7342169
- Local ranking is relevance, distance and prominence, and cannot be paid for: https://support.google.com/business/answer/7091
- Attention above the fold, 57% and 74%: https://www.nngroup.com/articles/scrolling-and-attention/
- Form field count matters more than step count; 11.3 average fields; 17% abandon on complexity: https://baymard.com/blog/checkout-flow-average-form-fields
- Cart abandonment reasons, including 18% on forced account creation: https://baymard.com/lists/cart-abandonment-rate
- Cutting fields raises conversion; the Eliminate, Automate, Simplify order: https://www.nngroup.com/articles/web-form-design/
- CMA banned practice 7, false limited availability: https://www.gov.uk/government/publications/unfair-commercial-practices-cma207/unfair-commercial-practices
- CMA consumer-protection drive, live event tickets a named sector: https://www.gov.uk/government/news/cma-launches-major-consumer-protection-drive-focused-on-online-pricing-practices
- WCAG 2.2 target size, 24x24 CSS pixels at AA: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html

### Claims deliberately excluded as unevidenced
The commonly quoted "each extra form field costs 4 to 6% conversion", "sticky CTAs lift conversion 5 to 12% per Baymard" and "18 to 32% per ConversionXL" figures do not appear on either organisation's site. They are not used anywhere in this spec, and no ticket here is justified by a promised percentage.
