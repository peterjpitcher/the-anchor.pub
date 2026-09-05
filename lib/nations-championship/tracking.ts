'use client'
import { dispatchTrackingEvent } from '@/lib/tracking/dispatcher'

type NationsEvent = 'select_fixture' | 'filter_fixtures' | 'book_rugby_click' | 'add_to_calendar'
export type NationsEventPayload = {
  fixture_id?: string
  fixture_name?: string
  kickoff?: string
  screening_status?: string
  cta_location?: string
  filter_type?: string
  filter_value?: string
}
export function trackNationsEvent(event: NationsEvent, payload: NationsEventPayload): void {
  dispatchTrackingEvent({ event, competition: 'nations-championship', ...payload })
}
