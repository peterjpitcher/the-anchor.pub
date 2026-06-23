export const GUEST_COMMS_CONSENT_TEXT_VERSION = 'guest-comms-consent-v1'

export const GUEST_SERVICE_CONTACT_NOTICE =
  'We will use your phone and email to manage this booking, including confirmations, reminders, payment links, waitlist updates, and changes.'

export const GUEST_MARKETING_EMAIL_LABEL = 'Email me about future events and offers.'
export const GUEST_MARKETING_SMS_LABEL = 'Text me about future events and offers.'
export const GUEST_WHATSAPP_SERVICE_LABEL = 'Send booking updates by WhatsApp.'
export const GUEST_MARKETING_WHATSAPP_LABEL = 'Send me WhatsApp event and offer updates.'

export type CommunicationConsentPayload = {
  service_contact_notice_shown: boolean
  marketing_email_opt_in: boolean
  marketing_sms_opt_in: boolean
  whatsapp_opt_in: boolean
  marketing_whatsapp_opt_in: boolean
  consent_text_version: string
}

export type CommunicationConsentState = Omit<
  CommunicationConsentPayload,
  'service_contact_notice_shown' | 'consent_text_version'
>

export const DEFAULT_COMMUNICATION_CONSENT_STATE: CommunicationConsentState = {
  marketing_email_opt_in: false,
  marketing_sms_opt_in: false,
  whatsapp_opt_in: false,
  marketing_whatsapp_opt_in: false,
}

export function buildCommunicationConsentPayload(
  state: CommunicationConsentState
): CommunicationConsentPayload {
  return {
    service_contact_notice_shown: true,
    marketing_email_opt_in: state.marketing_email_opt_in === true,
    marketing_sms_opt_in: state.marketing_sms_opt_in === true,
    whatsapp_opt_in: state.whatsapp_opt_in === true,
    marketing_whatsapp_opt_in: state.marketing_whatsapp_opt_in === true,
    consent_text_version: GUEST_COMMS_CONSENT_TEXT_VERSION,
  }
}
