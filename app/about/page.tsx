import Link from 'next/link'
import { Metadata } from 'next'
import { InteriorHero } from '@/components/hero'
import { JsonLd } from '@/components/JsonLd'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BookTableButton } from '@/components/BookTableButton'
import { DirectionsButton } from '@/components/DirectionsButton'
import { PhoneButton } from '@/components/PhoneButton'
import { CONTACT } from '@/lib/constants'
import {
  Badge,
  Button,
  Container,
  SectionHeading,
  Card,
  CardBody,
  Grid,
} from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'

export const metadata: Metadata = {
  title: 'About Us | Our Story Since 1751',
  description:
    "The Anchor in Stanwell Moor has been a village pub since 1751. 5-star food hygiene. Meet the team behind Heathrow\u2019s favourite local pub.",
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About The Anchor | Our Story Since 1751',
    description:
      'A proper village pub since 1751, now the closest traditional British pub to Heathrow Airport. 5-star food hygiene, dog-friendly, free parking.',
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
    'The Anchor in Stanwell Moor has been a village pub since 1751, with a 5-star food hygiene rating.',
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
      { '@type': 'LocationFeatureSpecification', name: 'Step-free access to most areas', value: true },
    ],
  },
}

export default function AboutPage() {
  return (
    <>
      <JsonLd data={[aboutPageSchema]} />

      {/* Hero */}
      <InteriorHero
        image="/images/page-headers/our-pub/the-anchor-our-pub.jpg"
        crumb="About"
        title="About The Anchor"
        lead="A village pub since 1751"
        badges={
          <>
            <Badge variant="sand">Est. 1751</Badge>
            <Badge variant="sand">Highly Rated on Google</Badge>
            <Badge variant="sand">5-Star Food Hygiene</Badge>
          </>
        }
        actions={
          <>
            <BookTableButton source="about_hero" variant="primary" size="lg" fullWidth />
            <DirectionsButton
              href="https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ"
              source="about_hero"
              variant="outline"
              size="lg"
            >
              Get Directions
            </DirectionsButton>
          </>
        }
      />

      {/* Our Story */}
      <section className="py-section-y bg-canvas border-b border-line">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Our Story"
              lead="Nearly three centuries of pouring pints and welcoming strangers"
              align="left"
            />

            <div className="space-y-6 text-lg text-ink leading-relaxed">
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
                The Anchor stayed put. We kept doing what we&apos;d always done:
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
                who prop up the bar every week. We run quiz nights, music bingo, cash bingo and karaoke when listed.
                The kids play in the garden while the dogs snooze under the tables. The kitchen
                turns out honest British food, nothing fussy, just good ingredients
                cooked well. That&apos;s what we&apos;ve been doing since George II was on the
                throne, and we don&apos;t plan on stopping.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* What Makes Us Different */}
      <section className="py-section-y bg-surface border-b border-line">
        <Container>
          <SectionHeading
            title="What Makes Us Different"
            lead="A few reasons people keep coming back"
          />

          <div className="grid gap-6 lg:grid-cols-3 sm:grid-cols-2 mx-auto">
            {[
              {
                title: 'Under the Flight Path',
                description:
                  'Our beer garden sits directly beneath Heathrow\u2019s approach path. Aircraft pass overhead every 90 seconds at peak times, a view you won\u2019t find at any other pub.',
              },
              {
                title: '20 Free Parking Spaces',
                description:
                  'No meters, no apps, no charges. Free on-site parking for every guest, a rare thing this close to Heathrow.',
              },
              {
                title: 'Dog-Friendly Throughout',
                description:
                  'Your four-legged friends are welcome inside and in the beer garden. Water bowls provided, treats available at the bar.',
              },
              {
                title: '5-Star Food Hygiene',
                description:
                  'The highest possible rating from the Food Standards Agency. We take food safety as seriously as we take the food itself.',
              },
              {
                title: 'Highly Rated on Google',
                description:
                  'Guests regularly mention the warm welcome, pub food, beer garden and free parking.',
              },
              {
                title: 'Outside the ULEZ Zone',
                description:
                  'Drive here without paying the \u00a312.50 daily ULEZ charge. One less thing to worry about.',
              },
            ].map(({ title, description }) => (
              <Card key={title} accent hover className="h-full">
                <CardBody className="text-center">
                  <h3 className="text-lg text-ink-strong mb-2">{title}</h3>
                  <p className="text-ink-muted">{description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* What We Do */}
      <section className="py-section-y bg-canvas border-b border-line">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="What We Do"
              lead="Good food, good drink, good company"
            />

            <Grid cols={3} gap="lg">
              <Link href="/food-menu" className="group">
                <Card accent hover className="h-full">
                  <CardBody className="text-center">
                    <div className="text-4xl mb-4" aria-hidden="true"></div>
                    <h3 className="text-xl text-ink-strong mb-2 group-hover:text-accent-text">
                      Traditional British Food
                    </h3>
                    <p className="text-ink-muted mb-4">
                      Pub classics, stone-baked pizzas, burgers, and sharers. Honest food at
                      fair prices, served during live kitchen hours.
                    </p>
                    <p className="text-accent-text font-semibold">View menu &rarr;</p>
                  </CardBody>
                </Card>
              </Link>

              <Link href="/sunday-roast" className="group">
                <Card accent hover className="h-full">
                  <CardBody className="text-center">
                    <div className="text-4xl mb-4" aria-hidden="true"></div>
                    <h3 className="text-xl text-ink-strong mb-2 group-hover:text-accent-text">
                      Sunday Roasts
                    </h3>
                    <p className="text-ink-muted mb-4">
                      Proper roasts with all the trimmings. Yorkshire puddings, roast
                      potatoes, and rich gravy. Walk-ins welcome 1pm-6pm.
                    </p>
                    <p className="text-accent-text font-semibold">Book Sunday roast &rarr;</p>
                  </CardBody>
                </Card>
              </Link>

              <Link href="/whats-on" className="group">
                <Card accent hover className="h-full">
                  <CardBody className="text-center">
                    <div className="text-4xl mb-4" aria-hidden="true"></div>
                    <h3 className="text-xl text-ink-strong mb-2 group-hover:text-accent-text">
                      Weekly Events
                    </h3>
                    <p className="text-ink-muted mb-4">
                      Quiz nights, music bingo with Nikki, cash bingo and karaoke when listed.
                      There&apos;s always something on.
                    </p>
                    <p className="text-accent-text font-semibold">See what&apos;s on &rarr;</p>
                  </CardBody>
                </Card>
              </Link>

              <Link href="/private-hire" className="group">
                <Card accent hover className="h-full">
                  <CardBody className="text-center">
                    <div className="text-4xl mb-4" aria-hidden="true"></div>
                    <h3 className="text-xl text-ink-strong mb-2 group-hover:text-accent-text">
                      Private Hire
                    </h3>
                    <p className="text-ink-muted mb-4">
                      Flexible private hire for 10+ to 150 guests. Birthdays, corporate events,
                      celebrations, we handle the lot.
                    </p>
                    <p className="text-accent-text font-semibold">Plan your event &rarr;</p>
                  </CardBody>
                </Card>
              </Link>

              <Link href="/beer-garden" className="group">
                <Card accent hover className="h-full">
                  <CardBody className="text-center">
                    <div className="text-4xl mb-4" aria-hidden="true"></div>
                    <h3 className="text-xl text-ink-strong mb-2 group-hover:text-accent-text">
                      Beer Garden &amp; Plane Spotting
                    </h3>
                    <p className="text-ink-muted mb-4">
                      64 seats under the flight path. Dog-friendly, full food
                      and drink service outdoors.
                    </p>
                    <p className="text-accent-text font-semibold">Explore the garden &rarr;</p>
                  </CardBody>
                </Card>
              </Link>

              <Link href="/our-pub" className="group">
                <Card accent hover className="h-full">
                  <CardBody className="text-center">
                    <div className="text-4xl mb-4" aria-hidden="true"></div>
                    <h3 className="text-xl text-ink-strong mb-2 group-hover:text-accent-text">
                      See Inside The Anchor
                    </h3>
                    <p className="text-ink-muted mb-4">
                      Photos of the bar, dining room, garden, pool table and games area.
                      Have a look around before you visit.
                    </p>
                    <p className="text-accent-text font-semibold">View photos &rarr;</p>
                  </CardBody>
                </Card>
              </Link>

              <Link href="/drinks" className="group">
                <Card accent hover className="h-full">
                  <CardBody className="text-center">
                    <div className="text-4xl mb-4" aria-hidden="true"></div>
                    <h3 className="text-xl text-ink-strong mb-2 group-hover:text-accent-text">
                      Drinks
                    </h3>
                    <p className="text-ink-muted mb-4">
                      Draught lagers, bottled ales, wines, spirits, and cocktails. Something for every
                      taste, served with a smile.
                    </p>
                    <p className="text-accent-text font-semibold">View drinks &rarr;</p>
                  </CardBody>
                </Card>
              </Link>
            </Grid>
          </div>
        </Container>
      </section>

      {/* Awards & Recognition */}
      <section className="py-section-y bg-surface border-b border-line">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Awards &amp; Recognition"
            />

            <div className="grid md:grid-cols-3 gap-6">
              <Card accent>
                <CardBody className="p-8 text-center">
                <div className="text-4xl mb-3" aria-hidden="true"></div>
                <h3 className="text-xl text-ink-strong mb-2">
                  Highly Rated on Google
                </h3>
                <p className="text-ink-muted">
                  Guests regularly praise the welcome, food, beer garden and location near Heathrow.
                </p>
                </CardBody>
              </Card>

              <Card accent>
                <CardBody className="p-8 text-center">
                <div className="text-4xl mb-3" aria-hidden="true"></div>
                <h3 className="text-xl text-ink-strong mb-2">
                  5-Star Food Hygiene
                </h3>
                <p className="text-ink-muted">
                  Awarded the top rating by the Food Standards Agency, the highest
                  standard of food safety and cleanliness.
                </p>
                </CardBody>
              </Card>

              <Card accent>
                <CardBody className="p-8 text-center">
                <div className="text-4xl mb-3" aria-hidden="true"></div>
                <h3 className="text-xl text-ink-strong mb-2">
                  Est. 1751
                </h3>
                <p className="text-ink-muted">
                  Serving the Stanwell Moor community and welcoming visitors from
                  around the world since 1751.
                </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <FAQAccordionWithSchema
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
              'Yes, we have 20 free parking spaces for guests with no time limit while you are visiting. No meters, no apps, no charges.',
          },
          {
            question: 'Is The Anchor inside the ULEZ zone?',
            answer:
              'No. The Anchor is outside the ULEZ zone, so you can drive here without paying the \u00a312.50 daily charge.',
          },
        ]}
      />

      {/* Hiring Callout */}
      <section className="py-section-y bg-canvas border-b border-line">
        <Container>
          <div className="mx-auto text-center">
            <p className="text-lg text-ink leading-relaxed">
              Interested in joining our team? We are looking for experienced bar staff and kitchen
              team members.{' '}
              <Link
                href="/join-our-team"
                className="text-accent-text hover:text-accent font-semibold underline underline-offset-4"
              >
                Find out more
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <CtaBand
        title="Come and See for Yourself"
        copy="Book a table, grab a pint, or just pop in and say hello. We've been here since 1751, we're not going anywhere."
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <BookTableButton source="about_cta" size="lg" variant="primary" />
            <DirectionsButton
              href="https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ"
              source="about_cta"
              variant="outline"
              size="lg"
            >
              Get Directions
            </DirectionsButton>
            <PhoneButton phone={CONTACT.phone} source="about_cta" variant="outline" size="lg">
              Call {CONTACT.phone}
            </PhoneButton>
          </div>
          <p className="text-sm text-anchor-cream-text/70">
            Horton Road, Stanwell Moor, Surrey TW19 6AQ &middot; 7 mins from Heathrow T5 &middot; Free parking
          </p>
        </div>
      </CtaBand>
    </>
  )
}
