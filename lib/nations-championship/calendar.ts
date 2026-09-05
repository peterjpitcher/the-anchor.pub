import { fixtureFoodMenu } from './food-menu'
import { DateTime } from 'luxon'
import { CONTACT } from '@/lib/constants'
import { NATIONS_CHAMPIONSHIP_PATH } from './config'
import { isBookableScreening, type ScreeningFixture } from './types'

function escapeText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,')
}
function foldLine(line: string): string {
  const lines: string[] = []
  let current = ''
  for (const character of line) {
    if (Buffer.byteLength(current + character, 'utf8') > 75) {
      lines.push(current)
      current = ' '
    }
    current += character
  }
  return [...lines, current].join('\r\n')
}
export function buildScreeningCalendar(fixture: ScreeningFixture, now = new Date()): string {
  if (!isBookableScreening(fixture, now) || !fixture.screening.screeningStartAt || !fixture.screening.screeningEndAt) {
    throw new Error('This screening is not confirmed')
  }
  const stamp = (value: string) => DateTime.fromISO(value).toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'")
  const kickoff = DateTime.fromISO(fixture.kickOffAt).setZone('Europe/London').toFormat('d MMMM yyyy, HH:mm')
  const menu = fixtureFoodMenu(fixture)
  const description = [
    `Kick-off ${kickoff} (UK time).`, fixture.screening.openingLabel,
    ['from_opening', 'from_opening_until_closing'].includes(fixture.coverage) ? 'Showing from opening; the start of the game is missed.' : '',
    ['until_closing', 'from_opening_until_closing'].includes(fixture.coverage) ? 'Viewing ends when the pub closes, even if the game continues.' : '',
    fixture.screening.foodPromotion.message,
    menu ? `Menu: https://www.the-anchor.pub${menu.href}` : '',
    fixture.plannedEndAt === null ? 'Calendar end marks the booking window, not the final whistle. Check the website before travelling. Downloaded calendar files do not update automatically.' : 'End time is planned and may change. Check the website before travelling. Downloaded calendar files do not update automatically.',
  ].filter(Boolean).join('\n')
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//The Anchor//Rugby screenings//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', `UID:${fixture.id}@the-anchor.pub`, `SEQUENCE:${fixture.contentRevision}`,
    `DTSTAMP:${stamp(now.toISOString())}`, `DTSTART:${stamp(fixture.screening.screeningStartAt)}`,
    `DTEND:${stamp(fixture.screening.screeningEndAt)}`,
    `SUMMARY:${escapeText(`${fixture.teamA} v ${fixture.teamB} at The Anchor`)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(`The Anchor, ${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.postcode}`)}`,
    `URL:https://www.the-anchor.pub${NATIONS_CHAMPIONSHIP_PATH}#fixture-${fixture.id}`,
    'END:VEVENT', 'END:VCALENDAR', '',
  ].map(foldLine).join('\r\n')
}
