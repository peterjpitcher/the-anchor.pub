import type { Metadata } from 'next'
import Link from 'next/link'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { PhoneButton } from '@/components/PhoneButton'
import { OpenTableWidget } from '@/components/features/OpenTable/OpenTableWidget'
import { Section, Button } from '@/components/ui'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
  title: 'Book a Table Online | The Anchor - Heathrow Pub & Dining',
  description: 'Book your table at The Anchor via OpenTable. Fast reservations near Heathrow.',
  keywords: 'book table stanwell moor, restaurant booking, pub reservation, sunday lunch booking',
  openGraph: {
    title: 'Book a Table at The Anchor',
    description: 'Quick and easy table booking via OpenTable.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  },
  alternates: {
    canonical: '/book-table'
  }
}

export default function BookPage() {
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
        description="Reserve your table quickly and securely via OpenTable."
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
          { label: 'Powered by OpenTable', icon: '🗓️', size: 'small' },
          { label: 'Fast reservations', icon: '⚡', size: 'small' },
          { label: 'Prefer to call? We’re here', icon: '📞', size: 'small' }
        ]}
      />

      <Section spacing="md" container containerSize="md" className="text-center">
        <PageTitle className="text-anchor-green" seo={{ structured: true, speakable: true }}>
          Book Online with OpenTable
        </PageTitle>
        <p className="mt-4 text-lg text-gray-700">Choose a date, time, and party size to reserve your table.</p>
      </Section>

      <Section background="gray" spacing="lg" container containerSize="lg">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
          <div className="order-1">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <OpenTableWidget />
            </div>
            <p className="mt-4 text-sm text-gray-600">
              If the widget doesn’t load, please call us on{' '}
              <a href="tel:+441753682707" className="text-anchor-green font-semibold underline">
                01753 682707
              </a>
              .
            </p>
          </div>

          <aside className="order-2 space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-xl font-semibold text-anchor-green">Quick tips</h2>
              <ul className="mt-3 space-y-2 text-left text-sm text-gray-700">
                <li>• For larger groups, please call us.</li>
                <li>• Tell us about access needs or allergies when booking.</li>
                <li>• Can’t see the time you want? Try nearby times or give us a ring.</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
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

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h3 className="text-xl font-semibold text-anchor-green">Useful to know</h3>
              <ul className="mt-3 space-y-2 text-left text-sm text-gray-700">
                <li>• 20 free parking spaces on site.</li>
                <li>• Dog friendly inside and out.</li>
                <li>• Step-free access from the car park.</li>
              </ul>
            </div>
          </aside>
        </div>
      </Section>
    </>
  )
}
