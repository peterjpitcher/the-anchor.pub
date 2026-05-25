'use client'

import { useState, useEffect } from 'react'
import { StatusBar } from '@/components/layout/StatusBar'

export function HeaderStatusSectionDirect() {
  const [dateLabel, setDateLabel] = useState<string>('')

  useEffect(() => {
    const now = new Date()
    setDateLabel(now.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'Europe/London'
    }))
  }, [])

  return (
    <div className="flex w-full flex-wrap flex-col items-start justify-start lg:w-auto">
      {dateLabel && (
        <p className="mb-1 text-left text-[11px] font-semibold uppercase leading-none tracking-widest text-white/60">
          {dateLabel}
        </p>
      )}
      <StatusBar
        variant="navigation"
        className="w-full px-0 text-left text-white lg:w-auto lg:px-0"
        showKitchen
      />
    </div>
  )
}
