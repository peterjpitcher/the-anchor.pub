import { z } from 'zod'
import {
  COMMUNICATION_CONSENT_NOTICE_KEYS,
  GUEST_COMMS_CONSENT_ACCEPTED_VERSIONS,
  GUEST_COMMS_CONSENT_TEXT_VERSION,
  type CommunicationConsentNoticeKey,
  type CommunicationConsentPayload,
} from '@/lib/communication-consent'

export const CommunicationConsentPayloadSchema = z.object({
  service_contact_notice_shown: z.boolean().optional(),
  marketing_email_opt_in: z.boolean().optional(),
  marketing_sms_opt_in: z.boolean().optional(),
  whatsapp_opt_in: z.boolean().optional(),
  marketing_whatsapp_opt_in: z.boolean().optional(),
  // The current version and the one before it. The version says which words the guest was
  // shown, so the one they sent is passed on as it is, never rewritten to the newest.
  consent_text_version: z.enum(GUEST_COMMS_CONSENT_ACCEPTED_VERSIONS).optional(),
  // Which notice the guest was shown (review BK-080). Accepted as anything here and narrowed
  // below, so an unknown key is dropped rather than costing the guest the whole record.
  notice_key: z.unknown().optional(),
}).strict()

function asNoticeKey(value: unknown): CommunicationConsentNoticeKey | undefined {
  return typeof value === 'string' && (COMMUNICATION_CONSENT_NOTICE_KEYS as readonly string[]).includes(value)
    ? (value as CommunicationConsentNoticeKey)
    : undefined
}

export function sanitizeCommunicationConsent(input: unknown): CommunicationConsentPayload | undefined {
  if (input == null) return undefined

  const parsed = CommunicationConsentPayloadSchema.safeParse(input)
  if (!parsed.success) return undefined

  const noticeKey = asNoticeKey(parsed.data.notice_key)

  return {
    service_contact_notice_shown: parsed.data.service_contact_notice_shown === true,
    marketing_email_opt_in: parsed.data.marketing_email_opt_in === true,
    marketing_sms_opt_in: parsed.data.marketing_sms_opt_in === true,
    whatsapp_opt_in: parsed.data.whatsapp_opt_in === true,
    marketing_whatsapp_opt_in: parsed.data.marketing_whatsapp_opt_in === true,
    consent_text_version: parsed.data.consent_text_version || GUEST_COMMS_CONSENT_TEXT_VERSION,
    // Last, and only when it is one of the four, so a record without one is exactly the
    // shape it always was.
    ...(noticeKey ? { notice_key: noticeKey } : {}),
  }
}

/**
 * A sanitised consent without its notice key, for building an idempotency key. Leaving the
 * notice key out means the same consent gives the same key it gave before notice keys
 * existed, so the keys a route makes do not change across the deploy that added them.
 */
export function consentForIdempotency(
  consent: CommunicationConsentPayload
): Omit<CommunicationConsentPayload, 'notice_key'> {
  const { notice_key: _noticeKey, ...withoutNoticeKey } = consent
  return withoutNoticeKey
}

/** The consent's part of a fallback idempotency key, without the notice key. */
export function communicationConsentIdempotencyPart(input: unknown): string {
  const sanitized = sanitizeCommunicationConsent(input)
  return JSON.stringify(sanitized ? consentForIdempotency(sanitized) : null)
}
