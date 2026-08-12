import Link from 'next/link'
import ssot from '@/SSOT.json'
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
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { TrustBar, ValueProofStrip, RegretReduction } from '@/components/psychology'
import { VenueTourTeaser } from '@/components/private-hire/venue-tour'
import {
  CHRISTMAS_DEPOSIT_PER_PERSON,
  CHRISTMAS_MINIMUM_NOTICE_HOURS,
  CHRISTMAS_MINIMUM_PARTY_SIZE,
  formatChristmasWindowLabel
} from '@/lib/christmas-season'

const OG_DESCRIPTION = 'Work events, team meals and office Christmas parties near Heathrow. Private hire and free parking, around 7 minutes from Terminal 5.'

export const metadata: Metadata = {
  title: 'Corporate & Christmas Parties Near Heathrow',
  description: 'A real pub for work events near Heathrow, not a hotel function room. Team meals and office Christmas parties, VAT invoices and free parking, 7 mins from T5.',
  openGraph: {
    title: 'Corporate Event Venue Near Heathrow | The Anchor',
    description: OG_DESCRIPTION,
    images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
  },
  twitter: getTwitterMetadata({
    title: 'Corporate Event Venue Near Heathrow | The Anchor',
    description: OG_DESCRIPTION,
    images: [DEFAULT_CORPORATE_IMAGE]
  }),
  alternates: {
    canonical: '/corporate-events'
  }
}

/**
 * Christmas capacity and the festive buffet minimum are read from the SSOT
 * rather than restated, so this page cannot drift from the Christmas hub.
 */
type SsotCorporateFacts = {
  venue: { capacity: { christmas_seated: number, christmas_standing: number } }
  christmas_2026: { buffets: { min_guests: number } }
}

const { venue: SSOT_VENUE, christmas_2026: SSOT_CHRISTMAS } = ssot as unknown as SsotCorporateFacts


export default function CorporateEventsPage() {
  return (
    <>
      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/corporate-events/corporate-events.jpg"
        crumb="Corporate Events"
        title="Corporate Event Venue Near Heathrow"
        lead="Meetings, team days and office Christmas parties for 10+ to 150 guests, with larger corporate events by enquiry. Around 7 minutes from Terminal 5, traffic dependent, with free parking."
        badges={
          <>
            <Badge variant="sand">Around 7 mins from Heathrow</Badge>
            <Badge variant="sand">Free Parking</Badge>
            <Badge variant="sand">TVs &amp; Sound System</Badge>
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
          <div className="mx-auto text-center">
            <PageTitle
              seo={{ structured: true, speakable: true }}
              className="text-ink-strong mb-4"
            >
              Corporate Events and Office Christmas Parties Near Heathrow
            </PageTitle>
            <p className="text-lg text-ink-muted">
              Planning a work event near Heathrow? The Anchor hosts meetings, training days, team meals and office Christmas parties for 10+ to 150 guests, with larger events by enquiry. We are around 7 minutes from Terminal 5, traffic dependent, and this is a proper village pub rather than a hotel function room, so your team gets its own space instead of sharing a ballroom with three other companies.
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
              { title: "Free Parking", description: "20 free spaces on site, no fees and no time limit while you are with us" },
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
                <li><strong className="text-ink-strong">M25 Junction 14</strong> - 2 minutes away</li>
                <li><strong className="text-ink-strong">Heathrow hotels</strong> - 5-10 minutes for overnight guests</li>
                <li><strong className="text-ink-strong">Central location</strong> - accessible from London &amp; Surrey</li>
              </ul>
            </CardBody></Card>
            <Card accent><CardBody>
              <h3 className="font-display text-h4 text-ink-strong mb-4">Professional Service</h3>
              <p className="mb-4 text-ink-muted">Everything you need for successful business events:</p>
              <ul className="space-y-2 text-ink-muted">
                <li><strong className="text-ink-strong">Dedicated events coordinator</strong> for seamless planning</li>
                <li><strong className="text-ink-strong">Professional catering</strong> from coffee mornings to formal dinners</li>
                <li><strong className="text-ink-strong">TVs and a sound system</strong> for presentations, with free WiFi throughout</li>
                <li><strong className="text-ink-strong">Flexible timings</strong> - early starts and late finishes available</li>
                <li><strong className="text-ink-strong">VAT invoices</strong> for corporate bookings, so expenses are straightforward</li>
              </ul>
            </CardBody></Card>
          </div>
        </Container>
      </section>

      {/* Event Types */}
      <section className="py-section-y bg-surface-sunk">
        <Container>
          <SectionHeading title="Corporate Event Solutions" lead="From board meetings to company celebrations" />
          <div className="grid md:grid-cols-3 gap-8 mx-auto">
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
          <div className="mt-12 mx-auto">
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
                  <li>• Office Christmas parties and festive team lunches</li>
                  <li>• Company milestone celebrations</li>
                  <li>• Retirement parties</li>
                  <li>• Long service awards</li>
                </ul>
              </div>
            </CardBody></Card>
          </div>
        </Container>
      </section>

      {/* Office Christmas Parties */}
      <section id="christmas" className="py-section-y bg-canvas">
        <Container>
          <SectionHeading
            title="Office Christmas Parties Near Heathrow"
            lead="A work Christmas do in a village pub, not a hotel function room"
          />
          <div className="mx-auto">
            <p className="mb-6 text-lg text-ink-muted">
              Most office Christmas parties near Heathrow end up in a hotel ballroom, sharing the room, the playlist and the bar
              with two or three other companies. The Anchor works the other way round. Your team gets its own table in a proper
              village pub around 7 minutes from Terminal 5, traffic dependent, with 20 free parking spaces on site and no ULEZ
              charge to reach us. It suits a lunchtime team meal, an evening work Christmas do, or a full private hire of the
              dining room or beer garden.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card accent><CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-4">How Christmas bookings work</h3>
                <ul className="space-y-2 text-ink-muted">
                  <li><strong className="text-ink-strong">Festive service runs {formatChristmasWindowLabel()}</strong></li>
                  <li><strong className="text-ink-strong">Minimum {CHRISTMAS_MINIMUM_PARTY_SIZE} guests</strong> on every Christmas booking</li>
                  <li><strong className="text-ink-strong">Sittings Tuesday to Saturday</strong>, plus Sunday between 1pm and 6pm. Mondays are not available, the kitchen is closed</li>
                  <li><strong className="text-ink-strong">At least {CHRISTMAS_MINIMUM_NOTICE_HOURS} hours notice</strong> - no same-day Christmas bookings</li>
                  <li><strong className="text-ink-strong">£{CHRISTMAS_DEPOSIT_PER_PERSON} per person deposit</strong>, deducted from your final bill</li>
                  <li><strong className="text-ink-strong">Meal choices 7 days ahead</strong> for the two and three course tiers</li>
                  <li><strong className="text-ink-strong">Groups above 20</strong> are handled as private hire, so give us a call</li>
                </ul>
              </CardBody></Card>
              <Card accent><CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-4">What your team gets</h3>
                <ul className="space-y-2 text-ink-muted">
                  <li><strong className="text-ink-strong">A festive set menu</strong> at one, two or three courses</li>
                  <li><strong className="text-ink-strong">A glass of prosecco</strong> for every adult, swappable for orange juice</li>
                  <li><strong className="text-ink-strong">Festive buffets</strong> for parties of {SSOT_CHRISTMAS.buffets.min_guests} guests or more</li>
                  <li><strong className="text-ink-strong">Room for {SSOT_VENUE.capacity.christmas_seated} seated</strong> or {SSOT_VENUE.capacity.christmas_standing} standing at Christmas</li>
                  <li><strong className="text-ink-strong">The menu is released closer to the time</strong>, with prices shown live on the Christmas page</li>
                </ul>
              </CardBody></Card>
            </div>
            <p className="mt-8 text-lg text-ink-muted">
              Dates, courses and the deposit are all set out on our{' '}
              <Link href="/christmas-parties" className="font-semibold text-accent-text underline">
                work Christmas party venue near Heathrow
              </Link>{' '}
              page. If you are still at the planning stage, the{' '}
              <Link href="/blog/christmas-party-planning-checklist-for-organisers" className="font-semibold text-accent-text underline">
                Christmas party checklist for organisers
              </Link>{' '}
              walks through the decisions in order: headcount first, then the date, the deposit and the allergen question.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button asChild variant="primary" size="lg" fullWidth className="sm:w-auto">
                <Link href="/christmas-parties" className="w-full sm:w-auto">
                  See Christmas Booking Dates
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" fullWidth className="sm:w-auto">
                <Link href={CONTACT.phoneHref} className="w-full sm:w-auto">
                  Talk to Us About Your Work Party
                </Link>
              </Button>
            </div>
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
          <div className="mx-auto">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card><CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-4">What We Offer</h3>
                <p className="mb-4 text-ink-muted">Every corporate event is unique. We provide:</p>
                <ul className="space-y-3 text-ink-muted">
                  <li><strong className="text-ink-strong">Flexible timing</strong> - Half day, full day, or evening sessions</li>
                  <li><strong className="text-ink-strong">Scalable spaces</strong> - Configure rooms for 10+ to 150 attendees, with larger events by enquiry</li>
                  <li><strong className="text-ink-strong">Custom catering</strong> - From coffee breaks to formal dinners</li>
                  <li><strong className="text-ink-strong">Professional support</strong> - TVs, sound system and a dedicated events coordinator</li>
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
                  <li><strong className="text-ink-strong">VAT invoices</strong> - Issued for corporate bookings, so your finance team gets what it needs for the books</li>
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
          <div className="mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <Card><CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-4">Technology &amp; Equipment</h3>
                <ul className="space-y-3 text-ink-muted">
                  <li><strong className="text-ink-strong">High-speed WiFi</strong><p className="text-sm">Reliable connection for video calls and presentations</p></li>
                  <li><strong className="text-ink-strong">Presentation Equipment</strong><p className="text-sm">TVs and a sound system for slides and speeches; we do not have a projector</p></li>
                  <li><strong className="text-ink-strong">Power Access</strong><p className="text-sm">Multiple power points for devices</p></li>
                  <li><strong className="text-ink-strong">Audio System</strong><p className="text-sm">Microphone and speakers for larger groups</p></li>
                </ul>
              </CardBody></Card>
              <Card><CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-4">Comfort &amp; Convenience</h3>
                <ul className="space-y-3 text-ink-muted">
                  <li><strong className="text-ink-strong">Heating</strong><p className="text-sm">A warm, comfortable space through the cooler months</p></li>
                  <li><strong className="text-ink-strong">Natural Light</strong><p className="text-sm">The dining room has French doors opening onto the beer garden</p></li>
                  <li><strong className="text-ink-strong">Accessibility</strong><p className="text-sm">Step-free bar and dining area; garden ramp on request; no accessible toilet</p></li>
                  <li><strong className="text-ink-strong">Table Service</strong><p className="text-sm">Food is brought to your tables rather than collected from the bar</p></li>
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
          <div className="mx-auto text-center">
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
                  <li><strong className="text-ink-strong">M25 Junction 14:</strong> 2 mins</li>
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
                  <p className="text-sm">Around £12.50 a day saved per attendee against a London venue</p>
                </div>
                <div>
                  <strong className="text-ink-strong">Free Parking</strong>
                  <p className="text-sm">20 free spaces on site, with no fees and no time limit</p>
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
          <div className="mx-auto">
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
            answer: "We provide free WiFi throughout the pub and beer garden, TVs, a sound system with microphones, and multiple power points throughout our spaces. We do not have a projector, so tell us what you plan to show and we will talk it through before you book."
          },
          {
            question: "Can we hold our office Christmas party at The Anchor?",
            answer: `Yes. Work Christmas parties are one of the things we do most, and festive service runs ${formatChristmasWindowLabel()}. Sittings are Tuesday to Saturday, plus Sunday between 1pm and 6pm. Mondays are not available because the kitchen is closed. Every Christmas booking needs at least ${CHRISTMAS_MINIMUM_PARTY_SIZE} guests, at least ${CHRISTMAS_MINIMUM_NOTICE_HOURS} hours notice, and a £${CHRISTMAS_DEPOSIT_PER_PERSON} per person deposit that comes straight off your final bill. Groups above 20 are handled as private hire, so call us on 01753 682707 and we will plan it with you.`
          },
          {
            question: "How many people can you seat for a work Christmas party?",
            answer: `At Christmas we seat ${SSOT_VENUE.capacity.christmas_seated} guests, or host up to ${SSOT_VENUE.capacity.christmas_standing} standing. You can take the dining room, the beer garden or the whole venue depending on the size of your team, and a festive buffet is available for parties of ${SSOT_CHRISTMAS.buffets.min_guests} guests or more.`
          },
          {
            question: "What is on the Christmas menu for work parties?",
            answer: "The festive set menu runs at one, two or three courses, and every adult gets a glass of prosecco, swappable for orange juice. The two and three course tiers are pre-ordered, so we need everyone's meal choices 7 days before your booking date. The one course tier has no pre-order. The dishes are released closer to the time, and prices are always shown live on the Christmas parties page."
          },
          {
            question: "Can you provide a VAT invoice for our company?",
            answer: "Yes. We can issue a VAT invoice for corporate bookings. Tell our events coordinator the company name and address you need on it, and we will send it over after your event."
          },
          {
            question: "How is a work Christmas do here different from a hotel party night?",
            answer: "Hotel party nights near Heathrow usually put several companies in one function room with a shared bar and a DJ. We are a village pub around 7 minutes from Terminal 5, so your team gets its own table or its own room, free parking for everyone, and no ULEZ charge to reach us."
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

      <OrganicSearchClusterLinks
        cluster="christmas"
        currentPath="/corporate-events"
        title="Planning a work Christmas party?"
        intro="Compare the festive set menu, private room hire and what else is on at The Anchor near Heathrow."
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
          <strong>We know business moves fast.</strong> Call, WhatsApp or email and our events coordinator will come back to you with a tailored quote.
        </p>
      </CtaBand>
    </>
  )
}
