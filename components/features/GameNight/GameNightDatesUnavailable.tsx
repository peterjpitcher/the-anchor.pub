import { Alert } from '@/components/ui'
import { PhoneLink } from '@/components/PhoneLink'
import { CONTACT } from '@/lib/constants'

interface GameNightDatesUnavailableProps {
  /** Lower-case game name, e.g. "quiz night". */
  gameName: string
  /** Tracking source for the phone link. */
  source: string
  className?: string
}

/**
 * What a game night page says when the event diary could not be read.
 *
 * It replaces any claim that nothing is on sale, because during an outage we
 * have no evidence either way. The wording mirrors the notice /whats-on shows
 * for the same failure, and it does not branch on how many dates loaded, so it
 * stays true whether the page shows a short list or none at all.
 */
export function GameNightDatesUnavailable({
  gameName,
  source,
  className
}: GameNightDatesUnavailableProps) {
  return (
    <Alert
      variant="warning"
      title={`We could not load the ${gameName} dates just now`}
      className={className}
    >
      <p>
        Our event diary is not answering, so this page may be missing dates or showing none at
        all. Please do not read a gap as nothing being on. Call{' '}
        <PhoneLink
          phone={CONTACT.phone}
          source={source}
          className="font-semibold text-accent-text underline"
          showIcon={false}
        >
          {CONTACT.phone}
        </PhoneLink>{' '}
        and we will tell you what is coming up.
      </p>
    </Alert>
  )
}
