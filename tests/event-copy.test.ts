/**
 * Past event pages are kept live and indexed so their content can accumulate.
 * That only works if they read as a record of a night that happened.
 *
 * Before this, 39 of 58 live past pages served the promotional description
 * verbatim, so a search result for a night in June invited people to book it.
 */

import {
  getEventMetaDescription,
  getEventSchemaDescription,
  getDisplayableFaqs,
  getEventHeroLead,
} from '@/lib/event-copy'
import type { Event } from '@/lib/api'

const DAY = 24 * 60 * 60 * 1000

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'e1',
    name: 'Music Bingo',
    slug: 'music-bingo-test',
    startDate: new Date(Date.now() + 7 * DAY).toISOString(),
    event_status: 'scheduled',
    eventStatus: 'scheduled',
    category: { id: 'c1', slug: 'music-bingo', name: 'Music Bingo', color: '#000' },
    ...overrides,
  } as Event
}

const SALES_COPY = 'Book your tickets now! Do not miss the biggest night of the month.'

describe('getEventMetaDescription', () => {
  it('uses the stored sales copy while the event is upcoming', () => {
    const d = getEventMetaDescription(makeEvent({ metaDescription: SALES_COPY }), 'fallback')
    expect(d).toBe(SALES_COPY)
  })

  it('never reuses sales copy once the event has ended', () => {
    const d = getEventMetaDescription(
      makeEvent({ startDate: new Date(Date.now() - 30 * DAY).toISOString(), metaDescription: SALES_COPY }),
      'fallback',
    )
    expect(d).not.toContain('Book your tickets')
    expect(d).not.toBe(SALES_COPY)
  })

  it('states the event took place, and points at the category', () => {
    const d = getEventMetaDescription(
      makeEvent({ startDate: new Date(Date.now() - 30 * DAY).toISOString() }),
      'fallback',
    )
    expect(d).toContain('Music Bingo took place at The Anchor')
    expect(d).toContain('See upcoming Music Bingo dates')
  })

  it('does not invite anyone to join us on a past night', () => {
    const d = getEventMetaDescription(
      makeEvent({ startDate: new Date(Date.now() - 400 * DAY).toISOString() }),
      'Join us for Music Bingo at The Anchor.',
    )
    expect(d.toLowerCase()).not.toContain('join us')
  })
})

describe('getEventSchemaDescription', () => {
  it('keeps the stored description when there is one', () => {
    const d = getEventSchemaDescription(makeEvent({ longDescription: 'A long description.' }))
    expect(d).toBe('A long description.')
  })

  it('falls back to past tense on an ended event with no stored copy', () => {
    const d = getEventSchemaDescription(
      makeEvent({ startDate: new Date(Date.now() - 10 * DAY).toISOString() }),
    )
    expect(d).toContain('took place')
    expect(d.toLowerCase()).not.toContain('join us')
  })

  it('falls back to future tense on an upcoming event with no stored copy', () => {
    const d = getEventSchemaDescription(makeEvent())
    expect(d).toContain('Join us for')
  })

  it('is never empty, since description is a recommended Event property', () => {
    expect(getEventSchemaDescription(makeEvent()).length).toBeGreaterThan(0)
    expect(
      getEventSchemaDescription(makeEvent({ startDate: new Date(Date.now() - 5 * DAY).toISOString() })).length,
    ).toBeGreaterThan(0)
  })
})

describe('getEventHeroLead', () => {
  const LIVE = 'Reserve a table for Friday 14 August. No payment now, pay £5 on arrival.'

  it('uses the booking statement while the event is upcoming', () => {
    expect(getEventHeroLead(makeEvent(), LIVE)).toBe(LIVE)
  })

  it('never leaves an invitation in the hero of an ended event', () => {
    // This was live on /events/music-bingo-2026-06-12: the largest text on the
    // page said "Join us for Music Bingo on June 12th! Get ready for big
    // tunes", directly under a banner saying the event had ended.
    const lead = getEventHeroLead(
      makeEvent({
        startDate: new Date(Date.now() - 30 * DAY).toISOString(),
        shortDescription:
          'Join us for Music Bingo at The Anchor on June 12th! Get ready for big tunes, laughs, and a fun night out.',
      }),
      LIVE,
    )
    expect(lead).not.toMatch(/join us|get ready/i)
    expect(lead).toContain('took place at The Anchor')
  })

  it('keeps a neutral stored summary on an ended event', () => {
    const neutral = 'A music bingo night hosted by Nikki Manfadge, with two rounds and prizes.'
    const lead = getEventHeroLead(
      makeEvent({ startDate: new Date(Date.now() - 30 * DAY).toISOString(), shortDescription: neutral }),
      LIVE,
    )
    expect(lead).toBe(neutral)
  })

  it('falls back to a past-tense line when there is no summary at all', () => {
    const lead = getEventHeroLead(
      makeEvent({ startDate: new Date(Date.now() - 30 * DAY).toISOString() }),
      LIVE,
    )
    expect(lead).toContain('Music Bingo took place at The Anchor')
  })
})

describe('getDisplayableFaqs', () => {
  const faqs = [
    { name: 'Do I need to book?', acceptedAnswer: { text: 'Yes, book online.' } },
    { name: 'What time do doors open?', acceptedAnswer: { text: 'Doors at 6pm, tickets £5.' } },
    { name: 'Is the pub dog friendly?', acceptedAnswer: { text: 'Yes, dogs are welcome.' } },
    { name: 'Can I get a refund?', acceptedAnswer: { text: 'Contact us.' } },
  ]

  it('keeps every FAQ on an upcoming event', () => {
    expect(getDisplayableFaqs(faqs, false)).toHaveLength(4)
  })

  it('drops booking questions once the event has ended', () => {
    const kept = getDisplayableFaqs(faqs, true).map((f) => f.name)
    expect(kept).not.toContain('Do I need to book?')
    expect(kept).not.toContain('Can I get a refund?')
  })

  it('keeps the non-booking questions, which are often the only unique prose', () => {
    const kept = getDisplayableFaqs(faqs, true).map((f) => f.name)
    expect(kept).toContain('What time do doors open?')
    expect(kept).toContain('Is the pub dog friendly?')
  })

  it('matches on the question only, so an answer mentioning price survives', () => {
    // "Doors at 6pm, tickets £5" mentions tickets, but the question is about
    // doors. Matching answers too would strip almost the whole block.
    const kept = getDisplayableFaqs(faqs, true)
    expect(kept.some((f) => f.acceptedAnswer.text.includes('tickets'))).toBe(true)
  })
})
