import Link from 'next/link'
import Image from 'next/image'
import { Container, SectionHeader, Alert } from '@/components/ui'
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
import { TimedBookingPrompt } from '@/components/sunday-lunch/TimedBookingPrompt'
import { PhoneLink } from '@/components/PhoneLink'
import { StickyMobileBookingCTA } from '@/components/conversion/StickyMobileBookingCTA'
import { ScrollProgressBookingTooltip } from '@/components/conversion/ScrollProgressBookingTooltip'
import { ExitIntentBookingModal } from '@/components/conversion/ExitIntentBookingModal'
import { DeferredHomepageTrackers } from '@/components/tracking/DeferredHomepageTrackers'
import { MenuPageTracker } from '@/components/tracking/MenuPageTracker'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { getSundayRoastContent, SUNDAY_ROAST, type SundayRoastContent } from '@/lib/sunday-roast'
import { getSundayLunchMenuPageData, type MenuPageItem } from '@/lib/menu-page-data'
import { MenuRenderer } from '@/components/MenuRenderer'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

const SUNDAY_LUNCH_BOOKING_URL = SUNDAY_ROAST.bookingHref
const WEBSITE_ORIGIN = 'https://www.the-anchor.pub'

export const revalidate = 60 * 60

export async function generateMetadata(): Promise<Metadata> {
  const menu = await getSundayLunchMenuPageData()
  const pricePhrase = menu.priceFromLabel ? ` Mains ${menu.priceFromLabel}.` : ''
  const description = menu.menuData
    ? `Sunday roast served 1pm-6pm at The Anchor, Stanwell Moor.${pricePhrase} 7 minutes from Heathrow Terminal 5. Free parking, dog-friendly.`
    : 'Sunday roast served 1pm-6pm at The Anchor, Stanwell Moor. Call us for the current Sunday dish list.'

  return {
    title: 'Sunday Roast & Lunch Near Heathrow | The Anchor, Stanwell Moor',
    description,
    openGraph: {
      title: 'Sunday Roast & Lunch Near Heathrow | The Anchor, Stanwell Moor',
      description,
      images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg']
    },
    twitter: getTwitterMetadata({
      title: 'Sunday Roast & Lunch Near Heathrow | The Anchor, Stanwell Moor',
      description,
      images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg']
    }),
    alternates: {
      canonical: '/sunday-lunch'
    }
  }
}

function joinItemNames(items: MenuPageItem[]): string {
  if (items.length === 0) return 'the current Sunday lunch menu'
  if (items.length === 1) return items[0].name
  return `${items.slice(0, -1).map((item) => item.name).join(', ')} and ${items[items.length - 1].name}`
}

function getSundayLunchFaqs(sunday: SundayRoastContent, currentMains: MenuPageItem[]) {
  return [
    {
      question: 'Do I need to book a Sunday roast near me?',
      answer: 'Walk-ins are welcome during Sunday lunch service. Booking is still recommended for larger groups and peak slots.'
    },
    {
      question: 'Is there a deposit for Sunday lunch?',
      answer: `${sunday.smallPartyCopy} ${sunday.depositCopy}`
    },
    {
      question: 'What time is Sunday roast served?',
      answer: 'Sunday roast is served 1pm to 6pm every Sunday. Last table booking is 5:30pm.'
    },
    {
      question: 'What is on the Sunday lunch menu?',
      answer: currentMains.length > 0
        ? `The current Sunday lunch mains are ${joinItemNames(currentMains)}.`
        : 'Please call us for the current Sunday dish list.'
    },
    {
      question: 'Is The Anchor a dog-friendly Sunday roast?',
      answer: 'Yes. Dogs are welcome inside the pub and in the beer garden. Water bowls are always out.'
    },
    {
      question: 'How far is The Anchor from Heathrow?',
      answer: "We're 7 minutes from Heathrow Terminal 5 by car. Free parking on site, no meters, no time limits while you're dining."
    },
    {
      question: 'Is The Anchor a carvery?',
      answer: 'No. Sunday lunch is cooked and plated by the kitchen rather than served from a self-serve carvery line.'
    },
    {
      question: 'Do you serve a vegan or vegetarian Sunday roast?',
      answer: currentMains.some((item) => item.vegan || item.vegetarian)
        ? 'Yes. The current Sunday menu includes a vegetarian or vegan option. Ask at the bar for allergen guidance before ordering.'
        : 'Please call us for the current Sunday dietary options.'
    }
  ] as const
}

function buildMenuJsonLd(menuItems: MenuPageItem[]) {
  if (menuItems.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: 'The Anchor Sunday Lunch Menu',
    description: 'Sunday lunch menu at The Anchor, Stanwell Moor.',
    url: `${WEBSITE_ORIGIN}/sunday-lunch`,
    isPartOf: { '@id': `${WEBSITE_ORIGIN}/#business` },
    hasMenuSection: [
      {
        '@type': 'MenuSection',
        name: 'Sunday Lunch Mains',
        hasMenuItem: menuItems.map((item) => ({
          '@type': 'MenuItem',
          name: item.name,
          description: item.description,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'GBP',
            price: item.price
          }
        }))
      }
    ]
  }
}

export default async function SundayLunchPage() {
  const sunday = getSundayRoastContent()
  const sundayMenu = await getSundayLunchMenuPageData()
  const faqs = getSundayLunchFaqs(sunday, sundayMenu.mains)
  const menuJsonLd = buildMenuJsonLd(sundayMenu.mains)

  return (
    <>
      {menuJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(menuJsonLd) }}
        />
      )}
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Sunday Lunch', url: '/sunday-lunch' }
        ]}
      />

      <HeroWrapper
        route="/sunday-lunch"
        title="Sunday Roast & Lunch Near Heathrow"
        description="Sunday lunch is served 1pm-6pm. Current dishes and prices are listed below."
        eyebrow="The Anchor, Stanwell Moor"
        lead={
          <p className="text-white/90 text-base sm:text-lg">
            Walk in during service or book ahead for busy slots. 7 minutes from Heathrow Terminal 5.
          </p>
        }
        image={{
          src: '/images/food/sunday-roast/the-anchor-sunday-roast-hero.jpg',
          alt: 'Sunday lunch plate at The Anchor pub near Heathrow'
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

      <div className="bg-anchor-bg pt-12 pb-8 border-b border-anchor-gold/15">
        <Container>
          <PageTitle className="text-center text-anchor-cream-text" seo={{ structured: true, speakable: true }}>
            Sunday Roast &amp; Lunch Near Heathrow at The Anchor
          </PageTitle>
          <p className="mt-4 text-center text-lg text-anchor-cream-text/70 max-w-3xl mx-auto">
            Sunday lunch is served every Sunday from 1pm to 6pm. Walk-ins are welcome, booking is recommended for busier slots, and the current dishes are listed below.
          </p>
          <ul
            aria-label="At a glance"
            className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-anchor-cream-text/75"
          >
            <li>Dog friendly</li>
            <li aria-hidden="true" className="text-anchor-cream-text/40">&middot;</li>
            <li>Free parking</li>
            <li aria-hidden="true" className="text-anchor-cream-text/40">&middot;</li>
            <li>Walk-ins welcome</li>
            <li aria-hidden="true" className="text-anchor-cream-text/40">&middot;</li>
            <li>4.6/5 on Google</li>
          </ul>
        </Container>
      </div>

      <section className="bg-anchor-bg py-12 border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="Current Sunday Lunch Menu"
            subtitle={sundayMenu.menuData ? 'Choose from our current Sunday lunch menu.' : 'Call us for the current Sunday dish list.'}
            align="center"
          />

          {sundayMenu.menuData ? (
            <MenuRenderer menuData={sundayMenu.menuData} eyebrow="Sunday lunch menu" />
          ) : (
            <Alert
              variant="warning"
              title="Sunday menu temporarily unavailable"
              className="mx-auto max-w-3xl"
            >
              <p className="text-anchor-cream-text/70">
                The current Sunday lunch menu is temporarily unavailable. Please call{' '}
                <PhoneLink
                  phone="01753 682707"
                  source="sunday_lunch_menu_unavailable"
                  className="font-semibold underline"
                  showIcon={false}
                >
                  01753 682707
                </PhoneLink>{' '}
                for the current dish list before travelling.
              </p>
            </Alert>
          )}
        </Container>
      </section>

      <section className="bg-anchor-bg-raised py-12 border-b border-anchor-gold/15">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text mb-4">
              How Sundays Work at The Anchor
            </h2>
            <SundayLunchHowItWorks />
            <ul className="mt-6 space-y-2 text-anchor-cream-text/70 text-base">
              <li>&bull; Service window: 1pm to 6pm. Last table booking 5:30pm.</li>
              <li>&bull; Walk-ins are welcome. Booking guarantees your spot, especially for larger parties.</li>
              <li>&bull; No Sunday-specific pre-order is required.</li>
              <li>&bull; {sunday.depositCopy}</li>
              <li>&bull; Plans changed? A quick call to{' '}
                <PhoneLink
                  phone="01753 682707"
                  source="sunday_lunch_inline"
                  className="font-semibold underline"
                  showIcon={false}
                >
                  01753 682707
                </PhoneLink>
                {' '}lets us offer your table to someone else.</li>
            </ul>
            <Image
              src="/images/food/sunday-roast/sunday-roast-potatoes-tossed.jpg"
              alt="Sunday lunch prep at The Anchor pub near Heathrow"
              width={1200}
              height={900}
              loading="lazy"
              sizes="(min-width:1024px) 720px, 100vw"
              className="mt-8 w-full h-auto rounded-lg border border-anchor-gold/15 object-cover"
            />
          </div>
        </Container>
      </section>

      <SectionViewTracker sectionId="carvery_comparison">
        <section className="bg-anchor-bg py-12 border-b border-anchor-gold/15">
          <Container>
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text mb-4">
                Sunday Roast or Carvery? What to Expect Near Heathrow
              </h2>
              <p className="text-anchor-cream-text/70 leading-relaxed mb-6">
                If you are weighing up a chain carvery near Heathrow versus an independent pub Sunday lunch, the main difference is service style: we plate from the kitchen rather than running a self-serve carvery line.
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
                      <td className="px-4 py-3 align-top">Cooked and plated by the kitchen</td>
                    </tr>
                    <tr className="border-t border-anchor-gold/10">
                      <th scope="row" className="px-4 py-3 font-semibold align-top text-anchor-cream-text">Booking</th>
                      <td className="px-4 py-3 align-top">Varies by venue</td>
                      <td className="px-4 py-3 align-top">Walk in or book ahead</td>
                    </tr>
                    <tr className="border-t border-anchor-gold/10">
                      <th scope="row" className="px-4 py-3 font-semibold align-top text-anchor-cream-text">Menu details</th>
                      <td className="px-4 py-3 align-top">Check with the venue</td>
                      <td className="px-4 py-3 align-top">Current dishes listed above, or confirmed by phone</td>
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

      <section className="bg-anchor-bg-raised py-12 border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="Why Locals Choose Sunday Lunch Here"
            subtitle="Free parking, easy booking and a village pub setting minutes from Heathrow."
            align="center"
          />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              ['Easy to reach', '7 minutes from Heathrow Terminal 5 by car, outside the terminal rush.'],
              ['Good for groups', 'Book online for standard tables or call us for larger parties.'],
              ['Dog friendly', 'Dogs are welcome inside and in the beer garden.']
            ].map(([title, body]) => (
              <div key={title} className="rounded-lg border border-anchor-gold/15 bg-anchor-bg p-6">
                <h3 className="text-lg font-semibold text-anchor-cream-text">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-anchor-cream-text/70">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-anchor-bg py-12 border-b border-anchor-gold/15">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text mb-3">
              Sunday Lunch Between Flights
            </h2>
            <p className="text-anchor-cream-text/70 leading-relaxed mb-6">
              Best for layovers with enough time to leave the airport, post-arrival meals before checking into a Heathrow hotel, or a proper pub lunch before an evening flight.
            </p>
            <ol className="space-y-4 text-anchor-cream-text/80 leading-relaxed">
              <li className="flex gap-4">
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-anchor-gold-bright text-anchor-charcoal font-bold">1</span>
                <div>
                  <p className="font-semibold text-anchor-cream-text">Land at T5</p>
                  <p className="text-sm text-anchor-cream-text/70">7-minute drive with free parking at the pub.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-anchor-gold-bright text-anchor-charcoal font-bold">2</span>
                <div>
                  <p className="font-semibold text-anchor-cream-text">Sunday lunch</p>
                  <p className="text-sm text-anchor-cream-text/70">Walk in during service or book ahead for a guaranteed table.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-anchor-gold-bright text-anchor-charcoal font-bold">3</span>
                <div>
                  <p className="font-semibold text-anchor-cream-text">Easy return</p>
                  <p className="text-sm text-anchor-cream-text/70">Head back to T5 when you are ready.</p>
                </div>
              </li>
            </ol>
          </div>
        </Container>
      </section>

      <OrganicSearchClusterLinks
        cluster="heathrowDining"
        currentPath="/sunday-lunch"
        title="More food near Heathrow"
        intro="Compare the restaurant guide, live menu and table booking page before planning your Sunday visit."
      />

      <FAQAccordionWithSchema
        title="Sunday Roast FAQs"
        faqs={faqs.map((faq) => ({ question: faq.question, answer: faq.answer }))}
      />

      <section className="bg-anchor-green py-12 text-center">
        <Container>
          <div className="max-w-2xl mx-auto space-y-5">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Book your Sunday lunch at The Anchor
            </h2>
            <p className="text-white/85 text-base">
              Sunday service runs 1pm to 6pm. 7 minutes from Heathrow Terminal 5.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <BookTableButton
                source="sunday_lunch_final_cta"
                context="sunday_roast"
                variant="secondary"
                size="lg"
                className="bg-anchor-gold text-anchor-green hover:bg-anchor-gold-light"
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

      <StickyMobileBookingCTA />
      <ScrollProgressBookingTooltip />
      <ExitIntentBookingModal />
      <TimedBookingPrompt />
      <DeferredHomepageTrackers />
      <MenuPageTracker menuType="sunday_lunch" />
    </>
  )
}
