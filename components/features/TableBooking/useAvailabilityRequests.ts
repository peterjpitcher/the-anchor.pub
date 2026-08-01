'use client'

import { useCallback, useRef, useState } from 'react'

/**
 * The one place that decides which in-flight request is still allowed to write
 * state, and which pending flag belongs to it.
 *
 * THREE things ask the network about availability:
 *
 *   1. the "Find a table" search,
 *   2. the seating-options re-read, and
 *   3. the nearest-alternatives probe.
 *
 * The first two write the same state, so only the newest may win. That used to
 * be tracked by three separate refs, and each new path wired up only some of
 * them, which is how a superseded request twice came back and overwrote a newer
 * answer (a search losing to an options change, then a re-read losing to nothing
 * at all). One generation counter and one controller means the rule is uniform
 * and symmetric: ANY new request supersedes whatever is in flight, whichever
 * kind either of them is. There is no direction left to forget.
 *
 * The third kept its own counter in the component for a while, which is exactly
 * how the first two went wrong: a second mechanism, in a second place, that a
 * new code path can forget. It lives here now. It is deliberately a SEPARATE
 * generation rather than a share of the availability one, because the two are
 * superseded by different events: typing a new date invalidates an alternatives
 * probe (the panel is about the old date) but does not abort an availability
 * search. Folding them into one counter would silently change that.
 *
 * Separate, but not independent. Starting ANY availability request supersedes
 * the alternatives too, automatically, because a probe in flight is answering
 * the previous question: its slots were affirmed for the party size and options
 * that have just changed. That used to be each caller's job, and the third
 * caller forgot, so a probe launched before a refinement came back and offered
 * inside tables to a guest who had just asked for an outside one. It happens
 * here now, once, where no new call site can miss it.
 *
 * The pending flags live here too. "Only the current request clears its own
 * spinner" is the same invariant as "only the current request writes state", and
 * splitting them across two files is what let the re-read flag stick true
 * forever, refusing every Continue with "Just checking that time is still free"
 * and nothing on screen to explain it.
 */

export type AvailabilityRequestKind = 'search' | 'revalidate'

export type AvailabilityRequestHandle = {
  generation: number
  controller: AbortController
}

export type AvailabilityRequests = {
  /** True while the current "Find a table" search is in flight. */
  availabilityLoading: boolean
  /** True while the current seating-options re-read is in flight. */
  revalidating: boolean
  /** True while the current nearest-alternatives probe is in flight. */
  alternativesLoading: boolean

  /**
   * Supersede whatever availability request is in flight, claim the next
   * generation and raise this kind's pending flag. Called by BOTH the search
   * and the re-read, which is what makes the invalidation symmetric.
   */
  beginAvailabilityRequest(kind: AvailabilityRequestKind): AvailabilityRequestHandle
  /** Whether this request still owns the outcome, checked before writing state. */
  isCurrentAvailabilityRequest(generation: number): boolean
  /**
   * Lower the pending flag if, and only if, this request still owns it. A
   * superseded run must never clear it (the newer one is still working) and must
   * never leave it set: whatever superseded it already cleared it.
   */
  finishAvailabilityRequest(generation: number): void
  /**
   * Supersede everything without starting anything: the options-change early
   * return, which clears state and waits for the guest to search again.
   */
  cancelAvailabilityRequests(): void

  /** Claim the next alternatives generation and raise its pending flag. */
  beginAlternativesRequest(): number
  /** Whether this probe still owns the alternatives panel. */
  isCurrentAlternativesRequest(generation: number): boolean
  /** Lower the alternatives flag if, and only if, this probe still owns it. */
  finishAlternativesRequest(generation: number): void
  /**
   * Invalidate any in-flight alternatives probe without starting one. Every
   * search-input change calls this, so a probe from an abandoned search context
   * cannot come back and repopulate the panel.
   */
  supersedeAlternatives(): void
  /** Invalidate and clear the panel's pending flag, for a full journey reset. */
  resetAlternatives(): void
}

export function useAvailabilityRequests(): AvailabilityRequests {
  const availabilityRequestRef = useRef<{
    generation: number
    controller: AbortController | null
    kind: AvailabilityRequestKind | null
  }>({ generation: 0, controller: null, kind: null })
  const alternativesRequestRef = useRef(0)

  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [revalidating, setRevalidating] = useState(false)
  const [alternativesLoading, setAlternativesLoading] = useState(false)

  const beginAvailabilityRequest = useCallback(
    (kind: AvailabilityRequestKind): AvailabilityRequestHandle => {
      availabilityRequestRef.current.controller?.abort()
      const controller = new AbortController()
      const generation = availabilityRequestRef.current.generation + 1
      availabilityRequestRef.current = { generation, controller, kind }
      // A probe in flight was asked the previous question. Whatever it answers
      // is about options the guest has just left behind, so it loses the panel.
      alternativesRequestRef.current += 1

      if (kind === 'revalidate') {
        setRevalidating(true)
      } else {
        // Only the re-read shows the pending note, so anything else taking over
        // has to clear it: the superseded re-read's own finish no longer owns
        // the generation and will deliberately leave it alone.
        setRevalidating(false)
        setAvailabilityLoading(true)
      }

      return { generation, controller }
    },
    []
  )

  const isCurrentAvailabilityRequest = useCallback(
    (generation: number): boolean => availabilityRequestRef.current.generation === generation,
    []
  )

  const finishAvailabilityRequest = useCallback((generation: number) => {
    if (availabilityRequestRef.current.generation !== generation) return
    if (availabilityRequestRef.current.kind === 'revalidate') {
      setRevalidating(false)
    } else {
      setAvailabilityLoading(false)
    }
  }, [])

  const cancelAvailabilityRequests = useCallback(() => {
    availabilityRequestRef.current.controller?.abort()
    availabilityRequestRef.current = {
      generation: availabilityRequestRef.current.generation + 1,
      controller: null,
      kind: null
    }
    // Same reasoning as beginAvailabilityRequest: the question has changed, so
    // any probe still in flight has lost the panel.
    alternativesRequestRef.current += 1
    setRevalidating(false)
    setAvailabilityLoading(false)
  }, [])

  const beginAlternativesRequest = useCallback((): number => {
    const generation = ++alternativesRequestRef.current
    setAlternativesLoading(true)
    return generation
  }, [])

  const isCurrentAlternativesRequest = useCallback(
    (generation: number): boolean => alternativesRequestRef.current === generation,
    []
  )

  const finishAlternativesRequest = useCallback((generation: number) => {
    // Only the latest probe resets the loading flag. Earlier in-flight probes
    // must not flip the spinner off while a newer search is loading.
    if (alternativesRequestRef.current !== generation) return
    setAlternativesLoading(false)
  }, [])

  const supersedeAlternatives = useCallback(() => {
    alternativesRequestRef.current += 1
  }, [])

  const resetAlternatives = useCallback(() => {
    alternativesRequestRef.current += 1
    setAlternativesLoading(false)
  }, [])

  return {
    availabilityLoading,
    revalidating,
    alternativesLoading,
    beginAvailabilityRequest,
    isCurrentAvailabilityRequest,
    finishAvailabilityRequest,
    cancelAvailabilityRequests,
    beginAlternativesRequest,
    isCurrentAlternativesRequest,
    finishAlternativesRequest,
    supersedeAlternatives,
    resetAlternatives
  }
}
