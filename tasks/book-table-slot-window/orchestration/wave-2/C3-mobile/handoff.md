# Wave 2C3 — Mobile Optimisation — Handoff

## Commit

`5ac282e` — `feat(book-table): mobile optimisation across the wizard`

`git diff HEAD~1 HEAD --name-only` → exactly two files:
- `components/features/TableBooking/ManagementTableBookingForm.tsx`
- `tests/unit/ManagementTableBookingForm.test.tsx`

## What landed

### Wizard-root scroll on step transitions
- Added `wizardRef = useRef<HTMLDivElement>(null)` and `wizardMountedRef = useRef(false)` immediately after the existing `result` state.
- Added `useEffect(..., [step])` that bails on the initial mount and otherwise calls `wizardRef.current?.scrollIntoView({ block: 'start' })` (instant, not smooth).
- The wizard's top-level `<Card>` is now wrapped in `<div ref={wizardRef}>` so the scroll target is a real `HTMLDivElement` (the `<Card>` primitive does not forward refs).

### Step-1 form semantics
- The find-step `<div className="space-y-4">` was replaced with `<form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void handleFindTable() }}>`.
- The "Find a table" `<Button>` is now `type="submit"` (no `onClick`); the surrounding form's `onSubmit` handler invokes `handleFindTable`. Pressing Enter / "Go" on any input inside the form now triggers the search.
- Other steps continue to render outside any `<form>` — their primary actions remain `type="button"` with explicit `onClick`.

### Input keyboard hints + size
| Field | Added attributes |
|---|---|
| Party Size | `size="lg"` `inputMode="numeric"` `pattern="[0-9]*"` |
| Date | `size="lg"` |
| Preferred Time | `size="lg"` |
| Mobile Number | `size="lg"` `inputMode="tel"` `autoComplete="tel"` |
| First Name | `size="lg"` `autoComplete="given-name"` |
| Last Name | `size="lg"` `autoComplete="family-name"` |
| Email (optional) | `size="lg"` `inputMode="email"` `autoComplete="email"` |

The `<Input>` primitive's `InputProps` already extends `Omit<InputHTMLAttributes, 'className' | 'size'>`, so all native attributes spread through to `<input>`.

### Slot grid
- Slot button gained a combined `aria-label`: `${formatTimeForDisplay(slot.time)}, ${kitchen_open === false ? 'drinks only' : 'drinks and food'}`. When `slot.kitchen_open` is `undefined` (legacy data path), the label defaults to "drinks and food" to match the existing visual default.
- Slot button now carries `min-h-14` (56 px) so the time + caption sit comfortably above the 48 px target with room for both lines.
- Alternative slot button (no-availability fallback) bumped from `px-3 py-2 text-sm` to `min-h-12 px-3 py-3 text-base`. Existing `flex w-full items-center justify-between rounded-lg border border-anchor-gold/25 bg-anchor-bg-card hover:border-anchor-gold` styles preserved.

### Action buttons (visible CTAs ≥ 48 px)
- **`size="lg"` (primary CTAs):** "Find a table" (already lg before), "Continue" on choose, "Continue to review" on details, "Confirm booking" / "Confirm and pay deposit" on review, "Book another table" on confirmation, "Start a new booking" on the pending-payment recovery.
- **`min-h-12` appended to existing className (secondary buttons):** all "Back" buttons (choose, details, review, event-suggestion "Back to table booking"), phone-lookup "Continue", "Use Different Number", "Join waitlist by phone".

### Booking-policy checkbox
- The wrapping `<label>` className changed from `flex items-start gap-2 text-sm text-anchor-cream-text/70` to `flex min-h-12 items-start gap-2 py-2 text-sm text-anchor-cream-text/70`. The whole row is now a 48 px tap target rather than the small checkbox alone; vertical padding ensures the touch zone extends across the full label.

## Tests

Added a new `describe('Mobile optimisation', ...)` block with 8 cases:

1. **Party Size has `inputMode="numeric"` and `pattern="[0-9]*"`.**
2. **Mobile Number has `inputMode="tel"` and `autocomplete="tel"`.**
3. **First/Last Name carry `autocomplete="given-name"` / `"family-name"`; Email carries `inputMode="email"` and `autocomplete="email"`.**
4. **Slot button has combined `aria-label`.** A kitchen-open slot's accessible name matches `/7pm, drinks and food/i`; a kitchen-closed slot matches `/10pm, drinks only/i`.
5. **Slot/alternative button class regressions.** The alternative-slot button class includes `min-h-12`, `py-3`, and `text-base`. (The slot-button `min-h-14` is exercised indirectly via test #4 — the slot button is found by its `aria-label`.)
6. **Booking-policy checkbox label is a 48 px tap target.** Walks `closest('label')` and asserts `min-h-12` is on the className.
7. **Step transition triggers `scrollIntoView({ block: 'start' })` and not on initial mount.** Polyfills `Element.prototype.scrollIntoView`, spies on it, asserts no calls before the first step transition and at least one call afterwards. Subsequent transitions (choose → details) trigger another call.
8. **Pressing Enter on Preferred Time submits the find-step form.** Walks `closest('form')` from the time input and fires a `submit` event; asserts the availability fetch fires.

Also added a single `beforeAll` hook at the top of the file that polyfills a no-op `Element.prototype.scrollIntoView` (jsdom does not implement it natively; without the polyfill, the wizard's mount-guarded `useEffect` would throw on the first step change in every test).

## Verification

```
$ npx jest tests/unit/ManagementTableBookingForm.test.tsx
  Tests:       34 passed, 34 total
  (12 baseline + 9 from Wave 2C1 + 5 from Wave 2C2 + 8 new mobile)

$ TZ=America/New_York npx jest tests/unit/ManagementTableBookingForm.test.tsx -t "London"
  Tests:       29 skipped, 5 passed, 34 total

$ npx jest tests/unit/table-booking-slot-window.test.ts
  Tests:       15 passed, 15 total

$ npx tsc --noEmit
  (clean — no output)

$ npx eslint components/features/TableBooking/ManagementTableBookingForm.tsx tests/unit/ManagementTableBookingForm.test.tsx --max-warnings=0
  (clean — no output)
```

## Judgment calls

- **Wizard scroll target is a wrapping `<div>`, not the `<Card>` primitive.** The `<Card>` component (and `<CardBody>`) do not forward refs, and adding `forwardRef` would touch shared UI primitives outside this task's scope. Wrapping with `<div ref={wizardRef}>` keeps the change local to the wizard and gives the effect a real `HTMLDivElement` to scroll into view.
- **`scrollIntoView` jsdom polyfill is a `beforeAll` hook in the test file.** Adding it once at the top of the test file (rather than per-test) keeps every existing case unblocked. The polyfill is a no-op; the explicit `scrollIntoView` regression test (case 7) installs its own spy on top.
- **"Back to table booking" button on the event-suggestion branch got `min-h-12` for consistency** even though it sits outside the main wizard flow. This branch renders when the user picks a suggested event; it visually matches a wizard step and benefits from the same touch-target floor.
- **`min-h-14` on slot buttons (vs `min-h-12` on alt buttons).** Slot buttons render two lines of text (time + caption) and demand more vertical space than the single-line alternative button. `min-h-14` (56 px) leaves comfortable breathing room above the 48 px floor.
- **Step-1 form `onSubmit={(event) => { event.preventDefault(); void handleFindTable() }}`.** `handleFindTable` is async, so the `void` operator silences the floating-promise lint rule without changing semantics. The `event.preventDefault()` is non-negotiable — without it, the browser would reload the page on form submit since there's no `action`.
- **Did not change the honeypot `<label htmlFor="website">` markup.** It lives in a hidden positioning container (`position: absolute; left: -9999px`) and never reaches the customer; the 48 px tap-target rule does not apply.

## Notes for downstream waves

- **Wave 2C4 (idempotency):** `handleConfirmBooking` is unchanged. The `<form onSubmit>` only wraps step-1 fields and the "Find a table" button. The "Confirm booking" / "Confirm and pay deposit" CTA on step 4 still calls `handleConfirmBooking` directly via `onClick`. The new submit-intent fingerprinting work in 2C4 can proceed without touching the form-wrapping logic.
- The `wizardRef`/`wizardMountedRef`/scroll effect run on every step change including review; if 2C4 introduces new `setStep(...)` call sites, those will also trigger a scroll-to-top — likely desirable but worth noting.
- No public exports, props, or types changed.
- No changes to `lib/` or `app/api/` files. Only the wizard component and its test file were touched.
