import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { checkSpamProtection } from '@/lib/spam-protection'
import { pageFromRequest, reportFailure } from '@/lib/report-failure'
import { GUEST_FALLBACK, mapUpstreamFailure } from '@/lib/guest-error-messages'

const ROUTE = 'api/enquiry/recruitment'

export const runtime = 'nodejs'
// Budget: up to two management API attempts (25s + 20s) plus the email fallback.
export const maxDuration = 90

const DEFAULT_TO = 'manager@the-anchor.pub'
const GRAPH_SCOPE = 'https://graph.microsoft.com/.default'
const GRAPH_TOKEN_HOST = 'https://login.microsoftonline.com'
const MAX_CV_BYTES = 5 * 1024 * 1024
const ALLOWED_CV_EXTENSIONS = new Set(['.pdf', '.doc', '.docx'])

// Two attempts with the SAME idempotency key: if the first attempt actually landed
// server-side after we gave up waiting, the retry replays the stored response instead of
// creating a duplicate. Email fallback only happens after both attempts fail.
const MANAGEMENT_ATTEMPT_TIMEOUTS_MS = [25_000, 20_000]
const DEFAULT_RETRY_DELAY_MS = 2_500
const IN_PROGRESS_RETRY_DELAY_MS = 4_000

type RecruitmentPayload = {
  name: string
  email: string
  phone: string
  role: string
  jobPostingId?: string
  jobSlug?: string
  experience: string
  fit: string
  availability: string[]
  travel: string
  relevantExperience: string
  startDate: string
  consent: string
  smsConsent: string
  futureRecruitmentConsent: string
  idempotencyKey: string
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

function buildEmailContent(payload: RecruitmentPayload, options: { possibleDuplicate?: boolean; fallbackReason?: string } = {}) {
  const subjectPrefix = options.possibleDuplicate ? 'Possible duplicate recruitment application' : 'Recruitment application'
  const subject = `${subjectPrefix} - ${payload.role} - ${payload.name}`
  const textContent = [
    options.possibleDuplicate ? 'New recruitment application - possible duplicate' : 'New recruitment application',
    options.fallbackReason ? `Fallback reason: ${options.fallbackReason}` : '',
    `Idempotency key: ${payload.idempotencyKey}`,
    '',
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Role: ${payload.role}`,
    `Availability: ${payload.availability.join(', ')}`,
    `One year relevant experience: ${payload.relevantExperience}`,
    `Start date: ${payload.startDate}`,
    `Travel: ${payload.travel}`,
    `SMS consent: ${payload.smsConsent === 'yes' ? 'Yes' : 'No'}`,
    `Future recruitment consent: ${payload.futureRecruitmentConsent === 'yes' ? 'Yes' : 'No'}`,
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
    `<h2>${options.possibleDuplicate ? 'New recruitment application - possible duplicate' : 'New recruitment application'}</h2>`,
    options.fallbackReason ? `<p><strong>Fallback reason:</strong> ${escapeHtml(options.fallbackReason)}</p>` : '',
    `<p><strong>Idempotency key:</strong> ${escapeHtml(payload.idempotencyKey)}</p>`,
    `<p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>`,
    `<p><strong>Phone:</strong> ${escapeHtml(payload.phone)}</p>`,
    `<p><strong>Role:</strong> ${escapeHtml(payload.role)}</p>`,
    `<p><strong>Availability:</strong> ${payload.availability.map(escapeHtml).join(', ')}</p>`,
    `<p><strong>One year relevant experience:</strong> ${escapeHtml(payload.relevantExperience)}</p>`,
    `<p><strong>Start date:</strong> ${escapeHtml(payload.startDate)}</p>`,
    `<p><strong>SMS consent:</strong> ${payload.smsConsent === 'yes' ? 'Yes' : 'No'}</p>`,
    `<p><strong>Future recruitment consent:</strong> ${payload.futureRecruitmentConsent === 'yes' ? 'Yes' : 'No'}</p>`,
    `<p><strong>Travel:</strong><br />${formatMultiline(payload.travel)}</p>`,
    `<p><strong>Relevant experience:</strong><br />${formatMultiline(payload.experience)}</p>`,
    `<p><strong>Good fit:</strong><br />${formatMultiline(payload.fit)}</p>`,
    `<p><strong>Page URL:</strong> ${escapeHtml(payload.pageUrl || 'N/A')}</p>`
  ].join('\n')

  return { subject, textContent, htmlContent }
}

function normalizeManagementApiBaseUrl(value: string): string {
  const normalized = value.trim().replace(/\/+$/, '')
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`
}

function managementApiBaseUrl(): string {
  const configuredBaseUrl =
    process.env.RECRUITMENT_MANAGEMENT_API_BASE_URL ||
    process.env.MANAGEMENT_API_BASE_URL ||
    process.env.NEXT_PUBLIC_MANAGEMENT_APP_URL

  return configuredBaseUrl
    ? normalizeManagementApiBaseUrl(configuredBaseUrl)
    : getManagementApiBaseUrl()
}

function managementApiKey(): string | null {
  return process.env.RECRUITMENT_MANAGEMENT_API_KEY || process.env.MANAGEMENT_API_KEY || process.env.ANCHOR_API_KEY || null
}

function appendIfPresent(formData: FormData, key: string, value: string | undefined | null) {
  if (value) formData.set(key, value)
}

function retryDelayMs(inProgress: boolean): number {
  const override = Number(process.env.RECRUITMENT_PROXY_RETRY_DELAY_MS)
  if (Number.isFinite(override) && override >= 0) {
    return override
  }
  return inProgress ? IN_PROGRESS_RETRY_DELAY_MS : DEFAULT_RETRY_DELAY_MS
}

function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type ManagementAttemptResult =
  | { state: 'success'; response: unknown }
  | { state: 'validation_error'; status: number; error: string }
  | { state: 'retryable'; reason: string; possibleDuplicate: boolean; inProgress?: boolean; status?: number }
  // Not the applicant's to correct and not worth a second go: the key was
  // rejected, the route has moved, the upload was too big for the far end.
  | { state: 'infrastructure_error'; reason: string; possibleDuplicate: boolean; status?: number }

async function attemptManagementApi(
  url: string,
  apiKey: string,
  idempotencyKey: string,
  body: FormData,
  timeoutMs: number
): Promise<ManagementAttemptResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Idempotency-Key': idempotencyKey,
      },
      body,
      signal: controller.signal,
    })

    const responsePayload = await response.json().catch(() => null)
    if (response.ok) {
      return { state: 'success', response: responsePayload }
    }

    const upstreamMessage = responsePayload?.error?.message

    if (response.status === 409) {
      // A previous attempt's idempotency claim is still registered server-side, so the
      // application may already be saved — retry; a replay returns the stored response.
      return {
        state: 'retryable',
        reason: upstreamMessage || 'Management API reported the application as already in progress',
        possibleDuplicate: true,
        inProgress: responsePayload?.error?.code === 'IDEMPOTENCY_KEY_IN_PROGRESS',
        status: response.status,
      }
    }

    if (response.status === 429) {
      // Never bounce a real applicant because of rate limiting — let the email fallback
      // catch the application instead.
      return {
        state: 'retryable',
        reason: upstreamMessage || 'Management API rate limited the request',
        possibleDuplicate: false,
        status: response.status,
      }
    }

    if (response.status >= 500 || response.status === 408) {
      return {
        state: 'retryable',
        reason: upstreamMessage || `Management API returned ${response.status}`,
        possibleDuplicate: response.status === 408,
        status: response.status,
      }
    }

    // Only a 400 or a 422 is the applicant's to correct. This used to treat
    // every other 4xx the same way, so a rejected key (401), a missing
    // permission (403) or a moved route (404) bounced each applicant with the
    // management app's own sentence, sent no fallback email and logged
    // nothing: the application and the CV went nowhere.
    if (response.status === 400 || response.status === 422) {
      return {
        state: 'validation_error',
        status: response.status,
        error: mapUpstreamFailure({
          status: response.status,
          body: responsePayload,
          context: 'job_application',
          trustValidationSentences: true,
        }).message,
      }
    }

    return {
      state: 'infrastructure_error',
      reason: `Management API returned ${response.status}`,
      possibleDuplicate: false,
      status: response.status,
    }
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError'
    return {
      state: 'retryable',
      reason: aborted
        ? 'Management API request timed out'
        : error instanceof Error ? error.message : 'Management API request failed',
      possibleDuplicate: aborted,
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function proxyToManagementApi(
  payload: RecruitmentPayload,
  cvFile: File | null
): Promise<
  | { state: 'success'; response: unknown }
  | { state: 'validation_error'; status: number; error: string }
  | { state: 'infrastructure_error'; reason: string; possibleDuplicate: boolean; status?: number }
> {
  const baseUrl = managementApiBaseUrl()
  const apiKey = managementApiKey()

  if (!apiKey) {
    return { state: 'infrastructure_error', reason: 'Management recruitment API is not configured', possibleDuplicate: false }
  }

  const upstreamForm = new FormData()
  appendIfPresent(upstreamForm, 'first_name', payload.name.split(/\s+/)[0])
  appendIfPresent(upstreamForm, 'last_name', payload.name.split(/\s+/).slice(1).join(' '))
  appendIfPresent(upstreamForm, 'email', payload.email)
  appendIfPresent(upstreamForm, 'phone', payload.phone)
  appendIfPresent(upstreamForm, 'job_posting_id', payload.jobPostingId)
  appendIfPresent(upstreamForm, 'job_slug', payload.jobSlug)
  appendIfPresent(upstreamForm, 'preferred_role', payload.role)
  appendIfPresent(upstreamForm, 'experience', payload.experience)
  appendIfPresent(upstreamForm, 'cover_note', payload.fit)
  appendIfPresent(upstreamForm, 'relevant_experience_answer', payload.relevantExperience)
  appendIfPresent(upstreamForm, 'travel_answer', payload.travel)
  appendIfPresent(upstreamForm, 'start_availability', payload.startDate)
  appendIfPresent(upstreamForm, 'availability', payload.availability.join(', '))
  appendIfPresent(upstreamForm, 'provided_details', [
    `Role: ${payload.role}`,
    `Availability: ${payload.availability.join(', ')}`,
    `Experience: ${payload.experience}`,
    `Fit: ${payload.fit}`,
    `Travel: ${payload.travel}`,
    `Relevant experience: ${payload.relevantExperience}`,
    `Start date: ${payload.startDate}`,
    `Page URL: ${payload.pageUrl || 'N/A'}`,
  ].join('\n\n'))
  upstreamForm.set('privacy_consent', 'true')
  upstreamForm.set('sms_consent', payload.smsConsent === 'yes' ? 'true' : 'false')
  upstreamForm.set('future_recruitment_consent', payload.futureRecruitmentConsent === 'yes' ? 'true' : 'false')
  appendIfPresent(upstreamForm, 'privacy_notice_version', 'join-our-team-2026-06-07')
  // The applicant's Turnstile token is NOT sent upstream. It was minted by this
  // site's widget and has already been verified in POST with this site's
  // secret (checkSpamProtection). The management app holds a different widget's
  // secret and checks a token only for callers with no API key, so a forwarded
  // token reaches no valid verifier. This call authenticates with the API key.

  if (cvFile && cvFile.size > 0) {
    upstreamForm.set('cv', cvFile)
  }

  let lastFailure: Extract<ManagementAttemptResult, { state: 'retryable' }> | null = null

  for (const timeoutMs of MANAGEMENT_ATTEMPT_TIMEOUTS_MS) {
    if (lastFailure) {
      await sleep(retryDelayMs(Boolean(lastFailure.inProgress)))
    }

    const result = await attemptManagementApi(
      `${baseUrl}/recruitment/applications`,
      apiKey,
      payload.idempotencyKey,
      upstreamForm,
      timeoutMs
    )

    if (result.state !== 'retryable') {
      return result
    }

    lastFailure = result
  }

  return {
    state: 'infrastructure_error',
    reason: `${lastFailure?.reason ?? 'Management API request failed'} (after ${MANAGEMENT_ATTEMPT_TIMEOUTS_MS.length} attempts)`,
    possibleDuplicate: lastFailure?.possibleDuplicate ?? false,
    status: lastFailure?.status,
  }
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
  const page = pageFromRequest(request)
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
      jobPostingId: asTrimmedString(formData.get('job_posting_id')) || undefined,
      jobSlug: asTrimmedString(formData.get('job_slug')) || undefined,
      experience: asTrimmedString(formData.get('experience')),
      fit: asTrimmedString(formData.get('fit')),
      availability,
      travel: asTrimmedString(formData.get('travel')),
      relevantExperience: asTrimmedString(formData.get('relevantExperience')),
      startDate: asTrimmedString(formData.get('startDate')),
      consent: asTrimmedString(formData.get('consent')),
      smsConsent: asTrimmedString(formData.get('sms_consent')),
      futureRecruitmentConsent: asTrimmedString(formData.get('future_recruitment_consent')),
      idempotencyKey: asTrimmedString(formData.get('idempotency_key')) || randomUUID(),
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

    const proxyResult = await proxyToManagementApi(payload, cvFile instanceof File ? cvFile : null)
    if (proxyResult.state === 'success') {
      return NextResponse.json({ success: true, source: 'management', data: proxyResult.response })
    }

    if (proxyResult.state === 'validation_error') {
      await reportFailure({ route: ROUTE, kind: 'refused', status: proxyResult.status, reason: 'VALIDATION_ERROR', page })
      return NextResponse.json(
        { success: false, error: proxyResult.error },
        { status: proxyResult.status }
      )
    }

    // Everything from here is a fault on our side. It is reported, the
    // application goes to the manager by email with the CV, and the applicant
    // gets the standard answer. `reason` holds upstream text for the email
    // only; the report takes the status and a fixed code.
    const upstreamStatus = typeof proxyResult.status === 'number' ? proxyResult.status : null
    await reportFailure({
      route: ROUTE,
      status: upstreamStatus,
      reason: upstreamStatus === null ? 'NO_RESPONSE_OR_NOT_CONFIGURED' : 'UPSTREAM_NOT_OK',
      page
    })

    const graphUser = process.env.MICROSOFT_USER_EMAIL
    if (!graphUser) {
      await reportFailure({ route: ROUTE, status: upstreamStatus, reason: 'APPLICATION_LOST_EMAIL_NOT_CONFIGURED', page })
      return NextResponse.json(
        { success: false, error: GUEST_FALLBACK.job_application },
        { status: 500 }
      )
    }

    const { subject, htmlContent } = buildEmailContent(payload, {
      possibleDuplicate: proxyResult.possibleDuplicate,
      fallbackReason: proxyResult.reason,
    })
    const accessToken = await getMicrosoftGraphToken()

    await sendMicrosoftGraphEmail(accessToken, {
      to: process.env.RECRUITMENT_APPLICATION_TO || DEFAULT_TO,
      fromUser: graphUser,
      subject,
      htmlContent,
      replyTo: payload.email,
      attachments: cvAttachment ? [cvAttachment] : undefined
    })

    return NextResponse.json({ success: true, source: 'email_fallback', possibleDuplicate: proxyResult.possibleDuplicate })
  } catch (error) {
    // Reached when the fallback email itself fails, among other things, so
    // this can be an application that reached nobody.
    await reportFailure({ route: ROUTE, status: null, reason: 'UNEXPECTED_ERROR', page, error })
    return NextResponse.json(
      { success: false, error: GUEST_FALLBACK.job_application },
      { status: 500 }
    )
  }
}
