import { logError } from '@/lib/error-handling'

const GRAPH_SCOPE = 'https://graph.microsoft.com/.default'
const GRAPH_TOKEN_HOST = 'https://login.microsoftonline.com'
const DEFAULT_TO = 'manager@the-anchor.pub'

/**
 * Last-resort delivery for a form submission the management API would not take.
 *
 * A guest who fills in an enquiry has done everything asked of them. If the
 * management API is down, or rejects the payload for a reason nobody
 * anticipated, the lead must still reach a human rather than evaporate. This
 * mirrors the fallback the Christmas enquiry route has used in production since
 * 2025, extracted so the private-hire flow can share it.
 */

export function enquiryFallbackRecipient(): string {
  return process.env.CHRISTMAS_ENQUIRY_TO?.trim() || DEFAULT_TO
}

export function isEnquiryFallbackConfigured(): boolean {
  return Boolean(
    process.env.MICROSOFT_TENANT_ID &&
    process.env.MICROSOFT_CLIENT_ID &&
    process.env.MICROSOFT_CLIENT_SECRET &&
    process.env.MICROSOFT_USER_EMAIL
  )
}

async function getMicrosoftGraphToken(): Promise<string> {
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
    throw new Error(`Failed to obtain Microsoft Graph token: ${tokenResponse.status}`)
  }

  const data = await tokenResponse.json() as { access_token?: string }
  if (!data.access_token) {
    throw new Error('Access token missing from Microsoft Graph response')
  }

  return data.access_token
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Sends the fallback email. Never throws: the caller is already handling a
 * failure, and a second one must not turn a recoverable problem into a 500.
 * Returns whether the manager was actually reached, so the caller can decide
 * what to tell the guest.
 */
export async function sendEnquiryFallbackEmail(options: {
  subject: string
  htmlContent: string
  textContent: string
  replyTo?: string
}): Promise<{ sent: boolean; error?: string }> {
  const fromUser = process.env.MICROSOFT_USER_EMAIL

  if (!isEnquiryFallbackConfigured() || !fromUser) {
    const error = 'Enquiry fallback email is not configured'
    logError('lib/enquiry-fallback-email/not-configured', new Error(error))
    return { sent: false, error }
  }

  try {
    const accessToken = await getMicrosoftGraphToken()
    const to = enquiryFallbackRecipient()

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(fromUser)}/sendMail`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: {
            subject: options.subject,
            body: { contentType: 'HTML', content: options.htmlContent },
            toRecipients: [{ emailAddress: { address: to } }],
            ...(options.replyTo
              ? { replyTo: [{ emailAddress: { address: options.replyTo } }] }
              : {})
          },
          saveToSentItems: true
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Microsoft Graph rejected the message: ${response.status}`)
    }

    return { sent: true }
  } catch (error) {
    logError('lib/enquiry-fallback-email/send-failed', error)
    return { sent: false, error: error instanceof Error ? error.message : String(error) }
  }
}
