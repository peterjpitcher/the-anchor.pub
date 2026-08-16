import { NextRequest, NextResponse } from 'next/server'
import ssot from '@/SSOT.json'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { checkSpamProtection } from '@/lib/spam-protection'
import { normaliseChristmasEnquiryTime } from '@/lib/christmas-enquiry'
import {
  CHRISTMAS_MINIMUM_NOTICE_HOURS,
  CHRISTMAS_MINIMUM_PARTY_SIZE,
  CHRISTMAS_WINDOW_END,
  CHRISTMAS_WINDOW_START,
  getLondonIsoDate
} from '@/lib/christmas-season'

const DEFAULT_TO = 'manager@the-anchor.pub'
const GRAPH_SCOPE = 'https://graph.microsoft.com/.default'
const GRAPH_TOKEN_HOST = 'https://login.microsoftonline.com'

// The window and the party-size rules are read from the SSOT-backed season
// helper, so this route can never drift from the published page.
const CHRISTMAS_BOOKING_START = CHRISTMAS_WINDOW_START
const CHRISTMAS_BOOKING_END = CHRISTMAS_WINDOW_END

const BUFFET_MINIMUM_GUESTS =
  (ssot as unknown as { christmas_2026: { buffets: { min_guests: number } } }).christmas_2026.buffets.min_guests

const VALID_MEAL_SERVICES = new Set(['lunch', 'dinner'])
// Shared Christmas party nights were discontinued on 21 July 2026 and are no
// longer an accepted value.
const VALID_PARTY_FORMATS = new Set([
  // The three party styles offered from 15 August 2026, owner-worded: the two
  // food-and-drink styles are standing/buffet occasions, not a second sit-down
  // journey, and the team firms up the details on the phone anyway.
  'sit_down_dinner',
  'buffet_party',
  'drinks_party',
  // Legacy values still arriving from bundles cached before the change. A
  // guest mid-enquiry on an old bundle must not be rejected, so these stay
  // accepted and keep their original labels below.
  'not_sure',
  'private_space',
  'festive_buffet',
  'entertainment'
])
const VALID_COURSE_TIERS = new Set(['undecided', 'one_course', 'two_course', 'three_course'])

// These enquiries are worth four figures each, so the management call gets
// three attempts with short backoff before the email fallback takes over.
// Idempotency (one key per submission) makes the retries duplicate-safe.
const MANAGEMENT_ATTEMPTS = 3
const MANAGEMENT_TIMEOUT_MS = 8000
const MANAGEMENT_RETRY_DELAYS_MS = [600, 1500]

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * A per-request timeout signal where the runtime provides one. Vercel's Node
 * runtime always does; the jsdom test environment does not, and a thrown
 * TypeError here would be indistinguishable from a network failure and would
 * send every test down the retry path.
 */
function requestTimeoutSignal(ms: number): AbortSignal | undefined {
  return typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
    ? AbortSignal.timeout(ms)
    : undefined
}

type EnquiryMode = 'party' | 'meal'
type MealService = 'lunch' | 'dinner'
type CourseTier = 'undecided' | 'one_course' | 'two_course' | 'three_course'
type LegacyEnquiryMode = 'dinner' | 'buffet'

interface ChristmasEnquiryPayload {
  mode: EnquiryMode
  service?: MealService
  courseTier?: CourseTier
  partyFormat?: string
  source?: string
  name: string
  email: string
  phone: string
  partySize: string
  preferredDate: string
  preferredTime?: string
  extras?: string[]
  perks?: string[]
  notes?: string
}

// Attribution keys the client stores and forwards, exactly as the booking forms send them.
// Kept to the marketing parameters only: this call reports which campaign produced the
// enquiry, so the Meta signals the booking APIs also carry (fbp, fbc, user agent) have no
// business being copied into an analytics record here.
const ATTRIBUTION_KEYS = [
  'source_url',
  'landing_path',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'short_code'
] as const

type AttributionKey = typeof ATTRIBUTION_KEYS[number]

// Only these say a campaign produced the enquiry. source_url and landing_path are recorded
// for every visitor including organic ones, so they must not keep the reporting call alive on
// their own: doing so writes a row of nulls for every enquiry and makes every enquirer wait
// on an analytics call that has nothing to report.
const CAMPAIGN_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'short_code'
] as const satisfies readonly AttributionKey[]

// The conversion POST is capped rather than left dangling. An un-awaited promise in a
// serverless function is routinely killed the moment the response is returned, so it would
// not reliably fire at all; a short cap keeps the reporting call honest without ever making
// the visitor wait on it.
const CONVERSION_TIMEOUT_MS = 2500

function asTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function copyOptionalStrings<T extends string>(body: Record<string, unknown>, keys: readonly T[]): Partial<Record<T, string>> {
  const output: Partial<Record<T, string>> = {}

  for (const key of keys) {
    const value = asTrimmedString(body[key])
    if (value) output[key] = value
  }

  return output
}

function normaliseAttribution(body: Record<string, unknown>): Partial<Record<AttributionKey, string>> {
  return copyOptionalStrings(body, ATTRIBUTION_KEYS)
}

/**
 * Tell the management app which campaign produced this enquiry.
 *
 * /christmas-parties is the main call to action of the B2B email campaigns, and its form
 * produces an enquiry rather than a booking. Bookings already reach AMS carrying their UTM
 * values, so without this the campaign reports clicks and then nothing, and the business it
 * actually generated is invisible.
 *
 * Analytics must never cost anyone an enquiry, so every failure here is swallowed: the
 * visitor's response is decided before this runs and is not changed by it.
 */
async function recordMarketingConversion(options: {
  attribution: Partial<Record<AttributionKey, string>>
  partySize: number
  mode: EnquiryMode
  service?: MealService
  partyFormat?: string
  source?: string
  delivery: 'management' | 'email_fallback'
}) {
  const managementKey = process.env.ANCHOR_API_KEY
  if (!managementKey) return

  const { attribution } = options
  // Nothing to attribute and nothing to learn: an enquiry with no marketing parameters at
  // all is organic, and a row of nulls would only dilute the campaign reporting.
  if (!CAMPAIGN_KEYS.some((key) => attribution[key])) return

  try {
    const response = await fetch(`${getManagementApiBaseUrl().replace(/\/$/, '')}/marketing/conversions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': managementKey
      },
      body: JSON.stringify({
        conversionType: 'christmas_enquiry',
        occurredAt: new Date().toISOString(),
        utmSource: attribution.utm_source,
        utmMedium: attribution.utm_medium,
        utmCampaign: attribution.utm_campaign,
        utmContent: attribution.utm_content,
        shortCode: attribution.short_code,
        landingPath: attribution.landing_path,
        sourceUrl: attribution.source_url,
        partySize: options.partySize,
        metadata: {
          enquiry_mode: options.mode,
          ...(options.service ? { meal_service: options.service } : {}),
          ...(options.partyFormat ? { party_format: options.partyFormat } : {}),
          ...(options.source ? { form_source: options.source } : {}),
          delivery: options.delivery
        }
      }),
      signal: AbortSignal.timeout(CONVERSION_TIMEOUT_MS)
    })

    if (!response.ok) {
      console.warn('Marketing conversion not recorded:', response.status, await response.text())
    }
  } catch (conversionError) {
    console.warn('Marketing conversion could not be sent:', conversionError)
  }
}

/**
 * Earliest date we can accept, at date granularity: tomorrow in Europe/London,
 * and never before the first day of the service window. Christmas bookings
 * need at least 24 hours notice, so today is never acceptable.
 */
function earliestBookableDate(): string {
  const today = new Date(`${getLondonIsoDate()}T00:00:00Z`)
  today.setUTCDate(today.getUTCDate() + 1)
  const tomorrow = today.toISOString().slice(0, 10)
  return tomorrow > CHRISTMAS_BOOKING_START ? tomorrow : CHRISTMAS_BOOKING_START
}

// Owner-confirmed 2026-08-04: courses are chosen per person, so the answer here
// is what the group expects on average, not what the table has committed to.
const COURSE_TIER_LABELS: Record<CourseTier, string> = {
  undecided: 'Courses not decided yet',
  one_course: 'Mostly 1 course per guest',
  two_course: 'Mostly 2 courses per guest',
  three_course: 'Mostly 3 courses per guest'
}

function courseTierLabel(value?: CourseTier): string {
  return COURSE_TIER_LABELS[value || 'undecided']
}

// Every sit-down Christmas booking now pre-orders, whatever the guests choose,
// because a main per cover is captured in advance in all cases.
const PRE_ORDER_REQUIREMENT =
  'Yes, per person. A main for every guest, starter and dessert optional.'

type IncomingChristmasEnquiryPayload = Omit<Partial<ChristmasEnquiryPayload>, 'mode'> & {
  mode?: EnquiryMode | LegacyEnquiryMode
}

function normaliseIncomingPayload(body: IncomingChristmasEnquiryPayload): Partial<ChristmasEnquiryPayload> {
  if (body.mode === 'dinner') {
    return { ...body, mode: 'meal', service: body.service || 'dinner' }
  }

  if (body.mode === 'buffet') {
    return { ...body, mode: 'party', partyFormat: body.partyFormat || 'buffet_party' }
  }

  return body as Partial<ChristmasEnquiryPayload>
}

function formatTimeForEmail(value?: string): string {
  const normalised = normaliseChristmasEnquiryTime(value)
  if (!normalised) return 'Flexible'

  const [hourText, minute] = normalised.split(':')
  const hour = Number(hourText)
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minute} ${hour >= 12 ? 'pm' : 'am'}`
}

function enquiryLabel(body: ChristmasEnquiryPayload): string {
  if (body.mode === 'party') return 'Christmas party'
  const sitting = body.service === 'lunch' ? 'lunch' : 'dinner'
  return `Sit-down Christmas ${sitting} (${courseTierLabel(body.courseTier)})`
}

function partyFormatLabel(value?: string): string | undefined {
  if (!value) return undefined
  const labels: Record<string, string> = {
    // Current options, 15 August 2026.
    sit_down_dinner: 'Sit-down Christmas dinner',
    buffet_party: `Standing party with festive buffet (${BUFFET_MINIMUM_GUESTS}+)`,
    drinks_party: 'Drinks-only party',
    // Legacy options, kept so an old bundle's submission is still labelled
    // exactly as the guest saw it.
    not_sure: 'Not sure yet',
    private_space: 'Private space',
    festive_buffet: `Festive buffet (${BUFFET_MINIMUM_GUESTS}+)`,
    entertainment: 'Entertainment package'
  }
  return labels[value] || value
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildEmailContent(
  body: ChristmasEnquiryPayload,
  options?: {
    /**
     * Why the management app did not take this enquiry. When set, the email
     * is the ONLY record of the enquiry, so the subject and the opening line
     * say so unmissably instead of looking like a routine notification.
     */
    managementFailureDetail?: string | null
  }
) {
  const extras = (body.extras || []).filter(Boolean)
  const perks = (body.perks || []).filter(Boolean)
  const preferredDate = body.preferredDate || 'Date TBC'
  const preferredTime = formatTimeForEmail(body.preferredTime)
  const label = enquiryLabel(body)
  const managementFailureDetail = options?.managementFailureDetail || null

  const subject = managementFailureDetail
    ? `ACTION NEEDED, not in the system: ${label} enquiry - ${body.partySize} guests - ${preferredDate}`
    : `${label} enquiry - ${body.partySize} guests - ${preferredDate}`

  const textLines = [
    ...(managementFailureDetail
      ? [
          'THIS ENQUIRY IS NOT IN THE MANAGEMENT SYSTEM.',
          'Saving it to /private-bookings failed after every retry, so this email is the only record.',
          'Please add it by hand, then reply to the guest as normal.',
          `Technical detail: ${managementFailureDetail}`,
          ''
        ]
      : []),
    'New Christmas enquiry',
    '',
    `Name: ${body.name}`,
    `Email: ${body.email}`,
    `Phone: ${body.phone}`,
    `Party size: ${body.partySize}`,
    `Preferred date: ${preferredDate}`,
    `Preferred time: ${preferredTime}`,
    `Enquiry type: ${label}`
  ]

  if (body.mode === 'meal') {
    textLines.push(`Meal sitting: ${body.service === 'lunch' ? 'Lunch' : 'Dinner'}`)
    textLines.push(`Courses expected: ${courseTierLabel(body.courseTier)}`)
    textLines.push(`Pre-order required: ${PRE_ORDER_REQUIREMENT}`)
  }

  if (body.mode === 'party' && body.partyFormat) {
    textLines.push(`Party style: ${partyFormatLabel(body.partyFormat)}`)
  }

  if (body.source) {
    textLines.push(`Enquiry source: ${body.source}`)
  }

  if (extras.length > 0) {
    textLines.push(`Extras requested: ${extras.join(', ')}`)
  }

  if (perks.length > 0) {
    textLines.push(`Offers mentioned: ${perks.join(', ')}`)
  }

  textLines.push(`Notes: ${body.notes?.trim() ? body.notes : 'N/A'}`)

  const textContent = `${textLines.join('\n')}\n`

  const htmlParts = [
    ...(managementFailureDetail
      ? [
          '<p style="background:#b91c1c;color:#ffffff;padding:12px 16px;font-weight:bold;">' +
            'THIS ENQUIRY IS NOT IN THE MANAGEMENT SYSTEM. Saving it to /private-bookings failed after every retry, ' +
            'so this email is the only record. Please add it by hand, then reply to the guest as normal.</p>',
          `<p><strong>Technical detail:</strong> ${escapeHtml(managementFailureDetail)}</p>`
        ]
      : []),
    '<h2>New Christmas enquiry</h2>',
    `<p><strong>Name:</strong> ${escapeHtml(body.name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(body.email)}</p>`,
    `<p><strong>Phone:</strong> ${escapeHtml(body.phone)}</p>`,
    `<p><strong>Party size:</strong> ${escapeHtml(body.partySize)}</p>`,
    `<p><strong>Preferred date:</strong> ${escapeHtml(preferredDate)}</p>`,
    `<p><strong>Preferred time:</strong> ${escapeHtml(preferredTime)}</p>`,
    `<p><strong>Enquiry type:</strong> ${escapeHtml(label)}</p>`
  ]

  if (body.mode === 'meal') {
    htmlParts.push(`<p><strong>Meal sitting:</strong> ${body.service === 'lunch' ? 'Lunch' : 'Dinner'}</p>`)
    htmlParts.push(`<p><strong>Courses expected:</strong> ${escapeHtml(courseTierLabel(body.courseTier))}</p>`)
    htmlParts.push(`<p><strong>Pre-order required:</strong> ${escapeHtml(PRE_ORDER_REQUIREMENT)}</p>`)
  }

  if (body.mode === 'party' && body.partyFormat) {
    htmlParts.push(`<p><strong>Party style:</strong> ${escapeHtml(partyFormatLabel(body.partyFormat) || body.partyFormat)}</p>`)
  }

  if (body.source) {
    htmlParts.push(`<p><strong>Enquiry source:</strong> ${escapeHtml(body.source)}</p>`)
  }

  if (extras.length > 0) {
    htmlParts.push(`<p><strong>Extras requested:</strong> ${extras.map(escapeHtml).join(', ')}</p>`)
  }

  if (perks.length > 0) {
    htmlParts.push(`<p><strong>Offers mentioned:</strong> ${perks.map(escapeHtml).join(', ')}</p>`)
  }

  const formattedNotes = body.notes ? escapeHtml(body.notes).replace(/\n/g, '<br/>') : 'N/A'
  htmlParts.push(`<p><strong>Notes:</strong><br/>${formattedNotes}</p>`)

  const htmlContent = htmlParts.join('\n')

  return { subject, textContent, htmlContent }
}

async function getMicrosoftGraphToken() {
  const tenantId = process.env.MICROSOFT_TENANT_ID
  const clientId = process.env.MICROSOFT_CLIENT_ID
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Microsoft Graph credentials are not configured')
  }

  const tokenResponse = await fetch(`${GRAPH_TOKEN_HOST}/${tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: GRAPH_SCOPE,
      grant_type: 'client_credentials'
    }).toString()
  })

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    throw new Error(`Failed to obtain Microsoft Graph token: ${errorText}`)
  }

  const data = await tokenResponse.json() as { access_token?: string }
  if (!data.access_token) {
    throw new Error('Access token missing from Microsoft Graph response')
  }

  return data.access_token
}

async function sendMicrosoftGraphEmail(accessToken: string, options: { to: string; fromUser: string; subject: string; htmlContent: string; textContent: string; replyTo: string }) {
  const { to, fromUser, subject, htmlContent, textContent, replyTo } = options

  const response = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(fromUser)}/sendMail`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: {
        subject,
        body: {
          contentType: 'HTML',
          content: htmlContent
        },
        toRecipients: [
          { emailAddress: { address: to } }
        ],
        replyTo: [
          { emailAddress: { address: replyTo } }
        ]
      },
      saveToSentItems: true
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to send enquiry email via Microsoft Graph: ${errorText}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json()

    // Both Christmas enquiry forms (the main one and the lightbox) now mint a
    // Turnstile token, so this route verifies it rather than relying on the
    // honeypot and timing checks alone. This route sends an email and talks to
    // no upstream verifier, so it is the only party that can check the token.
    const spam = await checkSpamProtection(request, rawBody)
    if (spam.blocked) return spam.response

    const body = normaliseIncomingPayload(rawBody as IncomingChristmasEnquiryPayload)

    if (!body.name || !body.email || !body.phone || !body.partySize || !body.preferredDate || !body.mode) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['party', 'meal'].includes(body.mode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid enquiry type' },
        { status: 400 }
      )
    }

    if (body.mode === 'meal' && (!body.service || !VALID_MEAL_SERVICES.has(body.service))) {
      return NextResponse.json(
        { success: false, error: 'Please choose Christmas lunch or dinner' },
        { status: 400 }
      )
    }

    if (body.mode === 'party' && body.partyFormat && !VALID_PARTY_FORMATS.has(body.partyFormat)) {
      return NextResponse.json(
        { success: false, error: 'Invalid party style' },
        { status: 400 }
      )
    }

    if (body.courseTier && !VALID_COURSE_TIERS.has(body.courseTier)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course selection' },
        { status: 400 }
      )
    }

    const numericPartySize = Number.parseInt(body.partySize, 10)
    // Sit-down capacity is 60 at Christmas whichever journey it arrives by, so
    // a party-style sit-down dinner carries the same cap as the meal journey.
    const maximumPartySize = body.mode === 'meal' || body.partyFormat === 'sit_down_dinner' ? 60 : 200
    const isBuffetFormat = body.partyFormat === 'buffet_party' || body.partyFormat === 'festive_buffet'
    const minimumPartySize = body.mode === 'party' && isBuffetFormat
      ? BUFFET_MINIMUM_GUESTS
      : CHRISTMAS_MINIMUM_PARTY_SIZE
    if (!/^\d+$/.test(body.partySize.trim()) || !Number.isInteger(numericPartySize) || numericPartySize < minimumPartySize || numericPartySize > maximumPartySize) {
      return NextResponse.json(
        { success: false, error: `Guest numbers must be between ${minimumPartySize} and ${maximumPartySize}` },
        { status: 400 }
      )
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.preferredDate) || body.preferredDate < CHRISTMAS_BOOKING_START || body.preferredDate > CHRISTMAS_BOOKING_END) {
      return NextResponse.json(
        { success: false, error: 'Please choose a date within the Christmas booking period' },
        { status: 400 }
      )
    }

    // Every Christmas booking needs at least 24 hours notice, so a date of
    // today or earlier is rejected server-side as well as in the form.
    const earliestDate = earliestBookableDate()
    if (body.preferredDate < earliestDate) {
      return NextResponse.json(
        {
          success: false,
          error: `Christmas bookings need at least ${CHRISTMAS_MINIMUM_NOTICE_HOURS} hours notice. The earliest date we can take is ${earliestDate}.`
        },
        { status: 400 }
      )
    }

    if (body.preferredTime && !/^flexible$/i.test(body.preferredTime.trim()) && !normaliseChristmasEnquiryTime(body.preferredTime)) {
      return NextResponse.json(
        { success: false, error: 'Invalid preferred time' },
        { status: 400 }
      )
    }

    const enquiry = body as ChristmasEnquiryPayload
    const managementApiBaseUrl = getManagementApiBaseUrl()
    const managementKey = process.env.ANCHOR_API_KEY
    let managementForwarded = false
    // Why the enquiry is not in the management system, for the fallback email.
    // Stays null on success; is always set on any path that skips or fails the
    // management call, so the email can never claim less than the truth.
    let managementFailureDetail: string | null = managementKey
      ? null
      : 'ANCHOR_API_KEY is not configured, so the management app was never called.'

    if (managementKey) {
      try {
        const cleanUrl = managementApiBaseUrl.replace(/\/$/, '')
        const managementTime = normaliseChristmasEnquiryTime(body.preferredTime)
        const managementNotes = [
          body.notes?.trim(),
          `Website Christmas journey: ${enquiryLabel(enquiry)}`,
          body.mode === 'meal' ? `Pre-order required: ${PRE_ORDER_REQUIREMENT}` : undefined,
          body.mode === 'party' && body.partyFormat ? `Party style: ${partyFormatLabel(body.partyFormat)}` : undefined,
          body.source ? `Website CTA source: ${body.source}` : undefined
        ].filter((value): value is string => Boolean(value)).join('\n\n').slice(0, 2000)

        // Journey, sitting, expected course count and party style are sent as
        // structured fields as well as free text, so the management app is not
        // left having to parse a notes blob to know what was asked for. The
        // courseTier key and its values are unchanged so the management app
        // keeps reading the enquiry it already understands.
        const managementPayload = {
          name: body.name,
          email: body.email,
          phone: body.phone,
          partySize: body.partySize,
          preferredDate: body.preferredDate,
          ...(managementTime ? { preferredTime: managementTime } : {}),
          notes: managementNotes,
          enquiryMode: body.mode,
          ...(body.mode === 'meal' ? { mealService: body.service, courseTier: body.courseTier || 'undecided' } : {}),
          ...(body.mode === 'party' && body.partyFormat ? { partyFormat: body.partyFormat } : {}),
          extras: body.extras,
          perks: body.perks
        }

        // One idempotency key for the whole submission, reused on every retry.
        // The management route claims the key before writing and releases it on
        // failure, so a retry can never create a duplicate booking: an ambiguous
        // timeout that actually committed replays the stored 201 instead.
        const idempotencyKey =
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `xmas-${Date.now()}-${Math.random().toString(36).slice(2)}`

        for (let attempt = 1; attempt <= MANAGEMENT_ATTEMPTS && !managementForwarded; attempt++) {
          try {
            const mgmtResponse = await fetch(`${cleanUrl}/external/create-booking`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-API-Key': managementKey,
                'Idempotency-Key': idempotencyKey
              },
              body: JSON.stringify(managementPayload),
              signal: requestTimeoutSignal(MANAGEMENT_TIMEOUT_MS)
            })

            if (mgmtResponse.ok) {
              managementForwarded = true
              managementFailureDetail = null
              break
            }

            const errorText = await mgmtResponse.text().catch(() => '')
            managementFailureDetail = `HTTP ${mgmtResponse.status} on attempt ${attempt} of ${MANAGEMENT_ATTEMPTS}: ${errorText.slice(0, 300)}`

            // 5xx may heal on retry. 429 is asking us to retry. 409 means our
            // own earlier attempt still holds the idempotency claim, so waiting
            // and retrying resolves to either its stored success or a clean run.
            // Any other 4xx is a payload problem and retrying cannot fix it.
            const retryable = mgmtResponse.status >= 500 || mgmtResponse.status === 429 || mgmtResponse.status === 409
            if (!retryable) break
          } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : String(requestError)
            managementFailureDetail = `${message} on attempt ${attempt} of ${MANAGEMENT_ATTEMPTS}`
          }

          if (attempt < MANAGEMENT_ATTEMPTS) {
            await sleep(MANAGEMENT_RETRY_DELAYS_MS[attempt - 1] ?? 1000)
          }
        }

        if (!managementForwarded) {
          console.error('Christmas enquiry could not be stored in the management app after retries:', managementFailureDetail)
        }
      } catch (dbError) {
        const message = dbError instanceof Error ? dbError.message : String(dbError)
        managementFailureDetail = managementFailureDetail || `Unexpected error before the management call: ${message}`
        console.error('Error contacting management app:', dbError)
      }
    }

    if (!managementForwarded) {
      const graphUser = process.env.MICROSOFT_USER_EMAIL
      if (!graphUser) {
        console.error('Christmas enquiry could not reach the management app and MICROSOFT_USER_EMAIL is not configured.')
        return NextResponse.json(
          { success: false, error: 'The enquiry service is temporarily unavailable. Please call us on 01753 682707.' },
          { status: 500 }
        )
      }

      const { subject, htmlContent, textContent } = buildEmailContent(enquiry, { managementFailureDetail })
      const accessToken = await getMicrosoftGraphToken()

      await sendMicrosoftGraphEmail(accessToken, {
        to: process.env.CHRISTMAS_ENQUIRY_TO || DEFAULT_TO,
        fromUser: graphUser,
        subject,
        htmlContent,
        textContent,
        replyTo: body.email
      })
    }

    const delivery = managementForwarded ? 'management' : 'email_fallback'

    // The enquiry is already safely lodged by this point, so the attribution call cannot
    // change the outcome. It is recorded for both delivery routes: an email fallback is
    // still an enquiry the campaign produced.
    await recordMarketingConversion({
      attribution: normaliseAttribution(rawBody as Record<string, unknown>),
      partySize: numericPartySize,
      mode: enquiry.mode,
      service: enquiry.mode === 'meal' ? enquiry.service : undefined,
      partyFormat: enquiry.mode === 'party' ? enquiry.partyFormat : undefined,
      source: enquiry.source,
      delivery
    })

    return NextResponse.json({ success: true, delivery })
  } catch (error) {
    console.error('Christmas enquiry submission failed:', error)
    const message = error instanceof Error ? error.message : 'Unexpected error submitting enquiry.'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
