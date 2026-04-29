import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const JPEG_OPTS = { quality: 82, mozjpeg: true, progressive: true, chromaSubsampling: '4:2:0' };
const HERO_JPEG_OPTS = { quality: 80, mozjpeg: true, progressive: true };

async function convertDirPngsToJpeg(dir, indexFile) {
  const files = (await fs.readdir(dir)).filter(f => f.endsWith('.png'));
  let savedBytes = 0;
  for (const f of files) {
    const src = path.join(dir, f);
    const jpgName = f.replace(/\.png$/, '.jpg');
    const dst = path.join(dir, jpgName);
    const before = (await fs.stat(src)).size;
    // Resize to max 1600px on longest side (keeps small images intact)
    await sharp(src).resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).jpeg(JPEG_OPTS).toFile(dst);
    const after = (await fs.stat(dst)).size;
    await fs.unlink(src);
    savedBytes += before - after;
  }
  if (indexFile) {
    let md = await fs.readFile(indexFile, 'utf8');
    md = md.replace(/(image-\d+|hero)\.png/g, '$1.jpg');
    await fs.writeFile(indexFile, md);
  }
  return { count: files.length, savedBytes };
}

async function recompressJpeg(file, opts = HERO_JPEG_OPTS) {
  const before = (await fs.stat(file)).size;
  // sharp can't safely write to the same path it's reading; use tmp
  const tmp = file + '.tmp';
  await sharp(file).resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }).jpeg(opts).toFile(tmp);
  const after = (await fs.stat(tmp)).size;
  if (after < before) {
    await fs.rename(tmp, file);
    return before - after;
  }
  await fs.unlink(tmp);
  return 0;
}

async function main() {
  const tasks = [];
  let total = 0;

  // Phase 1: Sunday roast PNGs in /public — delete unused lightbox, convert rest.
  const sundayDir = 'public/images/food/sunday-roast';
  await fs.unlink(path.join(sundayDir, 'sunday-roast-lightbox.png')).catch(() => {});

  const sundayPngs = ['the-anchor-sunday-roast-hero.png',
                      'sunday-roast-beef-carved.png',
                      'sunday-roast-wellington-plated.png',
                      'sunday-roast-potatoes-tossed.png'];
  for (const f of sundayPngs) {
    const src = path.join(sundayDir, f);
    try { await fs.access(src); } catch { continue; }
    const jpgName = f.replace(/\.png$/, '.jpg');
    const dst = path.join(sundayDir, jpgName);
    const before = (await fs.stat(src)).size;
    await sharp(src).resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 86, mozjpeg: true, progressive: true }).toFile(dst);
    const after = (await fs.stat(dst)).size;
    await fs.unlink(src);
    total += before - after;
    console.log(`  ${f} → ${jpgName}: ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB`);
  }

  // Phase 2: december-celebrations
  console.log('\n=== december-celebrations ===');
  const a = await convertDirPngsToJpeg('content/blog/december-celebrations', 'content/blog/december-celebrations/index.md');
  console.log(`  Converted ${a.count} PNGs, saved ${(a.savedBytes/1024/1024).toFixed(1)} MB`);
  total += a.savedBytes;

  // Phase 3: day-of-the-dead-halloween-party-costumes-dance-and
  console.log('\n=== day-of-the-dead-halloween-... ===');
  const b = await convertDirPngsToJpeg('content/blog/day-of-the-dead-halloween-party-costumes-dance-and', 'content/blog/day-of-the-dead-halloween-party-costumes-dance-and/index.md');
  console.log(`  Converted ${b.count} PNGs, saved ${(b.savedBytes/1024/1024).toFixed(1)} MB`);
  total += b.savedBytes;

  // Phase 4: large hero JPGs >500KB across content/blog/*
  console.log('\n=== Hero JPGs > 500KB ===');
  let heroSaved = 0;
  let heroCount = 0;
  const blogDirs = await fs.readdir('content/blog', { withFileTypes: true });
  for (const e of blogDirs) {
    if (!e.isDirectory()) continue;
    const heroJpg = path.join('content/blog', e.name, 'hero.jpg');
    try {
      const sz = (await fs.stat(heroJpg)).size;
      if (sz > 500 * 1024) {
        const saved = await recompressJpeg(heroJpg);
        if (saved > 0) {
          heroSaved += saved;
          heroCount++;
        }
      }
    } catch {}
  }
  console.log(`  Recompressed ${heroCount} hero JPGs, saved ${(heroSaved/1024/1024).toFixed(1)} MB`);
  total += heroSaved;

  console.log(`\n=== Grand total saved: ${(total/1024/1024).toFixed(1)} MB ===`);
}

main().catch(e => { console.error(e); process.exit(1); });
