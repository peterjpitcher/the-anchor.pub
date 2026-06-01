export interface BreadcrumbItem {
  name: string
  /**
   * Clickable link target for the visual breadcrumb. Omitted for the current
   * page and for section paths that have no standalone page.
   */
  href?: string
  /**
   * Canonical URL used for the BreadcrumbList JSON-LD `item`. Set for every
   * real page (including the current one); omitted only for section paths that
   * resolve to no page, so they are excluded from the schema rather than
   * emitted without an `item`.
   */
  url?: string
}

const ORIGIN = 'https://www.the-anchor.pub'

/**
 * Builds a BreadcrumbList `itemListElement` array in which EVERY ListItem has
 * an `item` URL.
 *
 * Previously the breadcrumb schema emitted `item: undefined` for the current
 * page and for section-only paths (e.g. `/private-hire/near`), which
 * `JSON.stringify` drops — surfacing GSC's "Breadcrumbs: Missing field 'item'
 * (in 'itemListElement')" warning. Here, entries that resolve to no canonical
 * URL are filtered out (so positions stay contiguous) and the remaining items
 * always carry an absolute `item`.
 */
export function buildBreadcrumbItemList(trail: BreadcrumbItem[]) {
  return trail
    .map((item) => ({
      name: item.name,
      url:
        item.href === '/'
          ? ORIGIN
          : item.url
            ? `${ORIGIN}${item.url}`
            : item.href
              ? `${ORIGIN}${item.href}`
              : undefined,
    }))
    .filter((entry): entry is { name: string; url: string } => Boolean(entry.url))
    .map((entry, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      name: entry.name,
      item: entry.url,
    }))
}
