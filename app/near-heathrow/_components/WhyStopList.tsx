import { Check } from 'lucide-react'

// Page-local check-marked reasons list for the /near-heathrow "Why stop" split
// (spec §7.6). Gold check icons, bold lead-ins. All claims are SSOT-confirmed
// (free parking 20 spaces §8, outside ULEZ §2, beer garden §9, freshly made food §5,
// closest proper pub to T5 §12).

interface WhyStopPoint {
  lead: string
  detail: string
}

const POINTS: WhyStopPoint[] = [
  {
    lead: 'Free parking for 20 cars',
    detail: 'No fees and no time limit while you eat or drink with us.'
  },
  {
    lead: 'Outside the ULEZ zone',
    detail: 'No daily charge to reach us, unlike venues inside London.'
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
    detail: 'Just 7 minutes by car, and a world away from the terminal.'
  }
]

export function WhyStopList() {
  return (
    <ul className="flex flex-col gap-4">
      {POINTS.map(point => (
        <li key={point.lead} className="flex items-start gap-3">
          <span
            aria-hidden
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-anchor-gold/15 text-accent-text"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="text-base text-ink">
            <strong className="font-semibold text-ink-strong">{point.lead}.</strong>{' '}
            {point.detail}
          </span>
        </li>
      ))}
    </ul>
  )
}
