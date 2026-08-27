/**
 * Remove a trailing brand suffix from a title that came from the management
 * database.
 *
 * Staff write titles like "Cash Bingo Night at The Anchor" into the CMS, and
 * `app/layout.tsx` then appends its own `%s | The Anchor` template, producing
 * "Cash Bingo Night at The Anchor | The Anchor". The template owns the brand;
 * a page-level title must never repeat it.
 *
 * Deliberately conservative. It strips only a brand that sits at the END of
 * the title, because that is the part the template duplicates. A brand
 * mentioned mid-title ("Bingo Night at The Anchor Stanwell Moor | Cash Prizes
 * Monthly") is left alone: rewriting the middle of a human-written title risks
 * mangling it, and the editorial fix belongs in the CMS, not in a regex.
 *
 * Never apply this to openGraph or twitter titles. No template runs on those,
 * so they should carry the brand.
 */
const BRAND = String.raw`The\s+Anchor(?:\s+(?:Pub|Stanwell\s+Moor|Village\s+Pub))*`

/** "... | The Anchor", "... at The Anchor Stanwell Moor", "..., The Anchor". */
const TRAILING_BRAND = new RegExp(
  String.raw`\s*(?:\||,|-|–)?\s*(?:at\s+|from\s+)?${BRAND}\s*$`,
  'i',
)

/**
 * "Quiz Night at The Anchor | 7 October" -> "Quiz Night | 7 October".
 *
 * Only the "at The Anchor" form, which is a prepositional phrase that can be
 * lifted out cleanly. Constructions where the brand is the grammatical subject
 * ("The Anchor Welcomes Dogs", "Join The Anchor Cash Bingo Night") are left
 * alone: removing the noun there produces broken English, and those need a
 * human to rewrite the sentence.
 */
const INFIX_AT_BRAND = new RegExp(String.raw`\s+at\s+${BRAND}(?=\s*(?:\||,|-|–|$))`, 'i')

export function stripBrandSuffix(title: string | null | undefined): string {
  if (!title) return ''
  const stripped = title
    .replace(TRAILING_BRAND, '')
    .replace(INFIX_AT_BRAND, '')
    .replace(/\s*[|,\-–]\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
  // Never return an empty title: a title that is only the brand keeps the brand.
  return stripped || title.trim()
}
