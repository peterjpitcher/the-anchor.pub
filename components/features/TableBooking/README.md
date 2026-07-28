# Table Booking Components

The customer-facing table booking flow for The Anchor. Everything in this folder is live. There is no
longer a second, unrendered set of components sitting alongside it.

## What is here

### `ManagementTableBookingForm`

**The booking form.** Rendered by `app/book-table/page.tsx`. It owns the whole journey: date, time,
party size, food or drinks, high chairs, outside seating, customer details and submission.

```tsx
import { ManagementTableBookingForm } from '@/components/features/TableBooking/ManagementTableBookingForm'

<ManagementTableBookingForm prefill={prefill} />
```

Import it directly. There is deliberately **no barrel file**: the old one exported components that
nothing rendered, which made it easy to spend a day editing a file that was never on screen.

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
| `POST /api/table-bookings` | Create a booking. `/api/table-bookings/create` re-exports the same handler |
| `GET /api/table-bookings/[reference]` | Look up a booking. Requires the customer's email |
| `POST /api/table-bookings/paypal/*` | Deposit payment |

`app/api/booking/agent/route.ts` is a **separate booking channel** used by the AI agent. It creates real
bookings and is not part of this component tree, so any change to the booking contract has to be applied
there too or the two quietly diverge.

## Two things that are easy to get wrong

- The form sends **`is_outside_seating`**; the proxy forwards **`outside_seating`** to the management
  API. The names are not symmetrical.
- `purpose` (`food` or `drinks`) is **required** when creating a booking. It used to be coerced to
  `food` when missing, which produced misleading service-window errors for bookings made outside kitchen
  hours (incident AB-001).

## History

Six components were removed in July 2026: `TableBookingForm`, `TableBookingWithTracking`,
`AvailabilityChecker`, `CustomerDetails`, `BookingDatePicker` and `BookingConfirmation`, along with the
`index.tsx` barrel. No page rendered any of them. This README previously described them as the main
flow, which is how a piece of planned work ended up aimed at a file that was never on screen.
