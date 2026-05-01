'use client'

import { forwardRef, HTMLAttributes, createContext, useContext, useState, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { BaseComponentProps, WithChildren } from '../types'

// Tab context for managing state
interface TabsContextValue {
  activeTab: string
  setActiveTab: (value: string) => void
  variant?: 'line' | 'enclosed' | 'pills'
  size?: 'sm' | 'md' | 'lg'
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

const useTabsContext = () => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tab components must be used within a Tabs component')
  }
  return context
}

// Main Tabs container
const tabsVariants = cva('', {
  variants: {
    orientation: {
      horizontal: 'flex flex-col',
      vertical: 'flex flex-row'
    }
  },
  defaultVariants: {
    orientation: 'horizontal'
  }
})

export interface TabsProps 
  extends BaseComponentProps,
    WithChildren,
    Omit<HTMLAttributes<HTMLDivElement>, 'className'>,
    VariantProps<typeof tabsVariants> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  variant?: 'line' | 'enclosed' | 'pills'
  size?: 'sm' | 'md' | 'lg'
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ 
    className,
    orientation,
    defaultValue = '',
    value,
    onValueChange,
    variant = 'line',
    size = 'md',
    children,
    testId,
    ...props 
  }, ref) => {
    const [activeTab, setActiveTab] = useState(value || defaultValue)

    const handleTabChange = (newValue: string) => {
      if (!value) {
        setActiveTab(newValue)
      }
      onValueChange?.(newValue)
    }

    return (
      <TabsContext.Provider 
        value={{ 
          activeTab: value || activeTab, 
          setActiveTab: handleTabChange,
          variant,
          size
        }}
      >
        <div
          ref={ref}
          className={cn(tabsVariants({ orientation }), className)}
          data-testid={testId}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)

Tabs.displayName = 'Tabs'

// Tab List container
const tabListVariants = cva(
  'flex',
  {
    variants: {
      variant: {
        line: 'border-b border-anchor-gold/15',
        enclosed: 'bg-anchor-bg-card border border-anchor-gold/20 p-1 rounded-lg',
        pills: 'gap-2'
      },
      orientation: {
        horizontal: 'flex-row',
        vertical: 'flex-col'
      }
    },
    defaultVariants: {
      variant: 'line',
      orientation: 'horizontal'
    }
  }
)

export interface TabsListProps 
  extends BaseComponentProps,
    WithChildren,
    Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  orientation?: 'horizontal' | 'vertical'
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ 
    className,
    orientation = 'horizontal',
    children,
    ...props 
  }, ref) => {
    const { variant } = useTabsContext()

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={orientation}
        className={cn(tabListVariants({ variant, orientation }), className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

TabsList.displayName = 'TabsList'

// Individual Tab trigger
const tabTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all focus:outline-none focus:ring-2 focus:ring-anchor-gold focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        line: 'border-b-2 border-transparent pb-2 px-1 hover:text-anchor-gold data-[state=active]:border-anchor-gold data-[state=active]:text-anchor-gold',
        enclosed: 'rounded-md px-3 py-1.5 text-anchor-cream-text/70 hover:bg-anchor-bg-raised data-[state=active]:bg-anchor-bg-raised data-[state=active]:text-anchor-gold-vivid data-[state=active]:shadow-sm',
        pills: 'rounded-full px-4 py-2 text-anchor-cream-text/70 hover:bg-anchor-bg-raised data-[state=active]:bg-anchor-gold data-[state=active]:text-anchor-green'
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
      }
    },
    defaultVariants: {
      variant: 'line',
      size: 'md'
    }
  }
)

export interface TabsTriggerProps 
  extends BaseComponentProps,
    WithChildren,
    Omit<HTMLAttributes<HTMLButtonElement>, 'className'> {
  value: string
  disabled?: boolean
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ 
    className,
    value,
    disabled,
    children,
    onClick,
    ...props 
  }, ref) => {
    const { activeTab, setActiveTab, variant, size } = useTabsContext()
    const isActive = activeTab === value

    return (
      <button
        ref={ref}
        role="tab"
        type="button"
        aria-selected={isActive}
        aria-controls={`tabpanel-${value}`}
        data-state={isActive ? 'active' : 'inactive'}
        disabled={disabled}
        className={cn(tabTriggerVariants({ variant, size }), className)}
        onClick={(e) => {
          onClick?.(e)
          setActiveTab(value)
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
)

TabsTrigger.displayName = 'TabsTrigger'

// Tab Content panel
export interface TabsContentProps 
  extends BaseComponentProps,
    WithChildren,
    Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  value: string
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ 
    className,
    value,
    children,
    ...props 
  }, ref) => {
    const { activeTab } = useTabsContext()
    const isActive = activeTab === value

    if (!isActive) return null

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`tabpanel-${value}`}
        aria-labelledby={`tab-${value}`}
        className={cn('mt-4 focus:outline-none', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

TabsContent.displayName = 'TabsContent'
