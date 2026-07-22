export type CompetitionStatus = 'upcoming' | 'open' | 'closed'

interface CompetitionSchedule {
  openingDateTime: string
  closingDateTime: string
}

export function getCompetitionStatus(
  schedule: CompetitionSchedule,
  now: Date = new Date()
): CompetitionStatus {
  const opensAt = new Date(schedule.openingDateTime).getTime()
  const closesAt = new Date(schedule.closingDateTime).getTime()
  const currentTime = now.getTime()

  if (currentTime >= closesAt) return 'closed'
  if (currentTime < opensAt) return 'upcoming'
  return 'open'
}
