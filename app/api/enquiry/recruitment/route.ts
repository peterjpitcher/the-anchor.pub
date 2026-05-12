import { Buffer } from 'node:buffer'
import { NextRequest, NextResponse } from 'next/server'
import { checkSpamProtection } from '@/lib/spam-protection'

export const runtime = 'nodejs'

const DEFAULT_TO = 'manager@the-anchor.pub'
const GRAPH_SCOPE = 'https://graph.microsoft.com/.default'
const GRAPH_TOKEN_HOST = 'https://login.microsoftonline.com'
const MAX_CV_BYTES = 5 * 1024 * 1024
const ALLOWED_CV_EXTENSIONS = new Set(['.pdf', '.doc', '.docx'])

type RecruitmentPayload = {
  name: string
  email: string
  phone: string
  role: string
  experience: string
  fit: string
  availability: string[]
  travel: string
  relevantExperience: string
  startDate: string
  consent: string
  pageUrl?: string
}

type GraphAttachment = {
  '@odata.type': '#microsoft.graph.fileAttachment'
  name: string
  contentType: string
  contentBytes: string
}

function asTrimmedString(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : ''
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatMultiline(text: string): string {
  return escapeHtml(text).replace(/\n/g, '<br />')
}

function getExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf('.')
  return dotIndex >= 0 ? filename.slice(dotIndex).toLowerCase() : ''
}

function validatePayload(payload: RecruitmentPayload): string | null {
  if (!payload.name) return 'Name is required.'
  if (!payload.email) return 'Email address is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return 'Please enter a valid email address.'
  if (!payload.phone) return 'Phone number is required.'
  if (!payload.role) return 'Role is required.'
  if (!payload.experience) return 'Relevant experience is required.'
  if (!payload.fit) return 'Fit is required.'
  if (!payload.availability.length) return 'Availability is required.'
  if (!payload.travel) return 'Travel details are required.'
  if (!payload.relevantExperience) return 'Experience answer is required.'
  if (!payload.startDate) return 'Start date is required.'
  if (payload.consent !== 'yes') return 'Consent is required.'
  return null
}

function buildEmailContent(payload: RecruitmentPayload) {
  const subject = `Recruitment application - ${payload.role} - ${payload.name}`
  const textContent = [
    'New recruitment application',
    '',
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Role: ${payload.role}`,
    `Availability: ${payload.availability.join(', ')}`,
    `One year relevant experience: ${payload.relevantExperience}`,
    `Start date: ${payload.startDate}`,
    `Travel: ${payload.travel}`,
    '',
    'Relevant experience:',
    payload.experience,
    '',
    'Good fit:',
    payload.fit,
    '',
    `Page URL: ${payload.pageUrl || 'N/A'}`
  ].join('\n')

  const htmlContent = [
    '<h2>New recruitment application</h2>',
    `<p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>`,
    `<p><strong>Phone:</strong> ${escapeHtml(payload.phone)}</p>`,
    `<p><strong>Role:</strong> ${escapeHtml(payload.role)}</p>`,
    `<p><strong>Availability:</strong> ${payload.availability.map(escapeHtml).join(', ')}</p>`,
    `<p><strong>One year relevant experience:</strong> ${escapeHtml(payload.relevantExperience)}</p>`,
    `<p><strong>Start date:</strong> ${escapeHtml(payload.startDate)}</p>`,
    `<p><strong>Travel:</strong><br />${formatMultiline(payload.travel)}</p>`,
    `<p><strong>Relevant experience:</strong><br />${formatMultiline(payload.experience)}</p>`,
    `<p><strong>Good fit:</strong><br />${formatMultiline(payload.fit)}</p>`,
    `<p><strong>Page URL:</strong> ${escapeHtml(payload.pageUrl || 'N/A')}</p>`
  ].join('\n')

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

async function sendMicrosoftGraphEmail(
  accessToken: string,
  options: {
    to: string
    fromUser: string
    subject: string
    htmlContent: string
    replyTo: string
    attachments?: GraphAttachment[]
  }
) {
  const response = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(options.fromUser)}/sendMail`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: {
        subject: options.subject,
        body: {
          contentType: 'HTML',
          content: options.htmlContent
        },
        toRecipients: [
          { emailAddress: { address: options.to } }
        ],
        replyTo: [
          { emailAddress: { address: options.replyTo } }
        ],
        ...(options.attachments?.length ? { attachments: options.attachments } : {})
      },
      saveToSentItems: true
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to send recruitment email via Microsoft Graph: ${errorText}`)
  }
}

async function buildCvAttachment(file: File | null): Promise<GraphAttachment | null> {
  if (!file || file.size === 0) return null

  if (file.size > MAX_CV_BYTES) {
    throw new Error('CV_TOO_LARGE')
  }

  const extension = getExtension(file.name)
  if (!ALLOWED_CV_EXTENSIONS.has(extension)) {
    throw new Error('CV_UNSUPPORTED_TYPE')
  }

  const arrayBuffer = await file.arrayBuffer()
  return {
    '@odata.type': '#microsoft.graph.fileAttachment',
    name: file.name,
    contentType: file.type || 'application/octet-stream',
    contentBytes: Buffer.from(arrayBuffer).toString('base64')
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const availability = formData
      .getAll('availability')
      .filter((value): value is string => typeof value === 'string')
      .map((value) => value.trim())
      .filter(Boolean)

    const payload: RecruitmentPayload = {
      name: asTrimmedString(formData.get('name')),
      email: asTrimmedString(formData.get('email')),
      phone: asTrimmedString(formData.get('phone')),
      role: asTrimmedString(formData.get('role')),
      experience: asTrimmedString(formData.get('experience')),
      fit: asTrimmedString(formData.get('fit')),
      availability,
      travel: asTrimmedString(formData.get('travel')),
      relevantExperience: asTrimmedString(formData.get('relevantExperience')),
      startDate: asTrimmedString(formData.get('startDate')),
      consent: asTrimmedString(formData.get('consent')),
      pageUrl: asTrimmedString(formData.get('pageUrl')) || undefined
    }

    const spam = await checkSpamProtection(
      request,
      {
        ...payload,
        website: asTrimmedString(formData.get('website')),
        turnstile_token: asTrimmedString(formData.get('turnstile_token')),
        _t: Number(asTrimmedString(formData.get('_t')))
      }
    )
    if (spam.blocked) return spam.response

    const validationError = validatePayload(payload)
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 })
    }

    const cvFile = formData.get('cv')
    let cvAttachment: GraphAttachment | null = null

    try {
      cvAttachment = await buildCvAttachment(cvFile instanceof File ? cvFile : null)
    } catch (error) {
      if (error instanceof Error && error.message === 'CV_TOO_LARGE') {
        return NextResponse.json(
          { success: false, error: 'Please upload a CV smaller than 5MB, or leave the CV field blank.' },
          { status: 400 }
        )
      }
      if (error instanceof Error && error.message === 'CV_UNSUPPORTED_TYPE') {
        return NextResponse.json(
          { success: false, error: 'Please upload a PDF, DOC or DOCX CV, or leave the CV field blank.' },
          { status: 400 }
        )
      }
      throw error
    }

    const graphUser = process.env.MICROSOFT_USER_EMAIL
    if (!graphUser) {
      console.error('MICROSOFT_USER_EMAIL is not configured.')
      return NextResponse.json(
        { success: false, error: 'Email service is not configured. Please contact the site administrator.' },
        { status: 500 }
      )
    }

    const { subject, htmlContent } = buildEmailContent(payload)
    const accessToken = await getMicrosoftGraphToken()

    await sendMicrosoftGraphEmail(accessToken, {
      to: process.env.RECRUITMENT_APPLICATION_TO || DEFAULT_TO,
      fromUser: graphUser,
      subject,
      htmlContent,
      replyTo: payload.email,
      attachments: cvAttachment ? [cvAttachment] : undefined
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Recruitment application submission failed:', error)
    return NextResponse.json(
      { success: false, error: 'Sorry, we could not send your application. Please call us on 01753 682707.' },
      { status: 500 }
    )
  }
}
