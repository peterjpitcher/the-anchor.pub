import { Check } from 'lucide-react'
import { HEATHROW_TIMES, PARKING } from '@/lib/constants'
import { ULEZ_WORDING } from '@/lib/approved-wording'

// Page-local check-marked reasons list for the /near-heathrow "Why stop" split
// (spec §7.6). Gold check icons, bold lead-ins. All claims are SSOT-confirmed
// (free parking 20 spaces §8, outside ULEZ §2, beer garden §9, freshly made food §5,
// closest proper pub to T5 §12).

interface WhyStopPoint {
  lead?: string
  detail: string
}

const POINTS: WhyStopPoint[] = [
  {
    lead: `Free parking for ${PARKING.capacity} cars`,
    detail: 'No fees and no time limit while you eat or drink with us.'
  },
  {
    // The approved sentence stands alone: a lead-in would only say it twice.
    detail: ULEZ_WORDING
  },
  {
    lead: 'Freshly made pub food',
    detail: 'Proper meals cooked to order, not reheated airport fare.'
  },
  {
    lead: 'A beer garden under the flight path',
    detail: 'Watch aircraft pass overhead while you eat or have a drink.'
  },
  {
    lead: 'The closest proper pub to Terminal 5',
    detail: `Just ${HEATHROW_TIMES.terminal5} minutes by car, and a world away from the terminal.`
  }
]

export function WhyStopList() {
  return (
    <ul className="flex flex-col gap-4">
      {POINTS.map(point => (
        <li key={point.detail} className="flex items-start gap-3">
          <span
            aria-hidden
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-anchor-gold/15 text-accent-text"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="text-base text-ink">
            {point.lead ? (
              <>
                <strong className="font-semibold text-ink-strong">{point.lead}.</strong>{' '}
              </>
            ) : null}
            {point.detail}
          </span>
        </li>
      ))}
    </ul>
  )
}
