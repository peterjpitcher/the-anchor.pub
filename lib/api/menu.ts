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
      id: 'fallback-roast-beef-topside',
      name: 'Roast Beef Topside',
      description: '28-day topside, slow-roasted and carved fresh per plate, served with roast potatoes, seasonal vegetables, Yorkshire pudding and gravy',
      price: 22,
      dietary_info: [],
      allergens: [],
      is_available: true
    },
    {
      id: 'fallback-roast-pork-leg',
      name: 'Roast Pork Leg',
      description: 'Roasted pork leg sliced to order with Bramley apple sauce, roast potatoes, seasonal vegetables, Yorkshire pudding and gravy',
      price: 20,
      dietary_info: [],
      allergens: [],
      is_available: true
    },
    {
      id: 'fallback-roast-turkey-stuffing',
      name: 'Roast Turkey with Stuffing Ball',
      description: 'Carved turkey served with a sage and onion stuffing ball, roast potatoes, seasonal vegetables, Yorkshire pudding and gravy',
      price: 16,
      dietary_info: [],
      allergens: [],
      is_available: true
    },
    {
      id: 'fallback-beef-ale-pie',
      name: 'Beef & Ale Pie',
      description: 'Slow-cooked British beef in ale gravy under golden short-crust pastry, served with roast potatoes, seasonal vegetables and gravy',
      price: 21,
      dietary_info: [],
      allergens: ['gluten'],
      is_available: true
    },
    {
      id: 'fallback-chicken-wild-mushroom-pie',
      name: 'Chicken & Wild Mushroom Pie',
      description: 'Tender chicken and wild mushrooms in creamy sauce under golden short-crust pastry, served with roast potatoes, seasonal vegetables and gravy',
      price: 21,
      dietary_info: [],
      allergens: ['gluten', 'milk'],
      is_available: true
    },
    {
      id: 'fallback-wellington-vegan',
      name: 'Beetroot & Butternut Squash Wellington',
      description: 'Golden puff pastry filled with beetroot and butternut squash, served with roast potatoes, seasonal vegetables and vegan gravy',
      price: 20,
      dietary_info: ['vegan'],
      allergens: ['gluten'],
      is_available: true
    },
    {
      id: 'fallback-kids-roast',
      name: 'Kids Roast',
      description: 'A smaller child-sized plate with roast potatoes, seasonal vegetables and gravy',
      price: 14,
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
