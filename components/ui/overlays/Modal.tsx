'use client'

import { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { trackModalClose, trackModalEngage, trackModalOpen, type ModalCloseReason } from '@/lib/gtm-events'
import type { BaseComponentProps } from '../types'

/**
 * How long the modal waits before moving focus into itself, so focus lands after the
 * open transition rather than during it.
 *
 * Exported because the test has to wait exactly this long. It previously guessed at the
 * value with a 200ms `waitFor`, which left CI a 100ms wall-clock budget to render jsdom
 * and fire the timer; that assertion failed on `main` three times on commits which never
 * touched this component. Anything driving this timer should import the constant rather
 * than restate the number.
 */
export const MODAL_FOCUS_DELAY_MS = 100

const modalVariants = cva(
  'relative bg-surface text-ink rounded-md mx-auto border border-line shadow-lg',
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

// No `items-center` here, on purpose. A panel taller than the screen that is
// centred by its container hangs off the top as far as it hangs off the bottom,
// and the part above the top cannot be scrolled to: on a phone held sideways
// the Christmas pop-up's close button was off the screen for good (site review
// LS-008). The panel is centred by its own `my-auto` instead (see the panel
// below). Auto margins share out spare room, so it sits in the middle when it
// fits, and when it does not they collapse to nothing: the panel starts at the
// top and the layer scrolls to the rest. The 32px above and below is this
// layer's padding, where it used to be the panel's margin.
const overlayVariants = cva(
  'fixed inset-0 z-[100] flex justify-center px-4 py-8 overflow-y-auto',
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

/**
 * What a Modal tells the title and description inside it.
 *
 * The dialog's name is whatever its `aria-labelledby` points at. Modal used to
 * build that id from its own `id` while each caller gave its title a fixed one
 * ('modal-title'), so two dialogs on the Sunday roast page pointed at an id that
 * was not in the page and were announced as 'dialog' with no name (site review
 * AX-015, 7 October 2026). The title now takes its id from here, and says when
 * it is there, so the dialog never points at nothing.
 */
interface ModalLabelContext {
  titleId: string
  descriptionId: string
  setHasTitle: (present: boolean) => void
  setHasDescription: (present: boolean) => void
}

const ModalLabels = createContext<ModalLabelContext | null>(null)

export interface ModalProps 
  extends BaseComponentProps,
    VariantProps<typeof modalVariants>,
    VariantProps<typeof overlayVariants> {
  open: boolean
  /** Called with why the dialog is closing when the Modal itself closed it. */
  onClose: (reason?: ModalCloseReason) => void
  /** Extra classes for the full-screen layer behind the panel. */
  overlayClassName?: string
  /**
   * False for a caller that records its own open, engage and close events, so
   * the same pop-up is not counted twice.
   */
  analytics?: boolean
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
    overlayClassName,
    analytics = true,
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
    const [hasTitle, setHasTitle] = useState(false)
    const [hasDescription, setHasDescription] = useState(false)
    const labels = useMemo<ModalLabelContext>(
      () => ({ titleId, descriptionId, setHasTitle, setHasDescription }),
      [titleId, descriptionId]
    )

    const recordEngagement = useCallback((interaction: 'click' | 'focus' | 'keydown', element?: string) => {
      if (!open || !analytics) return
      if (engaged.current) return
      engaged.current = true
      trackModalEngage({ id: modalId, title, interaction, element })
    }, [analytics, modalId, open, title])

    const requestClose = useCallback((reason: ModalCloseReason) => {
      lastCloseReason.current = reason
      onClose(reason)
    }, [onClose])

    // Mount on client only
    useEffect(() => {
      setMounted(true)
    }, [])

    // Track open/close lifecycle
    useEffect(() => {
      if (!mounted || !analytics) return

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
    }, [analytics, backdrop, modalId, mounted, open, size, title])

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
      }, MODAL_FOCUS_DELAY_MS)

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

        // Focus is somewhere behind the dialog (a click on the page before it
        // opened, or a control that has since gone). Bring it in, or Tab would
        // carry on through the page underneath.
        if (!modalRef.current!.contains(document.activeElement)) {
          e.preventDefault()
          ;(e.shiftKey ? lastFocusable : firstFocusable).focus()
          return
        }

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
      // `mounted` matters: a Modal first rendered already open draws nothing
      // until it has mounted, so on the pass where `open` is first true there
      // is no panel to trap. Without it here the trap was never set for such a
      // Modal, and Tab walked out of the dialog.
    }, [open, mounted])

    if (!mounted || !open) return null

    return createPortal(
      <div
        className={cn(overlayVariants({ backdrop }), overlayClassName)}
        onClick={closeOnBackdropClick ? () => requestClose('backdrop_click') : undefined}
        data-testid={testId}
      >
        <div
          ref={modalRef}
          className={cn(modalVariants({ size }), 'my-auto', className)}
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
          aria-labelledby={hasTitle ? titleId : undefined}
          aria-label={!hasTitle ? title : undefined}
          aria-describedby={hasDescription ? descriptionId : undefined}
          {...props}
        >
          <ModalLabels.Provider value={labels}>
          {showCloseButton && (
            <button
              type="button"
              className="absolute right-4 top-4 rounded-sm opacity-70 text-ink-muted ring-offset-surface transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent-text focus:ring-offset-2"
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
          </ModalLabels.Provider>
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
  ({ className, children, id, ...props }, ref) => {
    const labels = useContext(ModalLabels)
    const setHasTitle = labels?.setHasTitle

    useEffect(() => {
      if (!setHasTitle) return
      setHasTitle(true)
      return () => setHasTitle(false)
    }, [setHasTitle])

    return (
      <h2
        ref={ref}
        // Inside a Modal the id is the Modal's, whatever the caller passed: it
        // is the one the dialog's aria-labelledby points at.
        id={labels?.titleId ?? id}
        className={cn('text-lg font-semibold text-ink-strong', className)}
        {...props}
      >
        {children}
      </h2>
    )
  }
)

ModalTitle.displayName = 'ModalTitle'

export interface ModalDescriptionProps extends BaseComponentProps {
  children: React.ReactNode
}

export const ModalDescription = forwardRef<HTMLParagraphElement, ModalDescriptionProps>(
  ({ className, children, id, ...props }, ref) => {
    const labels = useContext(ModalLabels)
    const setHasDescription = labels?.setHasDescription

    useEffect(() => {
      if (!setHasDescription) return
      setHasDescription(true)
      return () => setHasDescription(false)
    }, [setHasDescription])

    return (
      <p
        ref={ref}
        id={labels?.descriptionId ?? id}
        className={cn('mt-1 text-sm text-ink-muted', className)}
        {...props}
      >
        {children}
      </p>
    )
  }
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
        'flex items-center justify-end gap-2 border-t border-line px-6 py-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)

ModalFooter.displayName = 'ModalFooter'
