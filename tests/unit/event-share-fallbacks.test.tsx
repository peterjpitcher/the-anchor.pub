/**
 * Sharing an event has to work on the devices that actually share.
 *
 * The share control used to sit in a `hidden lg:block` sidebar on the event
 * detail page, so the phone audience that does nearly all the sharing never saw
 * it. Now that it renders at every breakpoint, the paths a phone actually takes
 * are the ones that matter: a browser with no Web Share API, a share sheet the
 * person dismisses or the browser refuses, and a clipboard write that fails.
 * Every one of those must end somewhere useful, and the copy fallback has to
 * say out loud that it copied.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { EventSecondaryActions } from '@/components/events/EventSecondaryActions'
import type { Event } from '@/lib/api'

jest.mock('@/lib/gtm-events', () => ({
  trackSocialClick: jest.fn()
}))

const EVENT: Event = {
  '@type': 'Event',
  id: 'evt-quiz',
  slug: 'quiz-night-2026-09-16',
  name: 'Quiz Night',
  description: 'A friendly pub quiz.',
  startDate: '2026-09-16T19:00:00+01:00',
  eventStatus: 'scheduled',
  event_status: 'scheduled',
  eventAttendanceMode: 'OfflineEventAttendanceMode',
  bookings_enabled: true,
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
  }
} as unknown as Event

function setNavigatorMember(name: string, value: unknown): void {
  Object.defineProperty(window.navigator, name, {
    value,
    configurable: true,
    writable: true
  })
}

function clearNavigatorMember(name: string): void {
  // `delete` is how a capability is genuinely absent; setting undefined would
  // still leave the key in place, and the component tests with `in`.
  delete (window.navigator as unknown as Record<string, unknown>)[name]
}

function renderShare() {
  render(<EventSecondaryActions event={EVENT} source="test_share" />)
  return screen.getByRole('button', { name: /^Share\b/ })
}

beforeEach(() => {
  jest.useFakeTimers()
  clearNavigatorMember('share')
  clearNavigatorMember('clipboard')
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
  jest.restoreAllMocks()
  clearNavigatorMember('share')
  clearNavigatorMember('clipboard')
})

describe('event share control fallbacks', () => {
  it('uses the native share sheet when the browser has one', async () => {
    const share = jest.fn().mockResolvedValue(undefined)
    const writeText = jest.fn().mockResolvedValue(undefined)
    setNavigatorMember('share', share)
    setNavigatorMember('clipboard', { writeText })

    fireEvent.click(renderShare())

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1))
    expect(share.mock.calls[0][0].url).toContain('/events/quiz-night-2026-09-16')
    // The sheet is the confirmation, so nothing is copied behind the person.
    expect(writeText).not.toHaveBeenCalled()
  })

  it('copies the link and says so when the browser has no Web Share API', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined)
    setNavigatorMember('clipboard', { writeText })

    const button = renderShare()
    fireEvent.click(button)

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1))
    expect(writeText.mock.calls[0][0]).toContain('/events/quiz-night-2026-09-16')
    // Visible confirmation, not a silent copy.
    await waitFor(() => expect(button.textContent).toBe('Link copied'))
  })

  it('copies the link when the share sheet is refused or dismissed', async () => {
    const share = jest.fn().mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError'))
    const writeText = jest.fn().mockResolvedValue(undefined)
    setNavigatorMember('share', share)
    setNavigatorMember('clipboard', { writeText })

    const button = renderShare()
    fireEvent.click(button)

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(button.textContent).toBe('Link copied'))
  })

  it('opens the link when the clipboard is refused too, so the person is never stuck', async () => {
    const share = jest.fn().mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError'))
    const writeText = jest.fn().mockRejectedValue(new Error('Clipboard write denied'))
    const open = jest.fn()
    setNavigatorMember('share', share)
    setNavigatorMember('clipboard', { writeText })
    Object.defineProperty(window, 'open', { value: open, configurable: true, writable: true })

    fireEvent.click(renderShare())

    await waitFor(() => expect(open).toHaveBeenCalledTimes(1))
    expect(open.mock.calls[0][0]).toContain('/events/quiz-night-2026-09-16')
    expect(open.mock.calls[0][1]).toBe('_blank')
  })

  it('is reachable by keyboard and shows focus', () => {
    const button = renderShare()

    button.focus()
    expect(document.activeElement).toBe(button)
    expect(button.tagName).toBe('BUTTON')
    expect(button.getAttribute('type')).toBe('button')
    expect(button.className).toContain('focus:ring-2')
  })
})
