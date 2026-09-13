'use client'

import { Button } from '@/components/ui'
import { trackCtaClick } from '@/lib/gtm-events'

/** The id of the upcoming nights section on /whats-on. */
export const WHATS_ON_UPCOMING_ANCHOR = 'upcoming-events'

const LABEL = 'See what’s coming up'

/**
 * The /whats-on hero's primary action: down to the nights listed on this page.
 *
 * It used to say "Reserve an event table" and go to /book-table, the dining
 * wizard, which opens on pub food and keeps its first event link near the
 * foot of the page. Somebody who came to see what is on was handed a different
 * product. It was also a plain link, so the click was never measured.
 */
export function WhatsOnUpcomingButton() {
  return (
    <Button asChild variant="primary" size="lg" fullWidth>
      <a
        href={`#${WHATS_ON_UPCOMING_ANCHOR}`}
        className="w-full sm:w-auto"
        onClick={() =>
          trackCtaClick({
            id: 'whats_on_upcoming',
            label: LABEL,
            location: 'hero',
            destination: `#${WHATS_ON_UPCOMING_ANCHOR}`,
            context: 'whats_on'
          })
        }
      >
        {LABEL}
      </a>
    </Button>
  )
}
