/**
 * The /whats-on sitemap entry must not claim a modification date it cannot
 * know.
 *
 * It said 21 April 2026 while the page changed with every event added, sold or
 * finished, so the lastmod told crawlers the diary had not moved in months. No
 * trustworthy timestamp records when the listing last changed, so the entry
 * carries none, as the event URLs and the Nations Championship hub already do.
 */
jest.mock('@/lib/api', () => ({
  anchorAPI: { getEvents: jest.fn().mockResolvedValue({ events: [] }) }
}))

// remark is ESM-only and these tests do not exercise blog content.
jest.mock('@/lib/markdown', () => ({ getAllBlogPosts: () => [] }))

// Keeps the run hermetic: the real feed call would go over the network.
jest.mock('@/lib/nations-championship/feed', () => ({
  getNationsChampionshipFeed: jest.fn().mockRejectedValue(new Error('offline in tests'))
}))

import sitemap from '@/app/sitemap'

it('lists /whats-on once, with no invented lastmod', async () => {
  const entries = await sitemap()
  const whatsOn = entries.filter((entry) => entry.url === 'https://www.the-anchor.pub/whats-on')

  expect(whatsOn).toHaveLength(1)
  expect(whatsOn[0].lastModified).toBeUndefined()
})

it('keeps a dated lastmod on the standing hubs beside it', async () => {
  // The change is scoped to the diary page. The hubs have real edit dates.
  const entries = await sitemap()
  const quiz = entries.find((entry) => entry.url === 'https://www.the-anchor.pub/quiz-night')

  expect(quiz?.lastModified).toBeInstanceOf(Date)
})
