'use client'

import { Icon } from '@/components/ui/Icon'
import { SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP } from '@/lib/constants'

interface WizardStep2SundayOfferProps {
  onSelect: (type: 'regular' | 'sunday_lunch') => void
  onBack: () => void
  selectedDate: string
}

export function WizardStep2SundayOffer({ onSelect, onBack, selectedDate }: WizardStep2SundayOfferProps) {
  // Check if the deadline for Sunday lunch has passed
  // Deadline is Saturday 1pm London time for the following Sunday
  const checkDeadlinePassed = () => {
    if (!selectedDate) return false
    
    const bookingDate = new Date(selectedDate + 'T12:00:00')
    const now = new Date()
    
    // Get the Saturday before the booking (day before Sunday)
    const saturday = new Date(bookingDate)
    saturday.setDate(saturday.getDate() - 1)
    saturday.setHours(13, 0, 0, 0) // 1pm Saturday
    
    // Check if we're past the deadline
    return now > saturday
  }
  
  const isDeadlinePassed = checkDeadlinePassed()
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-anchor-charcoal mb-2">
          Great choice! Sunday is roast day 🍖
        </h2>
        <p className="text-gray-600">
          Would you like to book our famous Sunday roast?
        </p>
      </div>
      
      {/* Deadline Warning */}
      {isDeadlinePassed && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
          <div className="flex gap-3">
            <Icon name="alert" className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 mb-1">
                Sunday Roast Pre-Order Deadline Passed
              </p>
              <p className="text-amber-700">
                Unfortunately, the 1pm Saturday deadline for pre-ordering Sunday roasts has passed. 
                You can still book a table and order from our weekday menu on arrival.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Options */}
      <div className="space-y-4">
        {/* Sunday Roast Option */}
        <button
          type="button"
          onClick={() => onSelect('sunday_lunch')}
          disabled={isDeadlinePassed}
          className={`w-full p-6 rounded-lg border-2 transition-all text-left group ${
            isDeadlinePassed 
              ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60' 
              : 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300 hover:border-amber-400 hover:shadow-lg'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-full group-hover:scale-110 transition-transform">
              <Icon name="utensils" className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-anchor-charcoal mb-2">
                Yes, Sunday Roast Please!
              </h3>
              <p className="text-gray-700 mb-3">
                Roasted chicken, lamb shank, pork belly or vegetarian Wellington with all the trimmings.
                Yorkshire puddings made fresh to order.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-amber-700">
                  <Icon name="check" className="w-4 h-4" />
                  <span>Adults: GBP 19.99-GBP 23.99</span>
                </div>
                <div className="flex items-center gap-2 text-amber-700">
                  <Icon name="info" className="w-4 h-4" />
                  <span>GBP {SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP} per person deposit required (comes off your bill)</span>
                </div>
                <div className="flex items-center gap-2 text-amber-700">
                  <Icon name="clock" className="w-4 h-4" />
                  <span>Must be pre-ordered by 1pm Saturday</span>
                </div>
              </div>
            </div>
          </div>
        </button>
        
        {/* Weekday Menu Option */}
        <button
          type="button"
          onClick={() => onSelect('regular')}
          className="w-full p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all hover:shadow-md text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gray-100 rounded-full group-hover:scale-110 transition-transform">
              <Icon name="bookOpen" className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-anchor-charcoal mb-2">
                No Thanks, Weekday Menu
              </h3>
              <p className="text-gray-700 mb-3">
                Choose from our full menu including burgers, pizzas, salads and more.
                No pre-order required.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Icon name="check" className="w-4 h-4" />
                  <span>Full menu available</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Icon name="check" className="w-4 h-4" />
                  <span>No deposit required</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Icon name="check" className="w-4 h-4" />
                  <span>Order on arrival</span>
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>
      
      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Icon name="info" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Why do we require a deposit for Sunday roasts?</p>
            <p>
              The GBP {SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP} per person deposit ensures we prepare fresh ingredients specifically for your table,
              reducing waste and keeping our prices fair. The deposit comes straight off your final bill.
            </p>
          </div>
        </div>
      </div>
      
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
      </div>
    </div>
  )
}
