#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const root = process.cwd()

const targetPages = [
  'app/food-menu/page.tsx',
  'app/sunday-roast/page.tsx',
  'app/pizza-menu/page.tsx',
  'app/fish-and-chips-heathrow/page.tsx',
  'app/food-menu/vegetarian/page.tsx',
  'app/food-menu/vegan/page.tsx',
  'app/food-menu/gluten-free/page.tsx',
  'app/book-table/page.tsx'
]

const directDataReads = [
  /parseMenuMarkdown\s*\(\s*['"]food['"]\s*\)/,
  /content\/menu/,
  /food\.json/
]

const hardcodedPricePattern = /(?:&pound;|£)\s*\d|from\s+(?:&pound;|£)/i

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'))
}

function collectFoodMenuNames() {
  const menu = readJson('content/menu/food.json')
  const names = []

  for (const category of menu.categories || []) {
    for (const section of category.sections || []) {
      for (const item of section.items || []) {
        if (typeof item.name === 'string' && item.name.trim().length >= 6) {
          names.push(item.name.trim())
        }
      }
    }
  }

  return names
}

function collectSundayNames() {
  const ssot = readJson('SSOT.json')
  const current = (ssot.sunday_roast?.options || [])
    .map((item) => item.name)
    .filter(Boolean)
  const retired = String(ssot.sunday_roast?.RETIRED_OPTIONS || '')
    .split(/[,.;:]/)
    .map((entry) => entry.replace(/\(.*?\)/g, '').trim())
    .filter((entry) => entry.length >= 6)

  return [...current, ...retired]
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function isAllowedPriceLine(relativePath, line) {
  if (relativePath === 'app/book-table/page.tsx' && /deposit/i.test(line)) return true
  // Hero trust badges show SSOT §5 marketing price RANGES (e.g. "Mains £11 to £16",
  // "Pizzas from £12"), not per-item menu prices. Per-item prices still come from the
  // menu data layer; hardcoded item names + direct data reads remain audited below.
  if (/Badge/.test(line) && /(from\s*(?:&pound;|£)\s*\d|(?:&pound;|£)\s*\d+\s*to\s*(?:&pound;|£)\s*\d)/i.test(line)) {
    return true
  }
  return false
}

const knownMenuNames = Array.from(new Set([
  ...collectFoodMenuNames(),
  ...collectSundayNames()
])).filter((name) => !/^chips$/i.test(name))

const findings = []

for (const relativePath of targetPages) {
  const absolutePath = path.join(root, relativePath)
  const source = fs.readFileSync(absolutePath, 'utf8')
  const lines = source.split(/\r?\n/)

  for (const pattern of directDataReads) {
    if (pattern.test(source)) {
      findings.push(`${relativePath}: reads food menu data directly instead of using the menu API layer (${pattern})`)
    }
  }

  lines.forEach((line, index) => {
    if (hardcodedPricePattern.test(line) && !isAllowedPriceLine(relativePath, line)) {
      findings.push(`${relativePath}:${index + 1}: hard-coded menu-looking price literal: ${line.trim()}`)
    }
  })

  for (const name of knownMenuNames) {
    const pattern = new RegExp(`(?<![A-Za-z0-9])${escapeRegex(name)}(?![A-Za-z0-9])`)
    if (pattern.test(source)) {
      findings.push(`${relativePath}: hard-coded known menu item name "${name}"`)
    }
  }
}

if (findings.length > 0) {
  console.error('Menu page audit failed:')
  for (const finding of findings) {
    console.error(`- ${finding}`)
  }
  process.exit(1)
}

console.log('Menu page audit passed.')
