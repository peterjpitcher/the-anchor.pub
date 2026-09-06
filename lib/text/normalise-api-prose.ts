/**
 * Em dash removal for prose that arrives from the management API.
 *
 * "No em dashes in customer-facing text" is a house rule (docs/SSOT.md, Voice
 * and punctuation), and the write hooks enforce it on every file this repo
 * owns. Event copy is not written here: descriptions, highlights and FAQ
 * answers are typed into the management app and arrive over the API, so nothing
 * stopped an em dash reaching a page. On 6 September 2026 the served HTML of
 * /events/detention-disco-back-to-school-music-bingo-2026-09-11 carried 16 of
 * them, including inside the JSON-LD description.
 *
 * This module is the boundary that fixes that, and it normalises NAMED PROSE
 * FIELDS ONLY. It must never be pointed at a serialised payload, a URL, a slug,
 * an identifier or an ISO timestamp: a blanket replace across serialised output
 * would rewrite characters inside links and JSON-LD, which is a worse defect
 * than the punctuation it set out to fix. The guards below refuse those inputs
 * even when a caller passes one by mistake, and HTML tags and URLs embedded in
 * prose are stepped over rather than edited, so existing sanitisation and
 * escaping come out the other side byte for byte.
 *
 * Only the em dash (U+2014) is replaced. The en dash (U+2013) is left alone:
 * the house rule bans em dashes only, and the en dash carries ranges in shipped
 * copy (see components/WeekHours.tsx), where a comma would be a corruption.
 */

/**
 * U+2014, built from its code point so this file never contains the character
 * it exists to remove. Typing the literal here would trip the write hook.
 */
const EM_DASH = String.fromCharCode(0x2014)

/**
 * Whitespace that is not a line break. The replace hugs the dash with this
 * rather than \s so paragraph breaks and bulleted lines survive intact.
 */
const HORIZONTAL_SPACE = '[^\\S\\r\\n]'

/**
 * Either a segment to step over, or an em dash run to replace.
 *
 * Group one is the protected segment: an HTML tag, so attribute values and
 * their escaping are preserved exactly, or anything URL shaped, because a dash
 * inside an address is part of the address. A URL run deliberately extends to
 * the next space, so a dash sitting flush against the end of a URL is left
 * alone; leaving one em dash on a page is a smaller failure than breaking a
 * link.
 *
 * Group two is a run of one or more em dashes plus any horizontal space either
 * side. Both alternatives live in one pass so the replacer can read the
 * characters either side of a dash from the whole value, even where the dash
 * butts up against a protected segment.
 */
const PROTECTED_SEGMENT_OR_EM_DASH_RUN = new RegExp(
  `(<[^>]*>|(?:https?:\\/\\/|www\\.|mailto:|tel:)\\S+)|(${HORIZONTAL_SPACE}*${EM_DASH}+${HORIZONTAL_SPACE}*)`,
  'gi',
)

/** Openers that should sit flush against the following word. */
const OPENING_BEFORE = /[([{]/

/** Punctuation that already does the joining work a comma would do. */
const CLAUSE_BEFORE = /[,;:]/

/** Punctuation that must not be pushed away from the word it belongs to. */
const CLOSING_AFTER = /[.,;:!?)\]}]/

/** A whole HTML document, which is never a prose field. */
const HTML_DOCUMENT = /^\s*(<!doctype html|<html[\s>])/i

/** The FAQ shape the management API sends, question and answer text only. */
export interface ProseFaqEntry {
  name: string
  acceptedAnswer: { text: string }
}

/**
 * The event fields that are prose, and therefore the only string fields
 * normaliseEventProse() will touch. Everything else on an event, id, slug, url,
 * startDate, keywords, image paths, is left exactly as the API sent it.
 */
export const NORMALISED_PROSE_FIELDS = [
  'brief',
  'description',
  'shortDescription',
  'longDescription',
  'about',
  'disambiguatingDescription',
  'metaDescription',
  'image_alt_text',
] as const

/**
 * Whether a value is prose at all.
 *
 * A value with no whitespace anywhere is a URL, a slug, an identifier or an ISO
 * timestamp, never a sentence, so punctuation inside it is structural and must
 * survive. A value that parses as a JSON object or array is a serialised
 * payload someone has passed by mistake.
 */
function isNormalisableProse(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  if (!/\s/.test(trimmed)) return false
  if (looksLikeSerialisedJson(trimmed)) return false
  if (HTML_DOCUMENT.test(trimmed)) return false
  return true
}

/**
 * Only objects and arrays are treated as serialised payloads. A bare JSON
 * string is indistinguishable from prose wrapped in quotation marks, and a
 * quoted testimonial is exactly the sort of copy this module exists to clean.
 */
function looksLikeSerialisedJson(trimmed: string): boolean {
  const first = trimmed.charAt(0)
  if (first !== '{' && first !== '[') return false
  try {
    JSON.parse(trimmed)
    return true
  } catch {
    return false
  }
}

/**
 * Swap each em dash run for a comma, or for nothing where a comma would read
 * as a typo.
 *
 * A comma is the agreed default (docs/SSOT.md). No attempt is made to recase
 * the following word or to rewrite the sentence: anything beyond the comma is
 * an editorial decision, not a mechanical one.
 */
function replaceEmDashRuns(value: string): string {
  return value.replace(
    PROTECTED_SEGMENT_OR_EM_DASH_RUN,
    (
      match: string,
      protectedSegment: string | undefined,
      dashRun: string | undefined,
      offset: number,
      whole: string,
    ): string => {
      if (protectedSegment !== undefined) return protectedSegment

      const before = offset > 0 ? whole.charAt(offset - 1) : ''
      const after = whole.charAt(offset + match.length)

      // A dash opening or closing the value, or sitting alone on a line, is
      // decoration rather than punctuation. There is nothing to join.
      if (!before || before === '\n' || before === '\r') return ''
      if (!after || after === '\n' || after === '\r') return ''

      // "(quiz night)" style openers keep their word flush.
      if (OPENING_BEFORE.test(before)) return ''
      // A comma is already there; a second one would read as a stammer.
      if (CLAUSE_BEFORE.test(before)) return ' '
      // Never push a full stop or a closing bracket away from its word.
      if (CLOSING_AFTER.test(after)) return ''

      return ', '
    },
  )
}

/**
 * Normalise one named prose field.
 *
 * Pass a single field value, never a whole payload: description, about, one
 * highlight, one FAQ answer, a meta description you have just derived. Null and
 * undefined pass straight through so callers can wrap an optional field without
 * a guard.
 */
export function normaliseProseField(value: string): string
export function normaliseProseField(value: null): null
export function normaliseProseField(value: undefined): undefined
export function normaliseProseField(value: string | null): string | null
export function normaliseProseField(value: string | undefined): string | undefined
export function normaliseProseField(value: string | null | undefined): string | null | undefined
export function normaliseProseField(value: string | null | undefined): string | null | undefined {
  if (typeof value !== 'string') return value
  if (!value.includes(EM_DASH)) return value
  if (!isNormalisableProse(value)) return value

  return replaceEmDashRuns(value)
}

/**
 * Normalise a list of short prose strings, such as event highlights. Entries
 * that are not strings are handed back untouched.
 */
export function normaliseProseList(values: string[]): string[]
export function normaliseProseList(values: null): null
export function normaliseProseList(values: undefined): undefined
export function normaliseProseList(values: string[] | null): string[] | null
export function normaliseProseList(values: string[] | undefined): string[] | undefined
export function normaliseProseList(values: string[] | null | undefined): string[] | null | undefined
export function normaliseProseList(values: string[] | null | undefined): string[] | null | undefined {
  if (!Array.isArray(values)) return values
  return values.map((entry) => (typeof entry === 'string' ? normaliseProseField(entry) : entry))
}

/**
 * Normalise the question and answer text of a FAQ list, leaving '@type' and any
 * other key the API sends exactly as it was.
 */
export function normaliseFaqProse<T extends ProseFaqEntry>(faqs: T[]): T[]
export function normaliseFaqProse<T extends ProseFaqEntry>(
  faqs: T[] | null | undefined,
): T[] | null | undefined
export function normaliseFaqProse<T extends ProseFaqEntry>(
  faqs: T[] | null | undefined,
): T[] | null | undefined {
  if (!Array.isArray(faqs)) return faqs

  return faqs.map((faq) => {
    if (!faq || typeof faq !== 'object') return faq

    const answer = faq.acceptedAnswer
    const hasAnswerText = Boolean(answer) && typeof answer.text === 'string'

    // The spread keeps every other key. TypeScript cannot prove that a spread
    // with overrides is still T, hence the assertion: the shape is unchanged
    // and only two strings differ.
    return {
      ...faq,
      name: typeof faq.name === 'string' ? normaliseProseField(faq.name) : faq.name,
      ...(hasAnswerText
        ? { acceptedAnswer: { ...answer, text: normaliseProseField(answer.text) } }
        : {}),
    } as T
  })
}

/**
 * Normalise every prose field on an event object in one call, for wiring at the
 * point an event is rendered.
 *
 * Deliberately allow listed: only the keys in NORMALISED_PROSE_FIELDS, plus
 * highlights and the two FAQ shapes, are considered. Identifiers, slugs, URLs
 * and dates are copied across untouched even though they are strings on the
 * same object.
 */
export function normaliseEventProse<T extends object>(event: T): T {
  // Cast to a bag of unknowns so the allow list can be applied by name; the
  // return cast puts the original type back on an object of the same shape.
  const next = { ...event } as Record<string, unknown>

  for (const field of NORMALISED_PROSE_FIELDS) {
    const value = next[field]
    if (typeof value === 'string') {
      next[field] = normaliseProseField(value)
    }
  }

  const highlights = next.highlights
  if (Array.isArray(highlights)) {
    next.highlights = normaliseProseList(highlights as string[])
  }

  const faq = next.faq
  if (Array.isArray(faq)) {
    next.faq = normaliseFaqProse(faq as ProseFaqEntry[])
  }

  const faqPage = next.faqPage as { mainEntity?: unknown } | null | undefined
  if (faqPage && typeof faqPage === 'object' && Array.isArray(faqPage.mainEntity)) {
    next.faqPage = {
      ...faqPage,
      mainEntity: normaliseFaqProse(faqPage.mainEntity as ProseFaqEntry[]),
    }
  }

  return next as T
}
