'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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

interface EnquiryContext {
  mode: EnquiryMode
  service: MealService
  source: string
  extras: string[]
  perks: string[]
}

const DEFAULT_CONTEXT: EnquiryContext = {
  mode: 'party',
  service: 'lunch',
  source: 'page_default',
  extras: [],
  perks: []
}

interface ChristmasPartiesPageClientProps {
  structuredData: Record<string, unknown>
}

interface ChristmasEnquiryFormProps {
  context: EnquiryContext
  onContextChange: (updates: Partial<EnquiryContext>) => void
  onSuccess: () => void
}

interface ChristmasLightboxProps {
  suppressed: boolean
  context: EnquiryContext
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

const CHRISTMAS_BOOKING_START = '2026-11-01'
const CHRISTMAS_BOOKING_END = '2026-12-23'

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

const PARTY_FORMAT_OPTIONS = [
  { value: 'not_sure', label: 'Not sure yet' },
  { value: 'shared_party', label: 'Shared Christmas party night' },
  { value: 'private_space', label: 'Private space' },
  { value: 'festive_buffet', label: 'Festive buffet (26+)' },
  { value: 'drinks_party', label: 'Drinks party' },
  { value: 'entertainment', label: 'Entertainment package' }
] as const

const getTimeOptions = (context: EnquiryContext): TimeOption[] => {
  if (context.mode === 'party') return PARTY_TIME_OPTIONS
  return context.service === 'lunch' ? LUNCH_TIME_OPTIONS : DINNER_TIME_OPTIONS
}

const PERK_OPTIONS = [
  { id: 'current-pricing', label: 'Current pricing: Ask us to confirm live menu pricing and any seasonal options' },
  { id: 'mid-week', label: 'Menu help: We can explain the current festive menu and pre-order process' }
]

const FESTIVE_PRICING = [
  {
    tier: 'Sit-down Christmas lunch or dinner',
    price: 'Current pricing',
    includes: 'A pre-order festive menu for groups of six or more. Ask us to confirm the current menu, available sittings and pricing for your date.'
  },
  {
    tier: 'Private Christmas party',
    price: 'Quote on enquiry',
    includes: 'Private dining room or main bar layout, with space for DJs or live entertainment by arrangement. Ask us to confirm available finishing times for your date.'
  },
  {
    tier: 'Festive buffets (26+ guests)',
    price: 'Current pricing',
    includes: 'Festive buffet tiers are priced from the current approved source. Great for standing receptions and team gatherings.'
  }
]

const FAQ_ITEMS = [
  {
    question: "How much does a Christmas party cost?",
    answer: "Festive menu and buffet prices are confirmed from the current approved source. Room hire and setup options vary by date and party size. Call us on 01753 682707 for a quote tailored to your group."
  },
  {
    question: "Are there seasonal offers?",
    answer: "Ask about current seasonal options when you enquire. We will only confirm offers that are live for your booking date."
  },
  {
    question: "Is there a minimum group size?",
    answer: "Our festive menu is available for Christmas parties of six or more. Smaller groups are welcome to join us from the a la carte menu."
  },
  {
    question: "Are you close to Heathrow and Staines?",
    answer: "Yes, seven minutes from Heathrow Terminal 5, around eleven from Terminal 2 and eight minutes from Staines-upon-Thames. We're an easy-to-reach Christmas party venue for Ashford, Windsor, west London and the Heathrow villages."
  },
  {
    question: "Can we bring our own food?",
    answer: "Ask us before bringing any food or drink from outside. We will confirm what is possible for your booking."
  },
  {
    question: "Can you run a bar tab for our group?",
    answer: "Ask us about setting an agreed bar-tab limit and the billing options available for your booking."
  },
  {
    question: "How do guests travel from Heathrow hotels or terminals?",
    answer: "The pub is around seven minutes from Heathrow Terminal 5 and eleven minutes from Terminal 2, traffic dependent. Share our postcode, TW19 6AQ, so guests can check a live route and fare."
  },
  {
    question: "What entertainment can we have?",
    answer: "Ask about playlists, DJs, live music, quizzes or karaoke. We will confirm what is suitable for your date, room and finishing time."
  },
  {
    question: "Is parking available?",
    answer: "There are around 20 free spaces on site. Ask the team in advance if anyone needs to leave a vehicle overnight."
  },
  {
    question: "How do you handle dietary requests?",
    answer: "Vegetarian, vegan, gluten-free and other dietary requirements are happily accommodated. Include the details on your pre-order so the kitchen can prepare suitable alternatives."
  },
  {
    question: "What is a shared Christmas party night?",
    answer: "A shared party night gives your group its own table while other groups celebrate in the pub at the same time. Ask whether this format is available on your preferred date."
  },
  {
    question: "Can we have exclusive use of the whole pub?",
    answer: "Ask about exclusive hire when you enquire. Availability depends on your date, guest numbers, layout and planned entertainment. Christmas layouts can host up to 60 seated or 200 standing."
  },
  {
    question: "Do you offer corporate Christmas party packages near Heathrow?",
    answer: "We do. Ask about VAT invoicing and the pre-order process for your team. We're around seven minutes from Heathrow T5 and two minutes from M25 J14, traffic dependent."
  },
  {
    question: "Can we book a Christmas party for just drinks, no food?",
    answer: "Ask about a drinks-only area and an agreed bar tab. We will confirm suitable spaces and any food options for your date."
  },
  {
    question: "What time do Christmas parties start and finish?",
    answer: "Choose a preferred time in the enquiry form. We will confirm the available start and finishing times for your date and party format."
  },
  {
    question: "Is The Anchor outside the ULEZ zone?",
    answer: "Yes, the pub is outside the ULEZ boundary and has around 20 free parking spaces on site. Guests should check their own route and current charging rules before travelling."
  },
  {
    question: "Can we book a Christmas lunch instead of dinner?",
    answer: "Yes. Sit-down Christmas lunches and dinners are available by pre-order only. Tell us your preferred date, sitting, guest count and dietary needs when you enquire."
  },
  {
    question: "What's the difference between a Christmas do and a shared party night?",
    answer: "A Christmas do can be any festive celebration. A shared party night is one format where your group has its own table while other parties use the venue too."
  },
  {
    question: "Do you serve a festive menu outside of party bookings?",
    answer: "The sit-down festive menu is available by pre-order for groups of six or more during the confirmed Christmas service window. Ask about other dining options for a smaller group."
  },
  {
    question: "Where is The Anchor for Christmas party guests?",
    answer: "We're on Horton Road in Stanwell Moor, Surrey, at TW19 6AQ. The pub is around seven minutes from Heathrow Terminal 5 and eight minutes from Staines-upon-Thames, traffic dependent, with around 20 free parking spaces on site."
  }
]

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
    description: 'A clear pre-order process and one contact for your booking. Ask about VAT invoicing when you enquire.'
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
    ideal: 'Office groups and friend circles who aren\'t afraid of the mic'
  },
  {
    title: 'Live Band Christmas Celebration',
    description: 'Ask about hiring a live band or acoustic act for your party. We can discuss the performance area, suitable setup and available finishing time for your chosen date.',
    ideal: 'Groups looking for live entertainment'
  }
]

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

export function ChristmasPartiesPageClient({ structuredData }: ChristmasPartiesPageClientProps) {
  const [context, setContext] = useState<EnquiryContext>(DEFAULT_CONTEXT)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [perkNotice, setPerkNotice] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const enquiryRef = useRef<HTMLDivElement | null>(null)
  const perkTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    setFormSubmitted(getLocalStorage(ENQUIRY_STORAGE_KEYS.submitted) === 'true')

    return () => {
      if (perkTimeoutRef.current) {
        window.clearTimeout(perkTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    trackBannerEvent({
      id: 'christmas_seasonal_enquiry_banner',
      action: 'view',
      label: 'Seasonal Enquiry',
      campaign: 'christmas_2026'
    })
  }, [])

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
      extras: updates.extras ?? prev.extras,
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

  const handleAddCurrentPricing = () => {
    trackBannerEvent({
      id: 'christmas_seasonal_enquiry_banner',
      action: 'click',
      label: 'Seasonal Enquiry',
      campaign: 'christmas_2026'
    })
    trackCtaClick({
      id: 'christmas_current_pricing_cta',
      label: 'Ask about current pricing',
      location: 'seasonal_enquiry_banner',
      destination: 'enquiry_form',
      mode: 'meal'
    })
    const updatedPerks = union(context.perks, ['current-pricing'])
    setContext(prev => ({ ...prev, perks: updatedPerks, mode: 'meal' }))
    handleOpenForm('meal', { perks: ['current-pricing'] }, 'current_pricing_request')
    setPerkNotice(true)
    if (typeof window !== 'undefined') {
      if (perkTimeoutRef.current) {
        window.clearTimeout(perkTimeoutRef.current)
      }
      perkTimeoutRef.current = window.setTimeout(() => setPerkNotice(false), 4000)
    }
  }

  return (
    <>
      <Section className="py-2 md:py-3 bg-red-700 text-white">
        <Container>
          <div className="flex flex-col items-center justify-center gap-3 text-center md:flex-row md:gap-6">
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex items-center gap-2">
                <Icon name="sparkles" className="h-5 w-5" />
                <p className="text-sm md:text-base font-semibold">
                  Ask us to confirm current festive menu pricing and any live seasonal options for your date.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="text-white text-sm underline decoration-dotted"
              onClick={handleAddCurrentPricing}
            >
              See details
            </button>
          </div>
        </Container>
      </Section>

      <Section background="transparent" spacing="md" className="bg-surface">
        <Container>
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="space-y-3 text-center">
              <Badge className="mx-auto w-fit bg-red-100 text-red-700">Christmas 2026 bookings</Badge>
              <h2 className="text-3xl font-bold text-ink-strong">What would you like to book?</h2>
              <p className="mx-auto max-w-3xl text-base text-ink-muted">
                Choose the option that best fits your plans. We will confirm availability, current pricing and the next steps when we reply.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Card className="h-full border-2 border-red-600/20">
                <div className="flex h-full flex-col p-6 text-left">
                  <Icon name="gift" className="h-8 w-8 text-red-600" />
                  <h3 className="mt-4 text-2xl font-semibold text-ink-strong">Plan a Christmas party</h3>
                  <p className="mt-3 text-sm text-ink-muted">
                    Tell us about your group, preferred date and party style. Choose a shared night, private space, drinks party or festive buffet for 26 or more guests.
                  </p>
                  <p className="mt-3 text-sm font-semibold text-accent-text">Christmas capacity: up to 60 seated or 200 standing.</p>
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
                    <Badge className="w-fit bg-amber-100 text-amber-900">Pre-order only</Badge>
                  </div>
                  <p className="mt-3 text-sm text-ink-muted">
                    Book our sit-down festive menu for lunch or dinner. Every guest chooses their meal in advance, and we will confirm the pre-order deadline with your booking.
                  </p>
                  <p className="mt-3 text-sm font-semibold text-accent-text">Available for groups of six or more, with a £10 per person non-refundable deposit.</p>
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

            <ul className="grid gap-3 text-sm text-ink-muted sm:grid-cols-2 lg:grid-cols-4" aria-label="Christmas booking facts">
              <li className="rounded-xl bg-surface-sunk p-4"><strong className="block text-ink-strong">Free parking</strong>Around 20 spaces on site</li>
              <li className="rounded-xl bg-surface-sunk p-4"><strong className="block text-ink-strong">Near Heathrow</strong>Around seven minutes from T5</li>
              <li className="rounded-xl bg-surface-sunk p-4"><strong className="block text-ink-strong">Christmas meals</strong>Lunch and dinner, pre-order only</li>
              <li className="rounded-xl bg-surface-sunk p-4"><strong className="block text-ink-strong">Current pricing</strong>Confirmed when you enquire</li>
            </ul>
          </div>
        </Container>
      </Section>

      <Section background="transparent" spacing="md" className="bg-surface-sunk">
        <Container>
          <div className="mx-auto max-w-5xl space-y-4 text-center">
            <h2 className="text-3xl font-bold text-ink-strong">2026 Christmas party packages &amp; pricing</h2>
            <p className="text-base text-ink-muted">
              Whether you're after a shared Christmas party night, a private festive meal or a buffet for the whole department, ask us to confirm the current per-person pricing and any room costs for your preferred date.
            </p>
          </div>
          <div className="mt-8 space-y-3 md:hidden">
            {FESTIVE_PRICING.map(row => (
              <article key={row.tier} className="rounded-2xl border border-line bg-surface p-5 text-left">
                <h3 className="font-semibold text-ink-strong">{row.tier}</h3>
                <p className="mt-2 text-sm font-semibold text-accent-text">{row.price}</p>
                <p className="mt-3 text-sm text-ink-muted">{row.includes}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 hidden overflow-hidden rounded-2xl border border-line bg-surface md:block">
            <table className="w-full text-left text-sm text-ink-muted">
              <thead className="bg-surface-sunk text-ink-strong text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">Package</th>
                  <th className="px-4 py-3">Pricing</th>
                  <th className="px-4 py-3">What&apos;s included</th>
                </tr>
              </thead>
              <tbody>
                {FESTIVE_PRICING.map(row => (
                  <tr key={row.tier} className="border-t border-line">
                    <td className="px-4 py-4 font-semibold text-ink-strong">{row.tier}</td>
                    <td className="px-4 py-4 text-accent-text font-semibold">{row.price}</td>
                    <td className="px-4 py-4">{row.includes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-col items-center gap-3 md:flex-row md:justify-center">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                trackCtaClick({
                  id: 'christmas_pricing_meal',
                  label: 'Book Christmas lunch or dinner',
                  location: 'pricing_table',
                  destination: 'enquiry_form',
                  mode: 'meal'
                })
                handleOpenForm('meal', {}, 'pricing_table')
              }}
              className="w-full md:w-auto"
            >
              Book lunch or dinner
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                trackCtaClick({
                  id: 'christmas_pricing_party',
                  label: 'Plan a Christmas party',
                  location: 'pricing_table',
                  destination: 'enquiry_form',
                  mode: 'party'
                })
                handleOpenForm('party', {}, 'pricing_table')
              }}
              className="w-full md:w-auto"
            >
              Plan a Christmas party
            </Button>
          </div>
        </Container>
      </Section>

      <Section background="transparent" spacing="sm" className="bg-surface">
        <Container>
          <div className="mx-auto max-w-4xl space-y-4 text-center">
            <h2 className="text-2xl font-bold text-ink-strong">Christmas party venue minutes from Heathrow, Staines &amp; Surrey</h2>
            <p className="text-base text-ink-muted">
              The Anchor is around seven minutes from Heathrow Terminal 5, eleven minutes from Terminal 2 and eight minutes from Staines-upon-Thames, traffic dependent. Airport teams, local offices, families and friends can meet here without travelling into central London.
            </p>
            <p className="text-sm text-ink-muted">
              Ask for current festive pricing when you enquire. We will confirm the menu, room setup and any live seasonal options before you book. The pub is outside the ULEZ zone and has around 20 free parking spaces on site.
            </p>
          </div>
        </Container>
      </Section>

      <Section background="transparent" spacing="sm" className="bg-surface">
        <Container>
          <div className="mx-auto max-w-4xl text-center space-y-5">
            <h3 className="text-xl font-semibold text-ink-strong">Planning from a nearby town?</h3>
            <p className="text-sm text-ink-muted">
              We welcome festive groups from across Surrey and west London every December. Browse our local guides, then send your enquiry.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
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
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold text-ink-strong">Christmas menu options at a glance</h2>
            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              <table className="w-full text-left text-sm md:text-base text-ink-muted">
                <tbody>
                  <tr className="border-b border-line bg-surface-sunk">
                    <th className="px-4 py-4 font-semibold text-ink-strong">Tue-Thu</th>
                    <td className="px-4 py-4 font-bold text-accent-text">Current pricing</td>
                  </tr>
                  <tr className="border-b border-line">
                    <th className="px-4 py-4 font-semibold text-ink-strong">Fri-Sat</th>
                    <td className="px-4 py-4 font-bold text-accent-text">Quote on enquiry</td>
                  </tr>
                  <tr>
                    <th className="px-4 py-4 font-semibold text-ink-strong">Children (under 12)</th>
                    <td className="px-4 py-4">Ask for current children's options</td>
                  </tr>
                </tbody>
              </table>
              <p className="px-4 py-4 text-sm text-ink-muted border-t border-line">
                Our festive menu is available for parties of six or more. A £10 per person deposit applies to every Christmas menu booking, whatever your group size, and secures your booking. Deposits are non-refundable. Every guest must pre-order, and we will confirm the deadline and booking details with you. Flag dietary requirements when you order so we can prepare suitable alternatives.
              </p>
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  trackCtaClick({
                    id: 'christmas_menu_meal',
                    label: 'Book Christmas lunch or dinner',
                    location: 'pricing_section',
                    destination: 'enquiry_form',
                    mode: 'meal'
                  })
                  handleOpenForm('meal', {}, 'pricing_section')
                }}
              >
                Book lunch or dinner
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  trackCtaClick({
                    id: 'christmas_menu_party',
                    label: 'Plan a Christmas party',
                    location: 'pricing_section',
                    destination: 'enquiry_form',
                    mode: 'party'
                  })
                  handleOpenForm('party', {}, 'pricing_section')
                }}
              >
                Plan a Christmas party
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="transparent" spacing="md" className="bg-surface">
        <Container>
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <Badge className="bg-red-100 text-red-700 w-fit">Pre-order only</Badge>
              <h2 className="text-3xl font-bold text-ink-strong">Sit-down Christmas lunch or dinner</h2>
              <p className="text-base sm:text-lg text-ink-muted">
                Choose a lunchtime or evening sitting for your group. When you enquire, we will confirm the current Christmas menu, live pricing and availability for your date.
              </p>
              <p className="text-sm text-accent-text font-semibold">
                All sit-down Christmas lunches and dinners are pre-order only. The booking team will confirm the deadline for meal choices and dietary requirements.
              </p>
            </div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line">
              <Image
                src="/images/page-headers/christmas-parties/2026/trimmings-board.jpg"
                alt="Festive food prepared for a Christmas meal at The Anchor"
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
                <p className="text-sm text-ink-muted">Tell us whether you prefer Christmas lunch or dinner, plus your date and group size.</p>
              </div>
            </Card>
            <Card className="h-full">
              <div className="p-5 space-y-2">
                <h3 className="font-semibold text-ink-strong">2. Confirm the menu</h3>
                <p className="text-sm text-ink-muted">We will send the current menu, pricing and the choices available for your booking.</p>
              </div>
            </Card>
            <Card className="h-full">
              <div className="p-5 space-y-2">
                <h3 className="font-semibold text-ink-strong">3. Send your pre-order</h3>
                <p className="text-sm text-ink-muted">Return meal choices and dietary requirements by the deadline confirmed by the team.</p>
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

      <Section background="transparent" spacing="md" className="bg-surface">
        <Container>
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold text-ink-strong">Planning help</h2>
            <p className="text-ink-muted">
              Choose the extras that suit your celebration and include them in your Christmas party booking.
            </p>
          </div>

          <Grid cols={2} gap="md" className="mt-10">
            {PERK_OPTIONS.map(option => (
              <Card key={option.id} className="h-full">
                <div className="p-6 space-y-3">
                  <Badge className="bg-red-600 text-white w-fit">Enquiry help</Badge>
                  <h3 className="text-lg font-semibold text-ink-strong">{option.label.split(':')[0]}</h3>
                  <p className="text-sm text-ink-muted">{option.label.split(':')[1]?.trim() || ''}</p>
                </div>
              </Card>
            ))}
          </Grid>

          <div className="mt-12 flex justify-center">
            <Button variant="primary" size="md" onClick={handleAddCurrentPricing}>Add to enquiry</Button>
          </div>

          {perkNotice && (
            <Alert variant="success" className="mt-6 mx-auto max-w-xl" title="Enquiry note saved">
              Thanks, we've tagged your request for current festive pricing against your enquiry so it doesn't get missed.
            </Alert>
          )}
        </Container>
      </Section>

      <Section background="transparent" spacing="md" className="bg-surface-sunk">
        <Container>
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold text-ink-strong">Festive buffets for 26 or more guests</h2>
            <p className="text-ink-muted">
              A festive buffet can work well for a standing reception, quiz night or team gathering. Ask us to confirm the current buffet selection, pricing and service timings for your date.
            </p>
          </div>

          <Grid cols={3} gap="md" className="mt-10">
            {[
              {
                title: 'Cold buffet options',
                description: 'Ask for the current cold buffet selection and dietary alternatives.'
              },
              {
                title: 'Hot buffet options',
                description: 'Ask for the current hot buffet selection and service details.'
              },
              {
                title: 'Grazing and add-ons',
                description: 'Tell us the style of party you want and we will confirm the current grazing boards and add-ons.'
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

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-ink-strong flex items-center gap-2">
                  <Icon name="gift" className="h-5 w-5 text-red-600" />
                  Current add-ons
                </h3>
                <p className="text-sm text-ink-muted">Ask which hot sides, platters and festive extras are available for your date. Pricing is confirmed from the current approved source.</p>
              </div>
            </Card>
            <Card>
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-ink-strong flex items-center gap-2">
                  <Icon name="coffee" className="h-5 w-5 text-red-600" />
                  Desserts and drinks
                </h3>
                <p className="text-sm text-ink-muted">Ask about the current dessert, hot-drink, welcome-drink and bar-tab options for your group.</p>
              </div>
            </Card>
            <Card>
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-ink-strong flex items-center gap-2">
                  <Icon name="clock" className="h-5 w-5 text-red-600" />
                  Service notes
                </h3>
                <ul className="space-y-2 text-sm text-ink-muted">
                  <li>Festive buffets are available for groups of 26 or more.</li>
                  <li>Current buffet contents and service timings are confirmed with your quote.</li>
                  <li>We will confirm the deposit, final numbers and pre-order deadline before you book.</li>
                  <li>Vegetarian, vegan and gluten-free swaps available.</li>
                </ul>
              </div>
            </Card>
          </div>

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
              <p className="text-sm text-ink-muted">Tell us your guest count, preferred date and party style. We will confirm the current buffet options and suitable add-ons.</p>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  trackCtaClick({
                    id: 'christmas_buffet_cta',
                    label: 'Plan a Buffet Party (26+)',
                    location: 'buffet_section',
                    destination: 'enquiry_form',
                    mode: 'party'
                  })
                  handleOpenForm('party', {}, 'buffet_section')
                }}
              >
                Plan a Buffet Party (26+)
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="transparent" spacing="md" className="bg-surface">
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
                <h3 className="text-lg font-semibold text-ink-strong">Main Bar & Dining</h3>
                <p className="text-sm text-ink-muted">Flexible layouts for larger celebrations, sit-down dinners, buffet-style evenings or standing receptions. We'll shape the room to fit your Christmas party, whether it's 30 or 60 guests.</p>
              </div>
            </Card>
            <Card className="h-full">
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-ink-strong">Light-filled Conservatory</h3>
                <p className="text-sm text-ink-muted">Bright, semi-private space perfect for welcome drinks, dessert stations or children's tables. Works beautifully for afternoon Christmas lunches when you want natural daylight.</p>
              </div>
            </Card>
          </Grid>
          <div className="mt-10 text-sm text-ink-muted text-center space-y-2">
            <p>Free on-site parking for around 20 cars · Seven minutes from Heathrow Terminal 5 · Eight minutes to Staines-upon-Thames · Outside the ULEZ · Sheltered smoking area</p>
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

      <Section background="transparent" spacing="md" className="bg-surface-sunk">
        <Container>
          <div className="max-w-3xl mx-auto space-y-6 text-center">
            <h2 className="text-3xl font-bold text-ink-strong">Booking essentials</h2>
          </div>
          <div className="max-w-3xl mx-auto mt-8">
            <ul className="space-y-3 text-sm text-ink-muted">
              <li className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 text-accent-text" />A £10 per person deposit applies to every Christmas menu booking, whatever your group size, and secures your table. Deposits are non-refundable.</li>
              <li className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 text-accent-text" />Sit-down Christmas lunches and dinners are pre-order only. We will confirm the meal-choice deadline with your booking.</li>
              <li className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 text-accent-text" />We&apos;ll always try to accommodate last-minute changes, but once your order is confirmed we can&apos;t guarantee them.</li>
              <li className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 text-accent-text" />We will confirm your sitting time, room setup and any other booking terms before you pay the deposit.</li>
              <li className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 text-accent-text" />Include dietary requirements or allergies with your pre-order so the kitchen can prepare suitable alternatives.</li>
              <li className="flex items-start gap-3">
                <Icon name="check" className="mt-0.5 h-5 w-5 text-accent-text" />
                <span>Guests driving? Share our <Link href="/blog/cheap-heathrow-parking-alternatives" className="underline decoration-dotted hover:text-accent-text transition-colors">cheap Heathrow parking tips</Link> or point them to <Link href="/heathrow-parking" className="underline decoration-dotted hover:text-accent-text transition-colors">pre-booked spaces at The Anchor</Link>.</span>
              </li>
            </ul>
          </div>
        </Container>
      </Section>

      <Section background="transparent" spacing="md" className="bg-surface">
        <Container>
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-ink-strong">Why book your Christmas party at The Anchor?</h2>
              <p className="text-base text-ink-muted max-w-3xl mx-auto">
                Whether you're planning a staff Christmas party for airport colleagues, a festive lunch for the team or a Friday-night Christmas do with friends from Staines, The Anchor offers a traditional pub setting close to Heathrow with free parking and flexible spaces.
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
                Been tasked with organising the works Christmas do? You need somewhere everyone can get to, food that's actually good, and a bill that won't make finance wince. We make all three easy, and we've been hosting office Christmas parties for Heathrow businesses, Poyle teams and Surrey offices for years.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-ink-strong">Why offices choose us</h3>
                <ul className="space-y-3 text-sm text-ink-muted">
                  <li className="flex items-start gap-3">
                    <Icon name="check" className="mt-0.5 h-5 w-5 text-accent-text flex-shrink-0" />
                    <span><strong className="text-ink-strong">Central for distributed teams</strong>, Seven minutes from Heathrow T5, two minutes off M25 J14. Colleagues from different offices, terminals or countries meet in one easy spot.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="check" className="mt-0.5 h-5 w-5 text-accent-text flex-shrink-0" />
                    <span><strong className="text-ink-strong">Corporate billing</strong>, Ask about VAT invoices, deposit invoicing and agreed bar-tab options for your booking.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="check" className="mt-0.5 h-5 w-5 text-accent-text flex-shrink-0" />
                    <span><strong className="text-ink-strong">Clear pre-order process</strong>, We will explain how to collect meal choices and confirm them with the team.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="check" className="mt-0.5 h-5 w-5 text-accent-text flex-shrink-0" />
                    <span><strong className="text-ink-strong">Free parking and ULEZ-free</strong>, Around 20 free spaces plus we're outside the ULEZ zone. No parking charges, no congestion fees.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="check" className="mt-0.5 h-5 w-5 text-accent-text flex-shrink-0" />
                    <span><strong className="text-ink-strong">The organiser support</strong>, we give you one clear contact, a pre-order process and confirmed details before you book.</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-ink-strong">Popular corporate setups</h3>
                <div className="space-y-4">
                  <div className="rounded-xl border border-line bg-surface-sunk p-5">
                    <h4 className="font-semibold text-ink-strong mb-1">Small team dinner (6–25)</h4>
                    <p className="text-sm text-ink-muted">Private dining room with three-course festive menu, crackers and candles. Ask for current pricing when you enquire. Popular with Poyle, Colnbrook and Heathrow business park teams.</p>
                  </div>
                  <div className="rounded-xl border border-line bg-surface-sunk p-5">
                    <h4 className="font-semibold text-ink-strong mb-1">Department celebration (26–60)</h4>
                    <p className="text-sm text-ink-muted">Main bar configured for your group with buffet or sit-down service. Add a quiz or Music Bingo for a memorable works Christmas do.</p>
                  </div>
                  <div className="rounded-xl border border-line bg-surface-sunk p-5">
                    <h4 className="font-semibold text-ink-strong mb-1">Full venue hire (60–200)</h4>
                    <p className="text-sm text-ink-muted">Ask about exclusive use, suitable entertainment and the available finishing time for your chosen date.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-ink-muted mb-4">
                Already organising? See our <Link href="/corporate-christmas-parties" className="underline decoration-dotted text-accent-text hover:text-accent-text transition">dedicated corporate Christmas parties page</Link> for detailed packages.
              </p>
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
                Not every Christmas do needs to be a standard sit-down meal. We can shape the celebration around your group. Here are a few ideas to discuss when you enquire.
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
                Popular December dates can fill quickly. Whether you're planning a festive dinner, a Christmas lunch or a works do, enquiring early gives us more options for your preferred date and space.
              </p>
              <p className="text-sm text-ink-muted">
                Not sure about exact numbers yet? Send an enquiry with your rough headcount and preferred week. We will confirm the available options, then the applicable deposit secures your agreed booking.
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
            faqs={FAQ_ITEMS}
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
              Tell us whether you are planning a Christmas party or a pre-order sit-down lunch or dinner. We will confirm availability, current pricing and the next steps.
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
        description={context.mode === 'meal' ? 'Sit-down Christmas lunch or dinner, pre-order only' : 'Christmas parties, private spaces, drinks and buffets'}
        side="right"
        testId="christmas-enquiry-drawer"
      >
        <div className="p-3 sm:p-6">
          <ChristmasEnquiryForm
            context={context}
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

function ChristmasEnquiryForm({ context, onContextChange, onSuccess }: ChristmasEnquiryFormProps) {
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
        party_format: context.mode === 'party' ? partyFormat : undefined,
        party_size: Number.isNaN(numericPartySize) ? undefined : numericPartySize
      })

      const response = await fetch('/api/enquiry/christmas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: context.mode,
          service: context.mode === 'meal' ? context.service : undefined,
          partyFormat: context.mode === 'party' ? partyFormat : undefined,
          source: context.source,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          partySize: partySize.trim(),
          preferredDate,
          preferredTime,
          extras: context.extras,
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
      onContextChange({ extras: [], perks: [] })
    } catch (error) {
      console.error('Christmas enquiry form submission failed:', error)
      setStatus('error')
      setMessage("Sorry, something went wrong while sending your enquiry. Please call us on 01753 682707.")
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
      <p className="text-sm text-ink-muted">We will reply with availability, current pricing and next steps.</p>
      <p className="text-sm text-ink-muted mb-6">Prefer email?{' '}<a href={CONTACT_EMAIL_LINK} className="underline decoration-dotted text-accent-text">{CONTACT_EMAIL}</a></p>

      {status === 'error' && (
        <Alert variant="error" className="mb-6" title="Please double-check">
          {message}
        </Alert>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
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
            <p className="text-sm font-semibold">Christmas lunches and dinners are pre-order only.</p>
            <p className="mt-1 text-xs">A £10 per person non-refundable deposit secures the booking. We will confirm the pre-order deadline with you.</p>
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
              {PARTY_FORMAT_OPTIONS.map(option => (
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
              min={context.mode === 'party' && partyFormat === 'festive_buffet' ? 26 : 6}
              max={context.mode === 'meal' ? 60 : 200}
              value={partySize}
              onChange={event => setPartySize(event.target.value)}
              placeholder="e.g. 18"
              className="mt-1 w-full rounded-sm border-[1.5px] border-line-strong bg-surface px-3 py-2 text-sm text-ink-strong focus:border-anchor-gold-dark focus:outline-none focus:ring-4 focus:ring-anchor-gold-dark/10"
              required
            />
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
              min={CHRISTMAS_BOOKING_START}
              max={CHRISTMAS_BOOKING_END}
              data-native-date-time="true"
              className="mt-1 block w-full min-w-0 max-w-full rounded-sm border-[1.5px] border-line-strong bg-surface px-3 py-2 text-sm text-ink-strong focus:border-anchor-gold-dark focus:outline-none focus:ring-4 focus:ring-anchor-gold-dark/10"
              required
            />
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

        {(context.extras.length > 0 || context.perks.length > 0) && (
          <div className="rounded-lg border border-line bg-surface-sunk px-4 py-3 text-sm text-ink-muted">
            <Icon name="gift" className="mr-2 inline h-4 w-4" />
            We've noted your selected extras and offers for our reply.
          </div>
        )}

        <div>
          <label htmlFor="christmas-notes" className="block text-sm font-medium text-ink-muted">Notes / dietary requests</label>
          <textarea
            id="christmas-notes"
            rows={4}
            value={notes}
            onChange={event => setNotes(event.target.value)}
            className="mt-1 w-full rounded-sm border-[1.5px] border-line-strong bg-surface px-3 py-2 text-sm text-ink-strong focus:border-anchor-gold-dark focus:outline-none focus:ring-4 focus:ring-anchor-gold-dark/10"
            placeholder={context.mode === 'meal' ? 'Share dietary requirements, accessibility needs or anything else we should know.' : 'Share entertainment ideas, room preferences, dietary needs or anything else we should know.'}
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-ink-muted">
          <input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-1" required />
          <span>I'm happy for The Anchor to contact me about this enquiry.</span>
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

function ChristmasLightbox({ suppressed, context, onContextChange, onSubmitSuccess }: ChristmasLightboxProps) {
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
      setError('Please fill in all fields so we can confirm current seasonal options.')
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
          partyFormat: context.mode === 'party' ? 'not_sure' : undefined,
          source: 'lightbox',
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          partySize: partySize.trim(),
          preferredDate,
          preferredTime: 'Flexible',
          extras: context.extras,
          perks: union(context.perks, ['current-pricing']),
          notes: 'Submitted via seasonal enquiry lightbox',
          ...(lbHoneypot ? { website: lbHoneypot } : {}),
          _t: Math.floor((Date.now() - lbFormLoadedAt.current) / 1000)
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage = errorData?.error || 'Sorry, we could not confirm seasonal options right now. Please call us on 01753 682707.'
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
      setError("Sorry, something went wrong. Please call us on 01753 682707 and we'll confirm current seasonal options.")
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
          <h3 id="christmas-lightbox-title" className="pr-8 text-2xl font-bold text-ink-strong">Want current festive pricing for your date?</h3>
          <p className="text-sm text-ink-muted">Share a few details and we'll confirm live menu pricing, availability and any current seasonal options.</p>

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
                min={6}
                max={context.mode === 'meal' ? 60 : 200}
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
                min={CHRISTMAS_BOOKING_START}
                max={CHRISTMAS_BOOKING_END}
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
                <p className="text-xs font-semibold text-amber-950">Sit-down Christmas meals are pre-order only.</p>
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
