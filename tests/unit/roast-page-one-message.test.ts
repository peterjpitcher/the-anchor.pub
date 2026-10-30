import fs from 'fs'
import path from 'path'

const read = (file: string): string => fs.readFileSync(path.resolve(__dirname, '../..', file), 'utf8')

describe('/sunday-roast gives one message: walk in or book', () => {
  const page = read('app/sunday-roast/page.tsx')
  const prompt = read('components/sunday-lunch/TimedBookingPrompt.tsx')

  it('says it in the hero', () => {
    expect(page).toContain("Walk in whenever suits you, or book if you're a group or want a set time.")
    expect(page).not.toContain('Choose a time for your Sunday roast, then order at the table.')
  })

  it('says it in the how it works section and the closing band', () => {
    expect(page).toContain('Walk In or Book, Then Order at the Table')
    expect(page).toContain('Walk in or book your Sunday roast')
  })

  it('no longer tells anyone that no booking is needed', () => {
    expect(page).not.toMatch(/no booking needed|no booking and no pre-order/i)
  })

  it('the timed prompt says it too, and drops the scarcity claim', () => {
    expect(prompt).toContain('walk in whenever suits you')
    expect(prompt).not.toMatch(/book up fast/i)
  })
})
