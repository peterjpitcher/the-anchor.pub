import { nowInLondonComponents } from '@/lib/time-london'

const DRINKS_SUMMER_HERO = '/images/page-headers/drinks/drinks-summery.png'
const DRINKS_WINTER_HERO = '/images/page-headers/drinks/drinks-wintery.png'

export function getDrinksHeroImage(baseDate: Date = new Date()) {
  const { month } = nowInLondonComponents(baseDate)
  const isSummerHero = month >= 4 && month <= 9

  return {
    src: isSummerHero ? DRINKS_SUMMER_HERO : DRINKS_WINTER_HERO,
    alt: isSummerHero
      ? 'Summery drinks on a pub garden table at The Anchor'
      : 'Winter drinks on a warm pub table at The Anchor'
  }
}
