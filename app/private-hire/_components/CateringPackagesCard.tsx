import { Card, CardBody } from '@/components/ui'
import { formatPackagePrice, getCateringData } from '@/lib/api/catering-packages'

/**
 * Light "Catering packages" card for the Private Hire why-us split (spec §7.4).
 * Ink package names, gold (accent-text) prices, hairline separators between rows.
 */
export async function CateringPackagesCard() {
  const { foodPackages } = await getCateringData()
  const packages = [...foodPackages].sort((a, b) => {
    const priceOrder = (a.costPerHead || 0) - (b.costPerHead || 0)
    return priceOrder !== 0 ? priceOrder : a.name.localeCompare(b.name)
  })

  return (
    <Card accent>
      <CardBody>
        <h3 className="font-display text-h4 text-ink-strong">Catering packages</h3>
        {packages.length > 0 ? (
          <ul className="mt-6 divide-y divide-line">
            {packages.map(pkg => (
              <li key={pkg.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                <span className="text-base text-ink">
                  {pkg.name}
                  {pkg.minimumGuests > 0 ? (
                    <span className="mt-0.5 block text-sm text-ink-muted">Minimum {pkg.minimumGuests} guests</span>
                  ) : null}
                </span>
                <span className="font-display text-lg text-accent-text">{formatPackagePrice(pkg)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-sm text-ink-muted">
            Current catering packages are available by enquiry.
          </p>
        )}
        <p className="mt-6 text-sm text-ink-muted">
          Minimum 30 guests on buffet packages unless stated. Groups of 10 or more: a £10 per person deposit, fully deducted from your bill.
        </p>
      </CardBody>
    </Card>
  )
}
