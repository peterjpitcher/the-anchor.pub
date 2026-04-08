'use client'

import { type FormEvent, useRef, useState } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Alert } from '@/components/ui/feedback/Alert'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { Button } from '@/components/ui/primitives/Button'
import { Input } from '@/components/ui/primitives/Input'
import { trackEventBookingStart } from '@/lib/gtm-events'
import type { Event } from '@/lib/api'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

type LookupState = 'idle' | 'loading' | 'known' | 'unknown'
type EventBookingState = 'confirmed' | 'pending_payment' | 'full_with_waitlist_option' | 'blocked'

type CustomerLookupResult = {
  known: boolean
  lookup_degraded?: boolean
  normalized_phone?: string
  customer?: {
    id?: string
    first_name?: string | null
    last_name?: string | null
    full_name?: string | null
    email?: string | null
    mobile_e164?: string | null
    mobile_number?: string | null
  } | null
}

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
  event: Pick<Event, 'id' | 'name' | 'startDate' | 'time'>
  title?: string
  compact?: boolean
}

const BLOCKED_COPY: Record<string, string> = {
  blocked: 'This event is not bookable online right now.',
  not_eligible: 'This booking is currently blocked. Please contact the pub for help.',
  sold_out: 'This event is sold out.',
  payment_required: 'Payment is required to secure this booking.'
}

function getBlockedMessage(reason: string | null | undefined): string {
  if (!reason) return BLOCKED_COPY.blocked
  const key = reason.toLowerCase()
  return BLOCKED_COPY[key] || reason
}

function parseLookupResponse(payload: any): CustomerLookupResult {
  const data = payload?.data || payload
  return {
    known: Boolean(data?.known),
    lookup_degraded: Boolean(data?.lookup_degraded),
    normalized_phone: data?.normalized_phone,
    customer: data?.customer || null
  }
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

export function ManagementEventBookingForm({ event, title, compact = false }: ManagementEventBookingFormProps) {
  const [phone, setPhone] = useState('')
  const [lookupState, setLookupState] = useState<LookupState>('idle')
  const [knownCustomer, setKnownCustomer] = useState<CustomerLookupResult['customer']>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [lookupDegraded, setLookupDegraded] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [seats, setSeats] = useState(2)
  const [seatsDisplay, setSeatsDisplay] = useState('2')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EventBookingResult | null>(null)
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [waitlistResult, setWaitlistResult] = useState<WaitlistResult | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance | null>(null)
  const [honeypot, setHoneypot] = useState('')
  const formLoadedAt = useRef(Date.now())

  const detailsUnlocked = lookupState === 'known' || lookupState === 'unknown'
  const isKnownCustomer = lookupState === 'known'

  async function handlePhoneLookup() {
    setLookupError(null)
    setError(null)
    setResult(null)
    setLookupDegraded(false)

    if (!phone.trim()) {
      setLookupError('Please enter a mobile number first.')
      return
    }

    setLookupState('loading')

    try {
      const params = new URLSearchParams({ phone: phone.trim(), default_country_code: '44' })
      const response = await fetch(`/api/customers/lookup?${params.toString()}`, { cache: 'no-store' })
      const payload = await response.json()

      if (!response.ok || payload?.success === false) {
        const message =
          payload?.error?.message || payload?.error || 'Unable to verify this number right now. Please try again.'
        throw new Error(message)
      }

      const lookup = parseLookupResponse(payload)
      if (lookup.known) {
        setLookupState('known')
        setKnownCustomer(lookup.customer || null)
        setLookupDegraded(false)
        if (lookup.customer?.first_name) {
          setFirstName(String(lookup.customer.first_name))
        }
        if (lookup.customer?.last_name) {
          setLastName(String(lookup.customer.last_name))
        }
      } else {
        setLookupState('unknown')
        setKnownCustomer(null)
        setLookupDegraded(Boolean(lookup.lookup_degraded))
      }
    } catch (lookupFailure: any) {
      setLookupState('idle')
      setLookupError(lookupFailure?.message || 'Unable to verify this number right now.')
      setLookupDegraded(false)
    }
  }

  function resetPhoneLookup() {
    setLookupState('idle')
    setKnownCustomer(null)
    setLookupError(null)
    setLookupDegraded(false)
    setFirstName('')
    setLastName('')
    setError(null)
    setResult(null)
    setWaitlistResult(null)
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

    if (!detailsUnlocked) {
      setLoading(false)
      setError('Please verify your mobile number first.')
      return
    }

    const resolvedFirstName = firstName.trim()
    const resolvedLastName = lastName.trim()

    if (!isKnownCustomer && (!resolvedFirstName || !resolvedLastName)) {
      setLoading(false)
      setError('Please enter your first name and last name.')
      return
    }

    trackEventBookingStart({
      eventId: event.id,
      eventName: event.name
    })

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
          ...(knownCustomer?.email ? { email: knownCustomer.email } : {}),
          seats: clampedSeats,
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

      if (bookingData.state === 'blocked') {
        setError(getBlockedMessage(bookingData.reason))
      }
    } catch (submitError: any) {
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
          ...(knownCustomer?.email ? { email: knownCustomer.email } : {}),
          requested_seats: seats,
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
          <div className={compact ? 'border border-anchor-gold/15 bg-anchor-bg-raised p-3' : 'border border-anchor-gold/15 bg-anchor-bg-raised p-4'}>
            <Input
              label="Mobile Number"
              type="tel"
              required
              value={phone}
              disabled={detailsUnlocked}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="07xxx xxxxxx"
              helperText="Enter your number first so we can check if you’re already in our system."
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {!detailsUnlocked ? (
                <Button type="button" size="sm" loading={lookupState === 'loading'} onClick={handlePhoneLookup}>
                  Continue
                </Button>
              ) : (
                <Button type="button" size="sm" variant="outline" onClick={resetPhoneLookup}>
                  Use Different Number
                </Button>
              )}
            </div>

            {lookupError && <p className="mt-3 text-sm text-red-400">{lookupError}</p>}
            {isKnownCustomer && (
              <p className="mt-3 text-sm font-medium text-green-400">
                Recognized customer{knownCustomer?.full_name ? `: ${knownCustomer.full_name}` : ''}. You can continue with booking details.
              </p>
            )}
            {lookupState === 'unknown' && (
              <p className="mt-3 text-sm font-medium text-amber-400">
                {lookupDegraded
                  ? 'We could not verify this number right now. Please continue by entering your details below.'
                  : 'New customer detected. Please enter your personal details below.'}
              </p>
            )}
          </div>

          {detailsUnlocked && !isKnownCustomer && (
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
          )}

          {detailsUnlocked && (
            <>
              {/* Honeypot — hidden from real users, filled by bots */}
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

              <Input
                label="Number of Seats"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                value={seatsDisplay}
                onChange={(event) => {
                  const raw = event.target.value
                  // Allow empty (user is clearing to retype) and digits only
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

              {TURNSTILE_SITE_KEY && (
                <Turnstile
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={setTurnstileToken}
                  onError={() => setTurnstileToken(null)}
                  onExpire={() => setTurnstileToken(null)}
                  options={{ theme: 'dark', size: 'flexible' }}
                />
              )}

              <Button type="submit" fullWidth size="lg" loading={loading} disabled={TURNSTILE_SITE_KEY ? !turnstileToken : false}>
                Book Event
              </Button>
            </>
          )}
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
