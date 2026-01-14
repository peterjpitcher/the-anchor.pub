import type { Event } from '@/lib/api'
import { formatPrice } from '@/lib/api'

type EventPriceSource = Pick<Event, 'offers'>

export function getEventPriceLabel(event: EventPriceSource): string | null {
  const rawPrice = event.offers?.price
  if (!rawPrice) return null

  const numericPrice =
    typeof rawPrice === 'string' ? Number.parseFloat(rawPrice) : Number(rawPrice)

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return null
  }

  return formatPrice(rawPrice, event.offers?.priceCurrency || 'GBP')
}

