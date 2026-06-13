import type { MenuData, MenuItem } from '@/lib/menu-parser'

export type MenuAllergenItem = Pick<MenuItem, 'allergens'>

export function normalizeMenuAllergen(allergen: string): string {
  return allergen.toLowerCase().replace(/[_-]+/g, ' ').trim()
}

export function formatMenuAllergenLabel(allergen: string): string {
  return normalizeMenuAllergen(allergen)
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function getMenuItemAllergens(item: MenuAllergenItem): string[] {
  if (!Array.isArray(item.allergens)) return []

  return Array.from(
    new Set(
      item.allergens
        .map(normalizeMenuAllergen)
        .filter(Boolean)
    )
  )
}

export function getMenuAllergenFilters(menuData: MenuData): string[] {
  const allergens = menuData.categories.flatMap(category =>
    category.sections.flatMap(section =>
      section.items.flatMap(item => getMenuItemAllergens(item))
    )
  )

  return Array.from(new Set(allergens)).sort((a, b) =>
    formatMenuAllergenLabel(a).localeCompare(formatMenuAllergenLabel(b))
  )
}

export function formatMenuAllergenList(allergens: string[]): string {
  return allergens.map(formatMenuAllergenLabel).join(', ')
}
