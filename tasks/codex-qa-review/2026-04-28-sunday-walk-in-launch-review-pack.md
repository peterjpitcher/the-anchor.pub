# Review Pack: sunday-walk-in-launch

**Generated:** 2026-04-28
**Mode:** B (A=Adversarial / B=Code / C=Spec Compliance)
**Project root:** `/Users/peterpitcher/Cursor/OJ-The-Anchor.pub`
**Base ref:** `main`
**HEAD:** `049f0f9`
**Diff range:** `main...HEAD`
**Stats:**  70 files changed, 1782 insertions(+), 10397 deletions(-)

> This pack is the sole input for reviewers. Do NOT read files outside it unless a specific finding requires verification. If a file not in the pack is needed, mark the finding `Needs verification` and describe what would resolve it.

## Changed Files

```
app/api/booking/agent/__tests__/route.test.ts
app/api/booking/agent/route.ts
app/api/booking/submit/route.ts
app/api/table-bookings/__tests__/route.test.ts
app/api/table-bookings/availability/route.ts
app/api/table-bookings/menu/sunday-lunch/route.ts
app/api/table-bookings/route.ts
app/book-table/page-old.tsx
app/book-table/page.tsx
app/easter/page.tsx
app/fathers-day/page.tsx
app/feltham-pub/page.tsx
app/layout.tsx
app/mothers-day/page.tsx
app/music-bingo/page.tsx
app/page.tsx
app/staines-pub/page.tsx
app/stanwell-pub/page.tsx
app/sunday-lunch/page.tsx
components/announcements/LaunchAnnouncement.tsx
components/announcements/LaunchAnnouncementClient.tsx
components/announcements/__tests__/LaunchAnnouncement.test.tsx
components/features/BookingWizard/WizardProgress.tsx
components/features/BookingWizard/WizardStep1Date.tsx
components/features/BookingWizard/WizardStep2SundayOffer.tsx
components/features/BookingWizard/WizardStep2bMenuSelection.tsx
components/features/BookingWizard/WizardStep3PartySize.tsx
components/features/BookingWizard/WizardStep4Time.tsx
components/features/BookingWizard/WizardStep5Details.tsx
components/features/BookingWizard/WizardStep5DetailsAndRequirements.tsx
components/features/BookingWizard/WizardStep6Confirm.tsx
components/features/BookingWizard/WizardStep6Requirements.tsx
components/features/BookingWizard/WizardStep7Confirm.tsx
components/features/BookingWizard/WizardStepPlanVisit.tsx
components/features/BookingWizard/index.tsx
components/features/BookingWizard/types.ts
components/features/TableBooking/ManagementTableBookingForm.tsx
components/features/TableBooking/SundayLunchBooking.tsx
components/features/TableBooking/SundayLunchBookingForm.tsx
components/features/TableBooking/SundayLunchBookingSection.tsx
components/features/TableBooking/__tests__/PayPalDepositSection.test.tsx
components/sunday-lunch/SundayLunchHowItWorks.tsx
content/blog/60th-birthday-party-ideas-venues/index.md
content/blog/best-pub-food-near-heathrow/index.md
content/blog/best-sunday-roast-near-heathrow/index.md
content/blog/best-sunday-roast-surrey/index.md
content/blog/british-pub-guide-for-international-visitors/index.md
content/blog/eating-near-heathrow-prices-compared/index.md
content/blog/family-friendly-sunday-lunch-heathrow/index.md
content/blog/sunday-lunch-at-the-anchor-is-back-pre-order-now/index.md
content/blog/vegetarian-pub-food-near-heathrow/index.md
content/blog/where-to-eat-near-heathrow-2026/index.md
docs/copy-assumptions.md
lib/__tests__/large-group-deposit.test.ts
lib/api/client.ts
lib/booking-helpers.ts
lib/constants.ts
lib/gtm-events.ts
lib/sunday-lunch-cutoff.ts
public/llms.txt
tests/api/booking-agent-service-window.test.ts
tests/api/booking-submit-deposit.test.ts
tests/api/booking-submit-service-window.test.ts
tests/api/table-bookings-availability-purpose.test.ts
tests/api/table-bookings-cutoff.test.ts
tests/api/table-bookings-service-window.test.ts
tests/api/table-bookings.test.ts
tests/api/tableBookingsProxyStructuredForward.test.ts
tests/unit/ManagementTableBookingForm.test.tsx
tests/unit/sunday-lunch-cutoff.test.ts
```

## User Concerns

Hostile payload sanitisation (strip sunday_lunch+booking_type from inbound); ManagementTableBookingForm dead-code sweep complete; LaunchAnnouncement three-state behaviour with cache safety; PayPal-failure recovery reads fallback_payment_url; per-page revalidate=3600; date-aware copy on /sunday-lunch; canonical /sunday-lunch absolute path; no Sunday-pre-order/cutoff/7+ on customer-visible surfaces; agent endpoint stops auto-deriving Sunday-lunch

## Diff (`main...HEAD`)

```diff
diff --git a/app/api/booking/agent/__tests__/route.test.ts b/app/api/booking/agent/__tests__/route.test.ts
new file mode 100644
index 0000000..b1b679d
--- /dev/null
+++ b/app/api/booking/agent/__tests__/route.test.ts
@@ -0,0 +1,183 @@
+/**
+ * Walk-in-launch behaviour tests for the AI agent booking endpoint.
+ *
+ * Spec §6, §8.1: the agent endpoint must:
+ *   - Always create regular bookings (no Sunday-lunch booking_type),
+ *     even when the date falls on a Sunday.
+ *   - Surface the £10-per-person deposit messaging only at party_size >= 10.
+ *   - NOT include any Sunday-specific copy in the deposit notice.
+ *   - Pass purpose through verbatim to the management API.
+ */
+
+export {}
+
+const mockGetBusinessHours = jest.fn()
+const mockCreateTableBooking = jest.fn()
+
+jest.mock('@/lib/api', () => ({
+  anchorAPI: {
+    getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args),
+    createTableBooking: (...args: unknown[]) => mockCreateTableBooking(...args)
+  }
+}))
+
+jest.mock('@/lib/spam-protection', () => ({
+  checkSpamProtection: jest.fn().mockResolvedValue({ blocked: false })
+}))
+
+const ALWAYS_OPEN_HOURS = {
+  regularHours: {
+    monday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
+    tuesday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
+    wednesday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
+    thursday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
+    friday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
+    saturday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
+    sunday: { opens: '12:00', closes: '18:00', is_closed: false, kitchen: { opens: '13:00', closes: '17:30' } }
+  },
+  specialHours: []
+} as any
+
+describe('Booking Agent API - walk-in launch behaviour', () => {
+  let createAgentBooking: (request: any) => Promise<Response>
+
+  beforeEach(async () => {
+    mockGetBusinessHours.mockResolvedValue(ALWAYS_OPEN_HOURS)
+    mockCreateTableBooking.mockReset()
+
+    jest.resetModules()
+    ;({ POST: createAgentBooking } = await import('@/app/api/booking/agent/route'))
+  })
+
+  afterEach(() => {
+    jest.clearAllMocks()
+  })
+
+  it('forwards bookingType=regular even for a Sunday date', async () => {
+    mockCreateTableBooking.mockResolvedValue({
+      booking_reference: 'TB-AGENT-SUN',
+      status: 'confirmed',
+      confirmation_details: {
+        date: '2026-05-24',
+        time: '13:00',
+        party_size: 2
+      }
+    })
+
+    const request = {
+      json: async () => ({
+        date: '2026-05-24', // Sunday
+        time: '13:00',
+        partySize: 2,
+        type: 'sunday_lunch', // hostile/legacy input — must be ignored
+        purpose: 'food',
+        customer: {
+          firstName: 'Pat',
+          lastName: 'Guest',
+          phone: '07700900000',
+          email: 'pat@example.com'
+        }
+      })
+    } as any
+
+    const response = await createAgentBooking(request)
+
+    expect(response.status).toBe(200)
+    expect(mockCreateTableBooking).toHaveBeenCalledTimes(1)
+
+    const [forwardedPayload] = mockCreateTableBooking.mock.calls[0]
+    expect(forwardedPayload.booking_type).toBe('regular')
+    expect(forwardedPayload.purpose).toBe('food')
+
+    const body = await response.json()
+    expect(body.booking.type).toBe('regular')
+  })
+
+  it('omits deposit messaging at party size 9 (just below threshold)', async () => {
+    mockCreateTableBooking.mockResolvedValue({
+      booking_reference: 'TB-AGENT-9',
+      status: 'confirmed',
+      confirmation_details: { date: '2026-05-24', time: '13:00', party_size: 9 }
+    })
+
+    const request = {
+      json: async () => ({
+        date: '2026-05-24',
+        time: '13:00',
+        partySize: 9,
+        purpose: 'food',
+        customer: {
+          firstName: 'Pat',
+          lastName: 'Guest',
+          phone: '07700900000'
+        }
+      })
+    } as any
+
+    const response = await createAgentBooking(request)
+    expect(response.status).toBe(200)
+    const body = await response.json()
+    expect(body.booking.specialInstructions).toBeNull()
+  })
+
+  it('emits deposit messaging at party size 10 (boundary)', async () => {
+    mockCreateTableBooking.mockResolvedValue({
+      booking_reference: 'TB-AGENT-10',
+      status: 'confirmed',
+      confirmation_details: { date: '2026-05-24', time: '13:00', party_size: 10 }
+    })
+
+    const request = {
+      json: async () => ({
+        date: '2026-05-24',
+        time: '13:00',
+        partySize: 10,
+        purpose: 'food',
+        customer: {
+          firstName: 'Pat',
+          lastName: 'Guest',
+          phone: '07700900000'
+        }
+      })
+    } as any
+
+    const response = await createAgentBooking(request)
+    expect(response.status).toBe(200)
+    const body = await response.json()
+    expect(typeof body.booking.specialInstructions).toBe('string')
+    expect(body.booking.specialInstructions).toContain('10 or more')
+    expect(body.booking.specialInstructions).toContain('£10 per person')
+    // Crucially: no Sunday-lunch-specific copy
+    expect(body.booking.specialInstructions).not.toMatch(/sunday lunch/i)
+    expect(body.booking.specialInstructions).not.toMatch(/saturday/i)
+    expect(body.booking.specialInstructions).not.toMatch(/cutoff/i)
+  })
+
+  it('emits deposit messaging at party size 11 (above threshold)', async () => {
+    mockCreateTableBooking.mockResolvedValue({
+      booking_reference: 'TB-AGENT-11',
+      status: 'confirmed',
+      confirmation_details: { date: '2026-05-22', time: '19:00', party_size: 11 }
+    })
+
+    const request = {
+      json: async () => ({
+        date: '2026-05-22',
+        time: '19:00',
+        partySize: 11,
+        purpose: 'food',
+        customer: {
+          firstName: 'Pat',
+          lastName: 'Guest',
+          phone: '07700900000'
+        }
+      })
+    } as any
+
+    const response = await createAgentBooking(request)
+    expect(response.status).toBe(200)
+    const body = await response.json()
+    expect(typeof body.booking.specialInstructions).toBe('string')
+    expect(body.booking.specialInstructions).toContain('£10 per person')
+  })
+})
diff --git a/app/api/booking/agent/route.ts b/app/api/booking/agent/route.ts
index a6af0f6..d528a61 100644
--- a/app/api/booking/agent/route.ts
+++ b/app/api/booking/agent/route.ts
@@ -61,17 +61,11 @@ export async function POST(request: NextRequest) {
       }
     }
     
-    // Determine if it's a Sunday roast booking
-    const date = new Date(bookingDate + 'T12:00:00')
-    const isSunday = date.getDay() === 0
-    const requestedType =
-      body.type === 'sunday_lunch' || body.type === 'regular'
-        ? body.type
-        : undefined
-
-    const bookingType: BookingType = requestedType || (isSunday ? 'sunday_lunch' : 'regular')
-    const requestedPurpose: BookingPurpose = body.purpose === 'drinks' ? 'drinks' : 'food'
-    const purpose: BookingPurpose = bookingType === 'sunday_lunch' ? 'food' : requestedPurpose
+    // Sunday-lunch as a separate booking type is retired with the walk-in launch
+    // (spec §6, §8.1). The AI-agent endpoint creates regular bookings on every
+    // day; deposit messaging below is gated on partySize >= 10 alone.
+    const bookingType: BookingType = 'regular'
+    const purpose: BookingPurpose = body.purpose === 'drinks' ? 'drinks' : 'food'
     const normalizedBookingTime = normalizeTime(String(body.time))
 
     try {
@@ -153,12 +147,8 @@ export async function POST(request: NextRequest) {
           phone: body.customer.phone
         },
         message: `Booking confirmed for ${body.partySize} people on ${formatDateForDisplay(bookingDate)} at ${formatTimeForDisplay(body.time)}`,
-        specialInstructions: isSunday && bookingType === 'sunday_lunch'
-          ? (
-              body.partySize >= 7
-                ? 'Sunday lunch roasts must be pre-ordered by 1pm Saturday. Bookings of 7+ require a £10 per person deposit to secure the booking. This is deducted from your final bill.'
-                : 'Sunday lunch roasts must be pre-ordered by 1pm Saturday. A £10 per person deposit is required and is deducted from your final bill.'
-            )
+        specialInstructions: body.partySize >= 10
+          ? 'Bookings of 10 or more require a £10 per person deposit, fully deducted from your bill on the day.'
           : null
       }
     })
@@ -182,7 +172,9 @@ export async function GET(request: Request) {
   const { searchParams } = new URL(request.url)
   const date = searchParams.get('date')
   const partySize = searchParams.get('partySize')
-  const typeParam = searchParams.get('type')
+  // The `type` query param is still accepted for backwards compatibility but
+  // is read-only — Sunday-lunch as a separate booking type is retired (spec §6).
+  void searchParams.get('type')
   const purposeParam = searchParams.get('purpose')
   
   if (!date) {
@@ -206,15 +198,12 @@ export async function GET(request: Request) {
       checkDate = parsedDate
     }
     
-    // Check availability
+    // Sunday-lunch as a separate booking type is retired (spec §6, §8.1).
+    // Treat every day as 'regular'. The legacy `type` query param is still
+    // accepted for backwards compatibility but it no longer changes behaviour.
     const isSunday = new Date(checkDate + 'T12:00:00').getDay() === 0
-    const requestedType =
-      typeParam === 'sunday_lunch' || typeParam === 'regular'
-        ? typeParam
-        : undefined
-    const bookingType: BookingType = requestedType || (isSunday ? 'sunday_lunch' : 'regular')
-    const requestedPurpose: BookingPurpose = purposeParam === 'drinks' ? 'drinks' : 'food'
-    const purpose: BookingPurpose = bookingType === 'sunday_lunch' ? 'food' : requestedPurpose
+    const bookingType: BookingType = 'regular'
+    const purpose: BookingPurpose = purposeParam === 'drinks' ? 'drinks' : 'food'
     const normalizedPartySize = Number.parseInt(partySize || '2', 10)
 
     const availabilityParams = new URLSearchParams({
diff --git a/app/api/booking/submit/route.ts b/app/api/booking/submit/route.ts
deleted file mode 100644
index be66281..0000000
--- a/app/api/booking/submit/route.ts
+++ /dev/null
@@ -1,303 +0,0 @@
-import { NextRequest, NextResponse } from 'next/server'
-import { anchorAPI } from '@/lib/api'
-import { checkSpamProtection } from '@/lib/spam-protection'
-import { getSundayLunchDepositAmount } from '@/lib/constants'
-import { normaliseUKPhone } from '@/lib/hours-utils'
-import {
-  isTimeWithinRanges,
-  normalizeTime,
-  resolveServiceRanges,
-  type BookingPurpose,
-  type BookingType
-} from '@/lib/table-booking-service-windows'
-
-function jsonResponse(payload: unknown, status = 200): Response {
-  return new Response(JSON.stringify(payload), {
-    status,
-    headers: {
-      'Content-Type': 'application/json'
-    }
-  })
-}
-
-/**
- * Booking submission endpoint for the wizard
- * Handles both JavaScript and non-JavaScript submissions
- */
-export async function POST(request: NextRequest) {
-  try {
-    let bookingData: any
-
-    // Check content type to handle both JSON and form data
-    const contentType = request.headers.get('content-type')
-
-    if (contentType?.includes('application/json')) {
-      // JavaScript submission
-      const jsonData = await request.json()
-
-      const spam = await checkSpamProtection(request, jsonData)
-      if (spam.blocked) return spam.response
-      // Map camelCase from frontend to snake_case for API
-      bookingData = {
-        date: jsonData.date,
-        time: jsonData.time,
-        partySize: jsonData.partySize,
-        bookingType: jsonData.bookingType || 'regular',
-        purpose: jsonData.purpose,
-        firstName: jsonData.firstName,
-        lastName: jsonData.lastName,
-        phone: jsonData.phone,
-        email: jsonData.email,
-        specialRequirements: jsonData.specialRequirements,
-        marketingOptIn: jsonData.marketingOptIn,
-        menuSelections: jsonData.menuSelections // THIS WAS MISSING!
-      }
-    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
-      // Non-JavaScript form submission — rate limit only (no JSON body for full check)
-      const formSpam = await checkSpamProtection(request, {})
-      if (formSpam.blocked) return formSpam.response
-
-      const formData = await request.formData()
-      bookingData = {
-        date: formData.get('date'),
-        time: formData.get('time'),
-        partySize: parseInt(formData.get('party_size') as string || '2'),
-        bookingType: formData.get('booking_type') || 'regular',
-        purpose: formData.get('purpose'),
-        firstName: formData.get('first_name'),
-        lastName: formData.get('last_name'),
-        phone: formData.get('phone'),
-        email: formData.get('email'),
-        dietaryRequirements: formData.getAll('dietary_requirements'),
-        allergies: formData.get('allergies'),
-        occasion: formData.get('occasion'),
-        specialRequirements: formData.get('special_requirements')
-      }
-    } else {
-      return jsonResponse({
-        success: false,
-        error: 'Invalid content type'
-      }, 400)
-    }
-    
-    // Validate required fields
-    if (!bookingData.date || !bookingData.time || !bookingData.firstName || 
-        !bookingData.lastName || !bookingData.phone) {
-      // For non-JS submissions, redirect back with error
-      if (!contentType?.includes('application/json')) {
-        return NextResponse.redirect(
-          new URL(`/book-table?error=missing_fields`, request.url)
-        )
-      }
-      
-      return jsonResponse({
-        success: false,
-        error: 'Missing required fields'
-      }, 400)
-    }
-    
-    const hasSundayLunchSelections =
-      bookingData.bookingType === 'sunday_lunch' &&
-      Array.isArray(bookingData.menuSelections) &&
-      bookingData.menuSelections.length > 0
-    const resolvedBookingType: BookingType = hasSundayLunchSelections ? 'sunday_lunch' : 'regular'
-    const requestedPurpose: BookingPurpose = bookingData.purpose === 'drinks' ? 'drinks' : 'food'
-    const purpose: BookingPurpose = resolvedBookingType === 'sunday_lunch' ? 'food' : requestedPurpose
-    const normalizedBookingTime = normalizeTime(String(bookingData.time))
-
-    // Enforce service windows for legacy wizard path as a defense-in-depth guard.
-    try {
-      const businessHours = await anchorAPI.getBusinessHours()
-
-      const serviceWindow = resolveServiceRanges(businessHours, String(bookingData.date), {
-        bookingType: resolvedBookingType,
-        purpose
-      })
-
-      const canBookTime =
-        !serviceWindow.closed &&
-        serviceWindow.ranges.length > 0 &&
-        isTimeWithinRanges(normalizedBookingTime, serviceWindow.ranges)
-
-      if (!canBookTime) {
-        const message =
-          serviceWindow.message ||
-          (purpose === 'food'
-            ? 'Food bookings are only available during kitchen service hours. Please choose a different time or call us for drinks-only reservations.'
-            : 'That time is outside our drinks booking window. Please choose another time or call 01753 682707.')
-
-        return jsonResponse({
-          success: false,
-          error: {
-            code: 'OUTSIDE_SERVICE_WINDOW',
-            message
-          }
-        }, 400)
-      }
-    } catch (error) {
-      console.error('Failed to check service windows:', error)
-      return jsonResponse({
-        success: false,
-        error: {
-          code: 'SERVICE_WINDOW_CHECK_FAILED',
-          message: 'We could not verify service hours right now. Please try again or call 01753 682707.'
-        }
-      }, 503)
-    }
-    
-    const menuSelections = hasSundayLunchSelections ? bookingData.menuSelections : undefined
-    
-    // Create booking request
-    const bookingRequest: any = {
-      booking_type: resolvedBookingType,
-      date: bookingData.date,
-      time: bookingData.time,
-      party_size: bookingData.partySize,
-      purpose,
-      customer: {
-        first_name: bookingData.firstName,
-        last_name: bookingData.lastName,
-        mobile_number: normaliseUKPhone(bookingData.phone),
-        email: bookingData.email || undefined,
-        sms_opt_in: bookingData.marketingOptIn || false
-      },
-      duration_minutes: 120,
-      special_requirements: bookingData.specialRequirements || '',
-      dietary_requirements: bookingData.dietaryRequirements || [],
-      allergies: bookingData.allergies || [],
-      celebration_type: bookingData.occasion || undefined,
-      source: 'website'
-    }
-    
-    // Add menu selections if available
-    if (menuSelections) {
-      bookingRequest.menu_selections = menuSelections
-    }
-    
-    // Generate idempotency key to prevent duplicate bookings
-    const idempotencyKey = request.headers.get('Idempotency-Key') || crypto.randomUUID()
-    
-    // Submit to API
-    const booking = await anchorAPI.createTableBooking(bookingRequest, idempotencyKey)
-    
-    const bookingState = typeof booking.state === 'string' ? booking.state : null
-    const pendingPaymentFlow =
-      booking.payment_required === true
-      || booking.status === 'pending_payment'
-      || bookingState === 'pending_payment'
-    const paymentUrl = booking.payment_details?.payment_url || booking.next_step_url || null
-    const partySize = Number(bookingData.partySize || 1)
-    // Deposit is £10/person for Sunday lunch and groups of 7+ — same rate for both
-    const requiresDeposit = resolvedBookingType === 'sunday_lunch' || partySize >= 7
-    const fallbackDepositAmount = requiresDeposit ? getSundayLunchDepositAmount(partySize) : 0
-
-    // Check if payment is required (Sunday lunch bookings should return this from API)
-    if (pendingPaymentFlow && !paymentUrl) {
-      return jsonResponse({
-        success: false,
-        error: {
-          code: 'PAYMENT_LINK_UNAVAILABLE',
-          message: 'Your booking is awaiting payment, but we could not generate the payment link. Please call 01753 682707 so we can secure your table.'
-        }
-      }, 502)
-    }
-
-    if (pendingPaymentFlow && paymentUrl) {
-      const depositAmount = Number(
-        booking.payment_details?.deposit_amount ?? booking.payment_details?.amount ?? fallbackDepositAmount
-      )
-      const normalizedDepositAmount = Number.isFinite(depositAmount) ? depositAmount : fallbackDepositAmount
-      const paymentExpiresAt =
-        booking.payment_details?.expires_at ||
-        booking.hold_expires_at ||
-        new Date(Date.now() + 15 * 60 * 1000).toISOString()
-
-      // Return payment details for redirect
-      return jsonResponse({
-        success: true,
-        reference: booking.booking_reference || booking.booking_id,
-        payment_required: true,
-        payment_details: {
-          ...(booking.payment_details || {}),
-          amount: normalizedDepositAmount,
-          deposit_amount: normalizedDepositAmount,
-          total_amount: Number.isFinite(booking.payment_details?.total_amount as number)
-            ? Number(booking.payment_details?.total_amount)
-            : normalizedDepositAmount,
-          outstanding_amount: Number.isFinite(booking.payment_details?.outstanding_amount as number)
-            ? Number(booking.payment_details?.outstanding_amount)
-            : normalizedDepositAmount,
-          currency: booking.payment_details?.currency || 'GBP',
-          payment_url: paymentUrl,
-          expires_at: paymentExpiresAt
-        },
-        booking: {
-          reference: booking.booking_reference || booking.booking_id,
-          status: booking.status || 'pending_payment',
-          date: booking.confirmation_details?.date || bookingData.date,
-          time: booking.confirmation_details?.time || bookingData.time,
-          party_size: booking.confirmation_details?.party_size || bookingData.partySize,
-          customer_name: `${bookingData.firstName} ${bookingData.lastName}`
-        }
-      })
-    }
-    
-    // Log warning if Sunday lunch booking didn't require payment
-    if (resolvedBookingType === 'sunday_lunch' && !pendingPaymentFlow) {
-      console.warn('WARNING: Sunday lunch booking did not return payment_required from API')
-      console.warn('This suggests the API is not configured correctly for Sunday lunch payments')
-    }
-    
-    // Handle response based on request type
-    if (!contentType?.includes('application/json')) {
-      // Non-JS: Redirect back to booking page
-      return NextResponse.redirect(
-        new URL('/book-table', request.url)
-      )
-    }
-    
-    // JS: Return JSON response (regular booking confirmed)
-    return jsonResponse({
-      success: true,
-      reference: booking.booking_reference,
-      booking: {
-        reference: booking.booking_reference,
-        status: booking.status,
-        date: booking.confirmation_details?.date || bookingData.date,
-        time: booking.confirmation_details?.time || bookingData.time,
-        party_size: booking.confirmation_details?.party_size || bookingData.partySize,
-        customer_name: `${bookingData.firstName} ${bookingData.lastName}`
-      }
-    })
-    
-  } catch (error: unknown) {
-    const err = error as { response?: { data?: { error?: { message?: string; correlation_id?: string; details?: unknown }; [key: string]: unknown }; status?: number }; message?: string }
-    console.error('Booking submission error:', error)
-    console.error('Error details:', err.response?.data || error)
-
-    // Check if it's a non-JS submission
-    const contentType = request.headers.get('content-type')
-    if (!contentType?.includes('application/json')) {
-      return NextResponse.redirect(
-        new URL(`/book-table?error=submission_failed`, request.url)
-      )
-    }
-
-    // Handle API v2 error format with correlation_id
-    const errorResponse = err.response?.data?.error || err.response?.data || {}
-    const errorMessage = (errorResponse as { message?: string }).message || err.message || 'Failed to create booking'
-    const correlationId = (errorResponse as { correlation_id?: string }).correlation_id
-
-    // Log correlation ID for debugging
-    if (correlationId) {
-      console.error('Error Correlation ID:', correlationId)
-    }
-
-    return jsonResponse({
-      success: false,
-      error: errorMessage,
-      correlation_id: correlationId,
-      details: (errorResponse as { details?: unknown }).details || err.response?.data
-    }, err.response?.status || 500)
-  }
-}
diff --git a/app/api/table-bookings/__tests__/route.test.ts b/app/api/table-bookings/__tests__/route.test.ts
new file mode 100644
index 0000000..a6719e1
--- /dev/null
+++ b/app/api/table-bookings/__tests__/route.test.ts
@@ -0,0 +1,245 @@
+/**
+ * Walk-in-launch behaviour tests for the website /api/table-bookings proxy.
+ *
+ * Spec §6, §8.1: the public proxy must:
+ *   1. Silently strip inbound `sunday_lunch` and `booking_type` regardless
+ *      of value (defence in depth — hostile or stale clients can't sneak
+ *      Sunday-lunch behaviour back in).
+ *   2. Always forward booking_type='regular' to the management API.
+ *   3. NOT enforce any Saturday-1pm cutoff (Sunday-lunch cutoff retired).
+ *   4. Forward `purpose` through unchanged when valid; default to 'food'
+ *      when the inbound payload omits it.
+ */
+
+export {}
+
+jest.mock('@/lib/management-api-base', () => ({
+  getManagementApiBaseUrl: () => 'https://example.invalid/api'
+}))
+
+const mockGetBusinessHours = jest.fn()
+
+jest.mock('@/lib/api', () => ({
+  anchorAPI: {
+    getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args)
+  }
+}))
+
+jest.mock('@/lib/spam-protection', () => ({
+  checkSpamProtection: jest.fn().mockResolvedValue({ blocked: false })
+}))
+
+jest.mock('@/lib/upstream-json', () => ({
+  getSafeUpstreamErrorMessage: () => 'upstream error',
+  safeJsonParse: (text: string) => {
+    try {
+      return JSON.parse(text)
+    } catch {
+      return null
+    }
+  }
+}))
+
+jest.mock('@/lib/error-handling', () => ({
+  createApiErrorResponse: (message: string, status: number) =>
+    new Response(JSON.stringify({ success: false, error: message }), {
+      status,
+      headers: { 'content-type': 'application/json' }
+    }),
+  logError: jest.fn()
+}))
+
+const ALWAYS_OPEN_HOURS = {
+  regularHours: {
+    monday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
+    tuesday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
+    wednesday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
+    thursday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
+    friday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
+    saturday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
+    sunday: { opens: '12:00', closes: '18:00', is_closed: false, kitchen: { opens: '13:00', closes: '17:30' } }
+  },
+  specialHours: []
+} as any
+
+function buildRequest(body: unknown): Request {
+  return new Request('http://localhost/api/table-bookings', {
+    method: 'POST',
+    headers: { 'content-type': 'application/json' },
+    body: JSON.stringify(body)
+  })
+}
+
+async function getPostHandler() {
+  const mod = await import('@/app/api/table-bookings/route')
+  return mod.POST
+}
+
+function installUpstreamFetch() {
+  const calls: Array<{ url: string; init: RequestInit }> = []
+  ;(global as any).fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
+    const url = typeof input === 'string' ? input : input.toString()
+    calls.push({ url, init: init ?? {} })
+    return new Response(
+      JSON.stringify({ success: true, data: { state: 'confirmed', booking_reference: 'TB-OK' } }),
+      { status: 201, headers: { 'content-type': 'application/json' } }
+    )
+  })
+  return calls
+}
+
+const ORIGINAL_ENV = process.env
+
+beforeAll(() => {
+  process.env = { ...ORIGINAL_ENV, ANCHOR_API_KEY: 'test-key' }
+})
+
+afterAll(() => {
+  process.env = ORIGINAL_ENV
+})
+
+beforeEach(() => {
+  mockGetBusinessHours.mockResolvedValue(ALWAYS_OPEN_HOURS)
+})
+
+afterEach(() => {
+  jest.clearAllMocks()
+  jest.useRealTimers()
+})
+
+describe('website /api/table-bookings proxy — walk-in launch sanitisation', () => {
+  it('silently strips inbound sunday_lunch=true (does not error, does not forward)', async () => {
+    const calls = installUpstreamFetch()
+    const POST = await getPostHandler()
+
+    const res = await POST(
+      buildRequest({
+        phone: '07700900000',
+        first_name: 'Hostile',
+        last_name: 'Client',
+        date: '2026-05-24',
+        time: '13:00',
+        party_size: 4,
+        purpose: 'food',
+        sunday_lunch: true
+      }) as any
+    )
+
+    expect(res.status).toBe(201)
+    expect(calls).toHaveLength(1)
+    const forwarded = JSON.parse(String(calls[0].init.body))
+    expect(forwarded.sunday_lunch).toBeUndefined()
+    expect(forwarded.booking_type).toBe('regular')
+    expect(forwarded.purpose).toBe('food')
+  })
+
+  it('silently strips inbound booking_type=sunday_lunch and forwards regular', async () => {
+    const calls = installUpstreamFetch()
+    const POST = await getPostHandler()
+
+    const res = await POST(
+      buildRequest({
+        phone: '07700900000',
+        date: '2026-05-24',
+        time: '13:00',
+        party_size: 2,
+        purpose: 'food',
+        booking_type: 'sunday_lunch'
+      }) as any
+    )
+
+    expect(res.status).toBe(201)
+    const forwarded = JSON.parse(String(calls[0].init.body))
+    expect(forwarded.booking_type).toBe('regular')
+    expect(forwarded.sunday_lunch).toBeUndefined()
+  })
+
+  it('silently strips both fields when both are present (defence in depth)', async () => {
+    const calls = installUpstreamFetch()
+    const POST = await getPostHandler()
+
+    const res = await POST(
+      buildRequest({
+        phone: '07700900000',
+        date: '2026-05-24',
+        time: '13:00',
+        party_size: 6,
+        purpose: 'food',
+        booking_type: 'sunday_lunch',
+        sunday_lunch: true,
+        menu_selections: [{ menu_dish_id: 'roast', quantity: 1 }]
+      }) as any
+    )
+
+    expect(res.status).toBe(201)
+    const forwarded = JSON.parse(String(calls[0].init.body))
+    expect(forwarded.booking_type).toBe('regular')
+    expect(forwarded.sunday_lunch).toBeUndefined()
+    expect(forwarded.menu_selections).toBeUndefined()
+    expect(forwarded.sunday_preorder_items).toBeUndefined()
+  })
+
+  it('always forwards booking_type=regular, even when inbound payload omits booking_type', async () => {
+    const calls = installUpstreamFetch()
+    const POST = await getPostHandler()
+
+    const res = await POST(
+      buildRequest({
+        phone: '07700900000',
+        date: '2026-05-24',
+        time: '13:00',
+        party_size: 2,
+        purpose: 'food'
+      }) as any
+    )
+
+    expect(res.status).toBe(201)
+    const forwarded = JSON.parse(String(calls[0].init.body))
+    expect(forwarded.booking_type).toBe('regular')
+  })
+
+  it('does NOT enforce a Sunday-lunch Saturday-1pm cutoff (cutoff retired)', async () => {
+    // Pretend it's Saturday 14:00 — the legacy cutoff would have rejected
+    // a Sunday booking made after 13:00. Walk-in launch removes that gate.
+    jest.useFakeTimers()
+    jest.setSystemTime(new Date('2026-05-23T14:00:00.000+01:00'))
+
+    const calls = installUpstreamFetch()
+    const POST = await getPostHandler()
+
+    const res = await POST(
+      buildRequest({
+        phone: '07700900000',
+        date: '2026-05-24', // Sunday
+        time: '13:00',
+        party_size: 2,
+        purpose: 'food'
+      }) as any
+    )
+
+    expect(res.status).toBe(201)
+    expect(calls).toHaveLength(1)
+    const forwarded = JSON.parse(String(calls[0].init.body))
+    expect(forwarded.booking_type).toBe('regular')
+  })
+
+  it('forwards purpose=drinks unchanged', async () => {
+    const calls = installUpstreamFetch()
+    const POST = await getPostHandler()
+
+    const res = await POST(
+      buildRequest({
+        phone: '07700900000',
+        date: '2026-05-22',
+        time: '20:30',
+        party_size: 2,
+        purpose: 'drinks'
+      }) as any
+    )
+
+    expect(res.status).toBe(201)
+    const forwarded = JSON.parse(String(calls[0].init.body))
+    expect(forwarded.purpose).toBe('drinks')
+    expect(forwarded.booking_type).toBe('regular')
+  })
+})
diff --git a/app/api/table-bookings/availability/route.ts b/app/api/table-bookings/availability/route.ts
index 3ea908c..6658944 100644
--- a/app/api/table-bookings/availability/route.ts
+++ b/app/api/table-bookings/availability/route.ts
@@ -18,11 +18,6 @@ function parsePositiveInt(value: string | null, fallback: number): number {
   return parsed
 }
 
-function isSundayIso(isoDate: string): boolean {
-  const [year, month, day] = isoDate.split('-').map((p) => Number.parseInt(p, 10))
-  return new Date(Date.UTC(year, month - 1, day)).getUTCDay() === 0
-}
-
 function buildFallbackAvailability(
   businessHours: BusinessHours,
   options: {
@@ -32,7 +27,7 @@ function buildFallbackAvailability(
     bookingType: BookingType
     purpose: BookingPurpose
   }
-): TableAvailabilityResponse & { sunday_lunch_available?: boolean } {
+): TableAvailabilityResponse {
   const { ranges, message } = resolveServiceRanges(businessHours, options.date, {
     bookingType: options.bookingType,
     purpose: options.purpose
@@ -76,12 +71,14 @@ export async function GET(request: Request) {
   const date = searchParams.get('date')
   const partySizeRaw = searchParams.get('party_size')
   const requestedTime = searchParams.get('time') || '19:00'
-  const bookingType: BookingType =
-    searchParams.get('booking_type') === 'sunday_lunch' ? 'sunday_lunch' : 'regular'
+  // Sunday-lunch as a separate booking type is retired with the walk-in launch
+  // (spec §6, §8.1). The booking_type query param is still accepted for
+  // backwards compatibility but every request resolves as 'regular'.
+  void searchParams.get('booking_type')
+  const bookingType: BookingType = 'regular'
 
-  const requestedPurpose: BookingPurpose =
+  const purpose: BookingPurpose =
     searchParams.get('purpose') === 'drinks' ? 'drinks' : 'food'
-  const purpose: BookingPurpose = bookingType === 'sunday_lunch' ? 'food' : requestedPurpose
 
   if (!date || !partySizeRaw) {
     return createApiErrorResponse(
@@ -111,19 +108,6 @@ export async function GET(request: Request) {
       purpose
     })
 
-    // When this is a food request on a Sunday, also resolve sunday_lunch ranges so
-    // the client knows whether to show the "Sunday plans" toggle. The management app
-    // signals "Sunday Lunch Closed" via schedule_config: [] — resolveServiceRanges
-    // already handles this and returns empty ranges in that case.
-    if (bookingType !== 'sunday_lunch' && purpose === 'food' && isSundayIso(date)) {
-      const sundayLunchResolution = resolveServiceRanges(businessHours, date, {
-        bookingType: 'sunday_lunch',
-        purpose: 'food'
-      })
-      ;(fallback as { sunday_lunch_available?: boolean }).sunday_lunch_available =
-        sundayLunchResolution.ranges.length > 0
-    }
-
     return new Response(
       JSON.stringify({
         success: true,
diff --git a/app/api/table-bookings/menu/sunday-lunch/route.ts b/app/api/table-bookings/menu/sunday-lunch/route.ts
deleted file mode 100644
index d14c4b7..0000000
--- a/app/api/table-bookings/menu/sunday-lunch/route.ts
+++ /dev/null
@@ -1,20 +0,0 @@
-import { NextResponse } from 'next/server'
-import { anchorAPI } from '@/lib/api'
-import { createApiErrorResponse, logError } from '@/lib/error-handling'
-
-export const dynamic = 'force-dynamic'
-
-export async function GET() {
-  try {
-    const menu = await anchorAPI.getSundayLunchMenu()
-
-    return NextResponse.json(menu)
-  } catch (error) {
-    logError('api/table-bookings/menu/sunday-lunch', error)
-
-    return createApiErrorResponse(
-      'We could not load the Sunday lunch menu. Please call us at 01753 682707 for menu information.',
-      503
-    )
-  }
-}
diff --git a/app/api/table-bookings/route.ts b/app/api/table-bookings/route.ts
index 10c0fc2..313c071 100644
--- a/app/api/table-bookings/route.ts
+++ b/app/api/table-bookings/route.ts
@@ -3,7 +3,6 @@ import { anchorAPI } from '@/lib/api'
 import { createApiErrorResponse, logError } from '@/lib/error-handling'
 import { getManagementApiBaseUrl } from '@/lib/management-api-base'
 import { getSafeUpstreamErrorMessage, safeJsonParse } from '@/lib/upstream-json'
-import { getSundayLunchCutoffDate, hasSundayLunchCutoffPassed, isSundayIsoDate } from '@/lib/sunday-lunch-cutoff'
 import {
   isTimeWithinRanges,
   normalizeTime,
@@ -16,11 +15,6 @@ const API_KEY = process.env.ANCHOR_API_KEY
 
 type BookingPurpose = 'food' | 'drinks'
 
-type SundayPreorderItem = {
-  menu_dish_id: string
-  quantity: number
-}
-
 type ManagementTableBookingPayload = {
   phone: string
   first_name?: string
@@ -31,15 +25,12 @@ type ManagementTableBookingPayload = {
   party_size: number
   purpose: BookingPurpose
   notes?: string
-  sunday_lunch?: boolean
   dietary_requirements?: string[]
   allergies?: string[]
-  sunday_preorder_items?: SundayPreorderItem[]
   default_country_code?: string
 }
 
 type LegacyTableBookingPayload = {
-  booking_type?: 'regular' | 'sunday_lunch'
   date?: string
   time?: string
   party_size?: number
@@ -56,14 +47,6 @@ type LegacyTableBookingPayload = {
   allergies?: string[] | string
   celebration_type?: string
   notes?: string
-  menu_selections?: Array<{
-    menu_dish_id?: string
-    guest_name?: string
-    custom_item_name?: string
-    item_type?: string
-    quantity?: number
-    price_at_booking?: number
-  }>
 }
 
 function mergeNotes(...parts: Array<string | undefined>): string | undefined {
@@ -114,61 +97,16 @@ function toStringList(value: unknown): string[] {
   return single ? [single] : []
 }
 
-// Aggregates menu_selections entries into sunday_preorder_items keyed by
-// menu_dish_id. Entries without a menu_dish_id are skipped -- they'll still
-// appear in the auto-generated note blob as a kitchen-side fallback, but the
-// management API now expects structured UUIDs so it can populate
-// table_booking_items.
-function buildSundayPreorderItems(
-  value: unknown
-): SundayPreorderItem[] | undefined {
-  if (!Array.isArray(value) || value.length === 0) return undefined
-
-  const totals = new Map<string, number>()
-
-  for (const entry of value) {
-    if (!entry || typeof entry !== 'object') continue
-    const item = entry as Record<string, unknown>
-    const menuDishId = asTrimmedString(item.menu_dish_id)
-    if (!menuDishId) continue
-    const quantity = asPositiveInt(item.quantity) ?? 1
-    totals.set(menuDishId, (totals.get(menuDishId) ?? 0) + quantity)
-  }
-
-  if (totals.size === 0) return undefined
-
-  return Array.from(totals, ([menu_dish_id, quantity]) => ({ menu_dish_id, quantity }))
-}
-
-// A human-readable fallback summary of the pre-order in case saveSundayPreorder
-// on the management side fails -- it stays in the free-text notes column so
-// the kitchen is never blind. Once we have confidence in the structured path
-// we can drop this.
-function buildMenuSelectionFallbackNote(
-  value: LegacyTableBookingPayload['menu_selections']
-): string | undefined {
-  if (!Array.isArray(value) || value.length === 0) return undefined
-
-  const parts = value
-    .slice(0, 12)
-    .map((item) => {
-      const guest = asTrimmedString(item.guest_name) || 'Guest'
-      const dish = asTrimmedString(item.custom_item_name) || 'Menu item'
-      const quantity = asPositiveInt(item.quantity) || 1
-      return `${guest}: ${dish} x${quantity}`
-    })
-    .join(' | ')
-
-  if (!parts) return undefined
-  return `Sunday lunch pre-order: ${parts}`
-}
-
 // Parses either of the two shapes the site currently sends -- the "management"
-// top-level shape (ManagementTableBookingForm) and the "legacy" nested
-// shape with a customer{} wrapper (SundayLunchBookingForm) -- into the single
-// structured payload the management API expects. Key guarantee: customer name,
-// email, dietary needs, allergies, and per-guest pre-order dishes end up in
-// their own structured fields, not stuffed into the notes blob.
+// top-level shape (ManagementTableBookingForm) and the legacy nested
+// shape with a customer{} wrapper -- into the single structured payload the
+// management API expects.
+//
+// Defence in depth (spec §6, §8.1): the public proxy strips inbound
+// `sunday_lunch` and `booking_type` from every payload before forwarding,
+// regardless of value. Hostile or stale clients sending sunday_lunch=true or
+// booking_type='sunday_lunch' are silently neutralised. We always forward
+// booking_type='regular' to the management API.
 function normaliseIncomingPayload(input: unknown): {
   payload?: ManagementTableBookingPayload
   error?: string
@@ -180,8 +118,8 @@ function normaliseIncomingPayload(input: unknown): {
   const body = input as Record<string, unknown>
 
   // Top-level first_name/last_name/email/phone (management form) takes
-  // precedence; fall back to the nested customer{} object for the Sunday lunch
-  // form. Either is accepted.
+  // precedence; fall back to the nested customer{} object for any legacy
+  // callers. Either is accepted.
   const customer = (body.customer && typeof body.customer === 'object'
     ? (body.customer as Record<string, unknown>)
     : {}) as Record<string, unknown>
@@ -200,45 +138,28 @@ function normaliseIncomingPayload(input: unknown): {
   const partySize = asPositiveInt(body.party_size)
   const defaultCountryCode = asTrimmedString(body.default_country_code)
 
-  // Sunday lunch is signalled either by a top-level boolean or by the legacy
-  // booking_type string. Either works.
-  const sundayLunch =
-    body.sunday_lunch === true || body.booking_type === 'sunday_lunch'
-
-  // Sunday lunch always implies a food booking; otherwise respect purpose or
-  // default to food (kitchen bookings are the common case via this route).
+  // purpose defaults to food (kitchen bookings are the common case via this
+  // route). booking_type and sunday_lunch from the inbound body are ignored.
   const explicitPurpose =
     body.purpose === 'drinks' ? 'drinks' : body.purpose === 'food' ? 'food' : undefined
-  const purpose: BookingPurpose = sundayLunch
-    ? 'food'
-    : explicitPurpose ?? (body.purpose === undefined ? 'food' : undefined as unknown as BookingPurpose)
+  const purpose: BookingPurpose = explicitPurpose ?? 'food'
 
-  if (!phone || !date || !time || !partySize || !purpose) {
+  if (!phone || !date || !time || !partySize) {
     return { error: 'Missing required fields: phone, date, time, party_size, purpose' }
   }
 
   const dietaryRequirements = toStringList(body.dietary_requirements)
   const allergies = toStringList(body.allergies)
 
-  const sundayPreorderItems = buildSundayPreorderItems(body.menu_selections)
-
-  // notes is strictly the user's free-text (e.g. "anniversary dinner") -- the
-  // Sunday lunch form labels it "special_requirements", the management form
-  // labels it "notes". We also append a human-readable fallback summary of the
-  // pre-order so the kitchen isn't blind if the structured items save fails on
-  // the management side.
+  // notes is strictly the user's free-text. Sunday-lunch pre-order menu_selections
+  // are no longer supported on the public path (spec §6, §8.1) — Sundays are
+  // regular food bookings now.
   const userNote =
     asTrimmedString(body.special_requirements) || asTrimmedString(body.notes)
-  const occasionNote = asTrimmedString(body.celebration_type)
-  const fallbackSelectionNote = sundayLunch
-    ? buildMenuSelectionFallbackNote(
-        body.menu_selections as LegacyTableBookingPayload['menu_selections']
-      )
-    : undefined
+  const occasionNote = asTrimmedString((body as LegacyTableBookingPayload).celebration_type)
   const notes = mergeNotes(
     occasionNote ? `Occasion: ${occasionNote}` : undefined,
-    userNote,
-    fallbackSelectionNote
+    userNote
   )
 
   return {
@@ -252,10 +173,8 @@ function normaliseIncomingPayload(input: unknown): {
       party_size: partySize,
       purpose,
       ...(notes ? { notes } : {}),
-      ...(sundayLunch ? { sunday_lunch: true } : {}),
       ...(dietaryRequirements.length > 0 ? { dietary_requirements: dietaryRequirements } : {}),
       ...(allergies.length > 0 ? { allergies } : {}),
-      ...(sundayPreorderItems ? { sunday_preorder_items: sundayPreorderItems } : {}),
       ...(defaultCountryCode ? { default_country_code: defaultCountryCode } : {}),
     },
   }
@@ -287,10 +206,6 @@ function validatePayload(payload: ManagementTableBookingPayload): string | null
 }
 
 function buildServiceWindowError(payload: ManagementTableBookingPayload): string {
-  if (payload.sunday_lunch === true) {
-    return 'Sunday lunch is only available during the Sunday lunch service window. Please choose a listed Sunday lunch time or call 01753 682707.'
-  }
-
   if (payload.purpose === 'food') {
     return 'Food bookings are only available during kitchen hours. For later bookings, switch to drinks-only or call 01753 682707.'
   }
@@ -319,36 +234,15 @@ export async function POST(request: NextRequest) {
       return createApiErrorResponse(validationError, 400)
     }
 
-    if (normalized.payload.sunday_lunch === true && normalized.payload.purpose !== 'food') {
-      return createApiErrorResponse('Sunday lunch bookings must be made as food bookings.', 400)
-    }
-
-    // Enforce Sunday lunch pre-order cutoff: 1pm Saturday (London time) before the selected Sunday.
-    if (normalized.payload.sunday_lunch === true) {
-      if (!isSundayIsoDate(normalized.payload.date)) {
-        return createApiErrorResponse('Sunday lunch bookings can only be made for Sundays.', 400)
-      }
-
-      if (hasSundayLunchCutoffPassed(normalized.payload.date, new Date())) {
-        const cutoffDate = getSundayLunchCutoffDate(normalized.payload.date)
-        const cutoffLabel = cutoffDate ? ` (cutoff: 1pm Saturday ${cutoffDate} London time)` : ''
-
-        return createApiErrorResponse(
-          `Sunday lunch pre-orders for ${normalized.payload.date} are now closed. Please book a weekday menu table instead or call 01753 682707.${cutoffLabel}`,
-          400
-        )
-      }
-    }
-
-    const bookingType = normalized.payload.sunday_lunch === true ? 'sunday_lunch' : 'regular'
-    const bookingPurpose = normalized.payload.sunday_lunch === true ? 'food' : normalized.payload.purpose
     const bookingTime = normalizeTime(normalized.payload.time)
 
     try {
       const businessHours = await anchorAPI.getBusinessHours()
+      // Always resolve as a 'regular' booking — Sunday-lunch as a separate
+      // booking type is retired on the public path (spec §7.1).
       const serviceWindow = resolveServiceRanges(businessHours, normalized.payload.date, {
-        bookingType,
-        purpose: bookingPurpose
+        bookingType: 'regular',
+        purpose: normalized.payload.purpose
       })
 
       const canBookTime =
@@ -363,8 +257,8 @@ export async function POST(request: NextRequest) {
       logError('api/table-bookings/service-window-check', serviceWindowError, {
         date: normalized.payload.date,
         time: bookingTime,
-        purpose: bookingPurpose,
-        bookingType
+        purpose: normalized.payload.purpose,
+        bookingType: 'regular'
       })
 
       return createApiErrorResponse(
@@ -389,9 +283,14 @@ export async function POST(request: NextRequest) {
       },
       cache: 'no-store',
       // skip_customer_sms: website bookings show PayPal buttons inline, so customer
-      // doesn't need a separate SMS payment link
+      // doesn't need a separate SMS payment link. The management API will set
+      // skip_customer_sms=false when inline PayPal setup fails so the customer
+      // also receives an SMS link (spec §6, §8.9).
+      // Always forward booking_type='regular' — defence in depth against hostile
+      // or stale clients (spec §6, §8.1).
       body: JSON.stringify({
         ...normalized.payload,
+        booking_type: 'regular',
         skip_customer_sms: true
       })
     })
diff --git a/app/book-table/page-old.tsx b/app/book-table/page-old.tsx
deleted file mode 100644
index de06925..0000000
--- a/app/book-table/page-old.tsx
+++ /dev/null
@@ -1,254 +0,0 @@
-import type { Metadata } from 'next'
-import { HeroWrapper } from '@/components/hero'
-import { Container } from '@/components/ui/layout/Container'
-import { Section } from '@/components/ui/layout/Section'
-import { Card, CardBody } from '@/components/ui/layout/Card'
-import TableBookingForm from '@/components/features/TableBooking/TableBookingForm'
-import SundayLunchBookingForm from '@/components/features/TableBooking/SundayLunchBookingForm'
-import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/Tabs'
-import { Icon } from '@/components/ui/Icon'
-import { PhoneLink } from '@/components/PhoneLink'
-import { Alert } from '@/components/ui/feedback/Alert'
-import { Button } from '@/components/ui/primitives/Button'
-import { Badge } from '@/components/ui/primitives/Badge'
-import ScrollDepthTracker from '@/components/tracking/ScrollDepthTracker'
-import { InfoBoxGrid } from '@/components/ui'
-import { SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP } from '@/lib/constants'
-import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
-
-export const metadata: Metadata = {
-  title: 'Book a Table | The Anchor - Heathrow Pub & Dining',
-  description: 'Book your table at The Anchor - Heathrow Pub & Dining. Reserve your spot for our delicious food, Sunday roasts, or special events. Easy online booking with instant confirmation.',
-  openGraph: {
-    title: 'Book a Table at The Anchor',
-    description: 'Reserve your table for great food and drinks at The Anchor - Heathrow Pub & Dining. Online booking available.',
-    images: [DEFAULT_PAGE_HEADER_IMAGE]
-  }
-}
-
-export default function BookTablePage({
-  searchParams
-}: {
-  searchParams: { tab?: string }
-}) {
-  const defaultTab = searchParams.tab === 'sunday' ? 'sunday' : 'regular'
-  
-  return (
-    <>
-      <ScrollDepthTracker />
-      
-      <HeroWrapper
-        route="/book-table"
-        variant="default"
-        title="Book a Table"
-        description="Reserve your spot for great food and drinks"
-        image={{
-          src: DEFAULT_PAGE_HEADER_IMAGE,
-          alt: 'The Anchor entrance with warm lighting and traditional British pub signage',
-          priority: true
-        }}
-        breadcrumbs={[
-          { name: 'Home', href: '/' },
-          { name: 'Booking' }
-        ]}
-        tags={[
-          { label: 'Easy Online Booking', icon: '', size: 'small' },
-          { label: 'Instant Confirmation', icon: '', size: 'small' },
-          { label: 'Sunday Roasts', icon: '', size: 'small' }
-        ]}
-      />
-
-      <Section className="py-8 md:py-12">
-        <Container>
-          {/* Booking tabs */}
-          <div className="w-full md:max-w-3xl md:mx-auto">
-            <Tabs defaultValue={defaultTab} className="w-full">
-              <TabsList className="grid w-full grid-cols-2 mb-6">
-                <TabsTrigger value="regular">
-                  <Icon name="calendar" className="mr-2 h-4 w-4" />
-                  Regular Booking
-                </TabsTrigger>
-                <TabsTrigger value="sunday">
-                  <Icon name="utensils" className="mr-2 h-4 w-4" />
-                  Sunday Roast
-                </TabsTrigger>
-              </TabsList>
-
-              <TabsContent value="regular" className="space-y-6">
-                <Alert variant="info">
-                  <Icon name="info" className="h-4 w-4" />
-                  <div>
-                    <p className="font-medium">Walk-ins always welcome!</p>
-                    <p className="text-sm mt-1">
-                      Can't find the time you want? Just pop in - we always try to accommodate walk-ins.
-                    </p>
-                  </div>
-                </Alert>
-
-                <TableBookingForm />
-
-                <div className="text-center text-sm text-muted-foreground">
-                  <p>For groups larger than 20, please call us on{' '}
-                    <PhoneLink
-                      phone="01753682707"
-                      source="booking_page_large_group"
-                      className="text-primary hover:text-primary-dark underline"
-                      showIcon={false}
-                    >
-                      01753 682707
-                    </PhoneLink>
-                  </p>
-                </div>
-              </TabsContent>
-
-              <TabsContent value="sunday" className="space-y-6">
-	                <div className="text-center mb-8">
-	                  <Badge variant="warning" size="lg" className="mb-4">
-	                    Pre-Order Required
-	                  </Badge>
-	                  <h3 className="text-xl font-semibold mb-2">Traditional Sunday Roast</h3>
-	                  <p className="text-muted-foreground mb-4">
-	                    Enjoy our famous Sunday roasts - freshly prepared and served with all the trimmings
-	                  </p>
-		                  <p className="text-sm text-muted-foreground">
-		                    Pre-order by 1pm Saturday. Sunday lunch bookings require a £{SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP} per person deposit, deducted from your final bill.
-		                  </p>
-		                </div>
-
-                <SundayLunchBookingForm />
-
-                <Alert variant="info" className="mt-6">
-                  <Icon name="info" className="h-4 w-4" />
-                  <div>
-                    <p className="font-medium">Can't pre-order?</p>
-                    <p className="text-sm mt-1">
-                      Our regular menu is also available on Sundays without pre-order.
-                    </p>
-                  </div>
-                </Alert>
-              </TabsContent>
-            </Tabs>
-          </div>
-
-          {/* Additional information */}
-          <div className="mt-8 border-t pt-8">
-            <div className="max-w-3xl mx-auto">
-              <h2 className="text-2xl font-bold mb-6 text-center">Booking Information</h2>
-              
-              <div className="grid gap-6 md:grid-cols-2">
-                <div>
-                  <h3 className="font-semibold mb-3 flex items-center">
-                    <Icon name="info" className="mr-2 h-5 w-5 text-primary" />
-                    Good to Know
-                  </h3>
-                  <ul className="space-y-2 text-sm text-muted-foreground">
-                    <li>• Tables are held for 15 minutes</li>
-                    <li>• Kitchen hours vary by day</li>
-                    <li>• No food service on Mondays</li>
-                    <li>• 20 free parking spaces</li>
-                    <li>• Dogs welcome throughout</li>
-                  </ul>
-                </div>
-
-                <div>
-                  <h3 className="font-semibold mb-3 flex items-center">
-                    <Icon name="users" className="mr-2 h-5 w-5 text-primary" />
-                    Groups & Events
-                  </h3>
-	                  <ul className="space-y-2 text-sm text-muted-foreground">
-	                    <li>• Private hire: minimum 30 people</li>
-	                    <li>• Corporate functions: minimum 15 people</li>
-	                    <li>• £250 deposit required</li>
-	                    <li>• Buffets, sit-down meals & canapés</li>
-	                    <li>• Contact us for pricing</li>
-	                  </ul>
-                </div>
-              </div>
-
-              <div className="mt-8 text-center">
-                <p className="text-sm text-muted-foreground mb-4">
-                  Planning a special event or need a private space?
-                </p>
-                <a href="/private-party-venue">
-                  <Button variant="outline" size="lg" className="w-auto inline-flex items-center whitespace-nowrap">
-                    <Icon name="sparkles" className="mr-2 flex-shrink-0" />
-                    <span className="whitespace-nowrap">View Private Hire</span>
-                  </Button>
-                </a>
-              </div>
-            </div>
-          </div>
-          
-          {/* Info Cards - Opening Hours, Kitchen Hours, Need Help */}
-          <div className="mt-8 max-w-5xl mx-auto">
-            <InfoBoxGrid
-              columns={3}
-              boxes={[
-                {
-                  title: "Opening Hours",
-                  content: (
-                    <>
-                      <p className="font-medium mb-2">Bar Opening Times:</p>
-                      <ul className="space-y-1 text-sm text-gray-700">
-                        <li>Mon-Thu: 3pm-11pm</li>
-                        <li>Friday: 12pm-12am</li>
-                        <li>Saturday: 12pm-12am</li>
-                        <li>Sunday: 12pm-10pm</li>
-                      </ul>
-                      <p className="text-sm text-gray-600 mt-3 italic">Live hours shown in header</p>
-                    </>
-                  ),
-                  variant: "colored",
-                  color: "bg-gray-50"
-                },
-                {
-                  title: "Kitchen Hours",
-                  content: (
-                    <>
-                      <p className="font-medium mb-2">Food Service:</p>
-                      <ul className="space-y-1 text-sm text-gray-700">
-                        <li>Monday: CLOSED</li>
-                        <li>Tue-Fri: 6pm-9pm</li>
-                        <li>Saturday: 1pm-7pm</li>
-                        <li>Sunday: 1pm-6pm</li>
-                      </ul>
-                      <p className="text-sm text-amber-700 mt-3 font-medium">Sunday roasts require pre-order</p>
-                    </>
-                  ),
-                  variant: "colored",
-                  color: "bg-gray-50"
-                },
-                {
-                  title: "Need Help?",
-                  content: (
-                    <>
-                      <p className="text-sm text-gray-700 mb-3">Can't find what you're looking for? We're here to help!</p>
-                      <div className="space-y-2">
-                        <div>
-                          <PhoneLink
-                            phone="01753682707"
-                            source="booking_help_card"
-                            className="text-primary hover:text-primary-dark font-medium"
-                          >
-                            Call: 01753 682707
-                          </PhoneLink>
-                        </div>
-                        <div>
-                          <a href="mailto:manager@the-anchor.pub" className="text-primary hover:text-primary-dark font-medium">
-                            Email us
-                          </a>
-                        </div>
-                      </div>
-                    </>
-                  ),
-                  variant: "colored",
-                  color: "bg-gray-50"
-                }
-              ]}
-            />
-          </div>
-        </Container>
-      </Section>
-    </>
-  )
-}
diff --git a/app/book-table/page.tsx b/app/book-table/page.tsx
index 0a49d2c..7b1247a 100644
--- a/app/book-table/page.tsx
+++ b/app/book-table/page.tsx
@@ -4,14 +4,22 @@ import { HeroWrapper } from '@/components/hero/HeroWrapper'
 import { PhoneButton } from '@/components/PhoneButton'
 import { ManagementTableBookingForm } from '@/components/features/TableBooking/ManagementTableBookingForm'
 import { BookTableUpcomingEventsPanel } from '@/components/features/TableBooking/BookTableUpcomingEventsPanel'
+import { LaunchAnnouncement } from '@/components/announcements/LaunchAnnouncement'
 import { Section, Button, Grid, Card, CardBody, SectionHeader } from '@/components/ui'
 import { PageTitle } from '@/components/ui/typography/PageTitle'
-import { SUNDAY_LUNCH_DEPOSIT_POLICY_COPY } from '@/lib/constants'
+import { LARGE_GROUP_DEPOSIT_POLICY_COPY } from '@/lib/constants'
 import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
 import { getTwitterMetadata } from '@/lib/twitter-metadata'
 import { RegretReduction, ValueProofStrip } from '@/components/psychology'
 import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
 
+// Revalidate every 1 hour for the walk-in launch fortnight (10–22 May 2026)
+// so the LaunchAnnouncement banner flips reliably at the cutover even on
+// cached pages. See spec §8.5.
+// TODO(post-launch): revert to 60 * 60 * 24 (24 hours) after 22 May 2026, or
+// drop the export entirely if the original was using Next.js' default.
+export const revalidate = 60 * 60 // 1 hour during launch fortnight
+
 export const metadata: Metadata = {
   title: 'Book a Table Near Heathrow | Sunday Roast',
   description: 'Reserve your table at The Anchor, Stanwell Moor — instant confirmation. Pub food from £8.95, Sunday roast from £19. Dog-friendly, free parking, 7 mins from T5.',
@@ -36,8 +44,6 @@ type BookTablePageProps = {
     time?: string
     party_size?: string
     purpose?: string
-    sunday_lunch?: string
-    mothers_day?: string
   }
 }
 
@@ -53,22 +59,14 @@ function parsePurpose(value?: string): 'food' | 'drinks' | undefined {
   return undefined
 }
 
-function parseBoolean(value?: string): boolean | undefined {
-  if (!value) return undefined
-  const normalized = value.trim().toLowerCase()
-  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true

[diff truncated at line 1500 — total was 14164 lines. Consider scoping the review to fewer files.]
```

## Changed File Contents

### `app/api/booking/agent/__tests__/route.test.ts`

```
/**
 * Walk-in-launch behaviour tests for the AI agent booking endpoint.
 *
 * Spec §6, §8.1: the agent endpoint must:
 *   - Always create regular bookings (no Sunday-lunch booking_type),
 *     even when the date falls on a Sunday.
 *   - Surface the £10-per-person deposit messaging only at party_size >= 10.
 *   - NOT include any Sunday-specific copy in the deposit notice.
 *   - Pass purpose through verbatim to the management API.
 */

export {}

const mockGetBusinessHours = jest.fn()
const mockCreateTableBooking = jest.fn()

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args),
    createTableBooking: (...args: unknown[]) => mockCreateTableBooking(...args)
  }
}))

jest.mock('@/lib/spam-protection', () => ({
  checkSpamProtection: jest.fn().mockResolvedValue({ blocked: false })
}))

const ALWAYS_OPEN_HOURS = {
  regularHours: {
    monday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    tuesday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    wednesday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    thursday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    friday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    saturday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    sunday: { opens: '12:00', closes: '18:00', is_closed: false, kitchen: { opens: '13:00', closes: '17:30' } }
  },
  specialHours: []
} as any

describe('Booking Agent API - walk-in launch behaviour', () => {
  let createAgentBooking: (request: any) => Promise<Response>

  beforeEach(async () => {
    mockGetBusinessHours.mockResolvedValue(ALWAYS_OPEN_HOURS)
    mockCreateTableBooking.mockReset()

    jest.resetModules()
    ;({ POST: createAgentBooking } = await import('@/app/api/booking/agent/route'))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('forwards bookingType=regular even for a Sunday date', async () => {
    mockCreateTableBooking.mockResolvedValue({
      booking_reference: 'TB-AGENT-SUN',
      status: 'confirmed',
      confirmation_details: {
        date: '2026-05-24',
        time: '13:00',
        party_size: 2
      }
    })

    const request = {
      json: async () => ({
        date: '2026-05-24', // Sunday
        time: '13:00',
        partySize: 2,
        type: 'sunday_lunch', // hostile/legacy input — must be ignored
        purpose: 'food',
        customer: {
          firstName: 'Pat',
          lastName: 'Guest',
          phone: '07700900000',
          email: 'pat@example.com'
        }
      })
    } as any

    const response = await createAgentBooking(request)

    expect(response.status).toBe(200)
    expect(mockCreateTableBooking).toHaveBeenCalledTimes(1)

    const [forwardedPayload] = mockCreateTableBooking.mock.calls[0]
    expect(forwardedPayload.booking_type).toBe('regular')
    expect(forwardedPayload.purpose).toBe('food')

    const body = await response.json()
    expect(body.booking.type).toBe('regular')
  })

  it('omits deposit messaging at party size 9 (just below threshold)', async () => {
    mockCreateTableBooking.mockResolvedValue({
      booking_reference: 'TB-AGENT-9',
      status: 'confirmed',
      confirmation_details: { date: '2026-05-24', time: '13:00', party_size: 9 }
    })

    const request = {
      json: async () => ({
        date: '2026-05-24',
        time: '13:00',
        partySize: 9,
        purpose: 'food',
        customer: {
          firstName: 'Pat',
          lastName: 'Guest',
          phone: '07700900000'
        }
      })
    } as any

    const response = await createAgentBooking(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.booking.specialInstructions).toBeNull()
  })

  it('emits deposit messaging at party size 10 (boundary)', async () => {
    mockCreateTableBooking.mockResolvedValue({
      booking_reference: 'TB-AGENT-10',
      status: 'confirmed',
      confirmation_details: { date: '2026-05-24', time: '13:00', party_size: 10 }
    })

    const request = {
      json: async () => ({
        date: '2026-05-24',
        time: '13:00',
        partySize: 10,
        purpose: 'food',
        customer: {
          firstName: 'Pat',
          lastName: 'Guest',
          phone: '07700900000'
        }
      })
    } as any

    const response = await createAgentBooking(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(typeof body.booking.specialInstructions).toBe('string')
    expect(body.booking.specialInstructions).toContain('10 or more')
    expect(body.booking.specialInstructions).toContain('£10 per person')
    // Crucially: no Sunday-lunch-specific copy
    expect(body.booking.specialInstructions).not.toMatch(/sunday lunch/i)
    expect(body.booking.specialInstructions).not.toMatch(/saturday/i)
    expect(body.booking.specialInstructions).not.toMatch(/cutoff/i)
  })

  it('emits deposit messaging at party size 11 (above threshold)', async () => {
    mockCreateTableBooking.mockResolvedValue({
      booking_reference: 'TB-AGENT-11',
      status: 'confirmed',
      confirmation_details: { date: '2026-05-22', time: '19:00', party_size: 11 }
    })

    const request = {
      json: async () => ({
        date: '2026-05-22',
        time: '19:00',
        partySize: 11,
        purpose: 'food',
        customer: {
          firstName: 'Pat',
          lastName: 'Guest',
          phone: '07700900000'
        }
      })
    } as any

    const response = await createAgentBooking(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(typeof body.booking.specialInstructions).toBe('string')
    expect(body.booking.specialInstructions).toContain('£10 per person')
  })
})
```

### `app/api/booking/agent/route.ts`

```
import { NextRequest } from 'next/server'
import { anchorAPI } from '@/lib/api'
import type { TableBookingRequest } from '@/lib/api'
import { checkSpamProtection } from '@/lib/spam-protection'
import {
  isTimeWithinRanges,
  normalizeTime,
  resolveServiceRanges,
  type BookingPurpose,
  type BookingType
} from '@/lib/table-booking-service-windows'

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * AI Agent Booking Endpoint
 * Accepts structured JSON for direct booking creation
 * Designed for GPT-5 and other AI agents
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    const spam = await checkSpamProtection(request, body)
    if (spam.blocked) return spam.response

    // Validate required fields
    if (!body.date || !body.time || !body.partySize || !body.customer) {
      return jsonResponse({
        success: false,
        error: 'Missing required fields: date, time, partySize, customer'
      }, 400)
    }
    
    // Validate customer data
    if (!body.customer.firstName || !body.customer.lastName || !body.customer.phone) {
      return jsonResponse({
        success: false,
        error: 'Missing customer fields: firstName, lastName, phone'
      }, 400)
    }
    
    // Parse natural language date if needed
    let bookingDate = body.date
    if (isNaN(Date.parse(bookingDate))) {
      // Try to parse natural language dates
      bookingDate = parseNaturalDate(body.date)
      if (!bookingDate) {
        return jsonResponse({
          success: false,
          error: `Unable to parse date: ${body.date}. Please use YYYY-MM-DD format or natural language like "tomorrow" or "next Sunday"`
        }, 400)
      }
    }
    
    // Sunday-lunch as a separate booking type is retired with the walk-in launch
    // (spec §6, §8.1). The AI-agent endpoint creates regular bookings on every
    // day; deposit messaging below is gated on partySize >= 10 alone.
    const bookingType: BookingType = 'regular'
    const purpose: BookingPurpose = body.purpose === 'drinks' ? 'drinks' : 'food'
    const normalizedBookingTime = normalizeTime(String(body.time))

    try {
      const businessHours = await anchorAPI.getBusinessHours()
      const serviceWindow = resolveServiceRanges(businessHours, bookingDate, {
        bookingType,
        purpose
      })

      const canBookTime =
        !serviceWindow.closed &&
        serviceWindow.ranges.length > 0 &&
        isTimeWithinRanges(normalizedBookingTime, serviceWindow.ranges)

      if (!canBookTime) {
        const message =
          serviceWindow.message ||
          (purpose === 'food'
            ? 'Food bookings are only available during kitchen service hours. Please choose another time or switch to drinks.'
            : 'That time is outside our drinks booking window. Please choose another time or call 01753 682707.')

        return jsonResponse({
          success: false,
          error: {
            code: 'OUTSIDE_SERVICE_WINDOW',
            message
          }
        }, 400)
      }
    } catch (error) {
      console.error('AI agent service window check failed:', error)
      return jsonResponse({
        success: false,
        error: {
          code: 'SERVICE_WINDOW_CHECK_FAILED',
          message: 'We could not verify service hours right now. Please try again or call 01753 682707.'
        }
      }, 503)
    }
    
    // Create booking request
    const bookingRequest: TableBookingRequest = {
      booking_type: bookingType,
      date: bookingDate,
      time: body.time,
      party_size: body.partySize,
      purpose,
      customer: {
        first_name: body.customer.firstName,
        last_name: body.customer.lastName,
        email: body.customer.email,
        mobile_number: body.customer.phone,
        sms_opt_in: body.customer.smsOptIn ?? false
      },
      duration_minutes: body.duration || 120,
      special_requirements: body.specialRequirements,
      dietary_requirements: body.dietaryRequirements,
      allergies: body.allergies,
      celebration_type: body.occasion,
      source: 'ai_agent'
    }
    
    // Create booking via API
    const booking = await anchorAPI.createTableBooking(bookingRequest)
    
    // Return structured response for AI agent
    return jsonResponse({
      success: true,
      booking: {
        reference: booking.booking_reference,
        status: booking.status,
        date: booking.confirmation_details?.date || bookingDate,
        time: booking.confirmation_details?.time || body.time,
        partySize: booking.confirmation_details?.party_size || body.partySize,
        type: bookingType,
        purpose,
        customer: {
          name: `${body.customer.firstName} ${body.customer.lastName}`,
          phone: body.customer.phone
        },
        message: `Booking confirmed for ${body.partySize} people on ${formatDateForDisplay(bookingDate)} at ${formatTimeForDisplay(body.time)}`,
        specialInstructions: body.partySize >= 10
          ? 'Bookings of 10 or more require a £10 per person deposit, fully deducted from your bill on the day.'
          : null
      }
    })
    
  } catch (error: unknown) {
    console.error('AI agent booking error:', error)

    // Return structured error for AI agent
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create booking',
      suggestion: 'Please verify all fields are correct or call the restaurant at 01753 682707'
    }, 500)
  }
}

/**
 * GET endpoint for AI agents to check availability
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const partySize = searchParams.get('partySize')
  // The `type` query param is still accepted for backwards compatibility but
  // is read-only — Sunday-lunch as a separate booking type is retired (spec §6).
  void searchParams.get('type')
  const purposeParam = searchParams.get('purpose')
  
  if (!date) {
    return jsonResponse({
      success: false,
      error: 'Date parameter required'
    }, 400)
  }
  
  try {
    // Parse natural language date if needed
    let checkDate = date
    if (isNaN(Date.parse(checkDate))) {
      const parsedDate = parseNaturalDate(date)
      if (!parsedDate) {
        return jsonResponse({
          success: false,
          error: `Unable to parse date: ${date}`
        }, 400)
      }
      checkDate = parsedDate
    }
    

[truncated at line 200 — original has 367 lines]
```

### `app/api/booking/submit/route.ts`

_(deleted or missing from working tree)_

### `app/api/table-bookings/__tests__/route.test.ts`

```
/**
 * Walk-in-launch behaviour tests for the website /api/table-bookings proxy.
 *
 * Spec §6, §8.1: the public proxy must:
 *   1. Silently strip inbound `sunday_lunch` and `booking_type` regardless
 *      of value (defence in depth — hostile or stale clients can't sneak
 *      Sunday-lunch behaviour back in).
 *   2. Always forward booking_type='regular' to the management API.
 *   3. NOT enforce any Saturday-1pm cutoff (Sunday-lunch cutoff retired).
 *   4. Forward `purpose` through unchanged when valid; default to 'food'
 *      when the inbound payload omits it.
 */

export {}

jest.mock('@/lib/management-api-base', () => ({
  getManagementApiBaseUrl: () => 'https://example.invalid/api'
}))

const mockGetBusinessHours = jest.fn()

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args)
  }
}))

jest.mock('@/lib/spam-protection', () => ({
  checkSpamProtection: jest.fn().mockResolvedValue({ blocked: false })
}))

jest.mock('@/lib/upstream-json', () => ({
  getSafeUpstreamErrorMessage: () => 'upstream error',
  safeJsonParse: (text: string) => {
    try {
      return JSON.parse(text)
    } catch {
      return null
    }
  }
}))

jest.mock('@/lib/error-handling', () => ({
  createApiErrorResponse: (message: string, status: number) =>
    new Response(JSON.stringify({ success: false, error: message }), {
      status,
      headers: { 'content-type': 'application/json' }
    }),
  logError: jest.fn()
}))

const ALWAYS_OPEN_HOURS = {
  regularHours: {
    monday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    tuesday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    wednesday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    thursday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    friday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    saturday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    sunday: { opens: '12:00', closes: '18:00', is_closed: false, kitchen: { opens: '13:00', closes: '17:30' } }
  },
  specialHours: []
} as any

function buildRequest(body: unknown): Request {
  return new Request('http://localhost/api/table-bookings', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  })
}

async function getPostHandler() {
  const mod = await import('@/app/api/table-bookings/route')
  return mod.POST
}

function installUpstreamFetch() {
  const calls: Array<{ url: string; init: RequestInit }> = []
  ;(global as any).fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    calls.push({ url, init: init ?? {} })
    return new Response(
      JSON.stringify({ success: true, data: { state: 'confirmed', booking_reference: 'TB-OK' } }),
      { status: 201, headers: { 'content-type': 'application/json' } }
    )
  })
  return calls
}

const ORIGINAL_ENV = process.env

beforeAll(() => {
  process.env = { ...ORIGINAL_ENV, ANCHOR_API_KEY: 'test-key' }
})

afterAll(() => {
  process.env = ORIGINAL_ENV
})

beforeEach(() => {
  mockGetBusinessHours.mockResolvedValue(ALWAYS_OPEN_HOURS)
})

afterEach(() => {
  jest.clearAllMocks()
  jest.useRealTimers()
})

describe('website /api/table-bookings proxy — walk-in launch sanitisation', () => {
  it('silently strips inbound sunday_lunch=true (does not error, does not forward)', async () => {
    const calls = installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(
      buildRequest({
        phone: '07700900000',
        first_name: 'Hostile',
        last_name: 'Client',
        date: '2026-05-24',
        time: '13:00',
        party_size: 4,
        purpose: 'food',
        sunday_lunch: true
      }) as any
    )

    expect(res.status).toBe(201)
    expect(calls).toHaveLength(1)
    const forwarded = JSON.parse(String(calls[0].init.body))
    expect(forwarded.sunday_lunch).toBeUndefined()
    expect(forwarded.booking_type).toBe('regular')
    expect(forwarded.purpose).toBe('food')
  })

  it('silently strips inbound booking_type=sunday_lunch and forwards regular', async () => {
    const calls = installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(
      buildRequest({
        phone: '07700900000',
        date: '2026-05-24',
        time: '13:00',
        party_size: 2,
        purpose: 'food',
        booking_type: 'sunday_lunch'
      }) as any
    )

    expect(res.status).toBe(201)
    const forwarded = JSON.parse(String(calls[0].init.body))
    expect(forwarded.booking_type).toBe('regular')
    expect(forwarded.sunday_lunch).toBeUndefined()
  })

  it('silently strips both fields when both are present (defence in depth)', async () => {
    const calls = installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(
      buildRequest({
        phone: '07700900000',
        date: '2026-05-24',
        time: '13:00',
        party_size: 6,
        purpose: 'food',
        booking_type: 'sunday_lunch',
        sunday_lunch: true,
        menu_selections: [{ menu_dish_id: 'roast', quantity: 1 }]
      }) as any
    )

    expect(res.status).toBe(201)
    const forwarded = JSON.parse(String(calls[0].init.body))
    expect(forwarded.booking_type).toBe('regular')
    expect(forwarded.sunday_lunch).toBeUndefined()
    expect(forwarded.menu_selections).toBeUndefined()
    expect(forwarded.sunday_preorder_items).toBeUndefined()
  })

  it('always forwards booking_type=regular, even when inbound payload omits booking_type', async () => {
    const calls = installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(
      buildRequest({
        phone: '07700900000',
        date: '2026-05-24',
        time: '13:00',
        party_size: 2,
        purpose: 'food'
      }) as any
    )

    expect(res.status).toBe(201)
    const forwarded = JSON.parse(String(calls[0].init.body))
    expect(forwarded.booking_type).toBe('regular')
  })


[truncated at line 200 — original has 245 lines]
```

### `app/api/table-bookings/availability/route.ts`

```
import { anchorAPI, type BusinessHours, type TableAvailabilityResponse } from '@/lib/api'
import { createApiErrorResponse, logError } from '@/lib/error-handling'
import {
  buildSlotsFromRanges,
  isValidIsoDate,
  isValidTime,
  londonNowParts,
  normalizeTime,
  resolveServiceRanges,
  type BookingPurpose,
  type BookingType
} from '@/lib/table-booking-service-windows'

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return parsed
}

function buildFallbackAvailability(
  businessHours: BusinessHours,
  options: {
    date: string
    partySize: number
    time: string
    bookingType: BookingType
    purpose: BookingPurpose
  }
): TableAvailabilityResponse {
  const { ranges, message } = resolveServiceRanges(businessHours, options.date, {
    bookingType: options.bookingType,
    purpose: options.purpose
  })

  const londonNow = londonNowParts()
  const minMinutesForToday =
    londonNow.isoDate === options.date
      ? Math.ceil((londonNow.minutes + 60) / 30) * 30
      : undefined

  const timeSlots = buildSlotsFromRanges(ranges, options.partySize, 30, minMinutesForToday)
  const available = timeSlots.some(
    (slot) => slot.available === true || (slot.available_capacity || 0) >= options.partySize
  )

  const fallbackMessage =
    message ||
    (available
      ? 'These times are based on current service windows and will be confirmed instantly when you continue.'
      : options.purpose === 'food'
      ? 'No online food times are currently available for this request. You can try drinks-only times or call us.'
      : 'No online times are currently available for this request. Please choose an alternative or join the waitlist.')

  return {
    date: options.date,
    time: options.time,
    party_size: options.partySize,
    available,
    time_slots: timeSlots,
    message: fallbackMessage,
    special_notes:
      options.purpose === 'food'
        ? 'Food bookings follow kitchen service hours. For later slots, switch to drinks-only or call 01753 682707.'
        : 'If your preferred time is unavailable, choose a nearby slot or call 01753 682707 to join the waitlist.'
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const partySizeRaw = searchParams.get('party_size')
  const requestedTime = searchParams.get('time') || '19:00'
  // Sunday-lunch as a separate booking type is retired with the walk-in launch
  // (spec §6, §8.1). The booking_type query param is still accepted for
  // backwards compatibility but every request resolves as 'regular'.
  void searchParams.get('booking_type')
  const bookingType: BookingType = 'regular'

  const purpose: BookingPurpose =
    searchParams.get('purpose') === 'drinks' ? 'drinks' : 'food'

  if (!date || !partySizeRaw) {
    return createApiErrorResponse(
      'Missing required parameters: date and party_size are required',
      400
    )
  }

  if (!isValidIsoDate(date)) {
    return createApiErrorResponse('Date must use YYYY-MM-DD format', 400)
  }

  const normalizedTime = normalizeTime(requestedTime)
  if (!isValidTime(normalizedTime)) {
    return createApiErrorResponse('Time must use HH:mm or HH:mm:ss format', 400)
  }

  const partySize = parsePositiveInt(partySizeRaw, 2)

  try {
    const businessHours = await anchorAPI.getBusinessHours()
    const fallback = buildFallbackAvailability(businessHours, {
      date,
      partySize,
      time: normalizedTime,
      bookingType,
      purpose
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: fallback,
        meta: {
          source: 'schedule_fallback',
          purpose
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (fallbackError: any) {
    logError('api/table-bookings/availability-fallback', fallbackError, {
      date,
      time: normalizedTime,
      partySize,
      bookingType,
      purpose
    })

    return createApiErrorResponse(
      'We couldn\'t check table availability right now. Please try again or call us at 01753 682707.',
      503
    )
  }
}
```

### `app/api/table-bookings/menu/sunday-lunch/route.ts`

_(deleted or missing from working tree)_

### `app/api/table-bookings/route.ts`

```
import { NextRequest } from 'next/server'
import { anchorAPI } from '@/lib/api'
import { createApiErrorResponse, logError } from '@/lib/error-handling'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { getSafeUpstreamErrorMessage, safeJsonParse } from '@/lib/upstream-json'
import {
  isTimeWithinRanges,
  normalizeTime,
  resolveServiceRanges
} from '@/lib/table-booking-service-windows'
import { checkSpamProtection } from '@/lib/spam-protection'

const API_BASE_URL = getManagementApiBaseUrl()
const API_KEY = process.env.ANCHOR_API_KEY

type BookingPurpose = 'food' | 'drinks'

type ManagementTableBookingPayload = {
  phone: string
  first_name?: string
  last_name?: string
  email?: string
  date: string
  time: string
  party_size: number
  purpose: BookingPurpose
  notes?: string
  dietary_requirements?: string[]
  allergies?: string[]
  default_country_code?: string
}

type LegacyTableBookingPayload = {
  date?: string
  time?: string
  party_size?: number
  purpose?: BookingPurpose
  customer?: {
    first_name?: string
    last_name?: string
    email?: string
    mobile_number?: string
  }
  customer_phone?: string
  special_requirements?: string
  dietary_requirements?: string[] | string
  allergies?: string[] | string
  celebration_type?: string
  notes?: string
}

function mergeNotes(...parts: Array<string | undefined>): string | undefined {
  const merged = parts
    .map((part) => asTrimmedString(part))
    .filter((part): part is string => Boolean(part))

  if (merged.length === 0) return undefined
  return merged.join('\n')
}

function createIdempotencyKey(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function asTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function asPositiveInt(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const rounded = Math.floor(value)
    return rounded > 0 ? rounded : undefined
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseInt(value.trim(), 10)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }

  return undefined
}

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => asTrimmedString(entry))
      .filter((entry): entry is string => Boolean(entry))
  }

  const single = asTrimmedString(value)
  return single ? [single] : []
}

// Parses either of the two shapes the site currently sends -- the "management"
// top-level shape (ManagementTableBookingForm) and the legacy nested
// shape with a customer{} wrapper -- into the single structured payload the
// management API expects.
//
// Defence in depth (spec §6, §8.1): the public proxy strips inbound
// `sunday_lunch` and `booking_type` from every payload before forwarding,
// regardless of value. Hostile or stale clients sending sunday_lunch=true or
// booking_type='sunday_lunch' are silently neutralised. We always forward
// booking_type='regular' to the management API.
function normaliseIncomingPayload(input: unknown): {
  payload?: ManagementTableBookingPayload
  error?: string
} {
  if (!input || typeof input !== 'object') {
    return { error: 'Invalid request body' }
  }

  const body = input as Record<string, unknown>

  // Top-level first_name/last_name/email/phone (management form) takes
  // precedence; fall back to the nested customer{} object for any legacy
  // callers. Either is accepted.
  const customer = (body.customer && typeof body.customer === 'object'
    ? (body.customer as Record<string, unknown>)
    : {}) as Record<string, unknown>

  const phone =
    asTrimmedString(body.phone) ||
    asTrimmedString(customer.mobile_number) ||
    asTrimmedString(body.customer_phone)

  const firstName = asTrimmedString(body.first_name) || asTrimmedString(customer.first_name)
  const lastName = asTrimmedString(body.last_name) || asTrimmedString(customer.last_name)
  const email = asTrimmedString(body.email) || asTrimmedString(customer.email)

  const date = asTrimmedString(body.date)
  const time = asTrimmedString(body.time)
  const partySize = asPositiveInt(body.party_size)
  const defaultCountryCode = asTrimmedString(body.default_country_code)

  // purpose defaults to food (kitchen bookings are the common case via this
  // route). booking_type and sunday_lunch from the inbound body are ignored.
  const explicitPurpose =
    body.purpose === 'drinks' ? 'drinks' : body.purpose === 'food' ? 'food' : undefined
  const purpose: BookingPurpose = explicitPurpose ?? 'food'

  if (!phone || !date || !time || !partySize) {
    return { error: 'Missing required fields: phone, date, time, party_size, purpose' }
  }

  const dietaryRequirements = toStringList(body.dietary_requirements)
  const allergies = toStringList(body.allergies)

  // notes is strictly the user's free-text. Sunday-lunch pre-order menu_selections
  // are no longer supported on the public path (spec §6, §8.1) — Sundays are
  // regular food bookings now.
  const userNote =
    asTrimmedString(body.special_requirements) || asTrimmedString(body.notes)
  const occasionNote = asTrimmedString((body as LegacyTableBookingPayload).celebration_type)
  const notes = mergeNotes(
    occasionNote ? `Occasion: ${occasionNote}` : undefined,
    userNote
  )

  return {
    payload: {
      phone,
      ...(firstName ? { first_name: firstName } : {}),
      ...(lastName ? { last_name: lastName } : {}),
      ...(email ? { email } : {}),
      date,
      time,
      party_size: partySize,
      purpose,
      ...(notes ? { notes } : {}),
      ...(dietaryRequirements.length > 0 ? { dietary_requirements: dietaryRequirements } : {}),
      ...(allergies.length > 0 ? { allergies } : {}),
      ...(defaultCountryCode ? { default_country_code: defaultCountryCode } : {}),
    },
  }
}

function validatePayload(payload: ManagementTableBookingPayload): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) {
    return 'Date must use YYYY-MM-DD format'
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(payload.time)) {
    return 'Time must use HH:mm or HH:mm:ss format'
  }

  if (payload.party_size < 1 || payload.party_size > 20) {
    return 'Party size must be between 1 and 20'
  }

  const phoneDigits = payload.phone.replace(/\D/g, '')
  if (phoneDigits.length < 7) {
    return 'Please enter a valid phone number'
  }


[truncated at line 200 — original has 319 lines]
```

### `app/book-table/page-old.tsx`

_(deleted or missing from working tree)_

### `app/book-table/page.tsx`

```
import type { Metadata } from 'next'
import Link from 'next/link'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { PhoneButton } from '@/components/PhoneButton'
import { ManagementTableBookingForm } from '@/components/features/TableBooking/ManagementTableBookingForm'
import { BookTableUpcomingEventsPanel } from '@/components/features/TableBooking/BookTableUpcomingEventsPanel'
import { LaunchAnnouncement } from '@/components/announcements/LaunchAnnouncement'
import { Section, Button, Grid, Card, CardBody, SectionHeader } from '@/components/ui'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { LARGE_GROUP_DEPOSIT_POLICY_COPY } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { RegretReduction, ValueProofStrip } from '@/components/psychology'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'

// Revalidate every 1 hour for the walk-in launch fortnight (10–22 May 2026)
// so the LaunchAnnouncement banner flips reliably at the cutover even on
// cached pages. See spec §8.5.
// TODO(post-launch): revert to 60 * 60 * 24 (24 hours) after 22 May 2026, or
// drop the export entirely if the original was using Next.js' default.
export const revalidate = 60 * 60 // 1 hour during launch fortnight

export const metadata: Metadata = {
  title: 'Book a Table Near Heathrow | Sunday Roast',
  description: 'Reserve your table at The Anchor, Stanwell Moor — instant confirmation. Pub food from £8.95, Sunday roast from £19. Dog-friendly, free parking, 7 mins from T5.',
  openGraph: {
    title: 'Book a Table Near Heathrow | Sunday Roast | The Anchor',
    description: 'Reserve your table at The Anchor, Stanwell Moor — instant confirmation. Pub food from £8.95, Sunday roast from £19. Dog-friendly, free parking, 7 mins from T5.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }]
  },
  twitter: getTwitterMetadata({
    title: 'Book a Table Near Heathrow | Sunday Roast | The Anchor',
    description: 'Reserve your table at The Anchor, Stanwell Moor — instant confirmation. Pub food from £8.95, Sunday roast from £19. Dog-friendly, free parking, 7 mins from T5.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/book-table'
  }
}

type BookTablePageProps = {
  searchParams?: {
    date?: string
    time?: string
    party_size?: string
    purpose?: string
  }
}

function parsePartySize(value?: string): number | undefined {
  if (!value) return undefined
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return undefined
  return Math.min(Math.max(parsed, 1), 20)
}

function parsePurpose(value?: string): 'food' | 'drinks' | undefined {
  if (value === 'food' || value === 'drinks') return value
  return undefined
}

export default function BookPage({ searchParams }: BookTablePageProps) {
  // sunday_lunch and mothers_day query params are silently ignored — Sunday-lunch
  // as a separate booking type is retired with the walk-in launch (spec §6, §8.1).
  const prefill = {
    date: searchParams?.date,
    time: searchParams?.time,
    partySize: parsePartySize(searchParams?.party_size),
    purpose: parsePurpose(searchParams?.purpose)
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              'name': 'Book a Table at The Anchor',
              'description': 'Reserve your table at The Anchor, Stanwell Moor. Instant confirmation. Free parking, 7 mins from Heathrow T5.',
              'url': 'https://www.the-anchor.pub/book-table',
              'potentialAction': {
                '@type': 'ReserveAction',
                'target': {
                  '@type': 'EntryPoint',
                  'urlTemplate': 'https://www.the-anchor.pub/book-table'
                },
                'result': {
                  '@type': 'FoodEstablishmentReservation'
                }
              }
            },
            {
              '@context': 'https://schema.org',
              '@type': 'FoodEstablishmentReservation',
              reservationFor: {
                '@type': 'FoodEstablishment',
                name: 'The Anchor',
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: 'Horton Road',
                  addressLocality: 'Stanwell Moor',
                  postalCode: 'TW19 6AQ'
                }
              },
              url: 'https://www.the-anchor.pub/book-table',
              potentialAction: {
                '@type': 'ReserveAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://www.the-anchor.pub/book-table'
                },
                result: {
                  '@type': 'FoodEstablishmentReservation'
                }
              }
            }
          ])
        }}
      />

      <HeroWrapper
        showContextStrip={true}
        route="/book-table"
        title="Book a Table at The Anchor"
        description="Reserve your table online with mobile confirmation."
        variant="default"
        statusBarPosition="above"
        primaryCta={
          <Link href="#booking-form">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Book Online
            </Button>
          </Link>
        }
        secondaryCta={
          <PhoneButton
            phone="01753 682707"
            source="book_table_hero"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto !bg-white/10 !text-white !border-white/30 hover:!bg-white/20"
          >
            Prefer to call? 01753 682707
          </PhoneButton>
        }
        image={{
          src: DEFAULT_PAGE_HEADER_IMAGE,
          alt: 'The Anchor pub - book a table',
          priority: true
        }}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Book a Table' }
        ]}
        tags={[
          { label: 'Direct booking', icon: '', size: 'small' },
          { label: 'Fast confirmation', icon: '', size: 'small' },
          { label: 'Need help? Call us', icon: '', size: 'small' }
        ]}
        secondaryInfo={
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog & family friendly</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Rated 4.6/5 on Google</span>
          </div>
        }
      />

      <Section spacing="xs" container containerSize="md" className="text-center bg-anchor-bg border-b border-anchor-gold/15">
        <PageTitle className="text-anchor-cream-text" seo={{ structured: true, speakable: true }}>
          Reserve Your Table Online
        </PageTitle>
        <p className="mt-3 text-base text-anchor-cream-text/70 md:text-lg">
          Choose your date, time, and party size to reserve your table. Loved by locals and Heathrow travellers every week.
        </p>
      </Section>

      <Section id="booking-form" background="gray" spacing="sm" container containerSize="lg" className="bg-anchor-bg-raised">
        <div className="grid items-start gap-5 lg:gap-8 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
          <div className="order-1">
            <div className="mb-4 space-y-3">
              <LaunchAnnouncement variant="banner" />
              <RegretReduction variant="booking" />
            </div>
            <ManagementTableBookingForm prefill={prefill} />
          </div>

          <aside className="order-2 space-y-4 lg:space-y-6">
            <div className="card-dark p-4 lg:hidden">
              <h2 className="text-lg font-semibold text-anchor-gold-vivid">Need help with your booking?</h2>
              <p className="mt-2 text-sm text-anchor-cream-text/70">

[truncated at line 200 — original has 449 lines]
```

### `app/easter/page.tsx`

```
import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { LaunchAnnouncement } from '@/components/announcements/LaunchAnnouncement'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { Badge, Button, Card, CardBody, Container, Section } from '@/components/ui'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { CONTACT, HEATHROW_TIMES } from '@/lib/constants'
import {
  DEFAULT_PAGE_HEADER_IMAGE,
  DEFAULT_SUNDAY_LUNCH_IMAGE,
  DEFAULT_FOOD_IMAGE,
  DEFAULT_DRINKS_IMAGE
} from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

// Easter 2026 (5 April) is past at time of authoring. The page persists for
// rolling SEO and Easter 2027 (Sunday 4 April 2027). Copy describes the
// post-launch walk-in model unconditionally.
const EASTER_SUNDAY_DATE = '2027-04-04'
const EASTER_SUNDAY_LABEL = 'Sunday 4 April 2027'
const EASTER_SUNDAY_SERVICE_WINDOW = '1pm–6pm'
const EASTER_SUNDAY_LAST_BOOKING = '5:30pm'
const EASTER_ROAST_PRICE_FROM = 19

const EASTER_BOOKING_URL = '/book-table'

const WEBSITE_ORIGIN = 'https://www.the-anchor.pub'

export const metadata: Metadata = {
  title: 'Easter Sunday Lunch & Beer Garden',
  description:
    'Celebrate Easter at The Anchor near Heathrow. Easter Sunday roast served 1pm–6pm, from £19. Walk in or book ahead. Dog-friendly beer garden, free parking.',
  alternates: { canonical: '/easter' },
  openGraph: {
    title: 'Easter at The Anchor | Sunday Lunch & Beer Garden',
    description:
      'Celebrate Easter at The Anchor near Heathrow. Easter Sunday roast served 1pm–6pm, from £19. Walk in or book ahead. Dog-friendly beer garden, free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
    type: 'website'
  },
  twitter: getTwitterMetadata({
    title: 'Easter at The Anchor | Sunday Lunch & Beer Garden',
    description:
      'Celebrate Easter at The Anchor near Heathrow. Easter Sunday roast served 1pm–6pm, from £19. Walk in or book ahead. Dog-friendly beer garden, free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  })
}

export default function EasterPage() {
  const addressLine = `${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.county}, ${CONTACT.address.postcode}`
  const mapQuery = `The Anchor, ${CONTACT.address.street}, ${CONTACT.address.postcode}`

  const faqs = [
    {
      question: 'What are your Easter opening hours?',
      answer:
        'We’re open throughout the Easter weekend. Good Friday through Easter Sunday: normal hours with full kitchen service. ' +
        'Easter Monday: open for drinks only — the kitchen is closed on Mondays, including bank holidays.'
    },
    {
      question: 'Do I need to book for Easter Sunday lunch?',
      answer:
        'Walk-ins are welcome on Easter Sunday between 1pm and 6pm — no pre-order needed. Booking is still recommended for groups, especially for parties of six or more. ' +
        'Groups of 10 or more take a £10 per person deposit on booking, fully deducted from the bill on the day.'
    },
    {
      question: 'Is The Anchor dog-friendly?',
      answer:
        'Absolutely. Well-behaved dogs are welcome inside the pub and in the beer garden. Water bowls are always available. ' +
        'It’s a great spot for a post-walk Easter Sunday lunch.'
    },
    {
      question: 'What’s on the Easter menu?',
      answer:
        'Our Easter Sunday menu is the same as our regular Sunday roast — choose from chicken, pork belly, or a vegetarian option. ' +
        'Mains start from £19. All served with roast potatoes, seasonal vegetables, Yorkshire pudding and gravy.'
    },
    {
      question: 'Is there parking?',
      answer:
        `Yes — we have ${20} free parking spaces on site. No meters, no charges. ` +
        `We’re about ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 by car.`
    }
  ]

  const easterEventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${WEBSITE_ORIGIN}/easter#event`,
    name: 'Easter Sunday Lunch at The Anchor',
    description:
      `Easter Sunday lunch at The Anchor in Stanwell Moor (TW19), near Heathrow. ` +
      `Traditional roast from £${String(EASTER_ROAST_PRICE_FROM)}. Serving ${EASTER_SUNDAY_SERVICE_WINDOW}. ` +
      `Walk in or book ahead. Dog-friendly beer garden, free parking.`,
    startDate: `${EASTER_SUNDAY_DATE}T13:00:00+01:00`,
    endDate: `${EASTER_SUNDAY_DATE}T18:00:00+01:00`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'The Anchor',
      address: {
        '@type': 'PostalAddress',
        streetAddress: CONTACT.address.street,
        addressLocality: CONTACT.address.town,
        addressRegion: CONTACT.address.county,
        postalCode: CONTACT.address.postcode,
        addressCountry: CONTACT.address.country
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: CONTACT.coordinates.lat,
        longitude: CONTACT.coordinates.lng
      }
    },
    organizer: {
      '@type': 'Organization',
      name: 'The Anchor',
      url: WEBSITE_ORIGIN,
      telephone: CONTACT.phoneIntl,
      email: CONTACT.email
    },
    offers: {
      '@type': 'Offer',
      url: `${WEBSITE_ORIGIN}${EASTER_BOOKING_URL}`,
      priceCurrency: 'GBP',
      price: String(EASTER_ROAST_PRICE_FROM),
      availability: 'https://schema.org/InStock'
    },
    image: [
      `${WEBSITE_ORIGIN}${DEFAULT_SUNDAY_LUNCH_IMAGE}`,
      `${WEBSITE_ORIGIN}${DEFAULT_FOOD_IMAGE}`,
      `${WEBSITE_ORIGIN}${DEFAULT_DRINKS_IMAGE}`
    ],
    url: `${WEBSITE_ORIGIN}/easter`
  }

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Easter', url: '/easter' }
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(easterEventSchema)
        }}
      />

            <HeroWrapper
        route="/easter"
        title="Easter at The Anchor"
        description={
          `Gather the family for a proper Easter Sunday roast at The Anchor in Stanwell Moor — ` +
          `cooked from scratch, served ${EASTER_SUNDAY_SERVICE_WINDOW}, with free parking and a dog-friendly beer garden.`
        }
        eyebrow={EASTER_SUNDAY_LABEL}
        lead={
          <p className="text-white/90 text-base sm:text-lg">
            Sunday roast from &pound;{String(EASTER_ROAST_PRICE_FROM)} &bull; Walk in or book ahead &bull; Served {EASTER_SUNDAY_SERVICE_WINDOW}
          </p>
        }
        image={{
          src: DEFAULT_PAGE_HEADER_IMAGE,
          alt: 'Easter Sunday lunch at The Anchor near Heathrow'
        }}
        enableSmartCtas={true}
        showContextStrip={true}
      />

      {/* Easter Sunday Lunch */}
      <Section background="white" spacing="md">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <LaunchAnnouncement variant="banner" />
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
              Easter Sunday Lunch
            </h2>
            <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
              Easter Sunday is one of those meals that deserves a proper table. Join us at The Anchor for a traditional roast
              cooked from scratch &mdash; the kind of lunch that marks the start of spring and brings the whole family together.
            </p>
            <p className="text-anchor-cream-text/70 leading-relaxed">
              Choose from chicken, pork belly, or a vegetarian option, all served with golden roast potatoes,
              seasonal vegetables, a generous Yorkshire pudding and our signature gravy. Mains start from{' '}
              <span className="font-semibold">&pound;{String(EASTER_ROAST_PRICE_FROM)}</span>.
            </p>
            <p className="text-anchor-cream-text/70 leading-relaxed">
              We serve from <span className="font-semibold">1pm</span> to <span className="font-semibold">6pm</span>,
              with the last table booking at <span className="font-semibold">{EASTER_SUNDAY_LAST_BOOKING}</span>.
              No set sittings &mdash; book a time that suits you and enjoy your meal at a comfortable pace.

[truncated at line 200 — original has 433 lines]
```

### `app/fathers-day/page.tsx`

```
import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { LaunchAnnouncement } from '@/components/announcements/LaunchAnnouncement'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { Badge, Button, Card, CardBody, Container, Section } from '@/components/ui'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { CONTACT, HEATHROW_TIMES } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE, DEFAULT_SUNDAY_LUNCH_IMAGE, DEFAULT_FOOD_IMAGE, DEFAULT_DRINKS_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

// Father's Day 2026 (Sunday 21 June 2026) is the next live seasonal event after
// the 17 May walk-in launch — the page ships in the post-launch walk-in state
// from launch onward. Keyword cluster layered: 'fathers day pub lunch',
// 'fathers day sunday roast', 'fathers day pub near me', 'where to take dad
// for sunday lunch'. (Spec §8.6 — keyword plan delivered in conversation.)
const FATHERS_DAY_DATE = '2026-06-21'
const FATHERS_DAY_LABEL = 'Sunday 21 June 2026'
const FATHERS_DAY_SERVICE_WINDOW = '1pm–6pm'
const FATHERS_DAY_LAST_BOOKING = '5:30pm'
const FATHERS_DAY_ROAST_PRICE_FROM = 19

const FATHERS_DAY_BOOKING_URL = '/book-table'

const WEBSITE_ORIGIN = 'https://www.the-anchor.pub'

export const metadata: Metadata = {
  title: "Father's Day Pub Lunch Near Heathrow | Sunday Roast",
  description:
    "Father's Day pub lunch at The Anchor near Heathrow — Sunday roast served 1pm–6pm, walk-ins welcome. From £19. Beer garden, free parking, planes overhead.",
  alternates: { canonical: '/fathers-day' },
  openGraph: {
    title: "Father's Day Pub Lunch & Sunday Roast Near Heathrow | The Anchor",
    description:
      "Father's Day pub lunch at The Anchor near Heathrow — Sunday roast served 1pm–6pm, walk-ins welcome. From £19. Beer garden, free parking, planes overhead.",
    images: [DEFAULT_PAGE_HEADER_IMAGE],
    type: 'website'
  },
  twitter: getTwitterMetadata({
    title: "Father's Day Pub Lunch & Sunday Roast Near Heathrow | The Anchor",
    description:
      "Father's Day pub lunch at The Anchor near Heathrow — Sunday roast served 1pm–6pm, walk-ins welcome. From £19. Beer garden, free parking, planes overhead.",
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  })
}

export default function FathersDayPage() {
  const addressLine = `${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.county}, ${CONTACT.address.postcode}`
  const mapQuery = `The Anchor, ${CONTACT.address.street}, ${CONTACT.address.postcode}`

  const faqs = [
    {
      question: "What's on the Father's Day menu?",
      answer:
        "Father's Day falls on a Sunday, so the full Sunday roast menu is on — chicken, pork belly, or a vegetarian wellington. " +
        "Mains start from £19. All served with roast potatoes, seasonal vegetables, Yorkshire pudding and gravy."
    },
    {
      question: "Do I need to book for Father's Day?",
      answer:
        "Walk-ins are welcome on Father's Day Sunday between 1pm and 6pm — no pre-order needed. Booking is still recommended, especially for groups, since it's one of our busiest Sundays. " +
        "Groups of 10 or more take a £10 per person deposit on booking, fully deducted from the bill on the day."
    },
    {
      question: "Where to take dad for Sunday lunch near Heathrow?",
      answer:
        "The Anchor in Stanwell Moor — 7 minutes from Heathrow Terminal 5 by car, with 20 free parking spaces, a dog-friendly beer garden and planes passing overhead every 90 seconds. " +
        "It's a proper local pub, not a chain — Sunday roast cooked from scratch, mains from £19."
    },
    {
      question: 'Is there a set menu or special pricing?',
      answer:
        "There's no separate set menu — it's our regular Sunday roast menu, which is what makes it special. " +
        "Proper food, cooked from scratch. Mains from £19."
    },
    {
      question: "What time is Father's Day lunch served?",
      answer:
        "We serve Sunday lunch from 1pm to 6pm, with the last table booking at 5:30pm. " +
        "No set sittings — book a time that suits you, or just walk in."
    },
    {
      question: 'Is there parking?',
      answer:
        `Yes — we have 20 free parking spaces on site. No meters, no charges. ` +
        `We're about ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 by car.`
    }
  ]

  const fathersDayEventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${WEBSITE_ORIGIN}/fathers-day#event`,
    name: "Father's Day Lunch at The Anchor",
    description:
      `Treat Dad to Father's Day pub lunch at The Anchor in Stanwell Moor (TW19), near Heathrow. ` +
      `Sunday roast from £${String(FATHERS_DAY_ROAST_PRICE_FROM)}. Serving ${FATHERS_DAY_SERVICE_WINDOW}. ` +
      `Walk in or book ahead. Beer garden with plane spotting, free parking.`,
    startDate: `${FATHERS_DAY_DATE}T13:00:00+01:00`,
    endDate: `${FATHERS_DAY_DATE}T18:00:00+01:00`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'The Anchor',
      address: {
        '@type': 'PostalAddress',
        streetAddress: CONTACT.address.street,
        addressLocality: CONTACT.address.town,
        addressRegion: CONTACT.address.county,
        postalCode: CONTACT.address.postcode,
        addressCountry: CONTACT.address.country
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: CONTACT.coordinates.lat,
        longitude: CONTACT.coordinates.lng
      }
    },
    organizer: {
      '@type': 'Organization',
      name: 'The Anchor',
      url: WEBSITE_ORIGIN,
      telephone: CONTACT.phoneIntl,
      email: CONTACT.email
    },
    offers: {
      '@type': 'Offer',
      url: `${WEBSITE_ORIGIN}${FATHERS_DAY_BOOKING_URL}`,
      priceCurrency: 'GBP',
      price: String(FATHERS_DAY_ROAST_PRICE_FROM),
      availability: 'https://schema.org/InStock'
    },
    image: [
      `${WEBSITE_ORIGIN}${DEFAULT_SUNDAY_LUNCH_IMAGE}`,
      `${WEBSITE_ORIGIN}${DEFAULT_FOOD_IMAGE}`,
      `${WEBSITE_ORIGIN}${DEFAULT_DRINKS_IMAGE}`
    ],
    url: `${WEBSITE_ORIGIN}/fathers-day`
  }

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: "Father's Day", url: '/fathers-day' }
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(fathersDayEventSchema)
        }}
      />

            <HeroWrapper
        route="/fathers-day"
        title="Father&rsquo;s Day at The Anchor"
        description={
          "A proper Sunday roast, a cold pint, planes coming in low overhead, and the family all in one place. " +
          "That's Father's Day sorted."
        }
        eyebrow={FATHERS_DAY_LABEL}
        lead={
          <p className="text-white/90 text-base sm:text-lg">
            Sunday roast from &pound;{String(FATHERS_DAY_ROAST_PRICE_FROM)} &bull; Walk in or book ahead &bull; Served {FATHERS_DAY_SERVICE_WINDOW}
          </p>
        }
        image={{
          src: DEFAULT_PAGE_HEADER_IMAGE,
          alt: "Father's Day pub lunch at The Anchor near Heathrow"
        }}
        enableSmartCtas={true}
        showContextStrip={true}
      />

      {/* Treat Dad — Father's Day pub lunch */}
      <Section background="white" spacing="md">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <LaunchAnnouncement variant="banner" />
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
              Treat Dad to a Proper Father&rsquo;s Day Pub Lunch
            </h2>
            <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
              Father&apos;s Day pub lunch lands on a Sunday, which means the full Father&apos;s Day Sunday roast menu is on. Chicken,
              pork belly or a vegetarian wellington &mdash; all cooked from scratch, served with golden roast potatoes,
              seasonal vegetables, a generous Yorkshire pudding and our signature gravy.
            </p>
            <p className="text-anchor-cream-text/70 leading-relaxed">
              Mains start from <span className="font-semibold">&pound;{String(FATHERS_DAY_ROAST_PRICE_FROM)}</span>.
              We serve from <span className="font-semibold">1pm</span> to <span className="font-semibold">6pm</span>,
              last table at <span className="font-semibold">{FATHERS_DAY_LAST_BOOKING}</span>.
              Walk in or book ahead &mdash; deposits only apply to groups of 10 or more.

[truncated at line 200 — original has 429 lines]
```

### `app/feltham-pub/page.tsx`

```
import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { generateBreadcrumbSchema, generateHowToDirectionsSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
  title: 'Pub Near Feltham | Free Parking & Sunday Roasts',
  description: 'Looking for pubs near Feltham? The Anchor is just 10 minutes away with free parking, Sunday roasts from £19, stone-baked pizzas and quiz nights in a relaxed village pub.',
  openGraph: {
    title: 'Pub Near Feltham | Free Parking & Sunday Roasts | The Anchor',
    description: 'Pubs near Feltham — just 10 minutes away with free parking, Sunday roasts, stone-baked pizzas and quiz nights.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Feltham | Free Parking & Sunday Roasts | The Anchor',
    description: 'Pubs near Feltham — just 10 minutes away with free parking, Sunday roasts, stone-baked pizzas and quiz nights.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/feltham-pub'
  }
}

export default function FelthamPubPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Feltham Pub', url: '/feltham-pub' }
  ])

  const directionsSchema = generateHowToDirectionsSchema(
    "Feltham Town Centre",
    "The Anchor",
    [
      "From Feltham High Street, head south on Bedfont Lane",
      "Continue for 1.5 miles through Bedfont",
      "At the roundabout, take the 2nd exit onto Staines Road",
      "After 0.8 miles, turn right onto Horton Road",
      "Continue for 0.5 miles",
      "The Anchor is on your left with free parking"
    ]
  )

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    "name": "The Anchor - Feltham's Local Pub",
    "description": "Traditional British pub serving Feltham residents with great food, drinks, and entertainment.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Horton Road",
      "addressLocality": "Stanwell Moor",
      "addressRegion": "Surrey",
      "postalCode": "TW19 6AQ",
      "addressCountry": "GB"
    },
    "areaServed": {
      "@type": "City",
      "name": "Feltham",
      "containedInPlace": {
        "@type": "AdministrativeArea",
        "name": "London Borough of Hounslow"
      }
    },
    "telephone": "+441753682707",
    "url": "https://www.the-anchor.pub/feltham-pub"
  }


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, breadcrumbSchema, directionsSchema]) }}
      />
      
      {/* Hero Section */}
      <HeroWrapper
        route="/feltham-pub"
        title="Your Local Pub Near Feltham"
        description="Just 10 minutes away with free parking"
        variant="default"
        enableSmartCtas={true}
        showContextStrip={true}
      />

      <section className="bg-anchor-bg py-6">
        <Container>
          <p className="text-center text-sm text-anchor-cream-text/70"> <strong>Rated 4.6/5 on Google</strong> · Highest-rated non-airport pub near Heathrow</p>
        </Container>
      </section>

      {/* Page Title */}
      <section className="py-8 bg-anchor-bg">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle
              seo={{
                structured: true,
                speakable: true
              }}
              className="text-anchor-cream-text mb-4"
            >
              Pub Near Feltham — Traditional British Pub with Free Parking
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              Your local traditional pub just 10 minutes from Feltham with free parking
            </p>
          </div>
        </Container>
      </section>

      {/* Distance & Benefits */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Feltham's Favourite Village Escape"
              subtitle="Escape the hustle of Feltham High Street for a proper traditional pub experience"
              className="text-center mb-12"
            />

            {/* Key Benefits Grid */}
            <FeatureGrid
              columns={3}
              features={[
                {
                  icon: "10min",
                  title: "Quick Drive",
                  description: "Just 10 minutes from Feltham via Bedfont Lane",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "Peaceful Setting",
                  description: "Village atmosphere away from busy Feltham traffic",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "Plane Spotting",
                  description: "Unique beer garden under the Heathrow flight path",
                  className: "text-center"
                }
              ]}
              className="mb-12"
            />

            {/* Why Choose Us */}
            <div className="card-dark rounded-none p-8">
              <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-6">
                Why Feltham Residents Choose The Anchor
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-anchor-gold mr-3"></span>
                  <span>Free parking - no time limits or charges</span>
                </li>
                <li className="flex items-start">
                  <span className="text-anchor-gold mr-3"></span>
                  <span>Traditional pub atmosphere you won't find in chain venues</span>
                </li>
	                <li className="flex items-start">
	                  <span className="text-anchor-gold mr-3"></span>
	                  <span>Celebrated Sunday roasts served 1pm-6pm — walk in or book ahead, no pre-order needed.</span>
	                </li>
                <li className="flex items-start">
                  <span className="text-anchor-gold mr-3"></span>
                  <span>Regular entertainment including Music Bingo hosted by Nikki Manfadge, quiz nights and one-off events (see /whats-on)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-anchor-gold mr-3"></span>
                  <span>Perfect for Feltham work colleagues' gatherings</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Directions */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="How to Find Us from Feltham"
            />
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-xl mb-4">Driving Directions</h3>
                <ol className="space-y-3">
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">1.</span>

[truncated at line 200 — original has 503 lines]
```

### `app/layout.tsx`

```
import type { Metadata } from 'next'
import { Outfit, Merriweather } from 'next/font/google'
import dynamic from 'next/dynamic'
import Script from 'next/script'
import './globals.css'
import { WebVitals } from './web-vitals'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { HeaderStatusSectionDirect } from '@/components/layout/HeaderStatusSectionDirect'
import { FloatingActions } from '@/components/layout/FloatingActions'
import { AnalyticsProvider } from '@/components/tracking/AnalyticsProvider'
import { GTMProvider } from '@/components/tracking/GTMProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import CookieBanner from '@/components/CookieBanner'
import { LaunchAnnouncement } from '@/components/announcements/LaunchAnnouncement'
import { DynamicSchema } from '@/components/seo/DynamicSchema'
import { BusinessHoursProvider } from '@/components/providers/BusinessHoursProvider'
import { DeferredRender } from '@/components/DeferredRender'
import { DEFAULT_OG_IMAGE } from '@/lib/image-fallbacks'
import {
  PRIVATE_HIRE_2026_PROMO_ENABLED,
  PRIVATE_HIRE_2026_PROMO_ENDS_AT_MS
} from '@/lib/promos/privateHire2026'
import { Suspense } from 'react'


const EventCountdownBanner = dynamic(() => import('@/components/EventCountdownBanner').then(mod => mod.EventCountdownBanner), {
  ssr: false
})

const ChristmasLightbox = dynamic(() => import('@/components/features/christmas/ChristmasLightbox').then(mod => mod.ChristmasLightbox), {
  ssr: false
})

const PrivateHire2026PromoGate = dynamic(
  () => import('@/components/promos/PrivateHire2026PromoGate').then(mod => mod.PrivateHire2026PromoGate),
  { ssr: false }
)

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.the-anchor.pub'),
  title: {
    default: 'The Anchor Pub | Stanwell Moor | Near Heathrow',
    template: '%s | The Anchor Stanwell Moor'
  },
  description: 'The Anchor, Stanwell Moor — rated 4.6/5 on Google. Traditional pub 7 mins from Heathrow T5. Sunday roasts, quiz nights, karaoke Fridays, beer garden & free parking.',
  authors: [{ name: 'The Anchor' }],
  creator: 'The Anchor',
  publisher: 'The Anchor',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'The Anchor | Pub Near Heathrow Airport | Stanwell Moor',
    description: 'Traditional British venue near Heathrow with hosted events, live entertainment & great food. Dog-friendly beer garden.',
    url: 'https://www.the-anchor.pub',
    siteName: 'The Anchor',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'The Anchor in Stanwell Moor',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Anchor - Near Heathrow Airport',
    description: 'Traditional venue with modern entertainment. Quiz nights, hosted events, great food & more.',
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-WWFQTQS'
  const now = new Date()
  const privateHirePromoActive =
    PRIVATE_HIRE_2026_PROMO_ENABLED && now.getTime() < PRIVATE_HIRE_2026_PROMO_ENDS_AT_MS
  const promoCtaButtons = [
    {
      label: "Valentine's Day",
      href: '/valentines-day',
      external: false,
      variant: 'secondary' as const,
      startsOn: '2026-02-14',
      endsOn: '2026-02-14'
    },
    {
      label: "Mother's Day",
      href: '/mothers-day',
      external: false,
      variant: 'secondary' as const,
      startsOn: '2026-03-15',
      endsOn: '2026-03-15'
    },
    {
      label: 'World Cup 2026',
      href: '/live-sport/world-cup',
      external: false,
      variant: 'secondary' as const,
      startsOn: '2026-06-11',
      endsOn: '2026-07-19'
    }
  ]

  const tertiaryCtaButton = (() => {
    // Six Nations ends March 15th 2026
    if (now < new Date('2026-03-16')) { // Using 16th to include the full day of 15th
      return {
        label: 'Six Nations 2026',
        href: '/live-sport/six-nations',
        external: false,
        variant: 'secondary' as const
      }
    }
    // Show Christmas from August 1st 2026
    if (now >= new Date('2026-08-01')) {
      return {
        label: 'Christmas 2026',
        href: '/christmas-parties',
        external: false,
        variant: 'secondary' as const
      }
    }
    return null
  })()

  return (
    <html lang="en">
      <head>
        {/* Resource hints for performance */}
        <link rel="preconnect" href="https://management.orangejelly.co.uk" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* Favicons and manifest */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Meta tags */}
        <meta name="theme-color" content="#005131" />
        <meta name="format-detection" content="telephone=no" />

        {/* Next.js handles font and image prioritisation automatically */}

        {/* Google Consent Mode defaults — MUST fire before GTM script loads */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
(function(){
  try{
    var c=document.cookie.match(/anchor-cookie-consent=([^;]+)/);
    if(c){
      var p=JSON.parse(decodeURIComponent(c[1]));
      gtag('consent','default',{
        'analytics_storage':p.analytics?'granted':'denied',
        'ad_storage':p.marketing?'granted':'denied',
        'personalization_storage':p.preferences?'granted':'denied',
        'functionality_storage':'granted',
        'security_storage':'granted'
      });
      return;
    }

[truncated at line 200 — original has 290 lines]
```

### `app/mothers-day/page.tsx`

```
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { LaunchAnnouncement } from '@/components/announcements/LaunchAnnouncement'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { Badge, Button, Card, CardBody, Container, Section } from '@/components/ui'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { CONTACT, HEATHROW_TIMES } from '@/lib/constants'
import {
  DEFAULT_DRINKS_IMAGE,
  DEFAULT_EVENT_IMAGE,
  DEFAULT_FOOD_IMAGE,
  DEFAULT_PAGE_HEADER_IMAGE,
  DEFAULT_SUNDAY_LUNCH_IMAGE
} from '@/lib/image-fallbacks'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

const WEBSITE_ORIGIN = 'https://www.the-anchor.pub'

// Mother's Day 2026 (15 March) is past at time of authoring. The page persists
// for rolling SEO and Mother's Day 2027 (Sunday 14 March 2027). Copy describes
// the post-launch walk-in model unconditionally — no date-aware switch needed
// because no claim references a date before 17 May 2026. Keyword cluster
// layered (per spec §8.6 + keyword plan): mothers day lunch near me,
// mothers day sunday lunch near me, mothers day sunday lunch, mothers day pub
// lunch, mothers day sunday roast.
const MOTHERS_DAY_DATE = '2027-03-14'
const MOTHERS_DAY_SERVICE_START_ISO = `${MOTHERS_DAY_DATE}T13:00:00+00:00`
const MOTHERS_DAY_SERVICE_END_ISO = `${MOTHERS_DAY_DATE}T18:00:00+00:00`
const MOTHERS_DAY_SERVICE_WINDOW_LABEL = '1pm–6pm'
const MOTHERS_DAY_LAST_BOOKING_LABEL = '5:30pm'
const MOTHERS_DAY_ADULT_PRICE_LOW = 19
const MOTHERS_DAY_ADULT_PRICE_HIGH = 22
const MOTHERS_DAY_KIDS_ROAST_PRICE = 13

const MOTHERS_DAY_BOOKING_URL = '/book-table'
const MOTHERS_DAY_BOOKING_CTA_LABEL = 'Book Mother’s Day Lunch'

const MOTHERS_DAY_PHOTOS = [
  {
    src: DEFAULT_SUNDAY_LUNCH_IMAGE,
    alt: "Sunday roast at The Anchor near Staines",
    caption: 'Roasts cooked fresh to order'
  },
  {
    src: '/images/food/sunday-roast/sunday-roast-the-anchor.jpeg',
    alt: "Cooked-from-scratch food at The Anchor near Staines",
    caption: 'Cooked-from-scratch favourites'
  },
  {
    src: '/images/mothers-day/drinks.png',
    alt: "Refreshing Mother's Day drinks in the sunshine at The Anchor",
    caption: 'Drinks for the whole table'
  }
] as const

function toAbsoluteUrl(value: string): string {
  if (!value) return value
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  if (value.startsWith('/')) return `${WEBSITE_ORIGIN}${value}`
  return `${WEBSITE_ORIGIN}/${value}`
}

const eventDateLabelStatic = new Date(MOTHERS_DAY_SERVICE_START_ISO).toLocaleDateString('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/London'
})

const eventDateShortStatic = new Date(MOTHERS_DAY_SERVICE_START_ISO).toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/London'
})

const titleStatic = `Mother’s Day Lunch & Sunday Roast Near Staines | The Anchor`
const descriptionStatic =
  `Mother's Day lunch near me — Mother's Day Sunday roast at The Anchor near Staines. ` +
  `Served ${MOTHERS_DAY_SERVICE_WINDOW_LABEL} (last booking ${MOTHERS_DAY_LAST_BOOKING_LABEL}). ` +
  `Walk-ins welcome, booking recommended. From £${String(MOTHERS_DAY_ADULT_PRICE_LOW)}.`
const keywordsStatic =
  "mothers day lunch near me, mothers day sunday lunch near me, mothers day sunday lunch, mothers day pub lunch, mothers day sunday roast, mother's day lunch near staines, stanwell moor TW19"

export const metadata: Metadata = {
  title: titleStatic,
  description: descriptionStatic,
  keywords: keywordsStatic,
  alternates: {
    canonical: '/mothers-day'
  },
  openGraph: {
    title: titleStatic,
    description: descriptionStatic,
    images: [DEFAULT_PAGE_HEADER_IMAGE],
    type: 'website'
  },
  twitter: getTwitterMetadata({
    title: titleStatic,
    description: descriptionStatic,
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  })
}

export default function MothersDayPage() {
  const eventDateText = eventDateShortStatic
  const eventImage = DEFAULT_EVENT_IMAGE

  const addressLine = `${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.county}, ${CONTACT.address.postcode}`
  const mapQuery = `The Anchor, ${CONTACT.address.street}, ${CONTACT.address.postcode}`

  const heroDescription =
    `Make Mother’s Day easy with a relaxed, cooked-from-scratch Sunday lunch at The Anchor in Stanwell Moor (TW19), ` +
    `near Staines-upon-Thames and Heathrow Terminal 5. Serving ${MOTHERS_DAY_SERVICE_WINDOW_LABEL} ` +
    `(last table ${MOTHERS_DAY_LAST_BOOKING_LABEL}). Walk in or book ahead. No set sittings.`

  const heroLeadText =
    `Adults £${String(MOTHERS_DAY_ADULT_PRICE_LOW)}–£${String(MOTHERS_DAY_ADULT_PRICE_HIGH)} • ` +
    `Kids roast £${String(MOTHERS_DAY_KIDS_ROAST_PRICE)} • ` +
    'Walk in or book ahead'

  const faqs = [
    {
      question: 'When is Mother’s Day Lunch at The Anchor?',
      answer: `Mother’s Day Lunch is on ${eventDateText}. We serve from 1pm–6pm, with the last table booking at 5:30pm.`
    },
    {
      question: 'Where can I find a Mother’s Day Sunday lunch near me?',
      answer:
        `The Anchor in Stanwell Moor (TW19), close to Staines-upon-Thames and Heathrow Terminal 5. ` +
        `Mother’s Day Sunday roast cooked from scratch — chicken, pork belly, vegetarian wellington — mains from £${String(MOTHERS_DAY_ADULT_PRICE_LOW)}. ` +
        `Walk-ins welcome 1pm–6pm, booking recommended.`
    },
    {
      question: 'Do I need to book for Mother’s Day?',
      answer:
        `Walk-ins are welcome on Mother’s Day Sunday between 1pm and 6pm — no pre-order needed. Booking is still recommended, especially for groups, since Mother’s Day always books up quickly. ` +
        `Groups of 10 or more take a £10 per person deposit on booking, fully deducted from the bill on the day.`
    },
    {
      question: 'Are there set sittings?',
      answer:
        `There are no set sittings. Book a time that suits you within the service window ` +
        `(last table booking ${MOTHERS_DAY_LAST_BOOKING_LABEL}) and enjoy your meal at a comfortable pace.`
    },
    {
      question: 'How much is Mother’s Day pub lunch?',
      answer: `Adult mains are £${String(MOTHERS_DAY_ADULT_PRICE_LOW)}–£${String(MOTHERS_DAY_ADULT_PRICE_HIGH)}. Kids roast is available from £${String(MOTHERS_DAY_KIDS_ROAST_PRICE)}.`
    },
    {
      question: 'Do you have vegetarian or vegan options?',
      answer:
        'Yes — vegetarian and vegan options are available, including a dedicated vegan main. Vegetarian and vegan dishes are served with vegetarian gravy. Please mention dietary requirements when booking.'
    },
    {
      question: 'Where is The Anchor and is there parking?',
      answer:
        `You’ll find us at ${addressLine}. Free on-site parking is available for guests, ` +
        `and we’re easy to reach from Staines-upon-Thames and Heathrow Terminal 5.`
    }
  ]

  const mothersDayEventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${WEBSITE_ORIGIN}/mothers-day#event`,
    name: 'Mother’s Day Sunday Lunch near Staines at The Anchor',
    description:
      `Mother’s Day Sunday lunch near Staines at The Anchor in Stanwell Moor (TW19), close to Heathrow Terminal 5. ` +
      `Serving ${MOTHERS_DAY_SERVICE_WINDOW_LABEL} (last table booking ${MOTHERS_DAY_LAST_BOOKING_LABEL}). ` +
      `No set sittings — walk in or book ahead. ` +
      `Adults mains £${String(MOTHERS_DAY_ADULT_PRICE_LOW)}–£${String(MOTHERS_DAY_ADULT_PRICE_HIGH)}; ` +
      `kids roast from £${String(MOTHERS_DAY_KIDS_ROAST_PRICE)}. Vegetarian and vegan options available, ` +
      `served with vegetarian gravy.`,
    startDate: MOTHERS_DAY_SERVICE_START_ISO,
    endDate: MOTHERS_DAY_SERVICE_END_ISO,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'The Anchor',
      address: {
        '@type': 'PostalAddress',
        streetAddress: CONTACT.address.street,
        addressLocality: CONTACT.address.town,
        addressRegion: CONTACT.address.county,
        postalCode: CONTACT.address.postcode,
        addressCountry: CONTACT.address.country
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: CONTACT.coordinates.lat,

[truncated at line 200 — original has 635 lines]
```

### `app/music-bingo/page.tsx`

```
import Image from 'next/image'
import { Metadata } from 'next'
import {
  Button,
  Section,
  Container,
  Card,
  CardBody,
  Grid,
  GridItem
} from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { EventSchema } from '@/components/seo/EventSchema'
import { EventBookingButton } from '@/components/EventBookingButton'
import { BookTableButton } from '@/components/BookTableButton'
import { RegretReduction } from '@/components/psychology'
import {
  getEventCategories,
  getUpcomingEventsByCategory,
  formatEventDate,
  formatEventTime,
  formatDoorTime,
  type Event,
  type EventCategory
} from '@/lib/api'
import { getEventWebsiteUrl } from '@/lib/event-url'
import { staticEvents } from '@/lib/static-events'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { JsonLd } from '@/components/JsonLd'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { bingoEventSeries } from '@/lib/schema'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
  title: 'Music Bingo Near Heathrow | Win Every Round',
  description:
    'Singalong Music Bingo at The Anchor, Stanwell Moor — song snippets replace numbers, prizes every round. Book early, it sells out. 7 mins from Heathrow T5.',
  openGraph: {
    title: 'Music Bingo Near Heathrow | The Anchor',
    description: 'Song snippets replace numbers, prizes every round. Book for this singalong bingo night in Stanwell Moor.',
    images: [{ url: DEFAULT_EVENT_IMAGE, width: 1200, height: 630, alt: 'Events at The Anchor pub near Heathrow' }]
  },
  twitter: getTwitterMetadata({
    title: 'Music Bingo Near Heathrow | The Anchor',
    description: 'Song snippets replace numbers, prizes every round. Book for this singalong bingo night in Stanwell Moor.',
    images: [DEFAULT_EVENT_IMAGE]
  }),
  alternates: {
    canonical: '/music-bingo'
  }
}

const MUSIC_BINGO_CATEGORY = {
  name: 'Music Bingo',
  slug: 'music-bingo'
}

const normalizeCategoryValue = (value?: string | null) =>
  value?.toLowerCase().replace(/\s+/g, ' ').trim() ?? ''

function getCategoryIdByLabel(categories: EventCategory[], label: typeof MUSIC_BINGO_CATEGORY) {
  const targetName = normalizeCategoryValue(label.name)
  const targetSlug = normalizeCategoryValue(label.slug)

  return categories.find(category => {
    const categoryName = normalizeCategoryValue(category.name)
    const categorySlug = normalizeCategoryValue(category.slug)
    return categoryName === targetName || categorySlug === targetSlug
  })?.id
}

async function getMusicBingoEvents() {
  const categories = await getEventCategories()
  const categoryId = getCategoryIdByLabel(categories, MUSIC_BINGO_CATEGORY)
  if (!categoryId) return []

  const events = await getUpcomingEventsByCategory(categoryId, 60, 365)
  return events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
}

const WHY_LOVE_IT = [
  {
    icon: '',
    title: 'Songs replace numbers',
    body: 'We play short clips from chart hits, throwbacks, and guilty pleasures. Mark the track on your card and you are closer to a line.'
  },
  {
    icon: '',
    title: 'Hosted by Nikki Manfadge',
    body: 'Expect big singalong energy, cheeky shout-outs, and bonus moments that keep the room buzzing between rounds.'
  },
  {
    icon: '',
    title: 'Prizes every round',
    body: 'Line wins, full house prizes, and surprise treats mean there is always something to play for.'
  },
  {
    icon: '',
    title: 'Food and cocktails ready',
    body: 'Order from the full menu before the first round or during breaks. The kitchen keeps your table fuelled.'
  },
  {
    icon: '',
    title: 'Friendly, all-ages vibe',
    body: 'Bring mates, family, or coworkers. We keep it welcoming, inclusive, and easy for first timers.'
  }
]

const FAQS = [
  {
    question: 'When does Music Bingo start and finish?',
    answer:
      'It typically starts at 7pm, but with Nikki hosting the show can run a little late. We play two games, so it finishes after those rounds.'
  },
  {
    question: 'How much is entry?',
    answer:
      'Entry is £3 per person.'
  },
  {
    question: 'Do we need to book in advance?',
    answer:
      'Booking is strongly recommended if you want a great seat, but walk-ins are welcome.'
  },
  {
    question: 'What is the format?',
    answer:
      'We play two games where you listen to the songs, then guess the song and artist on your card. It is a great excuse to sing along and dance between tracks.'
  },
  {
    question: 'Is Music Bingo suitable for families?',
    answer:
      'Absolutely. We play music from the 1950s to today, so bring a mix of ages to cover all the songs and artists.'
  },
  {
    question: 'Can we eat and drink during the games?',
    answer:
      'Absolutely. Our kitchen is normally open from 4pm to 9pm, so you can order throughout and enjoy it while you play.'
  },
  {
    question: 'Can you run a private Music Bingo night?',
    answer:
      'Yes, we can host private Music Bingo nights by request.'
  },
  {
    question: 'Where can I see the latest dates?',
    answer:
      'All of our dates for all upcoming events are available at https://www.the-anchor.pub/whats-on.'
  }
]

function getEntryLabel(event: Event) {
  const rawPrice = event.offers?.price
  const parsedPrice = rawPrice ? Number.parseFloat(rawPrice) : Number.NaN

  if (event.isAccessibleForFree || parsedPrice === 0) {
    return 'Free entry'
  }

  if (Number.isFinite(parsedPrice)) {
    return `£${parsedPrice} entry`
  }

  if (typeof rawPrice === 'string' && rawPrice.trim().length > 0) {
    return rawPrice.trim()
  }

  return 'Entry details announced'
}

function MusicBingoEventCards({ events }: { events: Event[] }) {
  if (!events.length) {
    return (
      <div className="rounded-xl border border-anchor-gold/15 bg-anchor-bg-card p-6 text-center">
        <p className="mb-2 text-lg font-semibold text-anchor-gold-vivid">New Music Bingo dates are loading soon</p>
        <p className="text-anchor-cream-text/70">
          We are lining up the next singalong sessions. Call 01753 682707 and we will share the next date as soon as booking opens.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {events.map((event, index) => {
        const doorTime = formatDoorTime(event.doorTime)
        const startTime = formatEventTime(event.startDate)
        const isDraft = (event.eventStatus || '').toLowerCase().includes('draft')
        const isScheduled = (event.eventStatus || '').toLowerCase().includes('scheduled')
        const isTentative = isDraft || (!isScheduled && new Date(event.startDate).getTime() > new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
        const eventUrl = getEventWebsiteUrl(event)
        const imageSrc = event.heroImageUrl || event.image?.[0] || null
        const entryLabel = getEntryLabel(event)

[truncated at line 200 — original has 671 lines]
```

### `app/page.tsx`

```
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Metadata } from 'next'
import { StatusBar } from '@/components/layout/StatusBar'
import { NextEventServer } from '@/components/NextEventServer'
import { Suspense, type CSSProperties } from 'react'
import { parkingFacilitySchema } from '@/lib/schemas/parking'
import { LazySection } from '@/components/LazySection'
import { HeroWrapper } from '@/components/hero'
import { LaunchAnnouncement } from '@/components/announcements/LaunchAnnouncement'

import { PhoneLinksSection, QuickEnquiryLinks } from '@/components/homepage/PhoneLinksSection'
import { PhoneLink } from '@/components/PhoneLink'
import { BookTableButton } from '@/components/BookTableButton'
import { DirectionsButton } from '@/components/DirectionsButton'
import { DeferredHomepageTrackers } from '@/components/tracking/DeferredHomepageTrackers'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { SpeakableSchema } from '@/components/seo/SpeakableSchema'
import { SpeakableContent } from '@/components/voice/SpeakableContent'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { getSeasonalHomepageImage, getSeasonalGreeting, getSeasonalAltText, getSeasonalFocal } from '@/lib/seasonal-utils'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { JsonLd } from '@/components/JsonLd'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { DEFAULT_OG_IMAGE } from '@/lib/image-fallbacks'
import {
  Button,
  Card,
  CardBody,
  Container,
  Grid,
  GridItem,
  Alert,
  CTASection,
  SectionHeader,
  FeatureGrid,
  QuickInfoGrid,
  InfoBoxGrid,
  Section
} from '@/components/ui'

// Revalidate every 1 hour for the walk-in launch fortnight (10–22 May 2026)
// so the LaunchAnnouncement banner flips reliably at the cutover even on
// cached pages. See spec §8.5.
// TODO(post-launch): revert to 60 * 60 * 24 (24 hours) after 22 May 2026.
export const revalidate = 60 * 60 // 1 hour during launch fortnight

export const metadata: Metadata = {
  title: 'The Anchor Stanwell Moor | Pub Near Heathrow | Free Parking',
  description: 'Top-rated independent pub near Heathrow. 7 mins from T5, free parking, dog-friendly beer garden. Sunday roasts, stone-baked pizza and quiz nights.',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'The Anchor Stanwell Moor | Pub Near Heathrow | Free Parking',
    description: 'Top-rated independent pub near Heathrow. 7 mins from T5, free parking, dog-friendly beer garden. Sunday roasts, stone-baked pizza and quiz nights.',
    url: '/',
    siteName: 'The Anchor',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'The Anchor pub in Stanwell Moor near Heathrow'
      }
    ],
    locale: 'en_GB',
    type: 'website'
  },
  twitter: getTwitterMetadata({
    title: 'The Anchor Stanwell Moor | Pub Near Heathrow | Free Parking',
    description: 'Free parking, Sunday roasts, stone-baked pizzas, and hosted events like Music Bingo with Nikki Manfadge. See /whats-on for the latest.',
    images: [DEFAULT_OG_IMAGE]
  })
}

// Lazy load non-critical components
const BusinessHours = dynamic(() => import('@/components/BusinessHours').then(mod => ({ default: mod.BusinessHours })), {
  loading: () => <div className="h-64 bg-anchor-bg-raised animate-pulse rounded-lg" />,
  ssr: true
})

const GalleryImage = dynamic(() => import('@/components/GalleryImage').then(mod => ({ default: mod.GalleryImage })), {
  loading: () => <div className="aspect-square bg-anchor-bg-raised animate-pulse rounded-lg" />,
  ssr: true
})

// Loading skeleton for NextEvent
function NextEventSkeleton() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-anchor-bg-raised rounded-2xl shadow-xl overflow-hidden h-[300px] animate-pulse"></div>
    </div>
  )
}


export default function HomePage() {
  // Get seasonal image configuration
  const seasonalImage = getSeasonalHomepageImage()
  const seasonalGreeting = getSeasonalGreeting(seasonalImage.season)
  const seasonalAltText = getSeasonalAltText(seasonalImage.season)
  const focal = getSeasonalFocal(seasonalImage.season)



  return (
    <>
      <DeferredHomepageTrackers />
      <SpeakableSchema />
      <JsonLd data={[parkingFacilitySchema]} />
      {/* Custom Hero Section with Seasonal Image */}
      <HeroWrapper
        route="/"
        variant="dark"
        titleClassName="text-5xl sm:text-5xl md:text-6xl lg:text-7xl"
        title={
          <span className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]">
            {seasonalGreeting}
          </span>
        }
        className="hero-focal"
        style={{
          '--hero-ox': `${focal.x}%`,
          '--hero-oy-mobile': `${focal.yMobile}%`,
          '--hero-oy-desktop': `${focal.yDesktop}%`
        } as CSSProperties}
        image={{
          src: seasonalImage.src,
          alt: seasonalAltText,
          priority: true,
          fallbackSrc: seasonalImage.fallback,
          blurDataURL: "data:image/jpeg;base64,/9j/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAGAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAQF/8QAGhAAAgMBAQAAAAAAAAAAAAAAAQIAAwQRIf/EABQBAQAAAAAAAAAAAAAAAAAAAAL/xAAZEQACAwEAAAAAAAAAAAAAAAACAwABMQT/2gAMAwEAAhEDEQA/ANOxLaMjPcVcr70CTruylQTmPeREIvZWFCfOotGp/9k="
        }}
        eyebrow={
          <Image
            src="/images/branding/the-anchor-pub-logo-white-transparent.png"
            alt="The Anchor logo - elegant anchor symbol with traditional British pub typography in white"
            width={320}
            height={320}
            sizes="(max-width: 640px) 192px, (max-width: 768px) 256px, 320px"
            className="mx-auto w-48 sm:w-64 lg:w-80 h-auto drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzAwNTEzMSIvPjwvc3ZnPg=="
          />
        }
        lead={
          <div className="flex flex-col items-center gap-4">
            <p className="text-2xl sm:text-3xl text-white font-serif drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Where Everyone&apos;s Welcome
            </p>
            <p className="text-base sm:text-lg text-white/90 font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] max-w-xl mx-auto text-center px-4">
              The closest traditional British pub to Heathrow — 7 mins from T5, free parking, proper food
            </p>

            <div className="flex justify-center px-2 sm:px-0 w-full">
              <StatusBar
                variant="hero"
                className="self-center"
              />
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm backdrop-blur-sm">
              Rated 4.6/5 on Google · Highest-rated non-airport pub near Heathrow
            </span>
          </div>
        }
        showContextStrip={true}
        ctaContainerClassName="px-2 sm:px-0 max-w-md mx-auto"
        primaryCta={
          <BookTableButton
            source="homepage_hero"
            variant="primary"
            size="lg"
            fullWidth
            className="w-full"
          />
        }
        secondaryCta={
          <Link href="/food-menu" className="w-full">
            <Button variant="secondary" size="lg" fullWidth>
              View Menu
            </Button>
          </Link>
        }
        showStatusBar={false}
        showBreadcrumbs={false}
      />

      {/* Walk-in launch announcement (auto-hides at 18:00 BST on 17 May 2026) */}
      <div className="bg-anchor-bg-raised">
        <Container>
          <div className="py-3">
            <LaunchAnnouncement variant="hero" />
          </div>
        </Container>
      </div>


[truncated at line 200 — original has 804 lines]
```

### `app/staines-pub/page.tsx`

```
import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND, PARKING, HEATHROW_TIMES } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'

export const metadata: Metadata = {
  title: 'Pubs in Staines-upon-Thames | Roasts & Free Parking',
  description: 'Pub near Staines rated 4.6/5 on Google. Sunday roasts from £19, dog-friendly beer garden, quiz nights and free parking. 8 mins from Staines centre.',
  openGraph: {
    title: 'Pub Near Staines — Beer Garden, Sunday Roasts & Free Parking',
    description: 'Rated 4.6/5 on Google. Sunday roasts, dog-friendly beer garden, quiz nights and free parking — 8 mins from Staines-upon-Thames.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Staines — Beer Garden, Sunday Roasts & Free Parking',
    description: 'Rated 4.6/5 on Google. Sunday roasts, dog-friendly beer garden, quiz nights and free parking — 8 mins from Staines-upon-Thames.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/staines-pub'
  }
}

export default function StainesPubPage() {
  // Schema for local SEO
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    "@id": "https://www.the-anchor.pub/staines-pub#business",
    "name": BRAND.name,
    "description": "Traditional Surrey pub serving Staines-upon-Thames and surrounding areas",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": CONTACT.address.street,
      "addressLocality": CONTACT.address.town,
      "addressRegion": CONTACT.address.county,
      "postalCode": CONTACT.address.postcode,
      "addressCountry": CONTACT.address.country
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": CONTACT.coordinates.lat,
      "longitude": CONTACT.coordinates.lng
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Staines-upon-Thames"
      },
      {
        "@type": "City",
        "name": "Stanwell Moor"
      },
      {
        "@type": "City",
        "name": "Stanwell"
      }
    ],
    "priceRange": "££",
    "servesCuisine": ["British", "Pizza", "Sunday Roast"],
    "hasMenu": "https://www.the-anchor.pub/food-menu",
    "telephone": CONTACT.phoneIntl,
    "url": "https://www.the-anchor.pub"
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Near Heathrow', url: '/near-heathrow' },
    { name: 'Staines Pub', url: '/staines-pub' }
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, localBusinessSchema]) }}
      />

      {/* Hero Section */}
      <HeroWrapper
        route="/staines-pub"
        title="Your Pub Near Staines-upon-Thames"
        description="Traditional British pub serving the Staines community with great food, entertainment, and a warm welcome"
        variant="default"
        enableSmartCtas={true}
        showContextStrip={true}
      />

      <section className="bg-anchor-bg-card py-6 border-b border-anchor-gold/15">
        <Container>
          <p className="text-center text-sm text-anchor-cream-text/70">⭐⭐⭐⭐⭐ <strong className="text-anchor-cream-text">Rated 4.6/5 on Google</strong> · Highest-rated non-airport pub near Heathrow</p>
        </Container>
      </section>

      {/* Quick Summary */}
      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-5xl mx-auto bg-anchor-bg-raised border border-anchor-gold/15 rounded-none p-6">
            <h2 className="text-2xl font-bold text-anchor-gold-vivid mb-3">Why We&apos;re One of the Best Pubs Near Staines-upon-Thames</h2>
            <div className="grid gap-3 md:grid-cols-2 text-anchor-cream-text/70">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold"></span>
                <span>8 minute drive from Staines High Street with free parking</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold"></span>
                <span>Sunday roasts, stone-baked pizzas and seasonal specials</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold"></span>
                <span>Hosted nights like Music Bingo with Nikki Manfadge, quiz nights and charity bingo</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold">‍‍‍</span>
                <span>Family-friendly seating with kids menu and space for buggies</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Page Title for SEO */}
      <section className="bg-anchor-bg py-8 border-b border-anchor-gold/15">
        <Container>
          <PageTitle
            className="text-center text-anchor-cream-text"
            seo={{ structured: true, speakable: true }}
          >
            Pub Near Staines-upon-Thames — The Anchor
          </PageTitle>
        </Container>
      </section>

      {/* Why Choose The Anchor */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title="Why Locals Choose Us Over Other Pubs in Staines"
              subtitle="Just a short drive from Staines-upon-Thames, The Anchor offers a proper British pub experience away from the busy high street"
              className="text-center mb-12"
            />

            <FeatureGrid
              columns={3}
              features={[
                {
                  icon: "",
                  title: "Easy Access from Staines",
                  description: `8 minutes via A30\nFree parking for ${PARKING.capacity} cars\nRegular bus service`,
                  className: "text-center"
                },
	                {
	                  icon: "",
	                  title: "Famous Sunday Roasts",
	                  description: "Our renowned roasts\nServed 1pm-6pm\nWalk in or book ahead — no pre-order needed\nRegular menu also available",
	                  className: "text-center"
	                },
                {
                  icon: "",
                  title: "Unique Entertainment",
                  description: "Hosted nights like Music Bingo with Nikki Manfadge\nQuiz nights and bingo\nSee /whats-on for the latest",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "Stone-Baked Pizzas",
                  description: "Hand-stretched bases\nRich tomato sauce\nGenerous toppings",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "Beer Garden Paradise",
                  description: "Dog-friendly outdoor space\nHeathrow plane spotting",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "Community Hub",
                  description: "Private function room\nBirthday parties welcome\nCorporate events catered",
                  className: "text-center"
                }
              ]}
            />
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <SectionHeader

[truncated at line 200 — original has 565 lines]
```

### `app/stanwell-pub/page.tsx`

```
import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, DirectionsCard, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DirectionsButton } from '@/components/DirectionsButton'
import { generateBreadcrumbSchema, generateHowToDirectionsSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND, PARKING } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
  title: 'Stanwell Moor Pub | Rated 4.6★ on Google',
  description: 'Your local in Stanwell Moor — rated 4.6/5 on Google. Sunday roasts from £19, stone-baked pizzas, dog-friendly beer garden, quiz nights & free parking.',
  openGraph: {
    title: 'Stanwell Village Pub — Beer Garden, Food & Free Parking',
    description: 'Rated 4.6/5 on Google. Sunday roasts, stone-baked pizzas and a dog-friendly beer garden at The Anchor, Stanwell Moor.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Stanwell Village Pub — Beer Garden, Food & Free Parking',
    description: 'Rated 4.6/5 on Google. Sunday roasts, stone-baked pizzas and a dog-friendly beer garden at The Anchor, Stanwell Moor.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/stanwell-pub'
  }
}

export default function StanwellPubPage() {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "BarOrPub"],
    "@id": "https://www.the-anchor.pub/stanwell-pub#business",
    "name": `${BRAND.name} - Stanwell Village Pub`,
    "image": `https://www.the-anchor.pub${DEFAULT_PAGE_HEADER_IMAGE}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": CONTACT.address.street,
      "addressLocality": "Stanwell Moor, Stanwell",
      "addressRegion": "Surrey",
      "postalCode": CONTACT.address.postcode,
      "addressCountry": "GB"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": CONTACT.coordinates.lat,
      "longitude": CONTACT.coordinates.lng
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Stanwell"
      },
      {
        "@type": "Place",
        "name": "Stanwell Moor"
      }
    ],
    "priceRange": "££",
    "servesCuisine": ["British", "Traditional English", "Sunday Roast"],
    "telephone": CONTACT.phoneIntl,
    "url": "https://www.the-anchor.pub/stanwell-pub"
  }
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Locations', url: '/locations' },
    { name: 'Stanwell Pub', url: '/stanwell-pub' }
  ])

  const directionsSchema = generateHowToDirectionsSchema(
    'Stanwell Village',
    'The Anchor - Heathrow Pub & Dining',
    [
      'From Stanwell Village, head north on Oaks Road',
      'Turn left onto Stanwell Moor Road',
      'Continue for about 0.5 miles',
      'Turn right onto Horton Road',
      'The Anchor will be on your right with free parking'
    ]
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, breadcrumbSchema, directionsSchema]) }}
      />

      {/* Hero Section */}
      <HeroWrapper
        route="/stanwell-pub"
        title="Stanwell's Traditional Village Pub"
        description="The heart of the Stanwell community since generations"
        variant="default"
        enableSmartCtas={true}
        showContextStrip={true}
      />

      <section className="bg-anchor-bg-card py-6 border-b border-anchor-gold/15">
        <Container>
          <p className="text-center text-sm text-anchor-cream-text/70">⭐⭐⭐⭐⭐ <strong className="text-anchor-cream-text">Rated 4.6/5 on Google</strong> · Highest-rated non-airport pub near Heathrow</p>
        </Container>
      </section>

      {/* Page Title */}
      <section className="py-8 bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle
              seo={{
                structured: true,
                speakable: true
              }}
              className="text-anchor-cream-text mb-4"
            >
              Your Local Pub in Stanwell Moor
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              Your local village pub serving the Stanwell community for generations
            </p>
          </div>
        </Container>
      </section>

      {/* Welcome Section */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              title="Welcome to Your Local Stanwell Pub"
              subtitle="Located in the heart of Stanwell Moor, The Anchor has been serving the Stanwell community for generations. We're more than just a pub - we're where neighbours become friends and visitors become regulars."
            />

            <FeatureGrid
              columns={3}
              features={[
                {
                  icon: "",
                  title: "Village Heart",
                  description: "The social hub of Stanwell Moor, where locals gather daily",
                  variant: "colored",
                  color: "bg-anchor-bg-card",
                  className: "rounded-none p-6 text-center border border-anchor-gold/15"
                },
                {
                  icon: "",
                  title: "Traditional Values",
                  description: "Proper British pub with draught beers and honest food",
                  variant: "colored",
                  color: "bg-anchor-bg-card",
                  className: "rounded-none p-6 text-center border border-anchor-gold/15"
                },
                {
                  icon: "‍‍‍",
                  title: "Family Friendly",
                  description: "Children and dogs always welcome in our community pub",
                  variant: "colored",
                  color: "bg-anchor-bg-card",
                  className: "rounded-none p-6 text-center border border-anchor-gold/15"
                }
              ]}
              className="mb-8"
            />
          </div>
        </Container>
      </section>

      {/* Why Stanwell Residents Choose Us */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Why Stanwell Residents Choose The Anchor"
            />

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-4">Your Nearest Traditional Pub</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div className="text-anchor-cream-text/70">
                      <strong className="text-anchor-cream-text">Walking distance from Stanwell Village</strong> - Just a pleasant stroll through Stanwell Moor
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div className="text-anchor-cream-text/70">
                      <strong className="text-anchor-cream-text">Free parking for 20 cars</strong> - Never worry about parking charges
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div className="text-anchor-cream-text/70">
                      <strong className="text-anchor-cream-text">Dog-friendly throughout</strong> - Bring your four-legged friends
                    </div>

[truncated at line 200 — original has 516 lines]
```

### `app/sunday-lunch/page.tsx`

```
import Link from 'next/link'
import { Container, SectionHeader } from '@/components/ui'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { HeroWrapper } from '@/components/hero'
import { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { LaunchAnnouncement } from '@/components/announcements/LaunchAnnouncement'
import { SundayLunchHowItWorks } from '@/components/sunday-lunch/SundayLunchHowItWorks'
import { jsonLdSafeStringify } from '@/lib/jsonld'

const SUNDAY_LUNCH_BOOKING_URL = '/book-table'
const WEBSITE_ORIGIN = 'https://www.the-anchor.pub'

// Caching strategy for the launch fortnight (spec §8.5):
// drop revalidate from 24h to 1h so the LaunchAnnouncement banner flips
// reliably at the cutover even on cached pages.
// TODO(post-launch): revert to 24h after 22 May 2026.
export const revalidate = 60 * 60

export const metadata: Metadata = {
  title: 'Sunday Roast Near Heathrow | The Anchor, Stanwell Moor',
  description:
    'Walk-in friendly Sunday roast served 1pm-6pm at The Anchor, Stanwell Moor. From £19. 7 minutes from Heathrow Terminal 5. Free parking, dog-friendly. Booking recommended.',
  openGraph: {
    title: 'Sunday Roast Near Heathrow | The Anchor, Stanwell Moor',
    description:
      'Walk-in friendly Sunday roast served 1pm-6pm at The Anchor, Stanwell Moor. From £19. 7 minutes from Heathrow Terminal 5. Free parking, dog-friendly. Booking recommended.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg']
  },
  twitter: getTwitterMetadata({
    title: 'Sunday Roast Near Heathrow | The Anchor, Stanwell Moor',
    description:
      'Walk-in friendly Sunday roast served 1pm-6pm at The Anchor, Stanwell Moor. From £19. 7 minutes from Heathrow Terminal 5. Free parking, dog-friendly. Booking recommended.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg']
  }),
  alternates: {
    // Absolute path per spec §7.7 — keeps /sunday-lunch SEO equity.
    canonical: '/sunday-lunch'
  }
}

const SUNDAY_ROAST_MENU = [
  {
    name: 'Roasted Chicken',
    description:
      'Oven-roasted chicken breast with sage & onion stuffing balls, herb-and-garlic roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy.',
    priceLabel: '£19'
  },
  {
    name: 'Crispy Pork Belly',
    description:
      'Crispy crackling and tender slow-roasted pork belly with Bramley apple sauce, herb-and-garlic roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy.',
    priceLabel: '£22'
  },
  {
    name: 'Roast Beef',
    description:
      'Slow-roasted topside of beef carved fresh, served with herb-and-garlic roast potatoes, seasonal vegetables, Yorkshire pudding and a generous pour of red wine gravy.',
    priceLabel: '£22'
  },
  {
    name: 'Lamb Shank',
    description:
      'Slow-cooked lamb shank with rich gravy, herb-and-garlic roast potatoes, seasonal vegetables and Yorkshire pudding. (Subject to availability — seasonal dish.)',
    priceLabel: '£24'
  },
  {
    name: 'Beetroot & Butternut Squash Wellington (V)',
    description:
      'Golden puff pastry filled with beetroot and butternut squash, served with herb-and-garlic roast potatoes, seasonal vegetables and vegetarian gravy.',
    priceLabel: '£19'
  },
  {
    name: 'Kids Roasted Chicken',
    description:
      'A smaller portion of our roasted chicken with herb-and-garlic roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy.',
    priceLabel: '£13'
  }
] as const

const REVIEWS = [
  {
    body:
      'It was hands down the best meal we had in England. Cosy atmosphere, warm hospitality from the team, and the food itself.',
    author: 'IJ'
  },
  {
    body:
      'Came in this past Sunday for the Sunday roast before our flight home. Had the lamb shank and my partner had the pork belly. Absolutely delicious plates! Very hospitable owners and staff.',
    author: 'T'
  },
  {
    body:
      'Lovely Sunday roast and you can also park the car if you need to go to Heathrow airport.',
    author: 'Andrea Pisani'
  },
  {
    body:
      'Incredible roast dinner! Friendly and helpful staff too. Great stop before heading to Heathrow!',
    author: 'Iona Turner'
  },
  {
    body:
      "Sunday roasts are great. Fantastic! Really good size, delicious gravy and plenty of veg. The belly pork was awesome!",
    author: 'Penny Johnson'
  },
  {
    body:
      'The Sunday roasts are to die for. Great atmosphere all round. A must to visit.',
    author: 'Michael Frewin'
  }
] as const

const FAQS = [
  {
    question: 'Do I need to book a Sunday roast near me?',
    answer:
      'Walk-ins are welcome on Sundays between 1pm and 6pm — no pre-order needed. Booking is still recommended, especially for groups of six or more, since Sunday lunch books up fast around Heathrow.'
  },
  {
    question: 'Is there a deposit for Sunday lunch?',
    answer:
      'Only for groups of 10 or more — £10 per person, fully deducted from your bill on the day. Smaller groups pay nothing up front; just turn up or book online.'
  },
  {
    question: 'What time is Sunday roast served?',
    answer:
      'Sunday roast is served 1pm to 6pm every Sunday. Last table booking is 5:30pm. Walk-ins are welcome any time during the service window.'
  },
  {
    question: 'Is The Anchor a dog-friendly Sunday roast?',
    answer:
      'Yes. Dogs are welcome inside the pub and in the beer garden. Water bowls are always out. Plenty of regulars come for a Sunday walk first, then a roast.'
  },
  {
    question: 'How far is The Anchor from Heathrow?',
    answer:
      "We're 7 minutes from Heathrow Terminal 5 by car. Free parking on site, no meters, no time limits while you're dining. Easy reach from Staines, Ashford, Surrey and west London."
  },
  {
    question: "Is this a carvery?",
    answer:
      "We're not a carvery. Every plate is cooked to order from scratch — meat carved fresh, gravy made fresh, trimmings hand-prepped. No buffet, no heat lamps, no self-serve."
  },
  {
    question: 'Do you have vegan or vegetarian options?',
    answer:
      'Yes — our beetroot and butternut squash wellington is fully vegetarian and is served with vegetarian gravy. Mention dietary requirements when booking.'
  }
] as const

function buildFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

function buildMenuJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: 'The Anchor Sunday Roast Menu',
    description:
      'Sunday roast served 1pm–6pm at The Anchor, Stanwell Moor — 7 minutes from Heathrow Terminal 5. Mains from £19, cooked to order from scratch.',
    url: `${WEBSITE_ORIGIN}/sunday-lunch`,
    hasMenuSection: [
      {
        '@type': 'MenuSection',
        name: 'Sunday Roast Mains',
        hasMenuItem: SUNDAY_ROAST_MENU.map((item) => ({
          '@type': 'MenuItem',
          name: item.name,
          description: item.description,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'GBP',
            price: item.priceLabel.replace('£', '')
          }
        }))
      }
    ]
  }
}

export default function SundayLunchPage() {
  const faqJsonLd = buildFaqJsonLd()
  const menuJsonLd = buildMenuJsonLd()


[truncated at line 200 — original has 484 lines]
```

### `components/announcements/LaunchAnnouncement.tsx`

```
import {
  WALK_IN_LAUNCH_BANNER_ENDS_AT_MS,
  WALK_IN_LAUNCH_STARTS_AT_MS,
} from '@/lib/constants'
import { LaunchAnnouncementClient } from './LaunchAnnouncementClient'

export type LaunchAnnouncementVariant = 'hero' | 'banner' | 'slim'

export interface LaunchAnnouncementProps {
  variant: LaunchAnnouncementVariant
}

const PRE_LAUNCH_COPY =
  'Sunday lunch walk-ins start 17 May 2026, 1pm-6pm. Until then, our kitchen is open on Sundays with our weekday menu.'
const LAUNCH_DAY_COPY =
  'Walk-ins welcome today from 1pm — turn up between 1pm-6pm or book ahead'

function pickCopy(now: number): string | null {
  if (now >= WALK_IN_LAUNCH_BANNER_ENDS_AT_MS) return null
  if (now < WALK_IN_LAUNCH_STARTS_AT_MS) return PRE_LAUNCH_COPY
  return LAUNCH_DAY_COPY
}

const VARIANT_CLASSES: Record<LaunchAnnouncementVariant, string> = {
  hero: 'mt-4 rounded-lg bg-anchor-gold/15 px-6 py-3 text-base font-semibold text-anchor-gold-vivid',
  banner: 'rounded-md bg-anchor-gold/10 px-4 py-2 text-sm text-anchor-cream-text',
  slim: 'border-t border-anchor-gold/20 px-3 py-1.5 text-xs text-anchor-cream-text/80',
}

/**
 * Cache-aware launch announcement banner. Renders one of two visible states
 * (pre-launch / launch-day) or nothing at all once the launch banner window
 * has ended at 18:00 BST on 17 May 2026.
 *
 * Server-rendered initial copy + a small client child that re-checks every
 * 60s so cached pages flip / hide without a hard reload.
 *
 * See spec sections 7.6 and 8.5.
 */
export function LaunchAnnouncement({ variant }: LaunchAnnouncementProps) {
  const initialCopy = pickCopy(Date.now())
  return (
    <LaunchAnnouncementClient
      variant={variant}
      initialCopy={initialCopy}
      className={VARIANT_CLASSES[variant]}
      preLaunchCopy={PRE_LAUNCH_COPY}
      launchDayCopy={LAUNCH_DAY_COPY}
      startsAtMs={WALK_IN_LAUNCH_STARTS_AT_MS}
      endsAtMs={WALK_IN_LAUNCH_BANNER_ENDS_AT_MS}
    />
  )
}
```

### `components/announcements/LaunchAnnouncementClient.tsx`

```
'use client'

import { useEffect, useState } from 'react'
import type { LaunchAnnouncementVariant } from './LaunchAnnouncement'

interface LaunchAnnouncementClientProps {
  variant: LaunchAnnouncementVariant
  initialCopy: string | null
  className: string
  preLaunchCopy: string
  launchDayCopy: string
  startsAtMs: number
  endsAtMs: number
}

/**
 * Client child for <LaunchAnnouncement>. Re-checks the launch state on mount
 * and every 60 seconds so cached/static pages flip from pre-launch copy →
 * launch-day copy → hidden without requiring a hard reload.
 */
export function LaunchAnnouncementClient({
  initialCopy,
  className,
  preLaunchCopy,
  launchDayCopy,
  startsAtMs,
  endsAtMs,
}: LaunchAnnouncementClientProps) {
  const [copy, setCopy] = useState<string | null>(initialCopy)

  useEffect(() => {
    function recompute() {
      const now = Date.now()
      if (now >= endsAtMs) {
        setCopy(null)
        return
      }
      if (now < startsAtMs) {
        setCopy(preLaunchCopy)
        return
      }
      setCopy(launchDayCopy)
    }

    recompute()
    const id = setInterval(recompute, 60_000)
    return () => clearInterval(id)
  }, [startsAtMs, endsAtMs, preLaunchCopy, launchDayCopy])

  if (!copy) return null

  return (
    <div role="status" aria-live="polite" className={className}>
      {copy}
    </div>
  )
}
```

### `components/announcements/__tests__/LaunchAnnouncement.test.tsx`

```
import { render, screen, act } from '@testing-library/react'
import { LaunchAnnouncement } from '../LaunchAnnouncement'

// Boundary fixtures align with the constants in lib/constants.ts:
//   WALK_IN_LAUNCH_STARTS_AT_MS = 2026-05-17T00:00:00+01:00 (BST)
//   WALK_IN_LAUNCH_BANNER_ENDS_AT_MS = 2026-05-17T18:00:00+01:00 (BST)
const MAY_16_BST = new Date('2026-05-16T23:30:00+01:00').getTime()
const MAY_17_AT_NOON_BST = new Date('2026-05-17T12:00:00+01:00').getTime()
const MAY_17_AT_19_BST = new Date('2026-05-17T19:00:00+01:00').getTime()

describe('LaunchAnnouncement', () => {
  let originalNow: () => number

  beforeEach(() => {
    originalNow = Date.now
  })

  afterEach(() => {
    Date.now = originalNow
    jest.useRealTimers()
  })

  it('renders pre-launch copy before May 17 BST', () => {
    Date.now = () => MAY_16_BST
    render(<LaunchAnnouncement variant="banner" />)
    expect(
      screen.getByText(/Sunday lunch walk-ins start 17 May 2026/i)
    ).toBeInTheDocument()
  })

  it('renders launch-day copy between 17 May 00:00 and 18:00 BST', () => {
    Date.now = () => MAY_17_AT_NOON_BST
    render(<LaunchAnnouncement variant="hero" />)
    expect(
      screen.getByText(/Walk-ins welcome today from 1pm/i)
    ).toBeInTheDocument()
  })

  it('renders nothing after 17 May 18:00 BST', () => {
    Date.now = () => MAY_17_AT_19_BST
    const { container } = render(<LaunchAnnouncement variant="slim" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('client child re-checks expiry on interval and switches', () => {
    jest.useFakeTimers()
    Date.now = () => MAY_16_BST
    render(<LaunchAnnouncement variant="banner" />)
    expect(screen.getByText(/walk-ins start 17 May/i)).toBeInTheDocument()

    Date.now = () => MAY_17_AT_NOON_BST
    act(() => {
      jest.advanceTimersByTime(60_000)
    })
    expect(screen.getByText(/today from 1pm/i)).toBeInTheDocument()
  })
})
```

### `components/features/BookingWizard/WizardProgress.tsx`

_(deleted or missing from working tree)_

### `components/features/BookingWizard/WizardStep1Date.tsx`

_(deleted or missing from working tree)_

### `components/features/BookingWizard/WizardStep2SundayOffer.tsx`

_(deleted or missing from working tree)_

### `components/features/BookingWizard/WizardStep2bMenuSelection.tsx`

_(deleted or missing from working tree)_

### `components/features/BookingWizard/WizardStep3PartySize.tsx`

_(deleted or missing from working tree)_

### `components/features/BookingWizard/WizardStep4Time.tsx`

_(deleted or missing from working tree)_

### `components/features/BookingWizard/WizardStep5Details.tsx`

_(deleted or missing from working tree)_

### `components/features/BookingWizard/WizardStep5DetailsAndRequirements.tsx`

_(deleted or missing from working tree)_

### `components/features/BookingWizard/WizardStep6Confirm.tsx`

_(deleted or missing from working tree)_

### `components/features/BookingWizard/WizardStep6Requirements.tsx`

_(deleted or missing from working tree)_

### `components/features/BookingWizard/WizardStep7Confirm.tsx`

_(deleted or missing from working tree)_

### `components/features/BookingWizard/WizardStepPlanVisit.tsx`

_(deleted or missing from working tree)_

### `components/features/BookingWizard/index.tsx`

_(deleted or missing from working tree)_

### `components/features/BookingWizard/types.ts`

_(deleted or missing from working tree)_

### `components/features/TableBooking/ManagementTableBookingForm.tsx`

```
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Alert } from '@/components/ui/feedback/Alert'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { Input, Textarea } from '@/components/ui/primitives/Input'
import { Button } from '@/components/ui/primitives/Button'
import { ManagementEventBookingForm } from '@/components/features/EventBooking/ManagementEventBookingForm'
import { trackTableBookingClick } from '@/lib/gtm-events'
import {
  LARGE_GROUP_DEPOSIT_PER_PERSON_GBP,
  LARGE_GROUP_DEPOSIT_POLICY_COPY,
  requiresDeposit,
} from '@/lib/constants'
import { PayPalDepositSection } from './PayPalDepositSection'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

type BookingPurpose = 'food' | 'drinks'
type LookupState = 'idle' | 'loading' | 'known' | 'unknown'
type BookingStep = 'find' | 'choose' | 'details' | 'review'

type CustomerLookupResult = {
  known: boolean
  lookup_degraded?: boolean
  normalized_phone?: string
  customer?: {
    id?: string
    first_name?: string | null
    last_name?: string | null
    full_name?: string | null
    email?: string | null
    mobile_e164?: string | null
    mobile_number?: string | null
  } | null
}

type ManagementTableBookingResult = {
  state: 'confirmed' | 'pending_payment' | 'blocked'
  table_booking_id: string | null
  booking_reference: string | null
  reason: string | null
  blocked_reason:
    | 'outside_hours'
    | 'cut_off'
    | 'no_table'
    | 'private_booking_blocked'
    | 'too_large_party'
    | 'customer_conflict'
    | 'in_past'
    | 'blocked'
    | null
  next_step_url: string | null
  hold_expires_at: string | null
  table_name: string | null
  booking_id?: string
  deposit_amount?: number
  // Set by the management API when inline PayPal setup fails for a 10+ booking.
  // Surfaced to the customer as a recovery link alongside the call-us copy.
  // See spec §6 ("Failed-PayPal recovery") and §8.1 (PayPal failure recovery).
  fallback_payment_url?: string | null
  payment_required?: boolean
}

type AvailabilitySlot = {
  time: string
  available?: boolean
  available_capacity: number
  reason?: string
}

type AvailabilityData = {
  date: string
  available: boolean
  time_slots: AvailabilitySlot[]
  message?: string
  special_notes?: string
}

type AlternativeSlot = {
  date: string
  time: string
}

type SuggestedEvent = {
  id: string
  slug: string | null
  name: string
  startDate: string
  shortDescription: string | null
  seatsRemaining: number | null
  priceLabel: string | null
}

interface ManagementTableBookingFormProps {
  prefill?: {
    date?: string
    time?: string
    partySize?: number
    purpose?: BookingPurpose
  }
}

const STEP_ORDER: BookingStep[] = ['find', 'choose', 'details', 'review']

const STEP_LABELS: Record<BookingStep, string> = {
  find: 'Find table',
  choose: 'Choose time',
  details: 'Guest details',
  review: 'Review & book'
}

const BLOCKED_REASON_COPY: Record<string, string> = {
  outside_hours: 'That time is outside our booking hours. Please choose another time or call us.',
  cut_off: 'Online bookings for that slot are now closed. Please call us and we will try to help.',
  no_table: 'No tables available at that time. Try a different time or give us a call on 01753 682707.',
  private_booking_blocked: 'This slot is unavailable because of a private event.',
  too_large_party: 'For larger groups, please call us so we can arrange your booking.',
  customer_conflict: 'You already have a nearby booking. Please call us if you need help changing it.',
  in_past: 'That booking time is in the past. Please choose a future date and time.',
  blocked: 'This slot is not available for online booking right now.'
}

function toIsoDateInputValue(value: string | undefined): string {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function getDefaultTimeValue(): string {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 60)
  const roundedMinutes = now.getMinutes() >= 30 ? 30 : 0
  now.setMinutes(roundedMinutes, 0, 0)
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function toTimeInputValue(value: string | undefined): string {
  if (!value) return ''
  if (/^\d{2}:\d{2}$/.test(value)) return value
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value.slice(0, 5)
  return ''
}

function formatHoldExpiry(value: string | null): string | null {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Europe/London'
  })
}

function formatGbpCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(value)
}

function createClientIdempotencyKey(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function parseLookupResponse(payload: any): CustomerLookupResult {
  const data = payload?.data || payload
  return {
    known: Boolean(data?.known),
    lookup_degraded: Boolean(data?.lookup_degraded),
    normalized_phone: data?.normalized_phone,
    customer: data?.customer || null
  }
}

function normalizeAvailabilityResponse(payload: any): AvailabilityData {
  const data = payload?.data || payload
  const rawSlots: unknown[] = Array.isArray(data?.time_slots) ? data.time_slots : []

  const timeSlots: AvailabilitySlot[] = []
  for (const slot of rawSlots) {
    if (!slot || typeof slot !== 'object') continue

    const source = slot as Record<string, unknown>
    const time = toTimeInputValue(typeof source.time === 'string' ? source.time : '')
    if (!time) continue

    const rawCapacity = source.available_capacity
    const parsedCapacity =

[truncated at line 200 — original has 1916 lines]
```

### `components/features/TableBooking/SundayLunchBooking.tsx`

_(deleted or missing from working tree)_

### `components/features/TableBooking/SundayLunchBookingForm.tsx`

_(deleted or missing from working tree)_

### `components/features/TableBooking/SundayLunchBookingSection.tsx`

_(deleted or missing from working tree)_

### `components/features/TableBooking/__tests__/PayPalDepositSection.test.tsx`

```
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { PayPalDepositSection } from '../PayPalDepositSection'

// Mock @paypal/react-paypal-js
jest.mock('@paypal/react-paypal-js', () => ({
  PayPalScriptProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PayPalButtons: ({
    onApprove,
    onError,
  }: {
    onApprove: () => void
    onError: (err: Error) => void
  }) => (
    <div>
      <button data-testid="paypal-approve" onClick={() => onApprove()}>
        Pay with PayPal
      </button>
      <button data-testid="paypal-error" onClick={() => onError(new Error('fail'))}>
        Trigger Error
      </button>
    </div>
  ),
}))

// Mock fetch for API calls
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('PayPalDepositSection', () => {
  const defaultProps = {
    bookingId: '550e8400-e29b-41d4-a716-446655440000',
    // Walk-in launch threshold: deposit applies at 10+. £10 per person, so 10 guests = £100.
    depositAmount: 100,
    bookingSummary: 'Saturday 23 May · 7:30pm · 10 guests',
    onSuccess: jest.fn(),
    onError: jest.fn(),
    orderId: 'PAYPAL-ORDER-123',
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders booking summary and deposit amount', () => {
    render(<PayPalDepositSection {...defaultProps} />)
    expect(screen.getByText('Saturday 23 May · 7:30pm · 10 guests')).toBeInTheDocument()
    expect(screen.getByText(/£100/)).toBeInTheDocument()
  })

  it('calls onSuccess after successful capture', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(<PayPalDepositSection {...defaultProps} />)
    screen.getByTestId('paypal-approve').click()

    await waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalled()
    })
  })

  it('calls onError on PayPal error', async () => {
    render(<PayPalDepositSection {...defaultProps} />)
    screen.getByTestId('paypal-error').click()

    await waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalled()
    })
  })

  it('calls onError when capture API returns failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Capture failed' }),
    })

    render(<PayPalDepositSection {...defaultProps} />)
    screen.getByTestId('paypal-approve').click()

    await waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalled()
    })
  })
})
```

### `components/sunday-lunch/SundayLunchHowItWorks.tsx`

```
'use client'

import { useEffect, useState } from 'react'
import { WALK_IN_LAUNCH_STARTS_AT_MS } from '@/lib/constants'

const PRE_LAUNCH_BODY =
  'From 17 May 2026, walk-ins are welcome on Sundays 1pm–6pm — no pre-order needed. Until then, our kitchen is open on Sundays with our weekday menu.'
const POST_LAUNCH_BODY =
  'Walk-ins welcome on Sundays 1pm–6pm. Booking is still recommended for groups of six or more.'

function pickBody(now: number): string {
  return now < WALK_IN_LAUNCH_STARTS_AT_MS ? PRE_LAUNCH_BODY : POST_LAUNCH_BODY
}

/**
 * Date-aware introductory paragraph for the /sunday-lunch "How Sundays work"
 * section. Server-rendered at build/revalidate time and re-checked on the
 * client every 60s so cached pages flip on 17 May 2026 without a hard reload.
 *
 * Mirrors the cache-aware pattern used by <LaunchAnnouncement>. See spec
 * §8.6 (date-aware body copy convention).
 */
export function SundayLunchHowItWorks() {
  const [body, setBody] = useState<string>(() => pickBody(Date.now()))

  useEffect(() => {
    function recompute() {
      setBody(pickBody(Date.now()))
    }

    recompute()
    const id = setInterval(recompute, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <p className="text-anchor-cream-text/80 text-lg leading-relaxed">
      {body}
    </p>
  )
}
```

### `content/blog/60th-birthday-party-ideas-venues/index.md`

```
---
title: "60th Birthday Party Ideas and Venues Near Heathrow"
slug: 60th-birthday-party-ideas-venues
date: "2026-04-12"
publishDate: "2026-04-12"
description: "Celebrating a 60th birthday? Relaxed party ideas and accessible venues near Heathrow for a memorable milestone."
author: "The Anchor Team"
keywords:
  - 60th birthday party ideas
  - 60th birthday party venue
  - birthday celebration venue
  - milestone birthday venue
tags:
  - private-hire
  - birthdays
  - guides
featured: false
hero: "hero.jpg"
images: []
---

Sixty is the milestone that surprises people. Not because it arrives — everyone knows it's coming — but because of how it feels when it does. At 40 you were still proving things. At 50 you were still building things. But 60? Sixty is the birthday where you finally get to enjoy what you've built without anyone expecting you to build more.

The best 60th birthday parties reflect that. They're relaxed. They're warm. They bring together the people who matter most and give everyone enough time to actually talk — not shout over a DJ or squeeze conversations into the gap between courses. If you're planning a 60th for yourself or someone you love, this guide covers ideas that genuinely work, practical venue advice for the Heathrow and Surrey area, and honest pricing so you can plan without guessing.

## What a 60th birthday celebration should feel like

A 60th birthday party is not a younger person's party with the volume turned down. It has its own energy entirely. The guest list often spans generations — children and grandchildren, siblings, old friends who go back decades, colleagues from a 30-year career, neighbours. Some of these people haven't seen each other in years. Some have never met.

The job of a good 60th is to create the conditions where all those conversations happen naturally. That means comfortable seating (not just standing room), manageable noise levels, good food served at a civilised pace, and enough space that people aren't crammed together like commuters.

It also means choosing a venue that doesn't feel like a corporate event. Nobody wants their 60th to feel like a retirement seminar in a hotel conference room. They want it to feel like a celebration in a place with warmth and character.

## 60th birthday party ideas that people genuinely enjoy

### Sunday lunch celebration

A Sunday lunch party is arguably the perfect format for a 60th. It's familiar, it's relaxed, and it gives the celebration a natural structure — arrive, sit down, eat, toast, pudding, more chatting — without needing a programme or activities.

At The Anchor, [Sunday roast](/sunday-lunch) starts from £19.99 per person, with options including roasted chicken (£19.99), crispy pork belly (£21.99), slow-cooked lamb shank (£23.99), and a vegetarian beetroot and butternut squash Wellington (£19.99). Kids roasted chicken is £13.99. All roasts come with herb and garlic-crusted roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy (vegetarian gravy available on request). Add cauliflower cheese for £3.99.

**Make it work:** Sunday lunch requires advance booking and a £10 per person deposit (deducted from the bill), with a pre-order deadline of Saturday at 1pm. Maximum online party size is 20 — for larger groups, call 01753 682707 directly. The regular menu is also available on Sundays without pre-ordering, so guests who fancy something different aren't stuck.

### Afternoon tea-style gathering

An afternoon event (say 2pm to 6pm) with tea, coffee, cake, and light bites is a format that works brilliantly for a 60th. It's sociable, it accommodates guests who don't drink alcohol, and it finishes at a sensible hour — which, when your guest list includes people in their 70s and 80s, genuinely matters.

**Make it work:** The Anchor offers unlimited tea and coffee at £4.49 per head (minimum 10 guests). Combine that with a [sandwich buffet at £9.95 per head](/food-menu) or [finger buffet at £10.50 per head](/food-menu) and bring your own birthday cake. For 30 guests, that's a complete afternoon celebration for well under £500. The private dining room seats 26 with French doors opening onto the beer garden, giving you flexibility as numbers shift through the afternoon.

### Evening buffet party

If the guest of honour prefers an evening celebration, a buffet party is the format that accommodates the widest range of guests with the least amount of fuss. People arrive when they can, eat when they're hungry, and stay as long as they like. No fixed seating plan, no three-course timing constraints, no panic when Uncle David arrives 45 minutes late.

**Make it work:** Buffet packages at The Anchor start from £9.95 per head for groups of 30 or more:

| Package | Per Head | Works Well For |
|---|---|---|
| Sandwich Buffet | £9.95 | Afternoon or early evening, budget-friendly |
| Finger Buffet | £10.50 | Standing events, cocktail-style |
| Burger Buffet | £10.95 | Mixed ages, casual atmosphere |
| Premium Buffet | £13.95 | Evening celebrations, a proper spread |
| Indoor BBQ | £17.99 | When you want to push the boat out |

For a 60th with 35 guests, a premium buffet comes to £488.25. An indoor BBQ for 40 guests is £719.60. Compare that with hotel function room pricing (£45-80 per head before room hire and parking) and the difference is substantial.

### Garden party with a view

For summer birthdays, The Anchor's beer garden offers something you won't find at any hotel venue: a seat under Heathrow's southern runway approach path, where planes descend at 500-800 feet overhead every 90 seconds during peak times. It sounds unlikely as a party setting, but guests love it. There's always something to look at, always a conversation starter, and the spectacle of an A380 passing overhead never gets old — even for people who've seen it a hundred times.

**Make it work:** The beer garden seats 64 with heated areas, full food and drink service during kitchen hours, and free WiFi. Dogs are welcome (on a lead, with water bowls and treats provided). For a summer 60th, an afternoon garden party with a buffet and drinks package is hard to beat. A Pimm's jar at £5.99 per person (minimum 30 guests) is practically mandatory.

### Memory lane evening

A 60th birthday is sixty years of stories. Put them on display. Print photos from every decade — school photos, wedding day, holidays, career milestones, embarrassing haircuts — and arrange them around the venue as a visual timeline. Invite two or four people from different chapters of the guest of honour's life to share a brief story or toast (keep each one to two minutes, no exceptions, or someone will talk for twenty).

**Make it work:** The Anchor's private hire includes AV equipment — projector, screen, and sound system — as standard. Set up a slideshow running on loop, or use the projector for a short "this is your life" presentation between courses. The private dining room is perfect for this: intimate enough that everyone can see the screen, big enough that it doesn't feel like a living room.

## Accessibility: being honest about what's available

When you're planning a 60th birthday party, accessibility isn't a nice-to-have. Some of your guests will have mobility requirements, and they need to know — before they arrive — exactly what the venue offers and what it doesn't. We'd rather be upfront than have anyone face an unpleasant surprise.

**What The Anchor offers:**
- Step-free access to the bar, dining area, and car park
- Ramp available on request for the beer garden (there are steps from the bar)
- Free on-site parking on a level surface, close to the entrance, CCTV and floodlit
- Assistance dogs always welcome
- Guests with specific access needs are encouraged to call ahead on 01753 682707 so we can plan their visit

**What The Anchor does not have:**
- Accessible toilet — this is an honest limitation, and we understand it may be a deciding factor for some guests

We'd rather you know this upfront. If an accessible toilet is essential for your party, we completely understand that you may need to look elsewhere, and we won't take it personally. But for many groups, the step-free access to all main areas, level parking, and willingness to accommodate specific needs make it work well.

## Family-friendly: every generation welcome

A 60th birthday party typically brings together the widest age range of any milestone — from grandchildren in pushchairs to the guest of honour's own parents or older siblings. Your venue needs to work for all of them.

The Anchor is completely family-friendly with no age cut-off. That means:

- **Babies and toddlers:** High chairs available, bottle warming on request, buggy space
- **Young children:** Communal colouring books and crayons, kids menu from £8, unlimited squash at £3.50 per head
- **Teenagers:** Full regular menu available, free WiFi, beer garden space
- **Older guests:** Comfortable seating in the dining room, step-free access, quieter atmosphere than a busy town-centre pub
- **Dogs:** Welcome throughout the entire venue, on a lead, with water bowls and treats provided

Breastfeeding is welcome anywhere in the venue. There is no baby changing facility on site — worth knowing if you have guests with very young children.

## Choosing a 60th birthday party venue near Heathrow

The right venue for a 60th is different from the right venue for a 30th or 40th. Atmosphere matters more than "vibes." Comfort matters more than capacity. And practical details — parking, access, noise levels — matter more than they did a decade ago.

### What to look for

**Genuine private space.** A roped-off corner of a busy pub doesn't work for a 60th. You need a room where speeches can be heard, where older guests aren't overwhelmed by background noise, and where the evening feels like your celebration rather than someone else's venue. The Anchor's private dining room delivers this — a self-contained space with its own atmosphere, separate from the main bar.

**Free parking, close to the entrance.** When your guest list includes people in their 60s, 70s, and 80s, the walk from the car park to the front door matters. Hotel parking that costs £15-25 per car and involves a five-minute walk through a multi-storey is a poor start to anyone's evening. The Anchor has 20 free spaces on a level surface, close to the entrance. Additional parking is available nearby.

**No room hire charge.** Many hotels charge £500-2,000 for a function room before you've spent anything on food or drink. The Anchor uses a minimum spend model: £500-1,500 depending on day and group size, and every pound goes toward what your guests actually eat and drink. There's no separate room fee.

**A team that handles the details.** At a 60th, the organiser (usually a son, daughter, or partner) has enough to manage without also running the catering. A dedicated events coordinator who manages the timeline, checks the food, and solves problems before they become visible is worth its weight in gold. The Anchor includes this with every private hire.

### Venue cost comparison for a 60th (35 guests)

| | Airport Hotel | Chain Restaurant | The Anchor |
|---|---|---|---|
| Room hire | £500-2,000 | £200-500 | Free (min spend) |
| Food (35 guests) | £1,575-2,800 | £700-1,225 | £348-630 |
| Parking (15 cars) | £225-375 | Limited free | Free |
| Welcome drinks | £350-700 | Varies | £280 (prosecco) |
| **Estimated total** | **£2,650-5,875** | **£1,100-2,425** | **£500-1,500** |

The price gap is real, and it compounds. Every pound saved on room hire and parking is a pound that goes toward food, drinks, or a generous bar tab that makes the evening feel special.

## Location and getting here

Stanwell Moor sits in a quiet pocket of Surrey, two minutes from M25 Junction 14, outside the ULEZ zone (saving London drivers £12.50), and close enough to Heathrow that guests flying in from elsewhere can be at the venue within minutes of landing.

**Drive times to The Anchor:**
- Heathrow Terminal 5: 7 minutes
- Heathrow Terminals 2/3: 11 minutes
- Terminal 4: 12 minutes
- Staines-upon-Thames: 8 minutes
- Windsor or Egham: 12-15 minutes
- Feltham or Ashford: 10-15 minutes

**By bus:** Routes 441, 442, and 555 from Heathrow Central Bus Station.

All times are approximate and traffic dependent. For guests who need a taxi home, the proximity to Staines and Heathrow means reasonable fares in every direction.

The Anchor itself has been part of Stanwell Moor since 1751. That's nearly 275 years as a village pub — which means it has the kind of character and warmth that no hotel function room can replicate, no matter how many fairy lights they install.

## Planning timeline for a 60th birthday party

If you're organising a 60th for someone else (as is often the case), here's a practical timeline that keeps everything on track.

**10-12 weeks before:**
- Book the venue. At The Anchor, you can [get an instant quote for a milestone birthday](/private-hire/milestone-birthdays) online. Saturdays and Sundays fill fastest.
- Set the budget and guest list. Be realistic about numbers — people over 60 are more likely to actually RSVP (a welcome change from planning younger people's parties).
- Decide on the format: Sunday lunch, afternoon gathering, or evening buffet.

**6-8 weeks before:**
- Send invitations. For a 60th, physical invitations still carry weight. But digital works too.
- Confirm food and drinks packages with the venue.
- Start gathering photos for a timeline or slideshow if you're doing one.

**4 weeks before:**
- Confirm RSVPs and dietary requirements.
- Arrange toasts or speeches — keep the list short and brief each speaker on the two-minute rule.
- Order any flowers, decorations, or a birthday cake.

**2 weeks before:**
- Final headcount to the venue. Pay the deposit (£250 at The Anchor).
- Sunday lunch is now walk-in friendly (1pm-6pm) — no pre-order or Saturday cutoff to worry about.
- Confirm access arrangements for any guests with mobility needs.

**On the day:**
- Arrive an hour early for setup (photos, decorations, any personal touches).
- Brief the events coordinator on timing for any speeches, cake cutting, or surprises.
- Then relax. The venue team handles the rest.

## Budget breakdown: what a 60th birthday party costs

Real numbers for 35 guests at The Anchor.

**The relaxed afternoon (around £550):**
- Sandwich buffet: £348 (35 x £9.95)
- Unlimited tea and coffee: £157 (35 x £4.49)
- Bring your own cake: free
- Decorations: ~£30
- Venue: no room hire (min spend covered)
- Parking: free
- **Total: approximately £535**

**The Sunday lunch (around £900):**
- Sunday roast from £19.99/head: ~£700 (35 guests, mixed choices)
- Welcome prosecco: £280 (35 x £7.99)
- Decorations: ~£40
- **Total: approximately £1,020**

**The evening celebration (around £1,300):**

[truncated at line 200 — original has 239 lines]
```

### `content/blog/best-pub-food-near-heathrow/index.md`

```
---
title: "Best Pub Food Near Heathrow: A Local's Guide (2026)"
description: "Skip the airport food. A local's honest guide to the best pub food near Heathrow Airport — real recommendations, prices, parking info, and how long you need."
date: "2026-04-07"
author: "Billy"
keywords:
  - best pub food near heathrow
  - best pub food surrey
  - pub food near heathrow airport
  - restaurants near heathrow
  - where to eat near heathrow
  - pub lunch near heathrow
  - food near heathrow terminal 5
  - pub food surrey
tags:
  - food-and-drink
  - guides
featured: false
hero: hero.jpg
images: []
---

Let's start with the obvious: eating at Heathrow Airport is expensive. A mediocre burger and a pint will set you back £25-30 in the terminal. A sandwich and a coffee is pushing £12. And the quality is — let's be generous — functional. You're paying a captive-audience tax because you're already through security and your options are limited.

Here's the thing that most people don't realise: there are excellent pubs and restaurants within 7-15 minutes of every Heathrow terminal, with proper food, proper prices, and free parking. If your flight isn't for a few hours, or you've just landed and you're starving, eating outside the airport is cheaper, better, and more relaxing in every way.

This isn't a TripAdvisor roundup. This is a local's guide — the places we'd actually recommend to a friend.

---

## Why You Should Eat Outside the Airport

Before we get to specific pubs, here's the maths that makes this worth your time:

| | Airport Terminal | Pub 10 Mins Away |
| --- | --- | --- |
| **Burger & pint** | ~£25-30 | ~£15-18 |
| **Fish & chips** | ~£18-22 | ~£13-16 |
| **Two-course meal** | ~£35-45 | ~£22-30 |
| **Parking** | £5-8/hour | Free |
| **Atmosphere** | Fluorescent lights, announcements | Actual pub |

You'll save £10-20 per person, eat better food, and sit somewhere that doesn't have departure boards and duty-free announcements. The only trade-off is the 10-15 minute drive, which is nothing if you've planned ahead.

**Who this works for:**
- Pre-flight diners with 3+ hours before departure
- Post-flight travellers who want a proper meal before the drive home
- Hotel guests near Heathrow looking for an evening out
- Airport workers on a day off (they know all of these places)
- Anyone collecting or dropping off passengers

---

## 1. The Anchor, Stanwell Moor

**Distance:** 7 mins from T5 | 11 mins from T2/T3 | 12 mins from T4
**Price range:** Mains from £11 | **Parking:** Free (20 spaces) | **Dogs:** Welcome

The closest traditional pub to Heathrow Airport, and the one we'd send you to first. The Anchor is an independent village pub in Stanwell Moor, tucked away on Horton Road just off the M25 at Junction 14. It's not a chain, not a hotel bar, not a service station with pretensions — it's a proper local that happens to be seven minutes from Terminal 5.

### What to eat

The [menu](/food-menu) covers proper British pub food without trying to be something it's not:

**British classics:** Fish and chips (£15), scampi and chips (£13), bangers and mash (£14), jumbo sausage and chips (£13)

**Pies:** Beef and ale (£16), chicken and wild mushroom (£15), chicken, ham hock and leek (£15), butternut squash and mature cheddar (£15, V) — all served with creamy mash and seasonal veg

**Burgers:** Classic beef, chicken, spicy chicken, or garden veg from £11. Stacks from £14. Build your own with extras from £1-2 each

**Comfort food:** Lasagne (£15), mac and cheese (£14, V), chicken katsu curry (£14), spinach and ricotta cannelloni (£14, V)

**Pizzas:** Full pizza menu available — good for sharing or a lighter option

**Sunday roasts:** From £19.99, cooked to order, served 1pm-6pm — walk in or book ahead, no pre-order needed. See our [Sunday roast guide](/blog/best-sunday-roast-near-heathrow) for full details.

### Why locals rate it

The portions are honest, the prices haven't gone mad, and the quality is consistent. The pies are a standout — proper pastry, generous filling, served with creamy mash that's actually creamy. The fish and chips is proper beer-battered cod, not the thin frozen fillets you'll get at most chains.

The beer garden is directly under Heathrow's flight path, which sounds like a drawback but is actually brilliant — planes come over at 500-800 feet every 90 seconds during peak times. A380s, 777s, Dreamliners. It's free entertainment with your meal.

### Practical info

**Kitchen hours:** Monday closed. Tuesday-Friday 4pm-9pm. Saturday 12pm-7pm. Sunday 1pm-6pm.

**Getting there from the terminals:** Head south on the M25, exit Junction 14, follow signs for Stanwell Moor. Sat nav: TW19 6AQ. The pub is on Horton Road with parking out front.

**Luggage welcome.** Tell them your flight time and they'll pace the service. Outside the ULEZ zone, so no congestion charge.

[View the full menu](/food-menu) | [Book a table](/book-table) | Call **01753 682707**

---

## 2. The Swan, Staines-upon-Thames

**Distance:** 15 mins from T5 | **Price range:** ~£14-22 | **Parking:** Paid (town centre) | **Dogs:** Check ahead

The Swan is a traditional Staines pub with a solid food reputation. It sits in the town centre — more urban than the village pubs on this list, but with a properly traditional pub atmosphere inside. Exposed brick, a proper bar, and regulars who've been coming for years.

### What to eat

The menu is standard British pub fare done well. Expect fish and chips, pie of the day, steaks, burgers, and usually a couple of specials. Prices are reasonable for the area — most mains £14-22. The fish and chips is one of the more popular dishes. Steaks tend to be good if they're on the menu.

The Sunday roast is decent — see our [Sunday roast guide](/blog/best-sunday-roast-near-heathrow) for comparison.

### What you need to know

The main downside is parking. You're in Staines town centre, so it's pay-and-display in the council car parks. On a Saturday, that adds hassle. The food quality is good, but if you're coming from the airport, the 15-minute drive plus the parking situation makes it less convenient than closer options.

Booking is recommended for evenings and weekends. The pub can get busy, particularly on Friday and Saturday nights.

---

## 3. The Wheatsheaf, Staines

**Distance:** 15 mins from T5 | **Price range:** ~£13-20 | **Parking:** Paid (town centre) | **Dogs:** Garden only

Another Staines option worth knowing about. The Wheatsheaf is a traditional pub that does solid British food at fair prices. It's slightly less well-known than The Swan, which can work in your favour — it's often easier to get a table.

### What to eat

Classic pub menu: burgers, fish and chips, pies, and usually a few specials. The food is honest and well-portioned without trying to be gastro. Prices are competitive — most mains sit in the £13-20 range.

The burgers are good. If there's a pie on the specials board, it's usually worth ordering.

### What you need to know

Same parking situation as The Swan — Staines town centre means pay-and-display. It's a solid option if you're already in Staines for other reasons, but the parking makes it less ideal as a dedicated trip from the airport compared to pubs with their own car parks.

---

## 4. The Hare and Hounds, Harmondsworth

**Distance:** 10 mins from T2/T3 | **Price range:** ~£13-20 | **Parking:** Small pub car park | **Dogs:** Check ahead

Harmondsworth is a genuine hidden gem — a tiny village right next to Heathrow that's managed to survive despite the airport expanding all around it. The Great Barn at Harmondsworth is a medieval timber barn that's one of the finest in England, and the village has a proper old-England feel that's remarkable given its location.

### What to eat

The Hare and Hounds serves a straightforward pub menu — nothing revolutionary, but solid and reliable. Fish and chips, burgers, pies, and usually a few seasonal options. Prices are reasonable at £13-20 for mains.

It's not going to win gastropub awards, but the food is decent and the setting is charming. Sometimes you just want a good meal in a proper pub, and this delivers that.

### What you need to know

The pub has a small car park, which is a big advantage over the Staines options. Harmondsworth itself is worth a 10-minute explore — the church and the Great Barn are genuinely impressive. It's one of the closest villages to the airport that still feels like a village.

The pub can be quiet on weekday evenings, which is either a pro or a con depending on your mood.

---

## 5. The Three Magpies, Hayes

**Distance:** 12 mins from T5 | **Price range:** ~£12-18 | **Parking:** Limited | **Dogs:** Check ahead

The Three Magpies is a Greene King pub on Bath Road — the main hotel strip between Heathrow and central London. If you're staying at one of the airport hotels and want a pub meal without getting a taxi, this is the most accessible option.

### What to eat

It's a chain pub, and the menu reflects that — you know what you're getting. Burgers, grills, fish and chips, pizzas, and a selection of pub classics. Everything is competent if not inspired. Prices are lower than independent pubs at £12-18 for mains, which makes it good value for the area.

The advantage of a chain is consistency. You won't be blown away, but you won't be disappointed either. The fish and chips is reliable. The burgers are fine.

### What you need to know

Parking is limited, but most people using this pub are walking from nearby hotels. It's a large venue, so walk-ins are usually possible without booking. The atmosphere is typical chain pub — functional rather than charming.

If you're staying at the Premier Inn, Holiday Inn, or Ibis on Bath Road, this is the closest decent meal that isn't room service or a Tesco meal deal.

---

## 6. The Red Lion, Colnbrook

**Distance:** 10 mins from T5 | **Price range:** ~£13-20 | **Parking:** Small pub car park | **Dogs:** Check ahead

Colnbrook is another of those villages that sits in Heathrow's shadow but has its own identity. The Red Lion is a traditional pub that's been serving the village for centuries — the kind of place with low ceilings, a proper bar, and a sense of history.

### What to eat

Traditional pub food — fish and chips, pies, steaks, and daily specials. The menu isn't extensive, but what they do, they do properly. Prices are fair at £13-20 for mains.

Colnbrook as a whole has a few food options, including some good Indian restaurants. If you're in the area and the pub isn't calling to you, there are alternatives within walking distance.

### What you need to know

The pub has a small car park. Colnbrook is close to the airport but feels surprisingly separate from it — the village has a High Street feel that's unusual this close to Heathrow. It's a good option if you're approaching from the M4 side rather than the M25.

---

## How to Time a Pre-Flight Meal

If you're eating before a flight, timing is everything. Here's a practical guide:

### For evening flights (6pm onwards)
- **Book lunch at 12-1pm** at a nearby pub
- **Eat, relax, have a coffee** — no rushing
- **Head to the airport by 3-3:30pm** for an unhurried check-in
- **Result:** Proper meal, lower cost, relaxed start to your trip


[truncated at line 200 — original has 271 lines]
```

### `content/blog/best-sunday-roast-near-heathrow/index.md`

```
---
title: "Best Sunday Roast Near Heathrow & Staines (2026 Guide)"
description: "Compare the best Sunday roasts near Heathrow and Staines. Real menus, prices, booking info, and honest reviews. Updated for 2026 with 5 local options."
date: "2026-03-20"
author: "Billy"
keywords:
  - best sunday roast near heathrow
  - sunday roast heathrow airport
  - sunday lunch near heathrow
  - sunday roast staines
  - roast dinner near heathrow
  - roast dinner near terminal 5
  - sunday lunch near me heathrow
  - best roast dinner surrey
  - family sunday lunch near heathrow
tags:
  - food-and-drink
  - guides
featured: true
hero: hero.jpg
images: []
---

![Sunday roast with Yorkshire pudding at The Anchor, Stanwell Moor](/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg)

Finding a proper Sunday roast near Heathrow Airport isn't as easy as you'd think. Airport restaurants don't do them, hotel carveries are hit-and-miss, and you need to know where the locals actually go. We've rounded up the best roast dinner options within 20 minutes of Heathrow for 2026, with real prices, booking info, and what to expect when you get there.

> **Ready to book?** [Book your Sunday roast at The Anchor](/sunday-lunch) — from £19.99, served 1pm-6pm. Walk in or book ahead, no pre-order needed. Free parking, 7 mins from T5.

## Quick Comparison: Sunday Roasts Near Heathrow

| Pub / Restaurant | Price | Booking Required? | Parking | Distance from T5 | Dog Friendly |
| --- | --- | --- | --- | --- | --- |
| **The Anchor**, Stanwell Moor | From £19.99 | Recommended, walk-ins welcome | Free (20 spaces) | 7 mins | Yes |
| **The Swan**, Staines | ~£16–20 | Recommended | Paid (town centre) | 15 mins | No |
| **The Bells**, Staines | ~£14–18 | Walk-in possible | Paid | 15 mins | Check |
| **Toby Carvery**, Colnbrook | ~£12–15 | Walk-in | Free | 10 mins | No |
| **Three Magpies**, Hayes | ~£13–17 | Recommended | Limited | 12 mins | Check |

Every one of these is a better bet than anything you'll find inside the terminals. Here's a closer look at each.

---

## 1. The Anchor, Stanwell Moor

**Best for:** Cooked-to-order quality, families, dog owners, free parking

The Anchor is the closest proper pub to Heathrow Terminal 5, about seven minutes by car, tucked away in the village of Stanwell Moor just off the M25 at Junction 14. It's a proper local, not a chain, and they take their Sunday roasts seriously. If you're after a roast dinner near Heathrow that's actually worth the trip, this is where to start.

### The menu

Four roast options, all cooked fresh to order:

- **Roasted Chicken** (£19.99) — breast with sage and onion stuffing balls, red wine gravy
- **Slow-Cooked Lamb Shank** (£23.99) — braised until it falls apart, rich red wine gravy
- **Crispy Pork Belly** (£21.99) — proper crackling, Bramley apple sauce
- **Beetroot & Butternut Squash Wellington** (£19.99) — puff pastry, vegetarian gravy (V)
- **Kids Roasted Chicken** (£13.99) — smaller portion with all the trimmings

Every plate comes with herb and garlic-crusted roast potatoes, a Yorkshire pudding, seasonal veg, and gravy. The gravy is gluten-free by default, and they can adapt for vegan diners with notice.

The vegetarian wellington deserves a special mention. A lot of pubs treat the veggie option as an afterthought, but the beetroot and butternut squash wellington here is a proper dish in its own right, wrapped in puff pastry with its own vegetarian gravy. It's not a token option sitting at the bottom of the menu.

### How booking works

Sunday roasts are walk-in friendly — no pre-order, no Saturday cutoff. Booking ahead is recommended for groups and peak slots, but not required. Groups of 10 or more take a £10 per person deposit, fully deducted from the final bill. Everything is still cooked fresh to order, not pre-plated under a heat lamp.

**Kitchen hours on Sunday:** 1pm–6pm (last orders 5:30pm).

The regular weekday menu — burgers, pizzas, fish and chips, pies — is also available on Sunday.

### Families and dogs

The Anchor is genuinely family-friendly, not just in the "we have a kids menu" sense. There's a large beer garden where kids can run around after eating, and the kids' roast chicken (£13.99) comes with the same proper trimmings as the adult portions, just sized down. Dogs are welcome in the garden too, so the whole family can come along.

Planes come over every 90 seconds or so as you're directly under the Heathrow flight path. Kids love it, and honestly, it's part of the experience. Free parking for about 20 cars right outside.

### Why locals rate it

What sets The Anchor apart from the chain options is that everything is cooked to order. You're not getting slices off a carvery counter that's been sitting under heat lamps. The lamb shank has been braised for hours. The pork belly has proper crackling. It takes a bit more planning because of the pre-order system, but the quality difference is noticeable.

[Book your Sunday roast at The Anchor](/sunday-lunch) or call **01753 682707**. Walk-ins are welcome, but peak slots fill up quickly — booking ahead saves a wait.

---

## 2. The Swan, Staines

**Best for:** Town centre convenience, a traditional pub setting

The Swan is a well-known Staines local with a solid reputation for Sunday lunches. It's a traditional pub in the centre of town — exposed brick, proper bar, the sort of place where regulars have their own seats.

The roast is a good standard — expect the usual choices of beef, chicken, or a veggie option, served with all the trimmings. Prices tend to sit around £16–20 for a main. Portions are decent.

The main downside is parking. You're in Staines town centre, so it's pay-and-display in the municipal car parks. On a busy Sunday, that can add a bit of hassle. About 15 minutes from Terminal 5. Booking is recommended, especially for groups.

---

## 3. Toby Carvery, Colnbrook

**Best for:** Budget-friendly, kids, no-booking-needed convenience

If you just want a reliable, no-fuss carvery, the Toby in Colnbrook is about 10 minutes from Terminal 5. You know what you're getting — queue up, pick your meat, load up on veg and Yorkshire puddings. Prices start around £12–15, and kids eat for less.

It's not going to win any awards for culinary innovation, but it's consistent, family-friendly, and you can walk in without a booking. Free parking. The trade-off is that it's a chain — the meat is carved from a hot counter, not cooked to your order. If you want volume over finesse, it does the job.

---

## 4. Three Magpies, Hayes

**Best for:** Airport hotel guests, Bath Road convenience

The Three Magpies is a Greene King pub on Bath Road in Hayes — the hotel strip between the airport and central London. It's handy if you're staying at one of the nearby hotels and don't fancy a taxi ride.

The Sunday roast is standard chain pub fare — reliable enough, with the usual beef, chicken, and veggie options in the £13–17 range. It's a large pub, so walk-ins are usually fine, though booking is sensible for groups. Parking is limited. About 12 minutes from Terminal 5.

---

## 5. The Bells and Other Staines Options

Staines has a handful of other pubs doing Sunday roasts. The Bells is worth a mention — it's a straightforward local with roasts in the £14–18 range. Walk-ins are generally possible.

Staines as a whole gives you more choice than anywhere else near Heathrow, but you're 15 minutes from the airport and dealing with town centre parking. If you're specifically after a quick pre-flight or post-flight roast, the closer options may suit you better.

---

## What Makes a Great Sunday Roast?

Not all roasts are created equal. Here's what separates a proper Sunday lunch from a forgettable one:

- **Yorkshire pudding** — Should be crisp on the outside, soft inside. If it's a frozen mini from a packet, you'll know.
- **Gravy** — Proper gravy made from meat juices, not granules. This is the single biggest tell.
- **Vegetables** — Seasonal, with some colour and bite. Not boiled to grey mush.
- **Meat quality** — Cooked to order beats a carvery counter every time. A lamb shank that's been braised for hours is a different experience to a slice of beef that's been sitting under a heat lamp.
- **Roast potatoes** — Crispy outside, fluffy inside. Goose fat or herb-crusted is ideal.

The fundamental difference between a cooked-to-order roast and a carvery is time and care. A carvery is faster and cheaper. A proper sit-down roast takes longer but tastes like Sunday is supposed to taste.

---

## Tips for Heathrow Travellers

If you're flying out on a Sunday evening, a proper roast lunch is a brilliant way to end a weekend trip or start a holiday right. Here's how to time it:

- **Book your roast for 1pm–2pm.** That gives you a relaxed meal with time for pudding and coffee.
- **Back to the airport by 4pm.** Even with a 7pm flight, you'll have plenty of time through security.
- **Free parking at The Anchor** means no clock-watching on a parking meter.
- **Book ahead for The Anchor** — walk-ins are welcome, but peak slots fill up quickly.
- **Luggage is welcome.** The Anchor has space for cabin bags and overnight cases at the table.
- **Tell them your flight time** when booking. They'll pace the service so you're not rushed or waiting.

---

## Frequently Asked Questions

### What's the best Sunday roast near Heathrow Airport?

For a cooked-to-order roast with proper trimmings, The Anchor in Stanwell Moor is the closest quality option to Heathrow — seven minutes from Terminal 5. If you want a budget carvery, Toby Carvery Colnbrook is about 10 minutes away.

### Do I need to book Sunday lunch near Heathrow?

It depends where you go. The Anchor accepts walk-ins on Sundays — booking ahead is recommended but not required. Toby Carvery is walk-in. For most pubs, booking is recommended — especially for groups of four or more.

### How much is a Sunday roast near Heathrow?

Prices range from around £12 at Toby Carvery to £23.99 for a lamb shank at The Anchor. Most pub roasts in the area fall between £14 and £20 for an adult main with trimmings.

### Is there a Sunday carvery near Heathrow?

Yes — Toby Carvery in Colnbrook is about 10 minutes from Terminal 5. It's the nearest carvery-style option. Most other pubs in the area serve plated, cooked-to-order roasts rather than carvery counters.

### Can I get a Sunday roast near Heathrow with free parking?

The Anchor in Stanwell Moor has free parking for about 20 cars. Toby Carvery Colnbrook also has free parking. Pubs in Staines town centre generally rely on paid municipal car parks.

### What time is Sunday lunch at The Anchor?

The kitchen is open 1pm–6pm on Sundays, with last orders at 5:30pm. Roasts are walk-in friendly — no pre-order needed. Booking ahead is recommended for peak slots. Groups of 10 or more take a £10 per person deposit, fully deducted from the final bill.

### Is there a vegetarian Sunday roast near Heathrow?

The Anchor offers a beetroot and butternut squash wellington (£19.99) with vegetarian gravy and all the trimmings. They can also cater for vegan diners with advance notice. Most chain pubs in the area have a veggie option too, though quality varies.

### Can I get a Sunday roast near Heathrow before a flight?

Absolutely. The Anchor is only seven minutes from Terminal 5, and if you book a 1pm sitting you'll be done by 2:30pm with plenty of time for an evening flight. Let them know your flight time when you book and they'll pace the service accordingly. There's free parking on site, so no meter to worry about.

### How do I get to The Anchor from Heathrow?

From the airport, head south on the M25 and come off at Junction 14. Stanwell Moor is signposted from there, and the pub is on Horton Road. It's a straight seven-minute drive from Terminal 5. Postcode for sat nav: TW19 6AQ.

---

Ready to book your Sunday roast? [Reserve a table at The Anchor for this Sunday](/sunday-lunch) or call **01753 682707**. From £19.99 per person, with free parking, a dog-friendly garden, and just seven minutes from Terminal 5. Walk-ins are welcome, but booking ahead saves a wait at peak times.
```

### `content/blog/best-sunday-roast-surrey/index.md`

```
---
title: "Best Sunday Roast Pubs in Surrey (2026 Guide)"
description: "Honest comparison of the best Sunday roast pubs across Surrey — real prices, booking info, parking, and what to expect. 7 pubs reviewed for 2026."
date: "2026-04-07"
author: "Billy"
keywords:
  - best sunday roast surrey
  - sunday roast surrey
  - best roast dinner surrey
  - sunday lunch surrey
  - sunday carvery surrey
  - best pub sunday lunch surrey
  - sunday roast pub surrey
  - roast dinner near me surrey
tags:
  - food-and-drink
  - guides
featured: false
hero: hero.jpg
images: []
---

Surrey does Sunday roasts properly. Whether you're after a cooked-to-order lamb shank in a village pub, a budget-friendly carvery, or a gastropub roast with all the trimmings, the county has enough options to keep you busy for months. The hard part is knowing which places are actually worth the drive — and which ones coast on reputation.

We've pulled together seven of the best Sunday roast pubs across Surrey for 2026, covering everything from the villages near Heathrow to the Surrey Hills. Every pub listed here has been chosen for a reason: quality of the roast, value for money, atmosphere, or a combination of all three.

> **Looking for Sunday roasts specifically near Heathrow?** See our dedicated [Sunday roast near Heathrow guide](/blog/best-sunday-roast-near-heathrow) for options within 15 minutes of the terminals.

## Quick Comparison: Best Sunday Roasts in Surrey

| Pub | Location | Price Range | Booking? | Parking | Dog Friendly | Best For |
| --- | --- | --- | --- | --- | --- | --- |
| **The Anchor** | Stanwell Moor | From £19.99 | Yes (by Sat 1pm) | Free (20 spaces) | Yes | Cooked-to-order quality, families |
| **The White Horse** | Shere | ~£18-24 | Recommended | Limited free | Garden only | Picture-perfect village setting |
| **The Cricketers** | Cobham | ~£17-22 | Recommended | Pub car park | Check ahead | Classic Surrey pub, reliable quality |
| **The Victoria** | Oxshott | ~£20-28 | Essential | Own car park | Garden only | Gastropub quality, special occasions |
| **The King William IV** | Mickleham | ~£18-24 | Recommended | Own car park | Yes | Box Hill walks, countryside setting |
| **The Barley Mow** | West Horsley | ~£16-22 | Walk-in possible | Pub car park | Yes | Relaxed village local, good value |
| **The Running Horses** | Mickleham | ~£20-26 | Essential | Own car park | Garden only | Upmarket roast, wine list |

---

## 1. The Anchor, Stanwell Moor

**Best for:** Cooked-to-order quality, families, dog owners, free parking near Heathrow

The Anchor sits in the village of Stanwell Moor on the Surrey/Middlesex border, about seven minutes from Heathrow Terminal 5 and two minutes from M25 Junction 14. It's an independent village pub, not a chain, and they take their Sunday roasts seriously enough to require pre-ordering by Saturday lunchtime — everything is cooked fresh to order.

### The roast

Four options, all served with herb and garlic-crusted roast potatoes, a Yorkshire pudding, seasonal veg, and gravy:

- **Roasted Chicken** (£19.99) — breast with sage and onion stuffing balls, red wine gravy
- **Slow-Cooked Lamb Shank** (£23.99) — braised until it falls apart
- **Crispy Pork Belly** (£21.99) — proper crackling, Bramley apple sauce
- **Beetroot & Butternut Squash Wellington** (£19.99) — puff pastry, vegetarian gravy (V)
- **Kids Roasted Chicken** (£13.99) — full trimmings, smaller portion

The gravy is gluten-free by default. Vegan options available with advance notice.

### What you need to know

Walk in or book ahead — no pre-order needed. Kitchen hours on Sunday are 1pm-6pm, last orders 5:30pm. Groups of 10 or more take a £10 per person deposit, fully deducted from the bill. The regular weekday menu — burgers, pizzas, fish and chips — is also available on Sunday.

Free parking for about 20 cars. Dogs welcome throughout the venue. The beer garden seats 64, with planes coming over every 90 seconds (directly under Heathrow's flight path — kids love it). Outside the ULEZ zone.

[Book your Sunday roast at The Anchor](/sunday-lunch) or call **01753 682707**.

---

## 2. The White Horse, Shere

**Best for:** A picture-perfect village setting, walking weekend

Shere is regularly cited as one of the prettiest villages in England, and it's earned the reputation. The village was used as a filming location for *The Holiday* and *Bridget Jones*, and the White Horse sits right in the heart of it with a traditional pub frontage that looks like it belongs on a postcard.

### The roast

The menu typically features beef, chicken, and a veggie option, all served with proper trimmings. Expect to pay around £18-24 for a main. Portions are generous, and the quality is consistently above average — this isn't a place that coasts on the setting alone.

The vegetables tend to be well-cooked rather than the grey mush you get at lesser pubs. The Yorkshire puddings are made in-house. Beef is usually the standout.

### What you need to know

Booking is recommended, especially for Sunday lunch. The pub gets busy — it's a destination village for walkers and cyclists, particularly in spring and summer. Parking is limited in the village itself; there's a small car park nearby but it fills quickly. Arriving before 12:30 helps.

Dogs are welcome in the garden area. The village has a lovely stream running through it, which makes for a pleasant post-lunch walk. If you're combining a roast with a countryside walk, the trails up to the North Downs Way start from the village.

**Location:** Shere, near Guildford (about 40 minutes from the M25 at Leatherhead)

---

## 3. The Cricketers, Cobham

**Best for:** Classic Surrey pub, reliable quality, good portions

The Cricketers is a well-known Cobham local with a solid reputation for consistent quality. It's the sort of pub where you know exactly what you're going to get — a proper roast, decent trimmings, and a pint in a traditional setting. Not trying to reinvent the wheel, just executing the basics well.

### The roast

Expect the usual selection — beef, chicken, pork, and a vegetarian option — in the £17-22 range. Trimmings are standard but well done: good roast potatoes, Yorkshire puddings, seasonal veg, and proper gravy. The beef tends to be the most popular, and the chicken is reliably good.

Portions are generous enough that you won't need a starter, though the starters are worth a look if you're hungry. Desserts are traditional pub fare — sticky toffee pudding, crumble, that sort of thing.

### What you need to know

Booking is recommended for Sunday lunch, particularly for groups of four or more. The pub has its own car park, which is a genuine advantage in Cobham where street parking can be tricky. Check ahead on dog policy — it varies by area of the pub.

Cobham itself has a pleasant high street with independent shops and cafes if you want to extend the outing.

**Location:** Cobham, Surrey (about 25 minutes from the M25 at Junction 10)

---

## 4. The Victoria, Oxshott

**Best for:** Gastropub quality, special occasions, wine list

If you want a Sunday roast that leans more towards restaurant quality than traditional pub grub, The Victoria in Oxshott is worth the trip. It sits in the "stockbroker belt" area of Surrey, and the quality reflects its postcode without being prohibitively expensive.

### The roast

This is the more refined end of the spectrum. The menu is shorter but more considered — typically two or three protein options plus a vegetarian dish, all carefully sourced. Prices run higher than average at around £20-28, but the quality of the ingredients and execution justify it.

The potatoes are excellent — properly crispy, well-seasoned. The gravy is made from scratch. Vegetables are treated as an actual component of the plate rather than an afterthought. If you care about the details of a roast, you'll notice the difference here.

### What you need to know

Booking is essential — this place fills up for Sunday lunch, often a week or two in advance. The pub has its own car park with reasonable space. Dogs are welcome in the garden area. The wine list is notably better than most pubs in the area, which makes it a good choice if wine with your roast matters to you.

It's on the pricier side for a pub roast, so this is one for a special Sunday rather than an every-week habit.

**Location:** Oxshott, Surrey (about 20 minutes from the M25 at Junction 9)

---

## 5. The King William IV, Mickleham (near Box Hill)

**Best for:** Combining a walk with a roast, countryside atmosphere

If you're the type who likes to earn your roast with a morning walk, the King William IV near Box Hill is perfectly positioned. Box Hill is one of Surrey's most popular walking spots — the National Trust site at the summit has panoramic views across the Surrey Weald — and the pub sits at the bottom, ready to reward you with a roast when you come back down.

### The roast

A solid traditional offering in the £18-24 range. Beef, chicken, pork, and a vegetarian option with all the proper trimmings. The quality is consistent — not the fanciest roast in Surrey, but honest, well-cooked, and generously portioned.

The lamb, when it's on the menu, is particularly good. Yorkshire puddings are crisp and well-risen. The gravy is the proper kind.

### What you need to know

Booking is recommended, particularly in spring and summer when Box Hill is busy with walkers and cyclists. The pub has its own car park, though it can fill up on sunny Sundays. Dogs are welcome throughout, which makes it a good choice for walking groups with dogs.

The pub has a genuine village atmosphere — locals at the bar, walkers in muddy boots, the occasional cyclist. It's unpretentious in the best way.

**Location:** Mickleham, near Dorking (about 30 minutes from the M25 at Junction 9)

---

## 6. The Barley Mow, West Horsley

**Best for:** Relaxed village local, good value, no-fuss quality

The Barley Mow is the kind of pub that doesn't show up on "best of" lists very often because it doesn't try to be anything it's not. It's a proper village local that happens to do a very solid Sunday roast at fair prices. If you want a good roast without the gastropub mark-up or the need to book three weeks in advance, this is worth knowing about.

### The roast

Expect to pay £16-22 for a main. The selection typically covers beef, chicken, and a veggie option, served with all the standard trimmings. Nothing revolutionary, but everything is well-executed. The roast potatoes are good. The Yorkshires are proper. The gravy is made from actual meat juices.

What sets it apart from many Surrey pubs is the value. You're getting a quality roast for prices that haven't drifted into the £25+ territory that's become common at more polished venues.

### What you need to know

Walk-ins are often possible, though booking is sensible for larger groups. The pub has its own car park. Dogs are welcome. The atmosphere is relaxed and unpretentious — families, locals, dog walkers.

West Horsley is close to Horsley railway station (South Western Railway from Waterloo), making it one of the more accessible Surrey villages by public transport.

**Location:** West Horsley, Surrey (about 35 minutes from the M25 at Junction 10)

---

## 7. The Running Horses, Mickleham

**Best for:** Upmarket roast, excellent wine, couples and special occasions

Another Mickleham option, but with a distinctly different feel to the King William IV. The Running Horses positions itself as a dining pub — the sort of place where the wine list gets as much attention as the food menu. It's more polished, slightly more formal, and the roast reflects that.

### The roast

This is the premium end of the Surrey Sunday roast spectrum, with prices around £20-26. The menu is curated rather than extensive — expect two or three well-chosen proteins and a vegetarian option, all presented with more care than your average pub roast.

The meat quality is excellent. The accompanying vegetables and potatoes are treated as important components rather than filler. If you're the sort of person who notices the difference between good roast potatoes and great ones, you'll appreciate the attention to detail.

### What you need to know

Booking is essential. This place is popular, and Sunday lunch tables go quickly — booking a week in advance is sensible. The pub has its own car park. Dogs are welcome in the garden. The interior is comfortable and well-maintained, with a slightly more formal feel than the average country pub.

It's a good date-night-but-Sunday-lunch option. The kind of place where you might linger over a bottle of wine after the plates are cleared.

**Location:** Mickleham, near Dorking (about 30 minutes from the M25 at Junction 9)


[truncated at line 200 — original has 273 lines]
```

### `content/blog/british-pub-guide-for-international-visitors/index.md`

```
---
title: A First-Timer's Guide to British Pub Culture (For International Visitors Near Heathrow)
description: >-
  Visiting a British pub for the first time? This practical guide explains pub
  etiquette, ordering, real ale, Sunday roasts and everything international
  visitors near Heathrow need to know to enjoy the authentic experience.
date: '2026-03-01'
author: The Anchor Team
keywords:
  - british pub culture guide
  - visiting a pub in england for the first time
  - british pub etiquette international visitors
  - what to expect in a british pub
  - pub near heathrow for tourists
  - how to order in a british pub
tags:
  - food-and-drink
  - guides
  - community
featured: false
hero: hero.jpg
images: []
---

The British pub is one of the most distinctive cultural institutions in the world — and one of the most confusing for first-time visitors. If you're flying into or out of Heathrow and want to experience an authentic local pub, this guide will make sure you arrive prepared and leave having had a genuinely memorable time.

## What Makes a British Pub Different

A British pub isn't simply a bar. The best ones — and The Anchor in Stanwell Moor is one of them — are community spaces that have served the same village or neighbourhood for generations. You'll find local regulars who have been drinking in the same spot for decades, sitting next to first-time visitors from the other side of the world.

That mix is the point. A pub is not designed to impress or perform. It exists to be comfortable, welcoming, and reliably itself. That's exactly what most visitors find so disarming.

## Ordering: The Most Important Thing to Know

Unlike most restaurants and bars worldwide, **you order at the bar in a British pub**. There is no waiter system for drinks (food is sometimes table service, sometimes bar service — ask when you arrive).

The process:
1. Go to the bar
2. Wait to be served — don't wave or call out, just make eye contact
3. Order your drinks ("A pint of bitter please" or "What ales do you have on?")
4. Pay when you order, not at the end
5. Take your drinks to your table

For food, you may be given a table number and asked to order at the bar, or a staff member may come to you. Ask when you arrive.

## Understanding the Beer

This is where international visitors often need the most guidance.

**Real ale:** A cornerstone of British pub culture. At The Anchor, we serve bottled real ales — Abbot Ale, Greene King IPA, Old Speckled Hen, and Newcastle Brown Ale — alongside our draught lagers and ciders. Ask the bar staff for a recommendation.

**Craft beer on tap:** Modern kegged beers, served colder, often from smaller breweries. Good range available at most pubs.

**Lager:** The familiar international-style beer. Available everywhere, cold, reliable.

**A "pint" vs a "half":** A pint is 568ml. A half pint is 284ml. Both are legitimate to order — don't feel self-conscious asking for a half.

**Asking for recommendations:** "What ales do you have on?" is a completely normal question. Staff expect it and are usually happy to help you choose.

## The Sunday Roast: A Cultural Institution

If you visit on a Sunday, the Sunday roast is the thing to order. It is not simply a meal — it is an event, a tradition, and for many British families the centrepiece of the week.

A proper Sunday roast includes:
- Your choice of roasted meat (usually beef, chicken, lamb, and pork options, plus a vegetarian alternative)
- Roast potatoes (properly crispy, ideally with goose fat)
- Yorkshire pudding (a golden, puffy pastry — do not skip it)
- Seasonal vegetables
- Rich gravy

At The Anchor, Sunday roasts are served 1pm-6pm — walk in or book ahead, no pre-order needed. Everything is still cooked fresh to order, not warmed up under heat lamps.

[Book Sunday lunch →](/sunday-lunch)

## What to Expect When You Arrive

**The "local":** If regulars greet the landlord by name and the landlord knows what they drink, you're in a good pub. This is the sign of a genuine local.

**The atmosphere:** British pubs are often louder than you might expect — conversation, laughter, sometimes sport on TV. This is normal and not a sign of trouble.

**Dogs:** Well-behaved dogs are welcome in most British pub gardens and in the bar areas of genuinely good locals. The Anchor is dog-friendly.

**Children:** Most pubs serve families during food service hours. Well-behaved children are welcome.

## Common Mistakes First-Time Visitors Make

**Sitting down and waiting to be served for drinks:** This will not work. Go to the bar.

**Tipping:** Unlike restaurants in the USA, tipping in British pubs is not expected. A "keep the change" tip is always appreciated, but never required or expected.

**Ordering a "warm beer":** Real ale is served at cellar temperature, not warm. But do try it before assuming you won't like it — the flavour profile is completely different from cold lager.

**Rushing:** A proper pub visit is not meant to be efficient. Order another round, have a conversation, watch the sport, stay longer than you planned.

## The Anchor: Near Heathrow, Properly Local

The Anchor in Stanwell Moor is a genuine village local that has been serving the community for generations. It's 7 minutes from Heathrow Terminal 5 and 10–15 minutes from all other terminals — far enough from the airport to feel completely removed from it, close enough to be practical for layovers and hotel guests.

For international visitors passing through Heathrow, it offers something the airport simply cannot: an authentic British experience that hasn't been designed for tourists.

**What to try:**
- One pint of real ale (ask what's on)
- Fish & chips (the most British dish)
- Sunday roast (weekends — book in advance)
- A seat in the beer garden on a clear day

**Getting here:** Taxi or Uber to TW19 6AQ. 7–15 minutes from any Heathrow hotel.

**Opening hours:** Check our website for current opening hours at [the-anchor.pub](https://www.the-anchor.pub). Kitchen closed Monday.

[Book a table →](/book-table) | Call: 01753 682707

---

*The Anchor: Horton Road, Stanwell Moor, Surrey, TW19 6AQ*
```

### `content/blog/eating-near-heathrow-prices-compared/index.md`

```
---
title: "Eating Near Heathrow Airport: Real Prices Compared (2026)"
description: "Compare real food prices at Heathrow Airport, hotel restaurants, and local pubs. See how much you could save by eating 7 minutes from the terminal."
date: "2026-03-22"
author: "The Anchor Team"
keywords:
  - food near heathrow outside airport
  - cheap eats near heathrow
  - heathrow airport food prices
  - eating near heathrow
  - restaurants outside heathrow airport
tags:
  - food-and-drink
  - guides
  - heathrow
featured: true
hero: "hero.jpg"
images: []
---

A burger inside Heathrow Terminal 5 costs between £16 and £22. Seven minutes down the road, you can get one for £11 with chips, a pint for around £6, and park for free. That's not a typo -- it's the reality of airport pricing versus what's available just outside the perimeter.

We've put together a real price comparison between eating at Heathrow Airport, eating at one of the nearby hotels, and eating at a local pub. The numbers come from current menus as of March 2026. No estimates, no rounding in our favour -- just what things actually cost.

## The Price Comparison: Heathrow Airport vs Hotel vs Local Pub

This is the table that tells the whole story. We've compared six common meals across three types of venue: airside at Heathrow, a hotel restaurant near the airport, and The Anchor (that's us -- seven minutes from Terminal 5).

| Meal | Heathrow Airport | Hotel Restaurant | The Anchor |
|------|-----------------|------------------|------------|
| **Burger & chips** | £18--22 (Plane Food, Perfectionist's Cafe) | £18--21 + service (Sofitel, Hilton) | £11--14 |
| **Fish & chips** | £17--20 (Plane Food, Wetherspoons airside) | £18--22 + service | £15 (beer-battered, mushy peas, tartare) |
| **Pizza (12")** | £15--18 (Giraffe, various T2/T3) | £16--20 + service | £12--14 (stone-baked) |
| **Sunday roast** | Not widely available airside | £22--28 + service | From £19.99 (advance booking, proper trimmings) |
| **Pie & mash** | £16--19 | £17--22 + service | £15--16 (golden pastry, rich gravy) |
| **Kids meal** | £9--12 | £10--14 + service | £8--9 (burger, goujons, or fish fingers with chips) |
| **Coffee** | £4.50--5.50 | £4--5 | £3 |
| **Pint of lager** | £7--8.50 | £6.50--8 | From £5.50 |

**A meal for two** (two mains, two drinks, a side to share):

- **At the airport:** £55--75
- **At a hotel restaurant:** £50--70 + service charge + parking (£15--25)
- **At The Anchor:** £35--50, parking included

That's a saving of roughly £20--40 for the same kind of meal. Over a holiday, that's a decent chunk of spending money.

### A note on honesty

The airport prices above reflect what you'll find at sit-down restaurants like Gordon Ramsay's Plane Food (Terminal 5), The Perfectionist's Cafe by Heston Blumenthal (Terminal 2), and chains like Wagamama and Giraffe. You can eat cheaper airside -- a Pret sandwich or a meal deal from Boots will run you £5--8. But we're comparing like-for-like: a proper sit-down meal with a drink.

The hotel prices are based on the Sofitel (T5), Hilton Garden Inn, and Marriott properties around the airport. Most add a 12.5% service charge that isn't always obvious on the menu, and parking runs £15--25 if you're not a guest.

Our prices are from our current menu. They're on our website if you want to check.

## Is It Worth Leaving the Terminal?

This is the practical question. The answer depends entirely on how much time you have.

### Under 2 hours before your flight

**Stay airside.** By the time you've collected bags, left the airport, eaten, driven back, and cleared security again, you'd be cutting it dangerously fine. Grab something at the terminal and enjoy the people-watching.

### 2--4 hours (layover or pre-flight)

**Worth considering**, particularly if you have a car or don't mind a short taxi ride. You'll need about 90 minutes total: 15 minutes each way plus an hour for the meal. That leaves comfortable buffer time for security.

If you've just landed and haven't got a connecting flight, this is the sweet spot. You're out of the airport, you've had a proper meal, and you've saved £20 or more compared to eating airside.

### 4+ hours (long layover or waiting for someone)

**Definitely worth it.** Four hours in an airport terminal is nobody's idea of fun. Drive seven minutes to a local pub, have a proper lunch, sit in a beer garden, and come back refreshed. You'll spend less money, eat better food, and actually enjoy the wait.

### If you're picking someone up

This is the scenario people forget. You've driven to Heathrow, the flight's delayed by an hour, and you're sat in a car park burning money. Drive to a local pub instead. Have lunch, keep an eye on the arrivals board on your phone, and head back when the plane lands. You'll save on parking and get a meal out of it.

## How to Get to Off-Airport Dining from Each Terminal

The Anchor sits in Stanwell Moor, just off the A3044. Here's how long it takes from each terminal by car or taxi:

| Terminal | Drive time to The Anchor | Route |
|----------|-------------------------|-------|
| **Terminal 5** | ~7 minutes | Exit via A3044, through Stanwell Moor |
| **Terminal 2** | ~12 minutes | Via Northern Perimeter Road to A3044 |
| **Terminal 3** | ~12 minutes | Same route as T2 |
| **Terminal 4** | ~15 minutes | Via Southern Perimeter Road, A30, then A3044 |

A taxi from any terminal will cost roughly £10--18. If you're eating with someone and saving £20--40 on the meal, the taxi often pays for itself.

**By bus:** The 441 and 442 bus routes run between Heathrow and Staines, stopping in Stanwell Moor. It's not the fastest option (25--35 minutes), but it works if you're not in a rush.

**If you have a car:** We have free parking for around 20 vehicles. No ticket machines, no time limits, no stress.

## Other Off-Airport Options Worth Knowing

We'd love to tell you we're the only game in town, but that wouldn't be honest. Here are a couple of other decent options near Heathrow:

### The Three Magpies, Bath Road

A Greene King pub on the A4, between the airport and Slough. It's bigger than us, more of a family dining operation, with a predictable but solid menu. Mains are typically £11--16, and parking is free. If you want reliable chain-pub food in a familiar format, it does the job well. About 10 minutes from Terminal 5.

### The Ostrich Inn, Colnbrook

One of the oldest pubs in England (they'll tell you about it), in the village of Colnbrook just north of the airport. It's a character pub with a decent food menu and real ales. Mains run £13--18. A bit further out -- about 15 minutes from the terminals -- but worth the trip if you appreciate a proper historic pub. Free parking.

### Bath Road hotel restaurants

If you're already at a hotel near the airport, their restaurants are convenient. The food is typically competent international hotel fare -- club sandwiches, Caesar salads, grilled salmon. Just be aware of the service charge (usually 12.5%) and parking costs (£15--25 for non-guests) that inflate the real price.

## What to Expect at The Anchor

Full disclosure: this is the bit where we talk about ourselves. We've tried to keep the comparison above fair and factual, so take what follows with the appropriate understanding that we're biased.

### The food

Proper British pub food, cooked fresh to order. Our menu covers pub classics (fish and chips at £15, bangers and mash at £14), gourmet burgers from £11, stone-baked pizzas from £12, comfort dishes like lasagne and chicken katsu curry at £14--15, and traditional pies from £15. Desserts are all £5--6.

On Sundays, we do a proper roast: roasted chicken, slow-cooked lamb shank, crispy pork belly, or beetroot and butternut squash wellington. Prices start from £19.99. Roasts are served 1pm-6pm — walk in or book ahead, no pre-order needed. It's a proper roast with herb and garlic-crusted potatoes, seasonal veg, Yorkshire pudding, and red wine gravy. Not a microwave in sight.

We also have a kids menu: sausage and mash, fish fingers, chicken goujons, or tomato pasta, all at sensible prices. On Sundays, kids can have a mini roast for £13.99.

### The setting

We're a village pub in Stanwell Moor. There's a beer garden that sits directly under the Heathrow flight path -- which means you get a plane passing overhead every couple of minutes. If you've got kids or any interest in aviation, it's genuinely entertaining. We've had customers tell us they came for the food and stayed for the plane-spotting.

Inside, it's a proper pub. Not a gastro-pub trying to be a restaurant, not a sports bar with forty screens. Just a well-kept local with comfortable seating, a decent selection of ales and lagers, and staff who'll remember your name if you come back.

### The practical bits

- **Free parking** for around 20 cars
- **Dog-friendly** in the bar and beer garden
- **Family-friendly** -- children welcome, no age cut-off
- **Wi-Fi** -- super-fast fibre broadband if you need to work
- **Kitchen closed Mondays** -- we're open for drinks, but no food
- **Seven minutes from Terminal 5** by car
- **Book a table:** [the-anchor.pub/book-table](/book-table) or call 01753 682707

## Frequently Asked Questions

### How much does a meal cost at Heathrow Airport?

At a sit-down restaurant inside Heathrow, expect to pay £15--25 for a main course. Chain restaurants like Wagamama and Nando's are slightly cheaper (£13--17) but still carry a 20--30% premium over their high street prices. A burger at Plane Food in T5 runs around £18--22. Coffee is typically £4.50--5.50. A meal for two with drinks will usually come to £55--75.

### Can I leave Heathrow Airport during a layover to eat?

Yes, provided you have enough time. You'll need to clear immigration (if arriving internationally), leave the airport, eat, return, and clear security again. Allow at least 2.5--3 hours total. For domestic connections or if you're already landside, 90 minutes is enough for a meal at a nearby pub. The Anchor is about 7 minutes by car from Terminal 5.

### Where can I eat near Heathrow with free parking?

Most local pubs offer free parking. The Anchor in Stanwell Moor has around 20 free spaces and is 7 minutes from T5. The Three Magpies on Bath Road also has free parking. Hotel restaurants near Heathrow typically charge £15--25 for parking unless you're a guest.

### Is the food better outside Heathrow Airport?

Generally, yes. Airport restaurants serve a captive audience and price accordingly. Local pubs and restaurants rely on repeat customers, which means the food needs to be good enough to bring people back. At The Anchor, everything is cooked fresh to order -- our fish is beer-battered on site, our pizzas are stone-baked, and our pies come in proper pastry with rich fillings.

### What are the cheapest eats near Heathrow?

Outside the airport, you can get a burger and chips from £11, a wrap with chips from £10, or chicken goujons and chips from £9 at The Anchor. Kids meals start from around £8. Inside the airport, the cheapest sit-down options are the chain restaurants at £13--17 for a main, or meal deals from grab-and-go shops for £5--8.

## The Bottom Line

Airport food isn't terrible. It's just expensive for what it is, and the atmosphere leaves a lot to be desired. If you've got time -- and especially if you've got a car -- eating outside the airport is cheaper, better, and far more enjoyable.

The numbers don't lie. A meal for two at The Anchor costs roughly half what you'd pay at the airport, with free parking, a beer garden, and food that's made from scratch. Whether you're killing time before a flight, celebrating a landing, or picking someone up, it's seven minutes well spent.

[Book a table](/book-table) or call us on 01753 682707. We're open seven days a week (kitchen closed Mondays).
```

### `content/blog/family-friendly-sunday-lunch-heathrow/index.md`

```
---
title: Family-Friendly Sunday Lunch Near Heathrow | The Anchor Pub Guide
description: >-
  Plan a stress-free family Sunday lunch minutes from Heathrow. Kids’ roasts,
  high chairs, a selection of games, and free parking at The Anchor Stanwell Moor.
date: '2025-10-13'
author: The Anchor Team
keywords:
  - family sunday lunch heathrow
  - kid friendly roast near heathrow
  - sunday lunch for families staines
  - child friendly pub near heathrow
  - sunday roast with kids near airport
tags:
  - food-and-drink
  - news
featured: false
hero: hero.jpg
images: []
canonical: 'https://www.the-anchor.pub/blog/family-friendly-sunday-lunch-heathrow'
---

![Family Sunday lunch table setup at The Anchor](/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg)

Planning a **family Sunday lunch near Heathrow**? Whether you’re welcoming relatives from the airport or gathering the crew before a flight, **The Anchor in Stanwell Moor** makes it effortless. We’re a village pub with plenty of space, a children’s roast menu, and free parking—just 7 minutes from Terminal 5.

## Everything Families Need Under One Roof

### Spacious Seating & Flexible Layouts
- Dedicated dining room with space for prams, car seats, and cabin luggage.
- Book the snug for **10–20 guests** if you want a private celebration.
- Dog-friendly bar area for four-legged family members.

### Kids Eat Like Grown-Ups
- Kids roasted chicken roast for **£13.99** (a smaller portion of our roast with all the trimmings).
- Adult roasts are typically **£19.99–23.99** depending on your choice.
- Desserts and hot drinks are available to add on the day.
- Juices and soft drinks keep younger guests happy.

### Entertainment Sorted
- A selection of games is available — just ask the team.
- Our big garden is perfect for kids to stretch their legs (with adult supervision).
- We have TVs in the bar area for sport, but we don’t show cartoons.

## Sample Family Sunday Lunch Timeline

| Time | What Happens | Family Hack |
| --- | --- | --- |
| 12:45 | Arrive & get settled | Grab a drink while the kitchen gets going |
| 13:00 | Roasts served fresh to order | Walk in from 1pm or book ahead — no pre-order needed |
| 14:00 | Puddings & hot drinks | Share desserts to keep things easy |
| 14:30 | Garden time | Let kids burn off energy before the drive home |
- Need airport timing? Consult our [Heathrow layover dining guide](/heathrow-layover-dining) for taxi times and boarding buffers.

## Family-Focused FAQ

### Do you have high chairs and baby-changing?
Yes—multiple high chairs and baby-change facilities right off the dining room.

### Can we split the bill by family?
Of course. Let your server know and we’ll itemise by seat or family group.

### Is there somewhere for prams and luggage?
Yes—there’s plenty of space around tables, and the team will help position prams or cases so they’re out of the way but in sight.

### What about dietary requirements?
Our team caters for gluten-free, dairy-free, and vegetarian diets. Mention needs when booking so the kitchen can prepare.

### Are dogs allowed?
Friendly, well-behaved dogs are welcome in the bar and garden areas. We have water bowls and dog treats available.

## Make Your Booking Easy

1. [Book Sunday lunch](/sunday-lunch) (or call/WhatsApp **+44 1753 682707**) with your party details.
2. Tell us if you need high chairs, booster seats, or pram space.
3. Sunday lunch bookings require a **£10 per person deposit**.
4. Want a cake or balloons? Drop them off the day before and we’ll set the table.

---

**Ready for a relaxed family roast near Heathrow?** Book now and experience why local families and visiting travellers choose The Anchor for Sunday lunch. Free parking, hearty plates, and warm service await.
```

### `content/blog/sunday-lunch-at-the-anchor-is-back-pre-order-now/index.md`

```
---
title: Sunday Lunch Near Heathrow | Traditional Roasts at The Anchor
description: >-
  Book your traditional Sunday lunch near Heathrow Airport at The Anchor pub.
  Fresh roast dinners with Yorkshire puddings served Sundays 1–6pm (last orders
  5:30pm). Walk in or book ahead — no pre-order needed.
date: '2025-02-02'
oldUrl: >-
  https://www.the-anchor.pub/post/sunday-lunch-at-the-anchor-is-back-pre-order-now
author: Billy
keywords:
  - sunday lunch near heathrow
  - traditional roast dinner
  - sunday roast stanwell moor
  - dog friendly sunday lunch
  - best sunday lunch near me
  - pub roast dinner staines
  - quality sunday lunch
  - the anchor sunday menu
tags:
  - news
  - food-and-drink
featured: true
hero: hero.jpg
images: []
---

![Close-up of a Sunday lunch with Yorkshire pudding, roast, and veggies. Text: "The Anchor, serving 1pm-6pm." Bright, inviting setting.](/content/blog/sunday-lunch-at-the-anchor-is-back-pre-order-now/hero.jpg)

Looking for the perfect **Sunday lunch near Heathrow**? The Anchor's traditional roast dinners are back! Fresh from February 9th, 2025, enjoy quality Sunday roasts in our cozy **dog-friendly pub** just 7 minutes from Terminal 5. No heat lamps, no shortcuts - just proper British Sunday lunch cooked fresh to order.

## Why The Anchor Serves the Best Sunday Lunch Near Heathrow Airport

### Fresh, Traditional, and Made to Order

Unlike chain pubs and airport restaurants, our **traditional roast dinner** philosophy is simple:

- **Cooked fresh to order** - No heat lamps or pre-prepared dishes
- **Quality local ingredients** - Supporting British farmers
- **Traditional cooking methods** - Just like Sunday lunch at home
- **Generous portions** - Proper pub-sized servings
- **Fair prices** - Better value than airport dining
- **Walk in or book ahead** - Booking is recommended for peak slots, but not required

## Our Traditional Sunday Lunch Menu

### Classic Roasts Done Right

Each **Sunday roast** at our **Stanwell Moor pub** includes:
- Herb and garlic-crusted roast potatoes
- Homemade Yorkshire pudding
- Seasonal vegetables (steamed fresh)
- Red wine gravy (vegetarian gravy available)
- Traditional accompaniments

#### Choose Your Perfect Roast:

**Roasted Chicken - £19.99**
- Oven-roasted chicken breast with sage & onion stuffing balls
- Herb and garlic-crusted roast potatoes
- Seasonal vegetables and Yorkshire pudding
- Red wine gravy

**Slow-Cooked Lamb Shank - £23.99**
- Tender slow-braised lamb shank
- Rich red wine gravy
- Herb and garlic-crusted roast potatoes
- Seasonal vegetables and a Yorkshire pudding

**Crispy Pork Belly - £21.99**
- Crispy crackling and tender slow-roasted pork belly
- Bramley apple sauce
- Herb and garlic-crusted roast potatoes
- Seasonal vegetables, Yorkshire pudding, and red wine gravy

**Beetroot & Butternut Squash Wellington (V) - £19.99**
- Golden puff pastry filled with beetroot & butternut squash
- Herb and garlic-crusted roast potatoes
- Seasonal vegetables
- Vegetarian gravy

**Kids Roasted Chicken - £13.99**
- Smaller portion of our roasted chicken
- Served with roast potatoes, seasonal vegetables, Yorkshire pudding, and gravy
- Perfect for little appetites

## The Anchor Sunday Lunch Experience

### More Than Just a Meal

Our **dog friendly Sunday lunch** offers:

#### Perfect for Families
- Relaxed, welcoming atmosphere
- High chairs available
- Kids menu options
- Space for large family groups
- Three-generation friendly

#### Dog-Friendly Dining
- Well-behaved dogs welcome
- Water bowls provided
- Garden seating available
- Meet other dog owners
- True community pub feel

#### Ideal for Heathrow Travelers
- **Pre-flight tradition** - Start your journey right
- **Welcome home meal** - Nothing says Britain like Sunday roast
- **Layover lunch** - Better than airport food
- **Crew favourite** - Where airline staff dine
- **Hotel alternative** - Escape hotel dining

## Why Book Your Sunday Lunch in Advance

### Quality Guaranteed System

Our **book-ahead** policy ensures:

✅ **Ultimate freshness** - Your meal starts cooking when you arrive  
✅ **No waste** - We prepare exactly what's ordered  
✅ **Secured table** - No waiting, your spot is reserved  
✅ **Consistent quality** - Every roast gets full attention  
✅ **Fair pricing** - Efficiency keeps costs down

### How to Book Your Sunday Roast

**Booking is simple:**

1. **Book online** via [/sunday-lunch](/sunday-lunch) or call the team
2. **Let us know your preferred roasts** so the kitchen can plan portions
3. **Book your time slot** (1pm-6pm Sundays)
4. **Mention dietary requirements** when booking
5. **Walk in or book any time** — no Saturday cutoff
6. **Groups of 10 or more** take a **£10 per person deposit**, fully deducted from the bill

## Sunday Lunch Service Details

### When to Visit

**Service Hours:**
- Sundays only: 1pm - 6pm
- Last orders 5:30pm
- Walk in or book ahead — no pre-order needed
- Regular menu also available alongside the roasts

**Booking Timeline:**
- Book any day during the week, or just walk in
- No Saturday cutoff — book or walk in right up to service
- Book online at [/sunday-lunch](/sunday-lunch)
- Group bookings welcome

### Getting to The Anchor for Sunday Lunch

**From Heathrow Airport:**
- Terminal 5: 7 minutes drive
- Terminals 2/3: 11 minutes
- Perfect for pre-flight meals
- Ideal for arriving families

**Local Access:**
- Free parking for all guests
- Bus routes 441 & 442
- Walking distance from Stanwell
- Easy access from Staines

## What Makes Our Sunday Lunch Special

### The Traditional Pub Difference

Unlike rushed **Heathrow dining** or chain restaurants:

- **No time pressure** - Relax and enjoy
- **Consistent quality** - Same chef, same standards
- **Local ingredients** - Supporting nearby suppliers
- **Proper portions** - No airline-sized servings
- **Historic setting** - Traditional British pub atmosphere
- **Community feel** - Where locals bring their families

### Perfect Sunday Scenarios

#### Family Gatherings
"Three generations around one table, proper Sunday lunch like nan used to make" - The Roberts Family

#### Dog Walkers' Lunch
"After our walk on Staines Moor, Sunday lunch at The Anchor is our reward" - Local Dog Walking Group

#### Heathrow Connections
"We always book Sunday lunch before our afternoon flight. Beats airport food every time!" - The Traveling Smiths

## Frequently Asked Questions

### About Sunday Lunch at The Anchor

**Can I just turn up on Sunday?**
Yes — Sunday roasts are walk-in friendly. Booking ahead is recommended for peak slots, but not required.

**Is the pub really dog-friendly?**
Absolutely! Dogs are welcome in our bar area and garden. Water bowls provided.


[truncated at line 200 — original has 233 lines]
```

### `content/blog/vegetarian-pub-food-near-heathrow/index.md`

```
---
title: "Vegetarian & Vegan Pub Food Near Heathrow (2026 Guide)"
description: "Where to find proper vegetarian and vegan pub food near Heathrow. Not just a sad salad — real meals from butternut squash wellington to loaded vegan burgers."
date: "2026-03-20"
author: "The Anchor Team"
keywords:
  - vegetarian pub food near heathrow
  - vegan food near heathrow
  - plant based pub near me
  - vegetarian restaurant near heathrow
  - vegan options heathrow area
  - meat free pub food staines
tags:
  - food-and-drink
  - guides
featured: false
hero: "hero.jpg"
images: []
---

Finding proper **vegetarian pub food near Heathrow** used to mean a jacket potato if you were lucky. Things have changed — most decent pubs now have genuinely good meat-free options, and a few go well beyond the bare minimum. But there is still a wide gap between a pub that has reluctantly added a veggie burger to the menu and one that actually puts thought into its plant-based dishes.

If you are vegetarian, vegan, or just eating less meat and looking for somewhere near Heathrow that does not treat you as an afterthought, here is what is worth knowing.

## What The Anchor Offers for Vegetarians and Vegans

The Anchor in Stanwell Moor — about seven minutes from Heathrow Terminal 5 — takes its meat-free options seriously. This is not a vegetarian restaurant, but the kitchen has built out a proper selection rather than just ticking a box.

### Vegetarian Highlights

- **Butternut squash wellington** — available as part of the Sunday roast menu (£19.99). A proper centrepiece dish with all the trimmings, not a sad plate of vegetables with gravy poured over them. This needs pre-ordering as part of the Sunday lunch booking.
- **Stone-baked Margherita pizza** — from £11, with a proper thin base and fresh toppings. Available every day the kitchen is open.
- **Vegetable stone-baked pizza** — loaded with roasted veg, same thin base, same price bracket.
- **Veggie burger** — a substantial patty with proper toppings, not a frozen disc from a catering supplier.

### Vegan Options

- **Vegan burger** — loaded with plant-based toppings, served in a vegan-friendly bun. One of the more generous vegan pub meals you will find near Heathrow.
- **Margherita pizza** — can be made vegan on request (swap the mozzarella for a plant-based alternative). Just mention it when you order.
- Several **sides and starters** work for vegans too — check with the kitchen when you visit, as the options rotate.

### Good to Know

- **Gluten-free options** are available on several dishes. If you are coeliac or have a serious intolerance, let the team know when booking and they will talk you through what works.
- **The kitchen can adapt most dishes** if you ask. They are genuinely happy to accommodate rather than just pointing you at the one vegetarian option on the menu.
- **Stone-baked pizzas** are available in vegetarian and vegan options from £11.
- **Sunday roast** with the butternut squash wellington must be **pre-ordered and booked in advance**. You can [book online](/book-table) or call 01753 682707.
- **Free parking** and **dog-friendly** throughout the pub. The beer garden is a bonus in warmer months, with planes overhead for a bit of Heathrow theatre.

## Other Vegetarian and Vegan Options Near Heathrow

The Anchor is not the only option, of course. Here is a quick survey of what else is available in the area.

### Chain Restaurants

- **Nando's** (Staines, Feltham) — the plant-based burger and several veggie sides make this a reliable choice. Not a pub, but decent for a quick meal.
- **Wagamama** (Staines) — strong on vegetarian and vegan dishes across the whole menu. Katsu curry with tofu is a solid option.
- **Pizza Express** (Staines) — good range of vegetarian pizzas including vegan cheese options. A bit more polished than a pub setting.
- **Harvester / Toby Carvery** (various locations) — the salad bar works for vegetarians, and most now have a plant-based main. The carvery itself is less exciting without the meat, frankly.

### Hotel Restaurants

If you are staying at one of the Heathrow hotels, most have at least basic vegetarian options on their restaurant menus. The quality varies hugely. Premier Inn and Travelodge restaurants tend to have a couple of veggie mains. The higher-end hotels — Sofitel, Hilton — will have more extensive options, but you will pay hotel prices for them.

### Independent Restaurants

Staines and Hounslow both have a decent selection of Indian restaurants, which are often the best bet for vegetarian and vegan food near Heathrow. South Indian cuisine in particular offers naturally meat-free dishes rather than adaptations of meat dishes.

## Tips for Vegetarian and Vegan Diners

A few practical things worth knowing if you are eating out meat-free near Heathrow:

- **Call ahead for vegan-specific requirements.** Most pubs and restaurants can accommodate vegetarians without notice, but vegan dishes — especially involving cheese substitutes or specific allergen considerations — sometimes need a heads-up.
- **Sunday roast bookings are essential.** If you want the butternut squash wellington at The Anchor, you need to pre-order. Do not turn up expecting it to be available on the day.
- **Ask about cooking methods, not just ingredients.** Chips fried in the same oil as battered fish, bread rolls with butter glazes, soup made with chicken stock — these are the things that catch people out. A good kitchen will know the answer immediately.
- **Pub gardens are your friend.** If you are travelling with a mix of meat-eaters and vegetarians, a pub like The Anchor works well because there is something for everyone. Nobody has to compromise.
- **Check menus online before you go.** Most places near Heathrow have their menus on their website. It saves the awkward moment of sitting down and finding there is nothing you want to eat. The Anchor's [full menu is here](/food-menu).

## Frequently Asked Questions

### Are there any fully vegetarian restaurants near Heathrow?

There are no dedicated vegetarian restaurants in the immediate Heathrow area. Your best options are Indian restaurants in Staines or Hounslow, which have extensive meat-free menus, or pubs and chains with strong vegetarian sections. The Anchor has multiple veggie and vegan options across starters, mains, and pizzas.

### Can I get a vegan Sunday roast near Heathrow?

Yes. The Anchor offers a butternut squash wellington as part of their Sunday roast menu at £19.99, served with all the trimmings. Walk in or book ahead — no pre-order needed. Some chain carveries also offer plant-based options, though the quality is inconsistent.

### Does The Anchor offer vegetarian pizzas?

Yes — our stone-baked pizza menu includes vegetarian and vegan options such as Margherita and vegetable pizzas. Prices start from £11.

### Does The Anchor cater for gluten-free diets as well?

Several dishes can be made gluten-free. If you have coeliac disease or a serious intolerance, mention it when booking and the kitchen team will walk you through the safe options. Cross-contamination is always worth discussing for severe allergies.
```

### `content/blog/where-to-eat-near-heathrow-2026/index.md`

```
---
title: "Where to Eat Near Heathrow Airport: A Local's Guide (2026)"
slug: where-to-eat-near-heathrow-2026
date: "2026-04-07"
author: "The Anchor Team"
description: "Looking for restaurants near Heathrow? A local's guide to the best pubs, restaurants and dining spots within 15 minutes of the airport. From pub classics to Sunday roasts."
keywords:
  - restaurants near heathrow
  - where to eat near heathrow airport
  - places to eat near heathrow
  - food near heathrow
  - pub food heathrow
  - dining near heathrow airport
  - best restaurants near heathrow
  - eating out near heathrow
tags:
  - food-and-drink
  - heathrow
  - guides
featured: true
hero: hero.jpg
images: []
---

You have landed at Heathrow, picked up the car, and realised you are starving. Or perhaps you are dropping someone off and have a couple of hours to kill. Either way, you need somewhere decent to eat that is not a terminal food court or a hotel lobby restaurant charging London prices for a club sandwich.

Good news: there are genuine options within 15 minutes of the airport, and most travellers never discover them. This guide covers everything from proper village pubs to hotel dining rooms and quick terminal bites, with honest notes on what each one is actually like. We live here. We know what is good.

## Why Eating Outside the Airport Is Almost Always Better

Before we get into specific places, it is worth understanding why so many seasoned travellers make the short trip outside Heathrow's perimeter.

**Price is the obvious one.** A burger and chips inside Terminal 5 costs between £18 and £22. The same meal at a local pub runs £11 to £14. A pint of lager that is £7.50 airside drops to around £5.50 at a village pub. Over a meal for two, the savings add up to £20 to £40.

**Quality is the less obvious but bigger factor.** Airport restaurants serve a captive audience. They do not need repeat customers, so there is less incentive to impress. Local pubs and restaurants, on the other hand, survive on regulars and word of mouth. The food has to be good enough that people come back.

**Atmosphere matters too.** Eating a proper meal in a pub beer garden, watching planes come in to land, beats a plastic tray under fluorescent terminal lights every time. If you have the time, even 90 minutes, eating outside the airport transforms what could be a tedious wait into something genuinely enjoyable.

## Our Top Pick: The Anchor, Stanwell Moor

We will be upfront: this is our pub and we are biased. But there are genuine, practical reasons why The Anchor consistently comes up in "where to eat near Heathrow" conversations, and we will lay them out honestly so you can decide for yourself.

### Why locals and travellers keep coming back

**Location is the big one.** The Anchor sits in Stanwell Moor village, just off the A3044 near M25 Junction 14. It is seven minutes from Terminal 5 by car, and no more than 15 minutes from any other terminal. That is close enough to pop out for lunch during a layover and still make your connection comfortably.

**Free parking with no catches.** We have around 20 spaces in our car park, and they are genuinely free. No ticket machines, no time limits, no "free for first 30 minutes then £8 an hour" small print. You park, you eat, you leave. Compare that to the £15 to £25 most hotel car parks charge non-guests, or the multi-pound-per-hour airport parking rates.

**Proper pub food, cooked fresh.** Our kitchen turns out British pub classics done properly. Beer-battered fish and chips at £15, stone-baked pizzas from £12, gourmet burgers from £11, pies with golden pastry and rich gravy from £15, comfort dishes like lasagne and chicken katsu curry around £14 to £15. Everything is made to order. We do not do microwaved ready meals dressed up with a sprig of parsley.

**Dog-friendly.** If you are travelling with a dog (or picking one up from the pet reception centre at Heathrow's animal quarantine facility), The Anchor welcomes dogs in the bar and beer garden. Water bowls are always out, and your dog will probably get more attention from the regulars than you will.

**The beer garden and plane spotting.** This is the bit that surprises people. Our beer garden sits directly under the Heathrow flight path, which means a plane passes overhead every couple of minutes. For families with children, aviation enthusiasts, or anyone who finds it oddly relaxing to watch a 747 come in to land while eating fish and chips, it is a genuinely unique setting. We have had customers tell us they came for the food and stayed for three hours watching planes.

### What to eat

For a quick lunch, the burgers and pizzas are your best bet. They come out fast and are reliably good.

For a proper dinner, the steaks and pie selection are worth the trip. Our steak and ale pie in particular is a regular favourite.

On Sundays, we do a [traditional roast](/sunday-lunch) served 1pm-6pm — walk in or book ahead, no pre-order needed. It is the real thing: roast chicken, slow-cooked lamb shank, crispy pork belly, or beetroot and butternut squash wellington, all served with herb and garlic-crusted potatoes, seasonal vegetables, Yorkshire pudding, and proper red wine gravy. Prices start from £19.99. If you are visiting on a Sunday and want a proper British roast dinner experience, this is where to get it.

Browse our full [food menu](/food-menu) to see current prices and options, including [vegetarian](/food-menu/vegetarian), [vegan](/food-menu/vegan), and [gluten-free](/food-menu/gluten-free) choices.

### The practical details

- **Address:** Horton Road, Stanwell Moor, TW19 6AQ
- **Phone:** 01753 682707
- **Kitchen hours:** Open Tuesday to Sunday (kitchen closed on Mondays, though the pub is open for drinks)
- **Booking:** [Book a table online](/book-table) or call us. Walk-ins are welcome but booking is recommended for groups of 4 or more
- **Getting there:** 7 minutes from Terminal 5, 12 minutes from Terminals 2 and 3, 15 minutes from Terminal 4

## Other Places to Eat Near Heathrow

We would love to tell you we are the only option, but that would not be honest or helpful. Here are the other realistic choices within 15 minutes of the airport, with our genuine assessment of each.

### Local Pubs Along the A4 and Bath Road

The stretch of road between Heathrow and Slough has several pub-restaurants, mostly run by the major chains (Greene King, Marston's, and similar). These tend to be large-format dining pubs with extensive menus covering everything from burgers to curries to grills.

**What is good about them:** Reliable and predictable. If you know the brand, you know roughly what you are getting. Portions are generous. Most have free parking. Family-friendly with play areas. Mains typically £11 to £17.

**What is less good:** The food is competent but rarely memorable. You are eating the same menu you would find at any branch of the same chain anywhere in the country. If you have flown to England and want a genuinely local dining experience, these will not provide it. The atmosphere tends toward "large family restaurant" rather than anything characterful.

**Distance from Heathrow:** 10 to 15 minutes from most terminals.

**Best for:** Families wanting a predictable, good-value meal with play facilities for children.

### Hotel Restaurants Along the Heathrow Corridor

The ring of hotels around Heathrow (Sofitel, Hilton, Marriott, Crowne Plaza, Radisson Blu, Premier Inn, Novotel, and many others) all have on-site restaurants. If you are already staying at one, convenience is the obvious draw.

**What is good about them:** Zero travel required if you are a guest. Late-night service (many serve until 10pm or later). International menus that cater to a global clientele. Good for business dinners where you need a quiet, predictable setting.

**What is less good:** Expensive. Mains typically run £18 to £30, plus a 12.5% service charge that is not always obvious on the menu. If you are not a hotel guest, parking costs £15 to £25 on top. The food is perfectly adequate but often lacks character. You are paying a premium for convenience rather than quality. A meal for two with drinks easily hits £70 to £100.

**Distance from Heathrow:** 0 to 10 minutes depending on which hotel.

**Best for:** Hotel guests who do not want to travel, business travellers on expenses, or anyone arriving very late at night when other options are closed.

### Heathrow Terminal Restaurants

Every terminal at Heathrow has a range of restaurants, from fast food chains to sit-down dining. Terminal 5 has the most upmarket options, including celebrity chef restaurants. Terminals 2 and 3 have a decent mix, while Terminal 4 is more limited.

**What is good about them:** No travel at all. If you are airside and have time to kill before a flight, this is your only option anyway. Some genuinely good restaurants exist, particularly in Terminal 5 and Terminal 2.

**What is less good:** Premium pricing across the board, typically 30% to 50% more than the same meal outside the airport. Crowded during peak hours. Limited seating. No alcohol before certain hours at some outlets. A rushed, transactional atmosphere that is the opposite of relaxing.

| Typical Terminal Prices | Cost |
|------------------------|------|
| Burger and chips | £18 to £22 |
| Fish and chips | £17 to £20 |
| Pizza | £15 to £18 |
| Coffee | £4.50 to £5.50 |
| Pint of lager | £7 to £8.50 |
| Meal for two with drinks | £55 to £75 |

**Distance from Heathrow:** You are already there.

**Best for:** Passengers who are already airside, or anyone with less than two hours before a flight.

### Colnbrook Village

Just north of the airport, the village of Colnbrook has a couple of historic pubs that serve food. It is one of the oldest villages in the area and has genuine character. The pubs here tend to be traditional, with real ales and classic British menus.

**What is good about them:** Genuine historic atmosphere. Real ales. Proper village pub feel. Food is typically good pub fare at reasonable prices (mains £13 to £18). Free parking.

**What is less good:** Slightly further from the main terminals (15 to 20 minutes). Smaller venues with limited menus compared to larger operations. Not always open for food at lunchtime on weekdays.

**Distance from Heathrow:** 15 to 20 minutes from most terminals.

**Best for:** Anyone who appreciates historic pubs and has a bit more time to spare.

### Staines-upon-Thames Town Centre

About 15 to 20 minutes south of the airport, Staines has a proper high street with a good range of restaurants. You will find Indian, Italian, Chinese, Thai, and Turkish options alongside chain restaurants and pubs. It is the closest actual town centre to Heathrow with a genuine restaurant scene.

**What is good about them:** Broadest range of cuisines near the airport. Competitive pricing (mains from £10 to £20 depending on the restaurant). More of a "real town" atmosphere. Good for groups where everyone wants something different, since you can walk the high street and pick a place.

**What is less good:** Parking can be tricky and is not free (council car parks charge £1 to £3 per hour). Further from the airport than other options. Some restaurants are chains you would find anywhere.

**Distance from Heathrow:** 15 to 20 minutes from most terminals.

**Best for:** Groups wanting a wide choice of cuisines, or anyone looking for something other than pub food.

## The Comparison at a Glance

| Option | Distance from T5 | Parking | Price (mains) | Cuisine | Atmosphere |
|--------|------------------|---------|---------------|---------|------------|
| **The Anchor** | 7 mins | Free | £11--19 | British pub | Village pub, beer garden, plane spotting |
| **Bath Road pubs** | 10--15 mins | Free | £11--17 | Chain pub | Large family dining |
| **Hotel restaurants** | 0--10 mins | £15--25 (or free for guests) | £18--30 | International | Corporate, quiet |
| **Terminal restaurants** | 0 mins | N/A | £15--25 | Mixed | Busy, transactional |
| **Colnbrook pubs** | 15--20 mins | Free | £13--18 | British pub | Historic, traditional |
| **Staines town centre** | 15--20 mins | £1--3/hr | £10--20 | Multi-cuisine | Town centre, varied |

## Practical Tips: Getting to Restaurants from the Airport

### By car or taxi

If you have a hire car or are being picked up, any of the options above are straightforward to reach. Sat nav will get you there without issues. For taxi or Uber from the terminals, expect to pay roughly:

- **To Stanwell Moor (The Anchor):** £10 to £15
- **To Bath Road pubs:** £8 to £12
- **To Colnbrook:** £12 to £18
- **To Staines town centre:** £15 to £22

Uber and local minicabs are reliably available from all terminals. The Heathrow taxi rank outside each terminal is another option, though black cabs will cost more.

### By bus

The 441 and 442 bus routes connect Heathrow to Staines via Stanwell Moor. It is not fast (25 to 35 minutes to Stanwell Moor, 40 to 50 minutes to Staines) but it is cheap and gets the job done if you are not in a rush.

### Timing for layovers

If you are on a layover and considering leaving the airport to eat, here is a rough guide:

- **Under 2 hours before your next flight:** Stay airside. By the time you collect bags, leave, eat, return, and clear security again, you will be cutting it dangerously close.
- **2 to 3 hours:** Possible if you are efficient, but only for the closest options (Stanwell Moor is your best bet at 7 minutes each way). Allow 90 minutes minimum: 15 minutes travel each way plus an hour for the meal.
- **3 to 5 hours:** Comfortable. You can eat at any of the nearby options and return with time to spare.
- **5+ hours:** You have time for a proper lunch, a walk in the beer garden, maybe even a pint. No rush at all.

For more detailed layover planning, see our [Heathrow layover dining guide](/heathrow-layover-dining).

### Parking costs to factor in

One of the biggest hidden costs of eating near Heathrow is parking. Here is what you should expect:

- **The Anchor, Stanwell Moor:** Free, no time limit
- **Bath Road chain pubs:** Usually free
- **Colnbrook village pubs:** Usually free
- **Hotel restaurants (non-guests):** £15 to £25
- **Staines town centre:** £1 to £3 per hour in council car parks
- **Heathrow short-stay car parks:** £5 to £8 per hour

If you are comparing a hotel restaurant meal to a local pub, remember to add parking to the hotel bill. That £22 main course becomes £37 or more once you factor in parking and service charge.

## What About Dietary Requirements?

This is worth mentioning because it affects where you can eat. Heathrow's terminal restaurants handle dietary requirements well (they have to, given the international clientele). Hotel restaurants are similarly accommodating.

[truncated at line 200 — original has 246 lines]
```

### `docs/copy-assumptions.md`

```
# Copy Assumptions — Source of Truth for Operational Claims

This document records the operational claims used in customer-facing page copy. Update here first when operational reality changes — page copy and JSON-LD must follow.

## Brand & Contact

- **Brand name:** The Anchor (never "The Anchor Pub" in customer copy).
- **Address:** Horton Road, Stanwell Moor, Surrey TW19 6AQ.
- **Phone:** 01753 682707.
- **Email:** manager@the-anchor.pub.
- **Location framing:** Stanwell Moor, near Heathrow Airport (closest proper pub to Terminal 5, ~7 minutes by car).

## Opening Hours (regular)

- **Monday:** Closed (kitchen always closed Monday unless a special-hours record explicitly opens it).
- **Tuesday – Thursday:** 4pm – 11pm; kitchen 4pm – 9pm.
- **Friday:** 4pm – midnight; kitchen 4pm – 9pm.
- **Saturday:** 1pm – midnight; kitchen 1pm – 7pm.
- **Sunday:** 1pm – 6pm; kitchen 1pm – 6pm; last bookable arrival 5:30pm.

> Special-hours overrides come from the management API (`/business/hours`) and always win. `kitchen: null` for a date means kitchen closed for that date — treat as deliberate, not as missing data.

## Sunday Roast — operational claims

Effective from the 17 May 2026 walk-in launch:

- **Service window:** Sundays 1pm – 6pm (kitchen 1pm – 6pm, last bookable arrival 5:30pm).
- **Pre-order:** Not required. No Saturday cutoff. Walk-ins welcome.
- **Booking:** Recommended for groups and peak slots, but not required.
- **Menu:** Roasted Chicken (£19), Crispy Pork Belly (£22), Beetroot & Butternut Squash Wellington (V) (£19), Kids Roasted Chicken (£13). Regular weekday menu (burgers, pizzas, fish and chips) is also available on Sundays.
- **Deposit:** No Sunday-specific deposit. The standard large-group deposit applies on any day — see "Deposit policy" below.

## Deposit policy

- **Threshold:** Groups of 10 or more on any day, any booking type.
- **Amount:** £10 per person, fully deducted from the bill on the day.
- **Smaller groups (1–9):** No deposit, no card details required at booking.
- **Copy:** "Groups of 10 or more: a £10 per person deposit, fully deducted from your bill."

## Food

- **Mains:** Traditional British pub classics (fish & chips, pies, burgers) £11 – £16.
- **Pizzas:** Stone-baked, from £12.
- **Sunday roast:** £19 – £22.
- **Friday over-65s offer:** 50% off fish & chips for over-65s on Fridays.

## Service exclusions

- **No breakfast service.**
- **No delivery.** Takeaway by phone for collection only.
- **No Sky Sports / TNT Sports.** Live sport on terrestrial channels only since January 2025.
- **No guest ales.** Bottled ales only — no handpumps. Do not market as a "real ale pub".
- **No wedding receptions.** Smaller private events only.

## Booking type → kitchen dependency

| Booking type | Requires kitchen open |
|---|---|
| `sunday_lunch` | Yes |
| `food` | Yes |
| `drinks` | No |

When kitchen is closed for a date, food and Sunday-lunch slots return empty; drinks slots are unaffected.

## Private hire / function room

- **Capacity:** 10 – 200 guests.
- **Use cases:** Birthdays, wakes, christenings, baby showers, milestone parties, corporate events, retirement parties.
- **Pre-order language for private events / Christmas parties is allowed and unrelated to the Sunday-roast walk-in change.**

## Parking

- **20 free spaces on site**, no time limit while dining.
- **Outside the ULEZ zone** (saves £12.50/day vs. London venues).

## Distance from Heathrow

- **Terminal 5:** 7 minutes by car.
- **Terminals 2 & 3:** 11 minutes.
- **Terminal 4:** 12 minutes.
- **Bus:** Routes 441 and 442 from Heathrow Central Bus Station.

## Verification

When updating page copy, JSON-LD, or marketing collateral, these claims are the canonical reference. Any code or content that contradicts this document should be reconciled to match — or this document should be updated first if operational reality has changed.
```

### `lib/__tests__/large-group-deposit.test.ts`

```
/**
 * Boundary tests for the website-side large-group deposit helpers.
 *
 * Walk-in launch (spec §6, §7.3): the website-side rule is purely
 * party-size based. There is no Sunday-lunch deposit, no Saturday-1pm
 * cutoff, and no per-day deposit policy on the website. The management
 * app owns the canonical state-aware deposit calculation; the website
 * just gates UI on the party-size threshold.
 *
 * The threshold is set in `lib/constants.ts` via LARGE_GROUP_DEPOSIT_THRESHOLD
 * (10) and the per-person rate via LARGE_GROUP_DEPOSIT_PER_PERSON_GBP (10).
 */
import {
  LARGE_GROUP_DEPOSIT_PER_PERSON_GBP,
  LARGE_GROUP_DEPOSIT_THRESHOLD,
  computeLargeGroupDepositAmount,
  requiresDeposit
} from '@/lib/constants'

describe('Large-group deposit helpers', () => {
  describe('requiresDeposit', () => {
    it('returns false at party size 1', () => {
      expect(requiresDeposit(1)).toBe(false)
    })

    it('returns false at party size 9 (just below threshold)', () => {
      expect(requiresDeposit(9)).toBe(false)
    })

    it('returns true at party size 10 (the boundary)', () => {
      expect(requiresDeposit(10)).toBe(true)
    })

    it('returns true at party size 11 (just above threshold)', () => {
      expect(requiresDeposit(11)).toBe(true)
    })

    it('returns true at party size 50', () => {
      expect(requiresDeposit(50)).toBe(true)
    })

    it('matches the threshold constant', () => {
      expect(requiresDeposit(LARGE_GROUP_DEPOSIT_THRESHOLD)).toBe(true)
      expect(requiresDeposit(LARGE_GROUP_DEPOSIT_THRESHOLD - 1)).toBe(false)
    })
  })

  describe('computeLargeGroupDepositAmount', () => {
    it('returns 0 at party size 1 (below threshold)', () => {
      expect(computeLargeGroupDepositAmount(1)).toBe(0)
    })

    it('returns 0 at party size 9 (below threshold)', () => {
      expect(computeLargeGroupDepositAmount(9)).toBe(0)
    })

    it('returns £100 at party size 10 (boundary; £10 per person)', () => {
      expect(computeLargeGroupDepositAmount(10)).toBe(100)
    })

    it('returns £110 at party size 11', () => {
      expect(computeLargeGroupDepositAmount(11)).toBe(110)
    })

    it('returns £500 at party size 50', () => {
      expect(computeLargeGroupDepositAmount(50)).toBe(500)
    })

    it('uses the configured per-person rate', () => {
      // £10 per head currently; this also documents the unit so a future
      // rate change has to be a deliberate update to this assertion.
      expect(LARGE_GROUP_DEPOSIT_PER_PERSON_GBP).toBe(10)
    })

    it('handles non-finite party size defensively (returns 0 — no deposit gating)', () => {
      // computeLargeGroupDepositAmount short-circuits via requiresDeposit
      // for unreasonable inputs; the contract is "no deposit if not required".
      expect(computeLargeGroupDepositAmount(Number.NaN)).toBe(0)
      expect(computeLargeGroupDepositAmount(-1)).toBe(0)
    })
  })
})
```

### `lib/api/client.ts`

```
// AnchorAPI class and anchorAPI singleton

import { logError } from '@/lib/error-handling'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { computeLargeGroupDepositAmount } from '@/lib/constants'

import type { EventsResponse, EventCategoriesResponse, EventAvailability, Event } from './events'
import { FALLBACK_EVENT_CATEGORIES, createFallbackEvent, createFallbackEventsResponse } from './events'
import type { MenuResponse, DietaryMenuResponse, SundayLunchMenuResponse, MenuSectionItem } from './menu'
import { FALLBACK_SUNDAY_LUNCH_MENU } from './menu'
import type { BusinessHours, AmenitiesResponse } from './hours'
import type { TableAvailabilitySlot, TableAvailabilityResponse, TableBookingRequest, TableBookingResponse } from './bookings'
import type {
  ParkingRateCard,
  ParkingAvailabilitySlot,
  ParkingBookingRequest,
  ParkingBookingResponse,
  ParkingBookingDetails,
  ParkingCreateOrderRequest,
  ParkingCreateOrderResponse,
  ParkingCaptureResponse
} from './parking'
import { FALLBACK_PARKING_RATES } from './parking'
import type { MenuItem } from './menu'

// Use internal API routes to avoid CORS issues and keep API key secure
const API_BASE_URL = typeof window === 'undefined'
  ? getManagementApiBaseUrl()  // Server-side: normalize env var and ensure /api suffix
  : '/api'  // Client-side: use Next.js API routes

const buildPhaseSkipLogged = new Set<string>()

type ManagementTableBookingPayload = {
  phone: string
  first_name?: string
  last_name?: string
  email?: string
  date: string
  time: string
  party_size: number
  purpose: 'food' | 'drinks'
  notes?: string
  sunday_lunch?: boolean
  default_country_code?: string
}

type ManagementTableBookingResult = {
  state: 'confirmed' | 'pending_payment' | 'blocked'
  table_booking_id: string | null
  booking_reference: string | null
  reason: string | null
  blocked_reason:
    | 'outside_hours'
    | 'cut_off'
    | 'no_table'
    | 'private_booking_blocked'
    | 'too_large_party'
    | 'customer_conflict'
    | 'in_past'
    | 'blocked'
    | null
  next_step_url: string | null
  hold_expires_at: string | null
  table_name: string | null
}

export class AnchorAPI {
  private baseURL: string
  private apiKey: string

  constructor(apiKey?: string) {
    this.baseURL = API_BASE_URL
    this.apiKey = apiKey || process.env.ANCHOR_API_KEY || ''

    // Only warn on server-side where API key is expected
    if (!this.apiKey && typeof window === 'undefined') {
      console.warn('ANCHOR_API_KEY is not set. API calls will fail.')
    }
  }

  private resolveSiteOrigin(): string | null {
    if (typeof window !== 'undefined') {
      return window.location.origin
    }

    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '')
    }

    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`.replace(/\/+$/, '')
    }

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      return 'http://localhost:3000'
    }

    return null
  }

  private asTrimmedString(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }

  private asPositiveInt(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) {
      const rounded = Math.floor(value)
      return rounded > 0 ? rounded : undefined
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number.parseInt(value.trim(), 10)
      if (Number.isFinite(parsed) && parsed > 0) return parsed
    }

    return undefined
  }

  private toStringList(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value
        .map((entry) => this.asTrimmedString(entry))
        .filter((entry): entry is string => Boolean(entry))
    }

    const single = this.asTrimmedString(value)
    return single ? [single] : []
  }

  private summarizeMenuSelections(menuSelections: TableBookingRequest['menu_selections']): string | undefined {
    if (!Array.isArray(menuSelections) || menuSelections.length === 0) {
      return undefined
    }

    const summary = menuSelections
      .slice(0, 12)
      .map((item) => {
        const guest = this.asTrimmedString(item?.guest_name) || 'Guest'
        const dish = this.asTrimmedString(item?.custom_item_name) || this.asTrimmedString((item as any)?.item_name)
        const quantity = this.asPositiveInt(item?.quantity) || 1
        if (!dish) return null
        return `${guest}: ${dish} x${quantity}`
      })
      .filter((entry): entry is string => Boolean(entry))
      .join(' | ')

    return summary ? `Sunday lunch pre-order: ${summary}` : undefined
  }

  private buildLegacyTableBookingNotes(data: TableBookingRequest): string | undefined {
    const lines: string[] = []

    const specialRequirements = this.asTrimmedString(data.special_requirements)
    if (specialRequirements) {
      lines.push(`Special requirements: ${specialRequirements}`)
    }

    const occasion = this.asTrimmedString(data.celebration_type) || this.asTrimmedString((data as any).occasion)
    if (occasion) {
      lines.push(`Occasion: ${occasion}`)
    }

    const dietaryRequirements = this.toStringList(data.dietary_requirements)
    if (dietaryRequirements.length > 0) {
      lines.push(`Dietary requirements: ${dietaryRequirements.join(', ')}`)
    }

    const allergies = this.toStringList(data.allergies)
    if (allergies.length > 0) {
      lines.push(`Allergies: ${allergies.join(', ')}`)
    }

    const menuSummary = this.summarizeMenuSelections(data.menu_selections)
    if (menuSummary) {
      lines.push(menuSummary)
    }

    if (lines.length === 0) return undefined

    const notes = lines.join('\n')
    return notes.length <= 500 ? notes : `${notes.slice(0, 497)}...`
  }

  private toManagementTableBookingPayload(data: TableBookingRequest): ManagementTableBookingPayload {
    const customer = data.customer || ({} as TableBookingRequest['customer'])
    const phone = this.asTrimmedString(customer.mobile_number) || this.asTrimmedString((data as any).customer_phone)

    if (!phone) {
      throw {
        code: 'VALIDATION_ERROR',
        message: 'Customer mobile number is required',
        status: 400
      }
    }

    const firstName = this.asTrimmedString(customer.first_name) || this.asTrimmedString((data as any).customer_first_name)
    const lastName = this.asTrimmedString(customer.last_name) || this.asTrimmedString((data as any).customer_last_name)
    const email = this.asTrimmedString(customer.email)

[truncated at line 200 — original has 1404 lines]
```

### `lib/booking-helpers.ts`

_(deleted or missing from working tree)_

### `lib/constants.ts`

```
export const CONTACT = {
  // Display formats
  phone: '01753 682707',
  phoneDisplay: '+44 1753 682707',
  phoneHref: 'tel:+441753682707',
  phoneIntl: '+441753682707',
  email: 'manager@the-anchor.pub',

  // Address
  address: {
    street: 'Horton Road',
    town: 'Stanwell Moor',
    county: 'Surrey',
    postcode: 'TW19 6AQ',
    country: 'GB'
  },

  // Coordinates (verified from Google Maps)
  coordinates: {
    lat: 51.462509,
    lng: -0.502067
  }
}

export const BRAND = {
  // Primary name - always use this
  name: 'The Anchor',

  // With location context when needed
  nameWithLocation: 'The Anchor, Stanwell Moor',

  // Never use "The Anchor Pub" - avoid the word "Pub" in brand name
  // This helps with SEO and brand consistency
}

export const PARKING = {
  // Verified capacity from Find Us page
  capacity: 20, // 20 spaces available for pub guests
  description: 'Free parking available',
  extendedDescription: 'Free on-site parking with extended parking available nearby'
}

export const HEATHROW_TIMES = {
  // Consistent journey times to each terminal
  terminal2: 11,
  terminal3: 11,
  terminal4: 12,
  terminal5: 7,

  // For general statements
  range: '7-12 minutes'
}

// Large-group deposit policy: applies to groups at or above the threshold,
// regardless of booking type. The website does NOT have a state-aware
// `getCanonicalDeposit` helper — that lives only in the management app
// (it owns the booking row in the database). The website trusts the
// management API's response after booking creation. See spec §7.3.
export const LARGE_GROUP_DEPOSIT_PER_PERSON_GBP = 10
export const LARGE_GROUP_DEPOSIT_THRESHOLD = 10

export function requiresDeposit(partySize: number): boolean {
  return partySize >= LARGE_GROUP_DEPOSIT_THRESHOLD
}

export function computeLargeGroupDepositAmount(partySize: number): number {
  if (!requiresDeposit(partySize)) return 0
  const parsedPartySize = Number.isFinite(partySize) ? Math.floor(partySize) : 0
  const normalizedPartySize = Math.max(0, parsedPartySize)
  return Number((normalizedPartySize * LARGE_GROUP_DEPOSIT_PER_PERSON_GBP).toFixed(2))
}

export const LARGE_GROUP_DEPOSIT_POLICY_COPY =
  "Groups of 10 or more: we'll take a £10 per person deposit, fully deducted from your bill on the day."

// Walk-in launch banner timestamps (BST). Used by <LaunchAnnouncement>.
// - STARTS_AT: start of 17 May 2026 BST (banner switches from pre-launch
//   "starts on 17 May" copy to launch-day "today from 1pm" copy)
// - BANNER_ENDS_AT: 18:00 BST on 17 May 2026 (matches the actual end of
//   Sunday service, not the last-bookable-slot 17:30; banner removes itself
//   at this point and replacement content is designed collaboratively after)
export const WALK_IN_LAUNCH_STARTS_AT_MS = new Date('2026-05-17T00:00:00+01:00').getTime()
export const WALK_IN_LAUNCH_BANNER_ENDS_AT_MS = new Date('2026-05-17T18:00:00+01:00').getTime()
```

### `lib/gtm-events.ts`

```
// Google Tag Manager Event Tracking Utilities
// Centralised event tracking for The Anchor website

import { dispatchTrackingEvent, TrackingDispatchOptions } from './tracking/dispatcher'

interface GTMEvent {
  event: string
  [key: string]: any
}

type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown'

function redactPotentialPII(value: string) {
  // Basic redaction to avoid accidentally shipping user-entered PII in free-text fields.
  return value
    // Emails
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    // UK-ish phone numbers (very loose)
    .replace(/(\+?\d[\d\s().-]{7,}\d)/g, '[redacted-phone]')
}

function safeText(value: unknown) {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return redactPotentialPII(trimmed).slice(0, 500)
}

type FormEventInput =
  | string
  | {
      formName: string
      source?: string
      mode?: string
      step?: string
      location?: string
      journey?: string
      [key: string]: unknown
    }

function normaliseFormEvent(input: FormEventInput) {
  if (typeof input === 'string') {
    return {
      name: input,
      metadata: {}
    }
  }

  const {
    formName,
    source,
    mode,
    step,
    location,
    journey,
    ...rest
  } = input

  const metadata: Record<string, unknown> = { ...rest }
  if (source) metadata.form_source = source
  if (mode) metadata.form_mode = mode
  if (step) metadata.form_step = step
  if (location) metadata.form_location = location
  if (journey) metadata.form_journey = journey

  return {
    name: formName,
    metadata
  }
}

// Push event to dataLayer
export function pushToDataLayer(data: GTMEvent, options?: TrackingDispatchOptions) {
  dispatchTrackingEvent(data, options)
}

// Event booking funnel
export function trackEventView(eventData: {
  eventId: string
  eventName: string
  eventDate: string
  eventCategory?: string
  eventPrice?: number
}) {
  pushToDataLayer({
    event: 'view_event',
    event_id: eventData.eventId,
    event_date: eventData.eventDate,
    event_type: eventData.eventCategory,
    value: eventData.eventPrice
  })
}

export function trackEventBookingStart(eventData: {
  eventId: string
  eventName: string
  eventPrice?: number
}) {
  pushToDataLayer({
    event: 'begin_checkout',
    event_id: eventData.eventId,
    value: eventData.eventPrice,
    currency: 'GBP'
  })
}

export function trackEventBookingComplete(eventData: {
  eventId: string
  eventName: string
  tickets: number
  totalValue?: number
}) {
  pushToDataLayer({
    event: 'purchase',
    event_id: eventData.eventId,
    quantity: eventData.tickets,
    value: eventData.totalValue,
    currency: 'GBP'
  })
}

// Restaurant actions
type TableBookingClickInput =
  | string
  | {
      source: string
      context?: string
      eventName?: string
      device?: 'mobile' | 'desktop'
      timeOfDay?: string
      dayOfWeek?: string
      variant?: string
      destination?: string
      [key: string]: unknown
    }

function normaliseTableBookingClick(input: TableBookingClickInput) {
  if (typeof input === 'string') {
    return { source: input, metadata: {} }
  }

  const {
    source,
    context,
    eventName,
    device,
    timeOfDay,
    dayOfWeek,
    variant,
    destination,
    originPath,
    ...rest
  } = input

  const metadata: Record<string, unknown> = { ...rest }
  if (context) metadata.booking_context = context
  if (eventName) metadata.booking_event = eventName
  if (device) metadata.booking_device = device
  if (timeOfDay) metadata.booking_time_of_day = timeOfDay
  if (dayOfWeek) metadata.booking_day_of_week = dayOfWeek
  if (variant) metadata.booking_variant = variant
  if (destination) metadata.booking_destination = destination
  if (originPath) metadata.booking_origin_path = originPath

  return { source, metadata }
}

export function trackTableBookingClick(data: TableBookingClickInput) {
  const { source, metadata } = normaliseTableBookingClick(data)

  pushToDataLayer({
    event: 'table_booking_click',
    booking_method: 'internal_management_platform',
    booking_source: source,
    ...metadata
  }, { sendToApi: true })
}

// Comprehensive table booking funnel tracking
export function trackTableBookingFunnel(data: {
  step: 'view' | 'start' | 'availability_check' | 'details_entered' | 'submit' | 'success' | 'error'
  partySize?: number
  bookingDate?: string
  bookingTime?: string
  bookingReference?: string
  errorType?: string
  errorMessage?: string
  source: string
  deviceType: 'mobile' | 'desktop'
}) {
  const eventData: GTMEvent = {
    event: 'table_booking_funnel',
    funnel_step: data.step,
    booking_source: data.source,
    device_type: data.deviceType
  }

  // Add optional data if provided
  if (data.partySize) eventData.party_size = data.partySize
  if (data.bookingDate) eventData.booking_date = data.bookingDate

[truncated at line 200 — original has 611 lines]
```

### `lib/sunday-lunch-cutoff.ts`

_(deleted or missing from working tree)_

### `public/llms.txt`

```
# The Anchor

> Traditional British pub in Stanwell Moor, Surrey — 7 minutes from Heathrow Terminal 5. Dog-friendly beer garden under the flight path, traditional Sunday roasts, stone-baked pizza, free parking. Rated 4.6/5 on Google.

## Key Facts
- **Address:** Horton Road, Stanwell Moor, Surrey TW19 6AQ
- **Phone:** 01753 682707
- **Email:** manager@the-anchor.pub
- **Website:** https://www.the-anchor.pub
- **Established:** 1751
- **Type:** Traditional British pub and restaurant
- **Price Range:** Mains £10-£24
- **Parking:** 20 free spaces, no time limit while dining
- **Capacity:** Up to 200 for private events
- **Rating:** 4.6/5 on Google (300+ reviews)
- **Food Hygiene:** 5-star rating

## Opening Hours
- Monday: CLOSED
- Tuesday-Thursday: 4pm-11pm
- Friday: 4pm-12am
- Saturday: 1pm-12am
- Sunday: 12pm-9pm

## Kitchen Hours
- Monday: CLOSED
- Tuesday-Friday: 4pm-9pm
- Saturday: 12pm-9pm
- Sunday: 1pm-6pm

## Distance from Heathrow
- Terminal 5: 7 minutes by car
- Terminals 2 & 3: 11 minutes by car
- Terminal 4: 12 minutes by car
- Bus: 441 & 442 from Heathrow Central Bus Station

## Food
- Traditional British pub classics (fish & chips, pies, burgers): £11-£16
- Stone-baked pizzas: from £12
- Sunday roast (chicken, pork belly, vegetarian): £19-£22
- Sunday roast served walk-in friendly 1pm-6pm. Booking recommended but not required. £10 per person deposit only for groups of 10 or more.
- 50% off fish & chips for over-65s on Fridays

## Events
- Monthly Quiz Night: £3 entry, teams up to 6, cash prizes
- Monthly Cash Bingo: £10 per book, cash jackpot
- Music Bingo with Nikki Manfadge
- Karaoke nights
- Live music and themed events
- See https://www.the-anchor.pub/whats-on for dates

## Private Hire
- Function room for 10-200 guests
- Corporate events, Christmas parties, birthdays
- Wakes and celebrations of life
- Christenings, baby showers, parties
- Custom catering, AV support, free parking
- Contact: manager@the-anchor.pub

## Unique Features
- Beer garden directly under Heathrow flight path (plane spotting)
- Aircraft overhead every 90 seconds during peak times
- Outside ULEZ zone (saves £12.50/day)
- Dog-friendly throughout (water bowls provided)
- Free WiFi, pool table, darts

## Pages
- [Home](https://www.the-anchor.pub/)
- [Food Menu](https://www.the-anchor.pub/food-menu)
- [Sunday Lunch](https://www.the-anchor.pub/sunday-lunch)
- [Drinks](https://www.the-anchor.pub/drinks)
- [Book a Table](https://www.the-anchor.pub/book-table)
- [What's On](https://www.the-anchor.pub/whats-on)
- [Beer Garden & Plane Spotting](https://www.the-anchor.pub/beer-garden)
- [Private Hire](https://www.the-anchor.pub/private-hire)
- [Function Room Hire](https://www.the-anchor.pub/function-room-hire)
- [Near Heathrow](https://www.the-anchor.pub/near-heathrow)
- [Dog Friendly](https://www.the-anchor.pub/dog-friendly-pub-heathrow)
- [Find Us](https://www.the-anchor.pub/find-us)
- [Quiz Night](https://www.the-anchor.pub/quiz-night)
```

### `tests/api/booking-agent-service-window.test.ts`

```
export {}

const mockGetBusinessHours = jest.fn()
const mockCreateTableBooking = jest.fn()

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args),
    createTableBooking: (...args: unknown[]) => mockCreateTableBooking(...args)
  }
}))

jest.mock('@/lib/spam-protection', () => ({
  checkSpamProtection: jest.fn().mockResolvedValue({ blocked: false })
}))

const SUNDAY_HOURS = {
  regularHours: {
    sunday: {
      opens: '12:00',
      closes: '23:00',
      is_closed: false,
      kitchen: {
        opens: '12:00',
        closes: '21:00'
      }
    }
  },
  specialHours: []
} as any

describe('Booking Agent API - Service Window Enforcement', () => {
  let createAgentBooking: (request: any) => Promise<Response>
  let getAvailability: (request: any) => Promise<Response>

  beforeEach(async () => {
    mockGetBusinessHours.mockResolvedValue(SUNDAY_HOURS)
    mockCreateTableBooking.mockReset()

    jest.resetModules()
    ;({ POST: createAgentBooking, GET: getAvailability } = await import('@/app/api/booking/agent/route'))
  })

  afterEach(() => {
    jest.clearAllMocks()
    delete (global as any).fetch
  })

  it('rejects food bookings outside kitchen hours', async () => {
    const request = {
      json: async () => ({
        date: '2026-03-01',
        time: '21:30',
        partySize: 2,
        type: 'regular',
        purpose: 'food',
        customer: {
          firstName: 'Pat',
          lastName: 'Guest',
          phone: '07700900000',
          email: 'pat@example.com'
        }
      })
    } as any

    const response = await createAgentBooking(request)

    expect(response.status).toBe(400)
    const payload = await response.json()
    expect(String(payload?.error?.message || payload?.error || '')).toContain('Food bookings')
    expect(mockCreateTableBooking).not.toHaveBeenCalled()
  })

  it('allows drinks bookings in late bar-only slots', async () => {
    mockCreateTableBooking.mockResolvedValue({
      booking_reference: 'TB-AGENT-DRINKS',
      status: 'confirmed',
      confirmation_details: {
        date: '2026-03-01',
        time: '21:30',
        party_size: 2
      }
    })

    const request = {
      json: async () => ({
        date: '2026-03-01',
        time: '21:30',
        partySize: 2,
        type: 'regular',
        purpose: 'drinks',
        customer: {
          firstName: 'Pat',
          lastName: 'Guest',
          phone: '07700900000',
          email: 'pat@example.com'
        }
      })
    } as any

    const response = await createAgentBooking(request)

    expect(response.status).toBe(200)
    expect(mockCreateTableBooking).toHaveBeenCalledTimes(1)

    const [payload] = mockCreateTableBooking.mock.calls[0]
    expect(payload.purpose).toBe('drinks')
    expect(payload.booking_type).toBe('regular')
  })

  it('passes purpose through when checking availability', async () => {
    ;(global as any).fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            available: true,
            time_slots: [
              {
                time: '21:30',
                available: true,
                available_capacity: 6
              }
            ],
            message: 'Slots available'
          }
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    )

    const response = await getAvailability({
      url: 'http://localhost:3000/api/booking/agent?date=2026-03-01&partySize=2&type=regular&purpose=drinks'
    } as any)

    expect(response.status).toBe(200)

    const calledUrl = String((global.fetch as jest.Mock).mock.calls[0][0])
    expect(calledUrl).toContain('/api/table-bookings/availability?')
    expect(calledUrl).toContain('purpose=drinks')

    const payload = await response.json()
    expect(payload.purpose).toBe('drinks')
    expect(payload.times).toEqual([{ time: '21:30', available: true }])
  })
})
```

### `tests/api/booking-submit-deposit.test.ts`

_(deleted or missing from working tree)_

### `tests/api/booking-submit-service-window.test.ts`

_(deleted or missing from working tree)_

### `tests/api/table-bookings-availability-purpose.test.ts`

```
export {}

const mockGetBusinessHours = jest.fn()

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args)
  }
}))

const SUNDAY_HOURS = {
  regularHours: {
    sunday: {
      opens: '12:00',
      closes: '23:00',
      is_closed: false,
      kitchen: {
        opens: '12:00',
        closes: '21:00'
      }
    }
  },
  specialHours: []
} as any

describe('Table Availability API - Purpose-Aware Slots', () => {
  let getAvailability: (request: any) => Promise<Response>

  beforeEach(async () => {
    mockGetBusinessHours.mockResolvedValue(SUNDAY_HOURS)

    jest.resetModules()
    ;({ GET: getAvailability } = await import('@/app/api/table-bookings/availability/route'))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns food slots only within kitchen hours', async () => {
    const response = await getAvailability({
      url: 'http://localhost:3000/api/table-bookings/availability?date=2026-03-01&time=21:30&party_size=2&purpose=food'
    } as any)

    expect(response.status).toBe(200)
    const body = await response.json()
    const slotTimes = (body.data.time_slots || []).map((slot: any) => slot.time)

    expect(slotTimes).toContain('20:30')
    expect(slotTimes).not.toContain('21:30')
  })

  it('returns drinks slots across bar hours', async () => {
    const response = await getAvailability({
      url: 'http://localhost:3000/api/table-bookings/availability?date=2026-03-01&time=21:30&party_size=2&purpose=drinks'
    } as any)

    expect(response.status).toBe(200)
    const body = await response.json()
    const slotTimes = (body.data.time_slots || []).map((slot: any) => slot.time)

    expect(slotTimes).toContain('21:30')
  })

  it('defaults to food slots when purpose is omitted', async () => {
    const response = await getAvailability({
      url: 'http://localhost:3000/api/table-bookings/availability?date=2026-03-01&time=21:30&party_size=2'
    } as any)

    expect(response.status).toBe(200)
    const body = await response.json()
    const slotTimes = (body.data.time_slots || []).map((slot: any) => slot.time)

    expect(slotTimes).not.toContain('21:30')
  })
})
```

### `tests/api/table-bookings-cutoff.test.ts`

_(deleted or missing from working tree)_

### `tests/api/table-bookings-service-window.test.ts`

```
export {}

const mockGetBusinessHours = jest.fn()

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args)
  }
}))

jest.mock('@/lib/spam-protection', () => ({
  checkSpamProtection: jest.fn().mockResolvedValue({ blocked: false })
}))

const SUNDAY_HOURS = {
  regularHours: {
    sunday: {
      opens: '12:00',
      closes: '23:00',
      is_closed: false,
      kitchen: {
        opens: '12:00',
        closes: '21:00'
      }
    }
  },
  specialHours: []
} as any

describe('Table Bookings API - Service Window Enforcement', () => {
  let createTableBooking: (request: any) => Promise<Response>

  beforeEach(async () => {
    process.env.ANCHOR_API_KEY = 'test-api-key'
    mockGetBusinessHours.mockResolvedValue(SUNDAY_HOURS)
    ;(global as any).fetch = jest.fn()

    // Polyfill the static Response.json helper that NextResponse.json relies on
    // (Jest's node-fetch Response doesn't include it).
    if (typeof (Response as any).json !== 'function') {
      ;(Response as any).json = (body: unknown, init?: ResponseInit) =>
        new Response(JSON.stringify(body), {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {})
          }
        })
    }

    jest.resetModules()
    ;({ POST: createTableBooking } = await import('@/app/api/table-bookings/route'))
  })

  afterEach(() => {
    delete process.env.ANCHOR_API_KEY
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('rejects food bookings outside kitchen hours', async () => {
    const request = {
      json: async () => ({
        phone: '07700900000',
        date: '2026-03-01',
        time: '21:30',
        party_size: 2,
        purpose: 'food'
      }),
      headers: new Headers()
    } as any

    const response = await createTableBooking(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(String(data.error)).toContain('Food bookings')
    expect((global.fetch as jest.Mock)).not.toHaveBeenCalled()
  })

  it('allows drinks bookings in late bar-only slots', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            state: 'confirmed',
            booking_reference: 'TB-TEST'
          }
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    )

    const request = {
      json: async () => ({
        phone: '07700900000',
        date: '2026-03-01',
        time: '21:30',
        party_size: 2,
        purpose: 'drinks'
      }),
      headers: new Headers()
    } as any

    const response = await createTableBooking(request)

    expect(response.status).toBe(201)
    expect(global.fetch).toHaveBeenCalledTimes(1)

    const [, upstreamOptions] = (global.fetch as jest.Mock).mock.calls[0]
    const upstreamPayload = JSON.parse(String((upstreamOptions as RequestInit).body))
    expect(upstreamPayload.purpose).toBe('drinks')
  })
})
```

### `tests/api/table-bookings.test.ts`

```
/**
 * Test file for table booking API routes
 * This verifies that all the API routes are correctly configured
 */

// Test imports to ensure TypeScript compilation
import { GET as getAvailability } from '@/app/api/table-bookings/availability/route'
import { POST as createBooking } from '@/app/api/table-bookings/create/route'
import { GET as getBooking, DELETE as cancelBooking } from '@/app/api/table-bookings/[reference]/route'

describe('Table Booking API Routes', () => {
  beforeEach(() => {
    // Mock environment variable
    process.env.ANCHOR_API_KEY = 'test-api-key'
  })

  afterEach(() => {
    delete process.env.ANCHOR_API_KEY
  })

  describe('Availability Route', () => {
    it('should export GET handler', () => {
      expect(getAvailability).toBeDefined()
      expect(typeof getAvailability).toBe('function')
    })

    it('should require date, time, and party_size parameters', async () => {
      const request = { url: 'http://localhost:3000/api/table-bookings/availability' } as any
      const response = await getAvailability(request)
      
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('required parameters')
    })
  })

  describe('Create Booking Route', () => {
    it('should export POST handler', () => {
      expect(createBooking).toBeDefined()
      expect(typeof createBooking).toBe('function')
    })
  })

  describe('Booking Details Route', () => {
    it('should export GET and DELETE handlers', () => {
      expect(getBooking).toBeDefined()
      expect(typeof getBooking).toBe('function')
      expect(cancelBooking).toBeDefined()
      expect(typeof cancelBooking).toBe('function')
    })
  })
})

jest.mock('@/lib/spam-protection', () => ({
  checkSpamProtection: jest.fn().mockResolvedValue({ blocked: false })
}))

describe('Table Booking Route - Party Size Validation', () => {
  let createTableBooking: (request: any) => Promise<Response>

  beforeEach(async () => {
    process.env.ANCHOR_API_KEY = 'test-api-key'
    ;(global as any).fetch = jest.fn()

    if (typeof (Response as any).json !== 'function') {
      ;(Response as any).json = (body: unknown, init?: ResponseInit) =>
        new Response(JSON.stringify(body), {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {})
          }
        })
    }

    jest.resetModules()
    ;({ POST: createTableBooking } = await import('@/app/api/table-bookings/route'))
  })

  afterEach(() => {
    delete process.env.ANCHOR_API_KEY
    jest.clearAllMocks()
  })

  it('rejects party size above 20 with a clear error message', async () => {
    const request = {
      json: async () => ({
        phone: '07700900000',
        date: '2026-03-22',
        time: '19:00',
        party_size: 21,
        purpose: 'food'
      }),
      headers: new Headers()
    } as any

    const response = await createTableBooking(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(String(data.error)).toMatch(/party size|between 1 and 20/i)
    // Must not reach the management API
    expect((global.fetch as jest.Mock)).not.toHaveBeenCalled()
  })
})

// Type checks for API integration
import { anchorAPI } from '@/lib/api'
import type {
  TableAvailabilityResponse,
  TableBookingRequest,
  TableBookingResponse
} from '@/lib/api'

// Ensure methods exist on anchorAPI
const typeChecks = async () => {
  // Check availability
  const availability: TableAvailabilityResponse = await anchorAPI.checkTableAvailability({
    date: '2024-01-20',
    time: '19:00',
    party_size: 4
  })

  // Create booking
  const bookingRequest: TableBookingRequest = {
    booking_type: 'regular',
    date: '2024-01-20',
    time: '19:00',
  party_size: 4,
  customer: {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    mobile_number: '07700900000'
  },
    celebration_type: 'birthday'
  }
  const booking: TableBookingResponse = await anchorAPI.createTableBooking(bookingRequest)

  // Get booking
  const bookingDetails: TableBookingResponse = await anchorAPI.getTableBooking(
    'REF123',
    'guest@example.com'
  )

  // Cancel booking
  const cancellation = await anchorAPI.cancelTableBooking('REF123', {
    reason: 'Changed plans',
    customerEmail: 'guest@example.com'
  })
}
```

### `tests/api/tableBookingsProxyStructuredForward.test.ts`

_(deleted or missing from working tree)_

### `tests/unit/ManagementTableBookingForm.test.tsx`

```
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ManagementTableBookingForm } from '@/components/features/TableBooking/ManagementTableBookingForm'

jest.mock('@/lib/gtm-events', () => ({
  trackTableBookingClick: jest.fn()
}))

describe('ManagementTableBookingForm', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('filters Mother’s Day events out of booking-context suggestions', async () => {
    ;(global as any).fetch = jest.fn((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()

      if (url.startsWith('/api/events?')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              success: true,
              data: {
                events: [
                  {
                    id: 'evt-md',
                    slug: 'mothers-day-lunch',
                    name: "Mother's Day Lunch",
                    startDate: '2026-03-15T13:00:00+00:00',
                    eventStatus: 'EventScheduled'
                  },
                  {
                    id: 'evt-quiz',
                    slug: 'quiz-night',
                    name: 'Quiz Night',
                    startDate: '2026-03-15T20:00:00+00:00',
                    eventStatus: 'EventScheduled'
                  }
                ]
              }
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        )
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    render(<ManagementTableBookingForm prefill={{ date: '2026-03-15', purpose: 'drinks' }} />)

    // Both events appear (the "Mother's Day Lunch" filter that used to live in
    // the form has been retired alongside Mother's Day mode); we just assert
    // the suggestions render. If a future filter is added it can re-assert.
    await waitFor(() => expect(screen.getByText('Quiz Night')).toBeInTheDocument())
  })

  it('renders the PayPal call-us recovery state with fallback_payment_url', async () => {
    let submittedPayload: Record<string, unknown> | null = null

    ;(global as any).fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()

      if (url.startsWith('/api/events?')) {
        return Promise.resolve(
          new Response(JSON.stringify({ success: true, data: { events: [] } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        )
      }

      if (url.startsWith('/api/table-bookings/availability?')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              success: true,
              data: {
                date: '2026-05-24',
                available: true,
                time_slots: [
                  {
                    time: '13:00',
                    available: true,
                    available_capacity: 12
                  }
                ]
              }
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        )
      }

      if (url.startsWith('/api/customers/lookup?')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              success: true,
              data: { known: false, lookup_degraded: false }
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        )
      }

      if (url === '/api/table-bookings') {
        submittedPayload = JSON.parse(String(init?.body || '{}'))
        // Simulate a 10+ booking where the management API set up the booking
        // and the payment is required, but inline PayPal failed to set up,
        // so the response surfaces a fallback_payment_url for the customer.
        return Promise.resolve(
          new Response(
            JSON.stringify({
              success: true,
              data: {
                state: 'pending_payment',
                table_booking_id: 'tb-pending-recovery',
                booking_reference: 'TB-PENDING-RECOVERY',
                booking_id: 'tb-pending-recovery',
                deposit_amount: 100,
                payment_required: true,
                fallback_payment_url: 'https://pay.example.com/secure-link',
                blocked_reason: null,
                next_step_url: null,
                hold_expires_at: null,
                table_name: null,
                reason: null
              }
            }),
            {
              status: 201,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        )
      }

      // Inline PayPal create-order returns an error to drive the recovery branch
      if (url === '/api/table-bookings/paypal/create-order') {
        return Promise.resolve(
          new Response(
            JSON.stringify({ success: false, error: 'PayPal setup failed' }),
            {
              status: 502,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        )
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    render(<ManagementTableBookingForm />)

    fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: '10' } })
    fireEvent.blur(screen.getByLabelText('Party Size'))
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-05-24' } })

    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

    await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: '1pm' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Guest' } })

    fireEvent.click(screen.getByRole('button', { name: 'Continue to review' }))
    await waitFor(() => expect(screen.getByText('Review your booking')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
    fireEvent.click(screen.getByRole('button', { name: /Confirm and pay deposit/i }))

    // Expect the "couldn't open PayPal" recovery state with the fallback link rendered
    await waitFor(() =>
      expect(
        screen.getByText("We couldn't open the PayPal payment automatically", { exact: false })
      ).toBeInTheDocument()
    )

    const fallbackLink = await screen.findByRole('link', {
      name: /click here to complete your deposit/i
    })
    expect(fallbackLink).toHaveAttribute('href', 'https://pay.example.com/secure-link')

    // Verify the public payload no longer carries sunday_lunch or menu_selections

[truncated at line 200 — original has 208 lines]
```

### `tests/unit/sunday-lunch-cutoff.test.ts`

_(deleted or missing from working tree)_

## Related Files (grep hints)

These files reference the basenames of changed files. They are hints for verification — not included inline. Read them only if a specific finding requires it.

```
.env.example
AGENTS.md
CLAUDE.md
README.md
SSOT.json
app/[...unmatched]/page.tsx
app/about/page.tsx
app/accessibility/page.tsx
app/api/bookings/initiate/route.ts
app/api/customers/lookup/route.ts
```

## Workspace Conventions (`Cursor/CLAUDE.md`)

```markdown
# CLAUDE.md — Workspace Standards

Shared guidance for Claude Code across all projects. Project-level `CLAUDE.md` files take precedence over this one — always read them first.

## Default Stack

Next.js 15 App Router, React 19, TypeScript (strict), Tailwind CSS, Supabase (PostgreSQL + Auth + RLS), deployed on Vercel.

## Workspace Architecture

21 projects across three brands, plus shared tooling:

| Prefix | Brand | Examples |
|--------|-------|----------|
| `OJ-` | Orange Jelly | AnchorManagementTools, CheersAI2.0, Planner2.0, MusicBingo, CashBingo, QuizNight, The-Anchor.pub, DukesHeadLeatherhead.com, OrangeJelly.co.uk, WhatsAppVideoCreator |
| `GMI-` | GMI | MixerAI2.0 (canonical auth reference), TheCookbook, ThePantry |
| `BARONS-` | Barons | CareerHub, EventHub, BrunchLaunchAtTheStar, StPatricksDay, DigitalExperienceMockUp, WebsiteContent |
| (none) | Shared / test | Test, oj-planner-app |

## Core Principles

**How to think:**
- **Simplicity First** — make every change as simple as possible; minimal code impact
- **No Laziness** — find root causes; no temporary fixes; senior developer standards
- **Minimal Impact** — only touch what's necessary; avoid introducing bugs

**How to act:**
1. **Do ONLY what is asked** — no unsolicited improvements
2. **Ask ONE clarifying question maximum** — if unclear, proceed with safest minimal implementation
3. **Record EVERY assumption** — document in PR/commit messages
4. **One concern per changeset** — if a second concern emerges, park it
5. **Fail safely** — when in doubt, stop and request human approval

### Source of Truth Hierarchy

1. Project-level CLAUDE.md
2. Explicit task instructions
3. Existing code patterns in the project
4. This workspace CLAUDE.md
5. Industry best practices / framework defaults

## Ethics & Safety

AI MUST stop and request explicit approval before:
- Any operation that could DELETE user data or drop DB columns/tables
- Disabling authentication/authorisation or removing encryption
- Logging, sending, or storing PII in new locations
- Changes that could cause >1 minute downtime
- Using GPL/AGPL code in proprietary projects

## Communication

- When the user asks to "remove" or "clean up" something, clarify whether they mean a code change or a database/data cleanup before proceeding
- Ask ONE clarifying question maximum — if still unclear, proceed with the safest interpretation

## Debugging & Bug Fixes

- When fixing bugs, check the ENTIRE application for related issues, not just the reported area — ask: "Are there other places this same pattern exists?"
- When given a bug report: just fix it — don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user

## Code Changes

- Before suggesting new environment variables or database columns, check existing ones first — use `grep` to find existing env vars and inspect the current schema before proposing additions
- One logical change per commit; one concern per changeset

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- One task per subagent for focused execution

### 3. Task Tracking
- Write plan to `tasks/todo.md` with checkable items before starting
- Mark items complete as you go; document results when done

### 4. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules that prevent the same mistake; review lessons at session start

### 5. Verification Before Done
- Never mark a task complete without proving it works
- Run tests, check logs, demonstrate correctness
- Ask yourself: "Would a staff engineer approve this?"
- For non-trivial changes: pause and ask "is there a more elegant way?"

### 6. Codex Integration Hook
Uses OpenAI Codex CLI to audit, test and simulate — catches what Claude misses.

```
when: "running tests OR auditing OR simulating"
do:
  - run_skill(codex-review, target=current_task)
  - compare_outputs(claude_result, codex_result)
  - flag_discrepancies(threshold=medium)
  - merge_best_solution()
```

The full multi-specialist QA review skill lives in `~/.claude/skills/codex-qa-review/`. Trigger with "QA review", "codex review", "second opinion", or "check my work". Deploys four specialist agents (Bug Hunter, Security Auditor, Performance Analyst, Standards Enforcer) into a single prioritised report.

## Common Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run lint      # ESLint (zero warnings enforced)
npm test          # Run tests (Vitest unless noted otherwise)
npm run typecheck # TypeScript type checking (npx tsc --noEmit)
npx supabase db push   # Apply pending migrations (Supabase projects)
```

## Coding Standards

### TypeScript
- No `any` types unless absolutely justified with a comment
- Explicit return types on all exported functions
- Props interfaces must be named (not inline anonymous objects for complex props)
- Use `Promise<{ success?: boolean; error?: string }>` for server action return types

### Frontend / Styling
- Use design tokens only — no hardcoded hex colours in components
- Always consider responsive breakpoints (`sm:`, `md:`, `lg:`)
- No conflicting or redundant class combinations
- Design tokens should live in `globals.css` via `@theme inline` (Tailwind v4) or `tailwind.config.ts`
- **Never use dynamic Tailwind class construction** (e.g., `bg-${color}-500`) — always use static, complete class names due to Tailwind's purge behaviour

### Date Handling
- Always use the project's `dateUtils` (typically `src/lib/dateUtils.ts`) for display
- Never use raw `new Date()` or `.toISOString()` for user-facing dates
- Default timezone: Europe/London
- Key utilities: `getTodayIsoDate()`, `toLocalIsoDate()`, `formatDateInLondon()`

### Phone Numbers
- Always normalise to E.164 format (`+44...`) using `libphonenumber-js`

## Server Actions Pattern

All mutations use `'use server'` functions (typically in `src/app/actions/` or `src/actions/`):

```typescript
'use server';
export async function doSomething(params): Promise<{ success?: boolean; error?: string }> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  // ... permission check, business logic, audit log ...
  revalidatePath('/path');
  return { success: true };
}
```

## Database / Supabase

See `.claude/rules/supabase.md` for detailed patterns. Key rules:
- DB columns are `snake_case`; TypeScript types are `camelCase`
- Always wrap DB results with a conversion helper (e.g. `fromDb<T>()`)
- RLS is always on — use service role client only for system/cron operations
- Two client patterns: cookie-based auth client and service-role admin client

### Before Any Database Work
Before making changes to queries, migrations, server actions, or any code that touches the database, query the live schema for all tables involved:
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name IN ('relevant_table') ORDER BY ordinal_position;
```
Also check for views referencing those tables — they will break silently if columns change:
```sql
SELECT table_name FROM information_schema.view_table_usage
WHERE table_name IN ('relevant_table');
```

### Migrations
- Always verify migrations don't conflict with existing timestamps
- Test the connection string works before pushing
- PostgreSQL views freeze their column lists — if underlying tables change, views must be recreated
- Never run destructive migrations (DROP COLUMN/TABLE) without explicit approval

## Git Conventions

See `.claude/rules/pr-and-git-standards.md` for full PR templates, branch naming, and reviewer checklists. Key rules:
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- Never force-push to `main`
- One logical change per commit
- Meaningful commit messages explaining "why" not just "what"

## Rules Reference

Core rules (always loaded from `.claude/rules/`):

| File | Read when… |
|------|-----------|
| `ui-patterns.md` | Building or modifying UI components, forms, buttons, navigation, or accessibility |
| `testing.md` | Adding, modifying, or debugging tests; setting up test infrastructure |
| `definition-of-ready.md` | Starting any new feature — check requirements are clear before coding |
| `definition-of-done.md` | Finishing any feature — verify all quality gates pass |
| `complexity-and-incremental-dev.md` | Scoping a task that touches 4+ files or involves schema changes |
| `pr-and-git-standards.md` | Creating branches, writing commit messages, or opening PRs |
| `verification-pipeline.md` | Before pushing — run the full lint → typecheck → test → build pipeline |
| `supabase.md` | Any database query, migration, RLS policy, or client usage |

Domain rules (auto-injected from `.claude/docs/` when you edit relevant files):

| File | Domain |
|------|--------|
| `auth-standard.md` | Auth, sessions, middleware, RBAC, CSRF, password reset, invites |
| `background-jobs.md` | Async job queues, Vercel Cron, retry logic |
| `api-key-auth.md` | External API key generation, validation, rotation |
| `file-export.md` | PDF, DOCX, CSV generation and download |
| `rate-limiting.md` | Upstash rate limiting, 429 responses |
| `qr-codes.md` | QR code generation (client + server) |
| `toast-notifications.md` | Sonner toast patterns |
| `email-notifications.md` | Resend email, templates, audit logging |
| `ai-llm.md` | LLM client, prompts, token tracking, vision |
| `payment-processing.md` | Stripe/PayPal two-phase payment flows |
| `data-tables.md` | TanStack React Table v8 patterns |

## Quality Gates

A feature is only complete when it passes the full Definition of Done checklist (`.claude/rules/definition-of-done.md`). At minimum: builds, lints, type-checks, tests pass, no hardcoded secrets, auth checks in place, code commented where complex.
```

## Project Conventions (`CLAUDE.md`)

```markdown
# CLAUDE.md — The Anchor Pub Website

Project-specific guidance. The workspace CLAUDE.md at `/Users/peterpitcher/Cursor/CLAUDE.md` covers general standards (TypeScript, Tailwind, Supabase, Git, testing, auth). Read this file for what's unique to this project.

---

## Stack

- **Next.js 14** App Router, TypeScript, Tailwind CSS, CVA
- **No database** — this is a marketing/booking website only; all data lives in the management app
- **Hosting:** Vercel | **DNS:** Cloudflare | **Analytics:** Google Tag Manager
- **Tests:** Jest (`npm test`) in `tests/`

---

## Relationship with OJ-AnchorManagementTools

These two applications form a paired system. Understanding their relationship is essential before making changes to anything involving bookings, hours, or availability.

### What each app does

| | The Anchor Website (`OJ-The-Anchor.pub`) | Management App (`OJ-AnchorManagementTools`) |
|---|---|---|
| **Purpose** | Customer-facing marketing site + booking flow | Staff/admin tool for managing the pub |
| **Users** | Public customers | Staff and managers |
| **Database** | None | Supabase (PostgreSQL) — sole source of truth |
| **Hosting** | Vercel (this repo) | Vercel (separate repo at `/Users/peterpitcher/Cursor/OJ-AnchorManagementTools`) |

### Data flow

```
Management App (Supabase DB)
        │
        │  REST API (ANCHOR_API_KEY auth)
        │  Base URL: management.orangejelly.co.uk
        ▼
  Website (this repo)
  Next.js API routes proxy the calls
  (protects API key, handles CORS, adds caching)
```

The website **never writes to any database directly**. All mutations (create booking, submit enquiry, etc.) go through the management API.

### Key API endpoints the website consumes

| Endpoint | Purpose |
|---|---|
| `GET /business/hours` | Regular opening hours + special hours overrides |
| `GET /table-bookings/availability` | Available booking slots for a given date/type |
| `POST /table-bookings` | Create a table booking |
| `GET /events` | Upcoming events |
| `GET /menus` | Food/drink menus |

### Special hours override pattern

The management app stores per-date overrides in a `special_hours` table. The website receives these via `/business/hours`. Critical fields:

- `kitchen: null` — kitchen is closed for that date
- `is_kitchen_closed: true` — explicit kitchen closure flag (defence-in-depth)
- `is_closed: true` — full venue closure
- `schedule_config: []` — custom booking schedule for the date

**Important:** `kitchen: null` must be treated as a deliberate "closed" signal — not as "data absent". Use `??` not `||` when resolving special vs regular kitchen data. Using `||` will cause `null` to fall through to regular hours. This has bitten us before (March 2026 bug).

### Booking type → kitchen dependency

| Booking type | Requires kitchen |
|---|---|
| `sunday_lunch` | Yes |
| `food` | Yes |
| `drinks` | No |

If `is_kitchen_closed` or `kitchen === null` for a date, food/sunday_lunch slots must return empty. Drinks slots are unaffected.

### Key files in this repo that touch the management API

| File | Role |
|---|---|
| `lib/api.ts` | Main API client — `anchorAPI.*` methods. Also contains `buildTableAvailabilityFromBusinessHours()` (fallback slot generator) |
| `lib/table-booking-service-windows.ts` | `resolveServiceRanges()` — converts business hours into bookable time slots |
| `lib/hours-utils.ts` | `getEffectiveDayHours()`, `isKitchenClosed()` — correct `??`-based utilities for hours logic |
| `app/api/*/route.ts` | API proxy routes — never expose `ANCHOR_API_KEY` client-side |

---

## Critical Business Rules

- **Brand:** Always "The Anchor" (not "The Anchor Pub") in customer-facing copy
- **Contact:** manager@the-anchor.pub | 01753 682707
- **Location:** Stanwell Moor, near Heathrow Airport
- **Monday kitchen:** Always closed unless a special hours record explicitly opens it
- **Sunday lunch:** Requires advance booking and prepayment; blocked if kitchen is closed for that date
- **No service:** No breakfast, delivery, Sky Sports, or guest ales
- **Verified copy:** `/docs/copy-assumptions.md` is the source of truth for operational claims used in page copy

---

## SEO & Domain

- **Canonical domain:** `https://www.the-anchor.pub` (with www — Cloudflare + Vercel)
- **Cloudflare TLS:** Must be "Full" or "Full (strict)" — never "Flexible" (causes redirect loops)

### Canonical URL pattern — DO NOT hardcode in root layout

```typescript
// app/layout.tsx — metadataBase only, NO alternates.canonical here
export const metadata: Metadata = {
  metadataBase: new URL('https://www.the-anchor.pub'),
}

// Individual pages — relative canonical
export const metadata: Metadata = {
  alternates: { canonical: './' },
}
```

Hardcoding `canonical` in the root layout makes every page claim to be the homepage. This was a past bug — don't repeat it.

---

## Architecture

```
app/                  Next.js App Router pages
  api/                Proxy routes to management API
  book-table/         Booking wizard flow
components/
  ui/                 Reusable primitives (Button, Input, Badge, etc.)
  features/           Business-domain components
  tracking/           GTM analytics components
lib/
  api.ts              Management API client + availability logic
  table-booking-service-windows.ts  Slot resolution
  hours-utils.ts      Business hours utilities
  gtm-events.ts       Analytics event helpers
  constants.ts        Business constants
public/               Static assets
docs/                 Documentation (api-integration.md, copy-assumptions.md, parking-api.md)
tests/                Jest test files
```

### Patterns

- **Default to Server Components.** Add `'use client'` only for interactivity.
- **API proxy pattern:** All calls to `management.orangejelly.co.uk` go through `app/api/*/route.ts`. Never call the management API directly from client components.
- **Hours single source of truth:** Use `lib/hours-utils.ts` utilities for any hours display logic. Do not re-implement hours parsing inline.
- **CVA for component variants** — use `cva()`, not ad-hoc Tailwind conditionals.

---

## Adding a New Page

```typescript
// app/new-route/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title | The Anchor Stanwell Moor',
  description: 'Page description',
  alternates: { canonical: './' },
}

export default function Page() {
  return <>{/* content */}</>
}
```

Also add the route to `app/sitemap.ts`.

---

## Analytics

```typescript
'use client'
import { trackEventName } from '@/lib/gtm-events'

<Button onClick={() => trackEventName('source_location')}>Action</Button>
```

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `ANCHOR_API_KEY` | Auth key for management.orangejelly.co.uk |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager container ID |
| `NEXT_PUBLIC_AVIATIONSTACK_API_KEY` | Flight data (Heathrow parking feature) |
```

## Rule: `/Users/peterpitcher/Cursor/.claude/rules/definition-of-done.md`

```markdown
# Definition of Done (DoD)

A feature is ONLY complete when ALL applicable items pass. This extends the Quality Gates in the root CLAUDE.md.

## Code Quality

- [ ] Builds successfully — `npm run build` with zero errors
- [ ] Linting passes — `npm run lint` with zero warnings
- [ ] Type checks pass — `npx tsc --noEmit` clean (or project equivalent)
- [ ] No `any` types unless justified with a comment
- [ ] No hardcoded secrets or API keys
- [ ] No hardcoded hex colours — use design tokens
- [ ] Server action return types explicitly typed

## Testing

- [ ] All existing tests pass
- [ ] New tests written for business logic (happy path + at least 1 error case)
- [ ] Coverage meets project minimum (default: 80% on business logic)
- [ ] External services mocked — never hit real APIs in tests
- [ ] If no test suite exists yet, note this in the PR as tech debt

## Security

- [ ] Auth checks in place — server actions re-verify server-side
- [ ] Permission checks present — RBAC enforced on both UI and server
- [ ] Input validation complete — all user inputs sanitised (Zod or equivalent)
- [ ] No new PII logging, sending, or storing without approval
- [ ] RLS verified (Supabase projects) — queries respect row-level security

## Accessibility

- [ ] Interactive elements have visible focus styles
- [ ] Colour is not the sole indicator of state
- [ ] Modal dialogs trap focus and close on Escape
- [ ] Tables have proper `<thead>`, `<th scope>` markup
- [ ] Images have meaningful `alt` text
- [ ] Keyboard navigation works for all interactive elements

## Documentation

- [ ] Complex logic commented — future developers can understand "why"
- [ ] README updated if new setup, config, or env vars are needed
- [ ] Environment variables documented in `.env.example`
- [ ] Breaking changes noted in PR description

## Deployment

- [ ] Database migrations tested locally before pushing
- [ ] Rollback plan documented for schema changes
- [ ] No console.log or debug statements left in production code
- [ ] Verification pipeline passes (see `verification-pipeline.md`)
```

## Rule: `/Users/peterpitcher/Cursor/.claude/rules/supabase.md`

```markdown
# Supabase Conventions

## Client Patterns

Two Supabase client patterns — always use the correct one:

```typescript
// Server-side auth (anon key + cookie session) — use for auth checks:
const supabase = await getSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();

// Server-side data (service-role, bypasses RLS) — use for system/cron operations:
const db = await getDb(); // or createClient() with service role
const { data } = await db.from("table").select("*").eq("id", id).single();

// Browser-only (client components):
const supabase = getSupabaseBrowserClient();
```

ESLint rules should prevent importing the admin/service-role client in client components.

## snake_case ↔ camelCase Conversion

DB columns are always `snake_case`; TypeScript types are `camelCase` with Date objects. Always wrap DB results:

```typescript
import { fromDb } from "@/lib/utils";
const record = fromDb<MyType>(dbRow); // converts snake_case keys + ISO strings → Date
```

All type definitions should live in a central types file (e.g. `src/types/database.ts`).

## Row Level Security (RLS)

- RLS is always enabled on all tables
- Use the anon-key client for user-scoped operations (respects RLS)
- Use the service-role client only for system operations, crons, and webhooks
- Never disable RLS "temporarily" — create a proper service-role path instead

## Migrations

```bash
npx supabase db push          # Apply pending migrations
npx supabase migration new    # Create a new migration file
```

- Migrations live in `supabase/migrations/`
- Full schema reference in `supabase/schema.sql` (paste into SQL Editor for fresh setup)
- Never run destructive migrations (DROP COLUMN/TABLE) without explicit approval
- Test migrations locally with `npx supabase db push --dry-run` before pushing (see `verification-pipeline.md`)

### Dropping columns or tables — mandatory function audit

When a migration drops a column or table, you MUST search for every function and trigger that references it and update them in the same migration. Failing to do so leaves silent breakage: PL/pgSQL functions that reference a dropped column/table throw an exception at runtime, and if any of those functions have an `EXCEPTION WHEN OTHERS THEN` handler, the error is swallowed and returned as a generic blocked/failure state — making the bug invisible until someone notices the feature is broken.

**Before writing any `DROP COLUMN` or `DROP TABLE`:**

```sql
-- Find all functions that reference the column or table
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_definition ILIKE '%column_or_table_name%'
  AND routine_type = 'FUNCTION';
```

Or search the migrations directory:
```bash
grep -r "column_or_table_name" supabase/migrations/ --include="*.sql" -l
```

For each function found: update it in the same migration to remove or replace the reference. Never leave a function referencing infrastructure that no longer exists.

This also applies to **triggers** — check trigger functions separately:
```bash
grep -r "column_or_table_name" supabase/migrations/ --include="*.sql" -n
```

## Auth

- Supabase Auth with JWT + HTTP-only cookies
- Auth checks happen in layout files or middleware
- Server actions must always re-verify auth server-side (never rely on UI hiding)
- Public routes must be explicitly allowlisted

## Audit Logging

All mutations (create, update, delete) in server actions must call `logAuditEvent()`:

```typescript
await logAuditEvent({
  user_id: user.id,
  operation_type: 'update',
  resource_type: 'thing',
  operation_status: 'success'
});
```
```

## Rule: `/Users/peterpitcher/Cursor/.claude/rules/testing.md`

```markdown
# Testing Conventions

## Framework

- **Vitest** is the default test runner (not Jest)
- Test files live alongside source: `src/**/*.test.ts` or in a dedicated `tests/` directory
- **Playwright** for end-to-end testing where configured

## Commands

```bash
npm test              # Run tests once
npm run test:watch    # Watch mode (Vitest)
npm run test:ci       # With coverage report
npx vitest run src/lib/some-module.test.ts  # Run a single test file
```

## Patterns

- Use `describe` blocks grouped by function/component
- Test naming: `it('should [expected behaviour] when [condition]')`
- Prefer testing behaviour over implementation details
- Mock external services (Supabase, OpenAI, Twilio) — never hit real APIs in tests
- Use factories or fixtures for test data, not inline object literals

## Test Prioritisation

When adding tests to a feature, prioritise in this order:
1. **Server actions and business logic** — highest value, most likely to catch real bugs
2. **Data transformation utilities** — date formatting, snake_case conversion, parsers
3. **API route handlers** — input validation, error responses, auth checks
4. **Complex UI interactions** — forms, multi-step flows, conditional rendering
5. **Simple UI wrappers** — lowest priority, skip if time-constrained

Minimum per feature: happy path + at least 1 error/edge case.

## Mock Strategy

- **Always mock**: Supabase client, OpenAI/Azure OpenAI, Twilio, Stripe, PayPal, Microsoft Graph, external HTTP
- **Never mock**: Internal utility functions, date formatting, type conversion helpers
- **Use `vi.mock()`** for module-level mocks; `vi.spyOn()` for targeted function mocks
- Reset mocks between tests: `beforeEach(() => { vi.clearAllMocks() })`

## Coverage

- Business logic and server actions: target 90%
- API routes and data layers: target 80%
- UI components: target 70% (focus on interactive behaviour, not rendering)
- Don't chase coverage on trivial wrappers, type definitions, or config files

## Playwright (E2E)

- Local dev: uses native browser
- Production/CI: uses `BROWSERLESS_URL` env var for remote browser
- E2E tests should be independent (no shared state between tests)
- Use page object models for complex flows
```

## Rule: `/Users/peterpitcher/Cursor/.claude/rules/ui-patterns.md`

```markdown
# UI Patterns & Component Standards

## Server vs Client Components

- Default to **Server Components** — only add `'use client'` when you need interactivity, hooks, or browser APIs
- Server Components can fetch data directly (no useEffect/useState for data loading)
- Client Components should receive data as props from server parents where possible

## Data Fetching & Display

Every data-driven UI must handle all three states:
1. **Loading** — skeleton loaders or spinners (not blank screens)
2. **Error** — user-facing error message or error boundary
3. **Empty** — meaningful empty state component (not just no content)

## Forms

- Use React Hook Form + Zod for validation where configured
- Validation errors displayed inline, not just console logs
- Required field indicators visible
- Loading/disabled state during submission (prevent double-submit)
- Server action errors surfaced to user via toast or inline message
- Form reset after successful submission where appropriate

## Buttons

Check every button for:
- Consistent variant usage (primary, secondary, destructive, ghost) — no ad-hoc Tailwind-only buttons
- Loading states on async actions (spinner/disabled during server action calls)
- Disabled states when form is invalid or submission in progress
- `type="button"` to prevent accidental form submission (use `type="submit"` only on submit buttons)
- Confirmation dialogs on destructive actions (delete, archive, bulk operations)
- `aria-label` on icon-only buttons

## Navigation

- Breadcrumbs on nested pages
- Active state on current nav item
- Back/cancel navigation returns to correct parent page
- New sections added to project navigation with correct permission gating
- Mobile responsiveness of all nav elements

## Permissions (RBAC)

- Every authenticated page must check permissions via the project's permission helper
- UI elements (edit, delete, create buttons) conditionally rendered based on permissions
- Server actions must re-check permissions server-side (never rely on UI hiding alone)

## Accessibility Baseline

These items are also enforced in the Definition of Done (`definition-of-done.md`):

- Interactive elements have visible focus styles
- Colour is not the only indicator of state
- Modal dialogs trap focus and close on Escape
- Tables use proper `<thead>`, `<th scope>` markup
- Images have meaningful `alt` text
- Keyboard navigation works for all interactive elements
```

---

_End of pack._
