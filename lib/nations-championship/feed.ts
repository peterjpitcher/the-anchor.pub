import 'server-only'
import { tournamentFeedUrl } from '@/lib/cheersai'
import { NATIONS_CHAMPIONSHIP_SLUG } from './config'
import { screeningFeedSchema, type ScreeningFeed } from './types'

export async function getNationsChampionshipFeed(): Promise<ScreeningFeed> {
  const key = process.env.CHEERSAI_NATIONS_FEED_API_KEY?.trim()
  if (!key) throw new Error('Tournament feed is not configured')
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const response = await fetch(`${tournamentFeedUrl(NATIONS_CHAMPIONSHIP_SLUG)}?showing=all&schema=2`, {
      headers: { 'x-api-key': key }, cache: 'no-store', signal: controller.signal,
    })
    if (!response.ok) throw new Error(`Tournament feed unavailable (${response.status})`)
    const parsed = screeningFeedSchema.parse(await response.json())
    if (parsed.tournament.status !== 'active' || parsed.tournament.slug !== NATIONS_CHAMPIONSHIP_SLUG) {
      throw new Error('Tournament is not available')
    }
    return parsed
  } finally { clearTimeout(timeout) }
}
