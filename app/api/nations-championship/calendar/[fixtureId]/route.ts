import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getNationsChampionshipFeed } from '@/lib/nations-championship/feed'
import { buildScreeningCalendar } from '@/lib/nations-championship/calendar'
import { isBookableScreening } from '@/lib/nations-championship/types'

export const dynamic = 'force-dynamic'
export async function GET(_request: Request, { params }: { params: { fixtureId: string } }) {
  if (!z.string().uuid().safeParse(params.fixtureId).success) return new NextResponse('Invalid fixture', { status: 400 })
  try {
    const feed = await getNationsChampionshipFeed()
    const fixture = feed.fixtures.find(item => item.id === params.fixtureId)
    if (!fixture || !isBookableScreening(fixture)) return new NextResponse('Screening not confirmed', { status: 404 })
    return new NextResponse(buildScreeningCalendar(fixture), { headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="anchor-rugby-${fixture.id}.ics"`,
      'Cache-Control': 'no-store',
    } })
  } catch {
    return new NextResponse('Screening details unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
