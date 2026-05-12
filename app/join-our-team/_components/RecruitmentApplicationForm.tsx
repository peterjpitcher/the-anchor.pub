'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Alert, Button, Icon } from '@/components/ui'
import { TurnstileField, type TurnstileFieldRef } from '@/components/security/TurnstileField'
import {
  availabilityOptions,
  experienceOptions,
  recruitmentRoleOptions,
  startDateOptions,
  type RecruitmentRoleValue
} from '../recruitmentContent'
import {
  trackFormComplete,
  trackFormStart,
  trackRecruitmentApplicationSubmitted
} from '@/lib/gtm-events'

type SubmissionState = 'idle' | 'success' | 'error'

const maxCvBytes = 5 * 1024 * 1024
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

export function RecruitmentApplicationForm({ initialRole = 'Not sure yet' }: { initialRole?: RecruitmentRoleValue }) {
  const [role, setRole] = useState<RecruitmentRoleValue>(initialRole)
  const [consent, setConsent] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [honeypot, setHoneypot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<SubmissionState>('idle')
  const [message, setMessage] = useState('')
  const [cvName, setCvName] = useState('')
  const formLoadedAt = useRef(Date.now())
  const startedTracking = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const turnstileRef = useRef<TurnstileFieldRef>(null)

  useEffect(() => {
    setRole(initialRole)
  }, [initialRole])

  const trackStartOnce = () => {
    if (startedTracking.current) return
    startedTracking.current = true
    trackFormStart({
      formName: 'recruitment_application',
      source: 'join_our_team_page',
      mode: role,
      journey: 'recruitment'
    })
  }

  const validateForm = (formData: FormData) => {
    const requiredTextFields = [
      ['name', 'Please enter your name.'],
      ['email', 'Please enter your email address.'],
      ['phone', 'Please enter your phone number.'],
      ['experience', 'Please tell us about your most relevant experience.'],
      ['fit', 'Please tell us what makes you a good fit.'],
      ['travel', 'Please tell us how you would usually travel to The Anchor.'],
      ['relevantExperience', 'Please answer the experience question.'],
      ['startDate', 'Please tell us when you could start.']
    ] as const

    for (const [field, error] of requiredTextFields) {
      const value = formData.get(field)
      if (typeof value !== 'string' || !value.trim()) return error
    }

    if (!role) return 'Please choose the role you are interested in.'
    if (formData.getAll('availability').length === 0) {
      return 'Please choose at least one usual availability option.'
    }
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      return 'Please complete the security check before submitting.'
    }
    if (!consent) return 'Please confirm we can contact you about your application.'

    const cv = formData.get('cv')
    if (cv instanceof File && cv.size > maxCvBytes) {
      return 'Please upload a CV smaller than 5MB, or leave the CV field blank.'
    }

    return null
  }

  const handleCvChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setCvName(file?.name ?? '')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    trackStartOnce()

    const form = event.currentTarget
    const formData = new FormData(form)
    formData.set('role', role)
    formData.set('consent', consent ? 'yes' : '')
    formData.set('turnstile_token', turnstileToken || '')
    formData.set('_t', String(Math.floor((Date.now() - formLoadedAt.current) / 1000)))
    if (typeof window !== 'undefined') formData.set('pageUrl', window.location.href)
    if (honeypot) formData.set('website', honeypot)

    const validationError = validateForm(formData)
    if (validationError) {
      setStatus('error')
      setMessage(validationError)
      return
    }

    setSubmitting(true)
    setStatus('idle')
    setMessage('')

    try {
      const response = await fetch('/api/enquiry/recruitment', {
        method: 'POST',
        body: formData
      })

      const result = await response.json().catch(() => null)

      if (!response.ok) {
        setStatus('error')
        setMessage(result?.error || 'Sorry, we could not send your application. Please call us on 01753 682707.')
        return
      }

      trackFormComplete({
        formName: 'recruitment_application',
        source: 'join_our_team_page',
        mode: role,
        journey: 'recruitment'
      })
      trackRecruitmentApplicationSubmitted({
        role,
        availabilityCount: formData.getAll('availability').length,
        relevantExperience: String(formData.get('relevantExperience') || ''),
        startDate: String(formData.get('startDate') || '')
      })

      setStatus('success')
      setMessage("Thanks. We have sent your application to the team and will be in touch if it looks like a good fit.")
      form.reset()
      setConsent(false)
      setTurnstileToken(null)
      setHoneypot('')
      setCvName('')
      setRole(initialRole)
      turnstileRef.current?.reset()
      formLoadedAt.current = Date.now()
      startedTracking.current = false
    } catch (error) {
      console.error('Recruitment application failed:', error)
      setStatus('error')
      setMessage('Sorry, something went wrong while sending your application. Please call us on 01753 682707.')
    } finally {
      setSubmitting(false)
      setTurnstileToken(null)
      turnstileRef.current?.reset()
    }
  }

  return (
    <div className="rounded-lg border border-anchor-gold/20 bg-anchor-bg-card p-5 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-anchor-gold-vivid">Apply now</h2>
        <p className="mt-3 text-anchor-cream-text/75">
          The form is intentionally short. Tell us enough to understand your experience, availability and whether
          the location will work for you.
        </p>
      </div>

      {status === 'success' ? (
        <Alert variant="success" title="Application sent" className="mb-6">
          {message}
        </Alert>
      ) : null}

      {status === 'error' ? (
        <Alert variant="error" title="Please double-check" className="mb-6">
          {message}
        </Alert>
      ) : null}

      <form ref={formRef} className="space-y-6" onFocusCapture={trackStartOnce} onSubmit={handleSubmit}>
        <div className="hidden" aria-hidden="true">
          <label htmlFor="recruitment-website">Website</label>
          <input
            id="recruitment-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Name" htmlFor="name" required>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="w-full rounded-md border border-anchor-gold/30 bg-anchor-bg px-3 py-3 text-anchor-cream-text placeholder:text-anchor-cream-text/45 focus:border-anchor-gold focus:outline-none focus:ring-2 focus:ring-anchor-gold/30"
            />
          </FormField>
          <FormField label="Email address" htmlFor="email" required>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border border-anchor-gold/30 bg-anchor-bg px-3 py-3 text-anchor-cream-text placeholder:text-anchor-cream-text/45 focus:border-anchor-gold focus:outline-none focus:ring-2 focus:ring-anchor-gold/30"
            />
          </FormField>
          <FormField label="Phone number" htmlFor="phone" required>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              required
              className="w-full rounded-md border border-anchor-gold/30 bg-anchor-bg px-3 py-3 text-anchor-cream-text placeholder:text-anchor-cream-text/45 focus:border-anchor-gold focus:outline-none focus:ring-2 focus:ring-anchor-gold/30"
            />
          </FormField>
        </div>

        <FormField label="Which role are you interested in?" htmlFor="role" required>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value as RecruitmentRoleValue)}
            className="w-full rounded-md border border-anchor-gold/30 bg-anchor-bg px-3 py-3 text-anchor-cream-text focus:border-anchor-gold focus:outline-none focus:ring-2 focus:ring-anchor-gold/30"
          >
            {recruitmentRoleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="CV optional"
          htmlFor="cv"
          helperText="You do not need a CV to apply. If you do not have one, use the questions below to tell us about your experience."
        >
          <div className="rounded-md border border-dashed border-anchor-gold/30 bg-anchor-bg px-4 py-4">
            <input
              id="cv"
              name="cv"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleCvChange}
              className="w-full text-sm text-anchor-cream-text/80 file:mr-4 file:rounded-full file:border-0 file:bg-anchor-gold file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-anchor-gold-light"
            />
            <p className="mt-2 text-xs text-anchor-cream-text/55">
              PDF, DOC or DOCX up to 5MB. {cvName ? `Selected: ${cvName}` : null}
            </p>
          </div>
        </FormField>

        <FormField
          label="Tell us about your most relevant experience"
          htmlFor="experience"
          required
          helperText="For example, bar work, pub work, restaurant work, kitchen work, food service, events, customer service or team leadership."
        >
          <textarea
            id="experience"
            name="experience"
            rows={4}
            required
            className="w-full rounded-md border border-anchor-gold/30 bg-anchor-bg px-3 py-3 text-anchor-cream-text placeholder:text-anchor-cream-text/45 focus:border-anchor-gold focus:outline-none focus:ring-2 focus:ring-anchor-gold/30"
          />
        </FormField>

        <FormField
          label="What makes you a good fit for The Anchor?"
          htmlFor="fit"
          required
          helperText="Tell us briefly about your reliability, service standards, experience, availability, or anything else you think we should know."
        >
          <textarea
            id="fit"
            name="fit"
            rows={4}
            required
            className="w-full rounded-md border border-anchor-gold/30 bg-anchor-bg px-3 py-3 text-anchor-cream-text placeholder:text-anchor-cream-text/45 focus:border-anchor-gold focus:outline-none focus:ring-2 focus:ring-anchor-gold/30"
          />
        </FormField>

        <fieldset>
          <legend className="text-sm font-semibold text-anchor-cream-text">
            When are you usually available? <span className="text-red-400">*</span>
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {availabilityOptions.map((option) => (
              <label
                key={option}
                className="flex items-start gap-3 rounded-md border border-anchor-gold/15 bg-anchor-bg px-3 py-3 text-sm text-anchor-cream-text/80"
              >
                <input
                  type="checkbox"
                  name="availability"
                  value={option}
                  className="mt-1 h-4 w-4 rounded border-anchor-gold/40 bg-anchor-bg-card text-anchor-gold focus:ring-anchor-gold"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="How would you usually travel to and from The Anchor?"
            htmlFor="travel"
            required
            helperText="This helps us understand whether the location and shift times will work for you."
          >
            <textarea
              id="travel"
              name="travel"
              rows={3}
              required
              className="w-full rounded-md border border-anchor-gold/30 bg-anchor-bg px-3 py-3 text-anchor-cream-text placeholder:text-anchor-cream-text/45 focus:border-anchor-gold focus:outline-none focus:ring-2 focus:ring-anchor-gold/30"
            />
          </FormField>

          <div className="space-y-4">
            <FormField label="Do you have at least one year of relevant experience?" htmlFor="relevantExperience" required>
              <select
                id="relevantExperience"
                name="relevantExperience"
                required
                defaultValue=""
                className="w-full rounded-md border border-anchor-gold/30 bg-anchor-bg px-3 py-3 text-anchor-cream-text focus:border-anchor-gold focus:outline-none focus:ring-2 focus:ring-anchor-gold/30"
              >
                <option value="" disabled>
                  Choose one
                </option>
                {experienceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="When could you start?" htmlFor="startDate" required>
              <select
                id="startDate"
                name="startDate"
                required
                defaultValue=""
                className="w-full rounded-md border border-anchor-gold/30 bg-anchor-bg px-3 py-3 text-anchor-cream-text focus:border-anchor-gold focus:outline-none focus:ring-2 focus:ring-anchor-gold/30"
              >
                <option value="" disabled>
                  Choose one
                </option>
                {startDateOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-md border border-anchor-gold/15 bg-anchor-bg px-4 py-4 text-sm text-anchor-cream-text/80">
          <input
            type="checkbox"
            name="consent"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            required
            className="mt-1 h-4 w-4 rounded border-anchor-gold/40 bg-anchor-bg-card text-anchor-gold focus:ring-anchor-gold"
          />
          <span>
            I agree for The Anchor to contact me about my application and understand my details will only be used
            for recruitment purposes.
          </span>
        </label>

        {TURNSTILE_SITE_KEY ? (
          <div className="rounded-md border border-anchor-gold/15 bg-anchor-bg px-4 py-4">
            <p className="mb-3 text-sm font-semibold text-anchor-cream-text">Security check</p>
            <TurnstileField
              id="recruitment-application-turnstile"
              turnstileRef={turnstileRef}
              onTokenChange={setTurnstileToken}
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button
            type="submit"
            size="lg"
            disabled={submitting || (TURNSTILE_SITE_KEY ? !turnstileToken : false)}
            className="w-full sm:w-auto"
          >
            {submitting ? (
              <>
                <Icon name="loading" className="h-4 w-4 animate-spin" aria-hidden="true" />
                Sending...
              </>
            ) : (
              <>
                <Icon name="send" className="h-4 w-4" aria-hidden="true" />
                Send Application
              </>
            )}
          </Button>
          <p className="text-sm text-anchor-cream-text/60">
            Prefer to speak first? Call 01753 682707.
          </p>
        </div>
      </form>
    </div>
  )
}

function FormField({
  label,
  htmlFor,
  required,
  helperText,
  children
}: {
  label: string
  htmlFor: string
  required?: boolean
  helperText?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-anchor-cream-text">
        {label}
        {required ? <span className="ml-1 text-red-400">*</span> : null}
      </label>
      <div className="mt-2">{children}</div>
      {helperText ? <p className="mt-2 text-sm text-anchor-cream-text/60">{helperText}</p> : null}
    </div>
  )
}
