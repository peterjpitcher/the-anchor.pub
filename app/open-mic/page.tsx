import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import {
  Card,
  CardBody,
  Container,
  Section
} from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { EventSchema } from '@/components/seo/EventSchema'
import { EventBookingButton } from '@/components/EventBookingButton'
import {
  formatDoorTime,
  formatEventDate,
  formatEventTime,
  getEventCategories,
  getUpcomingEventsByCategory,
  type Event,
  type EventCategory
} from '@/lib/api'
import { getEventWebsiteUrl } from '@/lib/event-url'
import { cn } from '@/lib/utils'
import { OpenMicPerformerInterestForm } from './OpenMicPerformerInterestForm'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

export const metadata: Metadata = {
  title: 'Open Mic Sign-Up | The Anchor, Stanwell Moor',
  description:
    'Register to perform at The Anchor open mic in Stanwell Moor near Heathrow. Acoustic-friendly to start, with all performer types welcome for future events. See upcoming dates and book a table (walk-ins welcome).',
  keywords:
    'open mic, open mic night, live music, performers, stanwell moor, staines, heathrow, acoustic open mic, comedy, spoken word',
  openGraph: {
    title: 'Open Mic Night | The Anchor, Stanwell Moor',
    description: 'Sign up to perform at The Anchor open mic. Acoustic-friendly, all types welcome. Walk-ins welcome.',
    images: [{ url: DEFAULT_EVENT_IMAGE, width: 1200, height: 630, alt: 'Events at The Anchor pub near Heathrow' }]
  },
  twitter: getTwitterMetadata({
    title: 'Open Mic Night | The Anchor, Stanwell Moor',
    description: 'Sign up to perform at The Anchor open mic. Acoustic-friendly, all types welcome. Walk-ins welcome.',
    images: [DEFAULT_EVENT_IMAGE]
  }),
  alternates: {
    canonical: '/open-mic'
  }
}

const OPEN_MIC_CATEGORY = {
  name: 'Open Mic Night',
  slug: 'open-mic-night'
}

const normalizeCategoryValue = (value?: string | null) =>
  value?.toLowerCase().replace(/\s+/g, ' ').trim() ?? ''

function getCategoryIdByLabel(categories: EventCategory[], label: typeof OPEN_MIC_CATEGORY) {
  const targetName = normalizeCategoryValue(label.name)
  const targetSlug = normalizeCategoryValue(label.slug)

  return categories.find(category => {
    const categoryName = normalizeCategoryValue(category.name)
    const categorySlug = normalizeCategoryValue(category.slug)
    return categoryName === targetName || categorySlug === targetSlug
  })?.id
}

async function getOpenMicEvents() {
  const categories = await getEventCategories()
  const categoryId = getCategoryIdByLabel(categories, OPEN_MIC_CATEGORY)
  if (!categoryId) return []

  const events = await getUpcomingEventsByCategory(categoryId, 100)
  return events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
}

const FAQS = [
  {
    question: 'Is it only acoustic?',
    answer:
      'To begin with, we’re focusing on acoustic-friendly sets — but we’re collecting interest from all performer types for future events (comedy, spoken word and more).'
  },
  {
    question: 'What time does it start?',
    answer:
      'We typically aim to start performances around 8pm. Arrival details will be confirmed when we’ve booked you in.'
  },
  {
    question: 'Do I need professional experience?',
    answer:
      'No — if you’re ready to get up and perform, we’re happy to hear from you.'
  },
  {
    question: 'How long is a set?',
    answer:
      'It depends on turnout, but expect short sets (often 10–15 minutes). We’ll confirm when we schedule you.'
  },
  {
    question: 'Do I need to book a table?',
    answer:
      'Booking is optional — walk-ins are welcome. If booking is available you’ll see a “Book a table” button on upcoming dates. If not, booking options are available closer to the event.'
  },
  {
    question: 'How do I get there / is there parking?',
    answer:
      'Yes — free on-site parking (around 20 spaces). We’re also on the 442 bus route (Staines ↔ Heathrow), with a stop right outside.'
  }
] as const

function OpenMicEventCards({ events }: { events: Event[] }) {
  if (!events.length) {
    return (
      <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-xl p-6 text-center">
        <p className="text-lg font-semibold text-anchor-gold-vivid mb-2">New open mic dates announced soon</p>
        <p className="text-anchor-cream-text/70">
          We’re finalising the next dates right now. Check back soon or call 01753 682707 and we’ll let you know what’s coming up.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {events.map((event, index) => {
        const doorTime = formatDoorTime(event.doorTime)
        const startTime = formatEventTime(event.startDate)
        const eventUrl = getEventWebsiteUrl(event)
        const imageSrc = event.heroImageUrl || event.image?.[0] || null

        return (
          <Card key={event.id} className="overflow-hidden border border-anchor-sand shadow-lg">
            <div className="bg-anchor-green text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-white/70 mb-1">Open mic night</p>
                <Link href={eventUrl} className="block text-xl font-bold text-white hover:text-anchor-gold transition">
                  {event.name}
                </Link>
                <p className="text-sm text-white/80 line-clamp-1">{formatEventDate(event.startDate)}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-white">{startTime}</p>
                <p className="text-xs text-white/70">{doorTime ?? 'Doors TBC'}</p>
                <p className="text-xs text-white/70">Walk-ins welcome</p>
              </div>
            </div>

            <CardBody className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
              {imageSrc && (
                <Link href={eventUrl} className="w-full lg:w-48">
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm">
                    <Image
                      src={imageSrc}
                      alt={`${event.name} open mic at The Anchor`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 192px"
                      loading={index < 2 ? 'eager' : 'lazy'}
                    />
                  </div>
                </Link>
              )}

              <div className="flex-1 space-y-4">
                {event.description && (
                  <p className="text-anchor-cream-text/70 leading-relaxed">{event.description}</p>
                )}
                <p className="text-sm text-anchor-cream-text/55">
                  Acoustic-friendly to start, with all performer types welcome for future events. Want to perform? Register your interest above.
                </p>
              </div>

              <div className="w-full lg:w-64 space-y-3">
                <EventBookingButton
                  event={event}
                  className="w-full"
                  label="Book a table"
                  source="open_mic_event_card"
                />
                <p className="text-xs text-anchor-cream-text/55 text-center">
                  Booking optional — walk-ins welcome.
                </p>
              </div>
            </CardBody>
          </Card>
        )
      })}
    </div>
  )
}

export default async function OpenMicPage() {
  const events = await getOpenMicEvents()
  const nextEvent = events[0]
  const nextEventDate = nextEvent ? formatEventDate(nextEvent.startDate) : 'Dates announced soon'
  const nextEventTime = nextEvent ? formatEventTime(nextEvent.startDate) : '8pm'

  const heroDescription = nextEvent
    ? `Next open mic: ${nextEventDate} around ${nextEventTime}. Acoustic-friendly to start — all performer types welcome for future events.`
    : 'Acoustic-friendly to start — all performer types welcome for future events. Register your interest to be considered for upcoming nights.'

  return (
    <>
      <HeroWrapper
        route="/open-mic"
        title="Perform at The Anchor — Open Mic Sign-Up"
        description={heroDescription}
       
        tags={[
          { label: '🎤 Open Mic Nights', variant: 'primary' },
          { label: '🕗 Typically from 8pm', variant: 'default' },
          { label: '🚗 Free parking + 442 bus', variant: 'default' }
        ]}
        primaryCta={
          <a
            href="#register-interest"
            className={cn(
              'inline-flex items-center justify-center font-semibold text-center transition-all duration-200 rounded-full whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-anchor-gold focus:ring-offset-2 bg-white text-anchor-green border-2 border-anchor-green hover:bg-anchor-green hover:text-white px-8 py-3.5 text-lg min-h-[48px] w-full sm:w-auto'
            )}
          >
            Register your interest
          </a>
        }
        secondaryCta={
          <PhoneButton
            phone="01753 682707"
            source="open_mic_hero"
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
          >
            Questions? Call/WhatsApp 01753 682707
          </PhoneButton>
        }
      />

      <Section spacing="sm" background="white">
        <Container>
          <PageTitle className="text-center text-anchor-gold-vivid" seo={{ structured: true, speakable: true }}>
            Open Mic at The Anchor (Stanwell Moor)
          </PageTitle>
          <p className="text-lg text-anchor-cream-text/70 text-center max-w-3xl mx-auto">
            Whether you’ve been gigging for years or you’re trying your first set, we’d love to hear from you. Fill in the form below and we’ll keep your details on file so we can invite you when we’re booking upcoming nights.
          </p>
        </Container>
      </Section>

      <Section spacing="md" background="gray">
        <Container>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="space-y-4 mb-6">
                <h2 className="text-2xl font-bold text-anchor-cream-text">How the night works</h2>
                <ul className="space-y-2 text-anchor-cream-text/70">
                  <li>Arrive from ~7:30pm if you can (sign-in / quick chat)</li>
                  <li>First act around 8pm</li>
                  <li>Depending on turnout, we may have to resort to slotted times (often 10–15 minutes)</li>
                  <li>Respectful, community-led atmosphere</li>
                </ul>
                <div className="rounded-xl bg-anchor-bg-card border border-anchor-gold/15 p-4">
                  <h3 className="font-semibold text-anchor-cream-text mb-2">House rules (friendly but clear)</h3>
                  <ul className="space-y-1 text-sm text-anchor-cream-text/70">
                    <li>Respectful behaviour only (no hate speech or harassment)</li>
                    <li>We may refuse performances that risk safety or licensing compliance</li>
                    <li>Volume expectations: acoustic-friendly to start</li>
                    <li>Age policy can vary by event (some nights may be 18+)</li>
                  </ul>
                </div>
              </div>

              <OpenMicPerformerInterestForm />
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-anchor-gold/15 bg-anchor-bg-card p-6 shadow-sm">
                <h3 className="text-xl font-bold text-anchor-cream-text mb-2">Getting here</h3>
                <p className="text-anchor-cream-text/70 mb-3">
                  The Anchor, Horton Road, Stanwell Moor, Surrey, TW19 6AQ
                </p>
                <ul className="text-sm text-anchor-cream-text/70 space-y-1">
                  <li>🚗 Free parking – around 20 spaces for patrons</li>
                  <li>🚌 442 bus stops outside (Staines ↔ Heathrow)</li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="https://maps.app.goo.gl/YNbjTDF9g7uCcbYF6"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-anchor-green px-4 py-2 text-anchor-green font-semibold hover:bg-anchor-green hover:text-white transition"
                  >
                    📍 Get directions
                  </Link>
                  <Link
                    href="https://wa.me/441753682707"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-anchor-gold px-4 py-2 text-anchor-gold font-semibold hover:bg-anchor-gold hover:text-anchor-green transition"
                  >
                    💬 WhatsApp the team
                  </Link>
                </div>
              </div>

              <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-xl overflow-hidden shadow-sm">
                <GoogleMapEmbed
                  query="The Anchor, Stanwell Moor"
                  className="h-full min-h-[300px] border border-anchor-gold/15 rounded-xl overflow-hidden shadow-sm"
                />
              </div>

              <div className="rounded-2xl border border-anchor-gold/15 bg-anchor-bg-card p-6 shadow-sm">
                <h3 className="text-xl font-bold text-anchor-cream-text mb-2">Contact</h3>
                <p className="text-sm text-anchor-cream-text/70">
                  01753 682707 (also WhatsApp) ·{' '}
                  <a className="underline decoration-dotted" href="mailto:manager@the-anchor.pub">
                    manager@the-anchor.pub
                  </a>
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="md" background="white">
        <Container>
          <div className="space-y-6" id="open-mic-events">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-anchor-gold-vivid mb-2">Upcoming open mic nights</h2>
              <p className="text-anchor-cream-text/70">
                Booking is optional — walk-ins are welcome. If there’s no booking link yet, it’ll appear closer to the date.
              </p>
            </div>
            <OpenMicEventCards events={events} />
          </div>
        </Container>
      </Section>

      <Section spacing="md" background="gray">
        <Container>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="md:col-span-7">
              <h2 className="text-2xl font-bold text-anchor-cream-text mb-4">FAQs</h2>
              <FAQAccordionWithSchema faqs={FAQS as any} />
            </div>
            <div className="md:col-span-5">
              <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-anchor-cream-text mb-2">Want to perform?</h3>
                <p className="text-anchor-cream-text/70 mb-4">
                  Register your interest and we’ll reach out when we’re booking. Links really help, but first-timers are welcome too.
                </p>
                <a
                  href="#register-interest"
                  className="inline-flex items-center justify-center w-full rounded-lg bg-anchor-gold px-4 py-3 font-semibold text-white hover:bg-anchor-gold-light transition"
                >
                  Register your interest
                </a>
                <p className="text-xs text-anchor-cream-text/55 mt-3">
                  Privacy: we only store your details with your consent. Read our{' '}
                  <Link href="/privacy-policy" className="underline decoration-dotted">
                    privacy policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {events.map(event => (
        <EventSchema key={`event-schema-${event.id}`} event={event} />
      ))}
    </>
  )
}
