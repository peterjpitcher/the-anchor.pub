import { Card, CardBody } from '@/components/ui'
import type { GameNightObjection } from '@/lib/game-nights'

interface GameNightObjectionsProps {
  objections: GameNightObjection[]
  /** Lower-case game name, e.g. "quiz night". */
  gameName: string
  /**
   * Single column instead of two.
   *
   * Used when this sits in the narrow column beside the booking form, which is
   * where it lives on the game pages: the booking form is roughly three times
   * the height of the "how the night runs" card next to it, so stacking the
   * objections underneath that card fills a column that was otherwise empty,
   * and puts them level with the form rather than below it.
   */
  stack?: boolean
}

/**
 * The worries that stop someone booking, answered beside the booking form.
 *
 * These pages already had long, good FAQ sections, but an FAQ sits below the
 * decision: by the time a visitor reaches it they have either booked or left.
 * The handful of objections that actually block a booking ("we have not got a
 * full team", "can I pay by card") belong at the point of decision, so they are
 * answered here and may repeat in the FAQ below.
 */
export function GameNightObjections({
  objections,
  gameName,
  stack = false
}: GameNightObjectionsProps) {
  if (objections.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-h4 text-ink-strong">Before you book</h3>
      <div className={stack ? 'grid gap-3' : 'grid gap-3 sm:grid-cols-2'}>
        {objections.map((objection) => (
          <Card key={objection.question} accent className="h-full">
            <CardBody className="space-y-1.5">
              <p className="font-semibold text-ink-strong">{objection.question}</p>
              <p className="text-sm leading-relaxed text-ink-muted">{objection.answer}</p>
            </CardBody>
          </Card>
        ))}
      </div>
      <p className="sr-only">Common questions about {gameName} at The Anchor.</p>
    </div>
  )
}
