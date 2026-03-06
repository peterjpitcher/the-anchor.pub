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
    <div className="flex w-full flex-wrap flex-col items-center justify-center lg:w-auto lg:items-start lg:justify-start">
      {dateLabel && (
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60 leading-none mb-1">
          {dateLabel}
        </p>
      )}
      <StatusBar
        variant="navigation"
        className="w-full px-0 text-center text-white lg:w-auto lg:px-0 lg:text-left"
        showKitchen
      />
    </div>
  )
}
