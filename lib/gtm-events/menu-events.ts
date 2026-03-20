// Menu-related GTM events

import { pushToDataLayer } from '../gtm-events'

interface AllergenFilterEvent {
  event: 'allergen_filter_toggled'
  event_category: 'Menu'
  event_label: string
  filter_type: 'allergen' | 'vegetarian' | 'vegan' | 'gluten_free'
  filter_name: string
  filter_action: 'enabled' | 'disabled'
  active_filter_count: number
  menu_type: 'food' | 'drinks'
}

interface ClearFiltersEvent {
  event: 'allergen_filters_cleared'
  event_category: 'Menu'
  event_label: string
  filters_cleared_count: number
  menu_type: 'food' | 'drinks'
}

interface FilterResultEvent {
  event: 'menu_items_filtered'
  event_category: 'Menu'
  event_label: string
  total_items: number
  visible_items: number
  hidden_items: number
  active_filters: string[]
  menu_type: 'food' | 'drinks'
}

export function trackAllergenFilterToggle(
  filterType: 'allergen' | 'vegetarian' | 'vegan' | 'gluten_free',
  filterName: string,
  enabled: boolean,
  activeFilterCount: number,
  menuType: 'food' | 'drinks' = 'food'
): void {
  pushToDataLayer({
    event: 'allergen_filter_toggled',
    event_category: 'Menu',
    event_label: `${filterType}:${filterName}`,
    filter_type: filterType,
    filter_name: filterName,
    filter_action: enabled ? 'enabled' : 'disabled',
    active_filter_count: activeFilterCount,
    menu_type: menuType
  } as AllergenFilterEvent)
}

export function trackClearAllFilters(
  filtersCleared: number,
  menuType: 'food' | 'drinks' = 'food'
): void {
  pushToDataLayer({
    event: 'allergen_filters_cleared',
    event_category: 'Menu',
    event_label: menuType,
    filters_cleared_count: filtersCleared,
    menu_type: menuType
  } as ClearFiltersEvent)
}

export function trackFilterResults(
  totalItems: number,
  visibleItems: number,
  activeFilters: string[],
  menuType: 'food' | 'drinks' = 'food'
): void {
  pushToDataLayer({
    event: 'menu_items_filtered',
    event_category: 'Menu',
    event_label: menuType,
    total_items: totalItems,
    visible_items: visibleItems,
    hidden_items: totalItems - visibleItems,
    active_filters: activeFilters,
    menu_type: menuType
  } as FilterResultEvent)
}
