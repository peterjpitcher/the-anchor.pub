'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { WizardStep1Date } from './WizardStep1Date'
import { WizardStep2SundayOffer } from './WizardStep2SundayOffer'
import { WizardStep2bMenuSelection } from './WizardStep2bMenuSelection'
import { WizardStep3PartySize } from './WizardStep3PartySize'
import { WizardStep4Time } from './WizardStep4Time'
import { WizardStep5DetailsAndRequirements } from './WizardStep5DetailsAndRequirements'
import { WizardStep6Confirm } from './WizardStep6Confirm'
import { WizardProgress } from './WizardProgress'
import { trackBookingWizardStep, trackFormComplete, trackError } from '@/lib/gtm-events'
import type { BookingWizardData, AvailabilityData, MenuSelection } from './types'

const BOOKING_DEBUG = process.env.NEXT_PUBLIC_BOOKING_DEBUG === 'true'

interface BookingWizardProps {
  availabilityData: AvailabilityData
  initialStep?: number
  preselectedDate?: string
  bookingType?: 'regular' | 'sunday_lunch'
  className?: string
}

// Define the step flow
type StepType = 'date' | 'sunday_offer' | 'party_size' | 'menu_selection' | 'time' | 'details' | 'confirm'

interface Step {
  type: StepType
  label: string
  condition?: (data: BookingWizardData) => boolean
}

export function BookingWizard({
  availabilityData,
  initialStep = 1,
  preselectedDate,
  bookingType: initialBookingType,
  className
}: BookingWizardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const wizardRef = useRef<HTMLDivElement | null>(null)
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingData, setBookingData] = useState<BookingWizardData>({
    date: preselectedDate || '',
    bookingType: initialBookingType || 'regular',
    menuSelections: undefined,
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
  })
  
  // Check if selected date is Sunday
  const isSunday = bookingData.date ? new Date(bookingData.date).getDay() === 0 : false
  const isSundayLunch = bookingData.bookingType === 'sunday_lunch'
  
  // Define all possible steps with conditions
  const allSteps: Step[] = [
    { type: 'date', label: 'Select Date' },
    { type: 'sunday_offer', label: 'Sunday Options', condition: () => isSunday },
    { type: 'party_size', label: 'Party Size' },
    { type: 'menu_selection', label: 'Menu Selection', condition: () => isSundayLunch },
    { type: 'time', label: 'Select Time' },
    { type: 'details', label: 'Your Details' },
    { type: 'confirm', label: 'Confirm' }
  ]
  
  // Get active steps based on conditions
  const activeSteps = allSteps.filter(step => !step.condition || step.condition(bookingData))
  const totalSteps = activeSteps.length
  
  // Get current step type
  const currentStepType = activeSteps[currentStep - 1]?.type
  
  // Update URL with current step
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
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
    setCurrentStep(step)
    if (wizardRef.current) {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

      wizardRef.current.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'nearest'
      })
    }
  }, [])
  
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
      const newData = { ...prev, ...data }
      if (BOOKING_DEBUG) {
        console.debug('[BookingWizard] New state', newData)
      }
      return newData
    })
  }, [])
  
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
            customerName: `${bookingData.firstName} ${bookingData.lastName}`,
            totalPrice: bookingData.menuSelections?.reduce((sum: number, item: any) => 
              sum + (item.price_at_booking || 0), 0) || 0
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
      case 'date':
        return (
          <WizardStep1Date
            value={bookingData.date}
            availabilityData={availabilityData}
            onNext={(date) => {
              updateBookingData({ date })
              goNext()
            }}
          />
        )
      
      case 'sunday_offer':
        return (
          <WizardStep2SundayOffer
            onSelect={(type) => {
              updateBookingData({ bookingType: type })
              goNext()
            }}
            onBack={goBack}
            selectedDate={bookingData.date}
          />
        )
      
      case 'party_size':
        return (
          <WizardStep3PartySize
            value={bookingData.partySize}
            onNext={(size) => {
              updateBookingData({ partySize: size })
              goNext()
            }}
            onBack={goBack}
          />
        )
      
      case 'menu_selection':
        // Validate that we have a date before showing menu selection
        if (!bookingData.date) {
          console.error('No date set for menu selection step')
          return (
            <div className="text-center py-12">
              <div className="w-12 h-12 text-red-500 mx-auto mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">Date Not Selected</h3>
              <p className="text-gray-600 mb-6">
                Please select a date before choosing your menu.
              </p>
              <button 
                onClick={() => goToStep(1)}
                className="px-6 py-2 bg-anchor-green text-white rounded-lg hover:bg-anchor-green/90 transition-colors"
              >
                Go to Date Selection
              </button>
            </div>
          )
        }
        
        return (
          <WizardStep2bMenuSelection
            partySize={bookingData.partySize}
            date={bookingData.date}
            onNext={(menuSelections) => {
              updateBookingData({ menuSelections: menuSelections as any })
              goNext()
            }}
            onBack={goBack}
          />
        )
      
      case 'time':
        return (
          <WizardStep4Time
            date={bookingData.date}
            partySize={bookingData.partySize}
            availabilityData={availabilityData}
            value={bookingData.time}
            onNext={(time) => {
              updateBookingData({ time })
              goNext()
            }}
            onBack={goBack}
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
            onEdit={(step: number) => goToStep(step)}
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
        totalSteps={totalSteps}
        isSunday={isSunday}
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
