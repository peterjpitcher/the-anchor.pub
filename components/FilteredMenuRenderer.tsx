'use client'

import { useMemo, useEffect, useState, useCallback } from 'react'
import { MenuData } from '@/lib/menu-parser'
import { MenuRenderer } from './MenuRenderer'
import { AllergenFilterBar } from './features/AllergenFilterBar'
import { useAllergenFilter } from '@/hooks/useAllergenFilter'
import { trackFilterResults } from '@/lib/gtm-events/menu-events'

interface FilteredMenuRendererProps {
  menuData: MenuData
}

export function FilteredMenuRenderer({ menuData }: FilteredMenuRendererProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const {
    selectedAllergens,
    showVegetarianOnly,
    showVeganOnly,
    showGlutenFreeOnly,
    toggleAllergen,
    toggleVegetarian,
    toggleVegan,
    toggleGlutenFree,
    clearAllFilters,
    isItemVisible,
    activeFilterCount
  } = useAllergenFilter()

  const handleOpen = useCallback(() => setIsFilterOpen(true), [])
  const handleClose = useCallback(() => setIsFilterOpen(false), [])

  const filteredMenuData = useMemo(() => {
    if (activeFilterCount === 0) return menuData
    return {
      ...menuData,
      categories: menuData.categories.map(category => ({
        ...category,
        sections: category.sections.map(section => ({
          ...section,
          items: section.items.filter(isItemVisible)
        })).filter(section => section.items.length > 0)
      })).filter(category => category.sections.length > 0)
    }
  }, [menuData, activeFilterCount, isItemVisible])

  useEffect(() => {
    if (activeFilterCount > 0) {
      const totalItems = menuData.categories.reduce((total, category) =>
        total + category.sections.reduce((s, section) => s + section.items.length, 0), 0)
      const visibleItems = filteredMenuData.categories.reduce((total, category) =>
        total + category.sections.reduce((s, section) => s + section.items.length, 0), 0)
      const activeFilters: string[] = []
      if (showVegetarianOnly) activeFilters.push('vegetarian')
      if (showVeganOnly) activeFilters.push('vegan')
      if (showGlutenFreeOnly) activeFilters.push('gluten-free')
      selectedAllergens.forEach(allergen => activeFilters.push(allergen))
      trackFilterResults(totalItems, visibleItems, activeFilters, 'food')
    }
  }, [activeFilterCount, filteredMenuData, menuData, selectedAllergens, showVegetarianOnly, showVeganOnly, showGlutenFreeOnly])

  return (
    <>
      <AllergenFilterBar
        selectedAllergens={selectedAllergens}
        showVegetarianOnly={showVegetarianOnly}
        showVeganOnly={showVeganOnly}
        showGlutenFreeOnly={showGlutenFreeOnly}
        onToggleAllergen={toggleAllergen}
        onToggleVegetarian={toggleVegetarian}
        onToggleVegan={toggleVegan}
        onToggleGlutenFree={toggleGlutenFree}
        onClearAll={clearAllFilters}
        activeFilterCount={activeFilterCount}
        isOpen={isFilterOpen}
        onOpen={handleOpen}
        onClose={handleClose}
      />

      {/* Info notes when VEO or GFO filters are active */}
      {(showVeganOnly || showGlutenFreeOnly) && filteredMenuData.categories.length > 0 && (
        <div className="container mx-auto px-4 pt-6 space-y-2">
          {showVeganOnly && (
            <p className="text-sm text-emerald-400/80 bg-emerald-400/10 rounded-lg px-4 py-2.5">
              Items marked <span className="font-bold">VEO</span> can be made vegan on request — ask at the bar to remove mozzarella.
            </p>
          )}
          {showGlutenFreeOnly && (
            <p className="text-sm text-anchor-green/80 bg-anchor-green/10 rounded-lg px-4 py-2.5">
              Items marked <span className="font-bold">GFO</span> can be made gluten-free on request — ask at the bar for a gluten-free pizza base.
            </p>
          )}
        </div>
      )}

      {filteredMenuData.categories.length === 0 ? (
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <p className="text-xl text-anchor-cream-text/55 mb-4">
              No menu items match your current filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="text-anchor-gold hover:text-anchor-gold-light font-semibold underline"
            >
              Clear all filters
            </button>
          </div>
        </div>
      ) : (
        <MenuRenderer menuData={filteredMenuData} eyebrow="Food menu" />
      )}
    </>
  )
}
