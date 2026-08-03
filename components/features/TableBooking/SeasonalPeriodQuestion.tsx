'use client'

import { Alert } from '@/components/ui/feedback/Alert'
import type { BookingPeriod, BookingPeriodDeposit } from '@/lib/api/bookings'

/**
 * The seasonal question, put to the guest above the times they are choosing
 * from.
 *
 * Everything money-shaped here is PRINTED, never computed. The amount and the
 * refund wording both arrive from AMS already decided, and are shown exactly as
 * given. The one seasonal defect that reached production was a second
 * implementation disagreeing with the first, so this component deliberately has
 * no arithmetic in it at all: no rounding, no per-head multiplication, no
 * "from GBP X" restatement.
 */

function formatPounds(amount: number): string {
  return `£${amount.toFixed(2).replace(/\.00$/, '')}`
}

export function SeasonalPeriodQuestion({
  period,
  deposit,
  answer,
  onAnswer
}: {
  period: BookingPeriod
  deposit: BookingPeriodDeposit | null
  answer: boolean | null
  onAnswer(accepted: boolean): void
}) {
  // A live period that cannot be booked. The usual cause is a period that needs
  // a pre-order whose menu has not been published yet, which is exactly the
  // state Christmas sits in until the menu is added. Say so plainly and offer
  // nothing: an empty menu would read as "sold out".
  if (!period.bookable) {
    return (
      <Alert variant="info" title={period.name}>
        <p>{period.not_bookable_message || 'This is not available to book online just yet.'}</p>
      </Alert>
    )
  }

  const acceptedTerms = deposit?.if_accepted ?? null
  const rejection = deposit?.if_accepted_rejection ?? null
  // The kill switch. A deposit may still be OWED under the rules while AMS is
  // not taking money, and in that state the guest must not be quoted a figure or
  // shown a payment step.
  const showDeposit = Boolean(deposit?.collect && acceptedTerms?.required && acceptedTerms.amount > 0)

  return (
    <div className="space-y-3 rounded-md border border-anchor-gold bg-surface-raised p-4">
      <div>
        <h3 className="font-display text-h4 text-ink-strong">{period.name}</h3>
        <p className="mt-1 text-sm text-ink">{period.guest_question}</p>
        {period.guest_blurb ? (
          <p className="mt-2 text-sm text-ink-muted">{period.guest_blurb}</p>
        ) : null}
      </div>

      {/* "No" is always available and always books the normal menu at normal
          terms. It is a first-class answer, not a way out of the question. */}
      <div className="flex flex-wrap gap-2" role="group" aria-label={period.guest_question}>
        <button
          type="button"
          onClick={() => onAnswer(true)}
          aria-pressed={answer === true}
          disabled={Boolean(rejection)}
          className={`min-h-[44px] flex-1 rounded-md border px-4 py-2 text-sm font-semibold transition ${
            answer === true
              ? 'border-anchor-green bg-anchor-green text-white'
              : 'border-line bg-surface text-ink hover:border-anchor-green'
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          Yes please
        </button>
        <button
          type="button"
          onClick={() => onAnswer(false)}
          aria-pressed={answer === false}
          className={`min-h-[44px] flex-1 rounded-md border px-4 py-2 text-sm font-semibold transition ${
            answer === false
              ? 'border-anchor-green bg-anchor-green text-white'
              : 'border-line bg-surface text-ink hover:border-anchor-green'
          }`}
        >
          No thanks
        </button>
      </div>

      {rejection ? (
        <p className="text-sm text-ink-muted">{rejection.message}</p>
      ) : null}

      {answer === true && showDeposit && acceptedTerms ? (
        <div className="rounded-md border border-line bg-surface-sunk p-3 text-sm text-ink">
          <p className="font-semibold">
            A deposit of {formatPounds(acceptedTerms.amount)} is needed to hold this booking.
          </p>
          {/* Verbatim. Refund terms are the owner's words and a paraphrase here
              would be a different promise from the one AMS will honour. */}
          {acceptedTerms.refund_policy ? (
            <p className="mt-2">{acceptedTerms.refund_policy}</p>
          ) : null}
        </div>
      ) : null}

      {answer === true && !showDeposit ? (
        <p className="text-sm text-ink-muted">No deposit is needed for this booking.</p>
      ) : null}
    </div>
  )
}
