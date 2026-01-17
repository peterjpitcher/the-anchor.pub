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
}

const STAGE_SET = new Set<WorldCup2026MatchStage>([
  'First Stage',
  'Round of 32',
  'Round of 16',
  'Quarter-final',
  'Semi-final',
  'Play-off for third place',
  'Final',
])

const COUNTRY_CODE_SET = new Set<WorldCupHostCountryCode>(['CAN', 'MEX', 'USA'])

const FIFA_MATCHES_URL =
  'https://api.fifa.com/api/v3/calendar/matches?language=en&idCompetition=17&idSeason=285023&count=200'

type FifaLocalizedName = { Description?: string }
type FifaMatch = {
  MatchNumber?: number
  Date?: string
  StageName?: FifaLocalizedName[]
  GroupName?: FifaLocalizedName[]
  PlaceHolderA?: string
  PlaceHolderB?: string
  Stadium?: {
    Name?: FifaLocalizedName[]
    CityName?: FifaLocalizedName[]
    IdCountry?: string
  }
}

function getFirstDescription(value?: FifaLocalizedName[]): string | undefined {
  const description = value?.[0]?.Description
  return typeof description === 'string' && description.trim().length > 0 ? description : undefined
}

function isStage(value: string): value is WorldCup2026MatchStage {
  return STAGE_SET.has(value as WorldCup2026MatchStage)
}

function isHostCountryCode(value: string): value is WorldCupHostCountryCode {
  return COUNTRY_CODE_SET.has(value as WorldCupHostCountryCode)
}

export async function getWorldCup2026Matches(): Promise<WorldCup2026Match[]> {
  const response = await fetch(FIFA_MATCHES_URL, { next: { revalidate: 60 * 60 * 24 } })
  if (!response.ok) {
    throw new Error(`FIFA API error (${response.status})`)
  }

  const payload = (await response.json()) as { Results?: unknown }
  const results = Array.isArray(payload?.Results) ? (payload.Results as FifaMatch[]) : []

  return results
    .map((match): WorldCup2026Match | null => {
      const matchNumber = typeof match.MatchNumber === 'number' ? match.MatchNumber : null
      const utcDateTime = typeof match.Date === 'string' ? match.Date : null
      const stageRaw = getFirstDescription(match.StageName)

      if (!matchNumber || !utcDateTime || !stageRaw || !isStage(stageRaw)) {
        return null
      }

      const group = getFirstDescription(match.GroupName)
      const stadium = getFirstDescription(match.Stadium?.Name)
      const city = getFirstDescription(match.Stadium?.CityName)
      const countryCodeRaw = typeof match.Stadium?.IdCountry === 'string' ? match.Stadium.IdCountry : undefined
      const countryCode = countryCodeRaw && isHostCountryCode(countryCodeRaw) ? countryCodeRaw : undefined

      const placeholderA = typeof match.PlaceHolderA === 'string' ? match.PlaceHolderA : undefined
      const placeholderB = typeof match.PlaceHolderB === 'string' ? match.PlaceHolderB : undefined

      return {
        matchNumber,
        stage: stageRaw,
        utcDateTime,
        ...(group ? { group } : {}),
        ...(placeholderA ? { placeholderA } : {}),
        ...(placeholderB ? { placeholderB } : {}),
        ...(stadium ? { stadium } : {}),
        ...(city ? { city } : {}),
        ...(countryCode ? { countryCode } : {}),
      }
    })
    .filter((match): match is WorldCup2026Match => Boolean(match))
    .sort((a, b) => a.matchNumber - b.matchNumber)
}

