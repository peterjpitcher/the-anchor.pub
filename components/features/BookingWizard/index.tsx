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
import type {
  BookingWizardData,
  AvailabilityData,
  WizardFlowStep
} from './types'

const BOOKING_DEBUG = process.env.NEXT_PUBLIC_BOOKING_DEBUG === 'true'

interface BookingWizardProps {
  availabilityData: AvailabilityData
  initialStep?: number
  preselectedDate?: string
  bookingType?: 'regular' | 'sunday_lunch'
  className?: string
}

interface Step {
  type: WizardFlowStep
  label: string
}

const computeWizardSteps = (data: BookingWizardData): Step[] => {
  const isSunday = data.date ? new Date(data.date).getDay() === 0 : false
  const isSundayLunch = data.bookingType === 'sunday_lunch'

  const steps: Step[] = [{ type: 'date', label: 'Select Date' }]

  if (isSunday) {
    steps.push({ type: 'sunday_offer', label: 'Sunday Options' })
  }

  steps.push({ type: 'party_size', label: 'Party Size' })

  if (isSundayLunch) {
    steps.push({ type: 'menu_selection', label: 'Menu Selection' })
  }

  steps.push({ type: 'time', label: 'Select Time' })
  steps.push({ type: 'details', label: 'Your Details' })
  steps.push({ type: 'confirm', label: 'Confirm' })

  return steps
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

  const initialBookingData: BookingWizardData = {
    date: preselectedDate || '',
    bookingType: initialBookingType || 'regular',
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
  const [steps, setSteps] = useState<Step[]>(() => computeWizardSteps(initialBookingData))
  const [currentStep, setCurrentStep] = useState(() => {
    const clamped = Math.min(Math.max(initialStep, 1), steps.length || 1)
    return clamped
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingData, setBookingData] = useState<BookingWizardData>(initialBookingData)

  const totalSteps = steps.length
  const currentStepType = steps[currentStep - 1]?.type

  useEffect(() => {
    const newSteps = computeWizardSteps(bookingData)
    const existingTypes = steps.map(step => step.type)
    const newTypes = newSteps.map(step => step.type)

    const changed =
      existingTypes.length !== newTypes.length ||
      existingTypes.some((type, index) => type !== newTypes[index])

    if (!changed) {
      return
    }

    const previousType = steps[currentStep - 1]?.type
    const maxIndex = Math.max(newSteps.length - 1, 0)
    let targetIndex = Math.min(currentStep - 1, maxIndex)

    if (previousType) {
      const matchedIndex = newSteps.findIndex(step => step.type === previousType)
      if (matchedIndex !== -1) {
        if (matchedIndex < targetIndex) {
          targetIndex = matchedIndex
        } else if (matchedIndex > targetIndex) {
          // The previous step shifted forward because new steps were inserted ahead of it.
          // Keep the same numerical index so the user lands on the new step instead of skipping it.
          targetIndex = Math.min(targetIndex, maxIndex)
        }
      } else {
        const fallbackMap: Partial<Record<WizardFlowStep, WizardFlowStep>> = {
          sunday_offer: 'party_size',
          menu_selection: 'time'
        }

        const fallbackType =
          fallbackMap[previousType] ||
          newSteps[targetIndex]?.type ||
          newSteps[0]?.type

        const fallbackIndex = fallbackType
          ? newSteps.findIndex(step => step.type === fallbackType)
          : -1

        targetIndex = fallbackIndex !== -1
          ? fallbackIndex
          : Math.min(targetIndex, maxIndex)
      }
    } else {
      targetIndex = Math.min(targetIndex, maxIndex)
    }

    setSteps(newSteps)
    setCurrentStep(targetIndex + 1)
  }, [bookingData, steps, currentStep])
  
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
        const parsedDate = new Date(`${data.date}T12:00:00`)
        const isValidDate = !Number.isNaN(parsedDate.getTime())
        const isSunday = isValidDate ? parsedDate.getDay() === 0 : false

        if (!isSunday) {
          newData.bookingType = 'regular'
          newData.menuSelections = undefined
          newData.menuSummary = undefined
        }
      }

      if (BOOKING_DEBUG) {
        console.debug('[BookingWizard] New state', newData)
      }
      return newData
    })
  }, [])

  const goToStepType = useCallback((stepType: WizardFlowStep) => {
    const index = steps.findIndex(step => step.type === stepType)
    if (index !== -1) {
      goToStep(index + 1)
    }
  }, [steps, goToStep])

  useEffect(() => {
    const hasMenuStep = steps.some(step => step.type === 'menu_selection')
    if (!hasMenuStep && (bookingData.menuSelections || bookingData.menuSummary)) {
      setBookingData(prev => ({
        ...prev,
        menuSelections: undefined,
        menuSummary: undefined
      }))
    }
  }, [steps, bookingData.menuSelections, bookingData.menuSummary])
  
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
            onNext={({ payload, summary }) => {
              updateBookingData({ menuSelections: payload, menuSummary: summary })
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
            bookingType={bookingData.bookingType}
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
