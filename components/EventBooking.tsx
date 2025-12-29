'use client'

import { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react'
import { initiateEventBooking } from '@/lib/api'
import type { Event } from '@/lib/api'
import { DebouncedInput } from './DebouncedInput'
import { analytics } from '@/lib/analytics'
import { EventBookingErrorBoundary } from './EventBookingErrorBoundary'
import { trackEventBookingStart, trackFormStart } from '@/lib/gtm-events'
import { CONTACT_INFO } from '@/lib/error-handling'
import { PhoneLink } from '@/components/PhoneLink'
import { Button, LiveRegion, useLiveRegion } from '@/components/ui'

interface EventBookingProps {
  event: Event
  className?: string
  isTentative?: boolean
}

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // Start with 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function EventBookingComponent({ event, className = '', isTentative = false }: EventBookingProps) {
  const [isBooking, setIsBooking] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [bookingResponse, setBookingResponse] = useState<any>(null)
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [retryCount, setRetryCount] = useState(0)
  const errorRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const { message: liveMessage, announce } = useLiveRegion('polite')

  const validatePhoneNumber = useCallback((phone: string): boolean => {
    // Remove spaces and special characters
    const cleaned = phone.replace(/[\s-()]/g, '')

    // UK mobile number patterns
    const ukMobilePattern = /^(?:(?:\+44|0044|0)7(?:\d{9}))$/

    return ukMobilePattern.test(cleaned)
  }, [])

  const formatPhoneNumber = useCallback((phone: string): string => {
    // Remove spaces and special characters
    let cleaned = phone.replace(/[\s-()]/g, '')

    // Convert to standard format
    if (cleaned.startsWith('+44')) {
      return cleaned
    } else if (cleaned.startsWith('0044')) {
      return '+44' + cleaned.substring(4)
    } else if (cleaned.startsWith('07')) {
      return '+44' + cleaned.substring(1)
    }

    return cleaned
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setStatusMessage('')

    if (!phoneNumber.trim()) {
      const errorMsg = 'Please enter your mobile number'
      setError(errorMsg)
      setStatusMessage(errorMsg)
      announce(errorMsg, 'assertive')
      return
    }

    if (!validatePhoneNumber(phoneNumber)) {
      const errorMsg = 'Please enter a valid UK mobile number'
      setError(errorMsg)
      setStatusMessage(errorMsg)
      announce(errorMsg, 'assertive')
      return
    }

    setIsBooking(true)
    setStatusMessage('Processing your booking request...')
    setRetryCount(0)
    announce('Processing your booking request', 'polite')

    // Track booking start for remarketing
    trackEventBookingStart({
      eventId: event.id,
      eventName: event.name,
      eventPrice: event.offers?.price ? parseFloat(event.offers.price) : undefined
    })

    // Create abort controller for this request
    abortControllerRef.current = new AbortController()

    const attemptBooking = async (attemptNumber: number): Promise<any> => {
      try {
        const formattedPhone = formatPhoneNumber(phoneNumber)
        const response = await initiateEventBooking(event.id, formattedPhone)
        return response
      } catch (err: any) {
        // Check if request was aborted
        if (err.name === 'AbortError') {
          throw err
        }

        // Check if we should retry
        const isRetryable = err?.status >= 500 || err?.message?.includes('network') || err?.message?.includes('timeout')

        if (isRetryable && attemptNumber < MAX_RETRIES) {
          const delay = RETRY_DELAY * Math.pow(2, attemptNumber) // Exponential backoff
          const retryMsg = `Connection issue. Retrying... (attempt ${attemptNumber + 1}/${MAX_RETRIES})`
          setStatusMessage(retryMsg)
          setRetryCount(attemptNumber + 1)
          announce(retryMsg, 'polite')
          await sleep(delay)
          return attemptBooking(attemptNumber + 1)
        }

        throw err
      }
    }

    try {
      const response = await attemptBooking(0)

      if (response) {
        setBookingResponse(response)
        setSuccess(true)
        setPhoneNumber('')
        const successMsg = 'Booking initiated successfully! Check your messages for the confirmation link.'
        setStatusMessage(successMsg)
        announce(successMsg, 'assertive')

        // Track successful booking
        analytics.formSubmit('booking', event.name, 1)
      } else {
        const errorMsg = `We couldn't process your booking online. Please call us at ${CONTACT_INFO.phone} and we'll reserve your spot right away.`
        setError(errorMsg)
        setStatusMessage(errorMsg)
        announce(errorMsg, 'assertive')

        // Track error
        analytics.error('booking', `${event.name}: ${errorMsg}`)
      }
    } catch (err: any) {
      // Error: Booking error

      // Check for specific error messages
      let errorMsg: string
      if (err?.message?.includes('temporarily unavailable') || err?.status === 503) {
        errorMsg = `The booking system is temporarily unavailable. Please try again later or call us at ${CONTACT_INFO.phone}.`
      } else if (err?.message?.includes('API key')) {
        errorMsg = `There is a configuration issue. Please call us at ${CONTACT_INFO.phone} to book.`
      } else {
        errorMsg = `We couldn't process your booking online. Please call us at ${CONTACT_INFO.phone} and we'll reserve your spot right away.`
      }
      setError(errorMsg)
      setStatusMessage(errorMsg)
    } finally {
      setIsBooking(false)
      abortControllerRef.current = null
    }
  }, [phoneNumber, validatePhoneNumber, formatPhoneNumber, event.id, event.name, event.offers?.price, announce])

  // Focus error message when it appears
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus()
    }
  }, [error])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // If event is tentative, show message
  if (isTentative) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <p className="text-blue-800 font-semibold">Tentative Date</p>
        <p className="text-blue-600 text-sm mt-1">
          This date is tentative. Confirmed status and booking will be available 1 month before the event.
        </p>
      </div>
    )
  }

  // If event is sold out or not available, show appropriate message
  if (event.remainingAttendeeCapacity === 0) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-800 font-semibold">This event is sold out</p>
        <p className="text-red-600 text-sm mt-1">
          Please call us at <PhoneLink phone="01753682707" source="event_booking_soldout" className="underline" showIcon={false}>01753 682707</PhoneLink> to join the waiting list.
        </p>
      </div>
    )
  }

  if (success && bookingResponse) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-6 ${className}`} role="alert" aria-live="polite">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Booking Initiated!</h3>
        <p className="text-green-700 mb-4">
          We've sent a confirmation link to your mobile. Please check your messages and click the link to complete your booking.
        </p>
        {bookingResponse.event && (
          <div className="bg-white rounded p-4 border border-green-100">
            <p className="text-sm text-gray-600">Event: <span className="font-semibold text-gray-800">{bookingResponse.event.name}</span></p>
            <p className="text-sm text-gray-600">Date: <span className="font-semibold text-gray-800">{bookingResponse.event.date}</span></p>
            <p className="text-sm text-gray-600">Time: <span className="font-semibold text-gray-800">{bookingResponse.event.time}</span></p>
            <p className="text-sm text-gray-600">Available tickets: <span className="font-semibold text-gray-800">{bookingResponse.event.available_seats}</span></p>
          </div>
        )}
        <p className="text-sm text-green-600 mt-4">
          The confirmation link expires in 24 hours. Didn't receive the message?
          <Button
            onClick={() => {
              setSuccess(false)
              setBookingResponse(null)
              setStatusMessage('')
            }}
            variant="ghost"
            size="sm"
            className="ml-1"
            aria-label="Try booking again"
          >
            Try again
          </Button>
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-6 ${className}`}>
      {/* Live region for status announcements */}
      <LiveRegion message={liveMessage} type="polite" />
      <h3 className="text-lg font-semibold text-amber-900 mb-4">Book Your Spot</h3>

      {event.remainingAttendeeCapacity && event.remainingAttendeeCapacity < 10 && (
        <p className="text-amber-700 text-sm mb-4 font-semibold">
          Limited spaces remaining - book now!
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Event booking form">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Number
          </label>
          <DebouncedInput
            type="tel"
            id="phone"
            value={phoneNumber}
            onChange={setPhoneNumber}
            placeholder="07700 900123"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
            disabled={isBooking}
            delay={200}
            aria-describedby={error ? 'phone-error' : 'phone-help'}
            aria-invalid={!!error}
            aria-required="true"
            onFocus={() => {
              // Track form interaction start
              trackFormStart(`Event Booking - ${event.name}`)
            }}
          />
          <p id="phone-help" className="text-sm sm:text-xs text-gray-700 mt-1">
            We'll send a confirmation link to this number
          </p>
        </div>

        {error && (
          <div
            ref={errorRef}
            id="phone-error"
            className="bg-red-50 border border-red-200 rounded p-3"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-sm text-red-700">{error}</p>
            {retryCount > 0 && (
              <p className="text-sm sm:text-xs text-red-600 mt-1">
                Failed after {retryCount} retry attempt{retryCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        <Button
          type="submit"
          disabled={isBooking}
          variant="primary"
          size="lg"
          fullWidth
          className="bg-amber-600 hover:bg-amber-700"
          aria-busy={isBooking}
          aria-label={isBooking ? 'Sending booking confirmation' : `Book your spot for ${event.name}`}
        >
          {isBooking ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-label="Loading" role="status">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="sr-only">Loading...</span>
              {retryCount > 0 ? `Retrying... (${retryCount}/${MAX_RETRIES})` : 'Sending confirmation...'}
            </span>
          ) : 'Book Now'}
        </Button>
      </form>

      <div className="mt-4 pt-4 border-t border-amber-200">
        <p className="text-sm text-gray-600">
          Prefer to call? Ring us at{' '}
          <PhoneLink
            phone="01753682707"
            source="event_booking_form"
            className="font-semibold text-amber-700 underline"
            showIcon={false}
          >
            01753 682707
          </PhoneLink>
        </p>
      </div>
    </div>
  )
}

const MemoizedEventBooking = memo(EventBookingComponent)

// Export with error boundary wrapper
export default function EventBooking(props: EventBookingProps) {
  return (
    <EventBookingErrorBoundary>
      <MemoizedEventBooking {...props} />
    </EventBookingErrorBoundary>
  )
}
