/**
 * The add-to-calendar control gates itself on the event's phase.
 *
 * The backend has been able to produce .ics files and Google Calendar links for
 * a long time, with nothing on the site linking to them. Now that it is
 * mounted, the important guarantee is the negative one: a cancelled, postponed
 * or finished night must not be offered as something to put in a diary, even if
 * a later page mounts the component without checking first.
 */

import { render, screen } from '@testing-library/react'
import type { Event } from '@/lib/api'
import { AddToCalendar } from '@/components/events/AddToCalendar'

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const FIXED_NOW = Date.UTC(2026, 4, 1, 12, 0, 0) // 2026-05-01T12:00:00Z

function isoDaysFromNow(days: number): string {
  return new Date(FIXED_NOW + days * ONE_DAY_MS).toISOString()
}

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    '@type': 'Event',
    id: 'evt-123',
    slug: 'quiz-night-2026-05-08',
    name: 'Quiz Night',
    description: 'A friendly pub quiz.',
    startDate: isoDaysFromNow(7),
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

describe('AddToCalendar', () => {
  let nowSpy: jest.SpyInstance<number, []>

  beforeEach(() => {
    nowSpy = jest.spyOn(Date, 'now').mockReturnValue(FIXED_NOW)
  })

  afterEach(() => {
    nowSpy.mockRestore()
  })

  it('offers both destinations for an upcoming event', () => {
    render(<AddToCalendar event={makeEvent()} source="event_detail" />)

    const google = screen.getByRole('link', { name: /Google Calendar/i })
    const ics = screen.getByRole('link', { name: /calendar file/i })

    expect(google).toHaveAttribute('href', expect.stringContaining('calendar.google.com'))
    expect(google).toHaveAttribute('target', '_blank')
    expect(google).toHaveAttribute('rel', 'noopener noreferrer')
    expect(ics).toHaveAttribute('href', '/api/calendar/event/quiz-night-2026-05-08')
    expect(ics).toHaveAttribute('download')
    expect(screen.getByText('Add to calendar')).toBeInTheDocument()
  })

  it('points the google link at the public canonical url', () => {
    render(<AddToCalendar event={makeEvent()} source="event_detail" />)

    const href = screen.getByRole('link', { name: /Google Calendar/i }).getAttribute('href') || ''

    expect(href).toContain(encodeURIComponent('https://www.the-anchor.pub/events/quiz-night-2026-05-08'))
    expect(href).not.toContain('management.orangejelly.co.uk')
  })

  it('renders nothing for a cancelled event', () => {
    const { container } = render(
      <AddToCalendar
        event={makeEvent({ event_status: 'cancelled', eventStatus: 'cancelled' })}
        source="event_detail"
      />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing once the event has ended', () => {
    const { container } = render(
      <AddToCalendar event={makeEvent({ startDate: isoDaysFromNow(-2) })} source="event_detail" />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing for a postponed event', () => {
    const { container } = render(
      <AddToCalendar
        event={makeEvent({ event_status: 'postponed', eventStatus: 'postponed' })}
        source="event_detail"
      />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when the start date is unusable', () => {
    const { container } = render(
      <AddToCalendar event={makeEvent({ startDate: 'nonsense' })} source="event_detail" />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('falls back to the event id when there is no slug', () => {
    render(<AddToCalendar event={makeEvent({ slug: '' })} source="booking_confirmation" />)

    expect(screen.getByRole('link', { name: /calendar file/i })).toHaveAttribute(
      'href',
      '/api/calendar/event/evt-123'
    )
  })

  it('tags the mount point and the two actions for analytics, as actions not attendance', () => {
    render(<AddToCalendar event={makeEvent()} source="category_date_card" />)

    const group = screen.getByRole('group', { name: /Add Quiz Night to your calendar/i })

    expect(group).toHaveAttribute('data-calendar-source', 'category_date_card')
    expect(screen.getByRole('link', { name: /Google Calendar/i })).toHaveAttribute(
      'data-calendar-action',
      'google_calendar_open'
    )
    expect(screen.getByRole('link', { name: /calendar file/i })).toHaveAttribute(
      'data-calendar-action',
      'ics_file_download'
    )
  })

  it('hides the lead-in text when asked', () => {
    render(<AddToCalendar event={makeEvent()} source="event_detail" label={null} />)

    expect(screen.queryByText('Add to calendar')).not.toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })
})
