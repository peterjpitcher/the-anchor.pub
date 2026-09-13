import { CHRISTMAS_PREORDER_CUTOFF_DAYS, christmasMultipleCoursesAvailable } from '@/lib/christmas-course-deadline'

// SSOT §7, owner decision 10 September 2026: two and three courses need everyone's
// choices by noon London time seven days before the booking, so after that only the
// 1 course tier can be booked. The management app refuses a late 2 or 3 course booking;
// this is the website's copy of the same deadline, so forms stop offering it.
describe('christmasMultipleCoursesAvailable', () => {
  it('uses the seven day deadline', () => {
    expect(CHRISTMAS_PREORDER_CUTOFF_DAYS).toBe(7)
  })

  it('offers two and three courses until noon, seven days before', () => {
    // 1 December booking: the deadline is noon on 24 November. November is GMT, so noon London is 12:00Z.
    expect(christmasMultipleCoursesAvailable('2026-12-01', new Date('2026-11-24T11:59:00Z'))).toBe(true)
    expect(christmasMultipleCoursesAvailable('2026-12-01', new Date('2026-11-24T12:00:00Z'))).toBe(false)
  })

  it('is one course only for a booking less than a week away', () => {
    expect(christmasMultipleCoursesAvailable('2026-12-01', new Date('2026-11-28T09:00:00Z'))).toBe(false)
  })

  it('is decided on London time, not the server clock, across the change back to GMT', () => {
    // 30 October booking: the deadline is noon on 23 October, still BST, so noon London is 11:00Z.
    expect(christmasMultipleCoursesAvailable('2026-10-30', new Date('2026-10-23T10:59:00Z'))).toBe(true)
    expect(christmasMultipleCoursesAvailable('2026-10-30', new Date('2026-10-23T11:00:00Z'))).toBe(false)
  })

  it('leaves an unreadable date to the server', () => {
    expect(christmasMultipleCoursesAvailable('not-a-date', new Date('2026-11-28T09:00:00Z'))).toBe(true)
  })
})
