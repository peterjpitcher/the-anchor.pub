import type { Event } from '@/lib/api'
import { buildGoogleCalendarUrl } from '@/lib/event-calendar'
import { getEventWebsiteUrl } from '@/lib/event-url'
import { ShareButton } from '@/components/ShareButton'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

type EventSecondaryActionsProps = {
  event: Event
  source: string
  className?: string
  size?: 'xs' | 'sm' | 'md'
}

export function EventSecondaryActions({
  event,
  source,
  className,
  size = 'sm'
}: EventSecondaryActionsProps) {
  const eventUrl = getEventWebsiteUrl(event, { absolute: true })
  const googleCalendarUrl = buildGoogleCalendarUrl(event)
  const icsUrl = `/api/calendar/event/${event.id}`

  return (
    <div className={cn('flex flex-wrap justify-center gap-3', className)}>
      <ShareButton
        title={event.name}
        url={eventUrl}
        source={source}
        variant="ghost"
        size={size}
      />
      <Button asChild variant="ghost" size={size}>
        <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">
          Add to Calendar
        </a>
      </Button>
      <Button asChild variant="ghost" size={size}>
        <a href={icsUrl}>
          Download .ics
        </a>
      </Button>
    </div>
  )
}

