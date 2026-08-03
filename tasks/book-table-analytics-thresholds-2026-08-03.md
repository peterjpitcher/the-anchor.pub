# W7. Analytics thresholds and operational alerting

Date: 2026-08-03
Status: **thresholds defined below and ready to apply. Alerting is specified but NOT built.**

The funnel events already exist and fire (`booking_step_viewed`, `option_toggled`, `slot_flag_shown`,
`slot_invalidated`, `booking_error_shown`) and carry no personal data. What was missing was any
definition of what they have to say for the new flow to be judged better. Without that, W4 would
remove the old path on a feeling.

---

## Part 1. Go/no-go for retiring the four-step flow

### The exposure event

Nothing currently records which flow a visitor was **put into**, only what they did next. Without it
the two arms cannot be compared, because a visitor who abandons before the first tracked step is
invisible in one arm and absent from the other.

Emit `booking_flow_assigned` once per session, on first render of `/book-table`, carrying
`{ flow: 'two_screen' | 'four_step', session_id, assigned_at }`. It must fire before any step event
and exactly once, regardless of re-renders or the guest navigating back.

### Deduplication

Every funnel event carries the `session_id` above. A session is one visitor's attempt and is the unit
of analysis. Repeated events within a session count once for funnel purposes: a guest who searches
five times has one `availability_check`, not five. Counting raw events would let the flow that makes
people retry look busier and therefore healthier.

### The denominator

**Sessions that emitted `booking_flow_assigned`.** Not page views, not searches. Every rate below is
"of assigned sessions".

### The primary measure

**Completed bookings per assigned session**, where completed means the create call returned
`confirmed` or `pending_payment`. A booking that reaches `pending_payment` and never pays is NOT a
completion (see the payment guardrail).

### Minimum sample

**400 assigned sessions per arm**, and at least **two full weekends** in each arm.

400 per arm detects a change of roughly 7 percentage points against a baseline near 40 per cent, at
80 per cent power and 5 per cent significance. Below that the result is noise dressed as evidence.
The weekend requirement exists because Saturday lunch and Sunday are the busiest and most
constrained services, and a sample drawn only from quiet midweek trading is not representative of
the decisions the flow has to survive.

### Target change

**No worse than the four-step flow**, judged as: the lower bound of the 95 per cent confidence
interval on the difference in completion rate is above **minus 2 percentage points**.

This is deliberately a non-inferiority test, not a superiority one. The new flow was built to be
simpler, not to convert better, and holding it to "must win" would either keep a better journey
behind a flag forever or invite the sample to be read early until it happens to win.

### The payment guardrail

Retirement is **blocked** if either holds, whatever the completion rate says:

- Deposit-taking bookings that reach `pending_payment` and are never captured are more than
  **2 percentage points** worse in the new arm.
- Any increase in `booking_error_shown` with a blocked reason of `no_table` or `slot_full` on slots
  the grid had shown as available (see the mismatch alert below).

A flow that gets more people to press Confirm while getting fewer of them to actually pay is worse,
and completion rate alone cannot see that.

### Decision rule

Retire the four-step path when: both arms have 400+ assigned sessions and two full weekends, the
non-inferiority bound holds, and neither guardrail has tripped. Otherwise keep the flag.

---

## Part 2. Operational alerting (NOT BUILT)

Today every one of these reaches us as a customer complaint. The seasonal deposit path makes the
payment ones materially more valuable, because a silent payment failure is now a real possibility.

| Watch | Condition | Why it matters |
|---|---|---|
| Availability unknown | `calculation_state: 'unknown'` on more than 5 per cent of availability responses over 15 minutes | The authoritative check is failing and guests are being shown a retry instead of times |
| Shown-available vs create-blocked | Any create blocked with `no_table` or `slot_full` for a slot the same session was shown as available | The grid and the allocator disagree; the guest was promised a table that did not exist |
| Payment setup failure | Any failure creating a PayPal order for a booking already in `pending_payment` | The guest holds a table they cannot pay for, and the hold will expire silently |
| Capture failure | Any capture error after guest approval | Money authorised and not taken |
| Expired holds | More than 3 holds expiring unpaid in an hour | Either payment is broken or the window is too short |
| Webhook delay | PayPal webhook older than 10 minutes at receipt | Bookings confirming late or not at all |
| Seasonal validation failure | Any create rejected for a `booking_period_id` naming a different live period than the date's | The website and AMS disagree about which season a date is in |

**Owner decision needed:** where these alerts go. Email to the manager address is the cheapest thing
that works with what is already wired; anything else (SMS, a dashboard, a paging service) is a
larger build. Recommendation: **email, batched every 15 minutes**, because none of these needs a
response inside a minute and an alert that wakes nobody up is one that gets muted.

---

## What is done and what is not

- **Done:** every threshold above is now a number rather than an intention, so W4 can be decided on
  evidence.
- **Not done:** `booking_flow_assigned` is not emitted, so the denominator does not yet exist. This
  is the one piece of instrumentation that must ship before the comparison can start, and it is
  small.
- **Not done:** none of the alerting in Part 2 is built.
