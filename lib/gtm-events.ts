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

// Booking Wizard Tracking
export function trackBookingWizardStep(step: number, stepName: string) {
  pushToDataLayer({
    event: 'booking_wizard_step',
    step_number: step,
    step_name: stepName
  })
}

export function trackBookingWizardComplete(bookingData: {
  booking_type: string
  party_size: number
  is_sunday: boolean
}) {
  pushToDataLayer({
    event: 'booking_wizard_complete',
    booking_type: bookingData.booking_type,
    party_size: bookingData.party_size,
    is_sunday_lunch: bookingData.is_sunday
  })
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
  if (data.bookingTime) eventData.booking_time = data.bookingTime
  if (data.bookingReference) eventData.booking_reference = data.bookingReference
  if (data.errorType) eventData.error_type = data.errorType
  if (data.errorMessage) eventData.error_message = data.errorMessage

  pushToDataLayer(eventData)
}

export function trackMenuView(menuType: 'food' | 'drinks' | 'sunday') {
  pushToDataLayer({
    event: 'view_menu',
    menu_type: menuType
  })
}

export function trackPhoneCallClick(data: { phone?: string; source: string }) {
  pushToDataLayer({
    event: 'phone_call_click',
    contact_method: 'phone',
    contact_source: data.source,
    phone: data.phone
  })
}

// Backwards-compatible alias (previously `trackPhoneCall(context)`).
export function trackPhoneCall(context: string) {
  trackPhoneCallClick({ source: context })
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
    contact_method: 'whatsapp',
    contact_source: context
  })
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
    error_message: safeText(errorMessage),
    error_context: context
  })
}

// Form interactions
export function trackFormStart(form: FormEventInput) {
  const { name, metadata } = normaliseFormEvent(form)

  pushToDataLayer({
    event: 'form_start',
    form_name: name,
    ...metadata
  })
}

export function trackFormComplete(form: FormEventInput) {
  const { name, metadata } = normaliseFormEvent(form)

  pushToDataLayer({
    event: 'form_complete',
    form_name: name,
    ...metadata
  })
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
  pushToDataLayer({
    event: 'cookie_consent_update',
    consent_analytics: data.analytics,
    consent_marketing: data.marketing,
    consent_preferences: data.preferences
  }, { requireConsent: false, sendToApi: true })
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
  pageLocation: string
}) {
  pushToDataLayer({
    event: 'faq_item_opened',
    question_text: safeText(data.questionText),
    page_location: data.pageLocation,
  })
}
