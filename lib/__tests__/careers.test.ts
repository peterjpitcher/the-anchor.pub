/**
 * Tests for lib/careers.ts — schema builder, role helpers, and pay formatting.
 */

import {
  buildJobPostingSchema,
  getActiveCareerRoles,
  getCareerRole,
  formatCareerPay,
  CAREER_ROLES,
  type CareerRole,
} from '@/lib/careers'

// ── buildJobPostingSchema ────────────────────────────────────────────────────

describe('buildJobPostingSchema', () => {
  const barStaff = CAREER_ROLES.find((r) => r.slug === 'bar-staff')!
  const kitchenTeam = CAREER_ROLES.find((r) => r.slug === 'kitchen-team')!

  it('should use #business in hiringOrganization @id', () => {
    const schema = buildJobPostingSchema(barStaff)
    const org = schema.hiringOrganization as Record<string, unknown>
    expect(org['@id']).toBe('https://www.the-anchor.pub/#business')
  })

  it('should use the correct logo path', () => {
    const schema = buildJobPostingSchema(barStaff)
    const org = schema.hiringOrganization as Record<string, unknown>
    expect(org.logo).toBe(
      'https://www.the-anchor.pub/images/branding/the-anchor-pub-logo-black-transparent.png'
    )
  })

  it('should not include jobLocationType', () => {
    const schema = buildJobPostingSchema(barStaff)
    expect(schema).not.toHaveProperty('jobLocationType')
  })

  it('should include baseSalary when baseHourly is set and holidayPayRolledUp is true', () => {
    // barStaff has both set
    const schema = buildJobPostingSchema(barStaff)
    expect(schema.baseSalary).toBeDefined()

    const salary = schema.baseSalary as Record<string, unknown>
    expect(salary['@type']).toBe('MonetaryAmount')
    expect(salary.currency).toBe('GBP')

    const value = salary.value as Record<string, unknown>
    expect(value['@type']).toBe('QuantitativeValue')
    expect(value.value).toBe(barStaff.pay.baseHourly)
    expect(value.unitText).toBe('HOUR')
  })

  it('should not include baseSalary when baseHourly is zero', () => {
    const roleWithZeroPay: CareerRole = {
      ...barStaff,
      pay: {
        ...barStaff.pay,
        baseHourly: 0,
        holidayPayRolledUp: true,
      },
    }
    const schema = buildJobPostingSchema(roleWithZeroPay)
    expect(schema.baseSalary).toBeUndefined()
  })

  it('should not include baseSalary when holidayPayRolledUp is false', () => {
    const roleNotRolledUp: CareerRole = {
      ...barStaff,
      pay: {
        ...barStaff.pay,
        baseHourly: 12.71,
        holidayPayRolledUp: false,
      },
    }
    const schema = buildJobPostingSchema(roleNotRolledUp)
    expect(schema.baseSalary).toBeUndefined()
  })

  it('should include one role per schema object (title matches role)', () => {
    const barSchema = buildJobPostingSchema(barStaff)
    expect(barSchema.title).toBe(barStaff.schemaTitle)

    const kitchenSchema = buildJobPostingSchema(kitchenTeam)
    expect(kitchenSchema.title).toBe(kitchenTeam.schemaTitle)

    // Different roles produce different titles
    expect(barSchema.title).not.toBe(kitchenSchema.title)
  })

  it('should include description that contains core facts visible on page', () => {
    const schema = buildJobPostingSchema(barStaff)
    const description = schema.description as string

    // Should mention the pub name, location, and pay info
    expect(description).toContain('The Anchor')
    expect(description).toContain('Stanwell Moor')
    expect(description).toContain(String(barStaff.pay.baseHourly))
  })
})

// ── getActiveCareerRoles ─────────────────────────────────────────────────────

describe('getActiveCareerRoles', () => {
  it('should return only active roles', () => {
    const active = getActiveCareerRoles()
    expect(active.length).toBeGreaterThan(0)
    for (const role of active) {
      expect(role.active).toBe(true)
    }
  })

  it('should return all currently active roles', () => {
    const active = getActiveCareerRoles()
    const expectedActiveCount = CAREER_ROLES.filter((r) => r.active).length
    expect(active).toHaveLength(expectedActiveCount)
  })
})

// ── getCareerRole ────────────────────────────────────────────────────────────

describe('getCareerRole', () => {
  it('should return the correct role for a valid slug', () => {
    const role = getCareerRole('bar-staff')
    expect(role).toBeDefined()
    expect(role!.slug).toBe('bar-staff')
  })

  it('should return undefined for an invalid slug', () => {
    const role = getCareerRole('ceo')
    expect(role).toBeUndefined()
  })
})

// ── formatCareerPay ──────────────────────────────────────────────────────────

describe('formatCareerPay', () => {
  it('should show rolled-up equivalent when confirmed', () => {
    const barStaff = CAREER_ROLES.find((r) => r.slug === 'bar-staff')!
    const formatted = formatCareerPay(barStaff)

    // Should include both the base rate and the rolled-up equivalent
    expect(formatted).toContain(
      `£${barStaff.pay.baseHourly.toFixed(2)}/hr`
    )
    expect(formatted).toContain('rolled-up holiday pay')
    expect(formatted).toContain(
      `£${barStaff.pay.rolledUpEquivalentHourly!.toFixed(2)}/hr`
    )
  })

  it('should show base pay only when holidayPayRolledUp is false', () => {
    const roleNotRolledUp: CareerRole = {
      ...CAREER_ROLES[0],
      pay: {
        ...CAREER_ROLES[0].pay,
        baseHourly: 12.71,
        holidayPayRolledUp: false,
      },
    }
    const formatted = formatCareerPay(roleNotRolledUp)

    expect(formatted).toContain('£12.71/hr')
    expect(formatted).toContain('plus holiday entitlement')
    expect(formatted).not.toContain('rolled-up')
  })
})
