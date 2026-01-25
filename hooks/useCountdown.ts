'use client'

import { useEffect, useState } from 'react'

export type CountdownState = {
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
}

export function computeCountdown(targetMs: number, nowMs: number = Date.now()): CountdownState {
  const diff = targetMs - nowMs

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  }

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / (60 * 60 * 24))
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60))
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, expired: false }
}

export function useCountdown(targetMs: number, enabled: boolean) {
  const [countdown, setCountdown] = useState<CountdownState>(() => computeCountdown(targetMs))

  useEffect(() => {
    if (!enabled) return

    const tick = () => setCountdown(computeCountdown(targetMs))
    tick()

    const intervalId = window.setInterval(tick, 1000)
    return () => window.clearInterval(intervalId)
  }, [targetMs, enabled])

  return countdown
}

