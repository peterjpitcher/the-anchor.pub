import fs from 'fs'
import path from 'path'
import { lookupRedirect } from '@/lib/middleware-redirects'

const ROOT = path.resolve(__dirname, '../..')
const read = (file: string): string => fs.readFileSync(path.join(ROOT, file), 'utf8')

describe('the wake post lives on the wake page now', () => {
  it('redirects the old address straight to the wake page', () => {
    const rule = lookupRedirect('/blog/wake-venue-near-heathrow')
    expect(rule?.destination).toBe('/private-hire/wakes')
    expect(rule?.permanent).toBe(true)
    expect(lookupRedirect('/private-hire/wakes')).toBeUndefined()
  })

  it('no longer has the post', () => {
    expect(fs.existsSync(path.join(ROOT, 'content/blog/wake-venue-near-heathrow'))).toBe(false)
  })

  it('carries the guide and its answers', () => {
    const page = read('app/private-hire/wakes/page.tsx')
    const guide = read('app/private-hire/wakes/_components/WakePlanningGuide.tsx')
    expect(page).toContain('<WakePlanningGuide')
    expect(guide).toContain('Where to Hold a Wake Near Staines and Heathrow')
    expect(guide).toContain('What to Look for in a Wake Venue')
    expect(guide).toContain('Booking a Wake at Short Notice')
    expect(page).toContain('Can I host a wake at a pub?')
    expect(page).toContain('What food is typical at a wake?')
  })

  it('renders the deposit from the shared wording', () => {
    const guide = read('app/private-hire/wakes/_components/WakePlanningGuide.tsx')
    expect(guide).toContain('PRIVATE_HIRE_DEPOSIT_WORDING')
    expect(guide).not.toContain('£')
  })
})
