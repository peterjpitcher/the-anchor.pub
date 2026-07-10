import fs from 'fs'
import path from 'path'

function read(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('/christmas-parties responsive layout', () => {
  const pageSource = read('app/christmas-parties/client-components.tsx')
  const heroCtaSource = read('app/christmas-parties/christmas-hero-ctas.tsx')
  const drawerSource = read('components/ui/overlays/StickyDrawer.tsx')
  const stickyCtaSource = read('components/layout/StickyCtas.tsx')

  it('uses cards on mobile and the package table from tablet sizes upwards', () => {
    expect(pageSource).toContain('mt-8 space-y-3 md:hidden')
    expect(pageSource).toContain('mt-8 hidden overflow-hidden rounded-2xl border border-line bg-surface md:block')
  })

  it('uses the single global sticky bar for the Christmas enquiry', () => {
    expect(pageSource).not.toContain('StickyDrawerTrigger')
    expect(stickyCtaSource).toContain("const isChristmasParties = pathname === '/christmas-parties'")
    expect(stickyCtaSource).toContain('Christmas enquiry')
    expect(stickyCtaSource).toContain("detail: { source: 'sticky_global' }")
    expect(pageSource).toContain('const mode = customEvent.detail?.mode ?? context.mode')
  })

  it('does not add a second container around already-contained sections', () => {
    expect(pageSource).not.toMatch(/<Section[^>]*\bcontainer\b/)
  })

  it('keeps the meal image near the introduction and stacks the booking steps responsively', () => {
    expect(pageSource).toContain('grid items-center gap-8 lg:grid-cols-2')
    expect(pageSource).toContain('<Grid cols={3} gap="md" className="mt-8">')
    expect(pageSource).toContain('1. Choose your sitting')
    expect(pageSource).toContain('3. Send your pre-order')
  })

  it('keeps enquiry overlays above sticky UI and scrollable on short screens', () => {
    expect(pageSource).toContain('fixed inset-0 z-[110]')
    expect(pageSource).toContain('max-h-[calc(100dvh-2rem)]')
    expect(pageSource).toContain('overflow-y-auto overscroll-contain')
    expect(drawerSource).toContain('fixed z-[90]')
    expect(drawerSource).toContain('fixed inset-0 z-[90]')
  })

  it('shows compact call and email actions side by side on mobile', () => {
    expect(heroCtaSource).toContain('grid w-full grid-cols-2 gap-3 md:flex')
    expect(heroCtaSource).toContain('<span className="sm:hidden">Call us</span>')
  })
})
