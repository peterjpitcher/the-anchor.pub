import type { BlogPost } from '@/lib/markdown'

/** Minimum shape needed to relate two posts. Keeps this unit testable. */
export type RelatablePost = Pick<BlogPost, 'slug' | 'title' | 'description' | 'date' | 'tags'> & {
  hero?: string
  noindex?: boolean
}

/**
 * Words that appear on so much of this blog that matching on them says
 * nothing about topic. "Pub near Heathrow" is the whole site.
 */
const STOPWORDS = new Set([
  'the','a','an','and','or','for','to','of','in','at','on','your','you','our','we','is','are',
  'with','from','how','what','why','when','best','guide','guides','tips','ideas','near','nearby',
  'pub','pubs','anchor','heathrow','airport','stanwell','moor','staines','surrey','uk','2024',
  '2025','2026','it','this','that','vs','my','me','be','can','do','get','s',
  // 'day' matched "corporate-away-day" to "womens-day-celebration". Calendar
  // posts already share the 'seasonal' tag, so it carries no topical signal.
  'day',
])

function tokens(post: RelatablePost): Set<string> {
  return new Set(
    `${post.slug} ${post.title}`
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/[\s-]+/)
      .map((w) => (w.endsWith('s') && w.length > 4 ? w.slice(0, -1) : w))
      .filter((w) => w.length > 2 && !STOPWORDS.has(w)),
  )
}

/**
 * Pick topically related posts for the foot of an article.
 *
 * Previously the blog offered only chronological previous/next links, so a
 * post's inbound links came from whatever happened to be published either side
 * of it. The August 2026 audit found all 50 indexable posts sitting on one or
 * two editorial inbound links, several of them long-form guides that Search
 * Console had found and declined to index.
 *
 * Tag overlap alone does NOT work on this blog and was tried first. The tag
 * vocabulary is 13 terms, "guides" is on 36 of 53 posts and "private-hire" on
 * 16, so "wake-venue-near-heathrow" and "work-christmas-party-ideas" carry
 * identical tags. Scoring on tags alone offered four Christmas party articles
 * at the foot of a page about funerals.
 *
 * So tags are the coarse filter and title wording is the discriminator:
 *   - Tags are weighted by inverse document frequency, so a tag shared by most
 *     of the blog contributes almost nothing and a rare one counts.
 *   - Shared meaningful words in the slug and title score far higher. Words
 *     that describe the whole site ("pub", "near", "heathrow") are stopwords,
 *     otherwise everything matches everything.
 *   - Recency only ever breaks an exact tie.
 *
 * A post needs a real signal to appear at all: either a shared word, or a tag
 * that is not near-universal. Padding the block with whatever is newest just
 * trades one arbitrary link set for another.
 */
export function getRelatedPosts<T extends RelatablePost>(
  current: RelatablePost,
  candidates: readonly T[],
  limit = 4,
): T[] {
  const pool = candidates.filter((p) => p.slug !== current.slug && !p.noindex)
  if (pool.length === 0) return []

  // Document frequency across the pool plus the current post.
  const df = new Map<string, number>()
  for (const p of [...pool, current]) {
    for (const raw of p.tags) {
      const tag = raw.toLowerCase().trim()
      if (tag) df.set(tag, (df.get(tag) ?? 0) + 1)
    }
  }
  const total = pool.length + 1

  const currentTags = new Set(current.tags.map((t) => t.toLowerCase().trim()).filter(Boolean))
  const currentWords = tokens(current)

  const scored = pool
    .map((post) => {
      let tagScore = 0
      for (const raw of post.tags) {
        const tag = raw.toLowerCase().trim()
        if (!currentTags.has(tag)) continue
        // log(total/df): a tag on nearly every post scores ~0, a rare tag scores high.
        tagScore += Math.log(total / (df.get(tag) ?? 1))
      }

      let wordScore = 0
      for (const w of tokens(post)) if (currentWords.has(w)) wordScore += 1

      // Words dominate, tags nudge. A shared word is worth more than a shared
      // near-universal tag, which is the whole point.
      const score = wordScore * 10 + tagScore * 2
      return score > 0 ? { post, score } : null
    })
    .filter((x): x is { post: T; score: number } => x !== null)

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return Date.parse(b.post.date || '') - Date.parse(a.post.date || '')
  })

  return scored.slice(0, limit).map((x) => x.post)
}
