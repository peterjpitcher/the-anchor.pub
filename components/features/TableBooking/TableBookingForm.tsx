'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { anchorAPI } from '@/lib/api'
import type { TableBookingRequest, TableBookingResponse } from '@/lib/api'
import BookingDatePicker from './BookingDatePicker'
import AvailabilityChecker from './AvailabilityChecker'
import CustomerDetails from './CustomerDetails'
import BookingConfirmation from './BookingConfirmation'
import type { CustomerDetailsData } from './CustomerDetails'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { Alert } from '@/components/ui/feedback/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { Icon } from '@/components/ui/Icon'
import { PhoneLink } from '@/components/PhoneLink'
import { trackTableBookingClick, trackTableBookingFunnel, trackFormComplete, trackError } from '@/lib/gtm-events'
import { logError } from '@/lib/error-handling'

export interface TableBookingFormProps {
  className?: string
  onSuccess?: (booking: TableBookingResponse) => void
  compact?: boolean
}

type BookingStep = 'date-selection' | 'availability' | 'details' | 'confirmation'

interface BookingState {
  step: BookingStep
  date: string | null
  time: string | null
  partySize: number
  confirmedTime: string | null
}

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export default function TableBookingForm({
  className = '',
  onSuccess,
  compact = false
}: TableBookingFormProps) {
  const [bookingState, setBookingState] = useState<BookingState>({
    step: 'date-selection',
    date: null,
    time: null,
    partySize: 2,
    confirmedTime: null
  })
  const [bookingResponse, setBookingResponse] = useState<TableBookingResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Handle date/time selection from first step
  const handleDateTimeSelect = useCallback((date: string, time: string, partySize: number) => {
    setBookingState({
      step: 'availability',
      date,
      time,
      partySize,
      confirmedTime: null
    })
    setError(null)
  }, [])

  // Handle time confirmation from availability checker
  const handleTimeConfirm = useCallback((time: string) => {
    setBookingState(prev => ({
      ...prev,
      step: 'details',
      confirmedTime: time
    }))
    setError(null)
  }, [])

  // Handle going back
  const handleBack = useCallback(() => {
    setBookingState(prev => {
      if (prev.step === 'availability') {
        return { ...prev, step: 'date-selection' }
      } else if (prev.step === 'details') {
        return { ...prev, step: 'availability' }
      }
      return prev
    })
    setError(null)
  }, [])

  // Handle final booking submission
  const handleBookingSubmit = useCallback(async (customerDetails: CustomerDetailsData) => {
    if (!bookingState.date || !bookingState.confirmedTime) {
      setError('Missing booking information. Please start again.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setRetryCount(0)

    // Track booking start
    trackTableBookingClick('booking_submit')

    // Create abort controller
    abortControllerRef.current = new AbortController()

    const bookingData: TableBookingRequest = {
      booking_type: 'regular',
      date: bookingState.date,
      time: bookingState.confirmedTime,
      party_size: bookingState.partySize,
      customer: {
        first_name: customerDetails.firstName,
        last_name: customerDetails.lastName,
        email: customerDetails.email,
        mobile_number: customerDetails.phone,
        sms_opt_in: true
      },
      duration_minutes: 120,
      special_requirements: customerDetails.specialRequirements,
      dietary_requirements: customerDetails.dietaryRequirements ? [customerDetails.dietaryRequirements] : undefined,
      allergies: customerDetails.allergies ? [customerDetails.allergies] : undefined,
      celebration_type: customerDetails.occasion,
      source: 'website'
    }

    const attemptBooking = async (attemptNumber: number): Promise<TableBookingResponse> => {
      try {
        const response = await anchorAPI.createTableBooking(bookingData)
        return response
      } catch (err: any) {
        // Check if request was aborted
        if (err.name === 'AbortError') {
          throw err
        }

        // Check if we should retry
        const isRetryable = err?.status >= 500 || err?.message?.includes('network') || err?.message?.includes('timeout')
        
        if (isRetryable && attemptNumber < MAX_RETRIES) {
          const delay = RETRY_DELAY * Math.pow(2, attemptNumber)
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
        setBookingState(prev => ({ ...prev, step: 'confirmation' }))
        
        // Track successful booking
        trackFormComplete('Table Booking')
        const bookingDate = response.confirmation_details?.date ?? response.booking_details?.date ?? bookingState.date
        const bookingTime = response.confirmation_details?.time ?? response.booking_details?.time ?? bookingState.confirmedTime
        if (bookingDate && bookingTime) {
          trackTableBookingFunnel({
            step: 'success',
            partySize: bookingState.partySize,
            bookingDate,
            bookingTime,
            bookingReference: response.booking_reference,
            source: 'table_booking_form',
            deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop'
          })
        }
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(response)
        }
      }
    } catch (err: any) {
      logError('table-booking-submit', err, bookingData)
      
      // Track error
      trackError('table_booking', err?.message || 'Unknown error', 'booking_submit')
      
      // Set user-friendly error message
      let errorMsg: string
      if (err?.message?.includes('temporarily unavailable') || err?.status === 503) {
        errorMsg = 'The booking system is temporarily unavailable. Please try again later or call us.'
      } else if (err?.message?.includes('API key')) {
        errorMsg = 'There is a configuration issue. Please call us to make your booking.'
      } else if (err?.status === 409) {
        errorMsg = 'This time slot is no longer available. Please select another time.'
      } else {
        errorMsg = 'Unable to complete your booking. Please try again or call us.'
      }
      
      setError(errorMsg)
    } finally {
      setIsSubmitting(false)
      abortControllerRef.current = null
    }
  }, [bookingState, onSuccess])

  // Handle new booking
  const handleNewBooking = useCallback(() => {
    setBookingState({
      step: 'date-selection',
      date: null,
      time: null,
      partySize: 2,
      confirmedTime: null
    })
    setBookingResponse(null)
    setError(null)
  }, [])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Render error state
  if (error && bookingState.step !== 'date-selection') {
    return (
      <Card variant="elevated" className={className}>
        <CardBody>
          <Alert variant="error" title="Booking Error">
            <p>{error}</p>
            <div className="mt-4 flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
              >
                <Icon name="arrowLeft" className="mr-2" />
                Go back
              </Button>
              <PhoneLink
                phone="01753682707"
                source="table_booking_error"
                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200"
              >
                <Icon name="phone" className="mr-2" />
                Call us
              </PhoneLink>
            </div>
          </Alert>
        </CardBody>
      </Card>
    )
  }

  // Render current step
  switch (bookingState.step) {
    case 'date-selection':
      return (
        <BookingDatePicker
          onDateTimeSelect={handleDateTimeSelect}
          defaultPartySize={bookingState.partySize}
          className={className}
        />
      )

    case 'availability':
      return (
        <AvailabilityChecker
          date={bookingState.date!}
          time={bookingState.time!}
          partySize={bookingState.partySize}
          onTimeSelect={handleTimeConfirm}
          onBack={handleBack}
          className={className}
          bookingType="regular"
        />
      )

    case 'details':
      return (
        <CustomerDetails
          date={bookingState.date!}
          time={bookingState.confirmedTime!}
          partySize={bookingState.partySize}
          onSubmit={handleBookingSubmit}
          onBack={handleBack}
          loading={isSubmitting}
          className={className}
        />
      )

    case 'confirmation':
      return (
        <BookingConfirmation
          booking={bookingResponse!}
          onNewBooking={handleNewBooking}
          className={className}
        />
      )

    default:
      return null
  }
}
