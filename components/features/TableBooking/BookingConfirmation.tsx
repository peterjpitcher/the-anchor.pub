'use client'

import { useEffect } from 'react'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { Button } from '@/components/ui/primitives/Button'
import { Alert } from '@/components/ui/feedback/Alert'
import { Badge } from '@/components/ui/primitives/Badge'
import { Icon } from '@/components/ui/Icon'
import { PhoneLink } from '@/components/PhoneLink'
import type { TableBookingResponse } from '@/lib/api'

export interface BookingConfirmationProps {
  booking: TableBookingResponse
  onNewBooking?: () => void
  className?: string
}

export default function BookingConfirmation({
  booking,
  onNewBooking,
  className = ''
}: BookingConfirmationProps) {
  // Play success sound on mount
  useEffect(() => {
    // Optional: Play a subtle success sound
    const audio = new Audio('/sounds/success.mp3')
    audio.volume = 0.3
    audio.play().catch(() => {
      // Ignore if autoplay is blocked
    })
  }, [])

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



  return (
    <Card className={`bg-emerald-500/10 border border-emerald-500/30 ${className}`}>
      <CardBody>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-4">
            <Icon name="check" className="h-8 w-8 text-emerald-300" />
          </div>
          
          <h2 className="text-2xl font-bold text-emerald-300 mb-2">
            Booking Confirmed!
          </h2>
          
          <p className="text-anchor-cream-text/70">
            We'll send you a text confirmation to your phone number
          </p>
        </div>

        <Alert variant="success" className="mb-6">
          <div className="flex items-center justify-between">
            <span className="font-medium">Booking Reference:</span>
            <Badge variant="success">
              {booking.booking_reference}
            </Badge>
          </div>
        </Alert>

        <div className="bg-anchor-green-card rounded-lg border border-anchor-gold-dark/20 p-4 space-y-3 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center text-anchor-cream-text/65">
              <Icon name="calendar" className="mr-2 h-4 w-4" />
              <span className="text-sm">Date</span>
            </div>
            <span className="font-medium">{formatDate(booking.confirmation_details?.date || booking.booking_details?.date || '')}</span>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center text-anchor-cream-text/65">
              <Icon name="clock" className="mr-2 h-4 w-4" />
              <span className="text-sm">Time</span>
            </div>
            <span className="font-medium">{formatTime(booking.confirmation_details?.time || booking.booking_details?.time || '')}</span>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center text-anchor-cream-text/65">
              <Icon name="users" className="mr-2 h-4 w-4" />
              <span className="text-sm">Party Size</span>
            </div>
            <span className="font-medium">
              {booking.confirmation_details?.party_size || booking.booking_details?.party_size} {(booking.confirmation_details?.party_size || booking.booking_details?.party_size) === 1 ? 'person' : 'people'}
            </span>
          </div>
          
          {(booking.confirmation_details?.special_requirements || booking.booking_details?.special_requirements) && (
            <div className="pt-3 border-t border-anchor-gold-dark/15">
              <div className="flex items-start">
                <Icon name="info" className="mr-2 h-4 w-4 text-anchor-cream-text/65 mt-0.5" />
                <div>
                  <span className="text-sm text-anchor-cream-text/65 block mb-1">Special Requirements</span>
                  <span className="text-sm">{booking.confirmation_details?.special_requirements || booking.booking_details?.special_requirements}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {onNewBooking && (
            <Button
              variant="ghost"
              fullWidth
              onClick={onNewBooking}
            >
              Make Another Booking
            </Button>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-emerald-500/20">
          <p className="text-sm text-anchor-cream-text/70 text-center">
            Need to change or cancel your booking? Call us at{' '}
            <PhoneLink
              phone="01753682707"
              source="booking_confirmation"
              className="font-semibold text-emerald-300 underline"
              showIcon={false}
            >
              01753 682707
            </PhoneLink>
          </p>
          
          {booking.cancellation_policy && (
            <p className="text-xs text-anchor-cream-text/55 text-center mt-2">
              {booking.cancellation_policy}
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
