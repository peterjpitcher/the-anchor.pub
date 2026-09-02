import {
  bookingConversionsUrl,
  getCheersAiBaseUrl,
  tournamentFeedUrl,
} from '@/lib/cheersai'

type MutableEnv = Record<string, string | undefined>

const env = process.env as MutableEnv

describe('lib/cheersai', () => {
  let originalBaseUrl: string | undefined
  let originalNodeEnv: string | undefined

  beforeEach(() => {
    originalBaseUrl = env.CHEERSAI_BASE_URL
    originalNodeEnv = env.NODE_ENV
  })

  afterEach(() => {
    env.CHEERSAI_BASE_URL = originalBaseUrl
    env.NODE_ENV = originalNodeEnv
  })

  describe('getCheersAiBaseUrl', () => {
    it('returns the configured origin', () => {
      env.CHEERSAI_BASE_URL = 'https://cheers.orangejelly.co.uk'
      expect(getCheersAiBaseUrl()).toBe('https://cheers.orangejelly.co.uk')
    })

    it('strips trailing slashes so callers can always append a path', () => {
      env.CHEERSAI_BASE_URL = 'https://cheers.orangejelly.co.uk///'
      expect(getCheersAiBaseUrl()).toBe('https://cheers.orangejelly.co.uk')
    })

    it('trims surrounding whitespace', () => {
      env.CHEERSAI_BASE_URL = '  https://cheers.orangejelly.co.uk  '
      expect(getCheersAiBaseUrl()).toBe('https://cheers.orangejelly.co.uk')
    })

    it('throws in production when unset, rather than falling back silently', () => {
      delete env.CHEERSAI_BASE_URL
      env.NODE_ENV = 'production'
      expect(() => getCheersAiBaseUrl()).toThrow(
        'CHEERSAI_BASE_URL environment variable is not set'
      )
    })

    it('throws in production when set to whitespace only', () => {
      env.CHEERSAI_BASE_URL = '   '
      env.NODE_ENV = 'production'
      expect(() => getCheersAiBaseUrl()).toThrow(
        'CHEERSAI_BASE_URL environment variable is not set'
      )
    })

    it('falls back outside production so local development needs no setup', () => {
      delete env.CHEERSAI_BASE_URL
      env.NODE_ENV = 'development'
      expect(getCheersAiBaseUrl()).toBe('https://cheers.orangejelly.co.uk')
    })
  })

  describe('derived endpoints', () => {
    it('builds the booking-conversion ingest URL', () => {
      env.CHEERSAI_BASE_URL = 'https://cheers.example.com'
      expect(bookingConversionsUrl()).toBe(
        'https://cheers.example.com/api/booking-conversions'
      )
    })

    it('builds the tournament feed URL', () => {
      env.CHEERSAI_BASE_URL = 'https://cheers.example.com'
      expect(tournamentFeedUrl('f40ef35f-5a1c-4409-8d02-27f2f97d0a0e')).toBe(
        'https://cheers.example.com/api/feed/f40ef35f-5a1c-4409-8d02-27f2f97d0a0e'
      )
    })

    it('does not double up separators when the base URL has a trailing slash', () => {
      env.CHEERSAI_BASE_URL = 'https://cheers.example.com/'
      expect(bookingConversionsUrl()).toBe(
        'https://cheers.example.com/api/booking-conversions'
      )
      expect(tournamentFeedUrl('abc')).toBe('https://cheers.example.com/api/feed/abc')
    })
  })
})
