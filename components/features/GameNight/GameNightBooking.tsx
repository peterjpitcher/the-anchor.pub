'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Badge, Card, CardBody } from '@/components/ui'
import { PhoneButton } from '@/components/PhoneButton'
import { CONTACT } from '@/lib/constants'
import { RegretReduction } from '@/components/psychology'
import { ManagementEventBookingForm } from '@/components/features/EventBooking/ManagementEventBookingForm'
import { trackCtaClick } from '@/lib/gtm-events'
import { getEventRemainingCapacity, formatEventTime, type Event } from '@/lib/api'
import { getEventBookingBlockReason, isEventBookingClosed } from '@/lib/event-lifecycle'
import { GAME_NIGHT_BOOKING_ANCHOR } from './GameNightCtaActions'
import { gameNightShortDate } from './format'

/** Below this many places left, saying so is urgency. Above it, it is noise. */
const SCARCITY_THRESHOLD = 20

/** Dates offered in the switcher. Beyond this, the full list below serves. */
const MAX_SWITCHER_DATES = 4

interface GameNightBookingProps {
  /** Upcoming events for this game, ascending by start date. */
  events: Event[]
  /** Lower-case game name, e.g. "quiz night". */
  gameName: string
  /** Config slug, used for tracking. */
  gameSlug: string
  /** Payment and arrival reassurance from the game config. */
  bookingNote: string
}

/**
 * Inline booking for a game night category page.
 *
 * This is the structural fix on these pages. The category pages carried all the
 * persuasion (roughly 12,000 characters on /quiz-night) and no booking form,
 * while the event detail pages carried the form and a quarter of the copy. Paid
 * traffic has to land on the category page, because an event page expires on its
 * date and cannot absorb a three month campaign, so every campaign click was
 * paying for an extra hop to reach a form.
 *
 * The form itself is the same `ManagementEventBookingForm` the event pages use,
 * so seats, seating preference, Turnstile, the sold-out waitlist path and the
 * UTM/fbclid/gclid capture all come along unchanged. The only new thing here is
 * letting the visitor pick which date they are booking without leaving the page.
 *
 * Measurement note: the form emits `form_view` on mount, and switching date
 * remounts it, so `form_view` fires once on load plus once per date switch. That
 * is deliberate (a switch really is a new form view) but it means form_view is
 * not a count of unique visitors reaching the form. Use `cta_click` with
 * location `inline_booking_date_switch` to see how often switching happens.
 */
export function GameNightBooking({
  events,
  gameName,
  gameSlug,
  bookingNote
}: GameNightBookingProps) {
  // Dates a visitor could actually book: drafts, cancellations, past dates and
  // events with bookings switched off are not offered at all. Sold-out dates are
  // deliberately kept, because the form's own submit path offers the waitlist
  // and a captured lead beats a dead end.
  const bookable = useMemo(
    () =>
      events
        .filter((event) => {
          const blockReason = getEventBookingBlockReason(event)
          if (blockReason && blockReason !== 'sold_out') return false
          return !isEventBookingClosed(event)
        })
        .slice(0, MAX_SWITCHER_DATES),
    [events]
  )

  const [selectedId, setSelectedId] = useState<string | null>(bookable[0]?.id ?? null)
  const selected = bookable.find((event) => event.id === selectedId) ?? bookable[0] ?? null

  if (!selected) {
    return (
      <Card accent id={GAME_NIGHT_BOOKING_ANCHOR}>
        <CardBody className="space-y-4 text-center">
          <h2 className="text-h3 text-ink-strong">No {gameName} dates on sale yet</h2>
          <p className="text-ink-muted">
            The next {gameName} is not confirmed at the moment. Call us and we will tell you the
            moment a date goes in the diary, or see what else is coming up.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PhoneButton
              phone={CONTACT.phone}
              source={`${gameSlug}_booking_empty`}
              variant="primary"
              size="lg"
            >
              Call {CONTACT.phone}
            </PhoneButton>
            <Link
              href="/whats-on"
              className="font-semibold text-accent-text transition hover:text-anchor-green"
            >
              See what&rsquo;s on &rarr;
            </Link>
          </div>
        </CardBody>
      </Card>
    )
  }

  const remaining = getEventRemainingCapacity(selected)
  const showScarcity = remaining !== null && remaining > 0 && remaining <= SCARCITY_THRESHOLD
  const isFull = remaining === 0

  return (
    <Card accent id={GAME_NIGHT_BOOKING_ANCHOR}>
      <CardBody className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-h3 text-ink-strong">Book {gameName}</h2>
          <p className="text-ink-muted">{bookingNote}</p>
          <RegretReduction variant="booking" />
        </div>

        {bookable.length > 1 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-ink-strong">Which date?</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={`${gameName} dates`}>
              {bookable.map((event) => {
                const isSelected = event.id === selected.id
                const eventRemaining = getEventRemainingCapacity(event)

                return (
                  <button
                    key={event.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedId(event.id)
                      trackCtaClick({
                        id: `${gameSlug}_booking_date_switch`,
                        label: gameNightShortDate(event.startDate),
                        location: 'inline_booking_date_switch',
                        destination: `#${GAME_NIGHT_BOOKING_ANCHOR}`,
                        context: gameSlug
                      })
                    }}
                    className={`rounded-pill border px-4 py-2 text-sm font-semibold transition ${
                      isSelected
                        ? 'border-anchor-green bg-anchor-green text-white'
                        : 'border-line-strong bg-surface text-ink-strong hover:border-anchor-green'
                    }`}
                  >
                    {gameNightShortDate(event.startDate)}
                    {eventRemaining === 0 && (
                      <span className="ml-1.5 font-normal opacity-80">(full)</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="space-y-3 border-t border-line pt-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="font-semibold text-ink-strong">{selected.name}</p>
            <p className="text-sm text-ink-muted">
              {gameNightShortDate(selected.startDate)} &middot; {formatEventTime(selected.startDate)}
            </p>
            {showScarcity && (
              <Badge variant="gold">
                {remaining} {remaining === 1 ? 'place' : 'places'} left
              </Badge>
            )}
            {isFull && <Badge variant="outline">Full, join the waitlist</Badge>}
          </div>

          {/* key forces a fresh form per date: without it the previous date's
              seat count and entered details would carry over to a different
              event, which is a booking for the wrong night waiting to happen. */}
          <ManagementEventBookingForm
            key={selected.id}
            event={selected}
            title={`Book ${gameNightShortDate(selected.startDate)}`}
            compact
          />
        </div>
      </CardBody>
    </Card>
  )
}
