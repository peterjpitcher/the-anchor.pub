import fs from 'fs'
import path from 'path'

function readPage(route: string): string {
  return fs.readFileSync(path.join(process.cwd(), 'app', route, 'page.tsx'), 'utf8')
}

describe('commercial page search headings', () => {
  it.each([
    ['dog-friendly-pub-heathrow', 'Dog Friendly Pub Near Heathrow'],
    ['pool-darts-pub', 'Pub with Pool Table and Darts Near Heathrow'],
    ['coach-parking-heathrow', 'Pub with Coach Parking Near Heathrow'],
  ])('keeps the %s H1 aligned with its search intent', (route, heading) => {
    expect(readPage(route)).toContain(`title="${heading}"`)
  })
})
