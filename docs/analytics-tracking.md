# Analytics & Event Tracking

This app uses **Google Tag Manager (GTM)** and a small client-side dispatcher to emit analytics events.

## Goals

- **Consistency**: the same user action produces the same event name + payload shape everywhere.
- **Quality**: event names/fields are stable, predictable, and useful for reporting.
- **No duplicates**: a single user action should not produce multiple overlapping events unless intentional.
- **Privacy**: do not emit user-provided PII (names, emails, phone numbers, addresses, free-text messages).

## Where tracking lives

- Core dispatcher: `lib/tracking/dispatcher.ts`
- Event helpers (preferred): `lib/gtm-events.ts` (and submodules)
- GTM bootstrap: `components/tracking/GTMProvider.tsx`

Avoid calling `window.dataLayer.push(...)` directly outside `lib/`.

## Naming conventions

- **Event names**: `snake_case` (example: `cta_click`, `modal_close`)
- **Payload keys**: `snake_case`
- Prefer **stable IDs** over text labels for filtering (example: `cta_id="book_table_hero"`)

## Standard context fields (added automatically)

The dispatcher attaches these when available (do not manually duplicate them in event payloads):

- `event_timestamp` (ISO8601)
- `page_path` (pathname)
- `page_location` (full URL)
- `page_title` (document title)
- `referrer` (document.referrer)
- `device_type` (`mobile` | `tablet` | `desktop` | `unknown`)

## Consent

Tracking is gated behind **analytics cookie consent** by default.
Only use `requireConsent: false` for events that are strictly required for site operation (rare).

## Event families (current standard)

### Navigation

- `navigation_click`
  - `event_category`: `Navigation`
  - `event_label`: link label
  - Required: `navigation_url`, `navigation_level`, `device_type`, `link_type`, `click_location`

### CTAs

- `cta_click`
  - `event_category`: `CTA`
  - `event_label`: CTA label
  - Required: `cta_id`, `cta_label`, `cta_location`, `cta_destination`
  - Optional: `cta_mode`, `cta_context`, `cta_variant`

### Overlays (modals/lightboxes)

- `modal_open`
- `modal_engage`
- `modal_close`
  - `event_category`: `Overlay`
  - Required: `modal_id`
  - Optional: `modal_title`, `modal_reason` (`close_button` | `escape_key` | `backdrop_click` | `programmatic`)
  - `modal_engage` fires once per open (first meaningful interaction).
  - `modal_close` can also use `modal_reason: cta` when the overlay is closed from an in-overlay CTA.

### Forms

- `form_start`
- `form_complete`
- `form_abandon`
  - `event_category`: `Form`
  - Required: `form_name`
  - Optional: `form_source`, `form_mode`, `form_step`, `form_location`, `form_journey`

### Contact

- `phone_call_click`
- `email_click`
- `whatsapp_click`
  - `event_category`: `Contact`
  - Required: `contact_method` (`phone` | `email` | `whatsapp`)
  - Optional: `contact_source` (UI location / component)

### Directions

- `directions_click`
  - `event_category`: `Navigation`
  - Required: `directions_source`
  - Optional: `destination_address`, `map_platform`, `from_location`

### Social

- `social_click`
  - `event_category`: `Social`
  - Required: `social_platform`
  - Optional: `social_url`, `click_source`, `share_title`

### Filters

- `filter_change`
  - `event_category`: `Filter`
  - Required: `filter_type`, `filter_value`, `filter_context`
  - Optional: `filter_action` (`apply` | `clear`)

### Consent

- `cookie_consent_update`
  - `event_category`: `Consent`
  - Required: `consent_analytics`, `consent_marketing`, `consent_preferences`
  - Note: emitted with `requireConsent: false` so we can measure consent choices.

### Bookings (table/events)

Prefer the existing booking funnel events (example: `table_booking_*`) and ensure:

- consistent `booking_source` / `source` naming
- `device_type` present
- no user-entered free text is emitted

## Adding a new tracked action

1. Add/extend a helper in `lib/gtm-events.ts` (or a submodule under `lib/gtm-events/`).
2. Use that helper from the component (client-side only).
3. Include a stable ID + location where possible.
4. Keep payloads small and avoid PII.

## Debugging locally

- `app/test-tracking/page.tsx`: shows `window.dataLayer` events in-app
- `app/gtm-debug/page.tsx`: basic GTM presence checks
- `app/test-gtm/page.tsx`: simple GTM smoke tests
