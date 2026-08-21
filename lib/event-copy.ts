import type { Event } from '@/lib/api'
import { formatEventLocalDate } from '@/lib/event-calendar'
import { getEventPresentation } from '@/lib/event-presentation'

/**
 * Copy for an event page, in the right tense.
 *
 * Past event pages are kept live and indexed so their content can accumulate
 * (see tasks/gsc-indexing-fix/url-lifecycle-policy.md §1). That only works if
 * the page reads as a record of a night that happened. The promotional
 * description written to sell tickets is future tense, so inheriting it on a
 * past page produces a search result that says "Book your tickets now!" for a
 * date months gone.
 *
 * The page body, the head, the Open Graph card and the JSON-LD all resolve
 * their copy here, so they cannot drift into different tenses.
 */

/**
 * Questions that only make sense while a night is still bookable.
 *
 * Matched against the question text only, never the answer. Almost every answer
 * mentions a price or the word "book" somewhere, so matching answers too would
 * strip the whole FAQ block, and the FAQs are often the only unique prose on an
 * event page. Past pages are kept precisely so that content can accumulate, so
 * "what time do doors open" and "is it dog friendly" must survive.
 */
const BOOKING_QUESTION_PATTERN =
  /\b(book|booking|reserve|reservation|deposit|refund|cancel|cancellation|pay|payment|sold\s*out|still\s+available|get\s+tickets|buy)\b/i

type FaqLike = { name: string; acceptedAnswer: { text: string } }

/**
 * FAQs to show on an event page. Ended events keep everything except the
 * questions about booking a night that has already happened.
 */
export function getDisplayableFaqs<T extends FaqLike>(faqs: T[], hasEnded: boolean): T[] {
  if (!hasEnded) return faqs
  return faqs.filter((faq) => !BOOKING_QUESTION_PATTERN.test(faq.name || ''))
}

/**
 * Whether a piece of stored copy reads as an invitation to attend.
 *
 * Event copy is written to sell tickets, so on a night that has passed it turns
 * into "Join us for Music Bingo on June 12th! Get ready for big tunes" sitting
 * under a banner that says the event has ended. Used to decide whether stored
 * copy can be reused as-is on an ended page, or whether to fall back to a plain
 * past-tense line.
 */
function readsAsInvitation(text: string): boolean {
  return /\b(get ready|join us|book (your|now|online)|don'?t miss|grab your|secure your|coming up|see you (there|then)|this (friday|saturday|sunday|monday|tuesday|wednesday|thursday))\b/i.test(
    text,
  )
}

/**
 * The lead paragraph in the page hero.
 *
 * This is the largest text on the page after the title, so it is the worst
 * place for the wrong tense. An upcoming event gets its booking statement; an
 * ended one keeps its stored summary only when that summary is not an
 * invitation, and otherwise gets a plain past-tense line.
 */
export function getEventHeroLead(
  event: Pick<
    Event,
    'name' | 'startDate' | 'event_status' | 'eventStatus' | 'category' | 'shortDescription' | 'brief' | 'bookings_enabled' | 'booking_cutoff_at'
  >,
  liveStatement: string
): string | undefined {
  const { hasEnded } = getEventPresentation(event)
  const summary = event.shortDescription || event.brief || null

  if (!hasEnded) return liveStatement

  if (summary && !readsAsInvitation(summary)) {
    return summary.length > 160 ? `${summary.substring(0, 157).trimEnd()}…` : summary
  }

  const date = eventDateLabel(event)
  return `${event.name} took place at The Anchor${date ? ` on ${date}` : ''}.`
}

function eventDateLabel(event: Pick<Event, 'startDate'>): string {
  return (
    formatEventLocalDate(event.startDate, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) || ''
  )
}

/**
 * Meta description for the page head and the Open Graph card.
 *
 * An ended event never inherits `metaDescription` / `shortDescription`, because
 * those are sales copy. It gets a factual past-tense line instead.
 */
export function getEventMetaDescription(
  event: Pick<
    Event,
    'name' | 'startDate' | 'event_status' | 'eventStatus' | 'category' | 'metaDescription' | 'shortDescription' | 'description' | 'bookings_enabled' | 'booking_cutoff_at'
  >,
  liveFallback: string
): string {
  const { hasEnded } = getEventPresentation(event)
  if (!hasEnded) {
    return event.metaDescription || event.shortDescription || event.description || liveFallback
  }

  const date = eventDateLabel(event)
  const categoryName = event.category?.name
  const onward = categoryName ? ` See upcoming ${categoryName} dates.` : ' See what is coming up.'

  // Kept under 160 characters so results are not truncated. Event names run
  // long ("St Patrick's Day / Free Jamesons with First Guinness"), so the
  // name is trimmed rather than the date or the onward link, which are the
  // two parts that actually help someone who has landed on a finished night.
  const tail = ` took place in Stanwell Moor${date ? ` on ${date}` : ''}.${onward}`
  const room = 160 - tail.length
  const name = event.name.length > room ? `${event.name.slice(0, Math.max(0, room - 1)).trimEnd()}\u2026` : event.name

  return `${name}${tail}`
}

/**
 * Description for the Event JSON-LD.
 *
 * `description` is a recommended Event property, so this must stay non-empty.
 * It simply must not invite anyone to a night that has already happened.
 */
export function getEventSchemaDescription(
  event: Pick<
    Event,
    'name' | 'startDate' | 'event_status' | 'eventStatus' | 'category' | 'longDescription' | 'about' | 'description' | 'shortDescription' | 'bookings_enabled' | 'booking_cutoff_at'
  >
): string {
  const { hasEnded } = getEventPresentation(event)
  const stored =
    event.longDescription || event.about || event.description || event.shortDescription

  if (stored && !(hasEnded && readsAsInvitation(stored))) return stored

  if (hasEnded) {
    const date = eventDateLabel(event)
    return `${event.name} took place at The Anchor in Stanwell Moor${date ? ` on ${date}` : ''}.`
  }

  return `Join us for ${event.name} at The Anchor in Stanwell Moor. Experience great food, drinks and entertainment in a welcoming atmosphere.`
}
