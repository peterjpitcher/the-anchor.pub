jest.mock('server-only', () => ({}), { virtual: true })
import { getNationsChampionshipFeed } from '@/lib/nations-championship/feed'
import { nationsFeed } from '../fixtures/nations-championship'

const originalFetch = global.fetch
beforeEach(() => { process.env.CHEERSAI_NATIONS_FEED_API_KEY = 'test-key'; process.env.CHEERSAI_BASE_URL = 'https://cheers.example.com'; global.fetch = jest.fn() })
afterEach(() => { global.fetch = originalFetch; delete process.env.CHEERSAI_NATIONS_FEED_API_KEY; delete process.env.CHEERSAI_BASE_URL })
it('loads all fixtures without caching and removes unknown fields', async () => {
  ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ ...nationsFeed(), secret: 'must not escape' }) })
  const result = await getNationsChampionshipFeed()
  expect(result).toEqual(nationsFeed())
  expect(global.fetch).toHaveBeenCalledWith('https://cheers.example.com/api/feed/nations-championship-2026?showing=all&schema=2', expect.objectContaining({ cache: 'no-store', headers: { 'x-api-key': 'test-key' } }))
})
it.each(['draft', 'archived'])('rejects %s tournaments', async status => {
  const data = nationsFeed(); data.tournament.status = status
  ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => data })
  await expect(getNationsChampionshipFeed()).rejects.toThrow('not available')
})
it('rejects broken intervals and unconfigured feeds', async () => {
  const data = nationsFeed(); data.fixtures[0].hours.bar!.endAt = '2026-11-07T11:00:00Z'
  ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => data })
  await expect(getNationsChampionshipFeed()).rejects.toThrow()
  delete process.env.CHEERSAI_NATIONS_FEED_API_KEY
  await expect(getNationsChampionshipFeed()).rejects.toThrow('not configured')
})
it('does not substitute hardcoded fixtures for an upstream failure', async () => {
  ;(global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 503 })
  await expect(getNationsChampionshipFeed()).rejects.toThrow('503')
})
