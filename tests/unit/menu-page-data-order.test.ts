import { sortFoodMenuSections } from '@/lib/food-menu-section-order'
import type { MenuSectionData } from '@/lib/api/menu'

function section(name: string, sortOrder: number): MenuSectionData {
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    sort_order: sortOrder,
    items: []
  }
}

describe('food menu section order', () => {
  it('shows the main meal categories in the requested order', () => {
    const sections = [
      section('Light Bites', 20),
      section('Snack Pots', 30),
      section('Burgers', 40),
      section('Pizza', 50),
      section('Mains', 70),
      section('Desserts', 100)
    ]

    expect(sortFoodMenuSections(sections).map(({ name }) => name)).toEqual([
      'Mains',
      'Pizza',
      'Burgers',
      'Snack Pots',
      'Light Bites',
      'Desserts'
    ])
  })
})
