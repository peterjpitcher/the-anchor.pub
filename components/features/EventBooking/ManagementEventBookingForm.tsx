'use client'

import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Alert } from '@/components/ui/feedback/Alert'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { Button } from '@/components/ui/primitives/Button'
import { Input } from '@/components/ui/primitives/Input'
import { TurnstileField, type TurnstileFieldRef } from '@/components/security/TurnstileField'
import { trackEventBookingComplete, trackEventBookingFunnelStep, trackEventBookingStart } from '@/lib/gtm-events'
import type { Event, EventTicketType } from '@/lib/api'
import { getEventTicketTypes, hasMultipleTicketPrices } from '@/lib/api'
import { isEventBookingClosed } from '@/lib/event-lifecycle'
import { getEventBookingReassurance, getEventUnitPrice, formatEventBookingMoney } from '@/lib/event-booking-experience'
import {
  getMaxForType,
  getSelectionBreakdown,
  getTotalSeats,
  isSelectionOverCapacity,
} from '@/lib/event-ticket-selection'
import { PhoneLink } from '@/components/PhoneLink'
import { cn } from '@/lib/utils'
import { CONTACT } from '@/lib/constants'
import { getBookingAttributionPayload, getMarketingConsentSignalPayload } from '@/lib/booking-attribution'
import { PayPalEventPaymentSection, type EventPaymentConversionPayload } from './PayPalEventPaymentSection'
import { CommunicationConsentFields } from '@/components/CommunicationConsentFields'
import {
  DEFAULT_COMMUNICATION_CONSENT_STATE,
  buildCommunicationConsentPayload,
  type CommunicationConsentState,
} from '@/lib/communication-consent'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

type EventBookingState = 'confirmed' | 'pending_payment' | 'full_with_waitlist_option' | 'blocked'
type EventSeatingPreference = 'seated' | 'standing'

type EventBookingResult = {
  state: EventBookingState
  booking_id: string | null
  reason: string | null
  seats_remaining: number | null
  seated_remaining?: number | null
  standing_remaining?: number | null
  total_remaining?: number | null
  event_seating_type?: EventSeatingPreference | null
  next_step_url: string | null
  manage_booking_url: string | null
}

type WaitlistResult = {
  queued: boolean
  state: 'queued' | 'not_full' | 'blocked'
  waitlist_entry_id: string | null
  reason: string | null
  seats_remaining: number | null
}

interface ManagementEventBookingFormProps {
  event: Pick<Event, 'id' | 'name' | 'startDate'> &
    Partial<Pick<Event, 'time' | 'slug' | 'category' | 'price' | 'ticket_price' | 'price_per_seat' | 'online_discount_type' | 'online_discount_value' | 'offers' | 'payment_mode' | 'is_free' | 'seats_remaining' | 'booking_mode' | 'seated_remaining' | 'standing_remaining' | 'total_remaining' | 'ticketTypes' | 'ticket_types' | 'booking_cutoff_at'>>
  title?: string
  compact?: boolean
  /**
   * When true, online ticket sales have closed for this event: the form
   * renders a friendly closed message and refuses to submit. The event page
   * normally hides the form entirely, so this is a defensive guard for direct
   * use and for a cutoff that passes while the page is open.
   */
  bookingClosed?: boolean
}

const SALES_CLOSED_MESSAGE = 'Online ticket sales for this event have closed. Please contact us if you need help.'

const BLOCKED_COPY: Record<string, string> = {
  blocked: 'This event is not bookable online right now.',
  not_eligible: 'This booking is currently blocked. Please contact the pub for help.',
  sold_out: 'This event is sold out.',
  payment_required: 'Payment is required to secure this booking.',
  seated_capacity_changed: 'There are no longer enough seats for your group. Please review the available tickets before booking again. No booking has been made.',
  standing_not_available_until_seated_full: 'Standing tickets are only available once seats sell out. Please review current availability before booking again. No booking has been made.'
}

function getBlockedMessage(reason: string | null | undefined): string {
  if (!reason) return BLOCKED_COPY.blocked
  const key = reason.toLowerCase()
  return BLOCKED_COPY[key] || reason
}

function hasErrorCode(payload: any, code: string): boolean {
  if (!payload || typeof payload !== 'object') return false
  const data = payload?.data && typeof payload.data === 'object' ? payload.data : null
  const codes = [
    payload?.error?.code,
    payload?.code,
    data?.code
  ]
  return codes.some((value) => typeof value === 'string' && value.toUpperCase() === code.toUpperCase())
}

function hasPolicyViolation(payload: any): boolean {
  const data = payload?.data || payload
  const candidates = [
    payload?.error?.code,
    payload?.error?.type,
    payload?.code,
    payload?.reason,
    data?.code,
    data?.error_code,
    data?.reason
  ]

  return candidates.some((value) => typeof value === 'string' && value.toUpperCase() === 'POLICY_VIOLATION')
}

function collectBookingAttribution() {
  if (typeof window === 'undefined') return {}
  const url = new URL(window.location.href)
  const read = (key: string) => url.searchParams.get(key) || undefined
  const storedAttribution = getBookingAttributionPayload()
  const fbclid = storedAttribution.fbclid ?? read('fbclid')
  return {
    source_url: url.toString(),
    landing_path: url.pathname,
    utm_source: read('utm_source'),
    utm_medium: read('utm_medium'),
    utm_campaign: read('utm_campaign'),
    utm_content: read('utm_content'),
    utm_term: read('utm_term'),
    fbclid,
    gclid: read('gclid'),
    short_code: read('short_code'),
    ...storedAttribution,
    ...getMarketingConsentSignalPayload(fbclid)
  }
}

function normalizeRemaining(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : null
}

function getBookingTicketLabel(
  result: EventBookingResult | null,
  submittedSeatingPreference: EventSeatingPreference | null
): string {
  const seatingType = result?.event_seating_type || submittedSeatingPreference
  return seatingType === 'standing' ? 'standing tickets' : 'seats'
}

function isCommunalBookingMode(mode: string | null | undefined): boolean {
  return typeof mode === 'string' && mode.trim().toLowerCase() === 'communal'
}

export function ManagementEventBookingForm({
  event,
  title,
  compact = false,
  bookingClosed = false,
}: ManagementEventBookingFormProps) {
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [communicationConsent, setCommunicationConsent] = useState<CommunicationConsentState>(
    DEFAULT_COMMUNICATION_CONSENT_STATE
  )
  const [seats, setSeats] = useState(2)
  // Multi-ticket-type state (only used when the event exposes 2+ active types).
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({})
  // Snapshot of the per-type breakdown at submit time, for the summary /
  // confirmation UI (which render after the form fields are hidden).
  const [submittedTicketBreakdown, setSubmittedTicketBreakdown] = useState<
    Array<{ name: string; quantity: number; lineTotal: number }>
  >([])
  const [submittedSeatingPreference, setSubmittedSeatingPreference] = useState<EventSeatingPreference | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EventBookingResult | null>(null)
  const [latestAvailability, setLatestAvailability] = useState<Pick<EventBookingResult, 'seated_remaining' | 'standing_remaining' | 'seats_remaining'> | null>(null)
  const [paymentConversionPayload, setPaymentConversionPayload] = useState<EventPaymentConversionPayload | null>(null)
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [waitlistResult, setWaitlistResult] = useState<WaitlistResult | null>(null)
  // Set when a submit-time 409 SALES_CLOSED comes back: the event's online
  // sales cutoff passed between page load and submit. Folds into salesClosed so
  // the same friendly closed panel renders (rather than a generic error).
  const [salesClosedAtSubmit, setSalesClosedAtSubmit] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileFieldRef>(null)
  const [honeypot, setHoneypot] = useState('')
  const formLoadedAt = useRef(Date.now())
  const phoneEnteredTracked = useRef(false)
  const formViewedTracked = useRef(false)
  const paymentCompleteTracked = useRef(false)

  // Online ticket sales are closed if the caller says so, or the event's own
  // cutoff has passed. Either way the form must not render its fields or POST.
  const salesClosed = bookingClosed || isEventBookingClosed(event) || salesClosedAtSubmit
  const bookingReassurance = getEventBookingReassurance({ ...event, ...latestAvailability })
  const isCommunalEvent = isCommunalBookingMode(event.booking_mode)
  // Multi-type flow: only when the event exposes 2+ active types at differing
  // prices AND is not communal (communal uses the available seating type).
  const ticketTypes = getEventTicketTypes(event)
  const isMultiTypeEvent = !isCommunalEvent && hasMultipleTicketPrices(event)
  const eventUnitPrice = getEventUnitPrice(event)
  const isPaidEvent = typeof eventUnitPrice === 'number' && eventUnitPrice > 0
  // Multi-type derived state.
  const multiTypeTotalSeats = getTotalSeats(ticketQuantities)
  const multiTypeBreakdown = getSelectionBreakdown(ticketTypes, ticketQuantities)
  const multiTypeOverCapacity = isMultiTypeEvent && isSelectionOverCapacity(ticketTypes, ticketQuantities)
  // Seats actually being booked, regardless of flow.
  const effectiveSeats = isMultiTypeEvent ? multiTypeTotalSeats : seats
  const ticketSelectionValid = !isMultiTypeEvent || (multiTypeTotalSeats > 0 && multiTypeTotalSeats <= 6 && !multiTypeOverCapacity)
  const seatedRemaining = normalizeRemaining(latestAvailability ? latestAvailability.seated_remaining : event.seated_remaining)
  const standingRemaining = normalizeRemaining(latestAvailability ? latestAvailability.standing_remaining : event.standing_remaining)
  const seatedDisabled = isCommunalEvent && seatedRemaining !== null && seatedRemaining <= 0
  const standingDisabled = isCommunalEvent && (standingRemaining === null || standingRemaining <= 0)
  const seatingPreference: EventSeatingPreference = seatedDisabled && !standingDisabled ? 'standing' : 'seated'
  const availableForSelection = isCommunalEvent
    ? (seatingPreference === 'standing' ? standingRemaining : seatedRemaining)
    : normalizeRemaining(event.seats_remaining)
  const selectionOverCapacity = availableForSelection !== null && seats > availableForSelection
  const submittedTicketLabel = getBookingTicketLabel(result, submittedSeatingPreference)
  const fellBackToStanding = isCommunalEvent &&
    submittedSeatingPreference === 'seated' &&
    result?.event_seating_type === 'standing'
  const waitlistPlaceLabel = isCommunalEvent ? 'places' : 'seats'

  useEffect(() => {
    if (formViewedTracked.current) return
    formViewedTracked.current = true
    trackEventBookingFunnelStep({
      step: 'form_view',
      eventId: event.id,
      eventName: event.name,
      eventDate: event.startDate,
      source: 'event_booking_form'
    })
  }, [event.id, event.name, event.startDate])

  // Adjust a ticket type's quantity within its available capacity.
  function setTicketTypeQuantity(type: EventTicketType, nextQuantity: number) {
    const max = Math.min(getMaxForType(type, ticketTypes, ticketQuantities), 6 - multiTypeTotalSeats + (ticketQuantities[type.id] || 0))
    const clamped = Math.max(0, Math.min(nextQuantity, max))
    setTicketQuantities((prev) => ({ ...prev, [type.id]: clamped }))
  }

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault()
    // Defensive: never POST once online sales have closed for this event.
    if (salesClosed) {
      setError(SALES_CLOSED_MESSAGE)
      return
    }
    setError(null)
    setResult(null)
    setPaymentConversionPayload(null)
    paymentCompleteTracked.current = false
    setSubmittedSeatingPreference(null)
    setSubmittedTicketBreakdown([])
    setWaitlistResult(null)

    const clampedSeats = isMultiTypeEvent ? multiTypeTotalSeats : seats
    if (clampedSeats > 6) {
      setError('For more than 6 people, please call us.')
      return
    }
    if (!isMultiTypeEvent && selectionOverCapacity) {
      setError('That many tickets are no longer available. Please choose fewer tickets or call us.')
      return
    }

    const ticketSelections = isMultiTypeEvent
      ? multiTypeBreakdown.lines.map((line) => ({
          ticket_type_id: line.type.id,
          quantity: line.quantity,
        }))
      : null

    setLoading(true)

    if (isMultiTypeEvent) {
      if (clampedSeats < 1) {
        setLoading(false)
        setError('Please choose at least one ticket.')
        return
      }
      if (multiTypeOverCapacity) {
        setLoading(false)
        setError('Some ticket types no longer have that many seats available.')
        return
      }
    }

    if (!firstName.trim()) {
      setLoading(false)
      setError('Please enter your first name.')
      return
    }

    if (!lastName.trim()) {
      setLoading(false)
      setError('Please enter your last name.')
      return
    }

    if (!phone.trim()) {
      setLoading(false)
      setError('Please enter your mobile number.')
      return
    }

    const resolvedFirstName = firstName.trim()
    const resolvedLastName = lastName.trim()
    const resolvedEmail = email.trim()

    // Required since 2026-08-19. It was optional, and the label said so, which is why
    // roughly half of every month's bookers arrived with no address on file at all. The
    // confirmation is a real reason to ask, so the field now asks properly.
    if (!resolvedEmail) {
      setLoading(false)
      setError('Please enter your email address so we can send your confirmation.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resolvedEmail)) {
      setLoading(false)
      setError('Please enter a valid email address.')
      return
    }

    trackEventBookingStart({
      eventId: event.id,
      eventName: event.name,
      eventDate: event.startDate,
      partySize: clampedSeats,
      source: 'event_booking_form'
    })
    trackEventBookingFunnelStep({
      step: 'submit',
      eventId: event.id,
      eventName: event.name,
      eventDate: event.startDate,
      partySize: clampedSeats,
      source: 'event_booking_form'
    })

    const attribution = collectBookingAttribution()
    const totalValue = isMultiTypeEvent
      ? multiTypeBreakdown.total
      : calculateBookingValue(event, clampedSeats)
    const bookingSeatingPreference = isCommunalEvent ? seatingPreference : null
    setSubmittedSeatingPreference(bookingSeatingPreference)
    setSubmittedTicketBreakdown(
      isMultiTypeEvent
        ? multiTypeBreakdown.lines.map((line) => ({
            name: line.type.name,
            quantity: line.quantity,
            lineTotal: line.lineTotal,
          }))
        : []
    )

    try {
      const response = await fetch('/api/event-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event_id: event.id,
          phone: phone.trim(),
          ...(resolvedEmail ? { email: resolvedEmail } : {}),
          default_country_code: '44',
          first_name: resolvedFirstName,
          last_name: resolvedLastName,
          seats: clampedSeats,
          ...(ticketSelections ? { ticket_selections: ticketSelections } : {}),
          ...(bookingSeatingPreference ? { seating_preference: bookingSeatingPreference } : {}),
          event_slug: event.slug,
          event_name: event.name,
          event_date: event.startDate,
          event_category_name: event.category?.name,
          event_category_slug: event.category?.slug,
          event_price: getEventUnitPrice(event),
          event_value: totalValue,
          communication_consent: buildCommunicationConsentPayload(communicationConsent),
          ...attribution,
          ...(turnstileToken ? { turnstile_token: turnstileToken } : {}),
          ...(honeypot ? { website: honeypot } : {}),
          _t: Math.floor((Date.now() - formLoadedAt.current) / 1000)
        })
      })

      const body = await response.json()
      const data = body?.data || body

      if (!response.ok || body?.success === false) {
        // The event's online sales cutoff passed between page load and submit.
        // Route into the component's own closed-state so the friendly closed
        // panel shows, the spinner clears, and no generic error is thrown.
        if (response.status === 409 && hasErrorCode(body, 'SALES_CLOSED')) {
          // finally clears loading + resets turnstile; just flip closed-state.
          setSalesClosedAtSubmit(true)
          return
        }

        if (response.status === 409 && hasPolicyViolation(body)) {
          const policyMessage =
            body?.error?.message ||
            'This booking cannot be completed. Please contact us for assistance.'
          setError(String(policyMessage))
          return
        }

        const upstreamError =
          body?.error?.message ||
          body?.error ||
          data?.error ||
          'We could not complete this event booking.'
        throw new Error(upstreamError)
      }

      if (!data || typeof data !== 'object' || !data.state) {
        throw new Error('Booking response was incomplete. Please try again.')
      }

      const bookingData = data as EventBookingResult
      setResult(bookingData)

      if (bookingData.state === 'pending_payment' && bookingData.booking_id) {
        setPaymentConversionPayload({
          eventId: event.id,
          eventSlug: event.slug ?? null,
          eventName: event.name,
          eventCategoryName: event.category?.name ?? null,
          eventCategorySlug: event.category?.slug ?? null,
          eventDate: event.startDate,
          tickets: clampedSeats,
          value: totalValue,
          foodIntent: null,
          attribution,
          // Consent-gated inside PayPalEventPaymentSection; hashed server-side.
          email: resolvedEmail || null,
          phone: phone.trim() || null,
        })
      }

      if (bookingData.state === 'confirmed') {
        setPaymentConversionPayload(null)
        trackEventBookingFunnelStep({
          step: 'confirmed',
          eventId: event.id,
          eventName: event.name,
          eventDate: event.startDate,
          partySize: clampedSeats,
          bookingId: bookingData.booking_id,
          source: 'event_booking_form'
        })
        trackEventBookingComplete({
          eventId: event.id,
          eventName: event.name,
          eventSlug: event.slug,
          eventCategoryName: event.category?.name ?? null,
          eventCategorySlug: event.category?.slug ?? null,
          eventDate: event.startDate,
          tickets: clampedSeats,
          totalValue,
          bookingId: bookingData.booking_id
        })
      }

      if (bookingData.state === 'blocked') {
        if (bookingData.reason === 'seated_capacity_changed' || bookingData.reason === 'standing_not_available_until_seated_full') {
          setLatestAvailability({
            seated_remaining: bookingData.seated_remaining,
            standing_remaining: bookingData.standing_remaining,
            seats_remaining: bookingData.seats_remaining,
          })
        }
        setPaymentConversionPayload(null)
        trackEventBookingFunnelStep({
          step: 'blocked',
          eventId: event.id,
          eventName: event.name,
          eventDate: event.startDate,
          partySize: clampedSeats,
          reason: bookingData.reason,
          source: 'event_booking_form'
        })
        setError(getBlockedMessage(bookingData.reason))
      }
    } catch (submitError: any) {
      trackEventBookingFunnelStep({
        step: 'blocked',
        eventId: event.id,
        eventName: event.name,
        eventDate: event.startDate,
        partySize: clampedSeats,
        reason: submitError?.message || 'submission_error',
        source: 'event_booking_form'
      })
      setError(submitError?.message || 'We could not complete this event booking.')
    } finally {
      setLoading(false)
      setTurnstileToken(null)
      turnstileRef.current?.reset()
    }
  }

  function handleEventPaymentSuccess() {
    if (!result?.booking_id || !paymentConversionPayload || paymentCompleteTracked.current) return
    paymentCompleteTracked.current = true

    trackEventBookingFunnelStep({
      step: 'confirmed',
      eventId: event.id,
      eventName: event.name,
      eventDate: event.startDate,
      partySize: paymentConversionPayload.tickets,
      foodIntent: paymentConversionPayload.foodIntent || undefined,
      bookingId: result.booking_id,
      source: 'event_booking_form'
    })
    trackEventBookingComplete({
      eventId: event.id,
      eventName: event.name,
      eventSlug: event.slug,
      eventCategoryName: event.category?.name ?? null,
      eventCategorySlug: event.category?.slug ?? null,
      eventDate: event.startDate,
      tickets: paymentConversionPayload.tickets,
      totalValue: paymentConversionPayload.value ?? undefined,
      foodIntent: paymentConversionPayload.foodIntent || undefined,
      bookingId: result.booking_id
    })

    setResult({
      ...result,
      state: 'confirmed',
      next_step_url: null
    })
    setPaymentConversionPayload(null)
  }

  function handleEventPaymentManualReview() {
    trackEventBookingFunnelStep({
      step: 'blocked',
      eventId: event.id,
      eventName: event.name,
      eventDate: event.startDate,
      partySize: paymentConversionPayload?.tickets,
      foodIntent: paymentConversionPayload?.foodIntent || undefined,
      bookingId: result?.booking_id,
      reason: 'manual_review_after_payment',
      source: 'event_booking_form'
    })
  }

  async function handleJoinWaitlist() {
    setError(null)
    setWaitlistLoading(true)
    setWaitlistResult(null)

    try {
      const response = await fetch('/api/event-waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event_id: event.id,
          phone: phone.trim(),
          default_country_code: '44',
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          requested_seats: seats,
          communication_consent: buildCommunicationConsentPayload(communicationConsent),
          ...(turnstileToken ? { turnstile_token: turnstileToken } : {}),
          ...(honeypot ? { website: honeypot } : {}),
          _t: Math.floor((Date.now() - formLoadedAt.current) / 1000)
        })
      })

      const body = await response.json()
      const data = body?.data || body

      if (!response.ok || body?.success === false) {
        const upstreamError =
          body?.error?.message ||
          body?.error ||
          data?.error ||
          'We could not join the waitlist right now.'
        throw new Error(upstreamError)
      }

      if (!data || typeof data !== 'object' || !('state' in data)) {
        throw new Error('Waitlist response was incomplete. Please try again.')
      }

      setWaitlistResult(data as WaitlistResult)
    } catch (joinError: any) {
      setError(joinError?.message || 'We could not join the waitlist right now.')
    } finally {
      setWaitlistLoading(false)
    }
  }

  // Per-type breakdown block for the result alerts (multi-type bookings only).
  const submittedBreakdownBlock = submittedTicketBreakdown.length > 0 ? (
    <div className="mt-2 space-y-1 text-sm">
      {submittedTicketBreakdown.map((line) => (
        <div key={line.name} className="flex justify-between">
          <span>
            {line.quantity} × {line.name}
          </span>
          <span>{formatEventBookingMoney(line.lineTotal)}</span>
        </div>
      ))}
      <div className="flex justify-between border-t border-current/20 pt-1 font-semibold">
        <span>Total</span>
        <span>
          {formatEventBookingMoney(
            submittedTicketBreakdown.reduce((sum, line) => sum + line.lineTotal, 0)
          )}
        </span>
      </div>
    </div>
  ) : null

  if (salesClosed) {
    return (
      <Card>
        <CardBody className={compact ? 'space-y-3 p-3 lg:p-4' : 'space-y-5'}>
          <Alert variant="info" title="Online ticket sales have closed">
            <p>{SALES_CLOSED_MESSAGE}</p>
          </Alert>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody className={compact ? 'space-y-3 p-3 lg:p-4' : 'space-y-5'}>
        <div className="space-y-1">
          {title ? (
            <h2 className={compact ? 'text-xl leading-tight text-ink-strong' : 'text-2xl text-ink-strong'}>
              {title}
            </h2>
          ) : null}
          <p className="text-sm font-semibold leading-snug text-accent-text">{bookingReassurance}</p>
        </div>

        <form onSubmit={handleSubmit} className={compact ? 'space-y-3' : 'space-y-4'}>
          {isMultiTypeEvent ? (
            <fieldset className="space-y-3 rounded-sm border border-line bg-surface-sunk p-3">
              <legend className="px-1 text-sm font-semibold text-ink">Choose your tickets</legend>
              <div className="space-y-2.5">
                {ticketTypes.map((type) => {
                  const quantity = ticketQuantities[type.id] || 0
                  const max = Math.min(getMaxForType(type, ticketTypes, ticketQuantities), 6 - multiTypeTotalSeats + (ticketQuantities[type.id] || 0))
                  const soldOut = max <= 0 && quantity <= 0
                  return (
                    <div
                      key={type.id}
                      className="flex items-start justify-between gap-3 rounded-sm border border-line bg-surface p-2.5"
                    >
                      <div className="min-w-0">
                        <span className="block text-sm font-semibold text-ink">{type.name}</span>
                        {type.description ? (
                          <span className="block text-xs leading-relaxed text-ink-muted">{type.description}</span>
                        ) : null}
                        <span className="mt-0.5 block text-xs font-semibold text-accent-text">
                          {formatEventBookingMoney(type.price)}
                          {soldOut ? ' · Sold out' : ''}
                        </span>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label={`Remove one ${type.name} ticket`}
                          disabled={quantity <= 0}
                          onClick={() => setTicketTypeQuantity(type, quantity - 1)}
                        >
                          −
                        </Button>
                        <span className="w-6 text-center text-sm font-semibold text-ink" aria-live="polite">
                          {quantity}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label={`Add one ${type.name} ticket`}
                          disabled={quantity >= max}
                          onClick={() => setTicketTypeQuantity(type, quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {multiTypeBreakdown.lines.length > 0 ? (
                <div className="space-y-1 border-t border-line px-1 pt-2.5 text-sm">
                  {multiTypeBreakdown.lines.map((line) => (
                    <div key={line.type.id} className="flex justify-between text-ink-muted">
                      <span>
                        {line.quantity} × {line.type.name}
                      </span>
                      <span>{formatEventBookingMoney(line.lineTotal)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-1 font-semibold text-ink">
                    <span>Total ({multiTypeTotalSeats} {multiTypeTotalSeats === 1 ? 'ticket' : 'tickets'})</span>
                    <span>{formatEventBookingMoney(multiTypeBreakdown.total)}</span>
                  </div>
                </div>
              ) : (
                <p className="px-1 text-xs text-ink-muted">Add at least one ticket to continue.</p>
              )}

              {multiTypeOverCapacity ? (
                <p className="px-1 text-xs font-semibold text-anchor-danger">
                  Some ticket types no longer have that many seats available.
                </p>
              ) : null}
            </fieldset>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2" role="group" aria-label={seatingPreference === 'standing' ? 'Choose number of standing tickets' : 'Choose number of seats'}>
                {[1, 2, 3, 4, 5, 6].map((count) => {
                  const selected = seats === count
                  return (
                    <button
                      key={count}
                      type="button"
                      aria-pressed={selected}
                      disabled={availableForSelection !== null && count > availableForSelection}
                      onClick={() => {
                        setSeats(count)
                      }}
                      className={cn(
                        'min-h-[44px] min-w-[44px] rounded-md border px-3 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                        selected
                          ? 'border-accent bg-accent text-white'
                          : 'border-line bg-surface text-ink hover:border-accent'
                      )}
                    >
                      {count}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <p className="text-sm text-ink-muted">
            More than 6 people? <PhoneLink phone={CONTACT.phone} source="event_booking_large_group" className="underline">Call us</PhoneLink>.
          </p>

          {!isMultiTypeEvent && selectionOverCapacity && availableForSelection !== null ? (
            <p className="text-sm text-ink-muted">
              {availableForSelection === 0
                ? 'No tickets are available. Please call us for help.'
                : `Only ${availableForSelection} ${seatingPreference === 'standing' ? 'standing ticket' : 'seat'}${availableForSelection === 1 ? ' remains' : 's remain'}. Please choose fewer tickets or call us.`}
            </p>
          ) : null}

          {isCommunalEvent && seatedDisabled && !standingDisabled ? (
            <p className="rounded-sm border border-line bg-surface-sunk p-2.5 text-sm leading-relaxed text-ink">
              Seated places are full, so this booking will be for standing tickets. Same event price,
              no table seat included.
            </p>
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="First name"
              type="text"
              required
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="Jane"
              autoComplete="given-name"
            />
            <Input
              label="Last name"
              type="text"
              required
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Guest"
              autoComplete="family-name"
            />
          </div>

          <Input
            label="Mobile number"
            type="tel"
            required
            value={phone}
            onChange={(inputEvent) => {
              const nextPhone = inputEvent.target.value
              setPhone(nextPhone)
              if (!phoneEnteredTracked.current && nextPhone.replace(/\D/g, '').length >= 7) {
                phoneEnteredTracked.current = true
                trackEventBookingFunnelStep({
                  step: 'phone_entered',
                  eventId: event.id,
                  eventName: event.name,
                  eventDate: event.startDate,
                  source: 'event_booking_form'
                })
              }
            }}
            placeholder="07xxx xxxxxx"
            autoComplete="tel"
            helperText="For your confirmation text."
          />

          <Input
            label="Email address"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="jane@example.com"
            autoComplete="email"
            helperText="So we can send your confirmation and any payment follow-up."
          />

          <CommunicationConsentFields
            value={communicationConsent}
            onChange={setCommunicationConsent}
            variant="compact"
          />

          {/* Honeypot, hidden from real users, filled by bots */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
            <label htmlFor="evt-website">Website</label>
            <input
              id="evt-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {TURNSTILE_SITE_KEY && (
            <TurnstileField
              id="event-booking-turnstile"
              turnstileRef={turnstileRef}
              onTokenChange={setTurnstileToken}
              className="space-y-2"
            />
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={loading}
            disabled={(TURNSTILE_SITE_KEY ? !turnstileToken : false) || !ticketSelectionValid}
            onClick={() => {
              trackEventBookingFunnelStep({
                step: 'cta_click',
                eventId: event.id,
                eventName: event.name,
                eventDate: event.startDate,
                partySize: effectiveSeats,
                source: 'event_booking_form'
              })
            }}
          >
            {isCommunalEvent && seatingPreference === 'standing' ? 'Book standing tickets' : 'Reserve my seats'}
          </Button>
        </form>

        {error && (
          <Alert variant="error" title="Booking not completed">
            <p>{error}</p>
            <p className="mt-2">
              Call <PhoneLink phone={CONTACT.phone} source="event_booking_error" showIcon={false} className="font-semibold underline">01753 682707</PhoneLink> if you need help.
            </p>
          </Alert>
        )}

        {result?.state === 'confirmed' && (
          <Alert variant="success" title="Event booking confirmed">
            <p>Your {submittedTicketLabel} are confirmed for {event.name}.</p>
            {submittedBreakdownBlock}
            {fellBackToStanding ? (
              <p className="mt-2">There were not enough seats for your group, so we have booked standing tickets. No table seat is included.</p>
            ) : null}
            {result.manage_booking_url ? (
              <div className="mt-3">
                <Button asChild size="sm" variant="outline">
                  <a href={result.manage_booking_url} target="_blank" rel="noopener noreferrer">
                    Manage Booking
                  </a>
                </Button>
              </div>
            ) : null}
          </Alert>
        )}

        {result?.state === 'pending_payment' && (
          <Alert variant="warning" title={`Payment needed to secure your ${submittedTicketLabel}`}>
            <p>Your {submittedTicketLabel} are currently on hold.</p>
            {submittedBreakdownBlock}
            {fellBackToStanding ? (
              <p className="mt-2">There were not enough seats for your group, so we have held standing tickets. No table seat is included.</p>
            ) : null}
            {result.booking_id && paymentConversionPayload ? (
              <PayPalEventPaymentSection
                bookingId={result.booking_id}
                bookingSummary={`${event.name} · ${paymentConversionPayload.tickets} ${paymentConversionPayload.tickets === 1 ? 'ticket' : 'tickets'}`}
                bookingBreakdown={submittedTicketBreakdown}
                fallbackUrl={result.next_step_url}
                conversionPayload={paymentConversionPayload}
                onSuccess={handleEventPaymentSuccess}
                onManualReview={handleEventPaymentManualReview}
                onError={setError}
              />
            ) : null}
            {result.next_step_url ? (
              <div className="mt-3">
                <Button asChild size="sm" variant={paymentConversionPayload ? 'outline' : 'primary'}>
                  <a href={result.next_step_url} target="_blank" rel="noopener noreferrer">
                    Open Payment Link
                  </a>
                </Button>
              </div>
            ) : null}
            {result.manage_booking_url ? (
              <div className="mt-3">
                <Button asChild size="sm" variant="outline">
                  <a href={result.manage_booking_url} target="_blank" rel="noopener noreferrer">
                    Manage Booking
                  </a>
                </Button>
              </div>
            ) : null}
          </Alert>
        )}

        {result?.state === 'full_with_waitlist_option' && (
          <Alert variant="info" title="This event is currently full">
            <p>You can join the waitlist and we will contact you if {waitlistPlaceLabel} become available.</p>
            <div className="mt-3">
              <Button type="button" size="sm" loading={waitlistLoading} onClick={handleJoinWaitlist}>
                Join Waitlist
              </Button>
            </div>
            {waitlistResult?.state === 'queued' && (
              <p className="mt-3 font-semibold text-anchor-success">You’re on the waitlist. We’ll text you if {waitlistPlaceLabel} open up.</p>
            )}
            {waitlistResult && waitlistResult.state !== 'queued' && (
              <p className="mt-3">{waitlistResult.reason || 'We could not join the waitlist for this event.'}</p>
            )}
          </Alert>
        )}
      </CardBody>
    </Card>
  )
}

function calculateBookingValue(
  event: ManagementEventBookingFormProps['event'],
  tickets: number
): number {
  const price = getEventUnitPrice(event)
  return price ? price * tickets : 0
}
