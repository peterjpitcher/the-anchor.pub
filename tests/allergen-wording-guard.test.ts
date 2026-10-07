export {}

import { readFileSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'
import {
  ALLERGEN_UNKNOWN_WORDING,
  NGCI_WORDING,
  ONE_KITCHEN_WORDING,
  PRIVATE_HIRE_DIETARY_WORDING,
  WELLINGTON_WORDING
} from '@/lib/approved-wording'

// Allergy promises the kitchen cannot keep, found by the 7 October 2026 review
// on Book a Table, the wakes page, eighteen private hire pages and the brochures:
//
// - "nut-free options": we never promise nut-free, dairy-free or halal for a
//   private booking (owner ruling, 7 October 2026). We do our best, and say so.
// - "gluten free is possible": "gluten-free" is a regulated claim one shared
//   kitchen cannot make (docs/SSOT.md sections 5 and 14).
// - "can accommodate most common allergies" and "Do you cater for allergies?
//   Absolutely": both promise an outcome. Everything is prepared in one kitchen.
//
// The guard reads copy sentence by sentence. A sentence that says we do NOT do
// the thing ("we can't promise nut-free") is an honest denial and passes: only
// a sentence that offers it fails.

const ROOT = join(__dirname, '..')

const BANNED: Array<{ label: string; pattern: RegExp }> = [
  { label: 'nut-free', pattern: /nut[- ]free/i },
  { label: 'gluten free is possible', pattern: /gluten[- ]free is possible/i },
  { label: 'accommodate most', pattern: /accommodate most/i },
  { label: 'cater for allergies', pattern: /cater(?:s|ing)? for (?:all |any |most )?allerg/i }
]

// Words that turn the sentence into a denial, when they come before the phrase.
const DENIAL = /\b(?:not|never|no|cannot|can['’]?t|don['’]?t|won['’]?t|isn['’]?t|aren['’]?t|unable|without)\b/i

function copyFiles(): string[] {
  const out = execSync(
    "git ls-files 'app/**/*.tsx' 'app/**/*.ts' 'components/**/*.tsx' 'components/**/*.ts' 'lib/**/*.ts' 'content/**/*.md' 'content/**/*.mdx' 'content/**/*.json' 'content/**/*.ts'",
    { cwd: ROOT, encoding: 'utf8' }
  )
  return out
    .split('\n')
    .map((file) => file.trim())
    .filter(Boolean)
    .filter((file) => !/__tests__\/|\.(?:test|spec)\.tsx?$/.test(file))
}

/** The file as a reader would see the words: code comments dropped, entities decoded. */
function copyText(file: string): string {
  let contents: string
  try {
    contents = readFileSync(join(ROOT, file), 'utf8')
  } catch {
    return ''
  }
  const isCode = /\.tsx?$/.test(file)
  const lines = contents
    .split('\n')
    .map((line) => (isCode && /^\s*(?:\/\/|\/\*|\*)/.test(line) ? '' : line))
    .map((line) => line.replace(/&apos;|&rsquo;|&#39;/g, "'"))
  return isCode ? lines.join(' ').replace(/\s+/g, ' ') : lines.join('\n').replace(/[ \t]+/g, ' ')
}

/** Sentences and fragments: split at sentence ends, line ends and tag edges. */
const pieces = (text: string): string[] => text.split(/(?<=[.!?]["']?)\s+|[<>\n]/)

/** The banned phrases a piece of copy offers. An honest denial offers nothing. */
function offences(piece: string): string[] {
  return BANNED.filter(({ pattern }) => {
    const match = pattern.exec(piece)
    if (!match) return false
    return !DENIAL.test(piece.slice(0, match.index))
  }).map(({ label }) => label)
}

describe('allergen wording guard', () => {
  it('finds no allergy promise in app/, components/, content/ or lib/', () => {
    const offenders: string[] = []
    const files = copyFiles()

    for (const file of files) {
      for (const piece of pieces(copyText(file))) {
        for (const label of offences(piece)) {
          offenders.push(`${file}: "${label}" in "${piece.trim().slice(0, 140)}"`)
        }
      }
    }

    expect(files.length).toBeGreaterThan(100)
    expect(offenders).toEqual([])
  })

  it('fails on each promise the review found', () => {
    const promises = [
      'We can provide vegetarian, vegan, NGCI and nut-free options for mixed groups.',
      'A nut free buffet is available.',
      'Gluten free is possible on request.',
      'We offer vegetarian and vegan options and can accommodate most common allergies.',
      'Do you cater for allergies?',
      'Our kitchen caters for allergies of every kind.'
    ]

    for (const promise of promises) {
      expect(offences(promise)).not.toEqual([])
    }
  })

  it('lets an honest denial through', () => {
    const denials = [
      "We can't promise nut-free food, because everything is prepared in one kitchen.",
      'We never promise a nut-free, dairy-free or halal menu for a private booking.',
      'We do not say gluten free is possible for any dish.',
      'We cannot accommodate most severe allergies with certainty.',
      "We don't cater for allergies with a separate kitchen."
    ]

    for (const denial of denials) {
      expect(offences(denial)).toEqual([])
    }
  })

  it('does not let a denial in one sentence excuse a promise in the next', () => {
    const text = "We don't have a separate fryer. We offer nut-free options."
    expect(pieces(text).flatMap(offences)).toEqual(['nut-free'])
  })
})

describe('approved allergen wording matches docs/SSOT.md section 16', () => {
  const ssot = readFileSync(join(ROOT, 'docs/SSOT.md'), 'utf8')
  const start = ssot.indexOf('## 16. Approved Wording')
  const end = ssot.indexOf('\n## 17.', start)
  const section16 = ssot.slice(start, end)

  it('finds section 16', () => {
    expect(start).toBeGreaterThan(-1)
    expect(end).toBeGreaterThan(start)
  })

  it.each([
    ['NGCI', NGCI_WORDING],
    ['The Wellington', WELLINGTON_WORDING],
    ['Allergens, when the data is missing', ALLERGEN_UNKNOWN_WORDING]
  ])('pastes the "%s" block word for word', (_heading, wording) => {
    expect(section16).toContain(`> ${wording}`)
  })

  it('takes the one-kitchen sentence from inside the NGCI block', () => {
    const lowered = ONE_KITCHEN_WORDING.charAt(0).toLowerCase() + ONE_KITCHEN_WORDING.slice(1)
    expect(NGCI_WORDING).toContain(lowered)
  })

  it('makes no promise in the private hire sentence, and carries the one-kitchen sentence', () => {
    expect(PRIVATE_HIRE_DIETARY_WORDING).toContain(ONE_KITCHEN_WORDING)
    expect(PRIVATE_HIRE_DIETARY_WORDING).toMatch(/when you book and we'll do our best/)
    expect(PRIVATE_HIRE_DIETARY_WORDING).not.toMatch(/nut|dairy|halal|vegan|vegetarian|NGCI|guarantee (?:that|you)|absolutely/i)
    expect(offences(PRIVATE_HIRE_DIETARY_WORDING)).toEqual([])
  })
})
