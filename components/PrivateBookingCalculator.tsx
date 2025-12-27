'use client'

import { useState, useEffect, useMemo } from 'react'
import { PrivateBookingConfig, PrivateBookingItem, getPrivateBookingConfig, formatCurrency } from '@/lib/api'
import { PrivateBookingInquiryForm } from './PrivateBookingInquiryForm'

export function PrivateBookingCalculator() {
    const [config, setConfig] = useState<PrivateBookingConfig | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showInquiryForm, setShowInquiryForm] = useState(false)

    // Selection Request
    const [selectedSpaceId, setSelectedSpaceId] = useState<string>('')
    const [guestCount, setGuestCount] = useState<number>(30)
    const [hours, setHours] = useState<number>(4)
    const [selectedPackageId, setSelectedPackageId] = useState<string>('')
    const [selectedVendorIds, setSelectedVendorIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        async function fetchConfig() {
            try {
                const response = await getPrivateBookingConfig()
                if (response.success) {
                    setConfig(response.data)
                    // Set defaults
                    if (response.data.spaces.length > 0) setSelectedSpaceId(response.data.spaces[0].id)
                } else {
                    setError(response.error.message)
                }
            } catch (err) {
                setError('Failed to load pricing options')
            } finally {
                setLoading(false)
            }
        }
        fetchConfig()
    }, [])

    const selectedSpace = useMemo(() =>
        config?.spaces.find(s => s.id === selectedSpaceId), [config, selectedSpaceId]
    )

    const selectedPackage = useMemo(() =>
        config?.packages.find(p => p.id === selectedPackageId), [config, selectedPackageId]
    )

    const toggleVendor = (vendorId: string) => {
        const newSet = new Set(selectedVendorIds)
        if (newSet.has(vendorId)) newSet.delete(vendorId)
        else newSet.add(vendorId)
        setSelectedVendorIds(newSet)
    }

    // Calculate Totals and Generate Items
    const { total, items } = useMemo(() => {
        if (!config || !selectedSpace) return { total: 0, items: [] }

        let calculatedTotal = 0
        const generatedItems: PrivateBookingItem[] = []

        // 1. Venue Hire
        const spaceCost = (selectedSpace.rate_per_hour * hours) + selectedSpace.setup_fee
        calculatedTotal += spaceCost
        generatedItems.push({
            item_type: 'space',
            description: `${selectedSpace.name} Hire (${hours} hours)`,
            quantity: hours,
            unit_price: selectedSpace.rate_per_hour,
            line_total: spaceCost - selectedSpace.setup_fee, // Logic could be cleaner, but setup fee implies separate item potentially? 
            // Actually simpler to bundle for estimation or separate
            notes: `Includes £${selectedSpace.setup_fee} setup fee`
        })

        // 2. Catering
        if (selectedPackage) {
            const cateringCost = selectedPackage.cost_per_head * guestCount
            calculatedTotal += cateringCost
            generatedItems.push({
                item_type: 'catering',
                description: `${selectedPackage.name} (${guestCount} guests)`,
                quantity: guestCount,
                unit_price: selectedPackage.cost_per_head,
                line_total: cateringCost,
                package_id: selectedPackage.id
            })
        }

        // 3. Vendors
        selectedVendorIds.forEach(vendorId => {
            const vendor = config.vendors.find(v => v.id === vendorId)
            if (vendor && vendor.typical_rate) {
                calculatedTotal += vendor.typical_rate
                generatedItems.push({
                    item_type: 'vendor',
                    description: vendor.name,
                    quantity: 1,
                    unit_price: vendor.typical_rate,
                    line_total: vendor.typical_rate,
                    vendor_id: vendor.id
                })
            }
        })

        return { total: calculatedTotal, items: generatedItems }
    }, [config, selectedSpace, hours, guestCount, selectedPackage, selectedVendorIds])

    if (loading) return <div className="animate-pulse h-64 bg-slate-100 rounded-lg"></div>
    if (error) return <div className="p-4 text-red-600 bg-red-50 rounded-lg">Unable to load calculator: {error}</div>
    if (!config) return null

    if (showInquiryForm) {
        return (
            <PrivateBookingInquiryForm
                initialData={{
                    guest_count: guestCount,
                    items: items,
                    internal_notes: `Calculated Estimate: ${formatCurrency(total)}`,
                    event_type: 'Private Party'
                }}
                onCancel={() => setShowInquiryForm(false)}
            />
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Event Cost Estimator</h3>
                <p className="text-slate-600 text-sm mt-1">Select your options to get an instant price guide.</p>
            </div>

            <div className="p-6 space-y-8">
                {/* Space Selection */}
                <section>
                    <h4 className="font-medium text-slate-900 mb-4">1. Choose a Space</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {config.spaces.map(space => (
                            <label
                                key={space.id}
                                className={`relative flex flex-col p-4 cursor-pointer rounded-lg border-2 transition-all ${selectedSpaceId === space.id
                                        ? 'border-indigo-600 bg-indigo-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="space"
                                    value={space.id}
                                    checked={selectedSpaceId === space.id}
                                    onChange={(e) => setSelectedSpaceId(e.target.value)}
                                    className="sr-only"
                                />
                                <span className="font-semibold text-slate-900">{space.name}</span>
                                <span className="text-sm text-slate-600 mt-1">{formatCurrency(space.rate_per_hour)} / hour</span>
                                <span className="text-xs text-slate-500 mt-2">Capacity: {space.capacity_standing} standing / {space.capacity_seated} seated</span>
                            </label>
                        ))}
                    </div>
                </section>

                {/* Event Details */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Guest Count</label>
                        <input
                            type="number"
                            min="10"
                            max={selectedSpace?.capacity_standing || 200}
                            value={guestCount}
                            onChange={(e) => setGuestCount(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Duration (Hours)</label>
                        <input
                            type="number"
                            min={selectedSpace?.minimum_hours || 2}
                            max="12"
                            value={hours}
                            onChange={(e) => setHours(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </section>

                {/* Catering */}
                <section>
                    <h4 className="font-medium text-slate-900 mb-4">3. Add Catering (Optional)</h4>
                    <div className="space-y-3">
                        <label className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-slate-50 ${selectedPackageId === '' ? 'border-indigo-600 ring-1 ring-indigo-600' : 'border-slate-200'}`}>
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="catering"
                                    value=""
                                    checked={selectedPackageId === ''}
                                    onChange={() => setSelectedPackageId('')}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                />
                                <span className="ml-3 font-medium text-slate-900">No Catering / Room Only</span>
                            </div>
                        </label>

                        {config.packages.map(pkg => (
                            <label
                                key={pkg.id}
                                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-slate-50 ${selectedPackageId === pkg.id ? 'border-indigo-600 ring-1 ring-indigo-600' : 'border-slate-200'}`}
                            >
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="catering"
                                        value={pkg.id}
                                        checked={selectedPackageId === pkg.id}
                                        onChange={() => setSelectedPackageId(pkg.id)}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    />
                                    <div className="ml-3">
                                        <span className="block font-medium text-slate-900">{pkg.name}</span>
                                        <span className="block text-sm text-slate-500">{pkg.description}</span>
                                    </div>
                                </div>
                                <span className="text-slate-900 font-semibold">{formatCurrency(pkg.cost_per_head)} pp</span>
                            </label>
                        ))}
                    </div>
                </section>

                {/* Vendors */}
                {config.vendors.length > 0 && (
                    <section>
                        <h4 className="font-medium text-slate-900 mb-4">4. Extras & Services</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {config.vendors.map(vendor => (
                                <label key={vendor.id} className="flex items-start p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedVendorIds.has(vendor.id)}
                                        onChange={() => toggleVendor(vendor.id)}
                                        className="h-4 w-4 mt-1 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <div className="ml-3">
                                        <span className="block text-sm font-medium text-slate-900">{vendor.name}</span>
                                        <span className="block text-xs text-slate-500">Approx. {formatCurrency(vendor.typical_rate || 0)}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Footer Total */}
            <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <span className="block text-slate-400 text-sm uppercase tracking-wider font-semibold">Estimated Total</span>
                    <span className="text-3xl font-bold">{formatCurrency(total)}</span>
                </div>
                <button
                    onClick={() => setShowInquiryForm(true)}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-indigo-500/25 transition-all w-full md:w-auto text-center"
                >
                    Check Availability & Book
                </button>
            </div>
        </div>
    )
}
