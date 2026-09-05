'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { Button } from '@/components/ui/primitives/Button'
import { Input, Textarea } from '@/components/ui/primitives/Input'
import { Card } from '@/components/ui/layout/Card'
import { Icon } from '@/components/ui/Icon'
import type { ParkingRateCard, ParkingPricingBreakdownItem } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { PhoneLink } from '@/components/PhoneLink'
import { CONTACT } from '@/lib/constants'
import { CommunicationConsentFields } from '@/components/CommunicationConsentFields'
import {
  DEFAULT_COMMUNICATION_CONSENT_STATE,
  buildCommunicationConsentPayload,
  type CommunicationConsentState,
} from '@/lib/communication-consent'


interface AvailabilityResult {
  timestamp: string
  slots: number
  available: boolean
  raw: any
}

interface EstimateResult {
  amount: number
  breakdown: ParkingPricingBreakdownItem[]
}

const dateTimeLocal = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const msFromNow = (hours: number) => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + hours * 60)
  return now
}

const iso = (value: string) => new Date(value).toISOString()

const HOURS_IN_DAY = 24
const HOURS_IN_WEEK = 24 * 7
const HOURS_IN_MONTH = 24 * 30

async function parseJsonResponse<T = any>(
  response: Response,
  context: string,
  fallbackMessage: string
): Promise<T> {
  const rawText = await response.text()
  const trimmed = rawText.trim()

  if (!trimmed) {
    console.error(`[ParkingBookingWizard][${context}] Empty response body`, {
      status: response.status
    })
    throw new Error(fallbackMessage)
  }

  try {
    return JSON.parse(trimmed) as T
  } catch (error) {
    console.error(`[ParkingBookingWizard][${context}] Failed to parse JSON`, {
      status: response.status,
      error,
      sample: trimmed.slice(0, 200)
    })
    throw new Error(fallbackMessage)
  }
}

function calculateEstimate(
  rates: ParkingRateCard | null,
  startAt: string,
  endAt: string
): EstimateResult | null {
  if (!rates || !startAt || !endAt) return null
  const start = Date.parse(startAt)
  const end = Date.parse(endAt)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null

  const totalHours = (end - start) / (1000 * 60 * 60)
  if (totalHours <= 0) return null

  const combos: EstimateResult[] = []
  const hasMonthly = rates.monthly_rate > 0
  const hasWeekly = rates.weekly_rate > 0
  const hasDaily = rates.daily_rate > 0

  const maxMonths = hasMonthly ? Math.ceil(totalHours / HOURS_IN_MONTH) : 0
  const maxWeeks = hasWeekly ? Math.ceil(totalHours / HOURS_IN_WEEK) : 0
  const maxDays = hasDaily ? Math.ceil(totalHours / HOURS_IN_DAY) : 0

  for (let months = 0; months <= maxMonths; months++) {
    if (months > 0 && !hasMonthly) continue
    const afterMonths = Math.max(totalHours - months * HOURS_IN_MONTH, 0)

    for (let weeks = 0; weeks <= maxWeeks; weeks++) {
      if (weeks > 0 && !hasWeekly) continue
      const afterWeeks = Math.max(afterMonths - weeks * HOURS_IN_WEEK, 0)

      for (let days = 0; days <= maxDays; days++) {
        if (days > 0 && !hasDaily) continue
        const afterDays = Math.max(afterWeeks - days * HOURS_IN_DAY, 0)

        const requiredHours = Math.ceil(afterDays)
        if (requiredHours < 0) continue

        const breakdown: ParkingPricingBreakdownItem[] = []
        let amount = 0

        if (months > 0 && hasMonthly) {
          amount += months * rates.monthly_rate
          breakdown.push({ unit: 'month', quantity: months, rate: rates.monthly_rate, subtotal: months * rates.monthly_rate })
        }
        if (weeks > 0 && hasWeekly) {
          amount += weeks * rates.weekly_rate
          breakdown.push({ unit: 'week', quantity: weeks, rate: rates.weekly_rate, subtotal: weeks * rates.weekly_rate })
        }
        if (days > 0 && hasDaily) {
          amount += days * rates.daily_rate
          breakdown.push({ unit: 'day', quantity: days, rate: rates.daily_rate, subtotal: days * rates.daily_rate })
        }
        if (requiredHours > 0) {
          amount += requiredHours * rates.hourly_rate
          breakdown.push({ unit: 'hour', quantity: requiredHours, rate: rates.hourly_rate, subtotal: requiredHours * rates.hourly_rate })
        }

        combos.push({ amount, breakdown })
      }
    }
  }

  if (combos.length === 0) {
    const hours = Math.max(1, Math.ceil(totalHours))
    return {
      amount: hours * rates.hourly_rate,
      breakdown: [
        {
          unit: 'hour',
          quantity: hours,
          rate: rates.hourly_rate,
          subtotal: hours * rates.hourly_rate
        }
      ]
    }
  }

  return combos.reduce((best, current) => (current.amount < best.amount ? current : best))
}

interface BookingPayload {
  startAt: string
  endAt: string
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  vehicle: {
    registration: string
    make: string
    model: string
    colour: string
  }
  notes: string
  communicationConsent: CommunicationConsentState
}

const stepTitles = [
  'Choose your parking times',
  'Your contact details',
  'Vehicle information',
  'Review & secure your space'
]

interface ParkingBookingWizardProps {
  initialRates?: ParkingRateCard | null
}

export function ParkingBookingWizard({ initialRates = null }: ParkingBookingWizardProps) {
  const [start, setStart] = useState(() => dateTimeLocal(msFromNow(1)))
  const [end, setEnd] = useState(() => dateTimeLocal(msFromNow(4)))
  const [currentStep, setCurrentStep] = useState(1)
  const [rates, setRates] = useState<ParkingRateCard | null>(initialRates)
  const [ratesError, setRatesError] = useState<string | null>(null)
  const [isLoadingRates, setIsLoadingRates] = useState(!initialRates)

  const [availabilityState, setAvailabilityState] = useState<{
    status: 'idle' | 'checking' | 'available' | 'unavailable'
    message?: string
    remaining?: number
    raw?: AvailabilityResult
  }>({ status: 'idle' })

  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)

  const [customer, setCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })

  const [vehicle, setVehicle] = useState({
    registration: '',
    make: '',
    model: '',
    colour: ''
  })

  const [notes, setNotes] = useState('')
  const [communicationConsent, setCommunicationConsent] = useState<CommunicationConsentState>(DEFAULT_COMMUNICATION_CONSENT_STATE)

  const router = useRouter()
  const paypalContainerRef = useRef<HTMLDivElement>(null)
  const [paypalLoaded, setPaypalLoaded] = useState(false)
  const [paypalRendered, setPaypalRendered] = useState(false)
  const [paypalLoadError, setPaypalLoadError] = useState(false)
  const [captureState, setCaptureState] = useState<'idle' | 'capturing' | 'error' | 'cancelled'>('idle')
  // Stores the booking_id returned by createOrder so onApprove can pass it to capture
  const pendingBookingIdRef = useRef<string | null>(null)
  // Sync ref keeps createOrder callbacks from closing over stale state
  const bookingDataRef = useRef({ customer, vehicle, start, end, notes, communicationConsent })

  const estimate = useMemo(
    () => calculateEstimate(rates, start, end),
    [rates, start, end]
  )

  useEffect(() => {
    if (initialRates) return

    let ignore = false

    const loadRates = async () => {
      setIsLoadingRates(true)
      setRatesError(null)

      try {
        const response = await fetch('/api/parking/rates')
        const payload = await parseJsonResponse<{
          success?: boolean
          data?: ParkingRateCard
          error?: { message?: string }
        }>(
          response,
          'rates',
          'We could not load pricing right now. Please try again later or call 01753 682707.'
        )

        if (!response.ok || payload?.success === false) {
          throw new Error(payload?.error?.message || 'Unable to load rates')
        }
        if (!payload?.data) {
          throw new Error('We could not load pricing right now. Please try again later or call 01753 682707.')
        }
        if (!ignore) {
          setRates(payload.data)
        }
      } catch (error: any) {
        if (!ignore) {
          setRatesError(error?.message || 'We could not load pricing right now. Please try again later.')
        }
      } finally {
        if (!ignore) {
          setIsLoadingRates(false)
        }
      }
    }

    loadRates()

    return () => {
      ignore = true
    }
  }, [initialRates])

  const handleCheckAvailability = useCallback(async () => {
    setAvailabilityError(null)
    setAvailabilityState({ status: 'checking' })
    setIsCheckingAvailability(true)

    try {
      const startIso = iso(start)
      const endIso = iso(end)
      const params = new URLSearchParams({
        start: startIso,
        end: endIso,
        granularity: 'hour'
      })

      const response = await fetch(`/api/parking/availability?${params.toString()}`)
      const payload = await parseJsonResponse<{
        success?: boolean
        data?: any
        error?: { message?: string }
      }>(
        response,
        'availability',
        'Our live parking availability is offline at the moment. Please call 01753 682707 and we will secure your space.'
      )
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error?.message || 'We could not check availability. Please try again.')
      }

      const slices = Array.isArray(payload?.data) ? payload?.data : []
      if (slices.length === 0) {
        throw new Error('We could not retrieve live availability just now. Please call 01753 682707 and we will help you secure a space.')
      }
      const allAvailable = slices.every((slot: any) => slot.remaining > 0)
      const minRemaining = slices.reduce((acc: number, slot: any) => Math.min(acc, slot.remaining), Infinity)

      setAvailabilityState({
        status: allAvailable ? 'available' : 'unavailable',
        message: allAvailable
          ? `Great news! We have at least ${minRemaining === Infinity ? '1' : minRemaining} space(s) free for that window.`
          : 'We are full for part of that time window. Try a different time or give us a call.',
        remaining: minRemaining === Infinity ? undefined : minRemaining,
        raw: {
          timestamp: new Date().toISOString(),
          slots: slices.length,
          available: allAvailable,
          raw: slices
        }
      })
    } catch (error: any) {
      setAvailabilityError(error?.message || 'We could not check availability. Please try again.')
      setAvailabilityState({ status: 'idle' })
    } finally {
      setIsCheckingAvailability(false)
    }
  }, [start, end])

  // Keep bookingDataRef current so createOrder always reads the latest state values
  useEffect(() => {
    bookingDataRef.current = { customer, vehicle, start, end, notes, communicationConsent }
  }, [customer, vehicle, start, end, notes, communicationConsent])

  useEffect(() => {
    if (currentStep === 4 && paypalLoaded && !paypalRendered) {
      renderPayPalButtons()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, paypalLoaded, paypalRendered])

  const canProceedFromStep1 = availabilityState.status === 'available' && Boolean(rates) && !ratesError && !isLoadingRates
  const canProceedFromStep2 = customer.firstName && customer.lastName && customer.phone
  const canProceedFromStep3 = vehicle.registration.length >= 5

  const goToStep = (step: number) => {
    if (step < 1 || step > 4) return
    setCurrentStep(step)
  }

  function renderPayPalButtons() {
    if (!window.paypal || !paypalContainerRef.current || paypalRendered) return

    // Clear any previously rendered PayPal iframe before re-rendering
    paypalContainerRef.current.innerHTML = ''
    setPaypalRendered(true)

    try {
    type LegacyPayPalSDK = { Buttons: (config: Record<string, unknown>) => { render: (el: HTMLElement) => void } }
    const paypalSDK = (window as unknown as { paypal?: LegacyPayPalSDK }).paypal
    if (!paypalSDK) return
    paypalSDK.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 48 },

      createOrder: async () => {
        setCaptureState('idle')
        const res = await fetch('/api/parking/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: {
              first_name: bookingDataRef.current.customer.firstName,
              last_name: bookingDataRef.current.customer.lastName,
              email: bookingDataRef.current.customer.email || undefined,
              mobile_number: bookingDataRef.current.customer.phone,
            },
            vehicle: {
              registration: bookingDataRef.current.vehicle.registration.replace(/\s+/g, '').toUpperCase(),
              make: bookingDataRef.current.vehicle.make || undefined,
              model: bookingDataRef.current.vehicle.model || undefined,
              colour: bookingDataRef.current.vehicle.colour || undefined,
            },
            start_at: iso(bookingDataRef.current.start),
            end_at: iso(bookingDataRef.current.end),
            notes: bookingDataRef.current.notes || undefined,
            communication_consent: buildCommunicationConsentPayload(bookingDataRef.current.communicationConsent),
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          // Throwing here causes PayPal SDK to show its own error screen, intentional.
          throw new Error(err?.error || 'Could not create order')
        }

        const data = await res.json()
        pendingBookingIdRef.current = data.booking_id
        return data.paypal_order_id
      },

      onApprove: async (data: { orderID: string }) => {
        setCaptureState('capturing')
        const res = await fetch('/api/parking/payment/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderID: data.orderID,
            bookingId: pendingBookingIdRef.current,
          }),
        })

        if (!res.ok) {
          setCaptureState('error')
          return
        }

        const result = await res.json()
        if (!result.booking_id) {
          setCaptureState('error')
          return
        }
        router.push(`/heathrow-parking/confirmation/${result.booking_id}`)
      },

      onCancel: () => {
        setCaptureState('cancelled')
        // Reset so buttons can be re-rendered on retry
        setPaypalRendered(false)
        pendingBookingIdRef.current = null
      },

      onError: () => {
        setCaptureState('error')
        setPaypalRendered(false)
        pendingBookingIdRef.current = null
      },
    } as Record<string, unknown>).render(paypalContainerRef.current!)
    } catch {
      setPaypalLoadError(true)
      setPaypalRendered(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Input
              type="datetime-local"
              label="Parking start (arrival)"
              value={start}
              min={dateTimeLocal(msFromNow(0))}
              onChange={event => {
                  const value = event.target.value
                  setStart(value)
                  setAvailabilityState({ status: 'idle' })

                  const selectedStart = Date.parse(value)
                  const currentEnd = Date.parse(end)
                  if (Number.isFinite(selectedStart) && Number.isFinite(currentEnd) && selectedStart >= currentEnd) {
                    const adjustedEnd = new Date(selectedStart)
                    adjustedEnd.setHours(adjustedEnd.getHours() + 2)
                    setEnd(dateTimeLocal(adjustedEnd))
                  }
              }}
            />
            <Input
              type="datetime-local"
              label="Parking end (departure)"
                value={end}
                min={start}
                onChange={event => {
                  setEnd(event.target.value)
                  setAvailabilityState({ status: 'idle' })
                }}
              />
            </div>

            <div className="rounded-md border border-line bg-surface-sunk p-4 text-sm text-ink">
              <p className="font-semibold text-accent-text">Best rates for longer stays</p>
              {isLoadingRates && <p className="mt-1 text-ink-muted">Loading the latest rate card…</p>}
              {ratesError && <p className="mt-1 text-anchor-danger">{ratesError}</p>}
	              {rates && !ratesError && (
	                <ul className="mt-2 space-y-1 text-ink-muted">
	                  <li>• Hourly: {formatPrice(rates.hourly_rate, 'GBP')}</li>
	                  <li>• Daily: {formatPrice(rates.daily_rate, 'GBP')}</li>
	                  <li>• Weekly: {formatPrice(rates.weekly_rate, 'GBP')}</li>
	                  <li>• Monthly: {formatPrice(rates.monthly_rate, 'GBP')}</li>
	                </ul>
	              )}
	              {estimate && (
	                <p className="mt-2 text-sm text-ink">
	                  Estimated cost for this stay: <strong>{formatPrice(estimate.amount, 'GBP')}</strong> (final price confirmed at checkout)
	                </p>
	              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              {availabilityState.status === 'available' && (
                <div className="flex items-center text-sm text-anchor-success">
                  <Icon name="check" className="mr-2 h-4 w-4" />
                  {availabilityState.message || 'Spaces available'}
                </div>
              )}
              {availabilityState.status === 'unavailable' && (
                <div className="flex items-center text-sm text-anchor-danger">
                  <Icon name="alert" className="mr-2 h-4 w-4" />
                  {availabilityState.message || 'No spaces available for that window'}
                </div>
              )}
              {availabilityError && (
                <div className="text-sm text-anchor-danger">{availabilityError}</div>
              )}
              <div className="sm:ml-auto">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCheckAvailability}
                  disabled={isCheckingAvailability}
                >
                  {isCheckingAvailability ? 'Checking…' : 'Check availability'}
                </Button>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Input
                label="First name"
                value={customer.firstName}
                onChange={event => setCustomer(prev => ({ ...prev, firstName: event.target.value }))}
              />
              <Input
                label="Last name"
                value={customer.lastName}
                onChange={event => setCustomer(prev => ({ ...prev, lastName: event.target.value }))}
              />
              <Input
                type="email"
                label="Email address"
                placeholder="you@example.com"
                value={customer.email}
                onChange={event => setCustomer(prev => ({ ...prev, email: event.target.value }))}
              />
              <Input
                label="Mobile number"
                placeholder="+44 7700 900123"
                value={customer.phone}
                onChange={event => setCustomer(prev => ({ ...prev, phone: event.target.value }))}
              />
            </div>
            <p className="text-sm text-ink-muted">
              We use your mobile number to send booking confirmation and updates. Your details are never shared.
            </p>
            <CommunicationConsentFields
              value={communicationConsent}
              onChange={setCommunicationConsent}
            />
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Input
                label="Vehicle registration"
                placeholder="AB12 CDE"
                value={vehicle.registration}
                onChange={event => setVehicle(prev => ({ ...prev, registration: event.target.value }))}
              />
              <Input
                label="Vehicle make"
                placeholder="Tesla"
                value={vehicle.make}
                onChange={event => setVehicle(prev => ({ ...prev, make: event.target.value }))}
              />
              <Input
                label="Vehicle model"
                placeholder="Model 3"
                value={vehicle.model}
                onChange={event => setVehicle(prev => ({ ...prev, model: event.target.value }))}
              />
              <Input
                label="Vehicle colour"
                placeholder="Red"
                value={vehicle.colour}
                onChange={event => setVehicle(prev => ({ ...prev, colour: event.target.value }))}
              />
            </div>

            <Textarea
              label="Notes for our team (optional)"
              placeholder="e.g. Leaving keys with reception, prefer a well-lit spot, etc."
              value={notes}
              onChange={event => setNotes(event.target.value)}
            />
          </div>
        )
      case 4:
        return (
          <>
            {/* PayPal JS SDK, loaded lazily when customer reaches step 4 */}
            {process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && (
              <Script
                src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=GBP&intent=capture`}
                strategy="afterInteractive"
                onLoad={() => setPaypalLoaded(true)}
                onError={() => setPaypalLoadError(true)}
              />
            )}

            <div className="space-y-6">
              {/* Booking summary */}
              <div className="rounded-md border border-line bg-surface-sunk p-5 space-y-3 text-sm">
                <h3 className="font-semibold text-ink-strong text-base">Booking summary</h3>
                <div className="grid min-w-0 grid-cols-1 gap-y-1 text-ink sm:grid-cols-2 sm:gap-y-2">
                  <span className="text-ink-muted">Arrival</span>
                  <span className="break-words font-medium">{new Date(start).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  <span className="text-ink-muted">Departure</span>
                  <span className="break-words font-medium">{new Date(end).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  <span className="text-ink-muted">Name</span>
                  <span className="break-words font-medium">{customer.firstName} {customer.lastName}</span>
                  <span className="text-ink-muted">Mobile</span>
                  <span className="break-words font-medium">{customer.phone}</span>
                  <span className="text-ink-muted">Vehicle</span>
                  <span className="break-words font-medium">{vehicle.registration.toUpperCase()}{vehicle.make ? ` · ${vehicle.make}` : ''}</span>
                </div>

                {/* Pricing */}
                {estimate && (
                  <div className="border-t border-line pt-3 space-y-1">
                    {estimate.breakdown.map((item, i) => (
                      <div key={i} className="flex justify-between text-ink-muted text-xs">
                        <span>{item.quantity} {item.unit}{item.quantity !== 1 ? 's' : ''} @ £{item.rate}</span>
                        <span>£{item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-ink-strong pt-1">
                      <span>Total</span>
                      <span className="text-accent-text">{formatPrice(estimate.amount, 'GBP')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* State messages */}
              {captureState === 'cancelled' && (
                <p className="text-sm text-accent-text bg-surface-sunk rounded-md px-4 py-3">
                  Payment cancelled, you can try again below.
                </p>
              )}
              {captureState === 'error' && (
                <p className="text-sm text-anchor-danger bg-surface-sunk rounded-md px-4 py-3">
                  Payment could not be completed. Please try again or call us on <PhoneLink phone={CONTACT.phone} source="parking_wizard_error" showIcon={false} className="font-semibold underline">01753 682707</PhoneLink>.
                </p>
              )}
              {captureState === 'capturing' && (
                <p className="text-sm text-ink bg-surface-sunk rounded-md px-4 py-3">
                  Confirming your booking…
                </p>
              )}

              {/* PayPal button container */}
              {/* Error state, shown if SDK fails to load or client ID is missing */}
              {(paypalLoadError || !process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) && (
                <p className="text-sm text-anchor-danger bg-surface-sunk rounded-md px-4 py-3">
                  Payment could not be loaded. Please call us on <PhoneLink phone={CONTACT.phone} source="parking_wizard_paypal_error" showIcon={false} className="font-semibold underline">01753 682707</PhoneLink> to complete your booking.
                </p>
              )}
              {/* Skeleton shown while SDK loads, sibling to the container, not inside it */}
              {!paypalLoaded && !paypalLoadError && process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && captureState !== 'capturing' && (
                <div className="h-12 rounded-md bg-surface-sunk animate-pulse" />
              )}
              {/* Container stays mounted so the SDK iframe is never destroyed */}
              <div
                ref={paypalContainerRef}
                id="paypal-button-container"
                className={`min-h-[50px] max-w-sm mx-auto ${captureState === 'capturing' ? 'hidden' : ''}`}
              />

              <p className="text-xs text-ink-muted text-center">
                Vehicles parked at owner&apos;s risk. By paying you agree to our{' '}
                <a href="/heathrow-parking#parking-terms" className="underline hover:text-ink">
                  parking terms
                </a>.
              </p>

              {/* Back button */}
              <button
                type="button"
                onClick={() => { setCurrentStep(3); setPaypalRendered(false); setCaptureState('idle') }}
                className="w-full text-sm text-ink-muted hover:text-ink underline"
              >
                ← Back to vehicle details
              </button>
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <Card accent className="p-6 shadow-md">
      {/* Step indicator: numbered circles joined by hairline bars (spec §9) */}
      <ol className="flex items-center gap-2" aria-label={`Step ${currentStep} of 4`}>
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1
          const isDone = stepNumber < currentStep
          const isActive = stepNumber === currentStep
          return (
            <li key={title} className="flex flex-1 items-center gap-2 last:flex-none">
              <span
                aria-current={isActive ? 'step' : undefined}
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isDone
                    ? 'bg-anchor-green text-white'
                    : isActive
                      ? 'bg-anchor-gold text-white'
                      : 'bg-surface-sunk text-ink-muted'
                }`}
              >
                {isDone ? <Icon name="check" className="h-4 w-4" /> : stepNumber}
              </span>
              {stepNumber < stepTitles.length && (
                <span className="h-px flex-1 bg-line" aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent-text">Step {currentStep} of 4</p>
          <h3 className="font-display text-h3 text-ink-strong">{stepTitles[currentStep - 1]}</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          <Icon name="shieldCheck" className="h-4 w-4 text-accent-text" />
          Secure checkout powered by PayPal
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {renderStepContent()}

        {currentStep < 4 && (
          <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="outline"
              onClick={() => goToStep(currentStep - 1)}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
              {currentStep === 1 && availabilityState.status !== 'available' && (
                <span className="text-xs text-ink-muted">Check availability to continue</span>
              )}
              {currentStep === 2 && !canProceedFromStep2 && (
                <span className="text-xs text-ink-muted">Fill in name and mobile number to continue</span>
              )}
              {currentStep === 3 && !canProceedFromStep3 && (
                <span className="text-xs text-ink-muted">Enter your vehicle registration</span>
              )}
              <Button
                variant="primary"
                onClick={() => goToStep(currentStep + 1)}
                disabled={
                  (currentStep === 1 && !canProceedFromStep1) ||
                  (currentStep === 2 && !canProceedFromStep2) ||
                  (currentStep === 3 && !canProceedFromStep3)
                }
              >
                Continue
              </Button>
            </div>
          </div>
        )}
      </div>

      <noscript>
        <div className="mt-6 rounded-md border border-line bg-surface-sunk p-4 text-sm text-ink">
          <p className="font-semibold">Need to book without JavaScript?</p>
          <p className="mt-1">
            Call us on 01753 682707, WhatsApp us, or email manager@the-anchor.pub with your arrival time,
            departure time, registration and phone number.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <PhoneLink phone={CONTACT.phone} source="parking_wizard_fallback" showIcon={false} className="font-semibold underline">
              Call 01753 682707
            </PhoneLink>
            <a
              className="font-semibold underline"
              href="https://wa.me/441753682707?text=Hi%20Anchor%20Team%2C%20I%20need%20to%20book%20parking%20without%20the%20online%20form."
            >
              WhatsApp booking help
            </a>
            <a
              className="font-semibold underline"
              href="mailto:manager@the-anchor.pub?subject=Parking%20Booking%20Request&body=Arrival%20date%20and%20time%3A%0ADeparture%20date%20and%20time%3A%0AVehicle%20registration%3A%0AMobile%20number%3A"
            >
              Email booking request
            </a>
          </div>
        </div>
      </noscript>
    </Card>
  )
}
