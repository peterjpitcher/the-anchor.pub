// Deprecated. Superseded by `components/ui/SectionHeading` (redesign spec §4.5).
// Kept only as a thin alias so any stray reference still resolves; the canonical
// component accepts the old `eyebrow`/`subtitle`/`description`/`align` props.
// Scheduled for deletion in Phase 6.
import { SectionHeading, type SectionHeadingProps } from './ui/SectionHeading'

/** @deprecated use `SectionHeading` from `@/components/ui` */
export type SectionHeaderProps = SectionHeadingProps

/** @deprecated use `SectionHeading` from `@/components/ui` */
export const SectionHeader = SectionHeading
