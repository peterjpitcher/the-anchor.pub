import type { Metadata } from 'next'
import Link from 'next/link'
import { HeroWrapper } from '@/components/hero'
import { Button, Container, Section, FeatureGrid, CTASection } from '@/components/ui'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { ParkingBookingWizard } from '@/components/features/ParkingBookingWizard'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DEFAULT_PARKING_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { anchorAPI, ParkingRateCard } from '@/lib/api'

const formatRate = (value: number | null | undefined, fallback: string) =>
  typeof value === 'number' && Number.isFinite(value) ? value.toFixed(2) : fallback

export const metadata: Metadata = {
  title: 'Heathrow Parking | Secure Long Stay & Short Stay at The Anchor',
  description: 'Book Heathrow airport parking from £5 per hour or £15 per day. Secure paid parking near Terminals 2-5 with PayPal checkout, CCTV and on-site pub hospitality.',
  keywords: 'heathrow parking, heathrow car parking, heathrow airport car parking, parking heathrow airport, parking near heathrow, long stay parking heathrow, terminal 5 car parking, parking at terminal 5 heathrow, terminal 3 car parking, terminal 2 car parking, terminal 4 car parking, airport long term parking, cheap heathrow parking, long stay parking near me',
  openGraph: {
    title: 'Heathrow Parking – Pre-book & Pay at The Anchor',
    description: 'Reserve secure Heathrow airport parking 7 minutes from Terminal 5. PayPal checkout, CCTV, flexible long stay and short stay options.',
    images: [DEFAULT_PARKING_IMAGE],
    url: 'https://www.the-anchor.pub/heathrow-parking'
  },
  twitter: getTwitterMetadata({
    title: 'Heathrow Parking – Pre-book & Pay at The Anchor',
    description: 'Secure Heathrow airport parking with PayPal checkout. Flexible hourly, daily and long stay options.',
    images: [DEFAULT_PARKING_IMAGE]
  }),
  alternates: {
    canonical: '/heathrow-parking'
  }
}

const featureHighlights = [
  {
    icon: '✈️',
    title: '7 minutes to Heathrow Terminal 5',
    description: 'Skip multi-storey queues. We sit on Horton Road in Stanwell Moor, less than four miles from T5 and under 12 minutes from Terminals 2, 3 and 4.'
  },
  {
    icon: '💸',
    title: 'Airport-long stay rates without airport stress',
    description: 'Hourly, daily, weekly and monthly pricing that undercuts Heathrow long stay car parks and private meet-and-greet operators.'
  },
  {
    icon: '🛡️',
    title: 'Secure CCTV & lighting all night',
    description: 'Our car park is floodlit, covered by cameras and overseen by the pub team late into the evening for peace of mind.'
  },
  {
    icon: '🍽️',
    title: 'Stay for a meal or coffee pre-flight',
    description: 'Grab breakfast, a Sunday roast or a quiet working lunch before you head to the terminal – parking customers are welcome in the pub.'
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
    name: 'Heathrow Parking at The Anchor Pub',
    description: 'Secure long stay and short stay Heathrow airport parking with PayPal checkout, CCTV, lighting and on-site hospitality in Stanwell Moor.',
    image: 'https://www.the-anchor.pub/images/page-headers/parking-near-heathrow/Heathrow.jpg',
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
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59'
      }
    ],
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
      name: 'The Anchor Pub – Stanwell Moor'
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
          { label: '💳 PayPal checkout', variant: 'primary' },
          { label: '🕗 24/7 access', variant: 'success' },
          { label: '🚘 CCTV monitored', variant: 'default' },
          { label: '📍 Stanwell Moor', variant: 'warning' }
        ]}
        primaryCta={
          <Link href="#book-parking" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" fullWidth className="sm:w-auto">
              🚗 Book Heathrow parking now
            </Button>
          </Link>
        }
        secondaryCta={
          <Link href="tel:+441753682707" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" fullWidth className="sm:w-auto">
              ☎️ Speak to the team 01753 682707
            </Button>
          </Link>
        }
        secondaryInfo={
          <div className="mt-6 max-w-3xl mx-auto rounded-xl bg-white/90 p-4 text-center text-anchor-charcoal backdrop-blur-sm">
            <p className="font-semibold">
              Swap £39 Heathrow short stay for £15 per day with us. Ideal for Terminal 3 long stay passengers, Terminal 5 flyers, cabin crew and airport staff.
            </p>
            <p className="mt-3 text-sm text-gray-700">
              We are not inside the airport. Park at The Anchor in Stanwell Moor, then take a taxi or the daytime 442 bus from outside the pub. Vehicles stay at the owner&apos;s risk and drivers keep their keys.
            </p>
          </div>
        }
      />

      <Section background="white" spacing="lg">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-anchor-green text-center">
              Cheap Heathrow Parking Without Hidden Fees
            </h2>
            <p className="mt-4 text-center text-lg text-gray-700">
              Search terms like <strong>cheap parking near Heathrow</strong>, <strong>cheap parking near Heathrow Terminal 5</strong> and <strong>cheap Heathrow airport parking</strong> all point to the same problem: official car parks keep getting pricier. Our Stanwell Moor car park keeps costs simple, publishes prices upfront and still delivers CCTV, lighting and 24/7 access.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl bg-anchor-cream/50 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-anchor-charcoal">Daily price promise</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Lock in from £15 per day or £75 per week – no surge pricing, no pre-authorisation. Pay in advance with PayPal and download instant receipts.
                </p>
              </div>
              <div className="rounded-2xl bg-anchor-cream/50 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-anchor-charcoal">Terminal-specific savings</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Beat “cheap parking near Heathrow Terminal 5/3/4/2” searches by parking once and taxiing to any terminal in 7–12 minutes.
                </p>
              </div>
              <div className="rounded-2xl bg-anchor-cream/50 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-anchor-charcoal">Keep your keys, skip the upsell</h3>
                <p className="mt-2 text-sm text-gray-700">
                  No valet upsells or key drops. Park it yourself, keep your keys and enjoy the pub while you wait for your ride.
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-col items-center gap-4 md:flex-row md:justify-center">
              <Link href="#price-comparison">
                <Button variant="secondary" size="lg">
                  📉 View the Heathrow price comparison
                </Button>
              </Link>
              <Link href="#book-parking">
                <Button variant="primary" size="lg">
                  🚗 Book the cheapest Heathrow parking
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="md">
        <Container>
          <PageTitle className="text-center text-anchor-green" seo={{ structured: true, speakable: true }}>
            Heathrow Airport Parking Made Simple – Long Stay, Short Stay, Crew Parking
          </PageTitle>
          <p className="mx-auto mt-4 max-w-4xl text-center text-lg text-gray-700">
            Travellers searching for Heathrow parking, Heathrow car parking or "long stay parking near me" choose The Anchor because we combine affordable airport-long term parking with the warmth of a real pub. Book online in minutes, grab a bite or coffee while you wait, then take a taxi or the 442 bus for a five to ten minute ride to any Heathrow terminal.
          </p>
        </Container>
      </Section>

      <Section background="white" spacing="md">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl p-6 bg-anchor-cream/40 shadow-sm">
            <h2 className="text-2xl font-bold text-anchor-green text-center">
              Heathrow Airport Car Parking for Every Terminal
            </h2>
            <p className="mt-4 text-center text-gray-700">
              If you are searching for parking Heathrow airport, Heathrow airport car parking, or parking near Heathrow,
              The Anchor keeps you close to Terminals 2, 3, 4 and 5 without the on-airport queues.
            </p>
            <div className="grid md:grid-cols-2 mt-4 gap-4">
              <div className="rounded-xl p-4 bg-white">
                <h3 className="text-lg font-semibold text-anchor-charcoal">Terminal 5 car parking alternative</h3>
                <p className="mt-2 text-sm text-gray-700">
                  We are 7 minutes from T5, making us a smart option for Terminal 5 car parking without premium prices.
                </p>
              </div>
              <div className="rounded-xl p-4 bg-white">
                <h3 className="text-lg font-semibold text-anchor-charcoal">Terminal 2, 3 & 4 parking</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Park once and reach Terminals 2, 3 or 4 in 10-12 minutes. Ideal for long stay, overnight or crew parking.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="lg">
        <Container>
          <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-2xl font-bold text-anchor-green text-center">How you get from The Anchor to Heathrow</h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-anchor-charcoal">Taxi or rideshare (recommended)</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Local taxi firms reach all Heathrow terminals in around 7–12 minutes. Book in advance or ask our team on arrival. Uber and Bolt also serve our postcode TW19 6AQ, making door-to-door transfers simple.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-anchor-charcoal">442 bus (daytime service)</h3>
                <p className="mt-2 text-sm text-gray-700">
                  The 442 bus stops directly outside the pub and runs to Heathrow Central Bus Station via Terminal 4 during the day. Always check the latest timetable before travelling to ensure the service fits your flight time.
                </p>
              </div>
            </div>
            <p className="mt-6 text-center text-sm text-gray-600">
              Allow extra time for your transfer and note that parking remains at The Anchor in Stanwell Moor, not within the airport boundary.
            </p>
          </div>
        </Container>
      </Section>

      <Section background="gray" spacing="lg" id="book-parking">
        <Container>
          <div className="mx-auto max-w-5xl space-y-6">
            <h2 className="text-3xl font-bold text-anchor-green text-center">
              Reserve & Pay for Heathrow Parking in Four Steps
            </h2>
            <p className="text-center text-gray-700">
              Check live availability, lock in the best long stay parking price and pay securely with PayPal – perfect for airport drop-offs, contractors and extended holidays.
            </p>
            <ParkingBookingWizard initialRates={rateCard} />
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="lg">
        <Container>
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-bold text-anchor-green">
              Why switch from Heathrow long stay car parks to The Anchor?
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              Airport long term parking should not mean eye-watering prices or stressful shuttles. Our Stanwell Moor site offers straightforward Heathrow parking with hospitality perks you will not find inside the terminal.
            </p>
          </div>
          <div className="mt-10">
            <FeatureGrid features={featureHighlights} columns={4} />
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="lg" id="price-comparison">
        <Container>
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <div className="bg-anchor-green px-6 py-4 text-white text-xl font-semibold">
              Heathrow Parking Price Comparison
            </div>
            <div className="divide-y divide-gray-200 bg-white">
              {comparisonRows.map(row => (
                <div key={row.label} className="grid gap-4 px-6 py-4 md:grid-cols-[2fr,1fr,1fr] items-center">
                  <div className="font-semibold text-anchor-charcoal">{row.label}</div>
                  <div className="text-sm text-green-700">
                    <strong>The Anchor Heathrow parking:</strong> {row.anchor}
                  </div>
                  <div className="text-sm text-red-600">
                    <strong>Official Heathrow:</strong> {row.heathrow}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section background="gray" spacing="lg">
        <Container>
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-bold text-anchor-green">Directions for each Heathrow terminal</h2>
            <p className="mt-4 text-lg text-gray-700">
              Whether you are flying from Terminal 2, Terminal 3, Terminal 4 or Terminal 5, The Anchor is an easy base for Heathrow car parking. Park, book a taxi and be at departures faster than most official long stay shuttles.
            </p>
          </div>
          <div className="mt-10">
            <FeatureGrid features={terminalGuides} columns={4} />
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="lg">
        <Container>
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-bold text-anchor-green">Airport long term parking with pub-level perks</h2>
              <p className="mt-4 text-gray-700">
                Choose The Anchor when you need reliable Heathrow long stay parking at fair prices. Travellers Googling "cheap long term parking", "long term parking near me" or "airport long term parking rates" land here because we keep pricing transparent and pair it with real hospitality. We welcome airport crew, business travellers, families and jet-setters who prefer relaxed departures. Enjoy hot food, barista coffee, speedy Wi-Fi and restrooms before you head to Heathrow – all while your car stays in a CCTV-covered, well-lit village setting outside the ULEZ. Arrange your own taxi or use the 442 bus once you've parked.
              </p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li>• Flexible booking windows – from four hours to 30 days</li>
                <li>• PayPal receipts for expenses and insurance</li>
                <li>• Easy access from M25 Junction 14 and the A3044</li>
                <li>• Optional overnight pub stays for early flights</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-anchor-cream p-6 shadow-sm">
              <h3 className="text-2xl font-semibold text-anchor-charcoal">Quick Heathrow parking checklist</h3>
              <ol className="mt-4 space-y-3 text-gray-700">
                <li><strong>1.</strong> Book online and pay with PayPal or card.</li>
                <li><strong>2.</strong> Receive confirmation by SMS and email.</li>
                <li><strong>3.</strong> Park at The Anchor and pop in for refreshments.</li>
                <li><strong>4.</strong> Taxi or rideshare to your terminal in 7–12 minutes.</li>
              </ol>
              <p className="mt-4 text-sm text-gray-600">
                Tip: add 20 minutes cushion before your Heathrow check-in time to enjoy a relaxed meal or coffee with us, plus another 15 minutes for your taxi or bus transfer.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <FAQAccordionWithSchema title="Heathrow parking FAQs" faqs={faqs(rateCard)} />

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
