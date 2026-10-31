/**
 * A single dish's price is shown bare: "16", not "£16" (SSOT price display
 * rule, owner-confirmed 19 July 2026). The roast section on /sunday-roast and
 * /food-menu, and the roast list on /stanwell-pub, both added the £ themselves.
 */

import fs from 'fs'
import path from 'path'
import { render, cleanup } from '@testing-library/react'
import { SundayRoastFeature } from '@/app/food-menu/_components/SundayRoastFeature'
import type { MenuPageItem } from '@/lib/menu-page-data'

jest.mock('@/components/BookTableButton', () => ({
  BookTableButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button>
}))

const ROASTS = [
  { id: 'beef', name: 'Roasted Beef', price: '18', allergens: [] },
  { id: 'wellington', name: 'Wellington', price: '17.50', vegan: true, allergens: [] }
] as unknown as MenuPageItem[]

afterEach(cleanup)

describe('roast prices are shown bare', () => {
  it('prints each price in the roast section without a £', () => {
    const { container } = render(<SundayRoastFeature items={ROASTS} />)
    const rows = Array.from(container.querySelectorAll('li')).map(row => row.textContent ?? '')

    expect(rows).toHaveLength(2)
    expect(rows[0]).toContain('Roasted Beef18')
    expect(rows[1]).toContain('Wellington17.50')
    rows.forEach(row => expect(row).not.toContain('£'))
  })

  it('does not add a £ to the roast list on the Stanwell page', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'app/stanwell-pub/page.tsx'), 'utf8')
    const formatter = source.slice(
      source.indexOf('function formatMenuItemPrice'),
      source.indexOf('export function generateMetadata')
    )

    expect(formatter).toContain('item.price')
    expect(formatter).not.toContain('£')
  })
})
