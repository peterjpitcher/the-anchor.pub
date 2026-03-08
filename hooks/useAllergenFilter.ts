'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { MenuItem } from '@/lib/menu-parser'

// Define allergen types
export const ALLERGEN_TYPES = {
  celery: { label: 'Celery', icon: '' },
  gluten: { label: 'Gluten', icon: '' },
  crustaceans: { label: 'Crustaceans', icon: '' },
  eggs: { label: 'Eggs', icon: '' },
  fish: { label: 'Fish', icon: '' },
  lupin: { label: 'Lupin', icon: '' },
  milk: { label: 'Milk', icon: '' },
  molluscs: { label: 'Molluscs', icon: '' },
  mustard: { label: 'Mustard', icon: '' },
  nuts: { label: 'Nuts', icon: '' },
  peanuts: { label: 'Peanuts', icon: '' },
  sesame: { label: 'Sesame', icon: '' },
  soya: { label: 'Soya', icon: '' },
  sulphites: { label: 'Sulphites', icon: '' }
} as const

export type AllergenType = keyof typeof ALLERGEN_TYPES

interface UseAllergenFilterReturn {
  selectedAllergens: Set<AllergenType>
  showVegetarianOnly: boolean
  toggleAllergen: (allergen: AllergenType) => void
  toggleVegetarian: () => void
  clearAllFilters: () => void
  isItemVisible: (item: MenuItem) => boolean
  activeFilterCount: number
}

const STORAGE_KEY = 'anchor-allergen-filters'
const VEGETARIAN_STORAGE_KEY = 'anchor-vegetarian-filter'
const QUERY_HIDE = 'hide'
const QUERY_VEG = 'veg'

export function useAllergenFilter(): UseAllergenFilterReturn {
  const [selectedAllergens, setSelectedAllergens] = useState<Set<AllergenType>>(new Set())
  const [showVegetarianOnly, setShowVegetarianOnly] = useState(false)
  const queryHydratedRef = useRef(false)

  // Load filters from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return

      const params = new URLSearchParams(window.location.search)
      const hideParam = params.get(QUERY_HIDE)
      const vegParam = params.get(QUERY_VEG)

      let initialisedFromQuery = false

      if (hideParam) {
        const parsedAllergens = hideParam
          .split(',')
          .map(item => item.trim())
          .filter((item): item is AllergenType => item in ALLERGEN_TYPES)
        setSelectedAllergens(new Set(parsedAllergens))
        initialisedFromQuery = true
      }

      if (vegParam !== null) {
        setShowVegetarianOnly(vegParam === '1')
        initialisedFromQuery = true
      }

      if (!initialisedFromQuery) {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          setSelectedAllergens(new Set(JSON.parse(stored) as AllergenType[]))
        }

        const storedVeg = localStorage.getItem(VEGETARIAN_STORAGE_KEY)
        if (storedVeg) {
          setShowVegetarianOnly(storedVeg === 'true')
        }
      }

      queryHydratedRef.current = true
    } catch (error) {
      console.error('Error loading allergen filters:', error)
    }
  }, [])

  // Save to localStorage whenever filters change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(selectedAllergens)))
      localStorage.setItem(VEGETARIAN_STORAGE_KEY, showVegetarianOnly.toString())
    } catch (error) {
      console.error('Error saving allergen filters:', error)
    }
  }, [selectedAllergens, showVegetarianOnly])

  // Persist to URL query string
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!queryHydratedRef.current) return

    const params = new URLSearchParams(window.location.search)

    if (selectedAllergens.size > 0) {
      params.set(QUERY_HIDE, Array.from(selectedAllergens).join(','))
    } else {
      params.delete(QUERY_HIDE)
    }

    if (showVegetarianOnly) {
      params.set(QUERY_VEG, '1')
    } else {
      params.delete(QUERY_VEG)
    }

    const queryString = params.toString()
    const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}${window.location.hash}`
    window.history.replaceState(null, '', newUrl)
  }, [selectedAllergens, showVegetarianOnly])

  const toggleAllergen = useCallback((allergen: AllergenType) => {
    setSelectedAllergens(prev => {
      const newSet = new Set(prev)
      if (newSet.has(allergen)) {
        newSet.delete(allergen)
      } else {
        newSet.add(allergen)
      }
      return newSet
    })
  }, [])

  const toggleVegetarian = useCallback(() => {
    setShowVegetarianOnly(prev => !prev)
  }, [])

  const clearAllFilters = useCallback(() => {
    setSelectedAllergens(new Set())
    setShowVegetarianOnly(false)
  }, [])

  const isItemVisible = useCallback((item: MenuItem) => {
    // Check vegetarian filter first
    if (showVegetarianOnly && !item.vegetarian) {
      return false
    }

    // If no allergen filters are selected, show all items
    if (selectedAllergens.size === 0) {
      return true
    }

    // Check if item contains any selected allergens
    if (item.allergens && item.allergens.length > 0) {
      for (const allergen of item.allergens) {
        if (selectedAllergens.has(allergen as AllergenType)) {
          // Special case: If filtering out gluten but item has gluten-free option, show it
          if (allergen === 'gluten' && (item as any).glutenFreeAvailable) {
            continue // Skip hiding this item for gluten
          }
          return false // Hide items containing selected allergens
        }
      }
    }

    return true
  }, [selectedAllergens, showVegetarianOnly])

  const activeFilterCount = selectedAllergens.size + (showVegetarianOnly ? 1 : 0)

  return {
    selectedAllergens,
    showVegetarianOnly,
    toggleAllergen,
    toggleVegetarian,
    clearAllFilters,
    isItemVisible,
    activeFilterCount
  }
}
