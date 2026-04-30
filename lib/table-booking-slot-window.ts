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

  // Defensive sort: the availability route already returns chronological
  // slots, but the helper must not silently produce a jumbled grid if that
  // contract is ever broken upstream. Sort a shallow copy so callers' arrays
  // are never mutated.
  const sortedSlots =
    slots.length > 1 && !isAscendingByTime(slots)
      ? [...slots].sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
      : slots

  if (sortedSlots.length <= size) {
    return sortedSlots
  }

  const normalizedRequestedTime = normalizeTime(requestedTime)
  if (!isValidTime(normalizedRequestedTime)) {
    return sortedSlots.slice(0, size)
  }

  const requestedMinutes = toMinutes(normalizedRequestedTime)
  let centerIndex = 0
  let bestDistance = Number.POSITIVE_INFINITY

  sortedSlots.forEach((slot, index) => {
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

  if (end > sortedSlots.length) {
    start = Math.max(0, start - (end - sortedSlots.length))
    end = sortedSlots.length
  }

  return sortedSlots.slice(start, end)
}

function isAscendingByTime<T extends Pick<TableAvailabilitySlot, 'time'>>(slots: T[]): boolean {
  for (let i = 1; i < slots.length; i++) {
    if (toMinutes(slots[i].time) < toMinutes(slots[i - 1].time)) {
      return false
    }
  }
  return true
}
