import Link from 'next/link'
import { Button, SectionHeading, Card, CardBody, Container, Badge } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { HeroBadge } from '@/components/HeroBadge'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { JsonLd } from '@/components/JsonLd'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { TrustBar, ValueProofStrip, RegretReduction } from '@/components/psychology'

export const metadata: Metadata = {
  title: 'Function Room Hire Near Heathrow | The Anchor Pub',
  description: 'Hire a pub function room near Heathrow for 10-50 guests. Room hire, free parking, flexible catering, and a £250 deposit. Call 01753 682707.',
  openGraph: {
    title: 'Function Room Hire Near Heathrow | The Anchor Pub',
    description: 'Pub with function rooms near Heathrow for 10-50 guests. Room hire from a simple fee. Free parking, 6 layouts, in-house catering.',
    images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Function room hire at The Anchor pub near Heathrow' }],
  },
  twitter: getTwitterMetadata({
    title: 'Function Room Hire Near Heathrow | The Anchor Pub',
    description: 'Pub with function rooms near Heathrow for 10-50 guests. Room hire from a simple fee. Free parking, 6 layouts, in-house catering.',
    images: [DEFAULT_CORPORATE_IMAGE]
  }),
  alternates: {
    canonical: '/function-room-hire'
  }
}

// Function room schema for SEO
const functionRoomSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Function Room Hire at The Anchor",
  description: "Function room hire at a pub near Heathrow Airport and Staines. Private rooms for 10-50 guests with catering, free parking, and a simple room hire fee.",
  provider: {
    "@type": "Organization",
    name: "The Anchor",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Horton Road",
      addressLocality: "Stanwell Moor",
      addressRegion: "Surrey",
      postalCode: "TW19 6AQ"
    },
    telephone: "+441753682707"
  },
  areaServed: ["Stanwell Moor", "Staines", "Heathrow", "Ashford", "Feltham", "Sunbury", "Egham", "Surrey"],
  offers: {
    "@type": "Offer",
    priceCurrency: "GBP",
    description: "Room hire fee varies by event type, day, and party size. Deposit £250. Call for a quote."
  },
  potentialAction: {
    "@type": "CommunicateAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.the-anchor.pub/private-hire#enquiry",
      "actionPlatform": [
        "https://schema.org/DesktopWebPlatform",
        "https://schema.org/MobileWebPlatform"
      ]
    }
  }
}

export default function FunctionRoomHirePage() {
  return (
    <>
      <JsonLd data={[functionRoomSchema]} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.the-anchor.pub' },
          { name: 'Function Room Hire', url: 'https://www.the-anchor.pub/function-room-hire' }
        ]}
      />

      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Function Room Hire"
        title="Function Room Hire Near Heathrow"
        lead="A pub with private rooms for 10 to 50 guests. Room hire, free parking, flexible layouts, and in-house catering. No minimum spend."
        badges={
          <>
            <Badge variant="sand">Multiple Spaces</Badge>
            <Badge variant="sand">Flexible Pricing</Badge>
            <Badge variant="sand">Free Parking</Badge>
            <Badge variant="sand">Near Heathrow</Badge>
          </>
        }
        actions={
          <>
            <PhoneButton
              phone="01753 682707"
              source="function_room_hero"
              variant="primary"
              size="lg"
            >
               Call to Check Availability
            </PhoneButton>
            <Link href="#enquiry">
              <Button variant="outline" size="lg" fullWidth>
                Enquire Online
              </Button>
            </Link>
          </>
        }
      />
      <TrustBar variant="private-hire" />

      {/* Google Rating */}
      <section className="py-section-y bg-canvas">
        <Container>
          <HeroBadge className="text-sm" />
        </Container>
      </section>

      {/* Quick Summary */}
      <section className="py-section-y bg-surface">
        <Container>
          <Card accent className="max-w-5xl mx-auto">
            <CardBody>
              <h2 className="font-display text-h3 text-ink-strong mb-3">What Makes Our Function Rooms Work</h2>
              <div className="grid gap-3 md:grid-cols-2 text-ink-muted">
                <div className="flex items-start gap-2">
                  <span>Flexible spaces for 10-50 guests, with larger events by enquiry</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>Free parking outside the ULEZ zone, ideal for corporate events</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>In-house catering: buffets, two-course dinners or canapés</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>AV support, microphones and hybrid meeting options available</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </Container>
      </section>

      {/* Page Title */}
      <section className="py-section-y bg-surface-sunk">
        <Container>
          <PageTitle className="text-center text-ink-strong mb-8" seo={{ structured: true, speakable: true }}>
            Function Room Hire: A Pub with Private Rooms Near Heathrow &amp; Staines
          </PageTitle>
        </Container>
      </section>

      {/* Spaces Overview */}
      <section className="py-section-y bg-surface">
        <Container>
          <SectionHeading
            title="Flexible Spaces for Every Event"
            lead="From intimate gatherings to large celebrations"
          />

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
            <Card accent><CardBody>
              <h3 className="font-display text-h4 text-ink-strong mb-4">The Dining Room</h3>
              <div className="mb-4">
                <Badge variant="gold">20-80 guests</Badge>
              </div>
              <p className="text-ink-muted mb-4">
                Our main function space offers complete flexibility. Perfect for formal dinners,
                presentations, parties, or meetings. Can be configured to your exact requirements.
              </p>
              <ul className="space-y-2 text-ink-muted">
                <li>Natural daylight with dimming options</li>
                <li>Climate controlled</li>
                <li>Direct access to facilities</li>
                <li>AV equipment available</li>
              </ul>
            </CardBody></Card>

            <Card accent><CardBody>
              <h3 className="font-display text-h4 text-ink-strong mb-4">Exclusive Venue Hire</h3>
              <div className="mb-4">
                <Badge variant="gold">80-200 guests</Badge>
              </div>
              <p className="text-ink-muted mb-4">
                Take over the entire venue for larger events. Includes all indoor spaces,
                bar area, and outdoor terrace (weather permitting). Perfect for big celebrations.
              </p>
              <ul className="space-y-2 text-ink-muted">
                <li>Complete privacy</li>
                <li>Multiple spaces to utilize</li>
                <li>Full bar service</li>
                <li>Dedicated event team</li>
              </ul>
            </CardBody></Card>
          </div>

          <Card accent className="max-w-3xl mx-auto"><CardBody>
            <h3 className="font-display text-h4 text-ink-strong mb-2 text-center">Simple Room Hire</h3>
            <p className="text-center text-ink-muted">
              Room hire fees vary by event type, day, and party size. No minimum spend, you only pay for what you order on top of the hire. Deposit is £250 to secure your date. Call us on 01753 682707 for a quote.
            </p>
          </CardBody></Card>
        </Container>
      </section>

      {/* Layout Options */}
      <section className="py-section-y bg-surface-sunk">
        <Container>
          <SectionHeading
            title="Configure Your Space"
            lead="Multiple layout options to suit your event style"
          />

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { title: "Banquet Style", count: "80", desc: "Round tables of 8-10 for dining and socializing" },
              { title: "Theatre Style", count: "40", desc: "Rows of chairs facing front for presentations" },
              { title: "Cocktail Reception", count: "150", desc: "Standing reception with high tables" },
              { title: "Classroom Style", count: "60", desc: "Tables and chairs for training/workshops" },
              { title: "Boardroom Style", count: "30", desc: "Single large table for meetings" },
              { title: "Cabaret Style", count: "70", desc: "Round tables with stage/presentation area" },
            ].map(layout => (
              <Card key={layout.title} accent className="h-full text-center">
                <CardBody className="flex h-full flex-col gap-2">
                  <h3 className="font-display text-h4 text-ink-strong">{layout.title}</h3>
                  <p className="font-display text-h3 text-accent-text">{layout.count}</p>
                  <p className="text-ink-muted">{layout.desc}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Suitable For */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              title="One Venue, Endless Possibilities"
              lead="Our function rooms adapt to any event type"
            />

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { title: "Business Events", desc: "Meetings, training, conferences, AGMs" },
                { title: "Celebrations", desc: "Birthdays, anniversaries, achievements" },
                { title: "Memorial Services", desc: "Wakes, celebrations of life, gatherings" },
                { title: "Seasonal Events", desc: "Christmas parties, New Year celebrations" },
                { title: "Entertainment", desc: "Quiz nights, hosted events, themed nights (see /whats-on)" },
                { title: "Community Events", desc: "Club meetings, fundraisers, social gatherings" },
                { title: "Educational", desc: "Workshops, seminars, training days" },
              ].map(item => (
                <Card key={item.title} className="h-full text-center">
                  <CardBody className="flex h-full flex-col gap-2">
                    <h3 className="font-semibold text-ink-strong">{item.title}</h3>
                    <p className="text-sm text-ink-muted">{item.desc}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Key Benefits */}
      <section className="py-section-y bg-surface-sunk">
        <Container>
          <SectionHeading
            title="Why Choose The Anchor for Your Function"
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "No Hidden Costs", description: "Flexible pricing, no hidden charges, great value. Let's discuss your needs." },
              { title: "Free Parking", description: "20 spaces on-site saves your guests money and hassle" },
              { title: "Prime Location", description: "7 mins from Heathrow, 3 mins from M25, outside ULEZ zone" },
              { title: "Flexible Catering", description: "From tea & coffee to premium buffets and indoor BBQ" },
              { title: "Full Support", description: "Experienced team handles setup, service, and cleanup" },
              { title: "Fully Accessible", description: "Ground floor venue with wheelchair access throughout" },
            ].map(feature => (
              <Card key={feature.title} accent className="h-full text-center">
                <CardBody className="flex h-full flex-col gap-2">
                  <h3 className="font-display text-h4 text-ink-strong">{feature.title}</h3>
                  <p className="text-ink-muted">{feature.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* What's Included */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeading
              title="Everything You Need Included"
              lead="Professional facilities and attentive service as standard"
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card><CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-4">Facilities & Equipment</h3>
                <ul className="space-y-3 text-ink-muted">
                  <li>Tables and chairs in your chosen layout</li>
                  <li>White table linens and napkins</li>
                  <li>Background music system</li>
                  <li>Microphone for speeches</li>
                  <li>Basic lighting control</li>
                  <li>Heating and air conditioning</li>
                  <li>Cloakroom facilities</li>
                </ul>
              </CardBody></Card>
              <Card><CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-4">Service & Support</h3>
                <ul className="space-y-3 text-ink-muted">
                  <li>Pre-event planning consultation</li>
                  <li>Dedicated event coordinator</li>
                  <li>Professional service team</li>
                  <li>Setup and breakdown included</li>
                  <li>Flexible access times</li>
                  <li>Supplier coordination</li>
                  <li>Post-event cleanup</li>
                </ul>
              </CardBody></Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Pricing Structure */}
      <section className="py-section-y bg-surface-sunk">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Simple, Transparent Pricing"
              lead="Room hire, no minimum spend, £250 deposit"
            />

            <Card accent className="mb-8"><CardBody className="text-center">
              <h3 className="font-display text-h4 text-ink-strong mb-6">How Our Pricing Works</h3>
              <p className="font-display text-h3 text-accent-text mb-2">Room Hire + What You Order</p>
              <p className="text-ink-muted mb-4">no minimum spend</p>
              <p className="text-ink-muted">
                A simple room hire fee covers your space, and the rest of your budget goes on food, drinks and services, no minimum spend, so you only pay for what you actually order. The hire fee varies by event type, day and party size. Deposit is £250 to secure your date. Call us for a quote.
              </p>
            </CardBody></Card>

            <Card><CardBody>
              <h3 className="font-display text-h4 text-ink-strong mb-3">Get a Personalised Quote</h3>
              <p className="mb-3 text-ink-muted">
                Every event is different, so we tailor pricing to your needs. Tell us about your event and
                we'll put together a clear, no-obligation quote covering venue hire, catering and any extras.
              </p>
              <p className="font-semibold text-center text-ink-strong">
                Call us on 01753 682707 or <a href="/private-hire#enquiry" className="text-accent-text underline">submit an enquiry online</a>.
              </p>
            </CardBody></Card>
          </div>
        </Container>
      </section>

      {/* Location */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeading
              title="Perfectly Located for Your Guests"
              lead="Easy access from all directions with free parking"
            />

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card><CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-4">By Car</h3>
                <ul className="space-y-2 text-ink-muted text-left">
                  <li>M25 Junction 14: 3 minutes</li>
                  <li>Heathrow T5: 7 minutes</li>
                  <li>Staines: 8 minutes</li>
                  <li>Windsor: 15 minutes</li>
                  <li>Central London: 45 minutes</li>
                  <li className="pt-2 font-semibold text-ink-strong">20 free parking spaces</li>
                </ul>
              </CardBody></Card>

              <Card><CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-4">Public Transport</h3>
                <ul className="space-y-2 text-ink-muted text-left">
                  <li>Local bus routes from Staines</li>
                  <li>Staines station: 10 mins by taxi</li>
                  <li>Heathrow shuttle options</li>
                  <li>Uber/taxi readily available</li>
                  <li className="pt-2 font-semibold text-ink-strong">We can help arrange transport</li>
                </ul>
              </CardBody></Card>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {["Outside ULEZ zone - no charges", "Well-lit car park", "Level access from parking", "Safe residential area"].map(item => (
                <Badge key={item} variant="sand">{item}</Badge>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface-sunk">
        <Container>
          <div className="max-w-3xl mx-auto">
            <Card accent className="mb-6"><CardBody>
              <h3 className="font-display text-h4 text-ink-strong mb-3">Which space suits your event?</h3>
              <ul className="space-y-2 text-sm text-ink-muted">
                <li>• <strong className="text-ink-strong">10-50 guests</strong>, our private dining room, ideal for dinners and celebrations</li>
                <li>• <strong className="text-ink-strong">50+ guests</strong>, larger room, garden or full venue hire by enquiry</li>
              </ul>
            </CardBody></Card>
            <div className="mb-6">
              <ValueProofStrip variant="private-hire" />
            </div>
            <div className="mb-4">
              <RegretReduction variant="enquiry" />
            </div>
          </div>
        </Container>
      </section>

      <PrivateBookingSection eventType="Other" />

      <InternalLinkingSection
        title="Next Steps For Your Event"
        links={[
          { href: '/our-pub', title: 'See Inside The Anchor', description: 'Photos of the bar, dining room, garden and games area' },
          { href: '/private-hire#enquiry', title: 'Submit Event Enquiry', description: 'Tell us about your celebration or meeting' },
          { href: '/corporate-events', title: 'Corporate Event Packages', description: 'See delegate rates and meeting add-ons' },
          { href: '/private-party-venue', title: 'Private Party Venue', description: 'Plan birthdays, wakes and anniversaries' },
          { href: '/food-menu', title: 'Menu Ideas', description: 'Select canapés, buffets or two-course meals' }
        ]}
        className="py-section-y"
      />

      <OrganicSearchClusterLinks
        cluster="privateRooms"
        currentPath="/function-room-hire"
        title="Private room hire near Heathrow and Staines"
        intro="Find the right event route from private hire, room layouts, catering packages and corporate event options."
      />

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "What exactly is included in function room hire?",
            answer: "Your room hire includes the space configured to your requirements, tables, chairs, linens, basic AV equipment (microphone, music system), dedicated staff, setup/breakdown, and cleaning. Catering and drinks are ordered separately so you control your budget."
          },
          {
            question: "How does your venue hire pricing work?",
            answer: "A room hire fee covers your space, it varies by event type, day, and party size. There's no minimum spend on top, so you only pay for the food and drinks you actually order. Deposit is £250 to secure your date. Call us on 01753 682707 for a personalised quote."
          },
          {
            question: "Can I view the function rooms before booking?",
            answer: "Absolutely! We encourage site visits so you can see the spaces and discuss layout options. Call us on 01753 682707 to arrange a viewing at your convenience."
          },
          {
            question: "What catering options are available?",
            answer: "We offer a range of catering from tea and coffee to premium buffets and indoor BBQ. Options include sandwich buffets (from £9.95/head), finger buffets, burger buffets, pizza buffets and more. Welcome drinks packages are also available. We'll put together a menu to match your event and budget."
          },
          {
            question: "Can I bring my own decorations or entertainment?",
            answer: "Yes! You're welcome to decorate the space and bring entertainment like DJs or live bands. We just ask that decorations don't damage walls/ceilings. We can also arrange decorations and entertainment through our suppliers if you prefer."
          },
          {
            question: "What are your minimum guest numbers?",
            answer: "We can accommodate groups from 10 people upwards. For exclusive use of the entire venue, we typically require 80+ guests. Smaller groups are perfectly welcome in our function room."
          },
          {
            question: "Is there disabled access to the function rooms?",
            answer: "Yes, we have full wheelchair access throughout the venue, including to all function spaces and facilities. Our car park has level access to the entrance."
          },
          {
            question: "How far in advance should I book?",
            answer: "We recommend booking 4-8 weeks ahead for weekends and popular dates. Weekday events often have more flexibility. December books up particularly early. The sooner you enquire, the more likely we can accommodate your preferred date."
          }
        ]}
        className="bg-canvas"
      />

      {/* CTA Section */}
      <CtaBand
        title="Check Availability for Your Function"
        copy="Competitive rates • Free parking • Professional service"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <BookTableButton
            source="function_room_cta"
            size="lg"
            variant="primary"
            context="function_room"
          >
            Book Function Room
          </BookTableButton>
          <PhoneButton phone={CONTACT.phone} source="function-room_cta" size="lg" variant="outline">
            Call: {CONTACT.phone}
          </PhoneButton>
          <Link href="https://wa.me/441753682707?text=Hi,%20I'd%20like%20to%20enquire%20about%20function%20room%20hire" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline">
              WhatsApp Us
            </Button>
          </Link>
          <Link href="mailto:manager@the-anchor.pub?subject=Function Room Hire Enquiry">
            <Button size="lg" variant="outline">
              Email Enquiry
            </Button>
          </Link>
        </div>
        <p className="mt-8 text-sm text-anchor-cream-text/85">
          <strong>Viewing Welcome.</strong> Pop in during opening hours or arrange a specific viewing time. We&apos;ll respond to enquiries within 2 hours.
        </p>
      </CtaBand>
    </>
  )
}
