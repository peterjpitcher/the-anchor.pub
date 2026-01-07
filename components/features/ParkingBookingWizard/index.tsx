'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/primitives/Button'
import { Input, Textarea } from '@/components/ui/primitives/Input'
import { Icon } from '@/components/ui/Icon'
import type { ParkingRateCard, ParkingPricingBreakdownItem } from '@/lib/api'
import { formatPrice } from '@/lib/utils'

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

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null)

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

  const canProceedFromStep1 = availabilityState.status === 'available'
  const canProceedFromStep2 = customer.firstName && customer.lastName && customer.phone
  const canProceedFromStep3 = vehicle.registration.length >= 5

  const goToStep = (step: number) => {
    if (step < 1 || step > 4) return
    setCurrentStep(step)
  }

  const handleSubmit = useCallback(async () => {
    setSubmissionError(null)
    setSubmissionSuccess(null)
    setIsSubmitting(true)

    try {
      const payload = {
        start_at: iso(start),
        end_at: iso(end),
        customer: {
          first_name: customer.firstName,
          last_name: customer.lastName,
          email: customer.email,
          mobile_number: customer.phone
        },
        vehicle: {
          registration: vehicle.registration,
          make: vehicle.make,
          model: vehicle.model,
          colour: vehicle.colour
        },
        notes: notes || undefined
      }

      const response = await fetch('/api/parking/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const payloadResponse = await parseJsonResponse<{
        success?: boolean
        data?: {
          paypal_approval_url?: string
          reference?: string
        }
        error?: { message?: string }
      }>(
        response,
        'create-booking',
        'We could not complete your booking online right now. Please call 01753 682707 and we will secure your space.'
      )

      if (!response.ok || payloadResponse?.success === false) {
        throw new Error(payloadResponse?.error?.message || 'We could not complete your booking. Please try again.')
      }

      if (!payloadResponse?.data) {
        throw new Error('We created your booking but did not receive the confirmation details. Please call 01753 682707 so we can confirm everything for you.')
      }

      const approvalUrl = payloadResponse.data.paypal_approval_url
      const reference = payloadResponse.data.reference

      if (approvalUrl) {
        setSubmissionSuccess('Redirecting you to PayPal to finish payment...')
        setTimeout(() => {
          window.location.href = approvalUrl
        }, 1000)
      } else {
        setSubmissionSuccess(
          reference
            ? `Parking booking created. Reference: ${reference}. Please contact us to complete payment.`
            : 'Parking booking created. Please contact us to complete payment.'
        )
      }
    } catch (error: any) {
      setSubmissionError(error?.message || 'We could not complete your booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [start, end, customer, vehicle, notes])

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

            <div className="rounded-lg border border-dashed border-anchor-green bg-green-50 p-4 text-sm text-anchor-green">
              <p className="font-semibold">Best rates for longer stays</p>
              {isLoadingRates && <p className="mt-1">Loading the latest rate card…</p>}
              {ratesError && <p className="mt-1 text-red-600">{ratesError}</p>}
	              {rates && !ratesError && (
	                <ul className="mt-2 space-y-1">
	                  <li>• Hourly: {formatPrice(rates.hourly_rate, 'GBP')}</li>
	                  <li>• Daily: {formatPrice(rates.daily_rate, 'GBP')}</li>
	                  <li>• Weekly: {formatPrice(rates.weekly_rate, 'GBP')}</li>
	                  <li>• Monthly: {formatPrice(rates.monthly_rate, 'GBP')}</li>
	                </ul>
	              )}
	              {estimate && (
	                <p className="mt-2 text-sm text-anchor-charcoal">
	                  Estimated cost for this stay: <strong>{formatPrice(estimate.amount, 'GBP')}</strong> (final price confirmed at checkout)
	                </p>
	              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              {availabilityState.status === 'available' && (
                <div className="flex items-center text-sm text-green-700">
                  <Icon name="check" className="mr-2 h-4 w-4" />
                  {availabilityState.message || 'Spaces available'}
                </div>
              )}
              {availabilityState.status === 'unavailable' && (
                <div className="flex items-center text-sm text-red-600">
                  <Icon name="alert" className="mr-2 h-4 w-4" />
                  {availabilityState.message || 'No spaces available for that window'}
                </div>
              )}
              {availabilityError && (
                <div className="text-sm text-red-600">{availabilityError}</div>
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
            <p className="text-sm text-gray-600">
              We use your mobile number to send the PayPal link and booking updates. Your details are never shared.
            </p>
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
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h4 className="text-lg font-semibold text-anchor-charcoal">Booking summary</h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li><strong>Arrival:</strong> {new Date(start).toLocaleString()}</li>
                <li><strong>Departure:</strong> {new Date(end).toLocaleString()}</li>
                <li><strong>Guest:</strong> {customer.firstName} {customer.lastName}</li>
                <li><strong>Mobile:</strong> {customer.phone}</li>
                {customer.email && <li><strong>Email:</strong> {customer.email}</li>}
                <li><strong>Vehicle:</strong> {vehicle.registration.toUpperCase()} {vehicle.make && `· ${vehicle.make}`} {vehicle.model && `· ${vehicle.model}`}</li>
                {notes && <li><strong>Notes:</strong> {notes}</li>}
              </ul>
              <p className="mt-4 text-xs text-gray-600">
                Vehicles stay in The Anchor car park at the owner&apos;s risk. Please keep your keys with you and arrange your own transfer (taxi or 442 bus) to the Heathrow terminals.
              </p>
	              {estimate && (
	                <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-anchor-charcoal">
	                  <p>
	                    Estimated cost: <strong>{formatPrice(estimate.amount, 'GBP')}</strong>
	                  </p>
	                  <ul className="mt-2 space-y-1">
	                    {estimate.breakdown.map(item => (
	                      <li key={`${item.unit}-${item.quantity}`}>
	                        {item.quantity} × {item.unit} @ {formatPrice(item.rate, 'GBP')} = {formatPrice(item.subtotal, 'GBP')}
	                      </li>
	                    ))}
	                  </ul>
                  <p className="mt-2 text-xs text-gray-600">Exact pricing confirmed when PayPal opens.</p>
                </div>
              )}
            </div>

            {submissionError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{submissionError}</div>
            )}
            {submissionSuccess && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">{submissionSuccess}</div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
              <Button variant="secondary" onClick={() => goToStep(3)} disabled={isSubmitting}>
                Back to vehicle details
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Securing your space…' : 'Confirm & pay via PayPal'}
              </Button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-anchor-green">Step {currentStep} of 4</p>
          <h3 className="text-2xl font-bold text-anchor-charcoal">{stepTitles[currentStep - 1]}</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Icon name="shieldCheck" className="h-4 w-4 text-anchor-green" />
          Secure checkout powered by PayPal
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {renderStepContent()}

        {currentStep < 4 && (
          <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="secondary"
              onClick={() => goToStep(currentStep - 1)}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
              {currentStep === 1 && availabilityState.status !== 'available' && (
                <span className="text-xs text-gray-600">Check availability to continue</span>
              )}
              {currentStep === 2 && !canProceedFromStep2 && (
                <span className="text-xs text-gray-600">Fill in name and mobile number to continue</span>
              )}
              {currentStep === 3 && !canProceedFromStep3 && (
                <span className="text-xs text-gray-600">Enter your vehicle registration</span>
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
        <div className="mt-6 rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
          JavaScript is required for the interactive booking experience. Please call us on 01753 682707 and we will secure your parking manually.
        </div>
      </noscript>
    </div>
  )
}
