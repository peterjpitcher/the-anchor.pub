import type { ReactElement, ReactNode } from 'react'
import { EventDateCards, type EventDateCardsProps } from '@/components/features/EventDateCards'
import { AddToCalendar } from '@/components/events/AddToCalendar'
import type { Event } from '@/lib/api'

/**
 * The upcoming-dates list for a game night page, with an add-to-calendar control
 * on every date.
 *
 * Until now the only thing a visitor could do with a listed date was book it.
 * Somebody who has decided they want to come but is not ready to commit a head
 * count had nowhere to go, so the date left with them and did not come back.
 *
 * The control is mounted through `renderDetails` rather than by changing
 * `EventDateCards`, which is shared with nothing else today but is not this
 * feature's to own. The consequence is that the buttons sit under the event
 * description rather than beside the booking button; moving them into the CTA
 * column needs a slot on EventDateCards itself.
 *
 * `AddToCalendar` gates itself on the event's phase, so a cancelled, postponed
 * or finished night silently renders nothing here. That is the behaviour we
 * want, and it is why this wrapper does no phase checking of its own.
 */

export interface GameNightDateCardsProps extends EventDateCardsProps {
  /** Where the calendar control is mounted, e.g. `quiz_night_date_card`. */
  calendarSource: string
}

export function GameNightDateCards({
  calendarSource,
  renderDetails,
  ...props
}: GameNightDateCardsProps): ReactElement {
  const renderDetailsWithCalendar = (event: Event): ReactNode => (
    <>
      {renderDetails?.(event)}
      <AddToCalendar
        event={event}
        source={calendarSource}
        size="sm"
        layout="stacked"
        label="Not ready to book? Add it to your calendar"
      />
    </>
  )

  return <EventDateCards {...props} renderDetails={renderDetailsWithCalendar} />
}
