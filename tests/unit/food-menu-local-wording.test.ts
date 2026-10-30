import fs from 'fs'
import path from 'path'

const read = (file: string): string => fs.readFileSync(path.resolve(__dirname, '../..', file), 'utf8')

describe('/food-menu says where it is', () => {
  const page = read('app/food-menu/page.tsx')

  it('names Stanwell Moor and Staines in a title that fits', () => {
    const title = page.match(/title: '(Pub Food Menu[^']*)',\n\s+description,\n\s+openGraph/)?.[1] ?? ''
    expect(title).toBe('Pub Food Menu, Stanwell Moor near Staines')
    expect(`${title} | The Anchor`.length).toBeLessThanOrEqual(60)
  })

  it('names them in the H1 and keeps Heathrow in the body', () => {
    expect(page).toContain('title="Proper pub food in Stanwell Moor, near Staines"')
    expect(page).toContain('minutes from Heathrow Terminal 5 with free parking')
  })

  it('names all three in the description', () => {
    expect(page).toContain('Pub food menu in Stanwell Moor, near Staines and Heathrow T5.')
  })
})
