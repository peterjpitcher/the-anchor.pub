import { Card, CardBody } from '@/components/ui/layout/Card'

/**
 * What /book-table shows in the booking form's place until the browser has
 * drawn the form.
 *
 * The form reads the address (date, party size, a game to book for) in the
 * browser so the page can be cached, and Next.js renders such a component in
 * the browser only (review BK-200). This keeps the form's space and heading so
 * the page does not jump when it arrives. The phone number is beside the form
 * on the page already, so it is not repeated here.
 */
export function BookingFormFallback() {
  return (
    <div className="mx-auto">
      <Card accent>
        <CardBody className="min-h-[28rem] space-y-2">
          <p className="font-display text-h4 text-ink-strong">Find a table</p>
          <p role="status" className="text-sm text-ink-muted">
            Getting the booking form ready...
          </p>
        </CardBody>
      </Card>
    </div>
  )
}
