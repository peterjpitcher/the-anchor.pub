import JSZip from 'jszip';
import fs from 'fs';

const docxBuffer = fs.readFileSync('docs/SSOT-Review-The-Anchor.docx');
const zip = await JSZip.loadAsync(docxBuffer);
const xml = await zip.file('word/document.xml').async('string');

// Parse all text runs within table cells properly
// We need to track: tables > rows > cells > paragraphs > runs
function extractTables(xml) {
  const tables = [];

  // Split by table boundaries
  const tableMatches = xml.match(/<w:tbl\b[^>]*>[\s\S]*?<\/w:tbl>/g) || [];

  for (const tableXml of tableMatches) {
    const table = [];
    const rowMatches = tableXml.match(/<w:tr\b[^>]*>[\s\S]*?<\/w:tr>/g) || [];

    for (const rowXml of rowMatches) {
      const row = [];
      const cellMatches = rowXml.match(/<w:tc\b[^>]*>[\s\S]*?<\/w:tc>/g) || [];

      for (const cellXml of cellMatches) {
        // Extract ALL text from within this cell, joining paragraph text
        const paragraphs = [];
        const paraMatches = cellXml.match(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g) || [];

        for (const paraXml of paraMatches) {
          const texts = [];
          const textMatches = paraXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];

          for (const textMatch of textMatches) {
            const content = textMatch.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, '');
            texts.push(content);
          }
          if (texts.length > 0) {
            paragraphs.push(texts.join(''));
          }
        }
        row.push(paragraphs.join(' ').trim());
      }
      if (row.length > 0) {
        table.push(row);
      }
    }
    tables.push(table);
  }
  return tables;
}

// Also extract headings (non-table paragraphs)
function extractHeadings(xml) {
  const headings = [];
  // Find paragraphs with heading styles outside tables
  const stripped = xml.replace(/<w:tbl\b[^>]*>[\s\S]*?<\/w:tbl>/g, '___TABLE___');
  const paraMatches = stripped.match(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g) || [];

  for (const paraXml of paraMatches) {
    if (paraXml.includes('___TABLE___')) continue;
    const texts = [];
    const textMatches = paraXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    for (const tm of textMatches) {
      texts.push(tm.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, ''));
    }
    const fullText = texts.join('').trim();
    if (fullText.length > 0) {
      headings.push(fullText);
    }
  }
  return headings;
}

const tables = extractTables(xml);

console.log(`Found ${tables.length} tables\n`);

let commentCount = 0;
let sectionIndex = 0;

for (const table of tables) {
  if (table.length === 0) continue;
  sectionIndex++;

  // First row is header
  const header = table[0];
  const commentColIndex = header.findIndex(h =>
    h.toLowerCase().includes('comment') || h.toLowerCase().includes('your')
  );

  if (commentColIndex === -1) continue;

  let sectionPrinted = false;

  for (let r = 1; r < table.length; r++) {
    const row = table[r];
    if (row.length <= commentColIndex) continue;

    const comment = row[commentColIndex]?.trim();
    if (comment && comment.length > 0) {
      if (!sectionPrinted) {
        console.log(`\n--- Table ${sectionIndex} (header: ${header.slice(0, 2).join(' | ')}) ---`);
        sectionPrinted = true;
      }
      commentCount++;
      const item = row[0]?.trim() || '(no item)';
      const value = row.length > 1 ? row[1]?.trim() : '';
      console.log(`  ITEM: ${item}`);
      if (value) console.log(`  VALUE: ${value}`);
      console.log(`  COMMENT: ${comment}`);
      console.log('');
    }
  }
}

if (commentCount === 0) {
  console.log('\n=== NO COMMENTS FOUND IN ANY TABLE CELLS ===');
  console.log('\nDumping all non-empty cells from all tables for debugging:\n');

  for (let t = 0; t < tables.length; t++) {
    const table = tables[t];
    for (let r = 0; r < table.length; r++) {
      const row = table[r];
      const nonEmpty = row.filter(c => c.trim().length > 0);
      if (nonEmpty.length > 0) {
        console.log(`Table ${t+1}, Row ${r+1}: [${row.map(c => c.substring(0, 60)).join(' | ')}]`);
      }
    }
  }
} else {
  console.log(`\n=== TOTAL: ${commentCount} comments found ===`);
}

// Also check for Word comments (stored in comments.xml)
const commentsFile = zip.file('word/comments.xml');
if (commentsFile) {
  console.log('\n=== WORD MARGIN COMMENTS FOUND ===\n');
  const commentsXml = await commentsFile.async('string');
  const commentMatches = commentsXml.match(/<w:comment\b[^>]*>[\s\S]*?<\/w:comment>/g) || [];
  for (const c of commentMatches) {
    const author = c.match(/w:author="([^"]*)"/)?.[1] || 'unknown';
    const texts = [];
    const tms = c.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    for (const tm of tms) texts.push(tm.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, ''));
    console.log(`[${author}]: ${texts.join('')}`);
  }
}
