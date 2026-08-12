import type { Event } from '@/lib/api'
import { getEventWebsiteUrl } from '@/lib/event-url'
import { ShareButton } from '@/components/ShareButton'
import { cn } from '@/lib/utils'
import { getEventSocialCopy } from '@/lib/event-social-copy'

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
  const socialCopy = getEventSocialCopy(event)

  return (
    <div className={cn('flex flex-wrap justify-center gap-3', className)}>
      <ShareButton
        title={socialCopy?.title || event.name}
        text={socialCopy?.description}
        url={eventUrl}
        source={source}
        refreshPreviewDaily
        variant="ghost"
        size={size}
      />
    </div>
  )
}
