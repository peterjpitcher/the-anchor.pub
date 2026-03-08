'use client'

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { trackModalClose, trackModalEngage, trackModalOpen, type ModalCloseReason } from '@/lib/gtm-events'
import type { BaseComponentProps } from '../types'

const modalVariants = cva(
  'relative bg-anchor-bg-card rounded-none mx-auto border border-anchor-gold/15',
  {
    variants: {
      size: {
        sm: 'max-w-md w-full',
        md: 'max-w-lg w-full',
        lg: 'max-w-2xl w-full',
        xl: 'max-w-4xl w-full',
        fullscreen: 'max-w-full min-h-screen m-0 rounded-none'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
)

const overlayVariants = cva(
  'fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto',
  {
    variants: {
      backdrop: {
        default: 'bg-black/50',
        blur: 'bg-black/30 backdrop-blur-sm',
        none: ''
      }
    },
    defaultVariants: {
      backdrop: 'default'
    }
  }
)

export interface ModalProps 
  extends BaseComponentProps,
    VariantProps<typeof modalVariants>,
    VariantProps<typeof overlayVariants> {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  description?: string
  closeOnEscape?: boolean
  closeOnBackdropClick?: boolean
  showCloseButton?: boolean
  initialFocus?: React.RefObject<HTMLElement>
  returnFocus?: boolean
  preventScroll?: boolean
  role?: 'dialog' | 'alertdialog'
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ 
    className,
    size,
    backdrop,
    open,
    onClose,
    children,
    title,
    description,
    closeOnEscape = true,
    closeOnBackdropClick = true,
    showCloseButton = true,
    initialFocus,
    returnFocus = true,
    preventScroll = true,
    role = 'dialog',
    id,
    testId,
    ...props 
  }, ref) => {
    const [mounted, setMounted] = useState(false)
    const modalRef = useRef<HTMLDivElement>(null)
    const previousActiveElement = useRef<HTMLElement | null>(null)
    const previousOpen = useRef(false)
    const engaged = useRef(false)
    const lastCloseReason = useRef<ModalCloseReason | null>(null)
    const titleId = `${id || 'modal'}-title`
    const descriptionId = `${id || 'modal'}-description`
    const modalId = id || (title ? `modal_${slugify(title)}` : 'modal')

    const recordEngagement = useCallback((interaction: 'click' | 'focus' | 'keydown', element?: string) => {
      if (!open) return
      if (engaged.current) return
      engaged.current = true
      trackModalEngage({ id: modalId, title, interaction, element })
    }, [modalId, open, title])

    const requestClose = useCallback((reason: ModalCloseReason) => {
      lastCloseReason.current = reason
      onClose()
    }, [onClose])

    // Mount on client only
    useEffect(() => {
      setMounted(true)
    }, [])

    // Track open/close lifecycle
    useEffect(() => {
      if (!mounted) return

	      if (open && !previousOpen.current) {
	        previousOpen.current = true
	        engaged.current = false
	        lastCloseReason.current = null
	        trackModalOpen({
	          id: modalId,
	          title,
	          size: size ?? undefined,
	          backdrop: backdrop ?? undefined
	        })
	        return
	      }

      if (!open && previousOpen.current) {
        previousOpen.current = false
        trackModalClose({
          id: modalId,
          title,
          reason: lastCloseReason.current ?? 'programmatic'
        })
        lastCloseReason.current = null
      }
    }, [backdrop, modalId, mounted, open, size, title])

    // Handle escape key
    useEffect(() => {
      if (!open || !closeOnEscape) return

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          requestClose('escape_key')
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [closeOnEscape, open, requestClose])

    // Focus management
    useEffect(() => {
      if (!open) return

      // Store current active element
      previousActiveElement.current = document.activeElement as HTMLElement

      // Focus initial element or modal
      const timer = setTimeout(() => {
        if (initialFocus?.current) {
          initialFocus.current.focus()
        } else {
          const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          firstFocusable?.focus()
        }
      }, 100)

      return () => {
        clearTimeout(timer)
        // Return focus to previous element
        if (returnFocus && previousActiveElement.current) {
          previousActiveElement.current.focus()
        }
      }
    }, [open, initialFocus, returnFocus])

    // Prevent body scroll
    useEffect(() => {
      if (!open || !preventScroll) return

      const originalStyle = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.overflow = originalStyle
      }
    }, [open, preventScroll])

    // Focus trap
    useEffect(() => {
      if (!open || !modalRef.current) return

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return

        const focusableElements = modalRef.current!.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const focusableArray = Array.from(focusableElements)
        
        if (focusableArray.length === 0) return

        const firstFocusable = focusableArray[0]
        const lastFocusable = focusableArray[focusableArray.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault()
            lastFocusable.focus()
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault()
            firstFocusable.focus()
          }
        }
      }

      document.addEventListener('keydown', handleTabKey)
      return () => document.removeEventListener('keydown', handleTabKey)
    }, [open])

    if (!mounted || !open) return null

    return createPortal(
      <div
        className={cn(overlayVariants({ backdrop }))}
        onClick={closeOnBackdropClick ? () => requestClose('backdrop_click') : undefined}
        data-testid={testId}
      >
        <div
          ref={modalRef}
          className={cn(modalVariants({ size }), 'my-8', className)}
          onClick={(e) => e.stopPropagation()}
          onClickCapture={(event) => {
            const target = event.target as HTMLElement | null
            const interactive = target?.closest?.(
              'button, a, input, select, textarea, [role="button"], [role="link"]'
            ) as HTMLElement | null

            if (!interactive) return
            if (interactive.dataset.modalClose === 'true') return

            recordEngagement('click', interactive.tagName.toLowerCase())
          }}
          role={role}
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descriptionId : undefined}
          {...props}
        >
          {showCloseButton && (
            <button
              type="button"
              className="absolute right-4 top-4 rounded-sm opacity-70 text-anchor-cream-text ring-offset-anchor-bg-card transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-anchor-gold focus:ring-offset-2"
              onClick={() => requestClose('close_button')}
              aria-label="Close modal"
              data-modal-close="true"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {children}
        </div>
      </div>,
      document.body
    )
  }
)

Modal.displayName = 'Modal'

// Modal sub-components for consistent structure
export interface ModalHeaderProps extends BaseComponentProps {
  children: React.ReactNode
}

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 pt-6 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
)

ModalHeader.displayName = 'ModalHeader'

export interface ModalTitleProps extends BaseComponentProps {
  children: React.ReactNode
}

export const ModalTitle = forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className, children, id, ...props }, ref) => (
    <h2
      ref={ref}
      id={id}
      className={cn('text-lg font-semibold text-anchor-cream-text', className)}
      {...props}
    >
      {children}
    </h2>
  )
)

ModalTitle.displayName = 'ModalTitle'

export interface ModalDescriptionProps extends BaseComponentProps {
  children: React.ReactNode
}

export const ModalDescription = forwardRef<HTMLParagraphElement, ModalDescriptionProps>(
  ({ className, children, id, ...props }, ref) => (
    <p
      ref={ref}
      id={id}
      className={cn('mt-1 text-sm text-anchor-cream-text/70', className)}
      {...props}
    >
      {children}
    </p>
  )
)

ModalDescription.displayName = 'ModalDescription'

export interface ModalBodyProps extends BaseComponentProps {
  children: React.ReactNode
}

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4', className)}
      {...props}
    >
      {children}
    </div>
  )
)

ModalBody.displayName = 'ModalBody'

export interface ModalFooterProps extends BaseComponentProps {
  children: React.ReactNode
}

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-end gap-2 border-t border-anchor-gold/15 px-6 py-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)

ModalFooter.displayName = 'ModalFooter'
