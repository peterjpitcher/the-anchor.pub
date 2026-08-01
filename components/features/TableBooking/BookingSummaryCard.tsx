'use client'

import { formatDateForDisplay, formatGbpCurrency, formatTimeForDisplay } from '@/lib/table-booking/formatting'
import { highChairFlagLabel } from '@/lib/table-booking/slot-groups'

/**
 * What the guest is about to book, restated on screen 2 (spec D8). The separate
 * review screen is gone, so this card carries its job: nothing may be confirmed
 * that has not been shown here first.
 *
 * It states, never asks. Every control that changes which tables qualify lives
 * on screen 1, so there is nothing here to change.
 */
export function BookingSummaryCard({
  partySize,
  date,
  time,
  bookingPurpose,
  isOutsideSeating,
  requiresAccessibleTable,
  highChairCount,
  highChairsFreeAtSlot,
  depositAmount,
  depositNote
}: {
  partySize: number
  date: string
  time: string
  /** null means the slot context was lost, which Confirm blocks on anyway. */
  bookingPurpose: 'food' | 'drinks' | null
  isOutsideSeating: boolean
  requiresAccessibleTable: boolean
  highChairCount: number
  /** Advisory count for the chosen time, when it is short of the request. */
  highChairsFreeAtSlot?: number
  depositAmount: number
  depositNote?: string
}) {
  const tableNotes: string[] = []
  if (isOutsideSeating) tableNotes.push('Outside table, weather permitting')
  if (requiresAccessibleTable) tableNotes.push('Step-free, standard-height table')
  if (highChairCount > 0) {
    tableNotes.push(
      highChairsFreeAtSlot === undefined
        ? `${highChairCount} high chair${highChairCount === 1 ? '' : 's'}`
        : `${highChairCount} high chair${highChairCount === 1 ? '' : 's'} requested, ${highChairFlagLabel(highChairsFreeAtSlot)} at this time`
    )
  }

  return (
    <div className="rounded-md border border-line bg-surface-sunk p-4 text-sm">
      <p className="font-semibold text-ink-strong">Your table</p>
      <dl className="mt-2 space-y-2 text-ink">
        <div className="flex justify-between gap-3">
          <dt className="font-medium text-ink-muted">When</dt>
          <dd className="text-right text-ink-strong">
            {formatDateForDisplay(date)} at {formatTimeForDisplay(time)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="font-medium text-ink-muted">Party</dt>
          <dd className="text-ink-strong">
            {partySize} {partySize === 1 ? 'guest' : 'guests'}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="font-medium text-ink-muted">Booking</dt>
          <dd className="text-right text-ink-strong">
            {bookingPurpose === 'food'
              ? 'Table for food'
              : bookingPurpose === 'drinks'
              ? 'Drinks only'
              : 'Please choose your time again'}
          </dd>
        </div>
        {tableNotes.length > 0 ? (
          <div className="flex justify-between gap-3">
            <dt className="font-medium text-ink-muted">Table</dt>
            <dd className="text-right text-ink-strong">{tableNotes.join(' · ')}</dd>
          </div>
        ) : null}
        {depositAmount > 0 ? (
          <div className="flex justify-between gap-3">
            <dt className="font-medium text-ink-muted">Deposit due now</dt>
            <dd className="text-ink-strong">{formatGbpCurrency(depositAmount)}</dd>
          </div>
        ) : null}
      </dl>
      {depositAmount > 0 && depositNote ? (
        <p className="mt-3 text-xs text-ink-muted">{depositNote}</p>
      ) : null}
    </div>
  )
}
