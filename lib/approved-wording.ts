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
