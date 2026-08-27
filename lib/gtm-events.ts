// Google Tag Manager Event Tracking Utilities
// Centralised event tracking for The Anchor website
//
// Table-booking event names (snapshot, keep in sync with GTM):
//   table_booking_click                              CTA and in-form click tracking
//   table_booking_funnel                             funnel_step: view | start | availability_check |
//                                                    details_entered | submit | success | error
//   table_booking_started / table_booking_completed  (+ sunday_roast_* variants)
//   booking_step_viewed { step }                     wizard step becomes visible
//   option_toggled { option, value, step }           drinks_only | outside_seating |
//                                                    high_chair_count
//   slot_flag_shown { chairs_free, chairs_requested }  high-chair shortfall flag shown
//   slot_invalidated { reason }                      chosen slot lost (options_changed | availability_error)
//   booking_error_shown { code }                     guest-visible booking error rendered
//   purchase                                         GA4 purchase on confirmed/paid bookings
//
// WHAT MAY NEVER GO INTO A BOOKING ANALYTICS PAYLOAD
//
// 1. Anything that identifies a person: names, phone numbers, email addresses,
//    free-text notes, booking references (review F22).
//
// 2. Anything that infers a health condition or other special-category data
//    under UK GDPR Article 9. The accessible-table request is the worked
//    example and is deliberately NOT tracked: asking for a step-free,
//    standard-height table is a strong inference of a mobility impairment.
//    These events reach GA4 on analytics-cookie consent, GA4 stamps a session
//    id, and the same session already carries a booking reference on
//    `purchase`, so the attribute would be joinable to a named booking.
//    Analytics-cookie consent is not Article 9 explicit consent, so no
//    consent state makes this acceptable. Do not add `accessible_table`, a
//    dietary or allergy field, or anything similar to `option_toggled` or any
//    other event here.
//
// Rule 1 alone is not enough: an attribute can carry no identifier and still
// be the most sensitive thing in the payload. Both rules apply.

import { dispatchTrackingEvent, TrackingDispatchOptions } from './tracking/dispatcher'
import { estimateTableBookingValue } from './booking-conversion-value'
import { trackMetaBookingPurchase } from './meta-pixel'

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

export function trackEventDetailImpression(eventData: {
  eventId: string
  eventName: string
  eventDate: string
  eventCategory?: string
  eventPrice?: number
  source?: string
}) {
  pushToDataLayer({
    event: 'event_detail_impression',
    event_id: eventData.eventId,
    event_name: eventData.eventName,
    event_date: eventData.eventDate,
    event_category: eventData.eventCategory,
    booking_source: eventData.source,
    value: eventData.eventPrice,
    currency: 'GBP'
  }, { sendToApi: true })
}

export function trackEventBookingStart(eventData: {
  eventId: string
  eventName: string
  eventPrice?: number
  eventDate?: string
  partySize?: number
  foodIntent?: string
  source?: string
}) {
  const common = {
    funnel: 'hosted_event_booking',
    source_component: eventData.source,
    destination: 'event_booking_form'
  }

  pushToDataLayer({
    event: 'event_booking_started',
    ...common,
    event_id: eventData.eventId,
    event_name: eventData.eventName,
    event_date: eventData.eventDate,
    party_size: eventData.partySize,
    food_intent: eventData.foodIntent,
    booking_source: eventData.source,
    value: eventData.eventPrice,
    currency: 'GBP'
  }, { sendToApi: true })

  pushToDataLayer({
    event: 'begin_checkout',
    event_id: eventData.eventId,
    event_name: eventData.eventName,
    value: eventData.eventPrice,
    currency: 'GBP'
  })
}

export function trackEventBookingFunnelStep(eventData: {
  step: 'form_view' | 'cta_click' | 'phone_entered' | 'submit' | 'confirmed' | 'blocked'
  eventId: string
  eventName: string
  eventDate?: string
  partySize?: number
  foodIntent?: string
  bookingId?: string | null
  reason?: string | null
  source?: string
}) {
  const common = {
    funnel: 'hosted_event_booking',
    source_component: eventData.source,
    destination: 'event_booking_form'
  }

  pushToDataLayer({
    event: 'event_booking_funnel_step',
    ...common,
    funnel_step: eventData.step,
    event_id: eventData.eventId,
    event_name: eventData.eventName,
    event_date: eventData.eventDate,
    party_size: eventData.partySize,
    food_intent: eventData.foodIntent,
    booking_id: eventData.bookingId,
    blocked_reason: eventData.reason,
    booking_source: eventData.source
  }, { sendToApi: true })

  if (eventData.step === 'submit') {
    pushToDataLayer({
      event: 'event_booking_submit',
      ...common,
      event_id: eventData.eventId,
      event_name: eventData.eventName,
      event_date: eventData.eventDate,
      party_size: eventData.partySize,
      food_intent: eventData.foodIntent,
      booking_source: eventData.source
    }, { sendToApi: true })
  }
}

export function trackEventBookClick(eventData: {
  eventId: string
  eventName: string
  eventPrice?: number
  eventDate?: string
  source?: string
  ctaLabel?: string
}) {
  const payload = {
    funnel: 'hosted_event_booking',
    source_component: eventData.source,
    cta_text: eventData.ctaLabel,
    destination: 'event_detail_or_booking',
    event_id: eventData.eventId,
    event_name: eventData.eventName,
    event_date: eventData.eventDate,
    booking_source: eventData.source,
    cta_label: eventData.ctaLabel,
    value: eventData.eventPrice,
    currency: 'GBP'
  }

  pushToDataLayer({
    event: 'event_book_click',
    ...payload
  }, { sendToApi: true })

  pushToDataLayer({
    event: 'event_reserve_click',
    ...payload
  }, { sendToApi: true })
}

export function trackEventCardView(eventData: {
  eventId: string
  eventName: string
  eventDate?: string
  eventType?: string
  source?: string
}) {
  pushToDataLayer({
    event: 'event_card_view',
    funnel: 'hosted_event_booking',
    source_component: eventData.source,
    event_id: eventData.eventId,
    event_name: eventData.eventName,
    event_date: eventData.eventDate,
    event_type: eventData.eventType
  }, { sendToApi: true })
}

export function trackEventBookingComplete(eventData: {
  eventId: string
  eventName: string
  eventSlug?: string | null
  eventCategoryName?: string | null
  eventCategorySlug?: string | null
  tickets: number
  totalValue?: number
  eventDate?: string
  foodIntent?: string
  bookingId?: string | null
}) {
  pushToDataLayer({
    event: 'event_booking_completed',
    funnel: 'hosted_event_booking',
    source_component: 'event_booking_form',
    destination: 'event_booking_confirmation',
    event_id: eventData.eventId,
    event_name: eventData.eventName,
    event_slug: eventData.eventSlug,
    event_category: eventData.eventCategoryName,
    event_category_slug: eventData.eventCategorySlug,
    event_date: eventData.eventDate,
    booking_id: eventData.bookingId,
    party_size: eventData.tickets,
    food_intent: eventData.foodIntent,
    value: eventData.totalValue,
    currency: 'GBP'
  }, { sendToApi: true })

  pushToDataLayer({
    event: 'purchase',
    event_id: eventData.eventId,
    event_name: eventData.eventName,
    event_category: eventData.eventCategoryName,
    transaction_id: eventData.bookingId || undefined,
    quantity: eventData.tickets,
    value: eventData.totalValue,
    currency: 'GBP'
  })

  if (eventData.bookingId) {
    trackMetaBookingPurchase({
      eventId: eventData.bookingId,
      value: eventData.totalValue,
      currency: 'GBP',
      bookingType: 'event',
      bookingSource: 'event_booking',
      contentName: eventData.eventName,
      contentIds: [eventData.eventId],
      contentCategory: eventData.eventCategoryName ?? eventData.eventCategorySlug ?? null,
      contentType: 'event_booking',
      numItems: eventData.tickets,
      eventDate: eventData.eventDate ?? null,
      foodIntent: eventData.foodIntent ?? null,
      eventSlug: eventData.eventSlug ?? null,
      eventCategorySlug: eventData.eventCategorySlug ?? null
    })
  }
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
  const bookingContext = String(metadata.booking_context || '').toLowerCase()
  const bookingDestination = String(metadata.booking_destination || '').toLowerCase()
  const isSundayRoastBooking =
    bookingContext.includes('sunday') ||
    bookingDestination.includes('sunday_lunch') ||
    bookingDestination.includes('sunday_roast')

  const payload = {
    funnel: 'food_table_booking',
    source_component: source,
    cta_text: metadata.cta_text || 'Book a Table',
    destination: metadata.booking_destination || '/book-table',
    booking_method: 'internal_management_platform',
    booking_source: source,
    ...metadata
  }

  pushToDataLayer({
    event: 'table_booking_click',
    ...payload
  }, { sendToApi: true })

  if (isSundayRoastBooking) {
    pushToDataLayer({
      event: 'sunday_roast_book_click',
      ...payload
    }, { sendToApi: true })
  }
}

// Comprehensive table booking funnel tracking
export function trackTableBookingFunnel(data: {
  step: 'view' | 'start' | 'availability_check' | 'details_entered' | 'submit' | 'success' | 'error'
  partySize?: number
  bookingDate?: string
  bookingTime?: string
	  bookingReference?: string
	  bookingType?: string
	  value?: number
	  errorType?: string
	  errorMessage?: string
	  source: string
  deviceType: 'mobile' | 'desktop'
}) {
  const eventData: GTMEvent = {
    event: 'table_booking_funnel',
    funnel: 'food_table_booking',
    source_component: data.source,
    destination: '/book-table',
    funnel_step: data.step,
    booking_source: data.source,
    device_type: data.deviceType
  }

  // Add optional data if provided
  if (data.partySize) eventData.party_size = data.partySize
  if (data.bookingDate) eventData.booking_date = data.bookingDate
  if (data.bookingTime) eventData.booking_time = data.bookingTime
  if (data.bookingReference) eventData.booking_reference = data.bookingReference
  if (data.bookingType) eventData.booking_type = data.bookingType
  if (data.errorType) eventData.error_type = data.errorType
  if (data.errorMessage) eventData.error_message = data.errorMessage

  pushToDataLayer(eventData)

  if (data.step === 'start') {
    pushToDataLayer({
      event: 'table_booking_started',
      funnel: 'food_table_booking',
      source_component: data.source,
      destination: '/book-table',
      booking_source: data.source,
      booking_type: data.bookingType,
      party_size: data.partySize,
      booking_date: data.bookingDate,
      booking_time: data.bookingTime
    }, { sendToApi: true })

    if (data.bookingType === 'sunday_roast') {
      pushToDataLayer({
        event: 'sunday_roast_booking_started',
        funnel: 'food_table_booking',
        source_component: data.source,
        destination: '/book-table',
        booking_source: data.source,
        party_size: data.partySize,
        booking_date: data.bookingDate,
        booking_time: data.bookingTime
      }, { sendToApi: true })
    }
  }

  if (data.step === 'success') {
    pushToDataLayer({
      event: 'table_booking_completed',
      funnel: 'food_table_booking',
      // value and currency sit high in this literal deliberately. The dispatcher
      // appends page context, device type and up to a dozen attribution keys
      // afterwards, and app/api/analytics/route.ts keeps only the first 25
      // parameters in key order, so anything added late is silently dropped on
      // exactly the attributed bookings that matter most.
      //
      // This does not inflate Total revenue: GA4 counts only `purchase` toward
      // revenue. It gives the funnel event a value so completions can be
      // compared with starts in monetary terms.
      value: estimateTableBookingValue(data.partySize),
      currency: 'GBP',
      source_component: data.source,
      destination: '/booking-confirmation',
      booking_source: data.source,
      booking_type: data.bookingType,
      booking_reference: data.bookingReference,
      party_size: data.partySize,
      booking_date: data.bookingDate,
      booking_time: data.bookingTime
    }, { sendToApi: true })

    if (data.bookingType === 'sunday_roast') {
      pushToDataLayer({
        event: 'sunday_roast_booking_completed',
        funnel: 'food_table_booking',
        source_component: data.source,
        destination: '/booking-confirmation',
        booking_source: data.source,
        booking_reference: data.bookingReference,
        party_size: data.partySize,
        booking_date: data.bookingDate,
        booking_time: data.bookingTime
      }, { sendToApi: true })
    }

	    if (data.bookingReference) {
	      trackMetaBookingPurchase({
	        eventId: data.bookingReference,
	        value: data.value ?? 0,
	        currency: 'GBP',
	        bookingType: data.bookingType || 'table',
        bookingSource: data.source,
        contentName: 'Table booking'
      })
    }
  }
}

export type BookingWizardStep = 'find' | 'choose' | 'details' | 'review'

// A booking wizard step became visible. Fired once per step transition,
// including the initial 'find' step on mount.
export function trackBookingStepViewed(data: { step: BookingWizardStep }) {
  pushToDataLayer({
    event: 'booking_step_viewed',
    step: data.step
  })
}

// A booking option control changed. `value` is the new state: booleans for
// checkboxes, the new count for the high-chair stepper.
//
// The union is deliberately closed and deliberately excludes the
// accessible-table request: see rule 2 in the header. Widening it to a
// health-adjacent attribute is a privacy regression, not a feature.
export function trackOptionToggled(data: {
  option: 'drinks_only' | 'outside_seating' | 'high_chair_count'
  value: boolean | number
  step: BookingWizardStep
}) {
  pushToDataLayer({
    event: 'option_toggled',
    option: data.option,
    value: data.value,
    step: data.step
  })
}

// The chosen slot cannot honour the full high-chair request; the shortfall
// flag was shown to the guest.
export function trackSlotFlagShown(data: { chairsFree: number; chairsRequested: number }) {
  pushToDataLayer({
    event: 'slot_flag_shown',
    chairs_free: data.chairsFree,
    chairs_requested: data.chairsRequested
  })
}

// A previously chosen slot stopped being usable before submit.
export function trackSlotInvalidated(data: {
  // `high_chair_shortfall`: the time survived the change, but now has fewer
  // chairs free than the guest asked for. They have agreed to no such thing, so
  // it goes back to the grid to be chosen again with the count on it.
  reason: 'options_changed' | 'availability_error' | 'high_chair_shortfall'
}) {
  pushToDataLayer({
    event: 'slot_invalidated',
    reason: data.reason
  })
}

// A guest-visible booking error was rendered. `code` is a stable machine
// code, never free text, so no personal data can leak through it.
export function trackBookingErrorShown(data: { code: string }) {
  pushToDataLayer({
    event: 'booking_error_shown',
    code: data.code
  })
}

export function trackMenuView(menuType: 'food' | 'drinks' | 'sunday') {
  pushToDataLayer({
    event: 'view_menu',
    funnel: menuType === 'drinks' ? 'drinks_browsing' : 'food_table_booking',
    source_component: `${menuType}_menu_page`,
    destination: `/${menuType === 'food' ? 'food-menu' : menuType}`,
    menu_type: menuType
  })

  pushToDataLayer({
    event: 'menu_view',
    funnel: menuType === 'drinks' ? 'drinks_browsing' : 'food_table_booking',
    source_component: `${menuType}_menu_page`,
    destination: `/${menuType === 'food' ? 'food-menu' : menuType}`,
    menu_type: menuType
  })
}

export function trackPhoneCallClick(data: { phone?: string; source: string }) {
  pushToDataLayer({
    event: 'phone_call_click',
    funnel: inferFunnelFromSource(data.source),
    source_component: data.source,
    cta_text: 'Call',
    destination: 'tel',
    contact_method: 'phone',
    contact_source: data.source,
    phone: data.phone
  })

  pushToDataLayer({
    event: 'call_click',
    contact_method: 'phone',
    contact_source: data.source,
    phone: data.phone
  }, { sendToApi: true })
}

// Backwards-compatible alias (previously `trackPhoneCall(context)`).
export function trackPhoneCall(context: string) {
  trackPhoneCallClick({ source: context })
}

/**
 * Fires when a visitor opens or downloads a private-hire event brochure PDF.
 * A brochure download is a strong private-hire intent signal, so it reports into
 * the private_hire_enquiry funnel rather than being treated as a generic click.
 */
export function trackBrochureDownload(data: {
  /** Occasion the brochure covers, e.g. 'baby_shower'. */
  brochure: string
  /** Page or component the download started from. */
  source: string
  /** Public path of the PDF. */
  file: string
}) {
  pushToDataLayer({
    event: 'brochure_download',
    funnel: 'private_hire_enquiry',
    source_component: data.source,
    cta_text: 'Download brochure',
    destination: data.file,
    brochure_occasion: data.brochure,
    file_name: data.file.split('/').pop(),
    file_extension: 'pdf'
  })
}

export function trackEmailClick(data: { email: string; source: string; subject?: string }) {
  pushToDataLayer({
    event: 'email_click',
    contact_method: 'email',
    contact_source: data.source,
    email_subject: data.subject
  })
}

export function trackWhatsAppClick(context: string) {
  pushToDataLayer({
    event: 'whatsapp_click',
    funnel: inferFunnelFromSource(context),
    source_component: context,
    cta_text: 'WhatsApp',
    destination: 'whatsapp',
    contact_method: 'whatsapp',
    contact_source: context
  })
}

function inferFunnelFromSource(source?: string): string {
  const value = String(source || '').toLowerCase()
  if (value.includes('christmas')) return 'christmas_enquiry'
  if (value.includes('private')) return 'private_hire_enquiry'
  if (value.includes('event') || value.includes('quiz') || value.includes('bingo') || value.includes('karaoke') || value.includes('music')) return 'hosted_event_booking'
  return 'food_table_booking'
}

// Location/directions tracking
export function trackDirectionsClick(
  source: string,
  data?: { destination?: string; mapPlatform?: string; fromLocation?: string }
) {
  pushToDataLayer({
    event: 'directions_click',
    transport_method: 'driving',
    directions_source: source,
    from_location: data?.fromLocation,
    destination_address: data?.destination,
    map_platform: data?.mapPlatform
  })
}

// Social proof tracking
export function trackReviewClick(platform: string) {
  pushToDataLayer({
    event: 'review_interaction',
    review_platform: platform,
  })
}

export function trackViewItem(data: {
  category: 'event' | 'menu_item'
  name: string
  id?: string | number
}) {
  pushToDataLayer({
    event: 'view_item',
    item_category: data.category,
    item_name: data.name,
    item_id: data.id,
    value: typeof data.id === 'number' ? data.id : undefined
  })
}

export function trackFilterChange(data: {
  context: string
  filterType: string
  value: string
  action?: 'apply' | 'clear'
}) {
  pushToDataLayer({
    event: 'filter_change',
    filter_context: data.context,
    filter_type: data.filterType,
    filter_value: data.value,
    filter_action: data.action ?? 'apply'
  })
}

export function trackWhatsOnFilterUse(data: {
  filter: string
  visibleCount: number
  totalCount: number
}) {
  pushToDataLayer({
    event: 'whats_on_filter_use',
    funnel: 'hosted_event_booking',
    source_component: 'whats_on_filters',
    filter_type: 'event_type',
    filter_value: data.filter,
    visible_count: data.visibleCount,
    total_count: data.totalCount
  }, { sendToApi: true })
}

export function trackSocialClick(data: {
  platform: string
  source: string
  url?: string
  label?: string
  title?: string
}) {
  pushToDataLayer({
    event: 'social_click',
    social_platform: data.platform,
    social_url: data.url,
    click_source: data.source,
    share_title: data.title
  })
}

// Custom events for business insights
export function trackOpeningHoursCheck() {
  pushToDataLayer({
    event: 'check_opening_hours'
  })
}

export function trackFlightStatusCheck(terminal: string) {
  pushToDataLayer({
    event: 'flight_status_check',
    terminal: terminal
  })
}

// Navigation tracking
export function trackNavigationClick(data: {
  label: string
  url: string
  level: 'main' | 'dropdown'
  deviceType: 'mobile' | 'desktop'
  isExternal: boolean
  location?: 'header' | 'footer' | 'mobile_menu'
}) {
  pushToDataLayer({
    event: 'navigation_click',
    navigation_url: data.url,
    navigation_level: data.level,
    device_type: data.deviceType,
    link_type: data.isExternal ? 'external' : 'internal',
    click_location: data.location || 'header_navigation'
  })
}

// Scroll depth tracking
export function trackScrollDepth(milestone: number) {
  if (typeof window === 'undefined') return
  pushToDataLayer({
    event: 'scroll_depth',
    scroll_depth: milestone,
    value: milestone,
  })
}

// Error tracking
export function trackError(errorType: string, errorMessage: string, context?: string) {
  pushToDataLayer({
    event: 'error',
    error_type: errorType,
    error_message: safeText(errorMessage),
    error_context: context
  })
}

// Form interactions
//
// Two things were wrong here until 27 August 2026, and together they meant no
// form on the site had a measurable completion rate.
//
// 1. Neither call passed `sendToApi`, so both went only to the dataLayer and
//    depended on GTM forwarding them. It does not: GA4 recorded ZERO
//    `form_complete` in 28 days even though the recruitment form fires it on
//    the same success path, one line before trackRecruitmentApplicationSubmitted,
//    which DID arrive. Every event that reaches GA4 reliably on this site is one
//    sent through the Measurement Protocol, so these now are too.
//
// 2. `form_start` collided with GA4 Enhanced Measurement, which has "Form
//    interactions" switched on and emits its own `form_start` for any form on
//    the site. The 104 `form_start` events in GA4 were all Google's, not ours,
//    so pairing them with our completions would have compared two different
//    populations. The names now follow the convention the rest of this file
//    already uses for funnels, `*_started` and `*_completed`, which both avoids
//    the collision and makes the pair directly comparable.
export function trackFormStart(form: FormEventInput) {
  const { name, metadata } = normaliseFormEvent(form)

  pushToDataLayer({
    event: 'form_started',
    form_name: name,
    ...metadata
  }, { sendToApi: true })
}

export function trackFormComplete(form: FormEventInput) {
  const { name, metadata } = normaliseFormEvent(form)

  pushToDataLayer({
    event: 'form_completed',
    form_name: name,
    ...metadata
  }, { sendToApi: true })
}

export function trackRecruitmentApplicationSubmitted(data: {
  role?: string
  availabilityCount?: number
  relevantExperience?: string
  startDate?: string
}) {
  pushToDataLayer({
    event: 'recruitment_application_submitted',
    job_role: safeText(data.role),
    availability_count: data.availabilityCount,
    relevant_experience_answer: safeText(data.relevantExperience),
    start_date_answer: safeText(data.startDate)
  }, { sendToApi: true })
}

export function trackFormAbandon(form: FormEventInput, lastField?: string) {
  const { name, metadata } = normaliseFormEvent(form)

  pushToDataLayer({
    event: 'form_abandon',
    form_name: name,
    last_field: lastField,
    ...metadata
  })
}

interface CtaEvent {
  id: string
  label: string
  location: string
  destination: string
  mode?: string
  context?: string
  variant?: string
}

export function trackCtaClick(data: CtaEvent) {
  const payload = {
    event: 'cta_click',
    cta_id: data.id,
    cta_label: data.label,
    cta_location: data.location,
    cta_destination: data.destination,
    cta_mode: data.mode,
    cta_context: data.context,
    cta_variant: data.variant
  }

  pushToDataLayer(payload)

  const foodContexts = new Set(['food', 'sunday_roast', 'pizza_menu', 'heathrow_layover'])
  if (data.context && foodContexts.has(data.context)) {
    pushToDataLayer({
      event: 'food_cta_click',
      cta_id: data.id,
      cta_label: data.label,
      cta_location: data.location,
      cta_destination: data.destination,
      cta_mode: data.mode,
      cta_context: data.context,
      cta_variant: data.variant
    })
  }
}

export function trackBannerEvent(data: {
  id: string
  action: 'view' | 'click' | 'dismiss';
  label?: string
  campaign?: string
}) {
  pushToDataLayer({
    event: 'banner_interaction',
    banner_id: data.id,
    banner_action: data.action,
    banner_campaign: data.campaign
  })
}

export function trackAnchorNavClick(data: {
  section: string
  deviceType?: DeviceType
  location?: string
}) {
  if (typeof window === 'undefined') return

  pushToDataLayer({
    event: 'anchor_nav_click',
    section: data.section,
    device_type: data.deviceType,
    location: data.location,
  })
}

export function trackContextCtaClick(data: {
  label: string
  destination: string
  context: string
  location: string
  mode?: string
}) {
  if (typeof window === 'undefined') return

  pushToDataLayer({
    event: 'context_cta_click',
    label: data.label,
    destination: data.destination,
    context: data.context,
    location: data.location,
    mode: data.mode,
  })
}

export function trackStickyCtaShown(data: {
  secondsVisible: number
  context: string
  deviceType: DeviceType
  location?: string
}) {
  if (typeof window === 'undefined') return

  pushToDataLayer({
    event: 'sticky_cta_shown',
    seconds_visible: data.secondsVisible,
    context: data.context,
    device_type: data.deviceType,
    location: data.location,
  })
}

export function trackCookieConsent(data: {
  action: 'accept_all' | 'reject_all' | 'save_preferences'
  analytics: boolean
  marketing: boolean
  preferences: boolean
}) {
  // sendToApi is deliberately false. This event fires with requireConsent:false
  // so GTM can react to the consent decision, but forwarding it server-side to
  // Google meant a visitor who clicked "Reject all" still had their page path,
  // page title, referrer, device type and user agent sent to Google Analytics.
  // It was also the single largest source of phantom GA4 users: a rejecting
  // visitor never gets a _ga cookie, so every rejection minted a brand-new
  // identity with no session. Keep the dataLayer push, drop the server hit.
  pushToDataLayer({
    event: 'cookie_consent_update',
    consent_analytics: data.analytics,
    consent_marketing: data.marketing,
    consent_preferences: data.preferences
  }, { requireConsent: false, sendToApi: false })
}

export type ModalCloseReason =
  | 'close_button'
  | 'escape_key'
  | 'backdrop_click'
  | 'cta'
  | 'programmatic'

export function trackModalOpen(data: {
  id: string
  title?: string
  size?: string
  backdrop?: string
  extra?: Record<string, unknown>
}) {
  pushToDataLayer({
    event: 'modal_open',
    modal_id: data.id,
    modal_title: safeText(data.title),
    modal_size: data.size,
    modal_backdrop: data.backdrop,
    ...(data.extra ?? {})
  })
}

export function trackModalEngage(data: {
  id: string
  title?: string
  interaction?: 'click' | 'focus' | 'keydown'
  element?: string
  extra?: Record<string, unknown>
}) {
  pushToDataLayer({
    event: 'modal_engage',
    modal_id: data.id,
    modal_title: safeText(data.title),
    engagement_type: data.interaction ?? 'click',
    engagement_element: data.element,
    ...(data.extra ?? {})
  })
}

export function trackModalClose(data: {
  id: string
  title?: string
  reason?: ModalCloseReason
  extra?: Record<string, unknown>
}) {
  pushToDataLayer({
    event: 'modal_close',
    modal_id: data.id,
    modal_title: safeText(data.title),
    modal_reason: data.reason ?? 'programmatic',
    ...(data.extra ?? {})
  })
}

export function trackFaqItemOpened(data: {
  questionText: string
  faqPagePath: string
}) {
  pushToDataLayer({
    event: 'faq_item_opened',
    question_text: safeText(data.questionText),
    faq_page_path: data.faqPagePath,
  })
}

export function trackPrivateHireEnquirySubmitted(data: {
  enquiryType?: string
  pageSource: string
  guestCount?: number
  spaceId?: string
  spaceName?: string
}) {
  pushToDataLayer({
    event: 'private_hire_enquiry_submitted',
    funnel: 'private_hire_enquiry',
    source_component: data.pageSource,
    destination: '/private-hire#enquiry',
    cta_text: 'Submit private hire enquiry',
    enquiry_type: data.enquiryType,
    page_source: data.pageSource,
    party_size: data.guestCount,
    space_id: data.spaceId,
    space_name: safeText(data.spaceName),
  }, { sendToApi: true })
}

export function trackPrivateHireEnquiryStarted(data: {
  enquiryType?: string
  pageSource: string
  guestCount?: number
  spaceId?: string
  spaceName?: string
}) {
  pushToDataLayer({
    event: 'private_hire_enquiry_started',
    funnel: 'private_hire_enquiry',
    source_component: data.pageSource,
    destination: '/private-hire#enquiry',
    cta_text: 'Start private hire enquiry',
    enquiry_type: data.enquiryType,
    page_source: data.pageSource,
    party_size: data.guestCount,
    space_id: data.spaceId,
    space_name: safeText(data.spaceName),
  }, { sendToApi: true })
}

export function trackVenueTourViewed(data: {
  sourcePage: string
  sourceComponent: string
}) {
  pushToDataLayer({
    event: 'venue_tour_viewed',
    funnel: 'private_hire_enquiry',
    page_source: data.sourcePage,
    source_component: data.sourceComponent,
  }, { sendToApi: true })
}

export function trackVenueTourSpaceSelected(data: {
  sourcePage: string
  sourceComponent: string
  spaceId: string
  spaceName: string
}) {
  pushToDataLayer({
    event: 'venue_tour_space_selected',
    funnel: 'private_hire_enquiry',
    page_source: data.sourcePage,
    source_component: data.sourceComponent,
    space_id: data.spaceId,
    space_name: safeText(data.spaceName),
  }, { sendToApi: true })
}

export function trackVenueTourPhotoOpened(data: {
  sourcePage: string
  sourceComponent: string
  photoId: string
  photoName: string
  spaceId?: string
  spaceName?: string
}) {
  pushToDataLayer({
    event: 'venue_tour_photo_opened',
    funnel: 'private_hire_enquiry',
    page_source: data.sourcePage,
    source_component: data.sourceComponent,
    photo_id: data.photoId,
    photo_name: safeText(data.photoName),
    space_id: data.spaceId,
    space_name: safeText(data.spaceName),
  }, { sendToApi: true })
}

export function trackVenueTourEnquiryClicked(data: {
  sourcePage: string
  sourceComponent: string
  destination: string
  spaceId?: string
  spaceName?: string
}) {
  pushToDataLayer({
    event: 'venue_tour_enquiry_clicked',
    funnel: 'private_hire_enquiry',
    page_source: data.sourcePage,
    source_component: data.sourceComponent,
    destination: data.destination,
    cta_text: 'Enquire about private hire',
    space_id: data.spaceId,
    space_name: safeText(data.spaceName),
  }, { sendToApi: true })
}

export function trackQuoteToolStarted(data: {
  eventType?: string
  guestCount?: number
  pageSource?: string
  sourceComponent?: string
  spaceId?: string
  spaceName?: string
}) {
  pushToDataLayer({
    event: 'quote_tool_started',
    funnel: 'private_hire_enquiry',
    source_component: data.sourceComponent || 'private_hire_quote_tool',
    destination: '/private-hire#enquiry',
    cta_text: 'Open quote tool',
    enquiry_type: data.eventType,
    party_size: data.guestCount,
    page_source: data.pageSource,
    space_id: data.spaceId,
    space_name: safeText(data.spaceName),
  }, { sendToApi: true })
}

export function trackQuoteToolCompleted(data: {
  eventType?: string
  guestCount?: number
  estimateValue?: number
  pageSource?: string
  sourceComponent?: string
  spaceId?: string
  spaceName?: string
}) {
  pushToDataLayer({
    event: 'quote_tool_completed',
    funnel: 'private_hire_enquiry',
    source_component: data.sourceComponent || 'private_hire_quote_tool',
    destination: '/private-hire#enquiry',
    cta_text: 'Check availability',
    enquiry_type: data.eventType,
    party_size: data.guestCount,
    value: data.estimateValue,
    currency: 'GBP',
    page_source: data.pageSource,
    space_id: data.spaceId,
    space_name: safeText(data.spaceName),
  }, { sendToApi: true })
}

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
}
