import { TextEncoder } from 'util'
import { Navigation } from '@/components/layout/Navigation'
import { getHeaderPromoCtas } from '@/lib/header-promos'
import { getActiveHeaderPromos } from '@/lib/header-promo-window'

// jsdom has no TextEncoder and react-dom/server will not load without one, so
// it is loaded with require, after the global is in place. An import would be
// hoisted above the assignment.
Object.assign(globalThis, { TextEncoder })
const { renderToString } = require('react-dom/server') as typeof import('react-dom/server')

jest.mock('@/lib/gtm-events', () => ({ trackModalClose: jest.fn(), trackModalEngage: jest.fn(), trackModalOpen: jest.fn(), trackNavigationClick: jest.fn() }))
jest.mock('@/hooks/useFocusTrap', () => ({ useFocusTrap: () => ({ current: null }) }))
// next/image sees jsdom's window, takes itself for the browser and warns about
// useLayoutEffect on every server render. The logo is not what is under test.
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => require('react').createElement('img', { alt })
}))

// The header's promo links used to be added by an effect, so the HTML the
// server sent had none. They arrived after hydration, made the utility strip
// 12px taller and pushed every desktop page down as it loaded: CLS 0.19 for
// real visitors (Chrome UX Report, 6 October 2026). These tests render the way
// the server does, with no effects, because that is the only place the fault
// shows.

const DURING_NATIONS = new Date('2026-10-06T10:00:00Z')
const NO_PROMOS_OPEN = new Date('2026-06-15T10:00:00Z')

const serverHtml = (at: Date): string => {
  const promos = getHeaderPromoCtas(at)
  return renderToString(
    <Navigation
      promoCtaButtons={promos}
      initialActivePromoCtaButtons={getActiveHeaderPromos(promos, at)}
      statusComponent={<span>status</span>}
    />
  )
}

/** The class list of the row that holds the status, the promo links and the phone number. */
const stripRowClasses = (html: string): string[] => {
  const match = /<div class="([^"]*)"><div class="[^"]*"><span>status<\/span>/.exec(html)
  if (!match) throw new Error('utility strip row not found in the server HTML')
  return match[1].split(/\s+/)
}

describe('getActiveHeaderPromos', () => {
  it.each([
    ['2026-09-04T22:59:00Z', false],
    ['2026-09-04T23:00:00Z', true],
    ['2026-11-29T23:59:00Z', true],
    ['2026-11-30T00:00:00Z', false],
  ])('opens the tournament link only in its London date window at %s', (instant, open) => {
    const at = new Date(instant)
    const labels = getActiveHeaderPromos(getHeaderPromoCtas(at), at).map((promo) => promo.label)
    expect(labels.includes('Nations Championship')).toBe(open)
  })

  it('hands back links only, with the schedule stripped off', () => {
    const [promo] = getActiveHeaderPromos(getHeaderPromoCtas(DURING_NATIONS), DURING_NATIONS)
    expect(promo).toBeDefined()
    expect(promo).not.toHaveProperty('startsOn')
    expect(promo).not.toHaveProperty('endsOn')
    expect(promo).not.toHaveProperty('leadDays')
  })
})

describe('Navigation, as the server renders it', () => {
  it('has the open promo links in the HTML, not added after hydration', () => {
    const html = serverHtml(DURING_NATIONS)
    expect(html).toContain('Nations Championship')
    expect(html).toContain('href="/christmas-parties"')
  })

  it('gives the strip a fixed height that holds the promo pills', () => {
    const classes = stripRowClasses(serverHtml(DURING_NATIONS))
    expect(classes).toContain('h-12')
    // Vertical padding would let the content set the height again.
    expect(classes.some((name) => /^p[ytb]-/.test(name))).toBe(false)
  })

  it('keeps the strip at its shorter fixed height when no promo is open', () => {
    const html = serverHtml(NO_PROMOS_OPEN)
    expect(html).not.toContain('Nations Championship')
    expect(stripRowClasses(html)).toContain('h-9')
  })

  it('never lets the links beside the status shrink or wrap', () => {
    const html = serverHtml(DURING_NATIONS)
    const group = /<div class="([^"]*)"><a [^>]*href="\/christmas-parties"/.exec(html)
    expect(group?.[1].split(/\s+/)).toEqual(expect.arrayContaining(['flex-shrink-0', 'whitespace-nowrap']))
  })
})
