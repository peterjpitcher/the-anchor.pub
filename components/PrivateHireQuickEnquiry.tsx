'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import { TurnstileField, type TurnstileFieldRef } from '@/components/security/TurnstileField'
import { CommunicationConsentFields } from '@/components/CommunicationConsentFields'
import { DEFAULT_COMMUNICATION_CONSENT_STATE, buildCommunicationConsentPayload } from '@/lib/communication-consent'
import { trackPrivateHireEnquiryStarted, trackPrivateHireEnquirySubmitted } from '@/lib/gtm-events'

interface PrivateHireQuickEnquiryProps {
  eventType?: string
  initialSpaceId?: string
}

const inputClass = 'block w-full min-w-0 rounded-sm border border-line-strong bg-surface px-3 py-2 text-ink'
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

export function PrivateHireQuickEnquiry({ eventType, initialSpaceId }: PrivateHireQuickEnquiryProps): JSX.Element {
  const id = useId()
  const [occasion, setOccasion] = useState(eventType || '')
  const [date, setDate] = useState('')
  const [undecided, setUndecided] = useState(true)
  const [guests, setGuests] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [reply, setReply] = useState('No preference')
  const [consent, setConsent] = useState(DEFAULT_COMMUNICATION_CONSENT_STATE)
  const [token, setToken] = useState<string | null>(null)
  const [honeypot, setHoneypot] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accepted, setAccepted] = useState<'saved' | 'emailed' | null>(null)
  const started = useRef(false)
  const submitting = useRef(false)
  const loadedAt = useRef(Date.now())
  const turnstileRef = useRef<TurnstileFieldRef>(null)

  function trackStarted(): void {
    if (started.current) return
    started.current = true
    trackPrivateHireEnquiryStarted({ enquiryType: eventType || 'Private hire', pageSource: window.location.pathname })
  }

  function startEnquiry(event: React.FocusEvent<HTMLFormElement>): void {
    // Keep the task protected even when the guest moves focus out of a field.
    event.currentTarget.dataset.bookingFlow = 'active'
    trackStarted()
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (submitting.current) return
    setError(null)
    if (!name.trim() || !occasion.trim() || !Number.isInteger(Number(guests)) || Number(guests) < 1 || Number(guests) > 300 || (!undecided && !date)) {
      setError('Please enter your name, occasion, guest count and preferred date, or choose date undecided.')
      return
    }
    // The management service normalises and validates international numbers.
    if (!/^\+?[\d\s().-]{7,25}$/.test(phone.trim())) {
      setError('Please enter a valid phone number.')
      return
    }
    if (siteKey && !token) {
      setError('Please complete the security check.')
      return
    }
    if (reply === 'Email' && !email.trim()) {
      setError('Please add your email address for an email reply.')
      return
    }
    submitting.current = true
    setLoading(true)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 45000)
    try {
      const response = await fetch('/api/private-booking-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          customer_first_name: name.trim(), contact_phone: phone.trim(), default_country_code: '44',
          ...(email.trim() ? { contact_email: email.trim() } : {}),
          event_type: occasion.trim(), guest_count: Number(guests),
          ...(!undecided ? { event_date: date } : {}),
          internal_notes: [
            `Website short enquiry: ${window.location.pathname}`,
            ...(initialSpaceId ? [`Space of interest: ${initialSpaceId}`] : []),
            ...(undecided ? ['Date undecided'] : []),
            `Requested reply method: ${reply}`,
            notes.trim(),
          ].filter(Boolean).join('\n'),
          communication_consent: buildCommunicationConsentPayload(consent),
          turnstile_token: token || undefined, website: honeypot,
          _t: Math.floor((Date.now() - loadedAt.current) / 1000),
        }),
      })
      const result = await response.json()
      if (!response.ok || result.success !== true) {
        throw new Error(typeof result.error === 'string' ? result.error : result.error?.message || 'We could not submit your enquiry. Please try again or call 01753 682707.')
      }
      if (result.state !== 'enquiry_emailed' && !result.data?.id) {
        throw new Error('We could not confirm receipt. Please try again or call 01753 682707.')
      }
      setAccepted(result.state === 'enquiry_emailed' ? 'emailed' : 'saved')
      if (result.state !== 'enquiry_emailed') {
        trackPrivateHireEnquirySubmitted({ enquiryType: eventType || 'Private hire', guestCount: Number(guests), pageSource: window.location.pathname })
      }
    } catch (failure) {
      setError(failure instanceof Error && failure.name !== 'AbortError' ? failure.message : 'We could not confirm receipt. Please try again or call 01753 682707.')
    } finally {
      clearTimeout(timeout)
      submitting.current = false
      setLoading(false)
      setToken(null)
      turnstileRef.current?.reset()
    }
  }

  if (accepted) return (
    <div role="status" className="rounded-md border border-line bg-surface p-6">
      <h3 className="text-xl font-semibold text-ink-strong">{accepted === 'saved' ? 'Enquiry received' : 'Enquiry emailed to our team'}</h3>
      <p className="mt-3 text-ink">{occasion}, approximately {guests} guests. {undecided ? 'Date undecided.' : `Requested date: ${date.split('-').reverse().join('/')}.`}</p>
      <p className="mt-3 text-ink-muted">{accepted === 'emailed' ? 'Our booking system could not save your enquiry, but the team has received your details by email. ' : ''}The team will reply to discuss availability. This enquiry does not hold your date or confirm a booking.</p>
    </div>
  )

  return (
    <form aria-label="Short private hire enquiry" onSubmit={submit} onFocus={startEnquiry} className="space-y-4 rounded-md border border-line bg-surface p-6">
      <h3 className="text-xl font-semibold text-ink-strong">Enquire about your date</h3>
      <p className="text-sm text-ink-muted">Tell us what you have in mind. You do not need to choose catering or a room yet. This enquiry does not hold your date.</p>
      {error && <p role="alert" className="text-ink font-semibold">{error}</p>}
      <fieldset disabled={loading} className="grid min-w-0 gap-4 sm:grid-cols-2">
        <label className="text-sm text-ink">Occasion<input required maxLength={120} value={occasion} onChange={e => setOccasion(e.target.value)} className={inputClass} /></label>
        <label className="text-sm text-ink">Approximate guests<input required type="number" min={1} max={300} step={1} value={guests} onChange={e => setGuests(e.target.value)} className={inputClass} /></label>
        <div className="min-w-0 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={undecided} onChange={e => setUndecided(e.target.checked)} />Date undecided</label>
          {!undecided && <label className="mt-3 block text-sm text-ink">Preferred date<input required type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} /></label>}
        </div>
        <label className="text-sm text-ink">Your name<input required autoComplete="name" maxLength={120} value={name} onChange={e => setName(e.target.value)} className={inputClass} /></label>
        <label className="text-sm text-ink">Phone number<input required type="tel" autoComplete="tel" maxLength={25} value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} /></label>
        <label className="text-sm text-ink">Email (optional)<input type="email" autoComplete="email" maxLength={255} value={email} onChange={e => setEmail(e.target.value)} className={inputClass} /></label>
        <label className="text-sm text-ink">Preferred reply method<select value={reply} onChange={e => setReply(e.target.value)} className={inputClass}><option>No preference</option><option>Phone</option><option>Email</option></select></label>
        <label className="text-sm text-ink sm:col-span-2">Notes (optional)<textarea rows={3} maxLength={1000} value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} /></label>
      </fieldset>
      <CommunicationConsentFields idPrefix={id} value={consent} onChange={setConsent} />
      <div aria-hidden="true" className="hidden"><label htmlFor={`${id}-website`}>Website</label><input id={`${id}-website`} tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} /></div>
      {siteKey && <TurnstileField id={`${id}-turnstile`} turnstileRef={turnstileRef} onTokenChange={setToken} />}
      <button disabled={loading || Boolean(siteKey && !token)} type="submit" className="w-full rounded-pill bg-anchor-gold-dark px-6 py-3 font-semibold text-white disabled:opacity-50">{loading ? 'Sending...' : 'Send enquiry'}</button>
    </form>
  )
}
