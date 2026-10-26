'use client'

import { useEffect, useRef, type RefObject } from 'react'

/**
 * Move focus to `target` whenever `trigger` changes.
 *
 * For a screen that replaces the one the guest was using: a booking step, a
 * phase of the quick booking sheet, a confirmation. The control they pressed
 * goes with the old screen, so without this focus falls to the page body and a
 * screen reader says nothing at all (review BK-103). Point it at the new
 * screen's heading, rendered with tabIndex={-1}: the heading is read out, and
 * Tab carries on from there.
 *
 * Skipped on the first render unless `onMount` is set, so loading a page never
 * pulls focus into a form. Use `onMount` for something that only exists once
 * the change has happened, such as a confirmation card. A target that is not
 * on screen is left alone.
 */
export function useFocusOnChange(
  target: RefObject<HTMLElement | null>,
  trigger: unknown,
  options: { onMount?: boolean } = {}
): void {
  const { onMount = false } = options
  const firstRun = useRef(true)

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      if (!onMount) return
    }
    target.current?.focus()
    // The trigger is the point: the target ref and the option never change
    // what this does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])
}
