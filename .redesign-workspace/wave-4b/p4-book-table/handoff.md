# Handoff — PR 4.5 Book a Table restyle (Phase 4, spec §9 + §7.5)

**Branch:** `codex/redesign-build` · **Status:** uncommitted, no build run (per brief).
**Type:** Visual restyle only. ZERO logic / behaviour change.

## Files restyled

1. **`components/features/TableBooking/ManagementTableBookingForm.tsx`** — the live 4-step wizard (find → choose → details → review) + its inline confirmation + the inline `BookingProgressBar` and the `selectedSuggestedEvent` event-booking branch.
2. **`app/book-table/page.tsx`** — hero badges + the §9 "below the card" call-us line.

## What was applied (spec §9)

- **Container:** wizard wrapped `max-w-[640px]` centred, inside `<Card accent>` (gold top rule). Confirmation + event sub-flow cards also `Card accent`, centred to 640px.
- **Step indicator:** rewrote `BookingProgressBar` from a thin progress bar into the §9 numbered indicator — 28px (`h-7 w-7`) circles, pending `bg-surface-sunk text-ink-muted`, active `bg-anchor-gold-dark text-white`, done `bg-anchor-green text-white` with `Check` icon, joined by `h-0.5` hairline bars (`bg-anchor-green` when complete, else `bg-line-strong`). Labels Outfit 600 `text-sm`; pending labels `hidden sm:block` (numbers always show). Removed the redundant duplicate step-grid that used to render below it.
- **Chips (time slots):** `rounded-pill`, `min-h-14`, `border-[1.5px] border-line-strong bg-surface text-ink`, selected `bg-anchor-green text-white`, hover `border-anchor-gold`. Added `aria-pressed`. "See more times" expander restyled to pill/line-strong. Nearest-alternative buttons kept `min-h-12 py-3 text-base`, restyled to line-strong/surface.
- **Inputs:** Date + Preferred Time wrapped in `grid sm:grid-cols-2` (stack ≤640px). All `Input`/`Textarea` already use the §4.4 primitive; **iOS hardening attributes left untouched** (inputMode, pattern, autoComplete, type=date/time, min). Panels recoloured to `bg-surface-sunk`/`border-line`/`text-ink*`.
- **Group deposit notice:** added `<Badge variant="sand">` ("Groups of 10 or more: a £10 per person deposit, fully deducted from your bill.") on the find step, gated on existing `requiresGroupDeposit` (party ≥10). PayPal block wrapped in a sunk panel (`bg-surface-sunk` rounded-md) inside the card.
- **Step actions:** ghost `Back` (ArrowLeft, left) + primary `Continue`/`Continue to review`/`Confirm booking`/`Confirm and pay deposit` (ArrowRight/Check, right). Primary keeps existing `loading`/`disabled` states. Rows `sm:justify-between`.
- **Confirmation:** centred column — 72px (`h-[72px] w-[72px]`) green circle + white `Check`, `font-display text-h3` heading, summary panel (sunk, rounded-md, label/value rows: party, when, table), arrival tips panel, outline reset button.
- **Below the card (page):** muted centred line "Prefer to talk to us? Call 01753 682707. Walk-ins are always welcome." with gold tel link via existing `PhoneLink`.
- **Hero badges (§7.5 item 10):** "Free parking" · "Dog friendly" · **"Quick confirmation"** (replaced "Direct booking"/"Fast confirmation"/"Need help? Call us"). NOT "Instant confirmation" — 10+ parties need the PayPal step.

## Logic deliberately left untouched (verified by reading)

availability fetch (`/api/table-bookings/availability`), events fetch (`/api/events`), customer lookup (`/api/customers/lookup`), submit (`/api/table-bookings`), PayPal create-order/capture + `PayPalDepositSection` props, Turnstile, honeypot (`website` field, off-screen), query-param prefill/defaults, attribution + funnel/GTM tracking, failed-PayPal recovery (`fallback_payment_url` Alert), idempotency-key logic, validation rules + messages, `deriveSubmitPurpose`, slot-window/anchor logic, field names, state machine, scroll-into-view effect. No props/handlers changed.

**Copy preserved for test stability:** confirmation heading still contains "all booked in"; reset button still "Book another table"; all step button accessible names unchanged ("Find a table", "Continue", "Continue to review", "Confirm booking", "Confirm and pay deposit", "Back", "Use Different Number"). Slot aria-labels + "Drinks & food"/"Drinks only" captions + "See more times" + checkbox label intact.

## Scope note — dead siblings NOT touched

The live `/book-table` page renders ONLY `ManagementTableBookingForm`. The legacy chain `TableBookingForm.tsx` → `AvailabilityChecker.tsx` / `CustomerDetails.tsx` / `BookingDatePicker.tsx` / `BookingConfirmation.tsx` is not rendered anywhere in the live app (`booking-confirmation` page is a pure `redirect('/book-table')`). These were left untouched — restyling dead code is out of scope and would risk new failures. Flag for the Phase-6 deletion sweep if confirmed dead.

The wider `app/book-table/page.tsx` chrome (dark sections, `card-dark` asides) is still dark — that is the separate §7.5 page-restyle task, not this PR. Only the hero badges + below-form line were in scope here.

## Verification

- **tsc:** `npx tsc --noEmit` → exit 0, clean (no sibling errors).
- **Old-token audit (my files):** 0 dark-surface/legacy tokens remain. Two intentional brand-token uses kept: `bg-anchor-gold-dark` on the active step circle (AA-compliant per §4.1) and `focus:ring-anchor-gold-dark` on the expander focus ring.
- **Booking tests — failing set UNCHANGED:**
  - Baseline (`/tmp/bk-before.txt`): 31 failed, 1 skipped, 12 passed.
  - After restyle (`/tmp/bk-after.txt`): 31 failed, 1 skipped, 12 passed.
  - `diff` of titles (timings stripped): **IDENTICAL — same 31 titles, no new failures, none fixed.**
  - Note: the 31 baseline failures are pre-existing and environmental — the availability `fetch` mock never resolves so the form never advances past the find step (e.g. "Unable to find an element with the text: Choose your time"). Unrelated to markup; my restyle preserves all asserted class markers (`min-h-14`, `min-h-12`/`py-3`/`text-base`, checkbox-label `min-h-12`) and accessible names so the set cannot shift.
- **No commit, no build run.**
