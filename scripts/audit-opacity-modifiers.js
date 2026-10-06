#!/usr/bin/env node
/**
 * Every colour class with an opacity modifier must compile to a CSS rule.
 *
 * Tailwind can only put an alpha on a colour it can parse. Given one it cannot,
 * such as a token defined as a bare `var(--text-muted)`, it drops the class
 * without a word: `bg-ink-muted/30` produced no rule and no warning, and the
 * element stayed transparent or inherited its colour.
 *
 * That went unnoticed until 5 October 2026, when the inactive dots of the
 * reviews carousel were found to paint nothing on the live site in both season
 * skins. 60 uses of 23 classes were dead, including the tint and border
 * of every error and success box.
 *
 * Lint, types and Jest cannot see it, because the class name is only a string
 * until Tailwind compiles it. So this compiles them: it collects every colour
 * class with a modifier from the folders Tailwind scans, runs them through the
 * real config, and fails for any that comes back with no rule.
 *
 * Usage: node scripts/audit-opacity-modifiers.js
 */
const fs = require('fs')
const path = require('path')
const postcss = require('postcss')
const tailwindcss = require('tailwindcss')
const loadConfig = require('tailwindcss/loadConfig')
const resolveConfig = require('tailwindcss/resolveConfig')
const flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette').default

const ROOT = path.join(__dirname, '..')

// The folders tailwind.config.ts lists under `content` that exist.
const SCAN = ['app', 'components', 'lib']
const SOURCE = /\.(?:js|jsx|ts|tsx|mdx)$/

// Core utilities that take a colour, and so an opacity modifier.
const UTILITY =
  'bg|text|border(?:-[xytrblse])?|ring(?:-offset)?|divide|outline|fill|stroke|from|via|to|decoration|placeholder|caret|accent|shadow'
const CANDIDATE = new RegExp(
  String.raw`(?<![\w/-])(?:${UTILITY})-([a-z][a-z0-9-]*)/(\[[^\]\s'"\`]+\]|\d+)(?![\w-])`,
  'g'
)

function loadTailwindConfig() {
  return loadConfig(path.join(ROOT, 'tailwind.config.ts'))
}

function sourceFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules') sourceFiles(full, out)
    } else if (SOURCE.test(entry.name)) {
      out.push(full)
    }
  }
  return out
}

/** Colour classes with an opacity modifier, mapped to the files that use them. */
function candidates(config) {
  const colours = flattenColorPalette(resolveConfig(config).theme.colors)
  const found = new Map()
  for (const folder of SCAN) {
    for (const file of sourceFiles(path.join(ROOT, folder))) {
      for (const match of fs.readFileSync(file, 'utf8').matchAll(CANDIDATE)) {
        // `text-sm/6` is a font size with a line height, not a colour.
        if (!(match[1] in colours)) continue
        if (!found.has(match[0])) found.set(match[0], new Set())
        found.get(match[0]).add(path.relative(ROOT, file))
      }
    }
  }
  return found
}

async function compile(config, classes) {
  const plugin = tailwindcss({ ...config, content: [{ raw: classes.join(' '), extension: 'html' }] })
  const result = await postcss([plugin]).process('@tailwind utilities;', { from: undefined })
  return result.css
}

const selector = (className) => '.' + className.replace(/[^a-zA-Z0-9_-]/g, '\\$&')

/** The classes that compile to nothing under `config`. */
async function deadClasses(config, classes) {
  if (!classes.length) return []
  const css = await compile(config, classes)
  return classes.filter((className) => !css.includes(selector(className)))
}

async function audit() {
  const config = loadTailwindConfig()
  const found = candidates(config)
  const dead = await deadClasses(config, [...found.keys()].sort())
  return {
    checked: found.size,
    dead: dead.map((className) => ({ className, files: [...found.get(className)].sort() })),
  }
}

module.exports = { audit, candidates, compile, deadClasses, loadTailwindConfig }

if (require.main === module) {
  audit()
    .then(({ checked, dead }) => {
      console.log(`colour classes with an opacity modifier: ${checked}`)
      if (!dead.length) {
        console.log('Every one compiles to a CSS rule.')
        return
      }
      console.log(`\nFAIL  ${dead.length} compile to nothing:\n`)
      for (const { className, files } of dead) {
        console.log(`  ${className}`)
        for (const file of files) console.log(`     ${file}`)
      }
      console.log(
        '\nTailwind drops a modifier it cannot apply. Either the colour is a bare var() in' +
          '\ntailwind.config.ts (define it with mixable()), or the number is not a step on' +
          '\nthe opacity scale (use one that is, or an arbitrary value such as /[0.33]).'
      )
      process.exit(1)
    })
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
