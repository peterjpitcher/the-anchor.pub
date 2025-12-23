#!/usr/bin/env node

/**
 * Batch migration script for CallToAction to Button components
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Files to migrate (high priority pages)
const filesToMigrate = [
  'app/near-heathrow/page.tsx',
  'app/sunday-lunch/page.tsx',
  'app/corporate-events/page.tsx',
  'app/christmas-parties/page.tsx',
  'app/private-party-venue/page.tsx',
  'app/function-room-hire/page.tsx',
  'app/book-event/page.tsx',
  'app/whats-on/drag-shows/page.tsx',
  'app/staines-pub/page.tsx',
  'app/feltham-pub/page.tsx',
  'app/ashford-pub/page.tsx',
  'app/windsor-pub/page.tsx',
  'app/stanwell-pub/page.tsx',
  'app/egham-pub/page.tsx',
  'app/bedfont-pub/page.tsx',
  'app/heathrow-hotels-pub/page.tsx',
  'app/m25-junction-14-pub/page.tsx',
  'app/near-heathrow/terminal-2/page.tsx',
  'app/near-heathrow/terminal-3/page.tsx',
  'app/near-heathrow/terminal-4/page.tsx',
  'app/near-heathrow/terminal-5/page.tsx'
];

const rootDir = path.resolve(__dirname, '..');
const migrationScript = path.join(rootDir, 'scripts', 'migrate-cta.js');

console.log(`${colors.cyan}Starting batch migration of CallToAction components...${colors.reset}\n`);

let successCount = 0;
let skipCount = 0;
let errorCount = 0;

filesToMigrate.forEach((file, index) => {
  const filePath = path.join(rootDir, file);
  
  console.log(`${colors.blue}[${index + 1}/${filesToMigrate.length}] Processing: ${file}${colors.reset}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`${colors.red}  ✗ File not found${colors.reset}\n`);
    errorCount++;
    return;
  }
  
  try {
    const output = execSync(`node "${migrationScript}" "${filePath}"`, { encoding: 'utf8' });
    
    if (output.includes('Migrated successfully')) {
      console.log(`${colors.green}  ✓ Migrated successfully${colors.reset}\n`);
      successCount++;
    } else if (output.includes('No CallToAction found')) {
      console.log(`${colors.yellow}  - No changes needed${colors.reset}\n`);
      skipCount++;
    } else {
      console.log(`${colors.yellow}  - ${output.trim()}${colors.reset}\n`);
      skipCount++;
    }
  } catch (error) {
    console.log(`${colors.red}  ✗ Error: ${error.message}${colors.reset}\n`);
    errorCount++;
  }
});

console.log(`${colors.cyan}\nMigration Summary:${colors.reset}`);
console.log(`${colors.green}  Successfully migrated: ${successCount} files${colors.reset}`);
console.log(`${colors.yellow}  Skipped (no changes): ${skipCount} files${colors.reset}`);
console.log(`${colors.red}  Errors: ${errorCount} files${colors.reset}`);

if (successCount > 0) {
  console.log(`\n${colors.magenta}Backup files have been created with .backup extension${colors.reset}`);
  console.log(`${colors.magenta}To restore a file: cp file.tsx.backup file.tsx${colors.reset}`);
}
