import { type VenueSpace } from '@/lib/api/catering-packages'

interface VenueSpacesTableProps {
  spaces: VenueSpace[]
}

export function VenueSpacesTable({ spaces }: VenueSpacesTableProps): JSX.Element | null {
  if (spaces.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-anchor-gold-dark/30">
            <th scope="col" className="py-3 pr-4 text-sm font-semibold text-anchor-gold-bright">Space</th>
            <th scope="col" className="py-3 pr-4 text-sm font-semibold text-anchor-gold-bright">Seated</th>
            <th scope="col" className="py-3 pr-4 text-sm font-semibold text-anchor-gold-bright">Standing</th>
            <th scope="col" className="py-3 text-sm font-semibold text-anchor-gold-bright">Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-anchor-gold-dark/10">
          {spaces.map((space) => (
            <tr key={space.id}>
              <td className="py-3 pr-4 text-anchor-cream-text font-medium">{space.name}</td>
              <td className="py-3 pr-4 text-anchor-cream-text">
                {space.capacitySeated ? `Up to ${space.capacitySeated}` : ', '}
              </td>
              <td className="py-3 pr-4 text-anchor-cream-text">
                {space.capacityStanding ? `Up to ${space.capacityStanding}` : ', '}
              </td>
              <td className="py-3 text-anchor-cream-text whitespace-nowrap">
                £{space.ratePerHour}/hr
                {space.minimumHours > 1 && (
                  <span className="text-anchor-cream-text/50 text-sm ml-1">
                    (min {space.minimumHours}hrs)
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
