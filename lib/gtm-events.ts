// Google Tag Manager Event Tracking Utilities
// Centralised event tracking for The Anchor website

import { dispatchTrackingEvent, TrackingDispatchOptions } from './tracking/dispatcher'

interface GTMEvent {
  event: string
  [key: string]: any
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
    page_path: url,
    page_title: title,
    page_location: window.location.href
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

export function trackPhoneCall(context: string) {
  pushToDataLayer({
    event: 'phone_call',
    event_category: 'Contact',
    event_label: context,
    contact_method: 'phone'
  })
}

export function trackWhatsAppClick(context: string) {
  pushToDataLayer({
    event: 'whatsapp_click',
    event_category: 'Contact',
    event_label: context,
    contact_method: 'whatsapp'
  })
}

// Location/directions tracking
export function trackDirectionsClick(fromLocation: string) {
  pushToDataLayer({
    event: 'get_directions',
    event_category: 'Navigation',
    event_label: fromLocation,
    transport_method: 'driving'
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
    page_location: window.location.href,
    page_title: document.title,
  })
}

// Error tracking
export function trackError(errorType: string, errorMessage: string, context?: string) {
  pushToDataLayer({
    event: 'error',
    event_category: 'Site Errors',
    event_label: errorType,
    error_message: errorMessage,
    error_context: context
  })
}

// Form interactions
export function trackFormStart(form: FormEventInput) {
  const { name, metadata } = normaliseFormEvent(form)

  pushToDataLayer({
    event: 'form_start',
    event_category: 'Form Interaction',
    event_label: name,
    form_name: name,
    ...metadata
  })
}

export function trackFormComplete(form: FormEventInput) {
  const { name, metadata } = normaliseFormEvent(form)

  pushToDataLayer({
    event: 'form_complete',
    event_category: 'Form Interaction',
    event_label: name,
    form_name: name,
    ...metadata
  })
}

export function trackFormAbandon(form: FormEventInput, lastField?: string) {
  const { name, metadata } = normaliseFormEvent(form)

  pushToDataLayer({
    event: 'form_abandon',
    event_category: 'Form Interaction',
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
  deviceType?: 'mobile' | 'tablet' | 'desktop' | 'unknown'
  location?: string
}) {
  if (typeof window === 'undefined') return

  pushToDataLayer({
    event: 'anchor_nav_click',
    section: data.section,
    device_type: data.deviceType,
    location: data.location,
    page_path: window.location.pathname,
    page_location: window.location.href
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
    page_path: window.location.pathname,
    page_location: window.location.href
  })
}

export function trackStickyCtaShown(data: {
  secondsVisible: number
  context: string
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown'
  location?: string
}) {
  if (typeof window === 'undefined') return

  pushToDataLayer({
    event: 'sticky_cta_shown',
    seconds_visible: data.secondsVisible,
    context: data.context,
    device_type: data.deviceType,
    location: data.location,
    page_path: window.location.pathname,
    page_location: window.location.href
  })
}
