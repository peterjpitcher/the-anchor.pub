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
