import { TournamentLinkInWindow } from '@/components/features/nations-championship/TournamentLinkInWindow'
import { isNationsChampionshipPromoOpen } from '@/lib/nations-championship/promo-window'
import Link from 'next/link'
import { Button, Badge, Card, CardBody, SectionHeading, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { InteriorHero } from '@/components/hero'
import { BookTableButton } from '@/components/BookTableButton'
import { CtaBand } from '@/components/CtaBand'
import { DirectionsButton } from '@/components/DirectionsButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND, PARKING, HEATHROW_TIMES, DRIVE_TIMES, BUS_WORDING, PRICE_RANGE, DIRECTIONS_URL } from '@/lib/constants'
import { FAMILIES_WORDING, PARKING_WORDING, ROOM_HIRE_WORDING } from '@/lib/approved-wording'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { SUNDAY_ROAST, getSundayRoastContent } from '@/lib/sunday-roast'
import { ChristmasCrossLink } from '@/components/features/christmas/ChristmasCrossLink'

// Daily regeneration so the seasonal Christmas cross-link appears and removes
// itself on time. The page was fully static before, which would have frozen
// the season gate at whatever the last deploy happened to see.
export const revalidate = 86400
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { HeroBadge } from '@/components/HeroBadge'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export function generateMetadata(): Metadata {
  const sunday = getSundayRoastContent()
  const sundayPhrase = sunday.isLive
    ? `Sunday roasts ${SUNDAY_ROAST.fromPriceLabel}`
    : `Sunday roast starts ${SUNDAY_ROAST.launchDateLabel}`

  return {
    title: 'Pub Near Staines | Food, Events & Free Parking',
    description: `Pub near Staines with ${sundayPhrase}, stone-baked pizza, quiz nights, private hire, dog-friendly beer garden and free customer parking.`,
    openGraph: {
      title: 'Pub Near Staines, Beer Garden, Sunday Roasts & Free Parking',
      description: `${sundayPhrase}, dog-friendly beer garden, quiz nights and free parking, ${DRIVE_TIMES.staines} mins from Staines-upon-Thames.`,
      images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
    },
    twitter: getTwitterMetadata({
      title: 'Pub Near Staines, Beer Garden, Sunday Roasts & Free Parking',
      description: `${sundayPhrase}, dog-friendly beer garden, quiz nights and free parking, ${DRIVE_TIMES.staines} mins from Staines-upon-Thames.`,
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
    "priceRange": PRICE_RANGE,
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
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([localBusinessSchema]) }}
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
      <TournamentLinkInWindow initiallyOpen={isNationsChampionshipPromoOpen()} />

      <section className="py-section-y bg-canvas">
        <Container>
          <HeroBadge className="text-sm" />
        </Container>
      </section>

      {/* Quick Summary */}
      <section className="py-section-y bg-surface">
        <Container>
          <Card accent className="mx-auto">
            <CardBody className="p-6">
              <h2 className="font-display text-h3 text-ink-strong mb-3">Why We&apos;re a Highly Rated Pub Near Staines-upon-Thames</h2>
              <div className="grid gap-3 md:grid-cols-2 text-ink-muted">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-accent-text">•</span>
                  <span>{DRIVE_TIMES.staines} minute drive from Staines High Street with free parking</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-accent-text">•</span>
                  <span>Sunday roasts and stone-baked pizzas</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-accent-text">•</span>
                  <span>Music Bingo with Nikki Manfadge, quiz nights and cash bingo</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-accent-text">•</span>
                  <span>Kids menu available. {FAMILIES_WORDING}</span>
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
          <div className="mx-auto">
            <SectionHeading
              title="Why Come to The Anchor from Staines"
              lead="Just a short drive from Staines-upon-Thames, The Anchor is a proper British village pub"
              className="text-center mb-12"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: "Easy Access from Staines", description: `${DRIVE_TIMES.staines} minutes by car\n${PARKING.capacity} free spaces` },
                { title: "Famous Sunday Roasts", description: "Our renowned roasts\nServed 1pm-6pm\nWalk in or book ahead, no pre-order needed\nRegular menu also available" },
                { title: "Events", description: "Music Bingo with Nikki Manfadge\nQuiz nights and cash bingo" },
                { title: "Stone-Baked Pizzas", description: "Hand-stretched bases\nRich tomato sauce\nGenerous toppings" },
                { title: "Beer Garden Paradise", description: "Dog-friendly outdoor space\nHeathrow plane spotting" },
                { title: "Community Hub", description: "Private hire by the hour\nBirthday parties welcome\nWork events too" },
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
            title="Private Hire Near Staines"
            lead="For celebrations, parties and family gatherings."
          />
          <div className="grid md:grid-cols-2 gap-5">
            <Card accent>
              <CardBody className="p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-3">Private hire near Staines</h3>
                <p className="mb-4 text-ink-muted">
                  Planning a birthday, wake or team night? The dining room, the garden or the whole pub can be
                  hired by the hour. Prices and menus are on the private hire page.
                </p>
                <Link href="/private-hire" className="text-accent-text font-semibold hover:underline transition">
                  See private hire →
                </Link>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody className="p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-3">Event hire in the Staines area</h3>
                <p className="mb-4 text-ink-muted">
                  Birthdays, engagement parties, retirement dos and more. Buffet menus and what each space
                  holds are on the private hire pages.
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
          <div className="mx-auto">
            <SectionHeading
              title="Getting Here from Staines"
              className="text-center mb-12"
            />

            <div className="grid md:grid-cols-2 gap-5">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">By Car ({DRIVE_TIMES.staines} minutes)</h3>
                  <p className="text-ink-muted">
                    You'll find us at {CONTACT.address.street}, {CONTACT.address.town}, {CONTACT.address.postcode}.
                  </p>
                  <p className="mt-3 text-ink-muted">{PARKING_WORDING}</p>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">By Public Transport</h3>
                  <p className="text-ink-muted">{BUS_WORDING}</p>
                </CardBody>
              </Card>
            </div>

            <Card accent className="mt-8 text-center">
              <CardBody className="p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-3">Also conveniently located near:</h3>
                <div className="flex flex-wrap justify-center gap-4 text-ink-muted">
                  <span>• Heathrow T5: {HEATHROW_TIMES.terminal5} mins</span>
                  <span>• M25 Junction 14: {DRIVE_TIMES.m25Junction14} mins</span>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* What's On This Week */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="What's On at Your Staines Local"
              className="text-center mb-12"
            />

            <div className="space-y-6">
              <Card accent className="border-l-4 border-l-anchor-gold">
                <CardBody className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    {/* Monthly on a Wednesday (docs/SSOT.md §10). This said Thursday. */}
                    <h3 className="font-display text-h4 text-ink-strong">Wednesday</h3>
                    <Badge variant="gold">QUIZ</Badge>
                  </div>
                  <p className="text-ink-muted">Monthly Quiz Night - Win a £25 bar voucher! <Link href="/whats-on" className="underline">See what&apos;s on</Link> for dates.</p>
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
                    <Badge variant="sand">MUSIC BINGO</Badge>
                  </div>
                  <p className="text-ink-muted">Music Bingo with Nikki Manfadge. <Link href="/whats-on" className="underline">See what&apos;s on</Link> for dates.</p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Event Venue Section */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Popular Venue for Staines Events"
              lead={`Host your special occasion at The Anchor - just ${DRIVE_TIMES.staines} minutes from Staines`}
            />

            <div className="grid md:grid-cols-2 gap-5 mb-8">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Perfect for Staines Residents</h3>
                  <ul className="space-y-3 text-ink-muted">
                    <li className="flex items-start gap-3">
                      <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
                      <span><strong className="text-ink">Quick journey</strong> - Just {DRIVE_TIMES.staines} minutes from Staines town centre</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
                      <span><strong className="text-ink">Free parking</strong> - Right outside</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
                      <span><strong className="text-ink">Fair village prices</strong> - Our prices are on the live menu</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
                      <span><strong className="text-ink">Private hire</strong> - The dining room, the garden or the whole pub</span>
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
                      <p className="text-sm text-ink-muted">Celebrate a milestone with us</p>
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
                  {ROOM_HIRE_WORDING} Prices and menus are on the private hire page.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild variant="primary" size="md">
                    <Link href="/private-hire">
                      View Event Options
                    </Link>
                  </Button>
                  <PhoneButton
                    phone="01753 682707"
                    source="staines_pub_event_enquiry"
                    variant="outline"
                    size="md"
                  >
                    Quick Enquiry
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

      {/* Opening Hours */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Opening Hours"
              className="text-center mb-8"
            />
            <BusinessHours/>
          </div>
        </Container>
      </section>

      {/* A village pub near Staines. No other pub is named or compared. */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="A Village Pub Near Staines"
              className="text-center mb-8"
            />
            <div className="prose max-w-none text-ink-muted space-y-4">
              <p>
                If you&apos;re searching for pubs in Staines, The Anchor is a proper
                village pub with free parking and a spacious beer garden.
              </p>
              <p>
                The drive is {DRIVE_TIMES.staines} minutes, and you park right outside.
              </p>
              <p>
                Most locals still call it Staines rather than Staines-upon-Thames. Either way, we&apos;re just outside
                the town, close enough for an easy weeknight meal or a lazy Sunday roast. Come for the stone-baked
                pizzas, and catch a sunset in the beer garden with the planes coming over.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <ChristmasCrossLink hook={`We are ${DRIVE_TIMES.staines} minutes from Staines with free parking, and Christmas bookings are open.`} />

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
        title="More local guides"
        intro="More on the food, the pub and how to find us."
      />

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "How far is The Anchor from Staines?",
            answer: `The Anchor is just ${DRIVE_TIMES.staines} minutes drive from Staines town centre. We're at ${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.postcode}, with free parking available.`
          },
          {
            question: "Why come to The Anchor from Staines?",
            answer: "We've Music Bingo with Nikki Manfadge, quiz nights, famous Sunday roasts, stone-baked pizzas, plus a dog-friendly beer garden with plane spotting views of Heathrow. We have free parking and a spacious garden. Our What's On page has the latest events."
          },
          {
            question: "Do you have parking at your Staines area pub?",
            answer: PARKING_WORDING
          },
          {
            question: "Can I hire a private room near Staines?",
            answer: `Yes. The dining room, the garden or the whole pub can be hired by the hour. Prices and menus are on the private hire page, or call ${CONTACT.phone} to plan your event.`
          },
          {
            question: "Can we book private events in the Staines area?",
            answer: "Yes. We host private events with buffet menus, a dedicated events coordinator and free parking. Contact us to check dates."
          }
        ]}
        className="bg-canvas"
      />

      {/* CTA Section */}
      <CtaBand
        title="Visit Staines' Favourite Local Pub"
        copy={`Just ${DRIVE_TIMES.staines} minutes from Staines town centre with free parking`}
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
        <DirectionsButton href={DIRECTIONS_URL} source="staines_directions" fromLocation="Staines" variant="outline" size="lg" wrap>
          Get Directions
        </DirectionsButton>
      </CtaBand>
    </>
  )
}
