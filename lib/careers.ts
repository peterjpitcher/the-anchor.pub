export type CareerRoleSlug = 'bar-staff' | 'kitchen-team'

export type CareerRole = {
  slug: CareerRoleSlug
  active: boolean
  title: string
  schemaTitle: string
  roleOptionLabel: string
  metaTitle: string
  metaDescription: string
  summary: string
  pay: {
    baseHourly: number
    holidayPayRolledUp: boolean
    rolledUpEquivalentHourly?: number
    publicCopy: string
  }
  hours: string
  workHoursSchema: string
  requirements: string[]
  responsibilities: string[]
  training: string[]
  schemaDescriptionHtml: string
  validThrough: string
}

export const CAREERS_POSTED_DATE = '2026-05-11'
export const CAREERS_VALID_THROUGH = '2026-08-11'
export const CAREERS_CV_MAX_BYTES = 20 * 1024 * 1024
export const CAREERS_CV_ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx']
export const CAREERS_CV_ALLOWED_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
export const CAREERS_FORM_ROLES = ['bar-staff', 'kitchen-team', 'either'] as const

const barStaffRole: CareerRole = {
  slug: 'bar-staff',
  active: true,
  title: 'Bar Staff',
  schemaTitle: 'Bar Staff',
  roleOptionLabel: 'Bar Staff',
  metaTitle: 'Bar Staff Jobs | The Anchor Pub Near Heathrow',
  metaDescription:
    'Part-time bar staff role at The Anchor, Stanwell Moor. Pay from £12.71/hr plus holiday entitlement. Friday, Saturday and Sunday shifts. Apply online.',
  summary:
    'We are looking for experienced bar staff to join our team at The Anchor. This is a part-time, permanent role with shifts on Fridays, Saturdays and Sundays, with occasional weekday cover.',
  pay: {
    baseHourly: 12.71,
    holidayPayRolledUp: true,
    rolledUpEquivalentHourly: 14.24,
    publicCopy: '£12.71/hr base, equivalent to £14.24/hr including 12.07% rolled-up holiday pay',
  },
  hours: '4-16 hours per week, part-time, permanent',
  workHoursSchema: '4-16 hours per week, evenings and weekends on a rota basis',
  requirements: [
    'Minimum 1 year experience in a pub or bar environment',
    'Confident serving customers solo during quieter periods',
    'Right to work in the UK',
    'Reliable transport to and from TW19 6AQ, including for late finishes',
    'Available to work weekends on a regular basis',
  ],
  responsibilities: [
    'Serving draught beer, wine, spirits and mixed drinks',
    'Processing cash and card payments',
    'Maintaining bar cleanliness and hygiene standards',
    'Stock rotation and cellar tasks',
    'Simple food service from the kitchen',
    'Occasional event support for quiz nights, live music and karaoke',
  ],
  training: [
    'Level 2 Food Hygiene certificate',
    'Health and Safety training',
    'COSHH training',
    'Licensing awareness training',
  ],
  schemaDescriptionHtml: [
    'Bar Staff at The Anchor, an independent village pub in Stanwell Moor, Surrey, near Heathrow Airport.',
    '',
    'Pay: £12.71 per hour base rate (National Living Wage from April 2026), equivalent to £14.24 per hour including 12.07% rolled-up holiday pay.',
    '',
    'Hours: 4 to 16 hours per week, part-time and permanent. Shifts are on a rota basis: Fridays 4pm to midnight, Saturdays 12pm to 6pm or 6pm to midnight, Sundays 12pm to 5pm, with occasional weekday cover.',
    '',
    'Key duties: serving draught beer, wine, spirits and mixed drinks; processing cash and card payments; maintaining bar cleanliness and hygiene standards; stock rotation and cellar tasks; simple food service from the kitchen; occasional event support for quiz nights, live music and karaoke.',
    '',
    'Requirements: minimum 1 year experience in a pub or bar environment, confident serving customers solo during quieter periods, right to work in the UK, reliable transport to and from TW19 6AQ including for late finishes, available to work weekends on a regular basis.',
    '',
    'Training provided: Level 2 Food Hygiene, Health and Safety, COSHH, and Licensing awareness. Free staff parking on site.',
  ].join('\n'),
  validThrough: CAREERS_VALID_THROUGH,
}

const kitchenTeamRole: CareerRole = {
  slug: 'kitchen-team',
  active: true,
  title: 'Kitchen Team',
  schemaTitle: 'Kitchen Staff',
  roleOptionLabel: 'Kitchen Team',
  metaTitle: 'Kitchen Jobs | The Anchor Pub Near Heathrow',
  metaDescription:
    'Part-time kitchen role at The Anchor, Stanwell Moor. Pay from £12.71/hr plus holiday entitlement. Varying shifts including weekends. Apply online.',
  summary:
    'We are looking for experienced kitchen team members to join The Anchor. This is a part-time role with varying shifts, helping to prepare and cook pub classics, Sunday roasts and event menus.',
  pay: {
    baseHourly: 12.71,
    holidayPayRolledUp: true,
    rolledUpEquivalentHourly: 14.24,
    publicCopy: '£12.71/hr base, equivalent to £14.24/hr including 12.07% rolled-up holiday pay',
  },
  hours: 'Part-time, varying shifts',
  workHoursSchema: 'Part-time, varying shifts including weekends',
  requirements: [
    'Minimum 1 year experience in a commercial kitchen',
    'Right to work in the UK',
    'Reliable transport to and from TW19 6AQ',
  ],
  responsibilities: [
    'Food preparation and cooking to a consistent standard',
    'Preparing pub classics, Sunday roasts and event menus',
    'Maintaining kitchen hygiene and food safety standards',
  ],
  training: [
    'Level 2 Food Hygiene certificate',
    'Health and Safety training',
    'COSHH training',
  ],
  schemaDescriptionHtml: [
    'Kitchen Staff at The Anchor, an independent village pub in Stanwell Moor, Surrey, near Heathrow Airport.',
    '',
    'Pay: £12.71 per hour base rate (National Living Wage from April 2026), equivalent to £14.24 per hour including 12.07% rolled-up holiday pay.',
    '',
    'Hours: part-time with varying shifts including weekends.',
    '',
    'Key duties: food preparation and cooking to a consistent standard; preparing pub classics, Sunday roasts and event menus; maintaining kitchen hygiene and food safety standards.',
    '',
    'Requirements: minimum 1 year experience in a commercial kitchen, right to work in the UK, reliable transport to and from TW19 6AQ.',
    '',
    'Training provided: Level 2 Food Hygiene, Health and Safety, and COSHH certificates. Free staff parking on site.',
  ].join('\n'),
  validThrough: CAREERS_VALID_THROUGH,
}

export const CAREER_ROLES: CareerRole[] = [barStaffRole, kitchenTeamRole]

export function getActiveCareerRoles(): CareerRole[] {
  return CAREER_ROLES.filter((role) => role.active)
}

export function getCareerRole(slug: string): CareerRole | undefined {
  return CAREER_ROLES.find((role) => role.slug === slug)
}

export function buildJobPostingSchema(role: CareerRole): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: role.schemaTitle,
    description: role.schemaDescriptionHtml,
    identifier: {
      '@type': 'PropertyValue',
      name: 'The Anchor',
      value: `the-anchor-${role.slug}-${CAREERS_POSTED_DATE}`,
    },
    datePosted: CAREERS_POSTED_DATE,
    validThrough: role.validThrough,
    employmentType: 'PART_TIME',
    hiringOrganization: {
      '@type': 'Restaurant',
      '@id': 'https://www.the-anchor.pub/#business',
      name: 'The Anchor',
      sameAs: 'https://www.the-anchor.pub',
      logo: 'https://www.the-anchor.pub/images/branding/the-anchor-pub-logo-black-transparent.png',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Horton Road',
        addressLocality: 'Stanwell Moor',
        addressRegion: 'Surrey',
        postalCode: 'TW19 6AQ',
        addressCountry: 'GB',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 51.462509,
        longitude: -0.502067,
      },
    },
    workHours: role.workHoursSchema,
    directApply: true,
    experienceRequirements: {
      '@type': 'OccupationalExperienceRequirements',
      monthsOfExperience: 12,
    },
    qualifications: role.requirements.join(' '),
    responsibilities: role.responsibilities.join(' '),
    jobBenefits: [
      'Free staff parking on site',
      'Training provided (Level 2 Food Hygiene, Health and Safety, COSHH)',
      'Shifts planned up to two months in advance',
      'Overtime available',
    ].join(', '),
  }

  if (role.pay.baseHourly && role.pay.holidayPayRolledUp) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: 'GBP',
      value: {
        '@type': 'QuantitativeValue',
        value: role.pay.baseHourly,
        unitText: 'HOUR',
      },
    }
  }

  return schema
}

export function formatCareerPay(role: CareerRole): string {
  if (role.pay.holidayPayRolledUp && role.pay.rolledUpEquivalentHourly) {
    return `£${role.pay.baseHourly.toFixed(2)}/hr base, equivalent to £${role.pay.rolledUpEquivalentHourly.toFixed(2)}/hr including rolled-up holiday pay`
  }
  return `From £${role.pay.baseHourly.toFixed(2)}/hr, plus holiday entitlement`
}
