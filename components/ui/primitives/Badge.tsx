import { forwardRef, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { BaseComponentProps, WithChildren } from '../types'

// Pill, Outfit 600, --text-xs, padding 0.4em 0.85em, line-height 1, no wrap (spec §4.2)
const badgeVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-pill font-sans font-semibold text-xs leading-none px-[0.85em] py-[0.4em]',
  {
    variants: {
      variant: {
        // bg --anchor-green, white text
        green: 'bg-anchor-green text-white',
        // White on --anchor-gold #a57626 is 4.02:1, under AA. Button.tsx already
        // avoids that exact fill for the same reason; Badge did not. Matching it
        // on --anchor-gold-dark takes white to 5.59:1.
        gold: 'bg-anchor-gold-dark text-white',
        // bg --anchor-sand, green text — amenities, dietary flags, categories
        sand: 'bg-tile text-tile-ink',
        // transparent, 1.5px solid --border-strong, text --text
        outline: 'border-[1.5px] border-line-strong bg-transparent text-ink',
        // light: bg rgba(0,107,69,.12) text --anchor-success; dark override per spec
        success:
          'bg-anchor-success/[0.12] text-anchor-success [.theme-dark_&]:bg-[rgba(95,207,154,0.16)] [.theme-dark_&]:text-[#6ddaa1]',
        // bg rgba(177,55,47,.12), text --anchor-danger
        danger: 'bg-anchor-danger/[0.12] text-anchor-danger'
      },
      dot: {
        true: '',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'green',
      dot: false
    }
  }
)

export interface BadgeProps
  extends BaseComponentProps,
    WithChildren,
    Omit<HTMLAttributes<HTMLSpanElement>, 'className'>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, dot, children, testId, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, dot }), className)}
        data-testid={testId}
        {...props}
      >
        {dot && (
          // 7px circle, background currentColor, before the label
          <span
            className="mr-[0.5em] inline-block h-[7px] w-[7px] rounded-full bg-current"
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
