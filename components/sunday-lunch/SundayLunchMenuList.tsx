import type { ReactNode } from 'react'

export interface SundayLunchMenuItem {
  name: string
  description: string
  /**
   * Display price label (e.g. `(22)`). Required so menu rows always show
   * what the dish costs, pricing is a customer expectation on the
   * Sunday roast page.
   */
  priceLabel: string
  /**
   * Optional badge text shown next to the dish name (e.g. `Vegan`, `Kids menu`).
   * Purely decorative, keep short.
   */
  badge?: string
}

export interface SundayLunchMenuListProps {
  items: ReadonlyArray<SundayLunchMenuItem>
}

/**
 * Static, accessible list of Sunday roast menu items.
 *
 * - Each row shows name, optional badge (e.g. Vegan / Kids menu),
 *   description and price.
 * - No click handlers, no lightbox, no per-dish photos.
 * - Server-renderable: no client state, safe to drop into a Server Component.
 *
 * The 15-second booking prompt that promotes a reservation lives in
 * {@link TimedBookingPrompt}, not on the menu rows themselves.
 */
export function SundayLunchMenuList({ items }: SundayLunchMenuListProps): ReactNode {
  return (
    <ul
      className="mt-8 mx-auto max-w-3xl divide-y divide-anchor-gold/15 rounded-lg border border-anchor-gold/15 bg-anchor-bg-raised/40 px-4"
      aria-label="Sunday roast menu"
    >
      {items.map((item) => (
        <li key={item.name} className="py-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 min-w-0">
              <h3 className="font-semibold text-anchor-cream-text">{item.name}</h3>
              {item.badge ? (
                <span className="text-[11px] font-semibold uppercase tracking-wider rounded-full border border-anchor-gold/30 px-2 py-0.5 text-anchor-gold-vivid">
                  {item.badge}
                </span>
              ) : null}
            </div>
            <span className="font-semibold text-anchor-gold-vivid whitespace-nowrap">
              {item.priceLabel}
            </span>
          </div>
          <p className="text-sm text-anchor-cream-text/70 mt-1.5 leading-relaxed">
            {item.description}
          </p>
        </li>
      ))}
    </ul>
  )
}

export default SundayLunchMenuList
