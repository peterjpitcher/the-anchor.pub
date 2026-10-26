# Table Booking Components

The customer-facing table booking flow for The Anchor. Everything in this folder is live. There is no
longer a second, unrendered set of components sitting alongside it.

## What is here

### `ManagementTableBookingForm`

**The booking form.** Rendered by `app/book-table/page.tsx`. It owns the whole journey: date, time,
party size, food or drinks, high chairs, outside seating, customer details and submission.

```tsx
import { ManagementTableBookingForm } from '@/components/features/TableBooking/ManagementTableBookingForm'

// Reads its starting values from the address, so it sits inside Suspense.
<Suspense fallback={<BookingFormFallback />}>
  <ManagementTableBookingForm />
</Suspense>
```

Import it directly. There is deliberately **no barrel file**: the old one exported components that
nothing rendered, which made it easy to spend a day editing a file that was never on screen.

#### One journey

Find a table and its time on one screen, then details and confirm on the next (spec D1). The
four-step journey (find, choose, details, review) ran beside it behind the `booking_options_step1`
flag from 1 August 2026 and was deleted in October 2026 (review BK-199, website W4), with the flag
read on `/book-table`. Its suite became `tests/unit/ManagementTableBookingForm.test.tsx`, rewritten
for the journey that stayed; the journey's own suite is
`tests/unit/ManagementTableBookingForm.twoScreen.test.tsx`.

`/book-table` is cached (review BK-200): the form reads the date, time, party size, drinks choice and
a Nations Championship game (`fixture_id`) from the address in the browser, inside a Suspense
boundary on the page.

The form is the wizard and its state. The rules it applies live outside it, so each can be read and
tested on its own:

| Module | Owns |
|--------|------|
| `useAvailabilityRequests` | Which in-flight request may still write state, and which spinner belongs to it. All three network paths (search, options re-read, nearest-alternatives probe) are tracked here |
| `useSuggestedEvents` | The per-date cache, loader and dismissals for the "events on this date" panel |
| `BookingProgressBar`, `BookingConfirmedCard` | The two screens that read nothing but what they render |
| `TableRefinements` | The "Anything that changes the table?" group, and the owner-approved step-free copy exported as one constant so it cannot drift |
| `SlotPickerGrid` | The Lunch and Evening grid. Renders what it is handed, decides nothing |
| `BookingSummaryCard` | What the guest is about to book, restated on screen 2 |
| `lib/table-booking/availability` | The reading's shape, its normalisation (fails closed on `bookable_purpose`), the availability predicates, and the fetch |
| `lib/table-booking/purpose` | What a slot may be booked for. Read, never inferred. The slot caption, the review line and the submitted `purpose` all come from here |
| `lib/table-booking/journey` | Step vocabulary, high-chair cap and shortfall, and the details-step refusals |
| `lib/table-booking/slot-groups` | Lunch/Evening grouping and the high-chair display rules. Can only make an affirmed slot less available, never more |
| `lib/table-booking/horizon` | How far ahead we take bookings (12 months). Shared by the form and both website proxies |
| `lib/table-booking/submission` | The create-booking payload, the result shape and the blocked-reason copy |
| `lib/table-booking/formatting` | London-aware date/time parsing and display |
| `lib/table-booking/suggested-events` | The event shape and response normalisation |
| `lib/table-booking/hours-note` | The advisory bar/kitchen summary. Decides nothing |

Two older siblings predate that folder and still sit flat in `lib/`:
`table-booking-idempotency` and `table-booking-service-windows`. They are
imported by API routes as well, so they were left where they are.

### `PayPalDepositSection`

The deposit step, used by the form for groups that require one. Used nowhere else.

### `BookTableUpcomingEventsPanel`

The "what's on" panel shown beside the form on `/book-table`.

## How it talks to the management API

The form never calls the management API directly. It goes through this site's own routes, which hold the
API key server-side:

| Route | Purpose |
|-------|---------|
| `GET /api/table-bookings/availability` | Time slots for a date |
| `POST /api/table-bookings` | Create a booking |
| `POST /api/table-bookings/paypal/*` | Deposit payment |

`app/api/booking/agent/route.ts` was a separate booking channel. It was retired on 28 July 2026 and
answers 410; it is kept only as a tombstone, so there is no second place to keep in step.

## Two things that are easy to get wrong

- The form sends **`is_outside_seating`**; the proxy forwards **`outside_seating`** to the management
  API. The names are not symmetrical.
- `purpose` (`food` or `drinks`) is **required** when creating a booking. It used to be coerced to
  `food` when missing, which produced misleading service-window errors for bookings made outside kitchen
  hours (incident AB-001).
- The 12-month booking horizon is enforced in **three** places on purpose: the date input's `max`, the
  form's own check, and both proxies. Only the last of those actually binds; the first two exist so the
  guest hears about it before they wait for a round trip.

## History

Six components were removed in July 2026: `TableBookingForm`, `TableBookingWithTracking`,
`AvailabilityChecker`, `CustomerDetails`, `BookingDatePicker` and `BookingConfirmation`, along with the
`index.tsx` barrel. No page rendered any of them. This README previously described them as the main
flow, which is how a piece of planned work ended up aimed at a file that was never on screen.
