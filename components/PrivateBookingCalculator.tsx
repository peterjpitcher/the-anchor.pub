'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { PrivateBookingConfig, PrivateBookingItem, getPrivateBookingConfig, formatCurrency } from '@/lib/api'
import { cn } from '@/lib/utils'
import { PrivateBookingInquiryForm } from './PrivateBookingInquiryForm'
import { useCountdown } from '@/hooks/useCountdown'
import { trackQuoteToolCompleted, trackQuoteToolStarted } from '@/lib/gtm-events'
import {
    PRIVATE_HIRE_2026_PROMO_DEPOSIT_DEADLINE_COPY,
    PRIVATE_HIRE_2026_PROMO_DISABLED_STORAGE_KEY,
    PRIVATE_HIRE_2026_PROMO_ENDS_AT_MS
} from '@/lib/promos/privateHire2026'

interface PrivateBookingCalculatorProps {
    eventType?: string
    compact?: boolean
    quoteStartedOnMount?: boolean
}

const EVENT_TYPE_OPTIONS = [
    'Birthday Party',
    'Wake / Memorial',
    'Christening / Baby Shower',
    'Corporate Event',
    'Retirement Party',
    'Christmas Party',
    'Other'
]

export function PrivateBookingCalculator({ eventType, compact = false, quoteStartedOnMount = false }: PrivateBookingCalculatorProps) {
    const [config, setConfig] = useState<PrivateBookingConfig | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showInquiryForm, setShowInquiryForm] = useState(false)

    // Selection Request
    const [selectedDate, setSelectedDate] = useState<string>('')
    const [selectedEventType, setSelectedEventType] = useState<string>(eventType || 'Birthday Party')
    const [selectedSpaceId, setSelectedSpaceId] = useState<string>('')
    const [guestCount, setGuestCount] = useState<number>(30)
    const [hours, setHours] = useState<number>(4)
    const [selectedPackages, setSelectedPackages] = useState<Array<{ id: string, quantity: number }>>([])
    const [selectedVendorIds, setSelectedVendorIds] = useState<Set<string>>(new Set())
    const quoteStartedRef = useRef(quoteStartedOnMount)

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
        if (eventType) setSelectedEventType(eventType)
    }, [eventType])

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

    const trackQuoteStartedOnce = (overrideEventType = selectedEventType) => {
        if (quoteStartedRef.current) return
        quoteStartedRef.current = true
        trackQuoteToolStarted({
            eventType: overrideEventType,
            guestCount,
            pageSource: typeof window !== 'undefined' ? window.location.pathname : ''
        })
    }

    const toggleVendor = (vendorId: string) => {
        trackQuoteStartedOnce()
        const newSet = new Set(selectedVendorIds)
        if (newSet.has(vendorId)) newSet.delete(vendorId)
        else newSet.add(vendorId)
        setSelectedVendorIds(newSet)
    }

    const addPackage = (packageId: string) => {
        trackQuoteStartedOnce()
        if (!selectedPackages.find(p => p.id === packageId)) {
            setSelectedPackages([...selectedPackages, { id: packageId, quantity: guestCount }])
        }
        setIsAddingItem(false)
    }

    const removePackage = (packageId: string) => {
        trackQuoteStartedOnce()
        setSelectedPackages(selectedPackages.filter(p => p.id !== packageId))
    }

    const updatePackageQuantity = (packageId: string, quantity: number) => {
        trackQuoteStartedOnce()
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

    if (loading) return <div className="animate-pulse h-64 bg-surface-sunk rounded-md"></div>
    if (error) return <div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg">Unable to load calculator: {error}</div>
    if (!config) return null

    const inquiryData = {
        guest_count: guestCount,
        items,
        internal_notes: `Calculated Estimate: ${formatCurrency(total)}`,
        event_type: selectedEventType,
        event_date: selectedDate
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
        <div className="bg-surface rounded-md overflow-hidden font-sans border border-line shadow-sm">
            {/* Header — hidden in compact mode since the drawer provides its own */}
            {compact ? (
                promoActive && (
                    <div className="p-4 bg-surface-sunk border-b border-line">
                        <div className="border border-anchor-gold-dark/40 bg-anchor-green/5 p-3">
                            <p className="text-xs font-bold text-accent-text flex items-center gap-2 mb-0.5">
                                <span className="text-sm">🥂</span>
                                <span className="uppercase tracking-wider text-xs">Limited Time Offer</span>
                            </p>
                            <p className="text-xs text-ink-muted leading-relaxed">
                                Book a 2026 event now to receive <span className="font-bold text-accent-text bg-anchor-gold-dark/10 px-1 rounded">4 FREE bottles of prosecco</span>.
                                <span className="block text-xs text-ink-muted mt-0.5">Min 30 guests. Deposit by <span className="font-semibold">{PRIVATE_HIRE_2026_PROMO_DEPOSIT_DEADLINE_COPY}</span>.</span>
                            </p>
                        </div>
                    </div>
                )
            ) : (
                <div className="p-8 bg-surface-sunk border-b border-line relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
                        <svg width="200" height="200" viewBox="0 0 100 100" fill="currentColor" className="text-anchor-green">
                            <path d="M50 0 L100 50 L50 100 L0 50 Z" />
                        </svg>
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-3xl font-display text-ink-strong mb-1">Event Cost Estimator</h3>
                        <p className="text-base text-ink-muted font-medium">Build your perfect gathering in seconds. Select options to see an instant estimate.</p>

                        {promoActive && (
                            <div className="mt-6 p-5 border border-anchor-gold-dark/40 bg-anchor-green/5 relative overflow-hidden group transition-shadow">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-anchor-gold-dark/10 to-transparent rounded-bl-full -mr-8 -mt-8"></div>

                                <div className="relative z-10 flex min-w-0 flex-col md:flex-row md:items-center gap-4">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-accent-text flex items-center gap-2 mb-1">
                                            <span className="text-lg">🥂</span>
                                            <span className="uppercase tracking-wider text-xs">Limited Time Offer</span>
                                        </p>
                                        <p className="text-sm text-ink-muted leading-relaxed">
                                            Book a 2026 event now to receive <span className="font-bold text-accent-text bg-anchor-gold-dark/10 px-1 rounded">4 FREE bottles of prosecco</span>.
                                            <span className="block text-xs text-ink-muted mt-1">Min 30 guests to qualify. Deposit required by <span className="font-semibold">{PRIVATE_HIRE_2026_PROMO_DEPOSIT_DEADLINE_COPY}</span>.</span>
                                        </p>
                                    </div>
                                    {promoCountdownText && (
                                        <div className="flex-shrink-0 bg-surface px-4 py-2 rounded-lg border border-line-strong text-center sm:min-w-[140px]">
                                            <span className="text-[10px] text-ink-muted font-bold uppercase tracking-widest block mb-1">Offer Ends In</span>
                                            <span className="font-mono text-ink-strong font-bold text-lg">{promoCountdownText}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className={cn(compact ? 'p-4 space-y-6' : 'p-8 space-y-12', 'bg-surface')}>
                {/* Step 1: Event Date */}
                <section>
                    <div className={cn('flex items-center gap-2', compact ? 'mb-3' : 'mb-6')}>
                        <span className={cn(compact ? 'w-5 h-5 text-[10px]' : 'w-7 h-7 text-xs', 'flex items-center justify-center border border-anchor-gold-dark/50 text-accent-text font-bold')}>1</span>
                        <h4 className={cn(compact ? 'text-sm' : 'font-display text-xl', 'font-bold text-ink-strong')}>When is your event?</h4>
                    </div>
                    <div className={cn(compact ? 'max-w-full' : 'max-w-xs')}>
                        <input
                            type="date"
                            value={selectedDate}
                            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                            onChange={(e) => {
                                trackQuoteStartedOnce()
                                setSelectedDate(e.target.value)
                            }}
                            data-native-date-time="true"
                            className={cn(
                                'block w-full min-w-0 max-w-full bg-surface border-[1.5px] border-line-strong rounded-sm focus:outline-none focus:ring-4 focus:ring-anchor-gold-dark/10 focus:border-anchor-gold-dark transition-all font-bold text-ink',
                                compact ? 'px-3 py-2 text-sm' : 'px-5 py-4 text-xl',
                                !selectedDate && 'text-ink-muted'
                            )}
                        />
                    </div>
                </section>

                {/* Step 2: Event Type */}
                <section>
                    <div className={cn('flex items-center gap-2', compact ? 'mb-3' : 'mb-6')}>
                        <span className={cn(compact ? 'w-5 h-5 text-[10px]' : 'w-7 h-7 text-xs', 'flex items-center justify-center border border-anchor-gold-dark/50 text-accent-text font-bold')}>2</span>
                        <h4 className={cn(compact ? 'text-sm' : 'font-display text-xl', 'font-bold text-ink-strong')}>Choose Event Type</h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {EVENT_TYPE_OPTIONS.map((option) => {
                            const selected = selectedEventType === option
                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => {
                                        trackQuoteStartedOnce(option)
                                        setSelectedEventType(option)
                                    }}
                                    className={cn(
                                        compact ? 'px-2.5 py-1.5 text-sm' : 'px-4 py-2 text-sm',
                                        'font-semibold transition-all',
                                        selected
                                            ? 'bg-anchor-green text-white'
                                            : 'border border-line-strong text-ink hover:border-anchor-gold-dark hover:text-accent-text'
                                    )}
                                    aria-pressed={selected}
                                >
                                    {option}
                                </button>
                            )
                        })}
                    </div>
                </section>

                {/* Space Selection */}
                <section>
                    <div className={cn('flex items-center gap-2', compact ? 'mb-3' : 'mb-6')}>
                        <span className={cn(compact ? 'w-5 h-5 text-[10px]' : 'w-7 h-7 text-xs', 'flex items-center justify-center border border-anchor-gold-dark/50 text-accent-text font-bold')}>3</span>
                        <h4 className={cn(compact ? 'text-sm' : 'font-display text-xl', 'font-bold text-ink-strong')}>Choose a Space</h4>
                        <a href="/our-pub" className={cn(compact ? 'text-xs' : 'text-sm', 'ml-auto text-accent-text font-semibold hover:text-accent hover:underline')}>
                            See photos &rarr;
                        </a>
                    </div>

                    <div className={cn('grid gap-3', compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 gap-4')}>
                        {config.spaces.map(space => (
                            <label
                                key={space.id}
                                className={cn(
                                    'relative flex cursor-pointer border-2 transition-all duration-200 group',
                                    compact ? 'flex-row items-center p-3 gap-3' : 'flex-col p-6',
                                    selectedSpaceId === space.id
                                        ? 'border-anchor-green bg-anchor-green/5'
                                        : 'border-line hover:border-anchor-gold-dark/50 bg-surface-sunk'
                                )}
                            >
                                <div className={cn(compact ? 'flex items-center gap-2 flex-1 min-w-0' : 'flex justify-between items-start mb-4')}>
                                    <span className={cn(
                                        'font-bold transition-colors',
                                        compact ? 'text-sm' : 'font-display text-xl',
                                        selectedSpaceId === space.id ? 'text-accent' : 'text-ink-strong group-hover:text-accent-text'
                                    )}>
                                        {space.name}
                                    </span>
                                    {selectedSpaceId === space.id && (
                                        <div className="text-accent flex-shrink-0">
                                            <svg className={cn(compact ? 'w-4 h-4' : 'w-5 h-5')} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        </div>
                                    )}
                                </div>

                                {compact ? (
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className="text-sm font-bold text-accent-text">{formatCurrency(space.rate_per_hour)}<span className="text-ink-muted font-normal text-xs">/hr</span></span>
                                        <span className="text-xs text-ink-muted">{space.capacity_standing} guests</span>
                                    </div>
                                ) : (
                                    <div className="mt-auto space-y-4">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-accent-text">{formatCurrency(space.rate_per_hour)}</span>
                                            <span className="text-ink-muted font-medium text-sm">/ hour</span>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-ink-muted font-bold uppercase tracking-wider pt-4 border-t border-line">
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                                {space.capacity_standing} Standing
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                {space.capacity_seated} Seated
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <input
                                    type="radio"
                                    name="space"
                                    value={space.id}
                                    checked={selectedSpaceId === space.id}
                                    onChange={(e) => {
                                        trackQuoteStartedOnce()
                                        setSelectedSpaceId(e.target.value)
                                    }}
                                    className="sr-only"
                                />
                            </label>
                        ))}
                    </div>
                </section>

                {/* Event Details */}
                <section className={cn(compact ? 'bg-surface-sunk p-4 border border-line' : 'bg-surface-sunk p-8 border border-line')}>
                    <div className={cn('flex items-center gap-2', compact ? 'mb-3' : 'mb-6')}>
                        <span className={cn(compact ? 'w-5 h-5 text-[10px]' : 'w-7 h-7 text-xs', 'flex items-center justify-center border border-anchor-gold-dark/50 text-accent-text font-bold')}>4</span>
                        <h4 className={cn(compact ? 'text-sm' : 'font-display text-xl', 'font-bold text-ink-strong')}>Event Details</h4>
                    </div>

                    <div className={cn('grid grid-cols-2', compact ? 'gap-3' : 'grid-cols-1 md:grid-cols-2 gap-8')}>
                        <div>
                            <label className={cn(compact ? 'text-xs mb-1' : 'text-sm mb-2', 'block font-bold text-ink uppercase tracking-wide')}>Guests</label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    min="10"
                                    max={selectedSpace?.capacity_standing || 200}
                                    value={guestCount}
                                    onChange={(e) => {
                                        trackQuoteStartedOnce()
                                        setGuestCount(Number(e.target.value))
                                    }}
                                    className={cn(
                                        'w-full bg-surface border-[1.5px] border-line-strong rounded-sm focus:outline-none focus:ring-4 focus:ring-anchor-gold-dark/10 focus:border-anchor-gold-dark transition-all font-bold text-ink group-hover:border-anchor-gold-dark/50',
                                        compact ? 'pl-3 pr-3 py-2 text-sm' : 'pl-5 pr-16 py-4 text-xl'
                                    )}
                                />
                                {!compact && (
                                    <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-ink-muted font-medium uppercase text-xs tracking-wider">
                                        Guests
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className={cn(compact ? 'text-xs mb-1' : 'text-sm mb-2', 'block font-bold text-ink uppercase tracking-wide')}>Hours</label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    min={selectedSpace?.minimum_hours || 2}
                                    max="12"
                                    value={hours}
                                    onChange={(e) => {
                                        trackQuoteStartedOnce()
                                        setHours(Number(e.target.value))
                                    }}
                                    className={cn(
                                        'w-full bg-surface border-[1.5px] border-line-strong rounded-sm focus:outline-none focus:ring-4 focus:ring-anchor-gold-dark/10 focus:border-anchor-gold-dark transition-all font-bold text-ink group-hover:border-anchor-gold-dark/50',
                                        compact ? 'pl-3 pr-3 py-2 text-sm' : 'pl-5 pr-16 py-4 text-xl'
                                    )}
                                />
                                {!compact && (
                                    <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-ink-muted font-medium uppercase text-xs tracking-wider">
                                        Hours
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Catering */}
                <section>
                    <div className={cn('flex flex-col sm:flex-row sm:items-end justify-between gap-3', compact ? 'mb-3' : 'mb-6 gap-4')}>
                        <div className="flex items-center gap-2">
                            <span className={cn(compact ? 'w-5 h-5 text-[10px]' : 'w-7 h-7 text-xs', 'flex items-center justify-center border border-anchor-gold-dark/50 text-accent-text font-bold')}>5</span>
                            <div>
                                <h4 className={cn(compact ? 'text-sm' : 'font-display text-xl', 'font-bold text-ink-strong')}>Catering & Drinks</h4>
                                {!compact && <p className="text-sm text-ink-muted mt-1">Add food packages or drinks tokens</p>}
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                trackQuoteStartedOnce()
                                setIsAddingItem(true)
                            }}
                            className={cn(
                                'bg-surface border border-dashed border-anchor-gold-dark/40 text-accent-text font-bold rounded-none hover:bg-anchor-green hover:text-white hover:border-anchor-green transition-all flex items-center justify-center gap-1.5',
                                compact ? 'text-sm px-4 py-2' : 'text-sm px-6 py-3 gap-2'
                            )}
                        >
                            <svg className={cn(compact ? 'w-3.5 h-3.5' : 'w-5 h-5')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Packages
                        </button>
                    </div>

                    <div className={cn(compact ? 'space-y-2' : 'space-y-4')}>
                        {selectedPackages.length === 0 && (
                            <div className={cn('text-center bg-surface-sunk border border-dashed border-line-strong', compact ? 'py-4' : 'py-10')}>
                                {!compact && (
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface text-ink-muted mb-3">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.25 4.75H4.75D3.64543 4.75 2.75 5.64543 2.75 6.75V19.25L5.75 16.25L8.75 19.25L11.75 16.25L14.75 19.25L17.75 16.25L20.75 19.25V6.75C20.75 5.64543 19.8546 4.75 18.75 4.75H19.25Z" /></svg>
                                    </div>
                                )}
                                <p className={cn(compact ? 'text-sm' : 'text-base', 'text-ink-muted font-medium mb-1')}>No catering items selected.</p>
                                <button onClick={() => {
                                    trackQuoteStartedOnce()
                                    setIsAddingItem(true)
                                }} className="text-sm text-accent-text font-bold hover:underline">Browse Menu Options</button>
                            </div>
                        )}

                        {selectedPackages.map(selection => {
                            const pkg = config.packages.find(p => p.id === selection.id)
                            if (!pkg) return null
                            return (
                                <div key={selection.id} className={cn(
                                    'bg-surface-sunk border border-line hover:border-anchor-gold-dark/40 transition-all group',
                                    compact ? 'flex items-center justify-between p-2.5 gap-2' : 'flex flex-col md:flex-row md:items-center justify-between p-5'
                                )}>
                                    {compact ? (
                                        <>
                                            <div className="min-w-0 flex-1">
                                                <span className="text-sm font-bold text-ink-strong group-hover:text-accent-text transition-colors truncate block">{pkg.name}</span>
                                                <span className="text-xs text-accent-text">{formatPrice(pkg.cost_per_head)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <input
                                                    type="number"
                                                    min={pkg.minimum_guests || 1}
                                                    max={guestCount}
                                                    value={selection.quantity}
                                                    onChange={(e) => updatePackageQuantity(pkg.id, Number(e.target.value))}
                                                    className="w-14 h-8 px-1 text-center text-sm font-bold text-ink bg-surface border border-line-strong outline-none focus:ring-1 focus:ring-anchor-gold-dark"
                                                />
                                                <span className="text-sm font-bold text-ink-strong tabular-nums">{formatCurrency(pkg.cost_per_head * selection.quantity)}</span>
                                                <button
                                                    onClick={() => removePackage(pkg.id)}
                                                    className="w-7 h-7 flex items-center justify-center text-ink-muted hover:text-anchor-danger transition-all"
                                                    title="Remove"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex-1 mb-4 md:mb-0 pr-4">
                                                <div className="flex items-center justify-between md:justify-start gap-3">
                                                    <span className="font-display font-bold text-ink-strong text-lg group-hover:text-accent-text transition-colors">{pkg.name}</span>
                                                    <span className="md:hidden bg-surface text-ink-muted text-xs font-bold px-2 py-1 rounded">{formatPrice(pkg.cost_per_head)}</span>
                                                </div>
                                                <div className="text-sm text-accent-text font-bold mt-1 hidden md:block">{formatPrice(pkg.cost_per_head)}</div>
                                            </div>

                                            <div className="flex items-center justify-between gap-6 bg-surface p-3 rounded-xl md:bg-transparent md:p-0">
                                                <div className="flex items-center gap-3">
                                                    <label className="text-[10px] text-ink-muted font-bold uppercase tracking-wider hidden sm:block">Update Qty</label>
                                                    <div className="flex items-center bg-surface border border-line-strong overflow-hidden focus-within:ring-2 focus-within:ring-anchor-gold-dark focus-within:border-anchor-gold-dark">
                                                        <input
                                                            type="number"
                                                            min={pkg.minimum_guests || 1}
                                                            max={guestCount}
                                                            value={selection.quantity}
                                                            onChange={(e) => updatePackageQuantity(pkg.id, Number(e.target.value))}
                                                            className="w-16 h-10 px-2 text-center font-bold text-ink outline-none bg-transparent"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <span className="block text-xs text-ink-muted font-medium uppercase">Subtotal</span>
                                                        <span className="block font-bold text-ink-strong text-lg tabular-nums">{formatCurrency(pkg.cost_per_head * selection.quantity)}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => removePackage(pkg.id)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-full text-ink-muted hover:text-anchor-danger hover:bg-anchor-danger/10 transition-all"
                                                        title="Remove"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Add Item Modal */}
                    {isAddingItem && (
                        <div className="fixed inset-0 bg-anchor-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen" onClick={() => setIsAddingItem(false)}>
                            <div className="bg-surface rounded-md shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col animate-fade-up border border-line" onClick={e => e.stopPropagation()}>
                                <div className="px-4 py-3 border-b border-line flex justify-between items-center bg-surface-sunk rounded-t-md z-20">
                                    <div>
                                        <h3 className="font-display font-bold text-lg text-ink-strong">Add to your Package</h3>
                                        <p className="text-xs text-ink-muted">Select food and drink options to add to your estimate.</p>
                                    </div>
                                    <button onClick={() => setIsAddingItem(false)} className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-sunk transition-all">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-2 md:p-4">
                                    {availablePackages.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-sm text-ink-muted font-medium">You've selected all available options!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {foodPackages.length > 0 && (
                                                <div>
                                                    <h4 className="flex items-center gap-2 text-xs font-bold text-accent-text uppercase tracking-widest mb-4 px-2">
                                                        <span className="w-8 h-[2px] bg-anchor-gold"></span> Food Menus
                                                    </h4>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {foodPackages.map(pkg => (
                                                            <button
                                                                key={pkg.id}
                                                                onClick={() => addPackage(pkg.id)}
                                                                className="w-full text-left p-3 hover:bg-surface-sunk transition-all border border-transparent hover:border-anchor-gold-dark/20 flex min-w-0 justify-between items-start gap-3 group relative overflow-hidden sm:items-center"
                                                            >
                                                                <div className="relative z-10 min-w-0">
                                                                    <div className="break-words font-bold text-sm text-ink-strong group-hover:text-accent-text">{pkg.name}</div>
                                                                    {pkg.guest_description && <div className="text-xs text-ink-muted mt-0.5 leading-relaxed max-w-md">{pkg.guest_description}</div>}
                                                                </div>
                                                                <div className="relative z-10 flex shrink-0 flex-col items-end">
                                                                    <div className="text-accent-text font-bold text-sm whitespace-nowrap bg-surface-sunk px-2.5 py-0.5 group-hover:bg-surface transition-colors">
                                                                        {formatPrice(pkg.cost_per_head)}
                                                                    </div>
                                                                    <div className="text-[10px] text-accent-text font-bold uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
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
                                                    <h4 className="flex items-center gap-2 text-xs font-bold text-accent-text uppercase tracking-widest mb-4 px-2">
                                                        <span className="w-8 h-[2px] bg-anchor-gold"></span> Drink Packages
                                                    </h4>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {drinkPackages.map(pkg => (
                                                            <button
                                                                key={pkg.id}
                                                                onClick={() => addPackage(pkg.id)}
                                                                className="w-full text-left p-3 hover:bg-surface-sunk transition-all border border-transparent hover:border-anchor-gold-dark/20 flex min-w-0 justify-between items-start gap-3 group sm:items-center"
                                                            >
                                                                <div className="min-w-0">
                                                                    <div className="break-words font-bold text-sm text-ink-strong group-hover:text-accent-text">{pkg.name}</div>
                                                                    {pkg.guest_description && <div className="text-xs text-ink-muted mt-0.5">{pkg.guest_description}</div>}
                                                                </div>
                                                                <div className="shrink-0 text-accent-text font-bold text-sm whitespace-nowrap bg-surface-sunk px-2.5 py-0.5">
                                                                    {formatPrice(pkg.cost_per_head)}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {addonPackages.length > 0 && (
                                                <div>
                                                    <h4 className="flex items-center gap-2 text-xs font-bold text-accent-text uppercase tracking-widest mb-4 px-2">
                                                        <span className="w-8 h-[2px] bg-anchor-gold"></span> Extras
                                                    </h4>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {addonPackages.map(pkg => (
                                                            <button
                                                                key={pkg.id}
                                                                onClick={() => addPackage(pkg.id)}
                                                                className="w-full text-left p-3 hover:bg-surface-sunk transition-all border border-transparent hover:border-anchor-gold-dark/20 flex min-w-0 justify-between items-start gap-3 group sm:items-center"
                                                            >
                                                                <div className="min-w-0">
                                                                    <div className="break-words font-bold text-sm text-ink-strong group-hover:text-accent-text">{pkg.name}</div>
                                                                    {pkg.guest_description && <div className="text-xs text-ink-muted mt-0.5">{pkg.guest_description}</div>}
                                                                </div>
                                                                <div className="shrink-0 text-accent-text font-bold text-sm whitespace-nowrap bg-surface-sunk px-2.5 py-0.5">
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
                        <div className={cn('flex items-center gap-2', compact ? 'mb-3' : 'mb-6')}>
                            <span className={cn(compact ? 'w-5 h-5 text-[10px]' : 'w-7 h-7 text-xs', 'flex items-center justify-center border border-anchor-gold-dark/50 text-accent-text font-bold')}>6</span>
                            <h4 className={cn(compact ? 'text-sm' : 'font-display text-xl', 'font-bold text-ink-strong')}>Recommended Services</h4>
                        </div>
                        <div className={cn('grid gap-2', compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 gap-4')}>
                            {config.vendors.map(vendor => (
                                <label key={vendor.id} className={cn(
                                    'flex items-center border cursor-pointer transition-all duration-200',
                                    compact ? 'p-2.5 gap-2' : 'items-start p-4',
                                    selectedVendorIds.has(vendor.id) ? 'border-anchor-green bg-anchor-green/5' : 'border-line hover:border-anchor-gold-dark/40 bg-surface-sunk'
                                )}>
                                    <div className="relative flex items-center flex-shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={selectedVendorIds.has(vendor.id)}
                                            onChange={() => toggleVendor(vendor.id)}
                                            className={cn(compact ? 'h-4 w-4' : 'h-5 w-5', 'rounded-none border-line-strong focus:ring-anchor-gold-dark accent-[#005131]')}
                                        />
                                    </div>
                                    <div className={cn(compact ? 'ml-2' : 'ml-4')}>
                                        <span className={cn(
                                            'block font-bold',
                                            compact ? 'text-sm' : 'text-lg',
                                            selectedVendorIds.has(vendor.id) ? 'text-accent' : 'text-ink-strong'
                                        )}>{vendor.name}</span>
                                        <span className={cn(compact ? 'text-xs' : 'text-sm mt-0.5', 'block text-ink-muted')}>Approx. {formatCurrency(vendor.typical_rate || 0)}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Footer Total — deliberate dark green CTA band */}
            <div className={cn(
                'theme-dark bg-anchor-green border-t border-line-gold',
                compact
                    ? 'p-4 flex items-center justify-between gap-3'
                    : 'p-8 flex flex-col md:flex-row items-center justify-between gap-6'
            )}>
                <div className={cn(compact ? '' : 'flex flex-col items-center md:items-start w-full md:w-auto')}>
                    {!compact && (
                        <div className="flex items-center gap-3 mb-1">
                            <span className="h-px w-5 bg-anchor-gold-bright/55" aria-hidden="true" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-anchor-gold-bright">Estimated Event Total</span>
                            <span className="h-px w-5 bg-anchor-gold-bright/55" aria-hidden="true" />
                        </div>
                    )}
                    {compact && <span className="text-xs font-bold uppercase tracking-wider text-anchor-cream-text/70">Estimate</span>}
                    <span className={cn(
                        'font-display text-anchor-cream-text tracking-tight',
                        compact ? 'text-xl' : 'break-words text-4xl sm:text-5xl'
                    )}>{formatCurrency(total)}</span>
                </div>

                <button
                    onClick={() => {
                        trackQuoteToolCompleted({
                            eventType: selectedEventType,
                            guestCount,
                            estimateValue: total,
                            pageSource: typeof window !== 'undefined' ? window.location.pathname : ''
                        })
                        setShowInquiryForm(true)
                    }}
                    className={cn(
                        'group flex items-center justify-center gap-2 bg-anchor-gold-dark hover:bg-anchor-gold-bright text-white font-bold rounded-pill transition-all',
                        compact
                            ? 'px-4 py-2 text-sm flex-shrink-0'
                            : 'min-w-0 w-full break-words px-6 py-4 text-lg md:w-auto md:px-8'
                    )}
                >
                    Check Availability
                    <svg className={cn(compact ? 'w-3.5 h-3.5' : 'w-5 h-5', 'transition-transform group-hover:translate-x-1')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
