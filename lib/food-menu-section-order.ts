import type { MenuSectionData } from '@/lib/api/menu'

const FOOD_MENU_SECTION_DISPLAY_ORDER = new Map([
  ['mains', 0],
  ['pizza', 1],
  ['pizzas', 1],
  ['burgers', 2],
  ['snack-pots', 3],
  ['light-bites', 4],
  ['desserts', 5]
])

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function sortFoodMenuSections(sections: MenuSectionData[]): MenuSectionData[] {
  return [...sections].sort((a, b) => {
    const displayOrder =
      (FOOD_MENU_SECTION_DISPLAY_ORDER.get(slugify(a.name || '')) ?? Number.MAX_SAFE_INTEGER)
      - (FOOD_MENU_SECTION_DISPLAY_ORDER.get(slugify(b.name || '')) ?? Number.MAX_SAFE_INTEGER)
    if (displayOrder !== 0) return displayOrder

    const order = (a.sort_order || 0) - (b.sort_order || 0)
    return order !== 0 ? order : (a.name || '').localeCompare(b.name || '')
  })
}
