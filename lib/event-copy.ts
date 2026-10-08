import type { Event } from '@/lib/api'
import { formatEventLocalDate } from '@/lib/event-calendar'
import { normalizeEventStatus } from '@/lib/event-lifecycle'
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
  // Copy typed or pasted into the management app carries typographic
  // apostrophes, so "Don’t miss" walked straight past a pattern written
  // with a straight one (site review finding C2-023).
  const plain = text.replace(/[‘’ʼ]/g, "'")
  // An exclamation mark is sales copy by itself: "Enjoy a thrilling Cash Bingo
  // Night at The Anchor with 10 games, great prizes, and a lively atmosphere!"
  // names no verb this list could catch.
  if (plain.includes('!')) return true
  return /\b(get ready|join|book (your|now|online|early|ahead)|don't miss|grab your|get your (tickets?|seats?|places?|table)|secure your|coming up|come (along|down)|see you (there|then)|this (friday|saturday|sunday|monday|tuesday|wednesday|thursday))\b/i.test(
    plain,
  )
}

/**
 * How a night that did not run is described, or null for one that did (or may
 * yet). A cancelled night never "took place", whether its date has passed or
 * not, and nor did a postponed one whose listed date has gone.
 */
function getDidNotRunWord(
  event: Pick<Event, 'event_status' | 'eventStatus'>,
  hasEnded: boolean,
): 'cancelled' | 'postponed' | null {
  const status = normalizeEventStatus(event)
  if (status === 'cancelled') return 'cancelled'
  if (status === 'postponed' && hasEnded) return 'postponed'
  return null
}

/**
 * A category name that reads properly in front of the word "dates".
 *
 * Category names are typed in the management app as headings: "Quiz Night",
 * "Music Bingo", but also "Parties", "Celebrations" and "Tasting Nights".
 * "See upcoming Parties dates" and "The next Parties is" both reached served
 * pages (site review finding C2-040). A plural heading returns null and the
 * caller says something that needs no category at all.
 */
export function getEventCategoryModifier(
  category: { name?: string | null } | null | undefined,
): string | null {
  const name = category?.name?.trim()
  if (!name || /s$/i.test(name)) return null
  return name
}

/** Cuts at the last whole word that fits, so a lead never ends "and e…". */
function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text
  const slice = text.slice(0, max - 1)
  const lastSpace = slice.lastIndexOf(' ')
  const cut = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice
  return `${cut.replace(/[\s,;:.-]+$/, '')}…`
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

  // Asked first, and whatever the date: a cancelled night that is still in the
  // future used to fall through to the live booking statement, and a past one
  // to "took place" (site review finding C2-008).
  const didNotRun = getDidNotRunWord(event, hasEnded)
  if (didNotRun) {
    const dueOn = eventDateLabel(event)
    return `${event.name} was ${didNotRun}.${dueOn ? ` It was due on ${dueOn}.` : ''}`
  }

  if (!hasEnded) return liveStatement

  if (summary && !readsAsInvitation(summary)) {
    return truncateAtWord(summary, 160)
  }

  const date = eventDateLabel(event)
  return `${event.name} took place at The Anchor${date ? ` on ${date}` : ''}.`
}

/**
 * The stored one-line summary of a finished night, for a listing card, or null
 * when that summary is an invitation and so cannot stand under a past date.
 *
 * The page hero has its own "took place" fallback; a card already prints the
 * date and the name, so its caller supplies a plain line of its own instead.
 */
export function getEndedEventSummary(
  event: Pick<Event, 'shortDescription' | 'brief' | 'description'>,
): string | null {
  // The short description first. On a full record `brief` is the long
  // internal briefing, headings and all; a list record does not carry it.
  const summary = event.shortDescription || event.brief || event.description || null
  if (!summary || readsAsInvitation(summary)) return null
  return truncateAtWord(summary, 160)
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
  const didNotRun = getDidNotRunWord(event, hasEnded)
  if (!hasEnded && !didNotRun) {
    return event.metaDescription || event.shortDescription || event.description || liveFallback
  }

  const date = eventDateLabel(event)
  const categoryName = getEventCategoryModifier(event.category)
  const onward = categoryName ? ` See upcoming ${categoryName} dates.` : ' See what is coming up.'

  // A cancelled or postponed night gets the same shape of line, without the
  // claim that it happened.
  if (didNotRun) {
    const cancelledTail = ` was ${didNotRun}.${date ? ` It was due on ${date}.` : ''}${onward}`
    const cancelledRoom = 160 - cancelledTail.length
    const cancelledName =
      event.name.length > cancelledRoom
        ? `${event.name.slice(0, Math.max(0, cancelledRoom - 1)).trimEnd()}…`
        : event.name
    return `${cancelledName}${cancelledTail}`
  }

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

  const didNotRun = getDidNotRunWord(event, hasEnded)

  // A night that did not run keeps its stored description only while that
  // description is not an invitation: the original details may stay on a
  // cancelled event, a call to book it may not.
  if (stored && !((hasEnded || didNotRun) && readsAsInvitation(stored))) return stored

  if (didNotRun) {
    const dueOn = eventDateLabel(event)
    return `${event.name} at The Anchor in Stanwell Moor was ${didNotRun}.${dueOn ? ` It was due on ${dueOn}.` : ''}`
  }

  if (hasEnded) {
    const date = eventDateLabel(event)
    return `${event.name} took place at The Anchor in Stanwell Moor${date ? ` on ${date}` : ''}.`
  }

  return `Join us for ${event.name} at The Anchor in Stanwell Moor. Experience great food, drinks and entertainment in a welcoming atmosphere.`
}
