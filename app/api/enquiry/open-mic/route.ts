import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { checkSpamProtection } from '@/lib/spam-protection'

const MANAGEMENT_API_BASE_URL = getManagementApiBaseUrl()

const payloadSchema = z.object({
  fullName: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().min(1),
  bio: z.string().trim().min(1).max(800),
  consentDataStorage: z.literal(true),
  honeypot: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const managementKey = process.env.ANCHOR_API_KEY
    if (!managementKey) {
      return NextResponse.json(
        { success: false, error: 'Server is not configured to accept submissions right now.' },
        { status: 500 }
      )
    }

    const rawBody = await request.json()

    const spam = await checkSpamProtection(request, rawBody)
    if (spam.blocked) return spam.response

    const body = payloadSchema.safeParse(rawBody)
    if (!body.success) {
      return NextResponse.json(
        { success: false, error: body.error.issues[0]?.message ?? 'Invalid submission.' },
        { status: 400 }
      )
    }

    const forwardedFor = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
    const userAgent = request.headers.get('user-agent') || ''

    const response = await fetch(`${MANAGEMENT_API_BASE_URL}/external/performer-interest`, {
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
