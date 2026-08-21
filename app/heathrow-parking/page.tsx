import type { Metadata } from 'next'
import Link from 'next/link'
import { InteriorHero } from '@/components/hero'
import { Badge, Button, Container, Card, CardBody, SectionHeading } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { ParkingBookingWizard } from '@/components/features/ParkingBookingWizard'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { ReviewSection } from '@/components/reviews'
import { DEFAULT_PARKING_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { anchorAPI, ParkingRateCard } from '@/lib/api'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { PhoneButton } from '@/components/PhoneButton'
import { PhoneLink } from '@/components/PhoneLink'
import { CONTACT } from '@/lib/constants'

const formatRate = (value: number | null | undefined, fallback: string) =>
  typeof value === 'number' && Number.isFinite(value) ? value.toFixed(2) : fallback

/**
 * Retargeted 21 August 2026 from "cheap heathrow parking" to
 * "heathrow parking prices".
 *
 * Keyword Planner, UK, 36 parking terms tested. The four terminal head terms
 * are 50,000 searches a month EACH, and every one of them sits at competition
 * index 66 to 72 with £2+ top-of-page bids, against Heathrow's own site and
 * the national aggregators. A village pub does not enter that top ten.
 *
 * The off-airport escape route does not exist either: "pub parking heathrow",
 * "non airport parking heathrow", "heathrow parking alternatives" and
 * "airport parking stanwell" all return NO DATA. Nobody searches for an
 * alternative to airport parking.
 *
 * Exactly one term in 36 is both high-volume and winnable:
 *
 *   heathrow parking prices    5,000/mo    Low, index 22    £0.22-£0.58
 *
 * It is informational intent, which is precisely what the aggregators serve
 * badly because they answer with a booking funnel instead of a number.
 * See tasks/keyword-plan-2026-08-17-site-growth.md.
 *
 * The price is deliberately NOT in the title any more. It was hardcoded here
 * while the page body reads the live rate from anchorAPI.getParkingRates(),
 * so the two could drift apart silently.
 */
export const metadata: Metadata = {
  title: 'Heathrow Parking Prices | Park 7 Mins from T5',
  description: 'What Heathrow parking actually costs, and what we charge to park at the pub instead. Keep your keys, CCTV, 7 minutes from Terminal 5.',
  openGraph: {
    title: 'Heathrow Parking Prices | The Anchor, Stanwell Moor',
    description: 'What Heathrow parking actually costs, and what we charge to park at the pub instead. Keep your keys, CCTV, 7 minutes from Terminal 5.',
    images: [{ url: DEFAULT_PARKING_IMAGE, width: 1200, height: 630, alt: 'Parking at The Anchor pub near Heathrow Airport' }],
    url: 'https://www.the-anchor.pub/heathrow-parking'
  },
  twitter: getTwitterMetadata({
    title: 'Heathrow Parking Prices | The Anchor, Stanwell Moor',
    description: 'What Heathrow parking actually costs, and what we charge to park at the pub instead. Keep your keys, CCTV, 7 minutes from Terminal 5.',
    images: [DEFAULT_PARKING_IMAGE]
  }),
  alternates: {
    canonical: '/heathrow-parking'
  }
}

const terminalLandingPages = [
  {
    href: '/heathrow-parking/terminal-2',
    title: 'Terminal 2 cheap parking guide',
    description: 'Alternative to expensive T2 long-stay and short-stay options with transfer tips from Stanwell Moor.'
  },
  {
    href: '/heathrow-parking/terminal-3',
    title: 'Terminal 3 cheap parking guide',
    description: 'Compare official T3 parking costs versus off-airport rates and plan your fastest transfer.'
  },
  {
    href: '/heathrow-parking/terminal-4',
    title: 'Terminal 4 cheap parking guide',
    description: 'Overnight and long-stay parking options for T4 travellers, crew and contractors.'
  },
  {
    href: '/heathrow-parking/terminal-5',
    title: 'Terminal 5 cheap parking guide',
    description: '7-minute transfer plan for T5 with key-retention parking from £15 per day.'
  }
]

const featureHighlights = [
  {
    icon: '',
    title: '7 minutes to Heathrow Terminal 5',
    description: 'Skip multi-storey queues. We sit on Horton Road in Stanwell Moor, less than four miles from T5 and under 12 minutes from Terminals 2, 3 and 4.'
  },
  {
    icon: '',
    title: 'Airport-long stay rates without airport stress',
    description: 'Hourly, daily, weekly and monthly pricing that undercuts Heathrow long stay car parks and private meet-and-greet operators.'
  },
  {
    icon: '',
    title: 'Secure CCTV & lighting all night',
    description: 'Our car park is floodlit, covered by cameras and overseen by the pub team late into the evening for peace of mind.'
  },
  {
    icon: '',
    title: 'Stay for a meal or coffee pre-flight',
    description: 'Grab a Sunday roast, a coffee or a quiet working lunch before you head to the terminal, parking customers are welcome in the pub.'
  }
]

const terminalGuides = [
  {
    icon: 'T2',
    title: 'Terminal 2 parking plan',
    description: 'Allow 10 minutes via Stanwell Moor Road (A3044). Beat official Terminal 2 long stay prices by parking with us, then hop in a quick Uber or taxi.'
  },
  {
    icon: 'T3',
    title: 'Terminal 3 long stay alternative',
    description: 'Drive 12 minutes door-to-door. No shuttle buses, no ticket barriers, just reserve online and go straight to departures.'
  },
  {
    icon: 'T4',
    title: 'Terminal 4 overnight parking',
    description: 'Perfect for cabin crew and contractors working shifts at T4. Book weekly or monthly airport long term parking with PayPal receipts.'
  },
  {
    icon: 'T5',
    title: 'Terminal 5 parking near me',
    description: 'We are the closest independent long stay parking option to T5. Secure your space for red-eye flights and late returns.'
  }
]

const comparisonRows = [
  {
    label: 'Published starting price',
    anchor: '£15 daily rate or £75 weekly rate',
    heathrow: 'T5 Park & Ride starts from £46.80'
  },
  {
    label: 'Short parking comparison',
    anchor: '£5 per hour for short visits',
    heathrow: 'T5 Terminal Parking starts from £8 for 29 minutes'
  },
  {
    label: 'Transfer style',
    anchor: 'Taxi, rideshare or 442 bus from TW19 6AQ',
    heathrow: 'Park & Ride uses a bus transfer to the terminal'
  },
  {
    label: 'Distance to terminals',
    anchor: '3.8 miles to T5 · 5.3 miles to T3',
    heathrow: 'Official T5 Park & Ride is on Northern Perimeter Road'
  },
  {
    label: 'Payment',
    anchor: 'PayPal, Apple Pay, Google Pay, cards',
    heathrow: 'Card only, pre-authorisation required'
  }
]

const faqs = (rateCard: ParkingRateCard | null) => {
  const hourly = formatRate(rateCard?.hourly_rate, '5.00')
  const daily = formatRate(rateCard?.daily_rate, '15.00')
  const weekly = formatRate(rateCard?.weekly_rate, '75.00')
  const monthly = formatRate(rateCard?.monthly_rate, '265.00')

	  return [
	  {
	    question: 'How much is parking at The Anchor, and how does it compare?',
	    answer: `We charge £${daily} a day or £${weekly} a week, and that is the price you pay. Heathrow's own car parks are priced dynamically, so what they cost depends on your dates and how far ahead you book. Check their current price for your trip and compare it against ours rather than trusting anyone's saving claim, including ours.`
	  },
  {
    question: 'Is this Heathrow airport car parking or parking near Heathrow airport?',
    answer: 'It is secure parking near Heathrow airport in Stanwell Moor, around 7 minutes from Terminal 5 and 10-12 minutes from Terminals 2, 3 and 4. Many drivers searching for Heathrow airport car parking choose us for better value and faster exits.'
  },
	  {
	    question: 'Where can I find cheap parking near Heathrow Terminal 5?',
	    answer: 'Park at The Anchor in Stanwell Moor and take a 7-minute taxi to Terminal 5. You pay from £15 per day, keep your keys and avoid airport surcharges. Taxi and rideshare drivers know our postcode TW19 6AQ, making transfers easy even on red-eye flights.'
	  },
	  {
	    question: 'How much does Heathrow parking cost at The Anchor?',
	    answer: `Our current rate card is £${hourly} per hour, £${daily} per day, £${weekly} per week and £${monthly} per month. The booking wizard locks in the best mix automatically before you pay via PayPal.`
	  },
  {
    question: 'Is this long stay parking near Heathrow Terminals 2, 3, 4 and 5?',
    answer: 'Yes. We host airport long term parking from 24 hours up to 30 days. Our Stanwell Moor car park is 7 minutes from Terminal 5 and under 12 minutes from Terminals 2, 3 and 4, making it perfect for crew, business travellers and holidaymakers.'
  },
  {
    question: 'Do I need to call after booking online?',
    answer: 'No phone call required. Once you confirm and pay, PayPal sends a receipt instantly and we text your parking reference. On arrival pull into The Anchor car park, show the team your booking if requested, and you are good to go.'
  },
  {
    question: 'Is my car safe overnight?',
    answer: 'Absolutely. We have CCTV, floodlighting, staff presence into the night and local residents overlooking the site. The Anchor is a trusted Heathrow car park for crew and regular flyers.'
  },
  {
    question: 'Can I cancel or change my Heathrow car parking booking?',
    answer: 'You can amend or cancel up to 24 hours before arrival for a full refund. Need help closer to arrival time? Call 01753 682707 and we will try to reallocate your long stay parking slot.'
  }
  ]
}

function buildParkingFacilitySchema(rateCard: ParkingRateCard | null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ParkingFacility',
    '@id': 'https://www.the-anchor.pub/heathrow-parking#facility',
    name: 'Heathrow Parking at The Anchor',
    description: 'Secure long stay and short stay Heathrow airport parking with PayPal checkout, CCTV, lighting and on-site hospitality in Stanwell Moor.',
    image: 'https://www.the-anchor.pub/images/page-headers/parking-near-heathrow/heathrow-airport-view.jpg',
    url: 'https://www.the-anchor.pub/heathrow-parking',
    telephone: '+441753682707',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Horton Road',
      addressLocality: 'Stanwell Moor',
      addressRegion: 'Surrey',
      postalCode: 'TW19 6AQ',
      addressCountry: 'GB'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 51.4592,
      longitude: -0.5147
    },
	    amenityFeature: [
	      { '@type': 'LocationFeatureSpecification', name: 'CCTV', value: true },
	      { '@type': 'LocationFeatureSpecification', name: 'Floodlighting', value: true },
	      { '@type': 'LocationFeatureSpecification', name: 'PayPal Payments', value: true },
	      { '@type': 'LocationFeatureSpecification', name: 'Electric Vehicle Friendly', value: true }
	    ],
	    // Fallbacks must match the live rate card. The daily fallback said 39.00
	    // while every other fallback on this page says 15.00, so an API failure
	    // would have advertised a daily rate we do not charge.
	    priceRange: rateCard
	      ? `£${formatRate(rateCard.hourly_rate, '5.00')}-£${formatRate(rateCard.daily_rate, '15.00')} per day`
	      : '£5-£15 per day',
	    paymentAccepted: ['PayPal', 'CreditCard', 'ContactlessPayment'],
	    offers: {
      '@type': 'Offer',
      priceCurrency: 'GBP',
      price: rateCard?.daily_rate ?? 15,
      availability: 'https://schema.org/InStock',
      url: 'https://www.the-anchor.pub/heathrow-parking',
      validFrom: new Date().toISOString()
    }
  }
}

/**
 * Service, not Product.
 *
 * Parking is a service we provide, not a retail item we ship. Marking it as a
 * Product put it in Google's product-snippet report, which then asked for
 * shipping details, a return policy, reviews and ratings, none of which mean
 * anything for a car park. Flagged in tasks/gsc-audit-2026-08-17.md.
 *
 * The AggregateOffer is kept: the price range is real and comes from the live
 * rate card. `provider` replaces `brand`, which is a Product property.
 */
function buildParkingOfferSchema(rateCard: ParkingRateCard | null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Airport parking',
    name: 'Heathrow Long Stay Parking',
    description: 'Pre-book secure Heathrow airport parking at The Anchor pub with on-site hospitality and PayPal checkout.',
    provider: {
      '@type': 'LocalBusiness',
      name: 'The Anchor, Stanwell Moor'
    },
    areaServed: {
      '@type': 'Place',
      name: 'Heathrow Airport'
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'GBP',
      lowPrice: rateCard?.hourly_rate ?? 5,
      highPrice: rateCard?.weekly_rate ?? 75,
      offerCount: 20,
      availability: 'https://schema.org/LimitedAvailability'
    }
  }
}

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to book Heathrow parking at The Anchor',
  description: 'Reserve airport parking near Heathrow in minutes using The Anchor booking wizard.',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Choose your Heathrow parking times',
      text: 'Pick your arrival and departure for Terminal 2, Terminal 3, Terminal 4 or Terminal 5 and check live availability.'
    },
    {
      '@type': 'HowToStep',
      name: 'Add driver and vehicle details',
      text: 'Enter your contact number, email, and vehicle registration so our team can recognise your booking.'
    },
    {
      '@type': 'HowToStep',
      name: 'Pay securely via PayPal',
      text: 'Confirm your Heathrow parking slot, pay with PayPal or card, and receive your reference instantly.'
    }
  ]
}

export default async function HeathrowParkingPage() {
  let rateCard: ParkingRateCard | null = null
  try {
    rateCard = await anchorAPI.getParkingRates()
  } catch (error) {
    console.error('Failed to load parking rates for page', error)
  }

  const parkingFacilitySchema = buildParkingFacilitySchema(rateCard)
  const parkingOfferSchema = buildParkingOfferSchema(rateCard)

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Heathrow Parking', url: '/heathrow-parking' }
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(parkingFacilitySchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(parkingOfferSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

	      <InteriorHero
        image="/images/page-headers/parking-near-heathrow/heathrow-airport-view.jpg"
        crumb="Heathrow Parking"
        title="Heathrow Parking: Book, Pay & Park in Stanwell Moor"
        lead="Secure long stay and short stay Heathrow parking from £5 per hour. Drop your car with us in Stanwell Moor, then grab a taxi or the 442 bus to Heathrow in minutes."
        badges={
          <>
            <Badge variant="sand">PayPal checkout</Badge>
            <Badge variant="sand">24/7 access</Badge>
            <Badge variant="sand">CCTV monitored</Badge>
            <Badge variant="sand">Stanwell Moor</Badge>
          </>
        }
        actions={
          <>
            <Link href="#book-parking">
              <Button size="lg" variant="primary" fullWidth>
                Book Heathrow parking now
              </Button>
            </Link>
            <PhoneButton phone={CONTACT.phone} source="heathrow-parking_cta" variant="outline" size="lg">
              Speak to the team {CONTACT.phone}
            </PhoneButton>
          </>
        }
      />

      <section className="py-section-y bg-canvas" id="book-parking">
        <Container>
          <div className="mx-auto space-y-6">
            <SectionHeading
              kicker="Book online"
              title="Reserve & Pay for Heathrow Parking in Four Steps"
              lead="Check live availability, lock in the best long stay parking price and pay securely with PayPal, perfect for airport drop-offs, contractors and extended holidays."
            />
            <ParkingBookingWizard initialRates={rateCard} />
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Cheap Heathrow Parking Without Hidden Fees"
              lead={<>Search terms like <strong>cheap parking near Heathrow</strong>, <strong>cheap parking near Heathrow Terminal 5</strong> and <strong>cheap Heathrow airport parking</strong> all point to the same problem: official car parks keep getting pricier. Our Stanwell Moor car park keeps costs simple, publishes prices upfront and still delivers CCTV, lighting and 24/7 access.</>}
            />
            <div className="grid gap-6 md:grid-cols-3">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="text-lg font-semibold text-ink-strong">Daily price promise</h3>
                  <p className="mt-2 text-sm text-ink-muted">
                    Lock in from £15 per day or £75 per week, no surge pricing, no pre-authorisation. Pay in advance with PayPal and download instant receipts.
                  </p>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="text-lg font-semibold text-ink-strong">Terminal-specific savings</h3>
                  <p className="mt-2 text-sm text-ink-muted">
                    Beat “cheap parking near Heathrow Terminal 5/3/4/2” searches by parking once and taxiing to any terminal in 7–12 minutes.
                  </p>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="text-lg font-semibold text-ink-strong">Keep your keys, skip the upsell</h3>
                  <p className="mt-2 text-sm text-ink-muted">
                    No valet upsells or key drops. Park it yourself, keep your keys and enjoy the pub while you wait for your ride.
                  </p>
                </CardBody>
              </Card>
            </div>
            <div className="mt-8 flex flex-col items-center gap-4 md:flex-row md:justify-center">
              <Link href="#price-comparison">
                <Button variant="outline" size="lg">
                   View the Heathrow price comparison
                </Button>
              </Link>
              <Link href="#book-parking">
                <Button variant="primary" size="lg">
                   Book the cheapest Heathrow parking
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-canvas">
        <Container>
          <PageTitle className="text-center text-ink-strong" seo={{ structured: true, speakable: true }}>
            Cheap Heathrow Parking, Long Stay &amp; Short Stay from £15/day
          </PageTitle>
          <p className="mx-auto mt-4 text-center text-lg text-ink-muted">
            Travellers searching for Heathrow parking, Heathrow car parking or "long stay parking near me" choose The Anchor because we combine affordable airport-long term parking with the warmth of a real pub. Book online in minutes, grab a bite or coffee while you wait, then take a taxi or the 442 bus for a five to ten minute ride to any Heathrow terminal.
          </p>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Heathrow Airport Car Parking for Every Terminal"
              lead="If you are searching for parking Heathrow airport, Heathrow airport car parking, or parking near Heathrow, The Anchor keeps you close to Terminals 2, 3, 4 and 5 without the on-airport queues."
            />
            <div className="grid md:grid-cols-2 gap-6">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="text-lg font-semibold text-ink-strong">Terminal 5 car parking alternative</h3>
                  <p className="mt-2 text-sm text-ink-muted">
                    We are 7 minutes from T5, making us a smart option for Terminal 5 car parking without premium prices.
                  </p>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="text-lg font-semibold text-ink-strong">Terminal 2, 3 & 4 parking</h3>
                  <p className="mt-2 text-sm text-ink-muted">
                    Park once and reach Terminals 2, 3 or 4 in 10-12 minutes. Ideal for long stay, overnight or crew parking.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading title="How you get from The Anchor to Heathrow" />
            <Card accent>
              <CardBody className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-semibold text-ink-strong">Taxi or rideshare (recommended)</h3>
                    <p className="mt-2 text-sm text-ink-muted">
                      Local taxi firms reach all Heathrow terminals in around 7–12 minutes. Book in advance or ask our team on arrival. Uber and Bolt also serve our postcode TW19 6AQ, making door-to-door transfers simple.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-ink-strong">442 bus (daytime service)</h3>
                    <p className="mt-2 text-sm text-ink-muted">
                      The 442 bus stops directly outside the pub and runs to Heathrow Central Bus Station via Terminal 4 during the day. Always check the latest timetable before travelling to ensure the service fits your flight time.
                    </p>
                  </div>
                </div>
                <p className="mt-6 text-center text-sm text-ink-muted">
                  Allow extra time for your transfer and note that parking remains at The Anchor in Stanwell Moor, not within the airport boundary.
                </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <SectionHeading
            title="Why switch from Heathrow long stay car parks to The Anchor?"
            lead="Airport long term parking should not mean eye-watering prices or stressful shuttles. Our Stanwell Moor site offers straightforward Heathrow parking with hospitality perks you will not find inside the terminal."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featureHighlights.map((feature) => (
              <Card key={feature.title} accent>
                <CardBody className="p-6">
                  <h3 className="text-lg font-semibold text-ink-strong">{feature.title}</h3>
                  <p className="mt-2 text-sm text-ink-muted">{feature.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-canvas" id="price-comparison">
        <Container>
          <Card className="overflow-hidden">
            {/* Title + column headers */}
            <div className="bg-surface-sunk border-b border-line px-6 py-4">
              <p className="text-accent-text text-xl font-semibold">Heathrow Parking Price Comparison</p>
              <div className="mt-3 hidden md:grid md:grid-cols-3 gap-4 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                <span></span>
                <span>The Anchor</span>
                <span>Official Heathrow</span>
              </div>
            </div>
            <div className="divide-y divide-line">
              {comparisonRows.map(row => (
                <div key={row.label} className="grid gap-2 px-6 py-4 md:grid-cols-3 md:gap-4 md:items-center">
                  <div className="font-semibold text-ink-strong">{row.label}</div>
                  <div className="text-sm text-ink">
                    <span className="md:hidden text-accent-text font-semibold">The Anchor: </span>
                    {row.anchor}
                  </div>
                  <div className="text-sm text-ink">
                    <span className="md:hidden text-accent-text font-semibold">Official Heathrow: </span>
                    {row.heathrow}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <p className="mt-4 text-center text-xs text-ink-muted">
            Official Heathrow examples checked May 2026 from Heathrow&apos;s Terminal 5 parking pages. Always confirm live airport pricing before travel.
          </p>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <SectionHeading
            title="Directions for each Heathrow terminal"
            lead="Whether you are flying from Terminal 2, Terminal 3, Terminal 4 or Terminal 5, The Anchor is an easy base for Heathrow car parking. Park, book a taxi and be at departures faster than most official long stay shuttles."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {terminalGuides.map((guide) => (
              <Card key={guide.title} accent>
                <CardBody className="p-6">
                  <h3 className="text-lg font-semibold text-ink-strong">{guide.title}</h3>
                  <p className="mt-2 text-sm text-ink-muted">{guide.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {terminalLandingPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="rounded-md border border-line bg-surface p-5 text-left shadow-sm transition-colors hover:border-anchor-gold"
              >
                <h3 className="text-lg font-semibold text-ink-strong">{page.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{page.description}</p>
                <p className="mt-3 text-sm font-semibold text-accent-text">Open terminal guide</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="font-display text-h2 text-ink-strong">Airport long term parking with pub-level perks</h2>
              <p className="mt-4 text-ink-muted">
                Choose The Anchor when you need reliable Heathrow long stay parking at fair prices. Travellers Googling "cheap long term parking", "long term parking near me" or "airport long term parking rates" land here because we keep pricing transparent and pair it with real hospitality. We welcome airport crew, business travellers, families and jet-setters who prefer relaxed departures. Enjoy hot food, barista coffee, speedy Wi-Fi and restrooms before you head to Heathrow, all while your car stays in a CCTV-covered, well-lit village setting outside the ULEZ. Arrange your own taxi or use the 442 bus once you've parked.
              </p>
              <ul className="mt-4 space-y-2 text-ink-muted">
                <li>• Flexible booking windows, from four hours to 30 days</li>
                <li>• PayPal receipts for expenses and insurance</li>
                <li>• Easy access from M25 Junction 14 and the A3044</li>
                <li>• Optional overnight pub stays for early flights</li>
              </ul>
            </div>
            <Card accent>
              <CardBody className="p-6">
                <h3 className="font-display text-h3 text-ink-strong">Quick Heathrow parking checklist</h3>
                <ol className="mt-4 space-y-3 text-ink-muted">
                  <li><strong>1.</strong> Book online and pay with PayPal or card.</li>
                  <li><strong>2.</strong> Receive confirmation by SMS and email.</li>
                  <li><strong>3.</strong> Park at The Anchor and pop in for refreshments.</li>
                  <li><strong>4.</strong> Taxi or rideshare to your terminal in 7–12 minutes.</li>
                </ol>
                <p className="mt-4 text-sm text-ink-muted">
                  Tip: add 20 minutes cushion before your Heathrow check-in time to enjoy a relaxed meal or coffee with us, plus another 15 minutes for your taxi or bus transfer.
                </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema title="Heathrow parking FAQs" faqs={faqs(rateCard)} />

      <section className="py-section-y bg-surface" id="parking-terms">
        <Container>
          <div className="mx-auto">
            <h2 className="font-display text-h2 text-ink-strong text-center">Parking Terms &amp; Conditions</h2>
            <p className="mt-2 text-sm text-ink-muted text-center">Last updated March 2026</p>
            <div className="mt-8 space-y-6 text-sm text-ink-muted">

              <div>
                <h3 className="font-semibold text-ink-strong">1. Owner&apos;s risk</h3>
                <p className="mt-1">All vehicles are parked entirely at the owner&apos;s risk. The Anchor accepts no liability for loss of or damage to any vehicle or its contents whilst on the premises, except where such loss or damage results from our proven negligence.</p>
              </div>

              <div>
                <h3 className="font-semibold text-ink-strong">2. Booking required</h3>
                <p className="mt-1">The car park is reserved exclusively for customers who hold a confirmed, paid booking. Vehicles parked without a valid booking may be removed at the owner&apos;s expense.</p>
              </div>

              <div>
                <h3 className="font-semibold text-ink-strong">3. Arrival, access &amp; departure</h3>
                <p className="mt-1">You must arrive and depart within the times stated in your booking. If your plans change, please contact us as soon as possible on <PhoneLink phone={CONTACT.phone} source="heathrow-parking_terms" className="underline" showIcon={false} /> or at <a href="mailto:manager@the-anchor.pub" className="underline">manager@the-anchor.pub</a>. Overstaying your booked period may incur additional charges at the prevailing hourly rate.</p>
              </div>

              <div>
                <h3 className="font-semibold text-ink-strong">4. Vehicle condition</h3>
                <p className="mt-1">We reserve the right to refuse entry to any vehicle that is leaking fluids or is in a condition likely to cause damage to the car park or other vehicles. All vehicles must comply with current road-legal requirements.</p>
              </div>

              <div>
                <h3 className="font-semibold text-ink-strong">5. Refunds &amp; cancellations</h3>
                <p className="mt-1">You may cancel or amend your booking up to 24 hours before your booked arrival time. Cancellations made with at least 24 hours&apos; notice will receive a full refund of the amount paid, minus any card processing fees charged by PayPal or our payment provider at the time of your original transaction.</p>
                <p className="mt-2">Cancellations made within 24 hours of your booked arrival time are non-refundable, except at our discretion in cases of documented emergency. To request a refund, email <a href="mailto:manager@the-anchor.pub" className="underline">manager@the-anchor.pub</a> with your booking reference.</p>
              </div>

              <div>
                <h3 className="font-semibold text-ink-strong">6. CCTV &amp; data protection</h3>
                <p className="mt-1">The car park is monitored by closed-circuit television (CCTV) for security purposes. CCTV footage is stored securely and is not routinely monitored or shared. In accordance with the UK GDPR, footage will only be made available to the police upon receipt of a formal written request as part of a lawful investigation. We do not provide footage to individuals or private parties.</p>
              </div>

              <div>
                <h3 className="font-semibold text-ink-strong">7. Compliance</h3>
                <p className="mt-1">By using our car park you agree to follow any reasonable instructions given by The Anchor team, to park considerately and not to obstruct other vehicles or emergency access routes.</p>
              </div>

              <div>
                <h3 className="font-semibold text-ink-strong">8. Contact</h3>
                <p className="mt-1">For any queries relating to your booking or these terms, please contact us at <a href="mailto:manager@the-anchor.pub" className="underline">manager@the-anchor.pub</a> or call <PhoneLink phone={CONTACT.phone} source="heathrow-parking_contact" className="underline" showIcon={false} />.</p>
              </div>

            </div>
          </div>
        </Container>
      </section>

      <ReviewSection
        title="Trusted by Heathrow travellers"
        subtitle="Real customer reviews from guests who park and fly from The Anchor."
        layout="carousel"
        filter={{ minRating: 4, limit: 6 }}
        background="dark"
      />

      <OrganicSearchClusterLinks
        cluster="heathrowParking"
        currentPath="/heathrow-parking"
        title="Compare parking and terminal guides"
        intro="Use the comparison guide and terminal pages to choose the best parking route before you book."
      />

      <CtaBand
        title="Ready to lock in Heathrow airport parking?"
        copy="Tap the button to reserve and pay now, or call our Stanwell Moor team if you need a bespoke long stay parking package. Remember you will need to organise your own transfer (taxi or 442 bus), keep your keys and understand parking is left at the owner's risk."
      >
        <Link href="#book-parking">
          <Button variant="primary" size="lg">Book Heathrow parking</Button>
        </Link>
        <PhoneButton phone={CONTACT.phone} source="heathrow_parking_cta" variant="outline" size="lg">
          Call {CONTACT.phone}
        </PhoneButton>
      </CtaBand>
    </>
  )
}
