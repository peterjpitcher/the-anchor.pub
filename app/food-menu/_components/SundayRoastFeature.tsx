import Image from 'next/image'
import { Badge, Card, CardBody, SectionHeading } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'

// Sunday roast line-up: verbatim from docs/SSOT.md §4 (effective 17 May 2026).
// The wellington is fully VEGAN, never "vegetarian". Do not reorder or reprice
// without updating the SSOT first.
const ROASTS: Array<{ name: string; price: string; flag?: string }> = [
  { name: 'Roast Beef Topside', price: '£22' },
  { name: 'Roast Pork Leg', price: '£20' },
  { name: 'Roast Turkey with Stuffing Ball', price: '£19' },
  { name: 'Beef & Ale Pie', price: '£21' },
  { name: 'Chicken & Wild Mushroom Pie', price: '£21' },
  { name: 'Beetroot & Butternut Squash Wellington', price: '£20', flag: 'Vegan' },
  { name: 'Kids Roast', price: '£14' }
]

/**
 * Sunday roast feature split (redesign §7.2.4): roast image on the left, copy
 * and the SSOT §4 roast line-up on the right. Mobile stacks image above text.
 */
export function SundayRoastFeature() {
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
            <ul className="divide-y divide-line">
              {ROASTS.map(roast => (
                <li key={roast.name} className="flex items-baseline justify-between gap-4 py-3">
                  <p className="font-sans font-medium text-ink-strong">
                    {roast.name}
                    {roast.flag && (
                      <span className="font-sans text-sm font-semibold text-accent-text">
                        {' '}
                        &middot; {roast.flag}
                      </span>
                    )}
                  </p>
                  <span className="whitespace-nowrap font-display text-xl text-accent-text">
                    {roast.price}
                  </span>
                </li>
              ))}
            </ul>
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
