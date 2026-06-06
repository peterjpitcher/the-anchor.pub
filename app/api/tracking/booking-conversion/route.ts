import { NextResponse } from 'next/server'
import { z } from 'zod'
import { forwardBookingConversionToCheersAI } from '@/lib/booking-conversion-forwarding'

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
  gclid: z.string().trim().max(500).optional().nullable(),
  shortCode: z.string().trim().max(120).optional().nullable(),
  attributionCapturedAt: z.string().datetime().optional().nullable(),
  attributionUpdatedAt: z.string().datetime().optional().nullable(),
  metaConsentGranted: z.boolean().optional().nullable(),
  fbp: z.string().trim().max(500).optional().nullable(),
  fbc: z.string().trim().max(500).optional().nullable(),
  clientUserAgent: z.string().trim().max(500).optional().nullable(),
  occurredAt: z.string().datetime().optional().nullable()
})

export async function POST(request: Request) {
  let payload: z.infer<typeof payloadSchema>
  try {
    payload = payloadSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid booking conversion payload' }, { status: 400 })
  }

  const result = await forwardBookingConversionToCheersAI(payload)
  return NextResponse.json(result, {
    status: 202,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  })
}
