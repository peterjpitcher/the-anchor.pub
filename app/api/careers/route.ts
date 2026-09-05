import { NextRequest, NextResponse } from 'next/server'
import { checkSpamProtection } from '@/lib/spam-protection'
import { logError } from '@/lib/error-handling'
import {
  escapeHtml,
  sendMicrosoftGraphEmail,
  type GraphMailAttachment,
} from '@/lib/microsoft-graph-mail'
import {
  CAREERS_CV_MAX_BYTES,
  CAREERS_CV_ALLOWED_EXTENSIONS,
  CAREERS_CV_ALLOWED_MIMES,
  CAREERS_FORM_ROLES,
} from '@/lib/careers'

export const runtime = 'nodejs'

const ROLE_LABELS: Record<string, string> = {
  'bar-staff': 'Bar Staff',
  'kitchen-team': 'Kitchen Team',
  'either': 'Bar Staff or Kitchen Team',
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// The application only exists as an email. If the send fails there is no record
// of it anywhere, so the applicant must be told plainly and given a way to
// reach us rather than being left to assume it arrived.
const APPLICATION_FAILED_MESSAGE =
  'We could not send your application. Please try again, or call us on 01753 682707 and we will take your details.'

function sanitiseFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-]/g, '_')
}

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1) return ''
  return filename.slice(lastDot).toLowerCase()
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData()

    // Extract text fields
    const name = formData.get('name') as string | null
    const email = formData.get('email') as string | null
    const phone = formData.get('phone') as string | null
    const role = formData.get('role') as string | null
    const experience = formData.get('experience') as string | null
    const consent = formData.get('consent') as string | null
    const turnstileToken = formData.get('turnstile_token') as string | null
    const timingField = formData.get('_t') as string | null
    const website = formData.get('website') as string | null

    // Build plain object for spam protection
    // Critical: convert _t from string to number before calling checkSpamProtection
    const bodyRecord: Record<string, unknown> = {
      name,
      email,
      phone,
      role,
      experience,
      consent,
      turnstile_token: turnstileToken,
      _t: timingField ? Number(timingField) : null,
      website,
    }

    // Spam protection, do NOT pass skipTurnstile
    const spam = await checkSpamProtection(request, bodyRecord)
    if (spam.blocked) return spam.response!

    // Validate required fields
    if (!name || !email || !phone || !role || !experience) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required fields.' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    // Validate role is in the allowlist
    if (!(CAREERS_FORM_ROLES as readonly string[]).includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Please select a valid role.' },
        { status: 400 }
      )
    }

    // Validate consent
    if (consent !== 'true' && consent !== 'on') {
      return NextResponse.json(
        { success: false, error: 'You must consent to data processing to submit your application.' },
        { status: 400 }
      )
    }

    // Handle optional CV file
    let cvAttachment: GraphMailAttachment | undefined
    const cvFile = formData.get('cv') as File | null

    if (cvFile && cvFile.size > 0) {
      // Check file extension
      const extension = getFileExtension(cvFile.name)
      if (!CAREERS_CV_ALLOWED_EXTENSIONS.includes(extension)) {
        return NextResponse.json(
          { success: false, error: 'CV must be a PDF, DOC, or DOCX file.' },
          { status: 400 }
        )
      }

      // Check MIME type when available
      if (cvFile.type && !CAREERS_CV_ALLOWED_MIMES.includes(cvFile.type)) {
        return NextResponse.json(
          { success: false, error: 'CV file type is not supported. Please upload a PDF, DOC, or DOCX file.' },
          { status: 400 }
        )
      }

      // Check file size
      if (cvFile.size > CAREERS_CV_MAX_BYTES) {
        return NextResponse.json(
          { success: false, error: 'CV file is too large. Maximum size is 20 MB.' },
          { status: 400 }
        )
      }

      // Sanitise filename and convert to base64
      const sanitisedName = sanitiseFilename(cvFile.name)
      const fileBuffer = Buffer.from(await cvFile.arrayBuffer())
      const contentBytes = fileBuffer.toString('base64')

      cvAttachment = {
        name: sanitisedName,
        contentType: cvFile.type || 'application/octet-stream',
        contentBytes,
        size: cvFile.size,
      }
    }

    // Check email service configuration
    const graphUser = process.env.MICROSOFT_USER_EMAIL
    if (!graphUser) {
      logError('api/careers', new Error('MICROSOFT_USER_EMAIL is not configured'))
      return NextResponse.json(
        { success: false, error: APPLICATION_FAILED_MESSAGE },
        { status: 500 }
      )
    }

    // Build email content
    const roleLabel = ROLE_LABELS[role] || role
    const subject = `Job Application: ${roleLabel} - ${name}`

    const htmlContent = [
      '<h2>New Job Application</h2>',
      `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
      `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
      `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>`,
      `<p><strong>Role:</strong> ${escapeHtml(roleLabel)}</p>`,
      `<p><strong>Experience:</strong><br/>${escapeHtml(experience).replace(/\n/g, '<br/>')}</p>`,
      `<p><strong>CV attached:</strong> ${cvAttachment ? 'Yes' : 'No'}</p>`,
    ].join('\n')

    const textContent = [
      'New Job Application',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Role: ${roleLabel}`,
      `Experience: ${experience}`,
      `CV attached: ${cvAttachment ? 'Yes' : 'No'}`,
    ].join('\n')

    // Send email
    await sendMicrosoftGraphEmail({
      to: 'manager@the-anchor.pub',
      fromUser: graphUser,
      subject,
      htmlContent,
      textContent,
      replyTo: email,
      attachments: cvAttachment ? [cvAttachment] : undefined,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logError('api/careers', error)
    return NextResponse.json(
      { success: false, error: APPLICATION_FAILED_MESSAGE },
      { status: 500 }
    )
  }
}
