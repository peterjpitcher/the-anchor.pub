'use client'

import { forwardRef, useState, useRef, useEffect, useCallback, cloneElement, isValidElement } from 'react'
import { createPortal } from 'react-dom'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from '../types'

const popoverVariants = cva(
  'absolute z-50 rounded-md bg-surface text-ink shadow-lg border border-line outline-none',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        auto: ''
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
)

type PopoverPlacement = 
  | 'top' 
  | 'top-start' 
  | 'top-end'
  | 'bottom' 
  | 'bottom-start' 
  | 'bottom-end'
  | 'left' 
  | 'left-start' 
  | 'left-end'
  | 'right' 
  | 'right-start' 
  | 'right-end'

export interface PopoverProps 
  extends BaseComponentProps,
    VariantProps<typeof popoverVariants> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactElement
  content: React.ReactNode
  placement?: PopoverPlacement
  offset?: number
  trigger?: 'click' | 'hover' | 'focus' | 'manual'
  closeOnClickOutside?: boolean
  closeOnEscape?: boolean
  arrow?: boolean
  sameWidth?: boolean
}

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  ({ 
    className,
    size,
    open: controlledOpen,
    onOpenChange,
    children,
    content,
    placement = 'bottom',
    offset = 8,
    trigger = 'click',
    closeOnClickOutside = true,
    closeOnEscape = true,
    arrow = true,
    sameWidth = false,
    testId,
    ...props 
  }, ref) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [position, setPosition] = useState({ top: 0, left: 0 })
    const [actualPlacement, setActualPlacement] = useState(placement)
    const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null)
    const popoverRef = useRef<HTMLDivElement>(null)

    const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
    const setIsOpen = useCallback((value: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(value)
      }
      onOpenChange?.(value)
    }, [controlledOpen, onOpenChange])

    useEffect(() => {
      setMounted(true)
    }, [])

    const calculatePosition = useCallback(() => {
      if (!triggerElement || !popoverRef.current) return

      const triggerRect = triggerElement.getBoundingClientRect()
      const popoverRect = popoverRef.current.getBoundingClientRect()
      const scrollY = window.scrollY
      const scrollX = window.scrollX

      // If sameWidth is true, set popover width to match trigger
      if (sameWidth) {
        popoverRef.current.style.width = `${triggerRect.width}px`
      }

      let top = 0
      let left = 0
      let finalPlacement = placement

      // Calculate position based on placement
      const calculateByPlacement = (p: PopoverPlacement) => {
        switch (p) {
          case 'top':
          case 'top-start':
          case 'top-end':
            top = triggerRect.top + scrollY - popoverRect.height - offset
            break
          case 'bottom':
          case 'bottom-start':
          case 'bottom-end':
            top = triggerRect.bottom + scrollY + offset
            break
          case 'left':
          case 'left-start':
          case 'left-end':
            left = triggerRect.left + scrollX - popoverRect.width - offset
            break
          case 'right':
          case 'right-start':
          case 'right-end':
            left = triggerRect.right + scrollX + offset
            break
        }

        // Horizontal alignment
        if (p.includes('top') || p.includes('bottom')) {
          if (p.endsWith('-start')) {
            left = triggerRect.left + scrollX
          } else if (p.endsWith('-end')) {
            left = triggerRect.right + scrollX - popoverRect.width
          } else {
            left = triggerRect.left + scrollX + (triggerRect.width - popoverRect.width) / 2
          }
        }

        // Vertical alignment
        if (p.includes('left') || p.includes('right')) {
          if (p.endsWith('-start')) {
            top = triggerRect.top + scrollY
          } else if (p.endsWith('-end')) {
            top = triggerRect.bottom + scrollY - popoverRect.height
          } else {
            top = triggerRect.top + scrollY + (triggerRect.height - popoverRect.height) / 2
          }
        }

        return { top, left }
      }

      // Calculate initial position
      const initialPos = calculateByPlacement(placement)
      top = initialPos.top
      left = initialPos.left

      // Flip logic for better viewport fit
      const padding = 8
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Check if popover fits in viewport
      const fitsTop = top >= padding + scrollY
      const fitsBottom = top + popoverRect.height <= viewportHeight + scrollY - padding
      const fitsLeft = left >= padding + scrollX
      const fitsRight = left + popoverRect.width <= viewportWidth + scrollX - padding

      // Auto flip placement if needed
      if (!fitsBottom && placement.includes('bottom')) {
        const flippedPos = calculateByPlacement(placement.replace('bottom', 'top') as PopoverPlacement)
        if (flippedPos.top >= padding + scrollY) {
          top = flippedPos.top
          finalPlacement = placement.replace('bottom', 'top') as PopoverPlacement
        }
      } else if (!fitsTop && placement.includes('top')) {
        const flippedPos = calculateByPlacement(placement.replace('top', 'bottom') as PopoverPlacement)
        if (flippedPos.top + popoverRect.height <= viewportHeight + scrollY - padding) {
          top = flippedPos.top
          finalPlacement = placement.replace('top', 'bottom') as PopoverPlacement
        }
      }

      // Constrain to viewport
      if (left < padding) left = padding
      if (left + popoverRect.width > viewportWidth - padding) {
        left = viewportWidth - popoverRect.width - padding
      }
      if (top < padding + scrollY) top = padding + scrollY
      if (top + popoverRect.height > viewportHeight + scrollY - padding) {
        top = viewportHeight + scrollY - popoverRect.height - padding
      }

      setPosition({ top, left })
      setActualPlacement(finalPlacement)
    }, [triggerElement, sameWidth, placement, offset])

    // Handle escape key
    useEffect(() => {
      if (!isOpen || !closeOnEscape) return

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false)
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, closeOnEscape, setIsOpen])

    // Handle click outside
    useEffect(() => {
      if (!isOpen || !closeOnClickOutside) return

      const handleClickOutside = (e: MouseEvent) => {
        if (
          popoverRef.current && 
          !popoverRef.current.contains(e.target as Node) &&
          triggerElement &&
          !triggerElement.contains(e.target as Node)
        ) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen, closeOnClickOutside, setIsOpen, triggerElement])

    // Update position when open
    useEffect(() => {
      if (isOpen) {
        calculatePosition()
        window.addEventListener('scroll', calculatePosition)
        window.addEventListener('resize', calculatePosition)
        
        return () => {
          window.removeEventListener('scroll', calculatePosition)
          window.removeEventListener('resize', calculatePosition)
        }
      }
    }, [isOpen, sameWidth, calculatePosition])

    // Clone child element and attach event handlers
    const child = isValidElement(children) ? children : <span>{children}</span>
    
    const triggerProps: any = {
      ref: (node: HTMLElement) => {
        setTriggerElement(node)
        // Forward ref if child has one
        const { ref: childRef } = child as any
        if (childRef) {
          if (typeof childRef === 'function') {
            childRef(node)
          } else if (childRef && 'current' in childRef) {
            childRef.current = node
          }
        }
      },
      'aria-expanded': isOpen,
      'aria-haspopup': 'dialog'
    }

    if (trigger === 'click') {
      triggerProps.onClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsOpen(!isOpen)
      }
    } else if (trigger === 'hover') {
      triggerProps.onMouseEnter = () => setIsOpen(true)
      triggerProps.onMouseLeave = () => setIsOpen(false)
    } else if (trigger === 'focus') {
      triggerProps.onFocus = () => setIsOpen(true)
      triggerProps.onBlur = () => setIsOpen(false)
    }

    const getArrowStyles = () => {
      const arrowSize = 8
      const baseStyles = 'absolute w-0 h-0 border-solid'
      
      switch (actualPlacement) {
        case 'top':
        case 'top-start':
        case 'top-end':
          return {
            className: `${baseStyles} border-t-8 border-x-4 border-b-0 border-t-surface border-x-transparent`,
            style: { bottom: -arrowSize, left: '50%', transform: 'translateX(-50%)' }
          }
        case 'bottom':
        case 'bottom-start':
        case 'bottom-end':
          return {
            className: `${baseStyles} border-b-8 border-x-4 border-t-0 border-b-surface border-x-transparent`,
            style: { top: -arrowSize, left: '50%', transform: 'translateX(-50%)' }
          }
        case 'left':
        case 'left-start':
        case 'left-end':
          return {
            className: `${baseStyles} border-l-8 border-y-4 border-r-0 border-l-surface border-y-transparent`,
            style: { right: -arrowSize, top: '50%', transform: 'translateY(-50%)' }
          }
        case 'right':
        case 'right-start':
        case 'right-end':
          return {
            className: `${baseStyles} border-r-8 border-y-4 border-l-0 border-r-surface border-y-transparent`,
            style: { left: -arrowSize, top: '50%', transform: 'translateY(-50%)' }
          }
        default:
          return { className: '', style: {} }
      }
    }

    return (
      <>
        {cloneElement(child, triggerProps)}
        {mounted && isOpen && createPortal(
          <div
            ref={popoverRef}
            className={cn(
              popoverVariants({ size }),
              'opacity-0 animate-in fade-in-0 zoom-in-95',
              isOpen && 'opacity-100',
              className
            )}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`
            }}
            role="dialog"
            aria-modal="false"
            data-testid={testId}
            {...props}
          >
            {content}
            {arrow && (
              <span
                className={getArrowStyles().className}
                style={getArrowStyles().style}
              />
            )}
          </div>,
          document.body
        )}
      </>
    )
  }
)

Popover.displayName = 'Popover'

// Popover Content Components for better structure
export interface PopoverHeaderProps extends BaseComponentProps {
  children: React.ReactNode
}

export const PopoverHeader = forwardRef<HTMLDivElement, PopoverHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-4 py-3 border-b border-line', className)}
      {...props}
    >
      {children}
    </div>
  )
)

PopoverHeader.displayName = 'PopoverHeader'

export interface PopoverBodyProps extends BaseComponentProps {
  children: React.ReactNode
}

export const PopoverBody = forwardRef<HTMLDivElement, PopoverBodyProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-4 py-3', className)}
      {...props}
    >
      {children}
    </div>
  )
)

PopoverBody.displayName = 'PopoverBody'

export interface PopoverFooterProps extends BaseComponentProps {
  children: React.ReactNode
}

export const PopoverFooter = forwardRef<HTMLDivElement, PopoverFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-4 py-3 border-t border-line', className)}
      {...props}
    >
      {children}
    </div>
  )
)

PopoverFooter.displayName = 'PopoverFooter'