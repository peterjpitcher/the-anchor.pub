import { NextResponse } from 'next/server'
import { getHealth } from '@/lib/health-check'

// The check itself, and why it exists, is in lib/health-check.ts. This route
// must stay dynamic: as a static file it answered "ok" for the life of a
// deployment whatever was broken.
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(): Promise<Response> {
  const { answer, checkedAt } = await getHealth()

  return NextResponse.json(
    { ...answer, checkedAt },
    {
      status: answer.status === 'ok' ? 200 : 503,
      headers: { 'Cache-Control': 'private, no-store, max-age=0' }
    }
  )
}
