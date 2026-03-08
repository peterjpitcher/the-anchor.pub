'use client'

import { forwardRef, useState, useRef, useEffect, useCallback, cloneElement, isValidElement } from 'react'
import { createPortal } from 'react-dom'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from '../types'

const tooltipVariants = cva(
  'absolute z-50 rounded-md px-3 py-1.5 text-sm shadow-md transition-all',
  {
    variants: {
      variant: {
        default: 'bg-anchor-bg text-anchor-cream-text',
        light: 'bg-anchor-bg-card text-anchor-cream-text border border-anchor-gold/15',
        error: 'bg-red-600 text-white',
        warning: 'bg-yellow-600 text-white',
        success: 'bg-anchor-gold-vivid/20 text-anchor-gold-vivid'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

type TooltipPlacement = 
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

export interface TooltipProps 
  extends BaseComponentProps,
    VariantProps<typeof tooltipVariants> {
  content: React.ReactNode
  children: React.ReactElement
  placement?: TooltipPlacement
  offset?: number
  delay?: number
  closeDelay?: number
  disabled?: boolean
  trigger?: 'hover' | 'click' | 'focus'
  arrow?: boolean
  interactive?: boolean
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ 
    className,
    variant,
    content,
    children,
    placement = 'top',
    offset = 8,
    delay = 200,
    closeDelay = 0,
    disabled = false,
    trigger = 'hover',
    arrow = true,
    interactive = false,
    testId,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [position, setPosition] = useState({ top: 0, left: 0 })
    const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null)
    const tooltipRef = useRef<HTMLDivElement>(null)
    const showTimeoutRef = useRef<NodeJS.Timeout>()
    const hideTimeoutRef = useRef<NodeJS.Timeout>()

    useEffect(() => {
      setMounted(true)
    }, [])

    const calculatePosition = useCallback(() => {
      if (!triggerElement || !tooltipRef.current) return

      const triggerRect = triggerElement.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const scrollY = window.scrollY
      const scrollX = window.scrollX

      let top = 0
      let left = 0

      // Calculate base positions
      switch (placement) {
        case 'top':
        case 'top-start':
        case 'top-end':
          top = triggerRect.top + scrollY - tooltipRect.height - offset
          break
        case 'bottom':
        case 'bottom-start':
        case 'bottom-end':
          top = triggerRect.bottom + scrollY + offset
          break
        case 'left':
        case 'left-start':
        case 'left-end':
          left = triggerRect.left + scrollX - tooltipRect.width - offset
          break
        case 'right':
        case 'right-start':
        case 'right-end':
          left = triggerRect.right + scrollX + offset
          break
      }

      // Horizontal alignment
      if (placement.includes('top') || placement.includes('bottom')) {
        if (placement.endsWith('-start')) {
          left = triggerRect.left + scrollX
        } else if (placement.endsWith('-end')) {
          left = triggerRect.right + scrollX - tooltipRect.width
        } else {
          left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2
        }
      }

      // Vertical alignment
      if (placement.includes('left') || placement.includes('right')) {
        if (placement.endsWith('-start')) {
          top = triggerRect.top + scrollY
        } else if (placement.endsWith('-end')) {
          top = triggerRect.bottom + scrollY - tooltipRect.height
        } else {
          top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2
        }
      }

      // Boundary detection and adjustment
      const padding = 8
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      if (left < padding) left = padding
      if (left + tooltipRect.width > viewportWidth - padding) {
        left = viewportWidth - tooltipRect.width - padding
      }
      if (top < padding + scrollY) top = padding + scrollY
      if (top + tooltipRect.height > viewportHeight + scrollY - padding) {
        top = viewportHeight + scrollY - tooltipRect.height - padding
      }

      setPosition({ top, left })
    }, [triggerElement, placement, offset])

    const show = () => {
      if (disabled) return
      
      clearTimeout(hideTimeoutRef.current)
      showTimeoutRef.current = setTimeout(() => {
        setIsVisible(true)
      }, delay)
    }

    const hide = () => {
      clearTimeout(showTimeoutRef.current)
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false)
      }, closeDelay)
    }

    useEffect(() => {
      if (isVisible) {
        calculatePosition()
        window.addEventListener('scroll', calculatePosition)
        window.addEventListener('resize', calculatePosition)
        
        return () => {
          window.removeEventListener('scroll', calculatePosition)
          window.removeEventListener('resize', calculatePosition)
        }
      }
    }, [isVisible, calculatePosition])

    useEffect(() => {
      return () => {
        clearTimeout(showTimeoutRef.current)
        clearTimeout(hideTimeoutRef.current)
      }
    }, [])

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
      'aria-describedby': isVisible ? 'tooltip' : undefined
    }

    if (trigger === 'hover' || trigger === 'focus') {
      triggerProps.onMouseEnter = () => trigger === 'hover' && show()
      triggerProps.onMouseLeave = () => trigger === 'hover' && hide()
      triggerProps.onFocus = () => trigger === 'focus' && show()
      triggerProps.onBlur = () => trigger === 'focus' && hide()
    }

    if (trigger === 'click') {
      triggerProps.onClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsVisible(!isVisible)
      }
    }

    const getArrowStyles = () => {
      const arrowSize = 6
      const baseStyles = 'absolute w-0 h-0 border-solid'
      
      switch (placement) {
        case 'top':
        case 'top-start':
        case 'top-end':
          return {
            className: `${baseStyles} border-t-8 border-x-4 border-b-0 border-t-current border-x-transparent`,
            style: { bottom: -arrowSize, left: '50%', transform: 'translateX(-50%)' }
          }
        case 'bottom':
        case 'bottom-start':
        case 'bottom-end':
          return {
            className: `${baseStyles} border-b-8 border-x-4 border-t-0 border-b-current border-x-transparent`,
            style: { top: -arrowSize, left: '50%', transform: 'translateX(-50%)' }
          }
        case 'left':
        case 'left-start':
        case 'left-end':
          return {
            className: `${baseStyles} border-l-8 border-y-4 border-r-0 border-l-current border-y-transparent`,
            style: { right: -arrowSize, top: '50%', transform: 'translateY(-50%)' }
          }
        case 'right':
        case 'right-start':
        case 'right-end':
          return {
            className: `${baseStyles} border-r-8 border-y-4 border-l-0 border-r-current border-y-transparent`,
            style: { left: -arrowSize, top: '50%', transform: 'translateY(-50%)' }
          }
        default:
          return { className: '', style: {} }
      }
    }

    return (
      <>
        {cloneElement(child, triggerProps)}
        {mounted && isVisible && createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            id="tooltip"
            className={cn(
              tooltipVariants({ variant }),
              'opacity-0 animate-in fade-in-0 zoom-in-95',
              isVisible && 'opacity-100',
              className
            )}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`
            }}
            onMouseEnter={interactive ? () => clearTimeout(hideTimeoutRef.current) : undefined}
            onMouseLeave={interactive ? hide : undefined}
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

Tooltip.displayName = 'Tooltip'