import { getActiveHeaderPromos } from '../header-promo-window'
import { NATIONS_CHAMPIONSHIP_PROMO_WINDOW } from './config'

/**
 * Whether the Nations Championship is still being promoted on the London date
 * of `at`. Uses the header's own window check, so the strip and the header link
 * open and close on the same day.
 */
export function isNationsChampionshipPromoOpen(at: Date = new Date()): boolean {
  return getActiveHeaderPromos([NATIONS_CHAMPIONSHIP_PROMO_WINDOW], at).length > 0
}
