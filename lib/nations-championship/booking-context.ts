import 'server-only'
import { z } from 'zod'
import { getNationsChampionshipFeed } from './feed'
import { fixtureBookingContext, type FixtureBookingContext } from './booking-context-shared'
export { composeFixtureNotes } from './booking-context-shared'

export async function resolveFixtureBookingContext(fixtureId: string): Promise<FixtureBookingContext | null> {
  if (!z.string().uuid().safeParse(fixtureId).success) return null
  const feed = await getNationsChampionshipFeed()
  const fixture = feed.fixtures.find(candidate => candidate.id === fixtureId)
  return fixture ? fixtureBookingContext(fixture) : null
}
