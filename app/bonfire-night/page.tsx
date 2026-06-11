import type { Metadata } from 'next'
import Link from 'next/link'
import { CtaBand } from '@/components/CtaBand'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { InteriorHero } from '@/components/hero'
import { PhoneButton } from '@/components/PhoneButton'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { Badge, Button, Card, CardBody, Container } from '@/components/ui'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { CONTACT, HEATHROW_TIMES } from '@/lib/constants'
import {
  DEFAULT_PAGE_HEADER_IMAGE,
  DEFAULT_FOOD_IMAGE,
  DEFAULT_DRINKS_IMAGE,
} from '@/lib/image-fallbacks'

const BONFIRE_NIGHT_DATE = '5th November 2026'
const BONFIRE_NIGHT_DAY = 'Thursday'
const KITCHEN_HOURS = '6pm\u20139pm'

export const metadata: Metadata = {
  title: 'Bonfire Night | 5th November Near Heathrow',
  description:
    'Bonfire Night 2026 at The Anchor near Heathrow. Warm up with pub food and drinks on 5th November. Beer garden views, free parking, dog-friendly.',
  alternates: { canonical: '/bonfire-night' },
}

export default function BonfireNightPage() {
  const addressLine = `${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.county}, ${CONTACT.address.postcode}`
  const mapQuery = `The Anchor, ${CONTACT.address.street}, ${CONTACT.address.postcode}`

  const faqs = [
    {
      question: 'Do you have your own fireworks display?',
      answer:
        'We don\u2019t host our own fireworks display, but The Anchor is a great base for Bonfire Night. Enjoy a meal before heading to a local display, or warm up with a pint afterwards. On a clear night, you can often catch nearby fireworks from the beer garden.',
    },
    {
      question: 'What time are you open on Bonfire Night?',
      answer:
        'We\u2019re open our usual hours on 5th November. The kitchen is open 6pm\u20139pm (it\u2019s a Thursday), so there\u2019s plenty of time for a proper meal before or after local fireworks.',
    },
    {
      question: 'Is the beer garden open on Bonfire Night?',
      answer:
        'Yes, the beer garden is open as usual. Wrap up warm and you might catch fireworks in the distance with planes overhead. It\u2019s quite the view on a crisp November evening.',
    },
    {
      question: 'Is the pub dog-friendly on Bonfire Night?',
      answer:
        'We\u2019re always dog-friendly, but please consider whether fireworks noise will upset your dog. If they\u2019re nervous around bangs and flashes, indoor seating is available away from the garden where it\u2019s quieter.',
    },
  ]

  return (
    <>

            <InteriorHero
        image={DEFAULT_PAGE_HEADER_IMAGE}
        crumb="Bonfire Night"
        kicker={`${BONFIRE_NIGHT_DAY} ${BONFIRE_NIGHT_DATE}`}
        title="Bonfire Night at The Anchor"
        lead={`Warm up on Guy Fawkes Night at The Anchor in Stanwell Moor. Hot food, cold pints, and a beer garden with a view, ${BONFIRE_NIGHT_DATE}. Kitchen open ${KITCHEN_HOURS} \u00b7 Free parking \u00b7 ${HEATHROW_TIMES.terminal5} mins from Heathrow T5`}
      />

      <section className="bg-surface py-section-y">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-10">
            {/* Guy Fawkes Night */}
            <div className="space-y-4">
              <h2 className="text-h3 text-ink-strong">
                Guy Fawkes Night, {BONFIRE_NIGHT_DATE}
              </h2>
              <p className="text-ink-muted text-lg leading-relaxed">
                The 5th of November falls on a {BONFIRE_NIGHT_DAY} this year, and The Anchor is the
                perfect base for Bonfire Night. Whether you&apos;re heading to a local fireworks display
                or just want a proper meal and a pint on a cold November evening, we&apos;ve got you covered.
              </p>
              <p className="text-ink-muted leading-relaxed">
                There&apos;s something special about the beer garden on a crisp autumn night,
                wrap up warm, grab a drink, and enjoy the view. With planes coming in overhead and
                fireworks lighting up the sky in the distance, it&apos;s a Bonfire Night experience
                you won&apos;t forget in a hurry.
              </p>
            </div>

            {/* Nearby Fireworks */}
            <div className="space-y-4">
              <h2 className="text-h3 text-ink-strong">
                Nearby fireworks displays
              </h2>
              <p className="text-ink-muted text-lg leading-relaxed">
                The Anchor is perfectly placed for Bonfire Night. Enjoy a meal before heading to
                one of the local fireworks displays around Staines, Ashford, or Windsor, or
                warm up afterwards with a pint by the bar.
              </p>
              <p className="text-ink-muted leading-relaxed">
                On a clear night, nearby displays can often be spotted from the beer garden. Grab a
                table outside, wrap up, and let the fireworks come to you.
              </p>
            </div>

            {/* Food & Drink */}
            <div className="space-y-4">
              <h2 className="text-h3 text-ink-strong">
                Food &amp; drink on Bonfire Night
              </h2>
              <p className="text-ink-muted text-lg leading-relaxed">
                The 5th of November 2026 is a {BONFIRE_NIGHT_DAY}, so the kitchen is open{' '}
                <span className="font-semibold text-ink">{KITCHEN_HOURS}</span>. That gives you plenty of
                time for a proper hot meal to warm up, think fish &amp; chips, hearty pies,
                loaded burgers, and all the pub classics done right.
              </p>
              <p className="text-ink-muted leading-relaxed">
                At the bar, we&apos;ve got a full range of draught beers, wines, spirits, and soft
                drinks. Nothing beats a proper pint after standing in the cold watching fireworks.
              </p>

              <Card accent className="mt-6">
                <CardBody>
                  <h3 className="text-lg font-semibold text-ink-strong">Browse our menus</h3>
                  <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                    Planning your visit? Take a look at our{' '}
                    <Link
                      href="/food-menu"
                      className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted"
                    >
                      food menu
                    </Link>
                    ,{' '}
                    <Link
                      href="/pizza-menu"
                      className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted"
                    >
                      pizza menu
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/drinks"
                      className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted"
                    >
                      drinks menu
                    </Link>
                    .
                  </p>
                </CardBody>
              </Card>
            </div>

            {/* Dog Warning */}
            <Card accent>
              <CardBody>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant="success">
                    Dog-friendly pub
                  </Badge>
                  <Badge variant="green">
                    Indoor seating available
                  </Badge>
                </div>
                <h2 className="text-xl text-ink-strong">
                  A note for dog owners
                </h2>
                <p className="mt-3 text-ink-muted leading-relaxed">
                  We&apos;re a dog-friendly pub and your four-legged friends are always welcome.
                  However, Bonfire Night can be stressful for dogs, the bangs, flashes, and
                  smell of fireworks can be genuinely upsetting for some pets.
                </p>
                <p className="mt-3 text-ink-muted leading-relaxed">
                  If your dog is nervous around fireworks, please think carefully about whether
                  bringing them along is the right call. If you do visit with your dog, indoor
                  seating is available away from the beer garden where it&apos;s quieter and more
                  sheltered from the noise.
                </p>
              </CardBody>
            </Card>

            {/* Practical Info Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardBody className="space-y-2">
                  <h3 className="text-lg font-semibold text-ink-strong">Getting here</h3>
                  <p className="text-sm text-ink-muted">
                    {addressLine}. Free parking available, around {HEATHROW_TIMES.terminal5} minutes
                    from Heathrow Terminal 5 by car.
                  </p>
                  <Link
                    href="/find-us"
                    className="inline-flex items-center text-sm font-semibold text-accent-text hover:text-anchor-gold"
                  >
                    Get directions
                    <span className="ml-1">&rarr;</span>
                  </Link>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="space-y-2">
                  <h3 className="text-lg font-semibold text-ink-strong">Prefer to talk?</h3>
                  <p className="text-sm text-ink-muted">
                    Questions about Bonfire Night or want to book a table? Give us a call.
                  </p>
                  <PhoneButton
                    phone={CONTACT.phone}
                    source="bonfire_night_body"
                    variant="outline"
                    size="md"
                    className="w-full"
                  >
                    Call {CONTACT.phone}
                  </PhoneButton>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <CtaBand
        title="Book your Bonfire Night table"
        copy={`Warm up with a proper meal on the 5th of November. The kitchen is open ${KITCHEN_HOURS} and tables go quickly on Bonfire Night, so booking ahead is a good idea.`}
        primary={
          <Button asChild variant="primary" size="lg">
            <a href="/book-table?purpose=food">Book a Table</a>
          </Button>
        }
        secondary={
          <PhoneButton
            phone={CONTACT.phone}
            source="bonfire_night_cta"
            variant="outline"
            size="lg"
          >
            Call {CONTACT.phone}
          </PhoneButton>
        }
      />

      {/* Map Section */}
      <section className="bg-surface-sunk py-section-y">
        <Container size="lg">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:items-start">
            <div className="space-y-4">
              <h2 className="text-h3 text-ink-strong">Where we are</h2>
              <p className="text-ink-muted leading-relaxed">
                The Anchor is in Stanwell Moor, Surrey (TW19 6AQ), close to Heathrow and easy
                to reach from Staines-upon-Thames, Ashford, and Windsor. Free parking on site.
              </p>
              <p className="text-ink-muted">
                Address: <span className="font-semibold text-ink-strong">{addressLine}</span>
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/find-us" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" fullWidth className="w-full sm:w-auto">
                    Directions &amp; parking
                  </Button>
                </Link>
                <PhoneButton
                  phone={CONTACT.phone}
                  source="bonfire_night_location"
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Call {CONTACT.phone}
                </PhoneButton>
              </div>
            </div>
            <GoogleMapEmbed query={mapQuery} height={360} />
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema title="Bonfire Night FAQs" faqs={faqs} className="bg-anchor-green-deep" />

      <InternalLinkingSection
        title="More to explore at The Anchor"
        links={[
          { href: '/book-table?purpose=food', title: 'Book a Table', description: 'Reserve online in minutes' },
          { href: '/beer-garden', title: 'Beer Garden', description: 'Our outdoor seating area' },
          ...commonLinkGroups.dining,
          ...commonLinkGroups.location,
        ]}
      />
    </>
  )
}
