import fs from 'fs'
import path from 'path'

/**
 * Source-order regression for /sunday-lunch (Codex Wave 1, defect W-AB AB-001 /
 * W-IA ARCH-002).
 *
 * The page metadata + FAQ describe the post-launch state unconditionally
 * (Option A from the Codex handoff). The bridge for visitors arriving before
 * 17 May 2026 is the <LaunchAnnouncement> banner at the top of the page,
 * which flips between pre/post-launch copy via WALK_IN_LAUNCH_STARTS_AT_MS.
 *
 * That bridge only works if the banner renders BEFORE the date-sensitive H1
 * + lead paragraph. Asserting source order of the JSX is the cheapest, most
 * stable regression: rendering the full page would require mocking HeroWrapper
 * and many deps, and a snapshot would obscure the actual invariant.
 */
describe('/sunday-lunch source order', () => {
  const pagePath = path.resolve(__dirname, '../../app/sunday-lunch/page.tsx')
  const menuDataPath = path.resolve(__dirname, '../../lib/menu-page-data.ts')
  const source = fs.readFileSync(pagePath, 'utf8')
  const menuDataSource = fs.readFileSync(menuDataPath, 'utf8')

  it('renders <LaunchAnnouncement /> before the <PageTitle> H1', () => {
    const launchIndex = source.indexOf('<LaunchAnnouncement')
    const pageTitleIndex = source.indexOf('<PageTitle')

    expect(launchIndex).toBeGreaterThan(-1)
    expect(pageTitleIndex).toBeGreaterThan(-1)
    expect(launchIndex).toBeLessThan(pageTitleIndex)
  })

  it('renders <LaunchAnnouncement /> before the FAQAccordion (FAQ schema)', () => {
    const launchIndex = source.indexOf('<LaunchAnnouncement')
    const faqIndex = source.indexOf('<FAQAccordionWithSchema')

    expect(launchIndex).toBeGreaterThan(-1)
    expect(faqIndex).toBeGreaterThan(-1)
    expect(launchIndex).toBeLessThan(faqIndex)
  })

  it('still uses the date-aware <SundayLunchHowItWorks /> component', () => {
    // Defence-in-depth: if a future refactor inlines static post-launch copy
    // into the body, the bridge breaks for cached pages even if the banner
    // is still there.
    expect(source).toContain('<SundayLunchHowItWorks')
  })

  it('does not expose implementation wording in Sunday lunch menu copy', () => {
    expect(source).not.toMatch(/available online|shown online/i)
    expect(menuDataSource).not.toContain('menu API')
  })

  it('renders Sunday menu sections as cards so item descriptions are visible', () => {
    expect(menuDataSource).toContain("style: 'grid' as const")
  })
})
