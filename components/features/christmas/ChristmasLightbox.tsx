'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { trackFormStart, trackModalClose, trackModalEngage, trackModalOpen, type ModalCloseReason } from '@/lib/gtm-events'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const SUPPRESSION_KEY = 'christmas_2026_lightbox_seen'
// Show once per user for the season
const SUPPRESSION_DAYS = 365

const CAMPAIGN_START = new Date('2026-08-01T00:00:00').getTime()
const CAMPAIGN_END = new Date('2026-12-15T23:59:59').getTime()

export function ChristmasLightbox() {
    const [isOpen, setIsOpen] = useState(false)
    const [hasINTERACTED, setHasINTERACTED] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const closeReasonRef = useRef<ModalCloseReason | null>(null)
    const engagedRef = useRef(false)
    const triggerRef = useRef<'timer' | 'exit_intent' | null>(null)
    const modalId = 'christmas_2026_lightbox'

    const checkSuppression = useCallback(() => {
        if (typeof window === 'undefined') return true

        // Check date range
        const now = Date.now()
        if (now < CAMPAIGN_START || now > CAMPAIGN_END) return true

        const lastSeen = localStorage.getItem(SUPPRESSION_KEY)
        if (!lastSeen) return false

        // If seen, suppress for the rest of the season
        return true
    }, [])

	    const triggerLightbox = useCallback((trigger?: 'timer' | 'exit_intent') => {
	        if (checkSuppression() || hasINTERACTED) return
	        triggerRef.current = trigger ?? null
	        setIsOpen(true)
        // Small delay to allow render before transition
        setTimeout(() => setIsVisible(true), 10)
	        setHasINTERACTED(true)
	        localStorage.setItem(SUPPRESSION_KEY, Date.now().toString())
	    }, [checkSuppression, hasINTERACTED])

	    const closeLightbox = useCallback(() => {
	        setIsVisible(false)
	        setTimeout(() => setIsOpen(false), 300) // Wait for transition
	    }, [])

	    const requestClose = useCallback((reason: ModalCloseReason) => {
	        closeReasonRef.current = reason
	        closeLightbox()
	    }, [closeLightbox])

	    const recordEngagement = useCallback((element: string) => {
	        if (engagedRef.current) return
	        engagedRef.current = true
	        trackModalEngage({
            id: modalId,
            title: 'Christmas 2026 lightbox',
            interaction: 'click',
	            element,
	            extra: { lightbox_trigger: triggerRef.current }
	        })
	    }, [modalId])

	    useEffect(() => {
	        if (!isOpen) return
	        engagedRef.current = false
	        closeReasonRef.current = null
        trackModalOpen({
            id: modalId,
	            title: 'Christmas 2026 lightbox',
	            extra: { lightbox_trigger: triggerRef.current }
	        })
	    }, [isOpen, modalId])

	    useEffect(() => {
	        if (isOpen) return
	        if (!hasINTERACTED) return
        trackModalClose({
            id: modalId,
            title: 'Christmas 2026 lightbox',
	            reason: closeReasonRef.current ?? 'programmatic',
	            extra: { lightbox_trigger: triggerRef.current }
	        })
	        closeReasonRef.current = null
	    }, [hasINTERACTED, isOpen, modalId])

	    useEffect(() => {
	        if (!isOpen) return
	        const handleKeyDown = (event: KeyboardEvent) => {
	            if (event.key === 'Escape') {
	                requestClose('escape_key')
	            }
	        }
	        document.addEventListener('keydown', handleKeyDown)
	        return () => document.removeEventListener('keydown', handleKeyDown)
	    }, [isOpen, requestClose])

    useEffect(() => {
        // 1. Time delay trigger (Mobile friendly)
        const timer = setTimeout(() => {
            triggerLightbox('timer')
        }, 10000) // 10 seconds (faster than Six Nations)

        // 2. Exit intent trigger (Desktop)
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0) {
                triggerLightbox('exit_intent')
            }
        }

        document.addEventListener('mouseleave', handleMouseLeave)

        return () => {
            clearTimeout(timer)
            document.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [triggerLightbox])

    if (!isOpen) return null

    return (
        <div className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300",
            isVisible ? "opacity-100" : "opacity-0"
        )}>
            {/* Backdrop */}
            <div
                onClick={() => requestClose('backdrop_click')}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal */}
            <div
                className={cn(
                    "relative w-full max-w-lg card-dark rounded-none shadow-2xl overflow-hidden transform transition-all duration-300",
                    isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
                )}
            >
                {/* Close Button */}
                <button
                    onClick={() => requestClose('close_button')}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Hero Image Area */}
                <div className="relative h-48 sm:h-56 bg-red-900 text-white flex items-center justify-center overflow-hidden">
                    <Image
                        src="/images/page-headers/christmas-parties/2026/hero-table.png"
                        alt="Christmas at The Anchor"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative z-10 text-center px-6">
                        <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-2 text-white">Christmas 2026</h2>
                        <p className="text-red-100 font-medium uppercase tracking-widest text-sm">Bookings Now Open</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 text-center space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-anchor-cream-text">Get 20% Off Your Food Bill</h3>
                        <p className="text-anchor-cream-text/70">
                            Book your Christmas party early to secure the best dates. Pay your deposit by <strong>October 1st</strong> to claim your discount.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link href="/christmas-parties" className="w-full" onClick={() => {
                            trackFormStart({ formName: 'christmas_lightbox' })
                            recordEngagement('primary_cta')
                            requestClose('cta')
                        }}>
                            <Button
                                variant="danger"
                                size="lg"
                                className="w-full justify-center"
                                asChild={false}
                            >
                                View Festive Packages
                            </Button>
                        </Link>

                        <button onClick={() => requestClose('close_button')} className="text-sm text-anchor-cream-text/55 hover:text-anchor-cream-text underline">
                            No thanks, I&apos;ll book later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
