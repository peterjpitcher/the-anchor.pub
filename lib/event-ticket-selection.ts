import type { EventTicketType } from '@/lib/api'

/**
 * Client-side helpers for the multi-ticket-type booking flow. The single-type
 * booking path does not use any of this — these only apply once an event
 * exposes 2+ active ticket types (see `hasMultipleTicketPrices`).
 */

export type TicketSelectionState = {
  /** quantity chosen per ticket-type id */
  quantities: Record<string, number>
  /** attendee names per ticket-type id (array length tracks the quantity) */
  attendeeNames: Record<string, string[]>
}

export type TicketSelectionLine = {
  ticket_type_id: string
  quantity: number
  attendee_names: string[]
}

const MAX_SEATS = 20

function isSharedType(type: EventTicketType): boolean {
  return type.capacity === null || type.capacity === undefined
}

function normalizeRemaining(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : null
}

/**
 * The remaining seats that shared-pool types draw from collectively. All shared
 * types report the same shared figure from the API, so we take the smallest
 * defined value (defensive) and fall back to null (unknown) when none is given.
 */
export function getSharedRemaining(types: EventTicketType[]): number | null {
  const sharedRemainings = types
    .filter(isSharedType)
    .map((type) => normalizeRemaining(type.remaining))
    .filter((value): value is number => value !== null)

  if (sharedRemainings.length === 0) return null
  return Math.min(...sharedRemainings)
}

/**
 * Maximum quantity selectable for a single type, accounting for its own
 * remaining and — for shared-pool types — the seats already taken by the other
 * shared types in the current basket.
 */
export function getMaxForType(
  type: EventTicketType,
  types: EventTicketType[],
  quantities: Record<string, number>
): number {
  const ownRemaining = normalizeRemaining(type.remaining)

  if (isSharedType(type)) {
    const sharedRemaining = getSharedRemaining(types)
    if (sharedRemaining === null) return MAX_SEATS
    const otherSharedUsed = types
      .filter((candidate) => isSharedType(candidate) && candidate.id !== type.id)
      .reduce((sum, candidate) => sum + (quantities[candidate.id] || 0), 0)
    return Math.max(0, Math.min(MAX_SEATS, sharedRemaining - otherSharedUsed))
  }

  if (ownRemaining === null) return MAX_SEATS
  return Math.max(0, Math.min(MAX_SEATS, ownRemaining))
}

export function getTotalSeats(quantities: Record<string, number>): number {
  return Object.values(quantities).reduce((sum, quantity) => sum + (quantity > 0 ? quantity : 0), 0)
}

/**
 * True when the current basket exceeds any per-type cap or the shared pool.
 */
export function isSelectionOverCapacity(
  types: EventTicketType[],
  quantities: Record<string, number>
): boolean {
  // Per-type dedicated caps.
  for (const type of types) {
    if (isSharedType(type)) continue
    const remaining = normalizeRemaining(type.remaining)
    if (remaining !== null && (quantities[type.id] || 0) > remaining) {
      return true
    }
  }

  // Shared pool: the sum of shared-type quantities must fit the shared remaining.
  const sharedRemaining = getSharedRemaining(types)
  if (sharedRemaining !== null) {
    const sharedUsed = types
      .filter(isSharedType)
      .reduce((sum, type) => sum + (quantities[type.id] || 0), 0)
    if (sharedUsed > sharedRemaining) return true
  }

  return getTotalSeats(quantities) > MAX_SEATS
}

/** Live price breakdown per selected type, plus the basket total. */
export function getSelectionBreakdown(
  types: EventTicketType[],
  quantities: Record<string, number>
): { lines: Array<{ type: EventTicketType; quantity: number; lineTotal: number }>; total: number } {
  const lines = types
    .map((type) => {
      const quantity = quantities[type.id] || 0
      return { type, quantity, lineTotal: Number((type.price * quantity).toFixed(2)) }
    })
    .filter((line) => line.quantity > 0)

  const total = Number(lines.reduce((sum, line) => sum + line.lineTotal, 0).toFixed(2))
  return { lines, total }
}

/**
 * Build the `ticket_selections` payload from the current state. Only types with
 * a positive quantity are included; each line's `attendee_names` is trimmed and
 * padded to the line's quantity so length always equals quantity.
 */
export function buildTicketSelections(
  types: EventTicketType[],
  state: TicketSelectionState
): TicketSelectionLine[] {
  return types
    .map((type) => {
      const quantity = state.quantities[type.id] || 0
      if (quantity <= 0) return null
      const names = Array.from({ length: quantity }, (_, index) =>
        (state.attendeeNames[type.id]?.[index] ?? '').trim()
      )
      return { ticket_type_id: type.id, quantity, attendee_names: names }
    })
    .filter((line): line is TicketSelectionLine => line !== null)
}

/** True when every selected seat across all types has a non-empty name. */
export function areSelectionNamesComplete(
  types: EventTicketType[],
  state: TicketSelectionState
): boolean {
  return buildTicketSelections(types, state).every((line) =>
    line.attendee_names.length === line.quantity &&
    line.attendee_names.every((name) => name.length > 0)
  )
}
