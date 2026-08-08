# Event ads: why clicks are not becoming bookings

Discovery, 8 August 2026. Evidence from the CheersAI database (`nbkjciurhvkfpcpatbnt`),
the management database (`tfcasgxopxegwrabvwat`), the live site, and both codebases.

---

## 1. The funnel in real numbers

Nine Meta event campaigns, 2 May to 8 August 2026.

| Measure | Value |
|---|---|
| Spend | £318 |
| Impressions | 77,112 |
| Clicks | 733 |
| Online event bookings recorded (all sources, all time) | 6 |
| Event bookings attributed to paid social | 4 |
| Conversions Meta itself recorded | 0 on every campaign |

Actual bookings for the advertised events:

| Event | Date | Bookings | Seats | Capacity |
|---|---|---|---|---|
| Cash Bingo | 29 Jul | 5 | 19 | not set |
| Quiz Night | 22 Jul | 4 | 14 | not set |
| Music Bingo | 17 Jul | 7 | 21 | 60 |
| Cash Bingo | 1 Jul | 7 | 28 | 50 |

So roughly £45 to £59 of ad spend per event, producing at best a handful of the
4 to 7 bookings each event receives.

**The plumbing is not the problem.** All nine ad short links resolve cleanly (307)
to the correct event page carrying full UTMs. The landing page is good: clear
headline, honest reassurance ("No payment now, pay £5 on arrival"), a visible
"Reserve table" button, phone number, facts strip, FAQs.

---

## 2. Finding 1: the objective switch on 12 May broke the economics

This is the single biggest lever.

| Launched | Objective | Optimisation |
|---|---|---|
| 2 May | `OUTCOME_TRAFFIC` | `LINK_CLICKS` |
| 12 May onward | `OUTCOME_SALES` | `OFFSITE_CONVERSIONS` |

Like for like, same event type, same 5 mile radius around Stanwell Moor:

| Campaign | Objective | Spend | Impressions | Clicks | CTR | CPC | CPM |
|---|---|---|---|---|---|---|---|
| Music Bingo, 2 May | traffic | £29.61 | 17,542 | 196 | 1.12% | £0.15 | £1.69 |
| Music Bingo, 7 Jul | sales | £58.77 | 10,055 | 79 | 0.79% | £0.74 | £5.84 |

Twice the money, 40 per cent fewer clicks. Across all campaigns CPM went from
£1.58 to £1.69 (May) up to £5.77 to £7.66 (June onward), and CPC from £0.14 to
£0.15 up to £0.69 to £1.09.

**Why it happened.** `OFFSITE_CONVERSIONS` asks Meta to find people likely to
complete a booking. Meta needs roughly 50 optimisation events per ad set per week
to exit the learning phase. It has received **one** event booking through CAPI in
three months. The optimiser is blind, so it pays a large premium for users it
cannot actually identify.

Average frequency is only 1.14 to 1.58, so this is **not** audience fatigue. The
audience is not burnt out. The bidding is broken.

---

## 3. Finding 2: the conversion signal barely exists

From 87 recorded conversion events:

| Signal | Count |
|---|---|
| Sent to Meta via CAPI | 55 |
| Skipped, no marketing consent | 32 (37%) |
| Carrying `fbc` (the click ID that ties a booking back to an ad) | 5 |
| **Event** bookings actually sent to Meta | **1** |

Two separate leaks:

1. **37 per cent of all conversions are dropped at the cookie banner.** No consent,
   no CAPI event.
2. **Only 5 of 87 have `fbc`.** Without it Meta cannot connect a booking to the ad
   that caused it, even when the event is sent.

The result is that the campaigns optimising for conversions have effectively never
been shown a conversion.

---

## 4. Finding 3: the booking form is built for a festival, not a £5 bingo night

`components/features/EventBooking/ManagementEventBookingForm.tsx:212`

```ts
const collectsAttendeeNames = !isMultiTypeEvent && isPaidEvent && seats > 1
```

Any paid event booked for two or more people requires **the full name of every
guest**, and the submit button is hard disabled until all names are filled
(`:1025`). The on-screen copy reads (`:904`):

> Please use each guest's real name, everyone will need photo ID matching their
> ticket on the night.

Average booking size is 3 to 4 seats, so **essentially every booking hits this**.

A person clicking a Facebook ad on a Friday evening for a £5 country music bingo
night must know and type their three friends' full legal names, and then tell them
all to bring photo ID. For a village pub social night this is disproportionate.
It is the highest friction point in the entire funnel.

---

## 5. Finding 4: the page copy tells people not to book online

The event body copy says:

> Tickets are just £5. Book your seats by calling 01753 682707 or pop in if space
> allows.

That sits directly above the online booking form. It offers two easier alternatives
to the thing the ad spend is trying to make happen, and "pop in if space allows"
actively grants permission not to book at all.

---

## 6. Finding 5: budget is fragmented past the point of learning

Each campaign runs **3 ad sets and 9 ads on about £45 total**. That is roughly £5
per creative and a few hundred impressions each. Neither Meta nor a human can learn
anything from that. Ads cannot be judged, and delivery cannot optimise.

---

## 7. Finding 6: the creative is generic where the page is specific

Top headlines by clicks:

- "Tonight Only: Book Now!"
- "2 Rounds + Pizza!"
- "Instant Fun Awaits!"
- "Quiz Night Awaits!" (used twice)
- "Quiz & Laughs!"

None of them name Nikki Manfadge (a genuine draw), the £5 price, the prizes, the
Dolly Parton and Johnny Cash rounds, or Stanwell Moor. The landing page is more
specific and more persuasive than the ads that pay to reach it.

---

## 8. Honest opinion

Three things are true at once, and the third is the uncomfortable one.

**The ads are not the main problem.** The targeting is sensible, the links work,
the tracking architecture is well built. The bidding objective is wrong and the
creative is bland, but neither would matter much if the rest worked.

**The website is not the main problem either.** The landing page is well designed
and the reassurance copy is good. One form rule and one sentence of body copy are
doing most of the damage.

**The goal may be the wrong goal.** At 4 to 7 bookings per event against £45 to £59
of spend, you are paying roughly £8 to £12 per booking for a £5 ticket, before any
allowance for people who would have come anyway. Most people who see a pub bingo
ad and decide to come will simply turn up. Online bookings may be a poor measure of
whether the advertising works. Attendance on the night is the real number, and
`event_check_ins` holds only 98 rows across all events, so it is not being used
consistently enough to answer that question yet.

Put plainly: you are spending real money asking Meta to optimise for an event it
has seen once, and sending the people who do click into a form that asks for their
friends' legal names.

---

## 9. Ideas to discuss, in priority order

### A. Free, do first (measurement and bidding)

1. **Switch event campaigns back to `OUTCOME_TRAFFIC` / `LINK_CLICKS`.** The
   evidence is a clean like for like: same event, same radius, half the cost per
   click. Revisit conversion optimisation only once volume justifies it.
2. **Alternative: optimise for `LANDING_PAGE_VIEWS`** rather than link clicks, so
   Meta filters out accidental taps without needing booking volume.
3. **Fix `fbc` capture.** Only 5 of 87 conversions carry it. This is the difference
   between attributed and invisible.
4. **Revisit the consent gate.** 37 per cent of conversions are dropped there.
   Worth checking the banner is not defaulting people into rejection.

### B. Cheap, high impact (friction)

5. **Drop the guest name requirement below a threshold.** Confirm the photo ID rule
   is deliberate. If it is needed for genuinely ticketed events, gate it on those,
   not on every paid event with two or more seats.
6. **Remove "or pop in if space allows" from event body copy**, or move it well
   below the form.
7. **Cut the consent checkboxes** on the event form to the minimum legally needed.

### C. Medium effort (creative and budget)

8. **Consolidate budget.** Two or three ads per campaign, not nine. Give each
   enough spend to learn.
9. **Name the specific draw in the headline.** Nikki Manfadge, the £5 price, the
   prize, the theme. Specificity beats "Instant Fun Awaits!".
10. **Match the ad image to the landing page hero.** The hero is currently text
    only, so the poster people tapped disappears on arrival.

### D. Strategic (reframe)

11. **Measure attendance, not online bookings.** Use `event_check_ins` consistently
    so the real question ("did the ad fill the room?") can be answered.
12. **Consider whether these events need paid ads at all**, versus organic reach,
    the existing customer list, and in-pub promotion. £45 per event buys a lot of
    SMS to people who have already been.

---

## 10. Open questions for the owner

1. Is the photo ID requirement deliberate, or inherited from a ticketed event type?
2. Do you know roughly how many people actually attend these nights, versus the
   4 to 7 who book?
3. Was the 12 May switch to conversion optimisation a deliberate decision?
4. What would "working" look like: more bookings, more attendance, or lower cost
   per head?
