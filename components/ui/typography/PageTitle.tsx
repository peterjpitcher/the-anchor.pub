import { cn } from '@/lib/utils'

type PageTitleTag = 'h1' | 'h2' | 'h3'

interface PageTitleProps {
  children: React.ReactNode
  className?: string
  as?: PageTitleTag
  seo?: {
    structured?: boolean
    speakable?: boolean
  }
}

export function PageTitle({ children, className = '', as = 'h2', seo = {} }: PageTitleProps) {
  const Component = as

  return (
    <Component
      className={cn(
        'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight',
        seo.speakable && 'speakable-content',
        className
      )}
      {...(seo.structured && { itemProp: 'name headline' })}
    >
      {children}
    </Component>
  )
}
