'use client'

import { useState, useRef, useCallback, type FormEvent, type ChangeEvent } from 'react'
import Link from 'next/link'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { Button } from '@/components/ui/primitives/Button'
import { Input, Textarea } from '@/components/ui/primitives/Input'
import { Select } from '@/components/ui/forms/Select'
import { TurnstileField, type TurnstileFieldRef } from '@/components/security/TurnstileField'
import { trackFormStart, trackFormComplete } from '@/lib/gtm-events'
import {
  CAREERS_CV_MAX_BYTES,
  CAREERS_CV_ALLOWED_EXTENSIONS,
  CAREERS_FORM_ROLES,
} from '@/lib/careers'

type CareersFormProps = {
  defaultRole?: 'bar-staff' | 'kitchen-team' | 'either'
}

type FormErrors = {
  name?: string
  email?: string
  phone?: string
  role?: string
  experience?: string
  cv?: string
  consent?: string
}

const ROLE_OPTIONS: { value: (typeof CAREERS_FORM_ROLES)[number]; label: string }[] = [
  { value: 'bar-staff', label: 'Bar Staff' },
  { value: 'kitchen-team', label: 'Kitchen Team' },
  { value: 'either', label: 'Either' },
]

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1) return ''
  return filename.slice(lastDot).toLowerCase()
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function CareersForm({ defaultRole }: CareersFormProps) {
  // Form field state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<string>(defaultRole ?? '')
  const [experience, setExperience] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [consent, setConsent] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  // UI state
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})

  // Refs
  const mountTimeRef = useRef(Date.now())
  const formStartedRef = useRef(false)
  const turnstileRef = useRef<TurnstileFieldRef>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const trackInteraction = useCallback(() => {
    if (!formStartedRef.current) {
      formStartedRef.current = true
      trackFormStart({
        formName: 'careers_application',
        source: window.location.pathname,
      })
    }
  }, [])

  const clearFieldError = useCallback((field: keyof FormErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const validateCvFile = useCallback((file: File): string | null => {
    const ext = getFileExtension(file.name)
    if (!CAREERS_CV_ALLOWED_EXTENSIONS.includes(ext)) {
      return `Only ${CAREERS_CV_ALLOWED_EXTENSIONS.join(', ')} files are accepted.`
    }
    if (file.size > CAREERS_CV_MAX_BYTES) {
      return `File is too large (${formatFileSize(file.size)}). Maximum size is ${formatFileSize(CAREERS_CV_MAX_BYTES)}.`
    }
    return null
  }, [])

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      trackInteraction()
      const file = e.target.files?.[0] ?? null
      if (file) {
        const validationError = validateCvFile(file)
        if (validationError) {
          setFieldErrors((prev) => ({ ...prev, cv: validationError }))
          setCvFile(null)
          // Reset the file input so the user can re-select
          if (fileInputRef.current) fileInputRef.current.value = ''
          return
        }
        clearFieldError('cv')
      }
      setCvFile(file)
    },
    [trackInteraction, validateCvFile, clearFieldError]
  )

  const validate = useCallback((): FormErrors => {
    const errors: FormErrors = {}

    if (!name.trim()) {
      errors.name = 'Please enter your name.'
    }

    if (!email.trim()) {
      errors.email = 'Please enter your email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.'
    }

    if (!phone.trim()) {
      errors.phone = 'Please enter your phone number.'
    }

    if (!role) {
      errors.role = 'Please select which role you are interested in.'
    }

    if (!experience.trim()) {
      errors.experience = 'Please tell us about your experience.'
    } else if (experience.trim().length < 20) {
      errors.experience = 'Please write at least 20 characters about your experience.'
    }

    if (!consent) {
      errors.consent = 'You must consent to data processing to submit your application.'
    }

    return errors
  }, [name, email, phone, role, experience, consent])

  const resetForm = useCallback(() => {
    setName('')
    setEmail('')
    setPhone('')
    setRole(defaultRole ?? '')
    setExperience('')
    setCvFile(null)
    setConsent(false)
    setHoneypot('')
    setTurnstileToken(null)
    setFieldErrors({})
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [defaultRole])

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setError(null)

      // If honeypot is filled, silently fake success
      if (honeypot) {
        setSuccess(true)
        return
      }

      const errors = validate()
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        return
      }

      setLoading(true)

      try {
        const formData = new FormData()
        formData.append('name', name.trim())
        formData.append('email', email.trim())
        formData.append('phone', phone.trim())
        formData.append('role', role)
        formData.append('experience', experience.trim())
        formData.append('consent', String(consent))
        formData.append('turnstile_token', turnstileToken ?? '')
        formData.append(
          '_t',
          String(Math.floor((Date.now() - mountTimeRef.current) / 1000))
        )
        formData.append('website', honeypot)
        if (cvFile) {
          formData.append('cv', cvFile)
        }

        const response = await fetch('/api/careers', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          setSuccess(true)
          resetForm()
          trackFormComplete({
            formName: 'careers_application',
            source: window.location.pathname,
            role,
            has_cv: String(Boolean(cvFile)),
          })
        } else {
          const body = await response.json().catch(() => null)
          setError(
            body?.error ??
              'Something went wrong submitting your application. Please try again or call us on 01753 682707.'
          )
        }
      } catch {
        setError(
          'Something went wrong submitting your application. Please try again or call us on 01753 682707.'
        )
      } finally {
        setLoading(false)
        turnstileRef.current?.reset()
      }
    },
    [
      name,
      email,
      phone,
      role,
      experience,
      cvFile,
      consent,
      turnstileToken,
      honeypot,
      validate,
      resetForm,
    ]
  )

  // --- Success state ---
  if (success) {
    return (
      <Card variant="elevated" className="bg-anchor-green-card border border-anchor-gold-dark/20">
        <CardBody>
          <div className="text-center py-8 space-y-4">
            <h3 className="text-xl font-semibold text-anchor-gold-bright">
              Application sent
            </h3>
            <p className="text-anchor-cream-text/80 max-w-md mx-auto">
              Thank you for your interest in joining The Anchor. We will review your
              application and be in touch if your experience is a good fit.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSuccess(false)
                mountTimeRef.current = Date.now()
                formStartedRef.current = false
              }}
            >
              Submit another application
            </Button>
          </div>
        </CardBody>
      </Card>
    )
  }

  // --- Form state ---
  return (
    <Card variant="elevated" className="bg-anchor-green-card border border-anchor-gold-dark/20">
      <CardBody>
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Name, email, phone */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="careers-name"
              label="Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                clearFieldError('name')
                trackInteraction()
              }}
              placeholder="Your full name"
              error={fieldErrors.name}
              disabled={loading}
              required
              autoComplete="name"
            />

            <Input
              id="careers-email"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                clearFieldError('email')
                trackInteraction()
              }}
              placeholder="you@example.com"
              error={fieldErrors.email}
              disabled={loading}
              required
              autoComplete="email"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="careers-phone"
              type="tel"
              label="Phone"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                clearFieldError('phone')
                trackInteraction()
              }}
              placeholder="07700 900123"
              error={fieldErrors.phone}
              disabled={loading}
              required
              autoComplete="tel"
            />

            {/* Role interest */}
            <div>
              <label
                htmlFor="careers-role"
                className="block text-sm font-medium text-anchor-cream-text/70 mb-1"
              >
                Role interest
              </label>
              <Select
                id="careers-role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value)
                  clearFieldError('role')
                  trackInteraction()
                }}
                error={!!fieldErrors.role}
                disabled={loading}
                aria-describedby={fieldErrors.role ? 'careers-role-error' : undefined}
              >
                <option value="">Select a role</option>
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              {fieldErrors.role && (
                <p id="careers-role-error" className="mt-1 text-sm text-red-400">
                  {fieldErrors.role}
                </p>
              )}
            </div>
          </div>

          {/* Experience */}
          <Textarea
            id="careers-experience"
            label="Experience"
            value={experience}
            onChange={(e) => {
              setExperience(e.target.value)
              clearFieldError('experience')
              trackInteraction()
            }}
            placeholder="Tell us about your relevant experience..."
            error={fieldErrors.experience}
            helperText={
              !fieldErrors.experience ? 'Minimum 20 characters.' : undefined
            }
            rows={4}
            disabled={loading}
            required
          />

          {/* CV upload */}
          <div>
            <label
              htmlFor="careers-cv"
              className="block text-sm font-medium text-anchor-cream-text/70 mb-1"
            >
              CV (optional)
            </label>
            <input
              ref={fileInputRef}
              id="careers-cv"
              type="file"
              accept={CAREERS_CV_ALLOWED_EXTENSIONS.join(',')}
              onChange={handleFileChange}
              disabled={loading}
              className="block w-full text-sm text-anchor-cream-text/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-anchor-gold-dark/20 file:text-anchor-gold-bright hover:file:bg-anchor-gold-dark/30 file:cursor-pointer file:transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-describedby={
                fieldErrors.cv ? 'careers-cv-error' : 'careers-cv-help'
              }
            />
            {fieldErrors.cv ? (
              <p id="careers-cv-error" className="mt-1 text-sm text-red-400">
                {fieldErrors.cv}
              </p>
            ) : (
              <p id="careers-cv-help" className="mt-1 text-sm text-anchor-cream-text/50">
                PDF, DOC, or DOCX. Maximum 20 MB.
              </p>
            )}
          </div>

          {/* GDPR consent */}
          <div className="relative">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="careers-consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked)
                    clearFieldError('consent')
                    trackInteraction()
                  }}
                  disabled={loading}
                  className="rounded border-gray-300 text-anchor-gold-dark focus:ring-2 focus:ring-anchor-gold-dark focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer w-5 h-5"
                  aria-invalid={!!fieldErrors.consent}
                  aria-describedby={
                    fieldErrors.consent ? 'careers-consent-error' : undefined
                  }
                />
              </div>
              <div className="ml-3">
                <label
                  htmlFor="careers-consent"
                  className="text-sm text-anchor-cream-text/70 cursor-pointer"
                >
                  I consent to The Anchor processing my personal data for
                  recruitment purposes. See our{' '}
                  <Link
                    href="/privacy-policy"
                    className="text-anchor-gold-bright underline hover:text-anchor-gold-dark"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>
            </div>
            {fieldErrors.consent && (
              <p
                id="careers-consent-error"
                className="mt-1 text-sm text-red-400 ml-8"
              >
                {fieldErrors.consent}
              </p>
            )}
          </div>

          {/* Submit area — tighter spacing than the main form fields */}
          <div className="space-y-4">
            {/* Honeypot - visible to bots, hidden from users */}
            <div className="overflow-hidden h-0 w-0 opacity-0 absolute" aria-hidden="true">
              <label htmlFor="careers-website">Website</label>
              <input
                id="careers-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>
            <TurnstileField
              id="careers-turnstile"
              turnstileRef={turnstileRef}
              onTokenChange={setTurnstileToken}
            />

            {error && (
              <div
                role="alert"
                className="border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-100"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Sending application...' : 'Send application'}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}
