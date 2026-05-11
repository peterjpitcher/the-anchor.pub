const GRAPH_SCOPE = 'https://graph.microsoft.com/.default'
const GRAPH_TOKEN_HOST = 'https://login.microsoftonline.com'
const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'
const GRAPH_SIMPLE_ATTACHMENT_LIMIT = 3 * 1024 * 1024

export type GraphMailAttachment = {
  name: string
  contentType: string
  contentBytes: string // base64
  size: number
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function getMicrosoftGraphToken(): Promise<string> {
  const tenantId = process.env.MICROSOFT_TENANT_ID
  const clientId = process.env.MICROSOFT_CLIENT_ID
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Microsoft Graph credentials are not configured')
  }

  const tokenResponse = await fetch(
    `${GRAPH_TOKEN_HOST}/${tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: GRAPH_SCOPE,
        grant_type: 'client_credentials',
      }).toString(),
    }
  )

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    throw new Error(`Failed to obtain Microsoft Graph token: ${errorText}`)
  }

  const data = (await tokenResponse.json()) as { access_token?: string }
  if (!data.access_token) {
    throw new Error('Access token missing from Microsoft Graph response')
  }

  return data.access_token
}

export async function sendMicrosoftGraphEmail(options: {
  to: string
  fromUser: string
  subject: string
  htmlContent: string
  textContent?: string
  replyTo?: string
  attachments?: GraphMailAttachment[]
}): Promise<void> {
  const { to, fromUser, subject, htmlContent, textContent, replyTo, attachments } = options
  const accessToken = await getMicrosoftGraphToken()
  const userPath = `${GRAPH_API_BASE}/users/${encodeURIComponent(fromUser)}`

  const totalAttachmentBytes = (attachments ?? []).reduce((sum, a) => sum + a.size, 0)
  const needsUploadSession = totalAttachmentBytes >= GRAPH_SIMPLE_ATTACHMENT_LIMIT

  if (!needsUploadSession) {
    await sendSimple(accessToken, userPath, { to, subject, htmlContent, textContent, replyTo, attachments })
  } else {
    await sendWithUploadSession(accessToken, userPath, { to, subject, htmlContent, textContent, replyTo, attachments: attachments ?? [] })
  }
}

function buildMessageBody(options: {
  to: string
  subject: string
  htmlContent: string
  textContent?: string
  replyTo?: string
}): Record<string, unknown> {
  const { to, subject, htmlContent, replyTo } = options

  const message: Record<string, unknown> = {
    subject,
    body: {
      contentType: 'HTML',
      content: htmlContent,
    },
    toRecipients: [{ emailAddress: { address: to } }],
  }

  if (replyTo) {
    message.replyTo = [{ emailAddress: { address: replyTo } }]
  }

  return message
}

async function sendSimple(
  accessToken: string,
  userPath: string,
  options: {
    to: string
    subject: string
    htmlContent: string
    textContent?: string
    replyTo?: string
    attachments?: GraphMailAttachment[]
  }
): Promise<void> {
  const message = buildMessageBody(options)

  if (options.attachments && options.attachments.length > 0) {
    message.attachments = options.attachments.map((att) => ({
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: att.name,
      contentType: att.contentType,
      contentBytes: att.contentBytes,
    }))
  }

  const response = await fetch(`${userPath}/sendMail`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      saveToSentItems: true,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to send email via Microsoft Graph: ${errorText}`)
  }
}

async function sendWithUploadSession(
  accessToken: string,
  userPath: string,
  options: {
    to: string
    subject: string
    htmlContent: string
    textContent?: string
    replyTo?: string
    attachments: GraphMailAttachment[]
  }
): Promise<void> {
  const message = buildMessageBody(options)
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  }

  // Step 1: Create draft message
  const draftResponse = await fetch(`${userPath}/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify(message),
  })

  if (!draftResponse.ok) {
    const errorText = await draftResponse.text()
    throw new Error(`Failed to create draft message: ${errorText}`)
  }

  const draft = (await draftResponse.json()) as { id: string }
  const draftId = draft.id

  try {
    // Step 2: Upload each attachment via upload session
    for (const attachment of options.attachments) {
      const sessionResponse = await fetch(
        `${userPath}/messages/${draftId}/attachments/createUploadSession`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            AttachmentItem: {
              attachmentType: 'file',
              name: attachment.name,
              size: attachment.size,
              contentType: attachment.contentType,
            },
          }),
        }
      )

      if (!sessionResponse.ok) {
        const errorText = await sessionResponse.text()
        throw new Error(`Failed to create upload session for ${attachment.name}: ${errorText}`)
      }

      const session = (await sessionResponse.json()) as { uploadUrl: string }

      // Step 3: Upload file bytes in a single PUT
      const fileBytes = Buffer.from(attachment.contentBytes, 'base64')
      const uploadResponse = await fetch(session.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': attachment.contentType,
          'Content-Length': String(fileBytes.length),
          'Content-Range': `bytes 0-${fileBytes.length - 1}/${fileBytes.length}`,
        },
        body: fileBytes,
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        throw new Error(`Failed to upload attachment ${attachment.name}: ${errorText}`)
      }
    }

    // Step 4: Send the draft
    const sendResponse = await fetch(`${userPath}/messages/${draftId}/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Length': '0',
      },
    })

    if (!sendResponse.ok) {
      const errorText = await sendResponse.text()
      throw new Error(`Failed to send draft message: ${errorText}`)
    }
  } catch (error) {
    // Clean up: attempt to delete the draft to avoid orphans
    try {
      await fetch(`${userPath}/messages/${draftId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    } catch {
      // Draft cleanup is best-effort; the original error is more important
    }
    throw error
  }
}
