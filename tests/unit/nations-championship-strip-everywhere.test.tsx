/**
 * The Nations Championship strip ends by itself after 29 November 2026, London
 * date, on every page that carries it (owner decision, 7 October 2026). PR #202
 * did this for /live-sport/six-nations only; the homepage, /whats-on,
 * /live-sport and /staines-pub kept a strip with no end date.
 *
 * Each page is a server component, so it is called and its elements inspected,
 * as tests/unit/whats-on-hero-journey.test.tsx does. What matters on the server
 * is the decision handed to the strip: `initiallyOpen` true puts the strip in
 * the HTML (no layout shift for today's visitors), false leaves it out. The
 * browser's second look is covered in six-nations-tournament-strip-window.
 *
 * The instants are written in UTC so the test means the same thing under
 * `npm test` (Europe/London) and `npm run test:utc`. 4 and 5 September are in
 * British Summer Time, so London midnight is 23:00 UTC the day before. 29 and
 * 30 November are in GMT, so London midnight is 00:00 UTC.
 */

import fs from 'fs'
import path from 'path'
import { isValidElement, type ReactElement } from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import { anchorAPI } from '@/lib/api/client'
import { TournamentLink } from '@/components/features/nations-championship/TournamentLink'
import { TournamentLinkInWindow } from '@/components/features/nations-championship/TournamentLinkInWindow'
import HomePage from '@/app/page'
import WhatsOnPage from '@/app/whats-on/page'
import LiveSportPage from '@/app/live-sport/page'
import StainesPubPage from '@/app/staines-pub/page'
import SixNationsPage from '@/app/live-sport/six-nations/page'

jest.mock('next/navigation', () => ({
  usePathname: () => '/'
}))

const BEFORE_START = '2026-09-04T22:59:00Z' // 23:59 on 4 September in London
const AT_START = '2026-09-04T23:00:00Z' // 00:00 on 5 September in London
const TODAY = '2026-10-07T12:00:00Z' // the day this was written
const LAST_MINUTE = '2026-11-29T23:59:00Z' // 23:59 on 29 November in London
const JUST_AFTER = '2026-11-30T00:00:00Z' // 00:00 on 30 November in London
const NEXT_YEAR = '2027-10-01T12:00:00Z'

const PAGES: [string, () => ReactElement | Promise<ReactElement>][] = [
  ['/', HomePage],
  ['/whats-on', WhatsOnPage],
  ['/live-sport', LiveSportPage],
  ['/staines-pub', StainesPubPage],
  ['/live-sport/six-nations', SixNationsPage]
]

const INSTANTS: [string, boolean][] = [
  [BEFORE_START, false],
  [AT_START, true],
  [TODAY, true],
  [LAST_MINUTE, true],
  [JUST_AFTER, false],
  [NEXT_YEAR, false]
]

const getEventsSpy = jest.spyOn(anchorAPI, 'getEvents')
const getBusinessHoursSpy = jest.spyOn(anchorAPI, 'getBusinessHours')
const getBusinessHoursSnapshotSpy = jest.spyOn(anchorAPI, 'getBusinessHoursSnapshot')

beforeEach(() => {
  // Nothing here is about the diary or the hours; an unmocked call would reach the live API.
  getEventsSpy.mockResolvedValue({ events: [], pagination: { total: 0, limit: 100, offset: 0 } })
  getBusinessHoursSpy.mockResolvedValue(null as unknown as Awaited<ReturnType<typeof anchorAPI.getBusinessHours>>)
  getBusinessHoursSnapshotSpy.mockResolvedValue(null as unknown as Awaited<ReturnType<typeof anchorAPI.getBusinessHoursSnapshot>>)
})

afterEach(() => {
  cleanup()
  jest.useRealTimers()
})

afterAll(() => {
  getEventsSpy.mockRestore()
  getBusinessHoursSpy.mockRestore()
  getBusinessHoursSnapshotSpy.mockRestore()
})

/** Every element declared in the page's own JSX, props included. Render
 *  functions are not followed. */
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

describe.each(PAGES)('the Nations Championship strip on %s', (_route, Page) => {
  it.each(INSTANTS)('on a page rendered at %s is in the HTML: %s', async (instant, shown) => {
    // Only the clock is faked: the pages await real promises.
    jest.useFakeTimers({ now: new Date(instant), doNotFake: ['setTimeout', 'setImmediate', 'nextTick', 'queueMicrotask'] })
    const elements = [...walk(await Page())]

    const strips = elements.filter((element) => element.type === TournamentLinkInWindow)
    expect(strips).toHaveLength(1)
    expect((strips[0].props as { initiallyOpen: boolean }).initiallyOpen).toBe(shown)
  })

  it('never mounts the strip without its window', async () => {
    const elements = [...walk(await Page())]
    expect(elements.filter((element) => element.type === TournamentLink)).toHaveLength(0)
  })
})

describe('the strip itself', () => {
  const link = (): HTMLElement | null => screen.queryByRole('link', { name: 'Choose a game and book' })

  it.each(INSTANTS)('opened at %s on a page built inside the window is shown: %s', (instant, shown) => {
    jest.useFakeTimers().setSystemTime(new Date(instant))
    render(<TournamentLinkInWindow initiallyOpen />)
    expect(link() !== null).toBe(shown)
  })

  it('renders nothing at all once the window has closed, so no empty band is left', () => {
    jest.useFakeTimers().setSystemTime(new Date(JUST_AFTER))
    const { container } = render(<TournamentLinkInWindow initiallyOpen={false} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('the rest of the site', () => {
  const ROOT = path.resolve(__dirname, '../..')
  const WINDOWED = path.join('components', 'features', 'nations-championship', 'TournamentLinkInWindow.tsx')

  function sourceFiles(dir: string): string[] {
    return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
      const relative = path.join(dir, entry.name)
      if (entry.isDirectory()) return sourceFiles(relative)
      return /\.tsx?$/.test(entry.name) ? [relative] : []
    })
  }

  it('has no page or component that mounts the strip without its window', () => {
    const offenders = ['app', 'components']
      .flatMap(sourceFiles)
      .filter((file) => file !== WINDOWED)
      .filter((file) => /<TournamentLink[\s/>]/.test(fs.readFileSync(path.join(ROOT, file), 'utf8')))

    expect(offenders).toEqual([])
  })
})
