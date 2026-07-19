import Link from 'next/link'
import { Button, Badge, Card, CardBody, SectionHeading, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { InteriorHero } from '@/components/hero'
import { BookTableButton } from '@/components/BookTableButton'
import { CtaBand } from '@/components/CtaBand'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND, PARKING, HEATHROW_TIMES } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { SUNDAY_ROAST, getSundayRoastContent } from '@/lib/sunday-roast'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { HeroBadge } from '@/components/HeroBadge'

export function generateMetadata(): Metadata {
  const sunday = getSundayRoastContent()
  const sundayPhrase = sunday.isLive
    ? `Sunday roasts ${SUNDAY_ROAST.fromPriceLabel}`
    : `Sunday roast starts ${SUNDAY_ROAST.launchDateLabel}`

  return {
    title: 'Pub Near Staines | Food, Events & Free Parking',
    description: `Pub near Staines with ${sundayPhrase}, stone-baked pizza, quiz nights, private rooms, dog-friendly beer garden and free customer parking.`,
    openGraph: {
      title: 'Pub Near Staines, Beer Garden, Sunday Roasts & Free Parking',
      description: `${sundayPhrase}, dog-friendly beer garden, quiz nights and free parking, 8 mins from Staines-upon-Thames.`,
      images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
    },
    twitter: getTwitterMetadata({
      title: 'Pub Near Staines, Beer Garden, Sunday Roasts & Free Parking',
      description: `${sundayPhrase}, dog-friendly beer garden, quiz nights and free parking, 8 mins from Staines-upon-Thames.`,
      images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
      canonical: '/staines-pub'
    }
  }
}

export default function StainesPubPage() {
  const sunday = getSundayRoastContent()
  // Schema for local SEO
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    "@id": "https://www.the-anchor.pub/staines-pub#business",
    "name": BRAND.name,
    "description": "Traditional Surrey pub serving Staines-upon-Thames and surrounding areas",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": CONTACT.address.street,
      "addressLocality": CONTACT.address.town,
      "addressRegion": CONTACT.address.county,
      "postalCode": CONTACT.address.postcode,
      "addressCountry": CONTACT.address.country
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": CONTACT.coordinates.lat,
      "longitude": CONTACT.coordinates.lng
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Staines-upon-Thames"
      },
      {
        "@type": "City",
        "name": "Stanwell Moor"
      },
      {
        "@type": "City",
        "name": "Stanwell"
      }
    ],
    "priceRange": "££",
    "servesCuisine": ["British", "Pizza", "Sunday Roast"],
    "hasMenu": "https://www.the-anchor.pub/food-menu",
    "telephone": CONTACT.phoneIntl,
    "url": "https://www.the-anchor.pub"
  }

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Pub Near Staines', url: '/staines-pub' }
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema]) }}
      />

      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/staines-pub/find-us.jpg"
        crumb="Staines"
        title="Your Pub Near Staines-upon-Thames"
        lead="Traditional British pub serving the Staines community with great food, entertainment, and a warm welcome"
        actions={
          <BookTableButton source="staines_pub_hero"
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

      {/* Quick Summary */}
      <section className="py-section-y bg-surface">
        <Container>
          <Card accent className="max-w-5xl mx-auto">
            <CardBody className="p-6">
              <h2 className="font-display text-h3 text-ink-strong mb-3">Why We&apos;re One of the Best Pubs Near Staines-upon-Thames</h2>
              <div className="grid gap-3 md:grid-cols-2 text-ink-muted">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-accent-text">•</span>
                  <span>8 minute drive from Staines High Street with free parking</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-accent-text">•</span>
                  <span>Sunday roasts, stone-baked pizzas and seasonal specials</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-accent-text">•</span>
                  <span>Hosted nights like Music Bingo with Nikki Manfadge, quiz nights and charity bingo</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-accent-text">•</span>
                  <span>Family-friendly seating with kids menu and space for buggies</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </Container>
      </section>

      {/* Page Title for SEO */}
      <section className="py-section-y bg-canvas">
        <Container>
          <PageTitle
            className="text-center"
            seo={{ structured: true, speakable: true }}
          >
            Pub Near Staines-upon-Thames, The Anchor
          </PageTitle>
        </Container>
      </section>

      {/* Why Choose The Anchor */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              title="Why Locals Choose Us Over Other Pubs in Staines"
              lead="Just a short drive from Staines-upon-Thames, The Anchor offers a proper British pub experience away from the busy high street"
              className="text-center mb-12"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: "Easy Access from Staines", description: `8 minutes via A30\nFree parking for ${PARKING.capacity} cars\nRegular bus service` },
                { title: "Famous Sunday Roasts", description: "Our renowned roasts\nServed 1pm-6pm\nWalk in or book ahead, no pre-order needed\nRegular menu also available" },
                { title: "Unique Entertainment", description: "Hosted nights like Music Bingo with Nikki Manfadge\nQuiz nights and bingo\nSee /whats-on for the latest" },
                { title: "Stone-Baked Pizzas", description: "Hand-stretched bases\nRich tomato sauce\nGenerous toppings" },
                { title: "Beer Garden Paradise", description: "Dog-friendly outdoor space\nHeathrow plane spotting" },
                { title: "Community Hub", description: "Private function room\nBirthday parties welcome\nCorporate events catered" },
              ].map((item) => (
                <Card key={item.title} accent>
                  <CardBody className="p-6 text-center">
                    <h3 className="font-display text-h4 text-ink-strong mb-2">{item.title}</h3>
                    <p className="text-sm text-ink-muted whitespace-pre-line">{item.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-canvas">
        <Container>
          <SectionHeading
            title="Private Rooms & Event Hire Near Staines"
            lead="Flexible spaces for celebrations, parties and family gatherings."
          />
          <div className="grid md:grid-cols-2 gap-5">
            <Card accent>
              <CardBody className="p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-3">Private rooms near Staines</h3>
                <p className="mb-4 text-ink-muted">
                  Planning a birthday, wake or team night? Our private dining room is a popular option for
                  groups searching for pubs with private rooms in Staines, with free parking and tailored menus.
                </p>
                <Link href="/private-hire" className="text-accent-text font-semibold hover:underline transition">
                  Explore function room hire →
                </Link>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody className="p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-3">Event hire in the Staines area</h3>
                <p className="mb-4 text-ink-muted">
                  We host private events near Staines with flexible layouts, buffet or three-course menus,
                  and dedicated support for speeches and playlists.
                </p>
                <Link href="/private-hire/milestone-birthdays" className="text-accent-text font-semibold hover:underline transition">
                  View private party options →
                </Link>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Journey from Staines */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Getting Here from Staines"
              className="text-center mb-12"
            />

            <div className="grid md:grid-cols-2 gap-5">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">By Car (8 minutes)</h3>
                  <ol className="space-y-2 list-decimal list-inside text-ink-muted">
                    <li>Head west on the A30 from Staines town centre</li>
                    <li>Continue through Stanwell village</li>
                    <li>Turn left onto Horton Road</li>
                    <li>The Anchor is on your right with free parking</li>
                  </ol>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">By Public Transport</h3>
                  <ul className="space-y-2 text-ink-muted">
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Bus routes from Staines Bus Station</li>
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Regular services throughout the day</li>
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Stop: Horton Road/The Anchor</li>
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Journey time: 15-20 minutes</li>
                  </ul>
                </CardBody>
              </Card>
            </div>

            <Card accent className="mt-8 text-center">
              <CardBody className="p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-3">Also conveniently located near:</h3>
                <div className="flex flex-wrap justify-center gap-4 text-ink-muted">
                  <span>• Heathrow T5: {HEATHROW_TIMES.terminal5} mins</span>
                  <span>• Ashford: 10 mins</span>
                  <span>• Sunbury: 15 mins</span>
                  <span>• Feltham: 12 mins</span>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* What's On This Week */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="What's On at Your Staines Local"
              className="text-center mb-12"
            />

            <div className="space-y-6">
              <Card accent className="border-l-4 border-l-anchor-gold">
                <CardBody className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display text-h4 text-ink-strong">Thursday</h3>
                    <Badge variant="gold">QUIZ</Badge>
                  </div>
                  <p className="text-ink-muted">Quiz Night - Win bar tabs and prizes! See /whats-on for details.</p>
                </CardBody>
              </Card>

              <Card accent className="border-l-4 border-l-anchor-gold">
                <CardBody className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display text-h4 text-ink-strong">Sunday</h3>
                    <Badge variant="green">ROASTS</Badge>
                  </div>
                  <p className="text-ink-muted">
                    {sunday.isLive ? 'Famous Sunday roasts served 1pm-6pm. Walk in or book ahead, no pre-order needed.' : `Famous Sunday roasts start ${SUNDAY_ROAST.launchDateLabel}. Book ahead for launch Sundays.`}
                  </p>
                </CardBody>
              </Card>

              <Card accent className="border-l-4 border-l-anchor-gold">
                <CardBody className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display text-h4 text-ink-strong">Monthly</h3>
                    <Badge variant="sand">HOSTED</Badge>
                  </div>
                  <p className="text-ink-muted">Hosted nights with Nikki Manfadge (including Music Bingo) and one-off events. See /whats-on for details.</p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Event Venue Section */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeading
              title="Popular Venue for Staines Events"
              lead="Host your special occasion at The Anchor - just 8 minutes from Staines"
            />

            <div className="grid md:grid-cols-2 gap-5 mb-8">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Perfect for Staines Residents</h3>
                  <ul className="space-y-3 text-ink-muted">
                    <li className="flex items-start gap-3">
                      <span className="text-accent-text font-bold">✓</span>
                      <span><strong className="text-ink">Quick journey</strong> - Just 8 minutes from Staines town centre</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent-text font-bold">✓</span>
                      <span><strong className="text-ink">Free parking</strong> - No expensive town centre rates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent-text font-bold">✓</span>
                      <span><strong className="text-ink">Competitive prices</strong> - Better value than Staines venues</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent-text font-bold">✓</span>
                      <span><strong className="text-ink">Flexible spaces</strong> - From intimate gatherings to large parties</span>
                    </li>
                  </ul>
                </CardBody>
              </Card>

              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Popular Events from Staines</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-ink mb-1">Birthday Parties</h4>
                      <p className="text-sm text-ink-muted">Celebrate milestones with custom packages</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink mb-1">Corporate Events</h4>
                      <p className="text-sm text-ink-muted">Team meetings and Christmas parties</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink mb-1">Engagement Parties</h4>
                      <p className="text-sm text-ink-muted">Celebrate your milestone with friends and family</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink mb-1">Memorial Services</h4>
                      <p className="text-sm text-ink-muted">Respectful space for celebrations of life</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            <Card accent className="text-center">
              <CardBody className="p-6">
                <p className="text-lg text-ink mb-4">
                  <strong>Flexible venue hire pricing!</strong> Tailored to your event.
                  We're always willing to discuss your needs and budget.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/private-hire">
                    <Button variant="primary" size="md">
                      View Event Options
                    </Button>
                  </Link>
                  <PhoneButton
                    phone="01753 682707"
                    source="staines_pub_event_enquiry"
                    variant="outline"
                    size="md"
                  >
                    Quick Enquiry
                  </PhoneButton>
                  <Link href="https://wa.me/441753682707?text=Hi,%20I" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="md">
                      WhatsApp
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Opening Hours */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-2xl mx-auto">
            <SectionHeading
              title="Opening Hours"
              className="text-center mb-8"
            />
            <BusinessHours />
          </div>
        </Container>
      </section>

      {/* Why Staines Residents Choose The Anchor Over the High Street */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="A Different Night Out from the Pubs in Staines"
              className="text-center mb-8"
            />
            <div className="prose max-w-none text-ink-muted space-y-4">
              <p>
                If you&apos;re searching for pubs in Staines, the high street has no shortage, The Swan, The Bells, the Wetherspoons on the corner, but
                anyone who has tried to get a table on a Friday night knows the drill. Packed bars, queues at the door,
                and nowhere to park without feeding a meter. The Anchor offers something genuinely different: a proper
                village pub with free parking, a spacious beer garden, and none of the weekend crush.
              </p>
              <p>
                The drive is straightforward. Cross Staines Bridge, pick up the A30 heading toward Heathrow, and take
                a left onto Stanwell Moor Road. In ten to twelve minutes you are pulling into our car park, no circling
                side streets, no pay-and-display. On a Saturday afternoon, when Staines High Street is heaving with
                shoppers and the Two Rivers car parks are rammed, The Anchor is a quieter alternative where you can
                actually hear yourself talk.
              </p>
              <p>
                Most locals still call it Staines rather than Staines-upon-Thames, whatever the council decided back
                in 2012. Either way, we&apos;re one of the friendliest pubs Staines-upon-Thames has nearby, just outside the town boundary but close enough for an easy weeknight meal
                or a lazy Sunday roast without battling for a space on the one-way system. Many of our regulars
                discovered us exactly that way, looking for somewhere with decent food, draught beers, and room to breathe.
                Once they tried the stone-baked pizzas and caught a sunset in the beer garden with the planes coming
                over, they stopped bothering with the High Street altogether.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <InternalLinkingSection
        title="More To Explore Near Staines"
        links={[
          { href: '/food-menu', title: 'Food Menu', description: 'See Sunday roasts, burgers and stone-baked pizzas' },
          { href: '/whats-on', title: "What's On", description: 'Check Music Bingo, quiz nights and live sport' },
          { href: '/private-hire', title: 'Book a Celebration', description: 'Host birthdays, wakes and anniversaries' },
          { href: '/drinks', title: 'Drinks Menu', description: 'Perfect garden cocktail before strolling along the Thames' }
        ]}
        className="py-section-y"
      />

      <OrganicSearchClusterLinks
        cluster="localPub"
        currentPath="/staines-pub"
        title="Compare local pub pages"
        intro="Use these local pages for Stanwell, Staines and directions searches before you book."
      />

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "How far is The Anchor from Staines?",
            answer: "The Anchor is just 8 minutes drive from Staines town centre via the A30. We're located on Horton Road in Stanwell Moor, with free parking available."
          },
          {
            question: "What makes The Anchor different from other pubs in Staines?",
            answer: "We offer unique entertainment including hosted nights like Music Bingo with Nikki Manfadge, quiz nights, famous Sunday roasts, stone-baked pizzas, plus a dog-friendly beer garden with plane spotting views of Heathrow. Unlike most pubs in Staines-upon-Thames, we have free parking and a spacious outdoor garden. See /whats-on for the latest events."
          },
          {
            question: "Do you have parking at your Staines area pub?",
            answer: `Yes! We have ${PARKING.description} with space for ${PARKING.capacity} cars, plus extended parking nearby if needed.`
          },
          {
            question: "Do you have private rooms near Staines?",
            answer: "Yes. We offer private rooms and flexible layouts for birthdays, wakes and group celebrations. See the function room hire page or call 01753 682707 to plan your event."
          },
          {
            question: "Can we book private events in the Staines area?",
            answer: "We host private events near Staines with buffet or seated menu options, a dedicated event team, and free on-site parking. Contact us to check dates."
          }
        ]}
        className="bg-canvas"
      />

      {/* CTA Section */}
      <CtaBand
        title="Visit Staines' Favourite Local Pub"
        copy="Just 8 minutes from Staines town centre with free parking"
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
        <Link href="https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor">
          <Button variant="outline" size="lg">Get Directions from Staines</Button>
        </Link>
      </CtaBand>
    </>
  )
}
