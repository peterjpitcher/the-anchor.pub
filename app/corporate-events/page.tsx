import Link from 'next/link'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT } from '@/lib/constants'
import { Button, Container, SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox } from '@/components/ui'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { EventSchema } from '@/components/seo/EventSchema'
import { staticEvents } from '@/lib/static-events'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { TrustBar, ValueProofStrip, RegretReduction } from '@/components/psychology'

export const metadata: Metadata = {
  title: 'Corporate Events Near Heathrow | Free Parking | The Anchor',
  description: 'Host corporate events near Heathrow at The Anchor. Private meeting rooms, breakout space, AV support and free parking, just 7 minutes from Terminal 5.',
  openGraph: {
    title: 'Corporate Events Near Heathrow | The Anchor, Stanwell Moor',
    description: 'Host corporate events near Heathrow, private meeting rooms, AV support and free parking 7 minutes from Terminal 5.',
    images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
  },
  twitter: getTwitterMetadata({
    title: 'Corporate Events Near Heathrow | The Anchor, Stanwell Moor',
    description: 'Host corporate events near Heathrow, private meeting rooms, AV support and free parking 7 minutes from Terminal 5.',
    images: [DEFAULT_CORPORATE_IMAGE]
  }),
  alternates: {
    canonical: '/corporate-events'
  }
}


export default function CorporateEventsPage() {
  return (
    <>
      <EventSchema event={staticEvents.corporateEvents} />

      {/* Hero Section */}
      <HeroWrapper
        showContextStrip={true}
        route="/corporate-events"
        title="Corporate Event Venue Near Heathrow"
        description="Room bookings for 10-50 guests, with larger corporate events by enquiry. 7 minutes from Terminal 5 with free parking."
        tags={[
          { label: "7 mins from Heathrow", variant: "success" },
          { label: "Free Parking", variant: "default" },
          { label: "AV Equipment", variant: "default" },
          { label: "Outside ULEZ", variant: "success" }
        ]}
        primaryCta={
          <BookTableButton
            source="corporate_events_hero"
            variant="primary"
            size="lg"
            context="corporate_event"
            fullWidth
            className="w-full sm:w-auto"
          >
            Book Your Event
          </BookTableButton>
        }
        secondaryCta={
          <>
            <Link href={CONTACT.phoneHref} className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" fullWidth className="sm:w-auto">
                Discuss Your Event
              </Button>
            </Link>
            <Link href="#solutions" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" fullWidth className="sm:w-auto">
                Explore Our Solutions
              </Button>
            </Link>
          </>
        }
        secondaryInfo={
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog &amp; family friendly</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">10-50 room bookings</span>
          </div>
        }
      />
      <TrustBar variant="private-hire" />

      {/* Page Title */}
      <section className="section-spacing-sm bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle
              seo={{ structured: true, speakable: true }}
              className="text-anchor-cream-text mb-4"
            >
              Corporate Events Near Heathrow, Business Venue at The Anchor
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              Planning a corporate event near Heathrow? Professional meeting rooms for 10-50 guests, with larger events by enquiry, just 7 minutes from Terminal 5.
            </p>
          </div>
        </Container>
      </section>

      {/* Why Choose The Anchor for Business */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="Why Leading Companies Choose The Anchor"
            subtitle="The smart choice for business events near Heathrow"
          />
          <FeatureGrid
            columns={4}
            features={[
              { icon: "", title: "Heathrow Proximity", description: "7 minutes from T5 - perfect for international teams & clients", className: "text-center" },
	              { icon: "", title: "Free Parking", description: "20 spaces on-site - saves significantly compared to city venues", className: "text-center" },
              { icon: "", title: "Flexible Pricing", description: "Competitive venue hire rates tailored to your needs", className: "text-center" },
              { icon: "", title: "Flexible Spaces", description: "Configure room bookings for 10-50 guests; larger events by enquiry", className: "text-center" }
            ]}
            className="mb-12"
          />
          <InfoBoxGrid
            columns={2}
            boxes={[
              {
                title: "Perfect Location for Business",
                content: (
                  <>
                    <p className="mb-4">Strategic advantages for your corporate events:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2"><span className="text-anchor-gold-vivid"></span><span><strong>Outside ULEZ zone</strong> - no charges for attendees</span></li>
                      <li className="flex items-start gap-2"><span className="text-anchor-gold-vivid"></span><span><strong>M25 Junction 14</strong> - 3 minutes away</span></li>
                      <li className="flex items-start gap-2"><span className="text-anchor-gold-vivid"></span><span><strong>Heathrow hotels</strong> - 5-10 minutes for overnight guests</span></li>
                      <li className="flex items-start gap-2"><span className="text-anchor-gold-vivid"></span><span><strong>Central location</strong> - accessible from London &amp; Surrey</span></li>
                    </ul>
                  </>
                ),
                variant: "colored",
                color: "bg-anchor-bg-raised"
              },
              {
                title: "Professional Service",
                content: (
                  <>
                    <p className="mb-4">Everything you need for successful business events:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2"><span className="text-anchor-gold-vivid"></span><span><strong>Dedicated event coordinator</strong> for seamless planning</span></li>
                      <li className="flex items-start gap-2"><span className="text-anchor-gold-vivid"></span><span><strong>Professional catering</strong> from coffee mornings to formal dinners</span></li>
                      <li className="flex items-start gap-2"><span className="text-anchor-gold-vivid"></span><span><strong>Tech support</strong> for presentations and video calls</span></li>
                      <li className="flex items-start gap-2"><span className="text-anchor-gold-vivid"></span><span><strong>Flexible timings</strong> - early starts and late finishes available</span></li>
                    </ul>
                  </>
                ),
                variant: "colored",
                color: "bg-anchor-bg-raised"
              }
            ]}
          />
        </Container>
      </section>

      {/* Event Types */}
      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <SectionHeader title="Corporate Event Solutions" subtitle="From board meetings to company celebrations" />
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card-dark rounded-none p-6">
              <div className="text-4xl mb-4"></div>
              <h3 className="text-xl font-bold text-anchor-gold-vivid mb-3">Business Meetings</h3>
              <p className="text-anchor-cream-text/70 mb-4">
                Private space for confidential discussions, client meetings, and presentations.
                Configurable for boardroom or theatre style.
              </p>
              <ul className="text-sm text-anchor-cream-text/70 space-y-1">
                <li>• 10-50 attendees</li>
                <li>• Presentation facilities</li>
                <li>• WiFi &amp; power points</li>
                <li>• Coffee &amp; refreshments</li>
              </ul>
            </div>
            <div className="card-dark rounded-none p-6">
              <div className="text-4xl mb-4"></div>
              <h3 className="text-xl font-bold text-anchor-gold-vivid mb-3">Team Building</h3>
              <p className="text-anchor-cream-text/70 mb-4">
                Bring your team together for workshops, training sessions, and team building
                activities in a relaxed environment.
              </p>
              <ul className="text-sm text-anchor-cream-text/70 space-y-1">
                <li>• Interactive spaces</li>
                <li>• Breakout areas</li>
                <li>• Team lunch options</li>
                <li>• Evening social space</li>
              </ul>
            </div>
            <div className="card-dark rounded-none p-6">
              <div className="text-4xl mb-4"></div>
              <h3 className="text-xl font-bold text-anchor-gold-vivid mb-3">Corporate Hospitality</h3>
              <p className="text-anchor-cream-text/70 mb-4">
                Impress clients and reward staff with corporate entertainment, celebrations,
                and networking events.
              </p>
              <ul className="text-sm text-anchor-cream-text/70 space-y-1">
                <li>• Client entertainment</li>
                <li>• Awards ceremonies</li>
                <li>• Product launches</li>
                <li>• Networking events</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 max-w-4xl mx-auto">
            <AlertBox
              variant="info"
              title="Also Perfect For:"
              content={
                <div className="grid md:grid-cols-2 gap-4 mt-2">
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
              }
            />
          </div>
        </Container>
      </section>

      {/* Corporate Solutions */}
      <section id="solutions" className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="Tailored Corporate Event Solutions"
            subtitle="Flexible venue hire pricing designed around your specific needs"
          />
          <div className="max-w-4xl mx-auto">
            <InfoBoxGrid
              columns={2}
              boxes={[
                {
                  title: "What We Offer",
                  content: (
                    <>
                      <p className="mb-4">Every corporate event is unique. We provide:</p>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2"><span className="text-anchor-gold-vivid"></span><span><strong>Flexible timing</strong> - Half day, full day, or evening sessions</span></li>
                        <li className="flex items-start gap-2"><span className="text-anchor-gold-vivid"></span><span><strong>Scalable spaces</strong> - Configure rooms for 10-50 attendees, with larger events by enquiry</span></li>
                        <li className="flex items-start gap-2"><span className="text-anchor-gold-vivid"></span><span><strong>Custom catering</strong> - From coffee breaks to formal dinners</span></li>
                        <li className="flex items-start gap-2"><span className="text-anchor-gold-vivid"></span><span><strong>Professional support</strong> - AV equipment and dedicated coordinator</span></li>
                        <li className="flex items-start gap-2"><span className="text-anchor-gold-vivid"></span><span><strong>Transparent pricing</strong> - Clear quotes with no hidden fees</span></li>
                      </ul>
                    </>
                  ),
                  variant: "default"
                },
                {
                  title: "How Our Pricing Works",
                  content: (
                    <>
                      <p className="mb-4">We believe in fair, flexible pricing:</p>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2"><span className="text-anchor-gold">•</span><span><strong>No venue hire fees</strong> - Just minimum spend requirements</span></li>
                        <li className="flex items-start gap-2"><span className="text-anchor-gold">•</span><span><strong>Weekday rates</strong> - More competitive for daytime events</span></li>
                        <li className="flex items-start gap-2"><span className="text-anchor-gold">•</span><span><strong>Bespoke quotes</strong> - Based on your specific requirements</span></li>
                        <li className="flex items-start gap-2"><span className="text-anchor-gold">•</span><span><strong>All-inclusive options</strong> - Know your total cost upfront</span></li>
                      </ul>
                    </>
                  ),
                  variant: "default"
                }
              ]}
            />
            <AlertBox
              variant="info"
              title="Get Your Personalised Quote"
              className="mt-8"
              content={
                <div className="text-center">
                  <p className="mb-4">
                    Tell us about your event - date, duration, number of attendees, and requirements.
                    We will create a tailored proposal that works for your budget.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href={CONTACT.phoneHref} className="w-full sm:w-auto">
                      <Button variant="primary" size="lg" fullWidth className="sm:w-auto">
                        Call to Discuss
                      </Button>
                    </Link>
                    <Link
                      href="https://wa.me/441753682707?text=Hi,%20I'd%20like%20a%20quote%20for%20a%20corporate%20event"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <Button variant="secondary" size="lg" fullWidth className="sm:w-auto">
                        WhatsApp Us
                      </Button>
                    </Link>
                  </div>
                </div>
              }
            />
            <div className="mt-12 text-center">
              <p className="text-lg text-anchor-cream-text/70 mb-6">
                Want to see our full catering options? From working lunches to celebration dinners.
              </p>
              <Link href="/food-menu" className="inline-block">
                <Button variant="secondary" size="lg">
                  View Catering Menu
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Facilities & Amenities */}
      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <SectionHeader title="Professional Facilities" subtitle="Everything you need for productive business events" />
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4">Technology &amp; Equipment</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div><strong>High-speed WiFi</strong><p className="text-sm text-anchor-cream-text/70">Reliable connection for video calls and presentations</p></div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div><strong>Presentation Equipment</strong><p className="text-sm text-anchor-cream-text/70">Projector/screen available, laptop connections</p></div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div><strong>Power Access</strong><p className="text-sm text-anchor-cream-text/70">Multiple power points for devices</p></div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div><strong>Audio System</strong><p className="text-sm text-anchor-cream-text/70">Microphone and speakers for larger groups</p></div>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4">Comfort &amp; Convenience</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div><strong>Climate Control</strong><p className="text-sm text-anchor-cream-text/70">Air conditioning and heating for year-round comfort</p></div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div><strong>Natural Light</strong><p className="text-sm text-anchor-cream-text/70">Bright spaces with blackout options available</p></div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div><strong>Full Accessibility</strong><p className="text-sm text-anchor-cream-text/70">Wheelchair access and accessible facilities</p></div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div><strong>Private Facilities</strong><p className="text-sm text-anchor-cream-text/70">Dedicated restrooms for your event</p></div>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-12 card-dark rounded-none p-8">
              <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4 text-center">Additional Services</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-2"></div>
                  <h4 className="font-semibold mb-1">Event Planning</h4>
                  <p className="text-sm text-anchor-cream-text/70">Dedicated coordinator to manage every detail</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2"></div>
                  <h4 className="font-semibold mb-1">Bespoke Catering</h4>
                  <p className="text-sm text-anchor-cream-text/70">Menus tailored to your requirements</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2"></div>
                  <h4 className="font-semibold mb-1">Outdoor Options</h4>
                  <p className="text-sm text-anchor-cream-text/70">Garden space for breaks or evening BBQs</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>


      {/* Location Advantages */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader title="Strategic Location for Business" />
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-anchor-bg-raised rounded-xl p-6 border border-anchor-gold/15">
                <h3 className="font-bold text-lg mb-4">Quick Access From</h3>
                <ul className="space-y-2 text-anchor-cream-text/70">
                  <li><strong>Heathrow Business Parks:</strong> 5-10 mins</li>
                  <li><strong>Heathrow Hotels:</strong> 5-10 mins</li>
                  <li><strong>Central London:</strong> 45 mins</li>
                  <li><strong>Staines:</strong> 8 mins</li>
                  <li><strong>Windsor:</strong> 15 mins</li>
                  <li><strong>Woking:</strong> 20 mins</li>
                </ul>
              </div>
              <div className="bg-anchor-bg-raised rounded-xl p-6 border border-anchor-gold/15">
                <h3 className="font-bold text-lg mb-4">Transport Links</h3>
                <ul className="space-y-2 text-anchor-cream-text/70">
                  <li><strong>M25 Junction 14:</strong> 3 mins</li>
                  <li><strong>Heathrow T5:</strong> 7 mins</li>
                  <li><strong>Staines Station:</strong> 10 mins</li>
                  <li><strong>Local Bus Routes:</strong> Regular service</li>
                  <li><strong>Taxi/Uber:</strong> Readily available</li>
                  <li><strong>Free Parking:</strong> 20 spaces</li>
                </ul>
              </div>
            </div>
            <AlertBox
              variant="success"
              title="Cost Savings for Your Business"
              content={
                <div className="grid md:grid-cols-3 gap-4 mt-4">
	                  <div>
	                    <strong>No ULEZ Charges</strong>
	                    <p className="text-sm">Save £12.50 per attendee</p>
	                  </div>
	                  <div>
	                    <strong>Free Parking</strong>
	                    <p className="text-sm">Save £20-40 per day</p>
	                  </div>
                  <div>
                    <strong>Flexible Venue Pricing</strong>
                    <p className="text-sm">Tailored to your event</p>
                  </div>
                </div>
              }
            />
          </div>
        </Container>
      </section>

      <div className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
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

      <PrivateBookingSection eventType="Corporate Event" />

      <InternalLinkingSection
        title="Also Explore"
        links={[
          { href: '/our-pub', title: 'See Inside The Anchor', description: 'Photos of the bar, dining room, garden and games area' },
          { href: '/private-hire', title: 'Private Hire & Events', description: 'Wakes, christenings, parties and more' },
          { href: '/function-room-hire', title: 'Function Room Hire', description: 'Flexible spaces with layout options for any occasion' },
        ]}
        className="section-spacing-md"
      />

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "What makes The Anchor ideal for corporate events near Heathrow?",
            answer: "We're just 7 minutes from Terminal 5 with free parking, making us perfect for international teams. We offer flexible room bookings for 10-50 guests, larger events by enquiry, professional catering, and competitive venue hire rates tailored to your needs. Being outside the ULEZ zone saves your attendees money too."
          },
          {
            question: "What technology and equipment do you provide for business meetings?",
            answer: "We provide high-speed WiFi, projector and screen, audio system with microphones, and multiple power points throughout our spaces. We can also arrange additional AV equipment through our suppliers if needed."
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
        className="bg-anchor-bg"
      />

      {/* CTA Section */}
      <section className="bg-anchor-bg-raised section-spacing-lg border-t border-anchor-gold/15">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-anchor-gold-vivid mb-6">
              Plan Your Corporate Event Today
            </h2>
            <p className="text-xl text-anchor-cream-text/70 mb-8">
              Professional venue • Strategic location • No hidden fees
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <BookTableButton
                source="corporate_events_cta"
                size="lg"
                variant="primary"
                context="corporate_event"
                fullWidth
                className="w-full sm:w-auto"
              >
                Book Your Event
              </BookTableButton>
              <PhoneButton phone={CONTACT.phone} source="corporate-events_cta" size="lg" className="sm:w-auto bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                  Call: {CONTACT.phone}
              </PhoneButton>
              <Link
                href="https://wa.me/441753682707?text=Hi,%20I'd%20like%20to%20enquire%20about%20corporate%20events"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button size="lg" variant="secondary" fullWidth className="sm:w-auto bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                  WhatsApp Us
                </Button>
              </Link>
              <Link href="mailto:manager@the-anchor.pub?subject=Corporate Event Enquiry" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" fullWidth className="sm:w-auto bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20">
                  Email Enquiry
                </Button>
              </Link>
            </div>
            <div className="mt-8 bg-anchor-bg-card rounded-xl p-6 max-w-2xl mx-auto border border-anchor-gold/15">
              <p className="text-anchor-cream-text/70 text-center text-lg">
                <strong>Quick Response Guaranteed</strong><br />
                We understand business moves fast. We will respond to your enquiry within 2 hours during business hours.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
