'use client'

import { Check } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { Button } from '@/components/ui/primitives/Button'
import { formatDateForDisplay, formatTimeForDisplay } from '@/lib/table-booking/formatting'
import {
  confirmationDeliveryCopy,
  type ManagementTableBookingResult,
} from '@/lib/table-booking/submission'

/**
 * The terminal confirmed screen.
 *
 * It reports what the SERVER granted, not what was asked for. High chairs are
 * the case that matters: a request may be partly met, and the guest is told the
 * real number rather than a cheerful "reserved". An older API build that reports
 * no granted count at all is read as "reserved" rather than as a failure, since
 * a silent field is not evidence that nothing was held.
 */
export function BookingConfirmedCard({
  result,
  partySize,
  date,
  time,
  onBookAnother
}: {
  result: ManagementTableBookingResult
  partySize: number
  date: string
  time: string
  onBookAnother: () => void
}) {
  const requestedHighChairs = result.high_chair_count ?? 0
  const grantedHighChairs = result.high_chairs_granted

  return (
    <div className="mx-auto max-w-[640px]">
      <Card accent>
        <CardBody className="space-y-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <span
              aria-hidden="true"
              className="flex h-[72px] w-[72px] items-center justify-center rounded-pill bg-anchor-green text-white"
            >
              <Check className="h-9 w-9" />
            </span>
            <div>
              <h3 className="font-display text-h3 text-ink-strong">You&apos;re all booked in, see you soon!</h3>
              <p className="mt-2 text-sm text-ink-muted">
                Reference: <strong className="text-ink-strong">{result.booking_reference || 'Provided shortly'}</strong>. {confirmationDeliveryCopy(result.notification_channel)}
              </p>
            </div>
          </div>

          <div className="rounded-md border border-line bg-surface-sunk p-4 text-left text-sm">
            <dl className="space-y-2 text-ink">
              <div className="flex justify-between gap-3">
                <dt className="font-medium text-ink-muted">Party</dt>
                <dd className="text-ink-strong">{partySize} {partySize === 1 ? 'guest' : 'guests'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-medium text-ink-muted">When</dt>
                <dd className="text-ink-strong">{formatDateForDisplay(date)}, {formatTimeForDisplay(time)}</dd>
              </div>
              {result.is_outside_seating ? (
                <div className="flex justify-between gap-3">
                  <dt className="font-medium text-ink-muted">Seating</dt>
                  <dd className="text-ink-strong">Outside (weather permitting)</dd>
                </div>
              ) : result.table_name ? (
                <div className="flex justify-between gap-3">
                  <dt className="font-medium text-ink-muted">Table</dt>
                  <dd className="text-ink-strong">{result.table_name}</dd>
                </div>
              ) : null}
              {requestedHighChairs > 0 ? (
                <div className="flex justify-between gap-3">
                  <dt className="font-medium text-ink-muted">High chair</dt>
                  <dd className="text-ink-strong">
                    {/* Unknown granted count (older API build) → assume reserved
                        rather than falsely reporting a failure. */}
                    {grantedHighChairs === undefined || grantedHighChairs >= requestedHighChairs
                      ? 'Reserved'
                      : grantedHighChairs > 0
                      ? `${grantedHighChairs} of ${requestedHighChairs} reserved`
                      : 'Not available for this time'}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          {requestedHighChairs > 0 &&
          grantedHighChairs !== undefined &&
          grantedHighChairs < requestedHighChairs ? (
            <p className="text-left text-sm text-ink-muted">
              {grantedHighChairs > 0
                ? `We could only reserve ${grantedHighChairs} of the ${requestedHighChairs} high chairs you asked for. `
                : `We couldn't reserve a high chair for this time. `}
              Give us a ring on 01753 682707 and we&apos;ll do our best to help.
            </p>
          ) : null}

          <div className="rounded-md border border-line bg-surface-sunk p-4 text-left text-sm text-ink space-y-1">
            <p className="font-semibold text-ink-strong">When you arrive:</p>
            <p>&#x2022; Free parking right outside, no ticket needed</p>
            <p>&#x2022; No need to check in, just head to the bar and we&apos;ll find your table</p>
            <p>&#x2022; If anything changes, give us a ring on 01753 682707</p>
          </div>

          <Button type="button" variant="outline" size="lg" onClick={onBookAnother}>
            Book another table
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}
