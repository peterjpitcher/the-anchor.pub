/**
 * Boundary tests for the website-side large-group deposit helpers.
 *
 * Walk-in launch (spec §6, §7.3): the website-side rule is purely
 * party-size based. There is no Sunday-lunch deposit, no Saturday-1pm
 * cutoff, and no per-day deposit policy on the website. The management
 * app owns the canonical state-aware deposit calculation; the website
 * just gates UI on the party-size threshold.
 *
 * The threshold is set in `lib/constants.ts` via LARGE_GROUP_DEPOSIT_THRESHOLD
 * (10) and the per-person rate via LARGE_GROUP_DEPOSIT_PER_PERSON_GBP (10).
 */
import {
  LARGE_GROUP_DEPOSIT_PER_PERSON_GBP,
  LARGE_GROUP_DEPOSIT_THRESHOLD,
  computeLargeGroupDepositAmount,
  requiresDeposit
} from '@/lib/constants'

describe('Large-group deposit helpers', () => {
  describe('requiresDeposit', () => {
    it('returns false at party size 1', () => {
      expect(requiresDeposit(1)).toBe(false)
    })

    it('returns false at party size 9 (just below threshold)', () => {
      expect(requiresDeposit(9)).toBe(false)
    })

    it('returns true at party size 10 (the boundary)', () => {
      expect(requiresDeposit(10)).toBe(true)
    })

    it('returns true at party size 11 (just above threshold)', () => {
      expect(requiresDeposit(11)).toBe(true)
    })

    it('returns true at party size 50', () => {
      expect(requiresDeposit(50)).toBe(true)
    })

    it('matches the threshold constant', () => {
      expect(requiresDeposit(LARGE_GROUP_DEPOSIT_THRESHOLD)).toBe(true)
      expect(requiresDeposit(LARGE_GROUP_DEPOSIT_THRESHOLD - 1)).toBe(false)
    })
  })

  describe('computeLargeGroupDepositAmount', () => {
    it('returns 0 at party size 1 (below threshold)', () => {
      expect(computeLargeGroupDepositAmount(1)).toBe(0)
    })

    it('returns 0 at party size 9 (below threshold)', () => {
      expect(computeLargeGroupDepositAmount(9)).toBe(0)
    })

    it('returns £100 at party size 10 (boundary; £10 per person)', () => {
      expect(computeLargeGroupDepositAmount(10)).toBe(100)
    })

    it('returns £110 at party size 11', () => {
      expect(computeLargeGroupDepositAmount(11)).toBe(110)
    })

    it('returns £500 at party size 50', () => {
      expect(computeLargeGroupDepositAmount(50)).toBe(500)
    })

    it('uses the configured per-person rate', () => {
      // £10 per head currently; this also documents the unit so a future
      // rate change has to be a deliberate update to this assertion.
      expect(LARGE_GROUP_DEPOSIT_PER_PERSON_GBP).toBe(10)
    })

    it('handles non-finite party size defensively (returns 0, no deposit gating)', () => {
      // computeLargeGroupDepositAmount short-circuits via requiresDeposit
      // for unreasonable inputs; the contract is "no deposit if not required".
      expect(computeLargeGroupDepositAmount(Number.NaN)).toBe(0)
      expect(computeLargeGroupDepositAmount(-1)).toBe(0)
    })
  })
})
