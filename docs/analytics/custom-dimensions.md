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
| `enquiry_type` | Event | `private_hire_enquiry_*`, `quote_tool_*` | Type of private hire event |
| `page_source` | Event | `private_hire_enquiry_*`, `quote_tool_*`, `venue_tour_*` | URL path where the action happened |
| `source_component` | Event | `venue_tour_*`, `private_hire_enquiry_*`, `quote_tool_*` | Component or placement that produced the action |
| `space_id` | Event | `venue_tour_*`, `private_hire_enquiry_*`, `quote_tool_*` | Stable tour slug for mapped spaces, such as `dining-room` or `beer-garden`; live ID for other spaces |
| `space_name` | Event | `venue_tour_*`, `private_hire_enquiry_*`, `quote_tool_*` | Selected venue space name |
| `photo_id` | Event | `venue_tour_photo_opened` | Selected venue photo identifier |
| `photo_name` | Event | `venue_tour_photo_opened` | Selected venue photo name |
| `question_text` | Event | `faq_item_opened` | The FAQ question that was expanded |
| `scroll_depth` | Event | `scroll_depth` | Milestone percentage (25/50/75/90/100) |
| `metric_name` | Event | `web_vitals_reported` | CLS/LCP/FID/FCP/TTFB/INP |
| `metric_value` | Event | `web_vitals_reported` | Metric value (ms or unitless for CLS×1000) |
| `metric_rating` | Event | `web_vitals_reported` | good/needs-improvement/poor |
| `review_platform` | Event | `review_interaction` | google/tripadvisor/etc |
| `social_platform` | Event | `social_click` | facebook/instagram/twitter etc. |
| `map_platform` | Event | `directions_click` | google/apple |
| `menu_type` | Event | `view_menu` | food/drinks/sunday |
| `error_type` | Event | `table_booking_funnel`, `error` | Error classification |
| `banner_id` | Event | `banner_interaction` | Banner identifier |
| `banner_action` | Event | `banner_interaction` | view/click/dismiss |
| `filter_type` | Event | `filter_change` | Type of filter applied |
| `modal_id` | Event | `modal_open`, `modal_close`, `modal_engage` | Modal identifier |

## Key events (mark in GA4 Admin > Key events)

| Event | Why it is a key event |
|---|---|
| `purchase` | Confirmed table or ticketed-event booking |
| `private_hire_enquiry_submitted` | High-value lead captured |
| `call_click` | Strong purchase intent signal |
| `contact_us` | Contact form submitted |

`table_booking_completed` and `event_booking_completed` remain available as
funnel events, but must not be marked as key events. Each confirmed booking also
emits `purchase`, so marking both would count one booking twice.
