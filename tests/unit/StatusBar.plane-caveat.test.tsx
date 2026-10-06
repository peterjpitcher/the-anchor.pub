import { render, screen } from '@testing-library/react'
import { StatusBar } from '@/components/layout/StatusBar'

jest.mock('@/hooks/useBusinessHours', () => ({
  useBusinessHours: jest.fn()
}))

import { useBusinessHours } from '@/hooks/useBusinessHours'

/**
 * The plane-spotting line says when aircraft are expected overhead. The caveat
 * that it is not guaranteed has to reach a screen reader as reliably as the
 * time does.
 *
 * It used to sit in an `aria-label` on a plain `span`. A span with no role is
 * not allowed a name, so a screen reader may ignore the label, and someone
 * listening could hear "Planes: expected until 3pm" with no caveat at all.
 * axe reported it on every page as `aria-prohibited-attr`.
 *
 * So these tests read the text of the row, which is what gets spoken, and
 * deliberately not its accessible name: jsdom honours an `aria-label` on any
 * element, so a name-based assertion passed while the fault was live.
 */

const CAVEAT = 'Weather and Heathrow operations dependent, not guaranteed.'

const WEDNESDAY = {
  opens: '12:00:00',
  closes: '22:00:00',
  kitchen: { opens: '12:00:00', closes: '21:00:00' },
  is_closed: false,
  is_kitchen_closed: false
}

function renderAt(utcIso: string, date: string) {
  jest.setSystemTime(new Date(utcIso))
  ;(useBusinessHours as jest.Mock).mockReturnValue({
    hours: {
      currentStatus: { isOpen: true, kitchenOpen: true },
      today: { date, dayName: 'wednesday', summary: '', isSpecialHours: false, events: [] },
      regularHours: { wednesday: WEDNESDAY },
      specialHours: [],
      upcomingVersions: []
    },
    loading: false,
    error: null
  })
  // The real runway alternation supplies the wording, as it does in production.
  return render(<StatusBar variant="nav" showKitchen />)
}

beforeAll(() => {
  jest.useFakeTimers()
})

afterAll(() => {
  jest.useRealTimers()
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('StatusBar plane-spotting caveat', () => {
  it.each([
    // 13:00 London on a Wednesday in each half of the weekly alternation.
    ['2026-05-20T12:00:00.000Z', '2026-05-20', 'Planes: expected until 3pm'],
    ['2026-05-27T12:00:00.000Z', '2026-05-27', 'Planes: expected from 3pm']
  ])('speaks the caveat after the time (%s)', (utcIso, date, visibleText) => {
    renderAt(utcIso, date)

    // The visible words are a text node of their own, unchanged.
    const row = screen.getByText(visibleText)
    expect(row).toHaveTextContent(`${visibleText}. ${CAVEAT}`, { normalizeWhitespace: false })

    // The whole bar is a polite live region, which announces text content.
    expect(screen.getByRole('status')).toHaveTextContent(CAVEAT)
  })

  it('keeps the caveat out of sight, so the bar looks the same', () => {
    renderAt('2026-05-20T12:00:00.000Z', '2026-05-20')

    const row = screen.getByText('Planes: expected until 3pm')
    const hidden = row.querySelector('.sr-only')
    expect(hidden).not.toBeNull()
    expect(hidden).toHaveTextContent(CAVEAT)

    // Hover still shows the caveat as a tooltip.
    expect(row.closest('[title]')).toHaveAttribute('title', CAVEAT)
  })

  it('names nothing with aria-label on an element that has no role', () => {
    const { container } = renderAt('2026-05-20T12:00:00.000Z', '2026-05-20')

    expect(container.querySelector('span[aria-label]:not([role]), div[aria-label]:not([role])')).toBeNull()
  })
})
