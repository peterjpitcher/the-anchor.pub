import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Badge, Button, Card, CardBody, SectionHeading } from '@/components/ui'
import { InteriorHero } from '@/components/hero'
import { AmenityStrip } from '@/components/AmenityStrip'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { CtaBand } from '@/components/CtaBand'
import { WeekHours } from '@/components/WeekHours'
import { CONTACT } from '@/lib/constants'
import { getBusinessHoursSnapshot } from '@/lib/api'
import { getFoodMenuPageData, getMenuUnavailableMessage } from '@/lib/menu-page-data'
import { LUNCH_DINNER_BOOKING_HREF, LUNCH_DINNER_BOOKING_SOURCE } from '@/lib/booking-cta'
import {
  buildWalkInLine,
  getWeekdayServiceTimes,
  getWeekdayServiceWindows,
  pickLunchAndDinnerDishes,
  resolveLunchDinnerVariant
} from '@/lib/lunch-and-dinner'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

// Landing page for the paid weekday lunch and dinner campaign. Kept out of
// search (noindex, and not in the sitemap) so it never competes with
// /food-menu. Every time, dish name and price on it is read live.
//
// Rendered on every request, because the hero and the order of the dishes
// follow the ad's `utm_campaign` on the address. Stated here rather than left
// to be inferred from the page reading `searchParams`. The page itself is not
// cached, but the data behind it still is: the menu for 5 minutes and the
// hours snapshot for an hour (the `next.revalidate` on each fetch in
// lib/api/client.ts). So the management API is asked once per window, not
// once per ad visit. Checked on the built server: eight page requests cost
// one menu call.
export const dynamic = 'force-dynamic'

type LunchAndDinnerPageProps = {
  searchParams?: Record<string, string | string[] | undefined>
}

// "Book a table" lands on the form itself (#booking-form), tagged as coming
// from this page. Both values live in lib/booking-cta.ts because the sticky
// bar uses the same link, so all three buttons count as one source.
const BOOKING_SOURCE = LUNCH_DINNER_BOOKING_SOURCE
const BOOKING_HREF = LUNCH_DINNER_BOOKING_HREF

const HERO_IMAGE = '/images/food/weekday-2026/beer-battered-cod-and-chips.jpg'
const SHARE_IMAGE_ALT = 'Beer battered cod and chips at The Anchor, Stanwell Moor'

const DESCRIPTION =
  'Lunch and dinner at The Anchor in Stanwell Moor: pies, fish and chips, burgers and stone-baked pizzas, with today’s prices and kitchen times. Free parking, dogs welcome.'

export const metadata: Metadata = {
  title: 'Weekday Lunch and Dinner Near Heathrow',
  description: DESCRIPTION,
  robots: { index: false, follow: true },
  alternates: { canonical: './' },
  openGraph: {
    title: 'Lunch and Dinner Near Heathrow | The Anchor',
    description: DESCRIPTION,
    images: [{ url: HERO_IMAGE, width: 1200, height: 1200, alt: SHARE_IMAGE_ALT }]
  },
  twitter: getTwitterMetadata({
    title: 'Lunch and Dinner Near Heathrow | The Anchor',
    description: DESCRIPTION,
    images: [HERO_IMAGE]
  })
}

export default async function LunchAndDinnerPage({ searchParams }: LunchAndDinnerPageProps) {
  // The ad's campaign tag picks the hero and which dishes come first. It is
  // matched against a fixed list and never printed, so the address cannot put
  // anything on the page.
  const variant = resolveLunchDinnerVariant(searchParams?.utm_campaign)

  const [menu, hours] = await Promise.all([
    getFoodMenuPageData(),
    // Snapshot, not the live fetch: it feeds the hero times and the seven-day
    // table's first paint, never an open-now claim, so it can stay cached.
    getBusinessHoursSnapshot().catch(() => null)
  ])

  const times = hours ? getWeekdayServiceTimes(hours) : null
  const dishes = menu ? pickLunchAndDinnerDishes(menu, variant.picks) : []

  // Regular Tuesday to Friday times only, never a claim about today: the line
  // reads the same on a Sunday, after service and on a day the kitchen is shut.
  // If the hours cannot be read it drops the times rather than guessing them.
  const walkInLine = buildWalkInLine(hours ? getWeekdayServiceWindows(hours) : [], variant.service)

  const lunchBadge = times ? <Badge variant="sand">Lunch {times.lunch}</Badge> : null
  const dinnerBadge = times ? <Badge variant="sand">Dinner {times.dinner}</Badge> : null

  return (
    <>
      <InteriorHero
        image={variant.heroImage}
        focal="50% 60%"
        crumb="Lunch and dinner"
        kicker="Eat, Drink, Enjoy"
        title={
          variant.heroTitle ??
          (times ? 'Lunch and dinner, Tuesday to Friday' : 'Lunch and dinner at The Anchor')
        }
        lead="Proper pub food in Stanwell Moor, from our pies and fish and chips to stone-baked pizzas. Come in for lunch or join us for dinner."
        badges={
          times ? (
            // Both times always show. A dinner ad puts dinner first.
            variant.service === 'dinner' ? (
              <>
                {dinnerBadge}
                {lunchBadge}
              </>
            ) : (
              <>
                {lunchBadge}
                {dinnerBadge}
              </>
            )
          ) : undefined
        }
        actions={
          <>
            <BookTableButton
              source={BOOKING_SOURCE}
              customHref={BOOKING_HREF}
              context="food"
              variant="primary"
              size="lg"
              fullWidth
              trackingLabel="Hero Book a table"
            >
              Book a table
            </BookTableButton>
            <Button asChild variant="outline" size="lg" fullWidth>
              <Link href="/food-menu" className="w-full sm:w-auto">
                See the full menu
              </Link>
            </Button>
            {/* Someone walking in needs the way here more than the form. */}
            <Button asChild variant="outline" size="lg" fullWidth>
              <Link href="/find-us" className="w-full sm:w-auto">
                Get directions
              </Link>
            </Button>
          </>
        }
        note={walkInLine}
      />

      <AmenityStrip />

      <section id="dishes" className="bg-canvas py-section-y">
        <div className="container">
          <SectionHeading
            kicker="From the menu"
            title="Some of our favourites"
            lead="Prices are today’s. There’s lots more on the full menu."
          />

          {!menu ? (
            <Card accent className="mx-auto">
              <CardBody className="flex flex-col items-center gap-4 text-center">
                <p className="text-ink-muted">{getMenuUnavailableMessage()}</p>
                <PhoneButton phone={CONTACT.phone} source="lunch_dinner_lp_menu_unavailable" size="md">
                  Call {CONTACT.phone}
                </PhoneButton>
              </CardBody>
            </Card>
          ) : dishes.length === 0 ? (
            <p className="text-center text-ink-muted">
              See everything we’re serving on our{' '}
              <Link href="/food-menu" className="font-semibold text-accent-text underline underline-offset-2">
                full menu
              </Link>
              .
            </p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {dishes.map(({ item, image }) => (
                <li key={item.id}>
                  <Card className="h-full overflow-hidden">
                    {image ? (
                      <div className="relative aspect-square w-full">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        aria-hidden
                        className="flex aspect-square w-full items-center justify-center bg-tile p-6 text-center"
                      >
                        <span className="font-display text-h3 text-tile-ink">{item.name}</span>
                      </div>
                    )}
                    <CardBody className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-text">
                          {item.sectionTitle}
                        </p>
                        <h3 className="font-display text-h4 text-ink-strong">{item.name}</h3>
                      </div>
                      {/* Single dish prices are bare, "from" prices keep the £ (SSOT). */}
                      <span className="shrink-0 font-display text-h4 text-ink-strong">{item.price}</span>
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-10 flex justify-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/food-menu">See the full menu</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="opening-hours" className="scroll-mt-24 bg-surface py-section-y">
        <div className="container">
          <SectionHeading
            kicker="Opening hours"
            title="When we’re serving"
            lead="The bar and the kitchen for the next seven days."
          />
          <WeekHours initialHours={hours} />
        </div>
      </section>

      <div data-sticky-cta-guard="true">
        <CtaBand
          title="Book your table"
          copy="Tell us when you’re coming and we’ll have your table ready."
          primary={
            <BookTableButton
              source={BOOKING_SOURCE}
              customHref={BOOKING_HREF}
              context="food"
              variant="primary"
              size="lg"
              trackingLabel="Footer Book a table"
            >
              Book a table
            </BookTableButton>
          }
          secondary={
            <PhoneButton phone={CONTACT.phone} source="lunch_dinner_lp_call" variant="outline" size="lg">
              Call {CONTACT.phone}
            </PhoneButton>
          }
        />
      </div>
    </>
  )
}
