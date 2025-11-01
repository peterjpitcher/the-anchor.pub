'use client'

import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import type { WizardStepProps } from './types'

interface WizardStep5DetailsProps extends WizardStepProps {
  firstName: string
  lastName: string
  phone: string
  email: string
  marketingOptIn?: boolean
  onNext: (details: {
    firstName: string
    lastName: string
    phone: string
    email: string
    marketingOptIn: boolean
  }) => void
  onBack: () => void
}

export function WizardStep5Details({ 
  firstName: initialFirstName,
  lastName: initialLastName,
  phone: initialPhone,
  email: initialEmail,
  marketingOptIn: initialMarketingOptIn,
  onNext, 
  onBack 
}: WizardStep5DetailsProps) {
  const [firstName, setFirstName] = useState(initialFirstName || '')
  const [lastName, setLastName] = useState(initialLastName || '')
  const [phone, setPhone] = useState(initialPhone || '')
  const [email, setEmail] = useState(initialEmail || '')
  const [marketingOptIn, setMarketingOptIn] = useState(initialMarketingOptIn ?? true) // Default to true
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
    } else if (!/^[0-9+\-\s()]+$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = () => {
    if (validateForm()) {
      onNext({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        marketingOptIn
      })
    }
  }
  
  // Format phone number as user types
  const handlePhoneChange = (value: string) => {
    // Remove any non-digit characters for validation
    const cleaned = value.replace(/\D/g, '')
    
    // Format UK phone number
    if (cleaned.startsWith('44')) {
      // International format
      setPhone(value)
    } else if (cleaned.startsWith('0')) {
      // UK format
      setPhone(value)
    } else {
      setPhone(value)
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-anchor-charcoal mb-2">
          Let's get your details
        </h2>
        <p className="text-gray-600">
          We'll need these to confirm your booking
        </p>
      </div>
      
      {/* Form */}
      <div className="space-y-4">
        {/* Name Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-anchor-gold ${
                errors.firstName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>
          
          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-anchor-gold ${
                errors.lastName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Smith"
            />
            {errors.lastName && (
              <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>
        
        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <div className="relative">
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              autoComplete="tel"
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-anchor-gold ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="07700 900000"
            />
            <Icon name="phone" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          {errors.phone && (
            <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            We'll send you a booking confirmation via SMS
          </p>
        </div>
        
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-anchor-gold ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="john.smith@example.com"
            />
            <Icon name="mail" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            We use this to send your confirmation and payment details
          </p>
        </div>
      </div>
      
      {/* Privacy Notice */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex gap-3">
          <Icon name="shield" className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">Your information is safe</p>
            <p>
              We'll only use your details for this booking and won't share them with third parties.
              You can opt-in to receive special offers and updates below.
            </p>
          </div>
        </div>
      </div>
      
      {/* Marketing Opt-in */}
      <div className="border border-gray-200 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={marketingOptIn}
            onChange={(e) => setMarketingOptIn(e.target.checked)}
            className="mt-1 rounded border-gray-300 text-anchor-green focus:ring-anchor-gold"
          />
          <div className="text-sm">
            <p className="font-medium text-gray-700">Keep me updated</p>
            <p className="text-gray-600">
              Get exclusive offers, event announcements, and updates about The Anchor
            </p>
          </div>
        </label>
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
          onClick={handleSubmit}
          className="bg-anchor-green text-white px-8 py-3 rounded-lg font-medium hover:bg-anchor-green-dark transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
