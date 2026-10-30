import fs from 'fs'
import path from 'path'
import { SUNDAY_ROAST_SEARCH_TITLE } from '@/lib/approved-wording'

const read = (file: string): string => fs.readFileSync(path.resolve(__dirname, '../..', file), 'utf8')

describe('/sunday-roast says where it is, not only how far from Heathrow', () => {
  const page = read('app/sunday-roast/page.tsx')

  it('takes its title from the one approved place, and it still fits', () => {
    expect(SUNDAY_ROAST_SEARCH_TITLE).toBe('Best Sunday Roast Near Heathrow & Staines')
    expect(page).toContain('const title = SUNDAY_ROAST_SEARCH_TITLE')
    expect(`${SUNDAY_ROAST_SEARCH_TITLE} | The Anchor`.length).toBeLessThanOrEqual(60)
  })

  it('keeps "best" out of the heading, the copy and the social card', () => {
    expect(page).toContain("const socialTitle = 'Sunday Roast Near Staines & Heathrow, Walk-Ins Welcome | The Anchor'")
    expect(page).not.toMatch(/\bbest sunday roast\b/i)
  })

  it('names Staines in the H1 and Stanwell Moor in the heading under it', () => {
    expect(page).toContain('title="Sunday Roast Near Staines & Heathrow"')
    expect(page).toContain('Sunday Roast in Stanwell Moor at The Anchor')
  })

  it('names all three places in the description and the intro', () => {
    expect(page).toContain('Sunday roast in Stanwell Moor, near Staines and Heathrow T5.')
    expect(page).toContain('{DRIVE_TIMES.staines} minutes from Staines and {HEATHROW_TIMES.terminal5} from Heathrow Terminal 5')
  })

  it('answers the Staines question', () => {
    expect(page).toContain('Where can I get a Sunday roast near Staines?')
  })

  it('shows the live price in the hero and no longer says prices are elsewhere', () => {
    expect(page).toContain('Roasts {sundayMenu.priceFromLabel}')
    expect(page).not.toContain('Prices are kept current')
  })

  it('opens the Surrey list with Staines and Stanwell Moor', () => {
    const post = read('content/blog/best-sunday-roast-surrey/index.md')
    expect(post).toContain('**Looking for a Sunday roast near Staines or Stanwell Moor?**')
    expect(post).toContain("We're 8 minutes from Staines and 7 to 12 minutes from any Heathrow terminal.")
  })

  it('records the title in the SSOT', () => {
    const ssot = read('docs/SSOT.md')
    expect(ssot).toContain('### The Sunday roast search title')
    expect(ssot).toContain('> Best Sunday Roast Near Heathrow & Staines')
    expect(ssot).toContain('one "best" page title')
  })
})
