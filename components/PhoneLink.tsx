'use client'

import { trackPhoneCallClick } from '@/lib/gtm-events'

interface PhoneLinkProps {
  phone: string
  source: string
  className?: string
  children?: React.ReactNode
  showIcon?: boolean
  onClick?: () => void
  role?: string
}

export function PhoneLink({ 
  phone, 
  source, 
  className = '', 
  children,
  showIcon = true,
  onClick,
  role
}: PhoneLinkProps) {
  // Convert UK phone number to international format for tel: links
  const formattedPhone = phone.replace(/\s/g, '').replace(/^01753/, '+441753')
  
  const handleClick = () => {
    trackPhoneCallClick({ phone, source })
    if (onClick) {
      onClick()
    }
  }

  return (
    <a 
      href={`tel:${formattedPhone}`} 
      className={className}
      onClick={handleClick}
      role={role}
    >
      {showIcon && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="inline-block w-4 h-4 mr-1 align-text-bottom"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
        </svg>
      )}
      {children || phone}
    </a>
  )
}
