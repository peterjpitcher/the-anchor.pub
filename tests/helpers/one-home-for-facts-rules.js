// @ts-check
/*
 * The rules behind tests/one-home-for-facts-guard.test.ts.
 *
 * Each fact below has one home (lib/constants.ts, lib/approved-wording.ts,
 * lib/private-hire-capacity.ts or lib/booking-config.ts). A page reads it from
 * there. These rules read the copy of every page, component and lib file and
 * fail when one of those facts is typed in again, or is stated in a way the
 * SSOT rules out.
 *
 * Plain CommonJS on purpose, so the same rules can be run from the command
 * line on a handful of files while a page is being edited.
 */

const { readFileSync } = require('fs')
const { join } = require('path')
const { execSync } = require('child_process')

/** The files that hold a fact. A rule never fires inside the home of its own fact. */
const HOMES = {
  constants: 'lib/constants.ts',
  wording: 'lib/approved-wording.ts',
  capacity: 'lib/private-hire-capacity.ts',
}

/** Pages, components and lib code, plus /llms.txt. Blog posts are checked for the bus only. */
function customerFacingFiles(root) {
  // Whole directories, filtered here. A pathspec such as 'app/**/*.tsx' needs a
  // second slash, so it silently skips app/page.tsx and every top-level file in
  // lib/ and components/.
  const out = execSync('git ls-files app components lib public/llms.txt', { cwd: root, encoding: 'utf8' })
  return out
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean)
    .filter((f) => /\.tsx?$/.test(f) || f === 'public/llms.txt')
    .filter((f) => !/(?:\.test\.|__tests__\/|\/test-utils\/|\.d\.ts$)/.test(f))
}

function blogFiles(root) {
  return execSync("git ls-files 'content/blog/**/*.md'", { cwd: root, encoding: 'utf8' })
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean)
}

/**
 * The file as a reader would see the words: code comments dropped (a note to a
 * developer is not copy), entities decoded, and everything on one line, because
 * JSX copy wraps.
 */
function copyText(root, file) {
  let contents
  try {
    contents = readFileSync(join(root, file), 'utf8')
  } catch {
    return ''
  }
  const isCode = /\.tsx?$/.test(file)
  if (isCode) {
    // Line comments go first: a "/*" inside one (a path such as "app/api/*")
    // would otherwise open a block comment that swallows the copy after it. A
    // block comment must start a line or follow a space, so the "/*" inside a
    // string such as 'app/**/*.tsx' is left alone.
    contents = contents
      .split('\n')
      .map((line) => (/^\s*\/\//.test(line) ? '' : line.replace(/\s\/\/\s.*$/, '')))
      .join('\n')
      // One comment only: it ends at the first "*/", brace or no brace.
      .replace(/\{\s*\/\*(?:(?!\*\/)[\s\S])*\*\/\s*\}/g, ' ')
      .replace(/(^|\s)\/\*[\s\S]*?\*\//g, ' ')
  }
  const decoded = contents
    .replace(/&apos;|&rsquo;|&#39;|&#x27;|\\'/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&pound;|\\u00a3/gi, '£')
    .replace(/&nbsp;/g, ' ')
    .replace(/&rarr;/g, '→')
  return isCode ? decoded.replace(/\s+/g, ' ') : decoded
}

/**
 * Pieces of copy: split at sentence ends, line ends and tag edges, since two
 * spans are two pieces, and at the edges of a string in code, since two values
 * in a list are two pieces.
 */
function pieces(text) {
  return text.split(/(?<=[.!?]["'`]?)\s+|[<>\n]|["'`]\s*[,:)\]}]+\s*|[,:(\[{]\s*["'`]/)
}

// A number as copy writes it: digits, or the words the pages have used.
const NUM =
  '(?<![\\w.}$])(?:\\d+(?:\\.\\d+)?|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty)'
const RANGE = `${NUM}(?:\\s*(?:-|–|to|or)\\s*(?:\\d+|\\w+))?`
const MIN = '[- ]?min(?:ute)?s?\\b'
const PLACE =
  "(?:Terminals? ?[2-5](?:(?:,| and| &|\\/) ?[2-5])*|T[2-5](?:\\/[2-5])*|Heathrow(?: Airport)?|the (?:terminals?|airport)|M25(?: Junction 14| J14)?|Junction 14|J14|Staines(?:-upon-Thames)?|Windsor(?: Castle| Racecourse)?|Ashford|Feltham|Egham|Sunbury|Horton|Wraysbury|Colnbrook|Longford|Stanwell|Bedfont(?: Lakes)?|Slough|Station|Hospital|Leisure|Reservoir|town centre)"

const JOURNEY_PATTERNS = [
  // "10-minute drive", "7 minutes from Terminal 5", "8 mins away", "20 minutes by taxi"
  new RegExp(
    `${RANGE}${MIN}['’]?[- ]?(?:drive|driving|away|from|by (?:car|taxi|road|cab)|walk|taxi|cab|journey|ride|trip|stroll|transfer|hop|door[- ]to[- ]door|down|via|to (?:Heathrow|Terminal|T[2-5]|the (?:pub|terminals?|airport)|us\\b|reach|get)|in normal traffic|of (?:easy,? )?(?:mostly )?\\w*[- ]?\\w* ?driving)`,
    'i'
  ),
  // "A taxi takes about 15 minutes", "Journey time: 10 minutes", "Drive 12 minutes door-to-door"
  new RegExp(
    `\\b(?:drive|drives|journey(?: time)?|taxi|cab|uber|walk|ride|transfer|trip|door to door|allow(?:ing)?)\\b[^.!?]{0,40}?${RANGE}${MIN}`,
    'i'
  ),
  // "Heathrow T5: 7 mins", "Ashford Station: 12 mins", "Terminal 4 (12 mins)"
  new RegExp(
    `\\b${PLACE}\\b\\s*(?:[:\\-–•(]|is|in)?\\s*(?:about |around |just |only |under |approximately |roughly )?${RANGE}${MIN}`,
    'i'
  ),
  // A stat tile that is nothing but a figure: "15 mins", "4.5 miles"
  new RegExp(`^\\s*(?:about |around |under |just |only |~)?${RANGE}[- ]?(?:mins?|minutes?|miles?)\\s*$`, 'i'),
  // Any typed distance. The SSOT holds two, and both are in lib/constants.ts.
  new RegExp(`${RANGE}[- ]?miles?\\b`, 'i'),
]

/**
 * Sentences that carry a figure and are not a journey to or from the pub. Each
 * is here for a stated reason; add to it only for another such sentence.
 */
const JOURNEY_ALLOWED = [
  // Walks the SSOT gives a length or a time for (sections 8 and 13, SSOT.json community_context).
  /about a 30-minute walk/i,
  // An hour or more is the length of a visit, never a journey here.
  /(?<![\w.])(?:[6-9]\d|\d{3,})[- ]?min/i,
  // How long a booked activity lasts, not how far away we are.
  /\b(?:quiz|game|round|set|session|match|half|interval|break|meal|lunch|dinner|sitting|slot|booking|table|wait|ready|cook|bake|oven|notice|early|late|before|after|every|cache|revalidat|expire|timeout|hold|kept|held)\b/i,
]

const BUS_PATTERNS = [
  [/\b(?:441|555|117)\b[^.!?]{0,40}\bbus|\bbus(?:es)?\b[^.!?]{0,40}\b(?:441|555|117)\b|\broutes? (?:441|555|117)\b/i,'names a bus that does not stop here (only the 442 does, SSOT section 2)'],
  [/\b442\b/, 'types the bus route: read BUS or BUS_WORDING from lib/constants.ts'],
  [/\bbus(?:es)?\b[^.!?]*(?:every \d+|hourly|£\s?\d|last bus|what a pint|cheaper than|runs? regularly|regular(?:ly)?\b|throughout the day|frequent)|(?:regular|frequent) bus/i,
    'states a bus fare, frequency or timetable, which the SSOT rules out'],
  [/\bbus(?:es)?\b[^.!?]*\b(?:Terminals? ?[234]|T[234]\b|Central)|(?:Terminals? ?[234]|T[234])\b[^.!?]*\bbus(?:es)?\b/i,
    'sends the bus to a terminal it does not serve (the 442 runs from Terminal 5)'],
]

const PARKING_PATTERNS = [
  [/\b(?:around|approximately|about|roughly|over|nearly|some)\s+(?:(?:20|twenty)\b|\$?\{PARKING\.capacity\})[^.!?]{0,25}(?:spaces|cars|vehicles|parking)/i,
    'hedges the parking count: it is exactly PARKING.capacity'],
  [/\b(?:large|huge|ample|plenty of|generous|spacious|big)\b[^.!?]{0,20}\b(?:car park|parking)\b/i,
    'sizes the car park in an adjective: say PARKING_WORDING'],
  [/guaranteed (?:free )?parking|parking (?:is )?guaranteed|parking[^.!?]{0,15}\balways\b|\balways\b[^.!?]{0,15}parking|never (?:have to )?worry about parking|designated driver|reserve (?:a |your |you a )?(?:parking|space)|reserve parking/i,
    'promises a space: parking is free, not guaranteed (SSOT section 16)'],
  [/(?<![\w.}$])(?:20|twenty)[- ](?:free |on-site |onsite |car |parking |guest |customer |car park |private ){0,3}(?:spaces?|cars|vehicles|bays)\b|(?<![\w.}$])20-space/i,
    'types the parking count: read PARKING.capacity or PARKING_WORDING'],
]

/** Only outside the paid airport parking pages, where a car is left by design. */
const GUEST_PARKING_PATTERNS = [
  [/\bpark(?:ing|ed)?\b[^.!?]{0,70}(?:pick(?:ing)?[- ]?(?:someone |people )?ups?|drop(?:ping)?[- ]?offs?|collecting (?:passengers|someone))|(?:pick(?:ing)?[- ]?(?:someone |people )?ups?|drop(?:ping)?[- ]?offs?|collecting (?:passengers|someone))[^.!?]{0,70}\bpark(?:ing|ed)?\b/i,
    'offers guest parking for an airport pick-up or drop-off: it is for guests while they are with us'],
  [/\bovernight\b[^.!?]{0,60}\b(?:park|parking|car|cars|vehicle)\b|\b(?:park|parking|car|cars|vehicle)s?\b[^.!?]{0,60}\bovernight\b/i,
    'says a car can be left overnight, which is not on record'],
]

const ULEZ_PATTERNS = [
  [/ULEZ[^.!?]*(?:\bcharges?\b|\bsav(?:e|es|ing|ings)\b|\bavoid|quid|£|\bfees?\b|\bcosts?\b|money|cheaper|\beco\b|eco-friendly|environment)|(?:\bcharges?\b|\bsav(?:e|es|ing|ings)\b|\bavoid|\bfees?\b)[^.!?]*ULEZ/i,
    'says more than "we are outside the ULEZ zone": use ULEZ_WORDING and stop'],
  [/ULEZ[- ]free|free of (?:the )?ULEZ/i, 'says "ULEZ-free": use ULEZ_WORDING'],
  [/congestion (?:charge|fee|zone)|emissions charge/i, 'mentions a congestion or emissions charge: use ULEZ_WORDING and stop'],
]

const DOG_PATTERNS = [
  [/\bdogs?\b[^.!?]{0,90}\b(?:bar(?: area)? (?:and|&) (?:the |our )?(?:beer )?garden|early evening|until \d|before \d ?pm)/i,
    'limits where or when dogs are welcome: they are welcome throughout, whenever we are open'],
  // A sentence: not a two-word badge ("Dogs welcome"), not a question, and not
  // assistance dogs, which the SSOT says are always welcome.
  [/^(?![^.!?]*\bassistance\b)(?![^?]*\?\s*$)[^.!?]*(?:\bdogs?\b (?:are|is) (?:\w+ ){0,3}welcome\b|\bwelcom(?:e|es|ing) (?:well-behaved |your )?dogs?\b)(?![^.!?]*\bleads?\b)/i,
    'welcomes dogs without "on a lead": use DOGS_WORDING'],
]

const FAMILY_PATTERNS = [
  [/\b(?:child(?:ren)?|kids?|famil(?:y|ies)|under[- ]18s?)\b[^.!?]{0,90}\b(?:until|till|before) (?:\d{1,2}|eight|nine) ?pm|\buntil (?:8|9) ?pm\b[^.!?]{0,60}\b(?:child(?:ren)?|kids?|famil)/i,
    'gives children a curfew: they are welcome at all hours (CHILDREN_WELCOME_WORDING)'],
]

const CAPACITY_PATTERNS = [
  [/(?<![\w.}$£])(?:26|29|50|64|119|150|250|300)\b\s*(?:-\s*)?(?:seated|standing|guests|people|seats|covers|attendees)\b/i,
    'types a room capacity: read PRIVATE_HIRE_CAPACITY from lib/private-hire-capacity.ts'],
  [/\b(?:seats?|seating for|capacity(?: of| limit of)?|parties of|part(?:y|ies) of up to|accommodate(?:s)?(?: up to)?|holds?(?: up to)?|room for(?: up to)?)\s+(?<![\w.}$£])(?:26|29|50|64|119|150|250|300)\b/i,
    'types a room capacity: read PRIVATE_HIRE_CAPACITY from lib/private-hire-capacity.ts'],
  [/\b10\+? (?:guests )?(?:up )?to 150\b/i, 'types the private hire range: read PRIVATE_HIRE_CAPACITY.recommendedRange'],
]

const SCHEMA_PATTERNS = [
  [/Heathrow Pub & Dining/, 'uses a name the pub does not have: read BRAND.name'],
]

/** Matched against the whole file, because a key and its value are two pieces. */
const WHOLE_FILE_PATTERNS = [
  [/5[01]\.4\d{3,}/g, 'types a latitude: read CONTACT.coordinates from lib/constants.ts', HOMES.constants],
  // A quoted literal. The paid parking page builds its own from the live rate card, in a template.
  [/['"]?priceRange['"]?\s*:\s*['"][^'"]*['"]/g, 'types a price band: read PRICE_RANGE from lib/constants.ts', HOMES.constants],
  // Private hire and the venue itself. An event's capacity is the management app's (SSOT section 10).
  [/maximumAttendeeCapacity['"]?\s*:\s*\d+/g, 'types a capacity into structured data: read PRIVATE_HIRE_CAPACITY', HOMES.capacity, /^(?:app\/private-hire\/|lib\/schema\.ts$)/],
]

const DIRECTION_PATTERNS = [
  [/generateHowToDirectionsSchema/, 'publishes hand-typed directions as structured data: link DIRECTIONS_URL'],
  [/\bturn (?:left|right)\b|\bon (?:your|the) (?:left|right)\b|\btake (?:a|the) (?:left|right|1st|2nd|3rd|first|second|third)\b|\bhead (?:north|south|east|west)\b|\b(?:1st|2nd|3rd|first|second|third) exit\b/i,
    'types turn-by-turn directions, which disagreed from page to page: link DIRECTIONS_URL'],
]

const GROUP_PATTERNS = [
  [/(?:\b(?:8|eight)\+|\b(?:8|eight) or more\b|groups? of (?:8|eight)\b)/i,
    'tells groups of 8 to phone: online booking takes bookingConfig.maxOnlinePartySize'],
]

const LOCAL_AREA_PATTERNS = [
  [/Horton Country Park|Stanwell Moor nature reserve|village green|just off the A308|just past Ashford Hospital|right on our doorstep|at the church\b|Next to St Mary's Church/i,
    'states something about the area that the SSOT does not hold, or that a map contradicts'],
]

/** Area and terminal pages: the kitchen's days are the management app's to state. */
const KITCHEN_DAY_FILES = /^app\/(?:[a-z-]+-pub|pubs-in-stanwell|near-heathrow|heathrow-hotels-pub)\//
const KITCHEN_DAY_PATTERNS = [
  [/\b(?:kitchen|food|pizzas?|meals?|lunch|dinner|serv(?:e|es|ed|ing))\b[^.!?]{0,80}\b(?:Mon|Tue|Tues|Wed|Thu|Thur|Thurs|Fri|Sat)(?:[a-z]*)?\s*(?:-|–|to|through)\s*(?:Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\b|\b(?:Mon|Tue|Tues|Wed|Thu|Fri|Sat)[a-z]*\s*(?:-|–|to|through)\s*(?:Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\b[^.!?]{0,80}\b(?:kitchen|food|pizzas?|meals?)\b/i,
    'types the kitchen days: hours come from the management app (mount the hours block or link /find-us)'],
]

const PAID_PARKING = /^app\/heathrow-parking\//

function matchAny(piece, patterns) {
  for (const [pattern, why] of patterns) if (pattern.test(piece)) return why
  return null
}

function journeyOffence(piece) {
  if (!JOURNEY_PATTERNS.some((p) => p.test(piece))) return null
  // A distance is never allowed through; a time may be, if it is not a journey.
  if (JOURNEY_PATTERNS[4].test(piece)) return 'types a distance: the SSOT holds two, in HEATHROW_DISTANCES'
  if (JOURNEY_ALLOWED.some((p) => p.test(piece))) return null
  return 'types a journey time: read HEATHROW_TIMES or DRIVE_TIMES from lib/constants.ts, or give no figure'
}

/** Every rule for one piece of copy in one file. Returns the reasons it fails. */
function offences(piece, file) {
  const why = []
  const isHome = (home) => file === home
  const add = (reason) => reason && why.push(reason)

  if (!isHome(HOMES.constants)) {
    add(journeyOffence(piece))
    add(matchAny(piece.replace(/Central Bus Station/gi, 'Central Station'), BUS_PATTERNS))
    add(matchAny(piece, SCHEMA_PATTERNS))
  }
  if (!isHome(HOMES.constants) && !isHome(HOMES.wording)) {
    add(matchAny(piece, PARKING_PATTERNS))
    if (!PAID_PARKING.test(file)) add(matchAny(piece, GUEST_PARKING_PATTERNS))
    add(matchAny(piece, ULEZ_PATTERNS))
    add(matchAny(piece, DOG_PATTERNS))
    add(matchAny(piece, FAMILY_PATTERNS))
  }
  if (!isHome(HOMES.capacity)) add(matchAny(piece, CAPACITY_PATTERNS))
  add(matchAny(piece, DIRECTION_PATTERNS))
  add(matchAny(piece, GROUP_PATTERNS))
  add(matchAny(piece, LOCAL_AREA_PATTERNS))
  if (KITCHEN_DAY_FILES.test(file)) add(matchAny(piece, KITCHEN_DAY_PATTERNS))
  return why
}

/** Best effort: the line a piece of copy starts on, so an offender can be found. */
function lineOf(root, file, piece) {
  const needle = piece.trim().slice(0, 24)
  if (!needle) return 0
  let lines
  try {
    lines = readFileSync(join(root, file), 'utf8').split('\n')
  } catch {
    return 0
  }
  const plain = (s) => s.replace(/&apos;|&rsquo;|\\'/g, "'").replace(/&amp;/g, '&')
  const at = lines.findIndex((l) => plain(l).includes(needle))
  return at + 1
}

/** Run every rule over the given files (default: the whole site). */
function check(root, files) {
  const found = []
  for (const file of files || customerFacingFiles(root)) {
    // /llms.txt cannot import a constant, so its figures are compared with the home instead.
    if (file === 'public/llms.txt') {
      for (const line of copyText(root, file).split('\n')) {
        const why = matchAny(line, BUS_PATTERNS.slice(0, 1)) || matchAny(line, ULEZ_PATTERNS)
        if (why) found.push(`${file}: ${why}: "${line.trim().slice(0, 110)}"`)
      }
      continue
    }
    const seen = new Set()
    const text = copyText(root, file)
    for (const [pattern, why, home, only] of WHOLE_FILE_PATTERNS) {
      if (file === home || (only && !only.test(file))) continue
      for (const match of text.matchAll(pattern)) {
        found.push(`${file}: ${why}: "${match[0].slice(0, 110)}"`)
      }
    }
    for (const piece of pieces(text)) {
      for (const why of offences(piece, file)) {
        const key = `${why}|${piece.trim()}`
        if (seen.has(key)) continue
        seen.add(key)
        const line = lineOf(root, file, piece)
        found.push(`${file}${line ? `:${line}` : ''}: ${why}: "${piece.trim().slice(0, 110)}"`)
      }
    }
  }
  return found
}

module.exports = { HOMES, customerFacingFiles, blogFiles, copyText, pieces, offences, check, BUS_PATTERNS }
