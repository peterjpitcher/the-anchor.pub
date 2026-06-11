'use client'

import { useState, useCallback, useEffect } from 'react'
import { anchorAPI } from '@/lib/api'
import type { TableAvailabilityResponse, TableAvailabilitySlot } from '@/lib/api'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { Button } from '@/components/ui/primitives/Button'
import { Badge } from '@/components/ui/primitives/Badge'
import { Alert } from '@/components/ui/feedback/Alert'
import { LoadingState } from '@/components/ui/LoadingState'
import { Icon } from '@/components/ui/Icon'
import { trackTableBookingClick } from '@/lib/gtm-events'
import { logError } from '@/lib/error-handling'

export interface AvailabilityCheckerProps {
  date: string
  time: string
  partySize: number
  onTimeSelect: (time: string) => void
  onBack: () => void
  className?: string
  bookingType?: 'regular' | 'sunday_lunch'
}

export default function AvailabilityChecker({
  date,
  time,
  partySize,
  onTimeSelect,
  onBack,
  className = '',
  bookingType = 'regular'
}: AvailabilityCheckerProps) {
  const [availability, setAvailability] = useState<TableAvailabilityResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>(time)

  // Check availability
  const checkAvailability = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await anchorAPI.checkTableAvailability({
        date,
        time,
        party_size: partySize,
        duration: 120, // Default 2 hours
        booking_type: bookingType
      })
      
      // Validate response format
      if (!response || !Array.isArray(response.time_slots)) {
        console.error('Invalid availability response:', response)
        setError('Unable to load availability. Please try again.')
        return
      }
      
      
      setAvailability(response)
      
      // If requested time not available, suggest alternatives
      const requestedSlot = response.time_slots.find(slot => slot.time === time)
      if (requestedSlot && (!requestedSlot.available_capacity || requestedSlot.available_capacity === 0) && response.time_slots.some(s => s.available_capacity > 0)) {
        setError(`${time} is not available. Please select from the available times below.`)
      }
    } catch (err: any) {
      logError('table-availability-check', err, { date, time, partySize })
      setError('Unable to check availability. Please try again or call us.')
    } finally {
      setLoading(false)
    }
  }, [date, time, partySize, bookingType])

  useEffect(() => {
    checkAvailability()
  }, [checkAvailability])

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (timeStr: string): string => {
    const [hour, minute] = timeStr.split(':').map(Number)
    const period = hour >= 12 ? 'pm' : 'am'
    const displayHour = hour > 12 ? hour - 12 : hour || 12
    return minute === 0 ? `${displayHour}${period}` : `${displayHour}:${minute.toString().padStart(2, '0')}${period}`
  }

  const handleTimeSelect = (slot: TableAvailabilitySlot) => {
    if (!slot.available_capacity || slot.available_capacity === 0) return
    
    setSelectedTime(slot.time)
    trackTableBookingClick('availability_time_selection')
    onTimeSelect(slot.time)
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardBody>
          <LoadingState text="Checking availability..." />
        </CardBody>
      </Card>
    )
  }

  if (error && !availability) {
    return (
      <Card className={className}>
        <CardBody>
          <Alert variant="error" title="Unable to check availability">
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="mt-4"
            >
              <Icon name="arrowLeft" className="mr-2" />
              Go back
            </Button>
          </Alert>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className={`bg-anchor-green-card border border-anchor-gold-dark/20 ${className}`}>
      <CardBody>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-anchor-gold-bright mb-2">
            Table Availability
          </h3>
          <div className="flex flex-wrap gap-2 text-sm text-anchor-cream-text/70">
            <Badge variant="green">
              <Icon name="calendar" className="mr-1" />
              {formatDate(date)}
            </Badge>
            <Badge variant="green">
              <Icon name="users" className="mr-1" />
              {partySize} {partySize === 1 ? 'person' : 'people'}
            </Badge>
          </div>
        </div>

        {error && (
          <Alert variant="warning" className="mb-4">
            {error}
          </Alert>
        )}

        {availability && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-anchor-cream-text/70 mb-3">
                Available times near {formatTime(time)}:
              </p>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {(availability.time_slots || []).map((slot) => {
                  const isSelected = slot.time === selectedTime
                  const isRequested = slot.time === time
                  const isAvailable = slot.available_capacity > 0
                  
                  return (
                    <Button
                      key={slot.time}
                      variant={isSelected ? 'primary' : isAvailable ? 'outline' : 'ghost'}
                      size="sm"
                      onClick={() => handleTimeSelect(slot)}
                      disabled={!isAvailable}
                      className={`
                        ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
                        ${isRequested && isAvailable ? 'ring-2 ring-amber-500' : ''}
                      `}
                    >
                      {formatTime(slot.time)}
                      {!isAvailable && slot.reason && (
                        <Icon name="close" className="ml-1 h-3 w-3" />
                      )}
                    </Button>
                  )
                })}
              </div>

              {(availability.time_slots || []).filter(s => s.available_capacity > 0).length === 0 && (
                <Alert variant="error" className="mt-4">
                  <strong>No tables available</strong>
                  <p className="mt-1">
                    {availability.message || availability.special_notes || 
                     'Unfortunately, we don\'t have any tables available for your party size on this date. Please try a different date or call us at 01753 682707.'}
                  </p>
                </Alert>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-amber-200">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                <Icon name="arrowLeft" className="mr-2" />
                Change date
              </Button>
              
              {(() => {
                const selectedSlot = selectedTime ? (availability.time_slots || []).find(s => s.time === selectedTime) : null
                return selectedSlot && selectedSlot.available_capacity > 0
              })() && (
                <Button
                  variant="primary"
                  onClick={() => onTimeSelect(selectedTime)}
                  className="flex-1"
                >
                  Continue
                  <Icon name="arrowRight" className="ml-2" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
