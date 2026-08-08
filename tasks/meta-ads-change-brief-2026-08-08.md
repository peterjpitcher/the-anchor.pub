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

## Worth fixing separately

Only **5 of 87** recorded conversions carry `fbc`, the click identifier that ties
a booking back to the ad that caused it. Without it Meta cannot attribute a
booking even when the event is sent. Worth investigating whether `fbclid` is
being captured and persisted reliably on landing.

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
