'use client'

import {
  GUEST_COMPACT_CONSENT_NOTICE,
  GUEST_MARKETING_EMAIL_LABEL,
  GUEST_MARKETING_SMS_LABEL,
  GUEST_MARKETING_WHATSAPP_LABEL,
  GUEST_SERVICE_CONTACT_NOTICE,
  GUEST_WHATSAPP_SERVICE_LABEL,
  type CommunicationConsentState,
} from '@/lib/communication-consent'

type CommunicationConsentFieldsProps = {
  value: CommunicationConsentState
  onChange: (next: CommunicationConsentState) => void
  /**
   * 'checkboxes' (default) asks for explicit consent per channel. Keep it on
   * journeys where soft opt-in does not obviously apply, such as parking and
   * private hire enquiries.
   *
   * 'compact' renders a single line of small print instead, for event bookings
   * where PECR soft opt-in already permits inviting a past guest to the next
   * similar night. See GUEST_COMPACT_CONSENT_NOTICE for the reasoning.
   */
  variant?: 'checkboxes' | 'compact'
  /**
   * Overrides the compact notice wording. Table bookings pass
   * GUEST_TABLE_COMPACT_CONSENT_NOTICE, which covers email as well as SMS and names the
   * unsubscribe link. Ignored by the 'checkboxes' variant.
   */
  notice?: string
}

export function CommunicationConsentFields({
  value,
  onChange,
  variant = 'checkboxes',
  notice,
}: CommunicationConsentFieldsProps) {
  const update = (key: keyof CommunicationConsentState, checked: boolean) => {
    onChange({ ...value, [key]: checked })
  }

  if (variant === 'compact') {
    // No inputs, so no consent flags are set here. Reach is governed by the
    // absence of marketing_sms_opted_out_at, not by a tick, which keeps the
    // stored record honest: we never claim someone said yes when they were
    // simply never asked.
    return (
      <p className="text-xs leading-relaxed text-ink-muted">
        {notice ?? GUEST_COMPACT_CONSENT_NOTICE}
      </p>
    )
  }

  return (
    <div className="space-y-3 rounded-md border border-line bg-surface-sunk p-4">
      <p className="text-sm text-ink-muted">{GUEST_SERVICE_CONTACT_NOTICE}</p>

      <div className="space-y-2">
        <ConsentCheckbox
          id="marketing_email_opt_in"
          checked={value.marketing_email_opt_in}
          label={GUEST_MARKETING_EMAIL_LABEL}
          onChange={(checked) => update('marketing_email_opt_in', checked)}
        />
        <ConsentCheckbox
          id="marketing_sms_opt_in"
          checked={value.marketing_sms_opt_in}
          label={GUEST_MARKETING_SMS_LABEL}
          onChange={(checked) => update('marketing_sms_opt_in', checked)}
        />
        <ConsentCheckbox
          id="whatsapp_opt_in"
          checked={value.whatsapp_opt_in}
          label={GUEST_WHATSAPP_SERVICE_LABEL}
          onChange={(checked) => update('whatsapp_opt_in', checked)}
        />
        <ConsentCheckbox
          id="marketing_whatsapp_opt_in"
          checked={value.marketing_whatsapp_opt_in}
          label={GUEST_MARKETING_WHATSAPP_LABEL}
          onChange={(checked) => update('marketing_whatsapp_opt_in', checked)}
        />
      </div>
    </div>
  )
}

function ConsentCheckbox({
  id,
  checked,
  label,
  onChange,
}: {
  id: string
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 text-sm text-ink">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-line text-accent focus:ring-accent"
      />
      <span>{label}</span>
    </label>
  )
}
