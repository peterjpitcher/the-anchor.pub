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

/**
 * Renders the whole allergen line for a menu item, including its label.
 *
 * Absent allergen data is not the same as an absence of allergens. When the
 * management API returns nothing for an item we must not imply the item is
 * safe, so this falls back to directing the guest to staff. Callers take the
 * complete string rather than composing their own label around the list, so
 * an empty list can never render as a reassurance.
 */
export function formatMenuAllergenLine(allergens: string[]): string {
  if (allergens.length === 0) {
    return 'Ask our bar team about allergens before you order.'
  }

  return `Allergens listed: ${formatMenuAllergenList(allergens)}`
}
