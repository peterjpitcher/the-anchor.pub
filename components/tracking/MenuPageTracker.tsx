'use client'

import { useEffect, useRef } from 'react'
import { pushToDataLayer } from '@/lib/gtm-events'
import { analytics } from '@/lib/analytics'
import { usePathname } from 'next/navigation'

interface MenuPageTrackerProps {
  menuType: 'food' | 'drinks' | 'sunday_lunch' | 'pizza' | 'managers_special'
  specialOffers?: string[]
}

export function MenuPageTracker({ menuType, specialOffers = [] }: MenuPageTrackerProps) {
  const pathname = usePathname()
  const mountTimeRef = useRef<number>(Date.now())
  const hasTrackedRef = useRef(false)
  const isFoodMenu = menuType === 'food' || menuType === 'sunday_lunch' || menuType === 'pizza'

  useEffect(() => {
    // Prevent double tracking
    if (hasTrackedRef.current) return
    hasTrackedRef.current = true

    // Track initial menu view with enhanced metadata
    pushToDataLayer({
      event: 'menu_page_view',
      event_category: 'Menu Engagement',
      event_label: menuType,
      menu_type: menuType,
      page_url: pathname,
      timestamp: new Date().toISOString(),
      special_offers_visible: specialOffers,
      special_offers_count: specialOffers.length,
      has_special_offers: specialOffers.length > 0
    })

    if (isFoodMenu) {
      pushToDataLayer({
        event: 'food_menu_view',
        menu_type: menuType,
        page_url: pathname,
        timestamp: new Date().toISOString(),
        special_offers_visible: specialOffers,
        special_offers_count: specialOffers.length
      })
    }
    
    // Also track in analytics
    analytics.viewItem('menu_item', `${menuType} menu`)

    // Track time spent on page when user leaves
    const mountTime = mountTimeRef.current
    return () => {
      const timeSpent = Math.round((Date.now() - mountTime) / 1000) // in seconds
      
      pushToDataLayer({
        event: 'menu_page_exit',
        event_category: 'Menu Engagement',
        event_label: menuType,
        menu_type: menuType,
        time_spent_seconds: timeSpent,
        time_spent_formatted: timeSpent > 60 
          ? `${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s`
          : `${timeSpent}s`,
        page_url: pathname,
        special_offers_viewed: specialOffers
      })

      if (isFoodMenu) {
        pushToDataLayer({
          event: 'food_menu_exit',
          menu_type: menuType,
          page_url: pathname,
          time_spent_seconds: timeSpent,
          special_offers_viewed: specialOffers
        })
      }
    }
  }, [isFoodMenu, menuType, pathname, specialOffers])
  
  return null
}
