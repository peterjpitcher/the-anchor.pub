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
    // Renamed from live_music_nights to event_nights on 2026-08-11 when live
    // music was discontinued. The rule itself still applies to any event night.
    expect(ssot.food.kitchen_hours.event_nights).toContain(
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

  it('states the per-person course rule, never a whole-table one', () => {
    // Courses are chosen per person (owner-confirmed 2026-08-04): a main each,
    // starter and dessert optional. Both the retired whole-table course promise
    // and the older blanket "pre-order only" claim must stay out.
    expect(ssot.private_hire.christmas_sit_down_meals).toContain(
      'courses are chosen per person',
    )
    expect(ssot.private_hire.christmas_sit_down_meals).toContain(
      'every guest has a main, a starter and a dessert are optional',
    )
    expect(ssot.private_hire.christmas_sit_down_meals).not.toContain(
      'pre-book only',
    )
    expect(mdPlain).not.toContain(
      'Christmas lunch and dinner bookings are available by pre-order only',
    )
  })
})

describe('SSOT drift guard, Christmas 2026 (owner-confirmed 2026-07-21)', () => {
  const xmas = ssot.christmas_2026

  it('service window is 10 Nov to 20 Dec 2026 inclusive in both files', () => {
    expect(xmas.service_window.start).toBe('2026-11-10')
    expect(xmas.service_window.end).toBe('2026-12-20')
    expect(xmas.service_window.end_inclusive).toBe(true)
    expect(xmas.service_window.display).toBe('10 November to 20 December 2026')
    expect(ssot.private_hire.christmas_2026_service_window).toContain(
      '2026-11-10 to 2026-12-20',
    )
    expect(mdPlain).toContain('10 November to 20 December 2026')
    // The superseded window may only survive as a banned claim, never as an offer.
    expect(mdPlain).toContain(
      'The previously published 1 November to 23 December window is superseded',
    )
  })

  it('minimum party size is 4 on every day, and minimum notice is 24 hours', () => {
    // Owner-confirmed 6 September 2026: 4 guests, regardless of the day. An
    // earlier reading of the same conversation had this as 4 midweek and 6 at
    // the weekend and was corrected the same day.
    expect(xmas.booking_rules.min_party_size).toBe(4)
    expect(xmas.booking_rules.min_party_size_by_day).toBeUndefined()
    expect(xmas.booking_rules.min_notice_hours).toBe(24)
    expect(xmas.booking_rules.same_day_bookings).toBe(false)
    expect(mdPlain).toContain('4 guests, on every Christmas dinner booking, regardless of the day')
    expect(mdPlain).toContain('Minimum notice: 24 hours.')
    // Neither retired rule may come back in the prose.
    expect(mdPlain).not.toContain('Minimum party size: 6 guests.')
    expect(mdPlain).not.toContain('4 guests Tuesday to Thursday')
  })

  it('keeps the Christmas minimum off the Sunday roast, which has none', () => {
    expect(ssot.sunday_roast.booking_policy.advance_booking_required).toBe(false)
    expect(ssot.sunday_roast.booking_policy.walk_ins_welcome).toBe(true)
    expect(mdPlain).toContain('Sunday roast has no minimum party size at all')
  })

  it('records the Christmas Day drinks-only hours and forbids a food claim', () => {
    // Owner-confirmed 6 September 2026. Christmas Day sits outside the
    // 10 November to 20 December window, so the page said nothing at all.
    expect(xmas.christmas_day.food_service).toBe(false)
    expect(xmas.christmas_day.opens).toBe('12:00')
    expect(xmas.christmas_day.closes).toBe('15:00')
    expect(mdPlain).toContain('On 25 December we open for drinks only, 12pm to 3pm')
    expect(mdPlain).toMatch(/no food service at all on Christmas Day/i)
  })

  it('records the Boxing Day and New Year\'s Day closures, and the confirmed rest of the festive run', () => {
    // Owner-confirmed 8 September 2026. Both dates are closures, not offers:
    // "pubs open boxing day near me" and "pubs open new year's day" are real
    // search clusters, and the honest answer is that we are shut.
    expect(xmas.christmas_day.boxing_day.open).toBe(false)
    expect(xmas.christmas_day.boxing_day.date).toBe('2026-12-26')
    expect(xmas.christmas_day.new_years_day.open).toBe(false)
    expect(xmas.christmas_day.new_years_day.date).toBe('2027-01-01')
    expect(mdPlain).toContain('We do not open on 26 December or 1 January')
    // Owner-confirmed 9 September 2026. Until then 27 to 31 December was held
    // as unconfirmed; it is now open, with the kitchen closed from 21 December.
    expect(xmas.christmas_day.between_christmas_and_new_year).toMatch(/^CONFIRMED/)
    expect(xmas.christmas_day.between_christmas_and_new_year).not.toMatch(/NOT CONFIRMED/)
    expect(xmas.christmas_day.kitchen_festive_closure.last_service).toBe('2026-12-20')
    expect(xmas.christmas_day.kitchen_festive_closure.returns).toBe('2027-01-12')
    expect(mdPlain).toContain('The kitchen serves up to and including Sunday 20 December, then closes until Tuesday 12 January')
    expect(mdPlain).not.toContain('27 to 31 December remain unconfirmed')
  })

  it('records the Wellington as vegan as it comes, with the non-vegan extras on request', () => {
    // Owner-confirmed 9 September 2026. The descriptions in both menu tables
    // had listed a Yorkshire pudding and buttery cabbage on the vegan dish.
    expect(mdPlain).toContain('The plate as it comes is vegan.')
    expect(mdPlain).toContain('The kitchen makes no unbuttered cabbage')
    expect(mdPlain).toContain('Fully vegan as it comes.')
  })

  it('no longer contradicts itself on Christmas dishes or the festive buffet minimum', () => {
    // Both were contradictions inside the SSOT, removed in the 10 September 2026
    // restructure. A section that bans what another section requires cannot be followed.
    expect(mdPlain).not.toContain('Only "menu released closer to the time" is permitted')
    expect(mdPlain).not.toContain('Any earlier "30 everywhere, no exceptions" wording is wrong')
    // The JSON mirror still mandated the retired line until 10 September 2026.
    expect(JSON.stringify(ssot)).not.toMatch(/only permitted wording is 'menu released closer to the time'/i)
  })

  it('does not give the unsafe ?? advice for kitchen hours', () => {
    // `??` falls back on null, and null is the value that means the kitchen is closed.
    expect(mdPlain).not.toContain('Use ?? (not ||) when resolving special vs. regular kitchen data')
    expect(mdPlain).toContain('fall back to the regular week only when the date has no override at all')
  })

  it('defers to the management app for hours, and does not claim the festive rows are missing', () => {
    // Owner-confirmed 8 September 2026: the SSOT always adheres to the
    // management app's business hours. It transcribes, it never asserts.
    expect(mdPlain).toContain('The SSOT always adheres to the management app')
    expect(mdPlain).toContain('All three dates are already set in the management app')
    // The 90-day horizon on GET /business/hours made a correctly-set closure
    // look unset. Keep the explanation next to the fact so the same false
    // alarm cannot be raised twice.
    expect(mdPlain).toContain('only returns special hours for the next 90 days')
    expect(xmas.christmas_day.source_of_truth).toMatch(/management app/i)
  })

  it('records the 21 to 29 band and the drinks-only party rule', () => {
    expect(xmas.group_size_bands.private_booking_band).toBe('21 to 29 seated guests')
    expect(xmas.drinks_only_party.minimum_spend).toBeNull()
  })

  it('pre-order is required for 2 and 3 course only', () => {
    expect(xmas.booking_rules.pre_order_required_by_course).toEqual({
      one_course: false,
      two_course: true,
      three_course: true,
    })
    expect(xmas.booking_rules.pre_book_required_by_course).toEqual({
      one_course: true,
      two_course: true,
      three_course: true,
    })
  })

  it('deposit is £10pp on every Christmas booking regardless of party size', () => {
    expect(xmas.deposit.per_person_gbp).toBe(10)
    expect(xmas.deposit.applies_regardless_of_party_size).toBe(true)
    expect(xmas.deposit.taken_at_booking).toBe(true)
    expect(mdPlain).toContain(
      '£10 per person on every Christmas booking, regardless of party size.',
    )
  })

  it('Christmas deposit includes the London day seven days before the booking', () => {
    // Owner-confirmed 5 September 2026, after an independent review found the site
    // promising a non-refundable deposit while the management app was refunding it up
    // to 7 days out. The management app owns the real setting; if that cutoff ever
    // moves, this number and the copy below move with it, or the site again describes
    // a rule the booking system does not apply.
    expect(xmas.deposit.refundable).toBe(true)
    expect(xmas.deposit.refund_cutoff_days).toBe(7)
    expect(mdPlain).toContain(
      'Refundable in full if the booking is cancelled up to and including seven days before the booking date',
    )
  })

  it('general deposit thresholds are 14-or-fewer free, 15+ paid, 20+ private hire', () => {
    // Raised from 10 to 15 on 2026-08-09. The management app carries the same number in
    // LARGE_GROUP_DEPOSIT_THRESHOLD and in resolve_table_booking_deposit; if this test is
    // ever edited, that pair has to move with it or the site quotes a rule the till does
    // not charge.
    expect(mdPlain).toContain('14 guests or fewer: No deposit')
    expect(mdPlain).toContain('15 or more guests: £10 per person')
    expect(mdPlain).toContain(
      'More than 20 guests: This is not a table booking, it is private hire',
    )
    expect(mdPlain).toContain(
      'manager@the-anchor.pub, 01753 682707, or WhatsApp 01753 682707',
    )
  })

  it('there is no kids 2-course or 3-course tier', () => {
    expect(xmas.tiers.one_course.kids).toBe(true)
    expect(xmas.tiers.two_course.kids).toBe(false)
    expect(xmas.tiers.three_course.kids).toBe(false)
    expect(xmas.tiers.no_kids_multi_course).toContain(
      'NO kids 2 course and NO kids 3 course',
    )
    expect(mdPlain).toContain('There is no kids 2 course or 3 course.')
  })

  it('festive buffet minimum is 30 guests everywhere', () => {
    expect(xmas.buffets.status).toBe('ACTIVE')
    expect(xmas.buffets.min_guests).toBe(30)
    expect(ssot.private_hire.christmas_buffets).toBe('Available for 30+ guests')
    for (const pkg of ssot.private_hire.catering_packages.christmas) {
      if (pkg.style === 'sit-down') continue
      expect(pkg.min_guests).toBe(30)
    }
    expect(mdPlain).toContain('Minimum 30 guests, everywhere, no exceptions.')
  })

  it('the sit-down course tiers are the three-tier structure at the Christmas dinner minimum', () => {
    // Owner-confirmed 10 September 2026: the private-hire Christmas set menu has
    // the same 4-guest minimum as a Christmas dinner table booking. These tiers
    // said 6 until then, left behind by the 6 September change.
    const sitDown = ssot.private_hire.catering_packages.christmas.filter(
      (p: { style?: string }) => p.style === 'sit-down',
    )
    expect(sitDown.map((p: { name: string }) => p.name)).toEqual([
      'Christmas Dinner (1 course)',
      'Christmas Dinner (2 course)',
      'Christmas Dinner (3 course)',
    ])
    for (const tier of sitDown) {
      expect(tier.min_guests).toBe(xmas.booking_rules.min_party_size)
      expect(tier.price_per_head_gbp).toBe('LIVE_FROM_DB')
      // No catering_packages row holds these tiers (mirrored 11 September 2026):
      // they live on the Christmas menu and the Christmas booking period.
      expect(tier.not_a_catering_packages_row).toBe(true)
    }
    // The retired weekday/weekend two-price split must not come back.
    const names = ssot.private_hire.catering_packages.christmas
      .map((p: { name: string }) => p.name)
      .join(' ')
    expect(names).not.toContain('Festive Menu (weekday)')
    expect(names).not.toContain('Festive Menu (weekend)')
  })

  it('records the old Festive Menu catering packages as switched off', () => {
    // Both rows (a weekday and a weekend price, minimum 6) are inactive in the
    // management app, mirrored 11 September 2026. The SSOT had said they must
    // stay active, which would have brought back the two-price split and the 6.
    expect(xmas.festive_menu_catering_packages).toMatch(/^SWITCHED OFF\./)
    expect(xmas.festive_menu_catering_packages).toContain('1, 2 and 3 course Christmas menu')
    expect(mdPlain).toContain('The old Festive Menu catering packages are switched off.')
    expect(mdPlain).toContain('refers only to the latest offer, the 1, 2 and 3 course Christmas menu')
    expect(mdPlain).not.toContain('The festive menu catering packages stay.')
    expect(JSON.stringify(ssot)).not.toMatch(/REMAIN ACTIVE|Do not deactivate them/)
  })

  it('menu dishes are published, and only the API may name one', () => {
    // Changed 13 August 2026: the dish list is live on the Christmas booking
    // period and the page renders it. The guard still exists to stop a dish
    // being invented, it just no longer pins the pre-publication wording.
    expect(xmas.menu_status).toBe('PUBLISHED')
    expect(xmas.menu_rule).toContain('Never list, guess, pad or imply a dish the API did not return')
    expect(mdPlain).toContain('Menu dishes ARE published')
    // The retired wording must not linger anywhere in the SSOT prose.
    expect(mdPlain).not.toContain('Menu dishes are NOT finalised')
  })

  it('inclusions and trimmings are pinned', () => {
    expect(xmas.included.adults).toContain('prosecco')
    expect(xmas.included.adults).toContain('orange juice')
    // Owner-corrected 15 August 2026, and wrong in SSOT.json until 6 September
    // 2026. The "all three tiers" wording reached the live page and two
    // marketing emails before it was caught the first time, so the tier
    // restriction is pinned in both directions: it must be stated, and the
    // retracted wording must not reappear anywhere in the SSOT.
    expect(xmas.included.adults).toContain('2 and 3 course')
    expect(xmas.included.adults).not.toMatch(/all three tiers/i)
    expect(JSON.stringify(ssot)).not.toMatch(/prosecco[^"]*all three (?:Christmas )?tiers/i)
    expect(mdPlain).not.toMatch(/prosecco[^.]*all three tiers/i)
    expect(xmas.included.children).toContain('Fruit Shoot')
    expect(xmas.trimmings).toEqual([
      'Pigs in blankets',
      'Stuffing',
      'Brussels sprouts',
      'Yorkshire pudding',
      'Roast potatoes',
      'Mashed potato',
      'Peas',
    ])
  })

  it('the vegan Wellington is excepted from the meat trimmings', () => {
    // A Yorkshire pudding contains egg and milk and a pig in a blanket is pork,
    // so the full trimmings list must never be applied to the vegan main. The
    // Sunday roast already encodes this rule; Christmas has to agree with it.
    expect(xmas.trimmings_vegan_exception).toContain('no Yorkshire pudding')
    expect(xmas.trimmings_vegan_exception).toContain('no pigs in blankets')
    expect(mdPlain).toContain('The Vegetable Wellington is the exception')

    const wellington = ssot.sunday_roast.options.find((o: { name: string }) =>
      /wellington/i.test(o.name)
    )
    expect(wellington.yorkshire_pudding).toBe(false)
  })

  it('Christmas prices are live-sourced, never hardcoded in the shipped shape', () => {
    expect(xmas.price_source).toBe('LIVE_FROM_DB')
    // The owner-confirmed figures are provenance only. They live behind an
    // underscore key so the customer-facing walker never picks them up.
    expect(Object.keys(xmas)).toContain('_price_provenance_DO_NOT_PUBLISH')
    expect(custBlob).not.toContain('33.95')
    expect(custBlob).not.toContain('39.95')
  })
})

describe('SSOT drift guard, allergen fallback wording', () => {
  const FALLBACK = 'See menu or contact us for allergen information'

  it('uses the approved fallback string in both files', () => {
    expect(ssot.food.allergen_display_rule.fallback_string).toBe(FALLBACK)
    expect(ssot.christmas_2026.allergen_fallback).toBe(FALLBACK)
    expect(mdPlain).toContain(FALLBACK)
  })

  it('bans "no allergens" when allergen data is missing', () => {
    expect(ssot.food.allergen_display_rule.rule).toContain(
      "Never render 'no allergens'",
    )
    expect(mdPlain).toContain('never render "no allergens"')
  })
})

describe('SSOT drift guard — pricing policy (no hardcoded food prices)', () => {
  it('Christmas and catering scalars are not hardcoded numbers', () => {
    const ph = ssot.private_hire
    for (const key of [
      'christmas_menus_from_gbp',
      'christmas_one_course_gbp',
      'christmas_two_course_gbp',
      'christmas_three_course_gbp',
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
    ['a heated beer garden', /heated areas|heated (?:beer )?garden/],
    ['a covered beer garden', /covered (?:seating|section|garden|patio)|sheltered areas/],
  ]

  it.each(banned)('does not contain %s', (_label, re) => {
    expect(custBlob).not.toMatch(re)
  })
})

describe("SSOT drift guard, the owner's answers of 11 September 2026", () => {
  const events = ssot.events

  it('gives the quiz winners a £25 bar voucher, not a bar tab', () => {
    // A tab is spent on the night and a voucher later, so they are different
    // promises. The quiz records said voucher while the SSOT said tab.
    expect(events.quiz_night.prizes.first).toBe('£25 bar voucher')
    expect(events.quiz_night.prizes.second_from_last).toBe('Bottle of house wine')
    expect(mdPlain).toContain('the winning team gets a £25 bar voucher, not a bar tab')
    expect(mdPlain).not.toMatch(/£25 bar tab/i)
  })

  it('seats each quiz team at its own table', () => {
    expect(events.quiz_night.seating).toContain('each team has its own table')
    expect(mdPlain).toContain('Seating: team tables. Each team has its own table, so book one table per team.')
  })

  it('finishes every event by 10pm, bar the special nights', () => {
    expect(events.finish_rule).toMatch(/^Events finish by 10pm/)
    expect(events._finish_rule_confirmed).toContain('Owner-confirmed 2026-09-11')
    expect(events.music_bingo.end).toMatch(/^Runs until 10pm/)
    expect(mdPlain).toContain('Events finish by 10pm.')
    expect(mdPlain).toContain('Runs until 10pm, under the finish rule at the top of this section')
    // New Year's Eve keeps its 1am, reconfirmed the same day.
    expect(mdPlain).toContain("We stay open until 1am on New Year's Eve. (Owner-confirmed, 16 August 2026, and reconfirmed 11 September 2026.)")
  })

  it('names Peter Pitcher as the karaoke host', () => {
    expect(events.karaoke.host).toMatch(/^Peter Pitcher, the owner\./)
    expect(events.karaoke.host).toContain('NOT hosted by Nikki Manfadge')
    expect(mdPlain).toContain('Host: Peter Pitcher, the owner. (Owner-confirmed, 11 September 2026.)')
    expect(mdPlain).not.toContain('Karaoke has no fixed host')
    expect(JSON.stringify(ssot)).not.toContain('No fixed host')
  })

  it('records Curry Club as discontinued in both files', () => {
    expect(events.curry_club.status).toBe('DISCONTINUED')
    expect(events.curry_club.retired_routes).toEqual([
      '/blog/curry-club-the-anchor redirects to /food-menu (owner-approved 2026-09-11)',
    ])
    expect(events.curry_club.schedule).toBeUndefined()
    expect(ssot.do_not_use.curry_club).toMatch(/^DISCONTINUED/)
    expect(md).toContain('### Curry Club, DISCONTINUED')
    expect(mdPlain).toContain('Curry Club is discontinued. (Owner-confirmed, 11 Sep 2026.)')
    expect(mdPlain).toContain('Curry Club, or a curry night, discontinued')
    expect(mdPlain).not.toContain('Monthly rotating curry-night specials')
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

  // Customer-facing files outside those folders. llms.txt is how AI assistants
  // describe the pub, and it claimed gluten-free bases until 10 September 2026
  // because nothing here read it.
  const CUSTOMER_FILES = ['public/llms.txt']

  const siteFiles = [
    ...CUSTOMER_DIRS.flatMap((dir) => collectFiles(path.join(process.cwd(), dir))),
    ...CUSTOMER_FILES.map((file) => path.join(process.cwd(), file)),
  ]

  function matchingFiles(pattern: RegExp): string[] {
    return siteFiles
      .filter((file) => pattern.test(fs.readFileSync(file, 'utf8')))
      .map((file) => path.relative(process.cwd(), file))
      .sort()
  }

  // Section 14 claims are checked one sentence at a time, so the honest "no"
  // that section 1 asks for stays allowed. A denial before the match passes
  // ("the garden isn't covered"), and so does one straight after it ("Baby
  // changing facilities -- no", `"value": false`). A denial further on does
  // not, so "covered and heated areas make it usable year-round, though you
  // won't be lingering in a t-shirt" still fails. A question passes too: "Do
  // you do gluten free bases?" asks rather than claims. `files` skips whole
  // files (an entry ending in "/" skips a directory); `sentence` lets through a
  // sentence about something the claim is true of.
  const DENIAL = /\b(?:no|not|never|without|false|cannot)\b|n't\b/i

  function claimSentences(claim: RegExp, exempt: { files?: string[]; sentence?: RegExp } = {}): string[] {
    const skipFile = (file: string) =>
      (exempt.files ?? []).some((entry) => (entry.endsWith('/') ? file.startsWith(entry) : file === entry))
    return siteFiles
      .map((file) => path.relative(process.cwd(), file))
      .filter((file) => !skipFile(file))
      .flatMap((file) =>
        fs
          .readFileSync(file, 'utf8')
          .split(/\n|(?<=[.!?])\s+/)
          .map((sentence) => sentence.replace(/&apos;|&rsquo;|&#39;|’|\\'/g, "'"))
          .filter((sentence) => {
            const match = claim.exec(sentence)
            if (match === null || exempt.sentence?.test(sentence)) return false
            if (/^[^.!\n]*\?/.test(sentence.slice(match.index))) return false
            const end = match.index + match[0].length
            return !DENIAL.test(sentence.slice(0, match.index)) && !DENIAL.test(sentence.slice(end, end + 30))
          })
          .map((sentence) => `${file}: ${sentence.trim()}`),
      )
  }

  const SECTION_14_CLAIMS: Array<[string, RegExp, string[]]> = [
    [
      'gluten-free food, bases or menus (NGCI instead)',
      /gluten[- ]free (?:alternatives?|bases?|batter|diets?|dish(?:es)?|fish|food|fryer|menu|options?|pizzas?|requirements|swaps?)\b|(?:made|is|are|be) gluten[- ]free\b|cater(?:s|ing)? for [^.?!\n]{0,40}gluten[- ]free/i,
      // Section 5 keeps the search phrase in the NGCI page's title and meta
      // description on purpose, and menu-page-data.ts reads the legacy
      // "gluten-free base" wording out of live dish data. Neither is a claim.
      ['app/food-menu/gluten-free/page.tsx', 'lib/menu-page-data.ts'],
    ],
    [
      'a secure, enclosed or off-lead garden',
      /secure(?:ly)? (?:fenc|enclosed|outdoor|garden|environment)|safe(?:ly)?,? enclosed|enclosed (?:beer garden|garden|grassy|and safe|by fencing|so you)|(?:garden|terrace)[^.\n]{0,30}\b(?:is|are) (?:fully |safely )?(?:enclosed|fenced|secure)\b|safe area for children|off[- ]lead in\b/i,
      [],
    ],
    [
      'doggy dinners or meals for dogs',
      /dog(?:gy|gie)? (?:sunday )?(?:dinners?|meals?|menu)\b|meals? for (?:your )?(?:dog|pup)|dog-safe meals?|pawsome platter/i,
      [],
    ],
    [
      'baby changing facilities',
      /(?:baby[- ]chang\w*|\bchanging)\W{0,4}(?:facilit|tables?\b|rooms?\b|areas?\b)/i,
      [],
    ],
    [
      'accessible facilities',
      /(?:with|including|offers?|has|have)\s+accessible (?:toilets?|loos?|wc|facilities)|^\s*[-*]\s*accessible facilities\s*$/i,
      [],
    ],
    [
      'cooling or year-round comfort',
      /year[- ]round comfort|air[- ]?condition(?:ed|ing)|climate[- ]controlled|cool in (?:the )?summer/i,
      [],
    ],
    [
      'EV charging',
      /(?:\bev|electric vehicle|trickle)[- ]charg[^.\n]{0,40}coming soon|coming soon[^.\n]{0,40}charg|electric vehicle friendly/i,
      [],
    ],
    ['beef dripping', /beef[- ]dripping/i, []],
    [
      'shared Christmas party nights as an offer',
      /(?:spectacular|our|join (?:us|our)|book (?:a|your|our)) (?:christmas )?party nights?|looking for christmas party nights/i,
      [],
    ],
    [
      'a retired Sunday roast',
      /\blamb\b|roast(?:ed)? chicken|pork belly|cauliflower cheese/i,
      // Dated posts may describe the menu of their day; menu-page-data.ts holds
      // the filter that keeps these dishes off the live menu pages.
      ['content/blog/', 'lib/menu-page-data.ts'],
    ],
  ]

  it.each(SECTION_14_CLAIMS)('does not claim %s', (_label, claim, exemptFiles) => {
    expect(claimSentences(claim, { files: exemptFiles })).toEqual([])
  })

  it('does not reintroduce the retired Christmas wording or deny wedding receptions', () => {
    // "Menu released closer to the time" was retired on 13 August 2026 (sections
    // 7 and 14), prosecco comes with the 2 and 3 course tiers only (section 7),
    // and since 17 August 2026 we take wedding receptions without marketing them.
    expect(
      matchingFiles(
        /released closer to the time|still finalising the christmas|(?:every|each|all) (?:adults?|tiers?)[^.\n]{0,40}prosecco|prosecco[^.\n]{0,60}(?:all three|every|each) (?:tiers?|adults?)|(?:do not|don't|never) (?:host|take|offer) wedding/i,
      ),
    ).toEqual([])
  })

  it('does not state the retired 6-guest Christmas dinner minimum', () => {
    // Section 7: 4 guests on every Christmas dinner booking since 6 September
    // 2026. The change left six statements in three posts and one on the live
    // page, in forms a search for "6 guests" misses: a "6-guest minimum", "6 to
    // 20" group bands, "at least 6" and a comparison table. Found 10 September.
    expect(
      matchingFiles(
        /\b(?:6|six)-guest minimum|\b(?:6|six) to 20\b|\bat least (?:6|six)\b[^\n]*table booking|group minimum[^\n]*\b(?:6|six) guests|christmas set menu[^\n]*\b(?:starts at|works from|from) (?:6|six) guests/i,
      ),
    ).toEqual([])
  })

  it('does not hardcode volatile review stats', () => {
    // Section 12: show the 4.6 rating, never a review count. /our-pub carried
    // "238&nbsp;reviews" until 10 September 2026, which a plain "238 reviews"
    // search missed, so any number of reviews fails here, however it is spaced.
    expect(
      matchingFiles(
        /\b\d[\d,]{1,5}(?:\s|&nbsp;)*\+?(?:\s|&nbsp;)*(?:google(?:\s|&nbsp;)+)?reviews\b|238 Google|Highest-rated|highest-rated/i,
      ),
    ).toEqual([])
  })

  it('never publishes a runway designator (section 9)', () => {
    // The 27 August 2026 fix cleared /beer-garden and /plane-spotting-heathrow;
    // eight more were still in a blog post on 10 September.
    expect(matchingFiles(/\b(?:27|09)[LR]\b/)).toEqual([])
  })

  // Shared by the two superlative checks below: guides that rank other places,
  // the genuine Google reviews, and text that is not our own claim (a
  // frontmatter keyword, a `keywords:` array, a quote, or a quote's attribution).
  const COMPARISON_GUIDES = [
    'content/blog/best-beer-gardens-near-heathrow/index.md',
    'content/blog/best-places-to-eat-near-heathrow/index.md',
    'content/blog/best-pub-food-near-heathrow/index.md',
    'content/blog/best-sunday-roast-surrey/index.md',
    'content/blog/heathrow-plane-spotting-locations/index.md',
    'content/blog/pizza-near-heathrow/index.md',
    'content/blog/quiz-nights-near-heathrow/index.md',
    'content/blog/things-to-do-near-heathrow/index.md',
  ]
  const SUPERLATIVE_EXEMPT_FILES = [...COMPARISON_GUIDES, 'lib/google-reviews.ts', 'lib/google/review-utils.ts']
  const NOT_OUR_CLAIM = /^\s*- [a-z0-9 &'-]+$|\bkeywords:|^\s*(?:[-*>]\s*)?["“]|["”]\s*-\s*[A-Z]/

  it('does not call the pub the best or premier (section 14)', () => {
    // Section 14 bans "best" and "premier" without substantiation: say "highly
    // rated" instead. About 125 had built up by September 2026, in forms like
    // "the best pub near Heathrow", "Stanwell Moor's premier pub" and "one of
    // the best pubs near Egham". Still allowed: a searcher's question ("Looking
    // for the best roast near Heathrow?"), advice ("best for families", "the
    // best way to get here"), and everything exempted above.
    const SELF_SUPERLATIVE = new RegExp(
      [
        /\bpremier\b(?![- ](?:league|inn)\b)/,
        /\btop[- ]rated\b/,
        /\bone of the best (?:pubs?|places|spots?|bars?|venues?)\b/,
        /\b(?:stanwell moor|staines|heathrow)'s (?:\*\*)?best\b(?!-)/,
        /\bwe(?:'re| are)(?: known for)? the best\b/,
        /\bbest (?!(?:for|of|to|way|ways|time|times|option|options|bet|use|venues|places|pubs|spots|things|walks|views)\b)(?:(?!to\b)[\w&'*-]+ ){0,4}(?:in|near|around) (?:\*\*)?(?:heathrow|staines|stanwell|terminal|t5|the area|town|tw19)\b/,
      ]
        .map((part) => part.source)
        .join('|'),
      'i',
    )
    expect(
      claimSentences(SELF_SUPERLATIVE, { files: SUPERLATIVE_EXEMPT_FILES, sentence: NOT_OUR_CLAIM }),
    ).toEqual([])
  })

  it('does not say "best" in other words either (section 14)', () => {
    // Owner-approved 10 September 2026, after the "best" and "premier" sweep:
    // "unbeatable prices", "the ultimate spot", "the warmest welcome in
    // Stanwell Moor" and "unmatched standards" make the same claim. A line
    // about someone else ("Scotland's finest distilleries"), a slug and a
    // code identifier are not ours.
    expect(
      claimSentences(
        /\bunbeatable\b|(?<![-/])\bultimate\b(?!-)|\bfinest\b|\bwarmest\b|\bunmatched\b|\bunrivall?ed\b|\bsecond to none\b|\bno better (?:place|way|spot|pub|venue|setting)\b|\bnowhere better\b|\bhottest\b/i,
        {
          files: [...SUPERLATIVE_EXEMPT_FILES, 'app/[...unmatched]/page.tsx'],
          sentence: new RegExp(`${NOT_OUR_CLAIM.source}|\\b(?:Europe|Scotland|England|Ireland|Wales|Italy|France)'s finest\\b`),
        },
      ),
    ).toEqual([])
  })

  it('does not contradict the cash bingo format (section 10)', () => {
    // Cash bingo runs on set Wednesdays (not every month), with ten games and prizes that
    // vary by event. Until 10 September 2026 a post promised first Thursdays,
    // three games and a guaranteed £50 jackpot, and a New Year post repeated
    // "First Thursday Bingo".
    expect(
      claimSentences(/\bfirst thursday\b|\b(?:three|3) games\b|£50 (?:cash )?jackpot|guaranteed £50|win (?:up to )?£50/i),
    ).toEqual([])
  })

  it('never says which wind brings the planes (section 9)', () => {
    // Owner decision, 10 September 2026: nobody here knows which wind brings
    // aircraft over the garden, so the site does not say. Section 9 had said
    // westerly operations cover about half the year, and pages turned that into
    // "westerly winds bring aircraft overhead". The weekly 3pm alternation is
    // the only timing we give.
    expect(
      claimSentences(/\b(?:westerly|easterly|westerlies|easterlies)\b|\bwind direction\b|\bwinds? (?:from the|brings?|favours?)\b/i),
    ).toEqual([])
    expect(md).not.toMatch(/\*\*Westerly operations:\*\*/)
    expect(ssot.beer_garden?.westerly_operations).toBeUndefined()
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
        /accessible loos|accessible toilets|10[–-]20 guests|10[–-]50|10 to 50|(?<!no )minimum spend|(?<!no )min spend|projector screen|use of projector|projector available|Early-Bird|early bird|early-bird|20% off your food|£36\.95|£39\.95|£29\.56/i,
      ),
    ).toEqual([])
  })

  it('does not claim the beer garden is heated (owner-confirmed 2026-09-10)', () => {
    // "Heated areas" was once listed as a garden feature in the SSOT and
    // spread to a dozen pages from there. Indoor heating ("the heating keeps
    // things cosy") never matches.
    expect(
      claimSentences(
        /heated (?:areas?|spots?|(?:beer )?gardens?|terrace|patio|outdoor|outside)|(?:garden|terrace)[^.\n]{0,60}\b(?:is|are) heated|heated in winter|patio heaters?|outdoor heat(?:ing|ers?)/i,
      ),
    ).toEqual([])
  })

  it('does not show the old food photo with a lamb shank on it (section 4)', () => {
    // Lamb is not served on any menu, but this photo has a lamb shank on it. On
    // 10 September 2026 it was still the hero on four pages and DEFAULT_FOOD_IMAGE,
    // which puts it in the site-wide Restaurant JSON-LD. The file stays in public/
    // because Cloudflare caches images for a year; nothing may point at it.
    expect(matchingFiles(/page-headers\/food-menu\/food-menu\.jpg/)).toEqual([])
  })

  it('does not list the retired Chicken, Ham Hock & Leek Pie (section 5)', () => {
    // No longer served, owner-confirmed 10 September 2026. SSOT.json keeps the name
    // only under food.removed_items, which the customer-facing walk skips.
    expect(matchingFiles(/ham hock/i)).toEqual([])
    expect(custBlob).not.toMatch(/ham hock/)
  })

  it('does not bring back the menu and comparison claims corrected on 10 September 2026', () => {
    // A pizza the menu does not have, vegan pizzas and a vegan burger the live vegan list
    // does not include, sandwiches and salads, a 7:30pm quiz start (section 10 says 7pm),
    // steaks, a roast "at weekends", cheaper-than-hotel figures with no source, and a
    // veggie burger said not to come from a catering supplier when its patty does.
    expect(
      matchingFiles(
        /meat feast|vegetarian and vegan options (?:are available|such as)|available in vegetarian and vegan options|made vegan on request \(swap the mozzarella|vegan burger\*\*, loaded|fresh sandwiches\*\* and wraps|healthy salads\*\*|The Anchor\*\*, Stanwell Moor \| Monthly \(Wednesdays\) \| 7:30pm|steaks and pub classics|\*\*Sunday Roast\*\* \(weekends\)|40[–-]50% lower than hotel|roughly half what you'd pay|two to six times more at a hotel|frozen disc from a catering supplier/i,
      ),
    ).toEqual([])
  })

  it('keeps discontinued entertainment out of llms.txt (section 10)', () => {
    // llms.txt still listed live music a month after it stopped in full.
    const llms = fs.readFileSync(path.join(process.cwd(), 'public/llms.txt'), 'utf8')
    expect(llms).not.toMatch(/live music|live bands?|open mic|drag cabaret/i)
  })

  it('does not claim any of the beer garden is covered (owner-confirmed 2026-09-10)', () => {
    // The smoking area is covered, so a sentence about it is exempt.
    expect(
      claimSentences(
        /covered (?:seating|sections?|areas?|patio|garden|terrace|tables?)|sheltered (?:areas?|seating|spots?|garden)|(?:garden|terrace)[^.\n]{0,60}\b(?:is|are) (?:covered|sheltered)/i,
        { sentence: /smok/i },
      ),
    ).toEqual([])
  })
})
