'use client'

import { Button } from '@/components/ui'
import { PhoneButton } from '@/components/PhoneButton'
import { CONTACT } from '@/lib/constants'
import { trackCtaClick } from '@/lib/gtm-events'

export const GAME_NIGHT_BOOKING_ANCHOR = 'book'

interface GameNightCtaActionsProps {
  /** Config slug, used as the tracking context and CTA id prefix. */
  gameSlug: string
  /** Full primary CTA label, date already substituted by the caller. */
  label: string
  /**
   * False when no date is bookable. The primary action becomes a phone call,
   * because sending someone to an empty booking section is worse than nothing.
   */
  hasBookableDate: boolean
  /** Where on the page this pair sits. Kept out of the id so the two are
   *  comparable in reporting: same cta_id, different cta_location. */
  location: 'hero' | 'closing_band'
}

/**
 * The primary and secondary CTA pair for a game night page, used in the hero and
 * again in the closing band.
 *
 * Until now none of the four game pages passed `actions` to InteriorHero at all,
 * so the first clickable thing below the site nav on /quiz-night sat roughly
 * 680px down the page. That is the single largest conversion leak on these pages
 * for paid traffic.
 *
 * Both instances jump to the on-page booking section rather than to /book-table.
 * The booking form for the next date now lives on this page, and bouncing a warm
 * visitor to the generic table-booking wizard throws away the event context they
 * arrived with.
 */
export function GameNightCtaActions({
  gameSlug,
  label,
  hasBookableDate,
  location
}: GameNightCtaActionsProps) {
  if (!hasBookableDate) {
    return (
      <PhoneButton
        phone={CONTACT.phone}
        source={`${gameSlug}_${location}_no_dates`}
        variant="primary"
        size="lg"
        className="w-full sm:w-auto"
      >
        {label}
      </PhoneButton>
    )
  }

  return (
    <>
      <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
        <a
          href={`#${GAME_NIGHT_BOOKING_ANCHOR}`}
          onClick={() =>
            trackCtaClick({
              id: `${gameSlug}_book`,
              label,
              location,
              destination: `#${GAME_NIGHT_BOOKING_ANCHOR}`,
              context: gameSlug
            })
          }
        >
          {label}
        </a>
      </Button>
      <PhoneButton
        phone={CONTACT.phone}
        source={`${gameSlug}_${location}_call`}
        variant="outline"
        size="lg"
        className="w-full sm:w-auto"
      >
        Call {CONTACT.phone}
      </PhoneButton>
    </>
  )
}
