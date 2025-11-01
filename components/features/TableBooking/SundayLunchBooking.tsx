'use client'

import { useState } from 'react'
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
import { Select } from '@/components/ui/forms/Select'
import { trackTableBookingClick, trackFormComplete, trackError } from '@/lib/gtm-events'
import { logError } from '@/lib/error-handling'
import { analytics } from '@/lib/analytics'

interface SundayLunchBookingProps {
  className?: string
  onSuccess?: (booking: TableBookingResponse) => void
}

type BookingStep = 'pre-order-info' | 'date-selection' | 'availability' | 'details' | 'confirmation'

interface BookingState {
  step: BookingStep
  date: string | null
  time: string | null
  partySize: number
  confirmedTime: string | null
}

// Helper functions for Sunday calculations
const getNextSunday = (from: Date): Date => {
  const date = new Date(from)
  const dayOfWeek = date.getDay()
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
  date.setDate(date.getDate() + daysUntilSunday)
  return date
}

const getOrderDeadline = (sunday: Date): Date => {
  const deadline = new Date(sunday)
  deadline.setDate(deadline.getDate() - 1) // Go to Saturday
  deadline.setHours(13, 0, 0, 0) // Set to 1pm
  return deadline
}

const canOrderForNextSunday = (): boolean => {
  const now = new Date()
  const nextSunday = getNextSunday(now)
  const deadline = getOrderDeadline(nextSunday)
  return now < deadline
}

const getFirstAvailableSunday = (): Date => {
  const now = new Date()
  const nextSunday = getNextSunday(now)
  
  if (canOrderForNextSunday()) {
    return nextSunday
  } else {
    // Skip to the Sunday after next
    return getNextSunday(new Date(nextSunday.getTime() + 7 * 24 * 60 * 60 * 1000))
  }
}

// Generate available Sundays for the next 8 weeks
const getAvailableSundays = (): { value: string; label: string }[] => {
  const sundays = []
  const firstSunday = getFirstAvailableSunday()
  
  for (let i = 0; i < 8; i++) {
    const sunday = new Date(firstSunday)
    sunday.setDate(sunday.getDate() + (i * 7))
    
    const value = sunday.toISOString().split('T')[0]
    const label = sunday.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
    
    sundays.push({ value, label })
  }
  
  return sundays
}

// Sunday lunch time slots (12pm to 5pm, every 30 minutes)
const SUNDAY_TIME_SLOTS = [
  { value: '12:00', label: '12:00pm' },
  { value: '12:30', label: '12:30pm' },
  { value: '13:00', label: '1:00pm' },
  { value: '13:30', label: '1:30pm' },
  { value: '14:00', label: '2:00pm' },
  { value: '14:30', label: '2:30pm' },
  { value: '15:00', label: '3:00pm' },
  { value: '15:30', label: '3:30pm' },
  { value: '16:00', label: '4:00pm' },
  { value: '16:30', label: '4:30pm' },
  { value: '17:00', label: '5:00pm' }
]

// Party size options
const PARTY_SIZE_OPTIONS = Array.from({ length: 20 }, (_, i) => ({
  value: (i + 1).toString(),
  label: i === 0 ? '1 person' : `${i + 1} people`
}))

export default function SundayLunchBooking({
  className = '',
  onSuccess
}: SundayLunchBookingProps) {
  const [bookingState, setBookingState] = useState<BookingState>({
    step: 'pre-order-info',
    date: null,
    time: null,
    partySize: 2,
    confirmedTime: null
  })
  const [bookingResponse, setBookingResponse] = useState<TableBookingResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle initial proceed
  const handleProceed = () => {
    trackTableBookingClick('sunday_lunch_booking_start')
    setBookingState(prev => ({ ...prev, step: 'date-selection' }))
  }

  // Handle date/time selection
  const handleDateTimeSelect = () => {
    if (!bookingState.date || !bookingState.time) {
      setError('Please select both date and time')
      return
    }
    
    setBookingState(prev => ({ ...prev, step: 'availability' }))
    setError(null)
  }

  // Handle time confirmation from availability checker
  const handleTimeConfirm = (time: string) => {
    setBookingState(prev => ({
      ...prev,
      step: 'details',
      confirmedTime: time
    }))
    setError(null)
  }

  // Handle going back
  const handleBack = () => {
    setBookingState(prev => {
      if (prev.step === 'date-selection') {
        return { ...prev, step: 'pre-order-info' }
      } else if (prev.step === 'availability') {
        return { ...prev, step: 'date-selection' }
      } else if (prev.step === 'details') {
        return { ...prev, step: 'availability' }
      }
      return prev
    })
    setError(null)
  }

  // Handle final booking submission
  const handleBookingSubmit = async (customerDetails: CustomerDetailsData) => {
    if (!bookingState.date || !bookingState.confirmedTime) {
      setError('Missing booking information. Please start again.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    trackTableBookingClick('sunday_lunch_booking_submit')

    const bookingData: TableBookingRequest = {
      booking_type: 'sunday_lunch',
      date: bookingState.date,
      time: bookingState.confirmedTime,
      party_size: bookingState.partySize,
      customer: {
        first_name: customerDetails.firstName,
        last_name: customerDetails.lastName,
        mobile_number: customerDetails.phone,
        sms_opt_in: true
      },
      special_requirements: customerDetails.specialRequirements 
        ? `SUNDAY ROAST PRE-ORDER: ${customerDetails.specialRequirements}`
        : 'SUNDAY ROAST PRE-ORDER',
      dietary_requirements: customerDetails.dietaryRequirements ? [customerDetails.dietaryRequirements] : undefined,
      allergies: customerDetails.allergies ? [customerDetails.allergies] : undefined,
      celebration_type: customerDetails.occasion || 'sunday_roast',
      source: 'website'
    }

    try {
      const response = await anchorAPI.createTableBooking(bookingData)
      
      if (response) {
        setBookingResponse(response)
        setBookingState(prev => ({ ...prev, step: 'confirmation' }))
        
        trackFormComplete('Sunday Lunch Booking')
        analytics.formSubmit('booking', `Sunday Lunch - ${bookingState.partySize} people`, bookingState.partySize)
        
        if (onSuccess) {
          onSuccess(response)
        }
      }
    } catch (err: any) {
      logError('sunday-lunch-booking-submit', err, bookingData)
      trackError('sunday_lunch_booking', err?.message || 'Unknown error', 'booking_submit')
      
      let errorMsg: string
      if (err?.message?.includes('temporarily unavailable') || err?.status === 503) {
        errorMsg = 'The booking system is temporarily unavailable. Please try again later or call us.'
      } else if (err?.status === 409) {
        errorMsg = 'This time slot is no longer available. Please select another time.'
      } else {
        errorMsg = 'Unable to complete your booking. Please try again or call us.'
      }
      
      setError(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle new booking
  const handleNewBooking = () => {
    setBookingState({
      step: 'pre-order-info',
      date: null,
      time: null,
      partySize: 2,
      confirmedTime: null
    })
    setBookingResponse(null)
    setError(null)
  }

  // Render current step
  switch (bookingState.step) {
    case 'pre-order-info':
      const nextAvailable = getFirstAvailableSunday()
      const formattedDate = nextAvailable.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
      
      return (
        <div className={`space-y-6 ${className}`}>
          <Alert variant="warning" title="Pre-Order Required">
            <div className="space-y-3">
              <p className="font-semibold">
                Sunday roasts must be pre-ordered and paid for by 1pm on Saturday.
              </p>
              <p className="text-sm">
                This ensures we can prepare your meal fresh to order - a delicious 'like home' Sunday lunch.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                <p className="text-sm font-medium text-amber-900">
                  Next available Sunday: {formattedDate}
                </p>
              </div>
            </div>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleProceed}
              className="flex-1"
            >
              <Icon name="calendar" className="mr-2" />
              Book Sunday Roast
            </Button>
            
            <PhoneLink
              phone="01753682707"
              source="sunday_lunch_page"
              className="flex-1"
            >
              <Button variant="outline" size="lg" fullWidth>
                <Icon name="phone" className="mr-2" />
                Call to Book
              </Button>
            </PhoneLink>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Can't pre-order? Our regular menu is also available on Sundays without pre-order.</p>
          </div>
        </div>
      )

    case 'date-selection':
      return (
        <Card variant="elevated" className={className}>
          <CardBody>
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="mb-4"
              >
                <Icon name="arrowLeft" className="mr-2" />
                Back
              </Button>
              
              <Alert variant="info" className="mb-4">
                <p className="text-sm">
                  <strong>Reminder:</strong> Orders must be placed by 1pm on Saturday for Sunday collection.
                </p>
              </Alert>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleDateTimeSelect(); }} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="sunday-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Sunday
                  </label>
                  <Select
                    id="sunday-date"
                    value={bookingState.date || ''}
                    onChange={(e) => setBookingState(prev => ({ ...prev, date: e.target.value }))}
                    required
                  >
                    <option value="">Choose a Sunday</option>
                    {getAvailableSundays().map(sunday => (
                      <option key={sunday.value} value={sunday.value}>{sunday.label}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label htmlFor="booking-time" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Time
                  </label>
                  <Select
                    id="booking-time"
                    value={bookingState.time || ''}
                    onChange={(e) => setBookingState(prev => ({ ...prev, time: e.target.value }))}
                    required
                    disabled={!bookingState.date}
                  >
                    <option value="">Choose a time</option>
                    {SUNDAY_TIME_SLOTS.map(slot => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="party-size" className="block text-sm font-medium text-gray-700 mb-1">
                    Party Size
                  </label>
                  <Select
                    id="party-size"
                    value={bookingState.partySize.toString()}
                    onChange={(e) => setBookingState(prev => ({ ...prev, partySize: parseInt(e.target.value) }))}
                  >
                    {PARTY_SIZE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    size="lg"
                    disabled={!bookingState.date || !bookingState.time}
                  >
                    <Icon name="calendar" className="mr-2" />
                    Check Availability
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="error" className="mt-4">
                  {error}
                </Alert>
              )}

              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <Icon name="info" className="h-4 w-4" />
                <span>Sunday lunch is served from 12pm to 5pm</span>
              </div>
            </form>
          </CardBody>
        </Card>
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
          bookingType="sunday_lunch"
        />
      )

    case 'details':
      return (
        <div className={className}>
          <Alert variant="warning" className="mb-6">
            <h3 className="font-bold text-lg mb-2">Sunday Roast Pre-Order</h3>
            <p className="text-sm">
              By completing this booking, you confirm that you understand Sunday roasts must be 
              pre-ordered and paid for by 1pm on Saturday.
            </p>
          </Alert>
          
          <CustomerDetails
            date={bookingState.date!}
            time={bookingState.confirmedTime!}
            partySize={bookingState.partySize}
            onSubmit={handleBookingSubmit}
            onBack={handleBack}
            loading={isSubmitting}
          />
        </div>
      )

    case 'confirmation':
      return (
        <div className={className}>
          <Alert variant="success" className="mb-6">
            <h3 className="font-bold text-lg mb-2">Sunday Roast Booking Confirmed!</h3>
            <p className="text-sm">
              Remember to complete your pre-order and payment by 1pm on Saturday.
            </p>
          </Alert>
          
          <BookingConfirmation
            booking={bookingResponse!}
            onNewBooking={handleNewBooking}
          />
        </div>
      )

    default:
      return null
  }
}
