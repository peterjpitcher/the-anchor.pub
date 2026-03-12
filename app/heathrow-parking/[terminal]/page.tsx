import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { HeroWrapper } from '@/components/hero'
import { Button, Container, Section, CTASection } from '@/components/ui'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DEFAULT_PARKING_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

const TERMINAL_PAGES = {
  'terminal-2': {
    number: '2',
    transferTime: '10-12 minutes',
    routeHint: 'via Stanwell Moor Road (A3044)',
    taxiRange: '£20-25',
    airportIntent: 'Terminal 2 long-stay and short-stay options'
  },
  'terminal-3': {
    number: '3',
    transferTime: '10-12 minutes',
    routeHint: 'via Stanwell Moor Road and Tunnel Road',
    taxiRange: '£20-25',
    airportIntent: 'Terminal 3 long-stay, short-stay and postcode lookups'
  },
  'terminal-4': {
    number: '4',
    transferTime: '10-12 minutes',
    routeHint: 'via Stanwell Moor Road (A3044)',
    taxiRange: '£22-27',
    airportIntent: 'Terminal 4 overnight and long-term parking'
  },
  'terminal-5': {
    number: '5',
    transferTime: '7 minutes',
    routeHint: 'via Stanwell Moor Road (A3044)',
    taxiRange: '£18-24',
    airportIntent: 'Terminal 5 cheap parking and short-stay alternatives'
  }
} as const

type TerminalSlug = keyof typeof TERMINAL_PAGES

function isTerminalSlug(value: string): value is TerminalSlug {
  return Object.prototype.hasOwnProperty.call(TERMINAL_PAGES, value)
}

export function generateStaticParams() {
  return Object.keys(TERMINAL_PAGES).map((terminal) => ({ terminal }))
}

export function generateMetadata({ params }: { params: { terminal: string } }): Metadata {
  if (!isTerminalSlug(params.terminal)) {
    return {
      title: 'Heathrow terminal parking guide not found',
      robots: {
        index: false,
        follow: false
      }
    }
  }

  const terminal = TERMINAL_PAGES[params.terminal]
  const canonical = `/heathrow-parking/${params.terminal}`
  const title = `Cheap Heathrow Terminal ${terminal.number} Parking from £15/day | The Anchor`
  const description = `Compare cheap Heathrow Terminal ${terminal.number} parking options. The Anchor in Stanwell Moor is ${terminal.transferTime} away with key-retention parking from £15 per day.`

  return {
    title,
    description,
    keywords: [
      `cheap parking heathrow terminal ${terminal.number}`,
      `heathrow terminal ${terminal.number} parking`,
      `heathrow terminal ${terminal.number} long stay`,
      `heathrow terminal ${terminal.number} short stay postcode`,
      'cheap heathrow parking'
    ],
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description,
      images: [{ url: DEFAULT_PARKING_IMAGE, width: 1200, height: 630, alt: 'Free parking at The Anchor pub near Heathrow Airport' }],
      url: `https://www.the-anchor.pub${canonical}`
    },
    twitter: getTwitterMetadata({
      title,
      description,
      images: [DEFAULT_PARKING_IMAGE]
    })
  }
}

function buildFaqs(terminalNumber: string) {
  return [
    {
      question: `Is this official Heathrow Terminal ${terminalNumber} parking?`,
      answer: `No. The Anchor is off-airport parking in Stanwell Moor, around ${terminalNumber === '5' ? '7' : '10-12'} minutes from Terminal ${terminalNumber}. Many travellers choose it when comparing official Heathrow rates with cheaper local alternatives.`
    },
    {
      question: `What is the postcode for Heathrow Terminal ${terminalNumber} short-stay parking?`,
      answer: `Official Heathrow postcodes and routing can change, so always verify them on Heathrow Airport's live parking pages before travel. For The Anchor parking alternative, use TW19 6AQ.`
    },
    {
      question: `How much does Terminal ${terminalNumber} parking cost at The Anchor?`,
      answer: 'Rates start from £5 per hour, £15 per day and £75 per week. You keep your keys, park in a CCTV-monitored area, and arrange your own taxi or rideshare transfer.'
    },
    {
      question: `Can I amend or cancel my Terminal ${terminalNumber} parking booking?`,
      answer: 'Yes. You can amend or cancel up to 24 hours before arrival for a full refund. If your flight changes close to departure, call 01753 682707 and we will try to help.'
    }
  ]
}

export default function TerminalParkingPage({ params }: { params: { terminal: string } }) {
  if (!isTerminalSlug(params.terminal)) {
    notFound()
  }

  const terminal = TERMINAL_PAGES[params.terminal]
  const terminalNumber = terminal.number
  const currentPath = `/heathrow-parking/${params.terminal}`
  const relatedGuides = Object.entries(TERMINAL_PAGES).filter(([slug]) => slug !== params.terminal)

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Heathrow Parking',
        item: 'https://www.the-anchor.pub/heathrow-parking'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `Terminal ${terminalNumber} parking`,
        item: `https://www.the-anchor.pub${currentPath}`
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <HeroWrapper
        route={currentPath}
        title={`Cheap Heathrow Terminal ${terminalNumber} Parking from £15/day`}
        description={`Compare Terminal ${terminalNumber} parking costs and book a cheaper off-airport option in Stanwell Moor. Typical transfer: ${terminal.transferTime} (${terminal.routeHint}).`}
        variant="default"
        tags={[
          { label: `Terminal ${terminalNumber}`, variant: 'primary' },
          { label: `Transfer ${terminal.transferTime}`, variant: 'success' },
          { label: 'Keep your keys', variant: 'warning' },
          { label: 'CCTV monitored', variant: 'default' }
        ]}
        primaryCta={
          <Link href="/heathrow-parking#book-parking" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" fullWidth className="sm:w-auto">
              Book parking now
            </Button>
          </Link>
        }
        secondaryCta={
          <Link href="tel:+441753682707" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" fullWidth className="sm:w-auto">
              Call 01753 682707
            </Button>
          </Link>
        }
      />

      <Section background="dark" spacing="lg">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-bold text-anchor-cream-text">
              Terminal {terminalNumber} parking quick facts
            </h2>
            <p className="mt-4 text-center text-lg text-anchor-cream-text/70">
              Travellers searching for {terminal.airportIntent} often see high on-airport prices.
              The Anchor gives you a lower-cost alternative while keeping transfer times predictable.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-anchor-gold/15 bg-anchor-bg-raised p-5">
                <h3 className="text-lg font-semibold text-anchor-cream-text">Typical transfer</h3>
                <p className="mt-2 text-sm text-anchor-cream-text/70">{terminal.transferTime} by taxi or rideshare.</p>
              </div>
              <div className="rounded-xl border border-anchor-gold/15 bg-anchor-bg-raised p-5">
                <h3 className="text-lg font-semibold text-anchor-cream-text">Typical taxi fare</h3>
                <p className="mt-2 text-sm text-anchor-cream-text/70">{terminal.taxiRange} depending on traffic and time of day.</p>
              </div>
              <div className="rounded-xl border border-anchor-gold/15 bg-anchor-bg-raised p-5">
                <h3 className="text-lg font-semibold text-anchor-cream-text">Anchor postcode</h3>
                <p className="mt-2 text-sm text-anchor-cream-text/70">TW19 6AQ (Stanwell Moor, Horton Road).</p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="dark" spacing="lg">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-anchor-gold/15 bg-anchor-bg-raised p-6 md:p-8">
            <h2 className="text-2xl font-bold text-anchor-cream-text">
              Looking for Heathrow Terminal {terminalNumber} parking postcode details?
            </h2>
            <p className="mt-3 text-anchor-cream-text/70">
              If you are comparing official Heathrow short-stay and long-stay options, always use Heathrow Airport&apos;s
              live parking pages for the latest official postcodes and routing. If you want a cheaper off-airport option,
              The Anchor postcode is <strong>TW19 6AQ</strong> with online booking from <strong>£15/day</strong>.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link href="/heathrow-parking#book-parking">
                <Button variant="primary" size="lg">
                  Check live availability
                </Button>
              </Link>
              <Link href="https://wa.me/441753682707?text=Hi%20Anchor%20Team%2C%20I%20need%20Terminal%20parking%20help.">
                <Button variant="secondary" size="lg">
                  WhatsApp the team
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="dark" spacing="lg">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-bold text-anchor-cream-text">
              Compare other Heathrow terminal parking guides
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {relatedGuides.map(([slug, item]) => (
                <Link
                  key={slug}
                  href={`/heathrow-parking/${slug}`}
                  className="rounded-xl border border-anchor-gold/15 bg-anchor-bg-raised p-5 transition-colors hover:border-anchor-gold"
                >
                  <h3 className="text-lg font-semibold text-anchor-cream-text">
                    Terminal {item.number} parking guide
                  </h3>
                  <p className="mt-2 text-sm text-anchor-cream-text/70">
                    Transfer {item.transferTime} from The Anchor parking site.
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <FAQAccordionWithSchema
        title={`Terminal ${terminalNumber} parking FAQs`}
        faqs={buildFaqs(terminalNumber)}
        className="bg-anchor-bg"
      />

      <CTASection
        title={`Need cheap Heathrow Terminal ${terminalNumber} parking?`}
        description="Book online in minutes and lock your space before prices rise. You keep your keys and arrange your own transfer."
        buttons={[
          {
            text: 'Book Heathrow parking',
            href: '/heathrow-parking#book-parking',
            variant: 'white'
          },
          {
            text: 'Call 01753 682707',
            href: 'tel:+441753682707',
            isPhone: true,
            variant: 'secondary',
            phoneSource: `heathrow_terminal_${terminalNumber}_cta`
          }
        ]}
      />
    </>
  )
}
