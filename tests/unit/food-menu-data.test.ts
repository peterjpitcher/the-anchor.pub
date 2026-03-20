// tests/unit/food-menu-data.test.ts
import fs from 'fs'
import path from 'path'

const menuPath = path.join(process.cwd(), 'content', 'menu', 'food.json')
const menu = JSON.parse(fs.readFileSync(menuPath, 'utf8'))

describe('food.json structure', () => {
  it('has exactly 8 categories', () => {
    expect(menu.categories).toHaveLength(8)
  })

  it('has categories in correct order', () => {
    const ids = menu.categories.map((c: { id: string }) => c.id)
    expect(ids).toEqual([
      'pub-classics',
      'pies',
      'burgers',
      'comfort-favourites',
      'pizza',
      'wraps-sides',
      'desserts',
      'hot-drinks',
    ])
  })

  it('every category has id, title, description, and sections array', () => {
    for (const cat of menu.categories) {
      expect(typeof cat.id).toBe('string')
      expect(typeof cat.title).toBe('string')
      expect(typeof cat.description).toBe('string')
      expect(Array.isArray(cat.sections)).toBe(true)
    }
  })

  it('every item has name, price, allergens array, and vegetarian flag', () => {
    for (const cat of menu.categories) {
      for (const section of cat.sections) {
        for (const item of section.items) {
          expect(typeof item.name).toBe('string')
          expect(typeof item.price).toBe('string')
          expect(Array.isArray(item.allergens)).toBe(true)
          expect(typeof item.vegetarian).toBe('boolean')
        }
      }
    }
  })

  it('no item has a featured field', () => {
    for (const cat of menu.categories) {
      for (const section of cat.sections) {
        for (const item of section.items) {
          expect(item.featured).toBeUndefined()
        }
      }
    }
  })

  it('contains new items', () => {
    const allNames = menu.categories.flatMap((c: { sections: { items: { name: string }[] }[] }) =>
      c.sections.flatMap(s => s.items.map(i => i.name))
    )
    expect(allNames).toContain('Chicken, Ham Hock & Leek Pie')
    expect(allNames).toContain('Butternut Squash, Mixed Bean & Mature Cheddar Pie')
    expect(allNames).toContain('Chocolate Fudge Cake')
    expect(allNames).toContain('Chocolate Fudge Brownie')
    expect(allNames).toContain('Garden Veg Burger')
    expect(allNames).toContain('Classic Beef Burger')
    expect(allNames).toContain('Bangers & Mash')
  })

  it('does not contain removed items', () => {
    const allNames = menu.categories.flatMap((c: { sections: { items: { name: string }[] }[] }) =>
      c.sections.flatMap(s => s.items.map(i => i.name))
    )
    expect(allNames).not.toContain('Lamb Shank')
    expect(allNames).not.toContain('Veggie Stack')
    expect(allNames).not.toContain('Speck Ham & Parmesan')
    expect(allNames).not.toContain('Beef Burger')
    expect(allNames).not.toContain('Vegetable Burger')
    expect(allNames).not.toContain('Sausage & Mash')
  })

  it('contains new stack burger items', () => {
    const allNames = menu.categories.flatMap((c: { sections: { items: { name: string }[] }[] }) =>
      c.sections.flatMap(s => s.items.map(i => i.name))
    )
    expect(allNames).toContain('Beef Stack')
    expect(allNames).toContain('Chicken Stack')
    expect(allNames).toContain('Spicy Chicken Stack')
    expect(allNames).toContain('Garden Stack')
  })

  it('burgers category has an add-ons section', () => {
    const burgers = menu.categories.find((c: { id: string }) => c.id === 'burgers')
    const addOns = burgers?.sections.find((s: { title: string }) => s.title === 'Burger Add-Ons')
    expect(addOns).toBeDefined()
    expect(addOns.style).toBe('list')
    expect(addOns.items.length).toBeGreaterThanOrEqual(6)
  })

  it('Classic Beef Burger does not have peanuts allergen', () => {
    const burgers = menu.categories.find((c: { id: string }) => c.id === 'burgers')
    const beefBurger = burgers?.sections
      .flatMap((s: { items: { name: string; allergens: string[] }[] }) => s.items)
      .find((i: { name: string }) => i.name === 'Classic Beef Burger')
    expect(beefBurger?.allergens).not.toContain('peanuts')
  })

  it('Sticky Toffee Pudding does not have gluten allergen (operator confirmed gluten-free)', () => {
    const desserts = menu.categories.find((c: { id: string }) => c.id === 'desserts')
    const stp = desserts?.sections
      .flatMap((s: { items: { name: string; allergens: string[] }[] }) => s.items)
      .find((i: { name: string }) => i.name === 'Sticky Toffee Pudding')
    expect(stp?.allergens).not.toContain('gluten')
  })
})
