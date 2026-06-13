import { cache } from 'react'
import { anchorAPI } from '@/lib/api'
import type {
  MenuResponse,
  MenuSectionData,
  MenuSectionItem,
  SundayLunchMenuItem,
  SundayLunchMenuResponse
} from '@/lib/api/menu'
import type { MenuData, MenuItem } from '@/lib/menu-parser'
import ssot from '@/SSOT.json'

type SsotData = {
  food?: {
    copy_corrections?: {
      gluten_free_fish_and_chips?: string
    }
  }
  do_not_use?: {
    old_sunday_roast_options?: string
    gluten_free_fish_and_chips?: string
  }
}

const SSOT = ssot as SsotData

const CURRENT_YEAR = new Date().getFullYear()
const MENU_UNAVAILABLE_MESSAGE = 'Menu temporarily unavailable. Please call us on 01753 682707.'
const GLUTEN_FREE_FISH_AND_CHIPS_NOTICE =
  SSOT.food?.copy_corrections?.gluten_free_fish_and_chips
  || SSOT.do_not_use?.gluten_free_fish_and_chips
  || 'We do not offer gluten-free fish and chips, gluten-free batter, gluten-free fried fish, grilled gluten-free fish, or a dedicated gluten-free fryer for fish and chips.'

const SUNDAY_RETIRED_PATTERN =
  /roasted chicken|crispy pork belly|slow-cooked lamb|lamb shank|cauliflower cheese|vegetarian wellington/i

const MEAT_OR_FISH_PATTERN =
  /beef|chicken|pork|ham|bacon|salami|sausage|fish|scampi|squid|turkey|lamb|meat|katsu/i

const ANIMAL_ALLERGENS = new Set([
  'milk',
  'eggs',
  'egg',
  'fish',
  'crustaceans',
  'molluscs'
])

const GLUTEN_ALLERGENS = new Set(['gluten'])

export type MenuPageItem = MenuItem & {
  id: string
  priceValue: number
  priceLabel: string
  categoryId: string
  categoryTitle: string
  sectionId: string
  sectionTitle: string
  dietaryInfo: string[]
  allergens: string[]
  imageUrl?: string
}

export type MenuPageData = {
  menuData: MenuData
  items: MenuPageItem[]
  pizzaItems: MenuPageItem[]
  fishItems: MenuPageItem[]
  vegetarianItems: MenuPageItem[]
  veganItems: MenuPageItem[]
  veganOptionItems: MenuPageItem[]
  glutenFreeItems: MenuPageItem[]
  glutenFreeOptionItems: MenuPageItem[]
  priceFromLabel?: string
  lastUpdated?: string
}

export type SundayLunchPageData = {
  menuData: MenuData | null
  mains: MenuPageItem[]
  sides: MenuPageItem[]
  priceFromLabel?: string
  unavailableReason?: string
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[_-]+/g, ' ').trim()
}

function uniqueList(values?: string[] | null): string[] {
  if (!Array.isArray(values)) return []
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean)
    )
  )
}

function hasDietaryToken(item: MenuSectionItem | SundayLunchMenuItem, token: string): boolean {
  const target = normalizeToken(token)
  return uniqueList(item.dietary_info).some((value) => normalizeToken(value) === target)
}

function hasAnimalAllergen(item: MenuSectionItem | SundayLunchMenuItem): boolean {
  return uniqueList(item.allergens).some((allergen) => ANIMAL_ALLERGENS.has(normalizeToken(allergen)))
}

function hasGlutenAllergen(item: MenuSectionItem | SundayLunchMenuItem): boolean {
  return uniqueList(item.allergens).some((allergen) => GLUTEN_ALLERGENS.has(normalizeToken(allergen)))
}

function itemText(item: { name?: string | null; description?: string | null }): string {
  return `${item.name || ''} ${item.description || ''}`
}

function sanitizeMenuItemDescription(description?: string | null): string {
  if (!description) return ''

  return description
    .replace(/\bgluten[- ]free\s+/gi, '')
    .replace(/\bgluten[- ]free\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function isFishAndChipsFamily(item: { name?: string | null }): boolean {
  return /fish|scampi/i.test(item.name || '')
}

function isLikelyVegetarian(item: MenuSectionItem | SundayLunchMenuItem): boolean {
  if (hasDietaryToken(item, 'vegetarian') || hasDietaryToken(item, 'vegan')) {
    return !MEAT_OR_FISH_PATTERN.test(itemText(item))
  }

  return false
}

function isLikelyVegan(item: MenuSectionItem | SundayLunchMenuItem): boolean {
  if (!hasDietaryToken(item, 'vegan')) return false
  if (MEAT_OR_FISH_PATTERN.test(itemText(item))) return false
  if (hasAnimalAllergen(item)) return false
  return !/cheese|cheddar|mozzarella|ricotta|custard|ice cream|butter/i.test(itemText(item))
}

function hasVeganOption(item: MenuSectionItem | SundayLunchMenuItem, sectionName: string): boolean {
  if (isLikelyVegan(item)) return false
  const text = itemText(item)
  return /pizza/i.test(sectionName) && isLikelyVegetarian(item) && /mozzarella|cheese/i.test(text)
}

function isGlutenFree(item: MenuSectionItem | SundayLunchMenuItem): boolean {
  if (isFishAndChipsFamily(item)) return false
  return hasDietaryToken(item, 'gluten free') && !hasGlutenAllergen(item)
}

function hasGlutenFreeOption(item: MenuSectionItem | SundayLunchMenuItem, sectionName: string): boolean {
  if (isGlutenFree(item)) return false
  if (isFishAndChipsFamily(item)) return false
  return /pizza|garlic bread/i.test(sectionName) || /gluten-free base|gluten free base/i.test(itemText(item))
}

function formatMenuPrice(price: number | string | undefined): string {
  const numericPrice =
    typeof price === 'number'
      ? price
      : typeof price === 'string'
        ? Number.parseFloat(price.replace(/[^0-9.]/g, ''))
        : 0

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) return ''

  return numericPrice % 1 === 0
    ? String(numericPrice)
    : numericPrice.toFixed(2)
}

function formatPriceLabel(price: number | string | undefined): string {
  const formatted = formatMenuPrice(price)
  return formatted ? `(${formatted})` : ''
}

function mapApiItem(
  item: MenuSectionItem,
  section: MenuSectionData
): MenuPageItem {
  const sectionId = slugify(section.name || section.id)
  const sectionName = section.name || 'Menu'
  const dietaryInfo = uniqueList(item.dietary_info)
  const price = formatMenuPrice(item.price)

  return {
    id: item.id,
    name: item.name,
    description: sanitizeMenuItemDescription(item.description),
    price,
    priceValue: Number(item.price || 0),
    priceLabel: formatPriceLabel(item.price),
    allergens: uniqueList(item.allergens),
    vegetarian: isLikelyVegetarian(item),
    vegan: isLikelyVegan(item),
    veganOptionAvailable: hasVeganOption(item, sectionName),
    glutenFree: isGlutenFree(item),
    glutenFreeAvailable: hasGlutenFreeOption(item, sectionName),
    special: item.is_special,
    categoryId: sectionId,
    categoryTitle: sectionName,
    sectionId,
    sectionTitle: sectionName,
    dietaryInfo,
    ...(item.image_url ? { imageUrl: item.image_url } : {})
  }
}

function mapSundayItem(
  item: SundayLunchMenuItem,
  sectionId: 'sunday-roast-mains' | 'sunday-roast-sides',
  sectionTitle: string
): MenuPageItem {
  const section: MenuSectionData = {
    id: sectionId,
    name: sectionTitle,
    sort_order: sectionId === 'sunday-roast-mains' ? 1 : 2,
    items: []
  }
  const mapped = mapApiItem(
    {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      dietary_info: item.dietary_info,
      allergens: item.allergens,
      is_available: item.is_available !== false,
      sort_order: 0
    },
    section
  )

  return {
    ...mapped,
    categoryId: sectionId,
    categoryTitle: sectionTitle,
    sectionId,
    sectionTitle
  }
}

function sortSections(sections: MenuSectionData[]): MenuSectionData[] {
  return [...sections].sort((a, b) => {
    const order = (a.sort_order || 0) - (b.sort_order || 0)
    return order !== 0 ? order : (a.name || '').localeCompare(b.name || '')
  })
}

function sortItems<T extends MenuSectionItem>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const order = (a.sort_order || 0) - (b.sort_order || 0)
    return order !== 0 ? order : (a.name || '').localeCompare(b.name || '')
  })
}

function flattenMenuData(menuData: MenuData): MenuPageItem[] {
  return menuData.categories.flatMap((category) =>
    category.sections.flatMap((section) =>
      section.items.map((item) => item as MenuPageItem)
    )
  )
}

function getPriceFrom(items: MenuPageItem[]): string | undefined {
  const prices = items
    .map((item) => item.priceValue)
    .filter((price) => Number.isFinite(price) && price > 0)

  if (prices.length === 0) return undefined
  return `from ${formatMenuPrice(Math.min(...prices))}`
}

function getAdultSundayRoastPriceFrom(items: MenuPageItem[]): string | undefined {
  const adultItems = items.filter((item) => !/^kids?\b/i.test(item.name.trim()))
  return getPriceFrom(adultItems.length > 0 ? adultItems : items)
}

function fishPagePriority(item: MenuPageItem): number {
  const name = item.name.toLowerCase()
  if (/^fish\s*&\s*chips$/.test(name)) return 0
  if (/^half\s+fish\s*&\s*chips$/.test(name)) return 1
  if (/scampi/.test(name)) return 2
  return 3
}

function buildMenuData(response: MenuResponse): MenuData | null {
  const sections = sortSections(Array.isArray(response.sections) ? response.sections : [])
  if (sections.length === 0) return null

  const categories = sections
    .map((section) => {
      const items = sortItems(Array.isArray(section.items) ? section.items : [])
        .filter((item) => item.is_available !== false)
        .map((item) => mapApiItem(item, section))

      return {
        id: slugify(section.name || section.id),
        title: section.name || 'Menu',
        description: section.description || '',
        sections: [
          {
            title: section.name || 'Menu',
            description: section.description || '',
            items,
            style: /pizza|burger/i.test(section.name || '') ? 'grid' as const : undefined
          }
        ]
      }
    })
    .filter((category) => category.sections.some((section) => section.items.length > 0))

  if (categories.length === 0) return null

  return {
    title: 'The Anchor Food Menu',
    description: 'Current food menu at The Anchor.',
    lastUpdated: (((response.menu as unknown) as Record<string, unknown>)?.lastUpdated as string | undefined) || String(CURRENT_YEAR),
    categories
  }
}

function buildMenuPageData(menuData: MenuData): MenuPageData {
  const items = flattenMenuData(menuData)
  const pizzaItems = items.filter((item) => /pizza/i.test(item.categoryTitle))
  const fishItems = items.filter((item) => isFishAndChipsFamily(item))
  const vegetarianItems = items.filter((item) => item.vegetarian || item.vegan)
  const veganItems = items.filter((item) => item.vegan)
  const veganOptionItems = items.filter((item) => item.veganOptionAvailable)
  const glutenFreeItems = items.filter((item) => item.glutenFree)
  const glutenFreeOptionItems = items.filter((item) => item.glutenFreeAvailable)

  return {
    menuData,
    items,
    pizzaItems,
    fishItems,
    vegetarianItems,
    veganItems,
    veganOptionItems,
    glutenFreeItems,
    glutenFreeOptionItems,
    priceFromLabel: getPriceFrom(items),
    lastUpdated: menuData.lastUpdated
  }
}

async function fetchFoodMenuData(): Promise<MenuPageData | null> {
  try {
    const response = await anchorAPI.getMenu()
    const menuData = buildMenuData(response)
    return menuData ? buildMenuPageData(menuData) : null
  } catch (error) {
    console.warn('[menu-page-data] Failed to fetch food menu', error)
    return null
  }
}

function rejectStaleSundayMenu(menu: SundayLunchMenuResponse): string | null {
  const items = [...(menu.mains || []), ...(menu.sides || [])]

  if (items.length === 0) {
    return 'Sunday roast menu returned no items.'
  }

  if (items.some((item) => /^fallback-/i.test(item.id || ''))) {
    return 'Sunday roast menu returned fallback items.'
  }

  if (items.some((item) => SUNDAY_RETIRED_PATTERN.test(item.name || ''))) {
    return 'Sunday roast menu returned retired items.'
  }

  return null
}

async function fetchSundayLunchPageData(): Promise<SundayLunchPageData> {
  try {
    const menu = await anchorAPI.getSundayLunchMenu()
    const staleReason = rejectStaleSundayMenu(menu)
    if (staleReason) {
      return {
        menuData: null,
        mains: [],
        sides: [],
        unavailableReason: staleReason
      }
    }

    const mains = (menu.mains || [])
      .filter((item) => item.is_available !== false)
      .map((item) => mapSundayItem(item, 'sunday-roast-mains', 'Sunday Roast Mains'))
    const sides = (menu.sides || [])
      .filter((item) => item.is_available !== false)
      .map((item) => mapSundayItem(item, 'sunday-roast-sides', 'Sunday Roast Sides'))

    const categories = [
      {
        id: 'sunday-roast-mains',
        title: 'Sunday Roast Mains',
        description: 'Choose from our current Sunday roast mains.',
        sections: [
          {
            title: 'Sunday Roast Mains',
            items: mains,
            style: 'grid' as const
          }
        ]
      },
      ...(sides.length > 0
        ? [
            {
              id: 'sunday-roast-sides',
              title: 'Sunday Roast Sides',
              description: 'Add a little extra to the table.',
              sections: [
                {
                  title: 'Sunday Roast Sides',
                  items: sides,
                  style: 'grid' as const
                }
              ]
            }
          ]
        : [])
    ].filter((category) => category.sections.some((section) => section.items.length > 0))

    const menuData: MenuData | null = categories.length > 0
      ? {
          title: 'Sunday Roast Menu',
          description: 'Current Sunday roast menu at The Anchor.',
          lastUpdated: menu.menu_date || String(CURRENT_YEAR),
          categories
        }
      : null

    return {
      menuData,
      mains,
      sides,
      priceFromLabel: getAdultSundayRoastPriceFrom(mains)
    }
  } catch (error) {
    console.warn('[menu-page-data] Failed to fetch Sunday roast menu', error)
    return {
      menuData: null,
      mains: [],
      sides: [],
      unavailableReason: 'Sunday roast menu failed to load.'
    }
  }
}

export const getFoodMenuPageData = cache(fetchFoodMenuData)

export const getPizzaMenuPageData = cache(async () => {
  const data = await fetchFoodMenuData()
  if (!data) return null

  const categories = data.menuData.categories.filter((category) => /pizza/i.test(category.title))
  if (categories.length === 0) return null

  const menuData = {
    ...data.menuData,
    title: 'Pizza Menu',
    description: 'Current pizza menu at The Anchor.',
    categories
  }

  return {
    ...buildMenuPageData(menuData),
    items: data.pizzaItems,
    pizzaItems: data.pizzaItems
  }
})

export const getFishAndChipsMenuPageData = cache(async () => {
  const data = await fetchFoodMenuData()
  if (!data || data.fishItems.length === 0) return null
  const fishItems = [...data.fishItems].sort((a, b) => {
    const priority = fishPagePriority(a) - fishPagePriority(b)
    return priority !== 0 ? priority : a.name.localeCompare(b.name)
  })

  const menuData: MenuData = {
    ...data.menuData,
    title: 'Fish and Chips Menu',
    description: 'Current fish and chips menu items at The Anchor.',
    categories: [
      {
        id: 'fish-and-chips',
        title: 'Fish and Chips',
        description: 'Current fish and chip options at The Anchor.',
        sections: [
          {
            title: 'Fish and Chips',
            items: fishItems
          }
        ]
      }
    ]
  }

  return {
    ...buildMenuPageData(menuData),
    items: fishItems,
    fishItems
  }
})

export const getVegetarianMenuPageData = cache(async () => {
  const data = await fetchFoodMenuData()
  if (!data || data.vegetarianItems.length === 0) return null

  const categories = data.menuData.categories
    .map((category) => ({
      ...category,
      sections: category.sections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => {
            const pageItem = item as MenuPageItem
            return pageItem.vegetarian || pageItem.vegan
          })
        }))
        .filter((section) => section.items.length > 0)
    }))
    .filter((category) => category.sections.length > 0)

  const menuData = {
    ...data.menuData,
    title: 'Vegetarian Menu',
    description: 'Current vegetarian menu items at The Anchor.',
    categories
  }

  return buildMenuPageData(menuData)
})

export const getVeganMenuPageData = cache(async () => {
  const data = await fetchFoodMenuData()
  if (!data) return null

  const veganItemIds = new Set([...data.veganItems, ...data.veganOptionItems].map((item) => item.id))
  if (veganItemIds.size === 0) return null

  const categories = data.menuData.categories
    .map((category) => ({
      ...category,
      sections: category.sections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => veganItemIds.has((item as MenuPageItem).id))
        }))
        .filter((section) => section.items.length > 0)
    }))
    .filter((category) => category.sections.length > 0)

  const menuData = {
    ...data.menuData,
    title: 'Vegan Menu',
    description: 'Current vegan and vegan-option menu items at The Anchor.',
    categories
  }

  return buildMenuPageData(menuData)
})

export const getGlutenFreeMenuPageData = cache(async () => {
  const data = await fetchFoodMenuData()
  if (!data) return null

  const glutenFreeItemIds = new Set([...data.glutenFreeItems, ...data.glutenFreeOptionItems].map((item) => item.id))
  if (glutenFreeItemIds.size === 0) return null

  const categories = data.menuData.categories
    .map((category) => ({
      ...category,
      sections: category.sections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => glutenFreeItemIds.has((item as MenuPageItem).id))
        }))
        .filter((section) => section.items.length > 0)
    }))
    .filter((category) => category.sections.length > 0)

  const menuData = {
    ...data.menuData,
    title: 'Gluten-Free Menu',
    description: 'Current gluten-free and gluten-free-option menu items at The Anchor.',
    categories
  }

  return buildMenuPageData(menuData)
})

export const getSundayLunchMenuPageData = cache(fetchSundayLunchPageData)

export function getMenuUnavailableMessage(): string {
  return MENU_UNAVAILABLE_MESSAGE
}

export function getGlutenFreeFishAndChipsNotice(): string {
  return GLUTEN_FREE_FISH_AND_CHIPS_NOTICE
}

export function getApiMenuItemList(items: MenuPageItem[], limit = 4): MenuPageItem[] {
  return items.slice(0, limit)
}
