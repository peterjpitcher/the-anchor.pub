import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType, PageBreak } from 'docx';
import fs from 'fs';

const ssot = JSON.parse(fs.readFileSync('SSOT.json', 'utf8'));

const GREY = { type: ShadingType.SOLID, color: "DDDDDD" };
const WHITE = { type: ShadingType.SOLID, color: "FFFFFF" };
const LIGHT_RED = { type: ShadingType.SOLID, color: "FFE0E0" };
const LIGHT_GREEN = { type: ShadingType.SOLID, color: "E0FFE0" };

function makeHeaderCell(text) {
  return new TableCell({
    shading: GREY,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20 })] })],
  });
}

function makeCell(text, shading = WHITE) {
  return new TableCell({
    shading,
    children: [new Paragraph({ children: [new TextRun({ text: String(text || ''), size: 20 })] })],
  });
}

function makeTable(headers, rows) {
  const headerRow = new TableRow({
    children: headers.map(h => makeHeaderCell(h)),
    tableHeader: true,
  });
  const dataRows = rows.map(cells => new TableRow({
    children: cells.map((c, i) => {
      const shading = typeof c === 'object' && c.shading ? c.shading : WHITE;
      const text = typeof c === 'object' && c.text !== undefined ? c.text : String(c || '');
      return makeCell(text, shading);
    }),
  }));
  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, children: [new TextRun({ text })] });
}

function para(text) {
  return new Paragraph({ children: [new TextRun({ text, size: 20 })] });
}

function flattenObject(obj, prefix = '') {
  const rows = [];
  for (const [key, val] of Object.entries(obj)) {
    const label = prefix ? `${prefix}: ${key}` : key;
    if (val === null || val === undefined) {
      rows.push([label, '(null)', '']);
    } else if (typeof val === 'object' && !Array.isArray(val)) {
      rows.push(...flattenObject(val, label));
    } else if (Array.isArray(val)) {
      if (val.length > 0 && typeof val[0] === 'object') {
        val.forEach((item, i) => {
          rows.push(...flattenObject(item, `${label} [${i + 1}]`));
        });
      } else {
        rows.push([label, val.join(', '), '']);
      }
    } else {
      rows.push([label, String(val), '']);
    }
  }
  return rows;
}

// Build document sections
const children = [];

// Title page
children.push(new Paragraph({ spacing: { before: 4000 } }));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'The Anchor', bold: true, size: 56, color: '005131' })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'Single Source of Truth', size: 40, color: '005131' })],
}));
children.push(new Paragraph({ spacing: { before: 400 } }));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'Brand Review Document — 2026-03-22', size: 24, italic: true })],
}));
children.push(new Paragraph({ spacing: { before: 600 } }));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'HOW TO REVIEW:', bold: true, size: 22 })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'Add your comments, corrections, or approvals in the "Your Comments" column.', size: 20 })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'If a value is correct, write "OK". If it needs changing, write the correct value.', size: 20 })],
}));

// Sections to render
const sections = [
  { key: 'identity', title: 'Brand Identity' },
  { key: 'contact', title: 'Contact Details' },
  { key: 'location', title: 'Location & Address' },
  { key: 'heathrow_proximity', title: 'Heathrow Proximity' },
  { key: 'digital', title: 'Digital Presence' },
  { key: 'brand_guidelines', title: 'Brand Guidelines' },
  { key: 'venue', title: 'Venue Details' },
  { key: 'beer_garden', title: 'Beer Garden' },
  { key: 'food', title: 'Food & Menu' },
  { key: 'sunday_roast', title: 'Sunday Roast' },
  { key: 'drinks', title: 'Drinks' },
  { key: 'offers', title: 'Current Offers' },
  { key: 'discontinued_offers', title: 'Discontinued Offers (TO REMOVE)' },
  { key: 'events', title: 'Events & Entertainment' },
  { key: 'private_hire', title: 'Private Hire' },
  { key: 'heathrow_parking', title: 'Heathrow Parking' },
  { key: 'sustainability', title: 'Sustainability' },
  { key: 'food_hygiene', title: 'Food Hygiene' },
  { key: 'ratings', title: 'Ratings & Reviews' },
  { key: 'target_audiences', title: 'Target Audiences' },
  { key: 'psychographic_segments', title: 'Psychographic Segments' },
  { key: 'competitive_landscape', title: 'Competitive Landscape' },
  { key: 'community_context', title: 'Community Context' },
  { key: 'seo_keywords', title: 'SEO Keywords' },
  { key: 'areas_served', title: 'Areas Served' },
  { key: 'nearby_hotels', title: 'Nearby Hotels' },
];

for (const section of sections) {
  const data = ssot[section.key];
  if (!data) continue;

  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(heading(section.title));
  children.push(para(''));

  if (Array.isArray(data)) {
    if (typeof data[0] === 'string') {
      const rows = data.map((item, i) => [`${i + 1}`, item, '']);
      children.push(makeTable(['#', 'Value', 'Your Comments'], rows));
    } else {
      const rows = [];
      data.forEach((item, i) => {
        rows.push(...flattenObject(item, `[${i + 1}]`));
      });
      children.push(makeTable(['Item', 'Current Value', 'Your Comments'], rows));
    }
  } else if (typeof data === 'object') {
    const rows = flattenObject(data);
    children.push(makeTable(['Item', 'Current Value', 'Your Comments'], rows));
  }
}

// Do Not Use section
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(heading('DO NOT USE — Prohibited Claims', HeadingLevel.HEADING_1));
children.push(para('These items must NOT appear in any new copy, page, or marketing material.'));
children.push(para(''));
if (ssot.do_not_use) {
  const rows = Object.entries(ssot.do_not_use).map(([item, reason]) => [
    item.replace(/_/g, ' '),
    String(reason),
    '',
  ]);
  children.push(makeTable(['Prohibited Item', 'Reason', 'Your Comments'], rows));
}

// Resolved Inconsistencies
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(heading('Resolved Inconsistencies', HeadingLevel.HEADING_1));
children.push(para('These were identified during the audit and resolved on 2026-03-22. Review the resolutions below.'));
children.push(para(''));
if (ssot.resolved_inconsistencies) {
  const rows = ssot.resolved_inconsistencies.map(item => [
    item.issue,
    item.resolution,
    '',
  ]);
  children.push(makeTable(['Issue', 'Resolution', 'Your Comments'], rows));
}

// Generate
const doc = new Document({
  creator: 'The Anchor SSOT Generator',
  title: 'The Anchor — Single Source of Truth Review',
  description: 'Line-by-line brand review document',
  sections: [{ children }],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync('docs/SSOT-Review-The-Anchor.docx', buffer);
console.log('Generated: docs/SSOT-Review-The-Anchor.docx');
console.log('Size:', (buffer.length / 1024).toFixed(1), 'KB');
