export {}

import { readFileSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

import {
  ACCESS_AMENITY_FEATURES,
  ACCESS_SHORT_WORDING,
  ACCESS_WORDING,
  NO_ACCESSIBLE_TOILET_WORDING,
} from '@/lib/approved-wording'

// docs/SSOT.md section 16, "Getting in and around", is the only wording for
// access. Section 1 rule 4: access copy states the route, never a single
// adjective. Section 8: there is no accessible toilet. Owner fact 25
// (7 October 2026): there is no marked disabled parking bay.
//
// The 7 October 2026 site review found a 2019 post saying "Wheelchair
// accessible throughout", another promising "Designated disabled parking",
// two private hire pages answering an access question with "Yes" and nothing
// about the toilet, and "Step-free access: true" in the structured data of
// every page. tests/accessibility-route-wording.test.ts already read all of
// those files and passed, because it had no pattern for any of them. These are
// the patterns.

const ROOT = join(__dirname, '..')

/** The one file allowed to hold the access wording and the access amenity. */
const WORDING_FILE = 'lib/approved-wording.ts'

function customerFacingFiles(): string[] {
  const out = execSync(
    "git ls-files 'app/**/*.tsx' 'app/**/*.ts' 'components/**/*.tsx' 'components/**/*.ts' 'lib/**/*.ts' 'content/**/*.md'",
    { cwd: ROOT, encoding: 'utf8' }
  )
  return out
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean)
    .filter((f) => f !== WORDING_FILE)
    .filter((f) => !/(?:\.test\.|__tests__\/)/.test(f))
}

// A sentence that says we do NOT have something must pass: "we don't have an
// accessible toilet" and "there's no marked disabled parking bay" are the
// honest lines the SSOT asks for. So a match is let through when a negation
// sits earlier in the same sentence.
const NEGATION = /\b(?:no|not|never|without|don't|don&apos;t|do not|doesn't|does not|isn't|is not|aren't|are not|can't|cannot)\b[^.!?]*$/i

const FORBIDDEN: ReadonlyArray<readonly [RegExp, string]> = [
  // A question may ask "Is The Anchor wheelchair accessible?". A statement may not.
  [/wheelchair[- ]accessible(?!\?)/i, 'never call the pub wheelchair accessible: paste SSOT section 16'],
  [/disabled (?:parking|bays?|spaces?)/i, 'there is no marked disabled parking bay (owner fact 25)'],
  [/accessib(?:le|ility) for (?:all|everyone)/i, 'not accessible for all: there is no accessible toilet'],
  [/access for (?:all|everyone)/i, 'not accessible for all: there is no accessible toilet'],
  [/step[- ]free access (?:is available )?to most/i, 'say where the one step is: paste SSOT section 16'],
  [/access to most areas/i, 'say where the one step is: paste SSOT section 16'],
  [/(?:fully|completely) accessible(?! (?:via|by|from)\b)/i, 'not fully accessible: there is no accessible toilet'],
  [/accessible (?:venue|pub|throughout)/i, '"accessible" as a bare adjective: state the route and the toilet'],
  [/title:\s*["']Accessible["']/, '"Accessible" as a card heading: state the route and the toilet'],
  [/entirely on the ground floor|ground[- ]floor venue/i, 'not an SSOT fact: paste SSOT section 16'],
  // Structured data: the amenity comes from ACCESS_AMENITY_FEATURES only.
  [/name["']?:\s*["']Step-free access/i, 'spread ACCESS_AMENITY_FEATURES, never type a step-free amenity'],
  [/name["']?:\s*["'](?:Disabled|Accessible) Parking/i, 'there is no marked disabled parking bay (owner fact 25)'],
]

function offendersIn(text: string, label: string): string[] {
  const found: string[] = []
  text.split('\n').forEach((line, i) => {
    for (const [pattern, why] of FORBIDDEN) {
      const match = pattern.exec(line)
      if (!match) continue
      if (NEGATION.test(line.slice(0, match.index))) continue
      found.push(`${label}:${i + 1} (${why})`)
    }
  })
  return found
}

describe('access wording comes from docs/SSOT.md section 16', () => {
  const ssot = readFileSync(join(ROOT, 'docs/SSOT.md'), 'utf8')

  it('matches the SSOT blocks word for word', () => {
    expect(ssot).toContain(`> ${ACCESS_WORDING}`)
    expect(ssot).toContain(`> ${ACCESS_SHORT_WORDING}`)
    expect(ACCESS_WORDING).toContain(NO_ACCESSIBLE_TOILET_WORDING)
  })

  it('gives structured data the short form and the missing toilet, never a bare "true"', () => {
    expect(ACCESS_AMENITY_FEATURES).toEqual([
      { '@type': 'LocationFeatureSpecification', name: 'Step-free access', value: ACCESS_SHORT_WORDING },
      { '@type': 'LocationFeatureSpecification', name: 'Accessible toilet', value: false },
    ])
  })
})

describe('no page describes access in words the SSOT rules out', () => {
  it('fails on the retired lines', () => {
    const retired = [
      '- Wheelchair accessible throughout',
      '- Designated disabled parking',
      'a ground-floor venue with step-free access from the car park, making it accessible for all.',
      'Relaxed atmosphere, buffet options, and easy access for all colleagues.',
      'Step-free access is available to most areas.',
      "We're 7 minutes from Heathrow with free parking, step-free access to most areas and a warm welcome.",
      'A comfortable and accessible venue for all your guests',
      'Yes. The venue is entirely on the ground floor, including the private hire area.',
      '{ title: "Accessible", description: "Ground floor access and easy parking make it suitable for guests of all ages." }',
      '{ "@type": "LocationFeatureSpecification", "name": "Step-free access", "value": true },',
      "{ '@type': 'LocationFeatureSpecification', name: 'Step-free access to most areas', value: true },",
      '"name": "Disabled Parking",',
    ]
    for (const line of retired) {
      expect(offendersIn(line, 'retired')).not.toEqual([])
    }
  })

  it('passes the approved wording, an honest denial and a question', () => {
    const allowed = [
      ACCESS_WORDING,
      ACCESS_SHORT_WORDING,
      NO_ACCESSIBLE_TOILET_WORDING,
      "We don't have an accessible toilet.",
      'There is no marked disabled parking bay.',
      "We don't have disabled parking bays, but the car park is level and close to the door.",
      "We can't call the pub wheelchair accessible, because there's no accessible toilet.",
      'Is The Anchor wheelchair accessible?',
      "question: 'Can I bring a wheelchair or mobility aid?',",
      'Check for step-free access, ground-floor facilities, and accessible parking.',
      'We are easily accessible via the A30 and perimeter roads.',
      "['Step-free access', 'Step-free from the car park through to the bar and dining area.'],",
    ]
    for (const line of allowed) {
      expect(offendersIn(line, 'allowed')).toEqual([])
    }
  })

  it('finds none of them in the site', () => {
    const offenders: string[] = []
    for (const file of customerFacingFiles()) {
      let contents: string
      try {
        contents = readFileSync(join(ROOT, file), 'utf8')
      } catch {
        continue
      }
      offenders.push(...offendersIn(contents, file))
    }
    expect(offenders).toEqual([])
  })
})

describe('the pages the review named carry the approved wording', () => {
  const read = (file: string): string => readFileSync(join(ROOT, file), 'utf8')

  it.each([
    'app/cash-bingo/page.tsx',
    'app/music-bingo/page.tsx',
    'app/karaoke/page.tsx',
    'app/find-us/page.tsx',
    'app/accessibility/page.tsx',
    'app/about/the-anchor-facts/page.tsx',
    'app/book-table/page.tsx',
    'app/private-hire/christenings/page.tsx',
    'app/private-hire/wakes/page.tsx',
    'app/live-sport/six-nations/page.tsx',
    'app/live-sport/world-cup/page.tsx',
  ])('%s renders ACCESS_WORDING from the shared constant', (file) => {
    const source = read(file)
    expect(source).toMatch(/import \{[^}]*\bACCESS_WORDING\b[^}]*\} from '@\/lib\/approved-wording'/)
    expect(source).not.toContain('Getting in from the car park is step free')
  })

  it('the retirement page pairs the short form with the accessible toilet sentence', () => {
    const source = read('app/private-hire/retirement-parties/page.tsx')
    expect(source).toContain('`${ACCESS_SHORT_WORDING} ${NO_ACCESSIBLE_TOILET_WORDING}`')
  })

  it.each([
    'content/blog/wake-venue-near-heathrow/index.md',
    'content/blog/how-to-plan-christening-reception/index.md',
    'content/blog/christening-party-ideas-venues/index.md',
  ])('%s carries the full block, as a post cannot import it', (file) => {
    expect(read(file)).toContain(ACCESS_WORDING)
  })

  it.each([
    'lib/schema-with-reviews.ts',
    'lib/schema.ts',
    'app/about/page.tsx',
    'app/about/the-anchor-facts/page.tsx',
    'app/heathrow-family-dining/page.tsx',
    'app/private-hire/page.tsx',
    'app/private-hire/baby-showers/page.tsx',
    'app/private-hire/christenings/page.tsx',
    'app/private-hire/wakes/page.tsx',
    'app/private-hire/near/[slug]/page.tsx',
    'app/pubs-in-stanwell/page.tsx',
  ])('%s takes its access amenity from ACCESS_AMENITY_FEATURES', (file) => {
    expect(read(file)).toContain('...ACCESS_AMENITY_FEATURES')
  })
})
