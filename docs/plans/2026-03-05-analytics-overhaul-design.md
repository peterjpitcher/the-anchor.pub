# Analytics Overhaul Design

**Date:** 2026-03-05
**Status:** Approved
**Scope:** Full overhaul of `lib/gtm-events.ts` and related tracking infrastructure

---

## Problem Statement

The existing analytics implementation was built incrementally and has four structural problems:

1. All events pass UA-era `event_category`, `event_action`, `event_label` fields that GA4 ignores natively — they clutter every payload and require manual custom dimension registration to appear in reports.
2. Two parallel booking funnel tracking systems (`trackTableBookingFunnel` + seven individual `trackTableBooking*` functions) fire for the same steps, creating duplicate GA4 events.
3. `trackPageView` manually fires `page_view` — GA4 enhanced measurement already does this automatically, causing a second duplicate on every page load.
4. Four known tracking gaps mean key business outcomes are invisible in GA4.

---

## KPI & Measurement Plan

### Primary Conversions (revenue-driving)
| Event | Description |
|---|---|
| `table_booking_success` | Table booking confirmed |
| `booking_wizard_complete` | Sunday lunch booking confirmed |
| `private_hire_enquiry_submitted` | Private hire enquiry submitted (new) |
| `phone_call_click` | Phone call initiated from any page |

### Secondary Conversions (strong intent signals)
| Event | Description |
|---|---|
| `directions_click` | User requests directions |
| `view_menu` | Food/drinks menu viewed |
| `purchase` | Event ticket purchased |

### Engagement Metrics (content decisions)
| Event | Description |
|---|---|
| `faq_item_opened` | FAQ accordion expanded — which questions get asked |
| `scroll_depth` | Scroll depth milestones by page template |
| `web_vitals_reported` | CLS/LCP/FID for performance monitoring |

---

## Data Layer Standardisation

### Remove all UA-era fields
Strip `event_category`, `event_action`, and `event_label` from every event in `gtm-events.ts`. Replace with GA4-native flat parameters that are self-describing.

**Before:**
```typescript
pushToDataLayer({
  event: 'phone_call_click',
  event_category: 'Contact',
  event_label: data.phone ?? data.source,
  contact_method: 'phone',
  contact_source: data.source,
})
```

**After:**
```typescript
pushToDataLayer({
  event: 'phone_call_click',
  contact_method: 'phone',
  contact_source: data.source,
  phone: data.phone,
})
```

### Remove duplicate booking funnel functions
Keep `trackTableBookingFunnel()` (the umbrella function). Remove the seven individual functions:
- `trackTableBookingView`
- `trackTableBookingStart`
- `trackTableBookingAvailabilityCheck`
- `trackTableBookingDetailsEntered`
- `trackTableBookingSubmit`
- `trackTableBookingSuccess`
- `trackTableBookingError`

Update all callsites to use `trackTableBookingFunnel()`.

### Remove dead/duplicate events
- Remove `trackAddToCart` — stubbed for future online ordering that does not exist
- Remove `trackPageView` — GA4 enhanced measurement fires `page_view` automatically; remove all callsites

---

## Missing Events to Add

| Event | Properties | Trigger |
|---|---|---|
| `private_hire_enquiry_submitted` | `enquiry_type`, `page_source` | Form submit on `/function-room-hire` and all `/private-hire/*` pages |
| `faq_item_opened` | `question_text`, `page_location` | Accordion expand on any FAQ component |
| `email_capture_submitted` | `form_location` | Email opt-in form submit |
| `web_vitals_reported` | `metric_name`, `metric_value`, `metric_rating` | Root layout via `web-vitals` library, gated on analytics consent |

### Bug fixes
- `trackScrollDepth`: guard `document.title` with `typeof window !== 'undefined'` check to prevent SSR crash

---

## Conversion Configuration (GA4 Admin)

Mark the following as conversions in GA4 Admin > Events:
1. `table_booking_success`
2. `booking_wizard_complete`
3. `private_hire_enquiry_submitted`
4. `phone_call_click`

---

## Naming Conventions (enforced going forward)

- Event names: `object_action` snake_case (e.g. `phone_call_click`, `faq_item_opened`)
- No `event_category`, `event_label`, or `event_action` on any event
- All new events document their GA4 custom dimension registrations in `docs/analytics/custom-dimensions.md`

---

## Validation Plan

1. Run GTM Preview Mode after each batch of changes
2. Verify all 4 conversion events fire in GA4 DebugView
3. Confirm zero duplicate `page_view` events
4. Confirm zero duplicate `table_booking_*` events
5. Check `docs/analytics/validation-checklist.md` before shipping

---

## Files Changed

| File | Change |
|---|---|
| `lib/gtm-events.ts` | Remove UA fields, remove duplicate functions, add 4 new events, fix SSR bug |
| `docs/analytics/custom-dimensions.md` | New — GA4 custom dimension registry |
| `docs/analytics/validation-checklist.md` | New — GTM/GA4 validation checklist |
| All callsites of removed functions | Update to use `trackTableBookingFunnel()` |

---

## Out of Scope

- GTM container configuration (done in GTM UI, not code)
- GA4 property setup
- Consent banner changes (consent mode v2 already implemented)
