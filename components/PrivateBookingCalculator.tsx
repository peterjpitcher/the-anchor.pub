'use client'

import { useState, useEffect, useMemo } from 'react'
import { PrivateBookingConfig, PrivateBookingItem, getPrivateBookingConfig, formatCurrency } from '@/lib/api'
import { PrivateBookingInquiryForm } from './PrivateBookingInquiryForm'
import { useCountdown } from '@/hooks/useCountdown'
import {
    PRIVATE_HIRE_2026_PROMO_DEPOSIT_DEADLINE_COPY,
    PRIVATE_HIRE_2026_PROMO_DISABLED_STORAGE_KEY,
    PRIVATE_HIRE_2026_PROMO_ENDS_AT_MS
} from '@/lib/promos/privateHire2026'

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
    const [promoActive, setPromoActive] = useState(false)
    const promoCountdown = useCountdown(PRIVATE_HIRE_2026_PROMO_ENDS_AT_MS, promoActive)

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

    useEffect(() => {
        if (typeof window === 'undefined') return

        const now = Date.now()
        const isEnded = now >= PRIVATE_HIRE_2026_PROMO_ENDS_AT_MS
        const isDisabled = window.localStorage.getItem(PRIVATE_HIRE_2026_PROMO_DISABLED_STORAGE_KEY) === 'true'

        setPromoActive(!isEnded && !isDisabled)
    }, [])

    useEffect(() => {
        if (!promoActive) return
        if (!promoCountdown.expired) return
        setPromoActive(false)
    }, [promoActive, promoCountdown.expired])

    const selectedSpace = useMemo(() =>
        config?.spaces.find(s => s.id === selectedSpaceId), [config, selectedSpaceId]
    )

    const promoCountdownText = useMemo(() => {
        if (!promoActive || promoCountdown.expired) return null
        const pad = (value: number) => String(value).padStart(2, '0')
        return `${promoCountdown.days}d ${pad(promoCountdown.hours)}h ${pad(promoCountdown.minutes)}m ${pad(promoCountdown.seconds)}s`
    }, [promoActive, promoCountdown.days, promoCountdown.expired, promoCountdown.hours, promoCountdown.minutes, promoCountdown.seconds])

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

    if (loading) return <div className="animate-pulse h-64 bg-anchor-bg-raised rounded-lg"></div>
    if (error) return <div className="p-4 text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg">Unable to load calculator: {error}</div>
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
        <div className="card-dark rounded-none overflow-hidden font-sans">
            {/* Header */}
            <div className="p-8 bg-anchor-bg-raised border-b border-anchor-gold/15 relative overflow-hidden">
                {/* Background Pattern Hint */}
                <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
                    <svg width="200" height="200" viewBox="0 0 100 100" fill="currentColor" className="text-anchor-green">
                        <path d="M50 0 L100 50 L50 100 L0 50 Z" />
                    </svg>
                </div>

                <div className="relative z-10">
                    <h3 className="text-3xl font-serif font-bold text-anchor-cream-text mb-2">Event Cost Estimator</h3>
                    <p className="text-anchor-cream-text/70 font-medium">Build your perfect gathering in seconds. Select options to see an instant estimate.</p>

                    {promoActive && (
                        <div className="mt-6 border border-anchor-gold/40 bg-anchor-bg-card p-5 relative overflow-hidden group transition-shadow">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-anchor-gold/10 to-transparent rounded-bl-full -mr-8 -mt-8"></div>

                            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-anchor-gold-vivid flex items-center gap-2 mb-1">
                                        <span className="text-lg"></span>
                                        <span className="uppercase tracking-wider text-xs">Limited Time Offer</span>
                                    </p>
                                    <p className="text-anchor-cream-text/70 text-sm leading-relaxed">
                                        Book a 2026 event now to receive <span className="font-bold text-anchor-gold-vivid bg-anchor-gold/10 px-1 rounded">4 FREE bottles of prosecco</span>.
                                        <span className="block text-xs text-anchor-cream-text/55 mt-1">Min 30 guests to qualify. Deposit required by <span className="font-semibold">{PRIVATE_HIRE_2026_PROMO_DEPOSIT_DEADLINE_COPY}</span>.</span>
                                    </p>
                                </div>
                                {promoCountdownText && (
                                    <div className="flex-shrink-0 bg-anchor-bg-raised px-4 py-2 rounded-lg border border-anchor-gold/30 text-center min-w-[140px]">
                                        <span className="text-[10px] text-anchor-cream-text/55 font-bold uppercase tracking-widest block mb-1">Offer Ends In</span>
                                        <span className="font-mono text-anchor-cream-text font-bold text-lg">{promoCountdownText}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-8 space-y-12 bg-anchor-bg-card">
                {/* Space Selection */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="flex items-center justify-center w-7 h-7 border border-anchor-gold/50 text-anchor-gold-vivid text-xs font-bold">1</span>
                        <h4 className="font-serif text-xl font-bold text-anchor-cream-text">Choose a Space</h4>
                        <a href="/our-pub" className="ml-auto text-sm text-anchor-gold font-semibold hover:text-anchor-gold-vivid hover:underline">
                            See photos &rarr;
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {config.spaces.map(space => (
                            <label
                                key={space.id}
                                className={`relative flex flex-col p-6 cursor-pointer border-2 transition-all duration-200 group ${selectedSpaceId === space.id
                                    ? 'border-anchor-gold-vivid bg-anchor-gold-vivid/8'
                                    : 'border-anchor-gold/20 hover:border-anchor-gold/50 bg-anchor-bg-raised'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`font-serif font-bold text-xl transition-colors ${selectedSpaceId === space.id ? 'text-anchor-gold-vivid' : 'text-anchor-cream-text group-hover:text-anchor-gold-vivid'}`}>
                                        {space.name}
                                    </span>
                                    {selectedSpaceId === space.id && (
                                        <div className="text-anchor-gold-vivid">
                                            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto space-y-4">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-anchor-gold">{formatCurrency(space.rate_per_hour)}</span>
                                        <span className="text-anchor-cream-text/55 font-medium text-sm">/ hour</span>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-anchor-cream-text/55 font-bold uppercase tracking-wider pt-4 border-t border-anchor-gold/15">
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-anchor-cream-text/55" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                            {space.capacity_standing} Standing
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-anchor-cream-text/55" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                            {space.capacity_seated} Seated
                                        </div>
                                    </div>
                                </div>

                                <input
                                    type="radio"
                                    name="space"
                                    value={space.id}
                                    checked={selectedSpaceId === space.id}
                                    onChange={(e) => setSelectedSpaceId(e.target.value)}
                                    className="sr-only"
                                />
                            </label>
                        ))}
                    </div>
                </section>

                {/* Event Details */}
                <section className="bg-anchor-bg-raised p-8 border border-anchor-gold/15">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="flex items-center justify-center w-7 h-7 border border-anchor-gold/50 text-anchor-gold-vivid text-xs font-bold">2</span>
                        <h4 className="font-serif text-xl font-bold text-anchor-cream-text">Event Details</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-bold text-anchor-cream-text/70 mb-2 uppercase tracking-wide">Number of Guests</label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    min="10"
                                    max={selectedSpace?.capacity_standing || 200}
                                    value={guestCount}
                                    onChange={(e) => setGuestCount(Number(e.target.value))}
                                    className="w-full pl-5 pr-16 py-4 bg-anchor-bg-card border border-anchor-gold/30 rounded-none focus:ring-2 focus:ring-anchor-gold focus:border-anchor-gold transition-all font-bold text-xl text-anchor-cream-text group-hover:border-anchor-gold/50"
                                />
                                <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-anchor-cream-text/55 font-medium uppercase text-xs tracking-wider">
                                    Guests
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-anchor-cream-text/70 mb-2 uppercase tracking-wide">Duration</label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    min={selectedSpace?.minimum_hours || 2}
                                    max="12"
                                    value={hours}
                                    onChange={(e) => setHours(Number(e.target.value))}
                                    className="w-full pl-5 pr-16 py-4 bg-anchor-bg-card border border-anchor-gold/30 rounded-none focus:ring-2 focus:ring-anchor-gold focus:border-anchor-gold transition-all font-bold text-xl text-anchor-cream-text group-hover:border-anchor-gold/50"
                                />
                                <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-anchor-cream-text/55 font-medium uppercase text-xs tracking-wider">
                                    Hours
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Catering */}
                <section>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-7 h-7 border border-anchor-gold/50 text-anchor-gold-vivid text-xs font-bold">3</span>
                            <div>
                                <h4 className="font-serif text-xl font-bold text-anchor-cream-text">Catering & Drinks</h4>
                                <p className="text-sm text-anchor-cream-text/55 mt-1">Add food packages or drinks tokens</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsAddingItem(true)}
                            className="text-sm bg-anchor-bg-raised border border-dashed border-anchor-gold/40 text-anchor-gold-vivid font-bold px-6 py-3 rounded-none hover:bg-anchor-gold-vivid hover:text-anchor-bg hover:border-anchor-gold-vivid transition-all flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Packages
                        </button>
                    </div>

                    <div className="space-y-4">
                        {selectedPackages.length === 0 && (
                            <div className="text-center py-10 bg-anchor-bg-raised border border-dashed border-anchor-gold/25">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-anchor-bg-card text-anchor-cream-text/55 mb-3">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.25 4.75H4.75D3.64543 4.75 2.75 5.64543 2.75 6.75V19.25L5.75 16.25L8.75 19.25L11.75 16.25L14.75 19.25L17.75 16.25L20.75 19.25V6.75C20.75 5.64543 19.8546 4.75 18.75 4.75H19.25Z" /></svg>
                                </div>
                                <p className="text-anchor-cream-text/55 font-medium mb-1">No catering items selected.</p>
                                <button onClick={() => setIsAddingItem(true)} className="text-anchor-gold font-bold hover:underline text-sm">Browse Menu Options</button>
                            </div>
                        )}

                        {selectedPackages.map(selection => {
                            const pkg = config.packages.find(p => p.id === selection.id)
                            if (!pkg) return null
                            return (
                                <div key={selection.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-anchor-bg-raised border border-anchor-gold/15 hover:border-anchor-gold/40 transition-all group">
                                    <div className="flex-1 mb-4 md:mb-0 pr-4">
                                        <div className="flex items-center justify-between md:justify-start gap-3">
                                            <span className="font-serif font-bold text-anchor-cream-text text-lg group-hover:text-anchor-gold-vivid transition-colors">{pkg.name}</span>
                                            <span className="md:hidden bg-anchor-bg-card text-anchor-cream-text/70 text-xs font-bold px-2 py-1 rounded">{formatPrice(pkg.cost_per_head)}</span>
                                        </div>
                                        <div className="text-sm text-anchor-gold font-bold mt-1 hidden md:block">{formatPrice(pkg.cost_per_head)}</div>
                                    </div>

                                    <div className="flex items-center justify-between gap-6 bg-anchor-bg-card p-3 rounded-xl md:bg-transparent md:p-0">
                                        <div className="flex items-center gap-3">
                                            <label className="text-[10px] text-anchor-cream-text/55 font-bold uppercase tracking-wider hidden sm:block">Update Qty</label>
                                            <div className="flex items-center bg-anchor-bg-card border border-anchor-gold/30 overflow-hidden focus-within:ring-2 focus-within:ring-anchor-gold focus-within:border-anchor-gold">
                                                <input
                                                    type="number"
                                                    min={pkg.minimum_guests || 1}
                                                    max={guestCount}
                                                    value={selection.quantity}
                                                    onChange={(e) => updatePackageQuantity(pkg.id, Number(e.target.value))}
                                                    className="w-16 h-10 px-2 text-center font-bold text-anchor-cream-text outline-none bg-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <span className="block text-xs text-anchor-cream-text/55 font-medium uppercase">Subtotal</span>
                                                <span className="block font-bold text-anchor-cream-text text-lg tabular-nums">{formatCurrency(pkg.cost_per_head * selection.quantity)}</span>
                                            </div>
                                            <button
                                                onClick={() => removePackage(pkg.id)}
                                                className="w-10 h-10 flex items-center justify-center rounded-full text-anchor-cream-text/55 hover:text-red-400 hover:bg-red-900/20 transition-all"
                                                title="Remove"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Add Item Modal */}
                    {isAddingItem && (
                        <div className="fixed inset-0 bg-anchor-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen" onClick={() => setIsAddingItem(false)}>
                            <div className="card-dark rounded-none shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-fade-up" onClick={e => e.stopPropagation()}>
                                <div className="p-6 border-b border-anchor-gold/15 flex justify-between items-center bg-anchor-bg-raised rounded-t-none z-20">
                                    <div>
                                        <h3 className="font-serif font-bold text-2xl text-anchor-cream-text">Add to your Package</h3>
                                        <p className="text-sm text-anchor-cream-text/55">Select food and drink options to add to your estimate.</p>
                                    </div>
                                    <button onClick={() => setIsAddingItem(false)} className="w-10 h-10 rounded-full bg-anchor-bg-card flex items-center justify-center text-anchor-cream-text/55 hover:text-anchor-cream-text hover:bg-anchor-bg-raised transition-all">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-2 md:p-6">
                                    {availablePackages.length === 0 ? (
                                        <div className="text-center py-12">
                                            <p className="text-lg text-anchor-cream-text/55 font-medium">You've selected all available options!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {foodPackages.length > 0 && (
                                                <div>
                                                    <h4 className="flex items-center gap-2 text-xs font-bold text-anchor-gold uppercase tracking-widest mb-4 px-2">
                                                        <span className="w-8 h-[2px] bg-anchor-gold"></span> Food Menus
                                                    </h4>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {foodPackages.map(pkg => (
                                                            <button
                                                                key={pkg.id}
                                                                onClick={() => addPackage(pkg.id)}
                                                                className="w-full text-left p-4 hover:bg-anchor-bg-raised transition-all border border-transparent hover:border-anchor-gold/20 flex justify-between items-center group relative overflow-hidden"
                                                            >
                                                                <div className="relative z-10 pr-4">
                                                                    <div className="font-serif font-bold text-lg text-anchor-cream-text group-hover:text-anchor-gold-vivid">{pkg.name}</div>
                                                                    {pkg.guest_description && <div className="text-sm text-anchor-cream-text/55 mt-1 leading-relaxed max-w-md">{pkg.guest_description}</div>}
                                                                </div>
                                                                <div className="relative z-10 flex flex-col items-end">
                                                                    <div className="text-anchor-gold-vivid font-bold text-lg whitespace-nowrap bg-anchor-bg-raised px-3 py-1 group-hover:bg-anchor-bg-card transition-colors">
                                                                        {formatPrice(pkg.cost_per_head)}
                                                                    </div>
                                                                    <div className="text-[10px] text-anchor-gold font-bold uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                                                        Add +
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {drinkPackages.length > 0 && (
                                                <div>
                                                    <h4 className="flex items-center gap-2 text-xs font-bold text-anchor-gold uppercase tracking-widest mb-4 px-2">
                                                        <span className="w-8 h-[2px] bg-anchor-gold"></span> Drink Packages
                                                    </h4>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {drinkPackages.map(pkg => (
                                                            <button
                                                                key={pkg.id}
                                                                onClick={() => addPackage(pkg.id)}
                                                                className="w-full text-left p-4 hover:bg-anchor-bg-raised transition-all border border-transparent hover:border-anchor-gold/20 flex justify-between items-center group"
                                                            >
                                                                <div className="pr-4">
                                                                    <div className="font-serif font-bold text-anchor-cream-text group-hover:text-anchor-gold-vivid">{pkg.name}</div>
                                                                    {pkg.guest_description && <div className="text-sm text-anchor-cream-text/55 mt-1">{pkg.guest_description}</div>}
                                                                </div>
                                                                <div className="text-anchor-gold-vivid font-bold text-lg whitespace-nowrap bg-anchor-bg-raised px-3 py-1">
                                                                    {formatPrice(pkg.cost_per_head)}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {addonPackages.length > 0 && (
                                                <div>
                                                    <h4 className="flex items-center gap-2 text-xs font-bold text-anchor-gold uppercase tracking-widest mb-4 px-2">
                                                        <span className="w-8 h-[2px] bg-anchor-gold"></span> Extras
                                                    </h4>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {addonPackages.map(pkg => (
                                                            <button
                                                                key={pkg.id}
                                                                onClick={() => addPackage(pkg.id)}
                                                                className="w-full text-left p-4 hover:bg-anchor-bg-raised transition-all border border-transparent hover:border-anchor-gold/20 flex justify-between items-center group"
                                                            >
                                                                <div className="pr-4">
                                                                    <div className="font-serif font-bold text-anchor-cream-text group-hover:text-anchor-gold-vivid">{pkg.name}</div>
                                                                    {pkg.guest_description && <div className="text-sm text-anchor-cream-text/55 mt-1">{pkg.guest_description}</div>}
                                                                </div>
                                                                <div className="text-anchor-gold-vivid font-bold text-lg whitespace-nowrap bg-anchor-bg-raised px-3 py-1">
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
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex items-center justify-center w-7 h-7 border border-anchor-gold/50 text-anchor-gold-vivid text-xs font-bold">4</span>
                            <h4 className="font-serif text-xl font-bold text-anchor-cream-text">Recommended Services</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {config.vendors.map(vendor => (
                                <label key={vendor.id} className={`flex items-start p-4 border cursor-pointer transition-all duration-200 ${selectedVendorIds.has(vendor.id) ? 'border-anchor-gold-vivid bg-anchor-gold-vivid/8' : 'border-anchor-gold/20 hover:border-anchor-gold/40 bg-anchor-bg-raised'}`}>
                                    <div className="relative flex items-center h-6 mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={selectedVendorIds.has(vendor.id)}
                                            onChange={() => toggleVendor(vendor.id)}
                                            className="h-5 w-5 rounded-none border-anchor-gold/30 focus:ring-anchor-gold accent-[#c9a020]"
                                        />
                                    </div>
                                    <div className="ml-4">
                                        <span className={`block text-lg font-bold ${selectedVendorIds.has(vendor.id) ? 'text-anchor-gold-vivid' : 'text-anchor-cream-text'}`}>{vendor.name}</span>
                                        <span className="block text-sm text-anchor-cream-text/55 mt-0.5">Approx. {formatCurrency(vendor.typical_rate || 0)}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Footer Total */}
            <div className="p-8 bg-anchor-bg flex flex-col md:flex-row items-center justify-between gap-6 border-t border-anchor-gold/25">
                <div className="flex flex-col items-center md:items-start w-full md:w-auto">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="h-px w-5 bg-anchor-gold/55" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-anchor-gold-vivid">Estimated Event Total</span>
                        <span className="h-px w-5 bg-anchor-gold/55" aria-hidden="true" />
                    </div>
                    <span className="text-5xl font-serif font-bold text-anchor-cream-text tracking-tight">{formatCurrency(total)}</span>
                </div>

                <button
                    onClick={() => setShowInquiryForm(true)}
                    className="group px-8 py-4 bg-anchor-gold-vivid hover:bg-anchor-gold text-anchor-bg font-bold text-lg rounded-none transition-all w-full md:w-auto flex items-center justify-center gap-2"
                >
                    Check Availability
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
