/**
 * Copy helpers for the NGCI menu page (/food-menu/gluten-free).
 *
 * The page counts and names only the dishes the kitchen flags as NGCI in the
 * management app. Pizzas that can be made on an NGCI base on request are said
 * separately, in one sentence, and are never counted or named as NGCI dishes:
 * an ordinary pizza is not an NGCI dish.
 */

/** SSOT section 5: "Stone-baked pizzas ... NGCI bases available". */
export const NGCI_PIZZA_BASE_WORDING = 'Our stone-baked pizzas can be made on an NGCI base on request.'

/** "2 dishes our kitchen flags as NGCI", or the short "2 current dishes". */
export function describeNgciDishCount(count: number, style: 'full' | 'short' = 'full'): string {
  const noun = count === 1 ? 'dish' : 'dishes'
  return style === 'short'
    ? `${count} current ${noun}`
    : `${count} ${noun} our kitchen flags as NGCI`
}

/** Every flagged dish by name: "Chunky Chips and Sweet Potato Fries". */
export function joinNgciDishNames(items: ReadonlyArray<{ name: string }>): string {
  const names = items.map((item) => item.name)
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}
