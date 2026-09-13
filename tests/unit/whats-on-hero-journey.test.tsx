/**
 * /whats-on must send people who came to pick a night to the nights.
 *
 * Measured on the live page on 11 September 2026 at 375px wide: the hero's
 * primary button said "Reserve an event table" and went to /book-table, the
 * dining wizard, whose first event link sat 4,863px down its own page. On
 * /whats-on itself the first event card started 1,522px down, below a rugby
 * card and the amenity strip. The hero click was not measured at all.
 *
 * The page is a server component, so it is awaited into elements and inspected,
 * as tests/unit/whats-on-events-outage.test.tsx does. The one client component
 * under test is then rendered on its own.
 */
import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { anchorAPI } from '@/lib/api/client'
import { InteriorHero } from '@/components/hero'
import { AmenityStrip } from '@/components/AmenityStrip'
import { TournamentLink } from '@/components/features/nations-championship/TournamentLink'
import { trackCtaClick } from '@/lib/gtm-events'

jest.mock('@/lib/gtm-events', () => ({
  ...jest.requireActual('@/lib/gtm-events'),
  trackCtaClick: jest.fn()
}))

import WhatsOnPage from '@/app/whats-on/page'
import { WhatsOnUpcomingButton } from '@/app/whats-on/_components/WhatsOnUpcomingButton'

const getEventsSpy = jest.spyOn(anchorAPI, 'getEvents')
const getBusinessHoursSpy = jest.spyOn(anchorAPI, 'getBusinessHours')

beforeEach(() => {
  // Nothing here is about the diary; an unmocked call would reach the live API.
  getEventsSpy.mockResolvedValue({ events: [], pagination: { total: 0, limit: 100, offset: 0 } })
  getBusinessHoursSpy.mockResolvedValue(null as unknown as Awaited<ReturnType<typeof anchorAPI.getBusinessHours>>)
  ;(trackCtaClick as jest.Mock).mockClear()
})

afterAll(() => {
  getEventsSpy.mockRestore()
  getBusinessHoursSpy.mockRestore()
})

/** The page's top-level blocks, in render order. */
function topLevelBlocks(page: ReactElement): ReactElement[] {
  const children = (page.props as { children?: ReactNode }).children
  return (Array.isArray(children) ? children : [children]).filter(isValidElement) as ReactElement[]
}

function serialise(node: unknown): string {
  return JSON.stringify(node, (_key, value) => (isValidElement(value) ? value.props : value)) ?? ''
}

describe('the hero', () => {
  it('leads with the nights on this page, not the table-booking wizard', async () => {
    const page = await WhatsOnPage()
    const hero = topLevelBlocks(page).find((block) => block.type === InteriorHero)
    if (!hero) throw new Error('No InteriorHero on /whats-on')

    const actions = (hero.props as { actions: ReactElement }).actions
    const primary = topLevelBlocks(actions)[0]
    expect(primary.type).toBe(WhatsOnUpcomingButton)
    expect(serialise(page)).not.toContain('whats_on_hero')
    expect(serialise(page)).not.toContain('Reserve an event table')
  })

  it('jumps to the upcoming list and records the click', () => {
    render(<WhatsOnUpcomingButton />)

    const link = screen.getByRole('link', { name: 'See what’s coming up' })
    expect(link).toHaveAttribute('href', '#upcoming-events')

    fireEvent.click(link)
    expect(trackCtaClick).toHaveBeenCalledWith(
      expect.objectContaining({ location: 'hero', destination: '#upcoming-events', context: 'whats_on' })
    )
  })
})

describe('the running order', () => {
  it('puts the upcoming nights directly under the hero, ahead of the rugby card and amenities', async () => {
    const blocks = topLevelBlocks(await WhatsOnPage())
    const indexOf = (match: (block: ReactElement) => boolean) => blocks.findIndex(match)

    const hero = indexOf((block) => block.type === InteriorHero)
    const upcoming = indexOf((block) => (block.props as { id?: string }).id === 'upcoming-events')
    const rugby = indexOf((block) => block.type === TournamentLink)
    const amenities = indexOf((block) => block.type === AmenityStrip)

    expect(hero).toBeGreaterThanOrEqual(0)
    expect(upcoming).toBe(hero + 1)
    expect(rugby).toBeGreaterThan(upcoming)
    expect(amenities).toBeGreaterThan(upcoming)
  })
})
