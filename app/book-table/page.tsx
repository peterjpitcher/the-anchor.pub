import type { Metadata } from 'next'
import Link from 'next/link'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { PhoneButton } from '@/components/PhoneButton'
import { ManagementTableBookingForm } from '@/components/features/TableBooking/ManagementTableBookingForm'
import { BookTableUpcomingEventsPanel } from '@/components/features/TableBooking/BookTableUpcomingEventsPanel'
import { Section, Button, Grid, Card, CardBody, SectionHeader } from '@/components/ui'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { SUNDAY_LUNCH_DEPOSIT_POLICY_COPY } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { RegretReduction, ValueProofStrip } from '@/components/psychology'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'

export const metadata: Metadata = {
  title: 'Book a Table at The Anchor | Near Heathrow | Free Parking',
  description: 'Book a table at The Anchor near Heathrow with instant confirmation. Pub classics from £8.95, Sunday roasts from £19. Free parking, dog-friendly, 7 mins from T5. Walk-ins welcome.',
  openGraph: {
    title: 'Book a Table at The Anchor | Near Heathrow | Free Parking',
    description: 'Book a table at The Anchor near Heathrow with instant confirmation. Pub classics from £8.95, Sunday roasts from £19. Free parking, dog-friendly, 7 mins from T5. Walk-ins welcome.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }]
  },
  twitter: getTwitterMetadata({
    title: 'Book a Table at The Anchor | Near Heathrow | Free Parking',
    description: 'Book a table at The Anchor near Heathrow with instant confirmation. Pub classics from £8.95, Sunday roasts from £19. Free parking, dog-friendly, 7 mins from T5. Walk-ins welcome.',
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
  return Math.min(Math.max(parsed, 1), 20)
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
            Prefer to call? 01753 682707
          </PhoneButton>
        }
        secondaryCta={
          <Link href="/find-us">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto !bg-white/10 !text-white !border-white/30 hover:!bg-white/20"
            >
              Find Us
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
          { label: 'Direct booking', icon: '', size: 'small' },
          { label: 'Fast confirmation', icon: '', size: 'small' },
          { label: 'Need help? Call us', icon: '', size: 'small' }
        ]}
        secondaryInfo={
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog & family friendly</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Rated 4.6/5 on Google</span>
          </div>
        }
      />

      <Section spacing="xs" container containerSize="md" className="text-center bg-anchor-bg border-b border-anchor-gold/15">
        <PageTitle className="text-anchor-cream-text" seo={{ structured: true, speakable: true }}>
          Reserve Your Table Online
        </PageTitle>
        <p className="mt-3 text-base text-anchor-cream-text/70 md:text-lg">
          Choose your date, time, and party size to reserve your table. Loved by locals and Heathrow travellers every week.
        </p>
      </Section>

      <Section background="gray" spacing="sm" container containerSize="lg" className="bg-anchor-bg-raised">
        <div className="grid items-start gap-5 lg:gap-8 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
          <div className="order-1">
            <div className="mb-4">
              <RegretReduction variant="booking" />
            </div>
            <ManagementTableBookingForm prefill={prefill} />
          </div>

          <aside className="order-2 space-y-4 lg:space-y-6">
            <div className="card-dark p-4 lg:hidden">
              <h2 className="text-lg font-semibold text-anchor-gold-vivid">Need help with your booking?</h2>
              <p className="mt-2 text-sm text-anchor-cream-text/70">
                If you need a larger table, can't find your preferred time, or want a quick answer, call us directly.
              </p>
              <div className="mt-4 space-y-2">
                <PhoneButton
                  phone="01753 682707"
                  source="book_table_mobile_help"
                  variant="secondary"
                  className="w-full"
                >
                  Call 01753 682707
                </PhoneButton>
                <Link href="/whats-on" className="block">
                  <Button variant="outline" className="w-full">
                    See upcoming events
                  </Button>
                </Link>
              </div>
            </div>

            <div className="hidden card-dark p-5 lg:block">
              <h3 className="text-base font-semibold text-anchor-gold-vivid mb-3">Why The Anchor?</h3>
              <ValueProofStrip variant="food" />
            </div>

            <div className="hidden card-dark p-6 lg:block">
              <h2 className="text-xl font-semibold text-anchor-gold-vivid">Quick tips</h2>
              <ul className="mt-3 space-y-2 text-left text-sm text-anchor-cream-text/70">
                <li>• For groups of 20+, please call us.</li>
                <li>• A £10 per person deposit is required for groups of 7 or more. This is deducted from your final bill.</li>
                <li>• {SUNDAY_LUNCH_DEPOSIT_POLICY_COPY}</li>
                <li>• Add access needs or dietary notes in the notes box.</li>
                <li>• Can't see the time you want? Give us a ring.</li>
              </ul>
            </div>

            <div className="hidden card-dark p-6 lg:block">
              <h3 className="text-xl font-semibold text-anchor-gold-vivid">Prefer to talk?</h3>
              <p className="mt-2 text-sm text-anchor-cream-text/70">
                Our team can help with tables of 20+, special celebrations, or last-minute changes.
              </p>
              <div className="mt-4">
                <PhoneButton
                  phone="01753 682707"
                  source="book_table_sidebar"
                  variant="secondary"
                  className="w-full"
                >
                  Call 01753 682707
                </PhoneButton>
              </div>
            </div>

            <div className="hidden card-dark p-6 lg:block">
              <h3 className="text-xl font-semibold text-anchor-gold-vivid">Useful to know</h3>
              <ul className="mt-3 space-y-2 text-left text-sm text-anchor-cream-text/70">
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

      <Section background="white" spacing="sm" container containerSize="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <h2 className="text-2xl font-bold text-anchor-gold-vivid mb-4">Accessibility</h2>
        <p className="text-anchor-cream-text/70 mb-3">
          Step-free access to the bar, dining area and beer garden.
        </p>
        <p className="text-anchor-cream-text/70 mb-4">
          We currently don&apos;t have an accessible toilet. If you&apos;d like to visit and want to check what will work best for you, give us a call on{' '}
          <a href="tel:+441753682707" className="text-anchor-gold-vivid font-semibold hover:underline">+44 1753 682707</a> and we&apos;ll help.
        </p>
        <Link href="/accessibility" className="text-anchor-gold-vivid font-semibold hover:underline">
          Full accessibility information &rarr;
        </Link>
      </Section>

      {/* What to Expect section */}
      <Section spacing="lg" container containerSize="lg" className="bg-anchor-bg-raised">
        <SectionHeader
          title="What to Expect When You Dine With Us"
          subtitle="Good food, a warm welcome, and no fuss."
          align="center"
        />
        <Grid cols={3} gap="md">
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-anchor-gold-vivid mb-2">Pub Classics &amp; Pizza</h3>
              <p className="text-anchor-cream-text/70 text-sm mb-4">
                From stone-baked pizzas and proper fish &amp; chips to hearty burgers and home-made pies — there&apos;s something for everyone on our kitchen menu, with mains from £8.95.
              </p>
              <Link href="/food-menu" className="text-anchor-gold-vivid font-semibold text-sm hover:underline">
                View food menu &rarr;
              </Link>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-anchor-gold-vivid mb-2">Sunday Roast</h3>
              <p className="text-anchor-cream-text/70 text-sm mb-4">
                Our Sunday roasts are legendary locally — choose from beef, chicken, pork, or a vegetarian option. Roasts are served from noon, priced from £19, and must be pre-ordered when booking.
              </p>
              <Link href="/sunday-lunch" className="text-anchor-gold-vivid font-semibold text-sm hover:underline">
                About Sunday roast &rarr;
              </Link>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-anchor-gold-vivid mb-2">Free Parking &amp; Easy Access</h3>
              <p className="text-anchor-cream-text/70 text-sm mb-4">
                We have 20 free on-site parking spaces and are just 7 minutes from Heathrow Terminal 5. Step-free access from the car park. Dogs welcome inside and out.
              </p>
              <Link href="/find-us" className="text-anchor-gold-vivid font-semibold text-sm hover:underline">
                Get directions &rarr;
              </Link>
            </CardBody>
          </Card>
        </Grid>
      </Section>

      {/* Signature Dishes Preview */}
      <Section spacing="md" container containerSize="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <SectionHeader
          title="A Taste of What&rsquo;s on the Menu"
          subtitle="A few favourites to whet your appetite before you book."
          align="center"
        />
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="flex justify-between items-start gap-4 py-3 border-b border-anchor-gold/10">
            <div>
              <h3 className="font-semibold text-anchor-cream-text">Fish &amp; Chips</h3>
              <p className="text-sm text-anchor-cream-text/60 mt-1">Beer-battered fish, chips, mushy peas and tartare sauce. A proper British classic.</p>
            </div>
            <span className="text-anchor-gold-vivid font-semibold whitespace-nowrap">&pound;15.00</span>
          </div>
          <div className="flex justify-between items-start gap-4 py-3 border-b border-anchor-gold/10">
            <div>
              <h3 className="font-semibold text-anchor-cream-text">The Anchor Burger</h3>
              <p className="text-sm text-anchor-cream-text/60 mt-1">Double smash burger with American cheese, gherkins, lettuce, and burger sauce in a brioche bun. Chips included.</p>
            </div>
            <span className="text-anchor-gold-vivid font-semibold whitespace-nowrap">&pound;14.00</span>
          </div>
          <div className="flex justify-between items-start gap-4 py-3 border-b border-anchor-gold/10">
            <div>
              <h3 className="font-semibold text-anchor-cream-text">Stone-Baked Pizza</h3>
              <p className="text-sm text-anchor-cream-text/60 mt-1">Choose from our range of freshly made stone-baked pizzas. Gluten-free bases available.</p>
            </div>
            <span className="text-anchor-gold-vivid font-semibold whitespace-nowrap">from &pound;11.00</span>
          </div>
          <div className="flex justify-between items-start gap-4 py-3">
            <div>
              <h3 className="font-semibold text-anchor-cream-text">Sunday Roast</h3>
              <p className="text-sm text-anchor-cream-text/60 mt-1">Chicken, pork belly or veggie wellington. All the trimmings. Pre-order by Saturday 1pm.</p>
            </div>
            <span className="text-anchor-gold-vivid font-semibold whitespace-nowrap">from &pound;19</span>
          </div>
        </div>
        <p className="text-center mt-6">
          <Link href="/food-menu" className="text-anchor-gold-vivid font-semibold hover:underline">
            See the full food menu &rarr;
          </Link>
        </p>
      </Section>

      {/* Customer Review */}
      <Section spacing="md" container containerSize="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-2xl text-anchor-cream-text/80 italic leading-relaxed">
            &ldquo;Lovely pub, great food, friendly staff. We stopped in on our way to Heathrow and wished we&apos;d found it sooner. Will definitely be back.&rdquo;
          </p>
          <p className="mt-4 text-sm text-anchor-cream-text/50">&mdash; Google Review, rated 5/5</p>
        </div>
      </Section>

      {/* Getting Here */}
      <Section spacing="md" container containerSize="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <SectionHeader
          title="Getting Here"
          subtitle="Easy to find, plenty of parking, and closer than you think."
          align="center"
        />
        <div className="max-w-2xl mx-auto">
          <div className="prose prose-invert max-w-none text-anchor-cream-text/70 space-y-4">
            <p>
              The Anchor Pub is on Horton Road, Stanwell Moor, Surrey, TW19 6AQ &mdash; just 2 minutes from M25 Junction 14 and 7 minutes from Heathrow Terminal 5. Whether you&apos;re booking a pub table near Heathrow for a pre-flight meal, a layover lunch, or a restaurant reservation near Heathrow for a special evening, we&apos;re easy to reach from all directions.
            </p>
            <p>
              We have 20 free on-site parking spaces with CCTV and floodlighting. No meters, no time limits while you&apos;re dining. The car park has a level surface with step-free access to the bar and dining area.
            </p>
            <p>
              By bus, we&apos;re served by the 441, 442, and 555 routes from Heathrow Central Bus Station. We&apos;re also outside the ULEZ zone, saving you &pound;12.50 a day if you&apos;re driving from London.
            </p>
          </div>
          <p className="mt-6 text-center">
            <Link href="/find-us" className="text-anchor-gold-vivid font-semibold hover:underline">
              View map and full directions &rarr;
            </Link>
          </p>
        </div>
      </Section>

      {/* FAQ section */}
      <FAQAccordionWithSchema
        title="Booking FAQs"
        faqs={[
          {
            question: 'Do I need to book in advance?',
            answer: 'Walk-ins are always welcome, but we recommend booking ahead — especially for Sunday roasts, larger groups (7+), and busy weekend evenings. Booking takes under a minute online and guarantees your table.'
          },
          {
            question: 'Is there a deposit required?',
            answer: 'A £10 per person deposit is required for groups of 7 or more. This is fully deductible from your final bill on the day. Sunday roast bookings also require a pre-payment to confirm your order.'
          },
          {
            question: 'Can I book for a special occasion?',
            answer: 'Yes — we love hosting birthdays, anniversaries, and celebrations. Use the notes field when booking to let us know, or call us on 01753 682707 to discuss any special arrangements.'
          },
          {
            question: 'Do you cater for dietary requirements?',
            answer: 'Yes. We offer vegetarian and vegan options and can accommodate most common allergies. Please add a note when booking, and our team will make sure your visit goes smoothly.'
          },
          {
            question: 'How far are you from Heathrow Airport?',
            answer: 'The Anchor is in Stanwell Moor, just 7 minutes from Heathrow Terminal 5 by car. We\'re a popular choice for pre-flight meals, layover dining, and airport hotel guests looking for a proper pub nearby.'
          },
          {
            question: 'What are your kitchen hours?',
            answer: 'Our kitchen is open Tuesday to Saturday from noon until 9pm, and Sunday from noon until 5pm. The kitchen is closed on Mondays. Check our food menu page for the latest hours, as they can vary on bank holidays.'
          },
          {
            question: 'Is The Anchor dog-friendly?',
            answer: 'Yes — dogs are welcome both inside the pub and in the beer garden. We have water bowls available and our team love a visit from a four-legged friend. Just mention it when you book if you\'re bringing a dog.'
          },
          {
            question: 'Can I book for a Heathrow layover meal?',
            answer: 'Absolutely. Many of our guests book a table during a long Heathrow layover. We\'re 7 minutes from T5, offer free parking, and our kitchen can turn around a full meal in good time. Call us if you have a tight window and we\'ll do our best.'
          }
        ]}
      />
    </>
  )
}
