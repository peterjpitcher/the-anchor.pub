#!/usr/bin/env node
/**
 * GSC Coverage CSV Audit Script
 * -----------------------------
 *
 * Purpose
 *   Parse every Google Search Console "Coverage Drilldown" Table.csv export under
 *   `temp/GSC Errors/`, classify each URL by `url_type` and `cohort`, and emit a
 *   single normalised CSV that downstream workstreams (orphan audit, sitemap
 *   investigation, regression tests) can consume deterministically.
 *
 * Usage
 *   node tasks/gsc-indexing-fix/audit-gsc-csvs.mjs
 *
 * Inputs
 *   - All `Table.csv` files under `temp/GSC Errors/<export-folder>/Table.csv`
 *   - Sibling `Metadata.csv` from each export folder (issue label)
 *   - Redirect maps under `config/redirects/*.json` (used to flag redirect
 *     sources)
 *
 * Outputs
 *   - tasks/gsc-indexing-fix/orchestration/wave-1/gsc-audit-script/sample-output.csv
 *       Schema: url, issue, url_type, cohort, last_crawled
 *   - tasks/gsc-indexing-fix/orchestration/wave-1/gsc-audit-script/sample-summary.txt
 *       Human-readable summary (also printed to stdout)
 *
 * Determinism
 *   Re-running on identical input produces byte-identical outputs:
 *     - Folders are processed in lexicographic order.
 *     - Rows are emitted in source order within each folder.
 *     - Summary tables are sorted alphabetically.
 *
 * CSV Parser
 *   Built-in state-machine parser (no npm dependencies). Supports:
 *     - Quoted fields containing commas, double-quotes (`""` escape), and
 *       embedded `\n` / `\r\n` line breaks.
 *     - Trailing newline tolerance.
 *   This is required because GSC exports occasionally wrap long URLs in quotes
 *   that span multiple physical lines; a naive splitter under-reports rows.
 */

import { readFile, readdir, stat, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ─── Paths ──────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const GSC_ROOT = path.join(REPO_ROOT, 'temp', 'GSC Errors');
const REDIRECTS_DIR = path.join(REPO_ROOT, 'config', 'redirects');
const OUTPUT_DIR = path.join(
  REPO_ROOT,
  'tasks',
  'gsc-indexing-fix',
  'orchestration',
  'wave-1',
  'gsc-audit-script',
);
const OUTPUT_CSV = path.join(OUTPUT_DIR, 'sample-output.csv');
const OUTPUT_SUMMARY = path.join(OUTPUT_DIR, 'sample-summary.txt');

// ─── CSV parser (RFC 4180-ish, handles embedded newlines) ───────────────────
/**
 * Parse a CSV string into a 2D array. Supports:
 *  - quoted fields with commas, escaped quotes (""), and embedded newlines.
 *  - both \n and \r\n line endings.
 *
 * @param {string} input
 * @returns {string[][]} rows of fields
 */
function parseCsv(input) {
  // Strip a UTF-8 BOM if present.
  if (input.charCodeAt(0) === 0xfeff) input = input.slice(1);

  /** @type {string[][]} */
  const rows = [];
  /** @type {string[]} */
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const len = input.length;

  while (i < len) {
    const ch = input[i];

    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          // Escaped double-quote.
          field += '"';
          i += 2;
          continue;
        }
        // End of quoted region.
        inQuotes = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }

    if (ch === ',') {
      row.push(field);
      field = '';
      i += 1;
      continue;
    }

    if (ch === '\r') {
      // Treat \r\n and lone \r as a single record separator.
      if (input[i + 1] === '\n') i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += 1;
      continue;
    }

    if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += 1;
      continue;
    }

    field += ch;
    i += 1;
  }

  // Flush the trailing record (no terminating newline).
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop fully-empty trailing rows ([] or ['']).
  while (rows.length > 0) {
    const last = rows[rows.length - 1];
    if (last.length === 0 || (last.length === 1 && last[0] === '')) {
      rows.pop();
      continue;
    }
    break;
  }

  return rows;
}

// ─── CSV writer ─────────────────────────────────────────────────────────────
/**
 * @param {string} value
 * @returns {string}
 */
function csvEscape(value) {
  const needsQuoting = /[",\n\r]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuoting ? `"${escaped}"` : escaped;
}

/**
 * @param {string[][]} rows
 * @returns {string}
 */
function toCsv(rows) {
  return rows.map((r) => r.map(csvEscape).join(',')).join('\n') + '\n';
}

// ─── Redirect source loader ─────────────────────────────────────────────────
/**
 * Load every `source` path from config/redirects/*.json into a Set.
 * Sources are stored without a trailing slash (the path-only form GSC uses).
 *
 * @returns {Promise<Set<string>>}
 */
async function loadRedirectSources() {
  const sources = new Set();
  if (!existsSync(REDIRECTS_DIR)) return sources;

  const entries = await readdir(REDIRECTS_DIR);
  for (const entry of entries) {
    if (!entry.endsWith('.json')) continue;
    const filePath = path.join(REDIRECTS_DIR, entry);
    const raw = await readFile(filePath, 'utf8');
    /** @type {{ source: string }[]} */
    let arr;
    try {
      arr = JSON.parse(raw);
    } catch (err) {
      throw new Error(`Failed to parse ${filePath}: ${err.message}`);
    }
    for (const item of arr) {
      if (item && typeof item.source === 'string') {
        sources.add(normalisePath(item.source));
      }
    }
  }
  return sources;
}

/**
 * Strip a trailing slash (except for root "/").
 * @param {string} p
 * @returns {string}
 */
function normalisePath(p) {
  if (!p) return p;
  if (p.length > 1 && p.endsWith('/')) return p.slice(0, -1);
  return p;
}

// ─── Discovery ──────────────────────────────────────────────────────────────
/**
 * Walk GSC_ROOT and return sorted list of `{folder, tablePath, metadataPath}`.
 * Only folders that contain BOTH Table.csv and Metadata.csv are included.
 *
 * @returns {Promise<{folder: string, tablePath: string, metadataPath: string}[]>}
 */
async function discoverExports() {
  if (!existsSync(GSC_ROOT)) {
    throw new Error(`GSC export root not found: ${GSC_ROOT}`);
  }
  const entries = await readdir(GSC_ROOT);
  /** @type {{folder: string, tablePath: string, metadataPath: string}[]} */
  const found = [];
  for (const entry of entries) {
    if (entry.startsWith('.')) continue;
    const full = path.join(GSC_ROOT, entry);
    let s;
    try {
      s = await stat(full);
    } catch {
      continue;
    }
    if (!s.isDirectory()) continue;
    const tablePath = path.join(full, 'Table.csv');
    const metadataPath = path.join(full, 'Metadata.csv');
    if (existsSync(tablePath) && existsSync(metadataPath)) {
      found.push({ folder: entry, tablePath, metadataPath });
    }
  }
  found.sort((a, b) => a.folder.localeCompare(b.folder));
  return found;
}

/**
 * Read the Issue label from a Metadata.csv file (column "Issue", row value).
 *
 * @param {string} metadataPath
 * @returns {Promise<string>}
 */
async function readIssueLabel(metadataPath) {
  const raw = await readFile(metadataPath, 'utf8');
  const rows = parseCsv(raw);
  // Format: header row "Property,Value", then key/value rows.
  for (const row of rows) {
    if (row[0] && row[0].trim() === 'Issue') {
      return (row[1] ?? '').trim();
    }
  }
  return '(unknown)';
}

// ─── Classification ─────────────────────────────────────────────────────────
/**
 * Extract the path portion of a URL (defensively — GSC exports occasionally
 * include URLs with no scheme).
 *
 * @param {string} url
 * @returns {string}
 */
function getPathname(url) {
  try {
    const u = new URL(url);
    return u.pathname || '/';
  } catch {
    // Fallback for malformed entries: strip scheme + host manually.
    const stripped = url.replace(/^[a-z]+:\/\/[^/]+/i, '');
    const qIdx = stripped.indexOf('?');
    return qIdx >= 0 ? stripped.slice(0, qIdx) : stripped || '/';
  }
}

/**
 * Does the URL carry any query string?
 * @param {string} url
 */
function hasQueryParams(url) {
  return url.includes('?');
}

/**
 * Classify a URL into a `url_type`.
 * Order matters: more specific buckets win over generic ones.
 *
 * @param {string} url
 * @param {Set<string>} redirectSources
 * @returns {string}
 */
function classifyUrlType(url, redirectSources) {
  const pathname = getPathname(url);
  const lower = pathname.toLowerCase();

  // Static asset: Next build output or recognised binary extension.
  if (
    /^\/_next\/static\//.test(lower) ||
    /\.(?:css|js|woff2|png|jpg|jpeg|svg|webp|gif|ico)$/.test(lower)
  ) {
    return 'static_asset';
  }

  // OG image / Next image optimiser.
  if (lower.includes('/opengraph-image') || /^\/_next\/image/.test(lower)) {
    return 'og_image';
  }

  // Legacy Wix paths (predates redirects in some cases).
  if (/^\/post\//.test(lower) || /^\/event-details\//.test(lower)) {
    return 'legacy_wix';
  }

  // Redirect source: path appears as a `source` in any redirect map.
  // Compare on the normalised pathname (no trailing slash) to match the
  // form stored in the JSON files.
  if (redirectSources.has(normalisePath(pathname))) {
    return 'redirect_source';
  }

  // Parameter variant (UTM or any query string).
  if (hasQueryParams(url)) {
    return 'parameter_variant';
  }

  // Otherwise treat as a real page.
  if (pathname && pathname.length > 0) {
    return 'page';
  }

  return 'unknown';
}

/**
 * Classify a URL into a `cohort` (path-prefix grouping).
 * `static_asset` cohort takes precedence so resource-only crawls aren't
 * miscategorised.
 *
 * @param {string} url
 * @returns {string}
 */
function classifyCohort(url) {
  const pathname = getPathname(url);
  const lower = pathname.toLowerCase();

  if (
    /^\/_next\/static\//.test(lower) ||
    /\.(?:css|js|woff2|png|jpg|jpeg|svg|webp|gif|ico)$/.test(lower) ||
    /^\/_next\/image/.test(lower)
  ) {
    return 'static_asset';
  }

  if (/^\/blog\/tag\//.test(lower)) return 'tag';
  if (/^\/blog\//.test(lower)) return 'post';
  if (/^\/post\//.test(lower)) return 'post'; // legacy Wix posts
  if (/^\/events\//.test(lower) || /^\/event-details\//.test(lower)) return 'event';
  if (/^\/drinks\//.test(lower)) return 'drink';
  if (/^\/private-hire\//.test(lower)) return 'private_hire';
  if (/^\/food-menu\//.test(lower) || /^\/food\//.test(lower)) return 'food_menu';

  return 'other';
}

// ─── Pretty summary helpers ─────────────────────────────────────────────────
/**
 * @param {Map<string, number>} map
 * @returns {[string, number][]}
 */
function sortedEntries(map) {
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

/**
 * Render a 2-axis pivot table (rows = issues, cols = url_types) as plain text.
 *
 * @param {Map<string, Map<string, number>>} pivot
 * @param {string[]} colKeys
 */
function renderPivot(pivot, colKeys) {
  const rowKeys = [...pivot.keys()].sort((a, b) => a.localeCompare(b));
  const headerCells = ['Issue', ...colKeys, 'Total'];
  const dataRows = rowKeys.map((rk) => {
    const inner = pivot.get(rk) ?? new Map();
    let total = 0;
    const cells = colKeys.map((ck) => {
      const v = inner.get(ck) ?? 0;
      total += v;
      return String(v);
    });
    return [rk, ...cells, String(total)];
  });

  // Column widths.
  const widths = headerCells.map((_, idx) => {
    let max = headerCells[idx].length;
    for (const row of dataRows) {
      if (row[idx].length > max) max = row[idx].length;
    }
    return max;
  });

  /** @param {string[]} row */
  const fmt = (row) => row.map((cell, idx) => cell.padEnd(widths[idx])).join('  ');

  const lines = [];
  lines.push(fmt(headerCells));
  lines.push(widths.map((w) => '-'.repeat(w)).join('  '));
  for (const row of dataRows) lines.push(fmt(row));
  return lines.join('\n');
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const exports = await discoverExports();
  if (exports.length === 0) {
    console.error('No GSC export folders found under', GSC_ROOT);
    process.exit(1);
  }

  const redirectSources = await loadRedirectSources();

  /** @type {string[][]} */
  const outRows = [['url', 'issue', 'url_type', 'cohort', 'last_crawled']];

  /** @type {Map<string, number>} */
  const perIssue = new Map();
  /** @type {Map<string, number>} */
  const perUrlType = new Map();
  /** @type {Map<string, number>} */
  const perCohort = new Map();
  /** @type {Map<string, Map<string, number>>} */
  const pivot = new Map();

  let totalRows = 0;

  for (const { folder, tablePath, metadataPath } of exports) {
    const issue = await readIssueLabel(metadataPath);
    const tableRaw = await readFile(tablePath, 'utf8');
    const rows = parseCsv(tableRaw);

    if (rows.length === 0) continue;

    // First row is header: "URL,Last crawled".
    const header = rows[0].map((s) => s.trim().toLowerCase());
    const urlIdx = header.indexOf('url');
    const lastCrawledIdx = header.indexOf('last crawled');
    if (urlIdx === -1) {
      throw new Error(`Could not locate "URL" column in ${tablePath} (header: ${header.join('|')})`);
    }

    for (let r = 1; r < rows.length; r += 1) {
      const row = rows[r];
      const url = (row[urlIdx] ?? '').trim();
      if (!url) continue;
      const lastCrawled = lastCrawledIdx >= 0 ? (row[lastCrawledIdx] ?? '').trim() : '';

      const urlType = classifyUrlType(url, redirectSources);
      const cohort = classifyCohort(url);

      outRows.push([url, issue, urlType, cohort, lastCrawled]);

      perIssue.set(issue, (perIssue.get(issue) ?? 0) + 1);
      perUrlType.set(urlType, (perUrlType.get(urlType) ?? 0) + 1);
      perCohort.set(cohort, (perCohort.get(cohort) ?? 0) + 1);

      let inner = pivot.get(issue);
      if (!inner) {
        inner = new Map();
        pivot.set(issue, inner);
      }
      inner.set(urlType, (inner.get(urlType) ?? 0) + 1);

      totalRows += 1;
    }
  }

  // ─── Build summary ────────────────────────────────────────────────────────
  const lines = [];
  lines.push('GSC Coverage CSV Audit — Summary');
  lines.push('================================');
  lines.push(`Total URLs processed: ${totalRows}`);
  lines.push('');

  lines.push('Per-issue counts');
  lines.push('----------------');
  for (const [k, v] of sortedEntries(perIssue)) {
    lines.push(`  ${k}: ${v}`);
  }
  lines.push('');

  lines.push('Per url_type counts');
  lines.push('-------------------');
  for (const [k, v] of sortedEntries(perUrlType)) {
    lines.push(`  ${k}: ${v}`);
  }
  lines.push('');

  lines.push('Per cohort counts');
  lines.push('-----------------');
  for (const [k, v] of sortedEntries(perCohort)) {
    lines.push(`  ${k}: ${v}`);
  }
  lines.push('');

  // Stable column ordering for the pivot table.
  const colKeys = [...perUrlType.keys()].sort((a, b) => a.localeCompare(b));
  lines.push('Pivot: issue x url_type');
  lines.push('-----------------------');
  lines.push(renderPivot(pivot, colKeys));
  lines.push('');

  const summary = lines.join('\n');

  // ─── Persist outputs ──────────────────────────────────────────────────────
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }
  await writeFile(OUTPUT_CSV, toCsv(outRows), 'utf8');
  await writeFile(OUTPUT_SUMMARY, summary + '\n', 'utf8');

  // Print summary to stdout (identical to file).
  process.stdout.write(summary + '\n');
}

main().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
