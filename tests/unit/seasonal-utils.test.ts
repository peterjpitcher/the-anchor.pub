import fs from 'fs'
import path from 'path'
import {
  getSeasonalHomepageImage,
  getSeasonalGreeting,
  getSeasonalAltText,
  getSeasonalFocal,
  getSeasonalObjectPosition,
  resolveSeasonalFields,
  validateSeasonalImage,
  type SeasonalImage,
} from '@/lib/seasonal-utils'

/**
 * Unit coverage for lib/seasonal-utils.ts.
 *
 * Environment notes (jest runs under jsdom — see jest.config.js):
 * - `typeof window !== 'undefined'` is TRUE by default, so both
 *   getSeasonalHomepageImage's validation and validateSeasonalImage take the
 *   client-side short-circuit unless we `deleteWindow()` within a test.
 * - NODE_ENV defaults to 'test' (next/jest), i.e. NOT 'production'.
 * - The source resolves fs lazily via `require('fs')`, which shares the same
 *   module singleton as the top-level `import fs from 'fs'`, so spying on
 *   `fs.existsSync` here affects the code under test.
 */

const DEFAULT_IMAGE = '/images/page-headers/home/page-headers-homepage.jpg'
const seasonalSrc = (season: string) =>
  `/images/page-headers/home/seasonal/${season}/page-headers-homepage.jpg`

// Noon UTC is safe across both GMT and BST — London is never more than one hour
// ahead, so 12:00 UTC never crosses a day boundary. (See lib/time-london.ts.)
const utcNoon = (year: number, monthZeroBased: number, day: number) =>
  new Date(Date.UTC(year, monthZeroBased, day, 12, 0, 0))

// Deliberately-invalid season to exercise the documented fallbacks.
const UNKNOWN_SEASON = 'not-a-real-season' as unknown as SeasonalImage['season']

const ENV_KEYS = [
  'NEXT_PUBLIC_FORCE_SEASON',
  'SEASONAL_IMAGE_LOGS',
  'API_DEBUG_LOGS',
  'NODE_ENV',
] as const

type MutableEnv = Record<string, string | undefined>
type MaybeWindow = { window?: unknown }

const originalEnv: MutableEnv = {}
ENV_KEYS.forEach((key) => {
  originalEnv[key] = process.env[key]
})
const originalWindow = (global as MaybeWindow).window

function setNodeEnv(value: string) {
  ;(process.env as MutableEnv).NODE_ENV = value
}

/** Removes the global `window` so the server-side branches execute. */
function deleteWindow() {
  delete (global as MaybeWindow).window
}

afterEach(() => {
  // Restore env + window FIRST, so an exception while restoring mocks can never
  // leak a mutated NODE_ENV / deleted window into the next test.
  ENV_KEYS.forEach((key) => {
    if (originalEnv[key] === undefined) {
      delete (process.env as MutableEnv)[key]
    } else {
      ;(process.env as MutableEnv)[key] = originalEnv[key]
    }
  })
  ;(global as MaybeWindow).window = originalWindow
  jest.restoreAllMocks()
})

describe('getSeasonalHomepageImage', () => {
  describe('forced season override (NEXT_PUBLIC_FORCE_SEASON)', () => {
    it('should return the forced season image when set to a valid season', () => {
      process.env.NEXT_PUBLIC_FORCE_SEASON = 'summer'

      expect(getSeasonalHomepageImage()).toEqual({
        src: seasonalSrc('summer'),
        season: 'summer',
        fallback: DEFAULT_IMAGE,
      })
    })

    it('should NOT remap remembrance to autumn in the forced path', () => {
      process.env.NEXT_PUBLIC_FORCE_SEASON = 'remembrance'

      expect(getSeasonalHomepageImage()).toEqual({
        src: seasonalSrc('remembrance'),
        season: 'remembrance',
        fallback: DEFAULT_IMAGE,
      })
    })

    it('should ignore the testDate entirely when a season is forced', () => {
      process.env.NEXT_PUBLIC_FORCE_SEASON = 'winter'

      // July date is ignored because the forced override returns first.
      expect(getSeasonalHomepageImage(utcNoon(2026, 6, 15))).toEqual({
        src: seasonalSrc('winter'),
        season: 'winter',
        fallback: DEFAULT_IMAGE,
      })
    })

    it('should log the forced season when SEASONAL_IMAGE_LOGS is "true"', () => {
      process.env.NEXT_PUBLIC_FORCE_SEASON = 'spring'
      process.env.SEASONAL_IMAGE_LOGS = 'true'
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      const result = getSeasonalHomepageImage()

      expect(logSpy).toHaveBeenCalledWith('[Seasonal Image] Forced season: spring')
      expect(result.season).toBe('spring')
      expect(result.src).toBe(seasonalSrc('spring'))
    })

    it('should also enable logging via the API_DEBUG_LOGS flag', () => {
      process.env.NEXT_PUBLIC_FORCE_SEASON = 'autumn'
      process.env.API_DEBUG_LOGS = 'true'
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      getSeasonalHomepageImage()

      expect(logSpy).toHaveBeenCalledWith('[Seasonal Image] Forced season: autumn')
    })

    it('should NOT log the forced season when neither logging flag is set', () => {
      process.env.NEXT_PUBLIC_FORCE_SEASON = 'summer'
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      getSeasonalHomepageImage()

      expect(logSpy).not.toHaveBeenCalled()
    })
  })

  describe('date-based season mapping', () => {
    // [label, date, expected season, expected asset season]
    const cases: Array<[string, Date, SeasonalImage['season'], string]> = [
      ['January 1 (winter lower boundary)', utcNoon(2026, 0, 1), 'winter', 'winter'],
      ['February 28 (winter)', utcNoon(2026, 1, 28), 'winter', 'winter'],
      ['February 29 in a leap year (winter upper boundary)', utcNoon(2024, 1, 29), 'winter', 'winter'],
      ['March 1 (spring lower boundary)', utcNoon(2026, 2, 1), 'spring', 'spring'],
      ['May 31 (spring upper boundary)', utcNoon(2026, 4, 31), 'spring', 'spring'],
      ['June 1 (summer lower boundary)', utcNoon(2026, 5, 1), 'summer', 'summer'],
      ['August 31 (summer upper boundary)', utcNoon(2026, 7, 31), 'summer', 'summer'],
      ['September 1 (autumn lower boundary)', utcNoon(2026, 8, 1), 'autumn', 'autumn'],
      ['September 30 (autumn upper boundary)', utcNoon(2026, 8, 30), 'autumn', 'autumn'],
      ['October 1 (halloween lower boundary)', utcNoon(2026, 9, 1), 'halloween', 'halloween'],
      ['October 31 (halloween upper boundary)', utcNoon(2026, 9, 31), 'halloween', 'halloween'],
      // Remembrance keeps its own season label but reuses the autumn asset.
      ['November 1 (remembrance lower boundary)', utcNoon(2026, 10, 1), 'remembrance', 'autumn'],
      ['November 11 (remembrance upper boundary)', utcNoon(2026, 10, 11), 'remembrance', 'autumn'],
      ['November 12 (remembrance to christmas crossover)', utcNoon(2026, 10, 12), 'christmas', 'christmas'],
      ['December 1 (christmas)', utcNoon(2026, 11, 1), 'christmas', 'christmas'],
      ['December 31 (christmas upper boundary)', utcNoon(2026, 11, 31), 'christmas', 'christmas'],
    ]

    // Default jsdom env: window present -> validation short-circuits to true,
    // so the seasonal asset path is always returned.
    it.each(cases)('should resolve %s', (_label, date, season, assetSeason) => {
      expect(getSeasonalHomepageImage(date)).toEqual({
        src: seasonalSrc(assetSeason),
        season,
        fallback: DEFAULT_IMAGE,
      })
    })
  })

  describe('missing-asset fallback (server-side, non-production)', () => {
    it('should fall back to the default image when the computed asset is missing', () => {
      deleteWindow()
      jest.spyOn(fs, 'existsSync').mockReturnValue(false)
      jest.spyOn(console, 'warn').mockImplementation(() => {})

      expect(getSeasonalHomepageImage(utcNoon(2026, 6, 1))).toEqual({
        src: DEFAULT_IMAGE,
        season: 'summer',
        fallback: DEFAULT_IMAGE,
      })
    })

    it('should warn with the falling-back message when it falls back', () => {
      deleteWindow()
      jest.spyOn(fs, 'existsSync').mockReturnValue(false)
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

      const result = getSeasonalHomepageImage(utcNoon(2026, 0, 15))

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '[Seasonal Image] Falling back to default header image. Missing asset at ' +
            seasonalSrc('winter')
        )
      )
      expect(result.src).toBe(DEFAULT_IMAGE)
      expect(result.season).toBe('winter')
    })
  })

  describe('validation short-circuits', () => {
    it('should keep the seasonal src under jsdom even if fs.existsSync would be false', () => {
      const existsSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false)

      const result = getSeasonalHomepageImage(utcNoon(2026, 8, 15))

      // window short-circuit means fs is never consulted.
      expect(existsSpy).not.toHaveBeenCalled()
      expect(result).toEqual({
        src: seasonalSrc('autumn'),
        season: 'autumn',
        fallback: DEFAULT_IMAGE,
      })
    })

    it('should keep the seasonal src in production (validation short-circuits to true)', () => {
      deleteWindow()
      setNodeEnv('production')
      const existsSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false)

      const result = getSeasonalHomepageImage(utcNoon(2026, 9, 15))

      expect(existsSpy).not.toHaveBeenCalled()
      expect(result).toEqual({
        src: seasonalSrc('halloween'),
        season: 'halloween',
        fallback: DEFAULT_IMAGE,
      })
    })
  })

  describe('server-side serving log', () => {
    it('should log the serving message server-side when SEASONAL_IMAGE_LOGS is "true"', () => {
      deleteWindow()
      setNodeEnv('production') // validateSeasonalImage returns true without touching fs
      process.env.SEASONAL_IMAGE_LOGS = 'true'
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      const result = getSeasonalHomepageImage(utcNoon(2026, 6, 1))

      expect(logSpy).toHaveBeenCalledWith(
        '[Seasonal Image] Serving summer image: ' + seasonalSrc('summer')
      )
      expect(result.src).toBe(seasonalSrc('summer'))
    })

    it('should NOT log the serving message under jsdom even with SEASONAL_IMAGE_LOGS="true"', () => {
      process.env.SEASONAL_IMAGE_LOGS = 'true'
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      getSeasonalHomepageImage(utcNoon(2026, 3, 15))

      expect(logSpy).not.toHaveBeenCalled()
    })
  })

  describe('return shape', () => {
    it('should never include an objectPosition key', () => {
      const result = getSeasonalHomepageImage(utcNoon(2026, 0, 15))

      expect(Object.keys(result).sort()).toEqual(['fallback', 'season', 'src'])
      expect(result).not.toHaveProperty('objectPosition')
    })

    it('should default to the current date when no testDate is given', () => {
      // Season is date-dependent, so assert the shape rather than a fixed value.
      const knownSeasons: Array<SeasonalImage['season']> = [
        'winter',
        'spring',
        'summer',
        'autumn',
        'halloween',
        'remembrance',
        'christmas',
      ]

      const result = getSeasonalHomepageImage()

      expect(knownSeasons).toContain(result.season)
      expect(result.fallback).toBe(DEFAULT_IMAGE)
      expect(typeof result.src).toBe('string')
      expect(result.src.endsWith('page-headers-homepage.jpg')).toBe(true)
    })
  })
})

describe('resolveSeasonalFields', () => {
  const EMPTY = {
    details: [],
    hasDetails: false,
    ctaLabel: undefined,
    ctaDestination: undefined,
  }

  it('should return empty details when called with no argument', () => {
    expect(resolveSeasonalFields()).toEqual(EMPTY)
  })

  it('should return empty details when passed an empty object', () => {
    expect(resolveSeasonalFields({})).toEqual(EMPTY)
  })

  it('should drop fields whose value is an empty string', () => {
    expect(
      resolveSeasonalFields({
        occasionDate: '',
        annualTheme: '',
        performer: '',
        foodServiceTimes: '',
        specialMenu: '',
        specialOffer: '',
        pricing: '',
        bookingStatus: '',
        ticketStatus: '',
        ctaLabel: '',
        ctaDestination: '',
      })
    ).toEqual(EMPTY)
  })

  it('should drop fields whose value is whitespace-only', () => {
    expect(
      resolveSeasonalFields({
        occasionDate: '   ',
        annualTheme: '\t',
        performer: '\n',
        foodServiceTimes: '  \t \n ',
        ctaLabel: '   ',
        ctaDestination: '\t\n',
      })
    ).toEqual(EMPTY)
  })

  it('should trim surrounding whitespace from a populated value', () => {
    expect(resolveSeasonalFields({ occasionDate: '  Sunday 4 April 2027  ' })).toEqual({
      details: [{ label: 'Date', value: 'Sunday 4 April 2027' }],
      hasDetails: true,
      ctaLabel: undefined,
      ctaDestination: undefined,
    })
  })

  it('should preserve internal whitespace while trimming only the edges', () => {
    expect(resolveSeasonalFields({ performer: '  DJ  Smooth  Mike  ' })).toEqual({
      details: [{ label: 'Entertainment', value: 'DJ  Smooth  Mike' }],
      hasDetails: true,
      ctaLabel: undefined,
      ctaDestination: undefined,
    })
  })

  it('should map each populated field to its row in the exact display order', () => {
    expect(
      resolveSeasonalFields({
        occasionDate: 'D',
        annualTheme: 'T',
        performer: 'P',
        eventStartTime: '8pm',
        eventEndTime: '1am',
        foodServiceTimes: 'F',
        specialMenu: 'SM',
        specialOffer: 'SO',
        pricing: 'PR',
        bookingStatus: 'B',
        ticketStatus: 'TK',
      })
    ).toEqual({
      details: [
        { label: 'Date', value: 'D' },
        { label: 'Annual theme', value: 'T' },
        { label: 'Entertainment', value: 'P' },
        { label: 'Event time', value: '8pm to 1am' },
        { label: 'Food service', value: 'F' },
        { label: 'Special menu', value: 'SM' },
        { label: 'Special offer', value: 'SO' },
        { label: 'Pricing', value: 'PR' },
        { label: 'Booking', value: 'B' },
        { label: 'Tickets', value: 'TK' },
      ],
      hasDetails: true,
      ctaLabel: undefined,
      ctaDestination: undefined,
    })
  })

  it('should preserve display order for a scrambled, non-adjacent subset', () => {
    expect(
      resolveSeasonalFields({
        ticketStatus: 'Free entry',
        pricing: 'live on our menu',
        occasionDate: '31 Oct 2027',
      })
    ).toEqual({
      details: [
        { label: 'Date', value: '31 Oct 2027' },
        { label: 'Pricing', value: 'live on our menu' },
        { label: 'Tickets', value: 'Free entry' },
      ],
      hasDetails: true,
      ctaLabel: undefined,
      ctaDestination: undefined,
    })
  })

  describe('event time row', () => {
    it('should combine start and end into "X to Y"', () => {
      expect(resolveSeasonalFields({ eventStartTime: '8pm', eventEndTime: '1am' }).details).toEqual([
        { label: 'Event time', value: '8pm to 1am' },
      ])
    })

    it('should render "From X" when only the start time is given', () => {
      expect(resolveSeasonalFields({ eventStartTime: '8pm' }).details).toEqual([
        { label: 'Event time', value: 'From 8pm' },
      ])
    })

    it('should render "Until Y" when only the end time is given', () => {
      expect(resolveSeasonalFields({ eventEndTime: '1am' }).details).toEqual([
        { label: 'Event time', value: 'Until 1am' },
      ])
    })

    it('should omit the event time row when neither time is given', () => {
      expect(resolveSeasonalFields({ occasionDate: '4 April 2027' }).details).toEqual([
        { label: 'Date', value: '4 April 2027' },
      ])
    })

    it('should omit the event time row when both times are whitespace-only', () => {
      expect(resolveSeasonalFields({ eventStartTime: '   ', eventEndTime: '\t\n' })).toEqual(EMPTY)
    })

    it('should treat a whitespace-only end as absent and produce "From X"', () => {
      expect(resolveSeasonalFields({ eventStartTime: ' 8pm ', eventEndTime: '   ' }).details).toEqual([
        { label: 'Event time', value: 'From 8pm' },
      ])
    })
  })

  describe('CTA overrides', () => {
    it('should surface a trimmed ctaLabel without adding a details row', () => {
      expect(resolveSeasonalFields({ ctaLabel: '  Book your table  ' })).toEqual({
        details: [],
        hasDetails: false,
        ctaLabel: 'Book your table',
        ctaDestination: undefined,
      })
    })

    it('should surface a trimmed ctaDestination without adding a details row', () => {
      expect(resolveSeasonalFields({ ctaDestination: '  /book-table  ' })).toEqual({
        details: [],
        hasDetails: false,
        ctaLabel: undefined,
        ctaDestination: '/book-table',
      })
    })

    it('should surface both cleaned CTA overrides alongside populated rows', () => {
      expect(
        resolveSeasonalFields({
          occasionDate: '4 April 2027',
          ctaLabel: '  Reserve now  ',
          ctaDestination: '  https://www.the-anchor.pub/book-table  ',
        })
      ).toEqual({
        details: [{ label: 'Date', value: '4 April 2027' }],
        hasDetails: true,
        ctaLabel: 'Reserve now',
        ctaDestination: 'https://www.the-anchor.pub/book-table',
      })
    })

    it('should leave hasDetails false when only CTA overrides are provided', () => {
      expect(resolveSeasonalFields({ ctaLabel: 'Book', ctaDestination: '/book-table' })).toEqual({
        details: [],
        hasDetails: false,
        ctaLabel: 'Book',
        ctaDestination: '/book-table',
      })
    })
  })

  it('should set hasDetails true when exactly one row resolves', () => {
    expect(resolveSeasonalFields({ bookingStatus: 'Booking recommended' })).toEqual({
      details: [{ label: 'Booking', value: 'Booking recommended' }],
      hasDetails: true,
      ctaLabel: undefined,
      ctaDestination: undefined,
    })
  })

  it('should drop blank fields but keep populated ones in a mixed input', () => {
    expect(
      resolveSeasonalFields({
        occasionDate: '4 April 2027',
        annualTheme: '   ',
        performer: '',
        specialMenu: 'See live menu',
        specialOffer: '\t',
        pricing: 'live on our menu',
      })
    ).toEqual({
      details: [
        { label: 'Date', value: '4 April 2027' },
        { label: 'Special menu', value: 'See live menu' },
        { label: 'Pricing', value: 'live on our menu' },
      ],
      hasDetails: true,
      ctaLabel: undefined,
      ctaDestination: undefined,
    })
  })
})

describe('getSeasonalGreeting', () => {
  const greetings: Array<[SeasonalImage['season'], string]> = [
    ['winter', 'Welcome to The Anchor – Settle in for winter warmth and great company.'],
    ['spring', 'Welcome to The Anchor – Fresh blooms and cheerful catch-ups await.'],
    ['summer', 'Welcome to The Anchor – Sun-soaked tables and easygoing smiles.'],
    ['autumn', 'Welcome to The Anchor – Cozy corners and comforting flavours.'],
    ['halloween', 'Welcome to The Anchor – Gather close for spooktacular stories.'],
    ['remembrance', 'We Remember Together at The Anchor – With warm gratitude.'],
    ['christmas', 'Welcome to The Anchor – Festive warmth and cheer await.'],
  ]

  it.each(greetings)('should return the %s greeting', (season, expected) => {
    expect(getSeasonalGreeting(season)).toBe(expected)
  })

  it('should return the generic fallback for an unknown season', () => {
    expect(getSeasonalGreeting(UNKNOWN_SEASON)).toBe('Welcome to The Anchor')
  })
})

describe('getSeasonalAltText', () => {
  const altTexts: Array<[SeasonalImage['season'], string]> = [
    ['winter', 'The Anchor pub in Stanwell Moor dressed for the winter season.'],
    ['spring', 'The Anchor pub garden bursting with fresh spring colour.'],
    ['summer', 'The Anchor pub beer garden enjoying gentle summer sunshine.'],
    ['autumn', 'The Anchor pub surrounded by rich autumn colour.'],
    ['halloween', 'The Anchor pub softly lit with welcoming Halloween decorations.'],
    ['remembrance', 'The Anchor pub adorned with a respectful remembrance poppy tribute.'],
    ['christmas', 'The Anchor pub twinkling with festive Christmas decorations.'],
  ]

  it.each(altTexts)('should return the %s alt text', (season, expected) => {
    expect(getSeasonalAltText(season)).toBe(expected)
  })

  it('should return the generic fallback for an unknown season', () => {
    expect(getSeasonalAltText(UNKNOWN_SEASON)).toBe('The Anchor pub in Stanwell Moor')
  })
})

describe('getSeasonalFocal', () => {
  const knownSeasons: Array<SeasonalImage['season']> = [
    'winter',
    'spring',
    'summer',
    'autumn',
    'halloween',
    'remembrance',
    'christmas',
  ]

  it.each(knownSeasons)('should return the centered focal for %s', (season) => {
    expect(getSeasonalFocal(season)).toEqual({ x: 50, yMobile: 50, yDesktop: 50 })
  })

  it('should return the lifted fallback focal for an unknown season', () => {
    expect(getSeasonalFocal(UNKNOWN_SEASON)).toEqual({ x: 50, yMobile: 15, yDesktop: 10 })
  })
})

describe('getSeasonalObjectPosition (deprecated)', () => {
  const knownSeasons: Array<SeasonalImage['season']> = [
    'winter',
    'spring',
    'summer',
    'autumn',
    'halloween',
    'remembrance',
    'christmas',
  ]

  it.each(knownSeasons)('should return "50%% 50%%" for %s', (season) => {
    expect(getSeasonalObjectPosition(season)).toBe('50% 50%')
  })

  it('should return "50% 15%" for an unknown season', () => {
    expect(getSeasonalObjectPosition(UNKNOWN_SEASON)).toBe('50% 15%')
  })
})

describe('validateSeasonalImage', () => {
  it('should return true without touching fs when NODE_ENV is production', () => {
    setNodeEnv('production')
    const existsSpy = jest.spyOn(fs, 'existsSync')

    expect(validateSeasonalImage(seasonalSrc('winter'))).toBe(true)
    expect(existsSpy).not.toHaveBeenCalled()
  })

  it('should return true via the client-side branch when window is defined', () => {
    // jsdom default: window present, NODE_ENV='test'.
    const existsSpy = jest.spyOn(fs, 'existsSync')

    expect(validateSeasonalImage('/images/does-not-matter.jpg')).toBe(true)
    expect(existsSpy).not.toHaveBeenCalled()
  })

  // Deterministic branch-logic tests: fs is mocked, so these prove the dev+server
  // branch returns fs.existsSync's result and resolves the path correctly,
  // independent of which assets happen to ship in public/.
  it('should return fs.existsSync result for the resolved public path (dev + server)', () => {
    deleteWindow()
    const existsSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true)

    expect(validateSeasonalImage(seasonalSrc('winter'))).toBe(true)
    expect(existsSpy).toHaveBeenCalledTimes(1)
    expect(String(existsSpy.mock.calls[0][0]).endsWith(
      path.join('public', 'images', 'page-headers', 'home', 'seasonal', 'winter', 'page-headers-homepage.jpg')
    )).toBe(true)
  })

  it('should strip a leading slash before resolving under public/', () => {
    deleteWindow()
    const existsSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    const expectedSuffix = path.join('public', 'images', 'page-headers', 'home', 'page-headers-homepage.jpg')

    validateSeasonalImage('/images/page-headers/home/page-headers-homepage.jpg')

    expect(String(existsSpy.mock.calls[0][0]).endsWith(expectedSuffix)).toBe(true)
  })

  it('should resolve a path WITHOUT a leading slash under public/ identically', () => {
    deleteWindow()
    const existsSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    const expectedSuffix = path.join('public', 'images', 'page-headers', 'home', 'page-headers-homepage.jpg')

    validateSeasonalImage('images/page-headers/home/page-headers-homepage.jpg')

    expect(String(existsSpy.mock.calls[0][0]).endsWith(expectedSuffix)).toBe(true)
  })

  it('should return false and warn when the asset is missing (dev + server)', () => {
    deleteWindow()
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    const result = validateSeasonalImage(
      '/images/page-headers/home/seasonal/winter/this-file-does-not-exist.jpg'
    )

    expect(result).toBe(false)
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Seasonal Image] Missing file at ')
    )
  })

  it('should return false via the catch when fs.existsSync throws (dev + server)', () => {
    deleteWindow()
    jest.spyOn(fs, 'existsSync').mockImplementation(() => {
      throw new Error('boom')
    })
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    expect(validateSeasonalImage(seasonalSrc('winter'))).toBe(false)
    expect(warnSpy).toHaveBeenCalledWith(
      '[Seasonal Image] Failed to validate image path',
      expect.any(Error)
    )
  })

  // Intentionally hit the real filesystem: these guard that the hero assets the
  // homepage relies on still ship in public/. A failure here means an asset was
  // moved/renamed/deleted, not that the function logic is wrong.
  describe('shipped asset guards (real filesystem)', () => {
    it('confirms the winter seasonal hero asset still ships under public/', () => {
      deleteWindow()

      expect(validateSeasonalImage(seasonalSrc('winter'))).toBe(true)
    })

    it('confirms the default homepage hero asset still ships under public/', () => {
      deleteWindow()

      expect(validateSeasonalImage(DEFAULT_IMAGE)).toBe(true)
    })
  })
})
