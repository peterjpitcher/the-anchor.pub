'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Phone } from 'lucide-react'
import type { Event } from '@/lib/api'
import { EventBookingButton } from '@/components/EventBookingButton'
import { getEventShortPaymentReassurance } from '@/lib/event-booking-experience'
import { trackPhoneCallClick } from '@/lib/gtm-events'

const SCROLL_THRESHOLD_PX = 300
const PHONE_NUMBER = '01753 682707'
const PHONE_TEL_HREF = 'tel:01753682707'

type EventStickyBookingCTAProps = {
  event: Event
  source: string
  label?: string
}

export function EventStickyBookingCTA({
  event,
  source,
  label = 'Reserve table'
}: EventStickyBookingCTAProps) {
  const [visible, setVisible] = useState(false)
  const [bookingFormVisible, setBookingFormVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD_PX)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return

    const bookingForm = document.getElementById('event-booking')
    if (!bookingForm) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setBookingFormVisible(Boolean(entry?.isIntersecting))
      },
      {
        threshold: 0.12
      }
    )

    observer.observe(bookingForm)
    return () => observer.disconnect()
  }, [])

  const shouldShow = visible && !bookingFormVisible

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 border-t border-anchor-gold-dark/30 bg-anchor-green/95 px-4 py-2.5 backdrop-blur transition-transform motion-reduce:transition-none lg:hidden ${
        shouldShow ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-hidden={!shouldShow}
      data-testid="event-sticky-booking-cta"
      role="region"
      aria-label="Event booking actions"
    >
      <div className="mb-2 min-w-0 text-center">
        <p className="truncate text-xs font-semibold text-white">{event.name}</p>
        <p className="text-xs text-white/80">{getEventShortPaymentReassurance(event)}</p>
      </div>
      <div className="flex items-center gap-2">
        <EventBookingButton
          event={event}
          customHref="#event-booking"
          label={label}
          source={source}
          size="md"
          className="flex-1 justify-center"
        />
        <Link
          href={PHONE_TEL_HREF}
          onClick={() =>
            trackPhoneCallClick({
              phone: PHONE_NUMBER,
              source
            })
          }
          aria-label={`Call The Anchor on ${PHONE_NUMBER}`}
          className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md border border-anchor-gold-dark/50 bg-anchor-green-card text-anchor-cream-text hover:bg-anchor-green-raised focus:outline-none focus:ring-2 focus:ring-anchor-gold-dark focus:ring-offset-2 focus:ring-offset-anchor-green"
        >
          <Phone className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
