import { cn } from '@/lib/utils'

interface HeroTagProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  size?: 'small' | 'medium' | 'large'
  icon?: React.ReactNode
  className?: string
}

const variantClasses = {
  default: 'bg-white/90 text-gray-800',
  primary: 'bg-anchor-gold-dark/90 text-white',
  success: 'bg-green-600/90 text-white',
  warning: 'bg-amber-600/90 text-white',
  danger: 'bg-red-600/90 text-white'
}

const sizeClasses = {
  small: 'px-2 py-1 text-sm sm:text-xs',
  medium: 'px-3 py-1.5 text-sm',
  large: 'px-4 py-2 text-base'
}

export function HeroTag({
  children,
  variant = 'default',
  size = 'medium',
  icon,
  className
}: HeroTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full backdrop-blur-sm',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  )
}