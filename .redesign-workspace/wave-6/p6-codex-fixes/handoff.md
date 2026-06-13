# Phase 6 — Codex adversarial-review fixes

Branch: `codex/redesign-build`. Three fixes applied. Only four files staged.

## Fix 1 (BLOCKING) — book-table page-level dark sections converted to LIGHT

`app/book-table/page.tsx` had ~8 page-level sections rendered on dark
backgrounds (`bg-anchor-green-deep` / `bg-anchor-green-raised`) but containing
light-theme components (SectionHeading / Card / h3) and `text-anchor-gold-bright`
on light cards → dark-on-dark and gold-on-light unreadable states. All page
sections are now light, alternating canvas/surface/sunk per the Phase-5 recipe.
The booking FORM (`ManagementTableBookingForm` and the rest of
`components/features/TableBooking/*`) was left untouched — only its surrounding
section background changed.

Sections converted (in document order):

| Section | Before | After |
|---|---|---|
| "Reserve Your Table Online" heading | `bg-anchor-green-deep` | `Section background="white"` + `border-line` |
| Booking-form band (`#booking-form`) | `bg-anchor-green-raised` (override on `background="gray"`) | `background="gray"` (override removed); sidebar `card-dark` divs → light `<Card>`; cream/gold text → `text-ink*` / `text-accent-text` |
| Accessibility | `bg-anchor-green-deep` | `background="white"` + `border-line` |
| What to Expect | `bg-anchor-green-raised` | `background="gray"`; cards → `<Card accent>`; text tokens |
| Signature Dishes preview | `bg-anchor-green-deep` | `background="white"`; row borders `border-anchor-gold-dark/10` → `border-line`; text tokens |
| Events panel band | `bg-anchor-green-raised` | `background="gray"` + `border-line` |
| Testimonial (pull-quote) | `bg-anchor-green-raised` override | `bg-surface-sunk` + `border-line` |
| Getting Here | `bg-anchor-green-deep` + `prose-invert` | `background="white"`; `prose` (dropped `prose-invert`); text tokens |

Token mapping used (Phase-0 / light semantic tokens):
- `bg-anchor-green-deep` → `Section background="white"` (`bg-surface`)
- `bg-anchor-green-raised` → `Section background="gray"` (`bg-surface-sunk`)
- `text-anchor-gold-bright` → `text-accent-text`
- `text-anchor-cream-text[/70|/60]` → `text-ink-strong` / `text-ink-muted`
- `border-anchor-gold-dark/15|/10` → `border-line`
- `card-dark` divs → `<Card>` component (white surface, `border-line`, `rounded-md`, `shadow-sm`); `<Card accent>` where a gold top-rule reads well
- `prose prose-invert` → `prose`

Copy, metadata, JSON-LD (WebPage + FoodEstablishmentReservation), breadcrumbs,
internal links and the form behaviour are all unchanged.

### Verified light components (left as-is, already light)
`StaticHoursSummary` (uses `bg-surface`/`text-ink`), `TestimonialSection`
pull-quote (uses `text-ink`), `Card` component.

### Out-of-scope note (NOT touched — not in the allowed file list)
`components/features/TableBooking/BookTableUpcomingEventsPanel.tsx` still uses
`card-dark` + cream text internally. It now renders as a dark card on a light
`background="gray"` section. This is NOT a dark-on-dark bug — it is a
self-contained dark card with its own light (cream) text, fully readable — and
the brief restricts staging to the four named files. Flagged for a follow-up
restyle of that shared component if a fully uniform light surface is wanted.

## Fix 2 (voice) — drop banned superlative "famous"

- `app/page.tsx:119` `caption: 'Famous Sunday roasts'` → `'Proper Sunday roasts'`.
- `app/food-menu/page.tsx:195` hero lead `...a famous Sunday roast...` → `...a proper Sunday roast...`.

The ~18 other long-tail pages with "famous/premier/best" were deliberately NOT
touched (separate owner copy task, per brief).

## Fix 3 (a11y) — Booking step indicator progress semantics

`components/features/TableBooking/ManagementTableBookingForm.tsx`,
`BookingProgressBar`. Markup/aria only — booking state machine untouched.

Chosen approach: both progressbar semantics AND current-step marking.
- Wrapper `<div>` gains `role="progressbar"`, `aria-label="Booking progress"`,
  `aria-valuemin={1}`, `aria-valuemax={totalSteps}`, `aria-valuenow={currentStep}`,
  and `aria-valuetext` (e.g. "Step 2 of 4: Choose"). (Replaced the prior bare
  `aria-label`.)
- The current step's `<li>` gains `aria-current="step"`.
- The existing visually-hidden `<span className="sr-only"> (current step, N of M)</span>`
  was retained.

No layout, styling, step count, or transition logic changed.

## Verification (verbatim)

1. `npx tsc --noEmit` → clean (TSC_EXIT=0).
2. `npm run lint` → `✔ No ESLint warnings or errors`; `Hero audit passed for 123 page templates.`; `Menu page audit passed.`
3. `npm run build` → succeeded (full route table emitted; BUILD_EXIT=0).
4. Legacy-token audit on touched files:
   `grep -nE "bg-anchor-green-(deep|raised|card)" app/book-table/page.tsx app/page.tsx app/food-menu/page.tsx components/features/TableBooking/ManagementTableBookingForm.tsx` → NONE.
   Broader dark-token grep on `app/book-table/page.tsx`
   (`bg-anchor-green-(deep|raised|card)|text-anchor-cream|text-anchor-gold-bright|card-dark|prose-invert|border-anchor-gold-dark`) → NONE.
5. Booking-test set unchanged: `npx jest components/features/TableBooking` →
   `Test Suites: 1 passed, 1 total / Tests: 5 passed, 5 total`
   (`PayPalDepositSection.test.tsx` is the only booking test file; pre-existing
   React `act()` console warnings remain, no test status change).
6. `grep -in famous app/page.tsx app/food-menu/page.tsx` → NONE.

## Files staged
- `app/book-table/page.tsx`
- `app/page.tsx`
- `app/food-menu/page.tsx`
- `components/features/TableBooking/ManagementTableBookingForm.tsx`
