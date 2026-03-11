# Parking Inline Payment — Design Spec

**Date:** 2026-03-11
**Status:** Approved
**Codebases:** OJ-The-Anchor.pub · OJ-AnchorManagementTools

---

## Problem

Customers booking parking through the-anchor.pub complete the booking wizard but then fail to pay. The current flow creates a booking, returns a PayPal `approval_url`, and sends the customer an SMS with the payment link. Many customers don't follow through — they close the browser, ignore the SMS, or forget. The result is a backlog of `pending_payment` bookings and lost revenue.

## Solution

Collect payment inline during the booking wizard on the-anchor.pub using PayPal Smart Buttons (PayPal JS SDK). The customer pays before leaving the page. After payment they land on a branded confirmation page on the-anchor.pub. A confirmation SMS is still sent. The staff SMS flow in the management tools is unchanged.

---

## Scope

### In scope
- PayPal Smart Buttons embedded in wizard step 4 (supports PayPal account and card payment)
- New `/heathrow-parking/confirmation/[bookingId]` confirmation page on the-anchor.pub
- New `POST /api/parking/payment/create-order` and `POST /api/parking/payment/capture` proxy routes on the website
- New `POST /api/parking/payment/capture` endpoint on management tools
- `source: 'website'` flag on management tools booking creation to suppress payment-request SMS
- Abandoned checkout expiry reduced from 7 days to 30 minutes for website-sourced bookings
- Capacity re-checked at order creation (not only at step 1 of the wizard)

### Out of scope
- Stripe integration (PayPal only)
- Apple Pay / Google Pay (available automatically via PayPal Smart Buttons if enabled in PayPal dashboard — no code change needed)
- Changes to the staff booking flow in management tools
- Changes to SMS reminder cron jobs
- Refund flow changes

---

## User Journey (happy path)

1. Customer visits `/heathrow-parking` on the-anchor.pub
2. Completes wizard steps 1–3 (dates, customer details, vehicle)
3. Step 4 shows booking summary + PayPal Smart Buttons rendered inline via PayPal JS SDK
4. Customer clicks PayPal button or "Debit / Credit Card"
5. PayPal SDK calls `createOrder` → website calls `POST /api/parking/payment/create-order` → management tools creates booking (`pending_payment`) + PayPal order → returns `paypal_order_id`
6. PayPal overlay opens on the page (customer never leaves the-anchor.pub)
7. Customer completes payment in the overlay
8. PayPal SDK fires `onApprove(data)` with `data.orderID`
9. Website calls `POST /api/parking/payment/capture` with `{ orderID, bookingId }`
10. Management tools captures PayPal payment, confirms booking, sends confirmation SMS
11. Website redirects to `/heathrow-parking/confirmation/[bookingId]`
12. Customer sees branded confirmation page: reference, dates, vehicle, amount paid, SMS notice, getting-here info

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Customer opens PayPal overlay then closes it without paying | Returns to step 4. Booking in `pending_payment` expires after 30 minutes (new shorter TTL for `source:'website'` bookings). They can click the button again — a new booking + order is created. |
| Capacity fills between step 1 (availability check) and order creation | `createOrder` callback re-checks capacity. If full, returns a 409 error; wizard shows "Sorry, this slot is now fully booked — please choose different dates." |
| `onApprove` fires but capture API call fails (network drop) | Show inline error with retry button. The PayPal webhook (`PAYMENT.CAPTURE.COMPLETED`) will still fire and confirm the booking idempotently — so the SMS will still be sent even if the user's browser never sees the success response. |
| `onApprove` fires but capture fails because PayPal already captured (duplicate click) | Capture endpoint is idempotent — returns existing confirmed booking if already captured. |
| PayPal JS SDK fails to load | Wizard step 4 shows a fallback message: "Online payment is temporarily unavailable — please call us on 01753 682707 to complete your booking." |
| Customer navigates away after `onApprove` fires but before redirect | Webhook catches it, booking confirmed, SMS sent. Customer can retrieve confirmation by calling the pub with their reference. |
| Customer submits wizard twice (back button / double click) | `createOrder` is only called inside the PayPal SDK `createOrder` callback (triggered by button click), not on page load. Double-click prevention handled by disabling the button on first click. |
| PayPal `onCancel` fires | Show a brief "Payment cancelled — you can try again below" message and re-render the buttons. |

---

## Architecture

### Website (OJ-The-Anchor.pub)

#### New files

**`app/api/parking/payment/create-order/route.ts`**
```
POST — no auth required (public, rate-limited by Vercel)
Body: { bookingData: { customer, vehicle, start_at, end_at }, idempotencyKey?: string }
Action: calls management API POST /api/parking/bookings with source:'website'
Returns: { paypal_order_id: string, booking_id: string }
Errors: 409 capacity conflict, 400 validation, 503 management API unreachable
```

**`app/api/parking/payment/capture/route.ts`**
```
POST — no auth required
Body: { orderID: string, bookingId: string }
Action: calls management API POST /api/parking/payment/capture
Returns: { booking_id: string, reference: string }
Errors: 400 missing params, 502 capture failed
```

**`app/heathrow-parking/confirmation/[bookingId]/page.tsx`**
```
Server Component — no auth required
Params: bookingId (UUID)
Action: fetches booking details via management API GET /api/parking/bookings/[id]
  Note: this endpoint requires ANCHOR_API_KEY — the server component sends it as a header.
  The UUID booking ID provides minimal enumeration protection but no hard access control;
  this is acceptable given bookings contain no financial data beyond the amount already paid.
Renders: reference, dates, vehicle, amount paid, SMS sent notice, getting-here section, pub CTA
Error state: if booking not found or fetch fails, show generic "Thank you" message with phone number
```

#### Modified files

**`components/features/ParkingBookingWizard/index.tsx`**
- Step 4: replace "here is your PayPal link" with PayPal Smart Buttons
- Load PayPal JS SDK via `<Script>` tag (Next.js `next/script`) with `strategy="lazyOnload"`
- `createOrder` callback: POST to `/api/parking/payment/create-order`, return `paypal_order_id`
- Store `bookingId` in local state on `createOrder` success (needed for capture)
- `onApprove` callback: POST to `/api/parking/payment/capture`, redirect to confirmation page
- `onCancel` callback: show retry message, re-render buttons
- `onError` callback: show error message with phone number fallback
- Disable PayPal buttons during in-flight requests (prevent double submission)

**`lib/api.ts`**
- Add `createParkingPaymentOrder(bookingData, idempotencyKey?)` → calls `/api/parking/payment/create-order`
- Add `captureParkingPayment(orderID, bookingId)` → calls `/api/parking/payment/capture`
- Existing `getBookingById(id)` already returns the fields needed for the confirmation page

---

### Management Tools (OJ-AnchorManagementTools)

#### New files

**`app/api/parking/payment/capture/route.ts`**
```
POST — requires ANCHOR_API_KEY header (same key used by website proxy routes)
  Key stored as ANCHOR_API_KEY env var on OJ-The-Anchor.pub (already used by other proxy routes)
Body: { order_id: string, booking_id: string }
Action:
  1. Fetch booking — verify it exists and is in pending_payment status
  2. Call captureParkingPaymentAndConfirm(booking) (extracted shared function)
  3. Return { booking_id, reference, status: 'confirmed' }
Idempotency: if booking already confirmed, return 200 with existing data (not 409)
Errors: 404 booking not found, 400 already cancelled/expired, 502 PayPal capture failed
```

#### Modified files

**`app/api/parking/bookings/route.ts`** (POST handler)
- Add optional `source?: 'website' | 'staff'` field to Zod request schema (default: `'staff'`)
- When `source === 'website'`: skip sending payment request SMS after creating booking + PayPal order
- When `source === 'website'`: set `payment_due_at` to `now() + 30 minutes` (not 7 days)
- The existing abandoned-booking expiry cron (`/api/cron/parking-notifications`) already sweeps `pending_payment` bookings past their `payment_due_at` — no new cron needed
- Response already includes `paypal_order_id` — no change needed

**`lib/parking/payments.ts`**
- Extract capture + confirm + send-confirmation-SMS logic into `captureParkingPaymentAndConfirm(booking)`
- Used by: new `/api/parking/payment/capture` endpoint AND existing `/api/parking/payment/return` redirect handler
- This eliminates code duplication (the same logic currently lives inline in the return handler)

---

## PayPal JS SDK Integration

```html
<!-- Loaded via next/script lazyOnload in the wizard component -->
<script src="https://www.paypal.com/sdk/js?client-id={NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=GBP&intent=capture"></script>
```

Required environment variable: `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (already available — same PayPal account)

**CSP:** Loading the PayPal JS SDK requires adding `https://www.paypal.com` and `https://*.paypal.com` to `script-src` in the site's Content-Security-Policy headers (`next.config.js`). Must be updated before deploying to production.

**SDK load readiness:** The wizard component must not call `paypal.Buttons(...).render()` until the SDK script has loaded. Use a `useEffect` with a readiness check (e.g. `typeof window.paypal !== 'undefined'`) or a `window.paypalLoadPromise` pattern triggered by the Next.js `Script` `onLoad` callback.

```typescript
// Inside ParkingBookingWizard step 4
paypal.Buttons({
  style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' },
  createOrder: async () => {
    const res = await fetch('/api/parking/payment/create-order', { ... });
    const { paypal_order_id, booking_id } = await res.json();
    setBookingId(booking_id); // store for onApprove
    return paypal_order_id;
  },
  onApprove: async (data) => {
    const res = await fetch('/api/parking/payment/capture', {
      method: 'POST',
      body: JSON.stringify({ orderID: data.orderID, bookingId }),
    });
    const { booking_id } = await res.json();
    router.push(`/heathrow-parking/confirmation/${booking_id}`);
  },
  onCancel: () => setPaymentState('cancelled'),
  onError: () => setPaymentState('error'),
}).render('#paypal-button-container');
```

---

## Confirmation Page

Route: `/heathrow-parking/confirmation/[bookingId]`

Sections (top to bottom):
1. **Nav** — standard The Anchor site nav
2. **Hero** — green background, large tick, "Parking confirmed", booking reference in amber
3. **SMS banner** — amber strip: "Confirmation text sent to your mobile"
4. **Booking card** — drop-off date/time, pick-up date/time, vehicle reg + make/model, amount paid
5. **Getting here card** — address, taxi time to T5, bus 442 info, keep your keys reminder
6. **Pub CTA** — "While you're here — visit the pub" button

---

## Confirmation SMS (unchanged behaviour)

The existing confirmation SMS template fires from management tools after a successful capture:

> "The Anchor: Hi [name], thanks for your payment. Your parking from [date] to [date] is now confirmed (£[amount])."

No changes needed — this already fires from `captureParkingPaymentAndConfirm()`.

---

## Testing Requirements

| Area | Tests required |
|------|---------------|
| `create-order` route | Happy path; capacity conflict (409); management API down (503); missing fields (400) |
| `capture` route | Happy path; already-confirmed idempotency; PayPal capture failure (502) |
| Management `capture` endpoint | Happy path; idempotent re-call; booking not found; booking expired/cancelled |
| `source:'website'` flag | Booking created with 30-min expiry; SMS suppressed; PayPal order still created |
| Confirmation page | Renders with valid bookingId; graceful fallback on 404 |
| Wizard step 4 | `createOrder` called on button click (not on mount); `onApprove` redirects; `onCancel` shows retry; `onError` shows fallback |

---

## Complexity Score

**L (4)** — touches 7 files across 2 codebases, no new external services, no schema changes (booking table unchanged, `payment_due_at` already exists).

---

## Out of Scope / Parking

- Moving the PayPal return URL redirect handler (`/api/parking/payment/return`) — it stays for the SMS flow
- Changing the 7-day expiry for SMS-flow bookings — only website-sourced bookings get 30 minutes
- Refund UI on the website
- Email receipts (PayPal sends its own)
