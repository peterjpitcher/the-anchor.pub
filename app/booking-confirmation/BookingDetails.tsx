'use client'

import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import type { MenuSummary } from '@/components/features/BookingWizard/types'
import { pushToDataLayer } from '@/lib/gtm-events'

interface MenuSelection {
  guest_name: string
  menu_item_id: string
  menu_item_name?: string // Add this for display
  item_type: string
  quantity: number
  price_at_booking: number
  special_requests?: string
}

interface BookingData {
  reference: string
  date: string
  time: string
  partySize: number
  menuSummary?: MenuSummary
  menuSelections?: MenuSelection[]
  customerName: string
  totalPrice?: number
}

export function BookingDetails({ bookingRef }: { bookingRef: string }) {
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const hasTrackedRef = useRef(false)
  
  useEffect(() => {
    // Try to get booking data from localStorage
    const pendingData = localStorage.getItem('pendingBooking')
    const completedData = localStorage.getItem('completedBooking')
    
    let data = null
    if (pendingData) {
      data = JSON.parse(pendingData)
      localStorage.removeItem('pendingBooking') // Clean up
    } else if (completedData) {
      data = JSON.parse(completedData)
      localStorage.removeItem('completedBooking') // Clean up
    }
    
    if (data && data.reference === bookingRef) {
      setBookingData(data)
    }
  }, [bookingRef])

  useEffect(() => {
    if (!bookingData || hasTrackedRef.current) return

    const hasPreorder = Boolean(
      bookingData.menuSummary?.guests?.length ||
      (bookingData.menuSelections && bookingData.menuSelections.length > 0)
    )

    const bookingValue = bookingData.menuSummary?.totals?.total || bookingData.totalPrice || undefined

    pushToDataLayer({
      event: 'table_booking_complete',
      booking_reference: bookingData.reference || bookingRef,
      booking_date: bookingData.date,
      booking_time: bookingData.time,
      party_size: bookingData.partySize,
      booking_type: hasPreorder ? 'sunday_roast' : 'standard',
      has_preorder: hasPreorder,
      has_total: Boolean(bookingValue),
      booking_value: bookingValue
    })

    hasTrackedRef.current = true
  }, [bookingData, bookingRef])
  
  if (!bookingData) {
    return null // Don't show anything if no data
  }
  
  // Format date nicely
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const menuSummary: MenuSummary | undefined = bookingData.menuSummary
  const hasMenuSummary = Boolean(menuSummary && menuSummary.guests.length > 0)
  const legacyMenuSelections = Array.isArray(bookingData.menuSelections) ? bookingData.menuSelections : []
  const totalPrice = menuSummary?.totals.total || bookingData.totalPrice || undefined
  
  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-anchor-charcoal mb-4">
          Booking Details
        </h3>
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="text-gray-600">Date:</dt>
            <dd className="font-medium">{formatDate(bookingData.date)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Time:</dt>
            <dd className="font-medium">{bookingData.time}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Party Size:</dt>
            <dd className="font-medium">{bookingData.partySize} {bookingData.partySize === 1 ? 'person' : 'people'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Name:</dt>
            <dd className="font-medium">{bookingData.customerName}</dd>
          </div>
        </dl>
      </div>
      
      {/* Menu Selections (if any) */}
      {hasMenuSummary && menuSummary && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-anchor-charcoal mb-4">
            Pre-Ordered Sunday Roasts
          </h3>
          <div className="space-y-3">
            {menuSummary.guests.map(guest => (
              <div key={guest.guestName} className="border-b border-gray-100 pb-3 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-anchor-charcoal">{guest.guestName}</p>
                    <p className="text-sm text-gray-600 mt-1">{guest.mainName}</p>
                  </div>
                  <span className="font-medium">£{guest.price.toFixed(2)}</span>
                </div>
              </div>
            ))}

            {menuSummary.extras.length > 0 && (
              <div className="pt-3">
                <p className="font-medium text-sm text-gray-700 mb-2">Extras for the table</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  {menuSummary.extras.map(extra => (
                    <li key={extra.name} className="flex justify-between">
                      <span>{extra.name} ×{extra.quantity}</span>
                      <span>£{extra.price.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-lg">
                  £{menuSummary.totals.total.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                <Icon name="info" className="w-4 h-4 inline mr-1" />
                £5 per person deposit has been paid. Remaining balance due on arrival.
              </p>
            </div>
          </div>
        </div>
      )}

      {!hasMenuSummary && legacyMenuSelections.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-anchor-charcoal mb-4">
            Pre-Ordered Sunday Roasts
          </h3>
          <div className="space-y-3">
            {legacyMenuSelections.map((selection: any, index: number) => (
              <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-anchor-charcoal">
                      {selection.guest_name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {selection.menu_item_name || 'Sunday roast main course'}
                    </p>
                  </div>
                  <span className="font-medium">
                    £{selection.price_at_booking?.toFixed?.(2) ?? '0.00'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Important Information */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-semibold text-amber-900 mb-2">
          Important Information
        </h4>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• Please arrive on time for your reservation</li>
          {(hasMenuSummary || legacyMenuSelections.length > 0) && (
            <>
              <li>• Your Sunday roasts have been pre-ordered</li>
              <li>• Menu changes on the day may be limited</li>
            </>
          )}
          <li>• For any changes, please call us at 01753 682707</li>
        </ul>
      </div>
    </div>
  )
}
