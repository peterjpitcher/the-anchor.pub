'use client'

import { useMemo, useState } from 'react'
import { Card, CardBody } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { MenuData, MenuItem } from '@/lib/menu-parser'
import {
  formatMenuAllergenLabel,
  formatMenuAllergenList,
  getMenuAllergenFilters,
  getMenuItemAllergens
} from '@/lib/menu-allergens'

type DietaryFilter = 'all' | 'vegetarian' | 'vegan'
type AllergenFilter = string

const FILTERS: Array<{ value: DietaryFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' }
]

function matchesFilter(item: MenuItem, filter: DietaryFilter, selectedAllergens: Set<AllergenFilter>): boolean {
  switch (filter) {
    case 'all':
      break
    case 'vegetarian':
      if (!item.vegetarian && !item.vegan) return false
      break
    case 'vegan':
      if (!item.vegan && !item.veganOptionAvailable) return false
      break
    default:
      break
  }

  if (selectedAllergens.size === 0) return true

  return !getMenuItemAllergens(item).some(allergen => selectedAllergens.has(allergen))
}

function dietaryFlags(item: MenuItem): string[] {
  const flags: string[] = []

  if (item.vegan) {
    flags.push('Vegan')
  } else if (item.veganOptionAvailable) {
    flags.push('Vegan option')
  } else if (item.vegetarian) {
    flags.push('Veg')
  }

  return flags
}

function toggleSetValue<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) {
    next.delete(value)
  } else {
    next.add(value)
  }
  return next
}

export interface FoodMenuSectionProps {
  menuData: MenuData
  /**
   * Show the dietary filter chips. Defaults to true (the full food menu).
   * Single-purpose menus (drinks, pizza, a pre-filtered dietary list) pass
   * `false` to render the accent-card rows without the filter row.
   */
  showFilters?: boolean
  showAllergens?: boolean
}

/**
 * Live food/drink menu, rendered to the redesign §7.2.3 layout: optional dietary
 * filter chips, then each menu group as a DM Serif heading + accent Card of menu
 * rows. Data is the live menu the page already loads; nothing is hardcoded here.
 */
export function FoodMenuSection({ menuData, showFilters = true, showAllergens = true }: FoodMenuSectionProps) {
  const [filter, setFilter] = useState<DietaryFilter>('all')
  const [selectedAllergens, setSelectedAllergens] = useState<Set<AllergenFilter>>(new Set())

  const allergenFilters = useMemo(() => getMenuAllergenFilters(menuData), [menuData])
  const activeFilterCount = (filter === 'all' ? 0 : 1) + selectedAllergens.size

  const groups = useMemo(() => {
    return menuData.categories
      .map(category => {
        const items = category.sections
          .flatMap(section => section.items)
          .filter(item => matchesFilter(item, filter, selectedAllergens))
        return { id: category.id, title: category.title, items }
      })
      .filter(group => group.items.length > 0)
  }, [menuData, filter, selectedAllergens])

  return (
    <div className="mx-auto w-full">
      {showFilters && (
        <div className="mb-10 space-y-5">
          <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="Dietary filters">
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

          {allergenFilters.length > 0 && (
            <div>
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-accent-text">
                Hide items containing
              </p>
              <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="Allergen filters">
                {allergenFilters.map(allergen => {
                  const isActive = selectedAllergens.has(allergen)
                  return (
                    <button
                      key={allergen}
                      type="button"
                      onClick={() => setSelectedAllergens(current => toggleSetValue(current, allergen))}
                      aria-pressed={isActive}
                      className={cn(
                        'inline-flex min-h-[40px] items-center rounded-pill border-[1.5px] px-4 font-sans text-sm font-semibold transition-colors',
                        isActive
                          ? 'border-anchor-gold-dark bg-anchor-gold-dark text-white'
                          : 'border-line-strong bg-surface text-ink hover:border-anchor-gold-dark'
                      )}
                    >
                      {formatMenuAllergenLabel(allergen)}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {activeFilterCount > 0 && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setFilter('all')
                  setSelectedAllergens(new Set())
                }}
                className="inline-flex min-h-[40px] items-center rounded-pill border-[1.5px] border-line-strong bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-anchor-gold-dark"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {groups.length === 0 ? (
        <p className="text-center text-ink-muted">
          No dishes match that filter right now. Ask the bar team for the latest options.
        </p>
      ) : (
        <div className="flex flex-col gap-12">
          {groups.map(group => (
            <div key={group.id} id={group.id} className="scroll-mt-32">
              <h3 className="mb-5 font-display text-h3 text-ink-strong">{group.title}</h3>
              <Card accent>
                <CardBody className="py-2">
                  <ul className="divide-y divide-line">
                    {group.items.map((item, index) => {
                      const flags = dietaryFlags(item)
                      const allergens = getMenuItemAllergens(item)
                      return (
                        <li key={`${group.id}-${item.name}-${index}`} className="py-3">
                          <div className="min-w-0">
                            <p className="font-sans font-medium text-ink-strong">
                              {item.name}
                              {item.isNew && (
                                <span className="ml-2 inline-flex items-center rounded-pill bg-anchor-gold-dark px-2 py-0.5 align-middle font-sans text-xs font-bold uppercase tracking-wide text-white">
                                  New
                                </span>
                              )}
                              {item.price && (
                                <span className="ml-2 whitespace-nowrap font-display text-xl text-accent-text">
                                  {item.price}
                                </span>
                              )}
                              {flags.length > 0 && (
                                <span className="font-sans text-sm font-semibold text-accent-text">
                                  {' '}&middot; {flags.join(', ')}
                                </span>
                              )}
                            </p>
                            {item.description && (
                              <p className="mt-1 text-sm text-ink-muted">{item.description}</p>
                            )}
                            {showAllergens && (
                              <p className="mt-2 text-xs text-ink-muted">
                                Allergens listed: {allergens.length > 0 ? formatMenuAllergenList(allergens) : 'None listed'}
                              </p>
                            )}
                          </div>
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
