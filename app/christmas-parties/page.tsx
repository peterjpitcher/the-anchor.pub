import type { Metadata } from 'next'
import ssot from '@/SSOT.json'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import {
  ChristmasPartiesPageClient,
  type ChristmasDishView,
  type ChristmasFactsView,
  type ChristmasMenuSectionView,
  type ChristmasMenuView,
  type ChristmasSeasonView,
  type ChristmasTierId,
  type ChristmasTierView
} from './client-components'
import { ChristmasHeroPrimaryCta, ChristmasHeroSecondaryCta } from './christmas-hero-ctas'
import { InteriorHero } from '@/components/hero'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { buildChristmasMenuJsonLd, christmasPartiesSchema } from '@/lib/christmas-parties-schema'
import { getChristmasMenuPageData, type ChristmasMenuSection } from '@/lib/menu-page-data'
import {
  CHRISTMAS_DEPOSIT_PER_PERSON,
  CHRISTMAS_MINIMUM_NOTICE_HOURS,
  CHRISTMAS_MINIMUM_PARTY_SIZE,
  CHRISTMAS_WINDOW_END,
  CHRISTMAS_WINDOW_START,
  formatChristmasWindowLabel,
  getChristmasSeasonStatus,
  getLondonIsoDate
} from '@/lib/christmas-season'

// Christmas dish data comes live from the management database, so the page is
// regenerated hourly rather than frozen at build time.
export const revalidate = 3600

const HERO_IMAGE = '/images/page-headers/christmas-parties/2026/hero-table.jpg'

type SsotChristmasFacts = {
  venue: { capacity: { christmas_seated: number, christmas_standing: number } }
  christmas_2026: {
    buffets: { min_guests: number }
    groups_above_20: string
  }
}

const { venue, christmas_2026: christmasSsot } = ssot as unknown as SsotChristmasFacts

/**
 * The private-hire threshold is parsed out of the SSOT sentence rather than
 * restated, so the page cannot drift from the rule it is quoting.
 */
function resolvePrivateHireThreshold(): number {
  const match = /more than (\d+) guests/i.exec(christmasSsot.groups_above_20 || '')
  return match ? Number.parseInt(match[1], 10) : 20
}

const FACTS: ChristmasFactsView = {
  minPartySize: CHRISTMAS_MINIMUM_PARTY_SIZE,
  minNoticeHours: CHRISTMAS_MINIMUM_NOTICE_HOURS,
  depositPerPerson: CHRISTMAS_DEPOSIT_PER_PERSON,
  buffetMinimumGuests: christmasSsot.buffets.min_guests,
  maxSeated: venue.capacity.christmas_seated,
  maxStanding: venue.capacity.christmas_standing,
  privateHireThreshold: resolvePrivateHireThreshold()
}

const TIER_DEFINITIONS: Array<{
  id: ChristmasTierId
  name: string
  courseCount: 1 | 2 | 3
  kidsTierAvailable: boolean
  dayRateVaries: boolean
  pattern: RegExp
}> = [
  // Owner-confirmed 2026-08-04: courses are chosen per person, so these are
  // price points a guest picks for themselves, not tiers the table commits to.
  // Every guest pre-orders a main whichever they pick. 1 course is the only
  // price point with a kids portion. 2 and 3 course are adults only as a priced
  // point, and priced differently Tue-Thu versus Fri-Sat.
  {
    id: 'one_course',
    name: '1 course',
    courseCount: 1,
    kidsTierAvailable: true,
    dayRateVaries: false,
    pattern: /\b(?:1|one)[\s_-]*course\b/i
  },
  {
    id: 'two_course',
    name: '2 course',
    courseCount: 2,
    kidsTierAvailable: false,
    dayRateVaries: true,
    pattern: /\b(?:2|two)[\s_-]*course\b/i
  },
  {
    id: 'three_course',
    name: '3 course',
    courseCount: 3,
    kidsTierAvailable: false,
    dayRateVaries: true,
    pattern: /\b(?:3|three)[\s_-]*course\b/i
  }
]

const KIDS_ITEM_PATTERN = /^kids?\b/i

/** Symbol-free price formatting, matching the site-wide menu display policy. */
function formatBarePrice(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return ''
  return value % 1 === 0 ? String(value) : value.toFixed(2)
}

/**
 * Lowest live price in a set of dishes, split by whether the dish is a kids
 * portion. Adult and kids prices are never mixed, so a "from" figure can never
 * advertise a child price to an adult.
 */
function lowestPrice(source: Array<{ name: string, priceValue: number }>, kids: boolean): string {
  const candidates = source
    .filter(item => KIDS_ITEM_PATTERN.test(item.name || '') === kids)
    .map(item => item.priceValue)
    .filter(value => Number.isFinite(value) && value > 0)

  if (candidates.length === 0) return ''
  return formatBarePrice(Math.min(...candidates))
}

function toDishViews(section: ChristmasMenuSection): ChristmasDishView[] {
  return section.items.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    price: item.price,
    allergens: item.allergens,
    allergenStatus: item.allergenStatus,
    ...(item.allergenNotice ? { allergenNotice: item.allergenNotice } : {})
  }))
}

/**
 * Fold the live Christmas menu into the three confirmed course price points.
 *
 * The structure and the kids rule are SSOT facts and always render. Dishes and
 * prices only ever come from the management database, so a price point with no
 * live data simply says "confirmed on enquiry" rather than showing a zero, a
 * guess or an empty block.
 */
function buildMenuView(sections: ChristmasMenuSection[], isUnavailable: boolean): ChristmasMenuView {
  const claimed = new Set<string>()

  const tiers: ChristmasTierView[] = TIER_DEFINITIONS.map(definition => {
    const matched = sections.filter(section => definition.pattern.test(section.title))
    matched.forEach(section => claimed.add(section.id))

    const rawItems = matched.flatMap(section => section.items)
    const items = matched.flatMap(toDishViews)

    return {
      id: definition.id,
      name: definition.name,
      courseCount: definition.courseCount,
      kidsTierAvailable: definition.kidsTierAvailable,
      dayRateVaries: definition.dayRateVaries,
      priceFrom: lowestPrice(rawItems, false),
      kidsPriceFrom: definition.kidsTierAvailable ? lowestPrice(rawItems, true) : '',
      items
    }
  })

  const extraSections: ChristmasMenuSectionView[] = sections
    .filter(section => !claimed.has(section.id))
    .map(section => ({
      id: section.id,
      title: section.title,
      description: section.description || '',
      items: toDishViews(section)
    }))

  const hasLiveDishes = tiers.some(tier => tier.items.length > 0)
    || extraSections.some(section => section.items.length > 0)

  return { tiers, extraSections, hasLiveDishes, isUnavailable }
}

function buildSeasonView(): ChristmasSeasonView {
  const status = getChristmasSeasonStatus()
  const today = getLondonIsoDate()

  // The 24 hour notice rule at date granularity: the earliest bookable date is
  // tomorrow, and never earlier than the first day of the service window.
  const tomorrow = new Date(`${today}T00:00:00Z`)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  const earliestWithNotice = tomorrow.toISOString().slice(0, 10)

  return {
    state: status.state,
    windowLabel: formatChristmasWindowLabel(),
    minEnquiryDate: earliestWithNotice > CHRISTMAS_WINDOW_START ? earliestWithNotice : CHRISTMAS_WINDOW_START,
    maxEnquiryDate: CHRISTMAS_WINDOW_END,
    isBookable: status.isBookable
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const season = buildSeasonView()
  const windowLabel = season.windowLabel

  if (season.state === 'ended' || !season.isBookable) {
    const title = 'Christmas Parties Near Heathrow & Staines | The Anchor'
    const description =
      'Christmas bookings at The Anchor near Heathrow are closed for this season. Private hire and group bookings run all year, with free parking.'
    return {
      title: { absolute: title },
      description,
      openGraph: { title, description, images: [{ url: HERO_IMAGE, width: 1200, height: 630, alt: 'Christmas parties at The Anchor near Heathrow' }] },
      twitter: getTwitterMetadata({ title, description, images: [HERO_IMAGE] }),
      alternates: { canonical: './' }
    }
  }

  const title = 'Christmas Party Venue Near Heathrow & Staines | The Anchor'
  // Kept under ~155 chars so Google shows the whole snippet. Free parking is
  // the strongest differentiator against airport-area venues, so it sits near
  // the front rather than in the tail that used to get truncated away.
  const description =
    `Christmas parties and dinner near Heathrow, free parking. ${windowLabel}. Each guest picks 1, 2 or 3 courses. Groups of ${FACTS.minPartySize}+, £${FACTS.depositPerPerson}pp deposit.`

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title: 'Christmas Dinner & Christmas Parties Near Heathrow | The Anchor',
      description: `Book Christmas dinner at The Anchor, ${windowLabel}. Each guest picks 1, 2 or 3 courses, for groups of ${FACTS.minPartySize} or more. Free parking, seven minutes from Heathrow Terminal 5.`,
      images: [{ url: HERO_IMAGE, width: 1200, height: 630, alt: 'Christmas parties at The Anchor near Heathrow' }]
    },
    twitter: getTwitterMetadata({
      title: 'Christmas Dinner & Christmas Parties Near Heathrow | The Anchor',
      description: `Book Christmas dinner at The Anchor, ${windowLabel}. Each guest picks 1, 2 or 3 courses, for groups of ${FACTS.minPartySize} or more. Free parking near Heathrow.`,
      images: [HERO_IMAGE]
    }),
    alternates: { canonical: './' }
  }
}

export default async function ChristmasPartiesPage() {
  const season = buildSeasonView()
  const christmasMenu = await getChristmasMenuPageData()
  const menu = buildMenuView(christmasMenu.sections, Boolean(christmasMenu.unavailableReason))
  const seasonEnded = season.state === 'ended' || !season.isBookable

  // Priced markup is only ever built from live data, and only in season. It
  // returns null when there is nothing to publish, so no empty Menu node ships.
  const menuJsonLd = seasonEnded
    ? null
    : buildChristmasMenuJsonLd(
      christmasMenu.sections.map(section => ({
        title: section.title,
        items: section.items.map(item => ({
          name: item.name,
          description: item.description,
          priceValue: item.priceValue
        }))
      }))
    )

  const heroLead = seasonEnded
    ? `Our Christmas service ran ${season.windowLabel} and has now finished. The Anchor is still here for private parties, group bookings and everyday food and drink, seven minutes from Heathrow Terminal 5 with around 20 free parking spaces.`
    : `A village pub Christmas seven minutes from Heathrow Terminal 5 and eight from Staines, with around 20 free parking spaces. Christmas dinner runs ${season.windowLabel} for groups of ${FACTS.minPartySize} or more, with at least ${FACTS.minNoticeHours} hours notice and a £${FACTS.depositPerPerson} per person deposit.`

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
          { name: 'Christmas Parties', url: '/christmas-parties' }
        ]}
      />
      <InteriorHero
        image={HERO_IMAGE}
        crumb="Christmas Parties"
        kicker={seasonEnded ? 'The Anchor, Stanwell Moor' : 'Christmas 2026'}
        title="Christmas parties near Heathrow, Staines and Surrey"
        lead={heroLead}
        actions={
          seasonEnded ? (
            <ChristmasHeroSecondaryCta />
          ) : (
            <>
              <ChristmasHeroPrimaryCta />
              <ChristmasHeroSecondaryCta />
            </>
          )
        }
      />
      <ChristmasPartiesPageClient
        structuredData={christmasPartiesSchema}
        menu={menu}
        season={season}
        facts={FACTS}
      />
      <InternalLinkingSection
        title="More Christmas Party Planning"
        links={[
          {
            href: '/blog/office-christmas-party-planning-guide',
            title: 'Office Christmas Party Planning Guide',
            description: 'A step-by-step guide for organisers, from setting the date to collecting meal choices.',
          },
          {
            href: '/blog/christmas-party-food-ideas',
            title: 'Christmas Party Food Ideas',
            description: 'Sit-down, buffet and sharing options to suit your group and budget.',
          },
          {
            href: '/private-hire',
            title: 'Private Hire at The Anchor',
            description: 'Function room and venue hire for celebrations all year round.',
          },
        ]}
      />
      <OrganicSearchClusterLinks
        cluster="privateRooms"
        currentPath="/christmas-parties"
        title="Private room and party venue options"
        intro="Compare Christmas parties with private hire, function rooms and corporate event options near Heathrow."
      />
    </>
  )
}
