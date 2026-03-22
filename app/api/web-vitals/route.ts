import { NextRequest, NextResponse } from 'next/server'

interface WebVitalsPayload {
  name: string
  value: number
  rating: string
  delta: number
  id: string
  navigationType: string
}

const VALID_METRIC_NAMES = new Set(['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB'])

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as WebVitalsPayload

    if (!body.name || !VALID_METRIC_NAMES.has(body.name)) {
      return NextResponse.json({ error: 'Invalid metric name' }, { status: 400 })
    }

    // Log web vitals for server-side observability
    console.log(
      `[web-vital] ${body.name}=${body.value.toFixed(2)} rating=${body.rating} delta=${body.delta.toFixed(2)} id=${body.id} nav=${body.navigationType}`
    )

    return NextResponse.json({ received: true }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
}
