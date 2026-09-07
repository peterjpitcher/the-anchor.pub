/**
 * Page-level guarantees shared by the four hosted-game category pages.
 *
 * Three defects this locks shut:
 *
 *  1. All four rendered a visible `Home / <crumb>` trail and none emitted the
 *     matching `BreadcrumbList`, while /whats-on and /live-sport both did. The
 *     markup has to describe the trail that is actually on the page, so this
 *     asserts the two against each other rather than against a hardcoded string.
 *  2. All four shipped the same generic events photograph as their `og:image`,
 *     so a shared quiz link and a shared karaoke link previewed with a picture of
 *     neither, and none declared an `og:type`.
 *  3. The three pages that take a booking showed no social proof at the point of
 *     decision. It is now mounted on all four, and it must stay unaccompanied by
 *     `aggregateRating` or `review` markup.
 */

import fs from 'fs'
import path from 'path'
import type { Metadata } from 'next'
import { isValidElement, type ReactElement } from 'react'
import { render } from '@testing-library/react'
import type { Event } from '@/lib/api'
import { InteriorHero } from '@/components/hero'
import {
  GameNightBreadcrumb,
  GameNightSocialProof
} from '@/components/features/GameNight'
import { GAME_NIGHTS, type GameNightConfig } from '@/lib/game-nights'

const mockGetGameNightEvents = jest.fn<Promise<Event[]>, [GameNightConfig]>()

jest.mock('@/lib/game-nights', () => ({
  ...jest.requireActual('@/lib/game-nights'),
  getGameNightEvents: (config: GameNightConfig) => mockGetGameNightEvents(config)
}))

import QuizNightPage, { metadata as quizMetadata } from '@/app/quiz-night/page'
import CashBingoPage, { metadata as cashBingoMetadata } from '@/app/cash-bingo/page'
import MusicBingoPage, { metadata as musicBingoMetadata } from '@/app/music-bingo/page'
import KaraokePage, { metadata as karaokeMetadata } from '@/app/karaoke/page'

type Slug = GameNightConfig['slug']

const PAGES: Array<{
  slug: Slug
  Page: () => Promise<ReactElement>
  metadata: typeof quizMetadata
}> = [
  { slug: 'quiz-night', Page: QuizNightPage, metadata: quizMetadata },
  { slug: 'cash-bingo', Page: CashBingoPage, metadata: cashBingoMetadata },
  { slug: 'music-bingo', Page: MusicBingoPage, metadata: musicBingoMetadata },
  { slug: 'karaoke', Page: KaraokePage, metadata: karaokeMetadata }
]

/**
 * Every element declared in a page's own JSX, including the ones handed to
 * another component as a prop (InteriorHero takes its badges and actions that
 * way). Render functions are not followed: those are covered by the component
 * tests for the wrapper that calls them.
 */
function* walk(node: unknown): Generator<ReactElement> {
  if (Array.isArray(node)) {
    for (const child of node) yield* walk(child)
    return
  }
  if (!isValidElement(node)) return
  yield node
  for (const value of Object.values(node.props as Record<string, unknown>)) {
    if (Array.isArray(value) || isValidElement(value)) yield* walk(value)
  }
}

function elementsOfType(tree: ReactElement, type: unknown): ReactElement[] {
  return [...walk(tree)].filter((element) => element.type === type)
}

/**
 * The real pixel dimensions of a JPEG, read from its SOF segment.
 *
 * Small enough to keep local rather than pull a dependency in for. The point is
 * that the width and height a page advertises to a crawler are the file's own,
 * not a figure somebody typed: these pages used to declare 1200x630 for a
 * 1920x1080 file.
 */
function jpegSize(buffer: Buffer): { width: number; height: number } {
  if (buffer.readUInt16BE(0) !== 0xffd8) throw new Error('not a JPEG')

  let offset = 2
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) throw new Error('lost JPEG marker alignment')
    const marker = buffer[offset + 1]
    // SOF0 to SOF15, excluding DHT (C4), JPG (C8) and DAC (CC).
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) }
    }
    offset += 2 + buffer.readUInt16BE(offset + 2)
  }
  throw new Error('no JPEG frame header found')
}

/**
 * `Metadata['openGraph']` is a union whose base member declares no `type`, so
 * reading it needs a narrowing step. The shape below is what these four pages
 * actually build in lib/game-nights/metadata.ts.
 */
function openGraphOf(metadata: Metadata) {
  return metadata.openGraph as
    | { type?: string; images?: Array<Record<string, unknown>> }
    | undefined
}

/** The JSON-LD a `GameNightBreadcrumb` actually emits, parsed. */
function breadcrumbSchema(config: GameNightConfig) {
  const { container } = render(<GameNightBreadcrumb config={config} />)
  const script = container.querySelector('script[type="application/ld+json"]')
  if (!script?.textContent) throw new Error('no breadcrumb JSON-LD emitted')
  return JSON.parse(script.textContent)
}

beforeEach(() => {
  mockGetGameNightEvents.mockReset()
  mockGetGameNightEvents.mockResolvedValue([])
})

describe.each(PAGES)('/$slug', ({ slug, Page, metadata }) => {
  const config = GAME_NIGHTS[slug]

  it('emits BreadcrumbList markup', async () => {
    const tree = await Page()
    expect(elementsOfType(tree, GameNightBreadcrumb)).toHaveLength(1)
  })

  it('markup matches the trail the visitor can see', async () => {
    const tree = await Page()
    const [hero] = elementsOfType(tree, InteriorHero)
    const visibleCrumb = (hero.props as { crumb: string }).crumb

    const schema = breadcrumbSchema(config)
    expect(schema['@type']).toBe('BreadcrumbList')
    expect(schema.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.the-anchor.pub/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: visibleCrumb,
        item: `https://www.the-anchor.pub/${slug}`
      }
    ])
  })

  it('declares an og:type', () => {
    expect(openGraphOf(metadata)?.type).toBe('website')
  })

  it('declares the share image at its real dimensions', () => {
    const images = openGraphOf(metadata)?.images
    expect(Array.isArray(images)).toBe(true)
    expect((images as Array<Record<string, unknown>>)[0]).toEqual({
      url: config.share.image,
      alt: config.share.alt,
      width: config.share.width,
      height: config.share.height
    })
  })

  it('shows social proof once, beside the booking action', async () => {
    const tree = await Page()
    const badges = elementsOfType(tree, GameNightSocialProof)
    expect(badges).toHaveLength(1)
    expect((badges[0].props as { gameName: string }).gameName).toBe(config.name)
  })

  it('emits no aggregateRating or review markup', async () => {
    const tree = await Page()
    const serialised = JSON.stringify(tree, (_key, value) =>
      isValidElement(value) ? { ...(value.props as object) } : value
    )
    expect(serialised).not.toMatch(/aggregateRating/i)
    expect(serialised).not.toMatch(/"@type"\s*:\s*"(AggregateRating|Review)"/)
  })
})

describe('link previews across the four pages', () => {
  it('gives each page an image about itself, and never shares one', () => {
    const images = PAGES.map(({ metadata }) => {
      const list = openGraphOf(metadata)?.images as Array<{ url: string }>
      return list[0].url
    })
    expect(new Set(images).size).toBe(PAGES.length)
  })

  it('uses a real photograph of the night wherever one exists', () => {
    for (const slug of ['quiz-night', 'cash-bingo', 'music-bingo'] as Slug[]) {
      expect(GAME_NIGHTS[slug].share.image).toMatch(new RegExp(`^/images/events/${slug}/`))
    }
  })

  it('points every share image at a file that exists, at the size it declares', () => {
    for (const { slug } of PAGES) {
      const { image, width, height } = GAME_NIGHTS[slug].share
      const file = path.join(process.cwd(), 'public', image.replace(/^\//, ''))
      expect(fs.existsSync(file)).toBe(true)
      const { width: realWidth, height: realHeight } = jpegSize(fs.readFileSync(file))
      expect({ slug, width: realWidth, height: realHeight }).toEqual({ slug, width, height })
    }
  })

  it('never previews karaoke with another night’s photograph', () => {
    // There is no photograph of a karaoke night in the repo. A quiz or bingo
    // photo here would be a picture of an event that is not this one.
    expect(GAME_NIGHTS.karaoke.share.image).not.toMatch(/\/images\/events\//)
  })
})

describe('cash bingo age rule', () => {
  it('never publishes "18+ to play" without the half that invites families', () => {
    const halves = [
      cashBingoMetadata.description ?? '',
      GAME_NIGHTS['cash-bingo'].facts.map((fact) => fact.value).join(' ')
    ]
    for (const text of halves) {
      if (!/18\s*\+/.test(text)) continue
      expect(text).toMatch(/under\s*18s?\s*welcome/i)
    }
  })
})
