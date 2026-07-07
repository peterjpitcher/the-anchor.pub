import { createHash } from 'crypto'
import type { NextRequest } from 'next/server'

/**
 * Advanced-matching signals for Meta Conversions API forwarding.
 *
 * Only SHA-256 digests ever leave this module — raw email/phone values are
 * hashed in place and never added to the conversion payload. Callers must
 * consent-gate these exactly like fbp/fbc/client_user_agent.
 */

function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

/** Meta email normalisation: trimmed and lowercased before hashing. */
export function hashEmailForMeta(email: string | null | undefined): string | null {
  const normalised = email?.trim().toLowerCase()
  if (!normalised || !normalised.includes('@')) return null
  return sha256Hex(normalised)
}

/**
 * Meta phone normalisation: digits only with country code, no leading zeros,
 * "+" or "00" prefix. UK default country code matches the booking forms.
 */
export function hashPhoneForMeta(
  phone: string | null | undefined,
  defaultCountryCode: string | undefined = '44'
): string | null {
  // Defence in depth: routes validate default_country_code as 1-4 digits, but a
  // malformed code must never produce a garbage hash — fall back to UK.
  const countryCode = defaultCountryCode && /^\d{1,4}$/.test(defaultCountryCode)
    ? defaultCountryCode
    : '44'
  let digits = phone?.replace(/\D/g, '') ?? ''
  if (digits.startsWith('00')) {
    digits = digits.slice(2)
  } else if (digits.startsWith('0')) {
    digits = `${countryCode}${digits.slice(1)}`
  }
  if (digits.length < 7) return null
  return sha256Hex(digits)
}

/** Booker IP as seen by this server — first x-forwarded-for hop, then x-real-ip. */
export function getClientIpAddress(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (forwarded) return forwarded
  return request.headers.get('x-real-ip')?.trim() || null
}
