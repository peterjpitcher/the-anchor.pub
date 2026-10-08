'use client'

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { trackModalClose, trackModalEngage, trackModalOpen, type ModalCloseReason } from '@/lib/gtm-events'
import type { BaseComponentProps } from '../types'

const drawerVariants = cva(
  'fixed z-[90] bg-surface text-ink border-line shadow-xl flex flex-col overflow-hidden',
  {
    variants: {
      side: {
        right: 'top-0 right-0 h-full w-full sm:max-w-lg border-l translate-x-full data-[state=open]:translate-x-0',
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

    /**
     * `inert` while the drawer is closed, so the off-canvas panel leaves the tab order and
     * stops taking pointer events.
     *
     * Unlike `Modal`, this drawer stays mounted when closed and hides itself with a
     * transform, because it animates in and out. `aria-hidden` on its own would be a fault
     * of its own making: hiding a subtree that still holds focusable children lets a
     * keyboard user tab into content the screen reader has been told is not there.
     *
     * Set on the node rather than passed as a prop because React 18 has no `inert` support.
     * A boolean prop renders `inert="true"` and logs "Received `true` for a non-boolean
     * attribute", and the empty string the HTML spec asks for is rejected by the only
     * `inert` typing in scope, which comes from React's experimental build and types it as
     * the boolean React 18 cannot take. On React 19 this whole effect collapses to
     * `inert={!open}` on the panel below.
     */
    useEffect(() => {
      const panel = drawerRef.current
      if (!panel) return
      if (open) panel.removeAttribute('inert')
      else panel.setAttribute('inert', '')
    }, [mounted, open])

    if (!mounted) return null

    return createPortal(
      <>
        {/* Backdrop */}
        <div
          className={cn(
            'fixed inset-0 z-[90] bg-black/50 transition-opacity duration-300',
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
          role={open ? 'dialog' : undefined}
          aria-modal={open ? 'true' : undefined}
          aria-hidden={open ? undefined : true}
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descriptionId : undefined}
          data-testid={testId}
          {...props}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <div className="min-w-0 flex-1">
              {title && (
                <h2 id={titleId} className="text-sm font-semibold text-ink-strong truncate">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className="text-xs text-ink-muted truncate">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              // The circle stays 28px; the invisible ring round it makes the
              // tap target 44px (site review LS-016).
              className="relative ml-3 flex-shrink-0 rounded-full p-1.5 text-ink-muted transition-colors hover:bg-surface-sunk hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent-text before:absolute before:-inset-2 before:content-['']"
              onClick={() => requestClose('close_button')}
              aria-label="Close"
              data-drawer-close="true"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

// StickyDrawerTrigger, the floating button that opened a drawer from the bottom
// corner of the screen, was removed on 8 October 2026. Its one use was "Get
// Instant Quote" on the private hire pages, which sat behind the site-wide
// booking bar (owner decision 12, site review LS-006). A drawer is opened from a
// button in the page, or from the booking bar. Do not add a floating trigger
// back: the strip at the bottom of the screen belongs to the bar.
