'use client'

import { StatusBar } from '@/components/layout/StatusBar'

interface MobileHeaderStatusProps {
  showStatus?: boolean
}

export function MobileHeaderStatus({ 
  showStatus = true
}: MobileHeaderStatusProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      {showStatus && <StatusBar variant="pill" />}
    </div>
  )
}
