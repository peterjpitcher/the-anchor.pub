import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { PhoneButton } from '@/components/PhoneButton'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { Badge, Button, Card, CardBody, Container, Section } from '@/components/ui'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { CONTACT, HEATHROW_TIMES } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

const BOXING_DAY_BOOKING_URL = '/book-table?purpose=food'

const addressLine = `${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.county}, ${CONTACT.address.postcode}`
const mapQuery = `The Anchor, ${CONTACT.address.street}, ${CONTACT.address.postcode}`

export const metadata: Metadata = {
  title: 'Boxing Day Pub Near Heathrow | Walk & Lunch at The Anchor',
  description:
    'Boxing Day 2026 at The Anchor near Heathrow. Escape the leftovers \u2014 proper pub food, craft beer, and a walk around Stanwell Moor. Free parking. Dog-friendly.',
  alternates: { canonical: '/boxing-day' },
  openGraph: {
    title: 'Boxing Day Pub Near Heathrow | Walk & Lunch at The Anchor',
    description:
      'Boxing Day 2026 at The Anchor near Heathrow. Escape the leftovers \u2014 proper pub food, craft beer, and a walk around Stanwell Moor. Free parking. Dog-friendly.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Boxing Day Pub Near Heathrow | Walk & Lunch at The Anchor',
    description:
      'Boxing Day 2026 at The Anchor near Heathrow. Escape the leftovers \u2014 proper pub food, craft beer, and a walk around Stanwell Moor. Free parking. Dog-friendly.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
  }),
}

const faqs = [
  {
    question: 'Are you open on Boxing Day?',
    answer:
      'Yes \u2014 we\u2019re open on Boxing Day. Boxing Day 2026 falls on a Saturday, so we\u2019ll be open our usual Saturday hours. The kitchen is open 1pm\u20137pm.',
  },
  {
    question: 'What\u2019s the menu on Boxing Day?',
    answer:
      'We serve our regular Saturday menu on Boxing Day \u2014 burgers, fish and chips, stone-baked pizza, and pub classics. It\u2019s not a set Christmas menu and it\u2019s not Sunday roast (that\u2019s Sunday). Just proper pub food, cooked fresh.',
  },
  {
    question: 'Is the beer garden open in December?',
    answer:
      'The beer garden is open year-round. On a crisp Boxing Day wrapped up warm, with a hot drink or a pint and planes coming in overhead, it\u2019s genuinely one of the best spots in the area.',
  },
  {
    question: 'Is there parking?',
    answer:
      `Free on-site parking is available for guests. We\u2019re about ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 by car. You\u2019ll find us at ${addressLine}.`,
  },
]

export default function BoxingDayPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Boxing Day', url: '/boxing-day' },
        ]}
      />

      <HeroWrapper
        route="/boxing-day"
        title="Boxing Day Pub at The Anchor"
        description="Escape the house, walk off the turkey, and end up at a proper pub. The Anchor is the perfect Boxing Day destination \u2014 close enough to not be a mission, far enough from the sofa to feel like an outing."
        eyebrow="Saturday 26 December 2026"
        lead={
          <p className="text-white/90 text-base sm:text-lg">
            Proper pub food &middot; Craft beer &middot; Dog-friendly walks &middot; Free parking
          </p>
        }
        tags={[
          { label: 'Kitchen 1pm\u20137pm', variant: 'warning' },
          { label: 'Dog-friendly', variant: 'success' },
          { label: 'Beer garden open', variant: 'default' },
          { label: 'Free parking', variant: 'default' },
        ]}
        primaryCta={
          <Button asChild variant="primary" size="lg" fullWidth className="w-full sm:w-auto">
            <a href={BOXING_DAY_BOOKING_URL}>Book a Table</a>
          </Button>
        }
        secondaryCta={
          <>
            <Link href="/find-us" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" fullWidth className="w-full sm:w-auto">
                Directions &amp; parking
              </Button>
            </Link>
            <PhoneButton
              phone={CONTACT.phone}
              source="boxing_day_hero"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Call {CONTACT.phone}
            </PhoneButton>
          </>
        }
        secondaryInfo={
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
              Free parking &middot; 20 spaces
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
              {HEATHROW_TIMES.terminal5} min from Heathrow T5
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
              Dog &amp; family friendly
            </span>
          </div>
        }
      />

      <Section spacing="md" background="white">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-12">
            {/* The Boxing Day Pub Tradition */}
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
                The Boxing Day Pub Tradition
              </h2>
              <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
                There&apos;s a great British tradition of escaping the house on Boxing Day. The leftover
                turkey can wait. What you need is fresh air, a proper pub meal, and a decent pint in a
                pub that isn&apos;t your living room.
              </p>
              <p className="text-anchor-cream-text/70 leading-relaxed">
                The Anchor is the perfect Boxing Day destination. We&apos;re close enough to not be a
                mission &mdash; about {HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 &mdash;
                but far enough from the sofa to feel like a proper outing. Free parking, a warm welcome,
                and food that isn&apos;t reheated Christmas dinner.
              </p>
            </div>

            {/* Boxing Day Walk */}
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
                Boxing Day Walk
              </h2>
              <p className="text-anchor-cream-text/70 leading-relaxed">
                Stanwell Moor and the King George VI Reservoir are right on the doorstep. It&apos;s a lovely
                2&ndash;3 mile walk &mdash; flat, easy-going, and dog-friendly. Start (or finish) at The
                Anchor for lunch, and you&apos;ve got yourself the perfect Boxing Day.
              </p>
              <p className="text-anchor-cream-text/70 leading-relaxed">
                The beer garden in December has a charm all of its own. Wrapped up warm with a hot drink
                or a pint, planes coming in overhead &mdash; it&apos;s one of those unexpectedly brilliant spots
                that you only really appreciate when you&apos;re there.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="default" size="sm">2&ndash;3 mile walk</Badge>
                <Badge variant="default" size="sm">Flat &amp; easy-going</Badge>
                <Badge variant="success" size="sm">Dog-friendly</Badge>
                <Badge variant="default" size="sm">Reservoir views</Badge>
              </div>
            </div>

            {/* Food & Drink */}
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
                Food &amp; Drink
              </h2>
              <p className="text-anchor-cream-text/70 leading-relaxed">
                Boxing Day falls on a Saturday in 2026, so the kitchen is open{' '}
                <span className="font-semibold">1pm&ndash;7pm</span>. We serve our regular Saturday
                menu &mdash; not a set Christmas menu, and not Sunday roast (that&apos;s Sunday).
              </p>
              <p className="text-anchor-cream-text/70 leading-relaxed">
                Think burgers, fish and chips, stone-baked pizza, and pub classics. Proper food, cooked
                fresh, and exactly what you want after a day of picking at cold turkey and leftover
                stuffing.
              </p>
              <div className="mt-4 rounded-2xl bg-anchor-bg-raised p-6 border border-anchor-gold/15">
                <h3 className="text-lg font-semibold text-anchor-gold-vivid">Browse our menus</h3>
                <p className="mt-3 text-sm text-anchor-cream-text/70 leading-relaxed">
                  Planning your visit? Take a look at our{' '}
                  <Link
                    href="/food-menu"
                    className="font-semibold text-anchor-gold hover:text-anchor-gold-light underline decoration-dotted"
                  >
                    food menu
                  </Link>
                  ,{' '}
                  <Link
                    href="/pizza-menu"
                    className="font-semibold text-anchor-gold hover:text-anchor-gold-light underline decoration-dotted"
                  >
                    pizza menu
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/drinks"
                    className="font-semibold text-anchor-gold hover:text-anchor-gold-light underline decoration-dotted"
                  >
                    drinks menu
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Why Not Stay Home? */}
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
                Why Not Stay Home?
              </h2>
              <p className="text-anchor-cream-text/70 leading-relaxed">
                You&apos;ve had enough turkey. The kids are climbing the walls. The dog needs a walk. The
                in-laws need a change of scenery (and so do you).
              </p>
              <p className="text-anchor-cream-text/70 leading-relaxed">
                The Anchor is {HEATHROW_TIMES.terminal5} minutes from Heathrow, has free parking, and
                serves food that isn&apos;t reheated Christmas dinner. You can stretch your legs around the
                reservoir, settle into the pub for lunch, and actually enjoy Boxing Day instead of just
                surviving it.
              </p>
            </div>

            {/* Booking */}
            <div className="rounded-2xl border border-anchor-gold/15 bg-anchor-bg-raised p-6 space-y-4">
              <h2 className="text-2xl font-bold text-anchor-cream-text">Book Your Table</h2>
              <p className="text-anchor-cream-text/70 leading-relaxed">
                Boxing Day is one of our busiest days of the year. Walk-ins are welcome, but if you want
                to be sure of a table for food, book ahead.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="primary" size="lg" fullWidth className="w-full sm:w-auto sm:min-w-[220px]">
                  <a href={BOXING_DAY_BOOKING_URL}>Book a Table</a>
                </Button>
                <PhoneButton
                  phone={CONTACT.phone}
                  source="boxing_day_booking"
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Call {CONTACT.phone}
                </PhoneButton>
              </div>
              <p className="text-sm text-anchor-cream-text/70">
                Tables for 8+ guests &mdash; please call.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="lg" background="gray">
        <Container size="lg">
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
              Escape the house this Boxing Day
            </h2>
            <p className="text-anchor-cream-text/70 text-lg">
              Saturday 26 December 2026. A walk, a pint, and proper pub food at The Anchor in Stanwell
              Moor. Kitchen open 1pm&ndash;7pm. Free parking. Dogs welcome.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="primary" size="lg" fullWidth className="w-full sm:w-auto">
                <a href={BOXING_DAY_BOOKING_URL}>Book a Table</a>
              </Button>
              <PhoneButton
                phone={CONTACT.phone}
                source="boxing_day_cta"
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Call {CONTACT.phone}
              </PhoneButton>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="lg" background="white">
        <Container size="lg">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
                  Where we are
                </h2>
                <p className="text-anchor-cream-text/70 leading-relaxed">
                  The Anchor is in Stanwell Moor, Surrey (TW19 6AQ) &mdash; about {HEATHROW_TIMES.terminal5} minutes
                  from Heathrow Terminal 5, with free on-site parking. Easy to reach from Staines-upon-Thames,
                  Ashford, and Windsor.
                </p>
                <p className="text-anchor-cream-text/70">
                  Address: <span className="font-semibold text-anchor-gold-vivid">{addressLine}</span>
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/find-us" className="w-full sm:w-auto">
                    <Button variant="secondary" size="lg" fullWidth className="w-full sm:w-auto">
                      Directions &amp; parking
                    </Button>
                  </Link>
                  <PhoneButton
                    phone={CONTACT.phone}
                    source="boxing_day_location"
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Call {CONTACT.phone}
                  </PhoneButton>
                </div>
              </div>
              <GoogleMapEmbed query={mapQuery} height={360} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card variant="default">
                <CardBody className="space-y-2 p-6">
                  <h3 className="text-lg font-semibold text-anchor-gold-vivid">The Boxing Day walk</h3>
                  <p className="text-sm text-anchor-cream-text/70">
                    Stanwell Moor and the King George VI Reservoir make for a cracking 2&ndash;3 mile walk.
                    Flat, dog-friendly, and right on our doorstep.
                  </p>
                  <Link
                    href="/dog-friendly-pub-heathrow"
                    className="inline-flex items-center text-sm font-semibold text-anchor-gold hover:text-anchor-gold-light"
                  >
                    Dog-friendly info
                    <span className="ml-1">&rarr;</span>
                  </Link>
                </CardBody>
              </Card>

              <Card variant="default">
                <CardBody className="space-y-2 p-6">
                  <h3 className="text-lg font-semibold text-anchor-gold-vivid">Prefer to talk?</h3>
                  <p className="text-sm text-anchor-cream-text/70">
                    Booking for a big group or have a question? Give us a call and we&apos;ll help.
                  </p>
                  <PhoneButton
                    phone={CONTACT.phone}
                    source="boxing_day_body"
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
      </Section>

      <FAQAccordionWithSchema title="Boxing Day FAQs" faqs={faqs} className="bg-anchor-bg" />

      <InternalLinkingSection
        title="More to explore at The Anchor"
        links={[
          { href: BOXING_DAY_BOOKING_URL, title: 'Book a Table', description: 'Reserve online in minutes' },
          { href: '/dog-friendly-pub-heathrow', title: 'Dog-Friendly Pub', description: 'Four-legged friends welcome' },
          ...commonLinkGroups.dining,
          ...commonLinkGroups.location,
        ]}
      />
    </>
  )
}
