/**
 * Dates printed on blog posts.
 *
 * Front matter dates are fixed calendar dates ("2023-03-28"), so they are
 * formatted without a clock and without the server's time zone: the same
 * string comes out under TZ=Europe/London and TZ=UTC.
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export interface PostDateParts {
  /** The front matter value, safe for a `<time dateTime>` attribute. */
  iso: string
  /** "28 March 2023" */
  long: string
  /** "March 2023" */
  monthYear: string
}

/**
 * Read a front matter date. Returns null for anything that is not a real
 * calendar date, so a typo prints no date rather than "Invalid Date".
 */
export function getPostDateParts(value: string | undefined | null): PostDateParts | null {
  if (typeof value !== 'string') return null
  const match = ISO_DATE.exec(value.trim())
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1) return null

  // Date.UTC rolls an impossible day forward (30 February becomes 2 March), so
  // the date has to read back as the same day.
  const check = new Date(Date.UTC(year, month - 1, day))
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null
  }

  const monthName = MONTHS[month - 1]
  return {
    iso: `${match[1]}-${match[2]}-${match[3]}`,
    long: `${day} ${monthName} ${year}`,
    monthYear: `${monthName} ${year}`,
  }
}

export interface PostDateLine {
  published: PostDateParts | null
  /** Only set when it is a real date later than the published date. */
  updated: PostDateParts | null
  /**
   * True for an old post kept as an archive: hidden from search and not
   * brought up to date since. These carry the stronger archive notice.
   */
  isArchive: boolean
}

export function getPostDateLine(post: {
  date?: string
  updated?: string
  noindex?: boolean
  hideDate?: boolean
}): PostDateLine {
  const published = post.hideDate ? null : getPostDateParts(post.date)
  const updatedParts = getPostDateParts(post.updated)
  const publishedIso = getPostDateParts(post.date)?.iso
  const updated = updatedParts && (!publishedIso || updatedParts.iso > publishedIso) ? updatedParts : null

  return {
    published,
    updated,
    isArchive: post.noindex === true && updated === null,
  }
}
