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
import { trackBannerEvent, trackCtaClick, trackFormComplete, trackFormStart } from '@/lib/gtm-events'
import { analytics } from '@/lib/analytics'
import { HeroSection } from '@/components/hero/HeroSection'
import { jsonLdSafeStringify } from '@/lib/jsonld'

const CONTACT_EMAIL = 'manager@the-anchor.pub'
const CONTACT_PHONE = '01753 682707'
const CONTACT_PHONE_LINK = 'tel:+441753682707'
const CONTACT_EMAIL_LINK = `mailto:${CONTACT_EMAIL}`

export type EnquiryMode = 'dinner' | 'buffet'

interface EnquiryContext {
  mode: EnquiryMode
  extras: string[]
  perks: string[]
}

const DEFAULT_CONTEXT: EnquiryContext = {
  mode: 'dinner',
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

interface StickyEnquiryBarProps {
  visible: boolean
  context: EnquiryContext
  onContextChange: (updates: Partial<EnquiryContext>) => void
  onOpenForm: (mode: EnquiryMode, source: string) => void
}

interface ChristmasLightboxProps {
  suppressed: boolean
  context: EnquiryContext
  onContextChange: (updates: Partial<EnquiryContext>) => void
  onSubmitSuccess: () => void
}

const ENQUIRY_STORAGE_KEYS = {
  submitted: 'christmas_enquiry_submitted',
  lightbox: 'christmas_enquiry_lightbox_last'
} as const

const TIME_OPTIONS = ['5:30 pm', '6:00 pm', '6:30 pm', '7:00 pm', '7:30 pm', '8:00 pm']

const EARLY_BIRD_DEADLINE = '2026-10-01T23:59:59'

interface CountdownState {
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
}

const computeCountdown = (target: string | Date): CountdownState => {
  const targetDate = typeof target === 'string' ? new Date(target) : target
  const targetTime = targetDate.getTime()

  if (Number.isNaN(targetTime)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  }

  const now = Date.now()
  const diff = targetTime - now

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  }

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / (60 * 60 * 24))
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60))
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, expired: false }
}

const useCountdown = (target: string | Date) => {
  const [state, setState] = useState<CountdownState>(() => computeCountdown(target))

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setState(computeCountdown(target))
    }, 1000)

    setState(computeCountdown(target))

    return () => {
      window.clearInterval(intervalId)
    }
  }, [target])

  return state
}

const PERK_OPTIONS = [
  { id: 'early-bird', label: 'Early-Bird: 20% off food bill when you book by 1 Oct (parties of 6+)' },
  { id: 'mid-week', label: 'Tue-Wed: free coffee & mince pie with dinner' }
]

const FESTIVE_PRICING = [
  {
    tier: 'Shared party nights (Tue–Thu)',
    price: 'GBP 36.95 per person',
    includes: 'Three-course menu, festive decor, crackers, background playlist and optional Prosecco upgrade'
  },
  {
    tier: 'Weekend private hire dinners (Fri–Sat)',
    price: 'GBP 39.95 per person',
    includes: 'Private dining room or main bar layout, late bar option until midnight and support for DJs or entertainment'
  },
  {
    tier: 'Festive buffets (26+ guests)',
    price: 'From GBP 10.95 per person',
    includes: 'Three buffet tiers with hot finger food, salads and grazing boards refreshed for the first hour'
  }
]

const EarlyBirdCountdown = ({ className = '' }: { className?: string }) => {
  const { days, hours, minutes, expired } = useCountdown(EARLY_BIRD_DEADLINE)

  const classes = `text-xs font-semibold uppercase tracking-wide ${className}`.trim()

  if (expired) {
    return <span className={classes}>Early-Bird offer ends soon</span>
  }

  const segments: string[] = []

  if (days > 0) {
    segments.push(`${days} day${days === 1 ? '' : 's'}`)
  }

  segments.push(`${hours} hr${hours === 1 ? '' : 's'}`)
  segments.push(`${minutes} min${minutes === 1 ? '' : 's'}`)

  return <span className={classes}>Offer ends in {segments.slice(0, 3).join(' · ')}</span>
}

const FAQ_ITEMS = [
  {
    question: "Is there a minimum spend for shared party nights or private hire?",
    answer: "Weeknight shared party nights start at GBP 36.95 per guest with no additional room hire. Weekend private dinners run from GBP 39.95 per guest and we agree a minimum guest count, not a bar spend, so you keep control of the budget."
  },
  {
    question: "Is there a hire fee for Christmas parties?",
    answer: "There is no hire fee when you book one of our festive food or buffet packages. Let us know if you need exclusive use of a space and we will talk you through the options."
  },
  {
    question: "Is there a minimum group size?",
    answer: "Our festive menu is available for parties of six or more. Smaller groups are welcome to join us from the à la carte menu in the pub."
  },
  {
    question: "Are you close to Heathrow and Staines?",
    answer: "Yes - we're seven minutes from Heathrow Terminal 5, around fifteen minutes from the Terminal 2 landside entrance and just eight minutes from Staines-upon-Thames. We're an easy Surrey Christmas party venue for Ashford, Windsor and the Heathrow villages."
  },
  {
    question: "Can we bring our own food?",
    answer: "Celebration cakes are welcome. Any other external catering needs advance approval plus a signed food safety waiver and the supplier's liability insurance. Additional charges may apply."
  },
  {
    question: "Can you run a bar tab for our group?",
    answer: "Yes, we can pre-set a bar tab with your budget and keep you updated throughout the night. Invoicing in advance is also available if preferred."
  },
  {
    question: "How do guests travel from Heathrow hotels or terminals?",
    answer: "Taxi and rideshare journeys from Heathrow Terminal 5 take around seven minutes and typically cost GBP 18-22. We are fifteen minutes from the Terminal 2 landside entrance and have space for mini-coaches."
  },
  {
    question: "What entertainment can we have?",
    answer: "We can play festive playlists through our sound system, or you can bring your own. Live bands, DJs, quizzes and karaoke are all welcome with a little notice."
  },
  {
    question: "Is parking available?",
    answer: "Yes - around 20 free spaces on-site just seven minutes from Heathrow Terminal 5. You're welcome to leave cars overnight and collect them the next day."
  },
  {
    question: "How do you handle dietary requests?",
    answer: "Vegetarian, vegan, gluten-free and other dietary requests are happily accommodated. Just include the details on your pre-order so the kitchen can prepare suitable swaps."
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
  const [extrasNotice, setExtrasNotice] = useState(false)
  const [perkNotice, setPerkNotice] = useState(false)
  const [stickyVisible, setStickyVisible] = useState(false)
  const enquiryRef = useRef<HTMLDivElement | null>(null)
  const extrasTimeoutRef = useRef<number | null>(null)
  const perkTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    setFormSubmitted(getLocalStorage(ENQUIRY_STORAGE_KEYS.submitted) === 'true')

    const onScroll = () => {
      const show = window.scrollY > 320
      setStickyVisible(show)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (extrasTimeoutRef.current) {
        window.clearTimeout(extrasTimeoutRef.current)
      }
      if (perkTimeoutRef.current) {
        window.clearTimeout(perkTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    trackBannerEvent({
      id: 'christmas_earlybird_banner',
      action: 'view',
      label: 'Early-Bird Offer',
      campaign: 'christmas_2026'
    })
  }, [])

  const scrollToForm = useCallback(() => {
    if (typeof window === 'undefined' || !enquiryRef.current) return

    const element = enquiryRef.current
    const top = element.getBoundingClientRect().top + window.scrollY
    const offset = window.innerWidth >= 1024 ? 140 : 96

    window.scrollTo({ top: Math.max(top - offset, 0), behavior: 'smooth' })
  }, [])

  const handleOpenForm = useCallback((
    mode: EnquiryMode,
    updates: Partial<EnquiryContext> = {},
    source = 'unknown'
  ) => {
    setContext(prev => ({
      ...prev,
      mode,
      extras: updates.extras ?? prev.extras,
      perks: updates.perks ?? prev.perks
    }))
    trackFormStart({
      formName: 'christmas_enquiry',
      mode,
      source,
      journey: 'christmas_parties_page'
    })
    requestAnimationFrame(() => {
      scrollToForm()
    })
  }, [scrollToForm])

  const handleContextChange = useCallback((updates: Partial<EnquiryContext>) => {
    setContext(prev => ({ ...prev, ...updates }))
  }, [])

  const handleFormSuccess = useCallback(() => {
    markLocalStorage(ENQUIRY_STORAGE_KEYS.submitted, 'true')
    setFormSubmitted(true)
  }, [])

  const handleAddFeastExtras = () => {
    trackCtaClick({
      id: 'christmas_add_feast_extras',
      label: 'Add to my enquiry',
      location: 'build_the_feast',
      destination: 'enquiry_form',
      mode: 'dinner'
    })
    const extrasToAdd = ['trimmings-board', 'bundle-a']
    const updatedExtras = union(context.extras, extrasToAdd)
    setContext(prev => ({ ...prev, extras: updatedExtras, mode: 'dinner' }))
    handleOpenForm('dinner', { extras: extrasToAdd }, 'build_the_feast')
    setExtrasNotice(true)
    if (typeof window !== 'undefined') {
      if (extrasTimeoutRef.current) {
        window.clearTimeout(extrasTimeoutRef.current)
      }
      extrasTimeoutRef.current = window.setTimeout(() => setExtrasNotice(false), 4000)
    }
  }

  const handleClaimEarlyBird = () => {
    trackBannerEvent({
      id: 'christmas_earlybird_banner',
      action: 'click',
      label: 'Early-Bird Offer',
      campaign: 'christmas_2026'
    })
    trackCtaClick({
      id: 'christmas_earlybird_cta',
      label: 'Claim Early-Bird offer',
      location: 'earlybird_banner',
      destination: 'enquiry_form',
      mode: 'dinner'
    })
    const updatedPerks = union(context.perks, ['early-bird'])
    setContext(prev => ({ ...prev, perks: updatedPerks, mode: 'dinner' }))
    handleOpenForm('dinner', { perks: ['early-bird'] }, 'early_bird_offer')
    setPerkNotice(true)
    if (typeof window !== 'undefined') {
      if (perkTimeoutRef.current) {
        window.clearTimeout(perkTimeoutRef.current)
      }
      perkTimeoutRef.current = window.setTimeout(() => setPerkNotice(false), 4000)
    }
  }

  const heroActions = (
    <div className="flex w-full max-w-4xl flex-col items-center gap-4">
      <div className="flex w-full flex-col gap-3 md:flex-row md:justify-center">
        <Button
          variant="danger"
          size="lg"
          className="w-full md:w-auto"
          onClick={() => {
            trackCtaClick({
              id: 'christmas_hero_dinner',
              label: 'Request a Christmas Booking (up to 25)',
              location: 'christmas_hero',
              destination: 'enquiry_form',
              mode: 'dinner'
            })
            handleOpenForm('dinner', {}, 'hero_dinner')
          }}
        >
          Request a Christmas Booking (up to 25)
        </Button>
        <Button
          variant="danger"
          size="lg"
          className="w-full md:w-auto"
          onClick={() => {
            trackCtaClick({
              id: 'christmas_hero_buffet',
              label: 'Plan a Buffet Party (26+)',
              location: 'christmas_hero',
              destination: 'enquiry_form',
              mode: 'buffet'
            })
            handleOpenForm('buffet', {}, 'hero_buffet')
          }}
        >
          Plan a Buffet Party (26+)
        </Button>
      </div>
      <div className="flex w-full flex-col gap-3 md:flex-row md:justify-center">
        <Button
          variant="primary"
          size="lg"
          className="w-full md:w-auto"
          onClick={() => {
            trackCtaClick({
              id: 'christmas_hero_call',
              label: 'Call The Anchor',
              location: 'christmas_hero',
              destination: 'phone'
            })
            analytics.phoneCall(CONTACT_PHONE, 'christmas_hero')
            window.location.href = CONTACT_PHONE_LINK
          }}
        >
          <Icon name="phone" className="mr-2 h-4 w-4" /> Call {CONTACT_PHONE}
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="w-full md:w-auto"
          onClick={() => {
            trackCtaClick({
              id: 'christmas_hero_email',
              label: 'Email The Anchor',
              location: 'christmas_hero',
              destination: 'email'
            })
            analytics.emailClick(CONTACT_EMAIL, 'christmas_hero', undefined, '/christmas-parties')
            window.location.href = CONTACT_EMAIL_LINK
          }}
        >
          <Icon name="mail" className="mr-2 h-4 w-4" /> Email us
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <HeroSection
        id="christmas-hero"
        size="large"
        alignment="center"
        className="bg-anchor-charcoal text-white"
        contentClassName="max-w-4xl"
        eyebrow={<span className="text-red-100">Christmas 2026</span>}
        title="A proper village-pub Christmas minutes from Heathrow"
        description="Three-course feasts piled with herb-crusted triple-cooked roast potatoes, pigs in blankets and sage & onion stuffing - with crackers, candles and festive decor waiting at your table."
        overlay="dark"
        image={{
          src: '/images/page-headers/christmas-parties/2026/hero-table.png',
          alt: 'Festive Christmas dinner table setting at The Anchor near Heathrow',
          priority: true
        }}
        cta={heroActions}
      />

      <Section className="py-2 md:py-3 bg-red-700 text-white">
        <Container>
          <div className="flex flex-col items-center justify-center gap-3 text-center md:flex-row md:gap-6">
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex items-center gap-2">
                <Icon name="sparkles" className="h-5 w-5" />
                <p className="text-sm md:text-base font-semibold">
                  Book by 1 Oct to enjoy 20% off your food bill for every adult in parties of six or more.
                </p>
              </div>
              <EarlyBirdCountdown className="text-red-100 text-xs md:text-sm" />
            </div>
            <button
              type="button"
              className="text-white text-sm underline decoration-dotted"
              onClick={handleClaimEarlyBird}
            >
              See details
            </button>
          </div>
        </Container>
      </Section>

      <StickyEnquiryBar
        visible={stickyVisible}
        context={context}
        onContextChange={handleContextChange}
        onOpenForm={(mode, source) => handleOpenForm(mode, {}, source)}
      />

      <Section className="bg-white" spacing="md" container>
        <Container>
          <Grid cols={3} gap="md">
	            <Card className="h-full">
	              <div className="p-6 space-y-3 text-center">
	                <Icon name="calendar" className="mx-auto h-8 w-8 text-red-600" />
	                <h3 className="text-lg font-semibold text-anchor-charcoal">Mid-week value</h3>
	                <p className="text-sm text-gray-600">Tue-Thu 3 courses for GBP 36.95 per person (groups of 6+).</p>
	              </div>
	            </Card>
            <Card className="h-full">
              <div className="p-6 space-y-3 text-center">
                <Icon name="utensils" className="mx-auto h-8 w-8 text-red-600" />
                <h3 className="text-lg font-semibold text-anchor-charcoal">Yorkies & pigs in blankets</h3>
                <p className="text-sm text-gray-600">Every roast comes with the favourites, plus herb-crusted triple-cooked roast potatoes, seasonal vegetables and our signature gravy.</p>
              </div>
            </Card>
            <Card className="h-full">
              <div className="p-6 space-y-3 text-center">
                <Icon name="gift" className="mx-auto h-8 w-8 text-red-600" />
                <h3 className="text-lg font-semibold text-anchor-charcoal">Crackers & festive decor</h3>
                <p className="text-sm text-gray-600">Tables arrive dressed with crackers, candles and a proper Christmas glow.</p>
              </div>
            </Card>
          </Grid>
        </Container>
      </Section>

      <Section background="gray" spacing="md">
        <Container>
          <div className="mx-auto max-w-5xl space-y-4 text-center">
            <h2 className="text-3xl font-bold text-anchor-charcoal">2026 festive packages &amp; pricing</h2>
            <p className="text-base text-gray-700">
              Book shared party nights, private dining and Sunday lunches with transparent per-person pricing. Pick the option that fits your Heathrow Christmas party or Surrey celebration, then submit your enquiry to lock in dates.
            </p>
          </div>
          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-anchor-charcoal text-white text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">Package</th>
                  <th className="px-4 py-3">Pricing</th>
                  <th className="px-4 py-3">What&apos;s included</th>
                </tr>
              </thead>
              <tbody>
                {FESTIVE_PRICING.map(row => (
                  <tr key={row.tier} className="border-t border-gray-100">
                    <td className="px-4 py-4 font-semibold text-anchor-charcoal">{row.tier}</td>
                    <td className="px-4 py-4 text-red-700 font-semibold">{row.price}</td>
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
                  id: 'christmas_pricing_dinner',
                  label: 'Request a Christmas Booking (up to 25)',
                  location: 'pricing_table',
                  destination: 'enquiry_form',
                  mode: 'dinner'
                })
                handleOpenForm('dinner', {}, 'pricing_table')
              }}
              className="w-full md:w-auto"
            >
              Request shared or private dinner
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                trackCtaClick({
                  id: 'christmas_pricing_buffet',
                  label: 'Plan a Buffet Party (26+)',
                  location: 'pricing_table',
                  destination: 'enquiry_form',
                  mode: 'buffet'
                })
                handleOpenForm('buffet', {}, 'pricing_table')
              }}
              className="w-full md:w-auto"
            >
              View buffet availability
            </Button>
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="sm">
        <Container>
          <div className="mx-auto max-w-4xl space-y-4 text-center">
            <h2 className="text-2xl font-bold text-anchor-charcoal">Christmas party venue minutes from Heathrow &amp; Staines</h2>
            <p className="text-base text-gray-700">
              The Anchor is a favourite choice for Christmas party venues near Heathrow, Staines-upon-Thames and Ashford. We're seven minutes from Terminal 5, fifteen from the Terminal 2 landside entrance and just over the river from Windsor - so airport teams, local businesses and Surrey neighbours can celebrate without the stress of city travel. As a relaxed Christmas party venue Surrey organisers rely on, we host Christmas parties Heathrow crews and remain one of the Christmas party venues Heathrow teams book year after year.
            </p>
            <p className="text-sm text-gray-600">
              Looking for great value or even cheap Christmas parties around Heathrow? Weeknight dining is priced from GBP 36.95 for full three-course feasts with all the trimmings, making us one of the best-priced Christmas party pubs in Surrey without compromising on hospitality. It's a welcoming Christmas party pub Staines teams can walk to, the Christmas party pub Terminal 2 landside crews recommend, and a handy base for a Christmas party in Staines, Ashford or Windsor.
            </p>
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="sm">
        <Container>
          <div className="mx-auto max-w-4xl text-center space-y-5">
            <h3 className="text-xl font-semibold text-anchor-charcoal">Planning from nearby towns?</h3>
            <p className="text-sm text-gray-600">
              We regularly welcome festive groups from across Surrey and West London. Explore our local guides below and then send your enquiry when you're ready to reserve a date.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { href: '/staines-pub', label: 'Christmas gatherings from Staines-upon-Thames' },
                { href: '/ashford-pub', label: 'Ashford & Stanwell Christmas meet-ups' },
                { href: '/windsor-pub', label: 'Windsor festive party ideas' },
                { href: '/heathrow-hotels-pub', label: 'Heathrow hotel teams & layovers' }
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-anchor-charcoal transition hover:border-red-400 hover:text-red-700"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section background="gray" spacing="md">
        <Container>
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold text-anchor-charcoal">Christmas pricing at a glance</h2>
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
              <table className="w-full text-left text-sm md:text-base">
                <tbody>
                  <tr className="border-b border-gray-200 bg-red-50">
                    <th className="px-4 py-4 font-semibold text-anchor-charcoal">Tue-Thu</th>
                    <td className="px-4 py-4 font-bold text-red-700">GBP 36.95 per person</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-4 font-semibold text-anchor-charcoal">Fri-Sat</th>
                    <td className="px-4 py-4 font-bold text-anchor-charcoal">GBP 39.95 per person</td>
                  </tr>
                  <tr>
                    <th className="px-4 py-4 font-semibold text-anchor-charcoal">Children (under 12)</th>
                    <td className="px-4 py-4">2 courses GBP 12.95 · 3 courses GBP 15.95</td>
                  </tr>
                </tbody>
              </table>
              <p className="px-4 py-4 text-sm text-gray-600 border-t border-gray-200">
                Children under 12 dine for GBP 12.95 (2 courses) or GBP 15.95 (3 courses). Christmas bookings are for parties of six or more. A GBP 10 per person deposit secures your festive reservation and is non-refundable. Full pre-orders for every guest are due seven days in advance; we&apos;ll do our utmost with late changes but can&apos;t guarantee them. Please flag dietary requirements when you order so we can arrange suitable alternatives – some substitutions may carry a small surcharge. Tables are reserved for two hours as standard.
              </p>
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  trackCtaClick({
                    id: 'christmas_pricing_dinner',
                    label: 'Request a Christmas Booking (up to 25)',
                    location: 'pricing_section',
                    destination: 'enquiry_form',
                    mode: 'dinner'
                  })
                  handleOpenForm('dinner', {}, 'pricing_section')
                }}
              >
                Request a Christmas Booking (up to 25)
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  trackCtaClick({
                    id: 'christmas_pricing_buffet',
                    label: 'Plan a Buffet Party (26+)',
                    location: 'pricing_section',
                    destination: 'enquiry_form',
                    mode: 'buffet'
                  })
                  handleOpenForm('buffet', {}, 'pricing_section')
                }}
              >
                Plan a Buffet Party (26+)
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="md" className="bg-gradient-to-br from-red-50 via-white to-red-50">
        <Container>
          <div className="grid items-start gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <Badge className="bg-red-100 text-red-700 w-fit">Festive 3-course set menu</Badge>
              <h2 className="text-3xl font-bold text-anchor-charcoal">Christmas menu snapshot</h2>
              <p className="text-sm italic text-gray-500 mb-2">Sample menu - 2026 selection to be confirmed in October</p>
              <p className="text-base sm:text-lg text-gray-700">
                Three generous courses that feel like Christmas at home - just with more room for everyone. Whether you're after a Christmas dinner near Heathrow, typing "Christmas dinner near me" from Terminal 5, eyeing a Christmas lunch near Staines or planning a festive pub feast for Surrey colleagues, every main arrives with herb-crusted triple-cooked roast potatoes, seasonal vegetables, Yorkshire puddings, pigs in blankets, sage &amp; onion stuffing and our signature gravy to share.
              </p>
              <p className="text-sm text-red-700 font-semibold">Available for festive parties of six or more guests.</p>
              <div className="space-y-5 text-left">
                <div className="rounded-2xl border border-red-100 bg-white/90 p-5 shadow-sm space-y-3">
                  <h3 className="text-lg font-semibold text-anchor-charcoal">Starter</h3>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li>
                      <p className="font-semibold text-anchor-charcoal">Classic prawn cocktail</p>
                      <p className="text-gray-600">North Atlantic prawns layered with crisp gem lettuce, tangy Marie Rose sauce and freshly baked rolls.</p>
                    </li>
                    <li>
                      <p className="font-semibold text-anchor-charcoal">Chicken liver pâté</p>
                      <p className="text-gray-600">Silky chicken liver pâté with caramelised onion chutney and freshly baked rolls for spreading.</p>
                    </li>
                    <li>
                      <p className="font-semibold text-anchor-charcoal">Leek, potato &amp; West Country Cheddar soup (v)</p>
                      <p className="text-gray-600">Silky leek and potato soup enriched with tangy West Country Cheddar, soft potato pieces, a splash of cream and freshly baked rolls on the side.</p>
                    </li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-red-100 bg-white/90 p-5 shadow-sm space-y-3">
                  <h3 className="text-lg font-semibold text-anchor-charcoal">Main</h3>
                  <p className="text-sm text-gray-600">All served with Christmas trimmings.</p>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li>
                      <p className="font-semibold text-anchor-charcoal">Festive roast turkey &amp; Christmas trimmings</p>
                      <p className="text-gray-600">Hand-carved British turkey breast with sage &amp; onion stuffing, pigs in blankets and a homemade Yorkshire pudding, served with herb-crusted triple-cooked roast potatoes, seasonal vegetables and plenty of our signature gravy.</p>
                    </li>
                    <li>
                      <p className="font-semibold text-anchor-charcoal">Crispy pork belly &amp; Christmas trimmings</p>
                      <p className="text-gray-600">Slow-roasted pork belly finished with crisp crackling, Bramley apple sauce, sage &amp; onion stuffing, pigs in blankets and a homemade Yorkshire pudding, served with herb-crusted triple-cooked roast potatoes, seasonal vegetables and our signature gravy.</p>
                    </li>
                    <li>
                      <p className="font-semibold text-anchor-charcoal">Slow-cooked lamb shank &amp; Christmas trimmings</p>
                      <p className="text-gray-600">Tender slow-braised lamb shank in rich red wine gravy, served with herb-crusted triple-cooked roast potatoes, seasonal vegetables, sage &amp; onion stuffing, pigs in blankets, a Yorkshire pudding and our signature gravy.</p>
                    </li>
                    <li>
                      <p className="font-semibold text-anchor-charcoal">Beetroot &amp; butternut squash Wellington &amp; Christmas trimmings (VG)</p>
                      <p className="text-gray-600">Golden puff pastry filled with beetroot and butternut squash, baked with caramelised onions and rosemary, served with herb-crusted triple-cooked roast potatoes, seasonal vegetables, sage &amp; onion stuffing, Yorkshire pudding and our signature gravy.</p>
                      <p className="text-xs text-gray-500">Vegan option served without Yorkshire pudding.</p>
                    </li>
                  </ul>
                  <p className="mt-3 text-xs text-gray-500">Vegetarian gravy available on request for every main course.</p>
                </div>
                <div className="rounded-2xl border border-red-100 bg-white/90 p-5 shadow-sm space-y-3">
                  <h3 className="text-lg font-semibold text-anchor-charcoal">Dessert</h3>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li>
                      <p className="font-semibold text-anchor-charcoal">Steamed Christmas pudding</p>
                      <p className="text-gray-600">Traditional fruit pudding steamed until glossy, served warm with pouring cream and a sparkle of festive redcurrants.</p>
                    </li>
                    <li>
                      <p className="font-semibold text-anchor-charcoal">Winter berry cheesecake</p>
                      <p className="text-gray-600">Silky vanilla cheesecake on a buttery biscuit base, finished with a jewel-bright berry compote and pillows of whipped cream.</p>
                    </li>
                    <li>
                      <p className="font-semibold text-anchor-charcoal">Indulgent chocolate fudge cake</p>
                      <p className="text-gray-600">Moist chocolate sponge layered with silky fudge icing, served warm with pouring cream or custard for pure comfort. Vegetarian friendly.</p>
                    </li>
                  </ul>
                  <p className="text-xs text-gray-600">Prefer cheese? Swap dessert for our farmhouse cheeseboard (+GBP 3) or add it as a fourth course for GBP 7.95.</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                <Icon name="star" className="h-4 w-4" /> All mains arrive family-style with Yorkshire puddings, pigs in blankets, herb-crusted triple-cooked roast potatoes, seasonal vegetables, sage &amp; onion stuffing and plenty of our signature gravy.
              </div>
            </div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
              <Image
                src="/images/page-headers/christmas-parties/2026/trimmings-board.png"
                alt="Christmas trimmings board at The Anchor pub near Staines with Yorkshire puddings and pigs in blankets"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={false}
              />
            </div>
          </div>
        </Container>
      </Section>

      <Section background="gray" spacing="md" container>
        <Container>
          <div className="max-w-4xl mx-auto space-y-6 text-center">
            <h2 className="text-3xl font-bold text-anchor-charcoal">Build the feast your way</h2>
            <p className="text-gray-700">
              Add sharers and drinks bundles so everything arrives just how your guests like it. Let us know and we'll have them waiting on the table.
            </p>
          </div>

          <Grid cols={2} gap="lg" className="mt-10 items-start">
            <Card>
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-semibold text-anchor-charcoal flex items-center gap-2">
                  <Icon name="gift" className="h-6 w-6 text-red-600" />
                  Trimmings & extras
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>All the Trimmings Board (serves 4) - GBP 11.95</li>
                  <li>XL Trimmings Board (serves 8) - GBP 21.95</li>
                  <li>Pigs in blankets (3) - GBP 3.95pp</li>
                  <li>Stuffing balls (2) - GBP 2.95pp</li>
                  <li>Cauli cheese pot - GBP 3.95pp</li>
                  <li>Extra herb-crusted triple-cooked roast potatoes & gravy - GBP 2.95pp</li>
                  <li>Extra Yorkshire puddings (2) - GBP 2.50pp</li>
                </ul>
              </div>
            </Card>
            <Card>
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-semibold text-anchor-charcoal flex items-center gap-2">
                  <Icon name="wine" className="h-6 w-6 text-red-600" />
                  Drinks & finale
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>Bundle A: Prosecco arrival + coffee & mince pie - GBP 9.95pp (counts towards the GBP 45-GBP 52 spend target)</li>
                  <li>Wine bundle: 2 bottles of house wine - GBP 39.00</li>
                  <li>Beer bucket (6 × 330ml) - GBP 27.00</li>
                  <li>Pre-set bar tab with running updates</li>
                  <li>Invoicing available for corporate groups</li>
                </ul>
              </div>
            </Card>
          </Grid>

          <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4">
            <Button variant="primary" size="md" onClick={handleAddFeastExtras}>Add to my enquiry</Button>
            <p className="text-sm text-gray-600">Tell us what you fancy and we'll have it ready when you arrive.</p>
          </div>

          {extrasNotice && (
            <Alert variant="success" className="mt-6" title="Extras noted">
              We'll flag the Trimmings Board and Bundle A on your enquiry so the team can prepare them.
            </Alert>
          )}
        </Container>
      </Section>

      <Section background="white" spacing="md">
        <Container>
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold text-anchor-charcoal">Seasonal offers</h2>
            <p className="text-gray-700">
              Pick the perks that suit your celebration and include them in your enquiry.
            </p>
          </div>

          <Grid cols={2} gap="md" className="mt-10">
            {PERK_OPTIONS.map(option => (
              <Card key={option.id} className="h-full">
                <div className="p-6 space-y-3">
                  <Badge className="bg-red-600 text-white w-fit">Festive offer</Badge>
                  <h3 className="text-lg font-semibold text-anchor-charcoal">{option.label.split(':')[0]}</h3>
                  <p className="text-sm text-gray-600">{option.label.split(':')[1]?.trim() || ''}</p>
                  {option.id === 'early-bird' && (
                    <EarlyBirdCountdown className="text-red-600" />
                  )}
                </div>
              </Card>
            ))}
          </Grid>

          <div className="mt-12 flex justify-center">
            <Button variant="primary" size="md" onClick={handleClaimEarlyBird}>Claim my Early-Bird</Button>
          </div>

          {perkNotice && (
            <Alert variant="success" className="mt-6 mx-auto max-w-xl" title="Early-Bird saved">
              Thanks - we've tagged the Early-Bird free glass of Prosecco offer against your enquiry so it doesn't get missed.
            </Alert>
          )}
        </Container>
      </Section>

      <Section background="gray" spacing="md" container>
        <Container>
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold text-anchor-charcoal">Festive buffets for 26 or more guests</h2>
            <p className="text-gray-700">
              Ideal for standing receptions, quiz nights and team gatherings. Buffets are laid out for 90 minutes with hot dishes refreshed for the first hour, giving you a flexible option for a Christmas party in Heathrow or a late-night celebration in Staines.
            </p>
          </div>

          <Grid cols={3} gap="md" className="mt-10">
            {[
              {
                title: 'Festive Sandwich & Salad',
                price: 'GBP 10.95 per person',
                description: 'Seasonal sandwich platter with turkey, stuffing & cranberry alongside house favourites, mixed leaf salad, crisps, crudités and dips.'
              },
              {
                title: 'Festive Hot Finger',
                price: 'GBP 13.95 per person',
                description: 'Sandwich selection plus chicken goujons, pigs in blankets, sausage rolls, mini pizzas, spring rolls and plenty of dipping sauces.'
              },
              {
                title: 'Festive Premium Grazing',
                price: 'GBP 16.95 per person',
                description: 'Cured meats and cheese boards with freshly baked rolls, salads, and hot bites including pigs in blankets, mini quiches, sausage rolls and spring rolls.'
              }
            ].map(tier => (
              <Card key={tier.title} className="h-full">
                <div className="p-6 space-y-3">
                  <Badge className="bg-red-100 text-red-700 w-fit">{tier.price}</Badge>
                  <h3 className="text-lg font-semibold text-anchor-charcoal">{tier.title}</h3>
                  <p className="text-sm text-gray-600">{tier.description}</p>
                </div>
              </Card>
            ))}
          </Grid>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-anchor-charcoal flex items-center gap-2">
                  <Icon name="gift" className="h-5 w-5 text-red-600" />
                  Add-on platters
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>Pigs in blankets (tray of 50) - GBP 39</li>
                  <li>Stuffing balls (tray of 40) - GBP 28</li>
                  <li>Cauliflower cheese (serves ~12) - GBP 24</li>
                  <li>Roast potatoes & gravy (serves ~12) - GBP 19</li>
                  <li>Mini Yorkshire puddings with gravy (24) - GBP 22</li>
                </ul>
              </div>
            </Card>
            <Card>
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-anchor-charcoal flex items-center gap-2">
                  <Icon name="coffee" className="h-5 w-5 text-red-600" />
                  Dessert & drinks stations
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>Festive dessert bites - Small GBP 24 (serves ~12) · Large GBP 45 (serves ~24)</li>
                  <li>Coffee & mince pie station - GBP 3.50 per person</li>
                  <li>Unlimited tea & coffee - GBP 4.49 per person</li>
                  <li>Welcome drink (Prosecco or orange juice) - GBP 6.99 per person</li>
                  <li>Unlimited kids' squash - GBP 2.50 per child</li>
                  <li>Pre-paid bar tab available with agreed limit</li>
                </ul>
              </div>
            </Card>
            <Card>
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-anchor-charcoal flex items-center gap-2">
                  <Icon name="clock" className="h-5 w-5 text-red-600" />
                  Service notes
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>Designed for groups of 26+ with 90-minute buffet window.</li>
                  <li>Hot options topped up for the first 60 minutes.</li>
                  <li>Deposit GBP 10pp, pre-order 7 days ahead, final numbers 72 hours prior.</li>
                  <li>Optional 10% service charge for parties of 6+.</li>
                  <li>Vegetarian, vegan and gluten-free swaps available.</li>
                </ul>
              </div>
            </Card>
          </div>

          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="relative aspect-[4/3] w-full md:w-1/2 overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
              <Image
                src="/images/events/christmas/christmas-buffet-table.jpg"
                alt="Festive buffet spread for Heathrow Christmas parties at The Anchor"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="md:w-1/2 space-y-4 text-left">
              <h3 className="text-2xl font-bold text-anchor-charcoal">Ready to feed a crowd?</h3>
              <p className="text-sm text-gray-700">We'll dress the buffet tables with signage, festive decor and all condiments. Tell us your guest count and we'll suggest the right tier and add-ons.</p>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  trackCtaClick({
                    id: 'christmas_buffet_cta',
                    label: 'Plan a Buffet Party (26+)',
                    location: 'buffet_section',
                    destination: 'enquiry_form',
                    mode: 'buffet'
                  })
                  handleOpenForm('buffet', {}, 'buffet_section')
                }}
              >
                Plan a Buffet Party (26+)
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="md" container>
        <Container>
          <Grid cols={3} gap="md">
            <Card className="h-full">
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-anchor-charcoal">Private Dining Room</h3>
                <p className="text-sm text-gray-600">Seat up to 25 guests per sitting with cosy decor and direct service. Ideal for Heathrow airport teams, Staines offices and family gatherings wanting a Christmas party pub atmosphere.</p>
              </div>
            </Card>
            <Card className="h-full">
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-anchor-charcoal">Main Bar & Dining</h3>
                <p className="text-sm text-gray-600">Flexible layouts for larger celebrations or buffet-style evenings. We'll shape the room around plans for Heathrow Christmas parties, Terminal 2 landside crews and Surrey community nights.</p>
              </div>
            </Card>
            <Card className="h-full">
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-anchor-charcoal">Light-filled conservatory</h3>
                <p className="text-sm text-gray-600">Bright, semi-private space with festive decor perfect for welcome drinks, dessert stations or kids tables for Christmas parties in Ashford, Staines and the Heathrow villages.</p>
              </div>
            </Card>
          </Grid>
          <div className="mt-10 text-sm text-gray-600 text-center space-y-2">
            <p>Free on-site parking for around 20 cars • Five minutes from Heathrow Terminal 5 • Ten minutes to Staines-upon-Thames • Outside the ULEZ • Also a handy Windsor Christmas party venue • Sheltered smoking area available</p>
            <p>
              Driving from farther afield?{' '}
              <Link href="/blog/cheap-heathrow-parking-alternatives" className="underline decoration-dotted hover:text-anchor-green transition-colors">Read our cheap Heathrow parking guide</Link>{' '}
              or{' '}
              <Link href="/heathrow-parking" className="underline decoration-dotted hover:text-anchor-green transition-colors">pre-book parking at The Anchor</Link>{' '}
              so your guests arrive without stress.
            </p>
          </div>
        </Container>
      </Section>

      <Section background="gray" spacing="md" container>
        <Container>
          <div className="max-w-3xl mx-auto space-y-6 text-center">
            <h2 className="text-3xl font-bold text-anchor-charcoal">Booking essentials</h2>
          </div>
          <div className="max-w-3xl mx-auto mt-8">
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 text-green-600" />Deposit GBP 10 per person to secure your festive booking – deposits are non-refundable.</li>
              <li className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 text-green-600" />Full pre-orders for every guest are required at least seven days before your meal.</li>
              <li className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 text-green-600" />We&apos;ll always try to help with last-minute changes, but we can&apos;t guarantee them once your order is confirmed.</li>
              <li className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 text-green-600" />Standard table time is two hours, with longer sittings available for larger parties.</li>
              <li className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 text-green-600" />An optional 10% service charge applies to tables of six or more.</li>
              <li className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 text-green-600" />Include any dietary requirements or allergies with your pre-order so we can provide suitable alternatives; some substitutions may carry a small surcharge.</li>
              <li className="flex items-start gap-3">
                <Icon name="check" className="mt-0.5 h-5 w-5 text-green-600" />
                <span>Need guest parking? Share our <Link href="/blog/cheap-heathrow-parking-alternatives" className="underline decoration-dotted hover:text-anchor-green transition-colors">cheap Heathrow parking tips</Link> or direct drivers to <Link href="/heathrow-parking" className="underline decoration-dotted hover:text-anchor-green transition-colors">pre-booked spaces at The Anchor</Link>.</span>
              </li>
            </ul>
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="md">
        <Container>
          <FAQAccordionWithSchema
            title="Christmas Party FAQs"
            faqs={FAQ_ITEMS}
            className="bg-gray-50"
          />
        </Container>
      </Section>

      <Section className="py-20 bg-gradient-to-b from-red-600 to-red-700 text-white">
        <Container>
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold">Ready to plan your Christmas at The Anchor?</h2>
            <p className="text-lg text-red-100 max-w-2xl mx-auto">
              Send your enquiry and we'll come back within one working day. Need a quicker answer? Call the team and we'll help right away.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                className="w-full md:w-auto"
                onClick={() => {
                  trackCtaClick({
                    id: 'christmas_final_dinner',
                    label: 'Request a Christmas Booking (up to 25)',
                    location: 'final_cta_band',
                    destination: 'enquiry_form',
                    mode: 'dinner'
                  })
                  handleOpenForm('dinner', {}, 'final_cta')
                }}
              >
                Request a Christmas Booking (up to 25)
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="w-full md:w-auto"
                onClick={() => {
                  trackCtaClick({
                    id: 'christmas_final_buffet',
                    label: 'Plan a Buffet Party (26+)',
                    location: 'final_cta_band',
                    destination: 'enquiry_form',
                    mode: 'buffet'
                  })
                  handleOpenForm('buffet', {}, 'final_cta')
                }}
              >
                Plan a Buffet Party (26+)
              </Button>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm">
              <button
                type="button"
                onClick={() => {
                  trackCtaClick({
                    id: 'christmas_final_phone_prompt',
                    label: 'Call The Anchor',
                    location: 'final_cta_band',
                    destination: 'enquiry_form',
                    mode: context.mode
                  })
                  handleOpenForm(context.mode, {}, 'final_cta_call_prompt')
                }}
                className="flex items-center gap-2 underline decoration-white/70 decoration-dotted"
              >
                <Icon name="phone" className="h-4 w-4 mr-2" /> Call {CONTACT_PHONE}
              </button>
              <button
                type="button"
                onClick={() => {
                  trackCtaClick({
                    id: 'christmas_final_email_prompt',
                    label: CONTACT_EMAIL,
                    location: 'final_cta_band',
                    destination: 'enquiry_form',
                    mode: context.mode
                  })
                  handleOpenForm(context.mode, {}, 'final_cta_email_prompt')
                }}
                className="flex items-center gap-2 underline decoration-white/70 decoration-dotted"
              >
                <Icon name="mail" className="h-4 w-4 mr-2" /> {CONTACT_EMAIL}
              </button>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="py-16 bg-white">
        <Container>
          <div ref={enquiryRef} id="christmas-enquiry" className="max-w-3xl mx-auto scroll-mt-32">
            <ChristmasEnquiryForm
              context={context}
              onContextChange={handleContextChange}
              onSuccess={handleFormSuccess}
            />
          </div>
        </Container>
      </Section>

      <ChristmasLightbox
        suppressed={formSubmitted}
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
  const [preferredTime, setPreferredTime] = useState('6:30 pm')
  const [notes, setNotes] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setPreferredTime(prev => prev || TIME_OPTIONS[2])
  }, [])

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
      trackFormStart({
        formName: 'christmas_main_enquiry_form',
        source: 'main_enquiry_section',
        mode: context.mode,
        journey: 'christmas_parties_page'
      })

      const response = await fetch('/api/enquiry/christmas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: context.mode,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          partySize: partySize.trim(),
          preferredDate,
          preferredTime,
          extras: context.extras,
          perks: context.perks,
          notes
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
        source: 'main_enquiry_section',
        mode: context.mode,
        journey: 'christmas_parties_page'
      })
      onSuccess()
      setStatus('success')
      setMessage("Thanks! We've sent your enquiry to the team and will be in touch very soon.")
      setName('')
      setEmail('')
      setPhone('')
      setPartySize('')
      setPreferredDate('')
      setPreferredTime('6:30 pm')
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

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-2xl font-bold text-anchor-charcoal mb-2">Send your Christmas enquiry</h3>
      <p className="text-sm text-gray-600">We reply within one working day (often sooner).</p>
      <p className="text-sm text-gray-600 mb-6">Prefer email?{' '}<a href={CONTACT_EMAIL_LINK} className="underline decoration-dotted">{CONTACT_EMAIL}</a></p>

      {status === 'success' && (
        <Alert variant="success" className="mb-6" title="Enquiry sent">
          {message}
        </Alert>
      )}

      {status === 'error' && (
        <Alert variant="error" className="mb-6" title="Please double-check">
          {message}
        </Alert>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${context.mode === 'dinner' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-anchor-charcoal border-gray-300 hover:bg-gray-100'}`}
            onClick={() => onContextChange({ mode: 'dinner' })}
          >
            Dinner (up to 25)
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${context.mode === 'buffet' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-anchor-charcoal border-gray-300 hover:bg-gray-100'}`}
            onClick={() => onContextChange({ mode: 'buffet' })}
          >
            Buffet (26+)
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full name *</label>
            <input
              type="text"
              value={name}
              onChange={event => setName(event.target.value)}
              autoComplete="name"
              placeholder="Your full name"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile *</label>
            <input
              type="tel"
              value={phone}
              onChange={event => setPhone(event.target.value)}
              autoComplete="tel"
              inputMode="tel"
              placeholder="Best number for a quick call"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Party size *</label>
            <input
              type="number"
              min={context.mode === 'buffet' ? 26 : 6}
              value={partySize}
              onChange={event => setPartySize(event.target.value)}
              placeholder="e.g. 18"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Preferred date *</label>
            <input
              type="date"
              value={preferredDate}
              onChange={event => setPreferredDate(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Preferred time *</label>
            <select
              value={preferredTime}
              onChange={event => setPreferredTime(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
            >
              {TIME_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        {(context.extras.length > 0 || context.perks.length > 0) && (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <Icon name="gift" className="mr-2 inline h-4 w-4" />
            We've noted your selected extras and offers for our reply.
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes / dietary requests</label>
          <textarea
            rows={4}
            value={notes}
            onChange={event => setNotes(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
            placeholder="Share dietary notes, entertainment ideas or anything else we should prepare for."
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-1" required />
          <span>I'm happy for The Anchor to contact me about this enquiry.</span>
        </label>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <Button type="submit" variant="primary" size="lg" className="w-full md:w-auto" disabled={submitting}>
            {submitting ? 'Sending…' : context.mode === 'dinner' ? 'Request my Christmas booking' : 'Plan my buffet party'}
          </Button>
          <a
            href={CONTACT_PHONE_LINK}
            className="flex items-center gap-2 text-sm text-gray-600 underline decoration-dotted"
          >
            Prefer to chat? Call {CONTACT_PHONE}
          </a>
        </div>
      </form>
    </div>
  )
}

function StickyEnquiryBar({ visible, context, onContextChange, onOpenForm }: StickyEnquiryBarProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null
  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 shadow-lg backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-sm font-semibold text-anchor-charcoal">
          <span className="hidden md:inline">Plan your Christmas:</span>
          <div className="flex gap-2 bg-gray-100 rounded-full p-1">
            {(['dinner', 'buffet'] as EnquiryMode[]).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => onContextChange({ mode })}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${context.mode === mode ? 'bg-red-600 text-white shadow-sm' : 'text-anchor-charcoal hover:bg-white'}`}
              >
                {mode === 'dinner' ? 'Dinner (≤25)' : 'Buffet (26+)'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            onClick={() => {
              trackCtaClick({
                id: 'christmas_sticky_open_form',
                label: 'Open enquiry form',
                location: 'sticky_enquiry_bar',
                destination: 'enquiry_form',
                mode: context.mode
              })
              onOpenForm(context.mode, 'sticky_bar_primary')
            }}
          >
            Open enquiry form
          </Button>
          <a
            href={CONTACT_PHONE_LINK}
            className="flex items-center gap-1 text-xs font-semibold text-red-700"
            onClick={() => {
              trackCtaClick({
                id: 'christmas_sticky_call',
                label: 'Call The Anchor',
                location: 'sticky_enquiry_bar',
                destination: 'phone',
                mode: context.mode
              })
              analytics.phoneCall(CONTACT_PHONE, 'christmas_sticky_bar')
            }}
          >
            <Icon name="phone" className="mr-2 h-4 w-4" /> Call {CONTACT_PHONE}
          </a>
          <a
            href={CONTACT_EMAIL_LINK}
            className="flex items-center gap-1 text-xs font-semibold text-red-700"
            onClick={() => {
              trackCtaClick({
                id: 'christmas_sticky_email',
                label: 'Email The Anchor',
                location: 'sticky_enquiry_bar',
                destination: 'email',
                mode: context.mode
              })
              analytics.emailClick(CONTACT_EMAIL, 'christmas_sticky_bar', undefined, '/christmas-parties')
            }}
          >
            <Icon name="mail" className="mr-2 h-4 w-4" /> Email us
          </a>
        </div>
      </div>
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
  const [submitting, setSubmitting] = useState(false)

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
        id: 'christmas_earlybird_lightbox',
        action: 'view',
        label: 'Early-Bird Lightbox',
        campaign: 'christmas_2026'
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
  }, [suppressed])

  const closeLightbox = () => {
    trackBannerEvent({
      id: 'christmas_earlybird_lightbox',
      action: 'dismiss',
      label: 'Early-Bird Lightbox',
      campaign: 'christmas_2026'
    })
    setVisible(false)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim() || !email.trim() || !phone.trim() || !partySize.trim() || !preferredDate.trim()) {
      setError('Please fill in all fields so we can hold your Early-Bird offer.')
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      trackFormStart({
        formName: 'christmas_earlybird_lightbox',
        source: 'lightbox',
        mode: context.mode,
        journey: 'christmas_parties_page'
      })

      const response = await fetch('/api/enquiry/christmas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: context.mode,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          partySize: partySize.trim(),
          preferredDate,
          preferredTime: 'Flexible',
          extras: context.extras,
          perks: union(context.perks, ['early-bird']),
          notes: 'Submitted via Early-Bird lightbox'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage = errorData?.error || 'Sorry, we could not hold your Early-Bird offer right now. Please call us on 01753 682707.'
        setError(errorMessage)
        return
      }

      markLocalStorage(ENQUIRY_STORAGE_KEYS.submitted, 'true')
      trackFormComplete({
        formName: 'christmas_earlybird_lightbox',
        source: 'lightbox',
        mode: context.mode,
        journey: 'christmas_parties_page'
      })
      onSubmitSuccess()
      setVisible(false)
      setName('')
      setEmail('')
      setPhone('')
      setPartySize('')
      setPreferredDate('')
    } catch (err) {
      console.error('Christmas lightbox submission failed:', err)
      setError("Sorry, something went wrong. Please call us on 01753 682707 and we'll secure your Early-Bird offer.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl relative">
        <button
          type="button"
          onClick={closeLightbox}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <Icon name="close" className="h-5 w-5" />
        </button>
        <div className="space-y-4">
          <Badge className="bg-red-100 text-red-700 w-fit">Early-Bird reminder</Badge>
          <h3 className="text-2xl font-bold text-anchor-charcoal">Early-Bird ends 31 Oct - shall we save you a spot?</h3>
          <p className="text-sm text-gray-600">Share a few details and we'll hold the free glass of Prosecco offer for you. We typically reply within one working day.</p>

          {error && (
            <Alert variant="error" title="Almost there" className="text-sm">
              {error}
            </Alert>
          )}

          <form className="space-y-3" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={event => setName(event.target.value)}
              autoComplete="name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
            <input
              type="tel"
              placeholder="Mobile"
              value={phone}
              onChange={event => setPhone(event.target.value)}
              autoComplete="tel"
              inputMode="tel"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min={context.mode === 'buffet' ? 26 : 6}
                placeholder="Party size"
                value={partySize}
                onChange={event => setPartySize(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
              />
              <input
                type="date"
                value={preferredDate}
                onChange={event => setPreferredDate(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
              />
            </div>
            <div className="flex gap-2">
              {(['dinner', 'buffet'] as EnquiryMode[]).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onContextChange({ mode })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${context.mode === mode ? 'bg-red-600 text-white border-red-600' : 'bg-white text-anchor-charcoal border-gray-300'}`}
                >
                  {mode === 'dinner' ? 'Dinner (≤25)' : 'Buffet (26+)'}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="primary" size="md" className="w-full">Send my request</Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="w-full"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = CONTACT_PHONE_LINK
                  }
                  setVisible(false)
                }}
              >
                Call us instead
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
