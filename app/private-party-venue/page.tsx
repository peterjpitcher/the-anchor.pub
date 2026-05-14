import Link from 'next/link'
import { Button } from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox, QuickInfoGrid, Container } from '@/components/ui'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { EventSchema } from '@/components/seo/EventSchema'
import { staticEvents } from '@/lib/static-events'
import { PhoneButton } from '@/components/PhoneButton'
import { BookTableButton } from '@/components/BookTableButton'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
  title: 'Party Venue Near Heathrow & Staines | The Anchor Pub',
  description: 'Book a party venue near Heathrow and Staines for birthdays, celebrations & private events. DJ space, late licence, 10-50 room bookings, free parking.',
  openGraph: {
    title: 'Party Venue Near Heathrow & Staines | The Anchor',
    description: 'Party venue near Heathrow with DJ space, late licence, and free parking. 10-50 room bookings for birthdays and celebrations.',
    images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
  },
  twitter: getTwitterMetadata({
    title: 'Party Venue Near Heathrow & Staines | The Anchor',
    description: 'Party venue near Heathrow with DJ space, late licence, and free parking. 10-50 room bookings for birthdays and celebrations.',
    images: [DEFAULT_CORPORATE_IMAGE]
  }),
  alternates: {
    canonical: '/private-party-venue'
  }
}


export default function PrivatePartyVenuePage() {
  return (
    <>
      <EventSchema event={staticEvents.privateParties} />

      {/* Hero Section */}
      <HeroWrapper
        showContextStrip={true}
        route="/private-party-venue"
        title="Party Venue Near Heathrow & Staines"
        description="The perfect spot for birthdays, milestones and social celebrations near Heathrow"
        tags={[
          { label: "10-50 Room Bookings", variant: "success" },
          { label: "All Occasions", variant: "default" },
          { label: "Free Parking", variant: "default" },
          { label: "Custom Menus", variant: "success" }
        ]}
        primaryCta={
          <BookTableButton
            source="private_party_hero"
            variant="primary"
            size="lg"
            context="private_party"
            fullWidth
            className="w-full sm:w-auto"
          >
            Book Your Party
          </BookTableButton>
        }
        secondaryCta={
          <>
            <PhoneButton
              phone="01753 682707"
              source="private_party_hero"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Call: 01753 682707
            </PhoneButton>
            <Link
              href="https://wa.me/441753682707?text=Hi,%20I"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                className="sm:w-auto"
              >
                WhatsApp Us
              </Button>
            </Link>
          </>
        }
        secondaryInfo={
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog & family friendly</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">10-50 room bookings</span>
          </div>
        }
      />

      {/* Page Title */}
      <section className="py-8 bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container size="md">
          <div className="text-center">
            <PageTitle
              seo={{ structured: true, speakable: true }}
              className="text-anchor-cream-text mb-4"
            >
              Party Venue Near Heathrow &amp; Staines &mdash; Birthdays &amp; Celebrations at The Anchor
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              DJ space, late licence, decorations welcome, everything you need for birthdays and celebrations
            </p>
          </div>
        </Container>
      </section>

      {/* Perfect For Section */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="Perfect for Every Celebration"
            subtitle="From milestone birthdays to surprise parties, we make your special day unforgettable"
          />
          <FeatureGrid
            columns={3}
            features={[
              { icon: "", title: "Birthday Parties", description: "18th, 21st, 30th, 40th, 50th and beyond - celebrate every milestone", className: "text-center" },
              { icon: "", title: "Anniversaries", description: "Silver, gold, or any year worth celebrating with family and friends", className: "text-center" },
              { icon: "", title: "Graduation Parties", description: "Mark academic achievements with a memorable celebration", className: "text-center" },
              { icon: "", title: "Baby Showers", description: "Welcome new arrivals with a special gathering", className: "text-center" },
              { icon: "", title: "Engagement Parties", description: "Toast the happy couple in style", className: "text-center" },
              { icon: "", title: "Achievement Celebrations", description: "New job, retirement, or any personal milestone", className: "text-center" }
            ]}
            className="mb-16"
          />
          <InfoBoxGrid
            columns={2}
            boxes={[
              {
                title: "Why Families Choose The Anchor",
                content: (
                  <>
                    <p className="mb-4">We understand what makes a great party venue:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2"><span className="text-anchor-gold-vivid"></span><span><strong>Flexible spaces</strong> - From intimate gatherings to large celebrations</span></li>
                      <li className="flex items-start gap-2"><span className="text-anchor-gold-vivid"></span><span><strong>Your music, your way</strong> - Bring your playlist or DJ</span></li>
                      <li className="flex items-start gap-2"><span className="text-anchor-gold-vivid"></span><span><strong>Decoration freedom</strong> - Make the space your own</span></li>
                      <li className="flex items-start gap-2"><span className="text-anchor-gold-vivid"></span><span><strong>All ages welcome</strong> - Family-friendly environment</span></li>
                    </ul>
                  </>
                ),
                variant: "colored",
                color: "bg-anchor-bg-raised"
              },
              {
                title: "Stress-Free Planning",
                content: (
                  <>
                    <p className="mb-4">Let us handle the details while you enjoy the party:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2"><span className="text-anchor-gold-vivid"></span><span><strong>Dedicated coordinator</strong> - One point of contact throughout</span></li>
                      <li className="flex items-start gap-2"><span className="text-anchor-gold-vivid"></span><span><strong>Custom menus</strong> - Catering to match your taste and budget</span></li>
                      <li className="flex items-start gap-2"><span className="text-anchor-gold-vivid"></span><span><strong>Setup assistance</strong> - We help create your vision</span></li>
                      <li className="flex items-start gap-2"><span className="text-anchor-gold-vivid"></span><span><strong>Clean-up included</strong> - Just enjoy your event</span></li>
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

      {/* What's Included */}
      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container size="md">
          <SectionHeader title="Everything You Need for a Perfect Party" />
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold text-anchor-gold-vivid mb-6">Venue Features</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-anchor-gold"></span>
                  <div><strong>Flexible Spaces</strong><p className="text-sm text-anchor-cream-text/70">Configure for your party size and style</p></div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-anchor-gold"></span>
                  <div><strong>Music System</strong><p className="text-sm text-anchor-cream-text/70">Connect your playlist or bring a DJ</p></div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-anchor-gold"></span>
                  <div><strong>Party Lighting</strong><p className="text-sm text-anchor-cream-text/70">Create the perfect atmosphere</p></div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-anchor-gold"></span>
                  <div><strong>Free Parking for Guests</strong><p className="text-sm text-anchor-cream-text/70">20 spaces while attending your event</p></div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-anchor-gold"></span>
                  <div><strong>Full Accessibility</strong><p className="text-sm text-anchor-cream-text/70">Everyone can join the celebration</p></div>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-anchor-gold-vivid mb-6">Food &amp; Drink Options</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-anchor-gold"></span>
                  <div><strong>Buffet Service</strong><p className="text-sm text-anchor-cream-text/70">Hot and cold options to suit all tastes</p></div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-anchor-gold"></span>
                  <div><strong>Pizza Parties</strong><p className="text-sm text-anchor-cream-text/70">Perfect for casual celebrations</p></div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-anchor-gold"></span>
                  <div><strong>Drinks Packages</strong><p className="text-sm text-anchor-cream-text/70">From welcome drinks to full bar tabs</p></div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-anchor-gold"></span>
                  <div><strong>Cake Service</strong><p className="text-sm text-anchor-cream-text/70">We will serve your celebration cake</p></div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-anchor-gold"></span>
                  <div><strong>Dietary Options</strong><p className="text-sm text-anchor-cream-text/70">Vegetarian, vegan, and allergy-friendly</p></div>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Add-On Services */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <SectionHeader title="Make It Extra Special" subtitle="Additional services to enhance your celebration" />
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="card-dark rounded-none p-6 text-center">
              <div className="text-3xl mb-3"></div>
              <h4 className="font-bold mb-2">Decorations</h4>
              <p className="text-sm text-anchor-cream-text/70">Balloons, banners, table decorations</p>
            </div>
            <div className="card-dark rounded-none p-6 text-center">
              <div className="text-3xl mb-3"></div>
              <h4 className="font-bold mb-2">Photography</h4>
              <p className="text-sm text-anchor-cream-text/70">Capture every special moment</p>
            </div>
            <div className="card-dark rounded-none p-6 text-center">
              <div className="text-3xl mb-3"></div>
              <h4 className="font-bold mb-2">Entertainment</h4>
              <p className="text-sm text-anchor-cream-text/70">DJs, performers, sound system</p>
            </div>
            <div className="card-dark rounded-none p-6 text-center">
              <div className="text-3xl mb-3"></div>
              <h4 className="font-bold mb-2">Flowers</h4>
              <p className="text-sm text-anchor-cream-text/70">Beautiful arrangements and centerpieces</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Party Planning Timeline */}
      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container size="sm">
          <SectionHeader title="Simple Party Planning Process" subtitle="We make organising your celebration easy" />
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-anchor-gold text-anchor-bg rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Initial Enquiry</h3>
                <p className="text-anchor-cream-text/70">Call, WhatsApp, or email us with your party date and guest numbers</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-anchor-gold text-anchor-bg rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Discuss Your Vision</h3>
                <p className="text-anchor-cream-text/70">We will chat about your ideas, menu preferences, and any special requirements</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-anchor-gold text-anchor-bg rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Receive Your Quote</h3>
                <p className="text-anchor-cream-text/70">Clear pricing with no hidden extras - know exactly what you are paying</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-anchor-gold text-anchor-bg rounded-full flex items-center justify-center font-bold">4</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Secure Your Date</h3>
                <p className="text-anchor-cream-text/70">Small deposit holds your booking - fully refundable if plans change (14 days notice)</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-anchor-gold text-anchor-bg rounded-full flex items-center justify-center font-bold">5</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Final Details</h3>
                <p className="text-anchor-cream-text/70">Confirm numbers and any last-minute changes a week before</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-anchor-gold text-anchor-bg rounded-full flex items-center justify-center font-bold">6</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Party Time!</h3>
                <p className="text-anchor-cream-text/70">Arrive and enjoy - we will handle everything else</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Location Benefits */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <Container size="md">
          <div className="text-center">
            <SectionHeader title="Easy to Reach from Everywhere" subtitle="Central location with free parking makes party planning simple" />
            <QuickInfoGrid
              items={[
                { icon: "", title: "Staines: 8 minutes" },
                { icon: "", title: "Ashford: 10 minutes" },
                { icon: "", title: "Feltham: 10 minutes" },
                { icon: "", title: "Heathrow: 7 minutes" },
                { icon: "", title: "Sunbury: 15 minutes" },
                { icon: "", title: "Egham: 12 minutes" }
              ]}
              columns={3}
              className="mb-8"
            />
            <InfoBoxGrid
              columns={1}
              boxes={[
                {
                  title: "Why Location Matters for Parties",
                  content: (
                    <div className="text-center">
                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <div className="text-2xl mb-2"></div>
                          <h4 className="font-semibold mb-1">Free Parking</h4>
                          <p className="text-sm text-anchor-cream-text/70">No expensive taxis needed - everyone can drive</p>
                        </div>
                        <div>
                          <div className="text-2xl mb-2"></div>
                          <h4 className="font-semibold mb-1">Public Transport</h4>
                          <p className="text-sm text-anchor-cream-text/70">Bus stops nearby for non-drivers</p>
                        </div>
                        <div>
                          <div className="text-2xl mb-2"></div>
                          <h4 className="font-semibold mb-1">Central Location</h4>
                          <p className="text-sm text-anchor-cream-text/70">Easy for guests from multiple areas</p>
                        </div>
                      </div>
                    </div>
                  ),
                  variant: "default"
                }
              ]}
            />
          </div>
        </Container>
      </section>

      <PrivateBookingSection eventType="Birthday Party" />

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
            answer: "Yes! We're a family-friendly venue and welcome guests of all ages. Children must be supervised, and we stop serving alcohol to under-18s at 9pm. We have children's menu options available."
          },
	          {
	            question: "Is there a room hire fee for private parties?",
	            answer: "Yes, room hire fees vary depending on the day, time, and group size. There is no minimum spend required. We'll discuss pricing when you enquire."
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
        className="bg-anchor-bg-card"
      />

      {/* CTA Section */}
      <section className="bg-anchor-bg-raised py-16 md:py-24 border-t border-anchor-gold/15">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-anchor-gold-vivid mb-6">
              Plan Your Perfect Party
            </h2>
            <p className="text-xl text-anchor-cream-text/70 mb-8">
              Get in touch today to check availability and discuss your celebration
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <BookTableButton
                source="private_party_cta"
                size="lg"
                variant="primary"
                context="private_party"
                fullWidth
                className="w-full sm:w-auto"
              >
                Book Your Party
              </BookTableButton>
              <Link href="tel:+441753682707" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" fullWidth className="sm:w-auto bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                  Call: 01753 682707
                </Button>
              </Link>
              <Link
                href="https://wa.me/441753682707?text=Hi,%20I'd%20like%20to%20enquire%20about%20private%20party%20venue%20hire"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button size="lg" variant="secondary" fullWidth className="sm:w-auto bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                  WhatsApp Us
                </Button>
              </Link>
              <Link href="mailto:manager@the-anchor.pub?subject=Private Party Enquiry" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" fullWidth className="sm:w-auto bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20">
                  Email Enquiry
                </Button>
              </Link>
            </div>
            <div className="mt-8 bg-anchor-bg-card rounded-xl p-6 max-w-2xl mx-auto border border-anchor-gold/15">
              <p className="text-anchor-cream-text/70 text-center">
                <strong>Quick Response Promise</strong><br />
                We will get back to you within 2 hours during opening hours<br />
                <strong>WhatsApp:</strong> 01753 682707 for instant chat
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
