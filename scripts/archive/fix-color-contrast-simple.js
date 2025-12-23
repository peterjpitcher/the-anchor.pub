#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Color replacements map
const colorReplacements = {
  'text-gray-300': 'text-gray-600',
  'text-gray-400': 'text-gray-600',
  'text-gray-500': 'text-gray-700',
};

// Files that need to be updated based on our search
const filesToUpdate = [
  'app/blog/[slug]/page.tsx',
  'components/BusinessHours.tsx',
  'components/Weather.tsx',
  'components/Footer.tsx',
  'components/features/Gallery.tsx',
  'components/FloatingEventCTA.tsx',
  'components/features/BlogPost.tsx',
  'app/blog/tags/page.tsx',
  'app/blog/page.tsx',
  'app/sitemap-page/page.tsx',
  'app/food/pizza/page.tsx',
  'app/book-event/page.tsx',
  'app/near-heathrow/page.tsx',
  'app/m25-junction-14-pub/page.tsx',
  'app/heathrow-hotels-pub/page.tsx',
  'app/windsor-pub/page.tsx',
  'app/bedfont-pub/page.tsx',
  'app/egham-pub/page.tsx',
  'app/feltham-pub/page.tsx',
  'app/ashford-pub/page.tsx',
  'app/stanwell-pub/page.tsx',
  'app/christmas-parties/page.tsx',
  'app/corporate-events/page.tsx',
  'app/function-room-hire/page.tsx',
  'app/private-party-venue/page.tsx',
  'app/beer-garden/page.tsx',
  'app/find-us/page.tsx',
  'app/sunday-lunch/page.tsx',
  'app/drinks/page.tsx',
  'app/page.tsx',
  'components/EventBooking.tsx',
  'components/UpcomingEvents.tsx',
  'components/FilteredUpcomingEventsClient.tsx',
  'components/EventsToday.tsx',
  'components/NextEventServer.tsx',
  'components/features/EventBooking.tsx',
  'components/hero/Breadcrumbs.tsx',
  'components/ui/forms/Checkbox.tsx',
  'components/ui/forms/Radio.tsx',
  'components/ui/forms/Select.tsx',
  'components/ui/forms/Switch.tsx',
  'components/ui/navigation/Breadcrumb.tsx',
  'components/ui/overlays/Modal.tsx',
  'components/ui/LoadingState.tsx',
  'components/BusinessHoursSection.tsx',
  'components/EventCategories.tsx',
  'components/FilteredUpcomingEvents.tsx',
  'components/FlightStatus.tsx',
  'components/QuickInfoGrid.tsx',
  'components/TerminalNavigation.tsx',
  'app/blog/tag/[tag]/page.tsx',
  'app/components/page.tsx',
  'app/events/[id]/page.tsx',
  'components/ui/layout/__tests__/Card.test.tsx',
  'components/ui/navigation/__tests__/Breadcrumb.test.tsx',
  'components/ui/overlays/Toast.tsx',
  'components/ui/primitives/Input.tsx',
  'components/ui/forms/Form.tsx',
  'components/ui/forms/DatePicker.tsx',
  'app/_api-diagnostics/page.tsx',
  'app/api-test/page.tsx',
  'components/InfoBox.tsx',
  'components/DirectionsCard.tsx'
];

function processFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return { modified: false };
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    const changes = [];
    
    // Replace each color
    Object.entries(colorReplacements).forEach(([oldColor, newColor]) => {
      const regex = new RegExp(`\\b${oldColor}\\b`, 'g');
      const matches = content.match(regex);
      
      if (matches) {
        content = content.replace(regex, newColor);
        modified = true;
        changes.push(`${oldColor} → ${newColor} (${matches.length} occurrences)`);
      }
    });
    
    // Special handling for text-gray-600 to text-gray-700
    // For now, we'll leave text-gray-600 as is unless it's clearly on a light background
    // This requires manual review for best results
    
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✓ Updated ${filePath}`);
      changes.forEach(change => console.log(`  - ${change}`));
    }
    
    return { modified, filePath, changes };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return { modified: false, error: error.message };
  }
}

function main() {
  console.log('Fixing color contrast issues...\n');
  
  let totalFiles = filesToUpdate.length;
  let modifiedFiles = 0;
  
  filesToUpdate.forEach(file => {
    const result = processFile(file);
    
    if (result.modified) {
      modifiedFiles++;
    }
  });
  
  console.log(`\n✓ Complete!`);
  console.log(`  Total files scanned: ${totalFiles}`);
  console.log(`  Files modified: ${modifiedFiles}`);
  console.log(`\nColor replacements applied:`);
  console.log(`  - text-gray-300 → text-gray-600`);
  console.log(`  - text-gray-400 → text-gray-600`);
  console.log(`  - text-gray-500 → text-gray-700`);
  console.log(`\nNote: text-gray-600 instances were left as-is for manual review.`);
  console.log(`Consider upgrading them to text-gray-700 where they appear on light backgrounds.`);
}

// Run the script
main();
