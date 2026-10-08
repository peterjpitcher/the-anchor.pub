import Link from 'next/link'
import { Button, Card, CardBody, SectionHeading, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { InteriorHero } from '@/components/hero'
import { BookTableButton } from '@/components/BookTableButton'
import { CtaBand } from '@/components/CtaBand'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DirectionsButton } from '@/components/DirectionsButton'
import { Metadata } from 'next'
import { CONTACT, BRAND, PARKING, HEATHROW_TIMES, DRIVE_TIMES, PRICE_RANGE, DIRECTIONS_URL } from '@/lib/constants'
import { PARKING_WORDING, ULEZ_WORDING, DOGS_WORDING } from '@/lib/approved-wording'
import { PRIVATE_HIRE_CAPACITY } from '@/lib/private-hire-capacity'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { HeroBadge } from '@/components/HeroBadge'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
  title: 'Pubs in Ashford Middlesex | Free Parking',
  description: `${BRAND.name} - traditional British pub a short drive from Ashford. Free parking, Sunday roasts, quiz nights & family-friendly.`,
  openGraph: {
    title: 'Pubs in Ashford Middlesex | Free Parking | The Anchor',
    description: 'A short drive from Ashford with free parking. Sunday roasts, British classics, and regular events.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Pubs in Ashford Middlesex | Free Parking | The Anchor',
    description: 'A short drive from Ashford with free parking. Sunday roasts, British classics, and regular events.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/ashford-pub'
  }
}

export default function AshfordPubPage() {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "BarOrPub"],
    "@id": "https://www.the-anchor.pub/ashford-pub#business",
    "name": `${BRAND.name} - Near Ashford`,
    "image": `https://www.the-anchor.pub${DEFAULT_PAGE_HEADER_IMAGE}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": CONTACT.address.street,
      "addressLocality": CONTACT.address.town,
      "addressRegion": "Surrey",
      "postalCode": CONTACT.address.postcode,
      "addressCountry": "GB"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": CONTACT.coordinates.lat,
      "longitude": CONTACT.coordinates.lng
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Ashford"
      },
      {
        "@type": "City",
        "name": "Ashford Common"
      },
      {
        "@type": "Place",
        "name": "Littleton"
      }
    ],
    "priceRange": PRICE_RANGE,
    "servesCuisine": ["British", "Traditional English", "Sunday Roast"],
    "telephone": CONTACT.phoneIntl,
    "url": "https://www.the-anchor.pub/ashford-pub"
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([localBusinessSchema]) }}
      />

      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/ashford-pub/find-us.jpg"
        crumb="Ashford"
        title="Traditional British Pub Near Ashford"
        lead="A short drive from Ashford with free parking"
        actions={
          <BookTableButton source="ashford_pub_hero"
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
              Ashford Pub - Traditional British Pub Near Ashford
            </PageTitle>
            <p className="text-lg text-ink-muted">
              Your local traditional pub, a short drive from Ashford with free parking
            </p>
          </div>
        </Container>
      </section>

      {/* Welcome Section */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto text-center">
            <SectionHeading
              title="Ashford's Favourite Traditional Pub Experience"
              lead="A short drive from Ashford, The Anchor is a proper village pub. Enjoy traditional British hospitality, fantastic food, and a warm welcome in our historic Stanwell Moor location."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: "Easy Access", description: `A short drive, with ${PARKING.capacity} free spaces` },
                { title: "Real Pub Feel", description: "A traditional village pub since 1751" },
                { title: "Outside the ULEZ", description: ULEZ_WORDING },
              ].map((item) => (
                <Card key={item.title} accent>
                  <CardBody className="p-6 text-center">
                    <h3 className="font-display text-h4 text-ink-strong mb-2">{item.title}</h3>
                    <p className="text-sm text-ink-muted">{item.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Why Ashford Residents Choose Us */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Why Ashford Residents Love The Anchor"
            />

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-display text-h3 text-ink-strong mb-4">Worth the Short Journey</h3>
                <ul className="space-y-3 text-ink">
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div><strong>A change of scene</strong> - A peaceful village setting</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div><strong>Fair village prices</strong> - See the <Link href="/food-menu" className="underline">live menu</Link></div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div><strong>{PARKING.capacity} free spaces</strong> - No metres, no charges</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div><strong>Dog-friendly</strong> - {DOGS_WORDING}</div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-display text-h3 text-ink-strong mb-4">Food and Events</h3>
                <ul className="space-y-3 text-ink">
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div><strong>Stone-baked pizzas</strong> - Worth the trip from Ashford for hand-stretched pies</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div><strong>Sunday Roasts</strong> - Walk in 1pm-6pm or book ahead. Groups of 15+ pay a £10 per person deposit.</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div><strong>Entertainment</strong> - Quiz nights, Music Bingo with Nikki Manfadge, pool and darts. <Link href="/whats-on" className="underline">See what&apos;s on</Link>.</div>
                  </li>
                </ul>
              </div>
            </div>

            <Card accent className="mt-8 text-center">
              <CardBody className="p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-2">Plane Spotting Bonus</h3>
                <p className="text-lg text-ink-muted">
                  Our beer garden is under Heathrow&apos;s southern runway approach path. At peak times a plane comes over about every 90 seconds.
                </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Popular with Ashford Groups */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Popular with Ashford Groups"
            />

            <div className="grid md:grid-cols-2 gap-5 mb-8">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Sports & Social</h3>
                  <ul className="space-y-2 text-ink-muted">
                    <li>• Ashford football fans for big matches</li>
                    <li>• Cricket club celebrations</li>
                    <li>• Rugby supporters gatherings</li>
                    <li>• A game of pool or darts</li>
                    <li>• Quiz teams from Ashford</li>
                  </ul>
                </CardBody>
              </Card>

              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Special Occasions</h3>
                  <ul className="space-y-2 text-ink-muted">
                    <li>• Birthday parties</li>
                    <li>• Anniversary dinners</li>
                    <li>• Work leaving dos</li>
                    <li>• Christmas parties</li>
                    <li>• Family gatherings</li>
                  </ul>
                </CardBody>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-lg text-ink-muted mb-6">
                Private hire for Ashford groups, for {PRIVATE_HIRE_CAPACITY.recommendedRange}.
              </p>
              <Button asChild variant="primary" size="lg" wrap>
                <Link href="/private-hire#enquiry">
                  Enquire About Private Hire
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Event Venue for Ashford */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Event Venue for Ashford Celebrations"
              lead="A short drive from Ashford with free parking"
            />

            <div className="grid md:grid-cols-2 gap-5 mb-8">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Why Ashford Chooses The Anchor</h3>
                  <ul className="space-y-3 text-ink">
                    <li className="flex items-start gap-3">
                      <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
                      <span><strong>Avoid town traffic</strong> - Easy access, {PARKING.capacity} free spaces</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
                      <span><strong>Fair village prices</strong> - Our prices are on the live menu</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
                      <span><strong>Private hire</strong> - For {PRIVATE_HIRE_CAPACITY.recommendedRange}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
                      <span><strong>Hired by the hour</strong> - Prices and menus are on the <Link href="/private-hire" className="underline">private hire page</Link></span>
                    </li>
                  </ul>
                </CardBody>
              </Card>

              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Popular Ashford Events</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-ink mb-1">Milestone Birthdays</h4>
                      <p className="text-sm text-ink-muted">18th, 21st, 40th, 50th celebrations</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink mb-1">Engagement Parties</h4>
                      <p className="text-sm text-ink-muted">Celebrate your milestone in style</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink mb-1">Sports Club Events</h4>
                      <p className="text-sm text-ink-muted">End of season parties, presentations</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink mb-1">Christmas Parties</h4>
                      <p className="text-sm text-ink-muted">Festive celebrations for Ashford groups</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            <Card accent className="text-center">
              <CardBody className="p-6">
                <p className="text-lg text-ink mb-4">
                  <strong>Book your Ashford event today!</strong>
                  We love being part of the Ashford community.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild variant="primary" size="md">
                    <Link href="/private-hire">
                      View All Event Options
                    </Link>
                  </Button>
                  <PhoneButton
                    phone="01753 682707"
                    source="ashford_pub_event_cta"
                    variant="outline"
                    size="md"
                  >
                     Call: 01753 682707
                  </PhoneButton>
                  <Button asChild variant="outline" size="md">
                    <Link href="https://wa.me/441753682707" target="_blank" rel="noopener noreferrer">
                       WhatsApp Us
                    </Link>
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Getting Here from Ashford */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Getting to The Anchor from Ashford"
            />

            <div className="text-center">
              <p className="text-lg text-ink-muted mb-6">
                We&apos;re on {CONTACT.address.street}, {CONTACT.address.town}. Set your sat nav to {CONTACT.address.postcode}.
              </p>
              <DirectionsButton
                href={DIRECTIONS_URL}
                source="ashford_directions"
                variant="outline"
                size="md"
              >
                 Get directions
              </DirectionsButton>
            </div>
          </div>
        </Container>
      </section>

      {/* Local Connections */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto text-center">
            <SectionHeading
              title="Ashford to The Anchor - Local Connections"
            />

            <div className="grid md:grid-cols-2 gap-5 mb-8">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Local Areas Served</h3>
                  <ul className="space-y-2 text-ink-muted text-sm">
                    <li>• Ashford Common</li>
                    <li>• Littleton</li>
                    <li>• Charlton Village</li>
                    <li>• Laleham</li>
                  </ul>
                </CardBody>
              </Card>

              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Journey Times</h3>
                  <ul className="space-y-2 text-ink-muted text-sm">
                    <li>• M25 Junction 14: {DRIVE_TIMES.m25Junction14} mins</li>
                    <li>• Heathrow T5: {HEATHROW_TIMES.terminal5} mins</li>
                  </ul>
                </CardBody>
              </Card>
            </div>

            <p className="text-lg text-ink-muted">
              Join the many Ashford residents who've discovered their new favourite pub!
            </p>
          </div>
        </Container>
      </section>

      {/* Ashford Local Knowledge */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Just Beyond the Dual Carriageway"
              className="text-center mb-8"
            />
            <div className="prose max-w-none text-ink-muted space-y-4">
              <p>
                Ashford Middlesex is closer to The Anchor than most people realise. It is a short drive, and
                suddenly you are in a proper village setting with
                fields and a pub that has been pouring pints since 1751. If you are searching for pubs in Ashford,
                the short drive is well worth it.
              </p>
              <p>
                Kitchen times vary by date, so check before you come or call {CONTACT.phone}. Parking&apos;s free,
                so there&apos;s no scrambling for change.
              </p>
              <p>
                On a weekend, bring the kids and the dog, settle into the beer garden and watch the planes come
                over. The garden is next to the car park, so keep little ones with you.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Opening Hours */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto text-center">
            <SectionHeading
              title="Opening Hours"
            />
            <BusinessHours/>
            <p className="mt-4 text-ink-muted">
              Kitchen closes earlier - check times for food service
            </p>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "How far is The Anchor from Ashford town centre?",
            answer: `The Anchor is a short drive from Ashford town centre. We're on ${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.postcode}.`
          },
          {
            question: "Is there parking at The Anchor for Ashford visitors?",
            answer: `Yes. ${PARKING_WORDING}`
          },
          {
            question: "Why come to The Anchor from Ashford?",
            answer: "The Anchor is a traditional village pub with free parking, a large beer garden and planes coming over low. We're outside the ULEZ zone."
          },
          {
            question: "Do you get many customers from Ashford?",
            answer: "Absolutely! Many Ashford residents are regulars here, especially for our Sunday roasts, stone-baked pizzas, and quiz nights. It's a short drive."
          },
          {
            question: "How do I find The Anchor from Ashford?",
            answer: `Set your sat nav to ${CONTACT.address.postcode}, or use the Get directions link on this page.`
          },
          {
            question: "Do you host private events for Ashford groups?",
            answer: `Yes! We regularly host birthday parties, corporate events, and celebrations for Ashford residents. We have space for private hire for ${PRIVATE_HIRE_CAPACITY.recommendedRange}. Contact us to discuss your requirements.`
          }
        ]}
        className="bg-canvas"
      />

      {/* CTA Section */}
      <CtaBand
        title="Worth the Trip from Ashford"
        copy="Join your Ashford neighbours who've discovered their new favourite pub"
      >
        <Button asChild variant="primary" size="lg">
          <Link href="/book-table">Book a Table</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href={CONTACT.phoneHref}>Call Us</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/private-hire#enquiry">Book an Event</Link>
        </Button>
      </CtaBand>
    </>
  )
}
