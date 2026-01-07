'use client'

import { useState, useEffect, useMemo } from 'react'
import { PrivateBookingConfig, PrivateBookingItem, getPrivateBookingConfig, formatCurrency } from '@/lib/api'
import { PrivateBookingInquiryForm } from './PrivateBookingInquiryForm'

interface PrivateBookingCalculatorProps {
    eventType?: string
}

export function PrivateBookingCalculator({ eventType }: PrivateBookingCalculatorProps) {
    const [config, setConfig] = useState<PrivateBookingConfig | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showInquiryForm, setShowInquiryForm] = useState(false)

    // Selection Request
    const [selectedSpaceId, setSelectedSpaceId] = useState<string>('')
    const [guestCount, setGuestCount] = useState<number>(30)
    const [hours, setHours] = useState<number>(4)
    const [selectedPackages, setSelectedPackages] = useState<Array<{ id: string, quantity: number }>>([])
    const [selectedVendorIds, setSelectedVendorIds] = useState<Set<string>>(new Set())

    // UI State
    const [isAddingItem, setIsAddingItem] = useState(false)

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

    const toggleVendor = (vendorId: string) => {
        const newSet = new Set(selectedVendorIds)
        if (newSet.has(vendorId)) newSet.delete(vendorId)
        else newSet.add(vendorId)
        setSelectedVendorIds(newSet)
    }

    const addPackage = (packageId: string) => {
        if (!selectedPackages.find(p => p.id === packageId)) {
            setSelectedPackages([...selectedPackages, { id: packageId, quantity: guestCount }])
        }
        setIsAddingItem(false)
    }

    const removePackage = (packageId: string) => {
        setSelectedPackages(selectedPackages.filter(p => p.id !== packageId))
    }

    const updatePackageQuantity = (packageId: string, quantity: number) => {
        setSelectedPackages(selectedPackages.map(p =>
            p.id === packageId ? { ...p, quantity } : p
        ))
    }

    // Calculate Totals and Generate Items
    const { total, items } = useMemo(() => {
        if (!config || !selectedSpace) return { total: 0, items: [] }

        let calculatedTotal = 0
        const generatedItems: PrivateBookingItem[] = []

        // 1. Venue Hire
        // 1. Venue Hire
        const setupFee = Number(selectedSpace.setup_fee)
        const hourlyRate = Number(selectedSpace.rate_per_hour)
        const spaceCost = (hourlyRate * hours) + setupFee
        calculatedTotal += spaceCost
	        generatedItems.push({
	            item_type: 'space',
	            space_id: selectedSpace.id,
	            description: `${selectedSpace.name} Hire (${hours} hours)`,
	            quantity: hours,
	            unit_price: hourlyRate,
	            line_total: spaceCost - setupFee,
	            notes: `Includes ${formatCurrency(setupFee)} setup fee`
	        })

        // 2. Catering
        selectedPackages.forEach(selection => {
            const pkg = config.packages.find(p => p.id === selection.id)
            if (pkg) {
                const costPerHead = Number(pkg.cost_per_head)
                const cost = costPerHead * selection.quantity
                calculatedTotal += cost
                generatedItems.push({
                    item_type: 'catering',
                    description: `${pkg.name} (${selection.quantity} guests)`,
                    quantity: selection.quantity,
                    unit_price: costPerHead,
                    line_total: cost,
                    package_id: pkg.id
                })
            }
        })

        // 3. Vendors
        selectedVendorIds.forEach(vendorId => {
            const vendor = config.vendors.find(v => v.id === vendorId)
            if (vendor && vendor.typical_rate) {
                const rate = Number(vendor.typical_rate)
                calculatedTotal += rate
                generatedItems.push({
                    item_type: 'vendor',
                    description: vendor.name,
                    quantity: 1,
                    unit_price: rate,
                    line_total: rate,
                    vendor_id: vendor.id
                })
            }
        })

        return { total: calculatedTotal, items: generatedItems }
    }, [config, selectedSpace, hours, selectedPackages, selectedVendorIds])

    if (loading) return <div className="animate-pulse h-64 bg-slate-100 rounded-lg"></div>
    if (error) return <div className="p-4 text-red-600 bg-red-50 rounded-lg">Unable to load calculator: {error}</div>
    if (!config) return null

    const inquiryData = {
        guest_count: guestCount,
        items,
        internal_notes: `Calculated Estimate: ${formatCurrency(total)}`,
        ...(eventType ? { event_type: eventType } : {})
    }

    if (showInquiryForm) {
        return (
            <PrivateBookingInquiryForm
                initialData={inquiryData}
                onCancel={() => setShowInquiryForm(false)}
            />
        )
    }

    // Group available packages
    const availablePackages = config.packages.filter(p => !selectedPackages.find(sp => sp.id === p.id))

    // Sort helper
    const byPrice = (a: typeof config.packages[0], b: typeof config.packages[0]) => a.cost_per_head - b.cost_per_head

    const foodPackages = availablePackages.filter(p => !p.category || p.category === 'food').sort(byPrice)
    const drinkPackages = availablePackages.filter(p => p.category === 'drink').sort(byPrice)
    const addonPackages = availablePackages.filter(p => p.category === 'addon').sort(byPrice)

    const formatPrice = (price: number) => price === 0 ? 'Price on Enquiry' : `${formatCurrency(price)} pp`

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
                        <label className="block text-sm font-medium text-slate-700 mb-2">Total Guests</label>
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
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-slate-900">3. Catering & Drinks</h4>
                        <button
                            onClick={() => setIsAddingItem(true)}
                            className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Option
                        </button>
                    </div>

                    <div className="space-y-4">
                        {selectedPackages.length === 0 && (
                            <div className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-lg text-center border border-slate-100">
                                No catering selected. Use "Add Option" to choose food or drinks.
                            </div>
                        )}

                        {selectedPackages.map(selection => {
                            const pkg = config.packages.find(p => p.id === selection.id)
                            if (!pkg) return null
                            return (
                                <div key={selection.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                                    <div className="flex-1">
                                        <div className="font-medium text-slate-900">{pkg.name}</div>
                                        <div className="text-sm text-slate-500">{formatPrice(pkg.cost_per_head)}</div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs text-slate-500 uppercase font-semibold">Qty</label>
                                            <input
                                                type="number"
                                                min={pkg.minimum_guests || 1}
                                                max={guestCount}
                                                value={selection.quantity}
                                                onChange={(e) => updatePackageQuantity(pkg.id, Number(e.target.value))}
                                                className="w-20 px-2 py-1 text-right border border-slate-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div className="w-24 text-right font-semibold text-slate-900">
                                            {formatCurrency(pkg.cost_per_head * selection.quantity)}
                                        </div>
                                        <button
                                            onClick={() => removePackage(pkg.id)}
                                            className="text-slate-400 hover:text-red-600 transition-colors"
                                            title="Remove"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Add Item Modal/Dropdown Area */}
                    {isAddingItem && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsAddingItem(false)}>
                            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
                                    <h3 className="font-semibold text-lg text-slate-900">Add Service</h3>
                                    <button onClick={() => setIsAddingItem(false)} className="text-slate-400 hover:text-slate-600">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="p-2">
                                    {availablePackages.length === 0 ? (
                                        <p className="p-4 text-center text-slate-500">No more options available.</p>
                                    ) : (
                                        <div className="space-y-6 p-2">
                                            {foodPackages.length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Food Menus</h4>
                                                    <div className="space-y-1">
                                                        {foodPackages.map(pkg => (
                                                            <button
                                                                key={pkg.id}
                                                                onClick={() => addPackage(pkg.id)}
                                                                className="w-full text-left p-3 hover:bg-slate-50 rounded-lg transition-colors flex justify-between items-center group"
                                                            >
                                                                <div>
                                                                    <div className="font-medium text-slate-900 group-hover:text-indigo-700">{pkg.name}</div>
                                                                    {pkg.description && <div className="text-sm text-slate-500">{pkg.description}</div>}
                                                                </div>
                                                                <div className="text-indigo-600 font-semibold text-sm whitespace-nowrap pl-2">
                                                                    {formatPrice(pkg.cost_per_head)}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {drinkPackages.length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Drinks Packages</h4>
                                                    <div className="space-y-1">
                                                        {drinkPackages.map(pkg => (
                                                            <button
                                                                key={pkg.id}
                                                                onClick={() => addPackage(pkg.id)}
                                                                className="w-full text-left p-3 hover:bg-slate-50 rounded-lg transition-colors flex justify-between items-center group"
                                                            >
                                                                <div>
                                                                    <div className="font-medium text-slate-900 group-hover:text-indigo-700">{pkg.name}</div>
                                                                    {pkg.description && <div className="text-sm text-slate-500">{pkg.description}</div>}
                                                                </div>
                                                                <div className="text-indigo-600 font-semibold text-sm whitespace-nowrap pl-2">
                                                                    {formatPrice(pkg.cost_per_head)}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {addonPackages.length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Add-ons</h4>
                                                    <div className="space-y-1">
                                                        {addonPackages.map(pkg => (
                                                            <button
                                                                key={pkg.id}
                                                                onClick={() => addPackage(pkg.id)}
                                                                className="w-full text-left p-3 hover:bg-slate-50 rounded-lg transition-colors flex justify-between items-center group"
                                                            >
                                                                <div>
                                                                    <div className="font-medium text-slate-900 group-hover:text-indigo-700">{pkg.name}</div>
                                                                    {pkg.description && <div className="text-sm text-slate-500">{pkg.description}</div>}
                                                                </div>
                                                                <div className="text-indigo-600 font-semibold text-sm whitespace-nowrap pl-2">
                                                                    {formatPrice(pkg.cost_per_head)}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
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
