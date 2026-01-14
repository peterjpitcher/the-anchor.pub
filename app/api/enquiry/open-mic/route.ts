import { NextResponse } from 'next/server'
import { z } from 'zod'

const MANAGEMENT_ORIGIN = 'https://management.orangejelly.co.uk'

const payloadSchema = z.object({
  fullName: z.string().trim().min(1),
  useRealName: z.boolean().optional(),
  actName: z.string().trim().optional().nullable(),
  email: z.string().trim().email(),
  phone: z.string().trim().min(1),
  baseLocation: z.string().trim().min(1),
  performerTypes: z.array(z.string().trim().min(1)).min(1),
  performerTypeOther: z.string().trim().optional().nullable(),
  bio: z.string().trim().min(1).max(800),
  links: z.record(z.array(z.string().trim().min(1).max(500))).optional(),
  socialHandles: z.record(z.string().trim().max(200)).optional(),
  experienceLevel: z.enum(['none', 'some', 'regular']).optional().nullable(),
  pronouns: z.string().trim().max(100).optional().nullable(),
  accessibilityNotes: z.string().trim().max(1000).optional().nullable(),
  availabilityGeneral: z.enum(['weeknights', 'weekends', 'either']),
  canStartAround8pm: z.enum(['yes', 'no', 'depends']),
  availability: z.record(z.any()).optional(),
  setLengthMinutes: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20)]).optional(),
  contentRating: z.enum(['family_friendly', 'mild_language', 'adults_only']).optional(),
  musicOriginalsCovers: z.enum(['original', 'covers', 'mix']).optional(),
  genres: z.array(z.string().trim().min(1).max(50)).max(25).optional(),
  techNeeds: z.record(z.any()).optional(),
  techNeedsOther: z.string().trim().max(500).optional().nullable(),
  bringOwnGear: z.enum(['yes', 'no', 'some']).optional(),
  setupTimeMinutes: z.number().int().min(0).max(180).optional(),
  performerCount: z.number().int().min(1).max(50).optional(),
  specialRequirements: z.string().trim().max(1000).optional().nullable(),
  consentDataStorage: z.literal(true),
  consentMarketing: z.boolean().optional(),
  consentMedia: z.boolean().optional(),
  honeypot: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const managementKey = process.env.ANCHOR_API_KEY
    if (!managementKey) {
      return NextResponse.json(
        { success: false, error: 'Server is not configured to accept submissions right now.' },
        { status: 500 }
      )
    }

    const body = payloadSchema.safeParse(await request.json())
    if (!body.success) {
      return NextResponse.json(
        { success: false, error: body.error.errors[0]?.message ?? 'Invalid submission.' },
        { status: 400 }
      )
    }

    const forwardedFor = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
    const userAgent = request.headers.get('user-agent') || ''

    const response = await fetch(`${MANAGEMENT_ORIGIN}/api/external/performer-interest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': managementKey,
        ...(forwardedFor ? { 'X-Forwarded-For': forwardedFor } : {}),
        ...(userAgent ? { 'User-Agent': userAgent } : {}),
      },
      body: JSON.stringify(body.data),
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      const message =
        payload?.error?.message ||
        payload?.error ||
        'Sorry, we could not submit your details right now. Please call 01753 682707.'
      return NextResponse.json({ success: false, error: message }, { status: response.status })
    }

    const id = payload?.data?.id || payload?.id
    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('Open mic performer interest submission failed:', error)
    const message = error instanceof Error ? error.message : 'Unexpected error submitting form.'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

