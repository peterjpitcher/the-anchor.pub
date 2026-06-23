import { z } from 'zod'
import {
  GUEST_COMMS_CONSENT_TEXT_VERSION,
  type CommunicationConsentPayload,
} from '@/lib/communication-consent'

export const CommunicationConsentPayloadSchema = z.object({
  service_contact_notice_shown: z.boolean().optional(),
  marketing_email_opt_in: z.boolean().optional(),
  marketing_sms_opt_in: z.boolean().optional(),
  whatsapp_opt_in: z.boolean().optional(),
  marketing_whatsapp_opt_in: z.boolean().optional(),
  consent_text_version: z.literal(GUEST_COMMS_CONSENT_TEXT_VERSION).optional(),
}).strict()

export function sanitizeCommunicationConsent(input: unknown): CommunicationConsentPayload | undefined {
  if (input == null) return undefined

  const parsed = CommunicationConsentPayloadSchema.safeParse(input)
  if (!parsed.success) return undefined

  return {
    service_contact_notice_shown: parsed.data.service_contact_notice_shown === true,
    marketing_email_opt_in: parsed.data.marketing_email_opt_in === true,
    marketing_sms_opt_in: parsed.data.marketing_sms_opt_in === true,
    whatsapp_opt_in: parsed.data.whatsapp_opt_in === true,
    marketing_whatsapp_opt_in: parsed.data.marketing_whatsapp_opt_in === true,
    consent_text_version: parsed.data.consent_text_version || GUEST_COMMS_CONSENT_TEXT_VERSION,
  }
}

export function communicationConsentIdempotencyPart(input: unknown): string {
  return JSON.stringify(sanitizeCommunicationConsent(input) || null)
}
