export type RecruitmentRoleValue = 'Bar Staff' | 'Kitchen Team' | 'Either role' | 'Not sure yet'

export type RoleSlug = 'bar-staff' | 'kitchen-team'

export const recruitmentDatePosted = '2026-05-12'
// JobPosting validity. Google can drop postings whose validThrough has passed,
// so keep this ~1 year ahead and bump it alongside recruitmentDatePosted when
// the recruitment pages are refreshed.
export const recruitmentValidThrough = '2027-05-12'

export const recruitmentRoleOptions: RecruitmentRoleValue[] = [
  'Bar Staff',
  'Kitchen Team',
  'Either role',
  'Not sure yet'
]

export const availabilityOptions = [
  'Weekday daytime',
  'Weekday evenings',
  'Friday evenings',
  'Saturdays',
  'Sundays',
  'Bank holidays',
  'Flexible'
]

export const experienceOptions = [
  'Yes',
  'No',
  'Not sure, but I have related experience'
]

export const startDateOptions = [
  'Immediately',
  'Within 1 week',
  'Within 2 weeks',
  'Within 1 month',
  'Other'
]

export const quickFacts = [
  { label: 'Roles', value: 'Bar Staff, Kitchen Team' },
  { label: 'Pay', value: '£12.71 per hour base rate' },
  {
    label: 'Holiday pay',
    value: 'Handled in line with current UK holiday pay rules and clearly shown in contracts and payslips'
  },
  { label: 'Hours', value: 'Part-time, mainly evenings and weekends' },
  { label: 'Location', value: 'The Anchor, Horton Road, Stanwell Moor Village, TW19 6AQ' },
  { label: 'Parking', value: 'Free on-site parking' },
  { label: 'Experience', value: 'Minimum 1 year preferred' },
  { label: 'Contract', value: 'Part-time, permanent' },
  {
    label: 'Best fit',
    value: 'Reliable, experienced, friendly people who care about service and standards'
  }
]

export const mainRoleCards = [
  {
    title: 'Bar Staff',
    href: '/join-our-team/bar-staff',
    description:
      'Part-time bar work in a friendly, owner-managed village pub near Heathrow. This role suits someone with previous bar or hospitality experience who is confident with customers, reliable on shifts and comfortable working as part of a small team.',
    outcome: 'You will help deliver warm service, well-kept drinks, a clean bar and a positive guest experience.',
    cta: 'View Bar Staff Role'
  },
  {
    title: 'Kitchen Team',
    href: '/join-our-team/kitchen-team',
    description:
      'Part-time kitchen work supporting our pub menu, Sunday roasts, event food and private bookings. This role suits someone with previous kitchen, catering or food service experience who works cleanly, safely and consistently.',
    outcome:
      'You will help maintain high standards of cleanliness, food safety, preparation, presentation and quality.',
    cta: 'View Kitchen Team Role'
  }
]

export const workBenefits = [
  'regular part-time shifts where possible',
  'clear expectations from the start',
  'free on-site parking',
  'required training provided',
  'proper contracts, payslips and clear pay information',
  'a small team where your contribution matters',
  'a pub that is actively investing in quality, service, events and growth'
]

export const strongCandidateTraits = [
  'take pride in giving guests a brilliant experience',
  'understand that small details matter',
  'can deliver the basics consistently, even when it is busy',
  'are friendly, calm and confident with customers',
  'notice what needs doing without always being asked',
  'care about cleanliness, presentation and standards',
  'are comfortable working in a small team',
  'want to be part of a pub that is actively growing and improving',
  'understand that evenings, weekends and events are part of pub life'
]

export const roleExpectations = [
  'turning up on time and ready to work',
  'being friendly and professional with guests',
  'keeping working areas clean and organised',
  'following instructions and agreed standards',
  'communicating clearly with the team',
  'staying calm during busy periods',
  'using initiative during quieter periods',
  'treating food safety, hygiene and service standards seriously',
  'helping create the kind of experience guests want to come back for'
]

export const poorFitSignals = [
  'you are looking for short-term or casual-only work',
  'you cannot reliably get to and from TW19 6AQ',
  'you need Monday to Friday daytime-only work',
  'you cannot work regular evenings or weekends',
  'you are not comfortable working independently during quieter periods',
  'you do not enjoy working to clear standards',
  'you are not willing to take cleanliness, food safety or guest service seriously',
  'you need a large corporate team structure'
]

export const recruitmentFaqs = [
  {
    question: 'Do I need previous experience?',
    answer:
      'Previous experience is strongly preferred. For bar roles, this could be pub, bar, restaurant or hospitality experience. For kitchen roles, this could be pub kitchen, restaurant, catering or food preparation experience.'
  },
  {
    question: 'Do I need a CV?',
    answer:
      'No. A CV is helpful, but not required. If you do not have a CV, please tell us about your experience in the application form.'
  },
  {
    question: 'Is parking available?',
    answer: 'Yes. We have free on-site parking.'
  },
  {
    question: 'What hours are available?',
    answer:
      'The roles are part-time and mainly involve evenings, weekends, events and occasional bank holidays.'
  },
  {
    question: 'Can I apply if I only want weekday daytime shifts?',
    answer: 'Probably not. Most of our available shifts are evenings and weekends.'
  },
  {
    question: 'Where is The Anchor?',
    answer:
      'The Anchor is in Stanwell Moor Village, close to Heathrow Terminal 5, Staines, Ashford, Hounslow and Feltham.'
  }
]

export type RecruitmentRolePage = {
  slug: RoleSlug
  role: RecruitmentRoleValue
  title: string
  metaTitle: string
  metaDescription: string
  heroTitle: string
  heroIntro: string[]
  image: {
    src: string
    alt: string
  }
  aboutTitle: string
  about: string[]
  shiftsTitle: string
  shifts: string[]
  dutiesTitle: string
  dutiesIntro: string
  duties: string[]
  standardsTitle?: string
  standardsIntro?: string
  standards?: string[]
  lookingFor: string[]
  niceToHave: string[]
  expectationIntro: string
  jobPostingDescription: string
  workHours: string
}

export const recruitmentRolePages: Record<RoleSlug, RecruitmentRolePage> = {
  'bar-staff': {
    slug: 'bar-staff',
    role: 'Bar Staff',
    title: 'Bar Staff',
    metaTitle: 'Bar Staff Jobs Near Heathrow | The Anchor Stanwell Moor',
    metaDescription:
      'Part-time bar staff jobs in Stanwell Moor near Heathrow. For reliable people who care about looking after guests. Free parking on shift.',
    heroTitle: 'Bar Staff Jobs Near Heathrow',
    heroIntro: [
      'We are looking for experienced, reliable bar staff to join our small team at The Anchor in Stanwell Moor.',
      'This role is about more than serving drinks. Our bar team helps create the guest experience from the moment someone walks in, whether they are a regular local, a family coming for food, a group joining us for an event, or visitors staying near Heathrow.',
      'You will need to be friendly, confident, practical and able to keep high standards even when the pub is busy.'
    ],
    image: {
      src: '/images/our-pub/the-anchor-main-bar-area.jpg',
      alt: 'The Anchor main bar area in Stanwell Moor near Heathrow'
    },
    aboutTitle: 'About the role',
    about: [
      'Our bar team plays a major part in the guest experience at The Anchor. This is not just about serving drinks. It is about creating a warm welcome, keeping the bar running properly, and making sure every guest feels looked after.',
      'You will be part of a small team, so reliability, initiative and attention to detail matter. During quieter shifts, you may be trusted to work independently once trained. During busy services and events, you will need to stay calm, organised and guest-focused.'
    ],
    shiftsTitle: 'Typical shifts',
    shifts: [
      'Friday evenings',
      'Saturday daytime or evening shifts',
      'Sunday roast or evening shifts',
      'weekday evening cover',
      'event nights such as quiz nights, music bingo, karaoke and private bookings',
      'occasional bank holiday shifts'
    ],
    dutiesTitle: 'What you will do',
    dutiesIntro: 'You will be trusted with:',
    duties: [
      'welcoming guests and creating a friendly first impression',
      'serving drinks accurately and consistently',
      'keeping the bar clean, tidy and well stocked',
      'handling payments correctly',
      'supporting food service where needed',
      'helping during busy events, quiz nights, music bingo and private bookings',
      'looking after regular customers and new guests with equal care',
      'noticing the small details that improve the guest experience',
      'completing opening or closing checks once trained'
    ],
    lookingFor: [
      'has previous bar, pub or hospitality experience',
      'is reliable and punctual',
      'is confident speaking to customers',
      'works well under pressure',
      'keeps high standards of cleanliness and presentation',
      'can use initiative during both quiet and busy periods',
      'understands that great service is built on consistency, warmth and attention to detail',
      'can work regular evenings and weekends',
      'can reliably get to and from TW19 6AQ'
    ],
    niceToHave: [
      'cellar experience',
      'food service experience',
      'experience using EPOS or till systems',
      'licensing awareness',
      'experience working events or busy pub services',
      'confidence working independently once trained'
    ],
    expectationIntro:
      'You can expect clear standards, required training, free on-site parking, regular part-time shifts where possible and a small team where your contribution matters.',
    jobPostingDescription:
      'Part-time bar staff role at The Anchor in Stanwell Moor near Heathrow. The role suits experienced, reliable hospitality staff who can deliver warm guest service, keep the bar clean and well stocked, support food service and work regular evenings, weekends and events.',
    workHours: 'Part-time, mainly evenings and weekends including Friday evenings, Saturdays, Sundays, events and occasional bank holidays'
  },
  'kitchen-team': {
    slug: 'kitchen-team',
    role: 'Kitchen Team',
    title: 'Kitchen Team',
    metaTitle: 'Kitchen Jobs Near Heathrow | The Anchor Stanwell Moor',
    metaDescription:
      'Apply for part-time kitchen jobs at The Anchor in Stanwell Moor near Heathrow. Join a small pub kitchen focused on cleanliness, food safety, consistency and quality.',
    heroTitle: 'Kitchen Jobs Near Heathrow',
    heroIntro: [
      'We are looking for an experienced kitchen team member to support food service at The Anchor in Stanwell Moor.',
      'This role is about consistency, cleanliness, food safety and pride in every plate. You will help prepare and serve food for our pub menu, Sunday roasts, events and private bookings, making sure everything is handled properly and presented with care.',
      'Guests should feel confident that food from our kitchen is prepared safely, served properly and delivered with attention to detail.'
    ],
    image: {
      src: '/images/food/sunday-roast/sunday-roast-the-anchor.jpeg',
      alt: 'Sunday roast served at The Anchor in Stanwell Moor'
    },
    aboutTitle: 'About the kitchen role',
    about: [
      'Our kitchen team is responsible for delivering food that guests can trust, enjoy and come back for. This role is about more than getting food out quickly. It is about consistency, cleanliness, safe working, presentation and pride in every plate.',
      'We maintain high standards of cleanliness, food safety and kitchen discipline at all times. Guests should be able to feel confident that everything coming from our kitchen has been prepared carefully, handled properly and served with attention to detail.'
    ],
    shiftsTitle: 'Typical shifts and services',
    shifts: [
      'weekday evening food service',
      'Friday and Saturday food service',
      'Sunday roast service',
      'event food preparation',
      'private booking buffets',
      'occasional bank holiday shifts',
      'kitchen close-down shifts'
    ],
    dutiesTitle: 'What you will do',
    dutiesIntro: 'This role may include:',
    duties: [
      'preparing ingredients before service',
      'cooking from the main pub menu',
      'supporting Sunday roast service',
      'preparing pizzas, burgers, pub classics, sharers and event food',
      'following recipes, portion standards and presentation standards',
      'keeping prep areas, equipment and storage areas clean and organised',
      'following allergen, hygiene and food safety procedures carefully',
      'checking quality before food leaves the kitchen',
      'communicating clearly with bar and floor staff',
      'helping with event menus, buffets and private bookings',
      'closing down the kitchen properly after service'
    ],
    standardsTitle: 'Cleanliness and food safety',
    standardsIntro: 'Cleanliness and food safety are non-negotiable at The Anchor. Every kitchen team member is expected to:',
    standards: [
      'work cleanly throughout each shift',
      'follow food hygiene and allergen procedures',
      'keep prep areas, fridges, freezers, storage and equipment organised',
      'use safe food handling practices',
      'follow cleaning schedules properly',
      'report issues quickly',
      'take pride in the condition of the kitchen',
      'understand that guest trust starts with safe, clean and careful food preparation'
    ],
    lookingFor: [
      'has previous kitchen, pub, restaurant or catering experience',
      'works cleanly and safely',
      'takes food hygiene seriously',
      'understands allergen awareness and safe food handling',
      'can follow recipes and portion standards',
      'keeps calm during busy service',
      'pays attention to presentation and consistency',
      'takes pride in serving food that reflects well on the pub',
      'can work well as part of a small team',
      'understands that quality and cleanliness matter every shift, not just when someone is watching',
      'can work regular evenings and weekends',
      'can reliably get to and from TW19 6AQ'
    ],
    niceToHave: [
      'Level 2 Food Hygiene certificate',
      'experience in a pub kitchen',
      'experience with Sunday roasts or traditional pub food',
      'experience preparing buffets or event food',
      'allergen training',
      'confidence working independently once trained'
    ],
    expectationIntro:
      'You can expect clear standards, required training, free on-site parking, regular part-time shifts where possible and a small team that takes food safety, cleanliness and consistency seriously.',
    jobPostingDescription:
      'Part-time kitchen team role at The Anchor in Stanwell Moor near Heathrow. The role suits experienced kitchen, catering or food service candidates who work cleanly, follow food safety and allergen procedures, support pub food service, Sunday roasts, events and private bookings, and can work regular evenings and weekends.',
    workHours: 'Part-time, mainly evenings and weekends including weekday evenings, Friday and Saturday food service, Sunday roast service, events and occasional bank holidays'
  }
}

