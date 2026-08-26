import type { Event } from '@/lib/api/events'
import { normalizeEventStatus, isEventInPast } from '@/lib/event-lifecycle'

/**
 * How long a past event counts as "recent" for presentation purposes: the
 * /whats-on recent archive, and the wording on the event page itself.
 *
 * This is NOT an indexability threshold. Past events stay indexed indefinitely.
 * It was previously named PAST_EVENT_REDIRECT_DAYS, when crossing it retired
 * the page.
 *
 * Single source of truth: lib/api/events.ts imports this rather than declaring
 * its own 30, so the listing window and the page wording cannot drift apart.
 */
export const RECENT_EVENT_WINDOW_DAYS = 30
export const CANCELLED_INDEX_DAYS = 7

/**
 * Formats the SSOT says are discontinued and must not be promoted.
 *
 * Keeping past events indexed is good for formats that still run: each night
 * adds to what the site can rank for. It is not good for a format that has
 * stopped, because the page can start ranking and bring people in for
 * something they cannot come to.
 *
 * docs/SSOT.md §"Nikki's Games Night": "Do not promote Nikki hosted/games
 * nights as a recurring format. Nikki currently hosts Music Bingo only."
 *
 * docs/SSOT.md §"Retired entertainment formats": drag cabaret has stopped, and
 * Music Bingo is now the only drag night. The three past "Drag Cabaret &
 * Karaoke" events already fall out of the index because they sit under the
 * "Nikki's Games Night" category, but that is incidental: the token below is
 * what actually encodes the policy, so a new drag cabaret event filed under a
 * karaoke category cannot quietly start ranking.
 *
 * Deliberately 'drag cabaret', not 'drag'. Music Bingo copy refers to its drag
 * host and must stay indexable.
 *
 * docs/SSOT.md §"Live Music, DISCONTINUED" (owner-confirmed 11 August 2026):
 * live music has stopped in full, no bands, no acoustic sets, no tribute acts.
 * Past live music pages are the clearest case this list exists for, because
 * "live music near Heathrow" is exactly the sort of query they can win and
 * exactly the visit nobody can now make. Deliberately 'live music' only, not
 * 'band' or 'acoustic': those words turn up in copy for nights that still run.
 *
 * Open mic is the other retired format, handled separately by isRetiredEvent()
 * because that route 301s rather than staying live. A games night has no
 * equivalent, so the page stays live for anyone with the link and is simply
 * kept out of search (policy case E).
 */
const DISCONTINUED_FORMATS: ReadonlyArray<{
  token: string
  /** Where to send anyone who lands on the page anyway. */
  replacement: string
  replacementLabel: string
  /** Must be supportable by docs/SSOT.md, it is customer-facing copy. */
  replacementCopy: string
}> = [
  {
    token: 'games night',
    replacement: '/music-bingo',
    replacementLabel: 'See Music Bingo dates',
    // SSOT: "Nikki currently hosts Music Bingo only."
    replacementCopy: 'This night is no longer running. Nikki hosts Music Bingo now.',
  },
  {
    token: 'drag cabaret',
    replacement: '/music-bingo',
    replacementLabel: 'See Music Bingo dates',
    // SSOT: "Music Bingo is the only drag night."
    replacementCopy: 'This night is no longer running. Music Bingo is our drag night now.',
  },
  {
    token: 'live music',
    // No equivalent format replaced it, so this is the one case that genuinely
    // points at the general listing rather than a like-for-like night.
    replacement: '/whats-on',
    replacementLabel: 'See what is on',
    // SSOT: "Live music is discontinued in full." Says what stopped and stops
    // there, because nothing took its place.
    replacementCopy: 'This night is no longer running. We no longer host live music.',
  },
]

/**
 * Claims docs/SSOT.md §14 verifies as factually false about the venue.
 *
 * Keeping past events indexed means event copy written months ago now competes
 * in search indefinitely. Several past events carry facility claims the SSOT
 * marks "verified NO", so this guard keeps those pages out of the index until
 * the copy is corrected in the management app.
 *
 * Deliberately narrow: only unambiguous, verified-false statements of fact,
 * where a false positive merely costs one page its ranking. Judgement calls
 * such as unsubstantiated "best" superlatives, retired roast pre-order wording
 * and forward-looking mulled wine are NOT here. They need a human editing the
 * source copy, and over-broad pattern matching would quietly deindex good
 * pages. (The SSOT expressly permits a historical mulled wine mention in a
 * dated recap, which is exactly what a past event page is.)
 *
 * This is a safety net, not a fix. The copy lives in the management database.
 */
const BANNED_FACTUAL_CLAIMS: ReadonlyArray<{ pattern: RegExp; claim: string }> = [
  { pattern: /accessible\s+toilet/i, claim: 'accessible toilet (SSOT: verified NO)' },
  { pattern: /\bgluten[-\s]?free\b/i, claim: 'gluten-free (SSOT: regulated term, use NGCI)' },
  { pattern: /baby[-\s]?changing/i, claim: 'baby changing (SSOT: verified NO)' },
  { pattern: /air[-\s]?condition(ed|ing)|climate[-\s]?controlled/i, claim: 'air conditioning (SSOT: verified NO)' },
  { pattern: /wedding\s+reception/i, claim: 'wedding receptions (SSOT: not offered)' },
  { pattern: /champions\s+league/i, claim: 'Champions League (SSOT: cannot show, no Sky/TNT)' },
  { pattern: /\b(sky|tnt)\s+sports\b/i, claim: 'Sky/TNT Sports (SSOT: terrestrial only)' },
]

type BannedClaimFields = Partial<
  Pick<Event, 'name' | 'description' | 'shortDescription' | 'longDescription' | 'about' | 'highlights'>
>

/**
 * Deliberately excludes `accessibility_notes`.
 *
 * That field is populated from the event-category template in the management
 * app, and the template currently asserts an accessible toilet, which the SSOT
 * verifies as NO. Because it is a template, the string is on upcoming events
 * too, so treating it as a noindex trigger would deindex the pub's live
 * listings, which is a worse outcome than the claim itself.
 *
 * A single structured field can simply be withheld instead. See
 * getSafeAccessibilityNotes below. Prose fields cannot: a banned claim woven
 * into a paragraph cannot be safely rewritten by a regex, so those do trigger
 * noindex until a human corrects the copy at source.
 */
function bannedClaimHaystack(event: BannedClaimFields): string {
  return [
    event.name,
    event.description,
    event.shortDescription,
    event.longDescription,
    event.about,
    Array.isArray(event.highlights) ? event.highlights.join(' ') : '',
  ]
    .filter((v): v is string => typeof v === 'string')
    .join(' ')
}

/**
 * True when the matched phrase is being denied rather than asserted.
 *
 * The corrected accessibility copy reads "We do not currently have an
 * accessible toilet", which contains the banned phrase while saying exactly the
 * right thing. Suppressing that would hide the honest statement and leave
 * visitors with nothing, which is the opposite of the point. Only an
 * unqualified assertion should be withheld.
 */
function isNegatedClaim(text: string, pattern: RegExp): boolean {
  const match = pattern.exec(text)
  if (!match) return false
  // Look back over the words immediately before the phrase, not the whole
  // string: "we have an accessible toilet, but no baby changing" must not read
  // as a denial of the toilet.
  const preceding = text.slice(Math.max(0, match.index - 60), match.index)
  return /\b(no|not|don'?t|doesn'?t|without|lack|lacks|unable to offer|cannot offer)\b[^.!?]*$/i.test(
    preceding,
  )
}

/**
 * Accessibility notes to display, or null when they carry a claim the SSOT
 * verifies as false.
 *
 * Withholding beats rendering here. A wrong accessibility statement is worse
 * than no statement: someone with mobility needs could plan a visit around it.
 * The /find-us page and a phone call remain the accurate route.
 */
export function getSafeAccessibilityNotes(
  event: Partial<Pick<Event, 'accessibility_notes'>>
): string | null {
  const notes = typeof event.accessibility_notes === 'string' ? event.accessibility_notes.trim() : ''
  if (!notes) return null
  const carriesBannedClaim = BANNED_FACTUAL_CLAIMS.some(
    ({ pattern }) => pattern.test(notes) && !isNegatedClaim(notes, pattern),
  )
  return carriesBannedClaim ? null : notes
}

/** Which banned claims an event's copy contains. Empty when it is clean. */
export function getBannedClaims(event: BannedClaimFields): string[] {
  const haystack = bannedClaimHaystack(event)
  if (!haystack.trim()) return []
  return BANNED_FACTUAL_CLAIMS.filter(({ pattern }) => pattern.test(haystack)).map(
    ({ claim }) => claim,
  )
}

export function hasBannedClaim(event: BannedClaimFields): boolean {
  return getBannedClaims(event).length > 0
}

type DiscontinuedFields = Partial<
  Pick<Event, 'name' | 'slug' | 'description' | 'shortDescription' | 'keywords' | 'highlights' | 'category'>
>

function flattenText(value: unknown): string {
  if (Array.isArray(value)) return value.join(' ')
  return typeof value === 'string' ? value : ''
}

/**
 * The format signal is not always in the title. "Sleigh That Tune" is a Nikki
 * games night with no giveaway in its name or slug, so a name-only check
 * shipped it straight into the index. Category, keywords, highlights and the
 * descriptions all carry the signal in practice.
 */
function discontinuedHaystack(event: DiscontinuedFields): string {
  return [
    event.name,
    event.slug,
    event.description,
    event.shortDescription,
    flattenText(event.keywords),
    flattenText(event.highlights),
    event.category?.name,
    event.category?.slug,
  ]
    .map(flattenText)
    .join(' ')
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
}

export function isDiscontinuedFormatEvent(event: DiscontinuedFields): boolean {
  const haystack = discontinuedHaystack(event)
  return DISCONTINUED_FORMATS.some((format) => haystack.includes(format.token))
}

/**
 * Where a discontinued-format page should send its visitors, and what to call
 * that link. Null when the event is not a discontinued format.
 *
 * The page has no useful category page of its own, so falling back to
 * /whats-on would drop someone interested in a Nikki night onto a generic
 * listing. Music Bingo is the format she actually hosts now.
 */
export function getDiscontinuedFormatReplacement(
  event: DiscontinuedFields
): { href: string; label: string; copy: string } | null {
  const haystack = discontinuedHaystack(event)
  const match = DISCONTINUED_FORMATS.find((format) => haystack.includes(format.token))
  return match
    ? { href: match.replacement, label: match.replacementLabel, copy: match.replacementCopy }
    : null
}

/**
 * Map category slugs to their actual top-level page routes.
 * The site uses top-level category pages, NOT /whats-on/[category].
 *
 * No 'live-music' entry. The format is discontinued and /live-music is retired
 * (docs/SSOT.md §"Live Music, DISCONTINUED"), so anything still filed under
 * that category falls through to /whats-on rather than being linked into a
 * redirect to a page that no longer sells the thing it names.
 */
/**
 * Category slug -> hub page. The KEYS must be the slugs the management API
 * actually sends, not the tidy names we use for our own routes.
 *
 * Three of the four original keys ('quiz-night', 'cash-bingo', 'karaoke')
 * matched no category in the database, so getCategoryPageUrl() fell through
 * to /whats-on for 44 of 75 events: every Quiz Night (22), every Cash Bingo
 * (19) and every Karaoke Night (3). Only 'music-bingo' happened to be right.
 *
 * The visible symptom was the "View all <category> events" link at the foot
 * of each event page, plus the archive listing, pointing at /whats-on rather
 * than the hub. That quietly denied /quiz-night and /cash-bingo their most
 * natural inbound internal links.
 *
 * Verified against event_categories on 21 Aug 2026. If a new category is
 * added, add its real slug here; do not add an aliased guess.
 */
/**
 * Past event pages retired on 21 August 2026, one-off historical cleanup.
 *
 * The standing policy below keeps past events indexed, and that is right for
 * pages carrying real content. These eighteen did not. Evidence from Search
 * Console, 16 months to 19 August 2026:
 *
 *   - 9 clicks and 684 impressions across all eighteen, combined.
 *   - 6 of them never recorded a single impression.
 *   - Over the last 3 months: 0 clicks, 3 impressions.
 *   - 12 carry no long_description at all; 5 more share one description,
 *     published five times over, with an identical meta_title.
 *
 * The decisive part is not that they are thin, it is that they hold rankings
 * they cannot convert. They sit at position 1 to 7 for brand-and-category
 * queries and take almost no clicks, because the page says the night is over:
 *
 *   "the anchor pub quiz"   position 4.74   23 impressions   0 clicks
 *   "bingo near me"         position 1       2 impressions   0 clicks
 *   "bingo staines"         position 1       1 impression    0 clicks
 *
 * Those positions belong to /quiz-night and /cash-bingo, which can take a
 * booking. Each URL 301s to the hub for its own category via
 * config/redirects/additional-redirects.json; this set keeps them out of the
 * sitemap and returns noindex, so we never list or advertise a redirect.
 *
 * This is a fixed historical list, deliberately not a rule. A general quality
 * floor needs long_description in the events LIST payload, which the
 * management API does not currently return. See
 * tasks/site-growth-implementation-spec-2026-08-17.md C11.
 */
export const RETIRED_THIN_EVENT_SLUGS: ReadonlySet<string> = new Set([
  'quiz-night-april--2025',
  'quiz-night-may--2025',
  'quiz-night-june--2025',
  'quiz-night-july--2025',
  'quiz-night-pub-pursuit-2025-08-13',
  'pub-quiz-night-2025-10-01',
  'pub-quiz-night-2025-11-05',
  'cash-bingo-april--2025',
  'cash-bingo-may--2025',
  'cash-bingo-june--2025',
  'cash-bingo-2025-07-18',
  'bingo-night-2025-08-29',
  'bingo-night-2025-09-19',
  'bingo-night-2025-10-17',
  'bingo-night-2025-11-14',
  'bank-holiday-sing-along-karaoke-may--2025',
  'nikki-s-karaoke-night-2025-08-22',
  'rum-tasting-night-june--2025',
])

/**
 * Where a retired slug goes, decided WITHOUT calling the API.
 *
 * A retirement is the only case that justifies a permanent redirect, so it must
 * not depend on a dependency being reachable. Resolving it from the slug alone
 * means an outage can never turn into a durable "this moved" signal, and a
 * genuine retirement still answers correctly while the CMS is down.
 *
 * Destinations mirror config/redirects/additional-redirects.json. The redirect
 * config handles these at the edge in normal operation; this exists so the route
 * gives the same answer if a request reaches it directly.
 */
const RETIRED_EVENT_DESTINATIONS: ReadonlyArray<readonly [RegExp, string]> = [
  [/^(pub-)?quiz-night/, '/quiz-night'],
  [/^(cash-)?bingo|^cash-bingo/, '/cash-bingo'],
  [/karaoke/, '/karaoke'],
]

export function getRetiredEventRedirect(slugOrId: string): string | null {
  const slug = slugOrId?.toLowerCase().trim()
  if (!slug || !RETIRED_THIN_EVENT_SLUGS.has(slug)) return null
  for (const [pattern, destination] of RETIRED_EVENT_DESTINATIONS) {
    if (pattern.test(slug)) return destination
  }
  // Tasting nights and anything else retired without a hub of its own.
  return '/whats-on'
}

export function isRetiredThinEvent(event: Pick<Event, 'slug'> | { slug?: string | null }): boolean {
  const slug = event.slug?.toLowerCase().trim()
  return Boolean(slug && RETIRED_THIN_EVENT_SLUGS.has(slug))
}

export const CATEGORY_ROUTES: Record<string, string> = {
  'quiz-night-stanwell-moor': '/quiz-night',
  'bingo-night': '/cash-bingo',
  'music-bingo': '/music-bingo',
  'karaoke-night': '/karaoke',
  'nikkis-karaoke-night': '/karaoke',
}

export function getCategoryPageUrl(categorySlug: string | undefined | null): string {
  if (!categorySlug) return '/whats-on'
  return CATEGORY_ROUTES[categorySlug] || '/whats-on'
}

export interface EventSeoStrategy {
  /** Whether the page should be indexed by search engines */
  index: boolean
  /** Whether to show the "event ended" banner */
  showEndedBanner: boolean
  /**
   * Presentation stage only. `archived` does not mean retired: the page is
   * still live and still indexed.
   */
  stage: 'active' | 'recent' | 'archived'
}

/**
 * Determine the SEO strategy for an event page based on its lifecycle stage.
 *
 * Past events are kept live and indexed indefinitely. An event page is only
 * live for a couple of months before the night itself, which is not long
 * enough to earn rankings; retiring it at 30 days threw that away every month
 * and the category page had to start from scratch each time. Keeping the URL
 * lets each night accumulate, and the pages are not near-duplicates: every
 * night carries its own theme, name and highlights.
 *
 * The route into the next date is an on-page link, not a redirect. A redirect
 * would delete the very content this policy exists to keep.
 *
 * Cancelled events are the one exception. Nothing happened on the night, so
 * there is no content worth ranking, and they drop out after
 * CANCELLED_INDEX_DAYS.
 *
 * @param event - The event to evaluate
 */
export function getEventSeoStrategy(
  event: Pick<Event, 'startDate' | 'event_status' | 'eventStatus' | 'category'> &
    { slug?: string | null } &
    DiscontinuedFields &
    BannedClaimFields
): EventSeoStrategy {
  const status = normalizeEventStatus(event)
  const isPast = isEventInPast(event)

  // Discontinued formats, and any event whose copy carries a claim the SSOT
  // verifies as false, stay reachable but out of search whatever their date.
  // Keeping them indexed would rank a night nobody can attend, or advertise
  // facilities the pub does not have.
  // Retired thin pages: 301'd to their category hub, so they must never be
  // listed in the sitemap or claim to be indexable.
  if (isRetiredThinEvent(event)) {
    return { index: false, showEndedBanner: true, stage: 'archived' }
  }

  if (isDiscontinuedFormatEvent(event) || hasBannedClaim(event)) {
    return {
      index: false,
      showEndedBanner: isPast,
      stage: isPast ? 'archived' : 'active',
    }
  }

  // Cancelled events: index for 7 days, then noindex. Never redirect, the page
  // renders with a cancelled banner.
  if (status === 'cancelled') {
    // We can't reliably know when it was cancelled from the event data,
    // so use the event date as proxy, noindex if event date was >7 days ago.
    const eventDate = Date.parse(event.startDate)
    const daysSinceEvent = (Date.now() - eventDate) / (1000 * 60 * 60 * 24)
    return {
      index: daysSinceEvent <= CANCELLED_INDEX_DAYS,
      showEndedBanner: true,
      stage: 'archived',
    }
  }

  // Active events (future, not cancelled)
  if (!isPast) {
    return { index: true, showEndedBanner: false, stage: 'active' }
  }

  // Past events stay indexed. `recent` vs `archived` only changes presentation
  // and how prominently the page is surfaced in listings, never indexability.
  const eventDate = Date.parse(event.startDate)
  const daysSinceEvent = (Date.now() - eventDate) / (1000 * 60 * 60 * 24)

  return {
    index: true,
    showEndedBanner: true,
    stage: daysSinceEvent <= RECENT_EVENT_WINDOW_DAYS ? 'recent' : 'archived',
  }
}

/**
 * Map event status to Schema.org eventStatus URL.
 */
export function getSchemaEventStatus(
  event: Pick<Event, 'event_status' | 'eventStatus'>
): string {
  const status = normalizeEventStatus(event)
  switch (status) {
    case 'cancelled': return 'https://schema.org/EventCancelled'
    case 'postponed': return 'https://schema.org/EventPostponed'
    case 'rescheduled': return 'https://schema.org/EventRescheduled'
    default: return 'https://schema.org/EventScheduled'
  }
}

/**
 * Map event status to Schema.org offers availability URL.
 * Falls back to capacity-based logic for scheduled/rescheduled events.
 */
export function getSchemaOfferAvailability(
  event: Pick<Event, 'event_status' | 'eventStatus' | 'remainingAttendeeCapacity'>
): string {
  const status = normalizeEventStatus(event)
  switch (status) {
    case 'cancelled': return 'https://schema.org/Discontinued'
    case 'postponed': return 'https://schema.org/PreOrder'
    case 'sold_out': return 'https://schema.org/SoldOut'
    default:
      return event.remainingAttendeeCapacity === 0
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/InStock'
  }
}

