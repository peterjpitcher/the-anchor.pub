'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/layout/Container'
import { Section } from '@/components/ui/layout/Section'
import { Grid } from '@/components/ui/layout/Grid'
import { Badge } from '@/components/ui/primitives/Badge'
import { Icon } from '@/components/ui/Icon'
import { Card } from '@/components/ui/layout/Card'
import { Button } from '@/components/ui/primitives/Button'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Alert } from '@/components/ui/feedback/Alert'
import { pushToDataLayer, trackBannerEvent, trackCtaClick, trackEmailClick, trackFormComplete, trackFormStart, trackPhoneCallClick } from '@/lib/gtm-events'
import { CHRISTMAS_OPEN_FORM_EVENT } from './christmas-hero-ctas'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { ValueProofStrip, RegretReduction } from '@/components/psychology'
import { StickyDrawer } from '@/components/ui'
import { CONTACT } from '@/lib/constants'

const CONTACT_EMAIL = CONTACT.email
const CONTACT_PHONE = CONTACT.phone
const CONTACT_PHONE_LINK = CONTACT.phoneHref
const CONTACT_EMAIL_LINK = `mailto:${CONTACT_EMAIL}`

export type EnquiryMode = 'party' | 'meal'
export type MealService = 'lunch' | 'dinner'

/**
 * Roughly how many courses the enquirer expects each guest to have. Courses are
 * chosen per person at pre-order, so this is a planning steer for the kitchen
 * rather than a commitment for the table. 'undecided' is a legitimate answer.
 */
export type CourseTier = 'undecided' | 'one_course' | 'two_course' | 'three_course'

export type ChristmasTierId = 'one_course' | 'two_course' | 'three_course'

/** A single live dish. Prices are symbol-free, exactly as the menu API supplies them. */
export interface ChristmasDishView {
  id: string
  name: string
  description: string
  price: string
  allergens: string[]
  allergenStatus: 'known' | 'unknown'
  allergenNotice?: string
}

export interface ChristmasTierView {
  id: ChristmasTierId
  /** Customer-facing name for the price point, for example "2 course". */
  name: string
  courseCount: 1 | 2 | 3
  /** True only where a child portion and child price actually exist. */
  kidsTierAvailable: boolean
  /** Lowest live adult price for the tier, symbol-free. Empty when nothing is priced yet. */
  priceFrom: string
  /** Lowest live kids price, symbol-free. Only ever set where a kids tier exists. */
  kidsPriceFrom: string
  /** True when the two prices differ between Tue-Thu and Fri-Sat. */
  dayRateVaries: boolean
  items: ChristmasDishView[]
}

export interface ChristmasMenuSectionView {
  id: string
  title: string
  description: string
  items: ChristmasDishView[]
}

export interface ChristmasMenuView {
  tiers: ChristmasTierView[]
  /** Live sections that are not one of the three course tiers. */
  extraSections: ChristmasMenuSectionView[]
  /** True when at least one live dish came back from the management system. */
  hasLiveDishes: boolean
  /** True when the menu call failed, rather than simply returning nothing yet. */
  isUnavailable: boolean
}

export interface ChristmasSeasonView {
  state: 'upcoming' | 'active' | 'ended'
  /** For example "10 November to 20 December 2026". */
  windowLabel: string
  /** Earliest selectable enquiry date, already carrying the 24 hour notice floor. */
  minEnquiryDate: string
  /** Latest selectable enquiry date, the last day of the service window. */
  maxEnquiryDate: string
  /** False once no date inside the window can still be booked with notice. */
  isBookable: boolean
}

export interface ChristmasFactsView {
  minPartySize: number
  minNoticeHours: number
  depositPerPerson: number
  buffetMinimumGuests: number
  maxSeated: number
  maxStanding: number
  /** Above this, it stops being a table booking and becomes private hire. */
  privateHireThreshold: number
}

interface EnquiryContext {
  mode: EnquiryMode
  service: MealService
  courseTier: CourseTier
  source: string
  perks: string[]
}

const DEFAULT_CONTEXT: EnquiryContext = {
  mode: 'party',
  service: 'lunch',
  courseTier: 'undecided',
  source: 'page_default',
  perks: []
}

interface ChristmasPartiesPageClientProps {
  structuredData: Record<string, unknown>
  menu: ChristmasMenuView
  season: ChristmasSeasonView
  facts: ChristmasFactsView
}

interface ChristmasEnquiryFormProps {
  context: EnquiryContext
  season: ChristmasSeasonView
  facts: ChristmasFactsView
  onContextChange: (updates: Partial<EnquiryContext>) => void
  onSuccess: () => void
}

interface ChristmasLightboxProps {
  suppressed: boolean
  context: EnquiryContext
  season: ChristmasSeasonView
  facts: ChristmasFactsView
  onContextChange: (updates: Partial<EnquiryContext>) => void
  onSubmitSuccess: () => void
}

interface ChristmasOpenFormEventDetail {
  mode?: EnquiryMode
  source?: string
}

const ENQUIRY_STORAGE_KEYS = {
  submitted: 'christmas_enquiry_submitted',
  lightbox: 'christmas_enquiry_lightbox_last'
} as const

interface TimeOption {
  value: string
  label: string
}

const LUNCH_TIME_OPTIONS: TimeOption[] = [
  { value: '12:00', label: '12:00 pm' },
  { value: '12:30', label: '12:30 pm' },
  { value: '13:00', label: '1:00 pm' },
  { value: '13:30', label: '1:30 pm' },
  { value: '14:00', label: '2:00 pm' }
]

const DINNER_TIME_OPTIONS: TimeOption[] = [
  { value: '17:30', label: '5:30 pm' },
  { value: '18:00', label: '6:00 pm' },
  { value: '18:30', label: '6:30 pm' },
  { value: '19:00', label: '7:00 pm' },
  { value: '19:30', label: '7:30 pm' },
  { value: '20:00', label: '8:00 pm' }
]

const PARTY_TIME_OPTIONS: TimeOption[] = [
  { value: '12:00', label: '12:00 pm' },
  { value: '15:00', label: '3:00 pm' },
  { value: '17:00', label: '5:00 pm' },
  { value: '18:00', label: '6:00 pm' },
  { value: '19:00', label: '7:00 pm' },
  { value: '20:00', label: '8:00 pm' }
]

/** Shared Christmas party nights were discontinued on 21 July 2026 and are not listed. */
const PARTY_FORMAT_VALUES = ['not_sure', 'private_space', 'festive_buffet', 'drinks_party', 'entertainment'] as const

// Guests pick their own courses at pre-order, so this asks what the group
// expects rather than committing the table to one course count.
const COURSE_TIER_OPTIONS: Array<{ value: CourseTier, label: string }> = [
  { value: 'undecided', label: 'Not decided yet' },
  { value: 'one_course', label: 'Mostly 1 course each' },
  { value: 'two_course', label: 'Mostly 2 courses each' },
  { value: 'three_course', label: 'Mostly 3 courses each' }
]

const TRIMMINGS = ['Pigs in blankets', 'Stuffing', 'Brussels sprouts']

const getTimeOptions = (context: EnquiryContext): TimeOption[] => {
  if (context.mode === 'party') return PARTY_TIME_OPTIONS
  return context.service === 'lunch' ? LUNCH_TIME_OPTIONS : DINNER_TIME_OPTIONS
}

const union = (array: string[], additions: string[]) => Array.from(new Set([...array, ...additions]))

const markLocalStorage = (key: string, value: string) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, value)
  } catch (error) {
    console.warn('Unable to update localStorage', error)
  }
}

const getLocalStorage = (key: string) => {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(key)
  } catch (error) {
    console.warn('Unable to read localStorage', error)
    return null
  }
}

function partyFormatOptions(buffetMinimumGuests: number): Array<{ value: string, label: string }> {
  const labels: Record<(typeof PARTY_FORMAT_VALUES)[number], string> = {
    not_sure: 'Not sure yet',
    private_space: 'Private space',
    festive_buffet: `Festive buffet (${buffetMinimumGuests}+)`,
    drinks_party: 'Drinks party',
    entertainment: 'Entertainment package'
  }
  return PARTY_FORMAT_VALUES.map(value => ({ value, label: labels[value] }))
}

function tierPriceLabel(tier: ChristmasTierView): string {
  return tier.priceFrom ? `From £${tier.priceFrom} per person` : 'Confirmed on enquiry'
}

function buildFaqItems(season: ChristmasSeasonView, facts: ChristmasFactsView) {
  return [
    {
      question: 'What dates can we book Christmas dinner for?',
      answer: `Christmas dinner runs ${season.windowLabel}. The 20th of December is included, so a sitting on that day can be booked. Popular Friday and Saturday dates go first, so enquire early.`
    },
    {
      question: 'Is there a minimum group size for Christmas dinner?',
      answer: `Yes. Every Christmas dinner booking is for ${facts.minPartySize} guests or more. Smaller groups are very welcome to join us from the regular menu instead.`
    },
    {
      question: 'How far ahead do we need to book?',
      answer: `At least ${facts.minNoticeHours} hours before your sitting. We cannot take same-day Christmas bookings, because the kitchen orders and preps to your numbers.`
    },
    {
      question: 'Do you take a deposit for Christmas bookings?',
      answer: `Yes. Every Christmas booking takes a £${facts.depositPerPerson} per person deposit at the time of booking, whatever the size of your group. It is non-refundable and comes off your final bill.`
    },
    {
      question: 'Do we have to pre-order our meals?',
      answer: 'Yes, and everyone chooses for themselves. Courses are picked per person, not for the whole table. Every guest chooses a main, a starter and a dessert are optional, and guests at the same table can have different numbers of courses. We confirm the deadline for choices with your booking.'
    },
    {
      question: 'Is there a kids 2 course or 3 course?',
      answer: 'No. There is a kids 1 course only. No child portion and no child price exists for the 2 course or the 3 course. Children are welcome to order the adult 2 or 3 course, but it is charged at the adult price.'
    },
    {
      question: 'What is included in the price?',
      answer: 'Adults get a glass of prosecco whichever courses they choose, swappable for orange juice. Children get a Fruit Shoot or a small soft drink, either Coca-Cola, Diet Coke or lemonade, with the 1 course. Trimmings are pigs in blankets, stuffing and brussels sprouts.'
    },
    {
      question: 'What is on the Christmas menu?',
      answer: 'The full menu is released closer to the time. Prices come straight from our booking system, so what you see here is always the current price. Ask us and we will send the menu as soon as it is confirmed.'
    },
    {
      question: 'How do you handle allergies and dietary requirements?',
      answer: 'Tell us when you enquire and we will confirm what the kitchen can do for your date. Where allergen information is not shown against a dish, see the menu or contact us for allergen information rather than assuming a dish is free from anything.'
    },
    {
      question: 'Do you do festive buffets?',
      answer: `Yes. Festive buffets are available for ${facts.buffetMinimumGuests} guests or more, and they suit standing receptions, quiz nights and team gatherings. Ask us to confirm the current selection and service timings for your date.`
    },
    {
      question: 'What if our group is bigger than 20?',
      answer: `More than ${facts.privateHireThreshold} guests is not a table booking, it is private hire. Email manager@the-anchor.pub, call ${CONTACT_PHONE} or send a WhatsApp to the same number and we will plan it with you.`
    },
    {
      question: 'How much does a Christmas party cost?',
      answer: 'Christmas dinner is priced per person by how many courses that guest has, and the prices are shown live on this page. Buffet and room setup costs vary by date and party size, so call us on 01753 682707 for a quote tailored to your group.'
    },
    {
      question: 'How can we keep the cost of our Christmas party down?',
      answer: 'Pick a Tuesday to Thursday date, keep it to one course each, agree a bar-tab limit up front and book early for the best choice of sittings. Because everyone chooses for themselves, guests who want more can add a starter or a dessert without the whole table paying for it. Free parking outside the ULEZ also saves your guests money compared with venues closer to London.'
    },
    {
      question: 'Are you close to Heathrow and Staines?',
      answer: "Yes, seven minutes from Heathrow Terminal 5, around eleven from Terminal 2 and eight minutes from Staines-upon-Thames. We're an easy-to-reach Christmas party venue for Ashford, Windsor, west London and the Heathrow villages."
    },
    {
      question: 'Can we have exclusive use of the whole pub?',
      answer: `Ask about exclusive hire when you enquire. Availability depends on your date, guest numbers, layout and planned entertainment. Christmas layouts can host up to ${facts.maxSeated} seated or ${facts.maxStanding} standing.`
    },
    {
      question: 'What entertainment can we have?',
      answer: 'Ask about playlists, DJs, live music, quizzes or karaoke. We will confirm what is suitable for your date, room and finishing time.'
    },
    {
      question: 'Is parking available?',
      answer: 'There are around 20 free spaces on site. Ask the team in advance if anyone needs to leave a vehicle overnight.'
    },
    {
      question: 'Is The Anchor outside the ULEZ zone?',
      answer: 'Yes, the pub is outside the ULEZ boundary and has around 20 free parking spaces on site. Guests should check their own route and current charging rules before travelling.'
    },
    {
      question: 'Can we book a Christmas party for just drinks, no food?',
      answer: 'Yes. Ask about a drinks-only area and an agreed bar tab. The 6-guest minimum and the pre-order rules apply to Christmas dinner, not to a drinks party.'
    },
    {
      question: 'Do you offer corporate Christmas party packages near Heathrow?',
      answer: "We do. Ask about VAT invoicing and the pre-order process for your team. We're around seven minutes from Heathrow T5 and two minutes from M25 J14, traffic dependent."
    },
    {
      question: 'Where is The Anchor for Christmas party guests?',
      answer: "We're on Horton Road in Stanwell Moor, Surrey, at TW19 6AQ. The pub is around seven minutes from Heathrow Terminal 5 and eight minutes from Staines-upon-Thames, traffic dependent, with around 20 free parking spaces on site."
    }
  ]
}

const WHY_BOOK_REASONS = [
  {
    icon: 'car' as const,
    title: 'Free On-Site Parking',
    description: 'Around 20 free spaces on site, with no parking fee while you visit. Ask the team in advance if anyone needs to leave a vehicle overnight.'
  },
  {
    icon: 'mapPin' as const,
    title: 'Near Heathrow Terminal 5',
    description: 'Around seven minutes from Heathrow Terminal 5 and two minutes from M25 Junction 14, traffic dependent. A practical meeting point for airport teams, business parks and hotels.'
  },
  {
    icon: 'shield' as const,
    title: 'Outside the ULEZ Zone',
    description: 'The pub is outside the ULEZ boundary and has around 20 free parking spaces. Guests should check their own route and current charging rules.'
  },
  {
    icon: 'users' as const,
    title: 'Private Spaces for Every Size',
    description: 'Choose an intimate dining room, the main bar for a larger group, or ask about full venue hire. Christmas layouts can host up to 60 seated or 200 standing.'
  },
  {
    icon: 'heart' as const,
    title: 'A Proper Village Pub Christmas',
    description: 'A village pub setting with warm hospitality, candlelit tables and space for a relaxed meal or lively party.'
  },
  {
    icon: 'briefcase' as const,
    title: 'Easy for Organisers',
    description: 'One clear contact for your booking, one deposit rule and a written confirmation of what your group is getting. Ask about VAT invoicing when you enquire.'
  }
]

const PARTY_IDEAS = [
  {
    title: 'Quiz Night Christmas Special',
    description: 'Ask whether a festive quiz can be arranged for your date, with food before or after.',
    ideal: 'Groups that enjoy friendly competition'
  },
  {
    title: 'Music Bingo Christmas Edition',
    description: 'Ask about a Christmas music bingo session and the formats available for your group.',
    ideal: 'Mixed groups who want something different and inclusive'
  },
  {
    title: 'Karaoke Christmas Party',
    description: 'Ask about a karaoke setup, suitable space and available finishing time for your date.',
    ideal: 'Office groups and friend circles who are not afraid of the mic'
  },
  {
    title: 'Live Band Christmas Celebration',
    description: 'Ask about hiring a live band or acoustic act for your party. We can discuss the performance area, suitable setup and available finishing time for your chosen date.',
    ideal: 'Groups looking for live entertainment'
  }
]

export function ChristmasPartiesPageClient({ structuredData, menu, season, facts }: ChristmasPartiesPageClientProps) {
  const [context, setContext] = useState<EnquiryContext>(DEFAULT_CONTEXT)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const enquiryRef = useRef<HTMLDivElement | null>(null)

  const seasonEnded = season.state === 'ended' || !season.isBookable
  const faqItems = useMemo(() => buildFaqItems(season, facts), [season, facts])

  useEffect(() => {
    setFormSubmitted(getLocalStorage(ENQUIRY_STORAGE_KEYS.submitted) === 'true')
  }, [])

  useEffect(() => {
    if (seasonEnded) return
    trackBannerEvent({
      id: 'christmas_seasonal_enquiry_banner',
      action: 'view',
      label: 'Seasonal Enquiry',
      campaign: 'christmas_2026'
    })
  }, [seasonEnded])

  const openDrawer = useCallback(() => {
    setDrawerOpen(true)
  }, [])

  const handleOpenForm = useCallback((
    mode: EnquiryMode,
    updates: Partial<EnquiryContext> = {},
    source = 'unknown'
  ) => {
    setContext(prev => ({
      ...prev,
      mode,
      source,
      service: updates.service ?? prev.service,
      courseTier: updates.courseTier ?? prev.courseTier,
      perks: updates.perks ?? prev.perks
    }))
    trackFormStart({
      formName: 'christmas_main_enquiry_form',
      mode,
      source,
      journey: mode === 'meal' ? 'christmas_meal' : 'christmas_party',
      meal_service: mode === 'meal' ? (updates.service ?? context.service) : undefined
    })
    requestAnimationFrame(() => {
      openDrawer()
    })
  }, [context.service, openDrawer])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleHeroOpenForm = (event: Event) => {
      const customEvent = event as CustomEvent<ChristmasOpenFormEventDetail>
      const mode = customEvent.detail?.mode ?? context.mode
      const source = customEvent.detail?.source || 'christmas_hero'
      handleOpenForm(mode, {}, source)
    }

    window.addEventListener(CHRISTMAS_OPEN_FORM_EVENT, handleHeroOpenForm as EventListener)
    return () => {
      window.removeEventListener(CHRISTMAS_OPEN_FORM_EVENT, handleHeroOpenForm as EventListener)
    }
  }, [context.mode, handleOpenForm])

  const handleContextChange = useCallback((updates: Partial<EnquiryContext>) => {
    setContext(prev => ({ ...prev, ...updates }))
  }, [])

  const handleFormSuccess = useCallback(() => {
    markLocalStorage(ENQUIRY_STORAGE_KEYS.submitted, 'true')
    setFormSubmitted(true)
  }, [])

  // Out of season the page must not imply a bookable Christmas offer. It stays
  // live because the URL is indexed and internally linked, but every dated
  // claim, price and enquiry route is replaced with evergreen private hire.
  if (seasonEnded) {
    return (
      <ChristmasSeasonEndedView season={season} structuredData={structuredData} />
    )
  }

  return (
    <>
      <Section className="py-2 md:py-3 bg-red-700 text-white">
        <Container>
          <div className="flex flex-col items-center justify-center gap-2 text-center md:flex-row md:gap-4">
            <Icon name="sparkles" className="h-5 w-5 shrink-0" />
            <p className="text-sm md:text-base font-semibold">
              {season.state === 'active'
                ? `Christmas dinner is being served now, ${season.windowLabel}. ${facts.minPartySize}+ guests, ${facts.minNoticeHours} hours notice, £${facts.depositPerPerson} per person deposit.`
                : `Christmas dinner ${season.windowLabel}. ${facts.minPartySize}+ guests, ${facts.minNoticeHours} hours notice, £${facts.depositPerPerson} per person deposit.`}
            </p>
          </div>
        </Container>
      </Section>

      {/* AEO answer block: the whole offer in plain English, with every number an
          answer engine or a hurried organiser needs, above the fold-ish. */}
      <Section background="transparent" spacing="md" className="bg-surface">
        <Container>
          <div className="mx-auto max-w-3xl space-y-5">
            <h2 className="text-3xl font-bold text-ink-strong">Christmas at The Anchor, in short</h2>
            <p className="text-base text-ink-muted">
              We serve Christmas dinner {season.windowLabel} at The Anchor in Stanwell Moor, around seven minutes from
              Heathrow Terminal 5. Every Christmas dinner booking is for {facts.minPartySize} guests or more, booked at
              least {facts.minNoticeHours} hours ahead, with a £{facts.depositPerPerson} per person deposit that comes off
              your bill. Everyone chooses their own courses: a main for each guest, with a starter and a dessert optional,
              so guests at the same table can have different numbers of courses. Choices come to us in advance. Festive
              buffets are available for {facts.buffetMinimumGuests} guests or more. The full dish list is released closer
              to the time.
            </p>
            <ul className="grid gap-3 text-sm text-ink-muted sm:grid-cols-2" aria-label="Christmas booking facts at a glance">
              <li className="rounded-xl bg-surface-sunk p-4"><strong className="block text-ink-strong">Dates</strong>{season.windowLabel}, the 20th included</li>
              <li className="rounded-xl bg-surface-sunk p-4"><strong className="block text-ink-strong">Group size</strong>{facts.minPartySize} guests or more</li>
              <li className="rounded-xl bg-surface-sunk p-4"><strong className="block text-ink-strong">Notice</strong>At least {facts.minNoticeHours} hours, no same-day bookings</li>
              <li className="rounded-xl bg-surface-sunk p-4"><strong className="block text-ink-strong">Deposit</strong>£{facts.depositPerPerson} per person, every booking, any size</li>
            </ul>
          </div>
        </Container>
      </Section>

      <Section background="transparent" spacing="md" className="bg-surface-sunk">
        <Container>
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="space-y-3 text-center">
              <Badge className="mx-auto w-fit bg-red-100 text-red-700">Christmas 2026 bookings</Badge>
              <h2 className="text-3xl font-bold text-ink-strong">What would you like to book?</h2>
              <p className="mx-auto max-w-3xl text-base text-ink-muted">
                Choose the option that fits your plans. We will confirm availability, prices and the next steps when we reply.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Card className="h-full border-2 border-red-600/20">
                <div className="flex h-full flex-col p-6 text-left">
                  <Icon name="gift" className="h-8 w-8 text-red-600" />
                  <h3 className="mt-4 text-2xl font-semibold text-ink-strong">Plan a Christmas party</h3>
                  <p className="mt-3 text-sm text-ink-muted">
                    Tell us about your group, preferred date and party style. Choose a private space, a drinks party, entertainment,
                    or a festive buffet for {facts.buffetMinimumGuests} or more guests.
                  </p>
                  <p className="mt-3 text-sm font-semibold text-accent-text">Christmas capacity: up to {facts.maxSeated} seated or {facts.maxStanding} standing.</p>
                  <Button
                    variant="primary"
                    size="lg"
                    className="mt-6 w-full sm:w-auto"
                    onClick={() => {
                      trackCtaClick({
                        id: 'christmas_journey_party',
                        label: 'Plan a Christmas party',
                        location: 'booking_choice',
                        destination: 'enquiry_form',
                        mode: 'party'
                      })
                      handleOpenForm('party', {}, 'booking_choice')
                    }}
                  >
                    Plan a Christmas party
                  </Button>
                </div>
              </Card>

              <Card className="h-full border-2 border-red-600/20">
                <div className="flex h-full flex-col p-6 text-left">
                  <Icon name="utensils" className="h-8 w-8 text-red-600" />
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <h3 className="text-2xl font-semibold text-ink-strong">Book Christmas lunch or dinner</h3>
                    <Badge className="w-fit bg-amber-100 text-amber-900">{facts.minPartySize}+ guests</Badge>
                  </div>
                  <p className="mt-3 text-sm text-ink-muted">
                    Book the sit-down Christmas menu for lunch or dinner. Each guest picks 1, 2 or 3 courses for themselves
                    and chooses their dishes in advance, so nobody is tied to what the rest of the table is having.
                  </p>
                  <p className="mt-3 text-sm font-semibold text-accent-text">
                    {facts.minPartySize} guests or more, at least {facts.minNoticeHours} hours notice, £{facts.depositPerPerson} per person deposit.
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    className="mt-6 w-full sm:w-auto"
                    onClick={() => {
                      trackCtaClick({
                        id: 'christmas_journey_meal',
                        label: 'Book Christmas lunch or dinner',
                        location: 'booking_choice',
                        destination: 'enquiry_form',
                        mode: 'meal'
                      })
                      handleOpenForm('meal', {}, 'booking_choice')
                    }}
                  >
                    Book lunch or dinner
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      <ChristmasMenuAndPricing
        menu={menu}
        season={season}
        facts={facts}
        onOpenForm={handleOpenForm}
      />

      {/* Booking rules, deliberately its own high-contrast block: these are the
          five facts every organiser is caught out by. */}
      <Section background="transparent" spacing="md" className="bg-surface-sunk">
        <Container>
          <div className="mx-auto max-w-3xl space-y-6">
            <h2 className="text-3xl font-bold text-ink-strong text-center">Christmas booking rules</h2>
            <div className="rounded-2xl border-2 border-red-600/30 bg-surface p-6 md:p-8">
              <ul className="space-y-4 text-sm md:text-base text-ink-muted">
                <li className="flex items-start gap-3">
                  <Icon name="users" className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <span><strong className="text-ink-strong">{facts.minPartySize} guests or more.</strong> Every Christmas dinner booking needs at least {facts.minPartySize} guests. Smaller groups are welcome from the regular menu.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="clock" className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <span><strong className="text-ink-strong">At least {facts.minNoticeHours} hours notice.</strong> We cannot take same-day Christmas bookings. The kitchen orders and preps to your numbers.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <span><strong className="text-ink-strong">£{facts.depositPerPerson} per person deposit.</strong> On every Christmas booking, whatever the size of the group. Taken at the time of booking, non-refundable, and deducted from your bill.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="utensils" className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <span><strong className="text-ink-strong">Courses are chosen per person.</strong> Every guest chooses a main. A starter and a dessert are optional, so guests at the same table can have different numbers of courses.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="utensils" className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <span><strong className="text-ink-strong">Choices come to us in advance.</strong> Every guest pre-orders their dishes, and we confirm the deadline with your booking.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="phone" className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <span><strong className="text-ink-strong">More than {facts.privateHireThreshold} guests is private hire.</strong> Not a table booking. Email <a href={CONTACT_EMAIL_LINK} className="underline decoration-dotted">{CONTACT_EMAIL}</a>, call or WhatsApp {CONTACT_PHONE} and we will plan it with you.</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="transparent" spacing="md" className="bg-surface">
        <Container>
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <Badge className="bg-red-100 text-red-700 w-fit">1, 2 or 3 courses each</Badge>
              <h2 className="text-3xl font-bold text-ink-strong">Sit-down Christmas lunch or dinner</h2>
              <p className="text-base sm:text-lg text-ink-muted">
                Choose a lunchtime or evening sitting for your group. When you enquire, we will confirm availability for your
                date, the prices and what happens next.
              </p>
              <p className="text-sm text-accent-text font-semibold">
                Everyone chooses their own courses: a main for each guest, with a starter and a dessert optional. Every guest
                pre-orders, and we will confirm the deadline for meal choices and dietary requirements.
              </p>
            </div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line">
              <Image
                src="/images/page-headers/christmas-parties/2026/hero-table.jpg"
                alt="A table laid for Christmas dinner at The Anchor near Heathrow"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={false}
              />
            </div>
          </div>
          <Grid cols={3} gap="md" className="mt-8">
            <Card className="h-full">
              <div className="p-5 space-y-2">
                <h3 className="font-semibold text-ink-strong">1. Choose your sitting</h3>
                <p className="text-sm text-ink-muted">Tell us lunch or dinner, your date, your guest count and roughly how many courses each guest wants.</p>
              </div>
            </Card>
            <Card className="h-full">
              <div className="p-5 space-y-2">
                <h3 className="font-semibold text-ink-strong">2. Confirm and pay the deposit</h3>
                <p className="text-sm text-ink-muted">We confirm the sitting and the price, then take the £{facts.depositPerPerson} per person deposit that comes off your bill.</p>
              </div>
            </Card>
            <Card className="h-full">
              <div className="p-5 space-y-2">
                <h3 className="font-semibold text-ink-strong">3. Send your pre-order</h3>
                <p className="text-sm text-ink-muted">Return each guest&apos;s courses and any dietary requirements by the deadline the team confirms. A main for everyone, starter and dessert optional.</p>
              </div>
            </Card>
          </Grid>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                trackCtaClick({
                  id: 'christmas_lunch_enquiry',
                  label: 'Enquire about Christmas lunch',
                  location: 'meal_process',
                  destination: 'enquiry_form',
                  mode: 'meal'
                })
                handleOpenForm('meal', { service: 'lunch' }, 'meal_process')
              }}
            >
              Enquire about lunch
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                trackCtaClick({
                  id: 'christmas_dinner_enquiry',
                  label: 'Enquire about Christmas dinner',
                  location: 'meal_process',
                  destination: 'enquiry_form',
                  mode: 'meal'
                })
                handleOpenForm('meal', { service: 'dinner' }, 'meal_process')
              }}
            >
              Enquire about dinner
            </Button>
          </div>
        </Container>
      </Section>

      <Section background="transparent" spacing="md" className="bg-surface-sunk">
        <Container>
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold text-ink-strong">Festive buffets for {facts.buffetMinimumGuests} or more guests</h2>
            <p className="text-ink-muted">
              A festive buffet works well for a standing reception, a quiz night or a team gathering. There are three festive
              buffet packages, and the minimum is {facts.buffetMinimumGuests} guests on all of them. Ask us to confirm the current
              selection, pricing and service timings for your date.
            </p>
          </div>

          <Grid cols={3} gap="md" className="mt-10">
            {[
              {
                title: 'Festive Sandwich & Salad',
                description: `A cold festive buffet for ${facts.buffetMinimumGuests} guests or more. Ask us for the current selection and dietary alternatives.`
              },
              {
                title: 'Festive Hot Finger',
                description: `A hot finger buffet for ${facts.buffetMinimumGuests} guests or more. Ask us for the current selection and service details.`
              },
              {
                title: 'Festive Premium Grazing',
                description: `A premium grazing spread for ${facts.buffetMinimumGuests} guests or more. Tell us the style of party and we will confirm what is available.`
              }
            ].map(tier => (
              <Card key={tier.title} className="h-full">
                <div className="p-6 space-y-3">
                  <Badge className="bg-red-100 text-red-700 w-fit">Festive buffet</Badge>
                  <h3 className="text-lg font-semibold text-ink-strong">{tier.title}</h3>
                  <p className="text-sm text-ink-muted">{tier.description}</p>
                </div>
              </Card>
            ))}
          </Grid>

          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="relative aspect-[4/3] w-full md:w-1/2 overflow-hidden rounded-2xl border border-line">
              <Image
                src="/images/events/christmas/christmas-buffet-table.jpg"
                alt="Festive buffet spread for Heathrow Christmas parties at The Anchor"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="md:w-1/2 space-y-4 text-left">
              <h3 className="text-2xl font-bold text-ink-strong">Ready to feed a crowd?</h3>
              <p className="text-sm text-ink-muted">
                Tell us your guest count, preferred date and party style. We will confirm the buffet options, pricing and any
                deposit before you commit.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  trackCtaClick({
                    id: 'christmas_buffet_cta',
                    label: `Plan a Buffet Party (${facts.buffetMinimumGuests}+)`,
                    location: 'buffet_section',
                    destination: 'enquiry_form',
                    mode: 'party'
                  })
                  handleOpenForm('party', {}, 'buffet_section')
                }}
              >
                Plan a Buffet Party ({facts.buffetMinimumGuests}+)
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="transparent" spacing="sm" className="bg-surface">
        <Container>
          <div className="mx-auto max-w-4xl space-y-4 text-center">
            <h2 className="text-2xl font-bold text-ink-strong">Christmas party venue minutes from Heathrow, Staines &amp; Surrey</h2>
            <p className="text-base text-ink-muted">
              The Anchor is around seven minutes from Heathrow Terminal 5, eleven minutes from Terminal 2 and eight minutes from
              Staines-upon-Thames, traffic dependent. Airport teams, local offices, families and friends can meet here without
              travelling into central London.
            </p>
            <p className="text-sm text-ink-muted">
              The pub is outside the ULEZ zone and has around 20 free parking spaces on site.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {[
                { href: '/staines-pub', label: 'Christmas parties from Staines-upon-Thames' },
                { href: '/ashford-pub', label: 'Ashford & Stanwell festive gatherings' },
                { href: '/windsor-pub', label: 'Windsor Christmas party ideas' },
                { href: '/heathrow-hotels-pub', label: 'Heathrow hotel teams & airport crews' }
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-muted transition hover:border-accent hover:text-accent-text"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section background="transparent" spacing="md" className="bg-surface-sunk">
        <Container>
          <Grid cols={3} gap="md">
            <Card className="h-full">
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-ink-strong">Private Dining Room</h3>
                <p className="text-sm text-ink-muted">Seat up to 26 guests with cosy decor and direct table service. Ideal for a Christmas lunch with family, an intimate works do or a small staff Christmas party away from the main bar.</p>
              </div>
            </Card>
            <Card className="h-full">
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-ink-strong">Main Bar &amp; Dining</h3>
                <p className="text-sm text-ink-muted">Flexible layouts for larger celebrations, sit-down dinners, buffet-style evenings or standing receptions. We will shape the room to fit your Christmas party, whether it is 30 or 60 guests.</p>
              </div>
            </Card>
            <Card className="h-full">
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-ink-strong">Light-filled Conservatory</h3>
                <p className="text-sm text-ink-muted">Bright, semi-private space perfect for welcome drinks, dessert stations or children&apos;s tables. Works beautifully for afternoon Christmas lunches when you want natural daylight.</p>
              </div>
            </Card>
          </Grid>
          <div className="mt-10 text-sm text-ink-muted text-center space-y-2">
            <p>Free on-site parking for around 20 cars &middot; Seven minutes from Heathrow Terminal 5 &middot; Eight minutes to Staines-upon-Thames &middot; Outside the ULEZ &middot; Sheltered smoking area</p>
            <p>
              Driving from farther afield?{' '}
              <Link href="/blog/cheap-heathrow-parking-alternatives" className="underline decoration-dotted hover:text-accent-text transition-colors">Read our cheap Heathrow parking guide</Link>{' '}
              or{' '}
              <Link href="/heathrow-parking" className="underline decoration-dotted hover:text-accent-text transition-colors">pre-book parking at The Anchor</Link>{' '}
              so your guests arrive stress-free.
            </p>
          </div>
        </Container>
      </Section>

      <Section background="transparent" spacing="md" className="bg-surface">
        <Container>
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-ink-strong">Why book your Christmas party at The Anchor?</h2>
              <p className="text-base text-ink-muted max-w-3xl mx-auto">
                Whether you are planning a staff Christmas party for airport colleagues, a festive lunch for the team or a
                Friday-night Christmas do with friends from Staines, The Anchor offers a traditional pub setting close to
                Heathrow with free parking and flexible spaces.
              </p>
            </div>
            <Grid cols={3} gap="md">
              {WHY_BOOK_REASONS.map(reason => (
                <Card key={reason.title} className="h-full">
                  <div className="p-6 space-y-3">
                    <Icon name={reason.icon} className="h-8 w-8 text-red-600" />
                    <h3 className="text-lg font-semibold text-ink-strong">{reason.title}</h3>
                    <p className="text-sm text-ink-muted">{reason.description}</p>
                  </div>
                </Card>
              ))}
            </Grid>
          </div>
        </Container>
      </Section>

      <Section background="transparent" spacing="md" className="bg-surface-sunk">
        <Container>
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <Badge className="bg-red-100 text-red-700 w-fit mx-auto">Corporate &amp; office parties</Badge>
              <h2 className="text-3xl font-bold text-ink-strong">Office Christmas party venue near Heathrow</h2>
              <p className="text-base text-ink-muted max-w-3xl mx-auto">
                Been tasked with organising the works Christmas do? You need somewhere everyone can get to, food that is
                actually good, and a bill that will not make finance wince. We have been hosting office Christmas parties for
                Heathrow businesses, Poyle teams and Surrey offices for years.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-ink-strong">Why offices choose us</h3>
                <ul className="space-y-3 text-sm text-ink-muted">
                  <li className="flex items-start gap-3">
                    <Icon name="check" className="mt-0.5 h-5 w-5 text-accent-text flex-shrink-0" />
                    <span><strong className="text-ink-strong">Central for distributed teams</strong>, seven minutes from Heathrow T5, two minutes off M25 J14. Colleagues from different offices, terminals or countries meet in one easy spot.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="check" className="mt-0.5 h-5 w-5 text-accent-text flex-shrink-0" />
                    <span><strong className="text-ink-strong">Corporate billing</strong>, ask about VAT invoices, deposit invoicing and agreed bar-tab options for your booking.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="check" className="mt-0.5 h-5 w-5 text-accent-text flex-shrink-0" />
                    <span><strong className="text-ink-strong">One clear pre-order process</strong>, we will explain how to collect each guest&apos;s courses and confirm them with the team. Nobody has to make the whole table order the same way.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="check" className="mt-0.5 h-5 w-5 text-accent-text flex-shrink-0" />
                    <span><strong className="text-ink-strong">Free parking and ULEZ-free</strong>, around 20 free spaces plus we are outside the ULEZ zone. No parking charges, no congestion fees.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="check" className="mt-0.5 h-5 w-5 text-accent-text flex-shrink-0" />
                    <span><strong className="text-ink-strong">One deposit rule</strong>, £{facts.depositPerPerson} per person on every Christmas booking, so finance can budget it before you send the invite.</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-ink-strong">Popular corporate setups</h3>
                <div className="space-y-4">
                  <div className="rounded-xl border border-line bg-surface-sunk p-5">
                    <h4 className="font-semibold text-ink-strong mb-1">Small team dinner ({facts.minPartySize} to 20)</h4>
                    <p className="text-sm text-ink-muted">Private dining room with the sit-down Christmas menu, each guest choosing 1, 2 or 3 courses. Popular with Poyle, Colnbrook and Heathrow business park teams.</p>
                  </div>
                  <div className="rounded-xl border border-line bg-surface-sunk p-5">
                    <h4 className="font-semibold text-ink-strong mb-1">Department celebration (21 to {facts.maxSeated})</h4>
                    <p className="text-sm text-ink-muted">Above {facts.privateHireThreshold} guests this becomes private hire rather than a table booking. Main bar configured for your group, buffet or sit-down. Add a quiz or Music Bingo for a memorable works Christmas do.</p>
                  </div>
                  <div className="rounded-xl border border-line bg-surface-sunk p-5">
                    <h4 className="font-semibold text-ink-strong mb-1">Full venue hire ({facts.maxSeated} to {facts.maxStanding})</h4>
                    <p className="text-sm text-ink-muted">Ask about exclusive use, suitable entertainment and the available finishing time for your chosen date.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="transparent" spacing="md" className="bg-surface">
        <Container>
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-ink-strong">Christmas party ideas at The Anchor</h2>
              <p className="text-base text-ink-muted max-w-3xl mx-auto">
                Not every Christmas do needs to be a standard sit-down meal. We can shape the celebration around your group.
                Here are a few ideas to discuss when you enquire.
              </p>
            </div>
            <Grid cols={2} gap="md">
              {PARTY_IDEAS.map(idea => (
                <Card key={idea.title} className="h-full">
                  <div className="p-6 space-y-3">
                    <h3 className="text-lg font-semibold text-ink-strong">{idea.title}</h3>
                    <p className="text-sm text-ink-muted">{idea.description}</p>
                    <p className="text-xs text-accent-text font-semibold">Best for: {idea.ideal}</p>
                  </div>
                </Card>
              ))}
            </Grid>
            <div className="text-center">
              <p className="text-sm text-ink-muted">
                Got something else in mind? Call us on {CONTACT_PHONE} or add it to your enquiry and we will confirm what is possible.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="transparent" spacing="sm" className="bg-surface">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border-2 border-red-600/30 bg-red-50/5 p-8 text-center space-y-4">
              <Icon name="clock" className="mx-auto h-10 w-10 text-red-600" />
              <h2 className="text-2xl font-bold text-ink-strong">Book early, December dates fill fast</h2>
              <p className="text-base text-ink-muted">
                Christmas dinner runs {season.windowLabel} and popular December dates fill quickly. Enquiring early gives us
                more options for your preferred date, sitting and space.
              </p>
              <p className="text-sm text-ink-muted">
                Not sure about exact numbers yet? Send an enquiry with your rough headcount and preferred week. Remember we need
                at least {facts.minNoticeHours} hours notice, and the £{facts.depositPerPerson} per person deposit secures the booking.
              </p>
              <div className="flex flex-col md:flex-row justify-center gap-4 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    trackCtaClick({
                      id: 'christmas_urgency_party',
                      label: 'Plan a Christmas party',
                      location: 'urgency_section',
                      destination: 'enquiry_form',
                      mode: 'party'
                    })
                    handleOpenForm('party', {}, 'urgency_section')
                  }}
                >
                  Enquire now, lock in your date
                </Button>
                <a
                  href={CONTACT_PHONE_LINK}
                  onClick={() => trackPhoneCallClick({ source: 'christmas_urgency', phone: CONTACT_PHONE })}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-line-strong px-6 py-3 text-sm font-semibold text-ink-muted hover:border-accent hover:text-accent-text transition"
                >
                  <Icon name="phone" className="h-4 w-4" /> Call {CONTACT_PHONE}
                </a>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="transparent" spacing="md" className="bg-surface-sunk">
        <Container>
          <FAQAccordionWithSchema
            title="Christmas Party FAQs"
            faqs={faqItems}
            className="bg-surface"
          />
        </Container>
      </Section>

      <Section className="py-20 bg-surface-sunk border-t border-line">
        <Container>
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold text-accent-text">Ready to plan your Christmas at The Anchor?</h2>
            <p className="text-lg text-ink-muted max-w-2xl mx-auto">
              Send your enquiry and the team will reply with availability and next steps. Need a quicker answer? Call us.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                className="w-full md:w-auto"
                onClick={() => {
                  trackCtaClick({
                    id: 'christmas_final_meal',
                    label: 'Book Christmas lunch or dinner',
                    location: 'final_cta_band',
                    destination: 'enquiry_form',
                    mode: 'meal'
                  })
                  handleOpenForm('meal', {}, 'final_cta')
                }}
              >
                Book lunch or dinner
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="w-full md:w-auto"
                onClick={() => {
                  trackCtaClick({
                    id: 'christmas_final_party',
                    label: 'Plan a Christmas party',
                    location: 'final_cta_band',
                    destination: 'enquiry_form',
                    mode: 'party'
                  })
                  handleOpenForm('party', {}, 'final_cta')
                }}
              >
                Plan a Christmas party
              </Button>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm">
              <a
                href={CONTACT_PHONE_LINK}
                onClick={() => {
                  trackCtaClick({
                    id: 'christmas_final_phone_prompt',
                    label: 'Call The Anchor',
                    location: 'final_cta_band',
                    destination: 'phone',
                    mode: context.mode
                  })
                  trackPhoneCallClick({ phone: CONTACT_PHONE, source: 'christmas_final_cta' })
                }}
                className="flex items-center gap-2 underline decoration-white/70 decoration-dotted"
              >
                <Icon name="phone" className="h-4 w-4 mr-2" /> Call {CONTACT_PHONE}
              </a>
              <a
                href={CONTACT_EMAIL_LINK}
                onClick={() => {
                  trackCtaClick({
                    id: 'christmas_final_email_prompt',
                    label: CONTACT_EMAIL,
                    location: 'final_cta_band',
                    destination: 'email',
                    mode: context.mode
                  })
                  trackEmailClick({ email: CONTACT_EMAIL, source: 'christmas_final_cta' })
                }}
                className="flex items-center gap-2 underline decoration-white/70 decoration-dotted"
              >
                <Icon name="mail" className="h-4 w-4 mr-2" /> {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="transparent" className="py-16 bg-canvas" id="christmas-enquiry" data-sticky-cta-guard="true">
        <Container>
          <div className="max-w-3xl mx-auto mb-6">
            <div className="mb-6">
              <ValueProofStrip variant="private-hire" />
            </div>
            <div className="mb-4">
              <RegretReduction variant="enquiry" />
            </div>
          </div>
          <div ref={enquiryRef} className="max-w-md mx-auto text-center">
            <p className="text-ink-muted mb-6">
              Tell us whether you are planning a Christmas party or a sit-down Christmas lunch or dinner. We will confirm
              availability, the prices and the next steps.
            </p>
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => handleOpenForm(context.mode, {}, 'inline_section')}
            >
              <span className="flex items-center gap-2">
                <Icon name="mail" className="h-5 w-5" />
                Open Enquiry Form
              </span>
            </Button>
          </div>
        </Container>
      </Section>

      <StickyDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Christmas Booking Enquiry"
        description={context.mode === 'meal'
          ? `Sit-down Christmas lunch or dinner, ${facts.minPartySize}+ guests, ${facts.minNoticeHours} hours notice`
          : 'Christmas parties, private spaces, drinks and buffets'}
        side="right"
        testId="christmas-enquiry-drawer"
      >
        <div className="p-3 sm:p-6">
          <ChristmasEnquiryForm
            context={context}
            season={season}
            facts={facts}
            onContextChange={handleContextChange}
            onSuccess={() => {
              handleFormSuccess()
            }}
          />
        </div>
      </StickyDrawer>

      <ChristmasLightbox
        suppressed={drawerOpen || formSubmitted}
        context={context}
        season={season}
        facts={facts}
        onContextChange={handleContextChange}
        onSubmitSuccess={handleFormSuccess}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(structuredData) }}
      />
    </>
  )
}

/**
 * Out-of-season view. No dates, no prices, no Christmas enquiry route, because
 * every one of them would be a claim we cannot honour until the next season is
 * confirmed. The page still answers the visitor's real question.
 */
function ChristmasSeasonEndedView({
  season,
  structuredData
}: {
  season: ChristmasSeasonView
  structuredData: Record<string, unknown>
}) {
  return (
    <>
      <Section background="transparent" spacing="md" className="bg-surface">
        <Container>
          <div className="mx-auto max-w-3xl space-y-6">
            <Alert variant="info" title="Christmas bookings are closed for this season">
              Our Christmas service ran {season.windowLabel} and has now finished. We are not taking Christmas bookings at the
              moment. Next season&apos;s dates, menu and prices will be published here once they are confirmed.
            </Alert>
            <h2 className="text-3xl font-bold text-ink-strong">What you can book right now</h2>
            <p className="text-base text-ink-muted">
              The Anchor in Stanwell Moor is around seven minutes from Heathrow Terminal 5, with around 20 free parking spaces
              and space for private parties all year round. Groups, celebrations and work gatherings are welcome outside the
              Christmas season.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/private-hire"
                className="rounded-2xl border border-line bg-surface-sunk p-5 transition hover:border-accent"
              >
                <h3 className="font-semibold text-ink-strong">Private hire and function room</h3>
                <p className="mt-2 text-sm text-ink-muted">Parties, celebrations and work gatherings all year round.</p>
              </Link>
              <Link
                href="/book-table"
                className="rounded-2xl border border-line bg-surface-sunk p-5 transition hover:border-accent"
              >
                <h3 className="font-semibold text-ink-strong">Book a table</h3>
                <p className="mt-2 text-sm text-ink-muted">Everyday food and drink bookings from the regular menu.</p>
              </Link>
              <Link
                href="/sunday-roast"
                className="rounded-2xl border border-line bg-surface-sunk p-5 transition hover:border-accent"
              >
                <h3 className="font-semibold text-ink-strong">Sunday roast</h3>
                <p className="mt-2 text-sm text-ink-muted">Walk in on Sundays, no booking and no pre-order needed.</p>
              </Link>
              <Link
                href="/whats-on"
                className="rounded-2xl border border-line bg-surface-sunk p-5 transition hover:border-accent"
              >
                <h3 className="font-semibold text-ink-strong">What&apos;s on</h3>
                <p className="mt-2 text-sm text-ink-muted">Quiz nights, music bingo and everything else in the diary.</p>
              </Link>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={CONTACT_PHONE_LINK}
                onClick={() => trackPhoneCallClick({ phone: CONTACT_PHONE, source: 'christmas_out_of_season' })}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line-strong px-6 py-3 text-sm font-semibold text-ink-muted transition hover:border-accent hover:text-accent-text"
              >
                <Icon name="phone" className="h-4 w-4" /> Call {CONTACT_PHONE}
              </a>
              <a
                href={CONTACT_EMAIL_LINK}
                onClick={() => trackEmailClick({ email: CONTACT_EMAIL, source: 'christmas_out_of_season' })}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line-strong px-6 py-3 text-sm font-semibold text-ink-muted transition hover:border-accent hover:text-accent-text"
              >
                <Icon name="mail" className="h-4 w-4" /> {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </Container>
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(structuredData) }}
      />
    </>
  )
}

function ChristmasDishList({ items }: { items: ChristmasDishView[] }) {
  if (items.length === 0) return null

  return (
    <ul className="mt-4 space-y-4">
      {items.map(item => (
        <li key={item.id} className="border-t border-line pt-4 first:border-t-0 first:pt-0">
          <div className="flex items-start justify-between gap-4">
            <h5 className="text-sm font-semibold text-ink-strong">{item.name}</h5>
            {/* Per-item prices are shown without a currency symbol, per the SSOT price display policy. */}
            {item.price && <span className="shrink-0 text-sm font-semibold text-accent-text">{item.price}</span>}
          </div>
          {item.description && <p className="mt-1 text-sm text-ink-muted">{item.description}</p>}
          <p className="mt-1 text-xs text-ink-muted">
            {item.allergenStatus === 'known'
              ? `Allergens: ${item.allergens.join(', ')}`
              : (item.allergenNotice || 'See menu or contact us for allergen information')}
          </p>
        </li>
      ))}
    </ul>
  )
}

/**
 * The Christmas menu and pricing section. Tier structure, inclusions and rules
 * are SSOT facts and always render. Dishes and prices are live from the
 * management database and render only when they exist, so the section is never
 * empty and never invents a dish or a price.
 */
function ChristmasMenuAndPricing({
  menu,
  season,
  facts,
  onOpenForm
}: {
  menu: ChristmasMenuView
  season: ChristmasSeasonView
  facts: ChristmasFactsView
  onOpenForm: (mode: EnquiryMode, updates?: Partial<EnquiryContext>, source?: string) => void
}) {
  return (
    <Section background="transparent" spacing="md" className="bg-surface" id="christmas-menu">
      <Container>
        <div className="mx-auto max-w-5xl space-y-4 text-center">
          <h2 className="text-3xl font-bold text-ink-strong">Christmas menu and prices</h2>
          <p className="text-base text-ink-muted">
            Each guest chooses 1, 2 or 3 courses for themselves, {season.windowLabel}. Prices are served live from our
            booking system, so what you see here is what you pay. The full dish list is released closer to the time.
          </p>
        </div>

        {/* Mobile: cards. Tablet and up: the same three price points as a table. */}
        <div className="mt-8 space-y-3 md:hidden">
          {menu.tiers.map(tier => (
            <article key={tier.id} className="rounded-2xl border border-line bg-surface p-5 text-left">
              <h3 className="font-semibold text-ink-strong">{tier.name}</h3>
              <p className="mt-2 text-sm font-semibold text-accent-text">{tierPriceLabel(tier)}</p>
              <p className="mt-1 text-sm text-ink-muted">
                {tier.kidsTierAvailable
                  ? `Kids portion available${tier.kidsPriceFrom ? `, from £${tier.kidsPriceFrom} per child` : ''}.`
                  : 'No kids portion and no kids price. Children may order this tier at the adult price.'}
              </p>
              {tier.dayRateVaries && (
                <p className="mt-1 text-sm text-ink-muted">Priced differently Tuesday to Thursday and Friday to Saturday.</p>
              )}
            </article>
          ))}
        </div>
        <div className="mt-8 hidden overflow-hidden rounded-2xl border border-line bg-surface md:block">
          <table className="w-full text-left text-sm text-ink-muted">
            <thead className="bg-surface-sunk text-ink-strong text-xs uppercase tracking-wide">
              <tr>
                <th scope="col" className="px-4 py-3">Courses per guest</th>
                <th scope="col" className="px-4 py-3">Price per person</th>
                <th scope="col" className="px-4 py-3">Children</th>
              </tr>
            </thead>
            <tbody>
              {menu.tiers.map(tier => (
                <tr key={tier.id} className="border-t border-line">
                  <th scope="row" className="px-4 py-4 text-left font-semibold text-ink-strong">{tier.name}</th>
                  <td className="px-4 py-4 font-semibold text-accent-text">
                    {tierPriceLabel(tier)}
                    {tier.dayRateVaries && (
                      <span className="block text-xs font-normal text-ink-muted">Tue-Thu and Fri-Sat priced differently</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {tier.kidsTierAvailable
                      ? `Kids portion${tier.kidsPriceFrom ? `, from £${tier.kidsPriceFrom}` : ''}`
                      : 'No kids portion or price, adult price applies'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-line px-4 py-4 text-sm text-ink-muted">
            Each guest picks their own number of courses and pays that rate, so one person can have three courses while the
            next has a main on its own. Every Christmas dinner booking is for {facts.minPartySize} guests or more, booked at
            least {facts.minNoticeHours} hours ahead, with a £{facts.depositPerPerson} per person deposit that comes off your
            bill. There is no kids 2 course and no kids 3 course: children are welcome on those tiers at the adult price.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card className="h-full">
            <div className="p-6 space-y-3">
              <h3 className="text-lg font-semibold text-ink-strong flex items-center gap-2">
                <Icon name="gift" className="h-5 w-5 text-red-600" />
                What is included
              </h3>
              <ul className="space-y-2 text-sm text-ink-muted">
                <li>Adults get a glass of prosecco whichever courses they choose, swappable for orange juice.</li>
                <li>Children get a Fruit Shoot or a small soft drink, either Coca-Cola, Diet Coke or lemonade, with the 1 course.</li>
                <li>Trimmings: {TRIMMINGS.join(', ').toLowerCase()}.</li>
              </ul>
            </div>
          </Card>
          <Card className="h-full">
            <div className="p-6 space-y-3">
              <h3 className="text-lg font-semibold text-ink-strong flex items-center gap-2">
                <Icon name="utensils" className="h-5 w-5 text-red-600" />
                Children on the Christmas menu
              </h3>
              <p className="text-sm text-ink-muted">
                There is a kids 1 course, with its own portion and its own price. There is no kids 2 course and no kids 3
                course, so no child portion and no child price exists for those tiers. Children are very welcome to order the
                adult 2 or 3 course, and it is charged at the adult price.
              </p>
            </div>
          </Card>
        </div>

        {menu.hasLiveDishes ? (
          <div className="mt-10 space-y-8">
            {menu.tiers.filter(tier => tier.items.length > 0).map(tier => (
              <div key={tier.id} className="rounded-2xl border border-line bg-surface p-6">
                <h4 className="text-lg font-semibold text-ink-strong">{tier.name}</h4>
                <ChristmasDishList items={tier.items} />
              </div>
            ))}
            {menu.extraSections.map(section => (
              <div key={section.id} className="rounded-2xl border border-line bg-surface p-6">
                <h4 className="text-lg font-semibold text-ink-strong">{section.title}</h4>
                {section.description && <p className="mt-1 text-sm text-ink-muted">{section.description}</p>}
                <ChristmasDishList items={section.items} />
              </div>
            ))}
          </div>
        ) : (
          <Card accent className="mx-auto mt-10 max-w-3xl">
            <div className="p-6 space-y-3">
              <h3 className="text-lg font-semibold text-ink-strong">The full menu is released closer to the time</h3>
              <p className="text-sm text-ink-muted">
                {menu.isUnavailable
                  ? 'The dish list is temporarily unavailable here. Call us and we will read you the current Christmas menu.'
                  : 'We are still finalising the Christmas dishes and will publish the full list here as soon as it is confirmed.'}{' '}
                The tier structure, the booking rules and the deposit above are confirmed and will not change.
              </p>
              <p className="text-sm text-ink-muted">
                Want it sent to you as soon as it lands? Send an enquiry or call{' '}
                <a href={CONTACT_PHONE_LINK} className="font-semibold text-accent-text underline">{CONTACT_PHONE}</a>.
              </p>
            </div>
          </Card>
        )}

        <div className="mt-8 flex flex-col items-center gap-3 md:flex-row md:justify-center">
          <Button
            variant="primary"
            size="md"
            className="w-full md:w-auto"
            onClick={() => {
              trackCtaClick({
                id: 'christmas_menu_meal',
                label: 'Book Christmas lunch or dinner',
                location: 'pricing_section',
                destination: 'enquiry_form',
                mode: 'meal'
              })
              onOpenForm('meal', {}, 'pricing_section')
            }}
          >
            Book lunch or dinner
          </Button>
          <Button
            variant="outline"
            size="md"
            className="w-full md:w-auto"
            onClick={() => {
              trackCtaClick({
                id: 'christmas_menu_party',
                label: 'Plan a Christmas party',
                location: 'pricing_section',
                destination: 'enquiry_form',
                mode: 'party'
              })
              onOpenForm('party', {}, 'pricing_section')
            }}
          >
            Plan a Christmas party
          </Button>
        </div>
      </Container>
    </Section>
  )
}

function ChristmasEnquiryForm({ context, season, facts, onContextChange, onSuccess }: ChristmasEnquiryFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [partySize, setPartySize] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('18:00')
  const [partyFormat, setPartyFormat] = useState('not_sure')
  const [notes, setNotes] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [xmasHoneypot, setXmasHoneypot] = useState('')
  const xmasFormLoadedAt = useRef(Date.now())

  const timeOptions = getTimeOptions(context)
  const formatOptions = useMemo(() => partyFormatOptions(facts.buffetMinimumGuests), [facts.buffetMinimumGuests])
  const minimumGuests = context.mode === 'party' && partyFormat === 'festive_buffet'
    ? facts.buffetMinimumGuests
    : facts.minPartySize

  useEffect(() => {
    if (timeOptions.some(option => option.value === preferredTime)) return
    setPreferredTime(timeOptions[0].value)
  }, [preferredTime, timeOptions])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim() || !email.trim() || !phone.trim() || !partySize.trim() || !preferredDate.trim()) {
      setStatus('error')
      setMessage('Please complete all required fields before sending your enquiry.')
      return
    }

    if (preferredDate < season.minEnquiryDate) {
      setStatus('error')
      setMessage(`We need at least ${facts.minNoticeHours} hours notice, so the earliest date we can take is ${season.minEnquiryDate}.`)
      return
    }

    if (!consent) {
      setStatus('error')
      setMessage('Please confirm we can contact you about your enquiry.')
      return
    }

    setStatus('idle')
    setMessage('')
    setSubmitting(true)

    try {
      const numericPartySize = Number.parseInt(partySize, 10)
      pushToDataLayer({
        event: 'form_submit',
        form_name: 'christmas_main_enquiry_form',
        form_source: context.source,
        form_mode: context.mode,
        form_journey: context.mode === 'meal' ? 'christmas_meal' : 'christmas_party',
        meal_service: context.mode === 'meal' ? context.service : undefined,
        course_tier: context.mode === 'meal' ? context.courseTier : undefined,
        party_format: context.mode === 'party' ? partyFormat : undefined,
        party_size: Number.isNaN(numericPartySize) ? undefined : numericPartySize
      })

      const response = await fetch('/api/enquiry/christmas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: context.mode,
          service: context.mode === 'meal' ? context.service : undefined,
          courseTier: context.mode === 'meal' ? context.courseTier : undefined,
          partyFormat: context.mode === 'party' ? partyFormat : undefined,
          source: context.source,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          partySize: partySize.trim(),
          preferredDate,
          preferredTime,
          perks: context.perks,
          notes,
          ...(xmasHoneypot ? { website: xmasHoneypot } : {}),
          _t: Math.floor((Date.now() - xmasFormLoadedAt.current) / 1000)
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage = errorData?.error || 'Sorry, we could not send your enquiry. Please call us on 01753 682707.'
        setStatus('error')
        setMessage(errorMessage)
        return
      }

      markLocalStorage(ENQUIRY_STORAGE_KEYS.submitted, 'true')
      trackFormComplete({
        formName: 'christmas_main_enquiry_form',
        source: context.source,
        mode: context.mode,
        journey: context.mode === 'meal' ? 'christmas_meal' : 'christmas_party',
        meal_service: context.mode === 'meal' ? context.service : undefined,
        party_format: context.mode === 'party' ? partyFormat : undefined,
        party_size: Number.isNaN(numericPartySize) ? undefined : numericPartySize
      })
      onSuccess()
      setStatus('success')
      setMessage('Thanks. The team will reply with availability and next steps.')
      setName('')
      setEmail('')
      setPhone('')
      setPartySize('')
      setPreferredDate('')
      setPreferredTime(context.mode === 'meal' && context.service === 'lunch' ? '12:00' : '18:00')
      setPartyFormat('not_sure')
      setNotes('')
      setConsent(false)
      onContextChange({ perks: [], courseTier: 'undecided' })
    } catch (error) {
      console.error('Christmas enquiry form submission failed:', error)
      setStatus('error')
      setMessage('Sorry, something went wrong while sending your enquiry. Please call us on 01753 682707.')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-6">
        <Alert variant="success" title="Enquiry sent">
          {message}
        </Alert>
        <p className="mt-4 text-sm text-ink-muted">You can now close this panel. We have recorded whether you asked about a party, lunch or dinner.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 sm:p-6">
      <h3 className="text-2xl font-bold text-ink-strong mb-2">Send your Christmas enquiry</h3>
      <p className="text-sm text-ink-muted">We will reply with availability, the prices and next steps.</p>
      <p className="text-sm text-ink-muted mb-6">Prefer email?{' '}<a href={CONTACT_EMAIL_LINK} className="underline decoration-dotted text-accent-text">{CONTACT_EMAIL}</a></p>

      {status === 'error' && (
        <Alert variant="error" className="mb-6" title="Please double-check">
          {message}
        </Alert>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Honeypot: hidden from people, checked server-side by checkSpamProtection. */}
        <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
          <label htmlFor="christmas-website">Leave this field empty</label>
          <input
            id="christmas-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={xmasHoneypot}
            onChange={event => setXmasHoneypot(event.target.value)}
          />
        </div>

        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-ink-muted">What are you planning? *</legend>
          <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            aria-pressed={context.mode === 'party'}
            className={`rounded-lg px-3 py-3 text-sm font-semibold border transition ${context.mode === 'party' ? 'bg-red-600 text-white border-red-600' : 'bg-surface-sunk text-ink-strong border-line hover:border-accent'}`}
            onClick={() => onContextChange({ mode: 'party' })}
          >
            Christmas party
          </button>
          <button
            type="button"
            aria-pressed={context.mode === 'meal'}
            className={`rounded-lg px-3 py-3 text-sm font-semibold border transition ${context.mode === 'meal' ? 'bg-red-600 text-white border-red-600' : 'bg-surface-sunk text-ink-strong border-line hover:border-accent'}`}
            onClick={() => onContextChange({ mode: 'meal' })}
          >
            Sit-down meal
          </button>
          </div>
        </fieldset>

        {context.mode === 'meal' ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
            <p className="text-sm font-semibold">
              {facts.minPartySize}+ guests, at least {facts.minNoticeHours} hours notice, £{facts.depositPerPerson} per person deposit.
            </p>
            <p className="mt-1 text-xs">
              Courses are chosen per person: a main for every guest, with a starter and a dessert optional. Every guest
              pre-orders, and we will confirm the deadline with you.
            </p>
            <fieldset className="mt-4">
              <legend className="mb-2 text-sm font-medium">Which sitting would you prefer? *</legend>
              <div className="grid grid-cols-2 gap-2">
                {(['lunch', 'dinner'] as MealService[]).map(service => (
                  <button
                    key={service}
                    type="button"
                    aria-pressed={context.service === service}
                    onClick={() => onContextChange({ service })}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold ${context.service === service ? 'border-red-600 bg-red-600 text-white' : 'border-amber-400 bg-white text-amber-950'}`}
                  >
                    {service === 'lunch' ? 'Christmas lunch' : 'Christmas dinner'}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="mt-4">
              <label htmlFor="christmas-course-tier" className="block text-sm font-medium">How many courses per guest?</label>
              <p className="mt-1 text-xs">A steer for the kitchen, not a commitment. Each guest picks their own courses when you pre-order.</p>
              <select
                id="christmas-course-tier"
                value={context.courseTier}
                onChange={event => onContextChange({ courseTier: event.target.value as CourseTier })}
                className="mt-1 w-full rounded-sm border-[1.5px] border-amber-400 bg-white px-3 py-2 text-sm text-amber-950 focus:border-anchor-gold-dark focus:outline-none focus:ring-4 focus:ring-anchor-gold-dark/10"
              >
                {COURSE_TIER_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="christmas-party-format" className="block text-sm font-medium text-ink-muted">Party style</label>
            <select
              id="christmas-party-format"
              value={partyFormat}
              onChange={event => setPartyFormat(event.target.value)}
              className="mt-1 w-full rounded-sm border-[1.5px] border-line-strong bg-surface px-3 py-2 text-sm text-ink-strong focus:border-anchor-gold-dark focus:outline-none focus:ring-4 focus:ring-anchor-gold-dark/10"
            >
              {formatOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="christmas-name" className="block text-sm font-medium text-ink-muted">Full name *</label>
            <input
              id="christmas-name"
              type="text"
              value={name}
              onChange={event => setName(event.target.value)}
              autoComplete="name"
              placeholder="Your full name"
              className="mt-1 w-full rounded-sm border-[1.5px] border-line-strong bg-surface px-3 py-2 text-sm text-ink-strong focus:border-anchor-gold-dark focus:outline-none focus:ring-4 focus:ring-anchor-gold-dark/10"
              required
            />
          </div>
          <div>
            <label htmlFor="christmas-email" className="block text-sm font-medium text-ink-muted">Email *</label>
            <input
              id="christmas-email"
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-1 w-full rounded-sm border-[1.5px] border-line-strong bg-surface px-3 py-2 text-sm text-ink-strong focus:border-anchor-gold-dark focus:outline-none focus:ring-4 focus:ring-anchor-gold-dark/10"
              required
            />
          </div>
          <div>
            <label htmlFor="christmas-phone" className="block text-sm font-medium text-ink-muted">Mobile *</label>
            <input
              id="christmas-phone"
              type="tel"
              value={phone}
              onChange={event => setPhone(event.target.value)}
              autoComplete="tel"
              inputMode="tel"
              placeholder="Best number for a quick call"
              className="mt-1 w-full rounded-sm border-[1.5px] border-line-strong bg-surface px-3 py-2 text-sm text-ink-strong focus:border-anchor-gold-dark focus:outline-none focus:ring-4 focus:ring-anchor-gold-dark/10"
              required
            />
          </div>
          <div>
            <label htmlFor="christmas-party-size" className="block text-sm font-medium text-ink-muted">Number of guests *</label>
            <input
              id="christmas-party-size"
              type="number"
              min={minimumGuests}
              max={context.mode === 'meal' ? facts.maxSeated : facts.maxStanding}
              value={partySize}
              onChange={event => setPartySize(event.target.value)}
              placeholder="e.g. 18"
              className="mt-1 w-full rounded-sm border-[1.5px] border-line-strong bg-surface px-3 py-2 text-sm text-ink-strong focus:border-anchor-gold-dark focus:outline-none focus:ring-4 focus:ring-anchor-gold-dark/10"
              required
            />
            <p className="mt-1 text-xs text-ink-muted">
              {context.mode === 'meal'
                ? `Christmas dinner needs ${facts.minPartySize} guests or more. Above ${facts.privateHireThreshold} it becomes private hire, so call or email us.`
                : `Festive buffets need ${facts.buffetMinimumGuests} guests or more.`}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="christmas-preferred-date" className="block text-sm font-medium text-ink-muted">Preferred date *</label>
            <input
              id="christmas-preferred-date"
              type="date"
              value={preferredDate}
              onChange={event => setPreferredDate(event.target.value)}
              min={season.minEnquiryDate}
              max={season.maxEnquiryDate}
              data-native-date-time="true"
              className="mt-1 block w-full min-w-0 max-w-full rounded-sm border-[1.5px] border-line-strong bg-surface px-3 py-2 text-sm text-ink-strong focus:border-anchor-gold-dark focus:outline-none focus:ring-4 focus:ring-anchor-gold-dark/10"
              required
            />
            <p className="mt-1 text-xs text-ink-muted">
              Christmas service runs {season.windowLabel}. We need at least {facts.minNoticeHours} hours notice, so today is not selectable.
            </p>
          </div>
          <div>
            <label htmlFor="christmas-preferred-time" className="block text-sm font-medium text-ink-muted">Preferred time *</label>
            <select
              id="christmas-preferred-time"
              value={preferredTime}
              onChange={event => setPreferredTime(event.target.value)}
              className="mt-1 w-full rounded-sm border-[1.5px] border-line-strong bg-surface px-3 py-2 text-sm text-ink-strong focus:border-anchor-gold-dark focus:outline-none focus:ring-4 focus:ring-anchor-gold-dark/10"
            >
              {timeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="christmas-notes" className="block text-sm font-medium text-ink-muted">Notes / dietary requests</label>
          <textarea
            id="christmas-notes"
            rows={4}
            value={notes}
            onChange={event => setNotes(event.target.value)}
            className="mt-1 w-full rounded-sm border-[1.5px] border-line-strong bg-surface px-3 py-2 text-sm text-ink-strong focus:border-anchor-gold-dark focus:outline-none focus:ring-4 focus:ring-anchor-gold-dark/10"
            placeholder={context.mode === 'meal' ? 'Share dietary requirements, allergies, accessibility needs or anything else we should know.' : 'Share entertainment ideas, room preferences, dietary needs or anything else we should know.'}
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-ink-muted">
          <input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-1" required />
          <span>I am happy for The Anchor to contact me about this enquiry.</span>
        </label>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <Button type="submit" variant="primary" size="lg" className="w-full md:w-auto" disabled={submitting}>
            {submitting ? 'Sending…' : context.mode === 'meal' ? 'Request my Christmas meal' : 'Plan my Christmas party'}
          </Button>
          <a
            href={CONTACT_PHONE_LINK}
            className="flex items-center gap-2 text-sm text-ink-muted underline decoration-dotted"
          >
            Prefer to chat? Call {CONTACT_PHONE}
          </a>
        </div>
      </form>
    </div>
  )
}

function ChristmasLightbox({ suppressed, context, season, facts, onContextChange, onSubmitSuccess }: ChristmasLightboxProps) {
  const [visible, setVisible] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [partySize, setPartySize] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [lbHoneypot, setLbHoneypot] = useState('')
  const lbFormLoadedAt = useRef(Date.now())
  const successTimeoutRef = useRef<number | null>(null)
  const lightboxRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) window.clearTimeout(successTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (suppressed) return
    const lastShown = Number(getLocalStorage(ENQUIRY_STORAGE_KEYS.lightbox) || 0)
    const now = Date.now()
    const sevenDays = 1000 * 60 * 60 * 24 * 7
    if (lastShown && now - lastShown < sevenDays) return

    const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
    let timeoutId: number | null = null

    const showLightbox = () => {
      setVisible(true)
      trackBannerEvent({
        id: 'christmas_seasonal_enquiry_lightbox',
        action: 'view',
        label: 'Seasonal Enquiry Lightbox',
        campaign: 'christmas_2026'
      })
      trackFormStart({
        formName: 'christmas_seasonal_enquiry_lightbox',
        source: 'lightbox',
        mode: context.mode,
        journey: context.mode === 'meal' ? 'christmas_meal' : 'christmas_party',
        meal_service: context.mode === 'meal' ? context.service : undefined
      })
      markLocalStorage(ENQUIRY_STORAGE_KEYS.lightbox, String(Date.now()))
    }

    const handleMouseLeave = (event: MouseEvent) => {
      if (event.clientY <= 0) {
        document.removeEventListener('mouseleave', handleMouseLeave)
        showLightbox()
      }
    }

    if (isDesktop) {
      document.addEventListener('mouseleave', handleMouseLeave)
      return () => document.removeEventListener('mouseleave', handleMouseLeave)
    }

    timeoutId = window.setTimeout(showLightbox, 35000)

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [context.mode, context.service, suppressed])

  const closeLightbox = useCallback(() => {
    trackBannerEvent({
      id: 'christmas_seasonal_enquiry_lightbox',
      action: 'dismiss',
      label: 'Seasonal Enquiry Lightbox',
      campaign: 'christmas_2026'
    })
    setVisible(false)
  }, [])

  useEffect(() => {
    if (!visible) return

    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox()
        return
      }

      if (event.key !== 'Tab' || !lightboxRef.current) return
      const focusable = Array.from(lightboxRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]'
      ))
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [closeLightbox, visible])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim() || !email.trim() || !phone.trim() || !partySize.trim() || !preferredDate.trim()) {
      setError('Please fill in all fields so we can confirm availability and prices.')
      return
    }

    if (preferredDate < season.minEnquiryDate) {
      setError(`We need at least ${facts.minNoticeHours} hours notice, so the earliest date we can take is ${season.minEnquiryDate}.`)
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      const numericPartySize = Number.parseInt(partySize, 10)
      pushToDataLayer({
        event: 'form_submit',
        form_name: 'christmas_seasonal_enquiry_lightbox',
        form_source: 'lightbox',
        form_mode: context.mode,
        form_journey: context.mode === 'meal' ? 'christmas_meal' : 'christmas_party',
        meal_service: context.mode === 'meal' ? context.service : undefined,
        party_format: context.mode === 'party' ? 'not_sure' : undefined,
        party_size: Number.isNaN(numericPartySize) ? undefined : numericPartySize
      })

      const response = await fetch('/api/enquiry/christmas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: context.mode,
          service: context.mode === 'meal' ? context.service : undefined,
          courseTier: context.mode === 'meal' ? context.courseTier : undefined,
          partyFormat: context.mode === 'party' ? 'not_sure' : undefined,
          source: 'lightbox',
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          partySize: partySize.trim(),
          preferredDate,
          preferredTime: 'Flexible',
          perks: union(context.perks, ['current-pricing']),
          notes: 'Submitted via seasonal enquiry lightbox',
          ...(lbHoneypot ? { website: lbHoneypot } : {}),
          _t: Math.floor((Date.now() - lbFormLoadedAt.current) / 1000)
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage = errorData?.error || 'Sorry, we could not send your enquiry right now. Please call us on 01753 682707.'
        setError(errorMessage)
        return
      }

      markLocalStorage(ENQUIRY_STORAGE_KEYS.submitted, 'true')
      trackFormComplete({
        formName: 'christmas_seasonal_enquiry_lightbox',
        source: 'lightbox',
        mode: context.mode,
        journey: context.mode === 'meal' ? 'christmas_meal' : 'christmas_party',
        meal_service: context.mode === 'meal' ? context.service : undefined,
        party_format: context.mode === 'party' ? 'not_sure' : undefined,
        party_size: Number.isNaN(numericPartySize) ? undefined : numericPartySize
      })
      setSubmitted(true)
      setName('')
      setEmail('')
      setPhone('')
      setPartySize('')
      setPreferredDate('')
      successTimeoutRef.current = window.setTimeout(() => {
        onSubmitSuccess()
        setVisible(false)
        setSubmitted(false)
      }, 2500)
    } catch (err) {
      console.error('Christmas lightbox submission failed:', err)
      setError('Sorry, something went wrong. Please call us on 01753 682707 and we will take your enquiry over the phone.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-4 sm:py-6">
      <div
        ref={lightboxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="christmas-lightbox-title"
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-2xl border border-line bg-surface p-4 shadow-xl sm:max-h-[calc(100dvh-3rem)] sm:p-6"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={closeLightbox}
          className="absolute right-4 top-4 text-ink-strong/50 hover:text-ink-strong"
          aria-label="Close"
        >
          <Icon name="close" className="h-5 w-5" />
        </button>
        <div className="space-y-4">
          <Badge className="bg-red-100 text-red-700 w-fit">Christmas enquiry</Badge>
          <h3 id="christmas-lightbox-title" className="pr-8 text-2xl font-bold text-ink-strong">Planning Christmas with us?</h3>
          <p className="text-sm text-ink-muted">
            Share a few details and we will confirm availability and the price for your group. {facts.minPartySize}+ guests,
            at least {facts.minNoticeHours} hours notice, £{facts.depositPerPerson} per person deposit.
          </p>

          {submitted && (
            <Alert variant="success" title="Enquiry sent" className="text-sm">
              Thanks. The team will reply with availability and next steps.
            </Alert>
          )}

          {error && !submitted && (
            <Alert variant="error" title="Almost there" className="text-sm">
              {error}
            </Alert>
          )}

          {!submitted && <form className="space-y-3" onSubmit={handleSubmit}>
            {/* Honeypot: hidden from people, checked server-side by checkSpamProtection. */}
            <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
              <label htmlFor="christmas-lightbox-website">Leave this field empty</label>
              <input
                id="christmas-lightbox-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={lbHoneypot}
                onChange={event => setLbHoneypot(event.target.value)}
              />
            </div>
            <input
              type="text"
              aria-label="Full name"
              placeholder="Full name"
              value={name}
              onChange={event => setName(event.target.value)}
              autoComplete="name"
              className="w-full rounded-sm border-[1.5px] border-line-strong bg-surface px-3 py-2 text-sm text-ink-strong focus:border-anchor-gold-dark focus:outline-none focus:ring-4 focus:ring-anchor-gold-dark/10"
              required
            />
            <input
              type="email"
              aria-label="Email"
              placeholder="Email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              autoComplete="email"
              className="w-full rounded-sm border-[1.5px] border-line-strong bg-surface px-3 py-2 text-sm text-ink-strong focus:border-anchor-gold-dark focus:outline-none focus:ring-4 focus:ring-anchor-gold-dark/10"
              required
            />
            <input
              type="tel"
              aria-label="Mobile"
              placeholder="Mobile"
              value={phone}
              onChange={event => setPhone(event.target.value)}
              autoComplete="tel"
              inputMode="tel"
              className="w-full rounded-sm border-[1.5px] border-line-strong bg-surface px-3 py-2 text-sm text-ink-strong focus:border-anchor-gold-dark focus:outline-none focus:ring-4 focus:ring-anchor-gold-dark/10"
              required
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="number"
                aria-label="Number of guests"
                min={facts.minPartySize}
                max={context.mode === 'meal' ? facts.maxSeated : facts.maxStanding}
                placeholder="Number of guests"
                value={partySize}
                onChange={event => setPartySize(event.target.value)}
                className="min-w-0 w-full rounded-sm border-[1.5px] border-line-strong bg-surface px-3 py-2 text-sm text-ink-strong focus:border-anchor-gold-dark focus:outline-none focus:ring-4 focus:ring-anchor-gold-dark/10"
                required
              />
              <input
                type="date"
                aria-label="Preferred date"
                value={preferredDate}
                onChange={event => setPreferredDate(event.target.value)}
                min={season.minEnquiryDate}
                max={season.maxEnquiryDate}
                data-native-date-time="true"
                className="block w-full min-w-0 max-w-full rounded-sm border-[1.5px] border-line-strong bg-surface px-3 py-2 text-sm text-ink-strong focus:border-anchor-gold-dark focus:outline-none focus:ring-4 focus:ring-anchor-gold-dark/10"
                required
              />
            </div>
            <div className="flex gap-2">
              {(['party', 'meal'] as EnquiryMode[]).map(mode => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={context.mode === mode}
                  onClick={() => onContextChange({ mode })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${context.mode === mode ? 'bg-red-600 text-white border-red-600' : 'bg-surface-sunk text-ink-strong border-line-strong'}`}
                >
                  {mode === 'party' ? 'Christmas party' : 'Lunch or dinner'}
                </button>
              ))}
            </div>
            {context.mode === 'meal' && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
                <p className="text-xs font-semibold text-amber-950">
                  Courses are chosen per person. A main each, starter and dessert optional.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(['lunch', 'dinner'] as MealService[]).map(service => (
                    <button
                      key={service}
                      type="button"
                      aria-pressed={context.service === service}
                      onClick={() => onContextChange({ service })}
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold ${context.service === service ? 'border-red-600 bg-red-600 text-white' : 'border-amber-400 bg-white text-amber-950'}`}
                    >
                      {service === 'lunch' ? 'Lunch' : 'Dinner'}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="primary" size="md" className="w-full" disabled={submitting}>{submitting ? 'Sending…' : 'Send my request'}</Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    trackPhoneCallClick({ phone: CONTACT_PHONE, source: 'christmas_lightbox' })
                    window.location.href = CONTACT_PHONE_LINK
                  }
                  setVisible(false)
                }}
              >
                Call us instead
              </Button>
            </div>
          </form>}
        </div>
      </div>
    </div>
  )
}
