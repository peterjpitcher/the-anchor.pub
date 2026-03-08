'use client'

import { useMemo, useEffect } from 'react'
import { MenuData } from '@/lib/menu-parser'
import { MenuRenderer } from './MenuRenderer'
import { AllergenFilterBar } from './features/AllergenFilterBar'
import { useAllergenFilter } from '@/hooks/useAllergenFilter'
import { trackFilterResults } from '@/lib/gtm-events/menu-events'

interface FilteredMenuRendererProps {
  menuData: MenuData
  accentColor?: string
}

export function FilteredMenuRenderer({ menuData, accentColor }: FilteredMenuRendererProps) {
  const {
    selectedAllergens,
    showVegetarianOnly,
    toggleAllergen,
    toggleVegetarian,
    clearAllFilters,
    isItemVisible,
    activeFilterCount
  } = useAllergenFilter()

  // Filter the menu data based on active filters
  const filteredMenuData = useMemo(() => {
    if (activeFilterCount === 0) {
      return menuData
    }

    // Deep clone and filter the menu data
    const filtered: MenuData = {
      ...menuData,
      categories: menuData.categories.map(category => ({
        ...category,
        sections: category.sections.map(section => ({
          ...section,
          items: section.items.filter(isItemVisible)
        })).filter(section => section.items.length > 0) // Remove empty sections
      })).filter(category => 
        category.sections.length > 0 // Remove empty categories
      )
    }

    return filtered
  }, [menuData, activeFilterCount, isItemVisible])

  // Track filter results when filters change
  useEffect(() => {
    if (activeFilterCount > 0) {
      // Count total and visible items
      const totalItems = menuData.categories.reduce((total, category) => 
        total + category.sections.reduce((sectionTotal, section) => 
          sectionTotal + section.items.length, 0), 0)
      
      const visibleItems = filteredMenuData.categories.reduce((total, category) => 
        total + category.sections.reduce((sectionTotal, section) => 
          sectionTotal + section.items.length, 0), 0)
      
      // Build list of active filters
      const activeFilters: string[] = []
      if (showVegetarianOnly) activeFilters.push('vegetarian')
      selectedAllergens.forEach(allergen => activeFilters.push(allergen))
      
      trackFilterResults(totalItems, visibleItems, activeFilters, 'food')
    }
  }, [activeFilterCount, filteredMenuData, menuData, selectedAllergens, showVegetarianOnly])

  return (
    <>
      <AllergenFilterBar
        selectedAllergens={selectedAllergens}
        showVegetarianOnly={showVegetarianOnly}
        onToggleAllergen={toggleAllergen}
        onToggleVegetarian={toggleVegetarian}
        onClearAll={clearAllFilters}
        activeFilterCount={activeFilterCount}
      />
      
      {/* Show message if all items are filtered out */}
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
        <MenuRenderer menuData={filteredMenuData} accentColor={accentColor} />
      )}
    </>
  )
}