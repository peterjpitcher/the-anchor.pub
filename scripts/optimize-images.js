#!/usr/bin/env node

/**
 * Unified image optimisation utility.
 *
 * Optimises JPEG/PNG/WebP assets in the content/blog tree and public/images
 * so that blog posts and page heroes stay lean enough for serverless limits.
 *
 * Usage:
 *   npm run optimize:images            # optimise the default directories
 *   npm run optimize:images -- path/to/dir another/dir
 */

const path = require('path')
const fs = require('fs/promises')
const { existsSync } = require('fs')
const sharp = require('sharp')

sharp.cache(false)

const DEFAULT_DIRECTORIES = [
  path.join(process.cwd(), 'content', 'blog'),
  path.join(process.cwd(), 'public', 'images')
]

const VALID_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

const CONFIG = {
  maxWidth: 1920,
  maxHeight: 1080,
  blogMaxWidth: 1600,
  blogMaxHeight: 1000,
  sizeThreshold: 40 * 1024, // skip tiny assets (< 40 KB)
  jpegQuality: 78,
  pngCompressionLevel: 9,
  pngPalette: true,
  webpQuality: 80,
  minSavingRatio: 0.02 // require at least 2% reduction before overwriting
}

const summary = {
  scanned: 0,
  optimised: 0,
  skipped: 0,
  errors: 0,
  bytesBefore: 0,
  bytesAfter: 0
}

const ignoredDirectories = new Set([
  'node_modules',
  '.git',
  '.next',
  '.backup',
  'archive'
])

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const idx = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, idx)
  return `${size.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`
}

async function optimiseFile(filePath) {
  summary.scanned++

  const ext = path.extname(filePath).toLowerCase()
  if (!VALID_EXTENSIONS.has(ext)) {
    summary.skipped++
    return
  }

  let original
  try {
    original = await fs.readFile(filePath)
  } catch (error) {
    console.warn(`⚠️  Unable to read ${filePath}: ${error.message}`)
    summary.errors++
    return
  }

  if (original.length < CONFIG.sizeThreshold) {
    summary.skipped++
    summary.bytesBefore += original.length
    summary.bytesAfter += original.length
    return
  }

  // sharp 0.35 renamed `failOnError: false` to `failOn: 'none'`.
  let pipeline = sharp(original, { failOn: 'none' })

  let metadata
  try {
    metadata = await pipeline.metadata()
  } catch (error) {
    console.warn(`⚠️  Sharp metadata error on ${filePath}: ${error.message}`)
    summary.errors++
    summary.bytesBefore += original.length
    summary.bytesAfter += original.length
    return
  }

  // Determine max size (blogs get tighter bounds)
  const isBlogAsset = filePath.includes(`${path.sep}content${path.sep}blog${path.sep}`)
  const maxWidth = isBlogAsset ? CONFIG.blogMaxWidth : CONFIG.maxWidth
  const maxHeight = isBlogAsset ? CONFIG.blogMaxHeight : CONFIG.maxHeight

  if (
    (metadata.width && metadata.width > maxWidth) ||
    (metadata.height && metadata.height > maxHeight)
  ) {
    pipeline = pipeline.resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true
    })
  }

  switch (ext) {
    case '.jpg':
    case '.jpeg':
      pipeline = pipeline.jpeg({
        quality: CONFIG.jpegQuality,
        mozjpeg: true,
        progressive: true
      })
      break
    case '.png':
      pipeline = pipeline.png({
        compressionLevel: CONFIG.pngCompressionLevel,
        palette: CONFIG.pngPalette
      })
      break
    case '.webp':
      pipeline = pipeline.webp({
        quality: CONFIG.webpQuality
      })
      break
    default:
      summary.skipped++
      summary.bytesBefore += original.length
      summary.bytesAfter += original.length
      return
  }

  let optimised
  try {
    optimised = await pipeline.toBuffer()
  } catch (error) {
    console.warn(`⚠️  Optimisation failed for ${filePath}: ${error.message}`)
    summary.errors++
    summary.bytesBefore += original.length
    summary.bytesAfter += original.length
    return
  }

  const savings = original.length - optimised.length
  const savingRatio = savings / original.length

  summary.bytesBefore += original.length

  if (savingRatio < CONFIG.minSavingRatio) {
    summary.skipped++
    summary.bytesAfter += original.length
    return
  }

  try {
    await fs.writeFile(filePath, optimised)
    summary.optimised++
    summary.bytesAfter += optimised.length
    console.log(
      `✅ ${path.relative(process.cwd(), filePath)}: ${formatBytes(original.length)} → ${formatBytes(optimised.length)} (${(
        savingRatio * 100
      ).toFixed(1)}% saved)`
    )
  } catch (error) {
    console.warn(`⚠️  Unable to write ${filePath}: ${error.message}`)
    summary.errors++
    summary.bytesAfter += original.length
  }
}

async function walkDirectory(directory) {
  if (!existsSync(directory)) {
    return
  }

  const entries = await fs.readdir(directory, { withFileTypes: true })
  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) {
      continue
    }

    const fullPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      await walkDirectory(fullPath)
    } else if (entry.isFile()) {
      await optimiseFile(fullPath)
    }
  }
}

async function main() {
  const customTargets = process.argv.slice(2)
  const targets = customTargets.length
    ? customTargets.map((target) => path.resolve(process.cwd(), target))
    : DEFAULT_DIRECTORIES

  console.log('🖼️  Optimising images')
  console.log('=====================')
  targets.forEach((target) => {
    console.log(`• ${target}`)
  })
  console.log('')

  const start = Date.now()

  for (const target of targets) {
    await walkDirectory(target)
  }

  const duration = ((Date.now() - start) / 1000).toFixed(1)
  const savedBytes = summary.bytesBefore - summary.bytesAfter
  const savedPercent = summary.bytesBefore
    ? ((savedBytes / summary.bytesBefore) * 100).toFixed(1)
    : '0.0'

  console.log('\n📊 Summary')
  console.log('==========')
  console.log(`Files scanned:    ${summary.scanned}`)
  console.log(`Optimised:        ${summary.optimised}`)
  console.log(`Skipped:          ${summary.skipped}`)
  console.log(`Errors:           ${summary.errors}`)
  console.log(`Size before:      ${formatBytes(summary.bytesBefore)}`)
  console.log(`Size after:       ${formatBytes(summary.bytesAfter)}`)
  console.log(`Total saved:      ${formatBytes(savedBytes)} (${savedPercent}%)`)
  console.log(`Duration:         ${duration}s`)
}

main().catch((error) => {
  console.error('❌ Optimisation failed:', error)
  process.exit(1)
})
