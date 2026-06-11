import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { PhoneButton } from '@/components/PhoneButton'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { Badge, Button, Card, CardBody, Container, Section } from '@/components/ui'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { CONTACT, HEATHROW_TIMES } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

const HALLOWEEN_BOOKING_URL = '/book-table?purpose=food'

const addressLine = `${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.county}, ${CONTACT.address.postcode}`
const mapQuery = `The Anchor, ${CONTACT.address.street}, ${CONTACT.address.postcode}`

export const metadata: Metadata = {
  title: 'Halloween Pub Near Heathrow | Fancy Dress & Cocktails',
  description:
    'Halloween 2026 at The Anchor near Heathrow. Fancy dress party, themed cocktails, spooky decorations. Free parking, dog-friendly. 31 October.',
  alternates: { canonical: '/halloween' },
  openGraph: {
    title: 'Halloween Pub Near Heathrow | Fancy Dress & Themed Cocktails at The Anchor',
    description:
      'Halloween 2026 at The Anchor near Heathrow. Fancy dress party, themed cocktails, spooky decorations. Free parking, dog-friendly. 31 October.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Halloween Pub Near Heathrow | Fancy Dress & Themed Cocktails at The Anchor',
    description:
      'Halloween 2026 at The Anchor near Heathrow. Fancy dress party, themed cocktails, spooky decorations. Free parking, dog-friendly. 31 October.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
  }),
}

const faqs = [
  {
    question: 'Is there a dress code for Halloween?',
    answer:
      'Fancy dress is encouraged but absolutely not required. Whether you turn up in full costume or just your usual glad rags, you\u2019re welcome. There are prizes for the best costume, so if you\u2019re feeling creative, go for it.',
  },
  {
    question: 'Is Halloween at The Anchor family-friendly?',
    answer:
      'Earlier in the evening (before 8pm) is great for families. Kids in costume are very welcome, and the beer garden is perfect for trick-or-treat age children before it gets dark. Later in the evening the atmosphere shifts to a more adult crowd.',
  },
  {
    question: 'Do you serve food on Halloween?',
    answer:
      'Yes, our regular food menu is available earlier in the evening. Halloween falls on a Saturday in 2026, so the kitchen is open 1pm\u20137pm. Book a table if you\u2019d like to eat.',
  },
  {
    question: 'Is there parking?',
    answer:
      `Free on-site parking is available for guests. We\u2019re about ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 by car. You\u2019ll find us at ${addressLine}.`,
  },
]

export default function HalloweenPage() {
  return (
    <>

            <HeroWrapper
        route="/halloween"
        title="Halloween Pub Night at The Anchor"
        description="Fancy dress, themed cocktails, spooky decorations and a brilliant atmosphere. Join us on 31 October for our annual Halloween celebration in Stanwell Moor."
        eyebrow="Saturday 31 October 2026"
        lead={
          <p className="text-white/90 text-base sm:text-lg">
            Fancy dress encouraged &middot; Themed cocktails &middot; Prizes for best costume
          </p>
        }
        enableSmartCtas={true}
        showContextStrip={true}
      />

      <Section spacing="md" background="white">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-12">
            {/* Halloween Night */}
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
                Halloween Night
              </h2>
              <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
                Every year we go all out for Halloween at The Anchor. The pub gets fully decked out with
                spooky decorations, the bar team put together a menu of themed cocktails and shots, and
                fancy dress is very much encouraged (though never required, you won&apos;t be turned away
                in jeans).
              </p>
              <p className="text-anchor-cream-text/70 leading-relaxed">
                There&apos;s something about the beer garden on Halloween night that&apos;s hard to beat. Stanwell
                Moor sits right under the Heathrow flight path, so you get planes lit up overhead, the
                autumn air, and a drink in hand. It adds to the atmosphere in a way you wouldn&apos;t expect.
              </p>
            </div>

            {/* What to Expect */}
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
                What to Expect
              </h2>
              <p className="text-anchor-cream-text/70 leading-relaxed">
                Previous years have featured themed cocktails, spooky shots, and a few surprises behind
                the bar. The music keeps things lively, and there are prizes for the best fancy dress
                costume, so it&apos;s worth making an effort if you&apos;re the competitive type.
              </p>
              <p className="text-anchor-cream-text/70 leading-relaxed">
                Our regular food menu is available earlier in the evening (kitchen closes at 7pm on
                Saturdays), so you can come for dinner before the Halloween festivities really get going.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="green">Themed cocktails &amp; shots</Badge>
                <Badge variant="green">Music</Badge>
                <Badge variant="success">Best costume prizes</Badge>
                <Badge variant="green">Food menu (until 7pm)</Badge>
              </div>
            </div>

            {/* Families Welcome */}
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
                Families Welcome
              </h2>
              <p className="text-anchor-cream-text/70 leading-relaxed">
                Earlier in the evening, before about 8pm, Halloween at The Anchor is great
                for families. Kids in costume are very welcome, and the beer garden is perfect for
                trick-or-treat age children. There&apos;s plenty of space to run around, and the decorations
                are more fun than frightening.
              </p>
              <p className="text-anchor-cream-text/70 leading-relaxed">
                Later in the evening, the vibe shifts to a more adult crowd. If you&apos;re bringing little
                ones, the earlier the better.
              </p>
            </div>

            {/* Booking */}
            <div className="rounded-2xl border border-anchor-gold-dark/15 bg-anchor-green-raised p-6 space-y-4">
              <h2 className="text-2xl font-bold text-anchor-cream-text">Booking</h2>
              <p className="text-anchor-cream-text/70 leading-relaxed">
                Walk-ins are welcome for drinks all evening. If you&apos;d like to eat, we recommend booking
                a table, the kitchen is open 1pm&ndash;7pm on Saturdays.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="primary" size="lg" fullWidth className="w-full sm:w-auto sm:min-w-[220px]">
                  <a href={HALLOWEEN_BOOKING_URL}>Book a Table for Food</a>
                </Button>
                <PhoneButton
                  phone={CONTACT.phone}
                  source="halloween_booking"
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Call {CONTACT.phone}
                </PhoneButton>
              </div>
              <p className="text-sm text-anchor-cream-text/70">
                Tables for 8+ guests, please call.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="lg" background="gray">
        <Container size="lg">
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
              Join us on Halloween
            </h2>
            <p className="text-anchor-cream-text/70 text-lg">
              Saturday 31 October 2026. Fancy dress, themed drinks, and a proper Halloween night out
              at The Anchor in Stanwell Moor.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="primary" size="lg" fullWidth className="w-full sm:w-auto">
                <a href={HALLOWEEN_BOOKING_URL}>Book a Table</a>
              </Button>
              <PhoneButton
                phone={CONTACT.phone}
                source="halloween_cta"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                Call {CONTACT.phone}
              </PhoneButton>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="lg" background="white">
        <Container size="lg">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
                  Where we are
                </h2>
                <p className="text-anchor-cream-text/70 leading-relaxed">
                  The Anchor is in Stanwell Moor, Surrey (TW19 6AQ), about {HEATHROW_TIMES.terminal5} minutes
                  from Heathrow Terminal 5, with free on-site parking.
                </p>
                <p className="text-anchor-cream-text/70">
                  Address: <span className="font-semibold text-anchor-gold-bright">{addressLine}</span>
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/find-us" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" fullWidth className="w-full sm:w-auto">
                      Directions &amp; parking
                    </Button>
                  </Link>
                  <PhoneButton
                    phone={CONTACT.phone}
                    source="halloween_location"
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Call {CONTACT.phone}
                  </PhoneButton>
                </div>
              </div>
              <GoogleMapEmbed query={mapQuery} height={360} />
            </div>
          </div>
        </Container>
      </Section>

      <FAQAccordionWithSchema title="Halloween FAQs" faqs={faqs} className="bg-anchor-green-deep" />

      <InternalLinkingSection
        title="More to explore at The Anchor"
        links={[
          { href: HALLOWEEN_BOOKING_URL, title: 'Book a Table', description: 'Reserve online in minutes' },
          { href: '/whats-on', title: "What's On", description: 'Upcoming events and entertainment' },
          ...commonLinkGroups.dining,
          ...commonLinkGroups.location,
        ]}
      />
    </>
  )
}
