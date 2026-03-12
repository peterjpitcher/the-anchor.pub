'use client'

import { Icon } from '@/components/ui/Icon'
import { cn, formatPrice } from '@/lib/utils'
import { SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP, getSundayLunchDepositAmount } from '@/lib/constants'
import type { BookingWizardData, WizardFlowStep } from './types'

interface WizardStep6ConfirmProps {
  bookingData: BookingWizardData
  isSubmitting: boolean
  onConfirm: () => void
  onBack: () => void
  onEdit: (step: WizardFlowStep) => void
}

export function WizardStep6Confirm({ 
  bookingData, 
  isSubmitting,
  onConfirm, 
  onBack,
  onEdit
}: WizardStep6ConfirmProps) {
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    })
  }
  
  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }
  
  // Calculate deposit if Sunday lunch
  const isSundayLunch = bookingData.bookingType === 'sunday_lunch'
  const depositAmount = bookingData.menuSummary?.totals.deposit ?? (isSundayLunch ? getSundayLunchDepositAmount(bookingData.partySize) : 0)
  const menuSummary = bookingData.menuSummary
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-anchor-charcoal mb-2">
          Perfect! Let's confirm your booking
        </h2>
        <p className="text-gray-600">
          Please review your details before confirming
        </p>
      </div>
      
      {/* Booking Summary */}
      <div className="bg-anchor-cream rounded-lg p-6 space-y-4">
        {/* Date & Time */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-600">Date & Time</p>
            <p className="font-semibold text-anchor-charcoal">
              {formatDate(bookingData.date)}
            </p>
            <p className="font-semibold text-anchor-charcoal">
              {formatTime(bookingData.time)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEdit('plan_visit')}
            className="text-sm text-anchor-green hover:underline"
          >
            Edit
          </button>
        </div>
        
        {/* Party Size & Type */}
        <div className="flex justify-between items-start pt-4 border-t border-anchor-gold/20">
          <div>
            <p className="text-sm text-gray-600">Party Size</p>
            <p className="font-semibold text-anchor-charcoal">
              {bookingData.partySize} {bookingData.partySize === 1 ? 'Person' : 'People'}
            </p>
            {isSundayLunch && (
              <p className="text-sm text-amber-700 mt-1">
                <Icon name="utensils" className="inline w-4 h-4 mr-1" />
                Sunday Lunch Booking
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onEdit('plan_visit')}
            className="text-sm text-anchor-green hover:underline"
          >
            Edit
          </button>
        </div>

        {menuSummary && (
          <div className="flex justify-between items-start pt-4 border-t border-anchor-gold/20">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Sunday Lunch Order</p>
              <div className="space-y-1 text-sm text-gray-700">
                {menuSummary.guests.map(guest => (
                  <div key={guest.guestName} className="flex justify-between gap-4">
                    <span>{guest.guestName}</span>
                    <span className="font-medium">{guest.mainName}</span>
                  </div>
                ))}
              </div>
              {menuSummary.extras.length > 0 && (
                <div className="mt-2 text-sm text-gray-700">
	                  <p className="font-medium">Extras for the table</p>
	                  <ul className="list-disc list-inside">
	                    {menuSummary.extras.map(extra => (
	                      <li key={extra.name}>
	                        {extra.name} ×{extra.quantity} — {formatPrice(extra.price, 'GBP')}
	                      </li>
	                    ))}
	                  </ul>
	                </div>
	              )}
	              <div className="mt-2 text-sm text-gray-700 space-y-1">
	                <div className="flex justify-between">
	                  <span>Mains total</span>
	                  <span>{formatPrice(menuSummary.totals.mains, 'GBP')}</span>
	                </div>
	                <div className="flex justify-between">
	                  <span>Extras</span>
	                  <span>{formatPrice(menuSummary.totals.extras, 'GBP')}</span>
	                </div>
	                <div className="flex justify-between font-semibold">
	                  <span>Total</span>
	                  <span>{formatPrice(menuSummary.totals.total, 'GBP')}</span>
	                </div>
	              </div>
            </div>
            <button
              type="button"
              onClick={() => onEdit('details')}
              className="text-sm text-anchor-green hover:underline"
            >
              Edit
            </button>
          </div>
        )}
        
        {/* Contact Details */}
        <div className="flex justify-between items-start pt-4 border-t border-anchor-gold/20">
          <div>
            <p className="text-sm text-gray-600">Contact Details</p>
            <p className="font-semibold text-anchor-charcoal">
              {bookingData.firstName} {bookingData.lastName}
            </p>
            <p className="text-sm text-gray-700">{bookingData.phone}</p>
            {bookingData.email && (
              <p className="text-sm text-gray-700">{bookingData.email}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onEdit('details')}
            className="text-sm text-anchor-green hover:underline"
          >
            Edit
          </button>
        </div>
        
        {/* Special Requirements */}
        {(bookingData.dietaryRequirements.length > 0 || 
          bookingData.allergies || 
          bookingData.occasion || 
          bookingData.specialRequirements) && (
          <div className="flex justify-between items-start pt-4 border-t border-anchor-gold/20">
            <div>
              <p className="text-sm text-gray-600">Special Requirements</p>
              {bookingData.dietaryRequirements.length > 0 && (
                <p className="text-sm text-gray-700">
                  Dietary: {bookingData.dietaryRequirements.join(', ')}
                </p>
              )}
              {bookingData.allergies && (
                <p className="text-sm text-gray-700">
                  Allergies: {bookingData.allergies}
                </p>
              )}
              {bookingData.occasion && (
                <p className="text-sm text-gray-700">
                  Occasion: {bookingData.occasion}
                </p>
              )}
              {bookingData.specialRequirements && (
                <p className="text-sm text-gray-700">
                  Notes: {bookingData.specialRequirements}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onEdit('details')}
              className="text-sm text-anchor-green hover:underline"
            >
              Edit
            </button>
          </div>
        )}
      </div>
      
      {/* Sunday Lunch Deposit Info */}
      {isSundayLunch && depositAmount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
	          <div className="flex gap-3">
	            <Icon name="dollar" className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
	            <div>
	              <p className="font-semibold text-amber-800 mb-1">
	                Deposit Required: {formatPrice(depositAmount, 'GBP')}
	              </p>
	              <p className="text-sm text-amber-700">
	                £{SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP} per person deposit for Sunday roasts. This amount will be deducted from your final bill.
	                The deposit ensures we prepare fresh ingredients specifically for your table.
	              </p>
	            </div>
	          </div>
        </div>
      )}
      
      {/* Terms & Conditions */}
      <div className="border border-gray-200 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            required
            className="mt-1 rounded border-gray-300 text-anchor-green focus:ring-anchor-gold"
          />
          <div className="text-sm">
            <p className="font-medium text-gray-700">I agree to the booking terms</p>
            <p className="text-gray-600 mt-1">
              Tables are held for 15 minutes after the booking time.
              {isSundayLunch && ' Sunday lunch orders must be placed by 1pm Saturday. Deposits are non-refundable within 48 hours of booking.'}
              {' '}For cancellations, please call us at least 2 hours in advance.
            </p>
          </div>
        </label>
      </div>
      
      {/* Important Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Icon name="info" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Good to know</p>
            <ul className="space-y-1">
              <li>• We have 20 free parking spaces available</li>
              <li>• Dogs are welcome throughout the pub</li>
              {isSundayLunch ? (
                <li>• Sunday roasts are served 1pm - 6pm</li>
              ) : (
                <li>• Kitchen hours vary - check our website for current times</li>
              )}
              <li>• Large groups (15+) may be seated across multiple tables</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="text-gray-600 px-6 py-3 hover:text-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Icon name="arrowLeft" className="w-4 h-4" />
          Back
        </button>
        
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className={cn(
            'px-8 py-3 rounded-lg font-medium transition-all flex items-center gap-2',
            isSubmitting
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-anchor-green text-white hover:bg-anchor-green-dark hover:shadow-lg'
          )}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
	          ) : (
	            <>
	              {isSundayLunch
	                ? `Pay ${formatPrice(depositAmount, 'GBP')} & Confirm`
	                : 'Confirm Booking'}
	              <Icon name="check" className="w-4 h-4" />
	            </>
	          )}
	        </button>
      </div>
    </div>
  )
}
