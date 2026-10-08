import { createApiErrorResponse } from '@/lib/error-handling'

export const dynamic = 'force-dynamic'

export async function POST() {
  return createApiErrorResponse(
    'This booking address has been retired. Please use the booking button on the event page.',
    410
  )
}
