import fs from 'fs'
import path from 'path'
import { render, screen } from '@testing-library/react'
import { HomeRoastBand } from '@/app/_components/HomeRoastBand'
import { BEST_ROAST_CLAIM } from '@/lib/approved-wording'

const mockState = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

jest.mock('@/lib/festive-kitchen-closure', () => ({
  ...jest.requireActual('@/lib/festive-kitchen-closure'),
  getFestiveKitchenStatus: () => ({ state: mockState(), today: '2026-11-09', closure: null }),
  getFestiveKitchenWording: () => 'The kitchen sentence.',
}))

const read = (file: string): string => fs.readFileSync(path.resolve(__dirname, '../..', file), 'utf8')

describe('HomeRoastBand', () => {
  beforeEach(() => {
    mockState.mockReturnValue('none')
  })

  it('makes the claim as an opinion, in the approved words', () => {
    render(<HomeRoastBand />)
    expect(BEST_ROAST_CLAIM).toBe("We reckon it's the best Sunday roast near Heathrow")
    expect(screen.getByRole('heading', { name: BEST_ROAST_CLAIM })).toBeInTheDocument()
  })

  it('shows the real reviews the claim rests on, with who wrote them', () => {
    render(<HomeRoastBand />)
    expect(screen.getByText(/the best she has ever had/)).toBeInTheDocument()
    expect(screen.getByText(/Kathryn Barker, Google review, May 2026/)).toBeInTheDocument()
    expect(screen.getByText(/just to experience the Sunday roast again/)).toBeInTheDocument()
    expect(screen.getByText(/IJ, Google review, November 2025/)).toBeInTheDocument()
  })

  it('offers booking and the roast page', () => {
    render(<HomeRoastBand />)
    expect(screen.getByRole('button', { name: 'Book your Sunday table' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'See the Sunday roast' })).toHaveAttribute('href', '/sunday-roast')
  })

  it('carries the closure notice while the break is coming', () => {
    mockState.mockReturnValue('ahead')
    render(<HomeRoastBand />)
    expect(screen.getByRole('note')).toHaveTextContent('The kitchen sentence.')
  })

  it('disappears while the kitchen is shut', () => {
    mockState.mockReturnValue('closed')
    const { container } = render(<HomeRoastBand />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('the homepage', () => {
  const page = read('app/page.tsx')

  it('puts the section after the amenity strip and before the path cards', () => {
    expect(page.indexOf('<HomeRoastBand')).toBeGreaterThan(page.indexOf('<AmenityStrip'))
    expect(page.indexOf('<HomeRoastBand')).toBeLessThan(page.indexOf('What are you here for?'))
  })

  it('keeps the claim out of the title, description and structured data', () => {
    expect(page).not.toContain('BEST_ROAST_CLAIM')
  })
})

describe('the SSOT', () => {
  it('records the exception and the decision', () => {
    const ssot = read('docs/SSOT.md')
    expect(ssot).toContain('### The best-roast line')
    expect(ssot).toContain("> We reckon it's the best Sunday roast near Heathrow.")
    expect(ssot).toContain('one "best" line for the homepage')
  })
})
