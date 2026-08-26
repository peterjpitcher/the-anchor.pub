import Link from 'next/link'
import { Button, Card, CardBody, SectionHeading, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { InteriorHero } from '@/components/hero'
import { BookTableButton } from '@/components/BookTableButton'
import { CtaBand } from '@/components/CtaBand'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DirectionsButton } from '@/components/DirectionsButton'
import { generateHowToDirectionsSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND, PARKING } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { HeroBadge } from '@/components/HeroBadge'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
  title: 'Pubs in Ashford Middlesex | Free Parking',
  description: `${BRAND.name} - traditional British pub 10 mins from Ashford. Free parking, Sunday roasts, quiz nights & family-friendly. Easy A30 access.`,
  openGraph: {
    title: 'Pubs in Ashford Middlesex | Free Parking | The Anchor',
    description: 'Just 10 minutes from Ashford with free parking. Sunday roasts, British classics, and regular events.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Pubs in Ashford Middlesex | Free Parking | The Anchor',
    description: 'Just 10 minutes from Ashford with free parking. Sunday roasts, British classics, and regular events.',
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
    "priceRange": "££",
    "servesCuisine": ["British", "Traditional English", "Sunday Roast"],
    "telephone": CONTACT.phoneIntl,
    "url": "https://www.the-anchor.pub/ashford-pub"
  }

  const directionsSchema = generateHowToDirectionsSchema(
    'Ashford Surrey',
    'The Anchor - Heathrow Pub & Dining',
    [
      'From Ashford town centre, head west on Church Road/B377',
      'Continue onto Fordbridge Road',
      'At the roundabout, take the 2nd exit onto A30 (Staines Road West)',
      'Continue for about 2 miles',
      'Turn right onto Horton Road (look for Stanwell Moor signs)',
      'The Anchor will be on your right with free parking'
    ]
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([localBusinessSchema, directionsSchema]) }}
      />

      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/ashford-pub/find-us.jpg"
        crumb="Ashford"
        title="Traditional British Pub Near Ashford"
        lead="Just 10 minutes from Ashford with free parking"
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
              Your local traditional pub just 10 minutes from Ashford with free parking
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
              lead="Just a 10-minute drive from Ashford, The Anchor offers the perfect escape from busy town life. Enjoy traditional British hospitality, fantastic food, and a warm welcome in our historic Stanwell Moor location."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: "Easy Access", description: "10 minutes via A30 with 20 free parking spaces" },
                { title: "Real Pub Feel", description: "Traditional atmosphere Ashford chain pubs can't match" },
                { title: "ULEZ Free", description: "Save £12.50 - we're outside the zone!" },
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
                    <div><strong>Escape Ashford's busy high street</strong> - Peaceful village setting with countryside views</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div><strong>Better value than Ashford pubs</strong> - Proper portions at village pub prices</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div><strong>Free parking always available</strong> - No metres, no stress, no charges</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div><strong>Dog-friendly throughout</strong> - Perfect after Ashford Common walks</div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-display text-h3 text-ink-strong mb-4">Special Events & Offers</h3>
                <ul className="space-y-3 text-ink">
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div><strong>Stone-baked pizzas</strong> - Worth the trip from Ashford for hand-stretched pies</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div><strong>Sunday Roasts</strong> - Walk in 1pm-6pm or book ahead. Groups of 15+ pay a £10 per person deposit. Ashford folks fill tables fast!</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div><strong>Entertainment</strong> - Quiz nights, hosted nights like Music Bingo with Nikki Manfadge, pool & darts (see /whats-on)</div>
                  </li>
                </ul>
              </div>
            </div>

            <Card accent className="mt-8 text-center">
              <CardBody className="p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-2">Plane Spotting Bonus</h3>
                <p className="text-lg text-ink-muted">
                  Watch aircraft overhead every 90 seconds - entertainment Ashford pubs can't offer!
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
                    <li>• Darts and pool leagues</li>
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
                Private areas available for Ashford groups - from intimate dinners to parties of 250!
              </p>
              <Link href="/private-hire#enquiry">
                <Button
                  variant="primary"
                  size="lg"
                >
                  Enquire About Private Hire
                </Button>
              </Link>
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
              lead="Just 10 minutes from Ashford with free parking"
            />

            <div className="grid md:grid-cols-2 gap-5 mb-8">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Why Ashford Chooses The Anchor</h3>
                  <ul className="space-y-3 text-ink">
                    <li className="flex items-start gap-3">
                      <span className="text-accent-text font-bold">✓</span>
                      <span><strong>Avoid town traffic</strong> - Easy access, ample parking</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent-text font-bold">✓</span>
                      <span><strong>Better value</strong> - No inflated town centre prices</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent-text font-bold">✓</span>
                      <span><strong>Flexible spaces</strong> - Private hire for 10+ to 150 guests</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent-text font-bold">✓</span>
                      <span><strong>Tailored pricing for every event</strong> - Let's discuss your needs</span>
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
                  <Link href="/private-hire">
                    <Button
                      variant="primary"
                      size="md"
                    >
                      View All Event Options
                    </Button>
                  </Link>
                  <PhoneButton
                    phone="01753 682707"
                    source="ashford_pub_event_cta"
                    variant="outline"
                    size="md"
                  >
                     Call: 01753 682707
                  </PhoneButton>
                  <Link href="https://wa.me/441753682707?text=Hi,%20I" target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="outline"
                      size="md"
                    >
                       WhatsApp Us
                    </Button>
                  </Link>
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

            <div className="grid md:grid-cols-2 gap-5">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Driving Directions</h3>
                  <ol className="space-y-3 text-ink">
                    <li className="flex gap-3"><span className="font-bold text-accent-text">1.</span><span>From Ashford centre, head west on Church Road</span></li>
                    <li className="flex gap-3"><span className="font-bold text-accent-text">2.</span><span>Continue onto Fordbridge Road</span></li>
                    <li className="flex gap-3"><span className="font-bold text-accent-text">3.</span><span>Join the A30 westbound (Staines Road)</span></li>
                    <li className="flex gap-3"><span className="font-bold text-accent-text">4.</span><span>After 2 miles, turn right onto Horton Road</span></li>
                    <li className="flex gap-3"><span className="font-bold text-accent-text">5.</span><span>The Anchor is on your right - look for our sign!</span></li>
                  </ol>
                  <p className="mt-4 text-sm text-ink-muted">
                    <strong className="text-ink">Journey time:</strong> 10 minutes in normal traffic
                  </p>
                </CardBody>
              </Card>

              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Alternative Routes</h3>
                  <div className="space-y-4 text-ink-muted">
                    <div>
                      <p className="font-semibold text-ink mb-2">Via Ashford Common</p>
                      <p>Through Ashford Common and Stanwell - scenic route past the reservoirs</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink mb-2">Via Staines</p>
                      <p>A308 to Staines, then A30 to Stanwell Moor</p>
                    </div>
                    <div className="pt-4 border-t border-line">
                      <p className="font-semibold text-accent-text">Quick Tip</p>
                      <p>Avoid Heathrow traffic - use Stanwell Moor Road via Bedfont</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <DirectionsButton
                href="https://maps.google.com/maps?saddr=Ashford+Surrey&daddr=The+Anchor+Stanwell+Moor+TW19+6AQ"
                source="ashford_directions"
                variant="outline"
                size="md"
                fromLocation="Ashford Surrey"
              >
                 Get Directions from Ashford
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

            <div className="grid md:grid-cols-3 gap-5 mb-8">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Nearby Landmarks</h3>
                  <ul className="space-y-2 text-ink-muted text-sm">
                    <li>• 2 miles from Queen Mary Reservoir</li>
                    <li>• 3 miles from Ashford Hospital</li>
                    <li>• Next to St Mary's Church</li>
                    <li>• 5 mins from M25 Junction 14</li>
                  </ul>
                </CardBody>
              </Card>

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
                    <li>• Ashford Station: 12 mins</li>
                    <li>• Ashford Hospital: 8 mins</li>
                    <li>• Spelthorne Leisure: 10 mins</li>
                    <li>• Heathrow T5: 7 mins</li>
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
                Ashford Middlesex is closer to The Anchor than most people realise. Head west on the A30 past Clockhouse
                Roundabout, follow it for a couple of miles, and turn right onto Horton Road, eight to ten minutes
                door to door. You cross the dual carriageway and suddenly you are in a proper village setting with
                fields, a church, and a pub that has been pouring pints since 1751. If you are searching for pubs in Ashford
                that offer something beyond the usual high-street chains, the short drive is well worth it.
              </p>
              <p>
                We see a lot of Ashford Hospital staff, especially those finishing late shifts and looking for
                somewhere with a warm kitchen and a decent pint. Our kitchen opens at 6pm on weekdays, which suits
                nurses and support staff who clock off in the afternoon and want a proper meal rather than a
                supermarket sandwich. The hospital is only about eight minutes away, and the free parking means no
                scrambling for change after a long day on your feet.
              </p>
              <p>
                Golfers from Ashford Manor Golf Club have been known to make the short detour for a post-round meal
                and a celebratory (or consolation) pint. The club is barely ten minutes from our door, and a
                stone-baked pizza after eighteen holes is hard to beat. On weekends, families from the Ashford Common
                area bring the kids and the dog, settle into the beer garden, and watch the planes come over while
                the little ones run around. It is exactly the kind of afternoon you cannot get in a town-centre pub.
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
            answer: "The Anchor is approximately 3.5 miles from Ashford town centre, which is about a 10-minute drive via the A30. We're located in Stanwell Moor, just past Ashford Hospital."
          },
          {
            question: "Is there parking at The Anchor for Ashford visitors?",
            answer: "Yes! We have 20 free parking spaces available for all our guests. Unlike Ashford town centre, you'll never have to worry about parking metres or charges here."
          },
          {
            question: "What makes The Anchor different from pubs in Ashford?",
            answer: "The Anchor offers a genuine traditional village pub experience with better value, free parking, a large beer garden, and unique features like plane spotting. Plus, we're outside the ULEZ zone, saving you £12.50 if coming from London."
          },
          {
            question: "Do you get many customers from Ashford?",
            answer: "Absolutely! Many Ashford residents are regulars here, especially for our Sunday roasts, stone-baked pizzas, and quiz nights. The 10-minute journey is worth it for the authentic pub atmosphere and better prices."
          },
          {
            question: "What's the best route from Ashford to avoid traffic?",
            answer: "The quickest route is via the A30 westbound. To avoid Heathrow traffic during peak times, you can go through Ashford Common and Bedfont. Our postcode TW19 6AQ works perfectly with sat nav."
          },
          {
            question: "Do you host private events for Ashford groups?",
            answer: "Yes! We regularly host birthday parties, corporate events, and celebrations for Ashford residents. We have space for private hire from 10+ to 150 guests. Contact us to discuss your requirements."
          }
        ]}
        className="bg-canvas"
      />

      {/* CTA Section */}
      <CtaBand
        title="Worth the Trip from Ashford"
        copy="Join your Ashford neighbours who've discovered their new favourite pub"
      >
        <Link href="/book-table">
          <Button variant="primary" size="lg">Book a Table</Button>
        </Link>
        <Link href={CONTACT.phoneHref}>
          <Button variant="outline" size="lg">Call Us</Button>
        </Link>
        <Link href="/private-hire#enquiry">
          <Button variant="outline" size="lg">Book an Event</Button>
        </Link>
      </CtaBand>
    </>
  )
}
