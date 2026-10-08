import Link from 'next/link'
import { Button, Card, CardBody, SectionHeading, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { InteriorHero } from '@/components/hero'
import { BookTableButton } from '@/components/BookTableButton'
import { CtaBand } from '@/components/CtaBand'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { CONTACT, BRAND, PARKING, DIRECTIONS_URL } from '@/lib/constants'
import { PARKING_WORDING, TAXI_WORDING, DOGS_WORDING } from '@/lib/approved-wording'
import { DirectionsButton } from '@/components/DirectionsButton'

export const metadata: Metadata = {
  title: 'Pubs in Egham | Free Parking Alternative',
  description: 'Searching for pubs in Egham? A short drive away, with free parking, Sunday roasts, stone-baked pizzas and a warm welcome.',
  openGraph: {
    title: 'Pubs in Egham, The Anchor, Stanwell Moor',
    description: 'A highly rated pub near Egham, a short drive away with free parking, Sunday roast and stone-baked pizzas.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
  },
  twitter: getTwitterMetadata({
    title: 'Pubs in Egham, The Anchor, Stanwell Moor',
    description: 'A highly rated pub near Egham, a short drive away with free parking, Sunday roast and stone-baked pizzas.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/egham-pub'
  }
}

export default function EghamPubPage() {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    "name": BRAND.name,
    "description": "Traditional British pub a short drive from Egham, with great food, drinks and events.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": CONTACT.address.street,
      "addressLocality": CONTACT.address.town,
      "addressRegion": "Surrey",
      "postalCode": CONTACT.address.postcode,
      "addressCountry": "GB"
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Egham"
      }
    ],
    "telephone": "+441753682707",
    "url": "https://www.the-anchor.pub/egham-pub"
  }


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([localBusinessSchema]) }}
      />

      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/egham-pub/find-us.jpg"
        crumb="Egham"
        title="Your Local Pub Near Egham"
        lead="A short drive away with free parking"
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
          <div className="mx-auto text-center">
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
              Searching for pubs in Egham? Your local traditional pub is a short drive away with free parking
            </p>
          </div>
        </Container>
      </section>

      {/* Distance & Benefits */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Egham's Favourite Surrey Escape"
              lead="Worth the short drive for a proper traditional pub experience"
              className="text-center mb-12"
            />

            {/* Key Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {[
                { title: "Quick Journey", description: "A short drive from Egham" },
                { title: "Free Parking", description: `${PARKING.capacity} free spaces right outside` },
                { title: "Fair Village Prices", description: "Our prices are on the live menu" },
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
                  Why Egham Residents Choose The Anchor
                </h3>
                <ul className="space-y-4 text-ink">
                  {[
                    'Free parking right outside',
                    'A traditional village pub atmosphere',
                    'Monthly quiz nights - bring a team of up to 6',
                    'Our celebrated Sunday roasts worth the journey',
                  ].map((item) => (
                    <li key={item} className="flex items-start">
                      <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mr-3 mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
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
          <div className="mx-auto">
            <SectionHeading
              title="How to Find Us from Egham"
            />

            <div className="text-center">
              <p className="text-lg text-ink-muted mb-6">
                We&apos;re on {CONTACT.address.street}, {CONTACT.address.town}. Set your sat nav to {CONTACT.address.postcode}.
              </p>
              <DirectionsButton href={DIRECTIONS_URL} source="egham_pub_directions" variant="outline" size="md">
                Get directions
              </DirectionsButton>
            </div>

            <Card accent className="mt-8">
              <CardBody className="p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-2">Coming as a Group?</h3>
                <p className="text-ink-muted">
                  Organising a club social, a team dinner or an end-of-term get-together? Book a table online, or{' '}
                  <Link href="/private-hire" className="underline">ask about private hire</Link> for a bigger group.
                </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Student & Local Offers */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Perfect for Egham Groups"
            />
            <div className="grid md:grid-cols-2 gap-5">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Group Get-Togethers</h3>
                  <p className="mb-3 text-ink-muted">A short drive from Egham, with free parking</p>
                  <ul className="space-y-2 text-ink">
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Club and society meetups</li>
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
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Monthly Wednesday Quiz Nights</li>
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span><span>Music Bingo with Nikki Manfadge (<Link href="/whats-on" className="underline">see what&apos;s on</Link>)</span></li>
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Sunday Roast (walk-ins welcome, 1pm to 6pm)</li>
                  </ul>
                </CardBody>
              </Card>
            </div>

            <Card accent className="mt-8 text-center">
              <CardBody className="p-8">
                <h3 className="font-display text-h4 text-ink-strong mb-4">Transport Options</h3>
                <div className="text-center">
                  <p className="font-semibold text-ink mb-2">Taxi Services</p>
                  <p className="text-ink-muted">{TAXI_WORDING}</p>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Local Knowledge Section */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="From Egham to The Anchor, Worth Every Mile"
            />
            <div className="prose max-w-none space-y-4 text-ink-muted">
              <p>
                Searching for pubs in Egham? The Anchor is a genuine village pub with character, a short drive away.
              </p>
              <p>
                Then there&rsquo;s the Runnymede crowd. If you&rsquo;ve spent the afternoon at the JFK Memorial or walking the meadows, you&rsquo;re a short drive from us. The Air Forces Memorial on Cooper&rsquo;s Hill is another popular starting point, visitors often tell us they stumbled across The Anchor while looking for somewhere to eat afterwards, and now it&rsquo;s become part of the routine. A reflective walk followed by a quiet pint in the garden feels about right.
              </p>
              <p>
                {DOGS_WORDING} We&rsquo;ve got {PARKING.capacity} free spaces, and the stone-baked pizzas are a genuine draw. It&rsquo;s no wonder so many people searching for pubs near Egham end up making The Anchor their regular.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Opening Hours */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Opening Hours"
            />
            <BusinessHours/>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "How far is The Anchor from Egham?",
            answer: `The Anchor is a short drive from Egham town centre. We're on ${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.postcode}. ${PARKING_WORDING}`
          }
        ]}
        className="bg-canvas"
      />

      {/* CTA Section */}
      <CtaBand
        title="Worth the Journey from Egham"
        copy="Discover why so many Egham residents make The Anchor their regular"
      >
        <Button asChild variant="primary" size="lg">
          <Link href="tel:+441753682707">Call: 01753 682707</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/private-hire#enquiry">Book an Event</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/find-us">Get Directions</Link>
        </Button>
      </CtaBand>
    </>
  )
}
