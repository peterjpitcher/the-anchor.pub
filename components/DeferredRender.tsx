'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'

type DeferredRenderProps = {
  children: ReactNode
  timeoutMs?: number
}

export function DeferredRender({ children, timeoutMs = 2000 }: DeferredRenderProps) {
  const [mounted, setMounted] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleCallbackRef = useRef<number | null>(null)

  useEffect(() => {
    const mount = () => setMounted(true)

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleCallbackRef.current = (window as any).requestIdleCallback(mount, { timeout: timeoutMs })
    } else {
      timeoutRef.current = setTimeout(mount, timeoutMs)
    }

    return () => {
      if (idleCallbackRef.current && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        ;(window as any).cancelIdleCallback(idleCallbackRef.current)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [timeoutMs])

  if (!mounted) return null
  return <>{children}</>
}
