import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import html from 'remark-html'

export interface CompetitionContent {
  competitionTitle: string
  competitionQuestion: string
  openingDateTime: string
  closingDateTime: string
  eventDate: string
  venue: string
  winnerAnnouncement: string
  minimumEntryAge: number
  entryChannel: string
  entryLimit: string
  winnerSelection: string
  tieBreakMethod: string
  prizeChoices: string[]
  redemption: string
  promoterName: string
  promoterAddress: string
  closedCompetitionMessage: string
  fullTermsHtml: string
}

const contentDirectory = path.join(process.cwd(), 'content', 'competitions')

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Competition content is missing the required field: ${field}`)
  }

  return value.trim()
}

function requiredStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`Competition content is missing the required list: ${field}`)
  }

  const items = value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)

  if (!items.length) {
    throw new Error(`Competition content requires at least one item in: ${field}`)
  }

  return items
}

function requiredAge(value: unknown): number {
  const age = typeof value === 'number' ? value : Number(value)

  if (!Number.isInteger(age) || age < 0) {
    throw new Error('Competition content requires a valid minimumEntryAge')
  }

  return age
}

function requiredDateTime(value: unknown, field: string): string {
  const dateTime = requiredString(value, field)

  if (Number.isNaN(new Date(dateTime).getTime())) {
    throw new Error(`Competition content has an invalid date in: ${field}`)
  }

  return dateTime
}

export async function getCompetitionContent(slug: string): Promise<CompetitionContent> {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error('Competition content slug is invalid')
  }

  const filePath = path.join(contentDirectory, `${slug}.md`)
  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContents)
  const processedContent = await remark()
    .use(remarkGfm)
    .use(html)
    .process(content)

  return {
    competitionTitle: requiredString(data.competitionTitle, 'competitionTitle'),
    competitionQuestion: requiredString(data.competitionQuestion, 'competitionQuestion'),
    openingDateTime: requiredDateTime(data.openingDateTime, 'openingDateTime'),
    closingDateTime: requiredDateTime(data.closingDateTime, 'closingDateTime'),
    eventDate: requiredString(data.eventDate, 'eventDate'),
    venue: requiredString(data.venue, 'venue'),
    winnerAnnouncement: requiredString(data.winnerAnnouncement, 'winnerAnnouncement'),
    minimumEntryAge: requiredAge(data.minimumEntryAge),
    entryChannel: requiredString(data.entryChannel, 'entryChannel'),
    entryLimit: requiredString(data.entryLimit, 'entryLimit'),
    winnerSelection: requiredString(data.winnerSelection, 'winnerSelection'),
    tieBreakMethod: requiredString(data.tieBreakMethod, 'tieBreakMethod'),
    prizeChoices: requiredStringArray(data.prizeChoices, 'prizeChoices'),
    redemption: requiredString(data.redemption, 'redemption'),
    promoterName: requiredString(data.promoterName, 'promoterName'),
    promoterAddress: requiredString(data.promoterAddress, 'promoterAddress'),
    closedCompetitionMessage: requiredString(data.closedCompetitionMessage, 'closedCompetitionMessage'),
    fullTermsHtml: processedContent.toString()
  }
}
