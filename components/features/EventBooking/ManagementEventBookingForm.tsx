'use client'

import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Alert } from '@/components/ui/feedback/Alert'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { Button } from '@/components/ui/primitives/Button'
import { Input } from '@/components/ui/primitives/Input'
import { TurnstileField, type TurnstileFieldRef } from '@/components/security/TurnstileField'
import { trackEventBookingComplete, trackEventBookingFunnelStep, trackEventBookingStart } from '@/lib/gtm-events'
import type { Event } from '@/lib/api'
import { getEventBookingReassurance, getEventUnitPrice } from '@/lib/event-booking-experience'
import { PhoneLink } from '@/components/PhoneLink'
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
type FoodIntent = 'planning_to_eat' | 'event_only'
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
    Partial<Pick<Event, 'time' | 'slug' | 'category' | 'price' | 'ticket_price' | 'price_per_seat' | 'online_discount_type' | 'online_discount_value' | 'offers' | 'payment_mode' | 'is_free' | 'seats_remaining' | 'booking_mode' | 'seated_remaining' | 'standing_remaining' | 'total_remaining'>>
  title?: string
  compact?: boolean
  foodPrompt?: string
}

const BLOCKED_COPY: Record<string, string> = {
  blocked: 'This event is not bookable online right now.',
  not_eligible: 'This booking is currently blocked. Please contact the pub for help.',
  sold_out: 'This event is sold out.',
  payment_required: 'Payment is required to secure this booking.'
}

const FOOD_INTENT_OPTIONS: Array<{ value: FoodIntent; label: string; description: string }> = [
  {
    value: 'planning_to_eat',
    label: 'Planning to eat before the event',
    description: 'Arrive early and order from the team on the night.'
  },
  {
    value: 'event_only',
    label: 'Event or drinks only',
    description: 'Reserve seats without food on this visit.'
  }
]

function getBlockedMessage(reason: string | null | undefined): string {
  if (!reason) return BLOCKED_COPY.blocked
  const key = reason.toLowerCase()
  return BLOCKED_COPY[key] || reason
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

function getCompactFoodPrompt(value: string): string {
  const arriveFromMatch = value.match(/arrive from\s+([^.\s]+)\s+for food/i)
  if (arriveFromMatch?.[1]) {
    return `Food from ${arriveFromMatch[1]}. Not a pre-order.`
  }

  return 'Not a food pre-order.'
}

function normalizeRemaining(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : null
}

function pluralizeTicket(count: number): string {
  return count === 1 ? 'ticket' : 'tickets'
}

function pluralizePlace(count: number): string {
  return count === 1 ? 'place' : 'places'
}

function getCommunalAvailabilityText(
  seatedRemaining: number | null,
  standingRemaining: number | null,
  totalRemaining: number | null
): string | null {
  if (seatedRemaining === 0 && standingRemaining && standingRemaining > 0) {
    return `Seated places are full. ${standingRemaining} standing ${pluralizeTicket(standingRemaining)} available.`
  }

  if (seatedRemaining && seatedRemaining > 0 && standingRemaining === 0) {
    return `${seatedRemaining} seated ${pluralizePlace(seatedRemaining)} available. Standing tickets are full.`
  }

  if (seatedRemaining !== null && standingRemaining !== null) {
    return `${seatedRemaining} seated ${pluralizePlace(seatedRemaining)} and ${standingRemaining} standing ${pluralizeTicket(standingRemaining)} available.`
  }

  if (seatedRemaining !== null) {
    return `${seatedRemaining} seated ${pluralizePlace(seatedRemaining)} available.`
  }

  if (standingRemaining !== null) {
    return `${standingRemaining} standing ${pluralizeTicket(standingRemaining)} available.`
  }

  if (totalRemaining !== null) {
    return `${totalRemaining} ${pluralizeTicket(totalRemaining)} currently available.`
  }

  return null
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
  foodPrompt = 'Food is available before most hosted events. Book early if your group wants to eat first.'
}: ManagementEventBookingFormProps) {
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [communicationConsent, setCommunicationConsent] = useState<CommunicationConsentState>(
    DEFAULT_COMMUNICATION_CONSENT_STATE
  )
  const [seats, setSeats] = useState(2)
  const [seatsDisplay, setSeatsDisplay] = useState('2')
  const [foodIntent, setFoodIntent] = useState<FoodIntent>('planning_to_eat')
  const [seatingPreference, setSeatingPreference] = useState<EventSeatingPreference>('seated')
  const [submittedSeatingPreference, setSubmittedSeatingPreference] = useState<EventSeatingPreference | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EventBookingResult | null>(null)
  const [paymentConversionPayload, setPaymentConversionPayload] = useState<EventPaymentConversionPayload | null>(null)
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [waitlistResult, setWaitlistResult] = useState<WaitlistResult | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileFieldRef>(null)
  const [honeypot, setHoneypot] = useState('')
  const formLoadedAt = useRef(Date.now())
  const phoneEnteredTracked = useRef(false)
  const formViewedTracked = useRef(false)
  const paymentCompleteTracked = useRef(false)

  const selectedFoodIntent = FOOD_INTENT_OPTIONS.find((option) => option.value === foodIntent) || FOOD_INTENT_OPTIONS[0]
  const bookingReassurance = getEventBookingReassurance(event)
  const isCommunalEvent = isCommunalBookingMode(event.booking_mode)
  const seatedRemaining = normalizeRemaining(event.seated_remaining)
  const standingRemaining = normalizeRemaining(event.standing_remaining)
  const totalRemaining = normalizeRemaining(event.total_remaining) ?? normalizeRemaining(event.seats_remaining)
  const seatsRemaining = normalizeRemaining(event.seats_remaining)
  const seatedDisabled = isCommunalEvent && seatedRemaining !== null && seatedRemaining <= 0
  const standingDisabled = isCommunalEvent && (standingRemaining === null || standingRemaining <= 0)
  const availabilityText = isCommunalEvent
    ? getCommunalAvailabilityText(seatedRemaining, standingRemaining, totalRemaining)
    : seatsRemaining && seatsRemaining > 0
    ? `${seatsRemaining} seats currently available.`
    : null
  const submittedTicketLabel = getBookingTicketLabel(result, submittedSeatingPreference)
  const fellBackToStanding = isCommunalEvent &&
    submittedSeatingPreference === 'seated' &&
    result?.event_seating_type === 'standing'
  const waitlistPlaceLabel = isCommunalEvent ? 'places' : 'seats'
  const compactFoodPrompt = getCompactFoodPrompt(foodPrompt)

  useEffect(() => {
    if (!isCommunalEvent) {
      setSeatingPreference('seated')
      return
    }

    if (seatingPreference === 'seated' && seatedDisabled && !standingDisabled) {
      setSeatingPreference('standing')
    }

    if (seatingPreference === 'standing' && standingDisabled && !seatedDisabled) {
      setSeatingPreference('seated')
    }
  }, [isCommunalEvent, seatedDisabled, seatingPreference, standingDisabled])

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

  function buildFoodNotes(): string {
    return `Event dining intent: ${selectedFoodIntent.label}`
  }

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault()
    setError(null)
    setResult(null)
    setPaymentConversionPayload(null)
    paymentCompleteTracked.current = false
    setSubmittedSeatingPreference(null)
    setWaitlistResult(null)

    // Sync seatsDisplay → seats in case blur hasn't fired
    const parsedSeats = Number.parseInt(seatsDisplay, 10)
    const clampedSeats = (!Number.isFinite(parsedSeats) || parsedSeats < 1) ? 1 : Math.min(parsedSeats, 20)
    setSeats(clampedSeats)
    setSeatsDisplay(String(clampedSeats))

    setLoading(true)

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

    if (resolvedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resolvedEmail)) {
      setLoading(false)
      setError('Please enter a valid email address, or leave it blank.')
      return
    }

    trackEventBookingStart({
      eventId: event.id,
      eventName: event.name,
      eventDate: event.startDate,
      partySize: clampedSeats,
      foodIntent,
      source: 'event_booking_form'
    })
    trackEventBookingFunnelStep({
      step: 'submit',
      eventId: event.id,
      eventName: event.name,
      eventDate: event.startDate,
      partySize: clampedSeats,
      foodIntent,
      source: 'event_booking_form'
    })

    const notes = buildFoodNotes()
    const attribution = collectBookingAttribution()
    const totalValue = calculateBookingValue(event, clampedSeats)
    const bookingSeatingPreference = isCommunalEvent ? seatingPreference : null
    setSubmittedSeatingPreference(bookingSeatingPreference)

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
          ...(bookingSeatingPreference ? { seating_preference: bookingSeatingPreference } : {}),
          notes,
          food_intent: foodIntent,
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
          foodIntent,
          attribution,
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
          foodIntent,
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
          foodIntent,
          bookingId: bookingData.booking_id
        })
      }

      if (bookingData.state === 'blocked') {
        setPaymentConversionPayload(null)
        trackEventBookingFunnelStep({
          step: 'blocked',
          eventId: event.id,
          eventName: event.name,
          eventDate: event.startDate,
          partySize: clampedSeats,
          foodIntent,
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
        foodIntent,
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
          notes: buildFoodNotes(),
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
          {availabilityText ? (
            <p className="text-xs text-ink-muted">{availabilityText}</p>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className={compact ? 'space-y-3' : 'space-y-4'}>
          <Input
            label="Seats"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            value={seatsDisplay}
            onChange={(event) => {
              const raw = event.target.value
              if (raw !== '' && !/^\d+$/.test(raw)) return
              setSeatsDisplay(raw)
              if (raw === '') return
              const parsed = Number.parseInt(raw, 10)
              if (Number.isNaN(parsed)) return
              setSeats(Math.min(Math.max(parsed, 1), 20))
            }}
            onBlur={() => {
              const parsed = Number.parseInt(seatsDisplay, 10)
              const clamped = (!Number.isFinite(parsed) || parsed < 1) ? 1 : Math.min(parsed, 20)
              setSeats(clamped)
              setSeatsDisplay(String(clamped))
            }}
          />

          {isCommunalEvent ? (
            <fieldset className="space-y-2 rounded-sm border border-line bg-surface-sunk p-2.5">
              <legend className="px-1 text-sm font-semibold text-ink">Ticket type</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="flex cursor-pointer gap-2 rounded-sm border border-line bg-surface p-2.5 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-55">
                  <input
                    type="radio"
                    name="seating_preference"
                    value="seated"
                    checked={seatingPreference === 'seated'}
                    disabled={seatedDisabled}
                    onChange={() => setSeatingPreference('seated')}
                    className="mt-1 h-4 w-4 flex-shrink-0 accent-anchor-gold-dark"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ink">Seated</span>
                    <span className="block text-xs leading-relaxed text-ink-muted">
                      {seatedDisabled ? 'Seated places are full.' : 'Communal table seating.'}
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer gap-2 rounded-sm border border-line bg-surface p-2.5 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-55">
                  <input
                    type="radio"
                    name="seating_preference"
                    value="standing"
                    checked={seatingPreference === 'standing'}
                    disabled={standingDisabled}
                    onChange={() => setSeatingPreference('standing')}
                    className="mt-1 h-4 w-4 flex-shrink-0 accent-anchor-gold-dark"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ink">Standing</span>
                    <span className="block text-xs leading-relaxed text-ink-muted">
                      {standingDisabled ? 'Standing tickets are not available.' : 'Same event price. No table seat included.'}
                    </span>
                  </span>
                </label>
              </div>
            </fieldset>
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
            label="Email address (optional)"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="jane@example.com"
            autoComplete="email"
            helperText="For payment follow-up if needed."
          />

          <CommunicationConsentFields
            value={communicationConsent}
            onChange={setCommunicationConsent}
          />

          <label className="flex cursor-pointer gap-2.5 rounded-sm border border-line bg-surface-sunk p-2.5">
            <input
              type="checkbox"
              name="food_intent"
              checked={foodIntent === 'planning_to_eat'}
              onChange={(event) => setFoodIntent(event.target.checked ? 'planning_to_eat' : 'event_only')}
              className="mt-1 h-4 w-4 flex-shrink-0 accent-anchor-gold-dark"
            />
            <span>
              <span className="block text-sm font-semibold text-ink">Planning to eat before the event</span>
              <span className="block text-xs leading-relaxed text-ink-muted">{compactFoodPrompt}</span>
            </span>
          </label>

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
            disabled={TURNSTILE_SITE_KEY ? !turnstileToken : false}
            onClick={() => {
              trackEventBookingFunnelStep({
                step: 'cta_click',
                eventId: event.id,
                eventName: event.name,
                eventDate: event.startDate,
                partySize: seats,
                foodIntent,
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
            {fellBackToStanding ? (
              <p className="mt-2">Seated places are full, so we have booked standing tickets for your group.</p>
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
            {fellBackToStanding ? (
              <p className="mt-2">Seated places are full, so we have held standing tickets for your group.</p>
            ) : null}
            {result.booking_id && paymentConversionPayload ? (
              <PayPalEventPaymentSection
                bookingId={result.booking_id}
                bookingSummary={`${event.name} · ${paymentConversionPayload.tickets} ${paymentConversionPayload.tickets === 1 ? 'ticket' : 'tickets'}`}
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
