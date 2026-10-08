'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { resolveBookingCta, type BookingCta } from '@/lib/booking-cta'
import { withCarriedAttributionParams } from '@/lib/booking-attribution'
import { useFloatingLayer, useFloatingLayerShowing } from '@/hooks/useFloatingLayer'
import { usePastHero } from '@/hooks/usePastHero'
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

/**
 * The bar's height while it is on screen, 0px otherwise. Two things read it:
 * `scroll-padding-bottom` in app/globals.css, so a control reached with the
 * Tab key is scrolled clear of the bar instead of under it (site review
 * AX-004), and any page prompt that has to sit above the bar.
 */
const BAR_HEIGHT_VAR = '--booking-bar-height'

// The main button takes whatever width the three round buttons leave. On a
// phone that can be less than its label: at 320px there were 108px, and
// 'Enquire about your date' needs 242px on one line at full padding, which
// pushed Call and WhatsApp off the right edge of the screen. So below 640px it
// may shrink (min-w-0), its padding drops and the label wraps (the Button wrap
// variant, with tighter padding still). A label that already fits looks the
// same as it did: flex-1 sets the width, not the padding.
//
// Below 360px the label is also a size smaller, and the row's gaps are 8px
// (see the row), so 'Book a table' stays on one line at 320px and the longest
// labels take two lines, not three.
const PRIMARY_ACTION_CLASS =
  'min-w-0 flex-1 max-sm:px-2 max-sm:py-1 max-sm:leading-tight max-[359px]:text-sm lg:flex-none'

type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown'

function resolveDeviceType(width: number): DeviceType {
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

export function StickyCtas() {
  const pathname = usePathname()
  const isBookTable = pathname?.startsWith('/book-table') ?? false
  const [pageAction, setPageAction] = useState<{ pathname: string; action: BookingCta } | null>(null)
  const action = pageAction?.pathname === pathname ? pageAction.action : resolveBookingCta(pathname || '/')

  // Revealed once the hero has scrolled out (scrollY > hero height - 90).
  const visible = usePastHero(pathname, !isBookTable)
  const [deviceType, setDeviceType] = useState<DeviceType>('unknown')
  const [quickBookOpen, setQuickBookOpen] = useState(false)

  useEffect(() => {
    setQuickBookOpen(false)
    setPageAction(null)
    if (!pathname?.startsWith('/events/')) return

    // The page's server-rendered marker carries its actual sales state. Observe
    // streamed content too, and match the path so a previous page cannot win.
    const readPageAction = () => {
      const marker = Array.from(document.querySelectorAll<HTMLElement>('[data-booking-cta-path]'))
        .find((element) => element.dataset.bookingCtaPath === pathname.replace(/\/$/, ''))
      if (!marker?.dataset.bookingCtaHref || !marker.dataset.bookingCtaLabel) return
      const action: BookingCta = { kind: 'link', label: marker.dataset.bookingCtaLabel, href: marker.dataset.bookingCtaHref }
      setPageAction((current) => current?.pathname === pathname && current.action.kind === 'link' && current.action.href === action.href && current.action.label === action.label
        ? current
        : { pathname, action })
    }
    readPageAction()
    const observer = new MutationObserver(readPageAction)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-booking-cta-href', 'data-booking-cta-label'] })
    return () => observer.disconnect()
  }, [pathname])

  // The bar used to hide itself entirely while the cookie banner was up, because both are
  // pinned to the bottom of the viewport and would have overlapped. The cost of that was
  // silent and large: a first-time visitor, the exact person most in need of an obvious
  // way to book, could not see the button at all until they answered a cookie prompt.
  //
  // The banner is still tracked, but now only to position this bar on top of it rather
  // than to suppress it. No consent is required to render a link.
  const showStickyCtas = visible
  // The floating layer coordinator (lib/floating-layers.ts) has the last word on
  // whether the bar is on screen. It docks with the cookie banner, the event card
  // and a page prompt, and gives way only to something that covers the whole
  // screen: an open dialog (the quick booking sheet, the phone menu, an enquiry
  // drawer) or an open pop-up. It used to stay put under those and cover the last
  // item of the phone menu.
  //
  // `showStickyCtas` still drives the "seconds shown" measurement, exactly as
  // before, so that record means what it always has. The bar's buttons leave the
  // tab order whenever it is off the screen, for either reason: not every dialog
  // on the site holds keyboard focus inside itself.
  const barOnScreen = useFloatingLayer('booking-bar', showStickyCtas)
  const cookieBannerVisible = useFloatingLayerShowing('cookie-banner')
  const barRef = useRef<HTMLDivElement | null>(null)
  const visibleSinceRef = useRef<number | null>(null)
  const deviceTypeRef = useRef<DeviceType>('unknown')

  // Publish the bar's height while it is on screen. See BAR_HEIGHT_VAR.
  useEffect(() => {
    const root = document.documentElement
    const clear = () => root.style.setProperty(BAR_HEIGHT_VAR, '0px')
    const node = barRef.current
    if (!barOnScreen || !node) {
      clear()
      return
    }
    const publish = () => root.style.setProperty(BAR_HEIGHT_VAR, `${node.offsetHeight}px`)
    publish()
    // The label wraps to two lines on the narrowest phones and the bar grows.
    const observer = new ResizeObserver(publish)
    observer.observe(node)
    return () => {
      observer.disconnect()
      clear()
    }
  }, [barOnScreen])

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

  // Track device type. The hero is measured in usePastHero.
  useEffect(() => {
    if (isBookTable) return
    const handleResize = () => {
      const type = resolveDeviceType(window.innerWidth)
      deviceTypeRef.current = type
      setDeviceType(type)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
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
      ref={barRef}
      aria-hidden={!showStickyCtas}
      className="fixed inset-x-0 bottom-0 z-[80] border-t border-line bg-[var(--sticky-cta-surface)] py-3 backdrop-blur transition-transform duration-[var(--dur)] ease-[var(--ease-out)] supports-[backdrop-filter]:backdrop-blur"
      style={{
        // The safe-area inset belongs to whichever element actually touches the bottom
        // edge, which is the banner whenever there is one. Keeping it here as well would
        // open a phantom gap inside the bar on notched phones.
        paddingBottom: cookieBannerVisible
          ? '0.75rem'
          : 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
        // Rides on top of the cookie banner while it is up, then drops back to the bottom
        // edge once it is answered. The banner publishes 0px whenever it is not on screen,
        // so every page with no banner renders exactly as before.
        //
        // Moved with transform, never with `bottom`. The banner arrives a second after
        // the page, and a bar that changes its `bottom` to make room is counted by the
        // browser as a layout shift: it was the moving part in 8 of the 10 real-visitor
        // readings that recorded any movement (site review FD-007, LS-003). A transform
        // is not counted, and nothing else on the page moves.
        transform: barOnScreen
          ? 'translateY(calc(-1 * var(--cookie-banner-height, 0px)))'
          : 'translateY(125%)',
        boxShadow: '0 -6px 24px rgba(26,26,26,0.10)'
      }}
      data-testid="sticky-ctas"
    >
      <div className="container flex items-center gap-3 max-[359px]:gap-2 lg:justify-end">
        {action.kind === 'link' ? (
          <Button asChild variant="primary" size="md" wrap className={PRIMARY_ACTION_CLASS} tabIndex={barOnScreen ? undefined : -1}>
            <Link
              href={action.href}
              onClick={(event) => {
                trackCtaClick({ id: pathname === '/live-sport/nations-championship' ? 'nations_sticky' : 'page_sticky', label: action.label, location: 'sticky_global', destination: action.href, context: pathname || '/' })
                if (!action.carryAttribution) return
                // A link into the booking page, from the paid-ads landing
                // page. It is still a "Book a table" tap, so it keeps the
                // event this button fired when it opened the quick-book sheet.
                trackTableBookingClick('sticky_global')
                // Leave a new-tab or new-window click to the browser.
                if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                // The plain href does not carry the ad tags. Navigate the way
                // BookTableButton does: copy the tags on this page's address
                // onto the booking link, in the URL only, nothing stored, and
                // with or without cookie consent.
                event.preventDefault()
                window.location.href = withCarriedAttributionParams(action.href)
              }}
            >
              {action.label}
            </Link>
          </Button>
        ) : action.kind === 'christmas' ? (
          <Button
            variant="primary"
            size="md"
            wrap
            className={PRIMARY_ACTION_CLASS}
            tabIndex={barOnScreen ? undefined : -1}
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
            wrap
            className={PRIMARY_ACTION_CLASS}
            tabIndex={barOnScreen ? undefined : -1}
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
          tabIndex={barOnScreen ? undefined : -1}
        >
          <Link href="/food-menu" onClick={() => trackMenuView('food')}>
            <span className="max-sm:sr-only">View menu</span>
          </Link>
        </Button>

        <a
          href={`tel:${PHONE_DISPLAY}`}
          aria-label="Call The Anchor"
          tabIndex={barOnScreen ? undefined : -1}
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
          tabIndex={barOnScreen ? undefined : -1}
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
