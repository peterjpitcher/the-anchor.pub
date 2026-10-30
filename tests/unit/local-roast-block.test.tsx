import fs from 'fs'
import path from 'path'
import { render, screen } from '@testing-library/react'
import { LocalRoastBlock } from '@/components/seo/LocalRoastBlock'

jest.mock('next/navigation', () => ({
  usePathname: () => '/staines-pub',
}))

const read = (file: string): string => fs.readFileSync(path.resolve(__dirname, '../..', file), 'utf8')

describe('LocalRoastBlock', () => {
  beforeEach(() => {
    render(
      <LocalRoastBlock
        area="Staines"
        travelLine="We're 8 minutes from Staines-upon-Thames."
        source="staines_pub_roast_block"
      />
    )
  })

  it('names the area and says walk in or book', () => {
    expect(screen.getByRole('heading', { name: 'Sunday Roast Near Staines' })).toBeInTheDocument()
    expect(screen.getByText(/Walk in whenever suits you, or book if you're a group or want a set time\./)).toBeInTheDocument()
    expect(screen.getByText(/We're 8 minutes from Staines-upon-Thames\./)).toBeInTheDocument()
  })

  it('links to the roast page and the menu, and offers the booking button', () => {
    expect(screen.getByRole('link', { name: 'See the Sunday roast' })).toHaveAttribute('href', '/sunday-roast')
    expect(screen.getByRole('link', { name: 'food menu' })).toHaveAttribute('href', '/food-menu')
    expect(screen.getByRole('button', { name: 'Book a table' })).toBeInTheDocument()
  })

  it('types no price', () => {
    expect(document.body.textContent).not.toContain('£')
  })
})

describe('the area pages', () => {
  it('mount the block', () => {
    expect(read('app/staines-pub/page.tsx')).toContain('area="Staines"')
    expect(read('app/ashford-pub/page.tsx')).toContain('area="Ashford"')
  })
})
