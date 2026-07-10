import Link from 'next/link'
import { Button, SectionHeading, Card, CardBody, Container, Badge } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { CONTACT } from '@/lib/constants'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { VenueTourTeaser } from '@/components/private-hire/venue-tour'

export const metadata: Metadata = {
  title: 'Party Venue Near Heathrow & Staines | The Anchor Pub',
  description: 'Book a party venue near Heathrow and Staines for birthdays, celebrations & private events. DJ space, late licence, private hire for 10+ to 150 guests, free parking.',
  openGraph: {
    title: 'Party Venue Near Heathrow & Staines | The Anchor',
    description: 'Party venue near Heathrow with DJ space, late licence, and free parking. Private hire for 10+ to 150 guests.',
    images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
  },
  twitter: getTwitterMetadata({
    title: 'Party Venue Near Heathrow & Staines | The Anchor',
    description: 'Party venue near Heathrow with DJ space, late licence, and free parking. Private hire for 10+ to 150 guests.',
    images: [DEFAULT_CORPORATE_IMAGE]
  }),
  alternates: {
    canonical: '/private-party-venue'
  }
}


export default function PrivatePartyVenuePage() {
  return (
    <>
      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Private Party Venue"
        title="Party Venue Near Heathrow & Staines"
        lead="The perfect spot for birthdays, milestones and social celebrations near Heathrow"
        badges={
          <>
            <Badge variant="sand">10+ to 150 Guests</Badge>
            <Badge variant="sand">All Occasions</Badge>
            <Badge variant="sand">Free Parking</Badge>
            <Badge variant="sand">Custom Menus</Badge>
          </>
        }
        actions={
          <>
            <Button asChild variant="primary" size="lg" fullWidth>
              <Link href="#enquiry">
                Book Your Party
              </Link>
            </Button>
            <PhoneButton
              phone="01753 682707"
              source="private_party_hero"
              variant="outline"
              size="lg"
            >
              Call: 01753 682707
            </PhoneButton>
          </>
        }
      />

      {/* Page Title */}
      <section className="py-section-y bg-canvas">
        <Container size="md">
          <div className="text-center">
            <PageTitle
              seo={{ structured: true, speakable: true }}
              className="text-ink-strong mb-4"
            >
              Party Venue Near Heathrow &amp; Staines: Birthdays &amp; Celebrations at The Anchor
            </PageTitle>
            <p className="text-lg text-ink-muted">
              DJ space, late licence, decorations welcome, everything you need for birthdays and celebrations
            </p>
          </div>
        </Container>
      </section>

      {/* Perfect For Section */}
      <section className="py-section-y bg-surface">
        <Container>
          <SectionHeading
            title="Perfect for Every Celebration"
            lead="From milestone birthdays to surprise parties, we make your special day unforgettable"
          />
          <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Birthday Parties", description: "18th, 21st, 30th, 40th, 50th and beyond - celebrate every milestone" },
              { title: "Anniversaries", description: "Silver, gold, or any year worth celebrating with family and friends" },
              { title: "Graduation Parties", description: "Mark academic achievements with a memorable celebration" },
              { title: "Baby Showers", description: "Welcome new arrivals with a special gathering" },
              { title: "Engagement Parties", description: "Toast the happy couple in style" },
              { title: "Achievement Celebrations", description: "New job, retirement, or any personal milestone" },
            ].map(feature => (
              <Card key={feature.title} accent className="h-full text-center">
                <CardBody className="flex h-full flex-col gap-2">
                  <h3 className="font-display text-h4 text-ink-strong">{feature.title}</h3>
                  <p className="text-ink-muted">{feature.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card accent><CardBody>
              <h3 className="font-display text-h4 text-ink-strong mb-4">Why Families Choose The Anchor</h3>
              <p className="mb-4 text-ink-muted">We understand what makes a great party venue:</p>
              <ul className="space-y-2 text-ink-muted">
                <li><strong className="text-ink-strong">Flexible spaces</strong> - From intimate gatherings to large celebrations</li>
                <li><strong className="text-ink-strong">Your music, your way</strong> - Bring your playlist or DJ</li>
                <li><strong className="text-ink-strong">Decoration freedom</strong> - Make the space your own</li>
                <li><strong className="text-ink-strong">All ages welcome</strong> - Family-friendly environment</li>
              </ul>
            </CardBody></Card>
            <Card accent><CardBody>
              <h3 className="font-display text-h4 text-ink-strong mb-4">Stress-Free Planning</h3>
              <p className="mb-4 text-ink-muted">Let us handle the details while you enjoy the party:</p>
              <ul className="space-y-2 text-ink-muted">
                <li><strong className="text-ink-strong">Dedicated coordinator</strong> - One point of contact throughout</li>
                <li><strong className="text-ink-strong">Custom menus</strong> - Catering to match your taste and budget</li>
                <li><strong className="text-ink-strong">Setup assistance</strong> - We help create your vision</li>
                <li><strong className="text-ink-strong">Clean-up included</strong> - Just enjoy your event</li>
              </ul>
            </CardBody></Card>
          </div>
        </Container>
      </section>

      {/* What's Included */}
      <section className="py-section-y bg-surface-sunk">
        <Container size="md">
          <SectionHeading title="Everything You Need for a Perfect Party" />
          <div className="grid md:grid-cols-2 gap-8">
            <Card><CardBody>
              <h3 className="font-display text-h4 text-ink-strong mb-6">Venue Features</h3>
              <ul className="space-y-3 text-ink-muted">
                <li><strong className="text-ink-strong">Flexible Spaces</strong><p className="text-sm">Configure for your party size and style</p></li>
                <li><strong className="text-ink-strong">Music System</strong><p className="text-sm">Connect your playlist or bring a DJ</p></li>
                <li><strong className="text-ink-strong">Party Lighting</strong><p className="text-sm">Create the perfect atmosphere</p></li>
                <li><strong className="text-ink-strong">Free Parking for Guests</strong><p className="text-sm">20 spaces while attending your event</p></li>
                <li><strong className="text-ink-strong">Accessibility</strong><p className="text-sm">Step-free bar and dining area; garden ramp on request; no accessible toilet</p></li>
              </ul>
            </CardBody></Card>
            <Card><CardBody>
              <h3 className="font-display text-h4 text-ink-strong mb-6">Food &amp; Drink Options</h3>
              <ul className="space-y-3 text-ink-muted">
                <li><strong className="text-ink-strong">Buffet Service</strong><p className="text-sm">Hot and cold options to suit all tastes</p></li>
                <li><strong className="text-ink-strong">Pizza Parties</strong><p className="text-sm">Perfect for casual celebrations</p></li>
                <li><strong className="text-ink-strong">Drinks Packages</strong><p className="text-sm">From welcome drinks to full bar tabs</p></li>
                <li><strong className="text-ink-strong">Cake Service</strong><p className="text-sm">We will serve your celebration cake</p></li>
                <li><strong className="text-ink-strong">Dietary Options</strong><p className="text-sm">Vegetarian, vegan, and allergy-friendly</p></li>
              </ul>
            </CardBody></Card>
          </div>
        </Container>
      </section>

      {/* Add-On Services */}
      <section className="py-section-y bg-surface">
        <Container>
          <SectionHeading title="Make It Extra Special" lead="Additional services to enhance your celebration" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {[
              { title: "Decorations", desc: "Balloons, banners, table decorations" },
              { title: "Photography", desc: "Capture every special moment" },
              { title: "Entertainment", desc: "DJs, performers, sound system" },
              { title: "Flowers", desc: "Beautiful arrangements and centerpieces" },
            ].map(item => (
              <Card key={item.title} accent className="h-full text-center">
                <CardBody className="flex h-full flex-col gap-2">
                  <h4 className="font-display text-h4 text-ink-strong">{item.title}</h4>
                  <p className="text-sm text-ink-muted">{item.desc}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Party Planning Timeline */}
      <section className="py-section-y bg-surface-sunk">
        <Container size="sm">
          <SectionHeading title="Simple Party Planning Process" lead="We make organising your celebration easy" />
          <div className="space-y-6">
            {[
              { n: "1", title: "Initial Enquiry", desc: "Call, WhatsApp, or email us with your party date and guest numbers" },
              { n: "2", title: "Discuss Your Vision", desc: "We will chat about your ideas, menu preferences, and any special requirements" },
              { n: "3", title: "Receive Your Quote", desc: "Clear pricing with no hidden extras - know exactly what you are paying" },
              { n: "4", title: "Secure Your Date", desc: "Small deposit holds your booking - fully refundable if plans change (14 days notice)" },
              { n: "5", title: "Final Details", desc: "Confirm numbers and any last-minute changes a week before" },
              { n: "6", title: "Party Time!", desc: "Arrive and enjoy - we will handle everything else" },
            ].map(step => (
              <div key={step.n} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-anchor-gold-dark text-white rounded-full flex items-center justify-center font-semibold">{step.n}</div>
                <div>
                  <h3 className="font-semibold text-lg text-ink-strong mb-1">{step.title}</h3>
                  <p className="text-ink-muted">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Location Benefits */}
      <section className="py-section-y bg-surface">
        <Container size="md">
          <div className="text-center">
            <SectionHeading title="Easy to Reach from Everywhere" lead="Central location with free parking makes party planning simple" />
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {["Staines: 8 minutes", "Ashford: 10 minutes", "Feltham: 10 minutes", "Heathrow: 7 minutes", "Sunbury: 15 minutes", "Egham: 12 minutes"].map(item => (
                <Badge key={item} variant="sand">{item}</Badge>
              ))}
            </div>
            <Card accent><CardBody>
              <h3 className="font-display text-h4 text-ink-strong mb-4">Why Location Matters for Parties</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-ink-strong mb-1">Free Parking</h4>
                  <p className="text-sm text-ink-muted">No expensive taxis needed - everyone can drive</p>
                </div>
                <div>
                  <h4 className="font-semibold text-ink-strong mb-1">Public Transport</h4>
                  <p className="text-sm text-ink-muted">Bus stops nearby for non-drivers</p>
                </div>
                <div>
                  <h4 className="font-semibold text-ink-strong mb-1">Central Location</h4>
                  <p className="text-sm text-ink-muted">Easy for guests from multiple areas</p>
                </div>
              </div>
            </CardBody></Card>
          </div>
        </Container>
      </section>

      <section className="bg-canvas py-section-y">
        <Container>
          <VenueTourTeaser
            source="private_party_venue"
            initialSpaceId="dining-room"
            eventType="Birthday Party"
            title="Picture your party at The Anchor"
            copy="See the private dining room, garden and photo viewpoints before you start planning the details."
            ctaLabel="Explore the party spaces"
          />
        </Container>
      </section>

      <PrivateBookingSection
        eventType="Birthday Party"
        initialSpaceId="dining-room"
        showVenueTourLink={false}
      />

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "How far in advance should I book my party?",
            answer: "We recommend booking 4-6 weeks ahead for weekend parties, especially Saturdays. Weekday celebrations often have more availability. Popular times like summer weekends book up quickly."
          },
          {
            question: "Can I bring my own decorations?",
            answer: "Absolutely! You're welcome to decorate the space to match your theme. We just ask that you avoid anything that might damage walls or ceilings. We can also arrange decorations for you if preferred."
          },
          {
            question: "Do you allow external catering or can I bring my own cake?",
            answer: "You're welcome to bring your own celebration cake - we'll provide plates and serve it for you. All other food must be provided by us for food safety reasons, but we're very flexible with menu options."
          },
          {
            question: "What's included in venue hire?",
            answer: "Venue hire includes exclusive use of your party space, basic decorations, dedicated staff, and setup/cleanup. Food and drink are priced per person based on your menu choices. We offer flexible pricing tailored to your celebration."
          },
          {
            question: "Can children attend parties at The Anchor?",
            answer: "Yes! We're a family-friendly venue and welcome guests of all ages at all hours. Children must be supervised, and we never serve alcohol to anyone under 18. We have children's menu options available."
          },
	          {
	            question: "Is there a room hire fee for private parties?",
		            answer: "Private hire pricing varies depending on the day, time, group size and what you need. We'll discuss pricing when you enquire."
	          },
          {
            question: "Can we have music and dancing?",
            answer: "Of course! You can connect your phone/device to our sound system or bring a DJ. We have space for dancing and party lighting to create the right atmosphere."
          },
          {
            question: "What time do private parties have to finish?",
            answer: "Standard finish time is 11:30pm on Fridays and Saturdays, 11pm on other nights. Extended hours may be available for exclusive venue hire - just ask when booking."
          }
        ]}
        className="bg-canvas"
      />

      {/* CTA Section */}
      <CtaBand
        title="Plan Your Perfect Party"
        copy="Get in touch today to check availability and discuss your celebration"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <Button asChild size="lg" variant="primary">
            <Link href="#enquiry">
              Book Your Party
            </Link>
          </Button>
          <PhoneButton phone={CONTACT.phone} source="private-party_cta" size="lg" variant="outline">
            Call: {CONTACT.phone}
          </PhoneButton>
          <Button asChild size="lg" variant="outline">
            <Link
              href="https://wa.me/441753682707?text=Hi,%20I'd%20like%20to%20enquire%20about%20private%20party%20venue%20hire"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Us
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="mailto:manager@the-anchor.pub?subject=Private Party Enquiry">
              Email Enquiry
            </Link>
          </Button>
        </div>
        <p className="mt-8 text-sm text-anchor-cream-text/85">
          <strong>Quick Response Promise.</strong> We will get back to you within 2 hours during opening hours. <strong>WhatsApp:</strong> 01753 682707 for instant chat.
        </p>
      </CtaBand>
    </>
  )
}
