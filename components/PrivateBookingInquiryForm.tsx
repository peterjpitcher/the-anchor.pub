'use client'

import { useState } from 'react'
import { PrivateBookingRequest, createPrivateBooking } from '@/lib/api'

interface Props {
    initialData?: Partial<PrivateBookingRequest>
    onCancel?: () => void
}

export function PrivateBookingInquiryForm({ initialData, onCancel }: Props) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState<PrivateBookingRequest>({
        customer_first_name: '',
        customer_last_name: '',
        contact_phone: '',
        contact_email: '',
        event_date: '',
        start_time: '19:00',
        guest_count: 50,
        event_type: 'Birthday Party',
        internal_notes: '',
        ...initialData
    })

    // Ensure items are preserved from initialData
    const bookingItems = initialData?.items || []

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const response = await createPrivateBooking({
                ...formData,
                items: bookingItems
            })

            if (response.success) {
                setSuccess(true)
            } else {
                setError(response.error.message || 'Something went wrong. Please try again.')
            }
        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-green-100 p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Inquiry Received!</h3>
                <p className="text-slate-600 mb-6">
                    We have received your details. Since this is a private booking, we need to confirm availability manually.
                    Expect a text message or call from us shortly!
                </p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="text-indigo-600 font-medium hover:text-indigo-800"
                >
                    Return to Home
                </button>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-slate-900">Complete Your Inquiry</h3>
                {onCancel && (
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
                        Cancel
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="font-medium text-slate-900 border-b pb-2">Contact Details</h4>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                            <input
                                required
                                type="text"
                                value={formData.customer_first_name}
                                onChange={e => setFormData({ ...formData, customer_first_name: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                value={formData.customer_last_name || ''}
                                onChange={e => setFormData({ ...formData, customer_last_name: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number *</label>
                            <p className="text-xs text-slate-500 mb-1">We'll text you to confirm availablity.</p>
                            <input
                                required
                                type="tel"
                                value={formData.contact_phone}
                                onChange={e => setFormData({ ...formData, contact_phone: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
                            <input
                                type="email"
                                value={formData.contact_email || ''}
                                onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-medium text-slate-900 border-b pb-2">Event Details</h4>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Date</label>
                            <input
                                type="date"
                                value={formData.event_date || ''}
                                onChange={e => setFormData({ ...formData, event_date: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    value={formData.start_time || ''}
                                    onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Approx Guests</label>
                                <input
                                    type="number"
                                    value={formData.guest_count || 0}
                                    onChange={e => setFormData({ ...formData, guest_count: Number(e.target.value) })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Event Type</label>
                            <select
                                value={formData.event_type}
                                onChange={e => setFormData({ ...formData, event_type: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option>Birthday Party</option>
                                <option>Wedding Reception</option>
                                <option>Corporate Event</option>
                                <option>Wake / Memorial</option>
                                <option>Christening / Baby Shower</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Special Requests</label>
                            <textarea
                                rows={3}
                                value={formData.internal_notes || ''}
                                onChange={e => setFormData({ ...formData, internal_notes: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="Any dietary requirements or special requests?"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Submitting...' : 'Send Inquiry'}
                    </button>
                </div>
            </form>
        </div>
    )
}
