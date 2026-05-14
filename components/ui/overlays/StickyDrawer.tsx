'use client'

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { trackModalClose, trackModalEngage, trackModalOpen, type ModalCloseReason } from '@/lib/gtm-events'
import type { BaseComponentProps } from '../types'

const drawerVariants = cva(
  'fixed z-50 bg-anchor-bg-card border-anchor-gold/15 shadow-2xl flex flex-col overflow-hidden',
  {
    variants: {
      side: {
        right: 'top-0 right-0 h-full w-full sm:max-w-md border-l translate-x-full data-[state=open]:translate-x-0',
        bottom: 'bottom-0 left-0 right-0 max-h-[85vh] border-t rounded-t-2xl translate-y-full data-[state=open]:translate-y-0'
      }
    },
    defaultVariants: {
      side: 'right'
    }
  }
)

export interface StickyDrawerProps
  extends BaseComponentProps,
    VariantProps<typeof drawerVariants> {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  description?: string
  closeOnEscape?: boolean
  closeOnBackdropClick?: boolean
  preventScroll?: boolean
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export const StickyDrawer = forwardRef<HTMLDivElement, StickyDrawerProps>(
  ({
    className,
    side,
    open,
    onClose,
    children,
    title,
    description,
    closeOnEscape = true,
    closeOnBackdropClick = true,
    preventScroll = true,
    id,
    testId,
    ...props
  }, ref) => {
    const [mounted, setMounted] = useState(false)
    const drawerRef = useRef<HTMLDivElement>(null)
    const previousActiveElement = useRef<HTMLElement | null>(null)
    const previousOpen = useRef(false)
    const engaged = useRef(false)
    const lastCloseReason = useRef<ModalCloseReason | null>(null)

    const drawerId = id || (title ? `drawer_${slugify(title)}` : 'drawer')
    const titleId = `${drawerId}-title`
    const descriptionId = `${drawerId}-description`

    const recordEngagement = useCallback((interaction: 'click' | 'focus' | 'keydown', element?: string) => {
      if (!open || engaged.current) return
      engaged.current = true
      trackModalEngage({ id: drawerId, title, interaction, element })
    }, [drawerId, open, title])

    const requestClose = useCallback((reason: ModalCloseReason) => {
      lastCloseReason.current = reason
      onClose()
    }, [onClose])

    useEffect(() => {
      setMounted(true)
    }, [])

    useEffect(() => {
      if (!mounted) return
      if (open && !previousOpen.current) {
        previousOpen.current = true
        engaged.current = false
        lastCloseReason.current = null
        trackModalOpen({ id: drawerId, title, size: side ?? undefined })
        return
      }
      if (!open && previousOpen.current) {
        previousOpen.current = false
        trackModalClose({ id: drawerId, title, reason: lastCloseReason.current ?? 'programmatic' })
        lastCloseReason.current = null
      }
    }, [drawerId, mounted, open, side, title])

    useEffect(() => {
      if (!open || !closeOnEscape) return
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') requestClose('escape_key')
      }
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [closeOnEscape, open, requestClose])

    useEffect(() => {
      if (!open) return
      previousActiveElement.current = document.activeElement as HTMLElement
      const timer = setTimeout(() => {
        const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        firstFocusable?.focus()
      }, 150)
      return () => {
        clearTimeout(timer)
        if (previousActiveElement.current) previousActiveElement.current.focus()
      }
    }, [open])

    useEffect(() => {
      if (!open || !preventScroll) return
      const original = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = original }
    }, [open, preventScroll])

    useEffect(() => {
      if (!open || !drawerRef.current) return
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return
        const focusable = Array.from(
          drawerRef.current!.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
      document.addEventListener('keydown', handleTabKey)
      return () => document.removeEventListener('keydown', handleTabKey)
    }, [open])

    if (!mounted) return null

    return createPortal(
      <>
        {/* Backdrop */}
        <div
          className={cn(
            'fixed inset-0 z-50 bg-black/50 transition-opacity duration-300',
            open ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
          onClick={closeOnBackdropClick ? () => requestClose('backdrop_click') : undefined}
          aria-hidden="true"
        />

        {/* Drawer panel */}
        <div
          ref={drawerRef}
          className={cn(
            drawerVariants({ side }),
            'transition-transform duration-300 ease-out',
            className
          )}
          data-state={open ? 'open' : 'closed'}
          onClick={(e) => e.stopPropagation()}
          onClickCapture={(event) => {
            const target = event.target as HTMLElement | null
            const interactive = target?.closest?.(
              'button, a, input, select, textarea, [role="button"], [role="link"]'
            ) as HTMLElement | null
            if (!interactive || interactive.dataset.drawerClose === 'true') return
            recordEngagement('click', interactive.tagName.toLowerCase())
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descriptionId : undefined}
          data-testid={testId}
          {...props}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-anchor-gold/15 px-4 py-3 sm:px-6">
            <div className="min-w-0 flex-1">
              {title && (
                <h2 id={titleId} className="text-lg font-semibold text-anchor-cream-text truncate">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className="mt-0.5 text-sm text-anchor-cream-text/60 truncate">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              className="ml-3 flex-shrink-0 rounded-full p-2 text-anchor-cream-text/70 transition-colors hover:bg-anchor-bg-raised hover:text-anchor-cream-text focus:outline-none focus:ring-2 focus:ring-anchor-gold"
              onClick={() => requestClose('close_button')}
              aria-label="Close"
              data-drawer-close="true"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {children}
          </div>
        </div>
      </>,
      document.body
    )
  }
)

StickyDrawer.displayName = 'StickyDrawer'

interface StickyDrawerTriggerProps extends BaseComponentProps {
  children: React.ReactNode
  onClick: () => void
  visible: boolean
  position?: 'bottom-right' | 'bottom-center'
}

export function StickyDrawerTrigger({
  children,
  onClick,
  visible,
  position = 'bottom-right',
  className,
  testId
}: StickyDrawerTriggerProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || !visible) return null

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'fixed z-40 shadow-xl transition-all duration-300',
        'bg-anchor-gold text-anchor-bg font-semibold',
        'hover:bg-anchor-gold-vivid hover:scale-105',
        'focus:outline-none focus:ring-2 focus:ring-anchor-gold focus:ring-offset-2 focus:ring-offset-anchor-bg',
        position === 'bottom-right' && 'bottom-4 right-4 rounded-full px-5 py-3 sm:bottom-6 sm:right-6',
        position === 'bottom-center' && 'bottom-4 left-1/2 -translate-x-1/2 rounded-full px-6 py-3',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        className
      )}
      data-testid={testId}
    >
      {children}
    </button>
  )
}
