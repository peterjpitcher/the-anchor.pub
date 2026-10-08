import { CHARGING_WORDING, CHILDREN_WELCOME_WORDING, LUGGAGE_WORDING, ONE_KITCHEN_WORDING, PARKING_WORDING, TAXI_WORDING } from '@/lib/approved-wording'
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
import { CONTACT, HEATHROW_TIMES, HEATHROW_TIMES_WORDING, BUS_WORDING } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Heathrow Layover Dining (Near T5) | The Anchor Stanwell Moor',
  description: `Got a long Heathrow layover? The Anchor is a proper pub ${HEATHROW_TIMES.terminal5} minutes from Terminal 5 by car, with pub food, free parking and a beer garden under the flight path.`,
  openGraph: {
    title: 'Heathrow Layover Dining (Near T5) | The Anchor',
    description: `Swap the terminal for proper pub food ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5. Journey times from each terminal and how much time to allow.`,
    images: [{ url: DEFAULT_NEAR_HEATHROW_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Heathrow Airport' }],
  },
  alternates: {
    canonical: '/heathrow-layover-dining'
  },
  twitter: getTwitterMetadata({
    title: 'Heathrow Layover Dining (Near T5) | The Anchor Stanwell Moor',
    description: `Free parking and proper pub food ${HEATHROW_TIMES.terminal5} minutes from T5 by car. Walk in or book a table for your Heathrow layover.`,
    images: [DEFAULT_NEAR_HEATHROW_IMAGE]
  })
}

const faqItems = [
  {
    question: 'How long do I need for a layover meal at The Anchor?',
    answer: `It depends where you start. If you've just landed from abroad you need to clear immigration, get to us, eat, get back and go through security again, so allow at least 2.5 to 3 hours. If you have under 2 hours before your flight, stay in the terminal. We're ${HEATHROW_TIMES_WORDING}, and traffic can add to that. Check your airline's advice on when to be back.`
  },
  {
    question: 'Can I leave the airport for food at Heathrow Terminal 5?',
    answer: `Yes, if you have the time. We're ${HEATHROW_TIMES.terminal5} minutes from Terminal 5 by car. You can walk in or book a table. Leave yourself plenty of time to get back through security.`
  },
  {
    question: 'Is there an alternative to food in Terminal 3 Heathrow?',
    answer: `The Anchor is around ${HEATHROW_TIMES.terminal3} minutes from Terminal 3 by car. It's a village pub with table service, so it's a calmer place to eat than the terminal.`
  },
  {
    question: 'Can I store luggage while I dine?',
    answer: LUGGAGE_WORDING
  },
  {
    question: 'Is there free parking for layover guests?',
    answer: `Yes. ${PARKING_WORDING} If you want to leave the car for longer and fly out, that is our separate paid airport parking, which you book on our Heathrow parking page.`
  },
  {
    question: 'Do you cater for dietary requirements?',
    answer: `We have vegetarian and vegan dishes, and NGCI (No Gluten Containing Ingredients) options. ${ONE_KITCHEN_WORDING} Tell us about any dietary needs when you order.`
  },
  {
    question: 'How do I reach The Anchor from Heathrow terminals?',
    answer: `By car, taxi or rideshare we're ${HEATHROW_TIMES_WORDING}. ${BUS_WORDING} For the trip back: ${TAXI_WORDING}`
  }
]

export default function HeathrowLayoverDiningPage() {
  return (
    <>
      <SpeakableSchema/>

      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Near Heathrow"
        title="Heathrow Layover Dining"
        lead={`Swap the terminal for proper British pub food with free parking, ${HEATHROW_TIMES.terminal5} minutes from Terminal 5 by car.`}
      />

      <AmenityStrip/>

      <section className="py-section-y bg-canvas">
        <Container>
          <h2 className="text-center font-display text-h2 text-ink-strong">
            Heathrow Layover Dining at The Anchor
          </h2>
          <SpeakableContent className="mt-6 text-lg text-ink-muted text-center mx-auto">
            Got a few hours between flights? The Anchor is a village pub in Stanwell Moor serving Sunday roasts, stone-baked pizzas and pub classics, with free parking outside. Here&apos;s how far we are from each terminal and how much time to allow.
          </SpeakableContent>
        </Container>
      </section>
      <HeathrowFoodBestFor
        title="Best For Heathrow Layovers"
        items={[
          ['Long layovers', 'A proper meal away from the terminal when you have a few hours to spare.'],
          ['Post-flight reset', 'Leave the terminal for proper food before hotel check-in.'],
          ['Family stop', 'A calmer table for children, luggage and a real meal.'],
          ['Sunday arrival', 'Sunday roast is served 1pm to 6pm. Walk in, nothing to pre-order.'],
          ['Groups', 'Pub food, free WiFi and free parking minutes from Terminal 5.'],
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
              { title: 'Food at Terminal 5 Heathrow - a calmer option', body: `We're ${HEATHROW_TIMES.terminal5} minutes from Terminal 5 by car, with table service and a full pub menu. Leave yourself plenty of time to get back through security.` },
              { title: 'Food in Terminal 3 Heathrow - leave the airport', body: `From Terminal 3 you can reach us in around ${HEATHROW_TIMES.terminal3} minutes by car. Traffic varies, so check the journey before you set off.` },
              { title: 'Terminal 2 & 4 layovers', body: `Allow ${HEATHROW_TIMES.terminal2} minutes from Terminal 2 and ${HEATHROW_TIMES.terminal4} minutes from Terminal 4. Ask at the bar for a taxi number, and book your own ride back in good time for boarding.` },
              { title: 'Walk in or book', body: 'You can walk in or book a table online. Check our opening and kitchen times before you set off, because the kitchen is not open all day.' }
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
            lead="Proper food and a friendly welcome, a short ride from every terminal."
            align="center"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Close to Every Terminal', description: `We're ${HEATHROW_TIMES_WORDING}. Traffic can add to that, so leave a margin.` },
              { title: 'The Full Menu', description: 'Sunday roasts, stone-baked pizzas, pub classics, and vegetarian and vegan dishes.' },
              { title: 'Free Parking & Taxis', description: `${PARKING_WORDING} Need a cab back? ${TAXI_WORDING}` },
              { title: 'Luggage Storage', description: 'Travelling with bags? Ask the bar team when you arrive.' },
              { title: 'Free WiFi', description: `Free WiFi throughout the pub and beer garden. ${CHARGING_WORDING}` },
              { title: 'Families Welcome', description: CHILDREN_WELCOME_WORDING }
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
            title="How Much Time Do You Need?"
            lead="Be honest with yourself about the clock. Missing a flight isn't worth a pint."
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-3">Under 2 Hours</h3>
                <ul className="space-y-2 text-ink-muted">
                  <li>Stay in the terminal</li>
                  <li>The same goes if you&apos;re already through security</li>
                  <li>Come and see us on a longer trip</li>
                </ul>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-3">Arriving From Abroad</h3>
                <ul className="space-y-2 text-ink-muted">
                  <li>Allow at least 2.5 to 3 hours</li>
                  <li>You need to clear immigration, get here, eat, get back and pass security again</li>
                  <li>Check your airline&apos;s advice on when to be back</li>
                </ul>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-3">Staying Overnight Nearby</h3>
                <ul className="space-y-2 text-ink-muted">
                  <li>Come over from your hotel for dinner and a drink in the bar</li>
                  <li>Check our opening and kitchen times before you travel</li>
                  <li>Ask at the bar for a taxi number for the ride back</li>
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
            lead="Journey times by car from each terminal. Traffic can add to them."
          />
          <div className="overflow-x-auto rounded-md border border-line bg-surface shadow-sm" role="region" tabIndex={0} aria-label="Table: Travel times">
            <table className="min-w-full divide-y divide-line">
              <thead className="bg-anchor-green text-white">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Terminal</th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">By car</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm text-ink-muted">
                <tr>
                  <th scope="row" className="px-6 py-4 text-left font-semibold text-ink-strong">Terminal 5</th>
                  <td className="px-6 py-4">{HEATHROW_TIMES.terminal5} minutes</td>
                </tr>
                <tr>
                  <th scope="row" className="px-6 py-4 text-left font-semibold text-ink-strong">Terminals 2 & 3</th>
                  <td className="px-6 py-4">{HEATHROW_TIMES.terminal2} minutes</td>
                </tr>
                <tr>
                  <th scope="row" className="px-6 py-4 text-left font-semibold text-ink-strong">Terminal 4</th>
                  <td className="px-6 py-4">{HEATHROW_TIMES.terminal4} minutes</td>
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
              { title: 'Planes From the Beer Garden', body: "Our beer garden is under Heathrow's southern runway approach path, so you can watch planes come in with a pint in hand." },
              { title: 'Free WiFi', body: 'Free WiFi throughout the pub and beer garden, handy for checking in before you head back.' },
              { title: 'Bigger Groups', body: `Bringing a big group? Email ${CONTACT.email} or call ${CONTACT.phone} and we'll talk it through.` },
              { title: 'Takeaway by Phone', body: `You can phone a takeaway order through to collect. Call ${CONTACT.phone}.` }
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
        copy={`Book a table online, or just walk in. ${TAXI_WORDING}`}
      >
        <BookTableButton
          source="layover_footer"
          context="heathrow_layover"
          variant="primary"
          size="lg"
        >
          Book a Table
        </BookTableButton>
        <Button asChild variant="outline" size="lg">
          <Link href="https://wa.me/441753682707">WhatsApp Us</Link>
        </Button>
      </CtaBand>

    </>
  )
}
