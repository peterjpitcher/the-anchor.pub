'use client'

import { useState, useCallback, memo, useRef, useEffect } from 'react'
import { initiateEventBooking } from '@/lib/api'
import type { Event } from '@/lib/api'
import { DebouncedInput } from '../DebouncedInput'
import { analytics } from '@/lib/analytics'
import { EventBookingErrorBoundary } from '../EventBookingErrorBoundary'
import { trackEventBookingStart, trackFormStart } from '@/lib/gtm-events'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { Button } from '@/components/ui/primitives/Button'
import { Input } from '@/components/ui/primitives/Input'
import { Alert } from '@/components/ui/feedback/Alert'
import { Badge } from '@/components/ui/primitives/Badge'
import { PhoneLink } from '@/components/PhoneLink'

interface EventBookingProps {
  event: Event
  className?: string
}

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // Start with 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function EventBookingComponent({ event, className = '' }: EventBookingProps) {
  const [isBooking, setIsBooking] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [bookingResponse, setBookingResponse] = useState<any>(null)
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [retryCount, setRetryCount] = useState(0)
  const errorRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

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
      return
    }

    if (!validatePhoneNumber(phoneNumber)) {
      const errorMsg = 'Please enter a valid UK mobile number'
      setError(errorMsg)
      setStatusMessage(errorMsg)
      return
    }

    setIsBooking(true)
    setStatusMessage('Processing your booking request...')
    setRetryCount(0)
    
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
          setStatusMessage(`Connection issue. Retrying... (attempt ${attemptNumber + 1}/${MAX_RETRIES})`)
          setRetryCount(attemptNumber + 1)
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
        setStatusMessage('Booking initiated successfully! Check your messages for the confirmation link.')
        
        // Track successful booking
        analytics.formSubmit('booking', event.name, 1)
      } else {
        const errorMsg = 'Unable to initiate booking. Please try again or call us.'
        setError(errorMsg)
        setStatusMessage(errorMsg)
        
        // Track error
        analytics.error('booking', `${event.name}: ${errorMsg}`)
      }
    } catch (err: any) {
      // Check for specific error messages
      let errorMsg: string
      if (err?.message?.includes('temporarily unavailable') || err?.status === 503) {
        errorMsg = 'The booking system is temporarily unavailable. Please try again later or call us at 01753 682707.'
      } else if (err?.message?.includes('API key')) {
        errorMsg = 'There is a configuration issue. Please call us at 01753 682707 to book.'
      } else {
        errorMsg = 'Unable to process your booking. Please try again or call us at 01753 682707.'
      }
      setError(errorMsg)
      setStatusMessage(errorMsg)
    } finally {
      setIsBooking(false)
      abortControllerRef.current = null
    }
  }, [phoneNumber, validatePhoneNumber, formatPhoneNumber, event.id, event.name, event.offers?.price])

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

  // If event is sold out or not available, show appropriate message
  if (event.remainingAttendeeCapacity === 0) {
    return (
      <Alert variant="error" className={className}>
        <strong>This event is sold out</strong>
        <p className="mt-1">
          Please call us at <PhoneLink phone="01753682707" source="event_booking_features_soldout" className="underline font-semibold" showIcon={false}>01753 682707</PhoneLink> to join the waiting list.
        </p>
      </Alert>
    )
  }

  if (success && bookingResponse) {
    return (
      <Alert 
        variant="success" 
        title="Booking Initiated!"
        className={className}
        onClose={() => {
          setSuccess(false)
          setBookingResponse(null)
          setStatusMessage('')
        }}
      >
        <p className="mb-4">
          We've sent a confirmation link to your mobile. Please check your messages and click the link to complete your booking.
        </p>
        
        {bookingResponse.event && (
          <Card variant="outlined" padding="sm" className="mb-4">
            <CardBody className="space-y-1">
              <p className="text-sm"><span className="font-medium">Event:</span> {bookingResponse.event.name}</p>
              <p className="text-sm"><span className="font-medium">Date:</span> {bookingResponse.event.date}</p>
              <p className="text-sm"><span className="font-medium">Time:</span> {bookingResponse.event.time}</p>
              <p className="text-sm">
                <span className="font-medium">Available tickets:</span>{' '}
                <Badge variant="success" size="sm">{bookingResponse.event.available_seats}</Badge>
              </p>
            </CardBody>
          </Card>
        )}
        
        <p className="text-sm">
          The confirmation link expires in 24 hours. Didn't receive the message? Click the X above to try again.
        </p>
      </Alert>
    )
  }

  return (
    <Card variant="elevated" className={`bg-amber-50 border-amber-200 ${className}`}>
      <CardBody>
        {/* Screen reader only live region for status announcements */}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {statusMessage}
        </div>
        
        <h3 className="text-lg font-semibold text-amber-900 mb-4">Book Your Spot</h3>
        
        {event.remainingAttendeeCapacity && event.remainingAttendeeCapacity < 10 && (
          <Alert variant="warning" className="mb-4">
            <Badge variant="warning" dot>
              Limited spaces remaining - book now!
            </Badge>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Event booking form">
          <div>
            <Input
              type="tel"
              id="phone"
              label="Mobile Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="07700 900123"
              disabled={isBooking}
              error={error || undefined}
              helperText={!error ? "We'll send a confirmation link to this number" : undefined}
              aria-describedby={error ? 'phone-error' : 'phone-help'}
              aria-invalid={!!error}
              aria-required="true"
              onFocus={() => {
                // Track form interaction start
                trackFormStart(`Event Booking - ${event.name}`)
              }}
            />
            
            {error && retryCount > 0 && (
              <p className="text-sm sm:text-xs text-red-600 mt-1">
                Failed after {retryCount} retry attempt{retryCount > 1 ? 's' : ''}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isBooking}
            disabled={isBooking}
            size="lg"
            aria-busy={isBooking}
            aria-label={isBooking ? 'Sending booking confirmation' : `Book your spot for ${event.name}`}
          >
            {isBooking && retryCount > 0 
              ? `Retrying... (${retryCount}/${MAX_RETRIES})` 
              : 'Book Now'
            }
          </Button>
        </form>

        <div className="mt-4 pt-4 border-t border-amber-200">
          <p className="text-sm text-gray-700 text-center">
            Prefer to call? Ring us at{' '}
            <PhoneLink 
              phone="01753682707" 
              source="event_booking_features_form" 
              className="font-semibold text-amber-700 underline"
              showIcon={false}
            >
              01753 682707
            </PhoneLink>
          </p>
        </div>
      </CardBody>
    </Card>
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
