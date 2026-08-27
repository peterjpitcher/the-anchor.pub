import { getRelatedPosts, type RelatablePost } from '@/lib/blog/related-posts'

const post = (slug: string, tags: string[], date = '2026-01-01', noindex = false): RelatablePost => ({
  slug,
  title: slug,
  description: '',
  date,
  tags,
  noindex,
})

describe('getRelatedPosts', () => {
  const current = post('wake-venue-near-heathrow', ['wakes', 'private hire', 'heathrow'])

  it('ranks a shared topic word above a shared tag', () => {
    const out = getRelatedPosts(current, [
      post('christmas-party-checklist', ['wakes', 'private hire', 'heathrow']),
      post('funeral-wake-venue-guide', ['unrelated-tag']),
    ])
    // The second shares "wake" and "venue" in its wording; the first only
    // shares tags. Wording wins, which is the entire point of the scorer.
    expect(out[0].slug).toBe('funeral-wake-venue-guide')
  })

  it('never returns a post with no shared tag or word', () => {
    const out = getRelatedPosts(current, [post('karaoke-machine-hire', ['pizza'])])
    expect(out).toEqual([])
  })

  it('does not let a near-universal tag alone pull in an unrelated post', () => {
    // "guides" is on 36 of 53 real posts. On its own it must not be a match.
    const guidesEverywhere = Array.from({ length: 20 }, (_, i) =>
      post(`filler-topic-${i}`, ['guides']),
    )
    const out = getRelatedPosts(post('wake-venue-near-heathrow', ['guides']), guidesEverywhere)
    expect(out).toEqual([])
  })

  it('never returns the current post', () => {
    const out = getRelatedPosts(current, [
      current as RelatablePost,
      post('another-wake-venue-guide', ['wakes']),
    ])
    expect(out.map((p) => p.slug)).toEqual(['another-wake-venue-guide'])
  })

  it('never links to a noindex post', () => {
    const out = getRelatedPosts(current, [post('archived', ['wakes', 'heathrow'], '2026-01-01', true)])
    expect(out).toEqual([])
  })

  it('breaks an exact tie on recency, newest first', () => {
    // Identical wording overlap ("wake"), identical tags, so only date differs.
    const out = getRelatedPosts(current, [
      post('older-wake-guide', ['wakes'], '2024-01-01'),
      post('newer-wake-guide', ['wakes'], '2026-06-01'),
      post('filler', ['unrelated'], '2025-01-01'),
    ])
    expect(out.map((p) => p.slug)).toEqual(['newer-wake-guide', 'older-wake-guide'])
  })

  it('respects the limit', () => {
    const many = Array.from({ length: 10 }, (_, i) => post(`wake-venue-option-${i}`, ['wakes']))
    expect(getRelatedPosts(current, many, 4)).toHaveLength(4)
  })

  it('still relates an untagged post through its wording', () => {
    // Tags are the coarse filter, not a precondition. A post with no tags can
    // still be clearly on-topic.
    const out = getRelatedPosts(post('untagged-wake-venue-notes', []), [
      post('choosing-a-wake-venue', ['wakes']),
      post('karaoke-machine-hire', ['music']),
    ])
    expect(out.map((p) => p.slug)).toEqual(['choosing-a-wake-venue'])
  })
})
