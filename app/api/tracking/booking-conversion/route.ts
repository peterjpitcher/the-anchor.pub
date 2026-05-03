import { NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const payloadSchema = z.object({
  sourceSite: z.string().trim().max(120).optional().nullable(),
  bookingId: z.string().trim().min(1).max(160),
  metaEventId: z.string().trim().max(160).optional().nullable(),
  bookingType: z.enum(['event', 'table']),
  eventId: z.string().trim().max(160).optional().nullable(),
  eventSlug: z.string().trim().max(220).optional().nullable(),
  eventName: z.string().trim().max(240).optional().nullable(),
  eventCategoryName: z.string().trim().max(160).optional().nullable(),
  eventCategorySlug: z.string().trim().max(160).optional().nullable(),
  eventDate: z.string().trim().max(32).optional().nullable(),
  tickets: z.number().int().positive().max(100).optional().nullable(),
  value: z.number().min(0).max(100000).optional().nullable(),
  currency: z.string().trim().length(3).optional().nullable(),
  foodIntent: z.string().trim().max(80).optional().nullable(),
  sourceUrl: z.string().trim().max(2000).optional().nullable(),
  landingPath: z.string().trim().max(500).optional().nullable(),
  utmSource: z.string().trim().max(160).optional().nullable(),
  utmMedium: z.string().trim().max(160).optional().nullable(),
  utmCampaign: z.string().trim().max(240).optional().nullable(),
  utmContent: z.string().trim().max(240).optional().nullable(),
  utmTerm: z.string().trim().max(240).optional().nullable(),
  fbclid: z.string().trim().max(500).optional().nullable(),
  occurredAt: z.string().datetime().optional().nullable()
})

function getIngestUrl() {
  return process.env.CHEERSAI_BOOKING_CONVERSIONS_URL?.trim()
    || 'https://www.cheersai.uk/api/booking-conversions'
}

export async function POST(request: Request) {
  const secret = process.env.CHEERSAI_BOOKING_CONVERSIONS_SECRET?.trim()
  if (!secret) {
    return NextResponse.json({ accepted: false, reason: 'not_configured' }, { status: 202 })
  }

  let payload: z.infer<typeof payloadSchema>
  try {
    payload = payloadSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid booking conversion payload' }, { status: 400 })
  }

  try {
    const response = await fetch(getIngestUrl(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      cache: 'no-store'
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      console.error('[booking-conversion] CheersAI ingest failed', {
        status: response.status,
        body: body.slice(0, 500)
      })
      return NextResponse.json({ accepted: false }, { status: 202 })
    }

    return NextResponse.json({ accepted: true })
  } catch (error) {
    console.error('[booking-conversion] Could not forward conversion', error)
    return NextResponse.json({ accepted: false }, { status: 202 })
  }
}
