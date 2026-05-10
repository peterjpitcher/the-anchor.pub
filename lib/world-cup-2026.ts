export type WorldCup2026MatchStage =
  | 'First Stage'
  | 'Round of 32'
  | 'Round of 16'
  | 'Quarter-final'
  | 'Semi-final'
  | 'Play-off for third place'
  | 'Final'

export type WorldCupHostCountryCode = 'CAN' | 'MEX' | 'USA'

export type WorldCup2026Match = {
  matchNumber: number
  stage: WorldCup2026MatchStage
  utcDateTime: string
  group?: string
  placeholderA?: string
  placeholderB?: string
  stadium?: string
  city?: string
  countryCode?: WorldCupHostCountryCode
  showing: boolean
  showingNote?: string
  bookingUrl?: string
  teamsConfirmed: boolean
}

type CheersAIFixture = {
  id: string
  matchNumber: number
  round: string
  groupName: string | null
  teamA: string
  teamB: string
  teamsConfirmed: boolean
  kickOffAt: string
  venueCity: string | null
  showing: boolean
  showingNote: string | null
  bookingUrl: string | null
}

type CheersAIResponse = {
  tournament: { id: string; name: string; slug: string; status: string }
  fixtures: CheersAIFixture[]
  meta: { total: number; generatedAt: string }
}

const ROUND_TO_STAGE: Record<string, WorldCup2026MatchStage> = {
  group_stage: 'First Stage',
  round_of_32: 'Round of 32',
  round_of_16: 'Round of 16',
  quarter_final: 'Quarter-final',
  semi_final: 'Semi-final',
  third_place: 'Play-off for third place',
  final: 'Final',
}

const CHEERSAI_FEED_URL = 'https://www.cheersai.uk/api/feed/f40ef35f-5a1c-4409-8d02-27f2f97d0a0e'

export async function getWorldCup2026Matches(): Promise<WorldCup2026Match[]> {
  const apiKey = process.env.CHEERSAI_FEED_API_KEY
  if (!apiKey) {
    throw new Error('CHEERSAI_FEED_API_KEY environment variable is not set')
  }

  const response = await fetch(`${CHEERSAI_FEED_URL}?showing=false`, {
    headers: { 'x-api-key': apiKey },
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error(`CheersAI feed error (${response.status})`)
  }

  const data = (await response.json()) as CheersAIResponse

  return data.fixtures
    .map((fixture): WorldCup2026Match | null => {
      const stage = ROUND_TO_STAGE[fixture.round]
      if (!stage) return null

      return {
        matchNumber: fixture.matchNumber,
        stage,
        utcDateTime: fixture.kickOffAt,
        ...(fixture.groupName ? { group: fixture.groupName } : {}),
        placeholderA: fixture.teamA,
        placeholderB: fixture.teamB,
        ...(fixture.venueCity ? { city: fixture.venueCity } : {}),
        showing: fixture.showing,
        ...(fixture.showingNote ? { showingNote: fixture.showingNote } : {}),
        ...(fixture.bookingUrl ? { bookingUrl: fixture.bookingUrl } : {}),
        teamsConfirmed: fixture.teamsConfirmed,
      }
    })
    .filter((match): match is WorldCup2026Match => Boolean(match))
    .sort((a, b) => a.matchNumber - b.matchNumber)
}
