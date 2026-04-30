import type { TableAvailabilitySlot } from '@/lib/api'
import { isValidTime, normalizeTime, toMinutes } from '@/lib/table-booking-service-windows'

export const DEFAULT_SLOT_WINDOW_SIZE = 7

export function pickSlotWindow<T extends Pick<TableAvailabilitySlot, 'time'>>(
  slots: T[],
  requestedTime: string,
  size: number = DEFAULT_SLOT_WINDOW_SIZE
): T[] {
  if (size <= 0) {
    return []
  }

  if (slots.length <= size) {
    return slots
  }

  const normalizedRequestedTime = normalizeTime(requestedTime)
  if (!isValidTime(normalizedRequestedTime)) {
    return slots.slice(0, size)
  }

  const requestedMinutes = toMinutes(normalizedRequestedTime)
  let centerIndex = 0
  let bestDistance = Number.POSITIVE_INFINITY

  slots.forEach((slot, index) => {
    const distance = Math.abs(toMinutes(slot.time) - requestedMinutes)
    if (distance < bestDistance) {
      bestDistance = distance
      centerIndex = index
    }
  })

  const half = Math.floor(size / 2)
  let start = centerIndex - half
  let end = start + size

  if (start < 0) {
    end += -start
    start = 0
  }

  if (end > slots.length) {
    start = Math.max(0, start - (end - slots.length))
    end = slots.length
  }

  return slots.slice(start, end)
}
