import { patterns } from '@/lib/form-validation'

/**
 * Which phone numbers the management app can text, and what a guest is told
 * when theirs is not one of them.
 *
 * The management app only texts UK mobiles. A guest who books with a landline
 * or an overseas number and leaves no email gets no confirmation at all (review
 * BK-162), so the table, event and waitlist routes there now refuse that
 * combination with EMAIL_REQUIRED_FOR_NON_MOBILE. The forms ask for the email
 * before they send anything, and map that code to the same words beside the
 * email box in case the two ends ever disagree about a number.
 */

/** The code the management app answers with (HTTP 400). */
export const EMAIL_REQUIRED_FOR_NON_MOBILE_CODE = 'EMAIL_REQUIRED_FOR_NON_MOBILE'

/** Beside the email box on a form that has one. */
export const NON_UK_MOBILE_EMAIL_REQUIRED_MESSAGE =
  'We can only text UK mobile numbers, so please add an email for your confirmation.'

/** Beside the phone box on the quick-book sheet, which has no email box. */
export const QUICK_BOOK_NON_UK_MOBILE_MESSAGE =
  'We can only text UK mobile numbers. Please use the full booking form so you can add an email for your confirmation.'

/**
 * True when the typed number is a UK mobile, the only kind the management app
 * can text.
 *
 * Normalised the way the management app normalises a number before it stores
 * it (src/lib/phone/index.ts there): everything but digits and a leading plus
 * is dropped, 00 becomes +, a number starting 44 gains a plus, and a leading 0
 * or a bare number is taken as UK. The result is then tested against the
 * site's existing UK mobile pattern. "+44 (0)7700 900123" is accepted too: the
 * stray trunk zero is common, and being looser than the management app costs
 * nothing, because it re-checks and the forms map its answer.
 *
 * Says nothing about whether a number is valid, only whether it is a UK
 * mobile, so a form that already accepts overseas numbers keeps accepting them.
 */
export function isUkMobileNumber(value: string): boolean {
  let cleaned = value.trim().replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
  if (!cleaned) return false
  if (cleaned.startsWith('00')) cleaned = `+${cleaned.slice(2)}`

  let candidate: string
  if (cleaned.startsWith('+')) candidate = cleaned
  else if (cleaned.startsWith('44')) candidate = `+${cleaned}`
  else if (cleaned.startsWith('0')) candidate = `+44${cleaned.replace(/^0+/, '')}`
  else candidate = `+44${cleaned}`

  return patterns.ukPhone.test(candidate.replace(/^\+440/, '+44'))
}

/**
 * True when a website route's answer carries the management app's code for a
 * number it cannot text with no email beside it. Read from either place the
 * routes put a code.
 */
export function isEmailRequiredForNonMobileAnswer(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false
  const record = body as { code?: unknown; error?: unknown }
  const error = record.error && typeof record.error === 'object' ? (record.error as { code?: unknown }) : null
  return record.code === EMAIL_REQUIRED_FOR_NON_MOBILE_CODE || error?.code === EMAIL_REQUIRED_FOR_NON_MOBILE_CODE
}
