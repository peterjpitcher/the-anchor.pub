'use client'

import { getEventSquareImage } from '@/lib/event-image'
import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { type Event } from '@/lib/api'
import { trackBannerEvent, trackCtaClick } from '@/lib/gtm-events'
import { EventBookingButton } from '@/components/EventBookingButton'
import { useFloatingLayer } from '@/hooks/useFloatingLayer'
import { usePastHero } from '@/hooks/usePastHero'
import { useFocusedControlBehind, useFooterBehind } from '@/hooks/useLayerStepAside'

const BANNER_STORAGE_KEY = 'event_banner_dismissed_until'
const SESSION_ELIGIBILITY_KEY = 'event_banner_session_show'
const DISMISS_DURATION_MS = 1000 * 60 * 60 * 24 // 24 hours
// The card floats `bottom-28` above the bottom of the screen: 7rem, 112px. Anything
// that scrolls up past that line is underneath the card.
const CARD_BOTTOM_OFFSET_PX = 112
const MAX_LEAD_DAYS = 3
/**
 * Routes where the banner must not appear, because the page already does its job
 * better than a floating card can.
 *
 * '/events' was the original entry: an event page is the countdown.
 *
 * The four game night pages are here for the same reason, plus a harder one. Each
 * now leads with its own dated CTA ("Book your table for Wed 19 Aug") and carries
 * the booking form for that date. The banner is fixed at bottom-28, which on a
 * tall hero lands directly on top of that CTA and swallows the click, so the
 * page's primary action stopped working while the banner was showing.
 *
 * '/lunch-and-dinner' is the landing page for the weekday food ads (from 15 September
 * 2026). On a phone the banner covered the lower half of its "Book a table" button,
 * and a visitor who came for lunch or dinner has no use for an event card.
 *
 * '/book-table' is the booking form itself. On a phone the banner sat on top of the
 * party size and date fields (seen at 375 x 812, 3 October 2026), for the half of
 * sessions that are shown it. It was first hidden only for arrivals from the food ads'
 * landing page; the owner then asked for it to be hidden here for everyone (3 October
 * 2026), the same rule the Christmas pop-up already follows on this page.
 */
const HIDDEN_PATH_PREFIXES = [
  '/events',
  '/quiz-night',
  '/cash-bingo',
  '/music-bingo',
  '/karaoke',
  '/lunch-and-dinner',
  '/book-table',
]

interface BannerState {
  event: Event
  eventDate: Date
  daysUntil: number
  hoursUntil: number
}

const getWeekday = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(date)

const getFormattedDate = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  }).format(date)

const computeTiming = (dateString: string) => {
  const eventDate = new Date(dateString)
  if (Number.isNaN(eventDate.getTime())) return null

  const now = new Date()
  const diffMs = eventDate.getTime() - now.getTime()
  if (diffMs <= 0) return null

  const hoursUntil = diffMs / (1000 * 60 * 60)
  const daysUntil = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  return { eventDate, daysUntil, hoursUntil }
}

const hasRecentDismissal = () => {
  if (typeof window === 'undefined') return false
  try {
    const stored = window.localStorage.getItem(BANNER_STORAGE_KEY)
    if (!stored) return false
    const expiry = Number(stored)
    if (Number.isNaN(expiry)) return false
    return Date.now() < expiry
  } catch (error) {
    console.warn('Unable to read dismissal state', error)
    return false
  }
}

const markDismissal = () => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      BANNER_STORAGE_KEY,
      String(Date.now() + DISMISS_DURATION_MS)
    )
  } catch (error) {
    console.warn('Unable to persist dismissal state', error)
  }
}

const determineSessionEligibility = () => {
  if (typeof window === 'undefined') return true
  try {
    const stored = window.sessionStorage.getItem(SESSION_ELIGIBILITY_KEY)
    if (stored === 'true') return true
    if (stored === 'false') return false

    const allow = Math.random() < 0.5
    window.sessionStorage.setItem(SESSION_ELIGIBILITY_KEY, String(allow))
    return allow
  } catch (error) {
    console.warn('Unable to persist session eligibility', error)
    return Math.random() < 0.5
  }
}

/**
 * Exported for test. Matches on an exact path or a real path segment, never a bare
 * startsWith: '/quiz-night' must not swallow '/quiz-night-competition-terms',
 * which is a separate page with nothing to suppress.
 */
export const shouldSuppressPath = (pathname: string | null) => {
  if (!pathname) return false
  return HIDDEN_PATH_PREFIXES.some(
    prefix => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

type BannerTone = 'dark' | 'light' | 'alert' | 'muted'

const getUrgencyCopy = (event: Event, daysUntil: number, hoursUntil: number) => {
  const eventDate = new Date(event.startDate)

  if (hoursUntil <= 24) {
    return {
      title: `Happening ${hoursUntil <= 12 ? 'tonight' : 'tomorrow'}: ${event.name}`,
      message: `Starts ${getFormattedDate(eventDate)} at ${eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}. Book early to get your preferred time.`,
      tone: 'alert' as BannerTone,
      backgroundClass: 'bg-red-600 text-white'
    }
  }

  if (daysUntil <= 2) {
    return {
      title: `${event.name} is almost here`,
      message: `Join us this ${getWeekday(eventDate)} at ${eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}. Book early to get your preferred time.`,
      tone: 'light' as BannerTone,
      backgroundClass: 'bg-anchor-gold-dark text-anchor-charcoal'
    }
  }

  if (daysUntil <= 4) {
    return {
      title: `${event.name} this ${getWeekday(eventDate)}`,
      message: 'Book early to get your preferred time.',
      tone: 'dark' as BannerTone,
      backgroundClass: 'bg-anchor-green text-white'
    }
  }

  return {
    title: `${event.name} next ${getWeekday(eventDate)}`,
    message: 'Book early to get your preferred time.',
    tone: 'muted' as BannerTone,
    backgroundClass: 'bg-anchor-green/95 text-white'
  }
}

export function EventCountdownBanner() {
  const pathname = usePathname()
  const [banner, setBanner] = useState<BannerState | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [sessionEligible] = useState(determineSessionEligibility)

  useEffect(() => {
    if (shouldSuppressPath(pathname)) {
      setBanner(null)
      return
    }
    if (hasRecentDismissal()) {
      setDismissed(true)
      setBanner(null)
      return
    }
    if (!sessionEligible) {
      setBanner(null)
      return
    }

    setDismissed(false)

    let cancelled = false

    async function fetchEvents() {
      try {
        const response = await fetch('/api/events?limit=5')
        if (!response.ok) return

        const payload = await response.json()
        if (payload?.success === false) return

        const eventsData = payload?.data || payload
        const events: Event[] = eventsData?.events || eventsData || []

        let selected: BannerState | null = null

        for (const event of events) {
          const timing = computeTiming(event.startDate)
          if (!timing) continue
          if (timing.daysUntil > MAX_LEAD_DAYS) continue

          selected = {
            event,
            eventDate: timing.eventDate,
            daysUntil: timing.daysUntil,
            hoursUntil: timing.hoursUntil
          }
          break
        }

        if (!cancelled) {
          setBanner(selected)
        }
      } catch (error) {
        console.warn('Unable to load upcoming events for banner', error)
      }
    }

    fetchEvents()

    return () => {
      cancelled = true
    }
  }, [pathname, sessionEligible])

  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    if (!banner) return

    const updateCountdown = () => {
      const now = new Date()
      const diff = banner.eventDate.getTime() - now.getTime()
      if (diff <= 0) {
        setCountdown('Starting soon')
        return
      }

      const totalMinutes = Math.floor(diff / (1000 * 60))
      const days = Math.floor(totalMinutes / (60 * 24))
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
      const minutes = totalMinutes % 60

      if (days > 0) {
        setCountdown(`${days}d ${hours}h`)
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m`)
      } else {
        setCountdown(`${minutes}m`)
      }
    }

    updateCountdown()
    const timer = window.setInterval(updateCountdown, 60000)
    return () => window.clearInterval(timer)
  }, [banner])

  const content = useMemo(() => {
    if (!banner) return null
    const { event, daysUntil, hoursUntil } = banner
    return getUrgencyCopy(event, daysUntil, hoursUntil)
  }, [banner])

  // When the card is on screen is no longer the card's own decision. Three rules,
  // all from the 7 October 2026 site review and owner decision 12 (one floating
  // layer at a time):
  //
  // 1. Not over the first screen. Pinned above the bottom edge from the moment a
  //    page opened, the card sat on the hero's own buttons on 67 pages, Book a
  //    table on the homepage among them (LS-021). It now waits until the visitor
  //    has scrolled past the hero, the same trigger the booking bar uses. The
  //    hidden list above stays: those pages are booking pages at any scroll depth.
  // 2. After the cookie banner, never with it. The booking bar rides up on the
  //    banner into the space the card was told is free, and the card then covered
  //    the bar (LS-002).
  // 3. Never over a dialog. With the quick booking sheet open the card covered
  //    nine of the ten times a visitor could pick (LS-001).
  //
  // Rules 2 and 3 are the floating layer coordinator's (lib/floating-layers.ts).
  // The card says it wants to show and is told whether it may.
  const pastHero = usePastHero(pathname)
  const wantsCard = Boolean(banner) && !dismissed && pastHero
  const cardShowing = useFloatingLayer('event-banner', wantsCard)

  // Counted when the card is first on screen, once for each event. It used to be
  // counted when the event was fetched, which was the same moment while the card
  // appeared as the page opened and is not now.
  const viewedCampaignRef = useRef<string | null>(null)
  useEffect(() => {
    if (!banner || !cardShowing) return
    const campaign = banner.event.slug || banner.event.id
    if (viewedCampaignRef.current === campaign) return
    viewedCampaignRef.current = campaign
    trackBannerEvent({
      id: 'event_countdown_banner',
      action: 'view',
      label: banner.event.name,
      campaign
    })
  }, [banner, cardShowing])

  // At the bottom of a page the card sat on top of the footer until it was closed. On a
  // phone, where it is as wide as the screen, that covered the whole row of legal links
  // (Privacy Policy, Cookie settings and the rest). On wider screens, where it is a
  // corner card, it covered the copyright line and the first three of them. It now steps
  // aside at every size while the footer is underneath it and comes back when the visitor
  // scrolls up again. The class on the card below does the hiding, so the card stays
  // mounted.
  const footerUnderCard = useFooterBehind(cardShowing, CARD_BOTTOM_OFFSET_PX)

  // A control reached with the Tab key could be wholly hidden behind the card
  // (site review AX-004). The card steps aside while that is so.
  const cardRef = useRef<HTMLDivElement>(null)
  const focusUnderCard = useFocusedControlBehind(cardRef, cardShowing)

  if (dismissed || !banner || !content) {
    return null
  }

  const { event, eventDate } = banner

  const handleDismiss = () => {
    if (banner) {
      trackBannerEvent({
        id: 'event_countdown_banner',
        action: 'dismiss',
        label: banner.event.name,
        campaign: banner.event.slug || banner.event.id
      })
    }
    setDismissed(true)
    markDismissal()
  }

  const handleCtaClick = () => {
    if (!banner) return
    trackCtaClick({
      id: 'event_banner_cta',
      label: 'Book now',
      location: 'event_countdown_banner',
      destination: 'booking_link',
      context: banner.event.slug || banner.event.id
    })
    trackBannerEvent({
      id: 'event_countdown_banner',
      action: 'click',
      label: banner.event.name,
      campaign: banner.event.slug || banner.event.id
    })
  }

  const imageSrc = getEventSquareImage(event)
  const weekday = getWeekday(eventDate)
  const timeString = eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return (
    // `data-layer-showing` is the coordinator's answer. The card stays mounted
    // while it is hidden, so whatever its button opened is not torn down with it.
    // The focus rule hides with visibility, not display: see useFocusedControlBehind.
    <div
      data-layer-showing={cardShowing}
      data-footer-under-card={footerUnderCard}
      data-focus-under-card={focusUnderCard}
      className="fixed bottom-28 left-0 right-0 z-[90] px-4 pointer-events-none data-[layer-showing=false]:hidden data-[footer-under-card=true]:hidden data-[focus-under-card=true]:invisible sm:left-6 sm:right-auto sm:px-0"
    >
      <div ref={cardRef} className="pointer-events-auto relative mx-auto w-full rounded-2xl border border-line border-t-[3px] border-t-anchor-gold bg-surface text-ink px-4 py-4 shadow-lg backdrop-blur-lg sm:mx-0 sm:w-80 sm:px-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* No artwork means no avatar at all, rather than an empty grey ring. */}
          {imageSrc && (
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-line flex-shrink-0">
              <Image src={imageSrc} alt={`${event.name} poster`} fill className="object-cover" sizes="40px" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-text">Next Event</p>
            <p className="truncate text-sm sm:text-base font-semibold text-ink-strong">{event.name}</p>
            <p className="text-[12px] text-ink-muted">{weekday} · {timeString}</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-ink-muted leading-snug">{content.message}</p>
        <div className="mt-3 flex items-center gap-2 text-sm text-ink-muted">
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent-text">{countdown}</span>
          <span>{weekday} · {timeString}</span>
        </div>
        <div className="mt-3">
          <EventBookingButton
            event={event}
            fullWidth={false}
            size="sm"
            variant="outline"
            source="event_countdown_banner"
            onClick={handleCtaClick}
          />
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          // The circle stays 28px; the invisible ring round it makes the tap
          // target 44px (site review LS-016).
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-sunk text-ink-muted transition hover:text-ink before:absolute before:-inset-2 before:content-['']"
          aria-label="Dismiss event reminder"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 8.586 3.707 2.293 2.293 3.707 8.586 10l-6.293 6.293 1.414 1.414L10 11.414l6.293 6.293 1.414-1.414L11.414 10l6.293-6.293-1.414-1.414L10 8.586Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}
