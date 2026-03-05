# Analytics Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fully overhaul the analytics layer to be GA4-native — removing UA-era legacy fields, eliminating duplicate events, adding four missing tracking points, and fixing one SSR bug.

**Architecture:** All tracking flows through `lib/gtm-events.ts` → `lib/tracking/dispatcher.ts` → `window.dataLayer`. The dispatcher handles consent gating, page context, and API batching. We leave the dispatcher logic untouched and focus on: (1) stripping legacy UA fields from every event payload in `gtm-events.ts`, (2) removing dead/duplicate functions and updating callsites, (3) adding new tracking functions and wiring them into the relevant components.

**Tech Stack:** TypeScript, Next.js App Router, GTM/GA4, Jest + Testing Library, `next/web-vitals`

---

### Task 1: Fix SSR bug in `trackScrollDepth` + update dispatcher type

**Files:**
- Modify: `lib/gtm-events.ts:584-592`
- Modify: `lib/tracking/dispatcher.ts:3-10`

**Step 1: Update `TrackingEventPayload` in dispatcher to remove UA fields**

In `lib/tracking/dispatcher.ts`, remove `event_category`, `event_action`, `event_label` from the interface (they're no longer valid fields):

```typescript
export interface TrackingEventPayload {
  event: string
  value?: number
  [key: string]: unknown
}
```

**Step 2: Fix the SSR crash in `trackScrollDepth`**

In `lib/gtm-events.ts`, the function currently reads `document.title` unconditionally. Replace lines 584–592:

```typescript
export function trackScrollDepth(milestone: number) {
  if (typeof window === 'undefined') return
  pushToDataLayer({
    event: 'scroll_depth',
    scroll_depth: milestone,
    value: milestone,
  })
}
```

**Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors (the `[key: string]: unknown` index signature still allows any extra properties callers currently pass — we'll clean those up in Task 2).

**Step 4: Commit**

```bash
git add lib/tracking/dispatcher.ts lib/gtm-events.ts
git commit -m "fix(analytics): remove UA fields from dispatcher type, fix SSR crash in trackScrollDepth"
```

---

### Task 2: Strip UA-era fields from every event in `gtm-events.ts`

**Files:**
- Modify: `lib/gtm-events.ts` (full file)

Every `pushToDataLayer()` call currently passes `event_category`, `event_action`, and/or `event_label`. Remove all three fields from every call. The meaningful data is already in the GA4-native parameters alongside them.

**Step 1: Apply the transformation**

Work through `lib/gtm-events.ts` top-to-bottom. For each `pushToDataLayer({...})` call, delete the lines containing `event_category:`, `event_action:`, and `event_label:`. Leave all other properties intact.

After transformation, `trackPhoneCallClick` should look like:

```typescript
export function trackPhoneCallClick(data: { phone?: string; source: string }) {
  pushToDataLayer({
    event: 'phone_call_click',
    contact_method: 'phone',
    contact_source: data.source,
    phone: data.phone
  })
}
```

And `trackTableBookingClick` should look like:

```typescript
export function trackTableBookingClick(data: TableBookingClickInput) {
  const { source, metadata } = normaliseTableBookingClick(data)
  pushToDataLayer({
    event: 'table_booking_click',
    booking_method: 'internal_management_platform',
    booking_source: source,
    ...metadata
  }, { sendToApi: true })
}
```

Apply this same pattern to all ~35 functions. When `event_label` was the only meaningful identifier (e.g. `trackReviewClick(platform)`), the platform/source parameter is already present as a dedicated property — no data is lost.

**Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 3: Run tests**

```bash
npm test -- --testPathPattern="gtm|tracking|booking"
```

Expected: All pass. Tests mock `@/lib/gtm-events` functions, so they are not sensitive to payload shape changes.

**Step 4: Commit**

```bash
git add lib/gtm-events.ts
git commit -m "refactor(analytics): strip UA-era event_category/action/label from all GTM events"
```

---

### Task 3: Remove `trackPageView` and `trackAddToCart` (dead/duplicate code)

**Files:**
- Modify: `lib/gtm-events.ts:78-86` (trackPageView), `lib/gtm-events.ts:519-542` (trackAddToCart)
- Modify: `app/test-gtm/page.tsx:4,36`

**Step 1: Delete `trackPageView` from `lib/gtm-events.ts`**

Remove the entire function (lines 77–86):

```typescript
// DELETE THIS ENTIRE FUNCTION:
export function trackPageView(url: string, title: string) { ... }
```

**Step 2: Delete `trackAddToCart` from `lib/gtm-events.ts`**

Remove the entire function (lines 518–542):

```typescript
// DELETE THIS ENTIRE FUNCTION:
export function trackAddToCart(item: { ... }) { ... }
```

**Step 3: Remove the callsite in `app/test-gtm/page.tsx`**

Line 4 imports `trackPageView`. Line 36 calls it. Remove both:

```typescript
// Line 4 - remove trackPageView from the import:
import { trackPhoneCall } from '@/lib/gtm-events'

// Line 36 - delete this line entirely:
// trackPageView('/test-gtm', 'GTM Test Page')
```

**Step 4: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 5: Commit**

```bash
git add lib/gtm-events.ts app/test-gtm/page.tsx
git commit -m "refactor(analytics): remove dead trackPageView and trackAddToCart functions"
```

---

### Task 4: Remove the 7 individual `trackTableBooking*` functions from `gtm-events.ts`

**Files:**
- Modify: `lib/gtm-events.ts:225-351`

The umbrella `trackTableBookingFunnel()` (lines 353–393) handles all 7 steps. The individual functions are redundant. Delete all 7:

- `trackTableBookingView` (lines 226–237)
- `trackTableBookingStart` (lines 239–250)
- `trackTableBookingAvailabilityCheck` (lines 252–269)
- `trackTableBookingDetailsEntered` (lines 271–288)
- `trackTableBookingSubmit` (lines 290–307)
- `trackTableBookingSuccess` (lines 309–328)
- `trackTableBookingError` (lines 330–351)

**Step 1: Delete all 7 functions**

Remove lines 226–351 from `lib/gtm-events.ts`. Keep `trackTableBookingFunnel` (the function starting at what was line 353) intact.

**Step 2: Run TypeScript check — expect errors at callsites**

```bash
npx tsc --noEmit
```

Expected: Errors in `SundayLunchBookingForm.tsx`, `TableBookingForm.tsx`, `SundayLunchBooking.tsx` — this is expected and guides Tasks 5 and 6.

**Step 3: Commit the deletion only**

```bash
git add lib/gtm-events.ts
git commit -m "refactor(analytics): remove 7 individual trackTableBooking* functions in favour of trackTableBookingFunnel"
```

---

### Task 5: Update `SundayLunchBookingForm.tsx` callsites

**Files:**
- Modify: `components/features/TableBooking/SundayLunchBookingForm.tsx`

**Step 1: Update the import at lines 5–10**

Replace all 6 individual imports with `trackTableBookingFunnel`:

```typescript
import {
  trackTableBookingClick,
  trackTableBookingFunnel,
  trackFormComplete,
  trackError
} from '@/lib/gtm-events'
```

**Step 2: Replace `trackTableBookingView` (line ~121)**

```typescript
// Before:
trackTableBookingView({
  source: 'sunday_lunch_form',
  deviceType: window.innerWidth >= 768 ? 'desktop' : 'mobile'
})

// After:
trackTableBookingFunnel({
  step: 'view',
  source: 'sunday_lunch_form',
  deviceType: window.innerWidth >= 768 ? 'desktop' : 'mobile'
})
```

**Step 3: Replace `trackTableBookingStart` (line ~400)**

```typescript
// Before:
trackTableBookingStart({ source: 'sunday_lunch_form', deviceType: ... })

// After:
trackTableBookingFunnel({ step: 'start', source: 'sunday_lunch_form', deviceType: ... })
```

**Step 4: Replace `trackTableBookingDetailsEntered` (line ~413)**

```typescript
// Before:
trackTableBookingDetailsEntered({ partySize, bookingDate, bookingTime, source: 'sunday_lunch_form', deviceType: ... })

// After:
trackTableBookingFunnel({ step: 'details_entered', partySize, bookingDate, bookingTime, source: 'sunday_lunch_form', deviceType: ... })
```

**Step 5: Replace `trackTableBookingSubmit` (line ~500)**

```typescript
// Before:
trackTableBookingSubmit({ partySize, bookingDate, bookingTime, source: 'sunday_lunch_form', deviceType: ... })

// After:
trackTableBookingFunnel({ step: 'submit', partySize, bookingDate, bookingTime, source: 'sunday_lunch_form', deviceType: ... })
```

**Step 6: Replace both `trackTableBookingSuccess` calls (lines ~552 and ~575)**

```typescript
// Before:
trackTableBookingSuccess({ partySize, bookingDate, bookingTime, bookingReference, source: 'sunday_lunch_form', deviceType: ... })

// After:
trackTableBookingFunnel({ step: 'success', partySize, bookingDate, bookingTime, bookingReference, source: 'sunday_lunch_form', deviceType: ... })
```

**Step 7: Replace `trackTableBookingError` (line ~592)**

```typescript
// Before:
trackTableBookingError({ errorType, errorMessage, partySize, bookingDate, bookingTime, source: 'sunday_lunch_form', deviceType: ... })

// After:
trackTableBookingFunnel({ step: 'error', errorType, errorMessage, partySize, bookingDate, bookingTime, source: 'sunday_lunch_form', deviceType: ... })
```

**Step 8: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: Errors remain only in `TableBookingForm.tsx` and `SundayLunchBooking.tsx`.

**Step 9: Commit**

```bash
git add components/features/TableBooking/SundayLunchBookingForm.tsx
git commit -m "refactor(analytics): migrate SundayLunchBookingForm to trackTableBookingFunnel"
```

---

### Task 6: Update `TableBookingForm.tsx` and `SundayLunchBooking.tsx` callsites

**Files:**
- Modify: `components/features/TableBooking/TableBookingForm.tsx:16,167`
- Modify: `components/features/TableBooking/SundayLunchBooking.tsx:19,525,550`

**Step 1: `TableBookingForm.tsx` — update import (line 16)**

```typescript
// Before:
import { trackTableBookingClick, trackTableBookingSuccess, trackFormComplete, trackError } from '@/lib/gtm-events'

// After:
import { trackTableBookingClick, trackTableBookingFunnel, trackFormComplete, trackError } from '@/lib/gtm-events'
```

**Step 2: `TableBookingForm.tsx` — replace `trackTableBookingSuccess` callsite (line ~167)**

The call passes `{ partySize, bookingDate, bookingTime, bookingReference, source, deviceType }`. Replace with:

```typescript
trackTableBookingFunnel({
  step: 'success',
  partySize: data.partySize,
  bookingDate: data.bookingDate,
  bookingTime: data.bookingTime,
  bookingReference: data.bookingReference,
  source: data.source,
  deviceType: data.deviceType,
})
```

**Step 3: `SundayLunchBooking.tsx` — update import (line 19)**

```typescript
// Before:
import { trackTableBookingClick, trackTableBookingSuccess, trackFormComplete, trackError } from '@/lib/gtm-events'

// After:
import { trackTableBookingClick, trackTableBookingFunnel, trackFormComplete, trackError } from '@/lib/gtm-events'
```

**Step 4: `SundayLunchBooking.tsx` — replace both `trackTableBookingSuccess` calls (lines ~525 and ~550)**

```typescript
trackTableBookingFunnel({
  step: 'success',
  partySize: data.partySize,
  bookingDate: data.bookingDate,
  bookingTime: data.bookingTime,
  bookingReference: data.bookingReference,
  source: data.source,
  deviceType: data.deviceType,
})
```

**Step 5: Run TypeScript check — expect zero errors**

```bash
npx tsc --noEmit
```

Expected: Zero errors.

**Step 6: Run all tests**

```bash
npm test
```

Expected: All pass.

**Step 7: Commit**

```bash
git add components/features/TableBooking/TableBookingForm.tsx components/features/TableBooking/SundayLunchBooking.tsx
git commit -m "refactor(analytics): migrate TableBookingForm and SundayLunchBooking to trackTableBookingFunnel"
```

---

### Task 7: Add `trackFaqItemOpened` and wire into `FAQAccordionWithSchema`

**Files:**
- Modify: `lib/gtm-events.ts` (add new function at end of file)
- Modify: `components/FAQAccordionWithSchema.tsx`

**Step 1: Add `trackFaqItemOpened` to `lib/gtm-events.ts`**

Append to end of file:

```typescript
export function trackFaqItemOpened(data: {
  questionText: string
  pageLocation: string
}) {
  pushToDataLayer({
    event: 'faq_item_opened',
    question_text: safeText(data.questionText),
    page_location: data.pageLocation,
  })
}
```

**Step 2: Write a failing test**

Create `tests/unit/FAQAccordionWithSchema.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { trackFaqItemOpened } from '@/lib/gtm-events'

jest.mock('@/lib/gtm-events', () => ({
  trackFaqItemOpened: jest.fn(),
}))

const mockFaqs = [
  { question: 'What time do you open?', answer: 'We open at 11am.' },
  { question: 'Do you take bookings?', answer: 'Yes.' },
]

describe('FAQAccordionWithSchema', () => {
  it('fires trackFaqItemOpened when a question is expanded', () => {
    render(<FAQAccordionWithSchema faqs={mockFaqs} renderSchema={false} />)
    fireEvent.click(screen.getByText('What time do you open?'))
    expect(trackFaqItemOpened).toHaveBeenCalledWith({
      questionText: 'What time do you open?',
      pageLocation: expect.any(String),
    })
  })

  it('does not fire when a question is collapsed', () => {
    render(<FAQAccordionWithSchema faqs={mockFaqs} renderSchema={false} />)
    // Open then close
    fireEvent.click(screen.getByText('What time do you open?'))
    ;(trackFaqItemOpened as jest.Mock).mockClear()
    fireEvent.click(screen.getByText('What time do you open?'))
    expect(trackFaqItemOpened).not.toHaveBeenCalled()
  })
})
```

**Step 3: Run test to verify it fails**

```bash
npm test -- --testPathPattern="FAQAccordionWithSchema"
```

Expected: FAIL — `trackFaqItemOpened` is not called yet.

**Step 4: Update `FAQAccordionWithSchema.tsx` to wire in tracking**

Add import at top:

```typescript
import { trackFaqItemOpened } from '@/lib/gtm-events'
```

Update `toggleQuestion` to fire the event only on open (not close):

```typescript
const toggleQuestion = (index: number) => {
  const isOpening = openIndex !== index
  setOpenIndex(isOpening ? index : null)
  if (isOpening) {
    trackFaqItemOpened({
      questionText: faqs[index].question,
      pageLocation: typeof window !== 'undefined' ? window.location.pathname : '',
    })
  }
}
```

**Step 5: Run test to verify it passes**

```bash
npm test -- --testPathPattern="FAQAccordionWithSchema"
```

Expected: PASS.

**Step 6: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 7: Commit**

```bash
git add lib/gtm-events.ts components/FAQAccordionWithSchema.tsx tests/unit/FAQAccordionWithSchema.test.tsx
git commit -m "feat(analytics): track faq_item_opened on accordion expand"
```

---

### Task 8: Add `trackPrivateHireEnquirySubmitted` and wire into `PrivateBookingInquiryForm`

**Files:**
- Modify: `lib/gtm-events.ts` (add new function)
- Modify: `components/PrivateBookingInquiryForm.tsx:130-165`

**Step 1: Add `trackPrivateHireEnquirySubmitted` to `lib/gtm-events.ts`**

```typescript
export function trackPrivateHireEnquirySubmitted(data: {
  enquiryType?: string
  pageSource: string
}) {
  pushToDataLayer({
    event: 'private_hire_enquiry_submitted',
    enquiry_type: data.enquiryType,
    page_source: data.pageSource,
  }, { sendToApi: true })
}
```

**Step 2: Write a failing test**

Create `tests/unit/PrivateBookingInquiryForm.test.tsx`:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PrivateBookingInquiryForm } from '@/components/PrivateBookingInquiryForm'
import { trackPrivateHireEnquirySubmitted } from '@/lib/gtm-events'
import * as api from '@/lib/api'

jest.mock('@/lib/gtm-events', () => ({
  trackPrivateHireEnquirySubmitted: jest.fn(),
}))

jest.mock('@/lib/api', () => ({
  createPrivateBooking: jest.fn(),
}))

describe('PrivateBookingInquiryForm', () => {
  it('fires trackPrivateHireEnquirySubmitted on successful submission', async () => {
    ;(api.createPrivateBooking as jest.Mock).mockResolvedValue({ success: true })

    // NOTE: this form has phone verification state — the test will need the
    // form to be in detailsUnlocked=true state. Pass initialData if the
    // component accepts pre-populated data, or mock internal state.
    // Adjust render props to match the component's actual Props interface.
    render(<PrivateBookingInquiryForm initialData={{}} onCancel={jest.fn()} />)

    // Submit the form (exact interaction depends on component UI)
    fireEvent.submit(screen.getByRole('form'))

    await waitFor(() => {
      expect(trackPrivateHireEnquirySubmitted).toHaveBeenCalledWith(
        expect.objectContaining({ page_source: expect.any(String) })
      )
    })
  })
})
```

> **Note:** `PrivateBookingInquiryForm` has a phone verification gate (`detailsUnlocked`). If the test cannot bypass this via props, mock the `useState` or test the tracking call in isolation by calling `trackPrivateHireEnquirySubmitted` directly in a unit test and asserting the dataLayer push. The important thing is the event fires on `response.success === true`.

**Step 3: Run test to verify it fails**

```bash
npm test -- --testPathPattern="PrivateBookingInquiryForm"
```

Expected: FAIL.

**Step 4: Wire tracking into `PrivateBookingInquiryForm.tsx`**

Add import at top of file:

```typescript
import { trackPrivateHireEnquirySubmitted } from '@/lib/gtm-events'
```

In `handleSubmit`, after `if (response.success) { setSuccess(true) }`, add:

```typescript
if (response.success) {
  setSuccess(true)
  trackPrivateHireEnquirySubmitted({
    enquiryType: formData.event_type,
    pageSource: typeof window !== 'undefined' ? window.location.pathname : '',
  })
}
```

**Step 5: Run test to verify it passes**

```bash
npm test -- --testPathPattern="PrivateBookingInquiryForm"
```

Expected: PASS (or adjust test to match actual component API if needed).

**Step 6: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors. Verify `formData.event_type` exists on the form data shape; if the field is named differently, use the correct property name.

**Step 7: Commit**

```bash
git add lib/gtm-events.ts components/PrivateBookingInquiryForm.tsx tests/unit/PrivateBookingInquiryForm.test.tsx
git commit -m "feat(analytics): track private_hire_enquiry_submitted on successful form submission"
```

---

### Task 9: Add `web_vitals_reported` dataLayer push to `app/web-vitals.tsx`

**Files:**
- Modify: `app/web-vitals.tsx`
- Modify: `lib/gtm-events.ts` (add new function)

**Step 1: Add `trackWebVitals` to `lib/gtm-events.ts`**

```typescript
export function trackWebVitals(data: {
  metricName: string
  metricValue: number
  metricRating: string
  metricDelta?: number
  metricId?: string
}) {
  pushToDataLayer({
    event: 'web_vitals_reported',
    metric_name: data.metricName,
    metric_value: Math.round(data.metricName === 'CLS' ? data.metricValue * 1000 : data.metricValue),
    metric_rating: data.metricRating,
    metric_delta: data.metricDelta,
    metric_id: data.metricId,
  })
  // Note: requireConsent defaults to true in dispatchTrackingEvent,
  // so this only fires when analytics consent is granted.
}
```

**Step 2: Update `app/web-vitals.tsx` to also push to the dataLayer**

```typescript
'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { trackWebVitals } from '@/lib/gtm-events'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Push to GTM dataLayer (consent-gated via dispatchTrackingEvent)
    trackWebVitals({
      metricName: metric.name,
      metricValue: metric.value,
      metricRating: metric.rating,
      metricDelta: metric.delta,
      metricId: metric.id,
    })

    // Also send to server-side web vitals endpoint (always)
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
    })

    fetch('/api/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
  })

  return null
}
```

**Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 4: Run all tests**

```bash
npm test
```

Expected: All pass.

**Step 5: Commit**

```bash
git add app/web-vitals.tsx lib/gtm-events.ts
git commit -m "feat(analytics): push web_vitals_reported to GTM dataLayer with consent gating"
```

---

### Task 10: Write analytics reference docs

**Files:**
- Create: `docs/analytics/custom-dimensions.md`
- Create: `docs/analytics/validation-checklist.md`

**Step 1: Create `docs/analytics/custom-dimensions.md`**

```markdown
# GA4 Custom Dimensions Registry

All custom parameters used in GTM events must be registered here AND in GA4 Admin > Custom Definitions.

## Registration Steps
1. GA4 Admin → Property → Custom Definitions → Custom Dimensions
2. Add each parameter below as an Event-scoped custom dimension

## Event Parameters

| Parameter | GA4 Scope | Event(s) | Description |
|---|---|---|---|
| `booking_source` | Event | `table_booking_*`, `booking_wizard_*` | Where the booking originated (e.g. `sunday_lunch_form`, `hero_cta`) |
| `booking_method` | Event | `table_booking_click` | Always `internal_management_platform` |
| `party_size` | Event | `table_booking_funnel` | Number of guests |
| `booking_date` | Event | `table_booking_funnel` | Date string (YYYY-MM-DD) |
| `booking_time` | Event | `table_booking_funnel` | Time string (HH:MM) |
| `booking_reference` | Event | `table_booking_funnel` | Confirmation reference from API |
| `funnel_step` | Event | `table_booking_funnel` | Step name: view/start/availability_check/details_entered/submit/success/error |
| `contact_method` | Event | `phone_call_click`, `email_click`, `whatsapp_click` | phone/email/whatsapp |
| `contact_source` | Event | `phone_call_click`, `email_click` | Page/component that triggered the click |
| `enquiry_type` | Event | `private_hire_enquiry_submitted` | Type of private hire event |
| `page_source` | Event | `private_hire_enquiry_submitted` | URL path where enquiry was submitted |
| `question_text` | Event | `faq_item_opened` | The FAQ question that was expanded |
| `scroll_depth` | Event | `scroll_depth` | Milestone percentage (25/50/75/90/100) |
| `metric_name` | Event | `web_vitals_reported` | CLS/LCP/FID/FCP/TTFB/INP |
| `metric_value` | Event | `web_vitals_reported` | Metric value (ms or unitless for CLS×1000) |
| `metric_rating` | Event | `web_vitals_reported` | good/needs-improvement/poor |
| `social_platform` | Event | `social_click` | facebook/instagram/twitter etc. |
| `map_platform` | Event | `directions_click` | google/apple |
| `menu_type` | Event | `view_menu` | food/drinks/sunday |
| `error_type` | Event | `table_booking_funnel`, `error` | Error classification |
| `banner_id` | Event | `banner_interaction` | Banner identifier |
| `banner_action` | Event | `banner_interaction` | view/click/dismiss |
| `filter_type` | Event | `filter_change` | Type of filter applied |
| `modal_id` | Event | `modal_open`, `modal_close`, `modal_engage` | Modal identifier |

## Conversions (mark in GA4 Admin > Events)

| Event | Why It's a Conversion |
|---|---|
| `table_booking_success` (via `table_booking_funnel` step=success) | Primary revenue action |
| `booking_wizard_complete` | Sunday lunch booking confirmed |
| `private_hire_enquiry_submitted` | High-value lead captured |
| `phone_call_click` | Strong purchase intent signal |
```

**Step 2: Create `docs/analytics/validation-checklist.md`**

```markdown
# Analytics Validation Checklist

Run this checklist before any analytics-related deployment.

## GTM Preview Mode

1. Open GTM → Preview → enter https://www.the-anchor.pub
2. For each action below, verify the correct event fires in the Tag Assistant panel

### Booking Funnel
- [ ] Open `/book-table` → `table_booking_funnel` fires with `funnel_step: view`
- [ ] Select date/time → `table_booking_funnel` fires with `funnel_step: availability_check`
- [ ] Enter guest details → `table_booking_funnel` fires with `funnel_step: details_entered`
- [ ] Submit → `table_booking_funnel` fires with `funnel_step: submit`
- [ ] Confirm success page → `table_booking_funnel` fires with `funnel_step: success`

### Private Hire
- [ ] Submit enquiry on `/function-room-hire` → `private_hire_enquiry_submitted` fires
- [ ] Check `page_source` matches `/function-room-hire`

### FAQ
- [ ] Click any FAQ question → `faq_item_opened` fires
- [ ] Check `question_text` matches the question text
- [ ] Collapse same question → no second `faq_item_opened` fires

### Contact
- [ ] Click phone number → `phone_call_click` fires
- [ ] Click directions link → `directions_click` fires

### No Duplicates
- [ ] Page load: exactly ONE `page_view` event (from GA4 enhanced measurement, not code)
- [ ] Any booking step: exactly ONE `table_booking_funnel` event per step

## GA4 DebugView

1. Open GA4 → Admin → DebugView
2. Trigger each conversion event and verify it appears

- [ ] `table_booking_funnel` (step=success) — marked as conversion
- [ ] `booking_wizard_complete` — marked as conversion
- [ ] `private_hire_enquiry_submitted` — marked as conversion
- [ ] `phone_call_click` — marked as conversion

## Consent Gating

- [ ] Reject all cookies → no analytics events fire in dataLayer
- [ ] Accept analytics → events fire normally
- [ ] `web_vitals_reported` only appears in dataLayer after analytics consent accepted
- [ ] Cookie consent event (`cookie_consent_update`) fires regardless of consent state

## Custom Dimensions

- [ ] All parameters in `docs/analytics/custom-dimensions.md` are registered in GA4 Admin
- [ ] No UA-era `event_category`, `event_label`, or `event_action` present in any event payload
```

**Step 3: Commit**

```bash
git add docs/analytics/
git commit -m "docs(analytics): add custom dimensions registry and validation checklist"
```

---

### Task 11: Final verification

**Step 1: Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: Zero errors.

**Step 2: Full test suite**

```bash
npm test
```

Expected: All pass.

**Step 3: Build check**

```bash
npm run build
```

Expected: Successful build, no warnings about missing exports.

**Step 4: Verify no UA fields remain**

```bash
grep -n "event_category\|event_action\|event_label" lib/gtm-events.ts
```

Expected: Zero matches.

**Step 5: Verify no removed functions are still exported**

```bash
grep -n "trackPageView\|trackAddToCart\|trackTableBookingView\|trackTableBookingStart\|trackTableBookingAvailabilityCheck\|trackTableBookingDetailsEntered\|trackTableBookingSubmit\|trackTableBookingSuccess\|trackTableBookingError" lib/gtm-events.ts
```

Expected: Zero matches (these functions are fully removed).

**Step 6: Final commit**

```bash
git add -A
git commit -m "feat(analytics): complete GA4-native analytics overhaul

- Strip all UA-era event_category/action/label fields from 35+ events
- Remove duplicate individual trackTableBooking* functions (use trackTableBookingFunnel)
- Remove dead trackPageView and trackAddToCart functions
- Fix SSR crash in trackScrollDepth
- Add faq_item_opened tracking to FAQAccordionWithSchema
- Add private_hire_enquiry_submitted tracking to PrivateBookingInquiryForm
- Add web_vitals_reported dataLayer push (consent-gated) in web-vitals.tsx
- Add docs/analytics/custom-dimensions.md and validation-checklist.md"
```
