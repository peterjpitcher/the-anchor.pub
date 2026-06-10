'use client'

import { useState, useCallback } from 'react'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { Button } from '@/components/ui/primitives/Button'
import { Input, Textarea } from '@/components/ui/primitives/Input'
import { Select } from '@/components/ui/forms/Select'
import { Alert } from '@/components/ui/feedback/Alert'
import { Badge } from '@/components/ui/primitives/Badge'
import { Icon } from '@/components/ui/Icon'
import { trackFormStart, trackFormComplete } from '@/lib/gtm-events'

export interface CustomerDetailsData {
  firstName: string
  lastName: string
  phone: string
  email: string
  specialRequirements?: string
  dietaryRequirements?: string
  allergies?: string
  occasion?: string
}

export interface CustomerDetailsProps {
  date: string
  time: string
  partySize: number
  onSubmit: (details: CustomerDetailsData) => void
  onBack: () => void
  loading?: boolean
  className?: string
}

const OCCASION_OPTIONS = [
  { value: '', label: 'No special occasion' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'date_night', label: 'Date Night' },
  { value: 'business', label: 'Business Meal' },
  { value: 'celebration', label: 'Celebration' },
  { value: 'other', label: 'Other' }
]

export default function CustomerDetails({
  date,
  time,
  partySize,
  onSubmit,
  onBack,
  loading = false,
  className = ''
}: CustomerDetailsProps) {
  const [formData, setFormData] = useState<CustomerDetailsData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    specialRequirements: '',
    dietaryRequirements: '',
    allergies: '',
    occasion: ''
  })
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerDetailsData, string>>>({})
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showAllergenWarning, setShowAllergenWarning] = useState(false)

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  const formatTime = (timeStr: string): string => {
    const [hour, minute] = timeStr.split(':').map(Number)
    const period = hour >= 12 ? 'pm' : 'am'
    const displayHour = hour > 12 ? hour - 12 : hour || 12
    return minute === 0 ? `${displayHour}${period}` : `${displayHour}:${minute.toString().padStart(2, '0')}${period}`
  }

  const validatePhone = (phone: string): boolean => {
    // UK phone number validation
    const cleaned = phone.replace(/[\s-()]/g, '')
    const ukPattern = /^(?:(?:\+44|0044|0)(?:1\d{8,9}|[23]\d{9}|7(?:[1-9]\d{8}|624\d{6})))$/
    return ukPattern.test(cleaned)
  }


  const handleInputChange = (field: keyof CustomerDetailsData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (field === 'email' && typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }))
      }
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    // Show allergen warning when allergies field is filled
    if (field === 'allergies' && typeof value === 'string' && value.trim()) {
      setShowAllergenWarning(true)
    }

    // Track form interaction
    if (!hasInteracted) {
      setHasInteracted(true)
      trackFormStart('Table Booking - Customer Details')
    }
  }

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const newErrors: Partial<Record<keyof CustomerDetailsData, string>> = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Please enter your first name'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Please enter your last name'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Please enter your phone number'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid UK phone number'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // Track completion
    trackFormComplete('Table Booking - Customer Details')
    
    // Submit form
    onSubmit({
      ...formData,
      phone: formData.phone.trim(),
      email: formData.email.trim()
    })
  }, [formData, onSubmit])

  return (
    <Card variant="elevated" className={`bg-anchor-green-card border border-anchor-gold-dark/20 ${className}`}>
      <CardBody>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-anchor-gold-bright mb-2">
            Complete Your Booking
          </h3>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="default">
              <Icon name="calendar" className="mr-1" />
              {formatDate(date)}
            </Badge>
            <Badge variant="default">
              <Icon name="clock" className="mr-1" />
              {formatTime(time)}
            </Badge>
            <Badge variant="default">
              <Icon name="users" className="mr-1" />
              {partySize} {partySize === 1 ? 'person' : 'people'}
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="customer-first-name"
              name="given-name"
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="John"
              error={errors.firstName}
              disabled={loading}
              required
              autoComplete="given-name"
            />

            <Input
              id="customer-last-name"
              name="family-name"
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Smith"
              error={errors.lastName}
              disabled={loading}
              required
              autoComplete="family-name"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="customer-phone"
              name="tel"
              type="tel"
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="07700 900123"
              error={errors.phone}
              helperText={!errors.phone ? "We'll text you a reminder" : undefined}
              disabled={loading}
              required
              autoComplete="tel"
            />
            <Input
              id="customer-email"
              name="email"
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="you@example.com"
              error={errors.email}
              disabled={loading}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="booking-occasion" className="block text-sm font-medium text-anchor-cream-text/70 mb-1">
              Occasion (optional)
            </label>
            <Select
              id="booking-occasion"
              value={formData.occasion || ''}
              onChange={(e) => handleInputChange('occasion', e.target.value)}
              disabled={loading}
              className="w-full"
            >
              <option value="">Select an occasion</option>
              {OCCASION_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>

          <div>
            <Textarea
              id="special-requirements"
              label="Special Requirements (optional)"
              value={formData.specialRequirements || ''}
              onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
              placeholder="Window table, wheelchair access, bringing a cake..."
              rows={2}
              disabled={loading}
              helperText="Any special requests for your visit"
            />
          </div>

          <div>
            <Textarea
              id="dietary-requirements"
              label="Dietary Requirements (optional)"
              value={formData.dietaryRequirements || ''}
              onChange={(e) => handleInputChange('dietaryRequirements', e.target.value)}
              placeholder="e.g., 2 vegetarians, 1 gluten-free"
              rows={2}
              disabled={loading}
              helperText="Please specify any dietary requirements for your party"
            />
          </div>

          <div>
            <Textarea
              id="allergies"
              label="Allergies (optional)"
              value={formData.allergies || ''}
              onChange={(e) => handleInputChange('allergies', e.target.value)}
              placeholder="e.g., 1 person with nut allergy, 1 shellfish allergy"
              rows={2}
              disabled={loading}
              helperText="Please list any allergies in your party"
            />
          </div>

          {showAllergenWarning && formData.allergies && (
            <Alert variant="warning" className="text-sm">
              <Icon name="alert" className="mr-2" />
              <div>
                <strong>Important Allergen Information:</strong>
                <p className="mt-1">
                  All our dishes are prepared in a kitchen where allergens are present. While we take every care to avoid cross-contamination, we cannot guarantee that any dish is completely free from allergens. If you have a severe allergy, please call us on 01753 682707 to discuss your requirements before booking.
                </p>
              </div>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={loading}
              className="flex-1"
            >
              <Icon name="arrowLeft" className="mr-2" />
              Back
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Booking...' : 'Complete Booking'}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}
