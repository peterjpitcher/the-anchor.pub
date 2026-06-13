/**
 * WP5 — "Plan your visit" inline conversion panel allow-list.
 *
 * Controls which blog posts receive the in-body {@link VisitPlannerPanel}.
 * The panel is ADDITIVE: it is inserted after the article body, it never
 * rewrites the ranking editorial copy. To extend it to another post, either:
 *   1. add the slug to {@link VISIT_PLANNER_PANEL_SLUGS}, or
 *   2. set `visitPlanner: true` in that post's markdown frontmatter.
 *
 * Keeping this as an explicit allow-list (rather than reusing the broad
 * Heathrow tag gate) means the panel only appears on the high-intent
 * plane-spotting / Heathrow-travel posts and does not blanket every
 * Heathrow-tagged article.
 */

/**
 * Explicit slugs that get the inline visit-planner panel.
 * These are the high-traffic plane-spotting and Heathrow-travel posts.
 */
export const VISIT_PLANNER_PANEL_SLUGS: ReadonlySet<string> = new Set([
  // Flagship #1 traffic asset
  'heathrow-plane-spotting-locations',
  // Plane-spotting guide
  'plane-spotting-heathrow-guide',
  // Layover / things-to-do travel intent
  'heathrow-layover-guide',
  'things-to-do-near-heathrow',
  'things-to-do-near-heathrow-between-flights',
])

/**
 * Decide whether a blog post should render the inline visit-planner panel.
 *
 * A post qualifies if its slug is in the allow-list, or if it opts in via a
 * truthy `visitPlanner` frontmatter flag (forward-compatible: the flag is read
 * leniently so it works whether or not the BlogPost type yet declares it).
 *
 * @param slug - The post slug.
 * @param frontmatterFlag - Optional `visitPlanner` frontmatter value.
 */
export function shouldShowVisitPlannerPanel(
  slug: string,
  frontmatterFlag?: unknown
): boolean {
  if (frontmatterFlag === true || frontmatterFlag === 'true') return true
  return VISIT_PLANNER_PANEL_SLUGS.has(slug.toLowerCase().trim())
}
