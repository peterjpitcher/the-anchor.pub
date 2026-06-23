'use client'

import {
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
}

export function CommunicationConsentFields({ value, onChange }: CommunicationConsentFieldsProps) {
  const update = (key: keyof CommunicationConsentState, checked: boolean) => {
    onChange({ ...value, [key]: checked })
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
