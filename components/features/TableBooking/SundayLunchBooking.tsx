'use client'

import { useState, useEffect, useCallback } from 'react'
import { anchorAPI, formatPrice } from '@/lib/api'
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
import { LoadingState } from '@/components/ui/LoadingState'
import { Badge } from '@/components/ui/primitives/Badge'
import { trackTableBookingClick, trackTableBookingFunnel, trackFormComplete, trackError } from '@/lib/gtm-events'
import { logError } from '@/lib/error-handling'
import { SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP, getSundayLunchDepositAmount } from '@/lib/constants'

interface SundayLunchBookingProps {
  className?: string
  onSuccess?: (booking: TableBookingResponse) => void
}

type BookingStep =
  | 'pre-order-info'
  | 'date-selection'
  | 'availability'
  | 'menu'
  | 'details'
  | 'confirmation'

interface BookingState {
  step: BookingStep
  date: string | null
  time: string | null
  partySize: number
  confirmedTime: string | null
}

interface MenuItem {
  id: string
  name: string
  description?: string | null
  price: number
  dietary_info?: string[]
  allergens?: string[]
  is_available?: boolean
}

interface SideItem extends MenuItem {
  included: boolean
}

interface MenuData {
  menu_date: string
  mains: MenuItem[]
  sides: SideItem[]
  cutoff_time?: string
}

interface MenuSelection {
  guest_name: string
  menu_item_id: string
  price_at_booking: number
}

interface SideSelection {
  menu_item_id: string
  quantity: number
  price_at_booking: number
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

// Sunday lunch time slots (1pm to 6pm, every 30 minutes)
const SUNDAY_TIME_SLOTS = [
  { value: '13:00', label: '1:00pm' },
  { value: '13:30', label: '1:30pm' },
  { value: '14:00', label: '2:00pm' },
  { value: '14:30', label: '2:30pm' },
  { value: '15:00', label: '3:00pm' },
  { value: '15:30', label: '3:30pm' },
  { value: '16:00', label: '4:00pm' },
  { value: '16:30', label: '4:30pm' },
  { value: '17:00', label: '5:00pm' },
  { value: '17:30', label: '5:30pm' },
  { value: '18:00', label: '6:00pm' }
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
  const [menu, setMenu] = useState<MenuData | null>(null)
  const [menuLoading, setMenuLoading] = useState(false)
  const [menuError, setMenuError] = useState<string | null>(null)
  const [menuSelections, setMenuSelections] = useState<MenuSelection[]>([])
  const [sideSelections, setSideSelections] = useState<SideSelection[]>([])

  const loadMenu = useCallback(async (date: string, partySize: number) => {
    try {
      setMenuLoading(true)
      setMenuError(null)

      const params = new URLSearchParams()
      params.set('date', date)

      const response = await fetch(`/api/table-bookings/menu/sunday-lunch?${params.toString()}`)
      const payload = await response.json()

      if (!response.ok || payload?.error) {
        setMenuError(payload?.error || 'Unable to load menu. Please try again.')
        setMenu(null)
        return
      }

      const rawMenu = payload.data || payload.menu || payload
      const normalized: MenuData = {
        menu_date: rawMenu.menu_date || date,
        mains: Array.isArray(rawMenu.mains)
          ? rawMenu.mains.map((item: any) => ({
              id: item.id,
              name: item.name,
              description: item.description,
              price: Number(item.price ?? 0),
              dietary_info: item.dietary_info || [],
              allergens: item.allergens || [],
              is_available: item.is_available ?? true
            }))
          : [],
        sides: Array.isArray(rawMenu.sides)
          ? rawMenu.sides.map((item: any) => ({
              id: item.id,
              name: item.name,
              description: item.description,
              price: Number(item.price ?? 0),
              dietary_info: item.dietary_info || [],
              allergens: item.allergens || [],
              included: item.included ?? Number(item.price ?? 0) === 0
            }))
          : [],
        cutoff_time: rawMenu.cutoff_time
      }

      setMenu(normalized)
      setMenuSelections(
        Array.from({ length: partySize }, (_, index) => ({
          guest_name: `Guest ${index + 1}`,
          menu_item_id: '',
          price_at_booking: 0
        }))
      )
      setSideSelections(prev =>
        normalized.sides
          .filter(side => !side.included)
          .map(side => {
            const existing = prev.find(item => item.menu_item_id === side.id)
            return {
              menu_item_id: side.id,
              quantity: existing?.quantity ?? 0,
              price_at_booking: side.price
            }
          })
      )
    } catch (err) {
      setMenuError('Unable to load menu. Please try again.')
      setMenu(null)
    } finally {
      setMenuLoading(false)
    }
  }, [])

  useEffect(() => {
    if (bookingState.step !== 'menu' || !bookingState.date) {
      return
    }

    if (menu && menu.menu_date === bookingState.date) {
      return
    }

    loadMenu(bookingState.date, bookingState.partySize)
  }, [bookingState.step, bookingState.date, bookingState.partySize, loadMenu, menu])

  useEffect(() => {
    setMenuSelections(prev => {
      const updated: MenuSelection[] = Array.from({ length: bookingState.partySize }, (_, index) => {
        const existing = prev[index]
        return {
          guest_name: existing?.guest_name || `Guest ${index + 1}`,
          menu_item_id: existing?.menu_item_id || '',
          price_at_booking: existing?.price_at_booking || 0
        }
      })
      return updated
    })
  }, [bookingState.partySize])

  useEffect(() => {
    if (!menu) {
      setSideSelections([])
      return
    }

    const optionalSides = menu.sides.filter(side => !side.included)
    setSideSelections(prev =>
      optionalSides.map(side => {
        const existing = prev.find(s => s.menu_item_id === side.id)
        return {
          menu_item_id: side.id,
          quantity: existing?.quantity ?? 0,
          price_at_booking: side.price
        }
      })
    )
  }, [menu])

  const updateMenuSelection = (index: number, field: 'guest_name' | 'menu_item_id', value: string) => {
    setMenuSelections(prev => {
      const next = [...prev]
      const current = { ...next[index] }

      if (field === 'guest_name') {
        current.guest_name = value
      } else if (field === 'menu_item_id') {
        current.menu_item_id = value
        const main = menu?.mains.find(item => item.id === value)
        current.price_at_booking = main ? main.price : 0
      }

      next[index] = current
      return next
    })
  }

  const updateSideSelection = (sideId: string, quantity: number) => {
    setSideSelections(prev =>
      prev.map(selection =>
        selection.menu_item_id === sideId
          ? { ...selection, quantity }
          : selection
      )
    )
  }

  const includedSides = menu?.sides.filter(side => side.included) ?? []
  const optionalSides = menu?.sides.filter(side => !side.included) ?? []

  const mainCoursesTotal = menuSelections.reduce((sum, selection) => sum + (selection.price_at_booking || 0), 0)
  const sidesTotal = sideSelections.reduce(
    (sum, side) => sum + side.price_at_booking * (side.quantity || 0),
    0
  )
  const depositAmount = getSundayLunchDepositAmount(bookingState.partySize)
  const totalAmount = mainCoursesTotal + sidesTotal

  const buildMenuPayload = () => {
    if (!menu) return []

    const payload: Array<{
      custom_item_name: string
      item_type: string
      quantity: number
      guest_name: string
      price_at_booking: number
      special_requests?: string
    }> = []

    menuSelections.forEach((selection, index) => {
      if (!selection.menu_item_id) return
      const main = menu.mains.find(item => item.id === selection.menu_item_id)
      if (!main) return

      const guestName = selection.guest_name?.trim() || `Guest ${index + 1}`

      payload.push({
        custom_item_name: main.name,
        item_type: 'main',
        quantity: 1,
        guest_name: guestName,
        price_at_booking: main.price
      })

      includedSides.forEach(side => {
        payload.push({
          custom_item_name: side.name,
          item_type: 'side',
          quantity: 1,
          guest_name: guestName,
          price_at_booking: 0
        })
      })
    })

    sideSelections
      .filter(side => side.quantity > 0)
      .forEach(side => {
        const sideItem = optionalSides.find(item => item.id === side.menu_item_id)
        if (!sideItem) return

        for (let i = 0; i < side.quantity; i++) {
          payload.push({
            custom_item_name: sideItem.name,
            item_type: 'side',
            quantity: 1,
            guest_name: 'Table',
            price_at_booking: sideItem.price
          })
        }
      })

    return payload
  }

  const handleMenuContinue = () => {
    if (!menu) {
      setMenuError('Unable to load menu. Please try again.')
      return
    }

    const missingSelection = menuSelections.some(selection => !selection.menu_item_id)

    if (missingSelection) {
      setMenuError('Please choose a main course for each guest.')
      return
    }

    setMenuError(null)
    setBookingState(prev => ({ ...prev, step: 'details' }))
  }

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
      step: 'menu',
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
      } else if (prev.step === 'menu') {
        return { ...prev, step: 'availability' }
      } else if (prev.step === 'details') {
        return { ...prev, step: 'menu' }
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

    if (!menu) {
      setError('We couldn\'t load the Sunday lunch menu. Please go back and try again.')
      return
    }

    if (menuSelections.some(selection => !selection.menu_item_id)) {
      setError('Please choose a main course for each guest before continuing.')
      return
    }

    const menuPayload = buildMenuPayload()
    if (menuPayload.length === 0) {
      setError('Please choose a main course for each guest before continuing.')
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
        email: customerDetails.email,
        mobile_number: customerDetails.phone,
        sms_opt_in: true
      },
      special_requirements: customerDetails.specialRequirements 
        ? `SUNDAY ROAST PRE-ORDER: ${customerDetails.specialRequirements}`
        : 'SUNDAY ROAST PRE-ORDER',
      dietary_requirements: customerDetails.dietaryRequirements ? [customerDetails.dietaryRequirements] : undefined,
      allergies: customerDetails.allergies ? [customerDetails.allergies] : undefined,
      celebration_type: customerDetails.occasion || 'sunday_roast',
      source: 'website',
      menu_selections: menuPayload
    }

    try {
      const response = await anchorAPI.createTableBooking(bookingData)
      if (response) {
        const bookingStateValue =
          typeof response.state === 'string'
            ? response.state
            : typeof response.status === 'string'
            ? response.status
            : null
        const paymentUrl = response.payment_details?.payment_url || response.next_step_url || null
        const paymentRequired =
          response.payment_required === true ||
          bookingStateValue === 'pending_payment'

        if (paymentRequired) {
          if (!paymentUrl) {
            throw new Error('Your booking is awaiting payment, but we could not generate a secure payment link. Please call us on 01753 682707.')
          }

          if (typeof window !== 'undefined') {
            const bookingDate = response.confirmation_details?.date ?? response.booking_details?.date ?? bookingState.date
            const bookingTime = response.confirmation_details?.time ?? response.booking_details?.time ?? bookingState.confirmedTime
            if (bookingDate && bookingTime) {
              trackTableBookingFunnel({
                step: 'success',
                partySize: bookingState.partySize,
                bookingDate,
                bookingTime,
                bookingReference: response.booking_reference,
                source: 'sunday_lunch_booking',
                deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop'
              })
            }
            window.location.href = paymentUrl
          }
          return
        }

        if (bookingStateValue && bookingStateValue !== 'confirmed') {
          throw new Error('Your booking is awaiting payment and is not confirmed yet. Please call us on 01753 682707.')
        }

        setBookingResponse(response)
        setBookingState(prev => ({ ...prev, step: 'confirmation' }))

        trackFormComplete('Sunday Lunch Booking')
        const bookingDate = response.confirmation_details?.date ?? response.booking_details?.date ?? bookingState.date
        const bookingTime = response.confirmation_details?.time ?? response.booking_details?.time ?? bookingState.confirmedTime
        if (bookingDate && bookingTime) {
          trackTableBookingFunnel({
            step: 'success',
            partySize: bookingState.partySize,
            bookingDate,
            bookingTime,
            bookingReference: response.booking_reference,
            source: 'sunday_lunch_booking',
            deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop'
          })
        }

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
                This ensures we can prepare your meal fresh to order. A £{SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP} per person deposit is deducted from your final bill.
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
                <span>Sunday lunch is served from 1pm to 6pm</span>
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

    case 'menu':
      return (
        <Card variant="elevated" className={className}>
          <CardBody>
	            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="w-full sm:w-auto"
              >
                <Icon name="arrowLeft" className="mr-2" />
                Back
              </Button>
	              <div className="flex items-center gap-3 text-sm text-gray-600">
	                <Badge variant="outline">Deposit {formatPrice(depositAmount)} due today</Badge>
	                <span>Total so far {formatPrice(totalAmount)}</span>
	              </div>
	            </div>

            <h3 className="text-xl font-semibold text-amber-900 mb-2">Choose Your Sunday Lunch</h3>
            <p className="text-sm text-gray-600 mb-6">
              Pick a main course for each guest. Classic sides are included; add optional extras for the table if you like.
            </p>

            {menuLoading && (
              <div className="py-12">
                <LoadingState text="Loading Sunday lunch menu..." />
              </div>
            )}

            {!menuLoading && menuError && (
              <Alert variant="error" className="mb-6">
                <div className="flex items-center justify-between gap-3">
                  <span>{menuError}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      bookingState.date &&
                      loadMenu(bookingState.date, bookingState.partySize)
                    }
                  >
                    Retry
                  </Button>
                </div>
              </Alert>
            )}

            {!menuLoading && menu && !menuError && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {menuSelections.map((selection, index) => {
                    const selectedMain = selection.menu_item_id
                      ? menu.mains.find(item => item.id === selection.menu_item_id)
                      : null

                    return (
                      <div
                        key={`guest-${index}`}
                        className="border border-amber-200 rounded-lg p-4 bg-amber-50/40"
                      >
                        <h4 className="font-semibold text-amber-900 mb-3">
                          Guest {index + 1}
                        </h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium mb-1" htmlFor={`guest-name-${index}`}>
                              Guest name (optional)
                            </label>
                            <input
                              id={`guest-name-${index}`}
                              type="text"
                              value={selection.guest_name}
                              onChange={(event) => updateMenuSelection(index, 'guest_name', event.target.value)}
                              className="w-full border rounded-md px-4 py-2"
                              placeholder={`Guest ${index + 1}`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1" htmlFor={`guest-main-${index}`}>
                              Main course
                            </label>
                            <select
                              id={`guest-main-${index}`}
                              value={selection.menu_item_id}
                              onChange={(event) => updateMenuSelection(index, 'menu_item_id', event.target.value)}
                              className="w-full border rounded-md px-4 py-2"
                              required
                            >
                              <option value="">Select a main</option>
                              {menu.mains
                                .filter(item => item.is_available !== false)
                                .map(item => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                            </select>
	                            {selectedMain && (
	                              <div className="mt-2 text-sm text-gray-600">
	                                <p>{selectedMain.description}</p>
	                                <p className="font-medium mt-1">{formatPrice(selectedMain.price)}</p>
	                              </div>
	                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {optionalSides.length > 0 && (
                  <div className="border border-amber-200 rounded-lg p-4 bg-white">
                    <h4 className="font-semibold text-amber-900 mb-2">Optional extras for the table</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Add extra sides to share. Included sides are already part of each roast.
                    </p>
                    <div className="space-y-3">
                      {optionalSides.map(side => {
                        const selection = sideSelections.find(item => item.menu_item_id === side.id)
                        return (
                          <div key={side.id} className="flex items-start justify-between gap-4">
	                            <div>
	                              <p className="font-medium">{side.name}</p>
	                              <p className="text-sm text-gray-600">{formatPrice(side.price)} each</p>
	                              {side.description && (
	                                <p className="text-sm text-gray-500 mt-1">{side.description}</p>
	                              )}
	                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm" htmlFor={`side-${side.id}`}>Qty</label>
                              <select
                                id={`side-${side.id}`}
                                value={selection?.quantity ?? 0}
                                onChange={(event) => updateSideSelection(side.id, Number(event.target.value))}
                                className="border rounded-md px-3 py-2"
                              >
                                {[0, 1, 2, 3, 4, 5].map(quantity => (
                                  <option key={quantity} value={quantity}>{quantity}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                  <h4 className="font-semibold text-amber-900 mb-2">Order summary</h4>
                  <div className="space-y-2 text-sm text-gray-700">
	                    <div className="flex justify-between">
	                      <span>Main courses</span>
	                      <span>{formatPrice(mainCoursesTotal)}</span>
	                    </div>
	                    {sidesTotal > 0 && (
	                      <div className="flex justify-between">
	                        <span>Extras</span>
	                        <span>{formatPrice(sidesTotal)}</span>
	                      </div>
	                    )}
	                    <div className="flex justify-between pt-2 border-t border-amber-200">
	                      <span className="font-semibold">Total</span>
	                      <span className="font-semibold">{formatPrice(totalAmount)}</span>
	                    </div>
	                    <div className="flex justify-between text-xs text-gray-600">
	                      <span>Deposit due now</span>
	                      <span>{formatPrice(depositAmount)}</span>
	                    </div>
	                    <div className="flex justify-between text-xs text-gray-600">
	                      <span>Balance on arrival</span>
	                      <span>{formatPrice(totalAmount - depositAmount)}</span>
	                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="w-full sm:w-auto"
                  >
                    <Icon name="arrowLeft" className="mr-2" />
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleMenuContinue}
                    className="w-full sm:w-auto"
                    disabled={menuLoading}
                  >
                    Continue to guest details
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
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

          <div className="border border-amber-200 rounded-lg p-4 bg-amber-50 mb-6">
            <h4 className="font-semibold text-amber-900 mb-3">Your menu selections</h4>
            <div className="space-y-2 text-sm text-gray-700">
              {menuSelections.map((selection, index) => {
                const main = selection.menu_item_id
                  ? menu?.mains.find(item => item.id === selection.menu_item_id)
                  : null
                if (!main) {
                  return (
                    <div key={`summary-${index}`}>Guest {index + 1}: Main not selected</div>
                  )
                }

                const guest = selection.guest_name?.trim() || `Guest ${index + 1}`
                return (
                  <div key={`summary-${index}`} className="flex justify-between">
                    <span>{guest}</span>
                    <span>{main.name}</span>
                  </div>
                )
              })}
              {sideSelections.some(side => side.quantity > 0) && (
                <div className="pt-2 border-t border-amber-200">
                  <p className="font-medium">Extras:</p>
                  {sideSelections.filter(side => side.quantity > 0).map(side => {
                    const sideItem = menu?.sides.find(item => item.id === side.menu_item_id)
                    return (
                      <div key={`summary-side-${side.menu_item_id}`} className="flex justify-between">
                        <span>{sideItem?.name}</span>
                        <span>×{side.quantity}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          
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
