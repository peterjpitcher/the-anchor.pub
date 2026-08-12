import type { Event } from '@/lib/api'
import { getEventSocialCopy } from '@/lib/event-social-copy'

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    '@type': 'Event',
    id: 'event-1',
    slug: 'cowboys-queens',
    name: 'Cowboys & Queens Country Music Bingo',
    description: 'A night of country music bingo.',
    startDate: '2026-08-14T18:00:00.000Z',
    event_status: 'scheduled',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'The Anchor',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Horton Road',
        addressLocality: 'Stanwell Moor',
        addressRegion: 'Surrey',
        postalCode: 'TW19 6AQ',
        addressCountry: 'GB'
      }
    },
    category: {
      id: 'music-bingo',
      name: 'Music Bingo',
      slug: 'music-bingo',
      color: '#005131'
    },
    ...overrides
  }
}

const BEFORE_EVENT = Date.parse('2026-08-01T12:00:00.000Z')

describe('getEventSocialCopy', () => {
  it('turns Music Bingo into a shared plan', () => {
    expect(getEventSocialCopy(makeEvent(), BEFORE_EVENT)).toEqual({
      title: 'You’d love this. Shall we go? 🎶',
      description: 'Cowboys & Queens Music Bingo is at The Anchor on Friday 14 August from 7pm. Tap to book our places.'
    })
  })

  it.each([
    ['on Friday 14 August', '2026-08-01T12:00:00.000Z'],
    ['next Friday', '2026-08-05T12:00:00.000Z'],
    ['this Friday', '2026-08-10T12:00:00.000Z'],
    ['tomorrow', '2026-08-13T12:00:00.000Z'],
    ['tonight', '2026-08-14T09:00:00.000Z']
  ])('describes the event as %s when it gets closer', (proximity, now) => {
    expect(getEventSocialCopy(makeEvent(), Date.parse(now))?.description).toBe(
      `Cowboys & Queens Music Bingo is at The Anchor ${proximity} from 7pm. Tap to book our places.`
    )
  })

  it('uses today rather than tonight for a daytime event', () => {
    const event = makeEvent({ startDate: '2026-08-14T13:00:00.000Z' })

    expect(getEventSocialCopy(event, Date.parse('2026-08-14T08:00:00.000Z'))?.description).toBe(
      'Cowboys & Queens Music Bingo is at The Anchor today from 2pm. Tap to book our places.'
    )
  })

  it('asks the recipient to join the Quiz Night team', () => {
    const event = makeEvent({
      name: 'The Last Quiz of Summer',
      category: { id: 'quiz', name: 'Quiz Nights', slug: 'quiz-night', color: '#005131' }
    })

    expect(getEventSocialCopy(event, BEFORE_EVENT)).toEqual({
      title: 'I need you on my Quiz Night team 🧠',
      description: 'The Last Quiz of Summer is at The Anchor on Friday 14 August from 7pm. Are you in? Tap to book our table.'
    })
  })

  it('makes Karaoke feel like a plan between friends', () => {
    const event = makeEvent({
      name: 'Friday Night Karaoke',
      category: { id: 'karaoke', name: 'Karaoke', slug: 'karaoke', color: '#005131' }
    })

    expect(getEventSocialCopy(event, BEFORE_EVENT)).toEqual({
      title: 'We have to do this 🎤',
      description: 'Friday Night Karaoke is at The Anchor on Friday 14 August from 7pm. Fancy it? Tap to see the details.'
    })
  })

  it('uses a personal invitation for other bookable events', () => {
    const event = makeEvent({
      name: 'Summer Garden Party',
      category: { id: 'party', name: 'Parties', slug: 'parties', color: '#005131' }
    })

    expect(getEventSocialCopy(event, BEFORE_EVENT)).toEqual({
      title: 'This made me think of you 👀',
      description: 'Summer Garden Party is coming up at The Anchor on Friday 14 August from 7pm. Shall we book it?'
    })
  })

  it.each([
    ['past', { startDate: '2026-07-01T18:00:00.000Z' }],
    ['sold out', { event_status: 'sold_out' }],
    ['cancelled', { event_status: 'cancelled' }],
    ['postponed', { event_status: 'postponed' }],
    ['booking disabled', { bookings_enabled: false }]
  ])('does not use booking copy when the event is %s', (_label, overrides) => {
    expect(getEventSocialCopy(makeEvent(overrides), BEFORE_EVENT)).toBeNull()
  })
})
