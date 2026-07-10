import { NextRequest, NextResponse } from 'next/server'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { checkSpamProtection } from '@/lib/spam-protection'
import { normaliseChristmasEnquiryTime } from '@/lib/christmas-enquiry'

const DEFAULT_TO = 'manager@the-anchor.pub'
const GRAPH_SCOPE = 'https://graph.microsoft.com/.default'
const GRAPH_TOKEN_HOST = 'https://login.microsoftonline.com'
const CHRISTMAS_BOOKING_START = '2026-11-01'
const CHRISTMAS_BOOKING_END = '2026-12-23'
const VALID_MEAL_SERVICES = new Set(['lunch', 'dinner'])
const VALID_PARTY_FORMATS = new Set([
  'not_sure',
  'shared_party',
  'private_space',
  'festive_buffet',
  'drinks_party',
  'entertainment'
])

type EnquiryMode = 'party' | 'meal'
type MealService = 'lunch' | 'dinner'
type LegacyEnquiryMode = 'dinner' | 'buffet'

interface ChristmasEnquiryPayload {
  mode: EnquiryMode
  service?: MealService
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

type IncomingChristmasEnquiryPayload = Omit<Partial<ChristmasEnquiryPayload>, 'mode'> & {
  mode?: EnquiryMode | LegacyEnquiryMode
}

function normaliseIncomingPayload(body: IncomingChristmasEnquiryPayload): Partial<ChristmasEnquiryPayload> {
  if (body.mode === 'dinner') {
    return { ...body, mode: 'meal', service: body.service || 'dinner' }
  }

  if (body.mode === 'buffet') {
    return { ...body, mode: 'party', partyFormat: body.partyFormat || 'festive_buffet' }
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
  return `Sit-down Christmas ${body.service === 'lunch' ? 'lunch' : 'dinner'} (pre-order only)`
}

function partyFormatLabel(value?: string): string | undefined {
  if (!value) return undefined
  const labels: Record<string, string> = {
    not_sure: 'Not sure yet',
    shared_party: 'Shared Christmas party night',
    private_space: 'Private space',
    festive_buffet: 'Festive buffet (26+)',
    drinks_party: 'Drinks party',
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

function buildEmailContent(body: ChristmasEnquiryPayload) {
  const extras = (body.extras || []).filter(Boolean)
  const perks = (body.perks || []).filter(Boolean)
  const preferredDate = body.preferredDate || 'Date TBC'
  const preferredTime = formatTimeForEmail(body.preferredTime)
  const label = enquiryLabel(body)

  const subject = `${label} enquiry - ${body.partySize} guests - ${preferredDate}`

  const textLines = [
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
    textLines.push('Pre-order required: Yes')
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
    htmlParts.push('<p><strong>Pre-order required:</strong> Yes</p>')
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

    const spam = await checkSpamProtection(request, rawBody, { skipTurnstile: true })
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

    const numericPartySize = Number.parseInt(body.partySize, 10)
    const maximumPartySize = body.mode === 'meal' ? 60 : 200
    const minimumPartySize = body.mode === 'party' && body.partyFormat === 'festive_buffet' ? 26 : 6
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

    if (managementKey) {
      try {
        const cleanUrl = managementApiBaseUrl.replace(/\/$/, '')
        const managementTime = normaliseChristmasEnquiryTime(body.preferredTime)
        const managementNotes = [
          body.notes?.trim(),
          `Website Christmas journey: ${enquiryLabel(enquiry)}`,
          body.mode === 'party' && body.partyFormat ? `Party style: ${partyFormatLabel(body.partyFormat)}` : undefined,
          body.source ? `Website CTA source: ${body.source}` : undefined
        ].filter((value): value is string => Boolean(value)).join('\n\n').slice(0, 2000)

        const managementPayload = {
          name: body.name,
          email: body.email,
          phone: body.phone,
          partySize: body.partySize,
          preferredDate: body.preferredDate,
          ...(managementTime ? { preferredTime: managementTime } : {}),
          notes: managementNotes,
          extras: body.extras,
          perks: body.perks
        }

        const mgmtResponse = await fetch(`${cleanUrl}/external/create-booking`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': managementKey
          },
          body: JSON.stringify(managementPayload)
        })

        if (!mgmtResponse.ok) {
          console.error('Failed to create booking in management app:', await mgmtResponse.text())
        } else {
          managementForwarded = true
        }
      } catch (dbError) {
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

      const { subject, htmlContent, textContent } = buildEmailContent(enquiry)
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

    return NextResponse.json({ success: true, delivery: managementForwarded ? 'management' : 'email_fallback' })
  } catch (error) {
    console.error('Christmas enquiry submission failed:', error)
    const message = error instanceof Error ? error.message : 'Unexpected error submitting enquiry.'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
