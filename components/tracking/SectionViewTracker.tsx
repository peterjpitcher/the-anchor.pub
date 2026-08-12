'use client'

import { useEffect, useRef } from 'react'
import { pushToDataLayer } from '@/lib/gtm-events'

interface SectionViewTrackerProps {
  sectionId: string
  /** IntersectionObserver visibility ratio at which to fire (default 0.5). */
  threshold?: number
  children: React.ReactNode
  className?: string
}

/**
 * Fires `section_view` to dataLayer once the wrapped element is at least
 * `threshold` visible. Tracks once per mount, never again.
 *
 * Used to measure scroll-depth engagement on long-form sections like the
 * carvery comparison block (Wave 2C #3).
 */
export function SectionViewTracker({
  sectionId,
  threshold = 0.5,
  children,
  className,
}: SectionViewTrackerProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const firedRef = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (firedRef.current) return
        if (entry.intersectionRatio >= threshold) {
          firedRef.current = true
          pushToDataLayer({ event: 'section_view', section_id: sectionId })
          observer.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [sectionId, threshold])

  return (
    <div ref={ref} className={className} data-section-id={sectionId}>
      {children}
    </div>
  )
}

export default SectionViewTracker
