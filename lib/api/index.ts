// lib/api/index.ts
// Barrel re-export — all domain modules re-exported from one place.
// This keeps all existing `import { X } from '@/lib/api'` imports working.

export * from './shared'
export * from './private-bookings'
export * from './events'
export * from './menu'
export * from './hours'
export * from './bookings'
export * from './parking'
export * from './client'
