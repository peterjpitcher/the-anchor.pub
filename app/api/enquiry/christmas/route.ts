import { NextResponse } from 'next/server'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'

const DEFAULT_TO = 'manager@the-anchor.pub'
const GRAPH_SCOPE = 'https://graph.microsoft.com/.default'
const GRAPH_TOKEN_HOST = 'https://login.microsoftonline.com'

type EnquiryMode = 'dinner' | 'buffet'

interface ChristmasEnquiryPayload {
  mode: EnquiryMode
  name: string
  email: string
  phone: string
  partySize: string
  preferredDate: string
  preferredTime: string
  extras?: string[]
  perks?: string[]
  notes?: string
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

  const subject = `Christmas ${body.mode === 'dinner' ? 'Dinner' : 'Buffet'} Enquiry - ${body.partySize} guests - ${preferredDate}`

  const textLines = [
    'New Christmas enquiry',
    '',
    `Name: ${body.name}`,
    `Email: ${body.email}`,
    `Phone: ${body.phone}`,
    `Party size: ${body.partySize}`,
    `Preferred date: ${preferredDate}`,
    `Preferred time: ${body.preferredTime}`,
    `Enquiry type: ${body.mode === 'dinner' ? 'Festive dinner (up to 25)' : 'Buffet (26+)'}`
  ]

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
    `<p><strong>Preferred time:</strong> ${escapeHtml(body.preferredTime)}</p>`,
    `<p><strong>Enquiry type:</strong> ${body.mode === 'dinner' ? 'Festive dinner (up to 25)' : 'Buffet (26+)'}</p>`
  ]

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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ChristmasEnquiryPayload>

    if (!body.name || !body.email || !body.phone || !body.partySize || !body.preferredDate || !body.preferredTime || !body.mode) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const graphUser = process.env.MICROSOFT_USER_EMAIL
    if (!graphUser) {
      console.error('MICROSOFT_USER_EMAIL is not configured.')
      return NextResponse.json(
        { success: false, error: 'Email service is not configured. Please contact the site administrator.' },
        { status: 500 }
      )
    }

    const { subject, htmlContent, textContent } = buildEmailContent(body as ChristmasEnquiryPayload)
    const accessToken = await getMicrosoftGraphToken()

    await sendMicrosoftGraphEmail(accessToken, {
      to: process.env.CHRISTMAS_ENQUIRY_TO || DEFAULT_TO,
      fromUser: graphUser,
      subject,
      htmlContent,
      textContent,
      replyTo: body.email
    })

    // Forward to Management App
    const managementApiBaseUrl = getManagementApiBaseUrl()
    const managementKey = process.env.ANCHOR_API_KEY

    if (managementKey) {
      try {
        const cleanUrl = managementApiBaseUrl.replace(/\/$/, '')
        const mgmtResponse = await fetch(`${cleanUrl}/external/create-booking`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': managementKey
          },
          body: JSON.stringify(body)
        })

        if (!mgmtResponse.ok) {
          console.error('Failed to create booking in management app:', await mgmtResponse.text())
        }
      } catch (dbError) {
        console.error('Error contacting management app:', dbError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Christmas enquiry submission failed:', error)
    const message = error instanceof Error ? error.message : 'Unexpected error submitting enquiry.'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
