import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { InteriorHero } from '@/components/hero'
import { PhoneButton } from '@/components/PhoneButton'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { Badge, Button, Card, CardBody, Container } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { CONTACT, HEATHROW_TIMES } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE, DEFAULT_DRINKS_IMAGE, DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

const ST_PATRICKS_DAY_BOOKING_URL = '/book-table?purpose=food'

const PAGE_TITLE = "St Patrick's Day Pub Near Heathrow | Guinness & Live Music"
const PAGE_DESCRIPTION =
  "Celebrate St Patrick's Day 2027 at The Anchor near Heathrow. Guinness, Irish whiskey, live music, themed food. Free parking, dog-friendly. 17 March."

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/st-patricks-day' },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [DEFAULT_PAGE_HEADER_IMAGE],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [DEFAULT_PAGE_HEADER_IMAGE],
  }),
}

export default function StPatricksDayPage(): React.JSX.Element {
  const addressLine = `${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.county}, ${CONTACT.address.postcode}`
  const mapQuery = `The Anchor, ${CONTACT.address.street}, ${CONTACT.address.postcode}`

  const faqs = [
    {
      question: "What time does the St Patrick's Day celebration start?",
      answer:
        "We celebrate St Patrick's Day all day. Pop in for a pint of Guinness at lunchtime or join us for the evening session with live music and entertainment. Check our What's On page closer to the date for the full schedule.",
    },
    {
      question: 'Is there live music on St Patrick&apos;s Day?',
      answer:
        "We aim to have live music and entertainment every St Patrick's Day. Follow us on social media or check our What's On page for confirmed acts and timings.",
    },
    {
      question: 'Do you serve Guinness?',
      answer:
        'Absolutely. Guinness is on tap year-round, but St Patrick&apos;s Day is when we really go through it. We also stock a selection of Irish whiskeys and themed cocktails for the occasion.',
    },
    {
      question: 'Can I bring a group?',
      answer:
        "Groups are very welcome. If you're booking for eight or more, give us a call on 01753 682707 so we can make sure we have the right space for you. Smaller groups can book online.",
    },
    {
      question: 'Is there parking?',
      answer:
        'Yes. We have 20 free parking spaces on site. No meters, no charges, no stress, just turn up and park.',
    },
  ]

  return (
    <>

            <InteriorHero
        image="/images/page-headers/drinks/drinks-summery.png"
        crumb="St Patrick's Day"
        kicker="17 March"
        title="St Patrick's Day Pub at The Anchor"
        lead="Guinness on tap, Irish whiskey, live music and a proper St Patrick's Day atmosphere, without the city centre crowds. Join us every 17 March. Live music · Guinness · Irish whiskey · Themed food · Free parking"
      />

      {/* The Craic at The Anchor */}
      <section className="py-section-y bg-surface">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-h3 text-ink-strong">
              The craic at The Anchor
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              Every St Patrick&apos;s Day, The Anchor goes green. Guinness flowing, Irish whiskey on the shelf, themed
              cocktails at the bar, and live music and entertainment to set the mood. It&apos;s a proper celebration
              in a proper pub, none of the overpriced, overcrowded city centre nonsense.
            </p>
            <p className="text-ink-muted leading-relaxed">
              Whether you&apos;re Irish, half-Irish, or just fancy a pint of the black stuff with good company,
              you&apos;re welcome. We&apos;ve been doing this for years, and it always turns into a brilliant night.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success">Guinness on tap</Badge>
              <Badge variant="green">Irish whiskey selection</Badge>
              <Badge variant="green">Themed cocktails</Badge>
              <Badge variant="green">Live music & entertainment</Badge>
            </div>
          </div>
        </Container>
      </section>

      {/* Irish-Themed Menu */}
      <section className="py-section-y bg-surface-sunk">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-h3 text-ink-strong">
              Irish-themed menu
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              We put together a special Irish-themed menu for St Patrick&apos;s Day alongside our regular menu.
              Previous years have featured hearty Irish stew, colcannon, soda bread, and other comfort food
              done properly, the kind of dishes that go perfectly with a pint of Guinness.
            </p>
            <p className="text-ink-muted leading-relaxed">
              If you&apos;re planning to eat, we&apos;d recommend booking a table in advance. Walk-ins are
              always welcome for drinks, but the kitchen gets busy on St Patrick&apos;s Day.
            </p>
            <Card accent className="mt-6">
              <CardBody>
                <h3 className="text-lg font-semibold text-ink-strong">Browse our regular menus</h3>
                <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                  Take a look at our{' '}
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
                  . The St Patrick&apos;s Day specials will be available alongside these on the day.
                </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Atmosphere */}
      <section className="py-section-y bg-surface">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-h3 text-ink-strong">
              A proper celebration, minus the chaos
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              We deck the place out, put the Irish music on, and create a St Patrick&apos;s Day atmosphere
              that actually feels like a celebration, not a queue. No fighting for space at the bar,
              no surge pricing, and no scrambling for a taxi home.
            </p>
            <p className="text-ink-muted leading-relaxed">
              We&apos;re dog-friendly too, so the four-legged member of the family is welcome to join in.
              And with 20 free parking spaces on site, you can drive here without worrying about where
              to leave the car.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardBody className="space-y-2">
                  <h3 className="text-lg font-semibold text-ink-strong">Free parking</h3>
                  <p className="text-sm text-ink-muted">
                    20 free spaces on site. No meters, no charges. Designated drivers and taxi-home plans both welcome.
                  </p>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="space-y-2">
                  <h3 className="text-lg font-semibold text-ink-strong">Dog-friendly</h3>
                  <p className="text-sm text-ink-muted">
                    Well-behaved dogs are welcome inside the pub. Bring them along for the craic.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Heathrow Connection */}
      <section className="py-section-y bg-surface-sunk">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-h3 text-ink-strong">
              Just {HEATHROW_TIMES.terminal5} minutes from Heathrow T5
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              Staying near Heathrow? Passing through on business? Irish expat flying home and want a proper
              pint before your flight? We&apos;re just {HEATHROW_TIMES.terminal5} minutes from Terminal 5, far
              better than the hotel bar, and with a real St Patrick&apos;s Day atmosphere.
            </p>
            <p className="text-ink-muted leading-relaxed">
              Airport hotel guests regularly make the short trip over for the evening. It&apos;s an easy taxi
              ride back, or if you&apos;re driving, the free parking makes it simple.
            </p>
            <Link
              href="/near-heathrow/terminal-5"
              className="inline-flex items-center text-sm font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted"
            >
              More about The Anchor near Heathrow Terminal 5
              <span className="ml-1">&rarr;</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* Booking CTA */}
      <CtaBand
        title="Book your St Patrick's Day table"
        copy="If you're planning to eat, we'd recommend booking in advance, the kitchen gets busy. Walk-ins are always welcome for drinks. Large groups (8+), give us a call so we can sort the right space."
        primary={
          <Button asChild variant="primary" size="lg">
            <a href={ST_PATRICKS_DAY_BOOKING_URL}>Book a Table Online</a>
          </Button>
        }
        secondary={
          <PhoneButton
            phone={CONTACT.phone}
            source="st_patricks_cta"
            variant="outline"
            size="lg"
          >
            Call {CONTACT.phone}
          </PhoneButton>
        }
      />

      {/* Where we are */}
      <section className="py-section-y bg-surface">
        <Container size="lg">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
              <div className="space-y-4">
                <h2 className="text-h3 text-ink-strong">Where we are</h2>
                <p className="text-ink-muted leading-relaxed">
                  The Anchor is in Stanwell Moor, Surrey (TW19 6AQ), a quick drive from Heathrow and easy
                  to reach from Staines-upon-Thames, Ashford and Windsor. Free parking on site.
                </p>
                <p className="text-ink-muted">
                  Address: <span className="font-semibold text-ink-strong">{addressLine}</span>
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/find-us" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" fullWidth className="w-full sm:w-auto">
                      Directions & parking
                    </Button>
                  </Link>
                  <PhoneButton
                    phone={CONTACT.phone}
                    source="st_patricks_location"
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
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema title="St Patrick's Day FAQs" faqs={faqs} className="bg-anchor-green-deep" />

      <InternalLinkingSection
        title="More to explore at The Anchor"
        links={[
          { href: ST_PATRICKS_DAY_BOOKING_URL, title: 'Book a Table', description: 'Reserve online in minutes' },
          { href: '/whats-on', title: "What's On", description: 'Upcoming events and entertainment' },
          ...commonLinkGroups.dining,
          ...commonLinkGroups.location,
        ]}
      />
    </>
  )
}
