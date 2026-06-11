'use client'

import { StatusBar } from '@/components/layout/StatusBar'

/**
 * Live status for the desktop utility strip (redesign §5.2 / §5.6).
 * Renders the `nav` StatusBar variant — inline rows in ink on the cream strip.
 */
export function HeaderStatusSectionDirect() {
  return <StatusBar variant="nav" showKitchen />
}
