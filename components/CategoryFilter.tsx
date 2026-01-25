'use client'

import { useState, useEffect, useRef, KeyboardEvent, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getEventCategories, type EventCategory } from '@/lib/api'
import { trackFilterChange } from '@/lib/gtm-events'
import { LoadingState } from '@/components/ui/LoadingState'

// Cache key for localStorage
const CATEGORIES_CACHE_KEY = 'anchor-event-categories'
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

interface CachedCategories {
  data: EventCategory[]
  timestamp: number
}

export function CategoryFilter() {
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [focusedIndex, setFocusedIndex] = useState<number>(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentCategory = searchParams?.get('category') ?? null

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  // Load categories from cache or fetch
  useEffect(() => {
    async function loadCategories() {
      try {
        // Check cache first
        const cached = localStorage.getItem(CATEGORIES_CACHE_KEY)
        if (cached) {
          const { data, timestamp }: CachedCategories = JSON.parse(cached)
          const isExpired = Date.now() - timestamp > CACHE_DURATION
          
          if (!isExpired) {
            setCategories(data)
            setLoading(false)
            return
          }
        }
        
        // Fetch fresh data
        const cats = await getEventCategories()
        setCategories(cats)
        
        // Update cache
        const cacheData: CachedCategories = {
          data: cats,
          timestamp: Date.now()
        }
        localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(cacheData))
      } catch (error) {
        // Failed to load categories
        console.error('Failed to load categories:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadCategories()
  }, [])

  const handleCategoryChange = useCallback((categorySlug: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    
    if (categorySlug) {
      params.set('category', categorySlug)
      // Track category filter
      const category = categories.find(cat => cat.slug === categorySlug)
      trackFilterChange({
        context: 'events',
        filterType: 'category',
        value: category?.slug || categorySlug,
        action: 'apply'
      })
    } else {
      params.delete('category')
      // Track clearing filter
      trackFilterChange({
        context: 'events',
        filterType: 'category',
        value: 'all',
        action: 'clear'
      })
    }
    
    router.push(`/whats-on${params.toString() ? `?${params.toString()}` : ''}`)
  }, [categories, router, searchParams])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    const activeCategories = categories.filter(cat => cat.is_active && cat.event_count > 0)
    const totalItems = activeCategories.length + 1 // +1 for "All Events"

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        setFocusedIndex((prev) => (prev + 1) % totalItems)
        break
      case 'ArrowLeft':
        e.preventDefault()
        setFocusedIndex((prev) => (prev - 1 + totalItems) % totalItems)
        break
      case 'Home':
        e.preventDefault()
        setFocusedIndex(0)
        break
      case 'End':
        e.preventDefault()
        setFocusedIndex(totalItems - 1)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (focusedIndex === 0) {
          handleCategoryChange(null)
        } else {
          const category = activeCategories[focusedIndex - 1]
          if (category) {
            handleCategoryChange(category.slug)
          }
        }
        break
    }
  }, [categories, focusedIndex, handleCategoryChange])

  // Touch handlers for swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isLeftSwipe || isRightSwipe) {
      const activeCategories = categories.filter(cat => cat.is_active && cat.event_count > 0)
      const totalItems = activeCategories.length + 1
      
      if (isLeftSwipe) {
        // Swipe left = next category
        setFocusedIndex((prev) => (prev + 1) % totalItems)
      } else if (isRightSwipe) {
        // Swipe right = previous category
        setFocusedIndex((prev) => (prev - 1 + totalItems) % totalItems)
      }
    }
  }

  // Focus the button when focusedIndex changes
  useEffect(() => {
    if (containerRef.current) {
      const buttons = containerRef.current.querySelectorAll('button')
      const button = buttons[focusedIndex]
      if (button) {
        button.focus()
      }
    }
  }, [focusedIndex])

  // Memoize active categories
  const activeCategories = useMemo(() => 
    categories.filter(cat => cat.is_active && cat.event_count > 0),
    [categories]
  )

  if (loading) {
    return (
      <>
        <div className="flex justify-center gap-2 mb-8 overflow-x-auto">
          <LoadingState variant="skeleton" className="h-10 w-96" />
        </div>
        <div className="sr-only" aria-live="polite">
          Loading event categories...
        </div>
      </>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="overflow-x-auto pb-2 mb-8"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div 
        className="flex gap-2 min-w-max px-4 md:px-0 md:justify-center"
        role="tablist"
        aria-label="Event category filter"
        onKeyDown={handleKeyDown}
      >
        <button
          role="tab"
          aria-selected={!currentCategory}
          aria-controls="events-list"
          tabIndex={focusedIndex === 0 ? 0 : -1}
          onClick={() => handleCategoryChange(null)}
          className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 whitespace-nowrap ${
            !currentCategory 
              ? 'bg-anchor-green text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-anchor-gold`}
        >
          All Events
        </button>
        
        {activeCategories.map((category, index) => (
          <button
            key={category.id}
            role="tab"
            aria-selected={currentCategory === category.slug}
            aria-controls="events-list"
            tabIndex={focusedIndex === index + 1 ? 0 : -1}
            onClick={() => handleCategoryChange(category.slug)}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 whitespace-nowrap ${
              currentCategory === category.slug
                ? 'text-white'
                : 'text-gray-700 hover:opacity-80'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-anchor-gold`}
            style={{
              backgroundColor: currentCategory === category.slug 
                ? category.color 
                : `${category.color}20`,
              color: currentCategory === category.slug 
                ? 'white' 
                : category.color
            }}
            aria-label={`Filter by ${category.name} category (${category.event_count} events)`}
          >
            {category.icon && <span className="mr-1" aria-hidden="true">{category.icon}</span>}
            {category.name}
            <span className="ml-2 text-sm opacity-80" aria-label={`${category.event_count} events`}>({category.event_count})</span>
          </button>
        ))}
      </div>
      
      {/* Mobile swipe indicator */}
      <div className="flex justify-center mt-2 md:hidden" aria-hidden="true">
        <div className="flex gap-1">
          {[...Array(activeCategories.length + 1)].map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === focusedIndex ? 'w-6 bg-anchor-gold' : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Screen reader announcement for filter changes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {currentCategory 
          ? `Filtering by ${activeCategories.find(cat => cat.slug === currentCategory)?.name || currentCategory} category`
          : 'Showing all event categories'
        }
      </div>
    </div>
  )
}
