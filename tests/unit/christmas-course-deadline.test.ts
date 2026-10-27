import { christmasMultipleCoursesAvailable, lateChristmasOneCourseNote } from '@/lib/christmas-course-deadline'

// SSOT §7, owner decision 10 September 2026: two and three courses need everyone's
// choices by noon London time a set number of days before the booking. BK-150: the
// number is the management app's period setting, published as course_policy, so the
// website reads it rather than keeping its own 7.
describe('christmasMultipleCoursesAvailable', () => {
  // 1 December booking with the usual 7 days: noon on 24 November, GMT, so 12:00Z.
  const policy = { preorder_closes_at: '2026-11-24T12:00:00+00:00', multiple_courses_available: true }

  it('offers two and three courses until the published deadline', () => {
    expect(christmasMultipleCoursesAvailable(policy, new Date('2026-11-24T11:59:00Z'))).toBe(true)
    expect(christmasMultipleCoursesAvailable(policy, new Date('2026-11-24T12:00:00Z'))).toBe(false)
  })

  it('follows a changed setting rather than a fixed 7 days', () => {
    // A 10-day cutoff for 1 December closes at noon on 21 November.
    const tenDays = { preorder_closes_at: '2026-11-21T12:00:00+00:00', multiple_courses_available: true }
    expect(christmasMultipleCoursesAvailable(tenDays, new Date('2026-11-22T09:00:00Z'))).toBe(false)
  })

  it('compares instants, so the change back to GMT needs no special case', () => {
    // 30 October booking: noon on 23 October is still BST, 11:00Z.
    const bst = { preorder_closes_at: '2026-10-23T11:00:00+00:00', multiple_courses_available: true }
    expect(christmasMultipleCoursesAvailable(bst, new Date('2026-10-23T10:59:00Z'))).toBe(true)
    expect(christmasMultipleCoursesAvailable(bst, new Date('2026-10-23T11:00:00Z'))).toBe(false)
  })

  it('uses the published flag when there is no deadline time', () => {
    expect(christmasMultipleCoursesAvailable({ multiple_courses_available: false })).toBe(false)
  })

  it('leaves it to the management app when there is no policy', () => {
    expect(christmasMultipleCoursesAvailable(null)).toBe(true)
    expect(christmasMultipleCoursesAvailable(undefined)).toBe(true)
  })
})

describe('lateChristmasOneCourseNote', () => {
  it('keeps the usual wording for 7 days', () => {
    expect(lateChristmasOneCourseNote(7)).toBe(
      "Your date is less than a week away, so it's the 1 course menu, with no pre-order. Two and three courses need everyone's choices by noon, 7 days before."
    )
  })

  it('quotes another setting', () => {
    expect(lateChristmasOneCourseNote(10)).toContain('less than 10 days away')
    expect(lateChristmasOneCourseNote(10)).toContain('by noon, 10 days before')
    expect(lateChristmasOneCourseNote(1)).toContain('by noon, 1 day before')
  })

  it('names no number when it is not known', () => {
    expect(lateChristmasOneCourseNote(null)).not.toMatch(/\d+ days?/)
  })
})
