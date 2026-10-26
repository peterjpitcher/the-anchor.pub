'use client'

import { Alert } from '@/components/ui/feedback/Alert'
import { preorderNotSavedCopy, type BookingPreorderOutcome } from '@/lib/table-booking/submission'

/**
 * Says so when the food choices sent with a booking did not save (BK-059).
 *
 * Shown on the confirmation card and on the deposit screen, because every
 * Christmas booking takes a deposit and so lands on the deposit screen first.
 * Renders nothing when the choices saved, when none were sent, or when an older
 * management build gives no answer.
 */
export function PreorderNotSavedNotice({ preorder }: { preorder?: BookingPreorderOutcome | null }) {
  const copy = preorderNotSavedCopy(preorder)
  if (!copy) return null
  return (
    <Alert variant="warning" title="Your food choices didn't save" className="text-left">
      <p>{copy}</p>
    </Alert>
  )
}
