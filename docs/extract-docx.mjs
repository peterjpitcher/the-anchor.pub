import JSZip from 'jszip';
import fs from 'fs';

const docxBuffer = fs.readFileSync('docs/SSOT-Review-The-Anchor.docx');
const zip = await JSZip.loadAsync(docxBuffer);
const xml = await zip.file('word/document.xml').async('string');

// Extract text from XML, preserving table structure
const rows = [];
let currentRow = [];
let currentCell = '';
let inRow = false;
let inCell = false;

// Simple XML parser for table content
const tagRegex = /<(\/?)w:(tr|tc|t|p|br)[^>]*>|<w:t[^>]*>([^<]*)<\/w:t>/g;
let match;

while ((match = tagRegex.exec(xml)) !== null) {
  const [full, closing, tag, text] = match;

  if (tag === 'tr' && !closing) { inRow = true; currentRow = []; }
  if (tag === 'tr' && closing) { inRow = false; if (currentRow.length > 0) rows.push(currentRow); }
  if (tag === 'tc' && !closing) { inCell = true; currentCell = ''; }
  if (tag === 'tc' && closing) { inCell = false; currentRow.push(currentCell.trim()); }
  if (tag === 'p' && closing && inCell) { currentCell += ' | '; }

  if (text !== undefined && text.length > 0) {
    if (inCell) {
      currentCell += text;
    } else {
      // Non-table text (headings, paragraphs)
      rows.push(['__TEXT__', text]);
    }
  }
}

// Output as structured text
let currentSection = '';
for (const row of rows) {
  if (row[0] === '__TEXT__') {
    const text = row[1].trim();
    if (text.length > 0) {
      console.log(`\n=== ${text} ===`);
      currentSection = text;
    }
    continue;
  }

  // Only show rows where the 3rd column (comments) has content
  if (row.length >= 3) {
    const item = (row[0] || '').trim().replace(/ \| $/g, '');
    const value = (row[1] || '').trim().replace(/ \| $/g, '');
    const comment = (row[2] || '').trim().replace(/ \| $/g, '');

    if (comment && comment !== '' && item !== 'Item' && item !== '#' && item !== 'Prohibited Item' && item !== 'Issue') {
      console.log(`[${item}] ${value} → COMMENT: ${comment}`);
    }
  }
}

// Also dump ALL rows with comments for completeness
console.log('\n\n========== FULL TABLE DUMP (rows with comments only) ==========\n');
for (const row of rows) {
  if (row[0] === '__TEXT__') continue;
  if (row.length >= 3) {
    const comment = (row[2] || '').trim().replace(/ \| $/g, '');
    if (comment && comment !== '' && !['Your Comments', 'Item', '#', 'Prohibited Item', 'Issue'].includes((row[0]||'').trim().replace(/ \| $/g, ''))) {
      console.log(`ITEM: ${(row[0]||'').trim().replace(/ \| $/g, '')}`);
      console.log(`VALUE: ${(row[1]||'').trim().replace(/ \| $/g, '')}`);
      console.log(`COMMENT: ${comment}`);
      console.log('---');
    }
  }
}
