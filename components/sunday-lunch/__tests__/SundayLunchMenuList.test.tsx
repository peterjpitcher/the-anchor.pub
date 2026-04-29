import { render, screen } from '@testing-library/react'
import { SundayLunchMenuList, type SundayLunchMenuItem } from '../SundayLunchMenuList'

const ITEMS: SundayLunchMenuItem[] = [
  {
    name: 'Roast Beef Topside',
    description: 'Slow-roasted topside, carved fresh per plate.',
  },
  {
    name: 'Beetroot & Butternut Squash Wellington',
    description: 'Golden puff pastry with seasonal vegetables and our vegan gravy.',
    badge: 'Vegan',
  },
]

describe('SundayLunchMenuList', () => {
  it('renders one row per menu item with name and description', () => {
    render(<SundayLunchMenuList items={ITEMS} />)

    expect(
      screen.getByRole('heading', { level: 3, name: /roast beef topside/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: /beetroot.*wellington/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/slow-roasted topside, carved fresh per plate\./i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/golden puff pastry with seasonal vegetables/i)
    ).toBeInTheDocument()
  })

  it('renders an optional badge next to the dish name', () => {
    render(<SundayLunchMenuList items={ITEMS} />)

    expect(screen.getByText('Vegan')).toBeInTheDocument()
  })

  it('does not render any clickable rows or buttons', () => {
    render(<SundayLunchMenuList items={ITEMS} />)

    // Menu rows must be plain list items — no buttons, no links.
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(screen.queryAllByRole('link')).toHaveLength(0)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not display any prices', () => {
    render(<SundayLunchMenuList items={ITEMS} />)

    // No GBP signs anywhere in the rendered tree.
    expect(screen.queryByText(/£\s*\d/)).not.toBeInTheDocument()
  })
})
