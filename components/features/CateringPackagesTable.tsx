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
          <h3 className="text-xl font-bold text-anchor-gold-bright">{title}</h3>
          {subtitle && <p className="text-sm text-anchor-cream-text/60 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-anchor-gold-dark/30">
              <th scope="col" className="py-3 pr-4 text-sm font-semibold text-anchor-gold-bright">Package</th>
              <th scope="col" className="py-3 pr-4 text-sm font-semibold text-anchor-gold-bright">Price</th>
              <th scope="col" className="py-3 text-sm font-semibold text-anchor-gold-bright">
                {showDescription ? 'Description' : 'Includes'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-anchor-gold-dark/10">
            {filtered.map((pkg) => (
              <tr key={pkg.id}>
                <td className="py-3 pr-4 text-anchor-cream-text font-medium">{pkg.name}</td>
                <td className="py-3 pr-4 text-anchor-cream-text whitespace-nowrap">
                  {formatPackagePrice(pkg)}
                </td>
                <td className="py-3 text-anchor-cream-text/70">
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
