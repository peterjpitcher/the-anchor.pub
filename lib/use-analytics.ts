'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { analytics } from './analytics'

export function useAnalytics() {
  const pathname = usePathname() ?? '/'

  useEffect(() => {
    analytics.pageView(pathname)
  }, [pathname])

  return analytics
}
