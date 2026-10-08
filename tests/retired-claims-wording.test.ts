export {}

import { readFileSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

// Two claims the owner retired on 10 September 2026 (docs/SSOT.md sections 2,
// 11, 14 and 16), both of which had spread across pages, blog posts and shared
// components before anyone noticed:
//
// 1. A ULEZ saving figure. "Save £12.50 a day" reached eight pages (two of them
//    through a shared value strip), six blog posts and /llms.txt. Whether a driver pays the charge
//    depends on their vehicle and their route, so no figure is true for everyone.
//    We say we're outside the ULEZ zone, and stop.
//
// 2. The private-hire deposit "deducted from the final bill". The £250 is a
//    booking and damage deposit, held separately and refunded after the event;
//    the signed contract says so. A private hire also never pays the £10 per
//    person group deposit on top: the £250 replaces it.

const ROOT = join(__dirname, '..')

// The patterns are plain git pathspecs, where "*" also crosses a "/". The older
// form, 'app/**/*.tsx', needed a folder between "app/" and the file, so it never
// read app/page.tsx (the homepage) or any file sitting directly in lib/ or
// components/: 169 files in all, lib/constants.ts and lib/tag-seo-content.ts
// among them (found by the October 2026 site review).
function customerFacingFiles(): string[] {
  const out = execSync(
    "git ls-files 'app/*.tsx' 'app/*.ts' 'components/*.tsx' 'components/*.ts' 'lib/*.ts' 'lib/*.tsx' 'content/*.ts' 'content/blog/*.md' 'public/llms.txt'",
    { cwd: ROOT, encoding: 'utf8' }
  )
  return out
    .split('\n')
    .map(f => f.trim())
    .filter(Boolean)
    // A test's own fixture is not copy.
    .filter(f => !/__tests__\/|\.(?:test|spec)\.tsx?$/.test(f))
}

/**
 * The file's lines as a reader would see the words: code comments dropped (a note
 * to developers is not copy) and the pound sign decoded however the source writes it.
 */
function copyLines(file: string): string[] {
  let contents: string
  try {
    contents = readFileSync(join(ROOT, file), 'utf8')
  } catch {
    return []
  }
  const isCode = /\.tsx?$/.test(file)
  return contents
    .split('\n')
    .map(line => (isCode && /^\s*(?:\/\/|\/\*|\*)/.test(line) ? '' : line))
    .map(line => line.replace(/&pound;|\\u00a3/gi, '£').replace(/&apos;/g, "'"))
}

/**
 * One string per file. Code joins its lines, because JSX copy wraps across them;
 * Markdown and text keep them, because each list item or heading is its own piece.
 */
function flatten(file: string): string {
  const lines = copyLines(file)
  return /\.tsx?$/.test(file) ? lines.join(' ').replace(/\s+/g, ' ') : lines.join('\n').replace(/[ \t]+/g, ' ')
}

/** Pieces of copy: split at sentence ends, line ends, and tag edges, since two spans are two pieces. */
const pieces = (text: string): string[] => text.split(/(?<=[.!?]["']?)\s+|[<>\n]/)

describe('retired claims stay retired', () => {
  it('never quotes a ULEZ saving figure', () => {
    const offenders: string[] = []
    for (const file of customerFacingFiles()) {
      const text = flatten(file)
      // Any pound figure in the same piece of copy as the ULEZ.
      for (const piece of pieces(text)) {
        if (/ULEZ/i.test(piece) && /£\s?\d/.test(piece)) offenders.push(`${file}: "${piece.trim().slice(0, 120)}"`)
      }
      // The retired figure itself anywhere near a ULEZ mention, even split across a heading and its text.
      for (const match of text.matchAll(/ULEZ/gi)) {
        const at = match.index ?? 0
        const around = text.slice(Math.max(0, at - 150), at + 150)
        if (/12\.50/.test(around)) offenders.push(`${file}: 12.50 within 150 characters of "ULEZ"`)
      }
    }
    expect([...new Set(offenders)]).toEqual([])
  })

  it('never says the £250 private-hire deposit comes off the bill', () => {
    const offenders: string[] = []
    for (const file of customerFacingFiles()) {
      const text = flatten(file)
      for (const match of text.matchAll(/£\s?250\b/g)) {
        const at = match.index ?? 0
        const following = text.slice(at, at + 160)
        if (/deducted|deduct from|comes? (?:straight )?off|off (?:your|the) (?:final )?bill|towards (?:your|the) (?:final )?bill/i.test(following)) {
          offenders.push(`${file}: "${following.slice(0, 120)}"`)
        }
      }
    }
    expect(offenders).toEqual([])
  })

  it('never offers the £10 per person group deposit on a private-hire page', () => {
    const offenders: string[] = []
    for (const file of customerFacingFiles().filter(f => f.startsWith('app/private-hire/'))) {
      copyLines(file).forEach((line, i) => {
        if (/£\s?10 ?(?:per (?:person|head)|pp\b)/i.test(line)) offenders.push(`${file}:${i + 1}`)
      })
    }
    expect(offenders).toEqual([])
  })

  it('never lists a pie among the Sunday roasts (retired 11 September 2026)', () => {
    const offenders: string[] = []
    for (const file of customerFacingFiles()) {
      const text = flatten(file)
      for (const piece of pieces(text)) {
        // The last alternative catches a pie named in a list of roasts, such as
        // "beef, pork, turkey, pies and a vegan option" (site review finding B1-041).
        if (/\bpie roasts?\b|\btwo pies\b|roast (?:beef|pork|turkey), (?:and )?pies\b|\b(?:beef|pork|turkey),? (?:and )?pies\b/i.test(piece)) {
          offenders.push(`${file}: "${piece.trim().slice(0, 120)}"`)
        }
      }
    }
    expect(offenders).toEqual([])
  })

  it('keeps the voice the owner confirmed on 11 September 2026, in section 1 and its JSON mirror', () => {
    const ssot = readFileSync(join(ROOT, 'docs/SSOT.md'), 'utf8').replace(/\s+/g, ' ')
    expect(ssot).toContain("**It's about them, not us.**")
    expect(ssot).toContain('2. Is it about them, not us?')

    const json = JSON.parse(readFileSync(join(ROOT, 'SSOT.json'), 'utf8'))
    const voice = json.brand_guidelines.voice
    expect(voice.tone).not.toContain('Cheeky')
    expect(voice.principles[0]).toMatch(/^It's about them, not us/)
    expect(JSON.stringify(voice.principles)).not.toMatch(/Lead with feeling|Cheeky, never snide/)
  })

  it('keeps emojis out of every page, post and shared component', () => {
    // 566 of them were swept out of 62 files on 12 September 2026, most of them line markers
    // in the blog archive ("📍 **Location**"). This is what stops them coming back.
    // The one exception is deliberate and named below: a share message is a social message.
    // U+2300 to U+23FF holds the alarm clock, the hourglass and the media
    // buttons. Eleven alarm clocks survived the September sweep because this
    // range was missing (site review findings B1-040, B2-041 and B4-018).
    const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{20E3}\u{E0020}-\u{E007F}]/u
    const ALLOWED = new Set(['lib/event-social-copy.ts'])

    const offenders: string[] = []
    for (const file of customerFacingFiles()) {
      // A test's own fixture is not copy: two of them use an emoji as a stand-in icon.
      if (ALLOWED.has(file) || /__tests__\/|\.(?:test|spec)\.tsx?$/.test(file)) continue
      for (const line of copyLines(file)) {
        const found = line.match(new RegExp(EMOJI.source, 'gu'))
        if (found) offenders.push(`${file}: ${found.join('')} in "${line.trim().slice(0, 70)}"`)
      }
    }
    expect(offenders).toEqual([])
  })

  it('allows one emoji in a share message, which is the one place section 1 permits it', () => {
    const share = readFileSync(join(ROOT, 'lib/event-social-copy.ts'), 'utf8')
    for (const title of share.match(/title: '[^']*'/g) ?? []) {
      const count = (title.match(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) ?? []).length
      expect(count).toBeLessThanOrEqual(2)
    }
  })

  it('keeps the emoji rule the owner decided on 12 September 2026', () => {
    const ssot = readFileSync(join(ROOT, 'docs/SSOT.md'), 'utf8').replace(/\s+/g, ' ')
    expect(ssot).toContain('**None on the website, in emails or in texts. One or two at most in a social post.**')

    const json = JSON.parse(readFileSync(join(ROOT, 'SSOT.json'), 'utf8'))
    expect(json.brand_guidelines.voice.emojis).toMatch(/No emojis on the website, in emails or in texts/)
  })

  it('keeps the rules and the approved wording in the SSOT', () => {
    const ssot = readFileSync(join(ROOT, 'docs/SSOT.md'), 'utf8').replace(/\s+/g, ' ')
    expect(ssot).toContain('**A ULEZ saving figure**, in any form')
    expect(ssot).toContain("A £250 booking and damage deposit secures your date. It's held separately from your bill and refunded after the event, less any documented deductions.")
    expect(ssot).toContain('It **replaces** the £10 per person group deposit in §7: a private hire never pays both')
  })
})

// ---------------------------------------------------------------------------
// Claims taken off the main pages by the October 2026 site review (packages
// P11 and P12). Each was either wrong, or something nobody could confirm, so
// the recorded default was to cut it (docs/SSOT.md sections 8 to 14 and 16).
// A claim comes back by going into the SSOT first, and its rule leaves this
// list in the same change.
//
// The blog has its own guards and its own batch, so these rules read the
// pages, the shared components, lib/ and /llms.txt, not content/blog.
// ---------------------------------------------------------------------------

type RemovedClaim = {
  /** What the rule protects, in a few words. Shown when it fails. */
  claim: string
  pattern: RegExp
  /** Only these files. */
  only?: RegExp
  /** Never these files, with the reason beside the rule. */
  except?: RegExp
}

const HIRE_PAGES = /^app\/(?:private-hire|corporate-events)\//
const TRAVELLER_PAGES =
  /^app\/(?:near-heathrow|plane-spotting-heathrow|heathrow-hotels-pub|heathrow-layover-dining|pre-flight-meal|restaurants-near-heathrow|luggage-storage-heathrow)\//

const REMOVED_BY_P11: ReadonlyArray<RemovedClaim> = [
  // Named customers. "Airport staff" is in the SSOT; a named employer as a regular is not.
  {
    claim: 'a named organisation as a regular customer (C4-021)',
    pattern: /\b(?:Windsor Castle|Eton College|Royal Holloway) (?:staff|students|workers|guides|guards)\b|\bRoyal Connection\b|\b(?:crews?|staff|students|teachers)\b[^.<]{0,40}\b(?:are (?:our )?regulars|regularly (?:pop|come|stop|join|visit)|often (?:pop|come|stop|join))\b/i,
  },
  // Scarcity. "Booking is recommended" stays; the reason nobody confirmed goes.
  {
    claim: 'a date that "always books up" or "fills up fast" (C1-029)',
    pattern: /\balways (?:books?|fills?|sells?|gets? booked)(?: \w+)? (?:up|out)\b|\b(?:books?|fills?|sells?|booked) (?:up|out) (?:fast|quickly|early|every year|weeks (?:ahead|in advance))\b|\bbusiest (?:days?|nights?|Sundays?|weekends?|times?) of (?:the|our) year\b/i,
    // Three booking prompts say "Sunday roast books up fast". They belong to the
    // floating-layers package, which is deciding which of them survive.
    except: /^components\/(?:conversion\/|sunday-lunch\/TimedBookingPrompt\.tsx$)/,
  },
  {
    claim: 'a track record in numbers: "hundreds of wakes", "hosted many" (C1-030)',
    pattern: /\b(?:hosted|catered for|organised|held) (?:hundreds|thousands|countless|many|dozens)\b|\bhundreds of (?:wakes|christenings|birthdays|parties|events|baby showers|families)\b/i,
  },
  // Private hire: only what is on the catering list and in SSOT section 11.
  {
    claim: 'food or drink that is not on the catering list (C1-035)',
    pattern: /\b(?:3|three)[- ]course (?:meal|menu|dinner|lunch)s?\b|\bgarden BBQs?\b|\bbespoke menus?\b|\bcustom menus?\b|\ball[- ]inclusive\b|(?<!festive )\bset menus?\b|\bsharing platters?\b/i,
    only: HIRE_PAGES,
  },
  {
    claim: 'mocktails, frozen cocktails or aviation-themed cocktails (C1-035, C3-042)',
    pattern: /\bmocktails?\b|\bfrozen cocktails?\b|\baviation[- ]themed\b/i,
  },
  {
    claim: 'a dance floor, live singers or DJ space at a private party (C1-032)',
    pattern: /\bdance ?floors?\b|\blive singers?\b|\b(?:space|room) for (?:a|your) (?:DJ|band)\b/i,
    only: HIRE_PAGES,
  },
  {
    claim: 'a clock time or "any day" for a private booking; the rule is "by arrangement" (C1-034)',
    pattern: /\b(?:from|at|by|as early as) 8 ?am\b|\bcoffee mornings?\b|\b(?:seven|7) days a week\b|\bany day of the week\b|\buntil late\b|\bopen(?:ing)? early\b/i,
    only: /^app\/(?:private-hire|corporate-events|christmas-parties)\//,
  },
  {
    claim: 'microphones, a private bar, extra room layouts or a separate entrance (C1-036)',
    pattern: /\bmicrophones?\b|\bprivate bar\b|\btheatre[- ]style\b|\bcabaret\b|\bown entrance\b/i,
    only: HIRE_PAGES,
  },
  {
    claim: 'a reply within 24 hours (C1-039)',
    pattern: /\b(?:repl(?:y|ies)|respond|response|back to you|touch)\b[^.<]{0,40}\bwithin 24 ?hours\b|\bwithin 24 ?hours\b[^.<]{0,30}\b(?:repl(?:y|ies)|respond|response)\b/i,
  },
  {
    claim: '"tailored", "flexible" or "bespoke" pricing, or a special rate; room hire is one hourly rate (C4-053)',
    pattern: /\b(?:tailored|flexible|bespoke) (?:pricing|rates?|quotes?)\b|\bcorporate rates\b|\bweekday rates\b/i,
  },
  {
    claim: '"private rooms" or a "private function room" on an area page: say the dining room, the garden or the whole pub (C4-053)',
    pattern: /\bprivate rooms\b|\bprivate function rooms?\b/i,
    // The private hire pages keep "private rooms" as the phrase people search for.
    only: /^app\/(?:[a-z-]+-pub|pubs-in-[a-z-]+)\/|^lib\/local-seo-data\.ts$/,
  },
  {
    claim: 'a reception or renewal celebration, which is wedding marketing by another name (C1-007)',
    pattern: /\b(?:drinks|post-ceremony|wedding) receptions?\b|\brenewal celebrations?\b/i,
    // The file that lists the phrases the event feed must never carry.
    except: /^lib\/event-seo-strategy\.ts$/,
  },
  // Travellers.
  {
    claim: 'food "ready when you arrive": a table booking takes no food order (C4-022)',
    pattern: /\bready (?:when|as|for when|the moment) you (?:arrive|land|walk in|get here)\b/i,
  },
  {
    claim: 'a layover that fits in 90 minutes (C4-022)',
    pattern: /\b90[- ]minutes?\b|\bninety minutes\b/i,
  },
  {
    claim: 'the pub arranging a taxi; the bar team gives a number (fact 43, C4-023)',
    pattern: /\b(?:we(?:'ll| will| can)|let us|staff (?:can|will)|happy to|ask us to) (?:\w+ ){0,3}(?:call|book|arrange|order|organise|sort)(?: you| your| for you)? (?:a |the |your )?(?:local )?(?:taxi|cab|minicab)\b|\btaxis? (?:on standby|arranged for you|booked for you)\b/i,
  },
  {
    claim: 'a typed taxi fare (decision 17)',
    pattern: /\b(?:taxi|cab|minicab|Uber)s?\b[^.<£]{0,40}£\s?\d|£\s?\d[^.<]{0,25}\b(?:taxi|cab|minicab|Uber)\b/i,
  },
  { claim: '"no surge pricing", which the SSOT does not hold', pattern: /\bsurge pricing\b/i },
  {
    claim: 'luggage described as secure, safe or locked away (C4-024)',
    pattern: /\b(?:secure|safe|safely|securely)[^.<]{0,25}\b(?:luggage|bags|suitcases)\b|\b(?:luggage|bags|suitcases)[^.<]{0,30}\b(?:secure|safely|securely|locked)\b/i,
  },
  {
    claim: 'plug sockets or power points (C4-025)',
    pattern: /\bplug sockets?\b|\bpower points?\b|\bcharging (?:points?|stations?)\b|\bpower (?:outlets?|access)\b/i,
  },
  {
    claim: 'tripods, the LiveATC tip, umbrellas, unobstructed views, a 6am visit or runway advice (C4-026, C4-027, C3-044)',
    pattern: /\btripods?\b|\bLiveATC\b|\bunobstructed\b|\bumbrellas?\b|\brunway (?:usage|in use)\b|\b6 ?am\b/i,
  },
  { claim: 'planes overhead "50% of the year" (C3-043)', pattern: /50% of the year/i },
  {
    claim: 'an airline or alliance by name (decision 17, C4-048)',
    pattern: /\b(?:British Airways|Virgin Atlantic|Emirates|Qatar Airways|American Airlines|Lufthansa|Star Alliance|SkyTeam|oneworld|Singapore Airlines|Air France|KLM|Qantas|Cathay Pacific|Iberia|Aer Lingus|Air Canada|Etihad)\b/i,
  },
  {
    claim: 'check-in or security advice the pub cannot keep true (C4-048)',
    pattern: /\bsecurity (?:queues?|wait|lines?)\b|\bcheck[- ]in (?:opens?|closes?|desks?|times?)\b|\bfast[- ]track\b/i,
    only: TRAVELLER_PAGES,
  },
  { claim: 'staying overnight at the pub (C4-011)', pattern: /\bovernight (?:pub )?stays?\b|\bstay overnight at the pub\b/i },
  // Games and events.
  {
    claim: 'pool or darts leagues, home teams, free darts or cues; the SSOT entry says no team (C4-032)',
    pattern: /\b(?:pool|darts?) leagues?\b|\bhome teams?\b|\bleague nights?\b|\bfree darts\b|\bcues? (?:provided|available|behind the bar)\b/i,
  },
  {
    claim: 'a darts upgrade "in 2026" (C2-017)',
    pattern: /\bdarts?\b[^.<]{0,80}\bin 2026\b|\bdarts? upgrade\b/i,
  },
  {
    claim: 'cash bingo house rules the SSOT does not hold (C2-028)',
    pattern: /\bspot prizes?\b|\bplanned (?:pauses?|breaks?)\b|\btwo (?:pauses|breaks)\b|\bsplit (?:evenly|equally)\b/i,
  },
  {
    claim: 'private or corporate quiz nights and cash bingo; private music bingo is the one the SSOT holds (C2-019)',
    pattern: /\b(?:private|corporate|bespoke|custom) (?:quiz(?:zes)?|trivia|cash bingo)\b|\bcash bingo fundraisers?\b|\bcustom (?:rounds?|questions)\b/i,
  },
  { claim: '"a full room most months" or "adult humour" at the quiz (C2-018, C2-029)', pattern: /\bfull room most months\b|\badult humour\b/i },
  {
    claim: 'sport nobody confirmed: "never miss a moment", "every major", the FA Cup, Channel 5, a promised view (C2-005, C2-009, C4-031)',
    pattern: /\bnever miss a moment\b|\bevery major (?:sport|sporting event|match|game|tournament)s?\b|\bFA Cup\b|\bChannel 5\b|\bview of the screen\b|\bguarantees? (?:you )?a good view\b/i,
  },
  {
    claim: 'weekly events, "Fish & Chips Fridays" or charity bingo (C3-019, C4-030)',
    pattern: /\bWeekly Events\b|\bweekly (?:quiz|entertainment|lineup|line-up)\b|\bFish (?:&|and) Chips Fridays?\b|\bcharity bingo\b/i,
  },
  { claim: '"live entertainment"; the SSOT records live music as stopped (C3-052, C1-046)', pattern: /\blive entertainment\b/i },
  // Core pages.
  {
    claim: 'the staff pay rate typed outside lib/constants.ts (C3-026)',
    pattern: /\b12\.71\b/,
    except: /^lib\/constants\.ts$/,
  },
  { claim: '"cheeky" (SSOT section 1)', pattern: /\bcheeky\b/i },
  { claim: "a locals' or loyalty card (C3-029)", pattern: /\blocals'? card\b|\bloyalty card\b/i },
  {
    claim: '"family-owned"; the SSOT says independently run (C4-051)',
    pattern: /\bfamily[- ](?:owned|run)\b/i,
    // A real customer's words in the approved Google reviews.
    except: /^lib\/google-reviews\.ts$/,
  },
  { claim: 'business accounts or monthly invoicing (C4-039)', pattern: /\bbusiness accounts?\b|\bmonthly invoic/i },
  {
    claim: 'children invited to run around in a garden that adjoins the car park (C4-056)',
    pattern: /\b(?:kids|children|little ones)\b[^.<]{0,40}\brun (?:around|about|free)\b|\broom to run\b/i,
  },
  {
    claim: "a builder's note shown to customers (C1-010, C3-049, C4-049)",
    pattern: /\bsearches before you (?:visit|book)\b|\bSee \/whats-on\b|\bpriced from the live approved source\b|\bpricing discussed on enquiry\b/i,
  },
  {
    claim: 'coach promises nobody confirmed: groups of around 50, a free driver meal, coach deals (C4-034)',
    pattern: /\bgroups of around 50\b|\bfree (?:driver|meal for (?:the|your) driver)\b|\bdrivers? eats? free\b|\bcoach (?:group )?deals?\b/i,
  },
  { claim: 'Baby Guinness sales figures (C3-040)', pattern: /\bhundreds every month\b|\btop seller\b/i },
  {
    claim: 'a confirmation "by SMS and email" on the parking page: the site cannot tell what was sent (owner, 8 October 2026)',
    pattern: /\b(?:SMS|text)(?: message)? and (?:an )?email\b|\bemail and (?:a )?(?:SMS|text)\b|\bconfirmation (?:text|email|SMS|by)\b/i,
    only: /^app\/heathrow-parking\//,
  },
]

/** P12 adds its own list below; both run through the same check. */
function offendersOf(rule: RemovedClaim, copy: Map<string, string>): string[] {
  const offenders: string[] = []
  for (const [file, text] of copy) {
    if (rule.only && !rule.only.test(file)) continue
    if (rule.except && rule.except.test(file)) continue
    for (const match of text.matchAll(new RegExp(rule.pattern.source, rule.pattern.flags.replace('g', '') + 'g'))) {
      const at = match.index ?? 0
      offenders.push(`${file}: "...${text.slice(Math.max(0, at - 40), at + match[0].length + 40)}..."`)
    }
  }
  return offenders
}

/**
 * A file's words on one line, with every comment gone. The older flatten() drops a
 * comment only when the line starts with one, so the second line of a JSX comment
 * that explains why a claim was removed would trip the rule that keeps it out.
 */
function withoutComments(file: string): string {
  let source: string
  try {
    source = readFileSync(join(ROOT, file), 'utf8')
  } catch {
    return ''
  }
  if (/\.tsx?$/.test(file)) {
    source = source
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .split('\n')
      .map(line => (/^\s*\/\//.test(line) ? '' : line))
      .join(' ')
  }
  return source
    .replace(/&pound;|\\u00a3/gi, '£')
    .replace(/&apos;|\\u2019|\u2019/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
}

function mainSiteCopy(): Map<string, string> {
  const files = customerFacingFiles().filter(file => !file.startsWith('content/blog/'))
  return new Map(files.map(file => [file, withoutComments(file)]))
}

describe('main site copy: claims removed by the October 2026 site review stay removed (P11)', () => {
  const copy = mainSiteCopy()

  it.each(REMOVED_BY_P11.map(rule => [rule.claim, rule] as const))('never brings back %s', (_claim, rule) => {
    expect(offendersOf(rule, copy)).toEqual([])
  })

  it('reads the homepage and the files that sit directly in lib/ and components/', () => {
    for (const file of ['app/page.tsx', 'app/layout.tsx', 'lib/constants.ts', 'lib/tag-seo-content.ts', 'lib/monthly-copy.ts', 'components/TestimonialSection.tsx']) {
      expect([...copy.keys()]).toContain(file)
    }
  })

  it('keeps one sentence each for luggage and for charging, in lib/approved-wording.ts', () => {
    const offenders: string[] = []
    for (const [file, text] of copy) {
      if (file === 'lib/approved-wording.ts') continue
      if (/We have luggage storage[.:]|Ask the bar team if you need to charge/i.test(text)) offenders.push(file)
    }
    expect(offenders).toEqual([])
    const ssot = readFileSync(join(ROOT, 'docs/SSOT.md'), 'utf8')
    expect(ssot).toContain('> We have luggage storage. Ask the bar team when you arrive.')
    expect(ssot).toContain('> Ask the bar team if you need to charge something.')
  })

  it('tells cash bingo players to arrive by 6:30pm, and the SSOT says so in both sections', () => {
    const ssot = readFileSync(join(ROOT, 'docs/SSOT.md'), 'utf8')
    expect(ssot).toContain('- **Arrive by 6:30pm · First game 7pm')
    expect(ssot).toContain('> Arrive by 6:30pm for a 7pm start.')
    expect(ssot).not.toMatch(/Use it for quiz night, both bingos/)
  })
})

// ---------------------------------------------------------------------------
// P12: comparisons, superlatives and customer quotes. A superlative or a
// comparison stays only where SSOT section 1 or 12 carries it in those words
// ("the closest traditional pub to Heathrow", "highly rated"). Page titles keep
// the search phrase ("cheap", "best") by the owner's ruling of 10 September
// 2026, which is why no rule here bans those two words outright.
// ---------------------------------------------------------------------------

const REMOVED_BY_P12: ReadonlyArray<RemovedClaim> = [
  {
    claim: 'a rival pub named or compared (C4-017)',
    pattern: /\bThe Swan\b|\bThe Bells\b|\bThe George \(|\bWetherspoons?\b|\bOstrich Inn\b|\bnearby alternatives\b|\bhow we compare\b|\bunlike (?:most|chain|other) pubs\b|\bbetter than tourist pubs\b|\bover other pubs in\b/i,
  },
  {
    claim: 'a price multiple with nothing on file: "half the price", "twice as much" (C4-018, C3-018)',
    pattern: /\bhalf the price\b|\bpay half\b|\btwice as much\b|\b3x the price\b|\bmassive savings\b|\bsignificantly (?:cheaper|lower)\b|\bmore reasonable prices than\b|\bcompetitive prices compared\b/i,
  },
  {
    claim: 'a value comparison with the airport, hotels or another town (C4-018, C3-018)',
    pattern: /\bbetter[- ]value (?:than|choice)\b|\bbetter prices\b|\bairport markup\b|\b(?:overpriced|expensive) (?:hotel|airport|terminal)\b|\btourist (?:prices|rates)\b|\bis superior\b|\badvantage over\b|\blower-cost alternative\b|\bcheaper (?:than|off-airport|local)\b/i,
    // An internal note on who a group of links is for; it is never rendered.
    except: /^lib\/seo\/organic-search-map\.ts$/,
  },
  {
    claim: 'parking that is the cheapest, the closest or cheaper than Heathrow (C4-008)',
    pattern: /\bcheapest\b|\bundercuts?\b|\bclosest (?:independent|parking)\b|\bbeat official\b|\bfaster than most\b|\bgetting pricier\b|\bprice promise\b|\bbefore prices rise\b/i,
    // Pages and components only: lib/ uses "cheapest" as a variable name for a menu's lowest price.
    only: /^(?:app|components)\//,
  },
  {
    claim: 'parking safety beyond floodlit, CCTV, level and keep your keys (C4-012)',
    pattern: /\b24\/7 access\b|\bstaff presence\b|\bresidents overlooking\b|\btrusted heathrow\b|\boverseen by the pub team\b|\babsolutely safe\b|\bsecure (?:long stay|parking|heathrow|car park)\b/i,
  },
  {
    claim: 'real, guest, traditional or well-kept ales; the pub has bottled ales only (C4-016)',
    pattern: /\b(?:traditional|authentic|real|guest|cask) ales?\b|\b(?:properly|well)[- ]kept (?:ales?|pint)\b|\bales on tap\b|\bproper British beer\b/i,
  },
  {
    claim: 'the closest or nearest pub to anywhere but Heathrow, or the "only" pub (C4-019)',
    pattern: /\b(?:closest|nearest) (?:village |independent |proper |traditional )?(?:British )?(?:pub|local)\b(?! to (?:Heathrow|Terminal 5|T5))|\bonly (?:traditional )?pub (?:left )?in\b/i,
  },
  {
    claim: 'queues and full tables nobody confirmed (C4-020)',
    pattern: /\bfill tables fast\b|\bqueues? at the door\b|\bfills up nicely\b|\bfighting for a table\b/i,
  },
  {
    claim: 'a neighbouring town or its pubs run down (C4-044)',
    pattern: /\ba bit samey\b|\bthin on the ground\b|\bisn't what it was\b|\blost a lot of its\b|\boptions thin out\b/i,
  },
  {
    claim: '"best" as a claim about us in a question or answer (C3-020, SSOT section 14)',
    pattern: /\bbest Sunday roast near\b|\bwhere's the best\b|\bbest (?:pub|restaurant) (?:in|near)\b/i,
    // Titles keep the search phrase; the link map holds those phrases.
    except: /^lib\/seo\/organic-search-map\.ts$/,
  },
  {
    claim: "what other pubs' roasts do, or a roast that is cooked, not carved, to order (C3-045)",
    pattern: /\bmost places near the airport\b|\bmost Sunday roasts near Heathrow\b|\broasts?\b[^.<]{0,40}\bcooked to order\b|\bmade-to-order roasts\b|\bunder a lamp\b/i,
  },
  {
    claim: 'the Google rating typed into a page; it is read from SSOT.json (C3-053)',
    pattern: /\b4\.6(?:&nbsp;| )?(?:stars?|rating)\b|\brated 4\.6\b|\b4\.6\/5\b|\b4\.6 out of\b/i,
    only: /^(?:app|components)\//,
  },
  { claim: 'a drink sold as the "most Instagrammable" or "famous" (C3-051)', pattern: /\bmost Instagram|\bfamous hot toddy\b/i },
]

describe('comparisons, superlatives and customer quotes removed by the October 2026 site review stay removed (P12)', () => {
  const copy = mainSiteCopy()

  it.each(REMOVED_BY_P12.map(rule => [rule.claim, rule] as const))('never brings back %s', (_claim, rule) => {
    expect(offendersOf(rule, copy)).toEqual([])
  })

  it('keeps alcohol strengths, brand superlatives and effect claims off the drinks list (C3-050, C3-051)', () => {
    const drinks = readFileSync(join(ROOT, 'content/menu/drinks.json'), 'utf8')
    // Strengths were typed in and never checked against the pump clips. "Peroni 0%" is a product name.
    expect(drinks.match(/\d(?:\.\d)?% ABV|kick at \d+%/gi) ?? []).toEqual([])
    expect(
      drinks.match(/world's (?:number one|best|most)|best-selling|'s finest|number one premium|most awarded|king of beers|since 1[0-9]{3}|legendary blend|Instagrammable/gi) ?? []
    ).toEqual([])
    // The advertising code: a drink is never sold on stamina, a boost or daring.
    expect(drinks.match(/stamina|extra boost|get you buzzing|dangerously|get the party started|live on the edge|cheeky/gi) ?? []).toEqual([])
  })

  it('credits a review with a comma, never a long dash (C1-043)', () => {
    const source = readFileSync(join(ROOT, 'components/TestimonialSection.tsx'), 'utf8')
    const rendered = source.replace(/\/\*[\s\S]*?\*\//g, ' ').split('\n').filter(line => !/^\s*\/\//.test(line)).join('\n')
    expect(rendered).not.toContain('&mdash;')
    expect(rendered).not.toContain(String.fromCharCode(8212))
  })
})
