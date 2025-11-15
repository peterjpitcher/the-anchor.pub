'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { WizardStepPlanVisit } from './WizardStepPlanVisit'
import { WizardStep5DetailsAndRequirements } from './WizardStep5DetailsAndRequirements'
import { WizardStep6Confirm } from './WizardStep6Confirm'
import { WizardProgress } from './WizardProgress'
import { trackBookingWizardStep, trackFormComplete, trackError } from '@/lib/gtm-events'
import type {
  BookingWizardData,
  AvailabilityData,
  WizardFlowStep,
  EventsByDate
} from './types'

const BOOKING_DEBUG = process.env.NEXT_PUBLIC_BOOKING_DEBUG === 'true'

interface BookingWizardProps {
  availabilityData: AvailabilityData
  eventsByDate?: EventsByDate
  initialStep?: number
  preselectedDate?: string
  bookingType?: 'regular' | 'sunday_lunch'
  className?: string
}

interface Step {
  type: WizardFlowStep
  label: string
}

const computeWizardSteps = (): Step[] => {
  return [
    { type: 'plan_visit', label: 'Plan Visit' },
    { type: 'details', label: 'Details' },
    { type: 'confirm', label: 'Confirm' }
  ]
}

export function BookingWizard({
  availabilityData,
  eventsByDate = {},
  initialStep = 1,
  preselectedDate,
  bookingType: initialBookingType,
  className
}: BookingWizardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const wizardRef = useRef<HTMLDivElement | null>(null)

  const initialDate = preselectedDate || ''
  const isInitialSunday = initialDate ? new Date(`${initialDate}T12:00:00`).getDay() === 0 : false
  const initialSundayLunchAvailable =
    isInitialSunday && availabilityData.sundayRoastDates.includes(initialDate)
  const resolvedInitialBookingType =
    initialBookingType === 'sunday_lunch'
      ? (initialDate
          ? (initialSundayLunchAvailable ? 'sunday_lunch' : 'regular')
          : 'sunday_lunch')
      : initialBookingType || 'regular'

  const initialBookingData: BookingWizardData = {
    date: initialDate,
    bookingType: resolvedInitialBookingType,
    sundayLunchAvailable: initialSundayLunchAvailable,
    menuSelections: undefined,
    menuSummary: undefined,
    partySize: 2,
    time: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dietaryRequirements: [],
    allergies: '',
    occasion: '',
    specialRequirements: '',
    marketingOptIn: true
  }

  // Wizard state
  const [steps] = useState<Step[]>(() => computeWizardSteps())
  const [currentStep, setCurrentStep] = useState(() => {
    const clamped = Math.min(Math.max(initialStep, 1), steps.length || 1)
    return clamped
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingData, setBookingData] = useState<BookingWizardData>(initialBookingData)

  const totalSteps = steps.length
  const currentStepType = steps[currentStep - 1]?.type

  useEffect(() => {
    const maxIndex = steps.length
    const clamped = Math.min(Math.max(currentStep, 1), maxIndex)
    if (clamped !== currentStep) {
      setCurrentStep(clamped)
    }
  }, [currentStep, steps.length])
  
  // Update URL with current step
  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set('step', currentStep.toString())
    if (bookingData.date) params.set('date', bookingData.date)
    if (bookingData.bookingType) params.set('type', bookingData.bookingType)
    
    const newUrl = `/book-table?${params.toString()}`
    router.replace(newUrl, { scroll: false })
  }, [currentStep, bookingData.date, bookingData.bookingType, router, searchParams])
  
  // Track step changes
  useEffect(() => {
    if (currentStepType) {
      trackBookingWizardStep(currentStep, currentStepType)
    }
  }, [currentStep, currentStepType])
  
  // Handle step navigation
  const goToStep = useCallback((step: number) => {
    const clamped = Math.min(Math.max(step, 1), steps.length || 1)
    setCurrentStep(clamped)
    if (wizardRef.current) {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

      wizardRef.current.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'nearest'
      })
    }
  }, [steps.length])
  
  const goNext = useCallback(() => {
    if (currentStep < totalSteps) {
      goToStep(currentStep + 1)
    }
  }, [currentStep, totalSteps, goToStep])
  
  const goBack = useCallback(() => {
    if (currentStep > 1) {
      goToStep(currentStep - 1)
    }
  }, [currentStep, goToStep])
  
  // Update booking data
  const updateBookingData = useCallback((data: Partial<BookingWizardData>) => {
    if (BOOKING_DEBUG) {
      console.debug('[BookingWizard] Updating data', data)
    }
    setBookingData(prev => {
      const newData: BookingWizardData = { ...prev, ...data }

      if (typeof data.date === 'string') {
        const nextDate = data.date

        if (nextDate) {
          const parsedDate = new Date(`${nextDate}T12:00:00`)
          const isValidDate = !Number.isNaN(parsedDate.getTime())
          const isSunday = isValidDate && parsedDate.getDay() === 0
          const sundayLunchAvailableForDate =
            isSunday && availabilityData.sundayRoastDates.includes(nextDate)

          newData.sundayLunchAvailable = sundayLunchAvailableForDate

          if (!isSunday || !sundayLunchAvailableForDate) {
            newData.bookingType = 'regular'
            newData.menuSelections = undefined
            newData.menuSummary = undefined
          }
        } else {
          newData.sundayLunchAvailable = false
          newData.bookingType = 'regular'
          newData.menuSelections = undefined
          newData.menuSummary = undefined
        }
      }

      if (data.bookingType === 'sunday_lunch' && !newData.sundayLunchAvailable) {
        newData.bookingType = 'regular'
      }

      if (BOOKING_DEBUG) {
        console.debug('[BookingWizard] New state', newData)
      }
      return newData
    })
  }, [availabilityData])

  const goToStepType = useCallback((stepType: WizardFlowStep) => {
    const index = steps.findIndex(step => step.type === stepType)
    if (index !== -1) {
      goToStep(index + 1)
    }
  }, [steps, goToStep])

  // Handle final submission
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    try {
      // Track submission
      trackFormComplete('booking_wizard')
      
      // Submit booking
      const response = await fetch('/api/booking/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        console.error('Booking failed:', result)
        throw new Error(result.error || 'Booking submission failed')
      }
      
      // Handle payment required for Sunday lunch bookings
      if (result.payment_required && result.payment_details?.payment_url) {
        // Store booking details in localStorage for confirmation page
        if (typeof window !== 'undefined') {
          localStorage.setItem('pendingBooking', JSON.stringify({
            reference: result.reference || result.booking?.reference,
            date: bookingData.date,
            time: bookingData.time,
            partySize: bookingData.partySize,
            menuSelections: bookingData.menuSelections,
            menuSummary: bookingData.menuSummary,
            customerName: `${bookingData.firstName} ${bookingData.lastName}`,
            totalPrice:
              bookingData.menuSummary?.totals.total ??
              (bookingData.menuSelections?.reduce(
                (sum: number, item: any) => sum + (item.price_at_booking || 0),
                0
              ) ?? 0)
          }))
        }
        // Redirect to payment URL
        window.location.href = result.payment_details.payment_url
      } else {
        // Store booking details for confirmation page
        if (typeof window !== 'undefined') {
          localStorage.setItem('completedBooking', JSON.stringify({
            reference: result.reference || result.booking?.reference,
            date: bookingData.date,
            time: bookingData.time,
            partySize: bookingData.partySize,
            menuSelections: bookingData.menuSelections,
            menuSummary: bookingData.menuSummary,
            customerName: `${bookingData.firstName} ${bookingData.lastName}`
          }))
        }
        // Redirect to confirmation page
        router.push(`/booking-confirmation?ref=${result.reference || result.booking?.reference || 'confirmed'}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      trackError('booking_submission', errorMessage)
      console.error('Booking submission error:', error)
      alert('Sorry, there was an error with your booking. Please call us at 01753 682707.')
    } finally {
      setIsSubmitting(false)
    }
  }, [bookingData, router])
  
  // Render current step
  const renderStep = () => {
    switch (currentStepType) {
      case 'plan_visit':
        return (
          <WizardStepPlanVisit
            date={bookingData.date}
            partySize={bookingData.partySize}
            time={bookingData.time}
            availabilityData={availabilityData}
            eventsByDate={eventsByDate}
            sundayLunchAvailable={bookingData.sundayLunchAvailable}
            onNext={(data) => {
              updateBookingData(data)
              goNext()
            }}
          />
        )

      case 'details':
        return (
          <WizardStep5DetailsAndRequirements
            firstName={bookingData.firstName}
            lastName={bookingData.lastName}
            phone={bookingData.phone}
            email={bookingData.email}
            marketingOptIn={bookingData.marketingOptIn}
            specialRequirements={bookingData.specialRequirements}
            bookingType={bookingData.bookingType}
            sundayLunchAvailable={bookingData.sundayLunchAvailable}
            selectedDate={bookingData.date}
            partySize={bookingData.partySize}
            menuSummary={bookingData.menuSummary}
            menuSelections={bookingData.menuSelections}
            onBookingTypeChange={(type) => updateBookingData({ bookingType: type })}
            onMenuSelectionChange={(payload, summary) => {
              updateBookingData({
                menuSelections: payload,
                menuSummary: summary
              })
            }}
            onNext={(details) => {
              updateBookingData(details)
              goNext()
            }}
            onBack={goBack}
          />
        )
      
      case 'confirm':
        return (
          <WizardStep6Confirm
            bookingData={bookingData}
            isSubmitting={isSubmitting}
            onConfirm={handleSubmit}
            onBack={goBack}
            onEdit={goToStepType}
          />
        )

      default:
        return null
    }
  }
  
  return (
    <div ref={wizardRef} className={cn('bg-gradient-to-b from-white to-anchor-cream py-8', className)}>
      {/* Progress Indicator */}
      <WizardProgress
        currentStep={currentStep}
        steps={steps.map(step => step.type)}
      />
      
      {/* Wizard Content */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          {renderStep()}
        </div>
        
        {/* Help Section */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Need help? Call us at{' '}
            <a href="tel:+441753682707" className="text-anchor-green font-medium hover:underline">
              01753 682707
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
