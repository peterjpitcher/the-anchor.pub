'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView } from '@/lib/gtm-events'

export function useAnalytics() {
  const pathname = usePathname() ?? '/'

  useEffect(() => {
    const title = typeof document !== 'undefined' ? document.title : pathname
    trackPageView(pathname, title || pathname)
  }, [pathname])
}
