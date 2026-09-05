import type { Metadata } from 'next'
import ssot from '@/SSOT.json'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import {
  ChristmasPartiesPageClient,
  type ChristmasBuffetView,
  type ChristmasCourseChoicesView,
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
import { BrochureDownload } from '@/components/features/PrivateHire/BrochureDownload'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { buildChristmasMenuJsonLd, christmasPartiesSchema } from '@/lib/christmas-parties-schema'
import { getChristmasMenuPageData, MENU_ALLERGEN_UNKNOWN_NOTICE, type ChristmasMenuSection } from '@/lib/menu-page-data'
import { getChristmasPreorderMenu, type ChristmasPreorderMenu } from '@/lib/christmas-preorder-menu'
import { getCateringData, type CateringPackage } from '@/lib/api/catering-packages'
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

// New path, not an overwrite of hero-table.jpg. Everything under public/ is
// served `immutable, max-age=31536000`, so replacing a file in place leaves the
// CDN and every returning visitor on the old bytes for a year. Replacing this
// image means giving it a new name.
const HERO_IMAGE = '/images/page-headers/christmas-parties/2026/hero-table-wide.jpg'

type SsotChristmasFacts = {
  venue: { capacity: { christmas_seated: number, christmas_standing: number } }
  christmas_2026: {
    buffets: { min_guests: number }
    groups_above_20: string
    booking_rules?: { pre_order_deadline_days?: number }
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
  privateHireThreshold: resolvePrivateHireThreshold(),
  // Owner-confirmed 11 August 2026: pre-orders for the 2 and 3 course tiers are
  // due seven days before the booking date. Read from the SSOT so the page and
  // the JSON-LD quote one number.
  preOrderDeadlineDays: christmasSsot.booking_rules?.pre_order_deadline_days ?? 7
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
  // One course needs no pre-order and is the only
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

  // 57 characters including the suffix, so the whole thing renders in the SERP.
  // Staines leads because that is the only cluster already sitting on page one.
  const title = 'Christmas Party Venue Near Staines & Heathrow | The Anchor'
  // Under 155 chars, and deliberately free of the booking conditions. Every
  // rival on these queries is a hotel package, so the snippet sells the
  // opposite: a real pub, your own table, and parking that costs nothing. The
  // window, the group minimum and the deposit are on the page, not in here,
  // because in a search result they read as barriers rather than as reasons.
  const description =
    'Christmas parties and Christmas dinner in a proper village pub near Staines and Heathrow. Your own table, not a hotel function room, and free parking.'

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

/**
 * The pre-order dish list, mapped onto the same view type the priced menu uses
 * so both render through one dish component.
 *
 * These dishes carry no per-dish price: the course tier is what is priced, and
 * the tier prices are already on the page. Only a genuine extra such as the
 * cheeseboard has a price of its own, and it is passed through symbol-free to
 * match the SSOT price display policy.
 */
function buildCourseChoicesView(source: ChristmasPreorderMenu | null): ChristmasCourseChoicesView | null {
  if (!source || source.groups.length === 0) return null

  return {
    preorderCutoffDays: source.preorderCutoffDays,
    groups: source.groups.map(group => ({
      course: group.course,
      title: group.title,
      items: group.items.map((item): ChristmasDishView => {
        const allergens = Array.isArray(item.allergens) ? item.allergens : []

        return {
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: typeof item.price_gbp === 'number' ? item.price_gbp.toFixed(2) : '',
          allergens,
          allergenStatus: allergens.length > 0 ? 'known' : 'unknown',
          allergenNotice: MENU_ALLERGEN_UNKNOWN_NOTICE
        }
      })
    }))
  }
}

/**
 * The festive buffet packages, priced live from the catering source.
 *
 * Matched on a "Festive" name prefix rather than a hardcoded list, so
 * activating or retiring one in the management app is the only step needed:
 * the sit-down "Festive Menu" packages are excluded because they are the set
 * menu, not a buffet, and are retired. Returns [] when none are active, which
 * hides the cards rather than advertising something nobody can book.
 */
function buildBuffetView(packages: CateringPackage[]): ChristmasBuffetView[] {
  return packages
    .filter(pkg =>
      /^festive/i.test(pkg.name) &&
      pkg.servingStyle === 'buffet' &&
      pkg.costPerHead > 0
    )
    .sort((a, b) => a.costPerHead - b.costPerHead)
    .map(pkg => ({
      name: pkg.name,
      // Symbol-free from the source; the page adds the £, per the price policy.
      pricePerHead: pkg.costPerHead.toFixed(2).replace(/\.00$/, ''),
      minimumGuests: pkg.minimumGuests,
      description: pkg.guestDescription || pkg.summary || ''
    }))
}

export default async function ChristmasPartiesPage() {
  const season = buildSeasonView()
  // All three reads are independent, so they run together rather than in series.
  const [christmasMenu, preorderMenu, catering] = await Promise.all([
    getChristmasMenuPageData(),
    getChristmasPreorderMenu(),
    getCateringData().catch(() => ({ foodPackages: [] as CateringPackage[] }))
  ])
  const buffets = buildBuffetView(catering.foodPackages)
  const menu = buildMenuView(christmasMenu.sections, Boolean(christmasMenu.unavailableReason))
  const courseChoices = buildCourseChoicesView(preorderMenu)
  const seasonEnded = season.state === 'ended' || !season.isBookable

  // Priced markup is only ever built from live data, and only in season. It
  // returns null when there is nothing to publish, so no empty Menu node ships.
  // The tier sections carry the prices; the course sections carry the dishes.
  // Both belong in one Menu node, otherwise the markup describes prices for food
  // it never names. Course dishes are unpriced at dish level, and the builder
  // publishes an item without an Offer rather than inventing a price for it.
  const multiCourseTierPatterns = TIER_DEFINITIONS
    .filter(tier => tier.courseCount > 1)
    .map(tier => tier.pattern)

  const menuJsonLd = seasonEnded
    ? null
    : buildChristmasMenuJsonLd([
      ...christmasMenu.sections
        // The multi-course tier sections hold one priced placeholder row per
        // service window, not dishes, and their stock description says the menu
        // is unpublished. Publishing that alongside the real dish list would
        // hand an answer engine a direct contradiction, so they are dropped
        // from the markup exactly as they are dropped from the page.
        .filter(section => !(courseChoices && multiCourseTierPatterns.some(pattern => pattern.test(section.title))))
        .map(section => ({
        title: section.title,
        items: section.items.map(item => ({
          name: item.name,
          description: item.description,
          priceValue: item.priceValue
        }))
      })),
      ...(courseChoices?.groups ?? []).map(group => ({
        title: group.title,
        items: group.items.map(item => ({
          name: item.name,
          description: item.description,
          priceValue: Number.parseFloat(item.price) || 0
        }))
      }))
    ])

  /**
   * Lowest live adult price across the course tiers, symbol-free from the menu
   * API. Read rather than written: the SSOT forbids hardcoding a food price
   * anywhere in page code, so if the menu is unpriced the hero simply omits the
   * clause instead of quoting a number that might be wrong.
   */
  const heroPriceFrom = menu.tiers
    .map(tier => Number.parseFloat(tier.priceFrom))
    .filter(price => Number.isFinite(price) && price > 0)
    .sort((a, b) => a - b)[0]

  const heroLead = seasonEnded
    ? `Our Christmas service ran ${season.windowLabel} and has now finished. The Anchor is still here for private parties, group bookings and everyday food and drink, seven minutes from Heathrow Terminal 5 with around 20 free parking spaces.`
    // Leads with the differentiator, not the mechanics of ordering dinner: your
    // own space rather than a shared hotel sitting is the thing no competitor
    // near Heathrow offers, and it was previously buried below the menu. The
    // window, group minimum, notice and deposit all sit in the banner and the
    // summary block immediately below, so nothing is lost by not repeating them.
    : `Your own table and your own evening, in a village pub rather than a shared hotel function room.${heroPriceFrom ? ` Christmas dinners from £${heroPriceFrom} a head.` : ''} Seven minutes from Heathrow Terminal 5 and eight from Staines, with around 20 free parking spaces.`

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
        title="Christmas parties and Christmas dinner near Staines and Heathrow"
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
        courseChoices={seasonEnded ? null : courseChoices}
        buffets={seasonEnded ? [] : buffets}
      />
      {/*
        The general (year-round) brochure, not a festive one. The heading says so
        explicitly: the festive menus, deposit rules and service window on this page
        are the Christmas offer, and the brochure does not carry them.
      */}
      <BrochureDownload
        brochure="general"
        source="christmas_parties"
        heading="Planning something outside Christmas?"
      />

      <InternalLinkingSection
        title="More Christmas Party Planning"
        links={[
          // Kept deliberately. tests/seo-indexing.test.ts guards this link so the
          // organiser checklist is not orphaned. It absorbed the retired
          // /blog/office-christmas-party-planning-guide post (301'd Aug 2026),
          // so if this link ever moves, update the guard rather than dropping it.
          {
            href: '/blog/christmas-party-planning-checklist-for-organisers',
            title: 'Christmas Party Checklist for Organisers',
            description: 'The decisions in the order they need making, starting with headcount because it changes everything else.',
          },
          {
            href: '/blog/work-christmas-party-ideas-near-heathrow',
            title: 'Work Christmas Party Ideas Near Heathrow',
            description: 'A straight guide to formats, group sizes and the bits that usually catch organisers out.',
          },
          {
            href: '/blog/festive-buffet-ideas-for-large-groups-near-heathrow',
            title: 'Festive Buffet or Sit-Down for a Large Group',
            description: 'How each format actually works on the night, and the 30-guest buffet minimum that often decides it.',
          },
          {
            href: '/blog/christmas-dinner-or-party-night-which-suits-your-group',
            title: 'Christmas Dinner or Party Night?',
            description: 'An honest comparison with the hotel party nights, including when they are the better booking.',
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
