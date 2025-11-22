'use client'

import { StatusBar } from '@/components/layout/StatusBar'

export function HeaderStatusSectionDirect() {
  return (
    <div className="flex w-full flex-wrap items-center justify-center lg:w-auto lg:justify-end">
      <StatusBar
        variant="navigation"
        className="w-full px-0 text-center text-white lg:w-auto lg:px-0 lg:text-left"
        showKitchen
      />
    </div>
  )
}
