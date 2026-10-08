/**
 * Event pages: the wording faults the 7 October 2026 site review found.
 *
 * Each block is one finding, and each assertion is a line that was served to a
 * customer that day:
 *
 *  - C2-008  A cancelled night described as having taken place.
 *  - C2-023  Finished nights still inviting people to come.
 *  - C2-024  "140 seats available" on a standing party.
 *  - C2-040  "The next Parties is", "£3.00" beside "£3", "Performer".
 *  - C2-041  Raw Markdown in three event descriptions.
 *  - C2-007  A cancelled night listed among "recent nights".
 *  - C2-015  The tasting night never saying it is for over 18s.
 *  - C2-050  Finished nights publishing a capacity.
 *  - C2-002, C2-022, C2-026, C2-039  Typed page copy.
 */

import fs from 'fs'
import path from 'path'
import { render } from '@testing-library/react'
import type { Event } from '@/lib/api'

const mockGetEvent = jest.fn()
const mockNextInCategory = jest.fn()

const mockGetEvents = jest.fn()

// One stand-in for the management API client, at the module both the page and
// lib/api/events.ts read it from. Nothing in this file reaches the network.
jest.mock('@/lib/api/client', () => {
  const actual = jest.requireActual('@/lib/api/client')
  return {
    ...actual,
    anchorAPI: {
      getEvent: (idOrSlug: string) => mockGetEvent(idOrSlug),
      getEvents: (params: unknown) => mockGetEvents(params),
    },
  }
})

jest.mock('@/lib/api/events', () => {
  const actual = jest.requireActual('@/lib/api/events')
  return { ...actual, getUpcomingEventsByCategory: async () => mockNextInCategory() }
})

jest.mock('@/lib/error-handling', () => {
  const actual = jest.requireActual('@/lib/error-handling')
  return { ...actual, logError: jest.fn() }
})

jest.mock('@/components/features/EventBooking/ManagementEventBookingForm', () => ({
  ManagementEventBookingForm: () => <div data-testid="booking-form" />,
}))

jest.mock('@/components/events/RelatedEvents', () => ({ __esModule: true, default: () => null }))

jest.mock('@/components/tracking/EventPageTracker', () => ({ EventPageTracker: () => null }))

import EventPage, { generateMetadata } from '@/app/events/[id]/page'
import {
  getEndedEventSummary,
  getEventCategoryModifier,
  getEventHeroLead,
  getEventMetaDescription,
  getEventSchemaDescription,
} from '@/lib/event-copy'
import { getEventPresentation } from '@/lib/event-presentation'
import { getEventBookingBlockReason } from '@/lib/event-lifecycle'
import { getEventSeatAvailabilityLabel } from '@/lib/event-booking-experience'
import { normaliseEventProse, stripEventMarkup } from '@/lib/text/normalise-api-prose'
import { getEventAgeRule } from '@/lib/event-age-rule'
import { buildEventSchema } from '@/lib/structured-data/event-schema'
import { EventBookingFactsStrip } from '@/components/events/EventBookingFactsStrip'

/** Thursday 8 October 2026, midday London. */
const FIXED_NOW = Date.UTC(2026, 9, 8, 11, 0, 0)
const PAST_START = '2026-09-11T19:00:00+01:00'
const FUTURE_START = '2026-10-16T19:00:00+01:00'
/** The typographic apostrophe, as copy pasted into the management app carries it. */
const CURLY = String.fromCharCode(0x2019)

const NEVER_HAPPENED = /took place|Took place|Entry was|Started/

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    '@type': 'Event',
    id: 'evt-1',
    slug: 'music-bingo-2026-09-11',
    name: 'Detention Disco Music Bingo',
    description: 'Two rounds of music bingo with a school disco soundtrack.',
    shortDescription: 'Two rounds of music bingo with a school disco soundtrack.',
    longDescription: 'Two rounds of music bingo with a school disco soundtrack.',
    startDate: PAST_START,
    eventStatus: 'scheduled',
    event_status: 'scheduled',
    eventAttendanceMode: 'OfflineEventAttendanceMode',
    category: { id: 'cat-mb', name: 'Music Bingo', slug: 'music-bingo', color: '#000' },
    doors_time: '18:30',
    doorTime: '2026-09-11T18:30:00+01:00',
    ticket_price: 5,
    booking_mode: 'communal',
    bookings_enabled: true,
    cancellation_policy: 'Tell us 24 hours before if you cannot make it.',
    performer: { '@type': 'Person', name: 'Nikki Manfadge' },
    location: {
      '@type': 'Place',
      name: 'The Anchor Pub',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Horton Road',
        addressLocality: 'Stanwell Moor',
        addressRegion: 'Surrey',
        postalCode: 'TW19 6AQ',
        addressCountry: 'GB',
      },
    },
    ...overrides,
  } as unknown as Event
}

async function renderEventPage(event: Event): Promise<HTMLElement> {
  mockGetEvent.mockResolvedValue(event)
  const ui = await EventPage({ params: { id: event.slug as string } })
  return render(ui).container
}

function visibleText(container: HTMLElement): string {
  const clone = container.cloneNode(true) as HTMLElement
  clone.querySelectorAll('script').forEach((script) => script.remove())
  return clone.textContent || ''
}

/** The hero: the block that holds the page's H1 and its badges. */
function heroText(container: HTMLElement): string {
  const h1 = container.querySelector('h1')
  return (h1?.closest('section') ?? h1?.parentElement?.parentElement)?.textContent || ''
}

function jsonLdText(container: HTMLElement): string {
  return Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
    .map((script) => script.textContent || '')
    .join('\n')
}

function source(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

let nowSpy: jest.SpyInstance<number, []>

beforeEach(() => {
  mockGetEvent.mockReset()
  mockGetEvents.mockReset()
  mockNextInCategory.mockReset()
  mockNextInCategory.mockReturnValue([])
  nowSpy = jest.spyOn(Date, 'now').mockReturnValue(FIXED_NOW)
})

afterEach(() => {
  nowSpy.mockRestore()
})

describe('a cancelled night is never described as having taken place (C2-008)', () => {
  const cancelledPast = () => makeEvent({ event_status: 'cancelled', eventStatus: 'EventCancelled' })
  const cancelledFuture = () =>
    makeEvent({ event_status: 'cancelled', eventStatus: 'EventCancelled', startDate: FUTURE_START })

  it.each([
    ['past', cancelledPast],
    ['still to come', cancelledFuture],
  ])('says so in the head, the hero lead and the JSON-LD description (%s)', (_label, build) => {
    const event = build()
    const lines = [
      getEventMetaDescription(event, 'live fallback'),
      getEventHeroLead(event, 'Book your places for Friday.') ?? '',
      getEventSchemaDescription({ ...event, longDescription: null, description: '', shortDescription: null } as Event),
    ]

    for (const line of lines) {
      expect(line).toContain('was cancelled')
      expect(line).not.toMatch(NEVER_HAPPENED)
      expect(line).not.toContain('Book your places')
    }
    expect(lines[0].length).toBeLessThanOrEqual(160)
    expect(lines[0]).toContain('See upcoming Music Bingo dates.')
  })

  it.each([
    ['past', cancelledPast],
    ['still to come', cancelledFuture],
  ])('labels the facts strip as a plan, not a history (%s)', (_label, build) => {
    const event = build()
    expect(getEventPresentation(event).factsVariant).toBe('did-not-run')

    const { container } = render(
      <EventBookingFactsStrip event={event} eventDate="Friday" eventTime="7pm" variant="did-not-run" />,
    )
    const text = container.textContent || ''
    expect(text).toContain('Was due on')
    expect(text).toContain('Planned start')
    expect(text).not.toMatch(NEVER_HAPPENED)
  })

  it('treats a postponed night whose listed date has gone the same way', () => {
    const event = makeEvent({ event_status: 'postponed', eventStatus: 'EventPostponed' })
    expect(getEventPresentation(event).factsVariant).toBe('did-not-run')
    expect(getEventMetaDescription(event, 'x')).toContain('was postponed')
    expect(getEventMetaDescription(event, 'x')).not.toMatch(NEVER_HAPPENED)
  })

  it('keeps the past-tense record for a night that did happen', () => {
    const event = makeEvent()
    expect(getEventPresentation(event).factsVariant).toBe('historic')
    expect(getEventMetaDescription(event, 'x')).toContain('took place in Stanwell Moor')
  })

  it('serves a whole cancelled page with no claim that it happened', async () => {
    const container = await renderEventPage(cancelledPast())
    const text = visibleText(container)

    expect(text).toContain('This event has been cancelled')
    expect(text).toContain('This night was cancelled.')
    expect(text).not.toContain('This night has finished')
    expect(text).not.toMatch(NEVER_HAPPENED)
    expect(jsonLdText(container)).not.toMatch(/took place/i)

    const metadata = await generateMetadata({ params: { id: 'music-bingo-2026-09-11' } })
    expect(metadata.description).toContain('was cancelled')
    expect((metadata.openGraph as { description?: string }).description).toContain('was cancelled')
  })
})

describe('a finished night does not invite anyone (C2-023)', () => {
  it.each([
    `Don${CURLY}t miss the Mexico v England World Cup match at The Anchor on 6th July. Get your tickets for a night of football fun!`,
    `Experience an exciting Cash Bingo Night at The Anchor on Wednesday, 1 July 2026. Don${CURLY}t miss out`,
    'Enjoy a thrilling Cash Bingo Night at The Anchor with 10 games, great prizes, and a lively atmosphere!',
    'Get your tickets for a night of football fun',
  ])('replaces a stored sales line in the hero: %s', (summary) => {
    const lead = getEventHeroLead(makeEvent({ shortDescription: summary }), 'live')
    expect(lead).toContain('took place at The Anchor')
    expect(getEndedEventSummary(makeEvent({ shortDescription: summary, brief: undefined }))).toBeNull()
  })

  it('cuts a long neutral summary at a whole word', () => {
    const summary =
      'Four rounds of general knowledge with a quick-fire round in the middle, a comfort break, and a bar voucher for the winning team, hosted by the owner in the main bar and everyone welcome'
    const lead = getEventHeroLead(makeEvent({ shortDescription: summary }), 'live') ?? ''

    expect(lead.length).toBeLessThanOrEqual(160)
    expect(lead.endsWith('…')).toBe(true)
    // The words before the ellipsis are whole words from the summary.
    const kept = lead.slice(0, -1)
    expect(summary.startsWith(kept)).toBe(true)
    expect(summary.charAt(kept.length)).toMatch(/[\s,]/)
  })

  it('shares the dated page title, not the sales title, once the night is over', async () => {
    mockGetEvent.mockResolvedValue(
      makeEvent({ name: 'Quiz Night', metaTitle: 'Pub Quiz Night, Join Us!' } as Partial<Event>),
    )
    const metadata = await generateMetadata({ params: { id: 'quiz' } })
    const openGraph = metadata.openGraph as { title?: string; description?: string }
    const twitter = metadata.twitter as { title?: string }

    expect(openGraph.title).toBe(metadata.title)
    expect(twitter.title).toBe(metadata.title)
    expect(openGraph.description).toContain('took place')
  })

  it('still shares the record title while the night is to come', async () => {
    mockGetEvent.mockResolvedValue(
      makeEvent({ startDate: FUTURE_START, metaTitle: 'Screams and Soundtracks Music Bingo' } as Partial<Event>),
    )
    const metadata = await generateMetadata({ params: { id: 'mb' } })
    const openGraph = metadata.openGraph as { title?: string; description?: string }
    expect(openGraph.title).toBeTruthy()
    expect(openGraph.description).toContain('Friday, 16 October 2026')
    expect(openGraph.description).not.toMatch(/took place|was cancelled/)
  })

  it('answers "past" before "no booking needed" or "sold out"', () => {
    expect(getEventBookingBlockReason(makeEvent({ bookings_enabled: false }), FIXED_NOW)).toBe('past')
    expect(getEventBookingBlockReason(makeEvent({ event_status: 'sold_out' }), FIXED_NOW)).toBe('past')
    // Both still mean what they say for a night that is to come.
    expect(
      getEventBookingBlockReason(makeEvent({ bookings_enabled: false, startDate: FUTURE_START }), FIXED_NOW),
    ).toBe('bookings_disabled')
    expect(
      getEventBookingBlockReason(makeEvent({ event_status: 'sold_out', startDate: FUTURE_START }), FIXED_NOW),
    ).toBe('sold_out')
  })

  it('drops "just turn up", the cancellation policy and the arrival badge from an ended page', async () => {
    const container = await renderEventPage(makeEvent({ bookings_enabled: false }))
    const text = visibleText(container)

    expect(text).toContain('This event has ended')
    expect(text).not.toContain('just turn up')
    expect(text).not.toContain('No booking required')
    expect(text).not.toContain('Cancellation Policy')
    expect(text).not.toContain('Tell us 24 hours before')
    // The hero badge is gone; the plain "Arrive from" row in the details list
    // stays as a record of the night.
    expect(heroText(container)).not.toMatch(/Arrive from 6:30\s?pm/i)
  })

  it('keeps the cancellation policy and the arrival badge on a night still to come', async () => {
    const container = await renderEventPage(
      makeEvent({ startDate: FUTURE_START, doorTime: '2026-10-16T18:30:00+01:00' }),
    )
    expect(visibleText(container)).toContain('Cancellation Policy')
    // Read from the same place the ended case reads, so that case cannot pass
    // by looking somewhere the badge never was.
    expect(heroText(container)).toMatch(/Arrive from 6:30\s?pm/i)
  })
})

describe('a general-admission night counts places, not seats (C2-024)', () => {
  it('says places for a party', () => {
    expect(getEventSeatAvailabilityLabel({ booking_mode: 'general', seats_remaining: 140 })).toBe(
      '140 places available',
    )
    expect(getEventSeatAvailabilityLabel({ booking_mode: 'general', seats_remaining: 4 })).toBe(
      'Only 4 places left',
    )
    expect(getEventSeatAvailabilityLabel({ booking_mode: 'general', seats_remaining: 1 })).toBe(
      'Only 1 place left',
    )
  })

  it('still says seats where a seat is what is booked', () => {
    expect(getEventSeatAvailabilityLabel({ booking_mode: 'table', seats_remaining: 49 })).toBe(
      '49 seats available',
    )
    expect(
      getEventSeatAvailabilityLabel({ booking_mode: 'communal', seated_remaining: 4, standing_remaining: 11 }),
    ).toBe('Only 4 seats left')
  })
})

describe('event page template wording (C2-040)', () => {
  it('only puts a category in front of "dates" when it reads as one', () => {
    expect(getEventCategoryModifier({ name: 'Quiz Night' })).toBe('Quiz Night')
    expect(getEventCategoryModifier({ name: 'Live Sport' })).toBe('Live Sport')
    for (const plural of ['Parties', 'Celebrations', 'Tasting Nights']) {
      expect(getEventCategoryModifier({ name: plural })).toBeNull()
    }
    expect(getEventCategoryModifier(null)).toBeNull()
  })

  it('writes no "Parties is", "Parties dates" or "Parties events" on an ended party page', async () => {
    mockNextInCategory.mockReturnValue([
      makeEvent({
        id: 'evt-next',
        slug: 'halloween-party-2026-10-31',
        name: 'The House of Horrors Halloween Party',
        startDate: '2026-10-31T20:00:00+00:00',
      }),
    ])
    const party = makeEvent({
      name: 'Twisted Fairytale Halloween Party',
      startDate: '2025-11-01T20:00:00+00:00',
      category: { id: 'cat-p', name: 'Parties', slug: 'parties', color: '#000' },
    } as Partial<Event>)
    const container = await renderEventPage(party)
    const text = visibleText(container)

    expect(text).not.toMatch(/Parties (is|dates|events)/)
    expect(text).not.toMatch(/Next Parties/)
    expect(text).toContain('Next up: The House of Horrors Halloween Party, Saturday, 31 October 2026')
    expect(text).toContain('The next one is The House of Horrors Halloween Party on Saturday, 31 October 2026.')
    expect(text).toContain('The next date is below.')
    expect(text).toContain('All Parties')
    expect(getEventMetaDescription(party, 'x')).toContain('See what is coming up.')
  })

  it('does not point "below" at a next date that is not there', async () => {
    const container = await renderEventPage(
      makeEvent({ category: { id: 'cat-k', name: 'Karaoke', slug: 'karaoke-night', color: '#000' } } as Partial<Event>),
    )
    const text = visibleText(container)

    expect(text).not.toContain('See below for the next dates')
    expect(text).not.toContain('The next date is below')
    expect(text).toContain("See what's on for everything coming up.")
    expect(text).toContain('This night has finished. Browse everything coming up at The Anchor.')
  })

  it('prints "The Anchor" in the address and "Host" for whoever runs the night', async () => {
    const container = await renderEventPage(makeEvent({ startDate: FUTURE_START }))
    const address = container.querySelector('address')?.textContent || ''
    const text = visibleText(container)

    expect(address).toContain('The Anchor')
    expect(address).not.toContain('The Anchor Pub')
    expect(text).toContain('Host')
    expect(text).not.toContain('Performer')
  })

  it('formats card prices through the same formatter as the page facts', () => {
    const card = source('components/events/RelatedEvents.tsx')
    expect(card).toContain('formatEventBookingMoney')
    expect(card).not.toMatch(/:\s*formatPrice\(event\.offers\.price/)
  })
})

describe('event copy is shown without formatting marks (C2-041)', () => {
  it('takes out bold marks, link addresses and a pasted field label', () => {
    expect(
      stripEventMarkup("it's the **Snowball Finale** where a massive **£240 cash snowball MUST be won**"),
    ).toBe("it's the Snowball Finale where a massive £240 cash snowball MUST be won")
    expect(stripEventMarkup('**Book now** to secure your place: [Grab tickets here](https://...).')).toBe(
      'Book now to secure your place: Grab tickets here.',
    )
    expect(stripEventMarkup('Long description: The Anchor transforms into a twisted fairytale realm')).toBe(
      'The Anchor transforms into a twisted fairytale realm',
    )
    expect(stripEventMarkup('on **Wednesday, 3 June 2026**, as we present our exciting **Quiz Night**')).toBe(
      'on Wednesday, 3 June 2026, as we present our exciting Quiz Night',
    )
  })

  it('leaves ordinary copy, single asterisks and addresses alone', () => {
    for (const untouched of [
      'Prices marked * include a drink.',
      'The description: a night of bingo.',
      'https://www.the-anchor.pub/events/quiz_night__2026',
      'Bring a friend (or two) and a pen.',
    ]) {
      expect(stripEventMarkup(untouched)).toBe(untouched)
    }
    expect(stripEventMarkup(null)).toBeNull()
  })

  it('cleans every prose field of a record, and nothing else', () => {
    const cleaned = normaliseEventProse({
      slug: 'bingo-night-2025-12-19',
      longDescription: 'The **Snowball Finale** is here. [Grab tickets here](https://...).',
      highlights: ['**£240** snowball'],
      faq: [{ name: 'Is it **cash**?', acceptedAnswer: { text: 'Yes, [see here](https://example.com/a).' } }],
    })

    expect(cleaned.slug).toBe('bingo-night-2025-12-19')
    expect(JSON.stringify(cleaned)).not.toMatch(/\*\*|\]\(/)
    expect(cleaned.faq[0].acceptedAnswer.text).toBe('Yes, see here.')
  })
})

describe('recent and past listings hold only nights that ran (C2-007)', () => {
  const listed = (status: string, slug: string) =>
    makeEvent({ id: slug, slug, event_status: status, eventStatus: status, startDate: '2026-10-01T19:00:00+01:00' })

  // The recent-events window is worked out from `new Date()`, so the whole
  // clock is pinned here, not only Date.now().
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(FIXED_NOW)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('never returns a cancelled or postponed night as a recent one', async () => {
    const { readRecentEvents } = jest.requireActual('@/lib/api/events') as typeof import('@/lib/api/events')
    // The management API is handed back everything, as if it ignored the filter.
    mockGetEvents.mockResolvedValue({
      events: [listed('scheduled', 'ran'), listed('cancelled', 'cancelled-night'), listed('postponed', 'postponed-night')],
    })

    const result = await readRecentEvents(12)

    expect(result.status).toBe('ok')
    expect(result.events.map((event) => event.slug)).toEqual(['ran'])
    const asked = mockGetEvents.mock.calls[0][0] as { status: string }
    expect(asked.status).not.toMatch(/cancelled|postponed/)
  })

  it('keeps them out of the full archive too', async () => {
    const { getPastEvents } = jest.requireActual('@/lib/api/events') as typeof import('@/lib/api/events')
    mockGetEvents.mockResolvedValue({
      events: [listed('scheduled', 'quiz-night-2026-10-01'), listed('postponed', 'postponed-night-2026-10-01')],
    })

    const past = await getPastEvents()

    expect(past.map((event) => event.slug)).toEqual(['quiz-night-2026-10-01'])
    const asked = mockGetEvents.mock.calls[0][0] as { status: string }
    expect(asked.status).not.toMatch(/cancelled|postponed/)
  })

  it("does not print a finished night's sales line on a What's On card", () => {
    expect(
      getEndedEventSummary(
        makeEvent({ shortDescription: 'Join Nikki for two themed rounds, £5 cash entry, and dinner served from 4pm to 9pm.' } as Partial<Event>),
      ),
    ).toBeNull()
    expect(getEndedEventSummary(makeEvent({ shortDescription: 'Two rounds of music bingo.' } as Partial<Event>))).toBe(
      'Two rounds of music bingo.',
    )
    expect(source('app/whats-on/page.tsx')).not.toMatch(/event\.brief \|\| event\.shortDescription/)
  })
})

describe('a tasting night says it is for over 18s only (C2-015, owner fact 26)', () => {
  const tasting = (overrides: Partial<Event> = {}) =>
    makeEvent({
      name: 'Tinsel & Tipples Christmas Tasting Night',
      slug: 'christmas-night-out-tasting-night-2026-11-20',
      startDate: '2026-11-20T19:00:00+00:00',
      category: { id: 'cat-t', name: 'Tasting Nights', slug: 'tasting-nights', color: '#000' },
      ...overrides,
    } as Partial<Event>)

  it('states the rule for the format and for no other', () => {
    expect(getEventAgeRule(tasting())).toBe('Over 18s only')
    expect(getEventAgeRule(makeEvent())).toBeNull()
    expect(getEventAgeRule({ category: { name: 'Quiz Night', slug: 'quiz-night-stanwell-moor' } })).toBeNull()
    expect(getEventAgeRule({})).toBeNull()
  })

  it('prints it on the page and in the structured data', async () => {
    const container = await renderEventPage(tasting())
    expect(visibleText(container)).toContain('Over 18s only')
    expect(jsonLdText(container)).toContain('"typicalAgeRange":"18-"')
  })

  it('matches the SSOT line it is taken from', () => {
    expect(source('docs/SSOT.md')).toMatch(/### Tasting Nights[\s\S]{0,400}\*\*Over 18s only\.\*\*/)
  })

  it('adds no age range to any other night', () => {
    expect(JSON.stringify(buildEventSchema(makeEvent({ startDate: FUTURE_START })))).not.toContain('typicalAgeRange')
  })
})

describe('a finished night publishes no capacity (C2-050)', () => {
  it('keeps capacity on a night that can still be booked and drops it afterwards', () => {
    const upcoming = buildEventSchema(
      makeEvent({ startDate: FUTURE_START, maximumAttendeeCapacity: 60, remainingAttendeeCapacity: 52 } as Partial<Event>),
    ) as Record<string, unknown>
    const ended = buildEventSchema(
      makeEvent({ maximumAttendeeCapacity: 118, remainingAttendeeCapacity: 118 } as Partial<Event>),
    ) as Record<string, unknown>

    expect(upcoming.maximumAttendeeCapacity).toBe(60)
    expect(ended.maximumAttendeeCapacity).toBeUndefined()
    expect(ended.remainingAttendeeCapacity).toBeUndefined()
    // Nor the record's sales line, one property after the past-tense description.
    expect(ended.disambiguatingDescription).toBeUndefined()
  })
})

describe('typed copy on the game night pages', () => {
  const cashBingoPage = source('app/cash-bingo/page.tsx')
  const cashBingoConfig = source('lib/game-nights/cash-bingo.ts')
  const themedQuiz = source('app/quiz-night/themed/page.tsx')
  const whatsOn = source('app/whats-on/page.tsx')

  it('never pairs cash prizes with every game (C2-002)', () => {
    // docs/SSOT.md section 10: "Not every game is played for cash."
    for (const file of [cashBingoPage, cashBingoConfig]) {
      expect(file).not.toMatch(/label="[^"]*(?:cash prizes?[^"]*every game|every game[^"]*cash)/i)
      expect(file).not.toMatch(/cash prizes? (?:on |in )?every game/i)
    }
    expect(cashBingoPage).toContain('label="Cash jackpot on the last game"')
    expect(source('docs/SSOT.md')).toContain('**Not every game is played for cash.**')
  })

  it('does not say the snowball figure is on a listing that does not show it (C2-026)', () => {
    for (const file of [cashBingoPage, cashBingoConfig]) {
      expect(file).not.toMatch(/on the event listing/i)
      expect(file).not.toMatch(/each with its own snowball target/i)
    }
  })

  it('never types the Snowball amount into the page (owner fact 33)', () => {
    // It stood at £180 on 30 September 2026 and changes at every cash bingo
    // night, so the page carries the rule and never the figure.
    for (const file of [cashBingoPage, cashBingoConfig]) {
      expect(file).not.toMatch(/£\s?180/)
      expect(file).not.toMatch(/snowball (?:is|stands at|of) £\d/i)
    }
  })

  it('names no night in the themed quiz head, and no seasonal night by name (C2-022)', () => {
    const head = themedQuiz.slice(
      themedQuiz.indexOf('export const metadata'),
      themedQuiz.indexOf("alternates: { canonical: './' }"),
    )
    expect(head.length).toBeGreaterThan(200)
    expect(head).not.toMatch(/Gavin|Only Fools|Halloween|Tinsel|Sparks/)

    const body = themedQuiz.slice(themedQuiz.indexOf('const FAQS'))
    expect(body).not.toMatch(/Hint of Halloween|Sparks (?:&amp;|&) Sparklers|Tinsel (?:&amp;|&) Trivia/)
    expect(body).not.toContain('a few times a year')
    expect(body).not.toContain('Most of')
    expect(body).not.toMatch(/>\s*How that night went\s*</)
  })

  it("keeps planning notes out of the What's On headings (C2-039)", () => {
    expect(whatsOn).not.toMatch(/people search for|searches before you|Find the right event page/i)
  })
})
