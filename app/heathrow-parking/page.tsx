import type { Metadata } from 'next'
import Link from 'next/link'
import { HeroWrapper } from '@/components/hero'
import { Button, Container, Section, FeatureGrid, CTASection } from '@/components/ui'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { ParkingBookingWizard } from '@/components/features/ParkingBookingWizard'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { ReviewSection } from '@/components/reviews'
import { DEFAULT_PARKING_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { anchorAPI, ParkingRateCard } from '@/lib/api'

const formatRate = (value: number | null | undefined, fallback: string) =>
  typeof value === 'number' && Number.isFinite(value) ? value.toFixed(2) : fallback

export const metadata: Metadata = {
  title: 'Cheap Heathrow Parking from £15/day | 7 Mins to T5',
  description: 'Cheap Heathrow parking from £15/day or £75/week — save up to 60% vs official Heathrow car parks. CCTV, keep your keys, 7 mins to T5. The Anchor, Stanwell Moor.',
  openGraph: {
    title: 'Cheap Heathrow Parking from £15/day | 7 Mins to T5 | Park & Eat | The Anchor',
    description: 'Cheap Heathrow parking from £15/day or £75/week — save up to 60% vs official Heathrow car parks. CCTV, keep your keys, 7 mins to T5. The Anchor, Stanwell Moor.',
    images: [{ url: DEFAULT_PARKING_IMAGE, width: 1200, height: 630, alt: 'Free parking at The Anchor pub near Heathrow Airport' }],
    url: 'https://www.the-anchor.pub/heathrow-parking'
  },
  twitter: getTwitterMetadata({
    title: 'Cheap Heathrow Parking from £15/day | 7 Mins to T5 | Park & Eat | The Anchor',
    description: 'Cheap Heathrow parking from £15/day or £75/week — save up to 60% vs official Heathrow car parks. CCTV, keep your keys, 7 mins to T5. The Anchor, Stanwell Moor.',
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
    description: 'Grab a Sunday roast, a coffee or a quiet working lunch before you head to the terminal – parking customers are welcome in the pub.'
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
    description: 'Drive 12 minutes door-to-door. No shuttle buses, no ticket barriers – just reserve online and go straight to departures.'
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
    label: 'Price for 24 hours',
    anchor: '£15 with us (daily rate)',
    heathrow: '£39 at Heathrow short stay'
  },
  {
    label: 'Price for 1 week',
    anchor: '£75 with us (weekly rate)',
    heathrow: '£118-£140 Heathrow long stay'
  },
  {
    label: 'Price for 2 weeks',
    anchor: '£140 with us (weekly x2 minus loyalty credit)',
    heathrow: '£216-£260 Heathrow official car parks'
  },
  {
    label: 'Distance to terminals',
    anchor: '3.8 miles to T5 · 5.3 miles to T3',
    heathrow: 'On-airport but requires shuttle waits'
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
	    question: 'Is The Anchor cheaper than Heathrow long stay parking?',
	    answer: `Yes – our daily rate is £${daily} compared to Heathrow short stay at £39 and long stay often £118+ per week. The price comparison table shows real-world savings for 24 hours, one week and two weeks of parking.`
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
	    priceRange: rateCard
	      ? `£${formatRate(rateCard.hourly_rate, '5.00')}-£${formatRate(rateCard.daily_rate, '39.00')} per day`
	      : '£5-£39 per day',
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

function buildParkingOfferSchema(rateCard: ParkingRateCard | null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Heathrow Long Stay Parking',
    description: 'Pre-book secure Heathrow airport parking at The Anchor pub with on-site hospitality and PayPal checkout.',
    brand: {
      '@type': 'Brand',
      name: 'The Anchor – Stanwell Moor'
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

	      <HeroWrapper
	        route="/heathrow-parking"
	        title="Heathrow Parking – Book, Pay & Park in Stanwell Moor"
	        description="Secure long stay and short stay Heathrow parking from £5 per hour. Drop your car with us in Stanwell Moor, then grab a taxi or the 442 bus to Heathrow in minutes."
	        variant="default"
        tags={[
          { label: ' PayPal checkout', variant: 'primary' },
          { label: ' 24/7 access', variant: 'success' },
          { label: ' CCTV monitored', variant: 'default' },
          { label: ' Stanwell Moor', variant: 'warning' }
        ]}
        primaryCta={
          <Link href="#book-parking" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" fullWidth className="sm:w-auto">
               Book Heathrow parking now
            </Button>
          </Link>
        }
        secondaryCta={
          <Link href="tel:+441753682707" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" fullWidth className="sm:w-auto">
               Speak to the team 01753 682707
            </Button>
          </Link>
        }
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

      <Section background="dark" spacing="lg" id="book-parking">
        <Container>
          <div className="mx-auto max-w-5xl space-y-6">
            <h2 className="text-3xl font-bold text-anchor-cream-text text-center">
              Reserve & Pay for Heathrow Parking in Four Steps
            </h2>
            <p className="text-center text-anchor-cream-text/70">
              Check live availability, lock in the best long stay parking price and pay securely with PayPal – perfect for airport drop-offs, contractors and extended holidays.
            </p>
            <ParkingBookingWizard initialRates={rateCard} />
          </div>
        </Container>
      </Section>

      <Section background="dark" spacing="lg">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-anchor-cream-text text-center">
              Cheap Heathrow Parking Without Hidden Fees
            </h2>
            <p className="mt-4 text-center text-lg text-anchor-cream-text/70">
              Search terms like <strong>cheap parking near Heathrow</strong>, <strong>cheap parking near Heathrow Terminal 5</strong> and <strong>cheap Heathrow airport parking</strong> all point to the same problem: official car parks keep getting pricier. Our Stanwell Moor car park keeps costs simple, publishes prices upfront and still delivers CCTV, lighting and 24/7 access.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl bg-anchor-bg-raised p-6 border border-anchor-gold/15">
	                <h3 className="text-lg font-semibold text-anchor-cream-text">Daily price promise</h3>
	                <p className="mt-2 text-sm text-anchor-cream-text/70">
	                  Lock in from £15 per day or £75 per week – no surge pricing, no pre-authorisation. Pay in advance with PayPal and download instant receipts.
	                </p>
              </div>
              <div className="rounded-2xl bg-anchor-bg-raised p-6 border border-anchor-gold/15">
                <h3 className="text-lg font-semibold text-anchor-cream-text">Terminal-specific savings</h3>
                <p className="mt-2 text-sm text-anchor-cream-text/70">
                  Beat “cheap parking near Heathrow Terminal 5/3/4/2” searches by parking once and taxiing to any terminal in 7–12 minutes.
                </p>
              </div>
              <div className="rounded-2xl bg-anchor-bg-raised p-6 border border-anchor-gold/15">
                <h3 className="text-lg font-semibold text-anchor-cream-text">Keep your keys, skip the upsell</h3>
                <p className="mt-2 text-sm text-anchor-cream-text/70">
                  No valet upsells or key drops. Park it yourself, keep your keys and enjoy the pub while you wait for your ride.
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-col items-center gap-4 md:flex-row md:justify-center">
              <Link href="#price-comparison">
                <Button variant="secondary" size="lg">
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
      </Section>

      <Section background="dark" spacing="md">
        <Container>
          <PageTitle className="text-center text-anchor-cream-text" seo={{ structured: true, speakable: true }}>
            Cheap Heathrow Parking — Long Stay &amp; Short Stay from £15/day
          </PageTitle>
          <p className="mx-auto mt-4 max-w-4xl text-center text-lg text-anchor-cream-text/70">
            Travellers searching for Heathrow parking, Heathrow car parking or "long stay parking near me" choose The Anchor because we combine affordable airport-long term parking with the warmth of a real pub. Book online in minutes, grab a bite or coffee while you wait, then take a taxi or the 442 bus for a five to ten minute ride to any Heathrow terminal.
          </p>
        </Container>
      </Section>

      <Section background="dark" spacing="md">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl p-6 bg-anchor-bg-raised border border-anchor-gold/15">
            <h2 className="text-2xl font-bold text-anchor-cream-text text-center">
              Heathrow Airport Car Parking for Every Terminal
            </h2>
            <p className="mt-4 text-center text-anchor-cream-text/70">
              If you are searching for parking Heathrow airport, Heathrow airport car parking, or parking near Heathrow,
              The Anchor keeps you close to Terminals 2, 3, 4 and 5 without the on-airport queues.
            </p>
            <div className="grid md:grid-cols-2 mt-4 gap-4">
              <div className="rounded-xl p-4 bg-anchor-bg-raised border border-anchor-gold/15">
                <h3 className="text-lg font-semibold text-anchor-cream-text">Terminal 5 car parking alternative</h3>
                <p className="mt-2 text-sm text-anchor-cream-text/70">
                  We are 7 minutes from T5, making us a smart option for Terminal 5 car parking without premium prices.
                </p>
              </div>
              <div className="rounded-xl p-4 bg-anchor-bg-raised border border-anchor-gold/15">
                <h3 className="text-lg font-semibold text-anchor-cream-text">Terminal 2, 3 & 4 parking</h3>
                <p className="mt-2 text-sm text-anchor-cream-text/70">
                  Park once and reach Terminals 2, 3 or 4 in 10-12 minutes. Ideal for long stay, overnight or crew parking.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="dark" spacing="lg">
        <Container>
          <div className="mx-auto max-w-4xl rounded-2xl border border-anchor-gold/15 bg-anchor-bg-raised p-6">
            <h2 className="text-2xl font-bold text-anchor-cream-text text-center">How you get from The Anchor to Heathrow</h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-anchor-cream-text">Taxi or rideshare (recommended)</h3>
                <p className="mt-2 text-sm text-anchor-cream-text/70">
                  Local taxi firms reach all Heathrow terminals in around 7–12 minutes. Book in advance or ask our team on arrival. Uber and Bolt also serve our postcode TW19 6AQ, making door-to-door transfers simple.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-anchor-cream-text">442 bus (daytime service)</h3>
                <p className="mt-2 text-sm text-anchor-cream-text/70">
                  The 442 bus stops directly outside the pub and runs to Heathrow Central Bus Station via Terminal 4 during the day. Always check the latest timetable before travelling to ensure the service fits your flight time.
                </p>
              </div>
            </div>
            <p className="mt-6 text-center text-sm text-anchor-cream-text/55">
              Allow extra time for your transfer and note that parking remains at The Anchor in Stanwell Moor, not within the airport boundary.
            </p>
          </div>
        </Container>
      </Section>

      <Section background="dark" spacing="lg">
        <Container>
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-bold text-anchor-cream-text">
              Why switch from Heathrow long stay car parks to The Anchor?
            </h2>
            <p className="mt-4 text-lg text-anchor-cream-text/70">
              Airport long term parking should not mean eye-watering prices or stressful shuttles. Our Stanwell Moor site offers straightforward Heathrow parking with hospitality perks you will not find inside the terminal.
            </p>
          </div>
          <div className="mt-10">
            <FeatureGrid features={featureHighlights} columns={4} />
          </div>
        </Container>
      </Section>

      <Section background="dark" spacing="lg" id="price-comparison">
        <Container>
          <div className="overflow-hidden rounded-2xl border border-anchor-gold/15">
            {/* Title + column headers */}
            <div className="bg-anchor-bg-raised border-b border-anchor-gold/30 px-6 py-4">
              <p className="text-anchor-gold-vivid text-xl font-semibold">Heathrow Parking Price Comparison</p>
              <div className="mt-3 hidden md:grid md:grid-cols-3 gap-4 text-xs font-semibold uppercase tracking-wider text-anchor-cream-text/50">
                <span></span>
                <span>The Anchor</span>
                <span>Official Heathrow</span>
              </div>
            </div>
            <div className="divide-y divide-anchor-gold/15 bg-anchor-bg-card">
              {comparisonRows.map(row => (
                <div key={row.label} className="grid gap-2 px-6 py-4 md:grid-cols-3 md:gap-4 md:items-center">
                  <div className="font-semibold text-anchor-cream-text">{row.label}</div>
                  <div className="text-sm text-anchor-cream-text/80">
                    <span className="md:hidden text-anchor-gold-vivid font-semibold">The Anchor: </span>
                    {row.anchor}
                  </div>
                  <div className="text-sm text-anchor-cream-text/80">
                    <span className="md:hidden text-anchor-gold-vivid font-semibold">Official Heathrow: </span>
                    {row.heathrow}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section background="dark" spacing="lg">
        <Container>
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-bold text-anchor-cream-text">Directions for each Heathrow terminal</h2>
            <p className="mt-4 text-lg text-anchor-cream-text/70">
              Whether you are flying from Terminal 2, Terminal 3, Terminal 4 or Terminal 5, The Anchor is an easy base for Heathrow car parking. Park, book a taxi and be at departures faster than most official long stay shuttles.
            </p>
          </div>
          <div className="mt-10">
            <FeatureGrid features={terminalGuides} columns={4} />
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {terminalLandingPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="rounded-xl border border-anchor-gold/15 bg-anchor-bg-raised p-5 text-left transition-colors hover:border-anchor-gold"
              >
                <h3 className="text-lg font-semibold text-anchor-cream-text">{page.title}</h3>
                <p className="mt-2 text-sm text-anchor-cream-text/70">{page.description}</p>
                <p className="mt-3 text-sm font-semibold text-anchor-gold">Open terminal guide</p>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="dark" spacing="lg">
        <Container>
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-bold text-anchor-cream-text">Airport long term parking with pub-level perks</h2>
              <p className="mt-4 text-anchor-cream-text/70">
                Choose The Anchor when you need reliable Heathrow long stay parking at fair prices. Travellers Googling "cheap long term parking", "long term parking near me" or "airport long term parking rates" land here because we keep pricing transparent and pair it with real hospitality. We welcome airport crew, business travellers, families and jet-setters who prefer relaxed departures. Enjoy hot food, barista coffee, speedy Wi-Fi and restrooms before you head to Heathrow – all while your car stays in a CCTV-covered, well-lit village setting outside the ULEZ. Arrange your own taxi or use the 442 bus once you've parked.
              </p>
              <ul className="mt-4 space-y-2 text-anchor-cream-text/70">
                <li>• Flexible booking windows – from four hours to 30 days</li>
                <li>• PayPal receipts for expenses and insurance</li>
                <li>• Easy access from M25 Junction 14 and the A3044</li>
                <li>• Optional overnight pub stays for early flights</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-anchor-bg-raised border border-anchor-gold/15 p-6">
              <h3 className="text-2xl font-semibold text-anchor-cream-text">Quick Heathrow parking checklist</h3>
              <ol className="mt-4 space-y-3 text-anchor-cream-text/70">
                <li><strong>1.</strong> Book online and pay with PayPal or card.</li>
                <li><strong>2.</strong> Receive confirmation by SMS and email.</li>
                <li><strong>3.</strong> Park at The Anchor and pop in for refreshments.</li>
                <li><strong>4.</strong> Taxi or rideshare to your terminal in 7–12 minutes.</li>
              </ol>
              <p className="mt-4 text-sm text-anchor-cream-text/55">
                Tip: add 20 minutes cushion before your Heathrow check-in time to enjoy a relaxed meal or coffee with us, plus another 15 minutes for your taxi or bus transfer.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <FAQAccordionWithSchema title="Heathrow parking FAQs" faqs={faqs(rateCard)} />

      <Section background="dark" spacing="lg" id="parking-terms">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-anchor-cream-text text-center">Parking Terms &amp; Conditions</h2>
            <p className="mt-2 text-sm text-anchor-cream-text/55 text-center">Last updated March 2026</p>
            <div className="mt-8 space-y-6 text-sm text-anchor-cream-text/70">

              <div>
                <h3 className="font-semibold text-anchor-cream-text">1. Owner&apos;s risk</h3>
                <p className="mt-1">All vehicles are parked entirely at the owner&apos;s risk. The Anchor accepts no liability for loss of or damage to any vehicle or its contents whilst on the premises, except where such loss or damage results from our proven negligence.</p>
              </div>

              <div>
                <h3 className="font-semibold text-anchor-cream-text">2. Booking required</h3>
                <p className="mt-1">The car park is reserved exclusively for customers who hold a confirmed, paid booking. Vehicles parked without a valid booking may be removed at the owner&apos;s expense.</p>
              </div>

              <div>
                <h3 className="font-semibold text-anchor-cream-text">3. Arrival, access &amp; departure</h3>
                <p className="mt-1">You must arrive and depart within the times stated in your booking. If your plans change, please contact us as soon as possible on <a href="tel:01753682707" className="underline">01753 682707</a> or at <a href="mailto:manager@the-anchor.pub" className="underline">manager@the-anchor.pub</a>. Overstaying your booked period may incur additional charges at the prevailing hourly rate.</p>
              </div>

              <div>
                <h3 className="font-semibold text-anchor-cream-text">4. Vehicle condition</h3>
                <p className="mt-1">We reserve the right to refuse entry to any vehicle that is leaking fluids or is in a condition likely to cause damage to the car park or other vehicles. All vehicles must comply with current road-legal requirements.</p>
              </div>

              <div>
                <h3 className="font-semibold text-anchor-cream-text">5. Refunds &amp; cancellations</h3>
                <p className="mt-1">You may cancel or amend your booking up to 24 hours before your booked arrival time. Cancellations made with at least 24 hours&apos; notice will receive a full refund of the amount paid, minus any card processing fees charged by PayPal or our payment provider at the time of your original transaction.</p>
                <p className="mt-2">Cancellations made within 24 hours of your booked arrival time are non-refundable, except at our discretion in cases of documented emergency. To request a refund, email <a href="mailto:manager@the-anchor.pub" className="underline">manager@the-anchor.pub</a> with your booking reference.</p>
              </div>

              <div>
                <h3 className="font-semibold text-anchor-cream-text">6. CCTV &amp; data protection</h3>
                <p className="mt-1">The car park is monitored by closed-circuit television (CCTV) for security purposes. CCTV footage is stored securely and is not routinely monitored or shared. In accordance with the UK GDPR, footage will only be made available to the police upon receipt of a formal written request as part of a lawful investigation. We do not provide footage to individuals or private parties.</p>
              </div>

              <div>
                <h3 className="font-semibold text-anchor-cream-text">7. Compliance</h3>
                <p className="mt-1">By using our car park you agree to follow any reasonable instructions given by The Anchor team, to park considerately and not to obstruct other vehicles or emergency access routes.</p>
              </div>

              <div>
                <h3 className="font-semibold text-anchor-cream-text">8. Contact</h3>
                <p className="mt-1">For any queries relating to your booking or these terms, please contact us at <a href="mailto:manager@the-anchor.pub" className="underline">manager@the-anchor.pub</a> or call <a href="tel:01753682707" className="underline">01753 682707</a>.</p>
              </div>

            </div>
          </div>
        </Container>
      </Section>

      <ReviewSection
        title="Trusted by Heathrow travellers"
        subtitle="Real customer reviews from guests who park and fly from The Anchor."
        layout="carousel"
        filter={{ minRating: 4, limit: 6 }}
        background="dark"
      />

      <CTASection
        title="Ready to lock in Heathrow airport parking?"
        description="Tap the button to reserve and pay now, or call our Stanwell Moor team if you need a bespoke long stay parking package. Remember you will need to organise your own transfer (taxi or 442 bus), keep your keys and understand parking is left at the owner's risk."
        buttons={[
          {
            text: 'Book Heathrow parking',
            href: '#book-parking',
            variant: 'white'
          },
          {
            text: 'Call 01753 682707',
            href: 'tel:+441753682707',
            isPhone: true,
            variant: 'secondary',
            phoneSource: 'heathrow_parking_cta'
          }
        ]}
      />
    </>
  )
}
