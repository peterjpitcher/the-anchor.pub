import { Card, CardBody } from '@/components/ui'

interface CateringPackage {
  name: string
  price: string
  note?: string
}

/**
 * Verified catering packages, sourced directly from docs/SSOT.md §11.
 * Minimum 30 guests unless a per-row note states otherwise. Prices and
 * minimums must be re-confirmed against SSOT §11 if they ever change.
 */
const CATERING_PACKAGES: CateringPackage[] = [
  { name: 'Sandwich Buffet', price: '£9.95pp' },
  { name: 'Finger Buffet', price: '£10.50pp' },
  { name: 'Burger Buffet', price: '£10.95pp' },
  { name: 'Premium Buffet', price: '£13.95pp' },
  { name: 'Pizza Buffet', price: 'Menu priced' },
  { name: 'Indoor BBQ', price: '£17.99pp' },
  { name: 'Chicken Goujon Sharing Tray', price: '£35', note: 'Serves around 10, minimum 25 guests' },
]

/**
 * Light "Catering packages" card for the Private Hire why-us split (spec §7.4).
 * Ink package names, gold (accent-text) prices, hairline separators between rows.
 */
export function CateringPackagesCard() {
  return (
    <Card accent>
      <CardBody>
        <h3 className="font-display text-h4 text-ink-strong">Catering packages</h3>
        <ul className="mt-6 divide-y divide-line">
          {CATERING_PACKAGES.map(pkg => (
            <li key={pkg.name} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
              <span className="text-base text-ink">
                {pkg.name}
                {pkg.note ? (
                  <span className="mt-0.5 block text-sm text-ink-muted">{pkg.note}</span>
                ) : null}
              </span>
              <span className="font-display text-lg text-accent-text">{pkg.price}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-ink-muted">
          Minimum 30 guests on buffet packages unless stated. Groups of 10 or more: a £10 per person deposit, fully deducted from your bill.
        </p>
      </CardBody>
    </Card>
  )
}
