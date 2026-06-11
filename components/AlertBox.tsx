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
      container: 'bg-surface border-line',
      title: 'text-accent-text',
      content: 'text-ink'
    },
    warning: {
      container: 'bg-anchor-gold/10 border-anchor-gold/40',
      title: 'text-accent-text',
      content: 'text-ink'
    },
    success: {
      container: 'bg-anchor-success/10 border-anchor-success/30',
      title: 'text-anchor-success',
      content: 'text-ink'
    },
    error: {
      container: 'bg-anchor-danger/10 border-anchor-danger/30',
      title: 'text-anchor-danger',
      content: 'text-ink'
    },
    tip: {
      container: 'bg-surface border-line',
      title: 'text-accent-text',
      content: 'text-ink'
    }
  }

  const styles = variantStyles[variant]

  return (
    <div className={`rounded-md shadow-sm p-6 border ${styles.container} ${className}`}>
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
