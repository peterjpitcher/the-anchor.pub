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

// Page view tracking (for dynamic routes)
export function trackPageView(url: string, title: string) {
  pushToDataLayer({
    event: 'page_view',
    event_category: 'Navigation',
    event_label: url,
    page_path: url,
    page_title: title,
  })
}

// Booking Wizard Tracking
export function trackBookingWizardStep(step: number, stepName: string) {
  pushToDataLayer({
    event: 'booking_wizard_step',
    event_category: 'Booking Wizard',
    event_action: 'Step Viewed',
    event_label: stepName,
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
    event_category: 'Booking Wizard',
    event_action: 'Booking Completed',
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
    event_category: 'Event Engagement',
    event_label: eventData.eventName,
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
    event_category: 'Event Booking',
    event_label: eventData.eventName,
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
    event_category: 'Event Booking',
    event_label: eventData.eventName,
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
    event_category: 'Restaurant',
    event_label: source,
    booking_method: 'external_opentable',
    booking_source: source,
    ...metadata
  }, { sendToApi: true })
}

// OpenTable widget tracking
export function trackOpenTableWidgetLoaded(data: { source: string }) {
  pushToDataLayer({
    event: 'opentable_widget_loaded',
    event_category: 'Table Booking',
    event_action: 'Widget Loaded',
    event_label: data.source,
    booking_method: 'external_opentable',
    booking_source: data.source
  })
}

export function trackOpenTableWidgetLoadFailed(data: { source: string }) {
  pushToDataLayer({
    event: 'opentable_widget_failed',
    event_category: 'Table Booking',
    event_action: 'Widget Failed',
    event_label: data.source,
    booking_method: 'external_opentable',
    booking_source: data.source
  })
}

export function trackOpenTableWidgetSubmit(data: { source: string }) {
  pushToDataLayer({
    event: 'opentable_widget_submit',
    event_category: 'Table Booking',
    event_action: 'Widget Submit',
    event_label: data.source,
    booking_method: 'external_opentable',
    booking_source: data.source
  })
}

export function trackOpenTableModalOpen(data: { source: string; messageType?: string }) {
  pushToDataLayer({
    event: 'opentable_modal_open',
    event_category: 'Table Booking',
    event_action: 'Modal Open',
    event_label: data.source,
    booking_method: 'external_opentable',
    booking_source: data.source,
    opentable_message_type: data.messageType
  })
}

export function trackOpenTableModalClose(data: { source: string; messageType?: string }) {
  pushToDataLayer({
    event: 'opentable_modal_close',
    event_category: 'Table Booking',
    event_action: 'Modal Close',
    event_label: data.source,
    booking_method: 'external_opentable',
    booking_source: data.source,
    opentable_message_type: data.messageType
  })
}

// Table booking funnel tracking
export function trackTableBookingView(data: {
  source: string
  deviceType: 'mobile' | 'desktop'
}) {
  pushToDataLayer({
    event: 'table_booking_view',
    event_category: 'Table Booking',
    event_label: 'Form Viewed',
    booking_source: data.source,
    device_type: data.deviceType
  })
}

export function trackTableBookingStart(data: {
  source: string
  deviceType: 'mobile' | 'desktop'
}) {
  pushToDataLayer({
    event: 'table_booking_start',
    event_category: 'Table Booking',
    event_label: 'Booking Started',
    booking_source: data.source,
    device_type: data.deviceType
  })
}

export function trackTableBookingAvailabilityCheck(data: {
  partySize: number
  bookingDate: string
  bookingTime: string
  source: string
  deviceType: 'mobile' | 'desktop'
}) {
  pushToDataLayer({
    event: 'table_booking_availability_check',
    event_category: 'Table Booking',
    event_label: 'Availability Checked',
    party_size: data.partySize,
    booking_date: data.bookingDate,
    booking_time: data.bookingTime,
    booking_source: data.source,
    device_type: data.deviceType
  })
}

export function trackTableBookingDetailsEntered(data: {
  partySize: number
  bookingDate: string
  bookingTime: string
  source: string
  deviceType: 'mobile' | 'desktop'
}) {
  pushToDataLayer({
    event: 'table_booking_details_entered',
    event_category: 'Table Booking',
    event_label: 'Details Entered',
    party_size: data.partySize,
    booking_date: data.bookingDate,
    booking_time: data.bookingTime,
    booking_source: data.source,
    device_type: data.deviceType
  })
}

export function trackTableBookingSubmit(data: {
  partySize: number
  bookingDate: string
  bookingTime: string
  source: string
  deviceType: 'mobile' | 'desktop'
}) {
  pushToDataLayer({
    event: 'table_booking_submit',
    event_category: 'Table Booking',
    event_label: 'Booking Submitted',
    party_size: data.partySize,
    booking_date: data.bookingDate,
    booking_time: data.bookingTime,
    booking_source: data.source,
    device_type: data.deviceType
  })
}

export function trackTableBookingSuccess(data: {
  partySize: number
  bookingDate: string
  bookingTime: string
  bookingReference?: string
  source: string
  deviceType: 'mobile' | 'desktop'
}) {
  pushToDataLayer({
    event: 'table_booking_success',
    event_category: 'Table Booking',
    event_label: 'Booking Confirmed',
    party_size: data.partySize,
    booking_date: data.bookingDate,
    booking_time: data.bookingTime,
    booking_reference: data.bookingReference,
    booking_source: data.source,
    device_type: data.deviceType
  })
}

export function trackTableBookingError(data: {
  errorType: string
  errorMessage: string
  partySize?: number
  bookingDate?: string
  bookingTime?: string
  source: string
  deviceType: 'mobile' | 'desktop'
}) {
  pushToDataLayer({
    event: 'table_booking_error',
    event_category: 'Table Booking',
    event_label: 'Booking Error',
    error_type: data.errorType,
    error_message: data.errorMessage,
    party_size: data.partySize,
    booking_date: data.bookingDate,
    booking_time: data.bookingTime,
    booking_source: data.source,
    device_type: data.deviceType
  })
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
  const stepLabels = {
    view: 'Form Viewed',
    start: 'Booking Started',
    availability_check: 'Availability Checked',
    details_entered: 'Details Entered',
    submit: 'Booking Submitted',
    success: 'Booking Confirmed',
    error: 'Booking Error'
  }

  const eventData: GTMEvent = {
    event: 'table_booking_funnel',
    event_category: 'Table Booking Funnel',
    event_label: stepLabels[data.step],
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
    event_category: 'Restaurant',
    event_label: menuType,
    menu_type: menuType
  })
}

export function trackPhoneCallClick(data: { phone?: string; source: string }) {
  pushToDataLayer({
    event: 'phone_call_click',
    event_category: 'Contact',
    event_label: data.phone ?? data.source,
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
    event_category: 'Contact',
    event_label: data.email,
    contact_method: 'email',
    contact_source: data.source,
    email_subject: data.subject
  })
}

export function trackWhatsAppClick(context: string) {
  pushToDataLayer({
    event: 'whatsapp_click',
    event_category: 'Contact',
    event_label: context,
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
    event_category: 'Navigation',
    event_label: source,
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
    event_category: 'Social Proof',
    event_label: platform
  })
}

export function trackViewItem(data: {
  category: 'event' | 'menu_item'
  name: string
  id?: string | number
}) {
  pushToDataLayer({
    event: 'view_item',
    event_category: data.category,
    event_label: data.name,
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
    event_category: 'Filter',
    event_label: `${data.filterType}:${data.value}`,
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
    event_category: 'Social',
    event_label: data.label ?? data.platform,
    social_platform: data.platform,
    social_url: data.url,
    click_source: data.source,
    share_title: data.title
  })
}

// Enhanced Ecommerce for future online ordering
export function trackAddToCart(item: {
  itemId: string
  itemName: string
  itemCategory: string
  price: number
  quantity: number
}) {
  pushToDataLayer({
    event: 'add_to_cart',
    event_category: 'Ecommerce',
    event_label: item.itemName,
    ecommerce: {
      currency: 'GBP',
      value: item.price * item.quantity,
      items: [{
        item_id: item.itemId,
        item_name: item.itemName,
        item_category: item.itemCategory,
        price: item.price,
        quantity: item.quantity
      }]
    }
  })
}

// Custom events for business insights
export function trackOpeningHoursCheck() {
  pushToDataLayer({
    event: 'check_opening_hours',
    event_category: 'User Behaviour',
    event_label: 'Status Bar'
  })
}

export function trackFlightStatusCheck(terminal: string) {
  pushToDataLayer({
    event: 'flight_status_check',
    event_category: 'Travel Features',
    event_label: terminal,
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
    event_category: 'Navigation',
    event_label: data.label,
    navigation_url: data.url,
    navigation_level: data.level,
    device_type: data.deviceType,
    link_type: data.isExternal ? 'external' : 'internal',
    click_location: data.location || 'header_navigation'
  })
}

// Scroll depth tracking
export function trackScrollDepth(milestone: number) {
  pushToDataLayer({
    event: 'scroll_depth',
    event_category: 'Engagement',
    event_label: document.title,
    value: milestone,
    scroll_depth: milestone,
  })
}

// Error tracking
export function trackError(errorType: string, errorMessage: string, context?: string) {
  pushToDataLayer({
    event: 'error',
    event_category: 'Site Errors',
    event_label: errorType,
    error_message: safeText(errorMessage),
    error_context: context
  })
}

// Form interactions
export function trackFormStart(form: FormEventInput) {
  const { name, metadata } = normaliseFormEvent(form)

  pushToDataLayer({
    event: 'form_start',
    event_category: 'Form',
    event_label: name,
    form_name: name,
    ...metadata
  })
}

export function trackFormComplete(form: FormEventInput) {
  const { name, metadata } = normaliseFormEvent(form)

  pushToDataLayer({
    event: 'form_complete',
    event_category: 'Form',
    event_label: name,
    form_name: name,
    ...metadata
  })
}

export function trackFormAbandon(form: FormEventInput, lastField?: string) {
  const { name, metadata } = normaliseFormEvent(form)

  pushToDataLayer({
    event: 'form_abandon',
    event_category: 'Form',
    event_label: name,
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
    event_category: 'CTA',
    event_label: data.label,
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
      event_category: 'Food CTA',
      event_label: data.label,
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
    event_category: 'Announcement',
    event_label: data.label ?? data.id,
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
    event_category: 'Navigation',
    event_label: data.section,
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
    event_category: 'CTA',
    event_label: data.label,
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
    event_category: 'CTA',
    event_label: data.context,
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
    event_category: 'Consent',
    event_label: data.action,
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
    event_category: 'Overlay',
    event_label: data.id,
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
    event_category: 'Overlay',
    event_label: data.id,
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
    event_category: 'Overlay',
    event_label: data.id,
    modal_id: data.id,
    modal_title: safeText(data.title),
    modal_reason: data.reason ?? 'programmatic',
    ...(data.extra ?? {})
  })
}
