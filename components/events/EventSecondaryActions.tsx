import type { Event } from '@/lib/api'
import { getEventWebsiteUrl } from '@/lib/event-url'
import { ShareButton } from '@/components/ShareButton'
import { cn } from '@/lib/utils'

type EventSecondaryActionsProps = {
  event: Event
  source: string
  className?: string
  size?: 'sm' | 'md'
}

export function EventSecondaryActions({
  event,
  source,
  className,
  size = 'sm'
}: EventSecondaryActionsProps) {
  const eventUrl = getEventWebsiteUrl(event, { absolute: true })

  return (
    <div className={cn('flex flex-wrap justify-center gap-3', className)}>
      <ShareButton
        title={event.name}
        url={eventUrl}
        source={source}
        variant="ghost"
        size={size}
      />
    </div>
  )
}

