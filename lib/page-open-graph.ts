import type { Metadata } from 'next'
import { DEFAULT_OG_IMAGE } from '@/lib/image-fallbacks'

type OpenGraph = NonNullable<Metadata['openGraph']>

interface PageOpenGraphInput {
  /** The page's own title, without the pub's name on the end. */
  title: string
  description: string
  /** A path under public/. Falls back to the site's default share picture. */
  image?: string
  imageAlt?: string
}

/**
 * A complete share block for a page that has nothing special to say about
 * itself beyond its title and description.
 *
 * A page without an `openGraph` block inherits the root layout's, which is
 * written for the homepage. Next replaces the whole block rather than merging
 * it, so a page that sets only a title also loses the picture. This returns
 * every field, so a page shares as itself and keeps a picture.
 *
 * No `url` on purpose: without one, a share uses the address the visitor is
 * on, which is the canonical address.
 */
export function pageOpenGraph({ title, description, image, imageAlt }: PageOpenGraphInput): OpenGraph {
  return {
    title: `${title} | The Anchor`,
    description,
    siteName: 'The Anchor',
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: image ?? DEFAULT_OG_IMAGE,
        alt: imageAlt ?? 'The Anchor in Stanwell Moor',
      },
    ],
  }
}
