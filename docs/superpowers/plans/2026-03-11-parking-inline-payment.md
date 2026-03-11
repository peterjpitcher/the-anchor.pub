# Parking Inline Payment Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the PayPal-redirect-then-SMS payment flow for website bookings with inline PayPal Smart Buttons that keep the customer on the-anchor.pub throughout, from booking to branded confirmation page.

**Architecture:** Two codebases work in tandem. Management tools gains a `source:'website'` flag on `POST /api/parking/bookings` (suppresses payment-request SMS, sets 30-min `payment_due_at`) and a new `POST /api/parking/payment/capture` endpoint. The website gains two proxy API routes, PayPal Smart Buttons embedded in the wizard step 4, and a branded confirmation page. Staff bookings via management tools UI are unchanged.

**Tech Stack:** Next.js 15 App Router, TypeScript, PayPal JS SDK (CDN via `<Script>`), Zod, Vitest (management tools tests), Jest (website tests).

**Spec:** `docs/superpowers/specs/2026-03-11-parking-inline-payment-design.md`

---

## File map

### OJ-AnchorManagementTools

| Action | File |
|--------|------|
| Modify | `src/app/api/parking/bookings/route.ts` |
| Create | `src/app/api/parking/payment/capture/route.ts` |
| Create | `src/app/api/parking/payment/capture/route.test.ts` |

### OJ-The-Anchor.pub

| Action | File |
|--------|------|
| Modify | `lib/api.ts` |
| Create | `app/api/parking/payment/create-order/route.ts` |
| Create | `app/api/parking/payment/create-order/route.test.ts` |
| Create | `app/api/parking/payment/capture/route.ts` |
| Create | `app/api/parking/payment/capture/route.test.ts` |
| Modify | `components/features/ParkingBookingWizard/index.tsx` |
| Create | `app/heathrow-parking/confirmation/[bookingId]/page.tsx` |
| Modify | `next.config.js` |
| Modify | `.env.example` |

---

## Chunk 1: Management tools — source flag, short expiry, expose order ID

### Task 1: Add `source` field to booking creation route

**Files:**
- Modify: `src/app/api/parking/bookings/route.ts`

This task adds three things to the existing POST route:
1. Accept an optional `source: 'website' | 'staff'` field (defaults to `'staff'`)
2. When `source === 'website'`: skip the payment-request SMS and override `payment_due_at` to 30 minutes
3. Include `paypal_order_id` in the response so the website's proxy route can return it to the PayPal SDK

- [ ] **Step 1: Add `source` to the Zod schema**

In `src/app/api/parking/bookings/route.ts`, find `CreateBookingSchema` and add the `source` field:

```typescript
const CreateBookingSchema = z.object({
  customer: z.object({ /* unchanged */ }),
  vehicle: z.object({ /* unchanged */ }),
  start_at: z.string().datetime({ offset: true }),
  end_at: z.string().datetime({ offset: true }),
  notes: z.string().optional(),
  source: z.enum(['website', 'staff']).optional().default('staff'), // ← add this line
})
```

- [ ] **Step 2: Add the 30-minute expiry update after booking creation**

After the `booking = result.booking` line (inside the `try` block that calls `createPendingParkingBooking`), add:

```typescript
// For website-sourced bookings use a 30-minute expiry.
// The default 7-day window is only needed for the SMS-reminder flow.
if (payload.source === 'website') {
  const thirtyMinsFromNow = new Date(Date.now() + 30 * 60 * 1000).toISOString()
  await supabase
    .from('parking_bookings')
    .update({ payment_due_at: thirtyMinsFromNow })
    .eq('id', booking.id)
  booking = { ...booking, payment_due_at: thirtyMinsFromNow }
}
```

- [ ] **Step 3: Guard the SMS send behind the source flag**

Find the block that calls `sendParkingPaymentRequest` and wrap it:

```typescript
// Only send payment-request SMS for staff-created bookings.
// Website bookings collect payment inline; no SMS needed at this stage.
if (payload.source !== 'website') {
  try {
    const notificationResult = await sendParkingPaymentRequest(...)
    // ... existing SMS meta handling (unchanged) ...
  } catch (notificationError) {
    // ... existing error handling (unchanged) ...
  }
} else {
  smsMeta = { sent: false, skipped: true, code: 'source_website', logFailure: false }
}
```

- [ ] **Step 4: Expose `paypal_order_id` in the response**

`createParkingPaymentOrder` returns an object with both `approveUrl` and `orderId`. Find `responsePayload` and add the order ID:

```typescript
const responsePayload = {
  success: true,
  data: {
    booking_id: booking.id,
    reference: booking.reference,
    amount: booking.override_price ?? booking.calculated_price,
    currency: 'GBP',
    pricing_breakdown: booking.pricing_breakdown,
    payment_due_at: booking.payment_due_at,
    paypal_approval_url: paymentResult.approveUrl,
    paypal_order_id: paymentResult.orderId, // ← add this line
  },
  meta: { status_code: 201, sms: smsMeta }
}
```

> **Note:** Verify `paymentResult.orderId` is the correct field name by checking `src/lib/parking/payments.ts` → `createParkingPaymentOrder` return type. If it's named differently (e.g. `order_id`), adjust accordingly.

- [ ] **Step 5: Verify the build compiles**

```bash
cd /Users/peterpitcher/Cursor/OJ-AnchorManagementTools
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
cd /Users/peterpitcher/Cursor/OJ-AnchorManagementTools
git add src/app/api/parking/bookings/route.ts
git commit -m "feat: add source flag to parking booking API — skip SMS and use 30-min expiry for website bookings"
```

---

### Task 2: Create the management tools capture endpoint

**Files:**
- Create: `src/app/api/parking/payment/capture/route.ts`
- Create: `src/app/api/parking/payment/capture/route.test.ts`

This endpoint is called by the website after PayPal's `onApprove` fires. It fetches the booking, calls the existing `captureParkingPayment` (already in `lib/parking/payments.ts`), and returns the confirmed booking details. It is idempotent — if the booking is already confirmed (e.g. webhook arrived first), it returns 200 with the existing data.

- [ ] **Step 1: Write the failing tests first**

Create `src/app/api/parking/payment/capture/route.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({})),
}))

vi.mock('@/lib/parking/repository', () => ({
  getParkingBooking: vi.fn(),
}))

vi.mock('@/lib/parking/payments', () => ({
  captureParkingPayment: vi.fn(),
}))

vi.mock('@/lib/api/auth', () => ({
  withApiAuth: vi.fn((handler, _scopes, req) => handler(req, { id: 'test-key' })),
}))

import { getParkingBooking } from '@/lib/parking/repository'
import { captureParkingPayment } from '@/lib/parking/payments'

const mockBookingPending = {
  id: 'booking-123',
  reference: 'PAR-20260311-0001',
  status: 'pending_payment',
  payment_status: 'pending',
  calculated_price: 105,
  override_price: null,
}

const mockBookingConfirmed = {
  ...mockBookingPending,
  status: 'confirmed',
  payment_status: 'paid',
}

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/parking/payment/capture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': 'test-key' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => vi.clearAllMocks())

describe('POST /api/parking/payment/capture', () => {
  it('should capture payment and return confirmed booking', async () => {
    vi.mocked(getParkingBooking).mockResolvedValue(mockBookingPending as any)
    vi.mocked(captureParkingPayment).mockResolvedValue(mockBookingConfirmed as any)

    const res = await POST(makeRequest({ order_id: 'PAYPAL-ORDER-1', booking_id: 'booking-123' }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.booking_id).toBe('booking-123')
    expect(body.data.reference).toBe('PAR-20260311-0001')
    expect(captureParkingPayment).toHaveBeenCalledWith(
      mockBookingPending,
      'PAYPAL-ORDER-1',
      expect.objectContaining({ client: expect.anything() })
    )
  })

  it('should return 200 idempotently if booking already confirmed', async () => {
    vi.mocked(getParkingBooking).mockResolvedValue(mockBookingConfirmed as any)

    const res = await POST(makeRequest({ order_id: 'PAYPAL-ORDER-1', booking_id: 'booking-123' }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(captureParkingPayment).not.toHaveBeenCalled()
    expect(body.data.booking_id).toBe('booking-123')
  })

  it('should return 400 when booking_id or order_id are missing', async () => {
    const res = await POST(makeRequest({ order_id: 'PAYPAL-ORDER-1' }))
    expect(res.status).toBe(400)
  })

  it('should return 404 when booking is not found', async () => {
    vi.mocked(getParkingBooking).mockResolvedValue(null)
    const res = await POST(makeRequest({ order_id: 'PAYPAL-ORDER-1', booking_id: 'missing' }))
    expect(res.status).toBe(404)
  })

  it('should return 400 when booking is cancelled or expired', async () => {
    vi.mocked(getParkingBooking).mockResolvedValue({ ...mockBookingPending, status: 'cancelled' } as any)
    const res = await POST(makeRequest({ order_id: 'PAYPAL-ORDER-1', booking_id: 'booking-123' }))
    expect(res.status).toBe(400)
  })

  it('should return 502 when PayPal capture throws', async () => {
    vi.mocked(getParkingBooking).mockResolvedValue(mockBookingPending as any)
    vi.mocked(captureParkingPayment).mockRejectedValue(new Error('PayPal error'))
    const res = await POST(makeRequest({ order_id: 'PAYPAL-ORDER-1', booking_id: 'booking-123' }))
    expect(res.status).toBe(502)
  })
})
```

- [ ] **Step 2: Run tests — confirm they all fail**

```bash
cd /Users/peterpitcher/Cursor/OJ-AnchorManagementTools
npx vitest run src/app/api/parking/payment/capture/route.test.ts
```

Expected: all tests fail with "Cannot find module './route'".

- [ ] **Step 3: Create the capture route**

Create `src/app/api/parking/payment/capture/route.ts`:

```typescript
import { NextRequest } from 'next/server'
import { withApiAuth, createApiResponse, createErrorResponse } from '@/lib/api/auth'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { getParkingBooking } from '@/lib/parking/repository'
import { captureParkingPayment } from '@/lib/parking/payments'
import { logger } from '@/lib/logger'

const CaptureSchema = z.object({
  order_id: z.string().min(1),
  booking_id: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  return withApiAuth(async (req) => {
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return createErrorResponse('Invalid JSON body', 'VALIDATION_ERROR', 400)
    }

    const parsed = CaptureSchema.safeParse(body)
    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.errors[0]?.message || 'Invalid payload',
        'VALIDATION_ERROR',
        400
      )
    }

    const { order_id, booking_id } = parsed.data
    const supabase = createAdminClient()

    const booking = await getParkingBooking(booking_id, supabase)
    if (!booking) {
      return createErrorResponse('Booking not found', 'NOT_FOUND', 404)
    }

    // Idempotent — if already confirmed (e.g. webhook arrived first), return success.
    if (booking.status === 'confirmed' && booking.payment_status === 'paid') {
      return createApiResponse({
        success: true,
        data: { booking_id: booking.id, reference: booking.reference, status: 'confirmed' },
      }, 200)
    }

    if (booking.status === 'cancelled' || booking.status === 'expired') {
      return createErrorResponse(
        `Booking is ${booking.status} and cannot be captured`,
        'BOOKING_NOT_CAPTURABLE',
        400
      )
    }

    try {
      await captureParkingPayment(booking, order_id, { client: supabase })
    } catch (error) {
      logger.error('PayPal capture failed in website capture endpoint', {
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: { booking_id, order_id },
      })
      return createErrorResponse('Payment capture failed', 'CAPTURE_FAILED', 502)
    }

    return createApiResponse({
      success: true,
      data: { booking_id: booking.id, reference: booking.reference, status: 'confirmed' },
    }, 200)
  }, ['parking:create'], request)
}
```

- [ ] **Step 4: Run tests — confirm they all pass**

```bash
cd /Users/peterpitcher/Cursor/OJ-AnchorManagementTools
npx vitest run src/app/api/parking/payment/capture/route.test.ts
```

Expected: 6 passing.

- [ ] **Step 5: Run full lint + typecheck**

```bash
cd /Users/peterpitcher/Cursor/OJ-AnchorManagementTools
npm run lint && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
cd /Users/peterpitcher/Cursor/OJ-AnchorManagementTools
git add src/app/api/parking/payment/capture/
git commit -m "feat: add parking payment capture endpoint for inline website checkout"
```

---

## Chunk 2: Website — proxy API routes and API client

### Task 3: Add new methods to `lib/api.ts`

**Files:**
- Modify: `lib/api.ts` in OJ-The-Anchor.pub

Add two new types and two new API methods. These live alongside the existing parking methods.

- [ ] **Step 1: Add the new types**

Find the parking types section in `lib/api.ts` and add after `ParkingBookingDetails`:

```typescript
export interface ParkingCreateOrderRequest {
  customer: ParkingCustomerDetails
  vehicle: ParkingVehicleDetails
  start_at: string
  end_at: string
  notes?: string
}

// Management tools returns this from /parking/bookings when source:'website'.
// request<T>() automatically unwraps { success: true, data: {...} } → data.
export interface ParkingCreateOrderResponse {
  paypal_order_id: string
  booking_id: string
  reference: string
  amount: number
  currency: string
  pricing_breakdown?: ParkingPricingBreakdownItem[]  // needed for wizard step 4 price display
}

export interface ParkingCaptureResponse {
  booking_id: string
  reference: string
  status: string
}
```

- [ ] **Step 2: Add the two new API methods to the `AnchorAPI` class**

The codebase uses `this.request<T>(endpoint, options)` for all management-tools calls. It handles the `X-API-Key` header, build-phase fallbacks, and unwraps `{ success: true, data: {...} }` automatically. Use this pattern — do NOT use raw `fetch`. Note the casing: `this.baseURL` (capital URL).

Find `async getParkingBooking` and add after it:

```typescript
async createParkingPaymentOrder(
  data: ParkingCreateOrderRequest,
  idempotencyKey?: string
): Promise<ParkingCreateOrderResponse> {
  const headers: Record<string, string> = {}
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey

  return this.request<ParkingCreateOrderResponse>('/parking/bookings', {
    method: 'POST',
    body: JSON.stringify({ ...data, source: 'website' }),
    headers,
  })
}

async captureParkingPayment(orderID: string, bookingId: string): Promise<ParkingCaptureResponse> {
  return this.request<ParkingCaptureResponse>('/parking/payment/capture', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderID, booking_id: bookingId }),
  })
}
```

- [ ] **Step 3: Typecheck**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub
git add lib/api.ts
git commit -m "feat: add createParkingPaymentOrder and captureParkingPayment to API client"
```

---

### Task 4: Create website proxy routes

**Files:**
- Create: `app/api/parking/payment/create-order/route.ts`
- Create: `app/api/parking/payment/capture/route.ts`

These thin proxy routes sit between the PayPal SDK (running in the browser) and the management tools API. They keep the `ANCHOR_API_KEY` secret and add any server-side validation needed.

- [ ] **Step 1: Create `app/api/parking/payment/create-order/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { anchorAPI } from '@/lib/api'

const CreateOrderSchema = z.object({
  customer: z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email().optional(),
    mobile_number: z.string().min(1),
  }),
  vehicle: z.object({
    registration: z.string().min(1),
    make: z.string().optional(),
    model: z.string().optional(),
    colour: z.string().optional(),
  }),
  start_at: z.string().datetime({ offset: true }),
  end_at: z.string().datetime({ offset: true }),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CreateOrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || 'Invalid payload' },
      { status: 400 }
    )
  }

  // Derive an idempotency key from the booking fingerprint so duplicate button
  // clicks don't create duplicate bookings.
  const idempotencyKey = Buffer.from(
    `${parsed.data.customer.mobile_number}|${parsed.data.vehicle.registration}|${parsed.data.start_at}`
  ).toString('base64')

  try {
    const result = await anchorAPI.createParkingPaymentOrder(parsed.data, idempotencyKey)
    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    const status = error?.status === 409 ? 409 : 502
    const message =
      error?.code === 'CAPACITY_UNAVAILABLE'
        ? 'Sorry, this slot is now fully booked. Please choose different dates.'
        : 'Unable to create payment order. Please try again.'
    return NextResponse.json({ error: message, code: error?.code }, { status })
  }
}
```

- [ ] **Step 2: Create `app/api/parking/payment/capture/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { anchorAPI } from '@/lib/api'

const CaptureSchema = z.object({
  orderID: z.string().min(1),
  bookingId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CaptureSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || 'Invalid payload' },
      { status: 400 }
    )
  }

  try {
    const result = await anchorAPI.captureParkingPayment(parsed.data.orderID, parsed.data.bookingId)
    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Payment capture failed. Please contact us if payment was taken.' },
      { status: 502 }
    )
  }
}
```

- [ ] **Step 3: Write tests for the proxy routes**

Create `app/api/parking/payment/create-order/route.test.ts`:

```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { POST } from './route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    createParkingPaymentOrder: jest.fn(),
  },
}))

import { anchorAPI } from '@/lib/api'

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/parking/payment/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const validBody = {
  customer: { first_name: 'Jane', last_name: 'Smith', mobile_number: '+447700900001' },
  vehicle: { registration: 'AB12CDE' },
  start_at: '2026-04-01T08:00:00+01:00',
  end_at: '2026-04-08T18:00:00+01:00',
}

beforeEach(() => jest.clearAllMocks())

describe('POST /api/parking/payment/create-order', () => {
  it('returns paypal_order_id and booking_id on success', async () => {
    ;(anchorAPI.createParkingPaymentOrder as jest.Mock).mockResolvedValue({
      paypal_order_id: 'PAYPAL-123',
      booking_id: 'booking-abc',
      reference: 'PAR-20260401-0001',
      amount: 105,
      currency: 'GBP',
    })

    const res = await POST(makeRequest(validBody))
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.paypal_order_id).toBe('PAYPAL-123')
    expect(data.booking_id).toBe('booking-abc')
  })

  it('returns 400 for missing required fields', async () => {
    const res = await POST(makeRequest({ customer: { first_name: 'Jane' } }))
    expect(res.status).toBe(400)
  })

  it('returns 409 with user-friendly message on capacity conflict', async () => {
    const err = Object.assign(new Error('Capacity unavailable'), { status: 409, code: 'CAPACITY_UNAVAILABLE' })
    ;(anchorAPI.createParkingPaymentOrder as jest.Mock).mockRejectedValue(err)

    const res = await POST(makeRequest(validBody))
    const data = await res.json()

    expect(res.status).toBe(409)
    expect(data.error).toMatch(/fully booked/i)
  })

  it('returns 502 on management API failure', async () => {
    ;(anchorAPI.createParkingPaymentOrder as jest.Mock).mockRejectedValue(new Error('Network error'))
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(502)
  })
})
```

Create `app/api/parking/payment/capture/route.test.ts`:

```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { POST } from './route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    captureParkingPayment: jest.fn(),
  },
}))

import { anchorAPI } from '@/lib/api'

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/parking/payment/capture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => jest.clearAllMocks())

describe('POST /api/parking/payment/capture', () => {
  it('returns booking details on success', async () => {
    ;(anchorAPI.captureParkingPayment as jest.Mock).mockResolvedValue({
      booking_id: 'booking-abc',
      reference: 'PAR-20260401-0001',
      status: 'confirmed',
    })

    const res = await POST(makeRequest({ orderID: 'PAYPAL-123', bookingId: '00000000-0000-0000-0000-000000000001' }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.booking_id).toBe('booking-abc')
  })

  it('returns 400 for missing fields', async () => {
    const res = await POST(makeRequest({ orderID: 'PAYPAL-123' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for non-UUID bookingId', async () => {
    const res = await POST(makeRequest({ orderID: 'PAYPAL-123', bookingId: 'not-a-uuid' }))
    expect(res.status).toBe(400)
  })

  it('returns 502 on capture failure', async () => {
    ;(anchorAPI.captureParkingPayment as jest.Mock).mockRejectedValue(new Error('Capture failed'))
    const res = await POST(makeRequest({ orderID: 'PAYPAL-123', bookingId: '00000000-0000-0000-0000-000000000001' }))
    expect(res.status).toBe(502)
  })
})
```

- [ ] **Step 4: Run tests — confirm they fail before implementation**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub
npx jest app/api/parking/payment --testPathPattern="route.test"
```

Expected: all tests fail with "Cannot find module './route'".

- [ ] **Step 5: Typecheck + lint**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub
npx tsc --noEmit && npm run lint
```

Expected: no errors.

- [ ] **Step 6: Run tests again — confirm they pass**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub
npx jest app/api/parking/payment --testPathPattern="route.test"
```

Expected: 8 tests passing across both files.

- [ ] **Step 7: Commit**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub
git add app/api/parking/payment/
git commit -m "feat: add parking payment proxy routes with tests for PayPal SDK integration"
```

---

## Chunk 3: Website — PayPal wizard step 4

### Task 5: Update `next.config.js` for PayPal CSP

**Files:**
- Modify: `next.config.js`

The PayPal JS SDK loads scripts from `paypal.com`. Without an explicit CSP allowance this will fail silently in some browsers.

- [ ] **Step 1: Open `next.config.js` and find the security headers section**

There is currently no `Content-Security-Policy` header defined. Add one inside the `headers()` function, scoped to all routes (`source: '/(.*)'`):

```javascript
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' https://www.paypal.com https://*.paypal.com",
    "style-src 'self' 'unsafe-inline'",
    "frame-src https://www.paypal.com https://*.paypal.com",
    "connect-src 'self' https://www.paypal.com https://*.paypal.com",
    "img-src 'self' data: blob: https://*.paypal.com https://*.paypalobjects.com",
  ].join('; '),
},
```

> **Important:** Do NOT add `'unsafe-inline'` to `script-src`. `'unsafe-inline'` is only needed on `style-src` (for Tailwind). PayPal loads via `<script src="...">` (an external URL), so only the `paypal.com` domain entries are needed on `script-src`. Adding `'unsafe-inline'` to `script-src` would be a security regression. The `frame-src` directive is essential — PayPal's checkout overlay opens in an iframe.

- [ ] **Step 2: Build to verify no warnings**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub
npm run build 2>&1 | tail -20
```

Expected: build succeeds, no CSP-related warnings.

- [ ] **Step 3: Commit**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub
git add next.config.js
git commit -m "chore: add CSP headers to allow PayPal JS SDK"
```

---

### Task 6: Replace wizard step 4 with PayPal Smart Buttons

**Files:**
- Modify: `components/features/ParkingBookingWizard/index.tsx`

The current step 4 calls `handleSubmit` which POSTs to `/api/parking/bookings` and redirects to `paypal_approval_url`. Replace this with inline PayPal Smart Buttons.

The PayPal JS SDK is loaded via a `<Script>` tag with `strategy="afterInteractive"`. A `useEffect` waits for `window.paypal` to be defined before rendering the buttons. The `createOrder` callback calls `/api/parking/payment/create-order`. The `onApprove` callback calls `/api/parking/payment/capture` and redirects to the confirmation page.

- [ ] **Step 1: Add new state and imports at the top of the component**

Find the existing `useState` and `useEffect` imports and add `useRef` and `useRouter`:

```typescript
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
```

Add new state variables near the top of the component function (alongside existing state):

```typescript
const router = useRouter()
const paypalContainerRef = useRef<HTMLDivElement>(null)
const [paypalLoaded, setPaypalLoaded] = useState(false)
const [paypalRendered, setPaypalRendered] = useState(false)
const [captureState, setCaptureState] = useState<'idle' | 'capturing' | 'error' | 'cancelled'>('idle')
// Stores the booking_id returned by createOrder so onApprove can pass it to capture
const pendingBookingIdRef = useRef<string | null>(null)
```

- [ ] **Step 2: Add a `renderPayPalButtons` function**

Add this function inside the component, after the existing `handleSubmit` function:

```typescript
function renderPayPalButtons() {
  if (!window.paypal || !paypalContainerRef.current || paypalRendered) return

  setPaypalRendered(true)

  window.paypal.Buttons({
    style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 48 },

    createOrder: async () => {
      setCaptureState('idle')
      const res = await fetch('/api/parking/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email || undefined,
            mobile_number: formData.mobile,
          },
          vehicle: {
            registration: formData.registration.replace(/\s+/g, '').toUpperCase(),
            make: formData.make || undefined,
            model: formData.model || undefined,
            colour: formData.colour || undefined,
          },
          start_at: formData.startAt,
          end_at: formData.endAt,
          notes: formData.notes || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        // Throwing here causes PayPal SDK to show its own error screen — that's intentional.
        throw new Error(err?.error || 'Could not create order')
      }

      const data = await res.json()
      pendingBookingIdRef.current = data.booking_id
      return data.paypal_order_id
    },

    onApprove: async (data: { orderID: string }) => {
      setCaptureState('capturing')
      const res = await fetch('/api/parking/payment/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderID: data.orderID,
          bookingId: pendingBookingIdRef.current,
        }),
      })

      if (!res.ok) {
        setCaptureState('error')
        return
      }

      const result = await res.json()
      router.push(`/heathrow-parking/confirmation/${result.booking_id}`)
    },

    onCancel: () => {
      setCaptureState('cancelled')
      // Reset so buttons can be re-rendered on retry
      setPaypalRendered(false)
      pendingBookingIdRef.current = null
    },

    onError: () => {
      setCaptureState('error')
      setPaypalRendered(false)
      pendingBookingIdRef.current = null
    },
  }).render(paypalContainerRef.current)
}
```

- [ ] **Step 3: Add a `useEffect` that renders buttons when SDK is ready**

Add after the existing `useEffect` blocks:

```typescript
useEffect(() => {
  if (currentStep === 4 && paypalLoaded && !paypalRendered) {
    renderPayPalButtons()
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentStep, paypalLoaded, paypalRendered])
```

- [ ] **Step 4: Replace the step 4 JSX with the new PayPal layout**

Find `case 4:` in the render switch/if and replace the entire step 4 return with:

```tsx
// Step 4: Review & Pay
return (
  <>
    {/* PayPal JS SDK — loaded lazily, only on step 4 */}
    <Script
      src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=GBP&intent=capture`}
      strategy="afterInteractive"
      onLoad={() => setPaypalLoaded(true)}
    />

    <div className="space-y-6">
      {/* Booking summary */}
      <div className="rounded-xl border border-anchor-gold/20 bg-anchor-cream p-5 space-y-3 text-sm">
        <h3 className="font-semibold text-anchor-green text-base">Booking summary</h3>
        <div className="grid grid-cols-2 gap-y-2 text-anchor-charcoal">
          <span className="text-anchor-sage">Arrival</span>
          <span className="font-medium">{new Date(formData.startAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          <span className="text-anchor-sage">Departure</span>
          <span className="font-medium">{new Date(formData.endAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          <span className="text-anchor-sage">Name</span>
          <span className="font-medium">{formData.firstName} {formData.lastName}</span>
          <span className="text-anchor-sage">Mobile</span>
          <span className="font-medium">{formData.mobile}</span>
          <span className="text-anchor-sage">Vehicle</span>
          <span className="font-medium">{formData.registration.toUpperCase()}{formData.make ? ` · ${formData.make}` : ''}</span>
        </div>

        {/* Pricing */}
        {estimatedPrice !== null && (
          <div className="border-t border-anchor-gold/20 pt-3 space-y-1">
            {pricingBreakdown?.map((item, i) => (
              <div key={i} className="flex justify-between text-anchor-sage text-xs">
                <span>{item.quantity} {item.unit}{item.quantity !== 1 ? 's' : ''} @ £{item.rate}</span>
                <span>£{item.subtotal.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-anchor-charcoal pt-1">
              <span>Total</span>
              <span className="text-anchor-gold">£{estimatedPrice.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* State messages */}
      {captureState === 'cancelled' && (
        <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-4 py-3">
          Payment cancelled — you can try again below.
        </p>
      )}
      {captureState === 'error' && (
        <p className="text-sm text-red-700 bg-red-50 rounded-lg px-4 py-3">
          Payment could not be completed. Please try again or call us on <a href="tel:01753682707" className="font-semibold underline">01753 682707</a>.
        </p>
      )}
      {captureState === 'capturing' && (
        <p className="text-sm text-anchor-green bg-green-50 rounded-lg px-4 py-3">
          Confirming your booking…
        </p>
      )}

      {/* PayPal button container */}
      {captureState !== 'capturing' && (
        <div ref={paypalContainerRef} id="paypal-button-container" className="min-h-[50px]">
          {!paypalLoaded && (
            <div className="h-12 rounded-lg bg-anchor-cream animate-pulse" />
          )}
        </div>
      )}

      <p className="text-xs text-anchor-sage text-center">
        Vehicles parked at owner&apos;s risk. By paying you agree to our parking terms.
      </p>

      {/* Back button */}
      <button
        type="button"
        onClick={() => { setCurrentStep(3); setPaypalRendered(false); setCaptureState('idle') }}
        className="w-full text-sm text-anchor-sage hover:text-anchor-charcoal underline"
      >
        ← Back to vehicle details
      </button>
    </div>
  </>
)
```

> **Note:** `formData`, `estimatedPrice`, `pricingBreakdown`, `currentStep`, `setCurrentStep` — use the exact variable names already in the component. The wizard already has all of these; just reference them correctly.

- [ ] **Step 5: Add `window.paypal` type declaration to avoid TypeScript errors**

At the top of the file (or in a `types/paypal.d.ts` if the project has one):

```typescript
declare global {
  interface Window {
    paypal?: {
      Buttons: (config: Record<string, unknown>) => { render: (el: HTMLElement) => void }
    }
  }
}
```

- [ ] **Step 6: Typecheck + lint**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub
npx tsc --noEmit && npm run lint
```

Expected: no errors.

- [ ] **Step 7: Smoke test in browser**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub
npm run dev
```

Navigate to `/heathrow-parking`, complete steps 1–3, verify:
- Step 4 shows the booking summary with pricing
- PayPal skeleton loader shows briefly while SDK loads
- PayPal buttons render (PayPal + card options)
- Clicking back returns to step 3 correctly

- [ ] **Step 8: Commit**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub
git add components/features/ParkingBookingWizard/index.tsx
git commit -m "feat: replace PayPal redirect with inline Smart Buttons in parking wizard step 4"
```

---

## Chunk 4: Website — confirmation page

### Task 7: Create the branded confirmation page

**Files:**
- Create: `app/heathrow-parking/confirmation/[bookingId]/page.tsx`

This is a Server Component. It fetches booking details from the management API using `anchorAPI.getParkingBooking()` (already exists in `lib/api.ts`). The page is public — the UUID booking ID provides sufficient enumeration protection.

- [ ] **Step 1: Create the confirmation page**

Create `app/heathrow-parking/confirmation/[bookingId]/page.tsx`:

```tsx
import { Metadata } from 'next'
import Link from 'next/link'
import { anchorAPI } from '@/lib/api'

// Next.js 15: params is a Promise — must be awaited before use.
interface Props {
  params: Promise<{ bookingId: string }>
}

export const metadata: Metadata = {
  title: 'Parking Confirmed | The Anchor',
  robots: { index: false },
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/London',
  })
}

export default async function ParkingConfirmationPage({ params }: Props) {
  const { bookingId } = await params   // Next.js 15: must await params
  let booking = null
  try {
    booking = await anchorAPI.getParkingBooking(bookingId)
  } catch {
    // Fallback handled below
  }

  if (!booking) {
    return (
      <main className="min-h-screen bg-anchor-bg flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-5xl">✓</div>
          <h1 className="text-2xl font-bold text-anchor-cream-text">Thank you for your booking</h1>
          <p className="text-anchor-sage text-sm">
            Your booking is being processed. You should receive a confirmation text shortly.
            If you have any questions, call us on{' '}
            <a href="tel:01753682707" className="text-anchor-gold underline">01753 682707</a>.
          </p>
          <Link href="/" className="inline-block mt-4 text-anchor-gold underline text-sm">
            Return to The Anchor
          </Link>
        </div>
      </main>
    )
  }

  const amount = booking.override_price ?? booking.calculated_price

  return (
    <main className="min-h-screen bg-anchor-bg">
      {/* Hero */}
      <section className="bg-anchor-green px-4 pt-12 pb-8 text-center">
        <div className="w-14 h-14 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Parking confirmed</h1>
        <p className="text-green-200 text-sm">
          Booking reference: <span className="text-anchor-gold font-bold">{booking.reference}</span>
        </p>
      </section>

      {/* SMS notice */}
      <div className="bg-anchor-bg-raised border-t-2 border-amber-400 px-4 py-3 flex items-center gap-3">
        <span className="text-xl">📱</span>
        <p className="text-amber-400 text-sm font-medium">Confirmation text sent to your mobile</p>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Booking details */}
        <div className="bg-anchor-bg-card rounded-xl overflow-hidden">
          <div className="bg-anchor-bg-raised px-4 py-2.5">
            <h2 className="text-green-400 text-xs font-bold uppercase tracking-wider">Your booking</h2>
          </div>
          <div className="divide-y divide-anchor-bg-raised px-4">
            <div className="flex justify-between items-start py-3">
              <span className="text-anchor-sage text-sm">Drop off</span>
              <span className="text-anchor-cream-text text-sm font-semibold text-right">
                {formatDateTime(booking.start_at)}
              </span>
            </div>
            <div className="flex justify-between items-start py-3">
              <span className="text-anchor-sage text-sm">Pick up</span>
              <span className="text-anchor-cream-text text-sm font-semibold text-right">
                {formatDateTime(booking.end_at)}
              </span>
            </div>
            <div className="flex justify-between items-start py-3">
              <span className="text-anchor-sage text-sm">Vehicle</span>
              <div className="text-right">
                <p className="text-anchor-cream-text text-sm font-semibold">{booking.vehicle_registration}</p>
                {booking.vehicle_make && (
                  <p className="text-anchor-sage text-xs">{booking.vehicle_make}{booking.vehicle_model ? ` ${booking.vehicle_model}` : ''}</p>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-anchor-sage text-sm">Amount paid</span>
              <span className="text-green-400 text-lg font-bold">£{amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Getting here */}
        <div className="bg-anchor-bg-card rounded-xl overflow-hidden">
          <div className="bg-anchor-bg-raised px-4 py-2.5">
            <h2 className="text-green-400 text-xs font-bold uppercase tracking-wider">Getting here</h2>
          </div>
          <div className="divide-y divide-anchor-bg-raised px-4">
            {[
              { icon: '📍', text: 'Horton Road, Stanwell Moor, TW19 6AQ' },
              { icon: '🚕', text: '7 minutes to Terminal 5 by taxi or rideshare' },
              { icon: '🚌', text: 'Bus 442 from outside — direct to T2, T3, T4 & T5' },
              { icon: '🔑', text: 'Keep your keys with you at all times' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-3 py-3">
                <span className="text-base mt-0.5">{icon}</span>
                <p className="text-anchor-sage text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/"
          className="block w-full text-center bg-anchor-green text-white font-semibold py-3.5 rounded-xl hover:bg-green-800 transition-colors"
        >
          While you&apos;re here — visit the pub
        </Link>
        <p className="text-anchor-sage text-xs text-center">Full menu · Real ales · Family friendly</p>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Typecheck + lint**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub
npx tsc --noEmit && npm run lint
```

Expected: no errors.

- [ ] **Step 3: Check the page renders in dev**

```bash
npm run dev
```

Navigate to `/heathrow-parking/confirmation/test-id` — should show the fallback "Thank you for booking" message (since `test-id` won't be a real booking). No 500 error.

- [ ] **Step 4: Full build**

```bash
npm run build
```

Expected: builds successfully, confirmation page is statically generated (or ISR).

- [ ] **Step 5: Commit**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub
git add app/heathrow-parking/confirmation/
git commit -m "feat: add branded parking confirmation page"
```

---

## Chunk 5: End-to-end verification

### Task 8: Full integration smoke test

This task verifies the complete flow works end-to-end with real (sandbox) PayPal credentials before merging.

- [ ] **Step 1: Add `NEXT_PUBLIC_PAYPAL_CLIENT_ID` to `.env.example` on the website**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub
```

Open `.env.example` and add under the parking/API section:

```
# PayPal — client ID for inline parking checkout (same value as management tools PAYPAL_CLIENT_ID)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
```

Commit this before setting the real value in `.env.local`.

```bash
git add .env.example
git commit -m "chore: document NEXT_PUBLIC_PAYPAL_CLIENT_ID env var"
```

- [ ] **Step 3: Confirm environment variables are set on both apps**

Management tools (`.env.local`):
- `PAYPAL_CLIENT_ID` ✓ (already set)
- `PAYPAL_CLIENT_SECRET` ✓ (already set)

Website (`.env.local`):
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` — add this, same value as management tools `PAYPAL_CLIENT_ID`
- `ANCHOR_API_BASE_URL` ✓ (already set)
- `ANCHOR_API_KEY` ✓ (already set)

- [ ] **Step 2: Run both dev servers**

```bash
# Terminal 1 — management tools
cd /Users/peterpitcher/Cursor/OJ-AnchorManagementTools && npm run dev

# Terminal 2 — website (ensure ANCHOR_API_BASE_URL points to localhost:3001 or correct port)
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub && npm run dev
```

- [ ] **Step 3: Complete a test booking end-to-end**

1. Go to `http://localhost:3000/heathrow-parking`
2. Complete all 4 wizard steps
3. On step 4, verify PayPal buttons render
4. Use a PayPal sandbox account or the "Pay by Debit or Credit Card" option with test card `4032033771694604`, expiry any future date, CVV `123`
5. Verify redirect to `/heathrow-parking/confirmation/[bookingId]`
6. Verify the confirmation page shows correct booking details
7. Check management tools — booking should be status `confirmed`, payment_status `paid`
8. Verify confirmation SMS was sent (check Twilio logs or Twilio test number)

- [ ] **Step 4: Verify no payment-request SMS was sent**

In management tools Supabase, query:
```sql
SELECT event_type, status FROM parking_booking_notifications
WHERE booking_id = '<your-test-booking-id>'
ORDER BY created_at;
```

Expected: only `payment_confirmation` event, no `payment_request` event.

- [ ] **Step 5: Test the cancel flow**

Start a new booking, reach step 4, click PayPal, then close the overlay without paying.
- Verify "Payment cancelled — you can try again below" message appears
- Verify the PayPal buttons re-render and a second attempt works

- [ ] **Step 6: Run full test suites**

```bash
# Management tools
cd /Users/peterpitcher/Cursor/OJ-AnchorManagementTools
npm test

# Website
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub
npm test
```

Expected: all existing tests pass.

- [ ] **Step 7: Final commit on both repos**

```bash
# If any cleanup needed from smoke test
cd /Users/peterpitcher/Cursor/OJ-AnchorManagementTools
git add -p && git commit -m "chore: post-integration cleanup"

cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub
git add -p && git commit -m "chore: post-integration cleanup"
```

---

## Environment variables summary

| Variable | Codebase | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | OJ-The-Anchor.pub | **New** — same value as management tools `PAYPAL_CLIENT_ID`. Add to `.env.example` and `.env.local`. |
| `ANCHOR_API_KEY` | OJ-The-Anchor.pub | Already exists — used by proxy routes |
| `ANCHOR_API_BASE_URL` | OJ-The-Anchor.pub | Already exists |
| `PAYPAL_CLIENT_ID` | OJ-AnchorManagementTools | Already exists |
| `PAYPAL_CLIENT_SECRET` | OJ-AnchorManagementTools | Already exists |

---

## Rollback plan

If the inline checkout causes issues in production:

1. In `components/features/ParkingBookingWizard/index.tsx`, revert step 4 to the previous `handleSubmit` + redirect approach (the old code is preserved in git)
2. The management tools changes (`source` flag, capture endpoint) are additive and non-breaking — they do not need to be reverted
3. No database migrations — no rollback needed on schema
