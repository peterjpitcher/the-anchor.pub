# Marketing Psychology Implementation — Design Doc
**Date**: 2026-03-05
**Approach**: C — Full-funnel deep dive per priority
**Skill reference**: marketing-psychology (coreyhaines31/marketingskills)

---

## Guiding Constraint

Every psychological element must pass this test before implementation:
> "Would a confident, welcoming local pub say this naturally?"

If it reads like an e-commerce site or a pushy sales page, it gets cut or rewritten. The psychology lives in structure and framing, not aggressive copy. Tone: friendly, cheeky, inclusive (British English, 'we' voice). No manufactured scarcity, no countdown timers, no fake urgency — only real signals delivered honestly.

All claims must be sourced from `/docs/claims.json`.

---

## Conversion Priorities

| Priority | Goal | Funnel |
|---|---|---|
| P1 | Drive food searches → table bookings | food-menu → book-table → booking-confirmation |
| P2 | Drive event bookings | events listing → event detail → book-event |
| P3 | Drive private hire enquiries | corporate-events / christmas-parties / function-room-hire → enquiry |

---

## Architecture: Three Layers

### Layer 1 — Shared Psychology Components

Five new components, built once and reused across all funnels.

| Component | File | Psychology Principles | Notes |
|---|---|---|---|
| `<TrustBar>` | `components/psychology/TrustBar.tsx` | Authority, Social proof, Availability heuristic | Extends QuickInfoGrid pattern |
| `<UrgencyKitchenStatus>` | `components/psychology/UrgencyKitchenStatus.tsx` | Loss aversion, Present bias, Real scarcity | Uses live kitchen hours from API — no fake urgency |
| `<ValueProofStrip>` | `components/psychology/ValueProofStrip.tsx` | Anchoring, Reciprocity, Zero-price effect | Variant prop for food vs. private-hire framing |
| `<PsychBadge>` | `components/psychology/PsychBadge.tsx` | Scarcity, Authority, Social proof | Extends existing HeroBadge |
| `<RegretReduction>` | `components/psychology/RegretReduction.tsx` | Regret aversion, Status-quo bias reduction | Used above all booking/enquiry forms |

All components live under `components/psychology/` with an `index.ts` barrel export.

### Layer 2 — Copy Rewrites

Page-by-page headline, subheading, body, and CTA copy rewritten with psychological principles embedded. Copy must use only verified claims from `claims.json`.

### Layer 3 — Funnel Assembly

Components and copy wired into pages in priority order: P1 → P2 → P3.

---

## P1 Funnel: Food Discovery → Booking

### `/food-menu`

**Psychology applied**: JTBD framing, Loss aversion, Present bias, Anchoring, Authority, Availability heuristic, Reciprocity

**Changes:**
- Hero headline rewrite: Lead with the job-to-be-done ("Proper pub food, 7 minutes from Heathrow") not a generic welcome
- Add `<UrgencyKitchenStatus>` above the fold — real kitchen hours framed as helpful information, not pressure:
  - Monday: "Kitchen's having a rest today — book for another day"
  - Tue–Fri before 16:00: "Kitchen opens at 4pm — reserve your table now"
  - Tue–Fri 16:00–21:00: "Kitchen open now" (no urgency needed — they're already in time)
  - Tue–Fri after 19:00: "Kitchen closes at 9pm — don't leave it too late"
  - Saturday 12:00–19:00: same pattern
  - Sunday 13:00–18:00: same pattern
- Add `<TrustBar>` below hero: "BII Sustainability Champion · Free parking for 20 cars · 7 min from Heathrow T5"
- Add `<ValueProofStrip>` before CTA: "Skip the ULEZ charge (£12.50/day) · Free on-site parking · Free WiFi throughout"
- CTA copy rewrite: "Book a Table" → "Reserve Your Table" with subtext: "Kitchen hours are limited — secure your spot"

### `/book-table`

**Psychology applied**: Regret aversion, Status-quo bias reduction, Reciprocity, Mimetic desire, Bandwagon, Goal-gradient, Zeigarnik

**Changes:**
- Add `<RegretReduction>` above form: "Free to cancel · No card required · Confirmation in seconds"
- Add `<ValueProofStrip>` in sidebar (desktop) / below form (mobile)
- Add social proof line near submit: "Loved by locals and Heathrow travellers every week"
- Add progress indicator to `ManagementTableBookingForm` wizard: "Step 2 of 3 — almost there" (goal-gradient + Zeigarnik)

### `/booking-confirmation`

**Psychology applied**: Peak-End Rule, Commitment & consistency, Regret aversion, Expectation setting

**Changes:**
- Headline rewrite: "You're all booked in — see you soon!" (warm, human peak moment)
- Add "Add to calendar" button (commitment + consistency — they've invested, more likely to follow through)
- Add arrival expectation copy: "When you arrive: free parking right outside, no need to check in — just head to the bar"
- Optional: "Tell a friend about The Anchor" prompt (mimetic desire)

---

## P2 Funnel: Events → Booking

### `/events` listing

**Psychology applied**: Zero-price effect, Charm pricing, Availability heuristic, Unity principle, Mimetic desire

**Changes:**
- Add `<PsychBadge>` to event cards — real status signals: "Free entry" / "£3 per person" / "Cash prizes"
- Framing copy: "Join your neighbours for a proper night out" — community/unity framing
- Add events-specific `<TrustBar>`: "Hosted by Nikki Manfadge · Free parking · Bar open all night"

### Event detail pages (quiz, bingo, drag cabaret)

**Psychology applied**: Loss aversion (real), Pratfall Effect, JTBD, Social proof via specifics

**Changes per event:**

*Quiz Night:*
- Headline: "A proper night out with your team" (JTBD)
- "Teams of up to 6 — grab your spot before it fills" (real loss aversion)
- Keep second-from-last prize (bottle of wine) prominent — Pratfall Effect, makes it feel human

*Cash Bingo:*
- Headline: "Win cash, have a laugh" (JTBD)
- "£10 cash book covers all 10 games" — frame as value, not cost
- "The snowball jackpot grows every month it rolls over" — genuine urgency, not manufactured

*Music Bingo:*
- Headline: "Free entry, five rounds, prizes every time" (zero-price effect upfront)
- No urgency needed — free entry removes the commitment barrier entirely

### `/book-event`

**Changes:**
- Same `<RegretReduction>` and goal-gradient progress indicator as book-table
- Keeps tone warm, not pressured

---

## P3 Funnel: Private Hire → Enquiry

### Entry pages (`/corporate-events`, `/christmas-parties`, `/function-room-hire`)

**Psychology applied**: Door-in-the-face (anchoring high), Anchoring, Reciprocity, Authority, Social proof

**Changes:**
- Lead with full capacity: "Space for up to 200 guests" — anchors high, then "equally perfect for intimate groups from 10"
- Private-hire `<ValueProofStrip>`: "Free parking for all your guests · Outside ULEZ (saves each driver £12.50) · Free WiFi throughout"
- Authority signal: "BII Sustainability Champion" — signals professional, well-run venue to corporate bookers
- Self-qualification capacity guide (reciprocity before ask): "10–50 guests: dining room · 50–200 guests: full venue" — helps planners self-select without contacting

### Enquiry form

**Psychology applied**: Regret aversion, Commitment & consistency

**Changes:**
- `<RegretReduction>` — enquiry framing: "No commitment — just a conversation. We'll get back to you within 24 hours"
- Confirmation page: warm, sets expectations for follow-up, prompts to save the date

---

## Verified Claims Used (from `/docs/claims.json`)

| Claim | Source node |
|---|---|
| 7 min from T5, 11 min from T2/3, 12 min from T4 | `usp:prime-location` |
| Free parking for ~20 cars | `usp:ample-parking` |
| Outside ULEZ, saves £12.50/day | `usp:outside-ulez` |
| BII Sustainability Champion | `initiative:sustainability-efforts` |
| Beer garden under flight path, planes every 90 seconds | `usp:plane-spotting` |
| Free WiFi | `usp:free-wifi` |
| Capacity 10–200 guests | `usp:versatile-spaces` |
| Kitchen hours (Mon closed, Tue–Fri 16–21, Sat 12–19, Sun 13–18) | `ops:food-service-hours` |
| Quiz: £3/person, 1st Wed, teams up to 6, £25 bar tab prize | `event:quiz-night` |
| Bingo: £10/book, 10 games, snowball +£20 on rollover | `event:cash-bingo` |
| Music Bingo: free entry, 5 rounds, prizes every round | `event:music-bingo` |

**Do not use**: founding year 1866 (unverified, flagged in claims.json)

---

## Implementation Sequence

1. Build shared psychology components (`components/psychology/`)
2. P1: Rewrite copy + wire components into food-menu, book-table, booking-confirmation
3. P2: Rewrite copy + wire components into events listing, event detail pages, book-event
4. P3: Rewrite copy + wire components into corporate-events, christmas-parties, function-room-hire, enquiry form

---

## Out of Scope

- New pages (not adding pages, only modifying existing ones)
- Countdown timers or fake scarcity
- Any claim not in `claims.json`
- Pricing psychology (no transactional pricing on the site beyond event entry fees)
