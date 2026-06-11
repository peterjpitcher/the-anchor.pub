import { Badge, Card, CardBody } from '@/components/ui'
import type { MenuPageItem } from '@/lib/menu-page-data'

export interface DietaryItemListProps {
  items: MenuPageItem[]
  /** Short flag shown after the dish name, e.g. "GF", "VE", "VEO". */
  badge: string
  /** Optional note shown when an item is only available on request. */
  optionFlag?: (item: MenuPageItem) => boolean
  optionNote?: string
}

/**
 * Light accent-card list of dietary menu items (redesign §8 food row): one
 * accent Card containing rows of name + gold price, with a sand dietary Badge
 * and the live category label. Used by the gluten-free and vegan pages, which
 * present a single pre-filtered list rather than the grouped full menu.
 */
export function DietaryItemList({ items, badge, optionFlag, optionNote }: DietaryItemListProps) {
  return (
    <Card accent className="mx-auto max-w-3xl">
      <CardBody className="py-2">
        <ul className="divide-y divide-line">
          {items.map(item => (
            <li key={item.id} className="flex items-baseline justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-sans font-medium text-ink-strong">
                  {item.name}
                  <Badge variant="sand">{badge}</Badge>
                </p>
                {item.description && (
                  <p className="mt-1 text-sm text-ink-muted">{item.description}</p>
                )}
                {optionFlag?.(item) && optionNote && (
                  <p className="mt-1 text-sm italic text-accent-text">{optionNote}</p>
                )}
                <p className="mt-1 text-xs text-ink-muted">{item.categoryTitle}</p>
              </div>
              {item.priceLabel && (
                <span className="whitespace-nowrap font-display text-xl text-accent-text">
                  {item.priceLabel}
                </span>
              )}
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}
