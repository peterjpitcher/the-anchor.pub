import fs from 'fs'
import path from 'path'

const read = (file: string): string => fs.readFileSync(path.resolve(__dirname, '../..', file), 'utf8')

describe('the homepage heading says what we are and where', () => {
  const hero = read('app/_components/HomeHero.tsx')
  const h1 = hero.match(/<h1[\s\S]*?<\/h1>/)?.[0] ?? ''

  it('names the pub, the restaurant and the village in the H1', () => {
    expect(h1).toContain('Stanwell Moor&apos;s Village Pub and Restaurant')
    expect(h1).not.toContain('Eat, Drink, Enjoy')
  })

  it('keeps the motto on the hero, outside the H1', () => {
    expect(hero).toContain('Eat, Drink, Enjoy')
  })
})
