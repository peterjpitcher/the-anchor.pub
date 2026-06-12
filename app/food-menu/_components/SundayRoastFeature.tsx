import Image from 'next/image'
import { Badge, Card, CardBody, SectionHeading } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import type { MenuPageItem } from '@/lib/menu-page-data'

interface SundayRoastFeatureProps {
  items?: MenuPageItem[]
}

function formatDisplayPrice(price: string | undefined): string {
  const trimmed = price?.trim()
  if (!trimmed) return ''
  return trimmed.startsWith('£') ? trimmed : `£${trimmed}`
}

function dietaryFlag(item: MenuPageItem): string | null {
  if (item.vegan) return 'Vegan'
  if (item.vegetarian) return 'Veg'
  if (item.glutenFree) return 'GF'
  return null
}

/**
 * Sunday roast feature split (redesign §7.2.4): roast image on the left, copy
 * and the live Sunday roast line-up on the right. Mobile stacks image above text.
 */
export function SundayRoastFeature({ items = [] }: SundayRoastFeatureProps) {
  const roasts = items.filter(item => item.price)

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      {/* Image first on mobile, left on desktop. */}
      <div className="overflow-hidden rounded-md shadow-sm">
        <Image
          src="/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg"
          alt="A carved Sunday roast served at The Anchor in Stanwell Moor"
          width={920}
          height={690}
          className="h-full w-full object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      <div>
        <SectionHeading
          align="left"
          kicker="Sundays · no pre-order"
          title="Proper Sunday roasts"
          lead="Walk in any time from 1pm to 6pm. No pre-order, no Saturday cut-off and no per-roast prepayment. Booking is recommended for groups and peak slots, but it is never required."
        />

        <Card accent>
          <CardBody className="py-2">
            {roasts.length > 0 ? (
              <ul className="divide-y divide-line">
                {roasts.map(roast => {
                  const flag = dietaryFlag(roast)
                  return (
                    <li key={roast.id || roast.name} className="py-3">
                      <p className="font-sans font-medium text-ink-strong">
                        {roast.name}
                        <span className="ml-2 whitespace-nowrap font-display text-xl text-accent-text">
                          {formatDisplayPrice(roast.price)}
                        </span>
                        {flag && (
                          <span className="font-sans text-sm font-semibold text-accent-text">
                            {' '}
                            &middot; {flag}
                          </span>
                        )}
                      </p>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="py-4 text-ink-muted">
                Current Sunday roast dishes and prices are temporarily unavailable. Please call 01753 682707 before travelling.
              </p>
            )}
          </CardBody>
        </Card>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <BookTableButton
            source="food_menu_sunday_roast"
            context="sunday_lunch"
            variant="primary"
            size="lg"
            trackingLabel="Book a Roast"
          >
            Book a roast
          </BookTableButton>
          <Badge variant="success" dot>
            Served 1pm &ndash; 6pm
          </Badge>
        </div>
      </div>
    </div>
  )
}
