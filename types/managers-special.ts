/**
 * Type definitions for Manager's Special promotions
 * Simplified schema with single pricing only and runtime validation
 */

export type ManagersSpecial = {
  id: string
  startDate: `${number}-${number}-${number}` // YYYY-MM-DD
  endDate: `${number}-${number}-${number}`   // YYYY-MM-DD
  imageFolder: string
  active: boolean
  spirit: {
    name: string
    category: string
    originalPrice: string   // e.g. "4.00" (GBP)
    specialPrice: string    // e.g. "3.00" (GBP)
    discount: "25% OFF"
    description?: string
    longDescription?: string
    tastingNotes?: string[]
    servingSuggestions?: string[]
    botanicals?: string[]
    abv?: string
    origin?: string
    distillery?: string
  }
  education?: {
    story: string
    whyPicked: string
    flavourProfile: string
    perfectServe: string
    foodPairings: string[]
    tryIfYouLike: string[]
    barTeamTip: string
    glossary: Array<{
      term: string
      definition: string
    }>
  }
  promotion: {
    headline: string
    subheadline?: string
    offerText: string
    ctaText?: string
    metaTitle: string
    metaDescription: string
    heroAlt?: string // accessibility for main image
  }
}

export type ManagersSpecialFile = { 
  promotions: ManagersSpecial[] 
}

/**
 * API Response types
 */
export type ManagersSpecialAPIResponse = 
  | { status: 'none', active: false }
  | (ManagersSpecial & { active: true })

/**
 * Validation helpers
 */
export function isValidPromotion(promo: any): promo is ManagersSpecial {
  return (
    promo &&
    typeof promo.id === 'string' &&
    typeof promo.startDate === 'string' &&
    typeof promo.endDate === 'string' &&
    typeof promo.imageFolder === 'string' &&
    typeof promo.active === 'boolean' &&
    promo.spirit &&
    typeof promo.spirit.name === 'string' &&
    typeof promo.spirit.category === 'string' &&
    typeof promo.spirit.originalPrice === 'string' &&
    typeof promo.spirit.specialPrice === 'string' &&
    promo.promotion &&
    typeof promo.promotion.headline === 'string' &&
    typeof promo.promotion.metaTitle === 'string' &&
    typeof promo.promotion.metaDescription === 'string'
  )
}
