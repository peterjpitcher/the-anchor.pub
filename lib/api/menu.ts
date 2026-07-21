// Menu domain types

export interface MenuItem {
  '@type': 'MenuItem'
  name: string
  description: string
  offers: {
    '@type': 'Offer'
    price: string
    priceCurrency: string
  }
  nutrition?: {
    '@type': 'NutritionInformation'
    calories: string
  }
  suitableForDiet?: string[]
  menuAddOn?: MenuItem[]
}

export interface MenuSection {
  '@type': 'MenuSection'
  name: string
  hasMenuItem: MenuItem[]
}

export interface MenuSchema {
  '@context': string
  '@type': 'Menu'
  name: string
  hasMenuSection: MenuSection[]
}

export interface MenuSectionItem {
  id: string
  name: string
  description?: string | null
  price: number
  calories?: number | null
  dietary_info?: string[]
  allergens?: string[]
  is_available: boolean
  is_special?: boolean
  available_from?: string | null
  available_until?: string | null
  image_url?: string | null
  sort_order: number
}

export interface MenuSectionData {
  id: string
  name: string
  description?: string | null
  sort_order: number
  items: MenuSectionItem[]
}

export interface MenuResponse {
  menu: MenuSchema
  sections: MenuSectionData[]
}

export interface DietaryMenuItem {
  '@type': 'MenuItem'
  id: string
  name: string
  description?: string
  offers: {
    '@type': 'Offer'
    price: string
    priceCurrency: string
    availability: string
    availableAtOrFrom?: string
    availableThrough?: string
  }
  nutrition?: {
    '@type': 'NutritionInformation'
    calories?: string
  }
  dietary_info?: string[]
  allergens?: string[]
  image?: string
}

export interface DietaryMenuSection {
  '@type': 'MenuSection'
  name: string
  items: DietaryMenuItem[]
  sort_order?: number
}

export interface DietaryMenuResponse {
  dietary_type: string
  menu_sections: DietaryMenuSection[]
  meta: {
    total_items: number
    lastUpdated: string
  }
}

export interface SundayLunchMenuItem {
  id: string
  name: string
  description?: string
  price: number
  dietary_info?: string[]
  allergens?: string[]
  is_available?: boolean
  included?: boolean
}

export interface SundayLunchMenuResponse {
  menu_date: string
  mains: SundayLunchMenuItem[]
  sides: SundayLunchMenuItem[]
  cutoff_time?: string
}

export const FALLBACK_SUNDAY_LUNCH_MENU: SundayLunchMenuResponse = {
  menu_date: '2024-01-01',
  mains: [],
  sides: []
}

/** Menu code for the standard website food menu. */
export const DEFAULT_FOOD_MENU_CODE = 'website_food'

/** Menu code for the seasonal Christmas menu. */
export const CHRISTMAS_MENU_CODE = 'christmas'

/**
 * A structurally valid, deliberately empty menu. Used so a menu that does not
 * exist yet in the management database degrades to "nothing to show" rather
 * than an exception, both at build time and at runtime.
 */
export function createEmptyMenuResponse(name: string): MenuResponse {
  return {
    menu: {
      '@context': 'https://schema.org',
      '@type': 'Menu',
      name,
      hasMenuSection: []
    },
    sections: []
  }
}

export const FALLBACK_CHRISTMAS_MENU: MenuResponse = createEmptyMenuResponse('Christmas Menu')
