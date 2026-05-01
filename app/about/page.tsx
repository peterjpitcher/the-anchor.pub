import Link from 'next/link'
import { Metadata } from 'next'
import { HeroWrapper } from '@/components/hero'
import { JsonLd } from '@/components/JsonLd'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BookTableButton } from '@/components/BookTableButton'
import { DirectionsButton } from '@/components/DirectionsButton'
import {
  Button,
  Container,
  Section,
  SectionHeader,
  FeatureGrid,
  Card,
  CardBody,
  Grid,
} from '@/components/ui'

export const metadata: Metadata = {
  title: 'About Us | Our Story Since 1751',
  description:
    "The Anchor in Stanwell Moor has been a village pub since 1751. Rated 4.6/5 on Google with 5-star food hygiene. Meet the team behind Heathrow\u2019s favourite local pub.",
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About The Anchor | Our Story Since 1751',
    description:
      'A proper village pub since 1751, now the closest traditional British pub to Heathrow Airport. 4.6/5 on Google, 5-star food hygiene, dog-friendly, free parking.',
    url: '/about',
    siteName: 'The Anchor',
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: '/images/page-headers/home/page-headers-homepage.jpg',
        width: 1200,
        height: 630,
        alt: 'The Anchor in Stanwell Moor',
      },
    ],
  },
}

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About The Anchor',
  description:
    'The Anchor in Stanwell Moor has been a village pub since 1751. Rated 4.6/5 on Google with 5-star food hygiene rating.',
  url: 'https://www.the-anchor.pub/about',
  mainEntity: {
    '@type': 'BarOrPub',
    name: 'The Anchor',
    foundingDate: '1751',
    description:
      'Traditional British village pub established in 1751, located in Stanwell Moor near Heathrow Airport.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Horton Road',
      addressLocality: 'Stanwell Moor',
      addressRegion: 'Surrey',
      postalCode: 'TW19 6AQ',
      addressCountry: 'GB',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 51.462509,
      longitude: -0.502067,
    },
    telephone: '+441753682707',
    email: 'manager@the-anchor.pub',
    url: 'https://www.the-anchor.pub',
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Free Parking', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Dog Friendly', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Beer Garden', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Step-Free Access', value: true },
    ],
  },
}

export default function AboutPage() {
  return (
    <>
      <JsonLd data={[aboutPageSchema]} />

      {/* Hero */}
      <HeroWrapper
        route="/about"
        title="About The Anchor"
        description="A village pub since 1751"
        variant="default"
        tags={[
          { label: 'Est. 1751', variant: 'default', size: 'medium' },
          { label: '4.6/5 on Google', variant: 'success', size: 'medium' },
          { label: '5-Star Food Hygiene', variant: 'primary', size: 'medium' },
        ]}
        primaryCta={
          <BookTableButton
            source="about_hero"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          />
        }
        secondaryCta={
          <DirectionsButton
            href="https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ"
            source="about_hero"
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
          >
            Get Directions
          </DirectionsButton>
        }
      />

      {/* Our Story */}
      <Section background="dark" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Our Story"
              subtitle="Nearly three centuries of pouring pints and welcoming strangers"
            />

            <div className="space-y-6 text-lg text-anchor-cream-text/80 leading-relaxed">
              <p>
                The Anchor has stood on Horton Road in Stanwell Moor since 1751. Back then,
                Stanwell Moor was a quiet farming village on the edge of Hounslow Heath, and
                this pub was where the locals came after a long day in the fields. That was a
                good while before anyone dreamed of building an airport next door.
              </p>

              <p>
                When Heathrow grew from a grass airstrip in the 1940s into one of the
                world&apos;s busiest airports, the village changed around us. Roads were
                widened, reservoirs were dug, and flight paths were drawn overhead. But
                The Anchor stayed put. We kept doing what we&apos;d always done &mdash;
                pulling pints, serving proper food, and making people feel at home.
              </p>

              <p>
                These days, we&apos;re the closest traditional pub to Heathrow Airport, just
                seven minutes from Terminal 5. The flight path that runs over our beer garden
                turned out to be one of the best things about us. Planes pass overhead every
                90 seconds during peak times, and what started as background noise became a
                genuine attraction. People come from miles around to watch A380s and
                Dreamliners descend while enjoying a cold pint.
              </p>

              <p>
                But for all that, we&apos;re still a village pub at heart. We have our regulars
                who prop up the bar every week. We run quiz nights, music bingo, and karaoke.
                The kids play in the garden while the dogs snooze under the tables. The kitchen
                turns out honest British food &mdash; nothing fussy, just good ingredients
                cooked well. That&apos;s what we&apos;ve been doing since George II was on the
                throne, and we don&apos;t plan on stopping.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* What Makes Us Different */}
      <Section background="dark" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="What Makes Us Different"
            subtitle="A few reasons people keep coming back"
          />

          <FeatureGrid
            columns={3}
            features={[
              {
                icon: '',
                title: 'Under the Flight Path',
                description:
                  'Our beer garden sits directly beneath Heathrow\u2019s approach path. Aircraft pass overhead every 90 seconds at peak times \u2014 a view you won\u2019t find at any other pub.',
                className: 'text-center',
              },
              {
                icon: '',
                title: '20 Free Parking Spaces',
                description:
                  'No meters, no apps, no charges. Free on-site parking for every guest \u2014 a rare thing this close to Heathrow.',
                className: 'text-center',
              },
              {
                icon: '',
                title: 'Dog-Friendly Throughout',
                description:
                  'Your four-legged friends are welcome inside and in the beer garden. Water bowls provided, treats available at the bar.',
                className: 'text-center',
              },
              {
                icon: '',
                title: '5-Star Food Hygiene',
                description:
                  'The highest possible rating from the Food Standards Agency. We take food safety as seriously as we take the food itself.',
                className: 'text-center',
              },
              {
                icon: '',
                title: '4.6/5 on Google',
                description:
                  'Over 238 reviews and counting. The highest-rated independent, non-airport pub near Heathrow.',
                className: 'text-center',
              },
              {
                icon: '',
                title: 'Outside the ULEZ Zone',
                description:
                  'Drive here without paying the \u00a312.50 daily ULEZ charge. One less thing to worry about.',
                className: 'text-center',
              },
            ]}
            className="max-w-6xl mx-auto"
          />
        </Container>
      </Section>

      {/* What We Do */}
      <Section background="dark" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title="What We Do"
              subtitle="Good food, good drink, good company"
            />

            <Grid cols={3} gap="lg">
              <Link href="/food-menu" className="group">
                <Card variant="default" className="h-full transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
                  <CardBody className="text-center">
                    <div className="text-4xl mb-4" aria-hidden="true"></div>
                    <h3 className="text-xl font-bold text-anchor-cream-text mb-2 group-hover:text-anchor-gold-vivid">
                      Traditional British Food
                    </h3>
                    <p className="text-anchor-cream-text/70 mb-4">
                      Pub classics, stone-baked pizzas, burgers, and sharers. Honest food at
                      fair prices, served Tuesday to Sunday.
                    </p>
                    <p className="text-anchor-gold-vivid font-semibold">View menu &rarr;</p>
                  </CardBody>
                </Card>
              </Link>

              <Link href="/sunday-lunch" className="group">
                <Card variant="default" className="h-full transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
                  <CardBody className="text-center">
                    <div className="text-4xl mb-4" aria-hidden="true"></div>
                    <h3 className="text-xl font-bold text-anchor-cream-text mb-2 group-hover:text-anchor-gold-vivid">
                      Sunday Roasts from &pound;19
                    </h3>
                    <p className="text-anchor-cream-text/70 mb-4">
                      Proper roasts with all the trimmings. Yorkshire puddings, roast
                      potatoes, and rich gravy. Walk-ins welcome 1pm-6pm.
                    </p>
                    <p className="text-anchor-gold-vivid font-semibold">Book Sunday lunch &rarr;</p>
                  </CardBody>
                </Card>
              </Link>

              <Link href="/whats-on" className="group">
                <Card variant="default" className="h-full transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
                  <CardBody className="text-center">
                    <div className="text-4xl mb-4" aria-hidden="true"></div>
                    <h3 className="text-xl font-bold text-anchor-cream-text mb-2 group-hover:text-anchor-gold-vivid">
                      Weekly Events
                    </h3>
                    <p className="text-anchor-cream-text/70 mb-4">
                      Quiz nights, music bingo with Nikki, karaoke, live music, and more.
                      There&apos;s always something on.
                    </p>
                    <p className="text-anchor-gold-vivid font-semibold">See what&apos;s on &rarr;</p>
                  </CardBody>
                </Card>
              </Link>

              <Link href="/private-hire" className="group">
                <Card variant="default" className="h-full transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
                  <CardBody className="text-center">
                    <div className="text-4xl mb-4" aria-hidden="true"></div>
                    <h3 className="text-xl font-bold text-anchor-cream-text mb-2 group-hover:text-anchor-gold-vivid">
                      Private Hire
                    </h3>
                    <p className="text-anchor-cream-text/70 mb-4">
                      Flexible room bookings for 10 to 50 guests, with larger events by enquiry. Birthdays, corporate events,
                      celebrations &mdash; we handle the lot.
                    </p>
                    <p className="text-anchor-gold-vivid font-semibold">Plan your event &rarr;</p>
                  </CardBody>
                </Card>
              </Link>

              <Link href="/beer-garden" className="group">
                <Card variant="default" className="h-full transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
                  <CardBody className="text-center">
                    <div className="text-4xl mb-4" aria-hidden="true"></div>
                    <h3 className="text-xl font-bold text-anchor-cream-text mb-2 group-hover:text-anchor-gold-vivid">
                      Beer Garden &amp; Plane Spotting
                    </h3>
                    <p className="text-anchor-cream-text/70 mb-4">
                      64 seats under the flight path. Heated areas, dog-friendly, full food
                      and drink service outdoors.
                    </p>
                    <p className="text-anchor-gold-vivid font-semibold">Explore the garden &rarr;</p>
                  </CardBody>
                </Card>
              </Link>

              <Link href="/our-pub" className="group">
                <Card variant="default" className="h-full transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
                  <CardBody className="text-center">
                    <div className="text-4xl mb-4" aria-hidden="true"></div>
                    <h3 className="text-xl font-bold text-anchor-cream-text mb-2 group-hover:text-anchor-gold-vivid">
                      See Inside The Anchor
                    </h3>
                    <p className="text-anchor-cream-text/70 mb-4">
                      Photos of the bar, dining room, garden, pool table and games area.
                      Have a look around before you visit.
                    </p>
                    <p className="text-anchor-gold-vivid font-semibold">View photos &rarr;</p>
                  </CardBody>
                </Card>
              </Link>

              <Link href="/drinks" className="group">
                <Card variant="default" className="h-full transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
                  <CardBody className="text-center">
                    <div className="text-4xl mb-4" aria-hidden="true"></div>
                    <h3 className="text-xl font-bold text-anchor-cream-text mb-2 group-hover:text-anchor-gold-vivid">
                      Drinks
                    </h3>
                    <p className="text-anchor-cream-text/70 mb-4">
                      Draught lagers, bottled ales, wines, spirits, and cocktails. Something for every
                      taste, served with a smile.
                    </p>
                    <p className="text-anchor-gold-vivid font-semibold">View drinks &rarr;</p>
                  </CardBody>
                </Card>
              </Link>
            </Grid>
          </div>
        </Container>
      </Section>

      {/* Awards & Recognition */}
      <Section background="dark" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Awards &amp; Recognition"
            />

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-8 text-center">
                <div className="text-4xl mb-3" aria-hidden="true"></div>
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-2">
                  4.6 / 5 on Google
                </h3>
                <p className="text-anchor-cream-text/70">
                  Over 238 verified reviews. Consistently rated the top independent pub
                  near Heathrow.
                </p>
              </div>

              <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-8 text-center">
                <div className="text-4xl mb-3" aria-hidden="true"></div>
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-2">
                  5-Star Food Hygiene
                </h3>
                <p className="text-anchor-cream-text/70">
                  Awarded the top rating by the Food Standards Agency &mdash; the highest
                  standard of food safety and cleanliness.
                </p>
              </div>

              <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-8 text-center">
                <div className="text-4xl mb-3" aria-hidden="true"></div>
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-2">
                  Est. 1751
                </h3>
                <p className="text-anchor-cream-text/70">
                  Serving the Stanwell Moor community and welcoming visitors from
                  around the world since 1751.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        className="bg-anchor-bg"
        title="Frequently Asked Questions"
        faqs={[
          {
            question: 'How long has The Anchor been open?',
            answer:
              'The Anchor has been a pub in Stanwell Moor since 1751, serving the local community and welcoming visitors for over two and a half centuries.',
          },
          {
            question: "What is The Anchor\u2019s food hygiene rating?",
            answer:
              'We hold a 5-star food hygiene rating, the highest possible score awarded by the Food Standards Agency.',
          },
          {
            question: 'Is The Anchor dog-friendly?',
            answer:
              'Yes, dogs are welcome throughout The Anchor including the bar area and beer garden. We provide water bowls, and treats are available at the bar.',
          },
          {
            question: 'How far is The Anchor from Heathrow?',
            answer:
              'The Anchor is just 7 minutes by car from Heathrow Terminal 5 and approximately 11\u201312 minutes from Terminals 2, 3, and 4. We are the closest traditional pub to Heathrow Airport.',
          },
          {
            question: 'Does The Anchor have parking?',
            answer:
              'Yes \u2014 we have 20 free parking spaces for guests with no time limit while you are visiting. No meters, no apps, no charges.',
          },
          {
            question: 'Is The Anchor inside the ULEZ zone?',
            answer:
              'No. The Anchor is outside the ULEZ zone, so you can drive here without paying the \u00a312.50 daily charge.',
          },
        ]}
      />

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-anchor-green to-anchor-green/90 py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Come and See for Yourself
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Book a table, grab a pint, or just pop in and say hello. We&apos;ve been here
              since 1751 &mdash; we&apos;re not going anywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <BookTableButton
                source="about_cta"
                size="lg"
                variant="secondary"
                className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              />
              <DirectionsButton
                href="https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ"
                source="about_cta"
                variant="secondary"
                size="lg"
                className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                Get Directions
              </DirectionsButton>
              <Link href="tel:+441753682707">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  Call 01753 682707
                </Button>
              </Link>
            </div>
            <p className="text-white/80 mt-8 text-sm">
              Horton Road, Stanwell Moor, Surrey TW19 6AQ &middot; 7 mins from Heathrow T5 &middot; Free parking
            </p>
          </div>
        </Container>
      </section>
    </>
  )
}
