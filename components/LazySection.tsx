'use client'

import { useInView } from 'react-intersection-observer'
import { ReactNode } from 'react'

interface LazySectionProps {
  children: ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
  fallback?: ReactNode
}

export function LazySection({ 
  children, 
  className = '',
  threshold = 0.1,
  rootMargin = '50px',
  fallback = <div className="h-64 bg-anchor-bg-card border border-anchor-gold/15 animate-pulse" />
}: LazySectionProps) {
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: true
  })

  return (
    <div ref={ref} className={className}>
      {inView ? children : fallback}
    </div>
  )
}
