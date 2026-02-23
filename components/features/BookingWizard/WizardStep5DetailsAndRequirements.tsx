'use client'

import { useState, useEffect } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Alert } from '@/components/ui/feedback/Alert'
import { SundayMenuSelection } from './WizardStep2bMenuSelection'
import { cn, formatPrice } from '@/lib/utils'
import { SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP, getSundayLunchDepositAmount } from '@/lib/constants'
import type { MenuSelectionPayload, MenuSummary } from './types'

interface WizardStep5DetailsAndRequirementsProps {
  firstName: string
  lastName: string
  phone: string
  email: string
  marketingOptIn: boolean
  specialRequirements: string
  bookingType: 'regular' | 'sunday_lunch'
  sundayLunchAvailable: boolean
  selectedDate: string
  partySize: number
  menuSummary?: MenuSummary
  menuSelections?: MenuSelectionPayload[]
  onBookingTypeChange: (type: 'regular' | 'sunday_lunch') => void
  onMenuSelectionChange: (payload?: MenuSelectionPayload[], summary?: MenuSummary) => void
  onNext: (data: {
    firstName: string
    lastName: string
    phone: string
    email: string
    marketingOptIn: boolean
    specialRequirements: string
    bookingType: 'regular' | 'sunday_lunch'
    menuSelections?: MenuSelectionPayload[]
    menuSummary?: MenuSummary
  }) => void
  onBack: () => void
}

export function WizardStep5DetailsAndRequirements({
  firstName: initialFirstName,
  lastName: initialLastName,
  phone: initialPhone,
  email: initialEmail,
  marketingOptIn: initialMarketingOptIn,
  specialRequirements: initialSpecialRequirements,
  bookingType,
  sundayLunchAvailable,
  selectedDate,
  partySize,
  menuSummary,
  menuSelections,
  onBookingTypeChange,
  onMenuSelectionChange,
  onNext,
  onBack
}: WizardStep5DetailsAndRequirementsProps) {
  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [phone, setPhone] = useState(initialPhone)
  const [email, setEmail] = useState(initialEmail)
  const [marketingOptIn, setMarketingOptIn] = useState(initialMarketingOptIn ?? true)
  const [specialRequirements, setSpecialRequirements] = useState(initialSpecialRequirements || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [menuValid, setMenuValid] = useState(!!menuSummary)
  const [localMenuSummary, setLocalMenuSummary] = useState<MenuSummary | undefined>(menuSummary)
  const [localMenuSelections, setLocalMenuSelections] = useState<MenuSelectionPayload[] | undefined>(menuSelections)

  useEffect(() => {
    setLocalMenuSummary(menuSummary)
    setLocalMenuSelections(menuSelections)
    setMenuValid(bookingType === 'sunday_lunch' ? !!menuSummary : true)
  }, [menuSummary, menuSelections, bookingType])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[\d\s+()-]+$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = () => {
    if (validateForm()) {
      if (bookingType === 'sunday_lunch' && canPreOrder && !menuValid) {
        setErrors(prev => ({
          ...prev,
          menu: 'Please choose a roast for every guest.'
        }))
        return
      }

      onNext({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        marketingOptIn,
        specialRequirements,
        bookingType: canPreOrder ? bookingType : 'regular',
        menuSelections: bookingType === 'sunday_lunch' ? localMenuSelections : undefined,
        menuSummary: bookingType === 'sunday_lunch' ? localMenuSummary : undefined
      })
    }
  }

  const isSunday = selectedDate
    ? new Date(selectedDate + 'T12:00:00').getDay() === 0
    : false

  const sundayDeadlinePassed = (() => {
    if (!selectedDate) return false
    const bookingDate = new Date(selectedDate + 'T12:00:00')
    const saturday = new Date(bookingDate)
    saturday.setDate(saturday.getDate() - 1)
    saturday.setHours(13, 0, 0, 0)
    return new Date() > saturday
  })()

  const canPreOrder = sundayLunchAvailable && isSunday && !sundayDeadlinePassed
  const depositAmount = getSundayLunchDepositAmount(partySize)

  const handleSelectBookingType = (type: 'regular' | 'sunday_lunch') => {
    if (type === 'sunday_lunch' && !canPreOrder) {
      return
    }
    onBookingTypeChange(type)
    if (type === 'regular') {
      setLocalMenuSelections(undefined)
      setLocalMenuSummary(undefined)
      onMenuSelectionChange(undefined, undefined)
      setMenuValid(true)
    } else {
      setMenuValid(!!menuSummary)
    }
  }

  const handleMenuChange = (payload: MenuSelectionPayload[], summary: MenuSummary) => {
    setLocalMenuSelections(payload)
    setLocalMenuSummary(summary)
    onMenuSelectionChange(payload, summary)
    setMenuValid(true)
  }

  const handleMenuValidity = (isValid: boolean) => {
    setMenuValid(isValid)
    if (!isValid) {
      setLocalMenuSelections(undefined)
      setLocalMenuSummary(undefined)
      onMenuSelectionChange(undefined, undefined)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-anchor-charcoal mb-2">
          Your Details
        </h2>
        <p className="text-gray-600">
          Please provide your contact information
        </p>
      </div>

      {isSunday && (
        <div className="space-y-4 border border-amber-200 rounded-lg p-4 bg-amber-50/40">
	          <div className="flex items-center justify-between flex-wrap gap-3">
	            <div>
	              <h3 className="text-lg font-semibold text-anchor-charcoal">Sunday options</h3>
		              <p className="text-sm text-gray-600">
		                Pre-order to guarantee roasts and pay the GBP {SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP}pp deposit online. This deposit is deducted from your final bill.
		              </p>
	            </div>
	            <div className="text-sm text-amber-800 font-medium">
	              Deposit today: {formatPrice(depositAmount, 'GBP')}
	            </div>
	          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => handleSelectBookingType('sunday_lunch')}
              disabled={!canPreOrder}
              className={cn(
                'text-left border rounded-lg p-4 transition-all',
                bookingType === 'sunday_lunch'
                  ? 'border-amber-400 bg-white shadow-sm'
                  : 'border-dashed border-amber-200 bg-amber-50/60',
                !canPreOrder && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon name="utensils" className="w-5 h-5 text-amber-700" />
                <p className="font-semibold text-anchor-charcoal">Pre-order Sunday roast</p>
              </div>
              <p className="text-sm text-gray-700">
                Choose everyone&apos;s roast now and pay the deposit. We&apos;ll have everything ready.
              </p>
              {sundayDeadlinePassed && (
                <p className="text-sm text-amber-700 mt-2">
                  Pre-orders close 1pm on Saturday.
                </p>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSelectBookingType('regular')}
              className={cn(
                'text-left border rounded-lg p-4 transition-all',
                bookingType === 'regular'
                  ? 'border-anchor-green bg-white shadow-sm'
                  : 'border-dashed border-gray-200 bg-gray-50'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon name="bookOpen" className="w-5 h-5 text-anchor-green" />
                <p className="font-semibold text-anchor-charcoal">Book weekday menu</p>
              </div>
              <p className="text-sm text-gray-700">
                Keep your booking and choose from the main menu on the day (no deposit needed).
              </p>
            </button>
          </div>

          {bookingType === 'sunday_lunch' && canPreOrder && (
            <div className="space-y-4 mt-4">
              <div className="bg-white border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-900 mb-1">Roast pre-order</h4>
                <p className="text-sm text-gray-700 mb-4">
                  Pick a roast for every guest and add optional extras for the table.
                </p>
                <SundayMenuSelection
                  partySize={partySize}
                  date={selectedDate}
                  existingSummary={menuSummary}
                  onChange={handleMenuChange}
                  onValidityChange={handleMenuValidity}
                />
                {errors.menu && (
                  <p className="text-red-500 text-sm mt-2">{errors.menu}</p>
                )}
              </div>
            </div>
          )}

          {!canPreOrder && sundayLunchAvailable && (
            <Alert variant="warning">
              <p className="font-semibold text-amber-900 mb-1">
                Sunday roast pre-orders close at 1pm on Saturday.
              </p>
              <p className="text-sm text-amber-800">
                We&apos;ll reserve you a table from the weekday menu instead. Call us if you need to check availability.
              </p>
            </Alert>
          )}
        </div>
      )}

      {/* Contact Details Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-anchor-charcoal">Contact Information</h3>
        
        {/* Name Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-anchor-green ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-anchor-green ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Smith"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-anchor-green ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="07700 900000"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-anchor-green ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="john.smith@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            We'll send your confirmation and payment details here
          </p>
        </div>

        {/* Marketing Opt-in */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="marketingOptIn"
            checked={marketingOptIn}
            onChange={(e) => setMarketingOptIn(e.target.checked)}
            className="mt-1 w-4 h-4 text-anchor-green border-gray-300 rounded focus:ring-anchor-green"
          />
          <label htmlFor="marketingOptIn" className="text-sm text-gray-700">
            Yes, I'd like to receive special offers and updates from The Anchor
          </label>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-gray-200" />

      {/* Special Requirements Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-anchor-charcoal">Special Requirements</h3>
        
        {/* Allergen Warning */}
        <Alert variant="warning">
          <p className="font-semibold text-amber-900 mb-1">
            Important Allergen Information
          </p>
          <p className="text-sm text-amber-800">
            Items are prepared in a single kitchen, and while we take great care, 
            we cannot guarantee allergen cross-contamination.
          </p>
        </Alert>

        {/* Special Requirements Text Area */}
        <div>
          <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700 mb-1">
            Special Requirements or Dietary Needs (Optional)
          </label>
          <textarea
            id="specialRequirements"
            value={specialRequirements}
            onChange={(e) => setSpecialRequirements(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-anchor-green"
            placeholder="Please let us know about any dietary requirements, allergies, or special requests..."
          />
          <p className="text-sm text-gray-500 mt-1">
            For example: wheelchair access, high chair needed, birthday celebration, etc.
          </p>
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
        <button
          type="button"
          onClick={handleContinue}
          className="bg-anchor-green text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          Continue
          <Icon name="arrowRight" className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
