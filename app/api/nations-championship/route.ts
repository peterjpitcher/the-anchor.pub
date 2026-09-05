import { NextResponse } from 'next/server'
import { getNationsChampionshipFeed } from '@/lib/nations-championship/feed'

export const dynamic = 'force-dynamic'
export async function GET() {
  try {
    return NextResponse.json(await getNationsChampionshipFeed(), { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Screening details are unavailable. Please check before travelling.' }, {
      status: 503, headers: { 'Cache-Control': 'no-store' },
    })
  }
}
