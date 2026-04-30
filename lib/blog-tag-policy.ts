const NOINDEX_BLOG_TAGS = new Set([
  'events',
  'food-and-drink',
  'news',
  'sports',
])

export function normalizeBlogTag(tag: string): string {
  try {
    return decodeURIComponent(tag).trim().toLowerCase()
  } catch {
    return tag.trim().toLowerCase()
  }
}

export function isNoindexBlogTag(tag: string): boolean {
  return NOINDEX_BLOG_TAGS.has(normalizeBlogTag(tag))
}

