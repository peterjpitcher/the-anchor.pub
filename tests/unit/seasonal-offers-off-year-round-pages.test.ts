/**
 * Offers that are seasonal, or not on file, stay off the year-round pages
 * (site review P13: C1-049 and C3-030).
 *
 * The three festive buffets were listed all year on every occasion page, wakes
 * and baby showers included. The summer garden parties page sold a chef's
 * outdoor BBQ, an outdoor bottle bar and a part-garden hire the SSOT does not
 * hold.
 */

import fs from 'fs'
import path from 'path'
import { isFestivePackageName } from '@/lib/api/catering-packages'

const read = (file: string): string => fs.readFileSync(path.join(process.cwd(), file), 'utf8')
const code = (file: string): string => read(file).replace(/^\s*\/\/.*$/gm, '')

describe('festive buffets on the occasion pages', () => {
  it.each(['Festive Sandwich & Salad', 'Festive Hot Finger', 'Festive Premium Grazing', ' festive grazing'])(
    'treats "%s" as festive',
    (name) => expect(isFestivePackageName(name)).toBe(true)
  )

  it.each(['Sandwich Buffet', 'Indoor BBQ', 'Premium Grazing Board', 'Festivities Platter', '', null, undefined])(
    'does not treat "%s" as festive',
    (name) => expect(isFestivePackageName(name)).toBe(false)
  )

  it('the shared catering card leaves them out', () => {
    expect(read('app/private-hire/_components/CateringPackagesCard.tsx')).toContain(
      'foodPackages.filter(pkg => !isFestivePackageName(pkg.name))'
    )
  })

  it('the SSOT still names the three festive buffets as Christmas offers', () => {
    expect(read('docs/SSOT.md')).toContain('Festive Sandwich & Salad, Festive Hot Finger, Festive Premium Grazing')
  })
})

describe('/summer-garden-parties', () => {
  const page = code('app/summer-garden-parties/page.tsx')

  it('no longer sells a manned grill, an outdoor bar or a part-garden hire', () => {
    expect(page).not.toMatch(/man the grill|Chef(?:&apos;|')s BBQ|bottle bar|Outdoor Service|section off|BBQ Hire|BBQ packages|outdoor bar/i)
  })

  it('names the Indoor BBQ package and reads its minimum from the catering data', () => {
    expect(page).toContain('Indoor BBQ package')
    expect(page).toContain('getCateringData()')
    expect(page).not.toMatch(/minimum of 20 guests|\b20 guests\b/)
    expect(read('docs/SSOT.md')).toMatch(/\| Indoor BBQ \|/)
  })
})
