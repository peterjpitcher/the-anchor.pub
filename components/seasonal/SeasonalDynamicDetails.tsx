import { Card, CardBody } from '@/components/ui'
import { resolveSeasonalFields, type SeasonalDynamicFields } from '@/lib/seasonal-utils'

export interface SeasonalDynamicDetailsProps {
  /**
   * The A11 dynamic fields for this year's occasion. Any unset/blank field is
   * ignored. When NO field is set the component renders nothing, so the page
   * falls back cleanly to its evergreen base with no empty box left behind.
   */
  fields?: SeasonalDynamicFields
  /** Heading for the block. */
  heading?: string
  /** Optional intro line above the detail rows. */
  intro?: string
}

/**
 * SeasonalDynamicDetails — the shared A11 "this year's details" block used by
 * every seasonal occasion page (Easter, Mother's Day, Father's Day, Valentine's
 * & Galentine's, Halloween, New Year's Eve).
 *
 * The page body is fully evergreen. This block is the single place that surfaces
 * the annual / API-driven detail (confirmed date, theme, DJ, special menu,
 * ticket status, and so on) so the owner can refresh a year's specifics by
 * passing a small object, no rebuild of the page copy required.
 *
 * Renders null when there is nothing confirmed to show. Never invent values:
 * only pass a field when it is confirmed by the owner or the management API.
 */
export function SeasonalDynamicDetails({
  fields,
  heading = "This year's details",
  intro
}: SeasonalDynamicDetailsProps) {
  const resolved = resolveSeasonalFields(fields)

  if (!resolved.hasDetails) {
    return null
  }

  return (
    <Card accent>
      <CardBody className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-h4 text-ink-strong">{heading}</h3>
          {intro ? <p className="text-sm text-ink-muted leading-relaxed">{intro}</p> : null}
        </div>
        <dl className="divide-y divide-line">
          {resolved.details.map((detail) => (
            <div
              key={detail.label}
              className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              <dt className="text-sm font-semibold uppercase tracking-wide text-accent-text">
                {detail.label}
              </dt>
              <dd className="text-sm text-ink-strong sm:text-right">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </CardBody>
    </Card>
  )
}
