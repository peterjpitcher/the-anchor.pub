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
import { getSundayRoastContent, SUNDAY_ROAST } from '@/lib/sunday-roast'
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
  const description = menu.menuData
    ? 'Proper Sunday roast 7 minutes from Heathrow T5. Walk in 1pm to 6pm, no booking and no pre-order needed. Beef, pork, turkey, pies and a vegan option.'
    : 'Sunday roast 7 minutes from Heathrow T5. Walk in 1pm to 6pm at The Anchor, Stanwell Moor, no booking needed. Call us for the current Sunday dish list.'

  const title = 'Sunday Roast Near Heathrow | The Anchor Pub, Stanwell Moor'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg']
    },
    twitter: getTwitterMetadata({
      title,
      description,
      images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg']
    }),
    alternates: {
      canonical: '/sunday-roast'
    }
  }
}

function getSundayLunchFaqs() {
  return [
    {
      question: 'Do I need to book a table for Sunday roast?',
      answer: 'No. Walk in any time between 1pm and 6pm and order at the table. Booking is only recommended for groups of 10 or more, or for busy afternoons.'
    },
    {
      question: 'What time is Sunday roast served at The Anchor?',
      answer: 'Every Sunday from 1pm to 6pm. The last tables are seated at 5:30pm.'
    },
    {
      question: 'Do you have to pre-order the roast?',
      answer: 'No. There is no pre-order, no Saturday cut-off and no per-plate prepayment. You choose and order when you arrive.'
    },
    {
      question: 'Is there a vegan Sunday roast?',
      answer: 'Yes. The Beetroot and Butternut Squash Wellington is fully vegan, served with vegan gravy and the full plate of roast sides.'
    },
    {
      question: "Where's the best Sunday roast near Heathrow Airport?",
      answer: 'The Anchor in Stanwell Moor is around seven minutes from Terminal 5, traffic dependent, with free parking, fresh made-to-order roasts and no booking needed.'
    },
    {
      question: 'Is there parking, and is it free?',
      answer: 'Yes. 20 free on-site spaces with CCTV, no meters and no time limit while you dine. The pub is also outside the ULEZ zone.'
    },
    {
      question: 'Can we fit in a Sunday roast before a flight from Heathrow?',
      answer: 'Usually, yes. We are around seven minutes from Terminal 5 and last tables are seated at 5:30pm. A pre-flight roast works well with around 90 minutes to spare; allow longer if you need to return a hire car or expect a busy security queue.'
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
            // Schema requires a bare numeric string; item.price is the £-prefixed display label
            price: item.priceValue > 0 ? item.priceValue.toFixed(2) : ''
          }
        }))
      }
    ]
  }
}

export default async function SundayRoastPage() {
  const sunday = getSundayRoastContent()
  const sundayMenu = await getSundayLunchMenuPageData()
  const faqs = getSundayLunchFaqs()
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
        lead="A proper Sunday roast 7 minutes from Heathrow Terminal 5. Walk in any time from 1pm to 6pm. No booking, no pre-order, just sit down and order at the table."
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
            The Anchor serves a proper Sunday roast every Sunday from 1pm to 6pm, seven minutes from Heathrow Terminal 5 in Stanwell Moor. Here is the part most places near the airport cannot say: you do not need to book, and you do not need to pre-order. Walk in any time during service, sit down, and order at the table.
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
            <li>Highly rated on Google</li>
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
            title="The Roast Line-Up"
            lead={sundayMenu.menuData ? 'Everything is cooked to order, so you get a plate that was put together for you, not held under a lamp. Every roast comes with roast potatoes, seasonal veg and gravy.' : 'Call us for the current Sunday roast dish list.'}
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
          <p className="mt-6 text-center text-sm text-ink-muted">
            Prices are kept current on our{' '}
            <Link href="/food-menu" className="font-semibold text-accent-text underline">menu page</Link>
            {' '}rather than here.
          </p>
        </div>
      </section>

      <section className="bg-surface py-section-y">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-h3 text-ink-strong">
              Vegan, and Tell Us About Allergies
            </h2>
            <p className="mb-4 leading-relaxed text-ink-muted">
              The Beetroot and Butternut Squash Wellington is fully vegan, made as a vegan dish from the start. It comes with its own vegan gravy and the same generous plate of sides as everything else. So a mixed table, one person eating plant-based and everyone else after beef, works without anyone compromising.
            </p>
            <p className="leading-relaxed text-ink-muted">
              Got an allergy or a dietary need? Let the team know when you sit down and we will talk you through what works. We would rather you ask than guess.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-canvas py-section-y">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-h3 text-ink-strong">
              No Booking, No Pre-Order, No Fuss
            </h2>
            <p className="mb-4 leading-relaxed text-ink-muted">
              Most Sunday roasts near Heathrow want you to commit days ahead: choose your meat by Saturday lunchtime, pay up front, lock in a slot. We used to do that too. Not any more.
            </p>
            <p className="mb-6 leading-relaxed text-ink-muted">
              Since May 2026, the roast is walk-in all the way through. Turn up between 1pm and 6pm (last tables seated at 5:30pm) and we will cook it fresh. No Saturday cut-off, no deposit per plate, no pre-order form. Changed your mind about pork on the drive over? Order beef instead. Booking is still a good idea for bigger tables or a busy afternoon, but for two or four people it is genuinely never required.
            </p>
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
        <section className="bg-surface py-section-y">
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

      <section className="bg-canvas py-section-y">
        <div className="container">
          <SectionHeading
            title="Finding Us, Parking and the Drive from Heathrow"
            lead="The Anchor is in Stanwell Moor, on the Surrey and Middlesex edge, close to Staines and a short hop from the airport."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              ['7 minutes from Terminal 5', 'A short drive from Heathrow Terminal 5 by car, and easy to reach from the other terminals.'],
              ['Free on-site parking', '20 spaces with CCTV, no meters and no time limit while you are dining.'],
              ['Outside the ULEZ zone', 'No daily charge to drive in and park up for your roast.'],
              ['Step-free access', 'Step-free from the car park through to the bar and dining area.'],
              ['Dog friendly', 'The dog comes too, inside the pub and in the beer garden.'],
              ['Good for a stop', 'Easy for travellers, locals around Staines and Stanwell Moor, or anyone on the way back from the airport.']
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

      <section className="bg-surface py-section-y">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-h3 text-ink-strong">
              Big Tables, Groups and Booking
            </h2>
            <p className="mb-4 leading-relaxed text-ink-muted">
              Coming as a group? For {SUNDAY_ROAST.largePartyThreshold} or more we take a {SUNDAY_ROAST.largePartyDepositLabel} deposit that comes straight off your final bill, so it is not an extra cost, just a way to hold the table. Smaller groups can book if you would like the certainty, or simply walk in.
            </p>
            <p className="mb-6 leading-relaxed text-ink-muted">
              Booking is recommended for peak times and larger parties. Everyone else: the door is open from 1pm.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <BookTableButton
                source="sunday_roast_groups"
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
                source="sunday_roast_groups"
                variant="outline"
                size="lg"
              >
                01753 682707
              </PhoneButton>
            </div>
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

      <section className="bg-surface py-section-y">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-h3 text-ink-strong">
              Fresh Roasts, Made to Order
            </h2>
            <p className="leading-relaxed text-ink-muted">
              We plate Sunday roasts fresh to order, with walk-ins welcome and no pre-order needed. Come and see why guests keep talking about our roasts.
            </p>
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
