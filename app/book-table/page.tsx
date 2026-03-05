import type { Metadata } from 'next'
import Link from 'next/link'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { PhoneButton } from '@/components/PhoneButton'
import { ManagementTableBookingForm } from '@/components/features/TableBooking/ManagementTableBookingForm'
import { BookTableUpcomingEventsPanel } from '@/components/features/TableBooking/BookTableUpcomingEventsPanel'
import { Section, Button } from '@/components/ui'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { SUNDAY_LUNCH_DEPOSIT_POLICY_COPY } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { RegretReduction, ValueProofStrip } from '@/components/psychology'

export const metadata: Metadata = {
  title: 'Book a Table Online | The Anchor - Heathrow Pub & Dining',
  description: `Book your table at The Anchor online with fast confirmation via our management platform. ${SUNDAY_LUNCH_DEPOSIT_POLICY_COPY}`,
  keywords: 'book table stanwell moor, restaurant booking, pub reservation, sunday lunch booking',
  openGraph: {
    title: 'Book a Table at The Anchor',
    description: 'Reserve your table online with fast mobile confirmation.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }]
  },
  twitter: getTwitterMetadata({
    title: 'Book a Table at The Anchor',
    description: 'Reserve your table online with fast mobile confirmation.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/book-table'
  }
}

type BookTablePageProps = {
  searchParams?: {
    date?: string
    time?: string
    party_size?: string
    purpose?: string
    sunday_lunch?: string
    mothers_day?: string
  }
}

function parsePartySize(value?: string): number | undefined {
  if (!value) return undefined
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return undefined
  return Math.min(Math.max(parsed, 1), 50)
}

function parsePurpose(value?: string): 'food' | 'drinks' | undefined {
  if (value === 'food' || value === 'drinks') return value
  return undefined
}

function parseBoolean(value?: string): boolean | undefined {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false
  return undefined
}

export default function BookPage({ searchParams }: BookTablePageProps) {
  const prefill = {
    date: searchParams?.date,
    time: searchParams?.time,
    partySize: parsePartySize(searchParams?.party_size),
    purpose: parsePurpose(searchParams?.purpose),
    sundayLunch: parseBoolean(searchParams?.sunday_lunch),
    mothersDay: parseBoolean(searchParams?.mothers_day)
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FoodEstablishmentReservation',
            reservationFor: {
              '@type': 'FoodEstablishment',
              name: 'The Anchor',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Horton Road',
                addressLocality: 'Stanwell Moor',
                postalCode: 'TW19 6AQ'
              }
            },
            url: 'https://www.the-anchor.pub/book-table',
            potentialAction: {
              '@type': 'ReserveAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://www.the-anchor.pub/book-table'
              },
              result: {
                '@type': 'FoodEstablishmentReservation'
              }
            }
          })
        }}
      />

      <HeroWrapper
        route="/book-table"
        title="Book a Table at The Anchor"
        description="Reserve your table online with mobile confirmation."
        variant="default"
        statusBarPosition="above"
        primaryCta={
          <PhoneButton
            phone="01753 682707"
            source="book_table_hero"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          >
            📞 Prefer to call? 01753 682707
          </PhoneButton>
        }
        secondaryCta={
          <Link href="/find-us">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto !bg-white/10 !text-white !border-white/30 hover:!bg-white/20"
            >
              📍 Find Us
            </Button>
          </Link>
        }
        image={{
          src: DEFAULT_PAGE_HEADER_IMAGE,
          alt: 'The Anchor pub - book a table',
          priority: true
        }}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Book a Table' }
        ]}
        tags={[
          { label: 'Direct booking', icon: '🗓️', size: 'small' },
          { label: 'Fast confirmation', icon: '⚡', size: 'small' },
          { label: 'Need help? Call us', icon: '📞', size: 'small' }
        ]}
      />

      <Section spacing="xs" container containerSize="md" className="text-center">
        <PageTitle className="text-anchor-green" seo={{ structured: true, speakable: true }}>
          Book Online
        </PageTitle>
        <p className="mt-3 text-base text-gray-700 md:text-lg">
          Choose your date, time, and party size to reserve your table. Loved by locals and Heathrow travellers every week.
        </p>
      </Section>

      <Section background="gray" spacing="sm" container containerSize="lg">
        <div className="grid items-start gap-5 lg:gap-8 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
          <div className="order-1">
            <div className="mb-4">
              <RegretReduction variant="booking" />
            </div>
            <ManagementTableBookingForm prefill={prefill} />
          </div>

          <aside className="order-2 space-y-4 lg:space-y-6">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 lg:hidden">
              <h2 className="text-lg font-semibold text-anchor-green">Need help with your booking?</h2>
              <p className="mt-2 text-sm text-gray-700">
                If you need a larger table, can’t find your preferred time, or want a quick answer, call us directly.
              </p>
              <div className="mt-4 space-y-2">
                <PhoneButton
                  phone="01753 682707"
                  source="book_table_mobile_help"
                  variant="secondary"
                  className="w-full"
                >
                  📞 Call 01753 682707
                </PhoneButton>
                <Link href="/whats-on" className="block">
                  <Button variant="outline" className="w-full">
                    See upcoming events
                  </Button>
                </Link>
              </div>
            </div>

            <div className="hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 lg:block">
              <h3 className="text-base font-semibold text-anchor-green mb-3">Why The Anchor?</h3>
              <ValueProofStrip variant="food" />
            </div>

            <div className="hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 lg:block">
              <h2 className="text-xl font-semibold text-anchor-green">Quick tips</h2>
              <ul className="mt-3 space-y-2 text-left text-sm text-gray-700">
                <li>• For larger groups, please call us.</li>
                <li>• {SUNDAY_LUNCH_DEPOSIT_POLICY_COPY}</li>
                <li>• Add access needs or dietary notes in the notes box.</li>
                <li>• Can’t see the time you want? Give us a ring.</li>
              </ul>
            </div>

            <div className="hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 lg:block">
              <h3 className="text-xl font-semibold text-anchor-green">Prefer to talk?</h3>
              <p className="mt-2 text-sm text-gray-700">
                Our team can help with tables of 8+, special celebrations, or last-minute changes.
              </p>
              <div className="mt-4">
                <PhoneButton
                  phone="01753 682707"
                  source="book_table_sidebar"
                  variant="secondary"
                  className="w-full"
                >
                  📞 Call 01753 682707
                </PhoneButton>
              </div>
            </div>

            <div className="hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 lg:block">
              <h3 className="text-xl font-semibold text-anchor-green">Useful to know</h3>
              <ul className="mt-3 space-y-2 text-left text-sm text-gray-700">
                <li>• 20 free parking spaces on site.</li>
                <li>• Dog friendly inside and out.</li>
                <li>• Step-free access from the car park.</li>
              </ul>
            </div>

            <div className="hidden lg:block">
              <BookTableUpcomingEventsPanel />
            </div>
          </aside>
        </div>
      </Section>

      <Section background="white" spacing="sm" container containerSize="md">
        <h2 className="text-2xl font-bold text-anchor-green mb-4">Accessibility</h2>
        <p className="text-gray-700 mb-3">
          Step-free access to the bar, dining area and beer garden.
        </p>
        <p className="text-gray-700 mb-4">
          We currently don&apos;t have an accessible toilet. If you&apos;d like to visit and want to check what will work best for you, give us a call on{' '}
          <a href="tel:+441753682707" className="text-anchor-green font-semibold hover:underline">+44 1753 682707</a> and we&apos;ll help.
        </p>
        <Link href="/accessibility" className="text-anchor-green font-semibold hover:underline">
          Full accessibility information &rarr;
        </Link>
      </Section>
    </>
  )
}
