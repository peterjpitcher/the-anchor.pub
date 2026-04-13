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
  mains: [
    {
      id: 'fallback-roasted-chicken',
      name: 'Roasted Chicken',
      description: 'Oven-roasted chicken breast with sage & onion stuffing balls, herb and garlic-crusted roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy',
      price: 19,
      dietary_info: [],
      allergens: [],
      is_available: true
    },
    {
      id: 'fallback-crispy-pork-belly',
      name: 'Crispy Pork Belly',
      description: 'Crispy crackling and tender slow-roasted pork belly with Bramley apple sauce, herb and garlic-crusted roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy',
      price: 22,
      dietary_info: [],
      allergens: [],
      is_available: true
    },
    {
      id: 'fallback-wellington-v',
      name: 'Beetroot & Butternut Squash Wellington (V)',
      description: 'Golden puff pastry filled with beetroot & butternut squash, served with herb and garlic-crusted roast potatoes, seasonal vegetables, and vegetarian gravy',
      price: 19,
      dietary_info: ['vegetarian'],
      allergens: ['gluten'],
      is_available: true
    },
    {
      id: 'fallback-kids-roasted-chicken',
      name: 'Kids Roasted Chicken',
      description: 'A smaller portion of our roasted chicken with herb and garlic-crusted roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy',
      price: 13,
      dietary_info: [],
      allergens: [],
      is_available: true
    }
  ],
  sides: [
    {
      id: 'fallback-roast-potatoes',
      name: 'Roast Potatoes',
      description: 'Herb and garlic-crusted roast potatoes.',
      price: 0,
      dietary_info: ['vegetarian'],
      allergens: [],
      included: true
    },
    {
      id: 'fallback-yorkshire-pudding',
      name: 'Yorkshire Pudding',
      description: 'Traditional Yorkshire pudding.',
      price: 0,
      dietary_info: [],
      allergens: ['gluten'],
      included: true
    },
    {
      id: 'fallback-seasonal-veg',
      name: 'Seasonal Vegetables',
      description: 'Fresh seasonal vegetables.',
      price: 0,
      dietary_info: ['vegetarian'],
      allergens: [],
      included: true
    },
    {
      id: 'fallback-red-wine-gravy',
      name: 'Red Wine Gravy',
      description: 'Red wine gravy (vegetarian gravy available on request).',
      price: 0,
      dietary_info: [],
      allergens: [],
      included: true
    }
  ],
  cutoff_time: '2024-01-06T13:00:00.000Z'
}
