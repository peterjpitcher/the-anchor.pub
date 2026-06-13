import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { MenuData } from '@/lib/menu-parser'
import { FoodMenuSection } from '../FoodMenuSection'

const menuData: MenuData = {
  title: 'Food Menu',
  description: 'Current menu',
  lastUpdated: '2026-06-13',
  categories: [
    {
      id: 'mains',
      title: 'Mains',
      description: 'Main dishes',
      sections: [
        {
          title: 'Mains',
          items: [
            {
              name: 'Fish Supper',
              description: 'Fish and chips',
              price: '15',
              vegetarian: false,
              allergens: ['fish', 'gluten']
            },
            {
              name: 'Cheesy Pie',
              description: 'Vegetarian pie',
              price: '14',
              vegetarian: true,
              allergens: ['milk', 'gluten']
            }
          ]
        }
      ]
    }
  ]
}

describe('FoodMenuSection', () => {
  it('shows allergen labels from menu item data', () => {
    render(<FoodMenuSection menuData={menuData} />)

    expect(screen.getByText('Allergens listed: Fish, Gluten')).toBeInTheDocument()
    expect(screen.getByText('Allergens listed: Milk, Gluten')).toBeInTheDocument()
  })

  it('builds allergen filters from menu item allergens', () => {
    render(<FoodMenuSection menuData={menuData} />)

    expect(screen.getByRole('button', { name: 'Fish' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gluten' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Milk' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Gluten-free' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Peanuts' })).not.toBeInTheDocument()
  })

  it('hides dishes containing a selected allergen', async () => {
    const user = userEvent.setup()
    render(<FoodMenuSection menuData={menuData} />)

    await user.click(screen.getByRole('button', { name: 'Milk' }))

    expect(screen.getByText('Fish Supper')).toBeInTheDocument()
    expect(screen.queryByText('Cheesy Pie')).not.toBeInTheDocument()
  })
})
