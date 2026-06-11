import Link from 'next/link'
import { Button, Card, CardBody, SectionHeading, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { InteriorHero } from '@/components/hero'
import { BookTableButton } from '@/components/BookTableButton'
import { CtaBand } from '@/components/CtaBand'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { generateHowToDirectionsSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
  title: 'Pubs in Egham | Free Parking Alternative',
  description: 'Searching for pubs in Egham? The Anchor is just 12 minutes away with free parking, Sunday roasts, stone-baked pizzas and a warm local welcome for Royal Holloway students.',
  openGraph: {
    title: 'Pubs in Egham, The Anchor, Stanwell Moor',
    description: 'One of the best pubs near Egham, 12 minutes away with free parking, Sunday roast and stone-baked pizzas.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
  },
  twitter: getTwitterMetadata({
    title: 'Pubs in Egham, The Anchor, Stanwell Moor',
    description: 'One of the best pubs near Egham, 12 minutes away with free parking, Sunday roast and stone-baked pizzas.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/egham-pub'
  }
}

export default function EghamPubPage() {
  const directionsSchema = generateHowToDirectionsSchema(
    "Egham Town Centre",
    "The Anchor",
    [
      "From Egham High Street, take the A30 towards Staines",
      "After 2 miles, turn left onto A308 Staines bypass",
      "At the roundabout, take the 3rd exit onto A3044",
      "Continue for 1.5 miles",
      "Turn right onto Horton Road",
      "The Anchor is 200 yards on your right with free parking"
    ]
  )

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    "name": "The Anchor - Egham's Local Pub",
    "description": "Traditional British pub serving Egham residents and Royal Holloway students with great food, drinks, and entertainment.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Horton Road",
      "addressLocality": "Stanwell Moor",
      "addressRegion": "Surrey",
      "postalCode": "TW19 6AQ",
      "addressCountry": "GB"
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Egham"
      },
      {
        "@type": "Place",
        "name": "Royal Holloway University"
      }
    ],
    "telephone": "+441753682707",
    "url": "https://www.the-anchor.pub/egham-pub"
  }


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, directionsSchema]) }}
      />

      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/egham-pub/find-us.jpg"
        crumb="Egham"
        title="Your Local Pub Near Egham"
        lead="Just 12 minutes away with free parking"
        actions={
          <BookTableButton source="egham_pub_hero"
          context="local_pub" variant="primary" size="lg" fullWidth>
          Book a Table
        </BookTableButton>
        }
      />

      {/* Page Title */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle
              seo={{
                structured: true,
                speakable: true
              }}
              className="mb-4"
            >
              Pubs in Egham, Traditional British Pub Near Egham
            </PageTitle>
            <p className="text-lg text-ink-muted">
              Searching for pubs in Egham? Your local traditional pub is just 12 minutes away with free parking
            </p>
          </div>
        </Container>
      </section>

      {/* Distance & Benefits */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Egham's Favourite Surrey Escape"
              lead="Worth the short drive for a proper traditional pub experience"
              className="text-center mb-12"
            />

            {/* Key Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {[
                { title: "Quick Journey", description: "Just 12 minutes from Egham via A30" },
                { title: "Student Friendly", description: "Popular with Royal Holloway students & staff" },
                { title: "Great Value", description: "Competitive prices compared to Egham venues" },
              ].map((item) => (
                <Card key={item.title} accent>
                  <CardBody className="p-6 text-center">
                    <h3 className="font-display text-h4 text-ink-strong mb-2">{item.title}</h3>
                    <p className="text-sm text-ink-muted">{item.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Why Choose Us */}
            <Card accent>
              <CardBody className="p-8">
                <h3 className="font-display text-h3 text-ink-strong mb-6">
                  Why Egham Residents & Students Choose The Anchor
                </h3>
                <ul className="space-y-4 text-ink">
                  {[
                    'Free parking - no expensive Egham parking charges',
                    'Traditional pub atmosphere away from chain venues',
                    'Perfect for Royal Holloway society meetups',
                    'Regular quiz nights - build your own team',
                    'Our celebrated Sunday roasts worth the journey',
                  ].map((item) => (
                    <li key={item} className="flex items-start">
                      <span className="text-accent-text font-bold mr-3">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Directions */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="How to Find Us from Egham"
            />

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-display text-h4 text-ink-strong mb-4">From Egham Town Centre</h3>
                <ol className="space-y-3 text-ink">
                  <li className="flex">
                    <span className="text-accent-text font-bold mr-3">1.</span>
                    Take the A30 towards Staines
                  </li>
                  <li className="flex">
                    <span className="text-accent-text font-bold mr-3">2.</span>
                    After 2 miles, turn left onto A308 Staines bypass
                  </li>
                  <li className="flex">
                    <span className="text-accent-text font-bold mr-3">3.</span>
                    At the roundabout, take 3rd exit onto A3044
                  </li>
                  <li className="flex">
                    <span className="text-accent-text font-bold mr-3">4.</span>
                    Continue for 1.5 miles
                  </li>
                  <li className="flex">
                    <span className="text-accent-text font-bold mr-3">5.</span>
                    Turn right onto Horton Road
                  </li>
                  <li className="flex">
                    <span className="text-accent-text font-bold mr-3">6.</span>
                    The Anchor is on your right with free parking
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="font-display text-h4 text-ink-strong mb-4">From Royal Holloway</h3>
                <ol className="space-y-3 text-ink">
                  <li className="flex">
                    <span className="text-accent-text font-bold mr-3">1.</span>
                    Exit campus and join A30 towards Staines
                  </li>
                  <li className="flex">
                    <span className="text-accent-text font-bold mr-3">2.</span>
                    Follow A30 for 3 miles
                  </li>
                  <li className="flex">
                    <span className="text-accent-text font-bold mr-3">3.</span>
                    Turn left onto A308 (Staines bypass)
                  </li>
                  <li className="flex">
                    <span className="text-accent-text font-bold mr-3">4.</span>
                    Follow directions above from step 3
                  </li>
                </ol>
              </div>
            </div>

            <Card accent className="mt-8">
              <CardBody className="p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-2">Royal Holloway Students</h3>
                <p className="text-ink-muted">
                  Organising a society event? We're the perfect venue for Royal Holloway societies and sports teams.
                  Ideal for end-of-term celebrations, social mixers, and team dinners. Contact us for group bookings.
                </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Student & Local Offers */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Perfect for Egham Groups"
            />
            <div className="grid md:grid-cols-2 gap-5">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Royal Holloway Gatherings</h3>
                  <p className="mb-3 text-ink-muted">Popular with Royal Holloway students and staff</p>
                  <ul className="space-y-2 text-ink">
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Perfect for society meetups</li>
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>End-of-term celebrations</li>
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Sports team dinners</li>
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Quiz team headquarters</li>
                  </ul>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Egham Favourites</h3>
                  <p className="mb-3 text-ink-muted">Join other Egham locals who make the journey</p>
                  <ul className="space-y-2 text-ink">
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Stone-Baked Pizzas</li>
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Wednesday Quiz Nights</li>
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Hosted nights like Music Bingo with Nikki Manfadge (see /whats-on)</li>
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Sunday Roast (book early)</li>
                  </ul>
                </CardBody>
              </Card>
            </div>

            <Card accent className="mt-8 text-center">
              <CardBody className="p-8">
                <h3 className="font-display text-h4 text-ink-strong mb-4">Transport Options</h3>
                <div className="text-center">
                  <p className="font-semibold text-ink mb-2">Taxi Services</p>
                  <p className="text-ink-muted">We can arrange taxis back to Egham/Royal Holloway</p>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Local Knowledge Section */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="From Egham to The Anchor, Worth Every Mile"
            />
            <div className="prose max-w-none space-y-4 text-ink-muted">
              <p>
                When you search for pubs in Egham, you&rsquo;ll find a few decent options on the High Street, but anyone who&rsquo;s lived there long enough knows they can get a bit samey. The Anchor offers something different: a genuine village pub with character, about 15 minutes down the A30 through Staines. Take the A30 east from Egham, follow it through the Causeway past the Two Rivers retail park, then pick up the A308 Staines bypass. From there it&rsquo;s a quick turn onto the A3044 and then Horton Road, straight to our car park. If you prefer the motorway, the M25 from Junction 13 works just as well.
              </p>
              <p>
                Royal Holloway students have been finding their way to us for years. When you&rsquo;ve had enough of the campus bar or the Egham high street circuit, a short taxi ride gets you to a proper pub with real character. We&rsquo;re popular for society socials, end-of-term celebrations, and those post-graduation family lunches where you actually want somewhere that isn&rsquo;t rammed. Parents seem to love the free parking and the beer garden, especially if graduation falls on a sunny day.
              </p>
              <p>
                Then there&rsquo;s the Runnymede crowd. If you&rsquo;ve spent the afternoon at the JFK Memorial or walking the meadows, you&rsquo;re barely ten minutes from us. The Air Forces Memorial on Cooper&rsquo;s Hill is another popular starting point, visitors often tell us they stumbled across The Anchor while looking for somewhere to eat afterwards, and now it&rsquo;s become part of the routine. A reflective walk followed by a quiet pint in the garden feels about right.
              </p>
              <p>
                We&rsquo;re dog-friendly throughout, we&rsquo;ve got 20 free parking spaces, and the stone-baked pizzas from &pound;12 are a genuine draw. It&rsquo;s no wonder so many people searching for pubs near Egham end up making The Anchor their regular.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Opening Hours */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Opening Hours"
            />
            <BusinessHours />
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "How far is The Anchor from Egham?",
            answer: "The Anchor is just 12 minutes (4.5 miles) from Egham town centre via the A30 and A3044. We offer free parking, making us a great alternative to paid parking in Egham high street."
          },
          {
            question: "Is The Anchor popular with Royal Holloway students?",
            answer: "Yes! Many Royal Holloway students and staff visit The Anchor for our relaxed atmosphere, great food, and regular events. We're just 15 minutes from the university campus."
          },
          {
            question: "Can you host Royal Holloway society events?",
            answer: "Absolutely! We regularly host Royal Holloway society events, sports team celebrations, and end-of-term parties. We can reserve areas for your society and help make your event special."
          }
        ]}
        className="bg-canvas"
      />

      {/* CTA Section */}
      <CtaBand
        title="Worth the Journey from Egham"
        copy="Discover why so many Egham residents and Royal Holloway students make The Anchor their regular"
      >
        <Link href="tel:+441753682707">
          <Button variant="primary" size="lg">Call: 01753 682707</Button>
        </Link>
        <Link href="/private-hire#enquiry">
          <Button variant="outline" size="lg">Book an Event</Button>
        </Link>
        <Link href="/find-us">
          <Button variant="outline" size="lg">Get Directions</Button>
        </Link>
      </CtaBand>
    </>
  )
}
