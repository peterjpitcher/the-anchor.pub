/**
 * Utility for generating Twitter card metadata
 */

import { Metadata } from 'next'
import { DEFAULT_PAGE_HEADER_IMAGE } from './image-fallbacks'

interface TwitterMetadataOptions {
  title: string
  description: string
  images?: string[]
  card?: 'summary' | 'summary_large_image'
}

function normalizeTwitterHandle(value?: string): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`
}

const DEFAULT_TWITTER_HANDLE = normalizeTwitterHandle(
  process.env.NEXT_PUBLIC_TWITTER_HANDLE || process.env.NEXT_PUBLIC_X_HANDLE
)

/**
 * Generates Twitter card metadata for a page
 * @param options - Twitter metadata options
 * @returns Twitter metadata object
 */
export function getTwitterMetadata(options: TwitterMetadataOptions): NonNullable<Metadata['twitter']> {
  const {
    title,
    description,
    images = [DEFAULT_PAGE_HEADER_IMAGE],
    card = 'summary_large_image'
  } = options

  const handle = DEFAULT_TWITTER_HANDLE

  return {
    card,
    title: title.length > 70 ? `${title.substring(0, 67)}...` : title,
    description: description.length > 200 ? `${description.substring(0, 197)}...` : description,
    images,
    ...(handle ? { site: handle, creator: handle } : {})
  }
}

/**
 * Default Twitter metadata for pages without specific metadata
 */
export const defaultTwitterMetadata: NonNullable<Metadata['twitter']> = {
  card: 'summary_large_image',
  title: 'The Anchor Pub - Near Heathrow Airport',
  description: 'Traditional pub with modern entertainment. Quiz nights, hosted events, great food & more.',
  images: [DEFAULT_PAGE_HEADER_IMAGE],
  ...(DEFAULT_TWITTER_HANDLE ? { site: DEFAULT_TWITTER_HANDLE, creator: DEFAULT_TWITTER_HANDLE } : {})
}
