# Meta Ads change brief

For the developer to action in Ads Manager or via the CheersAI campaign builder.
Prepared 8 August 2026.

---

## The one change that matters

**Switch event campaigns from conversion optimisation back to traffic
optimisation.**

| Setting | Change from | Change to |
|---|---|---|
| Campaign objective | `OUTCOME_SALES` | `OUTCOME_TRAFFIC` |
| Ad set optimisation goal | `OFFSITE_CONVERSIONS` | `LINK_CLICKS` (or `LANDING_PAGE_VIEWS`) |

Leave bid strategy on `LOWEST_COST_WITHOUT_CAP`. Leave targeting alone (18 to 65,
5 mile radius on 51.4625, -0.5021). Leave the destination short links alone: they
resolve correctly and carry full UTMs.

### Why

Conversion optimisation asks Meta to find people likely to complete a booking.
Meta needs roughly 50 optimisation events per ad set per week to leave the
learning phase. It has received **one** event booking through CAPI in three
months, so the optimiser is bidding blind and paying a large premium for people
it cannot identify.

The switch happened on 12 May 2026. Like for like, same event type, same radius:

| Music Bingo campaign | Objective | Spend | Clicks | CPC | CPM | CTR |
|---|---|---|---|---|---|---|
| Launched 2 May | traffic | £29.61 | 196 | £0.15 | £1.69 | 1.12% |
| Launched 7 Jul | sales | £58.77 | 79 | £0.74 | £5.84 | 0.79% |

Twice the money, 40 per cent fewer clicks. Average frequency across all campaigns
is 1.14 to 1.58, so this is not audience fatigue. It is broken bidding.

Revisit conversion optimisation only once booking volume can actually feed it.

---

## Secondary changes, in priority order

### 1. Consolidate the ad sets

Currently 3 ad sets per campaign (`Warm-up`, `Tomorrow Push`, `Last Chance`) on
about £45 total. That is three separate learning phases per campaign, each
starting from zero, on £15 each.

Use **one ad set** and handle timing through creative rotation inside it. If a
second ad set is wanted, make it a warm audience built from the customer list
rather than another slice of the same cold pool.

### 2. Cut the number of ads

Currently 9 to 16 ads per campaign. At £45 total that is about £5 per creative and
a few hundred impressions each. Nothing can learn, and no ad can be judged.

Run **3 or 4 ads** at a time.

### 3. Fix the headlines

Every headline must contain at least one concrete fact: a host name, a price, a
date, or a named prize or theme. Current examples and the problem with them:

| Current headline | Problem |
|---|---|
| "Instant Fun Awaits!" | Says nothing |
| "Quiz Night Awaits!" | Says nothing, and used twice |
| "Quiz & Laughs!" | Says nothing |
| "Tonight Only: Book Now!" | Urgency with no reason |

**Nikki Manfadge appears in zero headlines.** She is a genuine local draw. The
£5 and £3 prices are strengths that remove risk, not details to hide.

The generator already has the rule "punchy, specific, no generic phrases"
(`src/lib/campaigns/generate.ts:112`). It is not being enforced. Add a hard
constraint requiring a name, price, date or named prize.

---

## What NOT to change

- **The destination links.** All nine short links resolve cleanly (307) to the
  correct event page with full UTMs. The plumbing is fine.
- **The targeting.** 5 mile radius around Stanwell Moor is right.
- **The cookie consent banner.** It currently blocks 32 of 87 conversions from
  reaching Meta, and that is correct behaviour. Sending hashed contact data to
  Meta needs real consent and is not covered by soft opt-in.

---

## The `fbc` gap: investigated 9 August 2026, not a bug

The original note here asked whether `fbclid` was being captured and persisted
reliably. It is. The low `fbc` count is a conversion problem, not a tracking one.

Checked against `booking_conversion_events` (91 rows, 7 July to 8 August), the
management short-link database, and a live probe of the ad short links:

- **Only 4 of 91 conversions ever carried an `fbclid`**, because barely any paid
  click becomes an online booking. Every paid click that did convert had its
  `fbclid` captured: 4 out of 4.
- July and August produced roughly **1,209 human paid-social link clicks** (2,670
  total less 1,461 bots) against those 4 bookings. August alone: 592 paid clicks,
  23 bookings, zero carrying an `fbclid`.
- The short links pass `fbclid` through cleanly in a single 307 hop, verified live.
- Of the 4 `fbclid` bookings, 3 had no marketing consent, so `fbc` was correctly
  withheld. That is the banner working, and it stays.
- Of the 5 bookings that did carry `fbc`, only **one** is a real ad attribution.
  The other four carried the same `_fbc` cookie dated 13 January 2026, read six
  months later on organic Facebook bookings. Far outside any Meta attribution
  window, so it attributed nothing.

**Read the real figure as 1 in 91, not 5 in 87.** It reinforces the main change
above: there is nowhere near enough booking volume to feed conversion optimisation,
and judging these campaigns on online bookings will keep understating them.

Three genuine defects were found alongside this and fixed in `lib/booking-attribution.ts`:

1. A stale `_fbc` cookie beat a freshly captured `fbclid`. The captured click now
   wins when the two disagree, and a cookie older than Meta's own 90 day `_fbc`
   lifetime is dropped rather than sent.
2. `fbc` was stamped with the booking time instead of the click time. The click
   time is now stored when the `fbclid` is first seen and used verbatim.
3. `fbclid` was read only from the most recent campaign URL, so arriving via a
   second link carrying only UTMs wiped it. Click IDs now carry forward.

None of these touch consent gating. None will move the headline number much: they
improve the quality of the few ad-attributed bookings that exist.

---

## How to tell it worked

Watch **CPC and CPM**, not conversions, for the first two weeks.

- Target CPC: back under £0.20 (currently £0.69 to £1.09)
- Target CPM: back under £2.00 (currently £5.77 to £7.66)

If CPC has not fallen materially within a week of the switch, something else is
wrong and it is worth looking again.

Longer term, judge these campaigns on **attendance**, not online bookings. Most
people who see a pub bingo ad and decide to come will simply turn up. That means
recording check-ins consistently: `event_check_ins` holds only 98 rows across all
events, so attendance is currently guesswork.
