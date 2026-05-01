interface AlertBoxProps {
  title?: string
  content: React.ReactNode
  variant?: 'info' | 'warning' | 'success' | 'error' | 'tip'
  className?: string
}

export function AlertBox({ 
  title, 
  content, 
  variant = 'info',
  className = '' 
}: AlertBoxProps) {
  const variantStyles = {
    info: {
      container: 'bg-anchor-bg-card border-anchor-gold/25',
      title: 'text-anchor-gold-vivid',
      content: 'text-anchor-cream-text/75'
    },
    warning: {
      container: 'bg-amber-500/10 border-amber-500/30',
      title: 'text-amber-300',
      content: 'text-anchor-cream-text/75'
    },
    success: {
      container: 'bg-emerald-500/10 border-emerald-500/30',
      title: 'text-emerald-300',
      content: 'text-anchor-cream-text/75'
    },
    error: {
      container: 'bg-red-500/10 border-red-500/30',
      title: 'text-red-300',
      content: 'text-anchor-cream-text/75'
    },
    tip: {
      container: 'bg-anchor-bg-card border-anchor-gold/25',
      title: 'text-anchor-gold-vivid',
      content: 'text-anchor-cream-text/75'
    }
  }

  const styles = variantStyles[variant]

  return (
    <div className={`rounded-none p-6 border ${styles.container} ${className}`}>
      {title && (
        <h3 className={`text-lg font-bold mb-2 ${styles.title}`}>
          {title}
        </h3>
      )}
      <div className={`${styles.content}`}>
        {content}
      </div>
    </div>
  )
}
