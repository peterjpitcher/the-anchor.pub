/**
 * EV-023. /live-sport was the only page in the event set that handed
 * `InteriorHero` no `actions`, so the first clickable thing on the page sat
 * roughly two thirds of the way down. These tests lock the hero action pair in
 * place, check where each one actually goes, and guard the facts the page is
 * most likely to drift on.
 *
 * The banned-claim check deliberately allows honest denials. The page has to be
 * able to say "we do not have Sky Sports or TNT Sports", and an earlier guard on
 * this site failed pages for saying exactly that. So a string naming Sky or TNT
 * passes when it carries a negation, or when it is a question rather than a
 * claim.
 */

import { isValidElement, type ReactElement } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { InteriorHero } from '@/components/hero'
import { CONTACT } from '@/lib/constants'
import { trackCtaClick, trackTableBookingClick, trackPhoneCallClick } from '@/lib/gtm-events'
import ScrollDepthTracker from '@/components/tracking/ScrollDepthTracker'
import LiveSportPage from '@/app/live-sport/page'

jest.mock('@/lib/gtm-events', () => ({
  ...jest.requireActual('@/lib/gtm-events'),
  trackCtaClick: jest.fn(),
  trackTableBookingClick: jest.fn(),
  trackPhoneCallClick: jest.fn()
}))

jest.mock('next/navigation', () => ({
  usePathname: () => '/live-sport'
}))

const mockTrackCtaClick = trackCtaClick as jest.MockedFunction<typeof trackCtaClick>
const mockTrackPhoneCallClick = trackPhoneCallClick as jest.MockedFunction<typeof trackPhoneCallClick>

/** Every element declared in the page's own JSX, props included, so elements
 *  handed to another component as a prop (InteriorHero takes its actions that
 *  way) are reachable. Render functions are not followed. */
function* walk(node: unknown): Generator<ReactElement> {
  if (Array.isArray(node)) {
    for (const child of node) yield* walk(child)
    return
  }
  if (!isValidElement(node)) return
  yield node
  for (const value of Object.values(node.props as Record<string, unknown>)) {
    if (Array.isArray(value) || isValidElement(value)) yield* walk(value)
  }
}

/** Every human-readable string in the tree: text children and string props. */
function* strings(node: unknown): Generator<string> {
  if (typeof node === 'string') {
    yield node
    return
  }
  if (Array.isArray(node)) {
    for (const child of node) yield* strings(child)
    return
  }
  if (!isValidElement(node)) return
  for (const value of Object.values(node.props as Record<string, unknown>)) {
    yield* strings(value)
  }
}

async function renderedPage(): Promise<ReactElement> {
  return (await LiveSportPage()) as ReactElement
}

function heroOf(page: ReactElement): ReactElement {
  const heroes = [...walk(page)].filter((element) => element.type === InteriorHero)
  expect(heroes).toHaveLength(1)
  return heroes[0]
}

// window.location is replaced because BookTableButton navigates by assigning to
// href, which jsdom refuses to do for real.
const originalLocation = window.location
let currentHref = 'http://localhost/live-sport'

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    enumerable: true,
    value: {
      get href() {
        return currentHref
      },
      set href(value: string) {
        currentHref = value
      },
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      origin: originalLocation.origin,
      pathname: '/live-sport',
      search: '',
      hash: ''
    }
  })
})

afterAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    enumerable: true,
    value: originalLocation
  })
})

beforeEach(() => {
  jest.clearAllMocks()
  currentHref = 'http://localhost/live-sport'
})

describe('/live-sport hero call to action', () => {
  it('gives the hero an action pair rather than leaving the first action two thirds down', async () => {
    const hero = heroOf(await renderedPage())

    expect(hero.props.actions).toBeTruthy()

    render(<>{hero.props.actions}</>)

    expect(screen.getByRole('button', { name: /book a table for the game/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: new RegExp(`call ${CONTACT.phone}`, 'i') })).toBeInTheDocument()
  })

  it('sends the primary hero action to the table booking wizard and tags it as the hero', async () => {
    const hero = heroOf(await renderedPage())
    render(<>{hero.props.actions}</>)

    fireEvent.click(screen.getByRole('button', { name: /book a table for the game/i }))

    expect(currentHref).toBe('/book-table')
    expect(mockTrackCtaClick).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'book_table_sport_hero',
        location: 'sport_hero',
        destination: 'book_table'
      })
    )
    expect(trackTableBookingClick).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'sport_hero', destination: '/book-table' })
    )
  })

  it('sends the secondary hero action to the pub phone number', async () => {
    const hero = heroOf(await renderedPage())
    const { container } = render(<>{hero.props.actions}</>)

    const telLink = container.querySelector('a[href^="tel:"]')
    expect(telLink).toHaveAttribute('href', `tel:${CONTACT.phoneIntl}`)

    fireEvent.click(telLink as Element)
    expect(mockTrackPhoneCallClick).toHaveBeenCalledWith({ phone: CONTACT.phone, source: 'sport_hero' })
  })

  it('tracks scroll depth, as the four game night pages do', async () => {
    const page = await renderedPage()
    expect([...walk(page)].some((element) => element.type === ScrollDepthTracker)).toBe(true)
  })
})

describe('/live-sport copy stays inside the SSOT', () => {
  it('never claims a subscription sports channel, but may deny one', async () => {
    const page = await renderedPage()
    const offenders = [...strings(page)]
      .filter((text) => /\b(sky|tnt)\b/i.test(text))
      .filter((text) => {
        const isQuestion = text.trim().endsWith('?')
        const isDenial = /\b(no|not|cannot|can't|don't|only|exclusive to)\b/i.test(text)
        return !isQuestion && !isDenial
      })

    expect(offenders).toEqual([])
  })

  it('carries no live music wording, which is discontinued in full', async () => {
    const page = await renderedPage()
    expect([...strings(page)].filter((text) => /live\s+music/i.test(text))).toEqual([])
  })

  it('hardcodes no opening or closing times in the hero', async () => {
    const hero = heroOf(await renderedPage())
    const heroText = [...strings(hero)].join(' ')

    expect(heroText).not.toMatch(/\b\d{1,2}(?::\d{2})?\s?(?:am|pm)\b/i)
    expect(heroText).not.toMatch(/\b(?:open|closing|close)s?\s+(?:from|at|until)\b/i)
    expect(heroText).not.toMatch(/\bdoors\b/i)
  })

  it('promises no late finish in the hero', async () => {
    const hero = heroOf(await renderedPage())
    const heroText = [...strings(hero)].join(' ')

    expect(heroText).not.toMatch(/\b(?:stay|staying|open)\s+(?:open\s+)?(?:late|until the (?:final )?whistle)/i)
  })
})
