import Link from 'next/link'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { CONTACT } from '@/lib/constants'
import { Button, Container, SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox } from '@/components/ui'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { EventSchema } from '@/components/seo/EventSchema'
import { staticEvents } from '@/lib/static-events'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'

export const metadata: Metadata = {
  title: 'Heathrow Corporate Event Venue - Meeting Rooms with Parking | The Anchor',
  description: 'Host corporate events minutes from Heathrow. The Anchor offers private meeting rooms, breakout space, AV support and free parking 7 minutes from Terminal 5.',
  keywords: 'heathrow corporate event venue, meeting rooms near terminal 5, business event space stanwell moor, corporate hospitality near heathrow, venue with parking for meetings',
  openGraph: {
    title: 'Heathrow Corporate Event Venue - The Anchor Stanwell Moor',
    description: 'Private meeting rooms, AV support and free parking 7 minutes from Heathrow Terminal 5.',
    images: [DEFAULT_CORPORATE_IMAGE],
  },
  twitter: getTwitterMetadata({
    title: 'Heathrow Corporate Event Venue - The Anchor Stanwell Moor',
    description: 'Private meeting rooms, AV support and free parking 7 minutes from Heathrow Terminal 5.',
    images: [DEFAULT_CORPORATE_IMAGE]
  })
}


export default function CorporateEventsPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Private Events', url: '/book-event' },
    { name: 'Corporate Events', url: '/corporate-events' }
  ])

  return (
    <>
      <EventSchema event={staticEvents.corporateEvents} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      {/* Hero Section */}
      <HeroWrapper
        route="/corporate-events"
        title="Corporate Event Venue Near Heathrow"
        description="Professional meeting spaces and business event hosting 7 minutes from Terminal 5"
        variant="promo"
        tags={[
          { label: "✈️ 7 mins from Heathrow", variant: "success" },
          { label: "🚗 Free Parking", variant: "default" },
          { label: "📊 AV Equipment", variant: "default" },
          { label: "🚫 Outside ULEZ", variant: "success" }
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
            📅 Book Your Event
          </BookTableButton>
        }
        secondaryCta={
          <>
            <Link href={CONTACT.phoneHref} className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" fullWidth className="sm:w-auto">
                📞 Discuss Your Event
              </Button>
            </Link>
            <Link href="#solutions" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" fullWidth className="sm:w-auto">
                💼 Explore Our Solutions
              </Button>
            </Link>
          </>
        }
      />

      {/* Page Title */}
      <section className="py-8 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle
              seo={{
                structured: true,
                speakable: true
              }}
              className="text-anchor-green mb-4"
            >
              Corporate Events - Business Venue Near Heathrow
            </PageTitle>
            <p className="text-lg text-gray-700">
              Professional meeting rooms and event spaces for businesses, just 7 minutes from Terminal 5
            </p>
          </div>
        </Container>
      </section>

      {/* Why Choose The Anchor for Business */}
      <section className="section-spacing bg-gray-50">
        <Container>
          <SectionHeader
            title="Why Leading Companies Choose The Anchor"
            subtitle="The smart choice for business events near Heathrow"
          />
          
          <FeatureGrid
            columns={4}
            features={[
              {
                icon: "✈️",
                title: "Heathrow Proximity",
                description: "7 minutes from T5 - perfect for international teams & clients",
                className: "text-center"
              },
              {
                icon: "🚗",
                title: "Free Parking",
                description: "20 spaces on-site - saves £££ compared to city venues",
                className: "text-center"
              },
              {
                icon: "💷",
                title: "Flexible Pricing",
                description: "Competitive venue hire rates tailored to your needs",
                className: "text-center"
              },
              {
                icon: "🏢",
                title: "Flexible Spaces",
                description: "Configure for 10-200 guests - meetings to conferences",
                className: "text-center"
              }
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
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Outside ULEZ zone</strong> - no charges for attendees</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>M25 Junction 14</strong> - 3 minutes away</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Heathrow hotels</strong> - 5-10 minutes for overnight guests</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Central location</strong> - accessible from London & Surrey</span>
                      </li>
                    </ul>
                  </>
                ),
                variant: "colored",
                color: "bg-blue-50"
              },
              {
                title: "Professional Service",
                content: (
                  <>
                    <p className="mb-4">Everything you need for successful business events:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Dedicated event coordinator</strong> for seamless planning</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Professional catering</strong> from working breakfasts to formal dinners</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Tech support</strong> for presentations and video calls</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Flexible timings</strong> - early starts and late finishes available</span>
                      </li>
                    </ul>
                  </>
                ),
                variant: "colored",
                color: "bg-green-50"
              }
            ]}
          />
        </Container>
      </section>

      {/* Event Types */}
      <section className="section-spacing bg-gray-50">
        <Container>
          <SectionHeader
            title="Corporate Event Solutions"
            subtitle="From board meetings to company celebrations"
          />
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-anchor-green mb-3">Business Meetings</h3>
              <p className="text-gray-700 mb-4">
                Private space for confidential discussions, client meetings, and presentations. 
                Configurable for boardroom or theatre style.
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 10-50 attendees</li>
                <li>• Presentation facilities</li>
                <li>• WiFi & power points</li>
                <li>• Coffee & refreshments</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-anchor-green mb-3">Team Building</h3>
              <p className="text-gray-700 mb-4">
                Bring your team together for workshops, training sessions, and team building 
                activities in a relaxed environment.
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Interactive spaces</li>
                <li>• Breakout areas</li>
                <li>• Team lunch options</li>
                <li>• Evening social space</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-anchor-green mb-3">Corporate Hospitality</h3>
              <p className="text-gray-700 mb-4">
                Impress clients and reward staff with corporate entertainment, celebrations, 
                and networking events.
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
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
      <section id="solutions" className="section-spacing bg-white">
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
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">✓</span>
                          <span><strong>Flexible timing</strong> - Half day, full day, or evening sessions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">✓</span>
                          <span><strong>Scalable spaces</strong> - Configure for 10-200 attendees</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">✓</span>
                          <span><strong>Custom catering</strong> - From coffee breaks to formal dinners</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">✓</span>
                          <span><strong>Professional support</strong> - AV equipment and dedicated coordinator</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">✓</span>
                          <span><strong>Transparent pricing</strong> - Clear quotes with no hidden fees</span>
                        </li>
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
                        <li className="flex items-start gap-2">
                          <span className="text-anchor-gold">•</span>
                          <span><strong>No venue hire fees</strong> - Just minimum spend requirements</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-anchor-gold">•</span>
                          <span><strong>Weekday rates</strong> - More competitive for daytime events</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-anchor-gold">•</span>
                          <span><strong>Bespoke quotes</strong> - Based on your specific requirements</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-anchor-gold">•</span>
                          <span><strong>All-inclusive options</strong> - Know your total cost upfront</span>
                        </li>
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
                    We'll create a tailored proposal that works for your budget.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href={CONTACT.phoneHref} className="w-full sm:w-auto">
                      <Button variant="primary" size="lg" fullWidth className="sm:w-auto">
                        📞 Call to Discuss
                      </Button>
                    </Link>
                    <Link 
                      href="https://wa.me/441753682707?text=Hi,%20I'd%20like%20a%20quote%20for%20a%20corporate%20event" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <Button variant="secondary" size="lg" fullWidth className="sm:w-auto">
                        💬 WhatsApp Us
                      </Button>
                    </Link>
                  </div>
                </div>
              }
            />

            <div className="mt-12 text-center">
              <p className="text-lg text-gray-700 mb-6">
                Want to see our full catering options? From working lunches to celebration dinners.
              </p>
              <Link href="/food-menu" className="inline-block">
                <Button 
                  variant="secondary"
                  size="lg"
                >
                  View Catering Menu
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Facilities & Amenities */}
      <section className="section-spacing bg-anchor-cream">
        <Container>
          <SectionHeader
            title="Professional Facilities"
            subtitle="Everything you need for productive business events"
          />
          
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-anchor-green mb-4">Technology & Equipment</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">📡</span>
                    <div>
                      <strong>High-speed WiFi</strong>
                      <p className="text-sm text-gray-700">Reliable connection for video calls and presentations</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">🖥️</span>
                    <div>
                      <strong>Presentation Equipment</strong>
                      <p className="text-sm text-gray-700">Projector/screen available, laptop connections</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">🔌</span>
                    <div>
                      <strong>Power Access</strong>
                      <p className="text-sm text-gray-700">Multiple power points for devices</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">🎤</span>
                    <div>
                      <strong>Audio System</strong>
                      <p className="text-sm text-gray-700">Microphone and speakers for larger groups</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-anchor-green mb-4">Comfort & Convenience</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">🌡️</span>
                    <div>
                      <strong>Climate Control</strong>
                      <p className="text-sm text-gray-700">Air conditioning and heating for year-round comfort</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">💡</span>
                    <div>
                      <strong>Natural Light</strong>
                      <p className="text-sm text-gray-700">Bright spaces with blackout options available</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">♿</span>
                    <div>
                      <strong>Full Accessibility</strong>
                      <p className="text-sm text-gray-700">Wheelchair access and accessible facilities</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">🚻</span>
                    <div>
                      <strong>Private Facilities</strong>
                      <p className="text-sm text-gray-700">Dedicated restrooms for your event</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 bg-white rounded-xl p-8 shadow-md">
              <h3 className="text-xl font-bold text-anchor-green mb-4 text-center">Additional Services</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">📋</div>
                  <h4 className="font-semibold mb-1">Event Planning</h4>
                  <p className="text-sm text-gray-700">Dedicated coordinator to manage every detail</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🍽️</div>
                  <h4 className="font-semibold mb-1">Bespoke Catering</h4>
                  <p className="text-sm text-gray-700">Menus tailored to your requirements</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🎪</div>
                  <h4 className="font-semibold mb-1">Outdoor Options</h4>
                  <p className="text-sm text-gray-700">Garden space for breaks or evening BBQs</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>


      {/* Location Advantages */}
      <section className="section-spacing bg-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              title="Strategic Location for Business"
            />
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-anchor-sand/20 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4">Quick Access From</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>🏢 <strong>Heathrow Business Parks:</strong> 5-10 mins</li>
                  <li>🏨 <strong>Heathrow Hotels:</strong> 5-10 mins</li>
                  <li>🌆 <strong>Central London:</strong> 45 mins</li>
                  <li>🏛️ <strong>Staines:</strong> 8 mins</li>
                  <li>🏰 <strong>Windsor:</strong> 15 mins</li>
                  <li>🌳 <strong>Woking:</strong> 20 mins</li>
                </ul>
              </div>
              
              <div className="bg-anchor-sand/20 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4">Transport Links</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>🚗 <strong>M25 Junction 14:</strong> 3 mins</li>
                  <li>✈️ <strong>Heathrow T5:</strong> 7 mins</li>
                  <li>🚂 <strong>Staines Station:</strong> 10 mins</li>
                  <li>🚌 <strong>Local Bus Routes:</strong> Regular service</li>
                  <li>🚕 <strong>Taxi/Uber:</strong> Readily available</li>
                  <li>🚗 <strong>Free Parking:</strong> 20 spaces</li>
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

      <PrivateBookingSection eventType="Corporate Event" />

      {/* FAQ Section */}
      <FAQAccordionWithSchema 
        faqs={[
          {
            question: "What makes The Anchor ideal for corporate events near Heathrow?",
            answer: "We're just 7 minutes from Terminal 5 with free parking, making us perfect for international teams. We offer flexible spaces for 10-200 guests, professional catering, and competitive venue hire rates tailored to your needs. Being outside the ULEZ zone saves your attendees money too."
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
            answer: "We offer everything from working breakfasts and coffee breaks to buffet lunches and formal dinners. All menus can be customised to your requirements and dietary needs. We also provide drinks packages and bar tabs."
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
        className="bg-gray-50"
      />

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Plan Your Corporate Event Today
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Professional venue • Strategic location • No hidden fees
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <BookTableButton
                source="corporate_events_cta"
                size="lg"
                variant="secondary"
                context="corporate_event"
                fullWidth
                className="w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-100"
              >
                📅 Book Your Event
              </BookTableButton>
              <Link href="tel:+441753682707" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" fullWidth className="sm:w-auto bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                  📞 Call: 01753 682707
                </Button>
              </Link>
              <Link 
                href="https://wa.me/441753682707?text=Hi,%20I'd%20like%20to%20enquire%20about%20corporate%20events" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button size="lg" variant="secondary" fullWidth className="sm:w-auto bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                  💬 WhatsApp Us
                </Button>
              </Link>
              <Link href="mailto:manager@the-anchor.pub?subject=Corporate Event Enquiry" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" fullWidth className="sm:w-auto bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20">
                  📧 Email Enquiry
                </Button>
              </Link>
            </div>
            <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto">
              <p className="text-white text-center text-lg">
                <strong>Quick Response Guaranteed</strong><br />
                We understand business moves fast. We'll respond to your enquiry within 2 hours during business hours.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
