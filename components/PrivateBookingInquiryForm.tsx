'use client'

import { useRef, useState } from 'react'
import { TurnstileField, type TurnstileFieldRef } from '@/components/security/TurnstileField'
import { PrivateBookingRequest, createPrivateBooking } from '@/lib/api'
import { trackPrivateHireEnquiryStarted, trackPrivateHireEnquirySubmitted } from '@/lib/gtm-events'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

type LookupState = 'idle' | 'loading' | 'known' | 'unknown'

type CustomerLookupResult = {
    known: boolean
    lookup_degraded?: boolean
    normalized_phone?: string
    customer?: {
        id?: string
        first_name?: string | null
        last_name?: string | null
        full_name?: string | null
        email?: string | null
        mobile_e164?: string | null
        mobile_number?: string | null
    } | null
}

interface Props {
    initialData?: Partial<PrivateBookingRequest>
    onCancel?: () => void
}

function parseLookupResponse(payload: any): CustomerLookupResult {
    const data = payload?.data || payload
    return {
        known: Boolean(data?.known),
        lookup_degraded: Boolean(data?.lookup_degraded),
        normalized_phone: data?.normalized_phone,
        customer: data?.customer || null
    }
}

export function PrivateBookingInquiryForm({ initialData, onCancel }: Props) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [phone, setPhone] = useState(initialData?.contact_phone || '')
    const [lookupState, setLookupState] = useState<LookupState>('idle')
    const [lookupError, setLookupError] = useState<string | null>(null)
    const [knownCustomer, setKnownCustomer] = useState<CustomerLookupResult['customer']>(null)
    const [lookupDegraded, setLookupDegraded] = useState(false)
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
    const turnstileRef = useRef<TurnstileFieldRef>(null)
    const [honeypot, setHoneypot] = useState('')
    const formLoadedAt = useRef(Date.now())
    const enquiryStartedRef = useRef(false)

    const [formData, setFormData] = useState<PrivateBookingRequest>({
        customer_first_name: initialData?.customer_first_name || '',
        customer_last_name: initialData?.customer_last_name || '',
        contact_phone: initialData?.contact_phone || '',
        contact_email: initialData?.contact_email || '',
        event_date: initialData?.event_date || '',
        start_time: initialData?.start_time || '19:00',
        guest_count: initialData?.guest_count || 50,
        event_type: initialData?.event_type || 'Birthday Party',
        internal_notes: initialData?.internal_notes || '',
        ...initialData
    })

    // Ensure items are preserved from initialData
    const bookingItems = initialData?.items || []
    const detailsUnlocked = lookupState === 'known' || lookupState === 'unknown'
    const isKnownCustomer = lookupState === 'known'

    const trackEnquiryStartedOnce = () => {
        if (enquiryStartedRef.current) return
        enquiryStartedRef.current = true
        trackPrivateHireEnquiryStarted({
            enquiryType: formData.event_type,
            guestCount: formData.guest_count,
            pageSource: typeof window !== 'undefined' ? window.location.pathname : '',
        })
    }

    const handlePhoneLookup = async () => {
        setLookupError(null)
        setError(null)
        setLookupDegraded(false)

        if (!phone.trim()) {
            setLookupError('Please enter a mobile number first.')
            return
        }

        setLookupState('loading')

        try {
            const params = new URLSearchParams({ phone: phone.trim(), default_country_code: '44' })
            const response = await fetch(`/api/customers/lookup?${params.toString()}`, { cache: 'no-store' })
            const payload = await response.json()

            if (!response.ok || payload?.success === false) {
                const message =
                    payload?.error?.message || payload?.error || 'Unable to verify this number right now. Please try again.'
                throw new Error(message)
            }

            const lookup = parseLookupResponse(payload)

            if (lookup.known) {
                setLookupState('known')
                setKnownCustomer(lookup.customer || null)
                setLookupDegraded(false)
                setFormData((previous) => ({
                    ...previous,
                    contact_phone: phone.trim(),
                    customer_first_name: lookup.customer?.first_name || previous.customer_first_name || 'Guest',
                    customer_last_name: lookup.customer?.last_name || previous.customer_last_name || '',
                    contact_email: lookup.customer?.email || previous.contact_email || ''
                }))
            } else {
                setLookupState('unknown')
                setKnownCustomer(null)
                setLookupDegraded(Boolean(lookup.lookup_degraded))
                setFormData((previous) => ({
                    ...previous,
                    contact_phone: phone.trim()
                }))
            }
        } catch (lookupFailure: any) {
            setLookupState('idle')
            setLookupError(lookupFailure?.message || 'Unable to verify this number right now.')
            setLookupDegraded(false)
        }
    }

    const resetPhoneLookup = () => {
        setLookupState('idle')
        setLookupError(null)
        setKnownCustomer(null)
        setLookupDegraded(false)
        setError(null)
        setFormData((previous) => ({
            ...previous,
            contact_phone: phone.trim()
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!detailsUnlocked) {
            setLoading(false)
            setError('Please verify your mobile number first.')
            return
        }

        if (!isKnownCustomer && (!formData.customer_first_name.trim() || !formData.customer_last_name?.trim())) {
            setLoading(false)
            setError('Please enter your first name and last name.')
            return
        }

        try {
            const response = await createPrivateBooking({
                ...formData,
                contact_phone: phone.trim(),
                default_country_code: '44',
                customer_first_name: formData.customer_first_name.trim() || 'Guest',
                customer_last_name: formData.customer_last_name?.trim() || '',
                contact_email: formData.contact_email?.trim() || '',
                items: bookingItems,
                ...(turnstileToken ? { turnstile_token: turnstileToken } : {}),
                ...(honeypot ? { website: honeypot } : {}),
                _t: Math.floor((Date.now() - formLoadedAt.current) / 1000)
            })

            if (response.success) {
                setSuccess(true)
                trackPrivateHireEnquirySubmitted({
                    enquiryType: formData.event_type,
                    guestCount: formData.guest_count,
                    pageSource: typeof window !== 'undefined' ? window.location.pathname : '',
                })
            } else {
                setError(response.error.message || 'Something went wrong. Please try again.')
            }
        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
            setTurnstileToken(null)
            turnstileRef.current?.reset()
        }
    }

    if (success) {
        return (
            <div className="card-dark rounded-none p-8 text-center animate-in fade-in zoom-in duration-300 border border-anchor-gold/20">
                <div className="w-16 h-16 bg-anchor-green/20 text-anchor-gold-vivid rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-anchor-cream-text mb-2">Inquiry Received!</h3>
                <p className="text-anchor-cream-text/70 mb-6">
                    We have received your details. Since this is a private booking, we need to confirm availability manually.
                    Expect a text message or call from us shortly!
                </p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="text-anchor-gold-vivid font-medium hover:text-anchor-gold"
                >
                    Return to Home
                </button>
            </div>
        )
    }

    return (
        <div className="card-dark rounded-none overflow-hidden">
            <div className="p-6 border-b border-anchor-gold/15 flex justify-between items-center bg-anchor-bg-raised">
                <h3 className="text-xl font-semibold text-anchor-cream-text">Complete Your Inquiry</h3>
                {onCancel && (
                    <button onClick={onCancel} className="text-anchor-cream-text/55 hover:text-anchor-cream-text">
                        Cancel
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                    <div className="p-4 bg-red-900/20 text-red-400 rounded-lg text-sm border border-red-500/30">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <h4 className="font-medium text-anchor-cream-text border-b border-anchor-gold/15 pb-2">Contact Details</h4>
                    <div>
                        <label className="block text-sm font-medium text-anchor-cream-text/70 mb-1">Mobile Number *</label>
                        <p className="text-xs text-anchor-cream-text/55 mb-1">Enter your mobile so we can confirm your enquiry and check whether you are already in our system.</p>
                        <input
                            required
                            type="tel"
                            value={phone}
                            disabled={detailsUnlocked}
                            onChange={e => {
                                trackEnquiryStartedOnce()
                                setPhone(e.target.value)
                            }}
                            className="w-full px-4 py-2 bg-anchor-bg-card border border-anchor-gold/30 text-anchor-cream-text rounded-lg focus:ring-2 focus:ring-anchor-gold focus:border-anchor-gold disabled:opacity-60"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {!detailsUnlocked ? (
                            <button
                                type="button"
                                onClick={handlePhoneLookup}
                                disabled={lookupState === 'loading'}
                                className="px-4 py-2 bg-anchor-gold hover:bg-anchor-gold-vivid text-anchor-charcoal font-semibold rounded-lg disabled:opacity-50"
                            >
                                {lookupState === 'loading' ? 'Checking...' : 'Continue'}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={resetPhoneLookup}
                                className="px-4 py-2 border border-anchor-gold/30 rounded-lg text-anchor-cream-text/70 hover:bg-anchor-bg-raised"
                            >
                                Use Different Number
                            </button>
                        )}
                    </div>

                    {lookupError && (
                        <div className="p-3 bg-red-900/20 text-red-400 rounded-lg text-sm border border-red-500/30">
                            {lookupError}
                        </div>
                    )}

                    {isKnownCustomer && (
                        <div className="p-3 bg-anchor-green/10 text-anchor-gold-vivid rounded-lg text-sm border border-anchor-green/30">
                            Recognized customer{knownCustomer?.full_name ? `: ${knownCustomer.full_name}` : ''}. You can continue with event details.
                        </div>
                    )}

                    {lookupState === 'unknown' && (
                        <div className="p-3 bg-anchor-gold/10 text-anchor-gold rounded-lg text-sm border border-anchor-gold/30">
                            {lookupDegraded
                                ? 'We could not verify this number right now. Please continue by entering your details below.'
                                : 'New customer detected. Please enter your personal details below.'}
                        </div>
                    )}
                </div>

                {detailsUnlocked && (
                    <div className="grid min-w-0 grid-cols-1 md:grid-cols-2 gap-6">
                        {!isKnownCustomer && (
                            <div className="space-y-4">
                                <h4 className="font-medium text-anchor-cream-text border-b border-anchor-gold/15 pb-2">Personal Details</h4>

                                <div>
                                    <label className="block text-sm font-medium text-anchor-cream-text/70 mb-1">First Name *</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.customer_first_name}
                                        onChange={e => {
                                            trackEnquiryStartedOnce()
                                            setFormData({ ...formData, customer_first_name: e.target.value })
                                        }}
                                        className="w-full px-4 py-2 bg-anchor-bg-card border border-anchor-gold/30 text-anchor-cream-text rounded-lg focus:ring-2 focus:ring-anchor-gold focus:border-anchor-gold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-anchor-cream-text/70 mb-1">Last Name *</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.customer_last_name || ''}
                                        onChange={e => {
                                            trackEnquiryStartedOnce()
                                            setFormData({ ...formData, customer_last_name: e.target.value })
                                        }}
                                        className="w-full px-4 py-2 bg-anchor-bg-card border border-anchor-gold/30 text-anchor-cream-text rounded-lg focus:ring-2 focus:ring-anchor-gold focus:border-anchor-gold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-anchor-cream-text/70 mb-1">Email (Optional)</label>
                                    <input
                                        type="email"
                                        value={formData.contact_email || ''}
                                        onChange={e => {
                                            trackEnquiryStartedOnce()
                                            setFormData({ ...formData, contact_email: e.target.value })
                                        }}
                                        className="w-full px-4 py-2 bg-anchor-bg-card border border-anchor-gold/30 text-anchor-cream-text rounded-lg focus:ring-2 focus:ring-anchor-gold focus:border-anchor-gold"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h4 className="font-medium text-anchor-cream-text border-b border-anchor-gold/15 pb-2">Event Details</h4>

                            <div>
                                <label className="block text-sm font-medium text-anchor-cream-text/70 mb-1">Preferred Date</label>
                                <input
                                    type="date"
                                    value={formData.event_date || ''}
                                    onChange={e => setFormData({ ...formData, event_date: e.target.value })}
                                    className="w-full px-4 py-2 bg-anchor-bg-card border border-anchor-gold/30 text-anchor-cream-text rounded-lg focus:ring-2 focus:ring-anchor-gold focus:border-anchor-gold"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-anchor-cream-text/70 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        value={formData.start_time || ''}
                                        onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                        className="w-full px-4 py-2 bg-anchor-bg-card border border-anchor-gold/30 text-anchor-cream-text rounded-lg focus:ring-2 focus:ring-anchor-gold focus:border-anchor-gold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-anchor-cream-text/70 mb-1">Approx Guests</label>
                                    <input
                                        type="number"
                                        value={formData.guest_count || 0}
                                        onChange={e => setFormData({ ...formData, guest_count: Number(e.target.value) })}
                                        className="w-full px-4 py-2 bg-anchor-bg-card border border-anchor-gold/30 text-anchor-cream-text rounded-lg focus:ring-2 focus:ring-anchor-gold focus:border-anchor-gold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-anchor-cream-text/70 mb-1">Event Type</label>
                                <select
                                    value={formData.event_type}
                                    onChange={e => setFormData({ ...formData, event_type: e.target.value })}
                                    className="w-full px-4 py-2 bg-anchor-bg-card border border-anchor-gold/30 text-anchor-cream-text rounded-lg focus:ring-2 focus:ring-anchor-gold focus:border-anchor-gold"
                                >
                                    <option>Birthday Party</option>
                                    <option>Corporate Event</option>
                                    <option>Wake / Memorial</option>
                                    <option>Christening / Baby Shower</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-anchor-cream-text/70 mb-1">Notes / Special Requests</label>
                                <textarea
                                    rows={3}
                                    value={formData.internal_notes || ''}
                                    onChange={e => setFormData({ ...formData, internal_notes: e.target.value })}
                                    className="w-full px-4 py-2 bg-anchor-bg-card border border-anchor-gold/30 text-anchor-cream-text rounded-lg focus:ring-2 focus:ring-anchor-gold focus:border-anchor-gold"
                                    placeholder="Any dietary requirements or special requests?"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {detailsUnlocked && (
                    <div className="pt-4 border-t border-anchor-gold/15 space-y-4">
                        {/* Honeypot, hidden from real users, filled by bots */}
                        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
                            <label htmlFor="prv-website">Website</label>
                            <input
                                id="prv-website"
                                name="website"
                                type="text"
                                tabIndex={-1}
                                autoComplete="off"
                                value={honeypot}
                                onChange={(e) => setHoneypot(e.target.value)}
                            />
                        </div>

                        {TURNSTILE_SITE_KEY && (
                            <TurnstileField
                                id="private-booking-turnstile"
                                turnstileRef={turnstileRef}
                                onTokenChange={setTurnstileToken}
                            />
                        )}

                        <button
                            type="submit"
                            disabled={loading || (TURNSTILE_SITE_KEY ? !turnstileToken : false)}
                            className="min-w-0 w-full max-w-full break-words px-6 py-3 bg-anchor-gold hover:bg-anchor-gold-vivid text-anchor-charcoal font-semibold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors md:w-auto md:px-8"
                        >
                            {loading ? 'Submitting...' : 'Send Inquiry'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    )
}
