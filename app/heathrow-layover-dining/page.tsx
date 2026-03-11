import Link from 'next/link'
import { Metadata } from 'next'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { Container, Section, Button } from '@/components/ui'
import { SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { SpeakableSchema } from '@/components/seo/SpeakableSchema'
import { SpeakableContent } from '@/components/voice/SpeakableContent'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { DEFAULT_NEAR_HEATHROW_IMAGE } from '@/lib/image-fallbacks'
import { FoodStickyCtaBar } from '@/components/food/FoodStickyCtaBar'

export const metadata: Metadata = {
  title: 'Heathrow Layover Dining (Near T5) | Eat in 90 Minutes | The Anchor',
  description: 'Make the most of a Heathrow layover with The Anchor’s fast pub dining, free parking, and book-ahead tips. Perfect for 2–3 hour stopovers near Terminal 5.',
  keywords: 'heathrow layover dining, layover restaurant near heathrow, layover itinerary terminal 5, eat near heathrow airport, quick restaurant near heathrow, food at terminal 5 heathrow, food in terminal 3 heathrow',
  openGraph: {
    title: 'Heathrow Layover Dining in 90 Minutes (Near T5) | The Anchor',
    description: 'Swap airport queues for proper pub food 7 minutes from Heathrow. Booking tips, itineraries, and travel times for stress-free layovers.',
    images: [{ url: DEFAULT_NEAR_HEATHROW_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Heathrow Airport' }],
  },
  alternates: {
    canonical: '/heathrow-layover-dining'
  },
  twitter: getTwitterMetadata({
    title: 'Heathrow Layover Dining in 90 Minutes | The Anchor Stanwell Moor',
    description: 'Free parking, fast service, and hearty pub food 7 minutes from T5. Book a table for your Heathrow layover.',
    images: [DEFAULT_NEAR_HEATHROW_IMAGE]
  })
}

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Near Heathrow', url: '/near-heathrow' },
  { name: 'Heathrow Layover Dining', url: '/heathrow-layover-dining' }
])

const faqItems = [
  {
    question: 'How long do I need for a layover meal at The Anchor?',
    answer: 'Allow 90 minutes door-to-door from Terminal 5 (longer if using Terminals 2–4). That gives you 15 minutes travel each way and 60 minutes to dine. Let us know your timing on booking so the kitchen can pace your service.'
  },
  {
    question: 'Can I leave the airport for food at Heathrow Terminal 5?',
    answer: 'Yes. If you are searching for food at Terminal 5 Heathrow, we are 7 minutes away by taxi. Pre-book to keep the layover tight and we will time your meal around boarding.'
  },
  {
    question: 'Is there an alternative to food in Terminal 3 Heathrow?',
    answer: 'The Anchor is around 11 minutes from Terminal 3. We offer a calmer setting, quick service, and easy taxi transfers back to departures.'
  },
  {
    question: 'Can I store luggage while I dine?',
    answer: 'Yes. We have a luggage-friendly corner in the dining room where cabin cases and long-haul bags can stay in sight but out of walkways. For very large items, speak to the team when booking so we can reserve extra space.'
  },
  {
    question: 'Is there free parking for layover guests?',
    answer: 'Layover guests receive three hours free parking. Register your number plate at the bar on arrival. Need longer? Let us know and we can extend it or advise on our overnight parking option.'
  },
  {
    question: 'Do you cater for dietary requirements and quick service?',
    answer: 'Absolutely. We have vegetarian, vegan, and gluten-free options across the menu. Mention dietary needs and flight times when booking so we can prepare dishes quickly.'
  },
  {
    question: 'How do I reach The Anchor from Heathrow terminals?',
    answer: 'Taxi or rideshare is the fastest: 7 minutes from T5, 11 minutes from T2/3, and 12 minutes from T4. You can also take the 442 bus towards Staines and hop off in Stanwell Moor, then walk three minutes to the pub.'
  }
]

export default function HeathrowLayoverDiningPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SpeakableSchema />

      <HeroWrapper
        route="/heathrow-layover-dining"
        title="Heathrow Layover Dining in 90 Minutes"
        description="Swap airport queues for proper British pub food with free parking just 7 minutes from Terminal 5."
        variant="default"
        breadcrumbs={[
          { name: 'Near Heathrow', href: '/near-heathrow' },
          { name: 'Layover Dining' }
        ]}
        tags={[
          { label: '7 mins from T5', variant: 'success' },
          { label: '90-min itineraries', variant: 'default' },
          { label: 'Full menu served fast', variant: 'default' },
          { label: 'Free parking', variant: 'default' }
        ]}
        primaryCta={
          <BookTableButton
            source="layover_hero"
            context="heathrow_layover"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          >
            Book Layover Table
          </BookTableButton>
        }
        secondaryCta={
          <Link href="#itineraries" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              className="sm:w-auto"
            >
              View Layover Itineraries
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

      <Section background="dark" spacing="md">
        <Container>
          <PageTitle
            className="text-center text-anchor-cream-text"
            seo={{ structured: true, speakable: true }}
          >
            Heathrow Layover Dining at The Anchor
          </PageTitle>
          <SpeakableContent className="mt-6 text-lg text-anchor-cream-text/70 text-center max-w-3xl mx-auto">
            Plan a stress-free Heathrow layover meal. The Anchor serves Sunday roasts, stone-baked pizzas, and pub classics with free parking, fast service, and reliable travel times back to your terminal.
          </SpeakableContent>
        </Container>
      </Section>

      <Section background="dark" spacing="md">
        <Container>
          <SectionHeader
            title="Terminal Food Alternatives for Layovers"
            subtitle="If you are searching for food at Heathrow Terminal 5 or food in Terminal 3 Heathrow, we are a short ride away."
            align="center"
          />
          <InfoBoxGrid
            columns={2}
            boxes={[
              {
                title: "Food at Terminal 5 Heathrow - a calmer option",
                content: (
                  <p>
                    We are 7 minutes from Terminal 5 with quick table service and pre-booked meals.
                    Skip terminal queues and enjoy proper dining before you return to security.
                  </p>
                ),
                variant: "colored",
                color: "bg-anchor-bg-raised"
              },
              {
                title: "Food in Terminal 3 Heathrow - leave the airport",
                content: (
                  <p>
                    Terminal 3 guests reach us in around 11 minutes. Let us know your flight time and we will pace your meal
                    for a smooth return to departures.
                  </p>
                ),
                variant: "colored",
                color: "bg-anchor-bg-raised"
              },
              {
                title: "Terminal 2 & 4 layovers",
                content: (
                  <p>
                    Allow 12-14 minutes from Terminals 2 and 4. We will coordinate taxi timing so you can dine without stress
                    and still make it back for boarding.
                  </p>
                ),
                variant: "colored",
                color: "bg-anchor-bg-raised"
              },
              {
                title: "Book ahead for express service",
                content: (
                  <p>
                    Share your terminal and boarding time when you book. We will have a table ready and time mains to land
                    within minutes of your arrival.
                  </p>
                ),
                variant: "colored",
                color: "bg-anchor-bg-raised"
              }
            ]}
          />
        </Container>
      </Section>

      <Section background="dark" spacing="lg">
        <Container>
          <SectionHeader
            title="Why Layover Guests Choose The Anchor"
            subtitle="Proper food, friendly service, and timings that work around airport schedules."
            align="center"
          />
          <FeatureGrid
            columns={3}
            features={[
              {
                icon: '',
                title: 'In & Out in 90 Minutes',
                description: 'Let us know your flight time when you book and we’ll pace courses so you can dine without clock-watching.'
              },
              {
                icon: '',
                title: 'Full Menu, All Day',
                description: 'From Sunday roasts to stone-baked pizzas, vegetarian plates, and speedy sharers, every layover party finds something spot on.'
              },
              {
                icon: '',
                title: 'Free Parking & Easy Transfers',
                description: 'Register your car for three hours free. Need a cab back? We’ll organise one with our trusted local partners.'
              },
              {
                icon: '',
                title: 'Luggage-Friendly Seating',
                description: 'Plenty of space at tables for hand luggage and suitcases — we’ll help you keep everything nearby and secure.'
              },
              {
                icon: '',
                title: 'Work-Friendly Amenities',
                description: 'Free WiFi, plug sockets, and quiet corners when you need to catch up on email or plan the onward journey.'
              },
              {
                icon: '',
                title: 'Perfect for Crew & Families',
                description: 'Airline staff, business travelers, and families rate us for group menus, kids’ portions, and celebratory welcome-back drinks.'
              }
            ]}
          />
        </Container>
      </Section>

      <Section id="itineraries" background="dark" spacing="lg">
        <Container>
          <SectionHeader
            title="Layover Itineraries That Work"
            subtitle="Pick the layover that matches your schedule and we’ll keep everything running smoothly."
          />
          <div className="grid gap-8 md:grid-cols-3">
            <AlertBox
              title="90-Minute Express"
              variant="success"
              content={
                <ul className="space-y-2">
                  <li>Taxi from Terminal 5 – 7 minutes</li>
                  <li>Let the team know your timing so mains land within minutes of sitting down</li>
                  <li>Coffee &amp; dessert to-go for airport return</li>
                  <li>Taxi booked back 30 minutes before boarding gate closes</li>
                </ul>
              }
            />
            <AlertBox
              title="3-Hour Leisure"
              variant="info"
              content={
                <ul className="space-y-2">
                  <li>Welcome drinks and sharers on arrival</li>
                  <li>Main course + dessert paced over 90 minutes</li>
                  <li>Short walk on Stanwell Moor village green</li>
                  <li>Use free WiFi to check-in before departure</li>
                </ul>
              }
            />
            <AlertBox
              title="Overnight Stopover"
              variant="warning"
              content={
                <ul className="space-y-2">
                  <li>Dinner at The Anchor followed by nightcap in the bar</li>
                  <li>Ask for nearby hotel recommendations that suit your schedule</li>
                  <li>Overnight parking arrangements available</li>
                  <li>Breakfast recommendations before you fly</li>
                </ul>
              }
            />
          </div>
        </Container>
      </Section>

      <Section background="dark" spacing="lg">
        <Container>
          <SectionHeader
            title="Travel Times & Costs"
            subtitle="Budget your layover with realistic timings and typical fares."
          />
          <div className="overflow-x-auto rounded-xl border border-anchor-gold/15 bg-anchor-bg-card">
            <table className="min-w-full divide-y divide-anchor-gold/15">
              <thead className="bg-anchor-green text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Terminal</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Taxi / Uber</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Public Transport</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Best For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-anchor-gold/15 text-sm text-anchor-cream-text/70">
	                <tr>
	                  <td className="px-6 py-4 font-semibold text-anchor-cream-text">Terminal 5</td>
	                  <td className="px-6 py-4">7 minutes • GBP 12–18</td>
	                  <td className="px-6 py-4">Bus 442 • 20 minutes + 3 minute walk</td>
	                  <td className="px-6 py-4">Fast crew dinners & short layovers</td>
	                </tr>
	                <tr>
	                  <td className="px-6 py-4 font-semibold text-anchor-cream-text">Terminals 2 & 3</td>
	                  <td className="px-6 py-4">11 minutes • GBP 16–22</td>
	                  <td className="px-6 py-4">Elizabeth Line + bus transfer • 30 minutes</td>
	                  <td className="px-6 py-4">Families meeting arrivals</td>
	                </tr>
	                <tr>
	                  <td className="px-6 py-4 font-semibold text-anchor-cream-text">Terminal 4</td>
	                  <td className="px-6 py-4">14 minutes • GBP 18–24</td>
	                  <td className="px-6 py-4">Shuttle to T5 + bus • 35 minutes</td>
	                  <td className="px-6 py-4">Overnight guests staying nearby</td>
	                </tr>
              </tbody>
            </table>
          </div>
        </Container>
      </Section>

      <Section background="dark" spacing="lg">
        <Container>
          <SectionHeader
            title="Make the Most of Your Layover"
            subtitle="Stretch your legs, stay connected, and head back to departures refreshed."
          />
          <InfoBoxGrid
            columns={3}
            boxes={[
              {
                title: 'Plane-Spotting Patio',
                content: (
                  <p>Watch final approaches with a pint in hand. Great for aviation fans and families.</p>
                )
              },
              {
                title: 'Charging & WiFi',
                content: (
                  <p>Power up devices and download shows before you board. Ask staff for quiet seating.</p>
                )
              },
              {
                title: 'Local Walks',
                content: (
                  <p>Take a 15-minute stroll along the River Colne or Stanwell Moor village green between courses.</p>
                )
              },
              {
                title: 'Group-Friendly Menus',
                content: (
                  <p>Pre-set menus available for crew briefings or incentive trips. Email events@the-anchor.pub for options.</p>
                )
              },
              {
                title: 'Takeaway Ready',
                content: <p>All-day menu items travel well — take leftovers or order takeaway pizzas for the onward journey.</p>
              }
            ]}
          />
        </Container>
      </Section>

      <FAQAccordionWithSchema
        title="Heathrow Layover Dining FAQs"
        faqs={faqItems}
        className="bg-anchor-bg-raised border border-anchor-gold/15"
      />

      <Section background="dark" spacing="lg">
        <Container>
          <div className="max-w-4xl mx-auto text-center bg-anchor-bg-raised rounded-3xl p-10 border border-anchor-gold/15">
            <h2 className="text-3xl font-bold text-anchor-cream-text mb-4">Ready to Book Your Layover Meal?</h2>
            <p className="text-lg text-anchor-cream-text/70 mb-6">
              Tell us your flight number, party size, and arrival time. We’ll confirm the best itinerary, reserve parking, and keep a taxi on standby so you return to Heathrow relaxed.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <BookTableButton
                source="layover_footer"
                context="heathrow_layover"
                variant="primary"
                size="lg"
              >
                Reserve Layover Dining
              </BookTableButton>
              <Link href="https://wa.me/441753682707" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  className="sm:w-auto border-anchor-green text-anchor-green hover:bg-anchor-green hover:text-white"
                >
                  WhatsApp for Quick Plan
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      <FoodStickyCtaBar
        ctaContext="heathrow_layover"
        label="Book Layover Meal"
      />
    </>
  )
}
