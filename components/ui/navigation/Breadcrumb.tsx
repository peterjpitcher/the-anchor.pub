import { forwardRef, HTMLAttributes, Fragment } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { BaseComponentProps, WithChildren } from '../types'

export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

export interface BreadcrumbProps 
  extends BaseComponentProps,
    Omit<HTMLAttributes<HTMLElement>, 'className'> {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  homeLabel?: string
  showHome?: boolean
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ 
    className,
    items,
    separator = '/',
    homeLabel = 'Home',
    showHome = true,
    testId,
    ...props 
  }, ref) => {
    const hasExplicitCurrent = items.some(item => item.current === true)

    const allItems = showHome 
      ? [{ label: homeLabel, href: '/' }, ...items]
      : items

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn('flex items-center text-sm', className)}
        data-testid={testId}
        {...props}
      >
        <ol className="flex items-center gap-2">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1
            const isCurrent = hasExplicitCurrent ? item.current === true : isLast

            return (
              <li key={index} className="flex items-center gap-2">
                {item.href && !isCurrent ? (
                  <Link
                    href={item.href}
                    className="text-anchor-cream-text/60 hover:text-anchor-gold transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      isCurrent ? 'text-anchor-gold-vivid font-semibold' : 'text-anchor-cream-text/60'
                    )}
                    aria-current={isCurrent ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}

                {!isLast && (
                  <span className="text-anchor-cream-text/45" aria-hidden="true">
                    {separator}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  }
)

Breadcrumb.displayName = 'Breadcrumb'

// Alternative component API for more flexibility
export interface BreadcrumbListProps 
  extends BaseComponentProps,
    WithChildren,
    Omit<HTMLAttributes<HTMLOListElement>, 'className'> {}

export const BreadcrumbList = forwardRef<HTMLOListElement, BreadcrumbListProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <ol
        ref={ref}
        className={cn('flex items-center gap-2', className)}
        {...props}
      >
        {children}
      </ol>
    )
  }
)

BreadcrumbList.displayName = 'BreadcrumbList'

export interface BreadcrumbItemComponentProps 
  extends BaseComponentProps,
    WithChildren,
    Omit<HTMLAttributes<HTMLLIElement>, 'className'> {}

export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemComponentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn('flex items-center gap-2', className)}
        {...props}
      >
        {children}
      </li>
    )
  }
)

BreadcrumbItem.displayName = 'BreadcrumbItem'

export interface BreadcrumbLinkProps 
  extends BaseComponentProps,
    WithChildren,
    Omit<HTMLAttributes<HTMLAnchorElement>, 'className' | 'href'> {
  href: string
}

export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, href, children, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          'text-anchor-cream-text/60 hover:text-anchor-gold transition-colours',
          className
        )}
        {...props}
      >
        {children}
      </Link>
    )
  }
)

BreadcrumbLink.displayName = 'BreadcrumbLink'

export interface BreadcrumbSeparatorProps 
  extends BaseComponentProps,
    WithChildren,
    Omit<HTMLAttributes<HTMLSpanElement>, 'className'> {}

export const BreadcrumbSeparator = forwardRef<HTMLSpanElement, BreadcrumbSeparatorProps>(
  ({ className, children = '/', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn('text-anchor-cream-text/45', className)}
        aria-hidden="true"
        {...props}
      >
        {children}
      </span>
    )
  }
)

BreadcrumbSeparator.displayName = 'BreadcrumbSeparator'

export interface BreadcrumbPageProps 
  extends BaseComponentProps,
    WithChildren,
    Omit<HTMLAttributes<HTMLSpanElement>, 'className'> {}

export const BreadcrumbPage = forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn('text-anchor-gold-vivid font-semibold', className)}
        aria-current="page"
        {...props}
      >
        {children}
      </span>
    )
  }
)

BreadcrumbPage.displayName = 'BreadcrumbPage'
