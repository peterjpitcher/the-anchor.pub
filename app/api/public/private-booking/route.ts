import { NextRequest, NextResponse } from 'next/server'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { logError } from '@/lib/error-handling'
import { checkSpamProtection } from '@/lib/spam-protection'

const API_BASE_URL = getManagementApiBaseUrl()
const API_KEY = process.env.ANCHOR_API_KEY

type LegacyPrivateBookingPayload = {
    customer_first_name?: string
    customer_last_name?: string
    contact_phone?: string
    contact_email?: string
    default_country_code?: string
    event_date?: string
    start_time?: string
    guest_count?: number
    event_type?: string
    internal_notes?: string
    items?: Array<{
        description?: string
        quantity?: number
        unit_price?: number
        line_total?: number
    }>
}

function asTrimmedString(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
}

function asPositiveInt(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) {
        const rounded = Math.floor(value)
        return rounded > 0 ? rounded : undefined
    }

    if (typeof value === 'string' && value.trim().length > 0) {
        const parsed = Number.parseInt(value.trim(), 10)
        if (Number.isFinite(parsed) && parsed > 0) return parsed
    }

    return undefined
}

function createIdempotencyKey(): string {
    return `prv_${crypto.randomUUID()}`
}

function toNotes(payload: LegacyPrivateBookingPayload): string | undefined {
    const lines: string[] = []

    const eventType = asTrimmedString(payload.event_type)
    if (eventType) lines.push(`Event type: ${eventType}`)

    const email = asTrimmedString(payload.contact_email)
    if (email) lines.push(`Email: ${email}`)

    const bookingItems = Array.isArray(payload.items) ? payload.items : []
    if (bookingItems.length > 0) {
        const itemSummary = bookingItems
            .slice(0, 12)
            .map((item) => {
                const description = asTrimmedString(item.description) || 'Item'
                const quantity = asPositiveInt(item.quantity) || 1
                return `${description} x${quantity}`
            })
            .join(' | ')

        if (itemSummary) lines.push(`Requested items: ${itemSummary}`)
    }

    const internalNotes = asTrimmedString(payload.internal_notes)
    if (internalNotes) lines.push(`Notes: ${internalNotes}`)

    if (lines.length === 0) return undefined
    return lines.join('\n')
}

export async function POST(request: NextRequest) {
    try {
        if (!API_KEY) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'SERVICE_UNAVAILABLE',
                        message: 'Private booking service unavailable'
                    }
                },
                { status: 503 }
            )
        }

        const body = await request.json()

        const spam = await checkSpamProtection(request, body)
        if (spam.blocked) return spam.response

        const pb: LegacyPrivateBookingPayload = body
        const fullName = [asTrimmedString(pb.customer_first_name), asTrimmedString(pb.customer_last_name)]
            .filter(Boolean)
            .join(' ')
        const phone = asTrimmedString(pb.contact_phone)

        if (!phone) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Mobile number is required'
                    }
                },
                { status: 400 }
            )
        }

        const groupSize = asPositiveInt(pb.guest_count)
        const notes = toNotes(pb)

        const mappedPayload = {
            phone,
            ...(asTrimmedString(pb.default_country_code) ? { default_country_code: asTrimmedString(pb.default_country_code) } : {}),
            ...(fullName ? { name: fullName } : {}),
            ...(asTrimmedString(pb.event_date) ? { date: asTrimmedString(pb.event_date) } : {}),
            ...(asTrimmedString(pb.start_time) ? { time: asTrimmedString(pb.start_time) } : {}),
            ...(groupSize ? { group_size: groupSize } : {}),
            ...(notes ? { notes } : {})
        }

        const idempotencyKey = request.headers.get('Idempotency-Key') || createIdempotencyKey()

        const res = await fetch(`${API_BASE_URL}/private-booking-enquiry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY,
                'Idempotency-Key': idempotencyKey
            },
            body: JSON.stringify({
                ...mappedPayload,
                ...(typeof body.turnstile_token === 'string' ? { turnstile_token: body.turnstile_token } : {})
            })
        })

        const data = await res.json()

        if (!res.ok) {
            logError('api/private-booking', new Error(`Upstream error ${res.status}: ${res.statusText}`))
            return NextResponse.json(data, { status: res.status })
        }

        return NextResponse.json({
            success: true,
            data: {
                id: data.booking_id || data.reference || null,
                reference: data.reference || data.booking_id || null
            },
            state: data.state || 'enquiry_created'
        })
    } catch (error) {
        logError('api/private-booking', error instanceof Error ? error : new Error(String(error)))
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'PROXY_ERROR',
                    message: 'Failed to create booking via proxy'
                }
            },
            { status: 500 }
        )
    }
}
