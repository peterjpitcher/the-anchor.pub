import Link from 'next/link'
import Image from 'next/image'
import { Card, CardBody, SectionHeading } from '@/components/ui'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { InteriorHero } from '@/components/hero'
import { CtaBand } from '@/components/CtaBand'
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
import { ScrollProgressBookingTooltip } from '@/components/conversion/ScrollProgressBookingTooltip'
import { ExitIntentBookingModal } from '@/components/conversion/ExitIntentBookingModal'
import { DeferredHomepageTrackers } from '@/components/tracking/DeferredHomepageTrackers'
import { MenuPageTracker } from '@/components/tracking/MenuPageTracker'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { getSundayRoastContent, SUNDAY_ROAST, type SundayRoastContent } from '@/lib/sunday-roast'
import { getSundayLunchMenuPageData, type MenuPageItem } from '@/lib/menu-page-data'
import { FoodMenuSection } from '../food-menu/_components/FoodMenuSection'
import { SundayRoastFeature } from '../food-menu/_components/SundayRoastFeature'
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
    title: 'Sunday Roast Near Heathrow | The Anchor, Stanwell Moor',
    description,
    openGraph: {
      title: 'Sunday Roast Near Heathrow | The Anchor, Stanwell Moor',
      description,
      images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg']
    },
    twitter: getTwitterMetadata({
      title: 'Sunday Roast Near Heathrow | The Anchor, Stanwell Moor',
      description,
      images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg']
    }),
    alternates: {
      canonical: '/sunday-roast'
    }
  }
}

function joinItemNames(items: MenuPageItem[]): string {
  if (items.length === 0) return 'the current Sunday roast menu'
  if (items.length === 1) return items[0].name
  return `${items.slice(0, -1).map((item) => item.name).join(', ')} and ${items[items.length - 1].name}`
}

function getSundayLunchFaqs(sunday: SundayRoastContent, currentMains: MenuPageItem[]) {
  return [
    {
      question: 'Do I need to book a Sunday roast near me?',
      answer: 'Walk-ins are welcome during Sunday roast service. Booking is still recommended for larger groups and peak slots.'
    },
    {
      question: 'Is there a deposit for Sunday roast?',
      answer: `${sunday.smallPartyCopy} ${sunday.depositCopy}`
    },
    {
      question: 'What time is Sunday roast served?',
      answer: 'Sunday roast is served 1pm to 6pm every Sunday. Last table booking is 5:30pm.'
    },
    {
      question: 'What is on the Sunday roast menu?',
      answer: currentMains.length > 0
        ? `The current Sunday roast mains are ${joinItemNames(currentMains)}.`
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
      answer: 'No. Sunday roast is cooked and plated by the kitchen rather than served from a self-serve carvery line.'
    },
    {
      question: 'Do you serve a vegan or vegetarian Sunday roast?',
      answer: currentMains.some((item) => item.vegan || item.vegetarian)
        ? 'Yes. The current Sunday roast menu includes a vegetarian or vegan option. Ask at the bar for allergen guidance before ordering.'
        : 'Please call us for the current Sunday roast dietary options.'
    }
  ] as const
}

function buildMenuJsonLd(menuItems: MenuPageItem[]) {
  if (menuItems.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: 'The Anchor Sunday Roast Menu',
    description: 'Sunday roast menu at The Anchor, Stanwell Moor.',
    url: `${WEBSITE_ORIGIN}/sunday-roast`,
    isPartOf: { '@id': `${WEBSITE_ORIGIN}/#business` },
    hasMenuSection: [
      {
        '@type': 'MenuSection',
        name: 'Sunday Roast Mains',
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
          { name: 'Sunday Roast', url: '/sunday-roast' }
        ]}
      />

      <InteriorHero
        image="/images/food/sunday-roast/the-anchor-sunday-roast-hero.jpg"
        crumb="Sunday Roast"
        kicker="The Anchor, Stanwell Moor"
        title="Sunday Roast Near Heathrow"
        lead="Sunday roast is served 1pm-6pm. Walk in during service or book ahead for busy slots. 7 minutes from Heathrow Terminal 5."
        actions={
          <>
            <BookTableButton
              source="sunday_roast_hero"
              context="sunday_roast"
              variant="primary"
              size="lg"
              fullWidth
              customHref={SUNDAY_LUNCH_BOOKING_URL}
              trackingLabel="Book a Sunday roast"
              eventName="Sunday roast"
            >
              Book a Table
            </BookTableButton>
            <PhoneButton
              phone="01753 682707"
              source="sunday_roast_hero"
              variant="outline"
              size="lg"
            >
              01753 682707
            </PhoneButton>
          </>
        }
      />

      <div className="bg-surface">
        <div className="container">
          <div className="py-3">
            <LaunchAnnouncement variant="banner" />
          </div>
        </div>
      </div>

      <section className="bg-canvas py-section-y">
        <div className="container">
          <PageTitle className="text-center text-ink-strong" seo={{ structured: true, speakable: true }}>
            Sunday Roast Near Heathrow at The Anchor
          </PageTitle>
          <p className="mt-4 text-center text-lg text-ink-muted max-w-3xl mx-auto">
            Sunday roast is served every Sunday from 1pm to 6pm. Walk-ins are welcome, booking is recommended for busier slots, and the current dishes are listed below.
          </p>
          <ul
            aria-label="At a glance"
            className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-ink-muted"
          >
            <li>Dog friendly</li>
            <li aria-hidden="true" className="text-line-strong">&middot;</li>
            <li>Free parking</li>
            <li aria-hidden="true" className="text-line-strong">&middot;</li>
            <li>Walk-ins welcome</li>
            <li aria-hidden="true" className="text-line-strong">&middot;</li>
            <li>4.6/5 on Google</li>
          </ul>
        </div>
      </section>

      {/* Roast feature split (redesign §7.2.4): live Sunday roast line-up. */}
      <section className="bg-surface py-section-y">
        <div className="container">
          <SundayRoastFeature items={sundayMenu.mains} />
        </div>
      </section>

      <section className="bg-canvas py-section-y">
        <div className="container">
          <SectionHeading
            title="Current Sunday Roast Menu"
            lead={sundayMenu.menuData ? 'Choose from our current Sunday roast menu.' : 'Call us for the current Sunday roast dish list.'}
          />

          {sundayMenu.menuData ? (
            <FoodMenuSection menuData={sundayMenu.menuData} showFilters={false} />
          ) : (
            <Card accent className="mx-auto max-w-3xl">
              <CardBody>
                <h2 className="mb-2 text-h4 text-ink-strong">Sunday menu temporarily unavailable</h2>
                <p className="text-ink-muted">
                  The current Sunday roast menu is temporarily unavailable. Please call{' '}
                  <PhoneLink
                    phone="01753 682707"
                    source="sunday_roast_menu_unavailable"
                    className="font-semibold text-accent-text underline"
                    showIcon={false}
                  >
                    01753 682707
                  </PhoneLink>{' '}
                  for the current dish list before travelling.
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </section>

      <section className="bg-surface py-section-y">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-h3 text-ink-strong">
              How Sundays Work at The Anchor
            </h2>
            <SundayLunchHowItWorks />
            <ul className="mt-6 space-y-2 text-base text-ink-muted">
              <li>&bull; Service window: 1pm to 6pm. Last table booking 5:30pm.</li>
              <li>&bull; Walk-ins are welcome. Booking guarantees your spot, especially for larger parties.</li>
              <li>&bull; No Sunday-specific pre-order is required.</li>
              <li>&bull; {sunday.depositCopy}</li>
              <li>&bull; Plans changed? A quick call to{' '}
                <PhoneLink
                  phone="01753 682707"
                  source="sunday_roast_inline"
                  className="font-semibold text-accent-text underline"
                  showIcon={false}
                >
                  01753 682707
                </PhoneLink>
                {' '}lets us offer your table to someone else.</li>
            </ul>
            <Image
              src="/images/food/sunday-roast/sunday-roast-potatoes-tossed.jpg"
              alt="Sunday roast prep at The Anchor pub near Heathrow"
              width={1200}
              height={900}
              loading="lazy"
              sizes="(min-width:1024px) 720px, 100vw"
              className="mt-8 h-auto w-full rounded-md object-cover shadow-lg"
            />
          </div>
        </div>
      </section>

      <SectionViewTracker sectionId="carvery_comparison">
        <section className="bg-canvas py-section-y">
          <div className="container">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-4 text-h3 text-ink-strong">
                Sunday Roast or Carvery? What to Expect Near Heathrow
              </h2>
              <p className="mb-6 leading-relaxed text-ink-muted">
                If you are weighing up a chain carvery near Heathrow versus an independent pub Sunday roast, the main difference is service style: we plate from the kitchen rather than running a self-serve carvery line.
              </p>
              <div className="overflow-x-auto rounded-md border border-line">
                <table className="w-full text-left text-sm md:text-base">
                  <thead className="bg-surface-sunk text-ink-strong">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">Detail</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Carvery</th>
                      <th scope="col" className="px-4 py-3 font-semibold">The Anchor</th>
                    </tr>
                  </thead>
                  <tbody className="text-ink">
                    <tr className="border-t border-line">
                      <th scope="row" className="px-4 py-3 align-top font-semibold text-ink-strong">Serving style</th>
                      <td className="px-4 py-3 align-top">Self-serve buffet line</td>
                      <td className="px-4 py-3 align-top">Cooked and plated by the kitchen</td>
                    </tr>
                    <tr className="border-t border-line">
                      <th scope="row" className="px-4 py-3 align-top font-semibold text-ink-strong">Booking</th>
                      <td className="px-4 py-3 align-top">Varies by venue</td>
                      <td className="px-4 py-3 align-top">Walk in or book ahead</td>
                    </tr>
                    <tr className="border-t border-line">
                      <th scope="row" className="px-4 py-3 align-top font-semibold text-ink-strong">Menu details</th>
                      <td className="px-4 py-3 align-top">Check with the venue</td>
                      <td className="px-4 py-3 align-top">Current dishes listed above, or confirmed by phone</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-center">
                <BookTableButton
                  source="sunday_roast_carvery"
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
          </div>
        </section>
      </SectionViewTracker>

      <section className="bg-surface py-section-y">
        <div className="container">
          <SectionHeading
            title="Why Locals Choose Sunday Roast Here"
            lead="Free parking, easy booking and a village pub setting minutes from Heathrow."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              ['Easy to reach', '7 minutes from Heathrow Terminal 5 by car, outside the terminal rush.'],
              ['Good for groups', 'Book online for standard tables or call us for larger parties.'],
              ['Dog friendly', 'Dogs are welcome inside and in the beer garden.']
            ].map(([title, body]) => (
              <Card key={title} accent>
                <CardBody>
                  <h3 className="text-h4 text-ink-strong">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{body}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-canvas py-section-y">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-3 text-h3 text-ink-strong">
              Sunday Roast Between Flights
            </h2>
            <p className="mb-6 leading-relaxed text-ink-muted">
              Best for layovers with enough time to leave the airport, post-arrival meals before checking into a Heathrow hotel, or a proper pub lunch before an evening flight.
            </p>
            <ol className="space-y-4 leading-relaxed text-ink">
              <li className="flex gap-4">
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-anchor-gold text-white font-bold">1</span>
                <div>
                  <p className="font-semibold text-ink-strong">Land at T5</p>
                  <p className="text-sm text-ink-muted">7-minute drive with free parking at the pub.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-anchor-gold text-white font-bold">2</span>
                <div>
                  <p className="font-semibold text-ink-strong">Sunday roast</p>
                  <p className="text-sm text-ink-muted">Walk in during service or book ahead for a guaranteed table.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-anchor-gold text-white font-bold">3</span>
                <div>
                  <p className="font-semibold text-ink-strong">Easy return</p>
                  <p className="text-sm text-ink-muted">Head back to T5 when you are ready.</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <OrganicSearchClusterLinks
        cluster="heathrowDining"
        currentPath="/sunday-roast"
        title="More food near Heathrow"
        intro="Compare the restaurant guide, live menu and table booking page before planning your Sunday visit."
      />

      <FAQAccordionWithSchema
        title="Sunday Roast FAQs"
        faqs={faqs.map((faq) => ({ question: faq.question, answer: faq.answer }))}
      />

      <CtaBand
        title="Book your Sunday roast at The Anchor"
        copy="Sunday service runs 1pm to 6pm. 7 minutes from Heathrow Terminal 5."
      >
        <BookTableButton
          source="sunday_roast_final_cta"
          context="sunday_roast"
          variant="primary"
          size="lg"
          customHref={SUNDAY_LUNCH_BOOKING_URL}
          trackingLabel="Book a Sunday roast"
          eventName="Sunday roast"
        >
          Book a Table
        </BookTableButton>
        <PhoneButton
          phone="01753 682707"
          source="sunday_roast_final_cta"
          variant="outline"
          size="lg"
        >
          01753 682707
        </PhoneButton>
      </CtaBand>

      <section className="bg-canvas py-8">
        <div className="container">
          <p className="text-center text-sm text-ink-muted">
            <Link href="/find-us" className="text-accent-text underline">Directions and parking</Link>
            {' '}&bull;{' '}
            <Link href="/book-table" className="text-accent-text underline">All booking options</Link>
          </p>
        </div>
      </section>

      <ScrollProgressBookingTooltip />
      <ExitIntentBookingModal />
      <TimedBookingPrompt />
      <DeferredHomepageTrackers />
      <MenuPageTracker menuType="sunday_lunch" />
    </>
  )
}
