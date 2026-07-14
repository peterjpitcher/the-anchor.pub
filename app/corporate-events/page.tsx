import Link from 'next/link'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT } from '@/lib/constants'
import { Button, Container, SectionHeading, Card, CardBody, Badge } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { TrustBar, ValueProofStrip, RegretReduction } from '@/components/psychology'
import { VenueTourTeaser } from '@/components/private-hire/venue-tour'

export const metadata: Metadata = {
  title: 'Corporate Event Venue Near Heathrow | Free Parking | The Anchor',
  description: 'Corporate event venue near Heathrow at The Anchor. Private rooms, team building space, and free parking just 7 minutes from Terminal 5. Pub setting, not a hotel.',
  openGraph: {
    title: 'Corporate Event Venue Near Heathrow | The Anchor',
    description: 'Corporate event venue near Heathrow with private rooms, team building space, and free parking 7 minutes from Terminal 5.',
    images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
  },
  twitter: getTwitterMetadata({
    title: 'Corporate Event Venue Near Heathrow | The Anchor',
    description: 'Corporate event venue near Heathrow with private rooms, team building space, and free parking 7 minutes from Terminal 5.',
    images: [DEFAULT_CORPORATE_IMAGE]
  }),
  alternates: {
    canonical: '/corporate-events'
  }
}


export default function CorporateEventsPage() {
  return (
    <>
      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/corporate-events/corporate-events.jpg"
        crumb="Corporate Events"
        title="Corporate Event Venue Near Heathrow"
        lead="Private hire for 10+ to 150 guests, with larger corporate events by enquiry. Around 7 minutes from Terminal 5, traffic dependent, with free parking."
        badges={
          <>
            <Badge variant="sand">Around 7 mins from Heathrow</Badge>
            <Badge variant="sand">Free Parking</Badge>
            <Badge variant="sand">AV Equipment</Badge>
            <Badge variant="sand">Outside ULEZ</Badge>
          </>
        }
        actions={
          <>
            <Button asChild variant="primary" size="lg" fullWidth>
              <Link href="#enquiry">
                Book Your Event
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" fullWidth>
              <Link href={CONTACT.phoneHref}>
                Discuss Your Event
              </Link>
            </Button>
          </>
        }
      />
      <TrustBar variant="private-hire" />

      {/* Page Title */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle
              seo={{ structured: true, speakable: true }}
              className="text-ink-strong mb-4"
            >
              Corporate Event Venue Near Heathrow: Business Events at The Anchor
            </PageTitle>
            <p className="text-lg text-ink-muted">
              Planning a corporate event near Heathrow? Professional meeting rooms for 10+ to 150 guests, with larger events by enquiry, around 7 minutes from Terminal 5, traffic dependent.
            </p>
          </div>
        </Container>
      </section>

      {/* Why Choose The Anchor for Business */}
      <section className="py-section-y bg-surface">
        <Container>
          <SectionHeading
            title="Why Leading Companies Choose The Anchor"
            lead="The smart choice for business events near Heathrow"
          />
          <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Heathrow Proximity", description: "Around 7 minutes from T5, traffic dependent, useful for international teams and clients" },
              { title: "Free Parking", description: "20 spaces on-site - saves significantly compared to city venues" },
              { title: "Flexible Pricing", description: "Competitive venue hire rates tailored to your needs" },
              { title: "Flexible Spaces", description: "Configure private hire for 10+ to 150 guests; larger events by enquiry" },
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
              <h3 className="font-display text-h4 text-ink-strong mb-4">Perfect Location for Business</h3>
              <p className="mb-4 text-ink-muted">Strategic advantages for your corporate events:</p>
              <ul className="space-y-2 text-ink-muted">
                <li><strong className="text-ink-strong">Outside ULEZ zone</strong> - no charges for attendees</li>
                <li><strong className="text-ink-strong">M25 Junction 14</strong> - 3 minutes away</li>
                <li><strong className="text-ink-strong">Heathrow hotels</strong> - 5-10 minutes for overnight guests</li>
                <li><strong className="text-ink-strong">Central location</strong> - accessible from London &amp; Surrey</li>
              </ul>
            </CardBody></Card>
            <Card accent><CardBody>
              <h3 className="font-display text-h4 text-ink-strong mb-4">Professional Service</h3>
              <p className="mb-4 text-ink-muted">Everything you need for successful business events:</p>
              <ul className="space-y-2 text-ink-muted">
                <li><strong className="text-ink-strong">Dedicated event coordinator</strong> for seamless planning</li>
                <li><strong className="text-ink-strong">Professional catering</strong> from coffee mornings to formal dinners</li>
                <li><strong className="text-ink-strong">Tech support</strong> for presentations and video calls</li>
                <li><strong className="text-ink-strong">Flexible timings</strong> - early starts and late finishes available</li>
              </ul>
            </CardBody></Card>
          </div>
        </Container>
      </section>

      {/* Event Types */}
      <section className="py-section-y bg-surface-sunk">
        <Container>
          <SectionHeading title="Corporate Event Solutions" lead="From board meetings to company celebrations" />
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card accent className="h-full"><CardBody>
              <h3 className="font-display text-h4 text-ink-strong mb-3">Business Meetings</h3>
              <p className="text-ink-muted mb-4">
                Private space for confidential discussions, client meetings, and presentations.
                Configurable for boardroom or theatre style.
              </p>
              <ul className="text-sm text-ink-muted space-y-1">
                <li>• 10+ to 150 attendees</li>
                <li>• TVs and sound system</li>
                <li>• WiFi &amp; power points</li>
                <li>• Coffee &amp; refreshments</li>
              </ul>
            </CardBody></Card>
            <Card accent className="h-full"><CardBody>
              <h3 className="font-display text-h4 text-ink-strong mb-3">Team Building</h3>
              <p className="text-ink-muted mb-4">
                Bring your team together for workshops, training sessions, and team building
                activities in a relaxed environment.
              </p>
              <ul className="text-sm text-ink-muted space-y-1">
                <li>• Interactive spaces</li>
                <li>• Breakout areas</li>
                <li>• Team lunch options</li>
                <li>• Evening social space</li>
              </ul>
            </CardBody></Card>
            <Card accent className="h-full"><CardBody>
              <h3 className="font-display text-h4 text-ink-strong mb-3">Corporate Hospitality</h3>
              <p className="text-ink-muted mb-4">
                Impress clients and reward staff with corporate entertainment, celebrations,
                and networking events.
              </p>
              <ul className="text-sm text-ink-muted space-y-1">
                <li>• Client entertainment</li>
                <li>• Awards ceremonies</li>
                <li>• Product launches</li>
                <li>• Networking events</li>
              </ul>
            </CardBody></Card>
          </div>
          <div className="mt-12 max-w-4xl mx-auto">
            <Card><CardBody>
              <h3 className="font-display text-h4 text-ink-strong mb-3">Also Perfect For:</h3>
              <div className="grid md:grid-cols-2 gap-4 text-ink-muted">
                <ul className="space-y-1">
                  <li>• AGMs and shareholder meetings</li>
                  <li>• Training workshops and seminars</li>
                  <li>• Sales conferences and kick-offs</li>
                  <li>• Executive away days</li>
                </ul>
                <ul className="space-y-1">
                  <li>• Recruitment assessment centres</li>
                  <li>• Company milestone celebrations</li>
                  <li>• Retirement parties</li>
                  <li>• Long service awards</li>
                </ul>
              </div>
            </CardBody></Card>
          </div>
        </Container>
      </section>

      {/* Corporate Solutions */}
      <section id="solutions" className="py-section-y bg-surface">
        <Container>
          <SectionHeading
            title="Tailored Corporate Event Solutions"
            lead="Flexible venue hire pricing designed around your specific needs"
          />
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card><CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-4">What We Offer</h3>
                <p className="mb-4 text-ink-muted">Every corporate event is unique. We provide:</p>
                <ul className="space-y-3 text-ink-muted">
                  <li><strong className="text-ink-strong">Flexible timing</strong> - Half day, full day, or evening sessions</li>
                  <li><strong className="text-ink-strong">Scalable spaces</strong> - Configure rooms for 10+ to 150 attendees, with larger events by enquiry</li>
                  <li><strong className="text-ink-strong">Custom catering</strong> - From coffee breaks to formal dinners</li>
                  <li><strong className="text-ink-strong">Professional support</strong> - AV equipment and dedicated coordinator</li>
                  <li><strong className="text-ink-strong">Transparent pricing</strong> - Clear quotes with no hidden fees</li>
                </ul>
              </CardBody></Card>
              <Card><CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-4">How Our Pricing Works</h3>
                <p className="mb-4 text-ink-muted">We believe in fair, flexible pricing:</p>
                <ul className="space-y-3 text-ink-muted">
                  <li><strong className="text-ink-strong">Venue hire quotes</strong> - Vary by day, time, group size and event needs</li>
                  <li><strong className="text-ink-strong">Weekday rates</strong> - More competitive for daytime events</li>
                  <li><strong className="text-ink-strong">Bespoke quotes</strong> - Based on your specific requirements</li>
                  <li><strong className="text-ink-strong">All-inclusive options</strong> - Know your total cost upfront</li>
                </ul>
              </CardBody></Card>
            </div>
            <Card accent className="mt-8"><CardBody className="text-center">
              <h3 className="font-display text-h4 text-ink-strong mb-3">Get Your Personalised Quote</h3>
              <p className="mb-4 text-ink-muted">
                Tell us about your event - date, duration, number of attendees, and requirements.
                We will create a tailored proposal that works for your budget.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="primary" size="lg" fullWidth className="sm:w-auto">
                  <Link href={CONTACT.phoneHref} className="w-full sm:w-auto">
                    Call to Discuss
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" fullWidth className="sm:w-auto">
                  <Link
                    href="https://wa.me/441753682707?text=Hi,%20I'd%20like%20a%20quote%20for%20a%20corporate%20event"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                  >
                    WhatsApp Us
                  </Link>
                </Button>
              </div>
            </CardBody></Card>
            <div className="mt-12 text-center">
              <p className="text-lg text-ink-muted mb-6">
                Want to see our full catering options? From working lunches to celebration dinners.
              </p>
              <Button asChild variant="outline" size="lg">
                <Link href="/food-menu" className="inline-block">
                  View Catering Menu
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Facilities & Amenities */}
      <section className="py-section-y bg-surface-sunk">
        <Container>
          <SectionHeading title="Professional Facilities" lead="Everything you need for productive business events" />
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <Card><CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-4">Technology &amp; Equipment</h3>
                <ul className="space-y-3 text-ink-muted">
                  <li><strong className="text-ink-strong">High-speed WiFi</strong><p className="text-sm">Reliable connection for video calls and presentations</p></li>
                  <li><strong className="text-ink-strong">Presentation Equipment</strong><p className="text-sm">TVs, sound system, laptop connections and WiFi</p></li>
                  <li><strong className="text-ink-strong">Power Access</strong><p className="text-sm">Multiple power points for devices</p></li>
                  <li><strong className="text-ink-strong">Audio System</strong><p className="text-sm">Microphone and speakers for larger groups</p></li>
                </ul>
              </CardBody></Card>
              <Card><CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-4">Comfort &amp; Convenience</h3>
                <ul className="space-y-3 text-ink-muted">
                  <li><strong className="text-ink-strong">Heating</strong><p className="text-sm">A warm, comfortable space through the cooler months</p></li>
                  <li><strong className="text-ink-strong">Natural Light</strong><p className="text-sm">Bright spaces with blackout options available</p></li>
                  <li><strong className="text-ink-strong">Accessibility</strong><p className="text-sm">Step-free bar and dining area; garden ramp on request; no accessible toilet</p></li>
                  <li><strong className="text-ink-strong">Private Facilities</strong><p className="text-sm">Dedicated restrooms for your event</p></li>
                </ul>
              </CardBody></Card>
            </div>
            <Card accent className="mt-12"><CardBody>
              <h3 className="font-display text-h4 text-ink-strong mb-4 text-center">Additional Services</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h4 className="font-semibold text-ink-strong mb-1">Event Planning</h4>
                  <p className="text-sm text-ink-muted">Dedicated coordinator to manage every detail</p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-ink-strong mb-1">Bespoke Catering</h4>
                  <p className="text-sm text-ink-muted">Menus tailored to your requirements</p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-ink-strong mb-1">Outdoor Options</h4>
                  <p className="text-sm text-ink-muted">Garden space for breaks or evening BBQs</p>
                </div>
              </div>
            </CardBody></Card>
          </div>
        </Container>
      </section>


      {/* Location Advantages */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeading title="Strategic Location for Business" />
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card><CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-4">Quick Access From</h3>
                <ul className="space-y-2 text-ink-muted text-left">
                  <li><strong className="text-ink-strong">Heathrow Business Parks:</strong> 5-10 mins</li>
                  <li><strong className="text-ink-strong">Heathrow Hotels:</strong> 5-10 mins</li>
                  <li><strong className="text-ink-strong">Central London:</strong> 45 mins</li>
                  <li><strong className="text-ink-strong">Staines:</strong> 8 mins</li>
                  <li><strong className="text-ink-strong">Windsor:</strong> 15 mins</li>
                  <li><strong className="text-ink-strong">Woking:</strong> 20 mins</li>
                </ul>
              </CardBody></Card>
              <Card><CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-4">Transport Links</h3>
                <ul className="space-y-2 text-ink-muted text-left">
                  <li><strong className="text-ink-strong">M25 Junction 14:</strong> 3 mins</li>
                  <li><strong className="text-ink-strong">Heathrow T5:</strong> 7 mins</li>
                  <li><strong className="text-ink-strong">Staines Station:</strong> 10 mins</li>
                  <li><strong className="text-ink-strong">Local Bus Routes:</strong> Regular service</li>
                  <li><strong className="text-ink-strong">Taxi/Uber:</strong> Readily available</li>
                  <li><strong className="text-ink-strong">Free Parking:</strong> 20 spaces</li>
                </ul>
              </CardBody></Card>
            </div>
            <Card accent><CardBody>
              <h3 className="font-display text-h4 text-ink-strong mb-4">Cost Savings for Your Business</h3>
              <div className="grid md:grid-cols-3 gap-4 text-ink-muted">
                <div>
                  <strong className="text-ink-strong">No ULEZ Charges</strong>
                  <p className="text-sm">Save £12.50 per attendee</p>
                </div>
                <div>
                  <strong className="text-ink-strong">Free Parking</strong>
                  <p className="text-sm">Save £20-40 per day</p>
                </div>
                <div>
                  <strong className="text-ink-strong">Flexible Venue Pricing</strong>
                  <p className="text-sm">Tailored to your event</p>
                </div>
              </div>
            </CardBody></Card>
          </div>
        </Container>
      </section>

      <div className="py-section-y bg-surface-sunk">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <ValueProofStrip variant="private-hire" />
            </div>
            <div className="mb-4">
              <RegretReduction variant="enquiry" />
            </div>
          </div>
        </Container>
      </div>

      <section className="bg-canvas py-section-y">
        <Container>
          <VenueTourTeaser
            source="corporate_events"
            initialSpaceId="dining-room"
            eventType="Corporate Event"
            title="See how your meeting or event could fit"
            copy="Explore the private dining room, garden, main bar and parking layout before you request a quote."
            ctaLabel="Explore the venue"
          />
        </Container>
      </section>

      <PrivateBookingSection
        eventType="Corporate Event"
        initialSpaceId="dining-room"
        showVenueTourLink={false}
      />

      <InternalLinkingSection
        title="Also Explore"
        links={[
          { href: '/our-pub', title: 'See Inside The Anchor', description: 'Photos of the bar, dining room, garden and games area' },
          { href: '/private-hire', title: 'Private Hire & Events', description: 'Wakes, christenings, parties and more' },
          { href: '/function-room-hire', title: 'Function Room Hire', description: 'Flexible spaces with layout options for any occasion' },
        ]}
        className="py-section-y"
      />

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "What makes The Anchor ideal for corporate events near Heathrow?",
            answer: "We're around 7 minutes from Terminal 5, traffic dependent, with free parking, making us useful for international teams. We offer flexible private hire for 10+ to 150 guests, larger events by enquiry, professional catering, and venue hire quotes tailored to your needs. Being outside the ULEZ zone saves your attendees money too."
          },
          {
            question: "What technology and equipment do you provide for business meetings?",
            answer: "We provide high-speed WiFi, TVs, a sound system with microphones, and multiple power points throughout our spaces. We can also discuss additional AV requirements in advance."
          },
          {
            question: "Can you accommodate different types of corporate events?",
            answer: "Yes! We regularly host board meetings, training workshops, team building days, product launches, corporate celebrations, conferences, and networking events. Our spaces are flexible and can be configured to suit your needs."
          },
          {
            question: "What are your corporate catering options?",
            answer: "We offer everything from coffee mornings and light bites to buffet lunches and formal dinners. All menus can be customised to your requirements and dietary needs. We also provide drinks packages and bar tabs."
          },
          {
            question: "How does venue hire pricing work for corporate events?",
            answer: "We offer flexible venue hire pricing tailored to each corporate event. Our rates vary depending on the day, time, and size of your event. We're always willing to discuss your budget and requirements to find a solution that works for you. Contact us for a personalised quote."
          },
          {
            question: "How early can we access the venue for setup?",
            answer: "We're flexible with access times. For full-day events, you can typically access the venue from 8am. Earlier access can be arranged if needed. We'll work around your schedule."
          },
          {
            question: "Do you have experience with international business guests?",
            answer: "Absolutely. Our proximity to Heathrow means we regularly host international teams. We understand the needs of global businesses and can accommodate different time zones, dietary requirements, and cultural preferences."
          },
          {
            question: "Can we book regular corporate events?",
            answer: "Yes, many businesses use us for regular meetings, training sessions, or team events. We ensure consistency in setup and service for our regular clients."
          }
        ]}
        className="bg-canvas"
      />

      {/* CTA Section */}
      <CtaBand
        title="Plan Your Corporate Event Today"
        copy="Professional venue • Strategic location • No hidden fees"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <Button asChild size="lg" variant="primary">
            <Link href="#enquiry">
              Book Your Event
            </Link>
          </Button>
          <PhoneButton phone={CONTACT.phone} source="corporate-events_cta" size="lg" variant="outline">
            Call: {CONTACT.phone}
          </PhoneButton>
          <Button asChild size="lg" variant="outline">
            <Link
              href="https://wa.me/441753682707?text=Hi,%20I'd%20like%20to%20enquire%20about%20corporate%20events"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Us
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="mailto:manager@the-anchor.pub?subject=Corporate Event Enquiry">
              Email Enquiry
            </Link>
          </Button>
        </div>
        <p className="mt-8 text-lg text-anchor-cream-text/85">
          <strong>Quick Response Guaranteed.</strong> We understand business moves fast. We will respond to your enquiry within 2 hours during business hours.
        </p>
      </CtaBand>
    </>
  )
}
