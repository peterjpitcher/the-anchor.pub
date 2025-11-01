'use client'

import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Alert } from '@/components/ui/feedback/Alert'

interface WizardStep5DetailsAndRequirementsProps {
  firstName: string
  lastName: string
  phone: string
  email: string
  marketingOptIn: boolean
  specialRequirements: string
  onNext: (data: {
    firstName: string
    lastName: string
    phone: string
    email: string
    marketingOptIn: boolean
    specialRequirements: string
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
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = () => {
    if (validateForm()) {
      onNext({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        marketingOptIn,
        specialRequirements
      })
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
