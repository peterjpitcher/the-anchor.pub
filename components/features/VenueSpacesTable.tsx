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
          <tr className="border-b border-line-strong">
            <th scope="col" className="py-3 pr-4 text-sm font-semibold text-accent-text">Space</th>
            <th scope="col" className="py-3 pr-4 text-sm font-semibold text-accent-text">Seated</th>
            <th scope="col" className="py-3 pr-4 text-sm font-semibold text-accent-text">Standing</th>
            <th scope="col" className="py-3 text-sm font-semibold text-accent-text">Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {spaces.map((space) => (
            <tr key={space.id}>
              <td className="py-3 pr-4 text-ink font-medium">{space.name}</td>
              <td className="py-3 pr-4 text-ink">
                {space.capacitySeated ? `Up to ${space.capacitySeated}` : ', '}
              </td>
              <td className="py-3 pr-4 text-ink">
                {space.capacityStanding ? `Up to ${space.capacityStanding}` : ', '}
              </td>
              <td className="py-3 text-ink whitespace-nowrap">
                £{space.ratePerHour}/hr
                {space.minimumHours > 1 && (
                  <span className="text-ink-muted text-sm ml-1">
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
