'use client'

import { trackEmailClick } from '@/lib/gtm-events'

interface EmailLinkProps {
  email: string
  source: string
  subject?: string
  className?: string
  children?: React.ReactNode
  showIcon?: boolean
  onClick?: () => void
  role?: string
}

export function EmailLink({ 
  email, 
  source, 
  subject,
  className = '', 
  children,
  showIcon = true,
  onClick,
  role
}: EmailLinkProps) {
  const href = subject 
    ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
    : `mailto:${email}`
  
  const handleClick = () => {
    trackEmailClick({ email, source, subject })
    if (onClick) {
      onClick()
    }
  }

  return (
    <a 
      href={href} 
      className={className}
      onClick={handleClick}
      role={role}
    >
      {showIcon && ''}
      {children || email}
    </a>
  )
}
