import Link from 'next/link'
import { Container, SectionHeader } from '@/components/ui'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { HeroWrapper } from '@/components/hero'
import { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { LaunchAnnouncement } from '@/components/announcements/LaunchAnnouncement'
import { SundayLunchHowItWorks } from '@/components/sunday-lunch/SundayLunchHowItWorks'
import { SectionViewTracker } from '@/components/sunday-lunch/SectionViewTracker'
import { StickyMobileBookingCTA } from '@/components/conversion/StickyMobileBookingCTA'
import { ScrollProgressBookingTooltip } from '@/components/conversion/ScrollProgressBookingTooltip'
import { ExitIntentBookingModal } from '@/components/conversion/ExitIntentBookingModal'
import { DeferredHomepageTrackers } from '@/components/tracking/DeferredHomepageTrackers'
import { MenuPageTracker } from '@/components/tracking/MenuPageTracker'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'

const SUNDAY_LUNCH_BOOKING_URL = '/book-table'
const WEBSITE_ORIGIN = 'https://www.the-anchor.pub'

// Caching strategy for the launch fortnight (spec §8.5):
// drop revalidate from 24h to 1h so the LaunchAnnouncement banner flips
// reliably at the cutover even on cached pages.
// TODO(post-launch): revert to 24h after 22 May 2026.
export const revalidate = 60 * 60

export const metadata: Metadata = {
  title: 'Sunday Roast & Lunch Near Heathrow | The Anchor, Stanwell Moor',
  description:
    'Walk-in friendly Sunday roast served 1pm-6pm at The Anchor, Stanwell Moor. From £19. 7 minutes from Heathrow Terminal 5. Free parking, dog-friendly. Booking recommended.',
  openGraph: {
    title: 'Sunday Roast & Lunch Near Heathrow | The Anchor, Stanwell Moor',
    description:
      'Walk-in friendly Sunday roast served 1pm-6pm at The Anchor, Stanwell Moor. From £19. 7 minutes from Heathrow Terminal 5. Free parking, dog-friendly. Booking recommended.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg']
  },
  twitter: getTwitterMetadata({
    title: 'Sunday Roast & Lunch Near Heathrow | The Anchor, Stanwell Moor',
    description:
      'Walk-in friendly Sunday roast served 1pm-6pm at The Anchor, Stanwell Moor. From £19. 7 minutes from Heathrow Terminal 5. Free parking, dog-friendly. Booking recommended.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg']
  }),
  alternates: {
    // Absolute path per spec §7.7 — keeps /sunday-lunch SEO equity.
    canonical: '/sunday-lunch'
  }
}

const SUNDAY_ROAST_MENU = [
  {
    name: 'Roasted Chicken',
    description:
      'Oven-roasted chicken breast with sage & onion stuffing balls, herb-and-garlic roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy.',
    priceLabel: '£19'
  },
  {
    name: 'Crispy Pork Belly',
    description:
      'Crispy crackling and tender slow-roasted pork belly with Bramley apple sauce, herb-and-garlic roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy.',
    priceLabel: '£22'
  },
  {
    name: 'Roast Beef',
    description:
      'Slow-roasted topside of beef carved fresh, served with herb-and-garlic roast potatoes, seasonal vegetables, Yorkshire pudding and a generous pour of red wine gravy.',
    priceLabel: '£22'
  },
  {
    name: 'Lamb Shank',
    description:
      'Slow-cooked lamb shank with rich gravy, herb-and-garlic roast potatoes, seasonal vegetables and Yorkshire pudding. (Subject to availability — seasonal dish.)',
    priceLabel: '£24'
  },
  {
    name: 'Beetroot & Butternut Squash Wellington (V)',
    description:
      'Golden puff pastry filled with beetroot and butternut squash, served with herb-and-garlic roast potatoes, seasonal vegetables and vegetarian gravy.',
    priceLabel: '£19'
  },
  {
    name: 'Kids Roasted Chicken',
    description:
      'A smaller portion of our roasted chicken with herb-and-garlic roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy.',
    priceLabel: '£13'
  }
] as const

const REVIEWS = [
  {
    body:
      'It was hands down the best meal we had in England. Cosy atmosphere, warm hospitality from the team, and the food itself.',
    author: 'IJ'
  },
  {
    body:
      'Came in this past Sunday for the Sunday roast before our flight home. Had the lamb shank and my partner had the pork belly. Absolutely delicious plates! Very hospitable owners and staff.',
    author: 'T'
  },
  {
    body:
      'Lovely Sunday roast and you can also park the car if you need to go to Heathrow airport.',
    author: 'Andrea Pisani'
  },
  {
    body:
      'Incredible roast dinner! Friendly and helpful staff too. Great stop before heading to Heathrow!',
    author: 'Iona Turner'
  },
  {
    body:
      "Sunday roasts are great. Fantastic! Really good size, delicious gravy and plenty of veg. The belly pork was awesome!",
    author: 'Penny Johnson'
  },
  {
    body:
      'The Sunday roasts are to die for. Great atmosphere all round. A must to visit.',
    author: 'Michael Frewin'
  }
] as const

const FAQS = [
  {
    question: 'Do I need to book a Sunday roast near me?',
    answer:
      'Walk-ins are welcome on Sundays between 1pm and 6pm — no pre-order needed. Booking is still recommended, especially for groups of six or more, since Sunday lunch books up fast around Heathrow.'
  },
  {
    question: 'Is there a deposit for Sunday lunch?',
    answer:
      'Only for groups of 10 or more — £10 per person, fully deducted from your bill on the day. Smaller groups pay nothing up front; just turn up or book online.'
  },
  {
    question: 'What time is Sunday roast served?',
    answer:
      'Sunday roast is served 1pm to 6pm every Sunday. Last table booking is 5:30pm. Walk-ins are welcome any time during the service window.'
  },
  {
    question: 'Is The Anchor a dog-friendly Sunday roast?',
    answer:
      'Yes. Dogs are welcome inside the pub and in the beer garden. Water bowls are always out. Plenty of regulars come for a Sunday walk first, then a roast.'
  },
  {
    question: 'How far is The Anchor from Heathrow?',
    answer:
      "We're 7 minutes from Heathrow Terminal 5 by car. Free parking on site, no meters, no time limits while you're dining. Easy reach from Staines, Ashford, Surrey and west London."
  },
  {
    question: 'Is The Anchor a carvery?',
    answer:
      "No. We cook every plate to order rather than serving from a carvery line. The meat is carved fresh, the gravy made fresh, the trimmings hand-prepped. If you want a traditional Sunday roast carved fresh and brought to your table — that's what you're after."
  },
  {
    question: 'Do you have vegan or vegetarian options?',
    answer:
      'Yes — our beetroot and butternut squash wellington is fully vegetarian and is served with vegetarian gravy. Mention dietary requirements when booking.'
  }
] as const

function buildFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    isPartOf: { '@id': `${WEBSITE_ORIGIN}/#business` },
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

function buildMenuJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: 'The Anchor Sunday Roast Menu',
    description:
      'Sunday roast served 1pm–6pm at The Anchor, Stanwell Moor — 7 minutes from Heathrow Terminal 5. Mains from £19, cooked to order from scratch.',
    url: `${WEBSITE_ORIGIN}/sunday-lunch`,
    isPartOf: { '@id': `${WEBSITE_ORIGIN}/#business` },
    hasMenuSection: [
      {
        '@type': 'MenuSection',
        name: 'Sunday Roast Mains',
        hasMenuItem: SUNDAY_ROAST_MENU.map((item) => ({
          '@type': 'MenuItem',
          name: item.name,
          description: item.description,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'GBP',
            price: item.priceLabel.replace('£', '')
          }
        }))
      }
    ]
  }
}

function buildRestaurantJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${WEBSITE_ORIGIN}/#business`,
    name: 'The Anchor',
    description:
      'Traditional British pub near Heathrow serving Sunday roast 1pm–6pm. Cooked to order, walk in or book ahead.',
    url: `${WEBSITE_ORIGIN}/sunday-lunch`,
    servesCuisine: ['British', 'Sunday Lunch'],
    priceRange: '££',
    acceptsReservations: true,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Horton Road',
      addressLocality: 'Stanwell Moor',
      addressRegion: 'Surrey',
      postalCode: 'TW19 6AQ',
      addressCountry: 'GB'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 51.462509,
      longitude: -0.502067
    },
    telephone: '+441753682707',
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 51.462509,
        longitude: -0.502067
      },
      geoRadius: '16000'
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '16:00',
        closes: '22:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '12:00',
        closes: '22:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '13:00',
        closes: '18:00'
      }
    ],
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${WEBSITE_ORIGIN}/book-table`,
        actionPlatform: [
          'https://schema.org/DesktopWebPlatform',
          'https://schema.org/MobileWebPlatform'
        ]
      },
      result: { '@type': 'FoodEstablishmentReservation' }
    }
  }
}

function buildBreadcrumbJsonLd() {
  return generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Sunday Lunch', url: '/sunday-lunch' }
  ])
}

export default function SundayLunchPage() {
  const faqJsonLd = buildFaqJsonLd()
  const menuJsonLd = buildMenuJsonLd()
  const restaurantJsonLd = buildRestaurantJsonLd()
  const breadcrumbJsonLd = buildBreadcrumbJsonLd()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(restaurantJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(menuJsonLd) }}
      />

      <HeroWrapper
        route="/sunday-lunch"
        title="Sunday Roast & Lunch Near Heathrow"
        description="Made from scratch. Walk in 1pm–6pm or book ahead. 7 minutes from Heathrow Terminal 5."
        eyebrow="The Anchor, Stanwell Moor"
        lead={
          <p className="text-white/90 text-base sm:text-lg">
            Sunday roast from &pound;19 &bull; Walk in or book ahead &bull; Served 1pm&ndash;6pm
          </p>
        }
        image={{
          src: '/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg',
          alt: 'Sunday roast at The Anchor near Heathrow'
        }}
        primaryCta={
          <BookTableButton
            source="sunday_lunch_hero"
            context="sunday_roast"
            variant="primary"
            size="lg"
            fullWidth
            className="w-full"
            customHref={SUNDAY_LUNCH_BOOKING_URL}
            trackingLabel="Book a Sunday roast"
            eventName="Sunday roast"
          >
            Book a Table
          </BookTableButton>
        }
        secondaryCta={
          <PhoneButton
            phone="01753 682707"
            source="sunday_lunch_hero"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto !bg-white/10 !text-white !border-white/30 hover:!bg-white/20"
          >
            01753 682707
          </PhoneButton>
        }
        showContextStrip={true}
      />

      <div className="bg-anchor-bg-raised">
        <Container>
          <div className="py-3">
            <LaunchAnnouncement variant="banner" />
          </div>
        </Container>
      </div>

      {/* H1 + lead */}
      <div className="bg-anchor-bg pt-12 pb-8 border-b border-anchor-gold/15">
        <Container>
          <PageTitle className="text-center text-anchor-cream-text" seo={{ structured: true, speakable: true }}>
            Sunday Roast &amp; Lunch Near Heathrow at The Anchor
          </PageTitle>
          <p className="mt-4 text-center text-lg text-anchor-cream-text/70 max-w-3xl mx-auto">
            Looking for the best Sunday roast near you? The Anchor in Stanwell Moor serves a proper Sunday lunch from 1pm to 6pm
            every week — beef, pork belly, chicken, lamb shank, vegetarian wellington — cooked to order from scratch. No pre-order, no
            self-serve carvery. Walk in or book ahead. Free parking. 7 minutes from Heathrow Terminal 5.
          </p>
        </Container>
      </div>

      {/* Featured 5★ review */}
      <section className="bg-anchor-bg-raised py-10 border-b border-anchor-gold/15">
        <Container>
          <figure className="mx-auto max-w-3xl text-center">
            <blockquote className="text-2xl text-anchor-cream-text/85 italic leading-relaxed">
              &ldquo;It was hands down the best meal we had in England. Cosy atmosphere, hospitality from the team, and the food itself.&rdquo;
            </blockquote>
            <figcaption className="mt-4 text-sm text-anchor-cream-text/60">
              &mdash; IJ, Google review (5&#9733;)
            </figcaption>
          </figure>
        </Container>
      </section>

      {/* What's on the plate — Sunday roast menu */}
      <section className="bg-anchor-bg py-12 border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="What&rsquo;s on the Plate"
            subtitle="Sunday roast at The Anchor — mains from £19, served with all the trimmings."
            align="center"
          />
          <div className="mt-8 mx-auto max-w-3xl space-y-4">
            {SUNDAY_ROAST_MENU.map((item) => (
              <div
                key={item.name}
                className="flex justify-between items-start gap-4 py-4 border-b border-anchor-gold/10 last:border-b-0"
              >
                <div>
                  <h3 className="font-semibold text-anchor-cream-text">{item.name}</h3>
                  <p className="text-sm text-anchor-cream-text/65 mt-1">{item.description}</p>
                </div>
                <span className="text-anchor-gold-vivid font-semibold whitespace-nowrap">{item.priceLabel}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-anchor-cream-text/60">
            Every plate cooked to order. Add cauliflower cheese, extra Yorkshires or pigs in blankets at the bar on the day.
          </p>
        </Container>
      </section>

      {/* How Sundays work — date-aware */}
      <section className="bg-anchor-bg-raised py-12 border-b border-anchor-gold/15">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text mb-4">
              How Sundays Work at The Anchor
            </h2>
            <SundayLunchHowItWorks />
            <ul className="mt-6 space-y-2 text-anchor-cream-text/70 text-base">
              <li>&bull; Service window: 1pm to 6pm. Last table booking 5:30pm. Kitchen serves until 6pm.</li>
              <li>&bull; Walk-ins are welcome the whole window. Booking guarantees your spot, especially for parties of six or more.</li>
              <li>&bull; No pre-order, no Saturday cutoff. Choose your roast at the table.</li>
              <li>&bull; Groups of 10 or more take a £10 per person deposit on booking, fully deducted from the bill on the day.</li>
              <li>&bull; Plans changed? A quick call to <a href="tel:+441753682707" className="font-semibold underline">01753 682707</a> lets us offer your table to someone else.</li>
            </ul>
          </div>
        </Container>
      </section>

      {/* Sunday roast vs carvery — captures the 50K monthly carvery search */}
      <SectionViewTracker sectionId="carvery_comparison">
        <section className="bg-anchor-bg py-12 border-b border-anchor-gold/15">
          <Container>
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text mb-4">
                Sunday Roast or Carvery? What to Expect Near Heathrow
              </h2>
              <p className="text-anchor-cream-text/70 leading-relaxed mb-6">
                If you&apos;re weighing up a chain carvery near Heathrow versus an independent pub Sunday roast, here&apos;s what
                actually changes on the plate.
              </p>
              <div className="overflow-x-auto rounded-lg border border-anchor-gold/15">
                <table className="w-full text-sm md:text-base text-left">
                  <thead className="bg-anchor-bg-raised text-anchor-cream-text">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">Detail</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Carvery</th>
                      <th scope="col" className="px-4 py-3 font-semibold">The Anchor</th>
                    </tr>
                  </thead>
                  <tbody className="text-anchor-cream-text/80">
                    <tr className="border-t border-anchor-gold/10">
                      <th scope="row" className="px-4 py-3 font-semibold align-top text-anchor-cream-text">Serving style</th>
                      <td className="px-4 py-3 align-top">Self-serve buffet line</td>
                      <td className="px-4 py-3 align-top">Cooked to order, plated</td>
                    </tr>
                    <tr className="border-t border-anchor-gold/10">
                      <th scope="row" className="px-4 py-3 font-semibold align-top text-anchor-cream-text">Meat carved</th>
                      <td className="px-4 py-3 align-top">Pre-sliced, kept warm under lamps</td>
                      <td className="px-4 py-3 align-top">Carved fresh per plate</td>
                    </tr>
                    <tr className="border-t border-anchor-gold/10">
                      <th scope="row" className="px-4 py-3 font-semibold align-top text-anchor-cream-text">Yorkshire pudding</th>
                      <td className="px-4 py-3 align-top">Batch-baked, may be reheated</td>
                      <td className="px-4 py-3 align-top">Baked to order from fresh batter</td>
                    </tr>
                    <tr className="border-t border-anchor-gold/10">
                      <th scope="row" className="px-4 py-3 font-semibold align-top text-anchor-cream-text">Roast potatoes</th>
                      <td className="px-4 py-3 align-top">Bulk-cooked, kept warm</td>
                      <td className="px-4 py-3 align-top">Triple-cooked in beef dripping with herbs and garlic</td>
                    </tr>
                    <tr className="border-t border-anchor-gold/10">
                      <th scope="row" className="px-4 py-3 font-semibold align-top text-anchor-cream-text">Vegetarian option</th>
                      <td className="px-4 py-3 align-top">Rare</td>
                      <td className="px-4 py-3 align-top">Dedicated wellington from £19</td>
                    </tr>
                    <tr className="border-t border-anchor-gold/10">
                      <th scope="row" className="px-4 py-3 font-semibold align-top text-anchor-cream-text">Best for</th>
                      <td className="px-4 py-3 align-top">Low-cost volume</td>
                      <td className="px-4 py-3 align-top">A proper Sunday lunch</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-center">
                <BookTableButton
                  source="sunday_lunch_carvery"
                  context="sunday_roast"
                  variant="primary"
                  size="md"
                  customHref={SUNDAY_LUNCH_BOOKING_URL}
                  trackingLabel="Book a Sunday roast"
                  eventName="Sunday roast"
                >
                  Book your Sunday roast
                </BookTableButton>
              </div>
            </div>
          </Container>
        </section>
      </SectionViewTracker>

      {/* From the kitchen */}
      <section className="bg-anchor-bg-raised py-12 border-b border-anchor-gold/15">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text mb-4">
              From the Kitchen
            </h2>
            <p className="text-anchor-cream-text/70 leading-relaxed">
              Our Sunday roast is built the way it should be. Beef topside slow-roasted to medium-rare. Pork belly scored
              and rendered until the crackling shatters at a tap. Chicken brined and roasted bone-in for proper flavour.
              Lamb shanks braised slowly until the meat falls off the bone. Roast potatoes triple-cooked in beef dripping
              with herbs and garlic. Yorkshire puddings baked to order from a fresh batter. Gravy from the pan, finished
              with red wine. Veg seasonal — what&apos;s good that week.
            </p>
            <p className="text-anchor-cream-text/70 leading-relaxed mt-4">
              The vegetarian wellington gets the same care: beetroot and butternut squash wrapped in golden puff pastry,
              served with vegetarian gravy on the side.
            </p>
            <p className="text-anchor-cream-text/70 leading-relaxed mt-4">
              That&apos;s why people drive in from Surrey, Ashford, Staines and west London for it.
            </p>
          </div>
        </Container>
      </section>

      {/* Reviews */}
      <section className="bg-anchor-bg py-12 border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="What Guests Say About Sunday Roast at The Anchor"
            subtitle="Curated 5&#9733; reviews from Google."
            align="center"
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {REVIEWS.map((review) => (
              <figure
                key={review.author}
                className="rounded-2xl border border-anchor-gold/15 bg-anchor-bg-raised p-6"
              >
                <blockquote className="text-anchor-cream-text/80 leading-relaxed text-sm">
                  &ldquo;{review.body}&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-xs font-semibold text-anchor-gold-vivid">
                  &mdash; {review.author}, Google review
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      {/* Local SEO — Surrey / Ashford / west London */}
      <section className="bg-anchor-bg-raised py-12 border-b border-anchor-gold/15">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text mb-4">
              Sunday Roast in Surrey, Near Ashford and West London
            </h2>
            <p className="text-anchor-cream-text/70 leading-relaxed">
              The Anchor sits in Stanwell Moor, Surrey — a few minutes from Ashford, Staines-upon-Thames, Egham, Wraysbury and Bedfont,
              and easy reach from west London via the M25 (Junction 14). If you&apos;re searching for the best Sunday lunch in Ashford, a
              Sunday roast in Surrey, or somewhere in west London for a Sunday dinner near you, we&apos;re a 10–25 minute drive depending
              on where you start.
            </p>
            <p className="text-anchor-cream-text/70 leading-relaxed mt-4">
              For Heathrow visitors: 7 minutes from Terminal 5 by car, free parking, and an outdoor beer garden where you can watch
              planes overhead while you eat. Pre-flight Sunday lunch, post-landing Sunday roast, or Sunday lunch with airport hotel
              guests — all part of the rhythm of the place.
            </p>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <FAQAccordionWithSchema
        title="Sunday Roast FAQs"
        faqs={FAQS.map((faq) => ({ question: faq.question, answer: faq.answer }))}
      />

      {/* Final CTA */}
      <section className="bg-anchor-green py-12 text-center">
        <Container>
          <div className="max-w-2xl mx-auto space-y-5">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Book your Sunday roast at The Anchor
            </h2>
            <p className="text-white/85 text-base">
              Walk in or book ahead — served 1pm to 6pm every Sunday. From £19. 7 minutes from Heathrow Terminal 5.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <BookTableButton
                source="sunday_lunch_final_cta"
                context="sunday_roast"
                variant="secondary"
                size="lg"
                className="bg-white text-anchor-green hover:bg-gray-100"
                customHref={SUNDAY_LUNCH_BOOKING_URL}
                trackingLabel="Book a Sunday roast"
                eventName="Sunday roast"
              >
                Book a Table
              </BookTableButton>
              <PhoneButton
                phone="01753 682707"
                source="sunday_lunch_final_cta"
                variant="outline"
                size="lg"
                className="!bg-transparent !text-white !border-white/40 hover:!bg-white/10"
              >
                01753 682707
              </PhoneButton>
            </div>
            <p className="text-sm text-white/70">
              <Link href="/find-us" className="underline hover:text-white">Directions and parking</Link>
              {' '}&bull;{' '}
              <Link href="/book-table" className="underline hover:text-white">All booking options</Link>
            </p>
          </div>
        </Container>
      </section>

      {/* Conversion + tracking layer (Wave 2C) */}
      <StickyMobileBookingCTA />
      <ScrollProgressBookingTooltip />
      <ExitIntentBookingModal />
      <DeferredHomepageTrackers />
      <MenuPageTracker menuType="sunday_lunch" />
    </>
  )
}
