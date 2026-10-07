import type { MenuData, MenuItem } from '@/lib/menu-parser'
import { ALLERGEN_UNKNOWN_WORDING } from '@/lib/approved-wording'

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
 * safe, so this falls back to the sentence the SSOT requires (sections 5 and
 * 16). Callers take the complete string rather than composing their own label
 * around the list, so an empty list can never render as a reassurance.
 */
export function formatMenuAllergenLine(allergens: string[]): string {
  if (allergens.length === 0) {
    return `${ALLERGEN_UNKNOWN_WORDING}.`
  }

  return `Allergens listed: ${formatMenuAllergenList(allergens)}`
}

/**
 * Where a dish belongs once the visitor has chosen allergens to hide.
 *
 * - `shown`: we hold allergen details for the dish and none of the chosen
 *   allergens is listed.
 * - `hidden`: the dish lists one of the chosen allergens.
 * - `unknown`: we hold no allergen details at all. The dish is neither hidden
 *   nor left among the dishes that passed, because an empty list means we have
 *   not been told, not that the dish is free from anything.
 *
 * With nothing chosen every dish is `shown`.
 */
export type AllergenFilterOutcome = 'shown' | 'hidden' | 'unknown'

export function classifyMenuItemForAllergens(
  item: MenuAllergenItem,
  selectedAllergens: ReadonlySet<string>
): AllergenFilterOutcome {
  if (selectedAllergens.size === 0) return 'shown'

  const allergens = getMenuItemAllergens(item)
  if (allergens.length === 0) return 'unknown'

  return allergens.some(allergen => selectedAllergens.has(allergen)) ? 'hidden' : 'shown'
}
