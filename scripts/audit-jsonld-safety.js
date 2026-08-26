#!/usr/bin/env node
/**
 * Every JSON-LD block must be serialised with jsonLdSafeStringify.
 *
 * JSON-LD goes into the page through dangerouslySetInnerHTML, and much of it
 * carries values from the management database: event names, descriptions, FAQ
 * text. A value containing `</script>` closes the script tag early and anything
 * after it is parsed as markup.
 *
 * components/JsonLd.tsx looked protected and was not. It did:
 *
 *   JSON.stringify(data).replace(/</g, '<')
 *
 * In a JavaScript string literal '<' IS the '<' character, so that replaced
 * '<' with '<' and did nothing at all. Seven files rendered through it. The fix
 * needs a literal backslash, '\\u003c', which is what lib/jsonld.ts does.
 *
 * That is precisely the kind of bug review catches and reading does not, so it
 * is checked mechanically here instead.
 */
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const ROOT = path.join(__dirname, '..')

function jsonLdFiles() {
  const out = execFileSync('grep', ['-rl', 'application/ld+json', 'app', 'components'], {
    cwd: ROOT,
    encoding: 'utf8',
  })
  return out.split('\n').filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'))
}

function audit() {
  const problems = []
  for (const file of jsonLdFiles()) {
    const src = fs.readFileSync(path.join(ROOT, file), 'utf8')

    // A raw stringify feeding a script tag.
    if (/__html:\s*JSON\.stringify\(/.test(src)) {
      problems.push({ file, kind: 'raw-stringify', detail: '__html: JSON.stringify(...)' })
    }

    // The no-op escape. Matches a SINGLE backslash before u003c, which is the
    // broken form; the correct form has two in source.
    for (const m of src.matchAll(/replace\(\s*\/<\/g\s*,\s*'([^']*)'\s*\)/g)) {
      if (m[1] !== '\\\\u003c') {
        problems.push({
          file,
          kind: 'no-op-escape',
          detail: `replace(/</g, '${m[1]}') does not escape; '\\u003c' in a JS literal is '<'`,
        })
      }
    }
  }
  return problems
}

module.exports = { audit, jsonLdFiles }

if (require.main === module) {
  const files = jsonLdFiles()
  const problems = audit()
  console.log(`files emitting JSON-LD: ${files.length}`)
  if (!problems.length) {
    console.log('All JSON-LD is serialised with jsonLdSafeStringify.')
    process.exit(0)
  }
  console.log(`\nFAIL  unsafe JSON-LD serialisation: ${problems.length}`)
  for (const p of problems) console.log(`   ${p.file}\n      ${p.kind}: ${p.detail}`)
  console.log('\nUse jsonLdSafeStringify from @/lib/jsonld for every JSON-LD block.')
  process.exit(1)
}
