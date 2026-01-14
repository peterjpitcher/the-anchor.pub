import { createApiErrorResponse } from '@/lib/error-handling'

export const dynamic = 'force-dynamic'

export async function POST() {
  return createApiErrorResponse(
    'Event bookings are now handled via external booking links. Please use the booking button on the event page.',
    410
  )
}
