import fs from 'fs'
import path from 'path'

/**
 * Source checks for /sunday-roast.
 *
 * This file used to assert that the walk-in launch banner rendered before the
 * page heading, because the banner was the bridge for visitors arriving before
 * 17 May 2026. The banner showed nothing after 6pm that day and was removed on
 * 8 October 2026 (site review findings DT-015 and DT-021), so those two checks
 * went with it. What is left guards the page's wording and layout.
 */
describe('/sunday-roast source order', () => {
  const pagePath = path.resolve(__dirname, '../../app/sunday-roast/page.tsx')
  const menuDataPath = path.resolve(__dirname, '../../lib/menu-page-data.ts')
  const source = fs.readFileSync(pagePath, 'utf8')
  const menuDataSource = fs.readFileSync(menuDataPath, 'utf8')

  it('no longer mounts the launch banner, which ended on 17 May 2026', () => {
    expect(source).not.toContain('LaunchAnnouncement')
  })

  it('still uses the date-aware <SundayLunchHowItWorks /> component', () => {
    // Defence-in-depth: if a future refactor inlines static post-launch copy
    // into the body, the bridge breaks for cached pages even if the banner
    // is still there.
    expect(source).toContain('<SundayLunchHowItWorks')
  })

  it('does not expose implementation or old Sunday lunch wording in menu copy', () => {
    expect(source).not.toMatch(/available online|shown online/i)
    expect(source).not.toMatch(/Sunday lunch|Sunday Lunch|sunday lunch/)
    expect(menuDataSource).not.toMatch(/Sunday lunch|Sunday Lunch|sunday lunch/)
    expect(menuDataSource).not.toContain('menu API')
  })

  it('renders Sunday menu sections as cards so item descriptions are visible', () => {
    expect(menuDataSource).toContain("style: 'grid' as const")
  })
})
