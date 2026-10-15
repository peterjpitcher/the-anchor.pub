import { readFileSync } from 'fs'
import { join } from 'path'

// Owner, 15 October 2026: "customers keep their keys". Nothing on the parking
// form may suggest keys are left with anyone.
describe('parking form: customers keep their keys', () => {
  it('does not suggest leaving keys with anyone', () => {
    const source = readFileSync(join(__dirname, '../../components/features/ParkingBookingWizard/index.tsx'), 'utf8')
    expect(source).not.toMatch(/leav(e|ing) (your )?keys|keys with reception/i)
  })
})
