import { SquareParking, Plane, Dog, Wifi, type LucideIcon } from 'lucide-react'

// AmenityStrip (spec §5.5): a dark green band sitting directly under the hero on
// most pages. Four amenity cells (4-up on lg, 2-up on sm, 1-up below). Each cell is
// a gold-tinted icon tile + bold cream title + sage subline. All default claims are
// confirmed in docs/SSOT.md.

export interface AmenityItem {
  /** Lucide icon component for the tile. */
  icon: LucideIcon
  /** Bold cream headline (text-base). */
  title: string
  /** Sage supporting line (text-sm). */
  subline: string
}

const DEFAULT_ITEMS: AmenityItem[] = [
  { icon: SquareParking, title: '20 free spaces', subline: 'No fees while you visit' },
  { icon: Plane, title: '7 mins from T5', subline: 'Outside the ULEZ zone' },
  { icon: Dog, title: 'Dog friendly', subline: 'Water bowls on us' },
  { icon: Wifi, title: 'Free WiFi', subline: 'Pub and beer garden' }
]

export interface AmenityStripProps {
  /** Override the default four amenities. Defaults are SSOT-confirmed. */
  items?: AmenityItem[]
  className?: string
}

export function AmenityStrip({ items = DEFAULT_ITEMS, className }: AmenityStripProps) {
  return (
    <section
      // Core green in normal months. In the dark season it drops to the raised
      // green so it sits under a dark hero instead of becoming the brightest
      // band on the page, which is also what lifts its sublines above 4.5:1.
      className={`theme-dark bg-anchor-green [.theme-dark_&]:bg-anchor-green-raised [.theme-dark_&]:border-t [.theme-dark_&]:border-line-gold${className ? ` ${className}` : ''}`}
      aria-label="Amenities"
    >
      <div className="container">
        <ul className="grid grid-cols-1 gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(item => {
            const Icon = item.icon
            return (
              <li key={item.title} className="flex items-center gap-4">
                <span
                  aria-hidden
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xs border border-line-gold bg-[rgba(201,160,32,0.14)] text-anchor-cream-text"
                >
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <span className="flex flex-col">
                  <span className="text-base font-bold text-anchor-cream-text">{item.title}</span>
                  <span className="text-sm text-ink-muted">{item.subline}</span>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
