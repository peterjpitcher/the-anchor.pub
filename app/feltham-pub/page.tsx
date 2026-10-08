import Link from 'next/link'
import { Button, Card, CardBody, SectionHeading, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { InteriorHero } from '@/components/hero'
import { BookTableButton } from '@/components/BookTableButton'
import { CtaBand } from '@/components/CtaBand'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND, DIRECTIONS_URL } from '@/lib/constants'
import { PARKING_WORDING, ROOM_HIRE_WORDING } from '@/lib/approved-wording'
import { PRIVATE_HIRE_CAPACITY } from '@/lib/private-hire-capacity'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { SUNDAY_ROAST, getSundayRoastContent } from '@/lib/sunday-roast'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { HeroBadge } from '@/components/HeroBadge'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { DirectionsButton } from '@/components/DirectionsButton'

export function generateMetadata(): Metadata {
  const sunday = getSundayRoastContent()
  const sundayPhrase = sunday.isLive
    ? `Sunday roasts ${SUNDAY_ROAST.fromPriceLabel}`
    : `Sunday roast starts ${SUNDAY_ROAST.launchDateLabel}`

  return {
    title: 'Pub Near Feltham | Free Parking & Sunday Roasts',
    description: `Looking for pubs near Feltham? A relaxed village pub a short drive away, with free parking, ${sundayPhrase}, stone-baked pizzas and quiz nights.`,
    openGraph: {
      title: 'Pub Near Feltham | Free Parking & Sunday Roasts | The Anchor',
      description: `Pubs near Feltham, a short drive away with free parking, ${sundayPhrase}, stone-baked pizzas and quiz nights.`,
      images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
    },
    twitter: getTwitterMetadata({
      title: 'Pub Near Feltham | Free Parking & Sunday Roasts | The Anchor',
      description: `Pubs near Feltham, a short drive away with free parking, ${sundayPhrase}, stone-baked pizzas and quiz nights.`,
      images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
      canonical: '/feltham-pub'
    }
  }
}

export default function FelthamPubPage() {
  const sunday = getSundayRoastContent()
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    "name": BRAND.name,
    "description": "Traditional British pub serving Feltham residents with great food, drinks, and entertainment.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": CONTACT.address.street,
      "addressLocality": CONTACT.address.town,
      "addressRegion": "Surrey",
      "postalCode": CONTACT.address.postcode,
      "addressCountry": "GB"
    },
    "areaServed": {
      "@type": "City",
      "name": "Feltham",
      "containedInPlace": {
        "@type": "AdministrativeArea",
        "name": "London Borough of Hounslow"
      }
    },
    "telephone": "+441753682707",
    "url": "https://www.the-anchor.pub/feltham-pub"
  }


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([localBusinessSchema]) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Pub Near Feltham', url: '/feltham-pub' }
        ]}
      />

      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/feltham-pub/find-us.jpg"
        crumb="Feltham"
        title="Your Local Pub Near Feltham"
        lead="A short drive away with free parking"
        actions={
          <BookTableButton source="feltham_pub_hero"
          context="local_pub" variant="primary" size="lg" fullWidth>
          Book a Table
        </BookTableButton>
        }
      />

      <section className="py-section-y bg-canvas">
        <Container>
          <HeroBadge className="text-sm" />
        </Container>
      </section>

      {/* Page Title */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto text-center">
            <PageTitle
              seo={{
                structured: true,
                speakable: true
              }}
              className="mb-4"
            >
              Pub Near Feltham, Traditional British Pub with Free Parking
            </PageTitle>
            <p className="text-lg text-ink-muted">
              Your local traditional pub, a short drive from Feltham with free parking
            </p>
          </div>
        </Container>
      </section>

      {/* Distance & Benefits */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Feltham's Favourite Village Escape"
              lead="A proper traditional village pub, a short drive from Feltham"
              className="text-center mb-12"
            />

            {/* Key Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {[
                { title: "Quick Drive", description: "A short drive from Feltham" },
                { title: "Peaceful Setting", description: "Village atmosphere away from busy Feltham traffic" },
                { title: "Plane Spotting", description: "Unique beer garden under the Heathrow flight path" },
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
                  Why Feltham Residents Choose The Anchor
                </h3>
                <ul className="space-y-4 text-ink">
                  <li className="flex items-start">
                    <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mr-3 mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
                    <span>{PARKING_WORDING}</span>
                  </li>
                  <li className="flex items-start">
                    <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mr-3 mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
                    <span>A traditional village pub atmosphere</span>
                  </li>
                  <li className="flex items-start">
                    <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mr-3 mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
                    <span>Celebrated Sunday roasts {sunday.isLive ? 'served 1pm-6pm, walk in or book ahead, no pre-order needed.' : `start ${SUNDAY_ROAST.launchDateLabel}.`}</span>
                  </li>
                  <li className="flex items-start">
                    <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mr-3 mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
                    <span>Music Bingo hosted by Nikki Manfadge, monthly quiz nights and one-off events. <Link href="/whats-on" className="underline">See what&apos;s on</Link>.</span>
                  </li>
                  <li className="flex items-start">
                    <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mr-3 mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
                    <span>Perfect for Feltham work colleagues' gatherings</span>
                  </li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Directions */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="How to Find Us from Feltham"
            />

            <div className="text-center">
              <p className="text-lg text-ink-muted mb-6">
                We&apos;re on {CONTACT.address.street}, {CONTACT.address.town}. Set your sat nav to {CONTACT.address.postcode}.
              </p>
              <DirectionsButton href={DIRECTIONS_URL} source="feltham_pub_directions" variant="outline" size="md">
                Get directions
              </DirectionsButton>
            </div>
          </div>
        </Container>
      </section>

      {/* For Feltham groups */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Perfect for Feltham Groups"
            />
            <div className="grid md:grid-cols-2 gap-5">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Work Gatherings</h3>
                  <p className="mb-3 text-ink-muted">The dining room, the garden or the whole pub can be hired by the hour. Prices and menus are on the <Link href="/private-hire" className="underline">private hire page</Link>.</p>
                  <ul className="space-y-2 text-ink">
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Buffet menus from current catering packages</li>
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Free parking for all guests</li>
                  </ul>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Weekend Escapes</h3>
                  <p className="mb-3 text-ink-muted">Join Feltham locals who make The Anchor their weekend destination.</p>
                  <ul className="space-y-2 text-ink">
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span><span>Music Bingo with Nikki Manfadge (<Link href="/whats-on" className="underline">see what&apos;s on</Link>)</span></li>
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Sunday roasts {sunday.isLive ? 'served 1pm-6pm, walk in or book ahead, no pre-order needed.' : `start ${SUNDAY_ROAST.launchDateLabel}.`}</li>
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Quiz nights & bingo</li>
                  </ul>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Event Venue for Feltham */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Private Events for Feltham Residents"
              lead="The perfect venue, a short drive from Feltham"
            />

            <div className="grid md:grid-cols-2 gap-5 mb-8">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Why Feltham Chooses Us</h3>
                  <ul className="space-y-3 text-ink">
                    <li className="flex items-start gap-3">
                      <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
                      <span><strong>A short drive</strong> - Closer than central London venues</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
                      <span><strong>Free parking for all guests</strong> - Save on town centre fees</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
                      <span><strong>Fair village prices</strong> - Our prices are on the live menu</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
                      <span><strong>Trusted by locals</strong> - Regular venue for Feltham groups</span>
                    </li>
                  </ul>
                </CardBody>
              </Card>

              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Popular Feltham Events</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-ink mb-1">Birthday Parties</h4>
                      <p className="text-sm text-ink-muted">From kids parties to 50th celebrations</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink mb-1">Baby Showers</h4>
                      <p className="text-sm text-ink-muted">Perfect space for afternoon celebrations</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink mb-1">Community Events</h4>
                      <p className="text-sm text-ink-muted">Club meetings, fundraisers, social groups</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink mb-1">Wakes & Memorials</h4>
                      <p className="text-sm text-ink-muted">Respectful venue for celebrations of life</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            <Card accent className="text-center">
              <CardBody className="p-6">
                <p className="text-lg text-ink mb-4">
                  {ROOM_HIRE_WORDING} {PRIVATE_HIRE_CAPACITY.summary}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild variant="primary" size="md">
                    <Link href="/private-hire">
                      Party Venue Info
                    </Link>
                  </Button>
                  <PhoneButton
                    phone="01753 682707"
                    source="feltham_pub_event_quote"
                    variant="outline"
                    size="md"
                  >
                     Quick Quote
                  </PhoneButton>
                  <Button asChild variant="outline" size="md">
                    <Link href="https://wa.me/441753682707" target="_blank" rel="noopener noreferrer">
                       WhatsApp
                    </Link>
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Feltham Workers & Weekend Escape */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="The Feltham Workers' Local"
              className="text-center mb-8"
            />
            <div className="prose max-w-none text-ink-muted space-y-4">
              <p>
                Feltham's commercial corridor stretches from Bedfont Lakes Business Park through to the trading estates
                along Feltham Hill Road. If you are finishing a shift and fancy a proper sit-down meal, The Anchor is a
                short drive away, with free parking and hearty pub food. Kitchen times vary by date, so check
                before you come or call {CONTACT.phone}. It is the kind of place where you can unwind with a pint of draught beer and a
                stone-baked pizza.
              </p>
              <p>
                Coming from Feltham station? It is a short drive by taxi. Heading home after an England match at
                Twickenham? The Anchor has free parking, and it is a relaxed way to keep the evening going.
              </p>
              <p>
                For those after pubs near Feltham
                with real character, a proper beer garden under the Heathrow flight path, and events like Music Bingo and
                monthly Wednesday quiz nights, The Anchor is well worth the short drive. Come for a lazy Sunday roast and see.
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

      <OrganicSearchClusterLinks
        cluster="localPub"
        currentPath="/feltham-pub"
        title="More local guides"
        intro="More on the food, the pub and how to find us."
      />

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "How far is The Anchor from Feltham?",
            answer: `The Anchor is a short drive from Feltham town centre. We're on ${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.postcode}. ${PARKING_WORDING}`
          },
          {
            question: "Do you deliver to Feltham?",
            answer: "We offer takeaway service for all our food menu items - just call ahead on 01753 682707 to place your order for collection. We don't offer delivery, but you're welcome to collect your order from our Stanwell Moor location."
          }
        ]}
        className="bg-canvas"
      />

      {/* CTA Section */}
      <CtaBand
        title="Experience the Difference"
        copy="See why so many Feltham residents make the short journey to The Anchor"
      >
        <Button asChild variant="primary" size="lg">
          <Link href="/book-table">Book a Table</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
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
