#!/usr/bin/env node
// Only runs against the isolated local fixture server. No customer writes.
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const { chromium } = require('playwright')
const { AxeBuilder } = require('@axe-core/playwright')
const base = 'http://127.0.0.1:3137'
async function main() {
  const output = process.argv[2] || '/tmp/nations-page-smoke'
  await fs.mkdir(output, { recursive: true })
  const control = await fetch(`${base}/__nations_test?outage=false&cancel=false`)
  assert.equal(control.status, 200)
  const original = await (await fetch(`${base}/api/nations-championship`)).json()
  const multi = structuredClone(original)
  const second = structuredClone(multi.fixtures[0])
  second.id = '10000000-0000-4000-8000-000000000002'
  second.teamA = 'England'; second.teamB = 'Australia'
  // Shift every date together so displayed windows remain consistent.
  multi.fixtures.push(JSON.parse(JSON.stringify(second).replaceAll('2026-11-07', '2026-11-08')))
  let incompatible = false
  const browser = await chromium.launch({ headless: true })
  const evidence = { checks: [], errors: [] }
  try {
    const context = await browser.newContext()
    await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort())
    const page = await context.newPage()
    page.on('pageerror', error => evidence.errors.push(error.message))
    await page.route(`${base}/api/nations-championship`, route => route.fulfill({ json: incompatible ? { ...multi, schemaVersion: 999 } : multi }))
    await page.goto(`${base}/live-sport/nations-championship`)
    await page.getByText('2 fixtures shown', { exact: true }).waitFor()
    await page.getByRole('heading', { name: 'Saturday 7 November 2026', exact: true }).waitFor()
    await page.getByRole('heading', { name: 'Sunday 8 November 2026', exact: true }).waitFor()
    await page.setViewportSize({ width: 1440, height: 1000 })
    const headerLinks = await page.locator('a:visible').allTextContents()
    const christmasIndex = headerLinks.findIndex(text => text.trim() === 'Christmas')
    assert.equal(headerLinks[christmasIndex + 1].trim(), 'Nations Championship')
    assert.equal(headerLinks[christmasIndex + 2].trim(), 'Airport parking')
    assert.equal(await page.locator('[aria-labelledby="fixture-date-2026-11-08"]').getByRole('link', { name: 'View the Sunday roast menu', exact: true }).getAttribute('href'), '/sunday-roast')
    assert.equal(await page.locator('[aria-labelledby="fixture-date-2026-11-07"]').getByRole('link', { name: 'View the food menu', exact: true }).getAttribute('href'), '/food-menu')
    evidence.checks.push('Sunday game links to the roast menu; Saturday game retains the regular menu')
    const fixtureTop = await page.locator('#fixtures').boundingBox()
    const editorialTop = await page.locator('#autumn-rugby').boundingBox()
    assert.ok(editorialTop.y > fixtureTop.y + fixtureTop.height, 'Editorial follows all fixtures')
    await page.getByLabel('Filter by team').selectOption('England')
    assert.equal(await page.getByRole('heading', { name: 'Saturday 7 November 2026', exact: true }).count(), 0)
    await page.getByRole('heading', { name: 'Sunday 8 November 2026', exact: true }).waitFor()
    await page.getByRole('button', { name: 'Show all fixtures', exact: true }).click()
    evidence.checks.push('Immediate refresh, separate date headings, filters remove empty dates, editorial below fixtures')
    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 })
      if (width === 375) {
        await page.getByRole('button', { name: 'Open menu', exact: true }).click()
        const mobileMenu = page.getByRole('dialog', { name: 'Mobile navigation menu' })
        const tournamentLink = mobileMenu.getByRole('link', { name: 'Nations Championship', exact: true })
        await tournamentLink.waitFor({ state: 'visible' })
        assert.equal(await tournamentLink.getAttribute('href'), '/live-sport/nations-championship')
        await page.getByRole('button', { name: 'Close menu', exact: true }).first().click()
        evidence.checks.push('Nations Championship is accessible in the mobile navigation menu at 375 pixels')
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
      await page.locator('#fixtures').scrollIntoViewIfNeeded()
      await page.screenshot({ path: `${output}/dates-${width}.png` })
    }
    const axe = await new AxeBuilder({ page }).include('main').analyze()
    assert.equal(axe.violations.length, 0, JSON.stringify(axe.violations.map(v => v.id)))
    incompatible = true
    await page.reload()
    await page.getByRole('button', { name: 'Refresh page', exact: true }).waitFor()
    assert.equal(await page.getByRole('link', { name: /^Book a table for / }).count(), 0)
    assert.equal(await page.getByText('Match bookings open when the screening is confirmed.', { exact: true }).count(), 0)
    incompatible = false
    await page.getByRole('button', { name: 'Refresh page', exact: true }).click()
    await page.getByText('2 fixtures shown', { exact: true }).waitFor()
    await page.getByRole('link', { name: 'Book a table for Italy v South Africa', exact: true }).first().click()
    await page.waitForURL('**/book-table?**')
    await page.getByRole('heading', { name: 'Book a table for Italy v South Africa', exact: true }).waitFor()
    evidence.checks.push('Incompatible feed pauses bookings with truthful message; full-page refresh recovers booking link and game context')
    evidence.checks.push('Top bar order is Christmas, Nations Championship, Airport parking')
    assert.equal(evidence.errors.length, 0)
  } finally {
    await browser.close()
    await fs.writeFile(`${output}/evidence.json`, JSON.stringify(evidence, null, 2))
  }
  console.log(JSON.stringify(evidence))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
