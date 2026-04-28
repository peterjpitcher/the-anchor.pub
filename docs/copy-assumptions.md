# Copy Assumptions — Source of Truth for Operational Claims

This document records the operational claims used in customer-facing page copy. Update here first when operational reality changes — page copy and JSON-LD must follow.

## Brand & Contact

- **Brand name:** The Anchor (never "The Anchor Pub" in customer copy).
- **Address:** Horton Road, Stanwell Moor, Surrey TW19 6AQ.
- **Phone:** 01753 682707.
- **Email:** manager@the-anchor.pub.
- **Location framing:** Stanwell Moor, near Heathrow Airport (closest proper pub to Terminal 5, ~7 minutes by car).

## Opening Hours (regular)

- **Monday:** Closed (kitchen always closed Monday unless a special-hours record explicitly opens it).
- **Tuesday – Thursday:** 4pm – 11pm; kitchen 4pm – 9pm.
- **Friday:** 4pm – midnight; kitchen 4pm – 9pm.
- **Saturday:** 1pm – midnight; kitchen 1pm – 7pm.
- **Sunday:** 1pm – 6pm; kitchen 1pm – 6pm; last bookable arrival 5:30pm.

> Special-hours overrides come from the management API (`/business/hours`) and always win. `kitchen: null` for a date means kitchen closed for that date — treat as deliberate, not as missing data.

## Sunday Roast — operational claims

Effective from the 17 May 2026 walk-in launch:

- **Service window:** Sundays 1pm – 6pm (kitchen 1pm – 6pm, last bookable arrival 5:30pm).
- **Pre-order:** Not required. No Saturday cutoff. Walk-ins welcome.
- **Booking:** Recommended for groups and peak slots, but not required.
- **Menu:** Roasted Chicken (£19), Crispy Pork Belly (£22), Beetroot & Butternut Squash Wellington (V) (£19), Kids Roasted Chicken (£13). Regular weekday menu (burgers, pizzas, fish and chips) is also available on Sundays.
- **Deposit:** No Sunday-specific deposit. The standard large-group deposit applies on any day — see "Deposit policy" below.

## Deposit policy

- **Threshold:** Groups of 10 or more on any day, any booking type.
- **Amount:** £10 per person, fully deducted from the bill on the day.
- **Smaller groups (1–9):** No deposit, no card details required at booking.
- **Copy:** "Groups of 10 or more: a £10 per person deposit, fully deducted from your bill."

## Food

- **Mains:** Traditional British pub classics (fish & chips, pies, burgers) £11 – £16.
- **Pizzas:** Stone-baked, from £12.
- **Sunday roast:** £19 – £22.
- **Friday over-65s offer:** 50% off fish & chips for over-65s on Fridays.

## Service exclusions

- **No breakfast service.**
- **No delivery.** Takeaway by phone for collection only.
- **No Sky Sports / TNT Sports.** Live sport on terrestrial channels only since January 2025.
- **No guest ales.** Bottled ales only — no handpumps. Do not market as a "real ale pub".
- **No wedding receptions.** Smaller private events only.

## Booking type → kitchen dependency

| Booking type | Requires kitchen open |
|---|---|
| `sunday_lunch` | Yes |
| `food` | Yes |
| `drinks` | No |

When kitchen is closed for a date, food and Sunday-lunch slots return empty; drinks slots are unaffected.

## Private hire / function room

- **Capacity:** 10 – 200 guests.
- **Use cases:** Birthdays, wakes, christenings, baby showers, milestone parties, corporate events, retirement parties.
- **Pre-order language for private events / Christmas parties is allowed and unrelated to the Sunday-roast walk-in change.**

## Parking

- **20 free spaces on site**, no time limit while dining.
- **Outside the ULEZ zone** (saves £12.50/day vs. London venues).

## Distance from Heathrow

- **Terminal 5:** 7 minutes by car.
- **Terminals 2 & 3:** 11 minutes.
- **Terminal 4:** 12 minutes.
- **Bus:** Routes 441 and 442 from Heathrow Central Bus Station.

## Verification

When updating page copy, JSON-LD, or marketing collateral, these claims are the canonical reference. Any code or content that contradicts this document should be reconciled to match — or this document should be updated first if operational reality has changed.
