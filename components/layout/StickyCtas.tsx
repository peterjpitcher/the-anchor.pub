'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { hasUserConsented } from '@/lib/cookies'
import { Utensils, Phone, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui'
import { QuickBookSheet } from '@/components/features/TableBooking/QuickBookSheet'
import {
  trackTableBookingClick,
  trackMenuView,
  trackPhoneCallClick,
  trackWhatsAppClick,
  trackStickyCtaShown,
  trackCtaClick
} from '@/lib/gtm-events'

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
  const isChristmasParties = pathname === '/christmas-parties'

  const [visible, setVisible] = useState(false)
  const [cookieBannerVisible, setCookieBannerVisible] = useState(false)
  const [deviceType, setDeviceType] = useState<DeviceType>('unknown')
  const [quickBookOpen, setQuickBookOpen] = useState(false)

  // The bar used to hide itself entirely while the cookie banner was up, because both are
  // pinned to the bottom of the viewport and would have overlapped. The cost of that was
  // silent and large: a first-time visitor, the exact person most in need of an obvious
  // way to book, could not see the button at all until they answered a cookie prompt.
  //
  // The banner is still tracked, but now only to position this bar on top of it rather
  // than to suppress it. No consent is required to render a link.
  const showStickyCtas = visible
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
      className="fixed inset-x-0 z-[80] border-t border-line bg-[var(--sticky-cta-surface)] py-3 backdrop-blur transition-[transform,bottom] duration-[var(--dur)] ease-[var(--ease-out)] supports-[backdrop-filter]:backdrop-blur"
      style={{
        // Rides on top of the cookie banner while it is up, then drops back to the bottom
        // edge once it is dismissed. Defaults to 0px so every page with no banner renders
        // exactly as before.
        bottom: cookieBannerVisible ? 'var(--cookie-banner-height, 0px)' : 0,
        // The safe-area inset belongs to whichever element actually touches the bottom
        // edge, which is the banner whenever there is one. Keeping it here as well would
        // open a phantom gap inside the bar on notched phones.
        paddingBottom: cookieBannerVisible
          ? '0.75rem'
          : 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
        transform: showStickyCtas ? 'translateY(0)' : 'translateY(125%)',
        boxShadow: '0 -6px 24px rgba(26,26,26,0.10)'
      }}
      data-testid="sticky-ctas"
    >
      <div className="container flex items-center gap-3 lg:justify-end">
        {isChristmasParties ? (
          <Button
            variant="primary"
            size="md"
            className="flex-1 lg:flex-none"
            tabIndex={showStickyCtas ? undefined : -1}
            onClick={() => {
              trackCtaClick({
                id: 'christmas_sticky_global',
                label: 'Christmas enquiry',
                location: 'sticky_global',
                destination: 'enquiry_form'
              })
              window.dispatchEvent(new CustomEvent('christmas-open-form', {
                detail: { source: 'sticky_global' }
              }))
            }}
          >
            Christmas enquiry
          </Button>
        ) : (
          // Opens the quick-book sheet in place rather than navigating. The full form is
          // still one tap away from inside the sheet, carrying whatever has been chosen,
          // so nothing is lost for a booking that needs the longer questions.
          <Button
            variant="primary"
            size="md"
            className="flex-1 lg:flex-none"
            tabIndex={showStickyCtas ? undefined : -1}
            onClick={() => {
              trackTableBookingClick('sticky_global')
              setQuickBookOpen(true)
            }}
          >
            Book a table
          </Button>
        )}

        {/* The label is screen-reader-only below sm, but the button kept its full
            md padding, so on a 390px phone the four controls needed 418px and the
            WhatsApp button was clipped off the right edge. */}
        <Button
          asChild
          variant="outline"
          size="md"
          className="shrink-0 max-sm:h-12 max-sm:w-12 max-sm:px-0"
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

      <QuickBookSheet
        open={quickBookOpen}
        onClose={() => setQuickBookOpen(false)}
        source="sticky_global"
      />
    </div>
  )
}
