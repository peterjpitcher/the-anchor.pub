'use client'

import { usePathname } from 'next/navigation'
import { getCanonicalUrl, shouldHaveCanonical } from '@/lib/canonical-url'

export function CanonicalLink() {
  const pathname = usePathname() ?? '/'
  
  if (!shouldHaveCanonical(pathname)) {
    return null
  }
  
  const canonicalUrl = getCanonicalUrl(pathname)
  
  return (
    <link rel="canonical" href={canonicalUrl} />
  )
}
