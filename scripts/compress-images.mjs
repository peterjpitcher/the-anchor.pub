import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const PHOTO_JPEG = { quality: 82, mozjpeg: true, progressive: true, chromaSubsampling: '4:2:0' };
const HERO_JPEG = { quality: 86, mozjpeg: true, progressive: true };
const RECOMPRESS_JPEG = { quality: 80, mozjpeg: true, progressive: true };
const MAX_DIM = 2000;

let totalSaved = 0;

async function isOpaquePng(file) {
  const m = await sharp(file).metadata();
  return m.format === 'png' && !m.hasAlpha;
}

async function convertPngToJpeg(src, opts = PHOTO_JPEG) {
  const dst = src.replace(/\.png$/i, '.jpg');
  const before = (await fs.stat(src)).size;
  await sharp(src)
    .resize({ width: MAX_DIM, height: MAX_DIM, fit: 'inside', withoutEnlargement: true })
    .jpeg(opts)
    .toFile(dst);
  const after = (await fs.stat(dst)).size;
  await fs.unlink(src);
  totalSaved += before - after;
  return { src, dst, before, after };
}

async function recompressJpeg(file, opts = RECOMPRESS_JPEG, maxDim = MAX_DIM) {
  const before = (await fs.stat(file)).size;
  const tmp = file + '.tmp';
  await sharp(file)
    .resize({ width: maxDim, height: maxDim, fit: 'inside', withoutEnlargement: true })
    .jpeg(opts)
    .toFile(tmp);
  const after = (await fs.stat(tmp)).size;
  if (after < before) {
    await fs.rename(tmp, file);
    totalSaved += before - after;
    return before - after;
  }
  await fs.unlink(tmp);
  return 0;
}

async function rewriteFile(file, replacements) {
  let content = await fs.readFile(file, 'utf8');
  let changed = false;
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }
  if (changed) {
    await fs.writeFile(file, content);
  }
}

async function processBlogDir(dir) {
  const md = path.join(dir, 'index.md');
  try { await fs.access(md); } catch { return null; }

  const files = await fs.readdir(dir);
  const pngs = files.filter(f => f.endsWith('.png'));
  if (pngs.length === 0) return null;

  let savedHere = 0;
  let convertedCount = 0;
  for (const f of pngs) {
    const src = path.join(dir, f);
    if (!(await isOpaquePng(src))) continue;
    const { before, after } = await convertPngToJpeg(src);
    savedHere += before - after;
    convertedCount++;
  }
  // Update markdown references for converted files only.
  if (convertedCount > 0) {
    let mdContent = await fs.readFile(md, 'utf8');
    mdContent = mdContent.replace(/((?:image-\d+|hero))\.png/g, '$1.jpg');
    await fs.writeFile(md, mdContent);
  }
  return { dir, convertedCount, savedHere };
}

async function processSundayRoast() {
  const sundayDir = 'public/images/food/sunday-roast';
  const candidates = ['the-anchor-sunday-roast-hero.png',
                      'sunday-roast-beef-carved.png',
                      'sunday-roast-wellington-plated.png',
                      'sunday-roast-potatoes-tossed.png'];
  for (const f of candidates) {
    const src = path.join(sundayDir, f);
    try { await fs.access(src); } catch { continue; }
    if (!(await isOpaquePng(src))) continue;
    await convertPngToJpeg(src, HERO_JPEG);
  }
  // Already done in earlier commit, but safe to re-run.
}

async function processPublicSubtree(dir, sourceFilesGlob) {
  // Find all PNGs recursively in dir, convert opaque ones to JPEGs, then
  // bulk-update any source file paths that referenced .png.
  async function walk(d) {
    const out = [];
    const entries = await fs.readdir(d, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) out.push(...await walk(full));
      else if (e.name.endsWith('.png')) out.push(full);
    }
    return out;
  }
  const pngs = await walk(dir);
  const replacements = [];
  for (const src of pngs) {
    if (!(await isOpaquePng(src))) continue;
    const { dst } = await convertPngToJpeg(src);
    // Public path is /images/...
    const publicFrom = '/' + src.split('public/')[1];
    const publicTo = '/' + dst.split('public/')[1];
    replacements.push([publicFrom, publicTo]);
  }
  // Apply replacements across source files
  if (replacements.length > 0 && sourceFilesGlob) {
    for (const file of sourceFilesGlob) {
      try { await rewriteFile(file, replacements); } catch {}
    }
  }
  return { count: replacements.length };
}

async function main() {
  console.log('=== Phase A: All blog directories ===');
  const blogDirs = await fs.readdir('content/blog', { withFileTypes: true });
  let phaseACount = 0;
  for (const e of blogDirs) {
    if (!e.isDirectory()) continue;
    const result = await processBlogDir(path.join('content/blog', e.name));
    if (result && result.convertedCount > 0) {
      phaseACount += result.convertedCount;
      console.log(`  ${e.name}: ${result.convertedCount} PNG→JPEG, saved ${(result.savedHere/1024/1024).toFixed(1)} MB`);
    }
  }
  console.log(`  Total Phase A: ${phaseACount} files`);

  console.log('\n=== Phase B: public/images/private-hire ===');
  const sourceFilesB = [
    'app/private-hire/page.tsx',
    'app/christmas-parties/page.tsx',
    'app/christmas-parties/client-components.tsx',
    'components/features/christmas/ChristmasLightbox.tsx',
  ];
  const phaseB = await processPublicSubtree('public/images/private-hire', sourceFilesB);
  console.log(`  Converted ${phaseB.count} PNGs`);

  console.log('\n=== Phase C: public/images/page-headers ===');
  const phaseC = await processPublicSubtree('public/images/page-headers', sourceFilesB);
  console.log(`  Converted ${phaseC.count} PNGs`);

  console.log('\n=== Phase D: Recompress non-hero JPEGs >300KB ===');
  let recompressedCount = 0;
  for (const e of blogDirs) {
    if (!e.isDirectory()) continue;
    const dir = path.join('content/blog', e.name);
    const files = await fs.readdir(dir);
    for (const f of files) {
      if (!f.match(/^image-\d+\.jpg$/)) continue;
      const fp = path.join(dir, f);
      const sz = (await fs.stat(fp)).size;
      if (sz > 300 * 1024) {
        const saved = await recompressJpeg(fp);
        if (saved > 0) recompressedCount++;
      }
    }
  }
  console.log(`  Recompressed ${recompressedCount} JPEGs`);

  console.log(`\n=== TOTAL SAVED THIS RUN: ${(totalSaved/1024/1024).toFixed(1)} MB ===`);
}

main().catch(e => { console.error(e); process.exit(1); });
