import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Register the custom font-size utilities defined in tailwind.config.ts
// (`text-display`, `text-h1`…`text-h4`, `text-script`). Without this, the
// default tailwind-merge font-size class group only knows the built-in
// `text-*` sizes, so e.g. `cn('text-h2', 'text-ink-strong')` would treat
// `text-h2` as a conflicting size and silently drop it. Registering them in
// the `font-size` group keeps custom sizes alive when combined with colour or
// other `text-*` utilities.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['display', 'h1', 'h2', 'h3', 'h4', 'script'] },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'pm' : 'am'
  const displayHours = hours % 12 || 12
  return minutes === 0 ? `${displayHours}${period}` : `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`
}

export function formatPrice(price: number, currency = ''): string {
  const formatted = price.toFixed(2)
  return currency ? `${currency} ${formatted}` : formatted
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffMins = Math.round(diffMs / 60000)
  
  if (diffMins < 0) {
    return 'past'
  }
  
  if (diffMins < 60) {
    return `${diffMins}m`
  }
  
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  
  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  
  const days = Math.floor(hours / 24)
  return days === 1 ? 'tomorrow' : `in ${days} days`
}

export function isToday(date: Date): boolean {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
}
