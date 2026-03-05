#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const ts = require('typescript')
const { getDefaultHeaderImage, getPageHeaderImage } = require('../lib/page-header-images.ts')

const APP_DIR = path.join(process.cwd(), 'app')

const EXEMPT_PAGES = new Set([
  'app/book-event/page.tsx',
  'app/booking-confirmation/page.tsx',
  'app/[...unmatched]/page.tsx',
  'app/components/page.tsx',
  'app/debug-hours/page.tsx',
  'app/drinks/[slug]/page.tsx',
  'app/free-parking/page.tsx',
  'app/gtm-debug/page.tsx',
  'app/leave-review/page.tsx',
  'app/parking/bookings/[id]/page.tsx',
  'app/test-gtm/page.tsx',
  'app/test-hours/page.tsx',
  'app/test-navigation-tracking/page.tsx',
  'app/test-reviews/page.tsx',
  'app/test-simple/page.tsx',
  'app/test-tracking/page.tsx',
  'app/whats-on/drag-shows/page.tsx',
])

const DEFAULT_HEADER_IMAGE_ALLOWED_ROUTES = new Set([
  '/accessibility',
  '/blog',
  '/blog/tags',
  '/burger-menu',
  '/cash-bingo',
  '/coach-parking-heathrow',
  '/colnbrook-pub',
  '/corporate-christmas-parties',
  '/demo-header',
  '/dog-friendly-pub-heathrow',
  '/family-friendly-pub-heathrow',
  '/fish-and-chips-heathrow',
  '/function-room-hire',
  '/heathrow-family-dining',
  '/heathrow-layover-dining',
  '/horton-pub',
  '/karaoke',
  '/live-music',
  '/live-sport',
  '/live-sport/boxing',
  '/live-sport/f1',
  '/live-sport/six-nations',
  '/live-sport/world-cup',
  '/luggage-storage-heathrow',
  '/m25-junction-14-pub',
  '/music-bingo',
  '/open-mic',
  '/plane-spotting-heathrow',
  '/pool-darts-pub',
  '/pre-flight-meal',
  '/privacy-policy',
  '/private-party-venue',
  '/pub-garden-heathrow',
  '/pub-near-crowne-plaza-heathrow',
  '/pub-near-hilton-heathrow',
  '/pub-near-holiday-inn-heathrow',
  '/pub-near-ibis-heathrow',
  '/pub-near-marriott-heathrow',
  '/pub-near-novotel-heathrow',
  '/pub-near-premier-inn-heathrow',
  '/pub-near-radisson-blu-heathrow',
  '/pub-near-renaissance-heathrow',
  '/pub-near-sofitel-heathrow',
  '/pub-near-travelodge-heathrow',
  '/pubs-in-stanwell',
  '/quiz-night',
  '/restaurants-near-heathrow',
  '/safety-and-respect',
  '/sitemap-page',
  '/summer-garden-parties',
  '/sustainability',
  '/valentines-day',
  '/wraysbury-pub',
])

const PRIVATE_HIRE_CHILD_ROUTES = new Set([
  '/private-hire/baby-showers',
  '/private-hire/christenings',
  '/private-hire/engagement-parties',
  '/private-hire/gender-reveal',
  '/private-hire/milestone-birthdays',
  '/private-hire/near/[slug]',
  '/private-hire/retirement-parties',
  '/private-hire/wakes',
  '/private-hire/weddings',
])

const TERMINAL_ROUTES = new Set([
  '/near-heathrow/terminal-2',
  '/near-heathrow/terminal-3',
  '/near-heathrow/terminal-4',
  '/near-heathrow/terminal-5',
])

const LOCAL_BOOKING_PRIMARY_ROUTES = new Set([
  '/ashford-pub',
  '/bedfont-pub',
  '/colnbrook-pub',
  '/egham-pub',
  '/feltham-pub',
  '/heathrow-hotels-pub',
  '/horton-pub',
  '/longford-pub',
  '/m25-junction-14-pub',
  '/staines-pub',
  '/stanwell-pub',
  '/sunbury-pub',
  '/windsor-pub',
  '/wraysbury-pub',
])

function isExemptFile(filePath) {
  if (EXEMPT_PAGES.has(filePath)) return true
  return /app\/(test-|debug-)/.test(filePath)
}

function readAllPageFiles(dir, bucket = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      readAllPageFiles(fullPath, bucket)
      continue
    }
    if (entry.name === 'page.tsx') {
      const relative = path.relative(process.cwd(), fullPath).split(path.sep).join('/')
      bucket.push(relative)
    }
  }
  return bucket
}

function getAttribute(node, name) {
  for (const prop of node.attributes.properties) {
    if (ts.isJsxAttribute(prop) && prop.name.text === name) {
      return prop
    }
  }
  return null
}

function getStringAttributeValue(attr, sourceFile) {
  if (!attr || !attr.initializer) return null
  if (ts.isStringLiteral(attr.initializer)) return attr.initializer.text
  if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
    if (ts.isStringLiteral(attr.initializer.expression)) {
      return attr.initializer.expression.text
    }
  }
  return null
}

function getExpressionText(attr, sourceFile) {
  if (!attr || !attr.initializer) return ''
  if (ts.isStringLiteral(attr.initializer)) {
    return JSON.stringify(attr.initializer.text)
  }
  if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
    return attr.initializer.expression.getText(sourceFile)
  }
  return attr.initializer.getText(sourceFile)
}

function getSourceLocation(node, sourceFile) {
  const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1
  return line
}

function parsePage(pageFile) {
  const absolute = path.join(process.cwd(), pageFile)
  const text = fs.readFileSync(absolute, 'utf8')
  const sourceFile = ts.createSourceFile(pageFile, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)

  const heroWrappers = []
  let heroSectionCount = 0
  let localH1Count = 0

  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tagName = node.tagName.getText(sourceFile)

      if (tagName === 'HeroWrapper') {
        const routeAttr = getAttribute(node, 'route')
        const variantAttr = getAttribute(node, 'variant')
        const primaryAttr = getAttribute(node, 'primaryCta')
        const hasImageProp = Boolean(getAttribute(node, 'image'))

        heroWrappers.push({
          line: getSourceLocation(node, sourceFile),
          routeLiteral: getStringAttributeValue(routeAttr, sourceFile),
          routeExpr: getExpressionText(routeAttr, sourceFile),
          variantLiteral: getStringAttributeValue(variantAttr, sourceFile),
          primaryExpr: getExpressionText(primaryAttr, sourceFile),
          hasImageProp,
        })
      }

      if (tagName === 'HeroSection') {
        heroSectionCount += 1
      }

      if (tagName === 'h1') {
        localH1Count += 1
      }

      if (tagName === 'PageTitle') {
        const asAttr = getAttribute(node, 'as')
        const asValue = getStringAttributeValue(asAttr, sourceFile)
        if (asValue === 'h1') {
          localH1Count += 1
        }
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return {
    pageFile,
    heroWrappers,
    heroSectionCount,
    localH1Count,
  }
}

function pushIssue(issues, pageFile, line, message) {
  issues.push(`${pageFile}:${line} ${message}`)
}

function audit() {
  const pages = readAllPageFiles(APP_DIR).sort()
  const issues = []

  for (const pageFile of pages) {
    const info = parsePage(pageFile)
    const exempt = isExemptFile(pageFile)

    if (!exempt && info.heroWrappers.length === 0) {
      pushIssue(issues, pageFile, 1, 'Missing `HeroWrapper` on non-exempt content page.')
    }

    if (!exempt && info.heroSectionCount > 0) {
      pushIssue(issues, pageFile, 1, 'Found `HeroSection` usage on non-exempt page. Use `HeroWrapper`.')
    }

    if (info.heroWrappers.length > 0 && info.localH1Count > 0) {
      pushIssue(
        issues,
        pageFile,
        1,
        'Hero page includes additional local `h1`/`PageTitle as="h1"`; keep hero as the only page-level heading.'
      )
    }

    for (const hero of info.heroWrappers) {
      if (!hero.routeLiteral) {
        continue
      }

      if (!hero.hasImageProp) {
        const resolved = getPageHeaderImage(hero.routeLiteral) || getDefaultHeaderImage(hero.routeLiteral)
        if (!resolved?.src) {
          pushIssue(issues, pageFile, hero.line, `Route "${hero.routeLiteral}" does not resolve to a hero image.`)
        }

        if (
          hero.routeLiteral !== '/' &&
          resolved.resolution === 'default' &&
          !DEFAULT_HEADER_IMAGE_ALLOWED_ROUTES.has(hero.routeLiteral)
        ) {
          pushIssue(
            issues,
            pageFile,
            hero.line,
            `Route "${hero.routeLiteral}" falls back to default image but is not allow-listed.`
          )
        }
      }

      if (PRIVATE_HIRE_CHILD_ROUTES.has(hero.routeLiteral)) {
        if (hero.variantLiteral !== 'feature') {
          pushIssue(
            issues,
            pageFile,
            hero.line,
            `Private-hire child route "${hero.routeLiteral}" must use variant="feature".`
          )
        }
      }

      if (TERMINAL_ROUTES.has(hero.routeLiteral)) {
        if (!hero.primaryExpr.includes('BookTableButton')) {
          pushIssue(
            issues,
            pageFile,
            hero.line,
            `Terminal route "${hero.routeLiteral}" must use BookTableButton as primary CTA.`
          )
        }
      }

      if (LOCAL_BOOKING_PRIMARY_ROUTES.has(hero.routeLiteral)) {
        const hasBookingPrimary =
          hero.primaryExpr.includes('BookTableButton') ||
          /\/book-table/.test(hero.primaryExpr)

        if (!hasBookingPrimary) {
          pushIssue(
            issues,
            pageFile,
            hero.line,
            `Local route "${hero.routeLiteral}" must use booking-intent primary CTA.`
          )
        }
      }
    }
  }

  if (issues.length > 0) {
    console.error('Hero audit failed with the following findings:\n')
    for (const issue of issues) {
      console.error(`- ${issue}`)
    }
    process.exit(1)
  }

  console.log(`Hero audit passed for ${pages.length} page templates.`)
}

audit()
