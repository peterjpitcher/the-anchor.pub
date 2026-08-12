import fs from 'fs'
import path from 'path'
import {
  AVAILABLE_MONTHLY_HEROES,
  MONTH_FOLDERS,
  getMonthlyHomepageImagePath
} from '@/lib/seasonal-utils'

/**
 * Guards the one way the monthly hero rotation can break in production.
 *
 * `validateSeasonalImage()` returns true unconditionally when NODE_ENV is
 * production, because resolving a public/ path from a serverless function is
 * unreliable. That is the right call for runtime, but it means a month listed
 * in AVAILABLE_MONTHLY_HEROES without its image file would serve a 404 to
 * customers rather than falling back. The list and the files on disk have to
 * agree, so this checks them against each other.
 */

const PUBLIC_DIR = path.join(process.cwd(), 'public')

describe('monthly hero assets', () => {
  it('should have a real file for every month listed as available', () => {
    const missing = AVAILABLE_MONTHLY_HEROES.filter((month) => {
      const src = getMonthlyHomepageImagePath(MONTH_FOLDERS.indexOf(month) + 1, 1)
      return !src || !fs.existsSync(path.join(PUBLIC_DIR, src))
    })
    expect(missing).toEqual([])
  })

  it('should only list real month names', () => {
    AVAILABLE_MONTHLY_HEROES.forEach((month) => {
      expect(MONTH_FOLDERS).toContain(month)
    })
  })

  it('should not list the same month twice', () => {
    expect(new Set(AVAILABLE_MONTHLY_HEROES).size).toBe(AVAILABLE_MONTHLY_HEROES.length)
  })

  it('should ship every monthly hero as a JPEG under 260KB', () => {
    const tooBig: string[] = []
    AVAILABLE_MONTHLY_HEROES.forEach((month) => {
      const file = path.join(
        PUBLIC_DIR,
        'images/page-headers/home/monthly',
        month,
        'page-headers-homepage.jpg'
      )
      if (!fs.existsSync(file)) return
      const kb = fs.statSync(file).size / 1024
      if (kb > 260) tooBig.push(`${month} ${Math.round(kb)}KB`)
    })
    expect(tooBig).toEqual([])
  })

  it('should leave no unconverted PNG sources in the monthly folders', () => {
    const dir = path.join(PUBLIC_DIR, 'images/page-headers/home/monthly')
    if (!fs.existsSync(dir)) return
    const strays = fs
      .readdirSync(dir)
      .flatMap((month) => {
        const monthDir = path.join(dir, month)
        if (!fs.statSync(monthDir).isDirectory()) return []
        return fs
          .readdirSync(monthDir)
          .filter((f) => !f.endsWith('.jpg'))
          .map((f) => `${month}/${f}`)
      })
    expect(strays).toEqual([])
  })
})
