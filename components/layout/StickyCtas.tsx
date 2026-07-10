'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Utensils, Phone, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui'
import {
  trackTableBookingClick,
  trackMenuView,
  trackPhoneCallClick,
  trackWhatsAppClick,
  trackStickyCtaShown
} from '@/lib/gtm-events'
import { hasUserConsented } from '@/lib/cookies'

// StickyCtas (spec §5.4): the single global sticky CTA bar that replaces every
// page-level/floating CTA. Fixed to the bottom, full width, revealed only once the
// page hero has scrolled out of view. Renders on every route except /book-table
// (where the booking form itself is the CTA).

const PHONE_DISPLAY = '01753682707'
const WHATSAPP_HREF = 'https://wa.me/441753682707'
const HERO_FALLBACK_HEIGHT = 480
const REVEAL_OFFSET = 90

type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown'

function resolveDeviceType(width: number): DeviceType {
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

/**
 * Best-effort measurement of the current page hero so the bar can reveal once the
 * hero scrolls past. Prefers the explicit [data-hero] marker (InteriorHero/home
 * hero), falls back to the first <section> in <main>, then a documented constant.
 */
function measureHeroHeight(): number {
  if (typeof document === 'undefined') return HERO_FALLBACK_HEIGHT
  const explicit = document.querySelector<HTMLElement>('[data-hero]')
  if (explicit) return explicit.offsetHeight
  const firstSection = document.querySelector<HTMLElement>('main section')
  if (firstSection) return firstSection.offsetHeight
  return HERO_FALLBACK_HEIGHT
}

export function StickyCtas() {
  const pathname = usePathname()
  const isBookTable = pathname?.startsWith('/book-table') ?? false

  const [visible, setVisible] = useState(false)
  const [cookieBannerVisible, setCookieBannerVisible] = useState(false)
  const [deviceType, setDeviceType] = useState<DeviceType>('unknown')
  const showStickyCtas = visible && !cookieBannerVisible
  const heroHeightRef = useRef<number>(HERO_FALLBACK_HEIGHT)
  const visibleSinceRef = useRef<number | null>(null)
  const deviceTypeRef = useRef<DeviceType>('unknown')

  useEffect(() => {
    const updateCookieBannerVisibility = () => {
      setCookieBannerVisible(!hasUserConsented())
    }

    updateCookieBannerVisibility()
    window.addEventListener('cookieConsentUpdate', updateCookieBannerVisibility)
    return () => window.removeEventListener('cookieConsentUpdate', updateCookieBannerVisibility)
  }, [])

  // Flush a "sticky_cta_shown" measurement (seconds the bar was visible) using the
  // existing GTM helper. Called on hide, route change and unmount.
  const flushShown = useCallback(() => {
    if (visibleSinceRef.current === null) return
    const seconds = Math.round((Date.now() - visibleSinceRef.current) / 1000)
    visibleSinceRef.current = null
    if (seconds > 0) {
      trackStickyCtaShown({
        secondsVisible: seconds,
        context: 'global',
        deviceType: deviceTypeRef.current,
        location: 'sticky_bar'
      })
    }
  }, [])

  // Track device type and (re)measure the hero on resize.
  useEffect(() => {
    if (isBookTable) return
    const handleResize = () => {
      const type = resolveDeviceType(window.innerWidth)
      deviceTypeRef.current = type
      setDeviceType(type)
      heroHeightRef.current = measureHeroHeight()
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isBookTable, pathname])

  // Reveal once the hero has scrolled out (scrollY > heroHeight - 90).
  useEffect(() => {
    if (isBookTable) return
    // Re-measure after mount in case images/fonts changed the hero height.
    heroHeightRef.current = measureHeroHeight()

    const evaluate = () => {
      const threshold = Math.max(0, heroHeightRef.current - REVEAL_OFFSET)
      setVisible(window.scrollY > threshold)
    }
    evaluate()
    window.addEventListener('scroll', evaluate, { passive: true })
    return () => window.removeEventListener('scroll', evaluate)
  }, [isBookTable, pathname])

  // Start/stop the visibility timer and flush on hide.
  useEffect(() => {
    if (showStickyCtas) {
      if (visibleSinceRef.current === null) visibleSinceRef.current = Date.now()
    } else {
      flushShown()
    }
  }, [showStickyCtas, flushShown])

  // Flush on unmount / route change.
  useEffect(() => {
    return () => flushShown()
  }, [pathname, flushShown])

  if (isBookTable) return null

  return (
    <div
      aria-hidden={!showStickyCtas}
      className="fixed inset-x-0 bottom-0 z-[80] border-t border-line bg-[rgba(255,255,255,0.96)] py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur transition-transform duration-[var(--dur)] ease-[var(--ease-out)] supports-[backdrop-filter]:backdrop-blur"
      style={{
        transform: showStickyCtas ? 'translateY(0)' : 'translateY(125%)',
        boxShadow: '0 -6px 24px rgba(26,26,26,0.10)'
      }}
      data-testid="sticky-ctas"
    >
      <div className="container flex items-center gap-3 lg:justify-end">
        <Button
          asChild
          variant="primary"
          size="md"
          className="flex-1 lg:flex-none"
          tabIndex={showStickyCtas ? undefined : -1}
        >
          <Link
            href="/book-table"
            onClick={() => trackTableBookingClick('sticky_global')}
          >
            Book a table
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          size="md"
          icon={<Utensils className="h-5 w-5" aria-hidden />}
          tabIndex={showStickyCtas ? undefined : -1}
        >
          <Link href="/food-menu" onClick={() => trackMenuView('food')}>
            <span className="max-sm:sr-only">View menu</span>
          </Link>
        </Button>

        <a
          href={`tel:${PHONE_DISPLAY}`}
          aria-label="Call The Anchor"
          tabIndex={showStickyCtas ? undefined : -1}
          onClick={() => trackPhoneCallClick({ phone: PHONE_DISPLAY, source: 'sticky_global' })}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-accent text-accent transition-colors hover:bg-accent hover:text-canvas"
        >
          <Phone className="h-5 w-5" aria-hidden />
        </a>

        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp The Anchor"
          tabIndex={showStickyCtas ? undefined : -1}
          onClick={() => trackWhatsAppClick('sticky_global')}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-anchor-success text-white transition-opacity hover:opacity-90"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
        </a>
      </div>
    </div>
  )
}
