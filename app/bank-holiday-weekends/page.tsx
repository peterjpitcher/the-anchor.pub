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

const BANK_HOLIDAYS_2026 = [
  { name: 'Good Friday', date: '3 April', note: 'Kitchen open (Friday hours: 6pm\u20139pm)' },
  { name: 'Easter Monday', date: '6 April', note: 'Kitchen closed (Monday)' },
  { name: 'Early May Bank Holiday', date: '4 May', note: 'Kitchen closed (Monday)' },
  { name: 'Spring Bank Holiday', date: '25 May', note: 'Kitchen closed (Monday)' },
  { name: 'Summer Bank Holiday', date: '31 August', note: 'Kitchen closed (Monday)' },
  { name: 'Christmas Day', date: '25 December', note: 'Pub closed \u2014 check nearer the time' },
  { name: 'Boxing Day', date: '26 December', note: 'Check website for special hours' },
] as const

const SUNDAY_ROAST_PRICE = '\u00a319'
const SUNDAY_ROAST_PREORDER_DEADLINE = 'Saturday 1pm'

export const metadata: Metadata = {
  title: 'Bank Holiday Weekends | Pub Near Heathrow',
  description:
    'Make the most of every bank holiday weekend at The Anchor near Heathrow. Extended hours, beer garden, Sunday roasts, and free parking. Check our opening times.',
  alternates: { canonical: '/bank-holiday-weekends' },
}

export default function BankHolidayWeekendsPage() {
  const addressLine = `${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.county}, ${CONTACT.address.postcode}`
  const mapQuery = `The Anchor, ${CONTACT.address.street}, ${CONTACT.address.postcode}`

  const faqs = [
    {
      question: 'Are you open on bank holidays?',
      answer:
        'Yes \u2014 we\u2019re open on all bank holidays except Christmas Day. Opening hours may vary on some bank holidays, so check the website or give us a call to confirm.',
    },
    {
      question: 'Is the kitchen open on bank holiday Mondays?',
      answer:
        'No \u2014 the kitchen is closed every Monday, including bank holiday Mondays. The pub is open for drinks, and you\u2019re welcome to use the beer garden, pool table, and dartboard.',
    },
    {
      question: 'Do you do Sunday roast on bank holiday weekends?',
      answer:
        `Yes \u2014 we serve Sunday roast every Sunday, including bank holiday weekends. Roasts start from ${SUNDAY_ROAST_PRICE} and pre-ordering by ${SUNDAY_ROAST_PREORDER_DEADLINE} is required. The day before a bank holiday Monday is the perfect time for a roast \u2014 no work tomorrow.`,
    },
    {
      question: 'Is there free parking?',
      answer:
        'Yes \u2014 we have free on-site parking for pub guests. We\u2019re also easy to reach from Staines-upon-Thames and just 7 minutes from Heathrow Terminal 5.',
    },
    {
      question: 'Do you have events on bank holidays?',
      answer:
        'We often have entertainment on bank holiday weekends \u2014 check our What\u2019s On page for the latest listings, or follow us on social media for updates.',
    },
  ]

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Bank Holiday Weekends', url: '/bank-holiday-weekends' },
        ]}
      />

            <HeroWrapper
        route="/bank-holiday-weekends"
        title="Bank Holiday Weekends at The Anchor"
        description="Make the most of every bank holiday at your local. Beer garden, pub grub, Sunday roasts, and no rush to get home."
        eyebrow="Every bank holiday weekend"
        lead={
          <p className="text-white/90 text-base sm:text-lg">
            Free parking &middot; Dog-friendly &middot; {HEATHROW_TIMES.terminal5} mins from Heathrow T5
          </p>
        }
        image={{
          src: DEFAULT_PAGE_HEADER_IMAGE,
          alt: 'Bank holiday weekends at The Anchor near Heathrow',
        }}
        enableSmartCtas={true}
        showContextStrip={true}
      />

      <Section background="white" spacing="md">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-10">
            {/* Every Bank Holiday */}
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
                Every bank holiday weekend
              </h2>
              <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
                Bank holiday weekends are made for the pub. Whether it&apos;s the May bank holiday,
                August bank holiday, or anything in between, The Anchor is open and ready. A long
                weekend means no rush \u2014 so settle in, enjoy the beer garden if the sun&apos;s
                out, and make the most of the extra day off.
              </p>
            </div>

            {/* 2026 Bank Holiday Calendar */}
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
                2026 bank holiday dates
              </h2>
              <p className="text-anchor-cream-text/70 leading-relaxed">
                Here are the remaining UK bank holidays for 2026. We&apos;re open on all of them
                (except Christmas Day). Opening hours may vary \u2014 check the website or call
                ahead to confirm.
              </p>
              <div className="rounded-2xl border border-anchor-gold/15 bg-anchor-bg-raised overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-anchor-gold/15">
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-anchor-gold-vivid">
                        Bank Holiday
                      </th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-anchor-gold-vivid">
                        Date
                      </th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-anchor-gold-vivid hidden sm:table-cell">
                        Kitchen
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {BANK_HOLIDAYS_2026.map((holiday) => (
                      <tr key={holiday.name} className="border-b border-anchor-gold/10 last:border-b-0">
                        <td className="px-4 py-3 font-medium text-anchor-cream-text">
                          {holiday.name}
                        </td>
                        <td className="px-4 py-3 text-anchor-cream-text/70">
                          {holiday.date}
                        </td>
                        <td className="px-4 py-3 text-anchor-cream-text/70 hidden sm:table-cell">
                          {holiday.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-anchor-cream-text/70">
                Note: the kitchen is always closed on Mondays, including bank holiday Mondays.
                The pub remains open for drinks.
              </p>
            </div>

            {/* Bank Holiday Sundays */}
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
                Bank holiday Sundays
              </h2>
              <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
                The day before a bank holiday Monday is the sweet spot. A proper Sunday roast from{' '}
                <span className="font-semibold">{SUNDAY_ROAST_PRICE}</span>, no work tomorrow, and
                the beer garden if the weather&apos;s playing ball. It doesn&apos;t get much better
                than that.
              </p>
              <p className="text-anchor-cream-text/70 leading-relaxed">
                Sunday lunch bookings require pre-ordering by{' '}
                <span className="font-semibold">{SUNDAY_ROAST_PREORDER_DEADLINE}</span> and a
                deposit. Book online or give us a call.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="primary" size="lg" fullWidth className="w-full sm:w-auto">
                  <a href="/book-table?purpose=sunday_lunch">
                    Book Sunday Lunch
                  </a>
                </Button>
                <Link href="/sunday-lunch" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" fullWidth className="w-full sm:w-auto">
                    View Sunday lunch menu
                  </Button>
                </Link>
              </div>
            </div>

            {/* Beer Garden Season */}
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
                Beer garden season
              </h2>
              <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
                The May and August bank holidays are peak beer garden weather. Our garden seats 64,
                with planes from Heathrow passing overhead and dogs welcome throughout. Grab a table,
                order a round, and soak it in.
              </p>
              <p className="text-anchor-cream-text/70 leading-relaxed">
                The garden is a proper suntrap when the weather&apos;s good \u2014 and on a bank
                holiday weekend, there&apos;s no reason to rush home.
              </p>
              <Link
                href="/beer-garden"
                className="inline-flex items-center text-sm font-semibold text-anchor-gold hover:text-anchor-gold-light underline decoration-dotted"
              >
                More about the beer garden
                <span className="ml-1">&rarr;</span>
              </Link>
            </div>

            {/* Bank Holiday Monday */}
            <div className="rounded-2xl border border-anchor-gold/15 bg-anchor-bg-raised p-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="default" size="sm">
                  Monday kitchen closed
                </Badge>
                <Badge variant="success" size="sm">
                  Pub open for drinks
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-anchor-cream-text">
                Bank holiday Mondays
              </h2>
              <p className="mt-3 text-anchor-cream-text/70 leading-relaxed">
                We&apos;re open on bank holiday Mondays \u2014 but the kitchen is{' '}
                <span className="font-semibold">closed every Monday</span>, including bank holidays.
                That&apos;s just how we run things, and we&apos;d rather be upfront about it.
              </p>
              <p className="mt-3 text-anchor-cream-text/70 leading-relaxed">
                What you can do on a bank holiday Monday: enjoy a pint in the beer garden, play pool
                or darts, catch up with mates, and take it easy. No food, but plenty of drinks and
                a relaxed atmosphere.
              </p>
            </div>

            {/* Practical Info */}
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
                Practical info
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card variant="default">
                  <CardBody className="space-y-2 p-6">
                    <h3 className="text-lg font-semibold text-anchor-gold-vivid">Free parking</h3>
                    <p className="text-sm text-anchor-cream-text/70">
                      20 free spaces on site for pub guests. We&apos;re also just{' '}
                      {HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5.
                    </p>
                  </CardBody>
                </Card>

                <Card variant="default">
                  <CardBody className="space-y-2 p-6">
                    <h3 className="text-lg font-semibold text-anchor-gold-vivid">Dog-friendly</h3>
                    <p className="text-sm text-anchor-cream-text/70">
                      Dogs are welcome in the pub and beer garden. Bring them along for a bank
                      holiday stroll and a pint.
                    </p>
                  </CardBody>
                </Card>

                <Card variant="default">
                  <CardBody className="space-y-2 p-6">
                    <h3 className="text-lg font-semibold text-anchor-gold-vivid">Getting here</h3>
                    <p className="text-sm text-anchor-cream-text/70">
                      {addressLine}. Easy to reach from Staines-upon-Thames, Ashford, and Windsor.
                    </p>
                    <Link
                      href="/find-us"
                      className="inline-flex items-center text-sm font-semibold text-anchor-gold hover:text-anchor-gold-light"
                    >
                      Get directions
                      <span className="ml-1">&rarr;</span>
                    </Link>
                  </CardBody>
                </Card>

                <Card variant="default">
                  <CardBody className="space-y-2 p-6">
                    <h3 className="text-lg font-semibold text-anchor-gold-vivid">Opening hours</h3>
                    <p className="text-sm text-anchor-cream-text/70">
                      Opening hours may vary on bank holidays. Check the website or call us to
                      confirm before you visit.
                    </p>
                    <PhoneButton
                      phone={CONTACT.phone}
                      source="bank_holiday_body"
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
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section background="gray" spacing="lg">
        <Container size="lg">
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
              Plan your bank holiday weekend
            </h2>
            <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
              Whether it&apos;s a Sunday roast, a few pints in the garden, or a catch-up with
              friends, The Anchor is the place to be on a bank holiday weekend. Book ahead to
              make sure you&apos;ve got a table.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="primary" size="lg" fullWidth className="w-full sm:w-auto">
                <a href="/book-table">
                  Book a Table
                </a>
              </Button>
              <PhoneButton
                phone={CONTACT.phone}
                source="bank_holiday_cta"
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

      {/* Map Section */}
      <Section background="white" spacing="lg">
        <Container size="lg">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:items-start">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">Where we are</h2>
              <p className="text-anchor-cream-text/70 leading-relaxed">
                The Anchor is in Stanwell Moor, Surrey (TW19 6AQ) \u2014 close to Heathrow and
                easy to reach from Staines-upon-Thames, Ashford, and Windsor. Free parking on site.
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
                  source="bank_holiday_location"
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
        </Container>
      </Section>

      <FAQAccordionWithSchema title="Bank Holiday Weekend FAQs" faqs={faqs} className="bg-anchor-bg" />

      <InternalLinkingSection
        title="More to explore at The Anchor"
        links={[
          { href: '/book-table', title: 'Book a Table', description: 'Reserve online in minutes' },
          { href: '/sunday-lunch', title: 'Sunday Lunch', description: 'Traditional roast dinners' },
          { href: '/whats-on', title: "What's On", description: 'Events and entertainment' },
          ...commonLinkGroups.location,
        ]}
      />
    </>
  )
}
