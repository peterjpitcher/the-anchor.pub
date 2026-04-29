import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';

async function walkPngs(d) {
  const out = [];
  const entries = await fs.readdir(d, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(d, e.name);
    if (e.isDirectory()) out.push(...await walkPngs(full));
    else if (e.name.endsWith('.png')) out.push(full);
  }
  return out;
}

async function isOpaque(file) {
  const m = await sharp(file).metadata();
  return m.format === 'png' && !m.hasAlpha;
}

async function main() {
  const pngs = await walkPngs('public/images');
  const replacements = []; // [publicPath.png, publicPath.jpg]
  let saved = 0;
  for (const src of pngs) {
    if (!(await isOpaque(src))) continue;
    const dst = src.replace(/\.png$/, '.jpg');
    const before = (await fs.stat(src)).size;
    await sharp(src)
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true, progressive: true })
      .toFile(dst);
    const after = (await fs.stat(dst)).size;
    await fs.unlink(src);
    saved += before - after;
    const pubFrom = '/' + src.split('public/')[1];
    const pubTo = '/' + dst.split('public/')[1];
    replacements.push([pubFrom, pubTo]);
    console.log(`  ${pubFrom}: ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB`);
  }

  if (replacements.length === 0) {
    console.log('No opaque PNGs found.');
    return;
  }

  console.log(`\nUpdating source references for ${replacements.length} files...`);

  // Find candidate source files via grep (one big OR pattern)
  const pattern = replacements.map(([from]) => from.replace(/[.\/]/g, '\\$&')).join('\\|');
  let files = '';
  try {
    files = execSync(`grep -rl "${pattern}" app components lib content --include="*.tsx" --include="*.ts" --include="*.js" --include="*.json" --include="*.md" 2>/dev/null || true`, { encoding: 'utf8' });
  } catch (e) {
    files = e.stdout || '';
  }
  const fileList = files.split('\n').filter(Boolean);
  console.log(`  Found ${fileList.length} files referencing converted PNGs`);

  for (const file of fileList) {
    let content = await fs.readFile(file, 'utf8');
    let changed = false;
    for (const [from, to] of replacements) {
      if (content.includes(from)) {
        content = content.split(from).join(to);
        changed = true;
      }
    }
    if (changed) await fs.writeFile(file, content);
  }
  console.log(`\n=== Saved: ${(saved/1024/1024).toFixed(1)} MB ===`);
}

main().catch(e => { console.error(e); process.exit(1); });
