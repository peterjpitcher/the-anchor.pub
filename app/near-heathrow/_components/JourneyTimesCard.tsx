import { Card, CardBody } from '@/components/ui'

// Page-local light "Journey times by car" card for /near-heathrow (spec §7.6).
// Rows: ink terminal names + gold (accent-text) DM Serif times. Footnote (muted):
// route + bus note. All values are taken directly from docs/SSOT.md §2.

interface JourneyRow {
  label: string
  time: string
}

// SSOT §2 Heathrow proximity table (times by car).
const ROWS: JourneyRow[] = [
  { label: 'Terminal 5', time: '7 minutes' },
  { label: 'Terminals 2 and 3', time: '11 minutes' },
  { label: 'Terminal 4', time: '12 minutes' }
]

export function JourneyTimesCard() {
  return (
    <Card accent className="h-full">
      <CardBody className="p-8">
        <h3 className="font-display text-h3 text-ink-strong">Journey times by car</h3>
        <ul className="mt-6 flex flex-col">
          {ROWS.map(row => (
            <li
              key={row.label}
              className="flex items-baseline justify-between gap-4 border-b border-line py-3 last:border-b-0"
            >
              <span className="text-base text-ink">{row.label}</span>
              <span className="font-display text-xl text-accent-text">{row.time}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-ink-muted">
          A straight run down the A3044 from Terminal 5, or 2 minutes from M25 Junction 14. Buses
          441, 442 and 555 run from Heathrow Central Bus Station to Stanwell Moor.
        </p>
      </CardBody>
    </Card>
  )
}
