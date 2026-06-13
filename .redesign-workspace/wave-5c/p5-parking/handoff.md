# Phase 5 · PR 5.9 — Parking family light re-skin (handoff)

Branch: `codex/redesign-build`. Uncommitted. No build run (per brief).

## Scope delivered
Re-skinned the parking route family to the light design system (§8 Parking row) and restyled
the `ParkingBookingWizard` presentation layer to §9 booking visual language. **Zero wizard
logic / rates / PayPal change.**

## Files edited (all uncommitted)
- `app/heathrow-parking/page.tsx` — all dark `Section background="dark"` bodies → light
  `<section className="py-section-y bg-canvas|bg-surface">` + `Container`; inline `.card`/dark
  panels → `<Card accent>`/`<CardBody>`; loose `<h2>`/lead → `<SectionHeading>`; both dark
  `FeatureGrid` blocks → light `Card` grids (data arrays reused); price-comparison table →
  light `Card` + `bg-surface-sunk` header + `divide-line`; `CTASection` → `CtaBand` (+
  `PhoneButton`). Hero, all H1/H2 copy, metadata, 3× JSON-LD (`ParkingFacility`, `Product`,
  `HowTo`), `BreadcrumbJsonLd`, FAQ, `ReviewSection`, `OrganicSearchClusterLinks` preserved.
- `app/heathrow-parking/[terminal]/page.tsx` — 3 dark sections → light; quick-facts + related
  guides → `Card`/`SectionHeading`; postcode panel → `Card accent`; FAQ `className`
  `bg-anchor-green-deep` → `bg-surface`; `CTASection` → `CtaBand`. generateMetadata,
  generateStaticParams, canonical, breadcrumb JSON-LD untouched.
- `app/coach-parking-heathrow/page.tsx` — `.section-spacing*` dark sections → `py-section-y`
  light; FeatureCard/inline cards → `Card`/`CardBody`; "Driver Deal" kept as deliberate green
  highlight via `<Card variant="dark" className="theme-dark">` (on-dark `anchor-cream-text`
  text is correct there); FAQ `className` → `bg-surface`; `CTASection` → `CtaBand`. Removed
  unused imports (`BusinessHours`, `FeatureGrid`, `InfoBoxGrid`, `AlertBox`, `FeatureCard`).
  Metadata preserved.
- `app/heathrow-parking/confirmation/[bookingId]/page.tsx` — full rewrite to a **light** page:
  72px green circle + white Lucide `check` (§9 confirmation visual), `Card accent` summary
  panels with `bg-surface-sunk` headers. Replaced all emoji (📱📍🚕🚌🔑) + unicode ✓ with
  Lucide `Icon`s (no emoji in UI per §10). `anchorAPI.getParkingBooking(bookingId)` call,
  fallback branch, `robots:{index:false}` metadata, reference/date logic all preserved.
- `app/parking/bookings/[id]/page.tsx` — `Section`/dark wrapper → light `<main bg-canvas>` +
  `Card accent`; status pills → `Badge` primitive (`success`/`sand`/`outline`); detail panels →
  `bg-surface-sunk`; payment-message colours → `anchor-success`/`anchor-danger` tokens.
  `getParkingBooking` call, `notFound()`, `searchParams.payment` logic, noindex metadata,
  status state machine preserved.
- `components/features/ParkingBookingWizard/index.tsx` — **visual only**. Outer wrapper →
  `<Card accent>`. Added §9 step indicator (`<ol>` of numbered 28px circles: pending
  `bg-surface-sunk`, active `bg-anchor-gold`, done `bg-anchor-green` + white check; joined by
  `h-px bg-line` hairline bars). Recoloured rate/estimate panel, availability messages,
  step-2 helper, step-4 booking summary + pricing + capture/error/cancel messages + PayPal
  skeleton + terms line + back link + footer nav + noscript to light tokens
  (`bg-surface-sunk`, `text-ink*`, `text-accent-text`, `anchor-success`, `anchor-danger`,
  `border-line`). `Input`/`Textarea` already §4.4 primitives — left as-is.

## Zero-logic-change confirmation (wizard)
Filtered working-tree diff for any logic line (`fetch(`, `createOrder`, `onApprove`,
`onCancel`, `onError`, `/api/parking/payment/create-order`, `/capture`, `/availability`,
`/rates`, `calculateEstimate`, `handleCheckAvailability`, `parseJsonResponse`, `bookingDataRef`,
`pendingBookingIdRef`, `router.push`, all `set*` state setters, field names) → **empty**.
Deliberately left untouched: rates `useEffect` fetch, `handleCheckAvailability`,
`renderPayPalButtons` (createOrder/onApprove/onCancel/onError, capture POST, order id refs),
`calculateEstimate`, the 4-step state machine, `canProceedFromStepN` validation, all customer/
vehicle/notes state + field names, datetime helpers, query payload shapes.

## Metadata / JSON-LD / data calls
Filtered page diffs for `metadata|canonical|openGraph|twitter|alternates|JsonLd|@type|@context|
generateMetadata|robots|schema|buildParking|howToSchema|anchorAPI.|getParkingBooking|
getParkingRates` → **empty**. All preserved.

## Legacy-class audit (my files)
0 legacy dark/`.card-dark`/`.card-warm`/`.section-spacing`/`CTASection`/`FeatureGrid`/
`background="dark"` hits remaining, except two intentional cases:
1. `heathrow-parking/page.tsx` `ReviewSection background="dark"` — shared component owned by
   another family; its theming is its own concern (reference pages leave shared sections as-is).
2. `coach-parking-heathrow` Driver Deal — `anchor-cream-text` inside the deliberate
   `Card variant="dark" theme-dark` highlight panel (correct on-dark token).

## tsc
`npx tsc --noEmit` → my six files clean. Only sibling errors in `app/events/[id]/page.tsx`
(unclosed `Section` tags, lines 438/474/714/761) — owned by the events workstream, not this PR.

## Not done / notes
- Did not run `npm run build` (per brief). Did not commit/stage.
- `ReviewSection` (shared) still renders dark on the light main parking page; left untouched as
  it is out of scope (shared component).
