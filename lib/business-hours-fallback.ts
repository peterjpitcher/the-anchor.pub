export const STATIC_BAR_HOURS_SUMMARY =
  'Bar hours: Tuesday to Thursday 4pm-11pm, Friday 4pm-midnight, Saturday noon-midnight, Sunday noon-9pm, Monday closed.'

export const STATIC_KITCHEN_HOURS_SUMMARY =
  'Kitchen hours: Tuesday to Friday 4pm-9pm, Saturday noon-7pm, Sunday roast 1pm-6pm, Monday closed.'

export const STATIC_HOURS_REVIEW_NOTE =
  'Bank holidays and special events may vary. Last reviewed May 2026.'

export const STATIC_BAR_HOURS_SHORT =
  'Bar: Tue-Thu 4pm-11pm, Fri 4pm-midnight, Sat noon-midnight, Sun noon-9pm'

export const STATIC_KITCHEN_HOURS_SHORT =
  'Kitchen: Tue-Fri 4pm-9pm, Sat noon-7pm, Sun roast 1pm-6pm'

export const STATIC_HOURS_ROWS = [
  { day: 'Monday', bar: 'Closed', kitchen: 'Closed' },
  { day: 'Tuesday', bar: '4pm-11pm', kitchen: '4pm-9pm' },
  { day: 'Wednesday', bar: '4pm-11pm', kitchen: '4pm-9pm' },
  { day: 'Thursday', bar: '4pm-11pm', kitchen: '4pm-9pm' },
  { day: 'Friday', bar: '4pm-midnight', kitchen: '4pm-9pm' },
  { day: 'Saturday', bar: 'Noon-midnight', kitchen: 'Noon-7pm' },
  { day: 'Sunday', bar: 'Noon-9pm', kitchen: 'Sunday roast 1pm-6pm' }
] as const
