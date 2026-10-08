import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { InteriorHero } from '@/components/hero'
import { Badge, Button, Container, Card, CardBody, SectionHeading } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DEFAULT_PARKING_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { PhoneButton } from '@/components/PhoneButton'
import { CONTACT, HEATHROW_TIMES } from '@/lib/constants'
import { PARKING_REFUND_WORDING } from '@/lib/approved-wording'

const TERMINAL_PAGES = {
  'terminal-2': {
    number: '2',
    transferTime: `${HEATHROW_TIMES.terminal2} minutes`,
    airportIntent: 'Terminal 2 long-stay and short-stay options'
  },
  'terminal-3': {
    number: '3',
    transferTime: `${HEATHROW_TIMES.terminal3} minutes`,
    airportIntent: 'Terminal 3 long-stay, short-stay and postcode lookups'
  },
  'terminal-4': {
    number: '4',
    transferTime: `${HEATHROW_TIMES.terminal4} minutes`,
    airportIntent: 'Terminal 4 overnight and long-term parking'
  },
  'terminal-5': {
    number: '5',
    transferTime: `${HEATHROW_TIMES.terminal5} minutes`,
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
  const title = `Cheap Heathrow Terminal ${terminal.number} Parking`
  const description = `Compare cheap Heathrow Terminal ${terminal.number} parking options. The Anchor in Stanwell Moor is ${terminal.transferTime} away, and you keep your keys.`

  return {
    title,
    description,
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

function buildFaqs(terminalNumber: string, transferTime: string) {
  return [
    {
      question: `Is this official Heathrow Terminal ${terminalNumber} parking?`,
      answer: `No. The Anchor is off-airport parking in Stanwell Moor, around ${transferTime} from Terminal ${terminalNumber}. Many travellers choose it when comparing official Heathrow rates with cheaper local alternatives.`
    },
    {
      question: `What is the postcode for Heathrow Terminal ${terminalNumber} short-stay parking?`,
      answer: `Official Heathrow postcodes and routing can change, so always verify them on Heathrow Airport's live parking pages before travel. For The Anchor parking alternative, use TW19 6AQ.`
    },
    {
      question: `How much does Terminal ${terminalNumber} parking cost at The Anchor?`,
      answer: 'Our hourly, daily and weekly prices are on our Heathrow parking page, read live from our booking system. You keep your keys, park in a CCTV-monitored area, and arrange your own taxi or rideshare transfer.'
    },
    {
      question: `Can I amend or cancel my Terminal ${terminalNumber} parking booking?`,
      answer: `Yes. ${PARKING_REFUND_WORDING} If your flight changes close to departure, call 01753 682707 and we will try to help.`
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

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Heathrow Parking', url: '/heathrow-parking' },
          { name: `Terminal ${terminalNumber}`, url: currentPath }
        ]}
      />

      <InteriorHero
        image="/images/page-headers/parking-near-heathrow/heathrow-airport-view.jpg"
        crumb="Heathrow Parking"
        title={`Cheap Heathrow Terminal ${terminalNumber} Parking`}
        lead={`Compare Terminal ${terminalNumber} parking costs and book a cheaper off-airport option in Stanwell Moor. Typical transfer: ${terminal.transferTime}.`}
        badges={
          <>
            <Badge variant="sand">{`Terminal ${terminalNumber}`}</Badge>
            <Badge variant="sand">{`Transfer ${terminal.transferTime}`}</Badge>
            <Badge variant="sand">Keep your keys</Badge>
            <Badge variant="sand">CCTV monitored</Badge>
          </>
        }
        actions={
          <>
            <Button asChild size="lg" variant="primary" fullWidth>
              <Link href="/heathrow-parking#book-parking">
                Book parking now
              </Link>
            </Button>
            <PhoneButton phone={CONTACT.phone} source="heathrow-parking-terminal_cta" variant="outline" size="lg">
              Call {CONTACT.phone}
            </PhoneButton>
          </>
        }
      />

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title={`Terminal ${terminalNumber} parking quick facts`}
              lead={`Travellers searching for ${terminal.airportIntent} often see high on-airport prices. The Anchor gives you a lower-cost alternative while keeping transfer times predictable.`}
            />
            <div className="grid gap-6 md:grid-cols-3">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="text-lg font-semibold text-ink-strong">Typical transfer</h3>
                  <p className="mt-2 text-sm text-ink-muted">{terminal.transferTime} by taxi or rideshare.</p>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="text-lg font-semibold text-ink-strong">Today&apos;s prices</h3>
                  <p className="mt-2 text-sm text-ink-muted">
                    On our <Link href="/heathrow-parking" className="text-accent-text underline">Heathrow parking page</Link>, read live from our booking system.
                  </p>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="text-lg font-semibold text-ink-strong">Anchor postcode</h3>
                  <p className="mt-2 text-sm text-ink-muted">TW19 6AQ (Stanwell Moor, Horton Road).</p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <Card accent>
              <CardBody className="p-6 md:p-8">
                <h2 className="font-display text-h2 text-ink-strong">
                  Looking for Heathrow Terminal {terminalNumber} parking postcode details?
                </h2>
                <p className="mt-3 text-ink-muted">
                  If you are comparing official Heathrow short-stay and long-stay options, always use Heathrow Airport&apos;s
                  live parking pages for the latest official postcodes and routing. If you want a cheaper off-airport option,
                  The Anchor postcode is <strong>TW19 6AQ</strong>, and today&apos;s prices are on our{' '}
                  <Link href="/heathrow-parking" className="text-accent-text underline">Heathrow parking page</Link>.
                </p>
                <p className="mt-3 text-sm text-ink-muted">
                  Heathrow now describes Short Stay as Terminal Parking and Long Stay as Park &amp; Ride on its official parking pages.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button asChild variant="primary" size="lg">
                    <Link href="/heathrow-parking#book-parking">
                      Check live availability
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="https://wa.me/441753682707?text=Hi%20Anchor%20Team%2C%20I%20need%20Terminal%20parking%20help.">
                      WhatsApp the team
                    </Link>
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading title="Compare other Heathrow terminal parking guides" />
            <div className="grid gap-6 md:grid-cols-3">
              {relatedGuides.map(([slug, item]) => (
                <Link
                  key={slug}
                  href={`/heathrow-parking/${slug}`}
                  className="rounded-md border border-line bg-surface p-5 shadow-sm transition-colors hover:border-anchor-gold"
                >
                  <h3 className="text-lg font-semibold text-ink-strong">
                    Terminal {item.number} parking guide
                  </h3>
                  <p className="mt-2 text-sm text-ink-muted">
                    Transfer {item.transferTime} from The Anchor parking site.
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        title={`Terminal ${terminalNumber} parking FAQs`}
        faqs={buildFaqs(terminalNumber, terminal.transferTime)}
        className="bg-surface"
      />

      <OrganicSearchClusterLinks
        cluster="heathrowParking"
        currentPath={currentPath}
        title={`More Heathrow Terminal ${terminalNumber} parking help`}
        intro="Compare the main parking page, the savings guide and directions before you book."
      />

      <CtaBand
        title={`Need cheap Heathrow Terminal ${terminalNumber} parking?`}
        copy="Book online in minutes and lock your space before prices rise. You keep your keys and arrange your own transfer."
      >
        <Button asChild variant="primary" size="lg">
          <Link href="/heathrow-parking#book-parking">Book Heathrow parking</Link>
        </Button>
        <PhoneButton phone={CONTACT.phone} source={`heathrow_terminal_${terminalNumber}_cta`} variant="outline" size="lg">
          Call {CONTACT.phone}
        </PhoneButton>
      </CtaBand>
    </>
  )
}
