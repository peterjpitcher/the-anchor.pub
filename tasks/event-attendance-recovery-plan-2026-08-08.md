# Event attendance: what actually broke, and the plan

8 August 2026. Follow-up to `event-ads-conversion-discovery-2026-08-08.md`.

The ads were never the machine that filled the room. The SMS was, and it was
deleted on 17 January 2026.

---

## 1. The finding

| Period | Events | Avg bookings/event | Avg seats/event |
|---|---|---|---|
| Jun to Dec 2025 (SMS running) | 16 | 29.1 | 43.6 |
| Jan to Aug 2026 (SMS off) | 37 | 4.4 | 13.8 |

Summer to summer, which removes the Christmas seasonality objection:

| Period (June to September only) | Avg seats/event |
|---|---|
| 2025, SMS running | **49.4** |
| 2026, SMS off | **13.2** |

Checked for artefacts: zero reminder-only (0 seat) booking records in either
period, so this is not a change in how records were stored.

### What this means for the room

The owner reports current attendance of **20 to 25 people** against 13.8 seats
booked, so walk-ins make up roughly 40 per cent of the room. Capacity on the
advertised nights is 50 to 60.

Applying the same walk-in ratio to 2025, when 43.6 to 49.4 seats were booked
before the night, those events would have been at or near capacity.

**SMS running: a full room. SMS off: about 40 per cent full.**

### What was sending

`booking_reminders` shows what ran until 31 December 2025:

| Reminder type | Sends | Purpose |
|---|---|---|
| `no_seats_1_week` | 595 | Nudge people who had **not** booked |
| `no_seats_day_before` | 542 | Nudge people who had **not** booked |
| `no_seats_2_weeks` | 188 | Nudge people who had **not** booked |
| `booked_1_day` / `booked_1_week` / `has_seats_*` | 135 | Remind people who **had** booked |
| `booking_confirmation` | 77 | Confirmations |

**1,325 of those sends were invitations to people who had not yet booked.** That
is the engine that filled the room.

### Why it stopped

- Last send of any kind: **31 December 2025**
- Commit **`113e8d2b`, 17 January 2026, "Remove event/table bookings and check-in"**
  deleted `src/app/api/cron/reminders/route.ts`
- `booking_reminders` is now referenced only in `database.generated.ts`. No
  application code writes to it.
- All four reminder templates are `is_active: false` in `message_templates`

The replacement cron, `event-guest-engagement`, handles `event_reminder_1d`
(people who **have** booked), post-event review requests, and cross-promotion.

**The "remind people who booked" half survived the refactor. The "invite people
who have not booked" half was deleted and never replaced.** That is the entire gap.

### Scale of the wasted asset

- **709 customers opted in to SMS**
- 1,030 customers, all with mobile numbers
- 444 distinct people have booked an event before
- 789 on the event interest list

For comparison, three months and £318 of Meta spend produced 733 clicks and 4
attributed bookings.

---

## 2. SMS: what to rebuild and how it should change

### 2.1 Rebuild the non-booker nudge (the priority)

A cron that, for each upcoming event, texts opted-in customers who have **not**
booked. Restore the timings that worked: **1 week before** and **day before**.
Treat `no_seats_2_weeks` as optional, its volume was much lower.

### 2.2 Fix the copy

Current inactive template:

> Hey {{first_name}}, {{event_name}} is on {{event_date}} at {{event_time}}. You
> haven't booked seats yet. Want to join us? Reply now. – The Anchor

Four problems:

1. **"You haven't booked seats yet" is nagging.** It frames the message around
   the recipient's failure rather than the invitation.
2. **No price.** £5 and £3 are strengths. They remove risk and they are the single
   most persuasive fact available.
3. **No link.** "Reply now" forces a member of staff to process every reply by
   hand. It caps the whole system at whatever a human can handle, and it stops
   anyone booking at 11pm.
4. **No reason to come.** No host name, no theme, no prize.

Suggested shape:

> Hi {{first_name}}, Country Music Bingo this Friday, 7pm, with Nikki. £5, pay on
> the night. Grab a table: {{link}}. The Anchor. Text STOP to opt out.

Every marketing send needs the short link (trackable through the existing
`l.the-anchor.pub` redirect infrastructure) and a STOP instruction.

### 2.3 Keep what already works

`event-guest-engagement` already handles 1-day reminders to booked guests and
post-event review requests. Leave it alone. The new job should only target people
with no booking for that event.

---

## 3. Booking journey: cut it to three fields

### Current state

For any paid event with 2 or more seats, the form asks for:

- Seats
- First name
- Last name
- **The full name of every additional guest** (submit button disabled until all
  are filled, `ManagementEventBookingForm.tsx:212` and `:1025`)
- Mobile number
- Email (optional)
- Four separate marketing consent checkboxes

Plus the line: "everyone will need photo ID matching their ticket on the night."

The owner has confirmed the photo ID requirement is **not deliberate**. Guest
names are wanted only when tickets are **paid in advance**, and a simple first
name is enough in that case.

### Target state

| Field | Notes |
|---|---|
| **Seats** | Tap control (1, 2, 3, 4, 5, 6+), not a dropdown |
| **Name** | One field, not first plus last |
| **Mobile** | For the confirmation text |

That is it. Everything else goes:

- **Photo ID copy: remove entirely.** It was never intended. The brand voice in
  `prompts.ts:16` says The Anchor is "a friendly local, not a nightclub", which is
  exactly right.
- **Guest names: prepaid events only**, and a first name is enough. Gate on
  `payment_mode` being prepaid, not on `isPaidEvent && seats > 1`.
- Email: optional, or drop it. You have their mobile.
- Four consent checkboxes: replace with one line of small print (see section 4).

Target: a booking in under 15 seconds on a phone, three taps and two short typed
fields.

### 3.1 Also fix

Remove the walk-ins instruction that undercuts the form. In
`OJ-AnchorManagementTools/src/lib/event-seo/prompts.ts`:

- **Line 36** lists `"walk-ins welcome where space allows"` as a phrase to imitate
- **Paragraph 5** briefs the model to cover `"price, booking, capacity, when to
  arrive, walk-ins"`

Together these produce "Book your seats by calling 01753 682707 or pop in if space
allows", printed directly above the booking form. Drop walk-ins from paid events
and brief paragraph 5 to point at the on-page form first, phone second.

---

## 4. Consent: the owner's position is sound, with one carve-out

The decision is to assume consent for event marketing, with unsubscribe available.
That is defensible, and it splits into three cases.

**Service messages** (booking confirmation, reminder for an event they booked)
need no marketing consent at all. These have never been the issue.

**Marketing messages to past customers** (telling a past bingo attendee about the
next bingo) are covered by the PECR soft opt-in, provided all three hold:

1. You got their details in the course of a sale or negotiations for a sale. A
   previous booking qualifies.
2. You are marketing your **own similar** products or services. Another event
   night qualifies. A different line of business would not.
3. They were given a simple opt-out **at the point of collection** and in **every**
   subsequent message.

Point 3 is the one to build for: a clear line on the booking form, and STOP in
every marketing SMS. Both are cheap.

**The carve-out: this does not cover Meta.** Sending hashed email and phone to
Meta through CAPI for ad targeting is not a service message and is not soft
opt-in. That still needs real consent, so keep the cookie banner doing its job
there. Currently 32 of 87 conversions are skipped for exactly this reason, which
is correct behaviour, not a bug.

This is a summary of the regime, not legal advice. If in doubt on point 2, take
proper advice.

---

## 5. Defining "working"

The owner does not currently have a target. Proposed definition, since attendance
is the real goal:

**Working means 40 or more people in the room on an event night, at under £2 of
marketing cost per head.**

Reference points:

| Channel | Cost per event | Heads delivered |
|---|---|---|
| Meta ads today | £45 to £59 | 4 attributed bookings across 3 months |
| SMS to 709 opted-in customers | roughly £15 to £25 | historically took seats from 13.8 to 49.4 |

To measure it, `event_check_ins` needs to be used consistently. It holds only 98
rows across all events, so attendance is currently guesswork rather than data.

---

## 6. Priority order

| # | Action | Effort | Expected effect |
|---|---|---|---|
| 1 | Rebuild the non-booker SMS nudge (1 week + day before) | Medium | The 49.4 vs 13.2 seat gap |
| 2 | Add link and price to SMS copy, add STOP | Small | Removes the manual reply bottleneck |
| 3 | Cut the booking form to three fields, remove photo ID | Medium | 2 to 3x on conversion |
| 4 | Remove walk-ins from the copy prompt | Tiny | Stops the page undercutting itself |
| 5 | Switch Meta back to traffic optimisation | Tiny | About 5x on cost per click |
| 6 | Start recording check-ins every event | Process | Makes "working" measurable |
| 7 | Always-on campaign to an auto-updating page | Medium | New customers only |

Items 1 and 2 are worth more than everything else combined.

---

## 7. Open question

Was the reminder system removed deliberately, or lost by accident in the January
refactor? Commit `113e8d2b` is titled "Remove event/table bookings and check-in",
which reads like a planned removal of a wider feature. If the nudges were dropped
as collateral, rebuilding is uncontroversial. If they were switched off on
purpose, it is worth knowing why before turning them back on.
