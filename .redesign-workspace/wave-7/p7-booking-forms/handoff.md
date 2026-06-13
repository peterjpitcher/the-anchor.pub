# Phase 7 Group A — Booking + event-reserve form light-theming

Branch: `codex/redesign-build`. Uncommitted. No build run (per brief).

## Mission
Convert the event reserve form and the table-booking STEP CONTENT components from dark to the light theme. Zero behaviour/logic change. (The form shell + step indicator were already done in Phase 4.5; this wave covered the step contents that were missed.)

## Components converted (8)

| File | What changed | Deliberate dark kept? |
|---|---|---|
| `components/features/EventBooking/ManagementEventBookingForm.tsx` | Heading `text-anchor-gold-bright`→`text-ink-strong`; reassurance→`text-accent-text`; seats-remaining + food-intent label `text-anchor-cream-text*`→`text-ink`/`text-ink-muted`; food-intent box `bg-anchor-green-raised`+gold-dark border→`bg-surface-sunk border-line`; waitlist success `text-green-400`→`text-anchor-success`. Form lives in default light `<Card>`. | No |
| `components/features/TableBooking/CustomerDetails.tsx` | Card `bg-anchor-green-card`→default light `<Card accent>`; heading→`text-ink-strong`; occasion + select labels→`text-ink`. | No |
| `components/features/TableBooking/BookingConfirmation.tsx` | Card emerald-tinted→light `<Card accent>`; success circle now solid `bg-anchor-green` with **white check (white-on-green, deliberate)**; heading→`text-ink-strong`; summary panel `bg-anchor-green-card`→`bg-surface-sunk border-line`; rows→`text-ink`/`text-ink-muted`; tel link emerald→`text-accent-text`; "Make Another Booking" `ghost`→`outline` (matches §9 confirmation visual). | Yes — `text-white` on the green check circle (§9 "green circle with white check") |
| `components/features/TableBooking/AvailabilityChecker.tsx` | Card `bg-anchor-green-card`→light `<Card accent>`; heading/labels→ink tokens; requested-slot `ring-amber-500`→`ring-anchor-gold`; divider `border-amber-200`→`border-line`. | No |
| `components/features/TableBooking/PayPalDepositSection.tsx` | Deposit summary panel `bg-anchor-green-raised`→`bg-surface-sunk border-line rounded-md`; all `text-anchor-cream-text*`→`text-ink`/`text-ink-muted`. | No |
| `components/features/TableBooking/BookingDatePicker.tsx` | Time/party-size labels→`text-ink`; 7+ helper→`text-ink-muted`; kitchen-message panel `bg-amber-500/10`+`text-amber-300`→`bg-surface-sunk border-line` + `text-accent-text`. | No |
| `components/features/TableBooking/BookTableUpcomingEventsPanel.tsx` | `.card-dark` (retired class) → light `<Card accent>` + `CardBody`; inner event rows `.card-dark`→`bg-surface-sunk border-line rounded-md`; text→ink tokens; links `text-anchor-gold-dark`→`text-accent-text` hover `anchor-gold`. | No |
| `components/events/EventBookingFactsStrip.tsx` | Strip `bg-anchor-green-raised`+gold-dark border→`bg-surface border-line`; cell grid gap bg→`bg-line`; icons + labels→`text-accent-text`; values→`text-ink`. | No |

## No logic touched
No change to: availability fetch, customer lookup, Turnstile, honeypot, PayPal create/capture/order, validation, field names, state, props, GTM tracking, attribution, phone validation. Only Tailwind classes, the `ghost`→`outline` variant on the confirmation re-book button, and one added import (`Card`/`CardBody` in BookTableUpcomingEventsPanel). The event form had a seating-preference feature added by a parallel process mid-task; its new UI uses clean tokens and was left untouched.

## Verification
1. **Residual-dark audit (my 8 files):** `grep -nE "bg-anchor-green-(deep|raised|card)|card-dark|text-anchor-cream-text|text-white"` → 1 hit only: `BookingConfirmation.tsx:57` `text-white` on the green check circle (deliberate white-on-green per §9). All else clean.
2. **`npx tsc --noEmit`** → clean (0 errors total; 0 in my files).
3. **`npx jest TableBooking EventBooking`** → 31 failed, all in `tests/unit/ManagementTableBookingForm.test.tsx` (a file NOT owned by this group). Verified pre-existing: `git stash` (my changes removed) → identical **31 failed** in that suite. ZERO new failures from my work. The other 3 suites pass.

## Self-check
- [x] Event reserve form + all table-booking step contents render light.
- [x] Deliberate dark preserved: white check on green confirmation circle.
- [x] Zero logic/field/validation/payment change.
- [x] tsc clean for my files.
- [x] No commit, no build.
