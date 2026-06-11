import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { DirectionsLink } from '@/components/DirectionsButton'
import { PhoneLink } from '@/components/PhoneLink'
import { CONTACT, PARKING } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface FindUsSectionProps {
  variant?: 'full' | 'compact'
  showMap?: boolean
  mapHeight?: number | string
  className?: string
}

const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${CONTACT.coordinates.lat},${CONTACT.coordinates.lng}`

export function FindUsSection({
  variant = 'full',
  showMap,
  mapHeight = 300,
  className,
}: FindUsSectionProps): JSX.Element {
  const shouldShowMap = showMap ?? (variant === 'full')

  return (
    <section className={cn('py-8', className)}>
      <h2 className="text-2xl text-ink-strong mb-6">Find Us</h2>

      {shouldShowMap && (
        <GoogleMapEmbed
          query="The Anchor, Stanwell Moor"
          height={mapHeight}
          className="mb-6"
        />
      )}

      <address className="not-italic space-y-1 text-ink-muted mb-4">
        <p className="font-bold text-ink-strong">The Anchor</p>
        <p>Horton Road</p>
        <p>Stanwell Moor</p>
        <p className="font-bold text-ink-strong">TW19 6AQ</p>
      </address>

      <div className="mb-4">
        <PhoneLink
          phone={CONTACT.phone}
          source="find-us_section"
          className="text-accent-text hover:text-anchor-gold"
        />
      </div>

      <p className="text-ink-muted mb-4">
        {PARKING.description} — {PARKING.capacity} spaces
      </p>

      <DirectionsLink
        href={DIRECTIONS_URL}
        source="find-us_section"
      >
        Get Directions
      </DirectionsLink>
    </section>
  )
}
