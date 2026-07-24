import { anchorAPI } from '@/lib/api'
import { getKidsMenuPageData } from '@/lib/menu-page-data'

jest.mock('react', () => {
  const actual = jest.requireActual('react')
  return {
    ...actual,
    cache: (fn: unknown) => fn
  }
})

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getMenu: jest.fn()
  }
}))

describe('kids menu page data', () => {
  it('loads the separate live kids menu', async () => {
    jest.mocked(anchorAPI.getMenu).mockResolvedValue({
      menu: {
        '@context': 'https://schema.org',
        '@type': 'Menu',
        name: 'Kids Menu',
        hasMenuSection: []
      },
      sections: [
        {
          id: 'kids',
          name: 'Kids',
          description: "Children's dishes",
          sort_order: 1,
          items: [
            {
              id: 'kids-dish-1',
              name: 'Kids Test Dish',
              description: 'A child-sized meal.',
              price: 7,
              dietary_info: [],
              allergens: ['gluten'],
              is_available: true,
              sort_order: 1
            }
          ]
        }
      ]
    })

    const data = await getKidsMenuPageData()

    expect(anchorAPI.getMenu).toHaveBeenCalledWith('kids')
    expect(data?.menuData.title).toBe('The Anchor Kids Menu')
    expect(data?.items).toHaveLength(1)
    expect(data?.items[0]).toMatchObject({
      name: 'Kids Test Dish',
      priceValue: 7,
      categoryId: 'kids'
    })
  })
})
