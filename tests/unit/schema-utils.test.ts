import { generateNutritionInfo } from '@/lib/schema-utils'

describe('generateNutritionInfo', () => {
  it('returns undefined (no invalid range strings)', () => {
    expect(generateNutritionInfo('Margherita Pizza', 'pizza')).toBeUndefined()
    expect(generateNutritionInfo('Cheeseburger', 'burger')).toBeUndefined()
    expect(generateNutritionInfo('Sunday Roast', 'sunday-roast')).toBeUndefined()
  })
})
