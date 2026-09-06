/**
 * Every listed game night date offers an add-to-calendar control.
 *
 * Before this, the only thing a visitor could do with a date was book it. Anyone
 * who had decided to come but was not ready to commit a head count had nowhere
 * to go, and the date left with them.
 *
 * The guarantee that matters more than the presence of the buttons is the
 * negative one: a cancelled or finished night must never be offered as something
 * to put in a diary. AddToCalendar enforces that itself, and this test proves the
 * wrapper does not defeat it.
 */

import { render, screen } from '@testing-library/react'
import type { Event } from '@/lib/api'
import { GameNightDateCards } from '@/components/features/GameNight'

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const FIXED_NOW = Date.UTC(2026, 8, 6, 12, 0, 0) // 2026-09-06T12:00:00Z

function isoDaysFromNow(days: number): string {
  return new Date(FIXED_NOW + days * ONE_DAY_MS).toISOString()
}

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    '@type': 'Event',
    id: 'evt-1',
    slug: 'quiz-night-2026-09-16',
    name: 'Quiz Night',
    description: 'A friendly pub quiz.',
    startDate: isoDaysFromNow(10),
    eventStatus: 'scheduled',
    event_status: 'scheduled',
    eventAttendanceMode: 'OfflineEventAttendanceMode',
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
    ...overrides
  } as Event
}

function renderCards(events: Event[]) {
  return render(
    <GameNightDateCards
      events={events}
      eyebrow="Monthly quiz night"
      bookingSource="quiz_night_event_card"
      calendarSource="quiz_night_date_card"
      imageAltSuffix="quiz night at The Anchor"
      renderMeta={() => <p>Arrive from 6:30pm</p>}
      renderDetails={() => <p>Teams up to six</p>}
      emptyState={<p>No dates yet</p>}
    />
  )
}

describe('GameNightDateCards', () => {
  let nowSpy: jest.SpyInstance<number, []>

  beforeEach(() => {
    nowSpy = jest.spyOn(Date, 'now').mockReturnValue(FIXED_NOW)
  })

  afterEach(() => {
    nowSpy.mockRestore()
  })

  it('offers a calendar control on every upcoming date', () => {
    renderCards([
      makeEvent({ id: 'evt-1', slug: 'quiz-a', startDate: isoDaysFromNow(10) }),
      makeEvent({ id: 'evt-2', slug: 'quiz-b', startDate: isoDaysFromNow(40) })
    ])

    expect(screen.getAllByRole('link', { name: /Add .* to Google Calendar/ })).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: /Download a calendar file/ })).toHaveLength(2)
  })

  it('tags the control with the page it is mounted on, for GTM', () => {
    const { container } = renderCards([makeEvent()])
    expect(
      container.querySelector('[data-calendar-source="quiz_night_date_card"]')
    ).not.toBeNull()
  })

  it('keeps the per-page details copy alongside the calendar control', () => {
    renderCards([makeEvent()])
    expect(screen.getByText('Teams up to six')).toBeInTheDocument()
  })

  it('offers no calendar control for a cancelled night', () => {
    renderCards([makeEvent({ eventStatus: 'cancelled', event_status: 'cancelled' })])
    expect(screen.queryByRole('link', { name: /Google Calendar/ })).toBeNull()
    expect(screen.queryByRole('link', { name: /Download a calendar file/ })).toBeNull()
  })

  it('offers no calendar control for a night that has already happened', () => {
    renderCards([makeEvent({ startDate: isoDaysFromNow(-3) })])
    expect(screen.queryByRole('link', { name: /Google Calendar/ })).toBeNull()
  })

  it('still shows the empty state when there are no dates', () => {
    renderCards([])
    expect(screen.getByText('No dates yet')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Google Calendar/ })).toBeNull()
  })
})
