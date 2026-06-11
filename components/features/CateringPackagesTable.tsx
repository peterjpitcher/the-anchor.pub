import { type CateringPackage, formatPackagePrice } from '@/lib/api/catering-packages'

interface CateringPackagesTableProps {
  packages: CateringPackage[]
  title?: string
  subtitle?: string
  /** Show the full guest_description instead of just includes */
  showDescription?: boolean
  /** Filter to only show specific package names */
  filterNames?: string[]
}

export function CateringPackagesTable({
  packages,
  title,
  subtitle,
  showDescription = false,
  filterNames,
}: CateringPackagesTableProps): JSX.Element | null {
  const filtered = filterNames
    ? packages.filter((p) => filterNames.includes(p.name))
    : packages

  if (filtered.length === 0) return null

  return (
    <div>
      {title && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-ink-strong">{title}</h3>
          {subtitle && <p className="text-sm text-ink-muted mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-line-strong">
              <th scope="col" className="py-3 pr-4 text-sm font-semibold text-accent-text">Package</th>
              <th scope="col" className="py-3 pr-4 text-sm font-semibold text-accent-text">Price</th>
              <th scope="col" className="py-3 text-sm font-semibold text-accent-text">
                {showDescription ? 'Description' : 'Includes'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((pkg) => (
              <tr key={pkg.id}>
                <td className="py-3 pr-4 text-ink font-medium">{pkg.name}</td>
                <td className="py-3 pr-4 text-ink whitespace-nowrap">
                  {formatPackagePrice(pkg)}
                </td>
                <td className="py-3 text-ink-muted">
                  {showDescription ? (pkg.guestDescription || pkg.summary || '') : (pkg.includes || pkg.summary || '')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
