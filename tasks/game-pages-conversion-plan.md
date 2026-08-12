# Game night pages: conversion overhaul

Target pages: `/quiz-night`, `/cash-bingo`, `/music-bingo`, `/karaoke`.
Goal: one shared template, built to convert paid media traffic into event bookings, ready for a 3 month campaign.
Written 12 August 2026. All "current state" claims below were verified against the live site and the codebase on that date.

---

## 1. The headline problem

The page you have to advertise to cannot take a booking.

| | Category page (`/quiz-night`) | Event page (`/events/...`) |
|---|---|---|
| Persuasion copy | 12,262 chars | 4,916 chars |
| Booking form | none | inline, working |
| CTA above the fold | none | yes |
| Survives a 3 month campaign | yes, evergreen | no, expires on the date |

Every campaign click currently pays for an extra hop. Fixing that is the single highest-value change on this list, and everything else compounds on top of it.

Second headline problem: **the pages never show the game.** All four use the same generic hero, `/images/page-headers/home/page-headers-homepage.jpg`, which is a photo of the pub's exterior. The only game imagery anywhere is one AI-generated poster per event pulled from the management DB (actual filenames look like `ChatGPT_Image_Aug_6_2026_06_43_48_AM.png`). There is not one real photograph of a quiz or a bingo night on the site, and zero video. You cannot showcase a game you never show.

---

## 2. Verified current state

**Already good, keep it:**
- Rich, accurate copy on all four pages: how the night runs, house rules, tips, prizes, food cross-sell.
- FAQ with schema on all four. Quiz night has 9 questions.
- `EventSeries` / `Event` JSON-LD.
- Upcoming dates pulled live from the management DB. Quiz night has 7 dates listed through December 2026, so there is real campaign runway.
- Shared `EventDateCards` component already extracted across the four pages.
- Working booking infrastructure: inline form on event pages (seats, seating preference, name, mobile, email, Turnstile), waitlist API, PayPal endpoints.
- Booking payload already captures `utm_*`, `fbclid`, `gclid`, `fbp`, `fbc`, `short_code`. Attribution is not the problem.
- CTA components already fire GTM: `EventBookingButton`, `BookTableButton`, `PhoneButton`.
- `StickyCtas` is mounted globally in `app/layout.tsx`, so a sticky CTA already exists site-wide.

**Built but unused on these four pages:**
- `components/features/Gallery.tsx` (used on zero pages anywhere).
- `components/reviews/*`: `GoogleReviews`, `ReviewsCarousel`, `ReviewsBadge`, `ReviewSection`, `TestimonialSection`. Used on private hire, beer garden, book-table. Not on any game page.
- `components/psychology/*`: `TrustBar`, `ValueProofStrip`, `UrgencyKitchenStatus`. The game pages import only `RegretReduction` (and `PsychBadge` on cash bingo).
- `SectionViewTracker`, currently only on `/sunday-roast`.

**Confirmed non-issues, do not spend time here:**
- `/contact` on the karaoke page 301s cleanly to `/find-us`.
- The four pages are already content-rich. This is not a "write more words" job.

---

## 3. The template

Replace four ~500 line page files with one template driven by a per-game config. Each page becomes config plus its live event data.

Suggested shape:

```
components/features/GameNight/
  GameNightPage.tsx          the template
  GameNightHero.tsx          media, next-date badge, primary CTA, at-a-glance chips
  GameNightBooking.tsx       inline booking, date switcher, waitlist fallback
  HowItWorksSteps.tsx        numbered steps, one image each
  GameNightProof.tsx         reviews, attendance, past winners
  ObjectionStrip.tsx         near-CTA objection answers
lib/game-nights/
  index.ts                   registry
  quiz-night.ts
  cash-bingo.ts
  music-bingo.ts
  karaoke.ts
```

Each config carries: slug, display name, hero media (image plus optional video), price, capacity, door and start times, format steps, prizes, house rules, what to bring, objections, FAQ, host, proof items, related games, and a `promotable` flag.

`promotable: false` for karaoke. That flag must suppress the recurring `EventSeries` schema and any copy implying a regular slot, while leaving the page fully able to convert. Per `docs/SSOT.md`, karaoke is occasional only in 2026, has no fixed host, and must never be presented as a weekly, monthly or Friday fixture.

---

## 4. The washing list

### Wave 0: measurement and scaffold. Do before any spend.

- [ ] 0.1 Build the `GameNightPage` template and the four configs. No content change yet, pure refactor, so the diff that follows is reviewable.
- [ ] 0.2 Add `SectionViewTracker` to every section of the template. Without it you will know the campaign is failing but not where.
- [ ] 0.3 Add scroll-depth milestones (25/50/75/100) per page.
- [ ] 0.4 Track CTA clicks by position, not just by page: `hero`, `dates_list`, `inline_form`, `sticky`, `closing_band`. Position is what you will optimise.
- [ ] 0.5 Register `event_booking_confirmed` as a GA4 key event and confirm `GA4_MEASUREMENT_ID` plus `GA4_API_SECRET` are set in Vercel production. Previously flagged as an open owner action.
- [ ] 0.6 Build a per-game funnel view: page view, form view, phone entered, confirmed. The booking form already emits `form_view`, `phone_entered`, `submit`, `confirmed`, `blocked` steps, so the events exist, the reporting does not.
- [ ] 0.7 Verify UTM and click-id capture survives on the category-page form, not just the event page. The payload supports it, the new placement needs proving.
- [ ] 0.8 Agree the success metric before launch. Recommended: cost per confirmed seat, with covers-per-event as the sanity check.

### Wave 1: the fold and inline booking. Biggest lift, no new assets needed.

- [ ] 1.1 **Add a primary CTA to the hero.** Currently there is none on any of the four. First clickable element below the nav on `/quiz-night` sits roughly 680px down.
- [ ] 1.2 **Next-date badge in the hero:** "Next: Wednesday 19 August, doors 6:30pm". Pull from live event data, never hardcode.
- [ ] 1.3 **At-a-glance chips under the H1:** price, team size, duration, age policy, free parking. Scannable in two seconds.
- [ ] 1.4 **Embed the booking form on the category page**, defaulting to the next date, with a compact date switcher for later dates. Reuse `ManagementEventBookingForm`, which already handles seats, seating preference, Turnstile, waitlist and conversion forwarding.
- [ ] 1.5 **Waitlist fallback when a date is sold out.** `/api/event-waitlist` already exists. A sold-out night should still capture the lead.
- [ ] 1.6 **Fix the CTA labels.** On the live quiz page, six dates say "Book seated or standing tickets" and one says "Reserve a table, pay quiz entry on arrival". For a £3 quiz, "seated or standing tickets" invents a decision the visitor cannot yet make. Recommended pattern: "Book your table for Wed 19 Aug", with the seated or standing choice moved inside the form where it can be explained.
- [ ] 1.7 **Make "pay on arrival" loud** on quiz night and music bingo. Removing the perceived need to pay now is a cheap, large friction cut.
- [ ] 1.8 **Minimum viable first step:** first name and mobile only. Everything else progressive. Every extra required field costs bookings.
- [ ] 1.9 **Make the global sticky CTA game-aware** on these pages: "Book quiz night, Wed 19 Aug" beats a generic "Book a table".
- [ ] 1.10 **Replace the hero image per game.** Also a page-speed item: the current hero is a 1920px homepage JPEG serving four pages that are all about something else. LCP matters when you are paying for the click.
- [ ] 1.11 **Solo and small-group reassurance next to the CTA** on quiz night. "No team? We will match you up" is already in the copy but buried. It removes the biggest single objection to a team quiz.
- [ ] 1.12 **Cash-only warning early and unmissable on cash bingo.** £10 per book, cash only, £1 daubers cash only. Discovering that on arrival is a bad night out and a lost regular. Discovering it after booking is a no-show.

### Wave 2: show the game. Asset-dependent, highest impact on "what can I expect".

- [ ] 2.1 **Hero video loop per game**, 10 to 20 seconds, silent, muted, poster-first, lazy, no layout shift. Same clip doubles as ad creative, so the shoot pays for itself twice.
- [ ] 2.2 **"How it works" as a visual sequence**, 3 to 5 numbered steps with one image each. Currently told in prose, never shown.
- [ ] 2.3 **Gallery of past nights per game.** `Gallery` component already exists and is unused. Real crowd, real teams, real prize moments.
- [ ] 2.4 **Screenshots from the game apps** to show the tech and make the night feel properly run:
  - Quiz: `/display/[sessionId]` (question and leaderboard screens) and `/entry/[sessionId]` from `OJ-QuizNight3.0`.
  - Cash bingo: `/display` called-numbers board from `OJ-CashBingo`.
  - Music bingo: `/display/[sessionId]` from `OJ-MusicBingo`. Note its guest screen has been removed, so the display screen plus printed cards is the story.
- [ ] 2.5 **Photograph the physical kit:** quiz sheets, bingo books, daubers, the prize board, the big screen in the room.
- [ ] 2.6 **Replace the AI-generated event posters in the management DB** with real photography. These currently render on the site and on social shares, and they read as stock.
- [ ] 2.7 **Per-game OG images** so shared links and ad previews show the game, not the pub sign.
- [ ] 2.8 **Show the host.** Nikki Manfadge for music bingo, Question One Quiz Masters for the quiz. A named face converts better than an anonymous night.

### Wave 3: proof and objections.

- [ ] 3.1 **Reviews on every game page**, filtered to the night where possible. Components already exist.
- [ ] 3.2 **Google rating and review count in the hero trust line.**
- [ ] 3.3 **Real scarcity from real data.** Capacities are known: quiz 80, cash bingo 60, music bingo 90. "80 seats, 23 left" is honest urgency. Never fake it.
- [ ] 3.4 **Music bingo sells out**, per the SSOT. Say so, with the evidence, and put the waitlist behind it.
- [ ] 3.5 **Snowball jackpot live on cash bingo.** It rises £20 and 2 calls each month it rolls over. A live, rising number is the strongest urgency mechanic any of these four nights has. Current value must come from the event record, never hardcoded.
- [ ] 3.6 **Past winners and prize moments** as a small recurring proof block.
- [ ] 3.7 **Objection strip next to the CTA**, not buried in the FAQ. Per game: do I need a team, are we good enough, will it be busy, can we eat first, where do I park, what does it cost, what age, is it cash.
- [ ] 3.8 **Set the phone-free rule expectation early on quiz night.** Minus 5 points for phone use is a genuine differentiator and a talking point, but a surprise on the night if the page hides it.
- [ ] 3.9 **Kitchen times against event times** on every page. "Eat from 6pm, eyes down at 7pm" answers the real planning question.

### Wave 4: campaign readiness.

- [ ] 4.1 **Always keep three or more future dates visible per game.** A page showing one date reads as a dying night. Quiz night is fine to December; check the other three.
- [ ] 4.2 **Graceful empty state** when a format has no dates: push to the other nights rather than dead-ending. This is karaoke's normal state, so it has to be good.
- [ ] 4.3 **Private night cross-sell on music bingo.** The SSOT confirms private music bingo nights are available on request. That is a much higher value conversion than a £3 seat, and it is currently not offered on the page.
- [ ] 4.4 **Group and corporate path on quiz night.** Private trivia and corporate quiz nights already appear in the FAQ. Give them a real CTA.
- [ ] 4.5 **Short-link support end to end** for offline and social. `short_code` is already in the booking payload.
- [ ] 4.6 **Mobile-first QA pass.** Paid social traffic is overwhelmingly mobile, and the fold on mobile is where this campaign is won or lost.
- [ ] 4.7 **Update `docs/SSOT.md`** with any new owner-confirmed facts this work produces (typical attendance, photography policy), then run `npx jest tests/ssot-drift-guard.test.ts`.

---

## 5. Asset shot list

For the owner to capture. One quiz night and one music bingo covers most of it.

**Per night, priority order:**
1. Wide room shot, full, from the back. This is the single most important image, it proves the night is busy.
2. A team mid-round, heads together, pens down on the sheet.
3. The host working the mic.
4. Prize moment, winners with the bar tab or the cash.
5. The big screen in context, with the room in frame.
6. Close-up of the kit: sheets and pens, or bingo book and dauber.
7. Food and drinks on a table during the night, ties the food cross-sell to the event.
8. One vertical video, 15 to 30 seconds, of the room reacting. Handheld phone footage is fine and often converts better than polished video.

**Consent note:** these are photos of identifiable customers, used in paid advertising. Get verbal consent on the night and avoid children in anything used for ads.

**From the game apps** (I can capture these, see open question 3): quiz display and entry screens, cash bingo called-numbers board, music bingo display screen.

---

## 6. Per-game angles worth leaning on

| Game | Strongest hook | Biggest friction | Under-used asset |
|---|---|---|---|
| Quiz night | Phone-free, £25 bar tab, wine for second from last | "I have no team" | Solo matching, the second-from-last prize is genuinely charming and memorable |
| Cash bingo | Rolling snowball jackpot | Cash only, 18+ | Live jackpot value as urgency |
| Music bingo | Song clips not numbers, drag host, sells out | Understanding the format | Private nights on request, a much bigger sale |
| Karaoke | Free entry | No regular slot, cannot be promoted | Graceful "next listed night" state |

---

## 7. Sequencing

Waves 0 and 1 need no new assets and should ship before any spend. Wave 2 gates on photography. Waves 3 and 4 can land during the campaign, but 3.3 and 3.5 (real scarcity, live jackpot) are worth pulling forward if the data is easy to expose.

Do not start spend until Wave 0 is live. Running three months of media against pages you cannot diagnose is how a budget disappears with nothing learned.
