'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'

import { Alert, Button, Checkbox, Input, Textarea } from '@/components/ui'
import { trackFormComplete, trackFormStart } from '@/lib/gtm-events'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function OpenMicPerformerInterestForm() {
  const [hasStarted, setHasStarted] = useState(false)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')

  const [consentDataStorage, setConsentDataStorage] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleStart = useCallback(() => {
    if (hasStarted) return
    setHasStarted(true)
    trackFormStart({
      formName: 'open_mic_performer_interest',
      source: 'open_mic_page',
      journey: 'open_mic'
    })
  }, [hasStarted])

  const payload = useMemo(() => {
    return {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      consentDataStorage,
      honeypot
    }
  }, [bio, consentDataStorage, email, fullName, honeypot, phone])

  const validate = useCallback(() => {
    const nextErrors: Record<string, string> = {}

    if (!payload.fullName) nextErrors.fullName = 'Full name is required.'
    if (!payload.email) nextErrors.email = 'Email is required.'
    if (payload.email && !isValidEmail(payload.email)) nextErrors.email = 'Please enter a valid email.'
    if (!payload.phone) nextErrors.phone = 'Mobile number is required.'
    if (!payload.bio) nextErrors.bio = 'Description is required.'
    if (payload.bio && payload.bio.length > 800) nextErrors.bio = 'Description must be 800 characters or fewer.'
    if (!payload.consentDataStorage) nextErrors.consentDataStorage = 'Consent to store your details is required.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }, [payload])

  const resetForm = useCallback(() => {
    setFullName('')
    setEmail('')
    setPhone('')
    setBio('')
    setConsentDataStorage(false)
    setHoneypot('')
    setErrors({})
  }, [])

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      handleStart()

      setStatus('idle')
      setMessage('')

      if (!validate()) {
        setStatus('error')
        setMessage('Please check the highlighted fields.')
        return
      }

      setSubmitting(true)

      try {
        const response = await fetch('/api/enquiry/open-mic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        const responseBody = await response.json().catch(() => null)

        if (!response.ok) {
          const errorMessage =
            responseBody?.error ||
            'Sorry, we could not submit your details right now. Please call 01753 682707.'
          setStatus('error')
          setMessage(errorMessage)
          return
        }

        trackFormComplete({
          formName: 'open_mic_performer_interest',
          source: 'open_mic_page',
          journey: 'open_mic'
        })

        setStatus('success')
        setMessage("Thanks! We’ve received your details. We’ll be in touch when we’re booking upcoming nights.")
        resetForm()
      } catch (error) {
        console.error('Open mic performer interest form submission failed:', error)
        setStatus('error')
        setMessage('Sorry, something went wrong. Please call 01753 682707.')
      } finally {
        setSubmitting(false)
      }
    },
    [handleStart, payload, resetForm, validate]
  )

  return (
    <div className="rounded-2xl border border-anchor-gold/15 bg-anchor-bg-card p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-anchor-cream-text mb-2" id="register-interest">
        Register your interest
      </h2>
      <p className="text-sm text-anchor-cream-text/70 mb-6">
        Leave your details and we’ll be in touch when we’re booking upcoming open mic nights.
      </p>

      {status === 'success' && (
        <Alert variant="success" className="mb-6" title="Interest received">
          {message}
        </Alert>
      )}

      {status === 'error' && message && (
        <Alert variant="error" className="mb-6" title="Please check the form">
          {message}
        </Alert>
      )}

      <form className="space-y-6" onSubmit={handleSubmit} onFocusCapture={handleStart}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Full name *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
            autoComplete="name"
          />

          <Input
            label="Email *"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
          />

          <Input
            label="Mobile number *"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
            autoComplete="tel"
          />
        </div>

        <Textarea
          label="Description *"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          error={errors.bio}
          helperText="Add any links (YouTube, Instagram, etc.) in this box. Max 800 characters."
          rows={6}
        />

        <div className="rounded-xl border border-anchor-gold/15 bg-anchor-bg-raised p-4 space-y-4">
          <h3 className="text-lg font-semibold text-anchor-cream-text">Consent</h3>

          <Checkbox
            label="I’m happy for The Anchor to store my details to contact me about performing. *"
            checked={consentDataStorage}
            onChange={(e) => setConsentDataStorage(e.target.checked)}
            error={errors.consentDataStorage}
            helperText="You can ask us to update or delete your details at any time."
          />

          <p className="text-xs text-anchor-cream-text/55">
            By submitting this form you agree to our{' '}
            <Link href="/privacy-policy" className="underline decoration-dotted">
              privacy policy
            </Link>
            .
          </p>
        </div>

        {/* Honeypot field (hidden) */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="company">Company</label>
          <input
            id="company"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? 'Sending…' : 'Submit interest'}
          </Button>
          <p className="text-xs text-anchor-cream-text/55">
            Prefer to speak to the team? Call{' '}
            <a className="underline decoration-dotted" href="tel:+441753682707">
              01753 682707
            </a>
            .
          </p>
        </div>
      </form>
    </div>
  )
}
