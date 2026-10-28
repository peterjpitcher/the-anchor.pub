/**
 * The website keeps the large-group deposit numbers for WORDING ONLY (BK-186,
 * customer bookings review of 24 October 2026). The figure a guest is quoted and
 * charged comes from the management app, so there is no local helper that works
 * a deposit out, and none may come back.
 */
import * as constants from '@/lib/constants'
import {
  LARGE_GROUP_DEPOSIT_PER_PERSON_GBP,
  LARGE_GROUP_DEPOSIT_THRESHOLD,
  ONLINE_PARTY_LIMIT,
  OVERSIZE_PARTY_COPY
} from '@/lib/constants'

describe('Large-group deposit wording numbers', () => {
  it('match the SSOT policy: 15 or more, GBP 10 a head', () => {
    expect(LARGE_GROUP_DEPOSIT_THRESHOLD).toBe(15)
    expect(LARGE_GROUP_DEPOSIT_PER_PERSON_GBP).toBe(10)
  })

  it('has no local deposit calculator any more', () => {
    expect('requiresDeposit' in constants).toBe(false)
    expect('computeLargeGroupDepositAmount' in constants).toBe(false)
  })
})

describe('the table booking party limit (owner decision D30)', () => {
  it('is 20, and a bigger group is pointed to a call and a private booking', () => {
    expect(ONLINE_PARTY_LIMIT).toBe(20)
    expect(OVERSIZE_PARTY_COPY).toBe(
      "For more than 20 guests, give us a ring on 01753 682707 and we'll look after you as a private booking."
    )
  })
})
