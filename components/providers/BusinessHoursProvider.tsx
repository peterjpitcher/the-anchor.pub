'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useBusinessHours } from '@/hooks/useBusinessHours'

const BusinessHoursContext = createContext<ReturnType<typeof useBusinessHours> | null>(null)

interface BusinessHoursProviderProps {
  children: ReactNode
  apiEndpoint?: string
}

export function BusinessHoursProvider({
  children,
  apiEndpoint = '/api/business/hours'
}: BusinessHoursProviderProps) {
  const value = useBusinessHours({ apiEndpoint })

  return (
    <BusinessHoursContext.Provider value={value}>
      {children}
    </BusinessHoursContext.Provider>
  )
}

export function useBusinessHoursContext() {
  return useContext(BusinessHoursContext)
}
