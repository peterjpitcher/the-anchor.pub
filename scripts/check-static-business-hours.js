#!/usr/bin/env node
/*
 * Guard against hard-coded business hours in app/components/lib.
 * Looks for literal time strings assigned to opening hours keys.
 */
const fs = require('fs')
const path = require('path')

const ROOTS = ['app', 'components', 'lib']
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx'])

const PATTERNS = [
  /\bopens\s*:\s*['"]\d{1,2}:\d{2}\b/,      // opens: "16:00"
  /\bcloses\s*:\s*['"]\d{1,2}:\d{2}\b/,     // closes: "22:00"
  /\bopeningHours\s*:\s*['"][^'"]*\d{1,2}:\d{2}/ // openingHours: "Mo-Su 00:00-24:00"
]

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
      walk(fullPath, files)
      continue
    }
    const ext = path.extname(entry.name)
    if (EXTENSIONS.has(ext)) files.push(fullPath)
  }
  return files
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split(/\r?\n/)
  const hits = []
  lines.forEach((line, index) => {
    if (PATTERNS.some((pattern) => pattern.test(line))) {
      hits.push({ line: index + 1, text: line.trim() })
    }
  })
  return hits
}

let totalHits = 0
const results = []

for (const root of ROOTS) {
  const rootPath = path.join(process.cwd(), root)
  if (!fs.existsSync(rootPath)) continue
  const files = walk(rootPath)
  files.forEach((file) => {
    const hits = scanFile(file)
    if (hits.length) {
      totalHits += hits.length
      results.push({ file, hits })
    }
  })
}

if (totalHits > 0) {
  console.error('Hard-coded opening hours detected:')
  results.forEach(({ file, hits }) => {
    hits.forEach((hit) => {
      console.error(`- ${file}:${hit.line}: ${hit.text}`)
    })
  })
  process.exit(1)
} else {
  console.log('OK: no hard-coded opening hours found in app/components/lib')
}
