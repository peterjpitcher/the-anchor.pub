'use client'

import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Alert } from '@/components/ui/feedback/Alert'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { Button } from '@/components/ui/primitives/Button'
import { Input } from '@/components/ui/primitives/Input'
import { TurnstileField, type TurnstileFieldRef } from '@/components/security/TurnstileField'
import { trackEventBookingComplete, trackEventBookingFunnelStep, trackEventBookingStart } from '@/lib/gtm-events'
import type { Event } from '@/lib/api'
import { formatEventLocalDate, formatEventLocalTime } from '@/lib/event-calendar'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

type EventBookingState = 'confirmed' | 'pending_payment' | 'full_with_waitlist_option' | 'blocked'
type FoodIntent = 'planning_to_eat' | 'event_only'

type EventBookingResult = {
  state: EventBookingState
  booking_id: string | null
  reason: string | null
  seats_remaining: number | null
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
    Partial<Pick<Event, 'time' | 'slug' | 'category' | 'price' | 'price_per_seat' | 'offers' | 'payment_mode' | 'is_free' | 'seats_remaining'>>
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

function getEventUnitPrice(event: ManagementEventBookingFormProps['event']): number | null {
  const candidates = [event.price_per_seat, event.price, event.offers?.price]
  for (const value of candidates) {
    const parsed = typeof value === 'string' ? Number(value) : value
    if (typeof parsed === 'number' && Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
  }
  return null
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2
  }).format(value)
}

function getBookingReassurance(event: ManagementEventBookingFormProps['event']): string {
  const unitPrice = getEventUnitPrice(event)
  if (event.payment_mode === 'prepaid') {
    return 'Reserve seats online. If payment is needed today, the next step will explain it clearly.'
  }
  if (event.payment_mode === 'cash_only' || (!event.payment_mode && unitPrice)) {
    const priceText = unitPrice ? ` ${formatMoney(unitPrice)} per person` : ''
    return `No payment now. Reserve seats online and pay${priceText} on arrival.`
  }
  if (event.is_free) {
    return 'No payment needed. Reserve seats online so your table is held.'
  }
  return 'Reserve seats online now. If any payment is needed, the next step will explain it clearly.'
}

function collectBookingAttribution() {
  if (typeof window === 'undefined') return {}
  const url = new URL(window.location.href)
  const read = (key: string) => url.searchParams.get(key) || undefined
  return {
    source_url: url.toString(),
    landing_path: url.pathname,
    utm_source: read('utm_source'),
    utm_medium: read('utm_medium'),
    utm_campaign: read('utm_campaign'),
    utm_content: read('utm_content'),
    utm_term: read('utm_term'),
    fbclid: read('fbclid'),
    short_code: read('short_code')
  }
}

export function ManagementEventBookingForm({
  event,
  title,
  compact = false,
  foodPrompt = 'Food is available before most hosted events. Book early if your group wants to eat first.'
}: ManagementEventBookingFormProps) {
  const [phone, setPhone] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [seats, setSeats] = useState(2)
  const [seatsDisplay, setSeatsDisplay] = useState('2')
  const [foodIntent, setFoodIntent] = useState<FoodIntent>('planning_to_eat')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EventBookingResult | null>(null)
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [waitlistResult, setWaitlistResult] = useState<WaitlistResult | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileFieldRef>(null)
  const [honeypot, setHoneypot] = useState('')
  const formLoadedAt = useRef(Date.now())
  const phoneEnteredTracked = useRef(false)
  const formViewedTracked = useRef(false)

  const eventDate = formatEventLocalDate(event.startDate, {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
  const eventTime = formatEventLocalTime(event.startDate)
  const selectedFoodIntent = FOOD_INTENT_OPTIONS.find((option) => option.value === foodIntent) || FOOD_INTENT_OPTIONS[0]
  const bookingReassurance = getBookingReassurance(event)
  const seatsRemaining = typeof event.seats_remaining === 'number' && event.seats_remaining > 0
    ? event.seats_remaining
    : null

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
    setWaitlistResult(null)

    // Sync seatsDisplay → seats in case blur hasn't fired
    const parsedSeats = Number.parseInt(seatsDisplay, 10)
    const clampedSeats = (!Number.isFinite(parsedSeats) || parsedSeats < 1) ? 1 : Math.min(parsedSeats, 20)
    setSeats(clampedSeats)
    setSeatsDisplay(String(clampedSeats))

    setLoading(true)

    if (!phone.trim()) {
      setLoading(false)
      setError('Please enter your mobile number.')
      return
    }

    const resolvedFirstName = firstName.trim()
    const resolvedLastName = lastName.trim()

    if (!resolvedFirstName || !resolvedLastName) {
      setLoading(false)
      setError('Please enter your first name and last name.')
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

    try {
      const response = await fetch('/api/event-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event_id: event.id,
          phone: phone.trim(),
          default_country_code: '44',
          ...(resolvedFirstName ? { first_name: resolvedFirstName } : {}),
          ...(resolvedLastName ? { last_name: resolvedLastName } : {}),
          seats: clampedSeats,
          notes,
          food_intent: foodIntent,
          event_slug: event.slug,
          event_name: event.name,
          event_date: event.startDate,
          event_category_name: event.category?.name,
          event_category_slug: event.category?.slug,
          event_price: getEventUnitPrice(event),
          event_value: totalValue,
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

      if (bookingData.state === 'confirmed') {
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
          ...(firstName.trim() ? { first_name: firstName.trim() } : {}),
          ...(lastName.trim() ? { last_name: lastName.trim() } : {}),
          requested_seats: seats,
          notes: buildFoodNotes(),
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
    <Card variant="elevated" padding={compact ? 'none' : undefined}>
      <CardBody className={compact ? 'space-y-4 p-4' : 'space-y-6'}>
        {title ? (
          <h2 className={compact ? 'text-xl font-bold text-anchor-gold-vivid' : 'text-2xl font-bold text-anchor-gold-vivid'}>
            {title}
          </h2>
        ) : null}

        <form onSubmit={handleSubmit} className={compact ? 'space-y-3' : 'space-y-4'}>
          <div className={compact ? 'space-y-3 border border-anchor-gold/15 bg-anchor-bg-raised p-3' : 'space-y-4 border border-anchor-gold/15 bg-anchor-bg-raised p-4'}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-anchor-gold-vivid">Selected event</p>
              <p className="mt-1 text-sm font-semibold text-anchor-cream-text">{event.name}</p>
              <p className="text-sm text-anchor-cream-text/70">{eventDate} at {eventTime}</p>
              <p className="mt-2 text-sm font-medium text-anchor-gold-vivid">{bookingReassurance}</p>
              {seatsRemaining ? (
                <p className="mt-1 text-xs text-anchor-cream-text/60">{seatsRemaining} seats currently available.</p>
              ) : null}
            </div>

            <Input
              label="Number of Seats"
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
              helperText="Choose your party size before entering contact details."
            />

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-anchor-cream-text">Want to eat before the event?</legend>
              <p className="text-sm text-anchor-cream-text/70">{foodPrompt}</p>
              <div className="grid gap-2">
                {FOOD_INTENT_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer gap-3 border p-3 transition-colors ${
                      foodIntent === option.value
                        ? 'border-anchor-gold bg-anchor-gold/10'
                        : 'border-anchor-gold/15 bg-anchor-bg-card hover:border-anchor-gold/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="food_intent"
                      value={option.value}
                      checked={foodIntent === option.value}
                      onChange={() => setFoodIntent(option.value)}
                      className="mt-1 h-4 w-4 accent-anchor-gold"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-anchor-cream-text">{option.label}</span>
                      <span className="block text-xs text-anchor-cream-text/60">{option.description}</span>
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-anchor-cream-text/60">
                This is not a food pre-order. Please order with the bar team on arrival.
              </p>
            </fieldset>
          </div>

          <div className={compact ? 'border border-anchor-gold/15 bg-anchor-bg-raised p-3' : 'border border-anchor-gold/15 bg-anchor-bg-raised p-4'}>
            <Input
              label="Mobile Number"
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
              helperText="We use this to text your booking confirmation."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="First Name"
              type="text"
              required
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="John"
            />
            <Input
              label="Last Name"
              type="text"
              required
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Smith"
            />
          </div>

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
            Book Event
          </Button>
        </form>

        {error && (
          <Alert variant="error" title="Booking not completed">
            <p>{error}</p>
            <p className="mt-2">
              Call <a href="tel:+441753682707" className="font-semibold underline">01753 682707</a> if you need help.
            </p>
          </Alert>
        )}

        {result?.state === 'confirmed' && (
          <Alert variant="success" title="Event booking confirmed">
            <p>Your seats are confirmed for {event.name}.</p>
            {result.manage_booking_url ? (
              <div className="mt-3">
                <Button asChild size="sm" variant="secondary">
                  <a href={result.manage_booking_url} target="_blank" rel="noopener noreferrer">
                    Manage Booking
                  </a>
                </Button>
              </div>
            ) : null}
          </Alert>
        )}

        {result?.state === 'pending_payment' && (
          <Alert variant="warning" title="Payment needed to secure your seats">
            <p>Your seats are currently on hold.</p>
            {result.next_step_url ? (
              <div className="mt-3">
                <Button asChild size="sm" variant="primary">
                  <a href={result.next_step_url} target="_blank" rel="noopener noreferrer">
                    Complete Payment
                  </a>
                </Button>
              </div>
            ) : null}
            {result.manage_booking_url ? (
              <div className="mt-3">
                <Button asChild size="sm" variant="secondary">
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
            <p>You can join the waitlist and we will contact you if seats become available.</p>
            <div className="mt-3">
              <Button type="button" size="sm" loading={waitlistLoading} onClick={handleJoinWaitlist}>
                Join Waitlist
              </Button>
            </div>
            {waitlistResult?.state === 'queued' && (
              <p className="mt-3 font-semibold text-green-400">You’re on the waitlist. We’ll text you if seats open up.</p>
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
  const priceCandidates = [
    event.price,
    event.price_per_seat,
    event.offers?.price
  ]

  const price = priceCandidates
    .map((value) => {
      if (typeof value === 'number' && Number.isFinite(value)) return value
      if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : null
      }
      return null
    })
    .find((value): value is number => typeof value === 'number' && value > 0)

  return price ? price * tickets : 0
}
