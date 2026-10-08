import { ONE_KITCHEN_WORDING, PARKING_WORDING, TAXI_WORDING } from '@/lib/approved-wording'
import Link from 'next/link'
import { Metadata } from 'next'
import { InteriorHero } from '@/components/hero'
import { Container, Button, SectionHeading, Card, CardBody } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { AmenityStrip } from '@/components/AmenityStrip'
import { BookTableButton } from '@/components/BookTableButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { SpeakableSchema } from '@/components/seo/SpeakableSchema'
import { SpeakableContent } from '@/components/voice/SpeakableContent'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { DEFAULT_NEAR_HEATHROW_IMAGE } from '@/lib/image-fallbacks'
import { HeathrowFoodBestFor } from '@/components/food/HeathrowFoodBestFor'
import { HEATHROW_TIMES, BUS_WORDING } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Heathrow Layover Dining (Near T5) | Eat in 90 Minutes',
  description: 'Make the most of a Heathrow layover with The Anchor’s fast pub dining, free parking, and book-ahead tips. Perfect for 2–3 hour stopovers near Terminal 5.',
  openGraph: {
    title: 'Heathrow Layover Dining in 90 Minutes (Near T5) | The Anchor',
    description: `Swap airport queues for proper pub food ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5. Booking tips, itineraries, and travel times for stress-free layovers.`,
    images: [{ url: DEFAULT_NEAR_HEATHROW_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Heathrow Airport' }],
  },
  alternates: {
    canonical: '/heathrow-layover-dining'
  },
  twitter: getTwitterMetadata({
    title: 'Heathrow Layover Dining in 90 Minutes | The Anchor Stanwell Moor',
    description: `Free parking, fast service, and hearty pub food ${HEATHROW_TIMES.terminal5} minutes from T5. Book a table for your Heathrow layover.`,
    images: [DEFAULT_NEAR_HEATHROW_IMAGE]
  })
}

const faqItems = [
  {
    question: 'How long do I need for a layover meal at The Anchor?',
    answer: 'Allow 90 minutes door-to-door from Terminal 5 (longer if using Terminals 2–4). That covers the trip each way and about an hour to dine. Let us know your timing on booking so the kitchen can pace your service.'
  },
  {
    question: 'Can I leave the airport for food at Heathrow Terminal 5?',
    answer: `Yes. If you are searching for food at Terminal 5 Heathrow, we are ${HEATHROW_TIMES.terminal5} minutes away by taxi. Pre-book to keep the layover tight and we will time your meal around boarding.`
  },
  {
    question: 'Is there an alternative to food in Terminal 3 Heathrow?',
    answer: `The Anchor is around ${HEATHROW_TIMES.terminal3} minutes from Terminal 3. We offer a calmer setting, quick service, and easy taxi transfers back to departures.`
  },
  {
    question: 'Can I store luggage while I dine?',
    answer: 'Yes. We have a luggage-friendly corner in the dining room where cabin cases and long-haul bags can stay in sight but out of walkways. For very large items, speak to the team when booking so we can reserve extra space.'
  },
  {
    question: 'Is there free parking for layover guests?',
    answer: `Yes. ${PARKING_WORDING} If you want to leave the car for longer and fly out, that is our separate paid airport parking, so just ask the team and we will sort it.`
  },
  {
    question: 'Do you cater for dietary requirements and quick service?',
    answer: `We have vegetarian and vegan dishes, and NGCI (No Gluten Containing Ingredients) options. ${ONE_KITCHEN_WORDING} Mention dietary needs and flight times when booking so we can prepare dishes quickly.`
  },
  {
    question: 'How do I reach The Anchor from Heathrow terminals?',
    answer: `Taxi or rideshare is the fastest: ${HEATHROW_TIMES.terminal5} minutes from T5, ${HEATHROW_TIMES.terminal2} minutes from T2/3, and ${HEATHROW_TIMES.terminal4} minutes from T4. ${BUS_WORDING}`
  }
]

export default function HeathrowLayoverDiningPage() {
  return (
    <>
      <SpeakableSchema/>

      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Near Heathrow"
        title="Heathrow Layover Dining in 90 Minutes"
        lead={`Swap airport queues for proper British pub food with free parking just ${HEATHROW_TIMES.terminal5} minutes from Terminal 5.`}
      />

      <AmenityStrip/>

      <section className="py-section-y bg-canvas">
        <Container>
          <h2 className="text-center font-display text-h2 text-ink-strong">
            Heathrow Layover Dining at The Anchor
          </h2>
          <SpeakableContent className="mt-6 text-lg text-ink-muted text-center mx-auto">
            Plan a stress-free Heathrow layover meal. The Anchor serves Sunday roasts, stone-baked pizzas, and pub classics with free parking, fast service, and reliable travel times back to your terminal.
          </SpeakableContent>
        </Container>
      </section>
      <HeathrowFoodBestFor
        title="Best For Heathrow Layovers"
        items={[
          ['90-minute meal', 'Book ahead, share your flight time and keep the visit controlled.'],
          ['Post-flight reset', 'Leave the terminal for proper food before hotel check-in.'],
          ['Family stop', 'A calmer table for children, luggage and a real meal.'],
          ['Sunday arrival', 'Book Sunday roast from 1pm to 6pm when timings work.'],
          ['Crew and groups', 'Fast pub food, WiFi and free parking minutes from Terminal 5.'],
        ]}
      />

      <section className="py-section-y bg-surface">
        <Container>
          <SectionHeading
            title="Terminal Food Alternatives for Layovers"
            lead="If you are searching for food at Heathrow Terminal 5 or food in Terminal 3 Heathrow, we are a short ride away."
            align="center"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { title: 'Food at Terminal 5 Heathrow - a calmer option', body: `We are ${HEATHROW_TIMES.terminal5} minutes from Terminal 5 with quick table service and pre-booked meals. Skip terminal queues and enjoy proper dining before you return to security.` },
              { title: 'Food in Terminal 3 Heathrow - leave the airport', body: `Terminal 3 guests reach us in around ${HEATHROW_TIMES.terminal3} minutes. Let us know your flight time and we will pace your meal for a smooth return to departures.` },
              { title: 'Terminal 2 & 4 layovers', body: `Allow ${HEATHROW_TIMES.terminal2} minutes from Terminal 2 and ${HEATHROW_TIMES.terminal4} minutes from Terminal 4. Ask at the bar for a taxi number, and book your own ride back in good time for boarding.` },
              { title: 'Book ahead for express service', body: 'Share your terminal and boarding time when you book. We will have a table ready and time mains to land within minutes of your arrival.' }
            ].map(box => (
              <Card key={box.title} accent>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-2">{box.title}</h3>
                  <p className="text-ink-muted">{box.body}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-canvas">
        <Container>
          <SectionHeading
            title="Why Layover Guests Choose The Anchor"
            lead="Proper food, friendly service, and timings that work around airport schedules."
            align="center"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'In & Out in 90 Minutes', description: 'Let us know your flight time when you book and we’ll pace courses so you can dine without clock-watching.' },
              { title: 'The Full Menu', description: 'From Sunday roasts to stone-baked pizzas, vegetarian plates, and speedy sharers, every layover party finds something spot on.' },
              { title: 'Free Parking & Easy Transfers', description: `${PARKING_WORDING} Need a cab back? ${TAXI_WORDING}` },
              { title: 'Luggage-Friendly Seating', description: 'Plenty of space at tables for hand luggage and suitcases, we’ll help you keep everything nearby and secure.' },
              { title: 'Work-Friendly Amenities', description: 'Free WiFi, plug sockets, and quiet corners when you need to catch up on email or plan the onward journey.' },
              { title: 'Perfect for Crew & Families', description: 'Airline staff, business travellers, and families rate us for group menus, kids’ portions, and celebratory welcome-back drinks.' }
            ].map(feature => (
              <Card key={feature.title} accent hover>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-2">{feature.title}</h3>
                  <p className="text-ink-muted">{feature.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section id="itineraries" className="py-section-y bg-surface">
        <Container>
          <SectionHeading
            title="Layover Itineraries That Work"
            lead="Pick the layover that matches your schedule and we’ll keep everything running smoothly."
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-3">90-Minute Express</h3>
                <ul className="space-y-2 text-ink-muted">
                  <li>Taxi from Terminal 5 – {HEATHROW_TIMES.terminal5} minutes</li>
                  <li>Let the team know your timing so mains land within minutes of sitting down</li>
                  <li>Coffee &amp; dessert to-go for airport return</li>
                  <li>Book your own taxi back for 30 minutes before the boarding gate closes</li>
                </ul>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-3">3-Hour Leisure</h3>
                <ul className="space-y-2 text-ink-muted">
                  <li>Welcome drinks and sharers on arrival</li>
                  <li>Main course + dessert paced over 90 minutes</li>
                  <li>Use free WiFi to check-in before departure</li>
                </ul>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-3">Overnight Stopover</h3>
                <ul className="space-y-2 text-ink-muted">
                  <li>Dinner at The Anchor followed by nightcap in the bar</li>
                  <li>Ask for nearby hotel recommendations that suit your schedule</li>
                  <li>Meal recommendations before you fly</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-canvas">
        <Container>
          <SectionHeading
            title="Travel Times"
            lead="Plan your layover with taxi times from each terminal."
          />
          <div className="overflow-x-auto rounded-md border border-line bg-surface shadow-sm" role="region" tabIndex={0} aria-label="Table: Travel times">
            <table className="min-w-full divide-y divide-line">
              <thead className="bg-anchor-green text-white">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Terminal</th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Taxi / Uber</th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Best For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm text-ink-muted">
                <tr>
                  <th scope="row" className="px-6 py-4 text-left font-semibold text-ink-strong">Terminal 5</th>
                  <td className="px-6 py-4">{HEATHROW_TIMES.terminal5} minutes</td>
                  <td className="px-6 py-4">Fast crew dinners & short layovers</td>
                </tr>
                <tr>
                  <th scope="row" className="px-6 py-4 text-left font-semibold text-ink-strong">Terminals 2 & 3</th>
                  <td className="px-6 py-4">{HEATHROW_TIMES.terminal2} minutes</td>
                  <td className="px-6 py-4">Families meeting arrivals</td>
                </tr>
                <tr>
                  <th scope="row" className="px-6 py-4 text-left font-semibold text-ink-strong">Terminal 4</th>
                  <td className="px-6 py-4">{HEATHROW_TIMES.terminal4} minutes</td>
                  <td className="px-6 py-4">Overnight guests staying nearby</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <SectionHeading
            title="Make the Most of Your Layover"
            lead="Stretch your legs, stay connected, and head back to departures refreshed."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Plane-Spotting Patio', body: 'Watch final approaches with a pint in hand. Great for aviation fans and families.' },
              { title: 'Charging & WiFi', body: 'Power up devices and download shows before you board. Ask staff for quiet seating.' },
              { title: 'Group-Friendly Menus', body: 'Pre-set menus available for crew briefings or incentive trips. Email manager@the-anchor.pub for options.' },
              { title: 'Takeaway Ready', body: 'Our menu travels well. Take leftovers with you, or order takeaway pizzas for the onward journey.' }
            ].map(box => (
              <Card key={box.title} accent>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-2">{box.title}</h3>
                  <p className="text-ink-muted">{box.body}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        title="Heathrow Layover Dining FAQs"
        faqs={faqItems}
        className="bg-canvas"
      />

      <CtaBand
        title="Ready to Book Your Layover Meal?"
        copy={`Tell us your flight number, party size, and arrival time, and we’ll confirm the best itinerary. ${TAXI_WORDING}`}
      >
        <BookTableButton
          source="layover_footer"
          context="heathrow_layover"
          variant="primary"
          size="lg"
        >
          Reserve Layover Dining
        </BookTableButton>
        <Button asChild variant="outline" size="lg">
          <Link href="https://wa.me/441753682707">WhatsApp for Quick Plan</Link>
        </Button>
      </CtaBand>

    </>
  )
}
