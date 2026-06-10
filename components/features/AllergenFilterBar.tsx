'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { ALLERGEN_TYPES, type AllergenType } from '@/hooks/useAllergenFilter'
import { X, SlidersHorizontal } from 'lucide-react'
import { trackAllergenFilterToggle, trackClearAllFilters } from '@/lib/gtm-events/menu-events'

interface AllergenFilterBarProps {
  selectedAllergens: Set<AllergenType>
  showVegetarianOnly: boolean
  showVeganOnly: boolean
  showGlutenFreeOnly: boolean
  onToggleAllergen: (allergen: AllergenType) => void
  onToggleVegetarian: () => void
  onToggleVegan: () => void
  onToggleGlutenFree: () => void
  onClearAll: () => void
  activeFilterCount: number
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  className?: string
}

export function AllergenFilterBar({
  selectedAllergens,
  showVegetarianOnly,
  showVeganOnly,
  showGlutenFreeOnly,
  onToggleAllergen,
  onToggleVegetarian,
  onToggleVegan,
  onToggleGlutenFree,
  onClearAll,
  activeFilterCount,
  isOpen,
  onOpen,
  onClose,
  className,
}: AllergenFilterBarProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Trap focus inside panel when open
  useEffect(() => {
    if (isOpen) {
      panelRef.current?.focus()
    }
  }, [isOpen])

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open dietary filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
        className={cn(
          'fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-anchor-gold-dark',
          activeFilterCount > 0
            ? 'bg-amber-500 text-white'
            : 'bg-anchor-green-card text-anchor-cream-text ring-1 ring-anchor-gold-dark/20',
          className
        )}
      >
        <SlidersHorizontal size={16} aria-hidden="true" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Scrim */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Dietary and allergen filters"
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-80 max-w-[90vw] bg-anchor-green-card shadow-2xl transition-transform duration-300 ease-in-out flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-anchor-gold-dark/15 px-5 py-4">
          <h2 className="text-base font-semibold text-anchor-cream-text">Dietary Filters</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="rounded-full p-1.5 text-anchor-cream-text/60 hover:bg-anchor-green-raised hover:text-anchor-cream-text transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-anchor-gold-dark"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Panel body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Dietary toggles */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-anchor-gold-dark/60 mb-3">Diet</p>
            <div className="space-y-2">
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
                  'w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-anchor-gold-dark',
                  showVegetarianOnly
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-anchor-green-raised text-anchor-cream-text/70 hover:bg-anchor-green-card hover:text-anchor-cream-text'
                )}
              >
                <span>Vegetarian</span>
                <span className="ml-auto text-xs opacity-70">(V)</span>
              </button>
              <button
                type="button"
                aria-pressed={showVeganOnly}
                onClick={() => {
                  trackAllergenFilterToggle(
                    'vegan',
                    'vegan_only',
                    !showVeganOnly,
                    showVeganOnly ? activeFilterCount - 1 : activeFilterCount + 1
                  )
                  onToggleVegan()
                }}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-anchor-gold-dark',
                  showVeganOnly
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-anchor-green-raised text-anchor-cream-text/70 hover:bg-anchor-green-card hover:text-anchor-cream-text'
                )}
              >
                <span>Vegan Options</span>
                <span className="ml-auto text-xs opacity-70">(VEO)</span>
              </button>
              <button
                type="button"
                aria-pressed={showGlutenFreeOnly}
                onClick={() => {
                  trackAllergenFilterToggle(
                    'gluten_free',
                    'gluten_free_only',
                    !showGlutenFreeOnly,
                    showGlutenFreeOnly ? activeFilterCount - 1 : activeFilterCount + 1
                  )
                  onToggleGlutenFree()
                }}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-anchor-gold-dark',
                  showGlutenFreeOnly
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-anchor-green-raised text-anchor-cream-text/70 hover:bg-anchor-green-card hover:text-anchor-cream-text'
                )}
              >
                <span>Gluten-Free Options</span>
                <span className="ml-auto text-xs opacity-70">(GFO)</span>
              </button>
            </div>
          </div>

          {/* Allergen hide buttons */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-anchor-gold-dark/60 mb-3">Hide items containing</p>
            <div className="space-y-2">
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
                      'w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-anchor-gold-dark',
                      selectedAllergens.has(key)
                        ? 'bg-amber-500 text-white shadow'
                        : 'bg-anchor-green-raised text-anchor-cream-text/70 hover:bg-anchor-green-card hover:text-anchor-cream-text'
                    )}
                  >
                    <span>No {config.label}</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Allergen disclaimer */}
          <p className="text-xs text-anchor-cream-text/40 leading-relaxed">
            All dishes are prepared in a kitchen where allergens are present. Please speak to staff about your dietary requirements.
          </p>
        </div>

        {/* Panel footer, clear all */}
        {activeFilterCount > 0 && (
          <div className="border-t border-anchor-gold-dark/15 px-5 py-4">
            <button
              type="button"
              onClick={() => {
                trackClearAllFilters(activeFilterCount)
                onClearAll()
              }}
              className="w-full rounded-lg bg-anchor-green-raised px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-anchor-gold-dark"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </>
  )
}
