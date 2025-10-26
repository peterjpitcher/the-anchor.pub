import { cn } from '@/lib/utils'
import { formatEventDate, formatEventTime, formatDoorTime, formatPrice, type Event } from '@/lib/api'

interface EventMetadataProps {
  event: Partial<Event>
  showDate?: boolean
  showTime?: boolean
  showDoorTime?: boolean
  showPrice?: boolean
  showVenue?: boolean
  showCapacity?: boolean
  showPerformer?: boolean
  className?: string
  itemClassName?: string
  layout?: 'horizontal' | 'vertical' | 'inline'
}

/**
 * EventMetadata component for displaying event information consistently
 * Handles all common event metadata with proper formatting
 */
export function EventMetadata({
  event,
  showDate = true,
  showTime = true,
  showDoorTime = true,
  showPrice = true,
  showVenue = false,
  showCapacity = false,
  showPerformer = true,
  className,
  itemClassName,
  layout = 'horizontal'
}: EventMetadataProps) {
  const metadata = []

  if (showDate && event.startDate) {
    metadata.push({
      icon: '📅',
      label: 'Date',
      value: formatEventDate(event.startDate)
    })
  }

  if (showTime && event.startDate) {
    metadata.push({
      icon: '🕐',
      label: 'Time',
      value: formatEventTime(event.startDate)
    })
  }

  if (showDoorTime && event.doorTime) {
    const doorTimeText = formatDoorTime(event.doorTime)
    if (doorTimeText) {
      metadata.push({
        icon: '🚪',
        label: 'Doors',
        value: doorTimeText
      })
    }
  }

  if (showPrice && event.offers) {
    metadata.push({
      icon: '💷',
      label: 'Price',
      value: event.offers.price === "0" 
        ? "FREE" 
        : formatPrice(event.offers.price, event.offers.priceCurrency),
      className: event.offers.price === "0" ? 'text-green-600 font-semibold' : ''
    })
  }

  if (showVenue && event.location?.name) {
    metadata.push({
      icon: '📍',
      label: 'Venue',
      value: event.location.name
    })
  }

  if (showCapacity && event.remainingAttendeeCapacity !== undefined) {
    if (event.remainingAttendeeCapacity === 0) {
      metadata.push({
        icon: '❌',
        label: 'Availability',
        value: 'SOLD OUT',
        className: 'text-red-600 font-semibold'
      })
    } else if (event.remainingAttendeeCapacity > 0 && event.remainingAttendeeCapacity <= 10) {
      metadata.push({
        icon: '⚠️',
        label: 'Availability',
        value: `${event.remainingAttendeeCapacity} tickets left`,
        className: 'text-amber-600 font-semibold'
      })
    }
  }

  if (showPerformer && event.performer?.name) {
    metadata.push({
      icon: '🎤',
      label: 'Featuring',
      value: event.performer.name
    })
  }

  if (metadata.length === 0) return null

  const layoutClasses = {
    horizontal: 'flex flex-wrap items-center gap-4',
    vertical: 'flex flex-col gap-2',
    inline: 'inline-flex flex-wrap items-center gap-3'
  }

  return (
    <div className={cn(layoutClasses[layout], className)}>
      {metadata.map((item, index) => (
        <div
          key={index}
          className={cn('flex items-center gap-1 text-sm', itemClassName, item.className)}
        >
          <span aria-hidden="true" className="flex-shrink-0">{item.icon}</span>
          <span className="sr-only">{item.label}:</span>
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  )
}
