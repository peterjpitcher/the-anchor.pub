'use client'

import { useState, useEffect, useCallback } from 'react'
import { DatePicker, Select, Button, ErrorDisplay } from '@/components/ui'
import { getBusinessHours, BusinessHours, isKitchenClosed } from '@/lib/api'
import { trackTableBookingClick, trackFormStart } from '@/lib/gtm-events'

export interface BookingDatePickerProps {
  onDateTimeSelect: (date: string, time: string, partySize: number) => void
  minDate?: Date
  maxDate?: Date
  defaultPartySize?: number
  className?: string
}

// Format time for display (HH:mm to h:mm am/pm)
const formatTime = (time: string): string => {
  const [hour, minute] = time.split(':').map(Number)
  const period = hour >= 12 ? 'pm' : 'am'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minute.toString().padStart(2, '0')}${period}`
}

// Party size options - limited to 6 for immediate confirmation
const PARTY_SIZE_OPTIONS = [
  { value: '1', label: '1 person' },
  { value: '2', label: '2 people' },
  { value: '3', label: '3 people' },
  { value: '4', label: '4 people' },
  { value: '5', label: '5 people' },
  { value: '6', label: '6 people' },
  { value: '7+', label: '7+ people (call us)' }
]

export default function BookingDatePicker({
  onDateTimeSelect,
  minDate = new Date(),
  maxDate,
  defaultPartySize = 2,
  className = ''
}: BookingDatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [partySize, setPartySize] = useState<string>(defaultPartySize.toString())
  const [businessHours, setBusinessHours] = useState<BusinessHours | null>(null)
  const [loadingHours, setLoadingHours] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{ value: string; label: string }[]>([])
  const [kitchenMessage, setKitchenMessage] = useState<string | null>(null)

  // Fetch business hours
  useEffect(() => {
    async function fetchHours() {
      try {
        const hours = await getBusinessHours()
        setBusinessHours(hours)
      } catch (err) {
        console.error('Failed to fetch business hours:', err)
        setError('Unable to load opening hours')
      } finally {
        setLoadingHours(false)
      }
    }
    fetchHours()
  }, [])

  // Get kitchen hours message for selected date
  const getKitchenMessage = useCallback((dateStr: string): string | null => {
    if (!dateStr || !businessHours) return null

    const date = new Date(dateStr)
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    
    // Check for special hours first
    const specialDay = businessHours.specialHours?.find(sh => sh.date === dateStr)
    if (specialDay) {
      if (specialDay.is_closed || specialDay.status === 'closed') {
        return specialDay.note || 'Closed for special event'
      }
      if (specialDay.kitchen && isKitchenClosed(specialDay.kitchen)) {
        return 'Kitchen closed but bar is open for drinks'
      }
    }
    
    const dayHours = businessHours.regularHours[dayOfWeek]
    
    if (!dayHours) return 'No service today'
    
    if (dayHours.is_closed) {
      return 'Closed today'
    }
    
    if (!dayHours.kitchen) {
      return dayOfWeek === 'monday' ? 'No kitchen service on Mondays (bar open)' : 'No kitchen service'
    }
    
    return null
  }, [businessHours])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time')
      return
    }

    if (partySize === '7+') {
      setError('For parties larger than 6, please call us at 01753 682707 to discuss your requirements and confirm availability.')
      return
    }

    onDateTimeSelect(selectedDate, selectedTime, parseInt(partySize))
  }

  const handleFormInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true)
      trackFormStart('Table Booking - Date Selection')
    }
  }

  // Fetch available time slots when date and party size change
  useEffect(() => {
    if (!selectedDate || !partySize || partySize === '7+') {
      setAvailableTimeSlots([])
      return
    }

    async function fetchAvailableSlots() {
      setLoadingSlots(true)
      setError(null)
      setKitchenMessage(null)
      
      try {
        const response = await fetch(`/api/table-bookings/availability?date=${selectedDate}&party_size=${partySize}&booking_type=regular`)
        const data = await response.json()
        
        if (!response.ok) {
          if (data.error) {
            setError(data.error.message || 'Unable to check availability')
          }
          setAvailableTimeSlots([])
          return
        }
        
        // Handle the API response
        if (data.success === false && data.error) {
          setError(data.error.message)
          setAvailableTimeSlots([])
          return
        }
        
        // Extract the actual data
        const availabilityData = data.success && data.data ? data.data : data
        
        if (!availabilityData.available) {
          // Set kitchen message if no availability
          const message = getKitchenMessage(selectedDate) || availabilityData.message || 'No table bookings available for this date'
          setKitchenMessage(message)
          setAvailableTimeSlots([])
          return
        }
        
        // Format time slots from API
        const slots = availabilityData.time_slots
          ?.filter((slot: any) => slot.available || slot.available_capacity > 0)
          ?.map((slot: any) => ({
            value: slot.time,
            label: formatTime(slot.time)
          })) || []
        
        setAvailableTimeSlots(slots)
        
        // Reset time selection if it's no longer valid
        if (selectedTime && !slots.find((s: any) => s.value === selectedTime)) {
          setSelectedTime('')
        }
      } catch (err) {
        console.error('Failed to fetch available slots:', err)
        setError('Unable to check availability. Please try again.')
        setAvailableTimeSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchAvailableSlots()
  }, [selectedDate, partySize, getKitchenMessage, selectedTime])

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <DatePicker
            id="booking-date"
            label="Select Date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value)
              setError(null)
              handleFormInteraction()
            }}
            minDate={minDate.toISOString().split('T')[0]}
            maxDate={maxDate?.toISOString().split('T')[0]}
            disabled={loadingHours}
            error={error && !selectedTime ? 'Please select a date' : undefined}
          />
        </div>

        <div>
          <label htmlFor="booking-time" className="block text-sm font-medium text-gray-700 mb-1">
            Select Time
          </label>
          <Select
            id="booking-time"
            value={selectedTime}
            onChange={(e) => {
              setSelectedTime(e.target.value)
              setError(null)
              handleFormInteraction()
            }}
            disabled={!selectedDate || loadingHours || loadingSlots}
            error={!!(error && selectedDate && !selectedTime)}
          >
            <option value="">Choose a time</option>
            {loadingSlots ? (
              <option disabled>Loading available times...</option>
            ) : availableTimeSlots.length === 0 && selectedDate ? (
              <option disabled>No times available</option>
            ) : (
              availableTimeSlots.map(slot => (
                <option key={slot.value} value={slot.value}>{slot.label}</option>
              ))
            )}
          </Select>
        </div>
      </div>
      
      {/* Show prominent message when no times available */}
      {selectedDate && !loadingSlots && availableTimeSlots.length === 0 && kitchenMessage && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900 font-medium">
            {kitchenMessage}
          </p>
          {kitchenMessage.toLowerCase().includes('monday') && (
            <p className="text-sm text-amber-700 mt-1">
              The bar is open for drinks. Call us at <a href="tel:+441753682707" className="font-medium underline">01753 682707</a> for drinks-only reservations.
            </p>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="party-size" className="block text-sm font-medium text-gray-700 mb-1">
            Party Size
          </label>
          <Select
            id="party-size"
            value={partySize}
            onChange={(e) => {
              setPartySize(e.target.value)
              handleFormInteraction()
            }}
            disabled={loadingHours}
          >
            {PARTY_SIZE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          {partySize === '7+' && (
            <p className="mt-1 text-sm text-gray-600">
              Please call us at 01753 682707 for larger parties
            </p>
          )}
        </div>

        <div className="flex items-end">
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={!selectedDate || !selectedTime || loadingHours || loadingSlots || partySize === '7+'}
            onClick={() => {
              trackTableBookingClick('booking_date_picker')
            }}
          >
            Continue to Details
          </Button>
        </div>
      </div>

      {error && <ErrorDisplay message={error} />}
    </form>
  )
}
