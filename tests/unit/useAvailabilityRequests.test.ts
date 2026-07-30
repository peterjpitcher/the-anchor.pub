import { act, renderHook } from '@testing-library/react'
import { useAvailabilityRequests } from '@/components/features/TableBooking/useAvailabilityRequests'

/**
 * The booking form's one guarantee about racing network answers: a request that
 * something newer has superseded may never write state, and may never clear a
 * spinner that now belongs to somebody else.
 *
 * These assertions used to be unwritable. The guards lived as three bare refs
 * inside a 3,000-line component, so the only way to reach them was to mount the
 * whole form and win a race against jsdom's render ordering; a previous attempt
 * gave up and left the nearest-alternatives guard covered by "provable by code
 * inspection" alone (see the skipped block in ManagementTableBookingForm.test).
 * With the guards in one hook, the same questions are three lines each.
 */
describe('useAvailabilityRequests', () => {
  describe('the availability request', () => {
    it('lets a newer request supersede whichever kind is in flight', () => {
      const { result } = renderHook(() => useAvailabilityRequests())

      let search!: { generation: number; controller: AbortController }
      act(() => {
        search = result.current.beginAvailabilityRequest('search')
      })
      expect(result.current.isCurrentAvailabilityRequest(search.generation)).toBe(true)

      let reread!: { generation: number; controller: AbortController }
      act(() => {
        reread = result.current.beginAvailabilityRequest('revalidate')
      })

      // The search has lost, and been aborted rather than left running.
      expect(result.current.isCurrentAvailabilityRequest(search.generation)).toBe(false)
      expect(search.controller.signal.aborted).toBe(true)
      expect(result.current.isCurrentAvailabilityRequest(reread.generation)).toBe(true)

      // And symmetrically: a search supersedes a re-read too.
      let secondSearch!: { generation: number; controller: AbortController }
      act(() => {
        secondSearch = result.current.beginAvailabilityRequest('search')
      })
      expect(result.current.isCurrentAvailabilityRequest(reread.generation)).toBe(false)
      expect(reread.controller.signal.aborted).toBe(true)
      expect(result.current.isCurrentAvailabilityRequest(secondSearch.generation)).toBe(true)
    })

    it('cancels everything in flight without starting anything', () => {
      const { result } = renderHook(() => useAvailabilityRequests())

      let inFlight!: { generation: number; controller: AbortController }
      act(() => {
        inFlight = result.current.beginAvailabilityRequest('revalidate')
      })
      act(() => {
        result.current.cancelAvailabilityRequests()
      })

      expect(result.current.isCurrentAvailabilityRequest(inFlight.generation)).toBe(false)
      expect(inFlight.controller.signal.aborted).toBe(true)
      expect(result.current.revalidating).toBe(false)
      expect(result.current.availabilityLoading).toBe(false)
    })

    it('raises the pending flag that belongs to the kind of request started', () => {
      const { result } = renderHook(() => useAvailabilityRequests())

      act(() => {
        result.current.beginAvailabilityRequest('search')
      })
      expect(result.current.availabilityLoading).toBe(true)
      expect(result.current.revalidating).toBe(false)

      act(() => {
        result.current.beginAvailabilityRequest('revalidate')
      })
      expect(result.current.revalidating).toBe(true)
    })

    it('clears the re-read note when a search takes over, so Continue is never blocked forever', () => {
      const { result } = renderHook(() => useAvailabilityRequests())

      let reread!: { generation: number }
      act(() => {
        reread = result.current.beginAvailabilityRequest('revalidate')
      })
      expect(result.current.revalidating).toBe(true)

      act(() => {
        result.current.beginAvailabilityRequest('search')
      })
      expect(result.current.revalidating).toBe(false)

      // The superseded re-read settling later must not touch the flag either
      // way: the search owns it now.
      act(() => {
        result.current.finishAvailabilityRequest(reread.generation)
      })
      expect(result.current.availabilityLoading).toBe(true)
    })

    it('lets only the current request lower its own pending flag', () => {
      const { result } = renderHook(() => useAvailabilityRequests())

      let first!: { generation: number }
      act(() => {
        first = result.current.beginAvailabilityRequest('search')
      })
      let second!: { generation: number }
      act(() => {
        second = result.current.beginAvailabilityRequest('search')
      })

      act(() => {
        result.current.finishAvailabilityRequest(first.generation)
      })
      // The superseded search must not switch the spinner off: the newer search
      // is still running and the guest would be told nothing was happening.
      expect(result.current.availabilityLoading).toBe(true)

      act(() => {
        result.current.finishAvailabilityRequest(second.generation)
      })
      expect(result.current.availabilityLoading).toBe(false)
    })
  })

  describe('the nearest-alternatives probe', () => {
    it('refuses to let a superseded probe write the panel', () => {
      const { result } = renderHook(() => useAvailabilityRequests())

      let probe!: number
      act(() => {
        probe = result.current.beginAlternativesRequest()
      })
      expect(result.current.isCurrentAlternativesRequest(probe)).toBe(true)

      // A search input changed while the probe was in flight. Its answer is
      // about the abandoned search, so it may not repopulate the panel.
      act(() => {
        result.current.supersedeAlternatives()
      })
      expect(result.current.isCurrentAlternativesRequest(probe)).toBe(false)
    })

    it('refuses to let a superseded probe write when a newer probe has started', () => {
      const { result } = renderHook(() => useAvailabilityRequests())

      let first!: number
      act(() => {
        first = result.current.beginAlternativesRequest()
      })
      let second!: number
      act(() => {
        second = result.current.beginAlternativesRequest()
      })

      expect(result.current.isCurrentAlternativesRequest(first)).toBe(false)
      expect(result.current.isCurrentAlternativesRequest(second)).toBe(true)
    })

    it('lets only the current probe lower the panel spinner', () => {
      const { result } = renderHook(() => useAvailabilityRequests())

      let first!: number
      act(() => {
        first = result.current.beginAlternativesRequest()
      })
      let second!: number
      act(() => {
        second = result.current.beginAlternativesRequest()
      })

      act(() => {
        result.current.finishAlternativesRequest(first)
      })
      expect(result.current.alternativesLoading).toBe(true)

      act(() => {
        result.current.finishAlternativesRequest(second)
      })
      expect(result.current.alternativesLoading).toBe(false)
    })

    it('clears the panel spinner on a journey reset', () => {
      const { result } = renderHook(() => useAvailabilityRequests())

      let probe!: number
      act(() => {
        probe = result.current.beginAlternativesRequest()
      })
      act(() => {
        result.current.resetAlternatives()
      })

      expect(result.current.isCurrentAlternativesRequest(probe)).toBe(false)
      expect(result.current.alternativesLoading).toBe(false)
    })
  })

  describe('the two generations stay independent', () => {
    it('superseding alternatives does not abort or supersede the availability request', () => {
      const { result } = renderHook(() => useAvailabilityRequests())

      let search!: { generation: number; controller: AbortController }
      act(() => {
        search = result.current.beginAvailabilityRequest('search')
      })
      act(() => {
        result.current.supersedeAlternatives()
      })

      // Typing a new date invalidates a probe about the old date. It must NOT
      // kill the availability search: nothing in the form restarts one, and the
      // guest would be left on a spinner that never resolves.
      expect(result.current.isCurrentAvailabilityRequest(search.generation)).toBe(true)
      expect(search.controller.signal.aborted).toBe(false)
    })

    it('starting an availability request does not invalidate the probe it is about to start', () => {
      const { result } = renderHook(() => useAvailabilityRequests())

      let probe!: number
      act(() => {
        result.current.beginAvailabilityRequest('search')
        probe = result.current.beginAlternativesRequest()
      })

      expect(result.current.isCurrentAlternativesRequest(probe)).toBe(true)
    })
  })
})
