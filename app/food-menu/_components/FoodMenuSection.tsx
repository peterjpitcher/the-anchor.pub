'use client'

import { useMemo, useState } from 'react'
import { Card, CardBody, SectionHeading } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { MenuData, MenuItem } from '@/lib/menu-parser'

type DietaryFilter = 'all' | 'vegetarian' | 'vegan' | 'glutenFree'

const FILTERS: Array<{ value: DietaryFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'glutenFree', label: 'Gluten-free' }
]

function matchesFilter(item: MenuItem, filter: DietaryFilter): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'vegetarian':
      return Boolean(item.vegetarian || item.vegan)
    case 'vegan':
      return Boolean(item.vegan || item.veganOptionAvailable)
    case 'glutenFree':
      return Boolean(item.glutenFree || item.glutenFreeAvailable)
    default:
      return true
  }
}

/** Small gold dietary flag shown after the dish name, e.g. "· Vegan". */
function dietaryFlag(item: MenuItem): string | null {
  if (item.vegan) return 'Vegan'
  if (item.vegetarian) return 'Veg'
  if (item.glutenFree) return 'GF'
  return null
}

export interface FoodMenuSectionProps {
  menuData: MenuData
}

/**
 * Live food menu, rendered to the redesign §7.2.3 layout: dietary filter chips,
 * then each menu group as a DM Serif heading + accent Card of menu rows
 * (name left, gold price right, never stacked on mobile). Data is the live
 * menu the page already loads; nothing is hardcoded here.
 */
export function FoodMenuSection({ menuData }: FoodMenuSectionProps) {
  const [filter, setFilter] = useState<DietaryFilter>('all')

  const groups = useMemo(() => {
    return menuData.categories
      .map(category => {
        const items = category.sections
          .flatMap(section => section.items)
          .filter(item => matchesFilter(item, filter))
        return { id: category.id, title: category.title, items }
      })
      .filter(group => group.items.length > 0)
  }, [menuData, filter])

  return (
    <div className="mx-auto w-full max-w-[920px]">
      {/* Dietary filter chips: 44px pills, green-on-select, gold hover border. */}
      <div className="mb-10 flex flex-wrap justify-center gap-3" role="group" aria-label="Dietary filters">
        {FILTERS.map(({ value, label }) => {
          const isActive = filter === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={isActive}
              className={cn(
                'inline-flex min-h-[44px] items-center rounded-pill border-[1.5px] px-5 font-sans text-sm font-semibold transition-colors',
                isActive
                  ? 'border-anchor-green bg-anchor-green text-white'
                  : 'border-line-strong bg-surface text-ink hover:border-anchor-gold-dark'
              )}
            >
              {label}
            </button>
          )
        })}
      </div>

      {groups.length === 0 ? (
        <p className="text-center text-ink-muted">
          No dishes match that filter right now. Ask the bar team for the latest options.
        </p>
      ) : (
        <div className="flex flex-col gap-12">
          {groups.map(group => (
            <div key={group.id} id={group.id}>
              <h3 className="mb-5 font-display text-h3 text-ink-strong">{group.title}</h3>
              <Card accent>
                <CardBody className="py-2">
                  <ul className="divide-y divide-line">
                    {group.items.map((item, index) => {
                      const flag = dietaryFlag(item)
                      return (
                        <li
                          key={`${group.id}-${item.name}-${index}`}
                          className="flex items-baseline justify-between gap-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="font-sans font-medium text-ink-strong">
                              {item.name}
                              {flag && (
                                <span className="font-sans text-sm font-semibold text-accent-text">
                                  {' '}
                                  &middot; {flag}
                                </span>
                              )}
                            </p>
                            {item.description && (
                              <p className="mt-1 text-sm text-ink-muted">{item.description}</p>
                            )}
                          </div>
                          {item.price && (
                            <span className="whitespace-nowrap font-display text-xl text-accent-text">
                              {item.price}
                            </span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
