import { Event } from '@/lib/api'

// Extends Event with flags used purely for rendering (not persisted by the API)
export type DisplayEvent = Event & {
  isTimeChange?: boolean
  timeChangeNote?: string | null
  timeChangeStatus?: string | null
  timeChangeOpens?: string | null
  timeChangeCloses?: string | null
  timeChangeDate?: string | null
  timeChangeRangeEnd?: string | null
}
