import type { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import type { GameNightConfig } from './types'

/**
 * Shared metadata shape for the four hosted-game category pages.
 *
 * The four pages each hand-wrote the same object, and the parts that were meant
 * to be identical drifted while the parts that were meant to differ did not: all
 * four shipped the same generic events photograph as their `og:image`, so a quiz
 * link and a karaoke link previewed with a picture of neither, and none of the
 * four declared an `og:type` at all.
 *
 * The keyword-tuned strings stay per page, because they are doing measured work
 * (see tasks/keyword-plan-game-nights-2026-08-17.md). Everything structural now
 * comes from here and from the config's `share` block.
 */

export interface GameNightMetadataOptions {
  /**
   * The page title, without the brand. The root layout applies
   * `%s | The Anchor`, so adding it here would render it twice.
   */
  title: string
  /** The meta description. */
  description: string
  /**
   * `og:title` and `twitter:title`. These do carry the brand, because no title
   * template runs on them.
   */
  shareTitle: string
  /** `og:description` and `twitter:description`. */
  shareDescription: string
}

export function buildGameNightMetadata(
  config: GameNightConfig,
  { title, description, shareTitle, shareDescription }: GameNightMetadataOptions
): Metadata {
  const { image, alt, width, height } = config.share

  return {
    title,
    description,
    openGraph: {
      /**
       * Set deliberately. These are evergreen category landing pages, not
       * articles and not `og:event`: the page outlives any one night on it, and
       * the individual nights are the things with dates, at /events/[id].
       */
      type: 'website',
      title: shareTitle,
      description: shareDescription,
      // Real file dimensions, not the 1200x630 these pages used to declare for a
      // 1920x1080 file. A crawler uses these to reserve space and to decide
      // whether the image clears its minimum, so a wrong figure is a wrong crop.
      images: [{ url: image, width, height, alt }]
    },
    twitter: getTwitterMetadata({
      title: shareTitle,
      description: shareDescription,
      images: [image]
    }),
    alternates: {
      canonical: './'
    }
  }
}
