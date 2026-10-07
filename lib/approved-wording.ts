/**
 * Approved allergen and dietary wording, pasted from docs/SSOT.md section 16.
 *
 * Do not reword these here. If the wording has to change, change the block in
 * docs/SSOT.md section 16 first, then this file: tests/unit/approved-wording.test.ts
 * fails when the two disagree.
 */

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
