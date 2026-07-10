/**
 * SSOT drift-guard — fails loudly if docs/SSOT.md and SSOT.json ever
 * disagree on high-value, customer-facing brand facts, or if a banned
 * claim is reintroduced into a customer-facing JSON value.
 *
 * Background: docs/SSOT.md is the human-edited canonical source; SSOT.json
 * is its structured mirror (consumed at build time by menu/schema helpers and
 * scripts/audit-menu-pages.js). The two
 * have drifted in the past (founding year, email, parking, party-size cap,
 * "19th century" footer, Stanwell Moor Brew). This test pins the facts that
 * matter so a future edit to one file without the other cannot ship silently.
 *
 * Parsing of the Markdown is deliberately pragmatic: we assert on stable
 * substrings, not a full Markdown parse, so cosmetic edits don't break it.
 */

import fs from 'fs'
import path from 'path'

const ssot = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'SSOT.json'), 'utf8'),
)
const md = fs.readFileSync(path.join(process.cwd(), 'docs', 'SSOT.md'), 'utf8')

// Normalise whitespace so multi-space / newline differences don't cause
// false negatives on substring checks.
const mdFlat = md.replace(/\s+/g, ' ')
// Same, but with Markdown emphasis markers stripped, so bold/italic around a
// value (e.g. "**Max online party size:** 20") doesn't break substring checks.
const mdPlain = mdFlat.replace(/[*_`]/g, '')
// Positive customer-facing JSON string values only. We deliberately skip:
//  - internal guidance/governance blocks (do_not_use, resolved_inconsistencies,
//    RESOLVED notes, _comment-style keys, naming_rule, CORRECTION) which name
//    banned terms in order to ban them; and
//  - negation / discontinuation / history containers (does_NOT_have,
//    discontinued_*, removed_*, retired_*, live_sport_note, dining_room_history)
//    which legitimately name a banned thing to say it is NOT offered / is gone /
//    is historical. The audit confirms each of these is correct, not a breach
//    (e.g. the George Best 1995 wedding-reception line is building history, and
//    "TNT Sports" appears only under does_NOT_have).
// What remains is the genuinely promotional surface, where a banned term WOULD
// be a real reintroduction.
function customerFacingStrings(): string[] {
  const out: string[] = []
  const INTERNAL_KEY =
    /^(\$|_)|RESOLVED|do_not_use|resolved_inconsistencies|note$|_note$|naming_rule|CORRECTION|discontinued|removed|retired|does_NOT_have|dining_room_history|greene_king_partnership/i
  function walk(node: unknown, keyHint: string): void {
    if (typeof node === 'string') {
      out.push(node)
      return
    }
    if (Array.isArray(node)) {
      node.forEach((v) => walk(v, keyHint))
      return
    }
    if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        if (INTERNAL_KEY.test(k)) continue
        walk(v, k)
      }
    }
  }
  // Skip the top-level governance/guidance blocks entirely.
  const SKIP_TOP = new Set([
    'do_not_use',
    'resolved_inconsistencies',
    'discontinued_offers',
    // SEO/config metadata, not customer-facing copy: domains, schema IDs,
    // social/directory links (incl. the whatpub backlink), analytics IDs.
    // (seo_keywords is intentionally NOT skipped: a banned term like "real ale"
    // sneaking into the keyword set would be a genuine reintroduction.)
    'digital',
    'meta',
    '$schema',
    '$comment',
    '_canonical_source',
    '_pricing_policy',
    '_strategy_doc',
  ])
  for (const [k, v] of Object.entries(ssot)) {
    if (SKIP_TOP.has(k)) continue
    walk(v, k)
  }
  return out
}
const custStrings = customerFacingStrings()
const custBlob = custStrings.join('  ').toLowerCase()

describe('SSOT drift guard — contact & location', () => {
  it('phone number agrees across both files', () => {
    expect(ssot.contact.phone.display).toBe('01753 682707')
    expect(ssot.contact.phone.e164).toBe('+441753682707')
    expect(mdFlat).toContain('01753 682707')
  })

  it('email agrees and is the only correct address', () => {
    expect(ssot.contact.email.primary).toBe('manager@the-anchor.pub')
    expect(mdFlat).toContain('manager@the-anchor.pub')
  })

  it('postcode and street agree across both files', () => {
    expect(ssot.location.address.postcode).toBe('TW19 6AQ')
    expect(ssot.location.address.street).toBe('Horton Road')
    expect(ssot.location.address.town).toBe('Stanwell Moor')
    expect(mdFlat).toContain('TW19 6AQ')
    expect(mdFlat).toContain('Horton Road')
    expect(mdFlat).toContain('Stanwell Moor')
  })
})

describe('SSOT drift guard — heritage & reputation', () => {
  it('founding year is 1751 in JSON and stated in the MD', () => {
    expect(ssot.identity.founding_year).toBe(1751)
    expect(mdFlat).toContain('1751')
  })

  it('shows the 4.6 Google rating but never a hardcoded review count', () => {
    expect(ssot.ratings.google.rating).toBe(4.6)
    expect(ssot.ratings.google.review_count).toBe('LIVE_SOURCE_REQUIRED')
    expect(ssot.ratings.google.volatility).toContain('Do not show or hardcode a review count')
    expect(mdPlain).toContain('Do not show or hardcode a review count')
  })
})

describe('SSOT drift guard — booking policy', () => {
  it('max online party size is 20 in JSON and stated in the MD', () => {
    expect(ssot.sunday_roast.booking_policy.max_online_party_size).toBe(20)
    // MD §4 and §7 should both say 20 (aligned to the live booking flow).
    // Use the emphasis-stripped copy so bold markers around the value don't matter.
    expect(mdPlain).toContain('Max online party size: 20')
    expect(mdPlain).toContain('20 guests. Larger groups must call')
    // The old contradictory "10 guests" copy must be gone.
    expect(mdPlain).not.toContain('10 guests. Larger groups must call')
  })

  it('kitchen hours are live-source only', () => {
    expect(ssot.food.kitchen_hours._source).toBe('LIVE_FROM_MANAGEMENT_API')
    expect(ssot.food.kitchen_hours.policy).toContain('Do not hardcode')
    expect(ssot.food.kitchen_hours.live_music_nights).toContain(
      'Do not claim late food service',
    )
    expect(mdPlain).toContain('Only ever use the API')
    expect(mdPlain).toContain('Do not claim late food')
  })
})

describe('SSOT drift guard — private hire policy', () => {
  it('private hire capacity and facilities match the reviewed SSOT', () => {
    expect(ssot.private_hire.capacity).toBe('10+ to 150 guests')
    expect(ssot.venue.capacity.private_hire).toBe('10+ to 150 guests')
    expect(ssot.private_hire.room_hire_charge).toContain(
      'do not publish minimum-spend wording',
    )
    expect(ssot.private_hire.av_equipment).toBe('TVs and sound system. No projector.')
    expect(mdPlain).toContain('10+ – 150 guests')
    expect(mdPlain).toContain('Do not publish minimum-spend wording')
    expect(mdPlain).toContain('no projector')
  })

  it('keeps sit-down Christmas meals pre-order only', () => {
    expect(ssot.private_hire.christmas_sit_down_meals).toContain('pre-order only')
    expect(ssot.private_hire.christmas_2026_service_window).toContain('2026-11-01 to 2026-12-23')
    expect(mdPlain).toContain('Christmas lunch and dinner bookings are available by pre-order only')
    expect(mdPlain).toContain('1 November to 23 December 2026')
  })
})

describe('SSOT drift guard — pricing policy (no hardcoded food prices)', () => {
  it('Christmas and catering scalars are not hardcoded numbers', () => {
    const ph = ssot.private_hire
    for (const key of [
      'christmas_menus_from_gbp',
      'christmas_menus_weekday_gbp',
      'christmas_menus_weekend_gbp',
      'catering_buffet_from_gbp',
      'catering_sitdown_from_gbp',
    ]) {
      expect(typeof ph[key]).toBe('string')
      expect(ph[key]).toBe('LIVE_FROM_DB')
    }
  })

  it('no "£14" food price leaks via the Stacks correction strings', () => {
    // do_not_use is governance text; check the customer-facing corrections.
    expect(ssot.food.CORRECTION_2026_03_22).not.toContain('£14')
  })
})

describe('SSOT drift guard — banned strings absent from customer-facing JSON', () => {
  const banned: Array<[string, RegExp]> = [
    ['real ale positioning', /real ale/],
    ['CAMRA', /camra/],
    ['whatpub as a claim', /whatpub/],
    ['Sky Sports', /sky sports/],
    ['TNT Sports', /tnt/],
    ['wedding reception as an offer', /wedding reception/],
    ['Stanwell Moor Brew as a current product', /stanwell moor brew/],
  ]

  it.each(banned)('does not contain %s', (_label, re) => {
    expect(custBlob).not.toMatch(re)
  })
})

describe('SSOT drift guard — high-risk site copy', () => {
  const CUSTOMER_DIRS = ['app', 'components', 'content/blog', 'lib']
  const CUSTOMER_EXTS = new Set(['.ts', '.tsx', '.md', '.json'])

  function collectFiles(dir: string): string[] {
    if (!fs.existsSync(dir)) return []

    const entries = fs.readdirSync(dir, { withFileTypes: true })
    return entries.flatMap((entry) => {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.next') return []
        return collectFiles(fullPath)
      }
      return CUSTOMER_EXTS.has(path.extname(entry.name)) ? [fullPath] : []
    })
  }

  const siteFiles = CUSTOMER_DIRS.flatMap((dir) =>
    collectFiles(path.join(process.cwd(), dir)),
  )

  function matchingFiles(pattern: RegExp): string[] {
    return siteFiles
      .filter((file) => pattern.test(fs.readFileSync(file, 'utf8')))
      .map((file) => path.relative(process.cwd(), file))
      .sort()
  }

  it('does not hardcode volatile review stats', () => {
    expect(
      matchingFiles(
        /238 Google|238 reviews|Highest-rated|highest-rated/i,
      ),
    ).toEqual([])
  })

  it('does not hardcode old kitchen-hour or late-food claims', () => {
    expect(
      matchingFiles(
        /Kitchen closed Mondays?|kitchen closed Mondays?|Tue-Fri 4pm-9pm|Tuesday to Friday 4pm-9pm|Open Tuesday to Sunday|Food served .*Tuesday to Sunday|kitchen open until midnight|food (?:served|available).*midnight/i,
      ),
    ).toEqual([])
  })

  it('does not reintroduce old private-hire and Christmas-price copy', () => {
    expect(
      matchingFiles(
        /accessible loos|accessible toilets|10[–-]20 guests|10[–-]50|10 to 50|minimum spend|min spend|projector screen|use of projector|projector available|Early-Bird|early bird|early-bird|20% off your food|£36\.95|£39\.95|£29\.56/i,
      ),
    ).toEqual([])
  })
})
