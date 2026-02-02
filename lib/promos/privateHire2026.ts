export const PRIVATE_HIRE_2026_PROMO_ID = 'private_hire_2026_prosecco'

// 1 March 2026 00:00 UK time (GMT) == 1 March 2026 00:00 UTC.
export const PRIVATE_HIRE_2026_PROMO_ENDS_AT_MS = Date.UTC(2026, 2, 1, 0, 0, 0, 0)

export const PRIVATE_HIRE_2026_PROMO_DEPOSIT_DEADLINE_COPY = '28 Feb 2026'

export const PRIVATE_HIRE_2026_PROMO_DISMISS_DAYS = 7
export const PRIVATE_HIRE_2026_PROMO_DISMISS_MS = 1000 * 60 * 60 * 24 * PRIVATE_HIRE_2026_PROMO_DISMISS_DAYS
export const PRIVATE_HIRE_2026_PROMO_DISMISS_STORAGE_KEY = 'promo_private_hire_2026_dismissed_until'

// Optional runtime kill-switch (can be set via GTM/custom script/console without redeploy).
export const PRIVATE_HIRE_2026_PROMO_DISABLED_STORAGE_KEY = 'promo_private_hire_2026_disabled'

// Optional deploy-time flag.
export const PRIVATE_HIRE_2026_PROMO_ENABLED =
  process.env.NEXT_PUBLIC_PRIVATE_HIRE_2026_PROMO_ENABLED !== 'false'

export const PRIVATE_HIRE_2026_PROMO_CTA_HREF = '/private-hire#enquiry'
export const PRIVATE_HIRE_2026_PROMO_PHONE = '01753 682707'
export const PRIVATE_HIRE_2026_PROMO_PHONE_HREF = 'tel:+441753682707'

// Optional hero image for the popup (stored in /public).
// Replace this with a dedicated promo image when available.
export const PRIVATE_HIRE_2026_PROMO_IMAGE_SRC = '/images/page-headers/private-hire/private-hire.jpg'
export const PRIVATE_HIRE_2026_PROMO_IMAGE_ALT = 'Private Hire at The Anchor'
