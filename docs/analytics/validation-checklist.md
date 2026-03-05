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
