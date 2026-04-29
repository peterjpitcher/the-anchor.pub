'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Phone } from 'lucide-react'
import { BookTableButton } from '@/components/BookTableButton'
import { trackPhoneCallClick } from '@/lib/gtm-events'

const SCROLL_THRESHOLD_PX = 300
const PHONE_NUMBER = '01753 682707'
const PHONE_TEL_HREF = 'tel:01753682707'

/**
 * Sticky mobile booking CTA bar for the /sunday-lunch page.
 *
 * - Mobile only (hidden on `lg:` and up via `lg:hidden`).
 * - Hidden initially, slides up after the user scrolls more than 300px.
 * - Two CTAs: primary "Book Sunday roast" + icon-only phone button.
 * - Respects prefers-reduced-motion.
 */
export function StickyMobileBookingCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD_PX)
    }

    // Initialise state from current scroll position (e.g. on rehydration).
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-anchor-green/95 backdrop-blur border-t border-anchor-gold/30 px-4 py-2.5 lg:hidden transition-transform motion-reduce:transition-none ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-hidden={!visible}
      data-testid="sticky-mobile-booking-cta"
      role="region"
      aria-label="Booking actions"
    >
      <div className="flex items-center gap-2">
        <BookTableButton
          source="sunday_lunch_sticky_mobile"
          context="sunday_roast"
          customHref="/book-table"
          variant="primary"
          size="md"
          className="flex-1 justify-center"
        >
          Book Sunday roast
        </BookTableButton>
        <Link
          href={PHONE_TEL_HREF}
          onClick={() =>
            trackPhoneCallClick({
              phone: PHONE_NUMBER,
              source: 'sunday_lunch_sticky_mobile',
            })
          }
          aria-label={`Call The Anchor on ${PHONE_NUMBER}`}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-anchor-gold/50 bg-anchor-bg-card text-anchor-cream-text hover:bg-anchor-bg-raised focus:outline-none focus:ring-2 focus:ring-anchor-gold focus:ring-offset-2 focus:ring-offset-anchor-green"
        >
          <Phone className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}

export default StickyMobileBookingCTA
