/**
 * Approved wording, pasted from docs/SSOT.md section 16.
 *
 * Do not reword these here. If the wording has to change, change the block in
 * docs/SSOT.md section 16 first, then this file: the guard tests
 * (tests/allergen-wording-guard.test.ts, tests/access-wording-guard.test.ts)
 * fail when the two disagree.
 */

/**
 * SSOT section 16, "Getting in and around". The full block. Use it wherever a
 * page answers an access question or speaks to guests with mobility needs.
 * tests/access-wording-guard.test.ts fails if this and the SSOT disagree.
 */
export const ACCESS_WORDING =
  "Getting in from the car park is step free, and so are the bar and the dining area. The beer garden is step free straight from the car park. From inside, there's one step between the bar and the garden, and we'll put our ramp out for it if you ask. We don't have an accessible toilet. If you'd like to check what will work best for you, give us a call on 01753 682707 and we'll help."

/** SSOT section 16, "Getting in and around", the short form for a feature list. */
export const ACCESS_SHORT_WORDING =
  'Step free from the car park. One step from the bar, with a ramp on request.'

/**
 * The accessible toilet sentence from the full block, standing on its own. Pair
 * it with ACCESS_SHORT_WORDING wherever the short form is the only access line
 * on a page, so the one fact that decides a visit is never left out.
 */
export const NO_ACCESSIBLE_TOILET_WORDING = "We don't have an accessible toilet."

/**
 * Access, for structured data. "Step-free access: true" on its own is half a
 * fact (SSOT section 1, rule 4), so the value is the approved short form, and
 * the missing accessible toilet is stated beside it. Spread this into an
 * amenityFeature list; never type a step-free amenity into a page.
 */
export const ACCESS_AMENITY_FEATURES = [
  { '@type': 'LocationFeatureSpecification', name: 'Step-free access', value: ACCESS_SHORT_WORDING },
  { '@type': 'LocationFeatureSpecification', name: 'Accessible toilet', value: false },
] as const

/** SSOT section 16, "NGCI". */
export const NGCI_WORDING =
  "NGCI means No Gluten Containing Ingredients. These dishes are made without gluten-containing ingredients, but everything is prepared in one kitchen, so we can't guarantee there's no cross-contamination."

/**
 * The one-kitchen sentence from the SSOT section 16 NGCI block, standing on its
 * own. Use it wherever NGCI or an allergy is mentioned without the full block.
 */
export const ONE_KITCHEN_WORDING =
  "Everything is prepared in one kitchen, so we can't guarantee there's no cross-contamination."

/** SSOT section 16, "The Wellington". */
export const WELLINGTON_WORDING =
  "Fully vegan as it comes. Ask if you'd like buttered cabbage or a Yorkshire pudding added, both of which make the plate no longer vegan."

/**
 * SSOT sections 5 and 16, "Allergens, when the data is missing". Missing data
 * means unknown, not safe: never render "no allergens" in its place.
 */
export const ALLERGEN_UNKNOWN_WORDING = 'See menu or contact us for allergen information'

/**
 * The one dietary sentence for private hire (wakes, the near-you pages and any
 * other private booking copy).
 *
 * Owner ruling, 7 October 2026: we never promise nut-free, dairy-free or halal
 * for a private booking, but we do our best. So this asks people to tell us and
 * carries the one-kitchen sentence. It names no diet and makes no promise.
 */
export const PRIVATE_HIRE_DIETARY_WORDING =
  `Tell us about any allergies or dietary needs when you book and we'll do our best. ${ONE_KITCHEN_WORDING}`

/** Question heading that goes with PRIVATE_HIRE_DIETARY_WORDING in an FAQ. */
export const PRIVATE_HIRE_DIETARY_QUESTION = 'What about allergies and dietary needs?'

/*
 * Money wording. Every sentence below is in docs/SSOT.md section 16, and
 * tests/money-wording-guard.test.ts fails when the two disagree. None of these
 * is used to work out a price: they only say what the management app charges.
 */

/** SSOT section 16, "Group deposit". */
export const GROUP_DEPOSIT_WORDING =
  'Groups of 15 or more: a £10 per person deposit, fully deducted from your bill.'

/**
 * SSOT section 16, "Refunds on a group deposit". The bands are the SSOT
 * section 7 table. Not for Christmas: a Christmas deposit has its own rule,
 * which the booking form prints from the management app.
 */
export const GROUP_DEPOSIT_REFUND_WORDING =
  "Need to cancel? 7 or more days before, your deposit is refunded in full. 3 to 6 days before, half is refunded. Fewer than 3 days before, it isn't refunded."

/** SSOT section 16, "Refunds on event tickets". The same section 7 bands. */
export const EVENT_TICKET_REFUND_WORDING =
  "Need to give up your seats? 7 or more days before, your tickets are refunded in full. 3 to 6 days before, half is refunded. Fewer than 3 days before, they aren't refunded. If we cancel the night, you get a full refund."

/** SSOT section 16, "Private hire deposit". Never pair it with the group deposit. */
export const PRIVATE_HIRE_DEPOSIT_WORDING =
  "A £250 booking and damage deposit secures your date. It's held separately from your bill and refunded after the event, less any documented deductions."

/**
 * SSOT section 16, "Room hire". Wakes are charged like any other booking
 * (SSOT section 11), so nothing may say room hire is included or free.
 */
export const ROOM_HIRE_WORDING = 'Room hire is charged by the hour for the space you book.'

/**
 * SSOT section 16, "Airport parking refund" (owner decision 2, 7 October 2026).
 * The parking FAQ, the four terminal pages, the terms on the parking page and
 * SSOT.json all carry this one sentence.
 */
export const PARKING_REFUND_WORDING =
  'You can change or cancel your parking booking up to 24 hours before your booked arrival time, and a cancelled booking is refunded less the payment fee.'

/**
 * SSOT section 16, "Christmas party of more than 20" (owner decision 7,
 * 7 October 2026). Follow it with PRIVATE_HIRE_DEPOSIT_WORDING.
 */
export const CHRISTMAS_PRIVATE_DEPOSIT_WORDING =
  'A Christmas party of more than 20 is a private booking, so it pays the private hire deposit, not £10 per person.'

/*
 * Everyday facts: parking, taxis, dogs, families, sport. Every sentence below
 * is in docs/SSOT.md section 16, and tests/one-home-for-facts-guard.test.ts
 * fails when the two disagree, or when a page types one of them again instead
 * of importing it from here.
 */

/** SSOT section 16, "Parking". The only way to describe free guest parking. */
export const PARKING_WORDING =
  "We've 20 free spaces right outside. There's no time limit while you're with us, and nothing to register."

/** SSOT section 16, "Parking", for a coach. */
export const COACH_PARKING_WORDING =
  "A small coach fits in our car park. A full-size coach needs to park on the main road, where it's safe to."

/** SSOT section 16, "Taxis". Never "we'll book", "we'll call" or "we can arrange". */
export const TAXI_WORDING =
  "Ask at the bar and we'll give you a taxi number. You'll need to make your own arrangements."

/** SSOT section 16, "Dogs". Throughout the pub, any time we're open, on a lead. */
export const DOGS_WORDING =
  "Dogs are welcome throughout the pub, on a lead. We'll have water bowls and biscuits waiting."

/** SSOT section 16, "Families". Carries the one "no": there is no baby changing. */
export const FAMILIES_WORDING =
  "High chairs, buggy space and bottle warming on request are all here, and breastfeeding is welcome. We don't have baby changing facilities."

/**
 * Children and the clock. SSOT section 8: children are welcome at all hours,
 * with no age cut-off. Never type a curfew ("until 8pm", "until 9pm").
 */
export const CHILDREN_WELCOME_WORDING = 'Children are welcome at all hours.'

/** SSOT section 16, "Sport". Terrestrial channels only. */
export const SPORT_WORDING =
  "We show live sport on BBC, ITV and Channel 4. We don't have Sky Sports or TNT Sports."

/** SSOT section 16, "Sport", for the Six Nations. */
export const SIX_NATIONS_WORDING =
  'We show Six Nations games that are on BBC, ITV or Channel 4, on 4 TVs with the commentary on. Call us on 01753 682707 to check a particular game.'

/** SSOT section 16, "Sport", for commentary on other sport. */
export const COMMENTARY_WORDING = "The commentary's on for big games and tournaments."

/**
 * SSOT sections 2 and 14. We say we're outside the ULEZ zone, and stop: whether
 * a driver pays depends on their vehicle and their route, so nothing may follow
 * about a charge, a saving or a fee.
 */
export const ULEZ_WORDING = "We're outside the ULEZ zone."
