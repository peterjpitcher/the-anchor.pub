/**
 * The "Hide items containing" filter on /food-menu.
 *
 * A dish with no allergen data used to stay in the filtered list once an
 * allergen was chosen, as if it had passed: with Milk hidden, the cheese pizzas
 * were still on show, because the kitchen had recorded nothing for them. An
 * empty allergen list means we have not been told, not that the dish is free
 * from anything (docs/SSOT.md sections 5 and 16).
 *
 * So once any allergen is chosen, a dish with no allergen data leaves the main
 * list and goes into its own group, headed plainly, with the SSOT fallback line.
 */

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { MenuData } from '@/lib/menu-parser'
import { FoodMenuSection } from '@/app/food-menu/_components/FoodMenuSection'
import { classifyMenuItemForAllergens, formatMenuAllergenLine } from '@/lib/menu-allergens'
import { ALLERGEN_UNKNOWN_WORDING } from '@/lib/approved-wording'

const menuData: MenuData = {
  title: 'Food Menu',
  description: 'Current menu',
  lastUpdated: '2026-10-07',
  categories: [
    {
      id: 'mains',
      title: 'Mains',
      description: '',
      sections: [
        {
          title: 'Mains',
          items: [
            { name: 'Fish Supper', description: '', price: '15', allergens: ['fish', 'gluten'] },
            { name: 'Cheesy Pie', description: '', price: '14', vegetarian: true, allergens: ['milk', 'gluten'] }
          ]
        }
      ]
    },
    {
      id: 'pizza',
      title: 'Pizza',
      description: '',
      sections: [
        {
          title: 'Pizza',
          items: [
            // No allergen data at all, and plainly a cheese pizza.
            { name: 'Margherita', description: 'Tomato and mozzarella', price: '13', allergens: [] },
            // The allergens field missing altogether is the same as an empty list.
            { name: 'Garlic Bread', description: '', price: '10' }
          ]
        }
      ]
    }
  ]
}

describe('allergen filter: dishes with no allergen data', () => {
  it('keeps every dish in the main list when no allergen is chosen', () => {
    render(<FoodMenuSection menuData={menuData} />)

    const main = screen.getByTestId('menu-filtered-list')
    for (const name of ['Fish Supper', 'Cheesy Pie', 'Margherita', 'Garlic Bread']) {
      expect(within(main).getByText(name)).toBeInTheDocument()
    }
    expect(screen.queryByTestId('menu-allergens-unknown')).not.toBeInTheDocument()
  })

  it('with Milk chosen, a dish with an empty allergen list is not in the main filtered list', async () => {
    const user = userEvent.setup()
    render(<FoodMenuSection menuData={menuData} />)

    await user.click(screen.getByRole('button', { name: 'Milk' }))

    const main = screen.getByTestId('menu-filtered-list')
    // Has allergen data, and no milk in it: passes.
    expect(within(main).getByText('Fish Supper')).toBeInTheDocument()
    // Lists milk: hidden everywhere.
    expect(screen.queryByText('Cheesy Pie')).not.toBeInTheDocument()
    // No allergen data: must not sit among the dishes that passed.
    expect(within(main).queryByText('Margherita')).not.toBeInTheDocument()
    expect(within(main).queryByText('Garlic Bread')).not.toBeInTheDocument()
    // The Pizza heading goes too, since nothing under it passed.
    expect(within(main).queryByRole('heading', { name: 'Pizza' })).not.toBeInTheDocument()
  })

  it('shows those dishes in their own group, with a plain heading and the SSOT fallback line', async () => {
    const user = userEvent.setup()
    render(<FoodMenuSection menuData={menuData} />)

    await user.click(screen.getByRole('button', { name: 'Milk' }))

    const unknown = screen.getByTestId('menu-allergens-unknown')
    expect(
      within(unknown).getByRole('heading', { name: "We don't hold allergen details for these dishes" })
    ).toBeInTheDocument()
    expect(within(unknown).getByText(/Ask the bar team before you order\./)).toBeInTheDocument()
    expect(within(unknown).getByText('Margherita')).toBeInTheDocument()
    expect(within(unknown).getByText('Garlic Bread')).toBeInTheDocument()
    expect(within(unknown).getAllByText(`${ALLERGEN_UNKNOWN_WORDING}.`)).toHaveLength(2)
    // A dish that lists the chosen allergen never lands in this group.
    expect(within(unknown).queryByText('Cheesy Pie')).not.toBeInTheDocument()
    expect(within(unknown).queryByText('Fish Supper')).not.toBeInTheDocument()
  })

  it('does the same for Gluten, where no dish with data passes', async () => {
    const user = userEvent.setup()
    render(<FoodMenuSection menuData={menuData} />)

    await user.click(screen.getByRole('button', { name: 'Gluten' }))

    expect(screen.queryByTestId('menu-filtered-list')).not.toBeInTheDocument()
    expect(screen.getByTestId('menu-no-matches')).toHaveTextContent(
      'No dishes with allergen details match that filter right now.'
    )
    const unknown = screen.getByTestId('menu-allergens-unknown')
    expect(within(unknown).getByText('Margherita')).toBeInTheDocument()
    expect(within(unknown).getByText('Garlic Bread')).toBeInTheDocument()
  })

  it('applies the Vegetarian filter to the no-details group as well', async () => {
    const user = userEvent.setup()
    render(<FoodMenuSection menuData={menuData} />)

    await user.click(screen.getByRole('button', { name: 'Vegetarian' }))
    await user.click(screen.getByRole('button', { name: 'Fish' }))

    // Margherita and Garlic Bread carry no vegetarian flag, so they are out.
    expect(screen.queryByTestId('menu-allergens-unknown')).not.toBeInTheDocument()
    expect(within(screen.getByTestId('menu-filtered-list')).getByText('Cheesy Pie')).toBeInTheDocument()
  })

  it('puts everything back when the filters are cleared', async () => {
    const user = userEvent.setup()
    render(<FoodMenuSection menuData={menuData} />)

    await user.click(screen.getByRole('button', { name: 'Milk' }))
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))

    expect(screen.queryByTestId('menu-allergens-unknown')).not.toBeInTheDocument()
    expect(within(screen.getByTestId('menu-filtered-list')).getByText('Margherita')).toBeInTheDocument()
  })
})

describe('classifyMenuItemForAllergens', () => {
  const milk = new Set(['milk'])

  it('shows everything when nothing is chosen', () => {
    expect(classifyMenuItemForAllergens({ allergens: [] }, new Set())).toBe('shown')
    expect(classifyMenuItemForAllergens({ allergens: ['milk'] }, new Set())).toBe('shown')
  })

  it('never treats missing data as a pass', () => {
    expect(classifyMenuItemForAllergens({ allergens: [] }, milk)).toBe('unknown')
    expect(classifyMenuItemForAllergens({}, milk)).toBe('unknown')
    expect(classifyMenuItemForAllergens({ allergens: ['', '  '] }, milk)).toBe('unknown')
  })

  it('hides a dish that lists a chosen allergen, however the API spells it', () => {
    expect(classifyMenuItemForAllergens({ allergens: ['Milk'] }, milk)).toBe('hidden')
    expect(classifyMenuItemForAllergens({ allergens: ['gluten', ' MILK '] }, milk)).toBe('hidden')
  })

  it('shows a dish that has data and does not list a chosen allergen', () => {
    expect(classifyMenuItemForAllergens({ allergens: ['gluten'] }, milk)).toBe('shown')
  })
})

describe('the per-dish allergen line', () => {
  it('uses the SSOT fallback when the data is missing, never a reassurance', () => {
    const line = formatMenuAllergenLine([])
    expect(line).toBe('See menu or contact us for allergen information.')
    expect(line).not.toMatch(/no allergens|none/i)
  })
})
