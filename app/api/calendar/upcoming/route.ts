import { getUpcomingEvents } from '@/lib/api'
import { buildEventsCalendarIcs, getEventDateRangeUtc } from '@/lib/event-calendar'

const DEFAULT_LIMIT = 50
const DEFAULT_LOOKAHEAD_DAYS = 180
const MAX_LIMIT = 100
const MAX_LOOKAHEAD_DAYS = 365

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limitParam = Number(searchParams.get('limit') ?? DEFAULT_LIMIT)
  const daysParam = Number(searchParams.get('days') ?? DEFAULT_LOOKAHEAD_DAYS)

  const limit = clampNumber(Number.isFinite(limitParam) ? Math.floor(limitParam) : DEFAULT_LIMIT, 1, MAX_LIMIT)
  const lookaheadDays = clampNumber(
    Number.isFinite(daysParam) ? Math.floor(daysParam) : DEFAULT_LOOKAHEAD_DAYS,
    1,
    MAX_LOOKAHEAD_DAYS
  )

  const events = await getUpcomingEvents(limit, lookaheadDays)
  const filtered = events
    .filter((event) => event.category?.id !== 'fallback' && event.id !== 'the-anchor-showcase')
    .sort((a, b) => getEventDateRangeUtc(a).start.getTime() - getEventDateRangeUtc(b).start.getTime())

  const ics = buildEventsCalendarIcs(filtered, {
    calendarName: 'The Anchor — Upcoming Events',
    calendarDescription: 'Upcoming events and entertainment at The Anchor in Stanwell Moor near Heathrow.',
    prodId: '-//The Anchor//Upcoming Events//EN'
  })

  return new Response(ics, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename=\"the-anchor-upcoming-events.ics\"',
      'Cache-Control': 'public, max-age=300'
    }
  })
}
