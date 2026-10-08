/**
 * Text over an interior hero photo can be read whatever the photo is, and the
 * festive frost cannot change that (site review AX-005 and AX-006; owner
 * decision 19, 7 October 2026).
 *
 * This is arithmetic, not a screenshot. It takes the worst photo there can be,
 * pure white, lays the hero's wash over it at the right-hand end of the text
 * column, and checks every text style in the hero still reaches 4.5:1 there.
 * If that holds over white it holds over any photo. The frost is drawn under
 * the wash, so it is part of "the photo" and is covered by the same sum.
 *
 * It does not replace the pixel measurement the review used: text over the
 * buttons, and the homepage hero, are outside it.
 */

import fs from 'fs'
import path from 'path'
import { render } from '@testing-library/react'
import { InteriorHero } from '@/components/hero'
import { Badge } from '@/components/ui'
import {
  HERO_BADGE_FILL,
  HERO_SCRIM_BANDS,
  HERO_SCRIM_HOLD,
  HERO_SCRIM_RGB,
  HERO_TEXT_COLUMN_MAX_PX,
  heroScrimAlphaAt,
  heroScrimBackground,
  heroScrimBandFor
} from '@/lib/hero-scrim'

type Rgb = readonly [number, number, number]

const WHITE: Rgb = [255, 255, 255]
const CONTAINER_MAX = 1280
const CONTAINER_PAD = 16

const css = fs.readFileSync(path.join(process.cwd(), 'app', 'globals.css'), 'utf8')
const heroSource = fs.readFileSync(path.join(process.cwd(), 'components', 'hero', 'InteriorHero.tsx'), 'utf8')

function token(name: string): Rgb {
  const match = new RegExp(`--${name}:\\s*#([0-9a-fA-F]{6})`).exec(css)
  if (!match) throw new Error(`--${name} is not a six-digit hex in app/globals.css`)
  return [0, 2, 4].map((i) => parseInt(match[1].slice(i, i + 2), 16)) as unknown as Rgb
}

function hex(value: string): Rgb {
  return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16)) as unknown as Rgb
}

const over = (top: Rgb, bottom: Rgb, alpha: number): Rgb =>
  top.map((channel, i) => channel * alpha + bottom[i] * (1 - alpha)) as unknown as Rgb

function luminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map((value) => {
    const s = value / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** Where the text column ends, as a share of the hero's width. */
function textColumnEnd(viewport: number): number {
  const container = Math.min(viewport, CONTAINER_MAX)
  const left = (viewport - container) / 2 + CONTAINER_PAD
  const inner = container - CONTAINER_PAD * 2
  const column = viewport >= 1024 ? Math.min(inner, HERO_TEXT_COLUMN_MAX_PX) : inner
  return (left + column) / viewport
}

const CREAM = token('anchor-cream-text')
const GOLD = token('anchor-gold-bright')

/** Every text style in the hero: its ink, and the opacity its class gives it. */
const TEXT_STYLES: [string, Rgb, number][] = [
  ['breadcrumb (cream at 90%)', CREAM, 0.9],
  ['kicker (gold)', GOLD, 1],
  ['title and note (cream)', CREAM, 1],
  ['lead (cream at 90%)', CREAM, 0.9]
]

const VIEWPORTS = [320, 375, 390, 414, 640, 768, 1023, 1024, 1100, 1279, 1280, 1366, 1440, 1920, 2560]

describe('the interior hero wash', () => {
  it.each(VIEWPORTS)('never drops below the hold under the text column at %ipx', (viewport) => {
    const band = heroScrimBandFor(viewport)
    const alpha = heroScrimAlphaAt(band, textColumnEnd(viewport))
    expect(alpha).toBeGreaterThanOrEqual(HERO_SCRIM_HOLD - 1e-9)
  })

  it.each(TEXT_STYLES)('%s reaches 4.5:1 over a pure white photo at every width', (_name, ink, opacity) => {
    for (const viewport of VIEWPORTS) {
      const band = heroScrimBandFor(viewport)
      const alpha = heroScrimAlphaAt(band, textColumnEnd(viewport))
      const background = over(HERO_SCRIM_RGB, WHITE, alpha)
      const text = over(ink, background, opacity)
      expect(contrast(text, background)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('still lets the photo through to the right of the text on a wide screen', () => {
    const wide = heroScrimBandFor(1440)
    expect(heroScrimAlphaAt(wide, 1)).toBeLessThanOrEqual(0.4)
  })

  it('the component uses the bands, the column cap and the opacities this test assumes', () => {
    expect(heroSource).toContain('HERO_SCRIM_BANDS.map')
    expect(heroSource).toContain(`lg:max-w-[${HERO_TEXT_COLUMN_MAX_PX}px]`)
    expect(heroSource).toMatch(/aria-label="Breadcrumb" className="text-xs text-anchor-cream-text\/90"/)
    expect(heroSource).toMatch(/className="text-xl text-anchor-cream-text\/90"/)
    expect(heroSource).not.toMatch(/cream-text\/\[0\.72\]/)
    expect(css).toMatch(/--container-max:\s*1280px/)
    expect(css).toMatch(/--container-pad:\s*1rem/)
  })
})

describe('the rendered hero', () => {
  const view = () =>
    render(
      <InteriorHero
        image="/images/page-headers/whats-on/whats-on.jpg"
        crumb="Test"
        kicker="Kicker"
        title="Title"
        lead="Lead"
        badges={<Badge variant="sand">Free parking</Badge>}
      />
    ).container

  // jsdom drops a style value it cannot parse (stacked gradients, var()), so
  // the gradients are checked as strings and the layer order from the source.
  it('draws one wash per width band, each shown only at its own widths', () => {
    const washes = [...view().querySelectorAll<HTMLElement>('[data-hero-scrim]')]
    expect(washes).toHaveLength(HERO_SCRIM_BANDS.length)
    expect(washes.map((wash) => wash.className.replace('absolute inset-0 z-[1] ', ''))).toEqual([
      'lg:hidden',
      'hidden lg:block xl:hidden',
      'hidden xl:block'
    ])
    expect(HERO_SCRIM_BANDS.map((band) => band.minWidth)).toEqual([0, 1024, 1280])
    expect(heroScrimBackground(HERO_SCRIM_BANDS[0])).toBe(
      'linear-gradient(90deg, rgba(12,29,17,0.92) 0%, rgba(12,29,17,0.82) 100%), linear-gradient(0deg, rgba(12,29,17,0.55) 0%, rgba(12,29,17,0) 45%)'
    )
  })

  it('draws the frost under the wash, so it cannot lighten what the text sits on', () => {
    const frost = heroSource.indexOf('<HeroFrost />')
    const wash = heroSource.indexOf('HERO_SCRIM_BANDS.map')
    const content = heroSource.indexOf('data-hero-text')
    expect(frost).toBeGreaterThan(-1)
    expect(frost).toBeLessThan(wash)
    expect(wash).toBeLessThan(content)
    expect(heroSource.match(/<HeroFrost \/>/g)).toHaveLength(1)
  })

  it('gives sand badges a solid fill that the gold ink reads on', () => {
    const badgeRow = view().querySelector('[data-hero-text] > div[style*="--tile"]') as HTMLElement
    expect(badgeRow.getAttribute('style')).toContain(HERO_BADGE_FILL)
    expect(HERO_BADGE_FILL).toMatch(/^#[0-9a-f]{6}$/)
    expect(contrast(GOLD, hex(HERO_BADGE_FILL))).toBeGreaterThanOrEqual(4.5)
  })
})
