'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ALLERGEN_TYPES, type AllergenType } from '@/hooks/useAllergenFilter'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { trackAllergenFilterToggle, trackClearAllFilters } from '@/lib/gtm-events/menu-events'

interface AllergenFilterBarProps {
  selectedAllergens: Set<AllergenType>
  showVegetarianOnly: boolean
  onToggleAllergen: (allergen: AllergenType) => void
  onToggleVegetarian: () => void
  onClearAll: () => void
  activeFilterCount: number
  className?: string
}

export function AllergenFilterBar({
  selectedAllergens,
  showVegetarianOnly,
  onToggleAllergen,
  onToggleVegetarian,
  onClearAll,
  activeFilterCount,
  className
}: AllergenFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className={cn(
        'sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-gray-200 shadow-sm',
        className
      )}
      role="region"
      aria-label="Dietary and allergen filters"
    >
      <div className="container mx-auto px-4">
        {/* Mobile: Collapsed view */}
        <div className="md:hidden">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-4 flex items-center justify-between text-left"
            aria-expanded={isExpanded}
            aria-label="Toggle allergen filters"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold">Dietary Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {/* Desktop: Always visible */}
        <div
          className={cn('md:block', isExpanded ? 'block' : 'hidden', 'pb-4 md:pb-0')}
        >
          {/* Active filters summary */}
          {activeFilterCount > 0 && (
            <div className="py-2 md:py-3 border-b border-gray-100">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-700">Active filters:</span>
                  {showVegetarianOnly && (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                      🌱 Vegetarian only
                    </span>
                  )}
                  {Array.from(selectedAllergens).map(allergen => (
                    <span
                      key={allergen}
                      className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm"
                    >
                      {ALLERGEN_TYPES[allergen].icon} No {ALLERGEN_TYPES[allergen].label}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => {
                    trackClearAllFilters(activeFilterCount)
                    onClearAll()
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  aria-label="Clear all filters"
                >
                  <X size={16} aria-hidden="true" />
                  Clear all
                </button>
              </div>
            </div>
          )}

          {/* Filter controls */}
          <div className="py-4 md:py-3">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              {/* Vegetarian toggle */}
              <div className="flex items-center">
                <button
                  type="button"
                  aria-pressed={showVegetarianOnly}
                  onClick={() => {
                    trackAllergenFilterToggle(
                      'vegetarian',
                      'vegetarian_only',
                      !showVegetarianOnly,
                      showVegetarianOnly ? activeFilterCount - 1 : activeFilterCount + 1
                    )
                    onToggleVegetarian()
                  }}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-anchor-gold',
                    showVegetarianOnly
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  <span aria-hidden="true">🌱</span>
                  <span>Vegetarian only</span>
                </button>
              </div>

              {/* Separator */}
              <div className="hidden md:block h-6 w-px bg-gray-300" />

              {/* Allergen filters */}
              <div className="flex-1">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                  <span className="text-sm font-medium text-gray-700">
                    Hide items with:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(ALLERGEN_TYPES) as Array<[AllergenType, typeof ALLERGEN_TYPES[AllergenType]]>).map(
                      ([key, config]) => (
                        <button
                          key={key}
                          type="button"
                          aria-pressed={selectedAllergens.has(key)}
                          onClick={() => {
                            const willBeSelected = !selectedAllergens.has(key)
                            trackAllergenFilterToggle(
                              'allergen',
                              `hide_${key}`,
                              willBeSelected,
                              willBeSelected ? activeFilterCount + 1 : activeFilterCount - 1
                            )
                            onToggleAllergen(key)
                          }}
                          className={cn(
                            'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-anchor-gold',
                            selectedAllergens.has(key)
                              ? 'bg-amber-500 text-white shadow'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          )}
                        >
                          <span aria-hidden="true">{config.icon}</span>
                          <span className="text-xs md:text-sm">No {config.label}</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Info text */}
            <div className="mt-3 text-xs text-gray-600">
              <p>
                ⚠️ All dishes are prepared in a kitchen where allergens are present. 
                Please speak to staff about your dietary requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
