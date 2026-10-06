import fs from 'fs'
import path from 'path'
import { act, render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReviewsCarousel } from '@/components/reviews/ReviewsCarousel'
import { contrastRatio } from '@/lib/contrast'
import type { GoogleReview } from '@/lib/google/types'

/**
 * The pagination dots were 8px buttons, so the whole tap target was 8px by 8px
 * and failed WCAG 2.2 AA 2.5.8 (target size, 24px minimum) on every page that
 * renders the carousel. Found by axe on the live site, 5 October 2026.
 *
 * jsdom has no layout, so it cannot measure a target. These specs pin the
 * shape that makes the size hold (a 24px button with the 8px dot drawn inside
 * it); the measurement itself is taken in a real browser by
 * `scripts/audit-a11y.js`, which covers /heathrow-parking.
 */
const reviews: GoogleReview[] = Array.from({ length: 6 }, (_, i) => ({
  author_name: `Reviewer ${i + 1}`,
  language: 'en',
  rating: 5,
  relative_time_description: 'a week ago',
  text: `Review text ${i + 1}`,
  time: 1_750_000_000 + i,
}))

const renderCarousel = () => render(<ReviewsCarousel reviews={reviews} autoPlay={false} />)
const getDots = () => screen.getAllByRole('button', { name: /^Go to review \d+$/ })
const getMark = (dot: HTMLElement) => dot.firstElementChild as HTMLElement
const activeLabels = () =>
  getDots()
    .filter((dot) => getMark(dot).classList.contains('bg-anchor-gold-dark'))
    .map((dot) => dot.getAttribute('aria-label'))

describe('ReviewsCarousel pagination dots', () => {
  it('renders one labelled dot per review', () => {
    renderCarousel()
    expect(getDots().map((dot) => dot.getAttribute('aria-label'))).toEqual([
      'Go to review 1',
      'Go to review 2',
      'Go to review 3',
      'Go to review 4',
      'Go to review 5',
      'Go to review 6',
    ])
  })

  it('gives each dot a 24px target with the 8px dot drawn inside it', () => {
    renderCarousel()
    for (const dot of getDots()) {
      // h-6 w-6 is 24px by 24px, the WCAG 2.2 AA minimum.
      expect(dot).toHaveClass('h-6', 'w-6')
      expect(dot.children).toHaveLength(1)

      const mark = getMark(dot)
      expect(mark).toHaveClass('h-2', 'w-2', 'rounded-full')
      // Decorative: the button's aria-label is the accessible name.
      expect(mark).toHaveAttribute('aria-hidden', 'true')
    }
  })

  it('does not space the targets apart, so the dots sit at the 24px minimum pitch', () => {
    renderCarousel()
    const pager = getDots()[0].parentElement as HTMLElement
    expect(pager.className).not.toMatch(/\bgap-/)
  })

  it('marks only the current review, and moves the mark when a dot is clicked', () => {
    const { container } = renderCarousel()
    expect(activeLabels()).toEqual(['Go to review 1'])

    fireEvent.click(getDots()[3])

    expect(activeLabels()).toEqual(['Go to review 4'])
    expect(container.querySelector('.transition-transform')).toHaveStyle({
      transform: 'translateX(-300%)',
    })
  })

  it('keeps every dot a keyboard stop that Enter and Space activate', async () => {
    const user = userEvent.setup()
    renderCarousel()
    const dots = getDots()

    for (const dot of dots) {
      expect(dot.tagName).toBe('BUTTON')
      expect(dot).not.toHaveAttribute('tabindex')
    }

    act(() => dots[1].focus())
    await user.keyboard('{Enter}')
    expect(activeLabels()).toEqual(['Go to review 2'])

    await user.tab()
    expect(dots[2]).toHaveFocus()
    await user.keyboard(' ')
    expect(activeLabels()).toEqual(['Go to review 3'])
  })
})

/**
 * The other dots were `bg-ink-muted/30`, an opacity modifier on a CSS variable
 * that Tailwind compiled to nothing, so they painted nothing in either skin.
 * Found 5 October 2026. They are now rings in --text-muted, which must clear
 * 3:1 against whatever surface the carousel sits on (WCAG 2.2 AA 1.4.11).
 */
describe('ReviewsCarousel inactive dots', () => {
  // A custom property's final value in each skin, read from app/globals.css.
  const css = fs.readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf8')
  const declarations = (selector: string): Record<string, string> => {
    const start = css.indexOf(selector)
    const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('\n}', start))
    return Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
  }
  const light = declarations(':root {')
  const skins: Record<string, Record<string, string>> = {
    light,
    dark: { ...light, ...declarations('[data-theme="dark"] {') },
  }
  const resolve = (vars: Record<string, string>, name: string): string => {
    let value = vars[name]
    while (value?.startsWith('var(')) value = vars[value.slice(4, -1)]
    return value
  }

  it('draws every dot but the current one as a ring in the muted ink', () => {
    renderCarousel()
    const [current, ...others] = getDots().map(getMark)

    expect(current).toHaveClass('bg-anchor-gold-dark')
    expect(current.className).not.toMatch(/\bborder/)
    for (const mark of others) {
      expect(mark).toHaveClass('border-2', 'border-ink-muted')
      // No opacity modifier: the muted ink at full strength is what clears 3:1.
      expect(mark.className).not.toMatch(/\/\d/)
    }
  })

  it.each(['light', 'dark'])('clears 3:1 against every page surface in the %s skin', (skin) => {
    const ring = resolve(skins[skin], '--text-muted')
    expect(ring).toMatch(/^#[0-9a-f]{6}$/i)

    const surfaces = ['--bg', '--surface', '--surface-raised', '--surface-sunk']
    for (const surface of surfaces) expect(resolve(skins[skin], surface)).toMatch(/^#[0-9a-f]{6}$/i)

    const under3to1 = surfaces
      .map((surface) => ({ surface, ratio: contrastRatio(ring, resolve(skins[skin], surface)) }))
      .filter(({ ratio }) => ratio < 3)
    expect(under3to1).toEqual([])
  })
})
