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
import { trackBannerEvent, trackCtaClick, trackEmailClick, trackFormComplete, trackFormStart, trackPhoneCallClick } from '@/lib/gtm-events'
import { CHRISTMAS_OPEN_FORM_EVENT } from './christmas-hero-ctas'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { ValueProofStrip, RegretReduction } from '@/components/psychology'
import { StickyDrawer, StickyDrawerTrigger } from '@/components/ui'
import { TestimonialSection } from '@/components/TestimonialSection'
import { CONTACT } from '@/lib/constants'

const CONTACT_EMAIL = CONTACT.email
const CONTACT_PHONE = CONTACT.phone
const CONTACT_PHONE_LINK = CONTACT.phoneHref
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

interface ChristmasOpenFormEventDetail {
  mode?: EnquiryMode
  source?: string
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
  { id: 'early-bird', label: 'Early-Bird: 20% off your food bill, book by 1 Oct (parties of 6+)' },
  { id: 'mid-week', label: 'Tue–Wed: complimentary coffee & mince pie with your festive dinner' }
]

const FESTIVE_PRICING = [
  {
    tier: 'Shared Christmas party nights (Tue–Thu)',
    price: '£36.95 per person',
    includes: 'Three-course festive menu with crackers, candles, background playlist and optional Prosecco upgrade. Join other groups for the buzz of a proper Christmas party night out.'
  },
  {
    tier: 'Weekend private hire dinners (Fri–Sat)',
    price: '£39.95 per person',
    includes: 'Private dining room or main bar layout, late bar option until midnight, and room for DJs or live entertainment. Your Christmas party, your way.'
  },
  {
    tier: 'Festive buffets (26+ guests)',
    price: 'From £13 per person',
    includes: 'Three festive buffet tiers: sandwich buffet (£13pp), hot finger buffet (£16pp), or premium grazing (£19pp). Great for standing receptions and team gatherings.'
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
    question: "How much does a Christmas party cost?",
    answer: "Mid-week three-course Christmas dinners start at £36.95 per person. Weekend private dinners run from £39.95 per person. Festive buffets start from £13 per person. Room hire applies separately and varies by date and party size. Call us on 01753 682707 for a quote tailored to your group."
  },
  {
    question: "Can I combine the early bird offer with the festive offer?",
    answer: "No, our offers cannot be combined. If you take the early bird discount, the festive offer won't apply on top, and vice versa. Each offer is great value on its own though."
  },
  {
    question: "Is there a minimum group size?",
    answer: "Our festive menu is available for Christmas parties of six or more. Smaller groups are welcome to join us from the a la carte menu."
  },
  {
    question: "Are you close to Heathrow and Staines?",
    answer: "Yes, seven minutes from Heathrow Terminal 5, around fifteen from Terminal 2 and eight minutes from Staines-upon-Thames. We're an easy-to-reach Christmas party venue for Ashford, Windsor, west London and the Heathrow villages."
  },
  {
    question: "Can we bring our own food?",
    answer: "Celebration cakes are welcome. Other external catering needs advance approval plus a signed food safety waiver and the supplier's liability insurance."
  },
  {
    question: "Can you run a bar tab for our group?",
    answer: "Absolutely. We'll pre-set a bar tab with your budget and keep you updated through the night. Advance invoicing is also available."
  },
  {
    question: "How do guests travel from Heathrow hotels or terminals?",
    answer: "A taxi from Heathrow T5 takes around seven minutes and typically costs £18–22. We're fifteen minutes from Terminal 2 and have room for mini-coaches."
  },
  {
    question: "What entertainment can we have?",
    answer: "Festive playlists through our sound system, or bring your own. Live bands, DJs, quizzes and karaoke are all welcome with a bit of notice."
  },
  {
    question: "Is parking available?",
    answer: "Around 20 free spaces on-site, seven minutes from Heathrow T5. You're welcome to leave cars overnight and collect them the next day."
  },
  {
    question: "How do you handle dietary requests?",
    answer: "Vegetarian, vegan, gluten-free and other dietary requirements are happily accommodated. Include the details on your pre-order so the kitchen can prepare suitable alternatives."
  },
  {
    question: "What is a shared Christmas party night?",
    answer: "Shared Christmas party nights run Tuesday to Thursday through December. Your group gets its own table with crackers and festive decor, but you share the pub atmosphere with other parties. Brilliant for smaller teams of six to twelve who want the buzz of a big night out without booking the whole venue."
  },
  {
    question: "Can we have exclusive use of the whole pub?",
    answer: "Yes, full venue hire is available for parties of 60 or more on selected dates, typically midweek. You get the run of the bar, dining room and conservatory with your own playlist or live entertainment. Get in touch early, exclusive-use dates go fast."
  },
  {
    question: "Do you offer corporate Christmas party packages near Heathrow?",
    answer: "We do. Our corporate packages include VAT invoicing, a simple pre-order system for your team, and a dedicated point of contact. We're seven minutes from Heathrow T5 and two minutes from M25 J14, so colleagues from different offices get here easily."
  },
  {
    question: "Can we book a Christmas party for just drinks, no food?",
    answer: "Yes. We can reserve an area for a drinks-only celebration and set up a pre-paid bar tab. Add nibbles or a buffet later if you change your mind, we're flexible."
  },
  {
    question: "What time do Christmas parties start and finish?",
    answer: "Most festive dinners begin between 6 pm and 7:30 pm with a two-hour table reservation. Longer sittings and late-bar extensions until midnight are available for larger groups. Christmas lunches typically start from 12 pm. Buffet parties can run later by arrangement."
  },
  {
    question: "Is The Anchor outside the ULEZ zone?",
    answer: "Yes, we're outside the ULEZ boundary, saving your guests £12.50 per vehicle compared to driving into London. Free parking on-site makes us one of the most accessible Christmas party venues near Heathrow."
  },
  {
    question: "Can we book a Christmas lunch instead of dinner?",
    answer: "Absolutely. We serve the same festive menu at lunchtime and in the evening, so a Christmas lunch here is every bit as generous as the dinner service. Midweek Christmas lunches are particularly popular with office teams who want to celebrate during the day and still get home at a sensible hour. If you've been searching for a Christmas lunch near me or a festive lunch in Surrey, you've found the right pub."
  },
  {
    question: "What's the difference between a Christmas do and a shared party night?",
    answer: "They're the same thing by a different name. A shared Christmas party night means your group has its own table and festive setup, but you share the pub with other parties, so there's a great atmosphere without needing to fill the whole venue. Whether you call it your works Christmas do, your staff Christmas party or just \"the annual night out,\" the format works brilliantly for groups of six to twenty-five."
  },
  {
    question: "Do you serve a festive menu outside of party bookings?",
    answer: "Our festive menu runs throughout December for pre-booked parties of six or more. If you're after a Christmas meal for a smaller group, our regular menu features plenty of seasonal specials. For a full festive dinner or festive lunch with all the trimmings, book a party of six or more and you'll get the complete Christmas experience."
  },
  {
    question: "Can I find you by searching \"xmas party near me\"?",
    answer: "Yes, whether you search for \"xmas party near me,\" \"Christmas party near me\" or \"Christmas lunch near me,\" you'll find us. We're in Stanwell Moor, Surrey, seven minutes from Heathrow Terminal 5 and ten minutes from Staines-upon-Thames. The postcode is TW19 6AQ if you want to check the drive time from your office."
  }
]

const WHY_BOOK_REASONS = [
  {
    icon: 'car' as const,
    title: 'Free Parking for Every Guest',
    description: 'Around 20 free spaces on-site, no meters, no charges, no stress. Leave the car overnight and collect it the next morning. That alone makes us one of the easiest Christmas party venues near Heathrow to get to.'
  },
  {
    icon: 'mapPin' as const,
    title: '7 Minutes from Heathrow T5',
    description: 'The closest traditional pub to Heathrow Airport. Two minutes from M25 Junction 14. Whether your guests are coming from terminals, business parks or airport hotels, they\'ll find us fast.'
  },
  {
    icon: 'shield' as const,
    title: 'Outside the ULEZ Zone',
    description: 'Save your guests £12.50 each compared to driving into London. Combined with free parking, we\'re one of the most affordable Christmas party venues in Surrey.'
  },
  {
    icon: 'users' as const,
    title: 'Private Spaces for Every Size',
    description: 'Intimate dining room for up to 25, main bar for larger groups, full venue hire for up to 60 seated and 200 standing. We shape the space around your party, not the other way round.'
  },
  {
    icon: 'heart' as const,
    title: 'A Proper Village Pub Christmas',
    description: 'No soulless hotel function rooms. No identikit chains. A genuine village local with real fires, warm hospitality and food that actually tastes of Christmas. This is what a Christmas do should feel like.'
  },
  {
    icon: 'briefcase' as const,
    title: 'Easy for Organisers',
    description: 'Simple pre-order system (no spreadsheets), VAT invoices for accounts, a dedicated contact for your booking, and a £40 voucher for the organiser when you bring 20 or more.'
  }
]

const PARTY_IDEAS = [
  {
    title: 'Quiz Night Christmas Special',
    description: 'Our resident quizmaster runs a festive quiz packed with Christmas music rounds, picture rounds and general knowledge. Teams of up to eight compete for prizes and bragging rights. Add a buffet or sit-down dinner before the quiz kicks off.',
    ideal: 'Teams of 12–60 who love friendly competition'
  },
  {
    title: 'Music Bingo Christmas Edition',
    description: 'Bingo, but you\'re listening for Christmas songs instead of numbers. Dab your card when your tune plays. Get a line or full house and win prizes. Surprisingly competitive, and it gets the whole room singing.',
    ideal: 'Mixed groups who want something different and inclusive'
  },
  {
    title: 'Karaoke Christmas Party',
    description: 'Professional setup with over 50,000 songs including every Christmas classic you can think of. Picture the boss belting out Fairytale of New York after a couple of mulled wines. Book the main bar for a full karaoke takeover.',
    ideal: 'Office groups and friend circles who aren\'t afraid of the mic'
  },
  {
    title: 'Live Band Christmas Celebration',
    description: 'Hire a live band or acoustic act to perform during your party. We\'ve got solid acoustics, a dedicated performance area and a late bar licence until midnight. We can recommend local acts or you\'re welcome to bring your own.',
    ideal: 'Larger groups of 30+ who want a proper party atmosphere'
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
  const [drawerOpen, setDrawerOpen] = useState(false)
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
      openDrawer()
    })
  }, [openDrawer])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleHeroOpenForm = (event: Event) => {
      const customEvent = event as CustomEvent<ChristmasOpenFormEventDetail>
      const mode = customEvent.detail?.mode === 'buffet' ? 'buffet' : 'dinner'
      const source = customEvent.detail?.source || 'christmas_hero'
      handleOpenForm(mode, {}, source)
    }

    window.addEventListener(CHRISTMAS_OPEN_FORM_EVENT, handleHeroOpenForm as EventListener)
    return () => {
      window.removeEventListener(CHRISTMAS_OPEN_FORM_EVENT, handleHeroOpenForm as EventListener)
    }
  }, [handleOpenForm])

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

  return (
    <>
      <Section className="py-2 md:py-3 bg-red-700 text-white">
        <Container>
          <div className="flex flex-col items-center justify-center gap-3 text-center md:flex-row md:gap-6">
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex items-center gap-2">
                <Icon name="sparkles" className="h-5 w-5" />
                <p className="text-sm md:text-base font-semibold">
                  Book by 1 Oct and take 20% off your food bill, that's every adult in parties of six or more.
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

      <StickyDrawerTrigger
        onClick={() => handleOpenForm(context.mode, {}, 'sticky_trigger')}
        visible={stickyVisible && !drawerOpen}
        position="bottom-right"
        testId="christmas-enquiry-trigger"
      >
        <span className="flex items-center gap-2">
          <Icon name="mail" className="h-5 w-5" />
          Enquire Now
        </span>
      </StickyDrawerTrigger>

      <Section background="white" spacing="md" container>
        <Container>
          <Grid cols={3} gap="md">
            <Card className="h-full">
              <div className="p-6 space-y-3 text-center">
                <Icon name="calendar" className="mx-auto h-8 w-8 text-red-600" />
                <h3 className="text-lg font-semibold text-anchor-cream-text">Mid-week Christmas meals from £36.95</h3>
                <p className="text-sm text-anchor-cream-text/70">Tue–Thu three-course festive dinners for £36.95 per person. The same generous menu, the same crackers and candles, just a kinder price tag for your Christmas do.</p>
              </div>
            </Card>
            <Card className="h-full">
              <div className="p-6 space-y-3 text-center">
                <Icon name="utensils" className="mx-auto h-8 w-8 text-red-600" />
                <h3 className="text-lg font-semibold text-anchor-cream-text">Yorkies, pigs in blankets & all the trimmings</h3>
                <p className="text-sm text-anchor-cream-text/70">Every Christmas meal arrives with herb-crusted triple-cooked roast potatoes, seasonal veg, sage & onion stuffing, Yorkshire puddings and our signature gravy. No shortcuts.</p>
              </div>
            </Card>
            <Card className="h-full">
              <div className="p-6 space-y-3 text-center">
                <Icon name="gift" className="mx-auto h-8 w-8 text-red-600" />
                <h3 className="text-lg font-semibold text-anchor-cream-text">Crackers, candles & proper festive warmth</h3>
                <p className="text-sm text-anchor-cream-text/70">Tables dressed for Christmas with crackers and candlelight. A real village pub with character, not a chain restaurant with tinsel.</p>
              </div>
            </Card>
          </Grid>
        </Container>
      </Section>

      <Section background="gray" spacing="md">
        <Container>
          <div className="mx-auto max-w-5xl space-y-4 text-center">
            <h2 className="text-3xl font-bold text-anchor-cream-text">2026 Christmas party packages &amp; pricing</h2>
            <p className="text-base text-anchor-cream-text/70">
              Whether you're after a shared Christmas party night, a private festive dinner or a buffet for the whole department, we've got transparent per-person pricing with no hidden hire fees. Pick your Christmas party package, then send your enquiry to lock in a date.
            </p>
          </div>
          <div className="mt-8 overflow-hidden rounded-2xl border border-anchor-gold-dark/15 bg-anchor-green-card">
            <table className="w-full text-left text-sm text-anchor-cream-text/70">
              <thead className="bg-anchor-green-raised text-anchor-cream-text text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">Package</th>
                  <th className="px-4 py-3">Pricing</th>
                  <th className="px-4 py-3">What&apos;s included</th>
                </tr>
              </thead>
              <tbody>
                {FESTIVE_PRICING.map(row => (
                  <tr key={row.tier} className="border-t border-anchor-gold-dark/15">
                    <td className="px-4 py-4 font-semibold text-anchor-cream-text">{row.tier}</td>
                    <td className="px-4 py-4 text-anchor-gold-bright font-semibold">{row.price}</td>
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
              variant="outline"
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
            <h2 className="text-2xl font-bold text-anchor-cream-text">Christmas party venue minutes from Heathrow, Staines &amp; Surrey</h2>
            <p className="text-base text-anchor-cream-text/70">
              The Anchor is one of the most popular Christmas party venues in Surrey for a reason, we're seven minutes from Heathrow Terminal 5, fifteen from Terminal 2 and just over the river from Windsor. Airport teams, Staines offices and Surrey neighbours celebrate here without the stress of city travel. If you're searching for Christmas parties near Heathrow or a Christmas lunch in Surrey, you've found the right place.
            </p>
            <p className="text-sm text-anchor-cream-text/70">
              We're also one of the best-value options around. Mid-week Christmas dinners start at £36.95 for a full three-course meal with all the trimmings, and festive lunches run on the same menu, so whether your team wants a Christmas lunch near Staines or an evening works Christmas do after shifts, the price stays fair. As a Christmas party venue outside the ULEZ zone with free parking, we save your guests money before they've even ordered a drink. That's why Heathrow crews, Poyle business park teams and west London groups book us year after year.
            </p>
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="sm">
        <Container>
          <div className="mx-auto max-w-4xl text-center space-y-5">
            <h3 className="text-xl font-semibold text-anchor-cream-text">Planning from a nearby town?</h3>
            <p className="text-sm text-anchor-cream-text/70">
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
                  className="rounded-full border border-anchor-gold-dark/15 px-4 py-2 text-sm font-semibold text-anchor-cream-text/70 transition hover:border-anchor-gold-dark hover:text-anchor-gold-dark"
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
            <h2 className="text-3xl font-bold text-anchor-cream-text">Christmas pricing at a glance</h2>
            <div className="overflow-hidden rounded-2xl border border-anchor-gold-dark/15 bg-anchor-green-card">
              <table className="w-full text-left text-sm md:text-base text-anchor-cream-text/70">
                <tbody>
                  <tr className="border-b border-anchor-gold-dark/15 bg-anchor-green-raised">
                    <th className="px-4 py-4 font-semibold text-anchor-cream-text">Tue-Thu</th>
                    <td className="px-4 py-4 font-bold text-anchor-gold-bright">£36.95 per person</td>
                  </tr>
                  <tr className="border-b border-anchor-gold-dark/15">
                    <th className="px-4 py-4 font-semibold text-anchor-cream-text">Fri-Sat</th>
                    <td className="px-4 py-4 font-bold text-anchor-gold-bright">£39.95 per person</td>
                  </tr>
                  <tr>
                    <th className="px-4 py-4 font-semibold text-anchor-cream-text">Children (under 12)</th>
                    <td className="px-4 py-4">2 courses £12.95 · 3 courses £15.95</td>
                  </tr>
                </tbody>
              </table>
              <p className="px-4 py-4 text-sm text-anchor-cream-text/70 border-t border-anchor-gold-dark/15">
                Our festive menu is available for parties of six or more. A £10 per person deposit secures your Christmas party booking and is non-refundable. Full pre-orders for every guest are due seven days in advance, we&apos;ll do our best with late changes but can&apos;t guarantee them. Flag dietary requirements when you order so we can prepare suitable alternatives; some substitutions may carry a small surcharge. Tables are reserved for two hours as standard.
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

      <Section background="white" spacing="md" className="bg-anchor-green-card">
        <Container>
          <div className="grid items-start gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <Badge className="bg-red-100 text-red-700 w-fit">Festive 3-course set menu</Badge>
              <h2 className="text-3xl font-bold text-anchor-cream-text">Our festive menu</h2>
              <p className="text-sm italic text-anchor-cream-text/70 mb-2">Sample menu, 2026 selection confirmed in October</p>
              <p className="text-base sm:text-lg text-anchor-cream-text/70">
                Three generous courses that feel like Christmas at home, just with someone else doing the washing up. Whether you're booking a festive dinner for Friday night or a Christmas lunch for the team on a Tuesday, every main arrives with herb-crusted triple-cooked roast potatoes, seasonal vegetables, Yorkshire puddings, pigs in blankets, sage &amp; onion stuffing and our signature gravy. It's the same festive menu for lunch and dinner, so your Christmas meal tastes just as good at midday.
              </p>
              <p className="text-sm text-anchor-gold-dark font-semibold">Available for festive parties of six or more guests.</p>
              <div className="space-y-5 text-left">
                <div className="rounded-2xl border border-anchor-gold-dark/15 bg-anchor-green-raised p-5 space-y-3">
                  <h3 className="text-lg font-semibold text-anchor-cream-text">Starter</h3>
                  <ul className="space-y-3 text-sm text-anchor-cream-text/70">
                    <li>
                      <p className="font-semibold text-anchor-cream-text">Classic prawn cocktail</p>
                      <p className="text-anchor-cream-text/70">North Atlantic prawns layered with crisp gem lettuce, tangy Marie Rose sauce and freshly baked rolls.</p>
                    </li>
                    <li>
                      <p className="font-semibold text-anchor-cream-text">Chicken liver pâté</p>
                      <p className="text-anchor-cream-text/70">Silky chicken liver pâté with caramelised onion chutney and freshly baked rolls for spreading.</p>
                    </li>
                    <li>
                      <p className="font-semibold text-anchor-cream-text">Leek, potato &amp; West Country Cheddar soup (v)</p>
                      <p className="text-anchor-cream-text/70">Silky leek and potato soup enriched with tangy West Country Cheddar, soft potato pieces, a splash of cream and freshly baked rolls on the side.</p>
                    </li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-anchor-gold-dark/15 bg-anchor-green-raised p-5 space-y-3">
                  <h3 className="text-lg font-semibold text-anchor-cream-text">Main</h3>
                  <p className="text-sm text-anchor-cream-text/70">All served with Christmas trimmings.</p>
                  <ul className="space-y-3 text-sm text-anchor-cream-text/70">
                    <li>
                      <p className="font-semibold text-anchor-cream-text">Festive roast turkey &amp; Christmas trimmings</p>
                      <p className="text-anchor-cream-text/70">Hand-carved British turkey breast with sage &amp; onion stuffing, pigs in blankets and a homemade Yorkshire pudding, served with herb-crusted triple-cooked roast potatoes, seasonal vegetables and plenty of our signature gravy.</p>
                    </li>
                    <li>
                      <p className="font-semibold text-anchor-cream-text">Roasted beef &amp; Christmas trimmings</p>
                      <p className="text-anchor-cream-text/70">Rich and full of flavour, served with golden triple-cooked herb-crusted roast potatoes, a fluffy Yorkshire pudding, oven-roasted carrots and parsnips, buttery sauteed cabbage and our signature gravy.</p>
                    </li>
                    <li>
                      <p className="font-semibold text-anchor-cream-text">Roasted pork &amp; Christmas trimmings</p>
                      <p className="text-anchor-cream-text/70">Juicy roasted pork with proper home-cooked flavour, served with golden triple-cooked herb-crusted roast potatoes, a fluffy Yorkshire pudding, oven-roasted carrots and parsnips, buttery sauteed cabbage and our signature gravy.</p>
                    </li>
                    <li>
                      <p className="font-semibold text-anchor-cream-text">Beetroot &amp; butternut squash Wellington &amp; Christmas trimmings (VG)</p>
                      <p className="text-anchor-cream-text/70">Golden puff pastry filled with beetroot and butternut squash, baked with caramelised onions and rosemary, served with herb-crusted triple-cooked roast potatoes, seasonal vegetables, sage &amp; onion stuffing, Yorkshire pudding and our signature gravy.</p>
                      <p className="text-xs text-anchor-cream-text/55">Vegan option served without Yorkshire pudding.</p>
                    </li>
                  </ul>
                  <p className="mt-3 text-xs text-anchor-cream-text/55">Vegetarian gravy available on request for every main course.</p>
                </div>
                <div className="rounded-2xl border border-anchor-gold-dark/15 bg-anchor-green-raised p-5 space-y-3">
                  <h3 className="text-lg font-semibold text-anchor-cream-text">Dessert</h3>
                  <ul className="space-y-3 text-sm text-anchor-cream-text/70">
                    <li>
                      <p className="font-semibold text-anchor-cream-text">Steamed Christmas pudding</p>
                      <p className="text-anchor-cream-text/70">Traditional fruit pudding steamed until glossy, served warm with pouring cream and a sparkle of festive redcurrants.</p>
                    </li>
                    <li>
                      <p className="font-semibold text-anchor-cream-text">Winter berry cheesecake</p>
                      <p className="text-anchor-cream-text/70">Silky vanilla cheesecake on a buttery biscuit base, finished with a jewel-bright berry compote and pillows of whipped cream.</p>
                    </li>
                    <li>
                      <p className="font-semibold text-anchor-cream-text">Indulgent chocolate fudge cake</p>
                      <p className="text-anchor-cream-text/70">Moist chocolate sponge layered with silky fudge icing, served warm with pouring cream or custard for pure comfort. Vegetarian friendly.</p>
                    </li>
                  </ul>
                  <p className="text-xs text-anchor-cream-text/70">Prefer cheese? Swap dessert for our farmhouse cheeseboard (+£3) or add it as a fourth course for £7.95.</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-anchor-green-raised px-4 py-2 text-sm font-semibold text-anchor-gold-bright">
                <Icon name="star" className="h-4 w-4" /> All mains arrive family-style with Yorkshire puddings, pigs in blankets, herb-crusted triple-cooked roast potatoes, seasonal vegetables, sage &amp; onion stuffing and plenty of our signature gravy.
              </div>
            </div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-anchor-gold-dark/15">
              <Image
                src="/images/page-headers/christmas-parties/2026/trimmings-board.jpg"
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
            <h2 className="text-3xl font-bold text-anchor-cream-text">Build your Christmas feast your way</h2>
            <p className="text-anchor-cream-text/70">
              Add sharing platters and drinks bundles to round off your festive meal. Let us know what you'd like and we'll have everything waiting on the table when you arrive.
            </p>
          </div>

          <Grid cols={2} gap="lg" className="mt-10 items-start">
            <Card>
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-semibold text-anchor-cream-text flex items-center gap-2">
                  <Icon name="gift" className="h-6 w-6 text-red-600" />
                  Trimmings & extras
                </h3>
                <ul className="space-y-2 text-sm text-anchor-cream-text/70">
                  <li>All the Trimmings Board (serves 4) - £11.95</li>
                  <li>XL Trimmings Board (serves 8) - £21.95</li>
                  <li>Pigs in blankets (3) - £3.95pp</li>
                  <li>Stuffing balls (2) - £2.95pp</li>
                  <li>Cauli cheese pot - £3.95pp</li>
                  <li>Extra herb-crusted triple-cooked roast potatoes & gravy - £2.95pp</li>
                  <li>Extra Yorkshire puddings (2) - £2.50pp</li>
                </ul>
              </div>
            </Card>
            <Card>
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-semibold text-anchor-cream-text flex items-center gap-2">
                  <Icon name="wine" className="h-6 w-6 text-red-600" />
                  Drinks & finale
                </h3>
                <ul className="space-y-2 text-sm text-anchor-cream-text/70">
                  <li>Bundle A: Prosecco arrival + coffee & mince pie - £9.95pp (counts towards the £45-£52 spend target)</li>
                  <li>Wine bundle: 2 bottles of house wine - £39.00</li>
                  <li>Beer bucket (6 × 330ml) - £27.00</li>
                  <li>Pre-set bar tab with running updates</li>
                  <li>Invoicing available for corporate groups</li>
                </ul>
              </div>
            </Card>
          </Grid>

          <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4">
            <Button variant="primary" size="md" onClick={handleAddFeastExtras}>Add to my enquiry</Button>
            <p className="text-sm text-anchor-cream-text/70">Tell us what you fancy and we'll have it ready when you arrive.</p>
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
            <h2 className="text-3xl font-bold text-anchor-cream-text">Seasonal offers & perks</h2>
            <p className="text-anchor-cream-text/70">
              Choose the extras that suit your celebration and include them in your Christmas party booking.
            </p>
          </div>

          <Grid cols={2} gap="md" className="mt-10">
            {PERK_OPTIONS.map(option => (
              <Card key={option.id} className="h-full">
                <div className="p-6 space-y-3">
                  <Badge className="bg-red-600 text-white w-fit">Festive offer</Badge>
                  <h3 className="text-lg font-semibold text-anchor-cream-text">{option.label.split(':')[0]}</h3>
                  <p className="text-sm text-anchor-cream-text/70">{option.label.split(':')[1]?.trim() || ''}</p>
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
            <h2 className="text-3xl font-bold text-anchor-cream-text">Festive buffets for 26 or more guests</h2>
            <p className="text-anchor-cream-text/70">
              Standing receptions, quiz nights, team gatherings, buffets keep things relaxed. Food is laid out for 90 minutes with hot dishes refreshed for the first hour, giving you a flexible Christmas party format that works for afternoon celebrations and late-night dos alike.
            </p>
          </div>

          <Grid cols={3} gap="md" className="mt-10">
            {[
              {
                title: 'Festive Sandwich & Salad',
                price: '£10.95 per person',
                description: 'Seasonal sandwich platters with turkey, stuffing & cranberry alongside house favourites, mixed leaf salad, crisps, crudites and dips.'
              },
              {
                title: 'Festive Hot Finger',
                price: '£13.95 per person',
                description: 'Everything from the sandwich tier plus chicken goujons, pigs in blankets, sausage rolls, mini pizzas, spring rolls and dipping sauces.'
              },
              {
                title: 'Festive Premium Grazing',
                price: '£16.95 per person',
                description: 'Cured meats and cheese boards with freshly baked rolls, salads, and hot bites including pigs in blankets, mini quiches, sausage rolls and spring rolls.'
              }
            ].map(tier => (
              <Card key={tier.title} className="h-full">
                <div className="p-6 space-y-3">
                  <Badge className="bg-red-100 text-red-700 w-fit">{tier.price}</Badge>
                  <h3 className="text-lg font-semibold text-anchor-cream-text">{tier.title}</h3>
                  <p className="text-sm text-anchor-cream-text/70">{tier.description}</p>
                </div>
              </Card>
            ))}
          </Grid>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-anchor-cream-text flex items-center gap-2">
                  <Icon name="gift" className="h-5 w-5 text-red-600" />
                  Add-on platters
                </h3>
                <ul className="space-y-2 text-sm text-anchor-cream-text/70">
                  <li>Pigs in blankets (tray of 50) - £39</li>
                  <li>Stuffing balls (tray of 40) - £28</li>
                  <li>Broccoli cheese (serves ~12) - £24</li>
                  <li>Gourmet broccoli cheese with truffle crumb (serves ~12) - £36</li>
                  <li>Roast potatoes & gravy (serves ~12) - £19</li>
                  <li>Mini Yorkshire puddings with gravy (24) - £22</li>
                </ul>
              </div>
            </Card>
            <Card>
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-anchor-cream-text flex items-center gap-2">
                  <Icon name="coffee" className="h-5 w-5 text-red-600" />
                  Dessert & drinks stations
                </h3>
                <ul className="space-y-2 text-sm text-anchor-cream-text/70">
                  <li>Festive dessert bites - Small £24 (serves ~12) · Large £45 (serves ~24)</li>
                  <li>Coffee & mince pie station - £3.50 per person</li>
                  <li>Unlimited tea & coffee - £4.49 per person</li>
                  <li>Welcome drink (Prosecco or orange juice) - £6.99 per person</li>
                  <li>Unlimited kids' squash - £2.50 per child</li>
                  <li>Pre-paid bar tab available with agreed limit</li>
                </ul>
              </div>
            </Card>
            <Card>
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-anchor-cream-text flex items-center gap-2">
                  <Icon name="clock" className="h-5 w-5 text-red-600" />
                  Service notes
                </h3>
                <ul className="space-y-2 text-sm text-anchor-cream-text/70">
                  <li>Designed for groups of 26+ with a 90-minute buffet window.</li>
                  <li>Hot options refreshed for the first 60 minutes.</li>
                  <li>Deposit £10 per person, pre-order 7 days ahead, final numbers 72 hours prior.</li>
                  <li>Optional 10% service charge for parties of 6+.</li>
                  <li>Vegetarian, vegan and gluten-free swaps available.</li>
                </ul>
              </div>
            </Card>
          </div>

          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="relative aspect-[4/3] w-full md:w-1/2 overflow-hidden rounded-2xl border border-anchor-gold-dark/15">
              <Image
                src="/images/events/christmas/christmas-buffet-table.jpg"
                alt="Festive buffet spread for Heathrow Christmas parties at The Anchor"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="md:w-1/2 space-y-4 text-left">
              <h3 className="text-2xl font-bold text-anchor-cream-text">Ready to feed a crowd?</h3>
              <p className="text-sm text-anchor-cream-text/70">Ready to feed a crowd? We'll dress the buffet tables with signage, festive decor and all condiments. Tell us your guest count and we'll suggest the right tier and add-ons.</p>
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
                <h3 className="text-lg font-semibold text-anchor-cream-text">Private Dining Room</h3>
                <p className="text-sm text-anchor-cream-text/70">Seat up to 25 guests with cosy decor and direct table service. Ideal for a Christmas lunch with family, an intimate works do or a small staff Christmas party away from the main bar.</p>
              </div>
            </Card>
            <Card className="h-full">
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-anchor-cream-text">Main Bar & Dining</h3>
                <p className="text-sm text-anchor-cream-text/70">Flexible layouts for larger celebrations, sit-down dinners, buffet-style evenings or standing receptions. We'll shape the room to fit your Christmas party, whether it's 30 or 60 guests.</p>
              </div>
            </Card>
            <Card className="h-full">
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-anchor-cream-text">Light-filled Conservatory</h3>
                <p className="text-sm text-anchor-cream-text/70">Bright, semi-private space perfect for welcome drinks, dessert stations or children's tables. Works beautifully for afternoon Christmas lunches when you want natural daylight.</p>
              </div>
            </Card>
          </Grid>
          <div className="mt-10 text-sm text-anchor-cream-text/70 text-center space-y-2">
            <p>Free on-site parking for around 20 cars · Seven minutes from Heathrow Terminal 5 · Ten minutes to Staines-upon-Thames · Outside the ULEZ · Sheltered smoking area</p>
            <p>
              Driving from farther afield?{' '}
              <Link href="/blog/cheap-heathrow-parking-alternatives" className="underline decoration-dotted hover:text-anchor-gold-dark transition-colors">Read our cheap Heathrow parking guide</Link>{' '}
              or{' '}
              <Link href="/heathrow-parking" className="underline decoration-dotted hover:text-anchor-gold-dark transition-colors">pre-book parking at The Anchor</Link>{' '}
              so your guests arrive stress-free.
            </p>
          </div>
        </Container>
      </Section>

      <Section background="gray" spacing="md" container>
        <Container>
          <div className="max-w-3xl mx-auto space-y-6 text-center">
            <h2 className="text-3xl font-bold text-anchor-cream-text">Booking essentials</h2>
          </div>
          <div className="max-w-3xl mx-auto mt-8">
            <ul className="space-y-3 text-sm text-anchor-cream-text/70">
              <li className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 text-anchor-gold-bright" />A £10 per person deposit secures your Christmas party booking. Deposits are non-refundable.</li>
              <li className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 text-anchor-gold-bright" />Full pre-orders for every guest are due at least seven days before your Christmas meal.</li>
              <li className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 text-anchor-gold-bright" />We&apos;ll always try to accommodate last-minute changes, but once your order is confirmed we can&apos;t guarantee them.</li>
              <li className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 text-anchor-gold-bright" />Standard table time is two hours. Longer sittings available for larger parties.</li>
              <li className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 text-anchor-gold-bright" />An optional 10% service charge applies to tables of six or more.</li>
              <li className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 text-anchor-gold-bright" />Include dietary requirements or allergies with your pre-order so the kitchen can prepare suitable alternatives. Some substitutions may carry a small surcharge.</li>
              <li className="flex items-start gap-3">
                <Icon name="check" className="mt-0.5 h-5 w-5 text-anchor-gold-bright" />
                <span>Guests driving? Share our <Link href="/blog/cheap-heathrow-parking-alternatives" className="underline decoration-dotted hover:text-anchor-gold-dark transition-colors">cheap Heathrow parking tips</Link> or point them to <Link href="/heathrow-parking" className="underline decoration-dotted hover:text-anchor-gold-dark transition-colors">pre-booked spaces at The Anchor</Link>.</span>
              </li>
            </ul>
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="md">
        <Container>
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-anchor-cream-text">Why book your Christmas party at The Anchor?</h2>
              <p className="text-base text-anchor-cream-text/70 max-w-3xl mx-auto">
                We've been hosting Christmas parties near Heathrow for years, and people keep coming back. Whether you're planning a staff Christmas party for airport colleagues, a festive lunch for the team or a Friday-night Christmas do with mates from Staines, here's why The Anchor is the Christmas party venue Surrey groups choose again and again.
              </p>
            </div>
            <Grid cols={3} gap="md">
              {WHY_BOOK_REASONS.map(reason => (
                <Card key={reason.title} className="h-full">
                  <div className="p-6 space-y-3">
                    <Icon name={reason.icon} className="h-8 w-8 text-red-600" />
                    <h3 className="text-lg font-semibold text-anchor-cream-text">{reason.title}</h3>
                    <p className="text-sm text-anchor-cream-text/70">{reason.description}</p>
                  </div>
                </Card>
              ))}
            </Grid>
          </div>
        </Container>
      </Section>

      <Section background="gray" spacing="md">
        <Container>
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <Badge className="bg-red-100 text-red-700 w-fit mx-auto">Corporate &amp; office parties</Badge>
              <h2 className="text-3xl font-bold text-anchor-cream-text">Office Christmas party venue near Heathrow</h2>
              <p className="text-base text-anchor-cream-text/70 max-w-3xl mx-auto">
                Been tasked with organising the works Christmas do? You need somewhere everyone can get to, food that's actually good, and a bill that won't make finance wince. We make all three easy, and we've been hosting office Christmas parties for Heathrow businesses, Poyle teams and Surrey offices for years.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-anchor-cream-text">Why offices choose us</h3>
                <ul className="space-y-3 text-sm text-anchor-cream-text/70">
                  <li className="flex items-start gap-3">
                    <Icon name="check" className="mt-0.5 h-5 w-5 text-anchor-gold-bright flex-shrink-0" />
                    <span><strong className="text-anchor-cream-text">Central for distributed teams</strong>, Seven minutes from Heathrow T5, two minutes off M25 J14. Colleagues from different offices, terminals or countries meet in one easy spot.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="check" className="mt-0.5 h-5 w-5 text-anchor-gold-bright flex-shrink-0" />
                    <span><strong className="text-anchor-cream-text">VAT invoices and corporate billing</strong>, Proper invoices for accounts, pre-payment options for bar tabs, and deposit invoicing so finance stays happy.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="check" className="mt-0.5 h-5 w-5 text-anchor-gold-bright flex-shrink-0" />
                    <span><strong className="text-anchor-cream-text">Simple pre-order system</strong>, No more chasing colleagues for menu choices on spreadsheets. We send you a form link to share with the team.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="check" className="mt-0.5 h-5 w-5 text-anchor-gold-bright flex-shrink-0" />
                    <span><strong className="text-anchor-cream-text">Free parking and ULEZ-free</strong>, Around 20 free spaces plus we're outside the ULEZ zone. No parking charges, no congestion fees.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="check" className="mt-0.5 h-5 w-5 text-anchor-gold-bright flex-shrink-0" />
                    <span><strong className="text-anchor-cream-text">The organiser perk</strong>, Book a staff Christmas party for 20 or more and receive a £40 voucher for yourself in January. You've earned it.</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-anchor-cream-text">Popular corporate setups</h3>
                <div className="space-y-4">
                  <div className="rounded-xl border border-anchor-gold-dark/15 bg-anchor-green-raised p-5">
                    <h4 className="font-semibold text-anchor-cream-text mb-1">Small team dinner (6–25)</h4>
                    <p className="text-sm text-anchor-cream-text/70">Private dining room with three-course festive menu, crackers and candles. From £36.95 per person midweek. Popular with Poyle, Colnbrook and Heathrow business park teams.</p>
                  </div>
                  <div className="rounded-xl border border-anchor-gold-dark/15 bg-anchor-green-raised p-5">
                    <h4 className="font-semibold text-anchor-cream-text mb-1">Department celebration (26–60)</h4>
                    <p className="text-sm text-anchor-cream-text/70">Main bar configured for your group with buffet or sit-down service. Add a quiz or Music Bingo for a memorable works Christmas do.</p>
                  </div>
                  <div className="rounded-xl border border-anchor-gold-dark/15 bg-anchor-green-raised p-5">
                    <h4 className="font-semibold text-anchor-cream-text mb-1">Full venue hire (60–200)</h4>
                    <p className="text-sm text-anchor-cream-text/70">Exclusive use of the entire pub. Bring a DJ, book a live band, or let us set up karaoke. Late bar until midnight. Perfect for airline crews and larger corporate Christmas parties.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-anchor-cream-text/70 mb-4">
                Already organising? See our <Link href="/corporate-christmas-parties" className="underline decoration-dotted text-anchor-gold-dark hover:text-anchor-gold-bright transition">dedicated corporate Christmas parties page</Link> for detailed packages.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="md">
        <Container>
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-anchor-cream-text">Christmas party ideas at The Anchor</h2>
              <p className="text-base text-anchor-cream-text/70 max-w-3xl mx-auto">
                Not every Christmas do needs to be a standard sit-down meal. We host all sorts of festive celebrations and can shape the evening around your group. Here are some of our most popular ideas.
              </p>
            </div>
            <Grid cols={2} gap="md">
              {PARTY_IDEAS.map(idea => (
                <Card key={idea.title} className="h-full">
                  <div className="p-6 space-y-3">
                    <h3 className="text-lg font-semibold text-anchor-cream-text">{idea.title}</h3>
                    <p className="text-sm text-anchor-cream-text/70">{idea.description}</p>
                    <p className="text-xs text-anchor-gold-dark font-semibold">Best for: {idea.ideal}</p>
                  </div>
                </Card>
              ))}
            </Grid>
            <div className="text-center">
              <p className="text-sm text-anchor-cream-text/70">
                Got something else in mind? We love creative ideas. Call us on {CONTACT_PHONE} or drop a note in your enquiry and we will make it happen.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <TestimonialSection
        variant="full"
        title="What Our Guests Say"
        subtitle="From Previous Christmas Parties"
        className="section-spacing"
        reviews={[
          {
            quote: "We've booked our works Christmas do at The Anchor three years running. The food is brilliant, the staff remember our names, and nobody has to fight for parking. Best Christmas party pub near Heathrow, hands down.",
            author: "Sarah T.",
            source: "Office manager, Poyle business park",
            rating: 5
          },
          {
            quote: "Organised a Christmas buffet for 40 crew from different terminals. Everyone found the place easily, the buffet was generous, and the bar tab system meant zero fuss on the night. Already rebooked.",
            author: "James R.",
            source: "Airline operations team, Heathrow",
            rating: 5
          },
          {
            quote: "We booked a Christmas lunch for twelve, the turkey was honestly better than my nan's. Don't tell her. Crackers, candles, the lot. Proper festive without being tacky.",
            author: "Michelle K.",
            source: "Staines-upon-Thames",
            rating: 5
          }
        ]}
      />

      <Section background="white" spacing="sm">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border-2 border-red-600/30 bg-red-50/5 p-8 text-center space-y-4">
              <Icon name="clock" className="mx-auto h-10 w-10 text-red-600" />
              <h2 className="text-2xl font-bold text-anchor-cream-text">Book early, December dates fill fast</h2>
              <p className="text-base text-anchor-cream-text/70">
                Every year it's the same story: Friday and Saturday nights sell out by October, and midweek Christmas party slots fill shortly after. Whether you're planning a festive dinner, a Christmas lunch or a works do, the sooner you get in touch the better your chances.
              </p>
              <p className="text-sm text-anchor-cream-text/70">
                Not sure about exact numbers yet? No problem. Send an enquiry with your rough headcount and preferred week and we'll pencil you in while you finalise the guest list. A £10 per person deposit secures your date.
              </p>
              <div className="flex flex-col md:flex-row justify-center gap-4 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    trackCtaClick({
                      id: 'christmas_urgency_dinner',
                      label: 'Enquire Now, Dinner',
                      location: 'urgency_section',
                      destination: 'enquiry_form',
                      mode: 'dinner'
                    })
                    handleOpenForm('dinner', {}, 'urgency_section')
                  }}
                >
                  Enquire now, lock in your date
                </Button>
                <a
                  href={CONTACT_PHONE_LINK}
                  onClick={() => trackPhoneCallClick({ source: 'christmas_urgency', phone: CONTACT_PHONE })}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-anchor-gold-dark/30 px-6 py-3 text-sm font-semibold text-anchor-cream-text/70 hover:border-anchor-gold-dark hover:text-anchor-gold-dark transition"
                >
                  <Icon name="phone" className="h-4 w-4" /> Call {CONTACT_PHONE}
                </a>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="gray" spacing="md">
        <Container>
          <FAQAccordionWithSchema
            title="Christmas Party FAQs"
            faqs={FAQ_ITEMS}
            className="bg-anchor-green-deep"
          />
        </Container>
      </Section>

      <Section className="py-20 bg-anchor-green-raised border-t border-anchor-gold-dark/15">
        <Container>
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold text-anchor-gold-bright">Ready to plan your Christmas at The Anchor?</h2>
            <p className="text-lg text-anchor-cream-text/70 max-w-2xl mx-auto">
              Send your enquiry and we'll come back within one working day. Need a quicker answer? Call the team, we're here to help.
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

      <Section background="white" className="py-16" id="christmas-enquiry" data-sticky-cta-guard="true">
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
            <p className="text-anchor-cream-text/70 mb-6">
              Tell us about your Christmas plans and we&apos;ll put together a bespoke package. Dinner parties up to 25, buffets for larger groups.
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
        title="Christmas Party Enquiry"
        description={context.mode === 'dinner' ? 'Sit-down dinner for up to 25 guests' : 'Buffet for larger groups'}
        side="right"
        testId="christmas-enquiry-drawer"
      >
        <div className="p-4 sm:p-6">
          <div className="flex gap-2 bg-anchor-green-raised rounded-full p-1 mb-6">
            {(['dinner', 'buffet'] as EnquiryMode[]).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => handleContextChange({ mode })}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition ${context.mode === mode ? 'bg-red-600 text-white shadow-sm' : 'text-anchor-cream-text/70 hover:bg-anchor-green-card'}`}
              >
                {mode === 'dinner' ? 'Dinner (up to 25)' : 'Buffet (26+)'}
              </button>
            ))}
          </div>
          <ChristmasEnquiryForm
            context={context}
            onContextChange={handleContextChange}
            onSuccess={() => {
              handleFormSuccess()
              setDrawerOpen(false)
            }}
          />
        </div>
      </StickyDrawer>

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
  const [xmasHoneypot, setXmasHoneypot] = useState('')
  const xmasFormLoadedAt = useRef(Date.now())

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
    <div className="rounded-2xl border border-anchor-gold-dark/15 bg-anchor-green-card p-6">
      <h3 className="text-2xl font-bold text-anchor-cream-text mb-2">Send your Christmas enquiry</h3>
      <p className="text-sm text-anchor-cream-text/70">We reply within one working day (often sooner).</p>
      <p className="text-sm text-anchor-cream-text/70 mb-6">Prefer email?{' '}<a href={CONTACT_EMAIL_LINK} className="underline decoration-dotted text-anchor-gold-dark">{CONTACT_EMAIL}</a></p>

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
            className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${context.mode === 'dinner' ? 'bg-red-600 text-white border-red-600' : 'bg-anchor-green-raised text-anchor-cream-text border-anchor-gold-dark/15 hover:border-anchor-gold-dark'}`}
            onClick={() => onContextChange({ mode: 'dinner' })}
          >
            Dinner (up to 25)
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${context.mode === 'buffet' ? 'bg-red-600 text-white border-red-600' : 'bg-anchor-green-raised text-anchor-cream-text border-anchor-gold-dark/15 hover:border-anchor-gold-dark'}`}
            onClick={() => onContextChange({ mode: 'buffet' })}
          >
            Buffet (26+)
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-anchor-cream-text/70">Full name *</label>
            <input
              type="text"
              value={name}
              onChange={event => setName(event.target.value)}
              autoComplete="name"
              placeholder="Your full name"
              className="mt-1 w-full rounded-lg border border-anchor-gold-dark/30 bg-anchor-green-deep px-3 py-2 text-sm text-anchor-cream-text focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-anchor-cream-text/70">Email *</label>
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border border-anchor-gold-dark/30 bg-anchor-green-deep px-3 py-2 text-sm text-anchor-cream-text focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-anchor-cream-text/70">Mobile *</label>
            <input
              type="tel"
              value={phone}
              onChange={event => setPhone(event.target.value)}
              autoComplete="tel"
              inputMode="tel"
              placeholder="Best number for a quick call"
              className="mt-1 w-full rounded-lg border border-anchor-gold-dark/30 bg-anchor-green-deep px-3 py-2 text-sm text-anchor-cream-text focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-anchor-cream-text/70">Party size *</label>
            <input
              type="number"
              min={context.mode === 'buffet' ? 26 : 6}
              value={partySize}
              onChange={event => setPartySize(event.target.value)}
              placeholder="e.g. 18"
              className="mt-1 w-full rounded-lg border border-anchor-gold-dark/30 bg-anchor-green-deep px-3 py-2 text-sm text-anchor-cream-text focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-anchor-cream-text/70">Preferred date *</label>
            <input
              type="date"
              value={preferredDate}
              onChange={event => setPreferredDate(event.target.value)}
              data-native-date-time="true"
              className="mt-1 block w-full min-w-0 max-w-full rounded-lg border border-anchor-gold-dark/30 bg-anchor-green-deep px-3 py-2 text-sm text-anchor-cream-text focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-anchor-cream-text/70">Preferred time *</label>
            <select
              value={preferredTime}
              onChange={event => setPreferredTime(event.target.value)}
              className="mt-1 w-full rounded-lg border border-anchor-gold-dark/30 bg-anchor-green-deep px-3 py-2 text-sm text-anchor-cream-text focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
            >
              {TIME_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        {(context.extras.length > 0 || context.perks.length > 0) && (
          <div className="rounded-lg border border-anchor-gold-dark/15 bg-anchor-green-raised px-4 py-3 text-sm text-anchor-cream-text/70">
            <Icon name="gift" className="mr-2 inline h-4 w-4" />
            We've noted your selected extras and offers for our reply.
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-anchor-cream-text/70">Notes / dietary requests</label>
          <textarea
            rows={4}
            value={notes}
            onChange={event => setNotes(event.target.value)}
            className="mt-1 w-full rounded-lg border border-anchor-gold-dark/30 bg-anchor-green-deep px-3 py-2 text-sm text-anchor-cream-text focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
            placeholder="Share dietary notes, entertainment ideas or anything else we should prepare for."
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-anchor-cream-text/70">
          <input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-1" required />
          <span>I'm happy for The Anchor to contact me about this enquiry.</span>
        </label>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <Button type="submit" variant="primary" size="lg" className="w-full md:w-auto" disabled={submitting}>
            {submitting ? 'Sending…' : context.mode === 'dinner' ? 'Request my Christmas booking' : 'Plan my buffet party'}
          </Button>
          <a
            href={CONTACT_PHONE_LINK}
            className="flex items-center gap-2 text-sm text-anchor-cream-text/70 underline decoration-dotted"
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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-anchor-green-card/95 shadow-lg backdrop-blur border-t border-anchor-gold-dark/15">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-sm font-semibold text-anchor-cream-text">
          <span className="hidden md:inline">Plan your Christmas:</span>
          <div className="flex gap-2 bg-anchor-green-raised rounded-full p-1">
            {(['dinner', 'buffet'] as EnquiryMode[]).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => onContextChange({ mode })}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${context.mode === mode ? 'bg-red-600 text-white shadow-sm' : 'text-anchor-cream-text/70 hover:bg-anchor-green-card'}`}
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
              trackPhoneCallClick({ phone: CONTACT_PHONE, source: 'christmas_sticky_bar' })
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
              trackEmailClick({ email: CONTACT_EMAIL, source: 'christmas_sticky_bar' })
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
  const [lbHoneypot, setLbHoneypot] = useState('')
  const lbFormLoadedAt = useRef(Date.now())

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
          notes: 'Submitted via Early-Bird lightbox',
          ...(lbHoneypot ? { website: lbHoneypot } : {}),
          _t: Math.floor((Date.now() - lbFormLoadedAt.current) / 1000)
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
      <div className="w-full max-w-lg rounded-2xl bg-anchor-green-card p-6 shadow-xl relative border border-anchor-gold-dark/15">
        <button
          type="button"
          onClick={closeLightbox}
          className="absolute right-4 top-4 text-anchor-cream-text/50 hover:text-anchor-cream-text"
          aria-label="Close"
        >
          <Icon name="close" className="h-5 w-5" />
        </button>
        <div className="space-y-4">
          <Badge className="bg-red-100 text-red-700 w-fit">Early-Bird reminder</Badge>
          <h3 className="text-2xl font-bold text-anchor-cream-text">Early-Bird ends 31 Oct - shall we save you a spot?</h3>
          <p className="text-sm text-anchor-cream-text/70">Share a few details and we'll hold the free glass of Prosecco offer for you. We typically reply within one working day.</p>

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
              className="w-full rounded-lg border border-anchor-gold-dark/30 bg-anchor-green-deep px-3 py-2 text-sm text-anchor-cream-text focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              autoComplete="email"
              className="w-full rounded-lg border border-anchor-gold-dark/30 bg-anchor-green-deep px-3 py-2 text-sm text-anchor-cream-text focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
            <input
              type="tel"
              placeholder="Mobile"
              value={phone}
              onChange={event => setPhone(event.target.value)}
              autoComplete="tel"
              inputMode="tel"
              className="w-full rounded-lg border border-anchor-gold-dark/30 bg-anchor-green-deep px-3 py-2 text-sm text-anchor-cream-text focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min={context.mode === 'buffet' ? 26 : 6}
                placeholder="Party size"
                value={partySize}
                onChange={event => setPartySize(event.target.value)}
                className="w-full rounded-lg border border-anchor-gold-dark/30 bg-anchor-green-deep px-3 py-2 text-sm text-anchor-cream-text focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
              />
              <input
                type="date"
                value={preferredDate}
                onChange={event => setPreferredDate(event.target.value)}
                data-native-date-time="true"
                className="block w-full min-w-0 max-w-full rounded-lg border border-anchor-gold-dark/30 bg-anchor-green-deep px-3 py-2 text-sm text-anchor-cream-text focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
              />
            </div>
            <div className="flex gap-2">
              {(['dinner', 'buffet'] as EnquiryMode[]).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onContextChange({ mode })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${context.mode === mode ? 'bg-red-600 text-white border-red-600' : 'bg-anchor-green-raised text-anchor-cream-text border-anchor-gold-dark/30'}`}
                >
                  {mode === 'dinner' ? 'Dinner (≤25)' : 'Buffet (26+)'}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="primary" size="md" className="w-full">Send my request</Button>
              <Button
                type="button"
                variant="outline"
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
