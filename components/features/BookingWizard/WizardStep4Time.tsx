'use client'

import { useState, useEffect, useCallback } from 'react'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'
import type { WizardStepProps, AvailabilityData, TimeSlot } from './types'

interface WizardStep4TimeProps extends WizardStepProps {
  date: string
  partySize: number
  availabilityData: AvailabilityData
  value: string
  bookingType: 'regular' | 'sunday_lunch'
  onNext: (time: string) => void
  onBack: () => void
}

export function WizardStep4Time({ 
  date, 
  partySize, 
  availabilityData, 
  value, 
  bookingType,
  onNext, 
  onBack 
}: WizardStep4TimeProps) {
  const [selectedTime, setSelectedTime] = useState(value || '')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const fetchAvailability = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        date,
        party_size: String(partySize)
      })

      if (bookingType) {
        params.set('booking_type', bookingType)
      }

      const response = await fetch(
        `/api/table-bookings/availability?${params.toString()}`
      )
      const data = await response.json()
      
      if (data.success && data.data.time_slots) {
        setTimeSlots(
          data.data.time_slots.map((slot: any) => {
            const availableCapacity =
              typeof slot.available_capacity === 'number'
                ? slot.available_capacity
                : typeof slot.tables_available === 'number'
                  ? slot.tables_available
                  : typeof slot.remaining === 'number'
                    ? slot.remaining
                    : 0

            const isAvailable =
              typeof slot.available === 'boolean'
                ? slot.available
                : availableCapacity > 0

            return {
              time: slot.time,
              available: isAvailable,
              busy: isAvailable && availableCapacity <= 2,
              remaining: availableCapacity
            }
          })
        )
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error)
      setError('Unable to load available times. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [date, partySize, bookingType])
  
  // Get available times for selected date
  useEffect(() => {
    const dayData = availabilityData.days.find(d => d.date === date)
    if (dayData) {
      let slots = dayData.times || []
      
      // Filter out past times if the selected date is today
      const now = new Date()
      const selectedDate = new Date(date + 'T00:00:00')
      const isToday = selectedDate.toDateString() === now.toDateString()
      
      if (isToday) {
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()
        
        slots = slots.filter(slot => {
          const [slotHour, slotMinute] = slot.time.split(':').map(Number)
          // Add 30 minutes buffer for booking time
          const slotTimeInMinutes = slotHour * 60 + slotMinute
          const currentTimeInMinutes = currentHour * 60 + currentMinute + 30 // 30 min buffer
          return slotTimeInMinutes > currentTimeInMinutes
        })
      }
      
      setTimeSlots(slots)
    } else {
      // Fallback: fetch availability if not pre-loaded
      fetchAvailability()
    }
  }, [date, partySize, availabilityData.days, fetchAvailability])
  
  const handleTimeSelect = (time: string, available: boolean) => {
    if (!available) return
    setSelectedTime(time)
    setError('')
  }
  
  const handleSubmit = () => {
    if (!selectedTime) {
      setError('Please select a time')
      return
    }
    onNext(selectedTime)
  }
  
  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }
  
  // Group times by period
  const groupTimesByPeriod = () => {
    const lunch: TimeSlot[] = []
    const afternoon: TimeSlot[] = []
    const dinner: TimeSlot[] = []
    const evening: TimeSlot[] = []
    
    timeSlots.forEach(slot => {
      const hour = parseInt(slot.time.split(':')[0])
      if (hour < 14) lunch.push(slot)
      else if (hour < 17) afternoon.push(slot)
      else if (hour < 19) dinner.push(slot)
      else evening.push(slot)
    })
    
    return { lunch, afternoon, dinner, evening }
  }
  
  const periods = groupTimesByPeriod()
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-anchor-charcoal mb-2">
          What time works best for you?
        </h2>
        <p className="text-gray-600">
          Select your preferred arrival time
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(date + 'T12:00:00').toLocaleDateString('en-GB', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })} • {partySize} {partySize === 1 ? 'person' : 'people'}
        </p>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-anchor-green"></div>
          <p className="text-sm text-gray-600 mt-2">Loading available times...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Lunch Times */}
          {periods.lunch.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Lunch (12pm - 2pm)</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {periods.lunch.map(slot => (
                  <TimeSlotButton
                    key={slot.time}
                    slot={slot}
                    selected={selectedTime === slot.time}
                    onSelect={handleTimeSelect}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Afternoon Times */}
          {periods.afternoon.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Afternoon (2pm - 5pm)</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {periods.afternoon.map(slot => (
                  <TimeSlotButton
                    key={slot.time}
                    slot={slot}
                    selected={selectedTime === slot.time}
                    onSelect={handleTimeSelect}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Dinner Times */}
          {periods.dinner.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Dinner (5pm - 7pm)</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {periods.dinner.map(slot => (
                  <TimeSlotButton
                    key={slot.time}
                    slot={slot}
                    selected={selectedTime === slot.time}
                    onSelect={handleTimeSelect}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Evening Times */}
          {periods.evening.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Evening (7pm onwards)</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {periods.evening.map(slot => (
                  <TimeSlotButton
                    key={slot.time}
                    slot={slot}
                    selected={selectedTime === slot.time}
                    onSelect={handleTimeSelect}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Selected Time Display */}
      {selectedTime && (
        <div className="bg-anchor-cream rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Selected time:</p>
          <p className="text-lg font-semibold text-anchor-green">
            {formatTime(selectedTime)}
          </p>
        </div>
      )}
      
      {/* No availability message */}
      {!loading && timeSlots.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Icon name="alert" className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">No times available</p>
              <p>
                We don't have any tables available for this date and party size.
                Please try a different date or call us for assistance.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {/* Actions */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-gray-600 px-6 py-3 hover:text-gray-800 transition-colors flex items-center gap-2"
        >
          <Icon name="arrowLeft" className="w-4 h-4" />
          Back
        </button>
        
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedTime}
          className={cn(
            'px-8 py-3 rounded-lg font-medium transition-colors',
            selectedTime
              ? 'bg-anchor-green text-white hover:bg-anchor-green-dark'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

// Time slot button component
function TimeSlotButton({ 
  slot, 
  selected, 
  onSelect, 
  formatTime 
}: {
  slot: TimeSlot
  selected: boolean
  onSelect: (time: string, available: boolean) => void
  formatTime: (time: string) => string
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(slot.time, slot.available)}
      disabled={!slot.available}
      className={cn(
        'relative py-3 px-4 rounded-lg font-medium transition-all text-sm',
        selected && 'bg-anchor-green text-white',
        !selected && slot.available && 'bg-white border border-gray-200 hover:border-anchor-gold hover:bg-anchor-cream',
        !slot.available && 'bg-gray-100 text-gray-400 cursor-not-allowed',
        slot.busy && slot.available && !selected && 'border-amber-300 bg-amber-50'
      )}
    >
      {formatTime(slot.time)}
      {slot.busy && slot.available && (
        <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
          Busy
        </span>
      )}
      {!slot.available && (
        <Icon name="close" className="absolute top-1 right-1 w-3 h-3" />
      )}
    </button>
  )
}
