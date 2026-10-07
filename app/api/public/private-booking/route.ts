import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { pageFromRequest, reportFailure } from '@/lib/report-failure'
import { GUEST_FALLBACK, mapUpstreamFailure } from '@/lib/guest-error-messages'
import { checkSpamProtection } from '@/lib/spam-protection'
import { sanitizeCommunicationConsent } from '@/lib/communication-consent-server'
import { sendEnquiryFallbackEmail, escapeHtml } from '@/lib/enquiry-fallback-email'
import type { CommunicationConsentPayload } from '@/lib/communication-consent'

const API_BASE_URL = getManagementApiBaseUrl()
const API_KEY = process.env.ANCHOR_API_KEY
const ROUTE = 'api/public/private-booking'

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
    communication_consent?: CommunicationConsentPayload
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

// Fallback Idempotency-Key for callers that send no header of their own.
//
// This used to be base64url(JSON) truncated to 120 characters. 120 base64
// characters encode only the first 90 bytes of the payload, which always fell
// short of the guest count and the notes, and fell short of the date and time
// too once a country code was sent or the customer had a long name. So two
// completely different enquiries from the same person, months apart and for
// different party sizes, collapsed onto one key and the second was replayed
// away. Hashing the whole payload means every mapped field actually counts.
// Matches the table-bookings proxy.
function createIdempotencyKey(payload: unknown): string {
    return `prv_${createHash('sha256').update(JSON.stringify(payload)).digest('hex')}`
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

// These enquiries are worth four figures each, so the management call gets
// three attempts with short backoff before the email fallback takes over.
const MANAGEMENT_ATTEMPTS = 3
const MANAGEMENT_RETRY_DELAYS_MS = [600, 1500]

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Renders the enquiry as an email so a manager can act on it by hand when the
 * management API will not take it. Contains everything the guest typed.
 */
function buildPrivateBookingFallbackEmail(
    pb: LegacyPrivateBookingPayload,
    mappedPayload: Record<string, unknown>,
    reason: number | string
) {
    const name = [asTrimmedString(pb.customer_first_name), asTrimmedString(pb.customer_last_name)]
        .filter(Boolean)
        .join(' ') || 'Not given'
    const email = asTrimmedString(pb.contact_email)

    const rows: Array<[string, string]> = [
        ['Name', name],
        ['Phone', asTrimmedString(pb.contact_phone) || 'Not given'],
        ['Email', email || 'Not given'],
        ['Event type', asTrimmedString(pb.event_type) || 'Not given'],
        ['Event date', asTrimmedString(pb.event_date) || 'Not given'],
        ['Start time', asTrimmedString(pb.start_time) || 'Not given'],
        ['Guests', String(asPositiveInt(pb.guest_count) ?? 'Not given')],
        ['Notes', asTrimmedString(pb.internal_notes) || 'None'],
        ['Requested items', (Array.isArray(pb.items) ? pb.items : [])
            .map(item => `${asTrimmedString(item.description) || 'Item'} x${asPositiveInt(item.quantity) || 1}`)
            .join(', ') || 'None']
    ]

    const textContent = [
        'A private hire enquiry could not be saved to the management app and is recorded here instead.',
        `Reason: ${reason}`,
        '',
        ...rows.map(([label, value]) => `${label}: ${value}`),
        '',
        'Please add this booking manually and contact the guest.'
    ].join('\n')

    const htmlContent = [
        '<p><strong>A private hire enquiry could not be saved to the management app.</strong></p>',
        `<p>Reason: ${escapeHtml(String(reason))}</p>`,
        '<table cellpadding="6" style="border-collapse:collapse">',
        ...rows.map(([label, value]) =>
            `<tr><td style="border:1px solid #ddd"><strong>${escapeHtml(label)}</strong></td><td style="border:1px solid #ddd">${escapeHtml(value)}</td></tr>`
        ),
        '</table>',
        '<p>Please add this booking manually and contact the guest.</p>'
    ].join('')

    return {
        subject: `ACTION NEEDED: private hire enquiry from ${name}`,
        htmlContent,
        textContent,
        ...(email ? { replyTo: email } : {})
    }
}

export async function POST(request: NextRequest) {
    const page = pageFromRequest(request)
    try {
        const body = await request.json()

        // Verified here, with this site's own secret. See app/api/table-bookings/route.ts
        // for why the management API cannot be relied on to check a forwarded token.
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
                        message: 'Please enter your mobile number, or call 01753 682707 and we will take your details.'
                    }
                },
                { status: 400 }
            )
        }

        const groupSize = asPositiveInt(pb.guest_count)
        const notes = toNotes(pb)
        if (notes && notes.length > 2000) {
            return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Your enquiry details are too long. Please shorten your notes or call 01753 682707 so we can record every detail.' } }, { status: 400 })
        }
        const communicationConsent = sanitizeCommunicationConsent(pb.communication_consent)

        // email and event_type are sent as first-class fields, not only as
        // text inside `notes`. They used to exist nowhere but the notes blob,
        // so every website enquiry landed with contact_email and event_type
        // NULL: staff could not reply by email from the management app, and no
        // email automation had an address to use. They stay in the notes too,
        // because the notes are what a manager reads first.
        const mappedPayload = {
            phone,
            ...(asTrimmedString(pb.default_country_code) ? { default_country_code: asTrimmedString(pb.default_country_code) } : {}),
            ...(fullName ? { name: fullName } : {}),
            ...(asTrimmedString(pb.contact_email) ? { email: asTrimmedString(pb.contact_email) } : {}),
            ...(asTrimmedString(pb.event_type) ? { event_type: asTrimmedString(pb.event_type) } : {}),
            ...(asTrimmedString(pb.event_date) ? { date: asTrimmedString(pb.event_date) } : {}),
            ...(asTrimmedString(pb.start_time) ? { time: asTrimmedString(pb.start_time) } : {}),
            ...(groupSize ? { group_size: groupSize } : {}),
            ...(notes ? { notes } : {}),
            ...(communicationConsent ? { communication_consent: communicationConsent } : {})
        }

        const idempotencyKey = request.headers.get('Idempotency-Key') || createIdempotencyKey(mappedPayload)

        // Token already spent by our own verification above, and the management
        // API's secret belongs to a different widget, so it is not forwarded.
        //
        // Retried, because a private-hire enquiry is worth four figures and a
        // transient upstream failure must not cost one. The idempotency key is
        // stable across attempts, so a retry can never create a duplicate.
        let res: Response | null = null
        let data: any = null
        let transportError: unknown = null

        // A missing key used to answer 503 "Private booking service unavailable"
        // before anything else ran: no log, no phone number and no fallback
        // email, so the enquiry was simply gone. It is now treated as what it
        // is, a management app we cannot reach, and takes the same path as any
        // other outage: the enquiry is emailed to the manager.
        for (let attempt = 0; API_KEY && attempt < MANAGEMENT_ATTEMPTS; attempt++) {
            if (attempt > 0) {
                await sleep(MANAGEMENT_RETRY_DELAYS_MS[attempt - 1] ?? 1500)
            }

            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), 10000)
            try {
                transportError = null
                res = await fetch(`${API_BASE_URL}/private-booking-enquiry`, {
                    method: 'POST',
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': API_KEY,
                        'Idempotency-Key': idempotencyKey
                    },
                    cache: 'no-store',
                    body: JSON.stringify(mappedPayload)
                })
                data = await res.json().catch(() => null)
            } catch (fetchError) {
                transportError = fetchError
                res = null
                data = null
            } finally {
                clearTimeout(timeout)
            }

            // Only transient failures are worth another go. A 4xx is a decision,
            // not a wobble, and repeating it just delays the guest.
            const retryable = transportError !== null || (res !== null && (res.status >= 500 || res.status === 429))
            if (!retryable) break
        }

        const upstreamOk = res !== null && res.ok

        if (!upstreamOk) {
            const status = res?.status ?? 0

            // A 409 means this exact submission is already in flight or already
            // recorded upstream, so the lead is not lost and must not be
            // emailed again.
            const isDuplicate = status === 409

            // Only a 400 or a 422 is the guest's to correct. A 401, 403, 404 or
            // 429 used to be shown to them as if they could fix it; those are
            // faults on our side and are reported as such.
            const guestCanFixIt = status === 400 || status === 422

            const mapped = res === null
                ? { kind: 'failed' as const, code: API_KEY ? 'NO_RESPONSE' : 'API_KEY_MISSING', message: GUEST_FALLBACK.private_hire }
                : mapUpstreamFailure({ status, body: data, context: 'private_hire', trustValidationSentences: true })

            await reportFailure({
                route: ROUTE,
                kind: guestCanFixIt || isDuplicate ? 'refused' : 'failed',
                status: res === null ? null : status,
                reason: !API_KEY ? 'API_KEY_MISSING' : res === null ? 'NO_RESPONSE' : 'UPSTREAM_NOT_OK',
                upstreamCode: mapped.code,
                page,
                error: transportError ?? undefined
            })

            if (!isDuplicate) {
                // The enquiry reached us, so it reaches a human either way.
                // This is the difference between a bad day and a lost booking.
                const fallback = await sendEnquiryFallbackEmail(
                    buildPrivateBookingFallbackEmail(pb, mappedPayload, status || 'network error')
                )

                // A 400 or a 422 is something the guest can correct, so they
                // are shown it and can resubmit. The email above means the lead
                // is captured even if they give up instead.
                if (fallback.sent && !guestCanFixIt) {
                    // Nothing the guest does will help, and the enquiry has
                    // genuinely reached a human, so telling them it worked is
                    // true rather than a comforting lie.
                    return NextResponse.json({
                        success: true,
                        data: { id: null, reference: null },
                        state: 'enquiry_emailed'
                    })
                }

                if (!fallback.sent) {
                    // The worst case on this route: the enquiry reached neither
                    // the management app nor a person.
                    await reportFailure({
                        route: ROUTE,
                        status: res === null ? null : status,
                        reason: 'ENQUIRY_LOST_FALLBACK_EMAIL_FAILED',
                        page
                    })
                }
            }

            // Our sentence, never the management app's body: that used to be
            // returned whole, in whatever shape it arrived.
            return NextResponse.json(
                { success: false, error: { code: mapped.code, message: mapped.message } },
                { status: status || 502 }
            )
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
        await reportFailure({ route: ROUTE, status: null, reason: 'UNEXPECTED_ERROR', page, error })
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'PROXY_ERROR',
                    message: GUEST_FALLBACK.private_hire
                }
            },
            { status: 500 }
        )
    }
}
