const fs = require('fs');
const path = require('path');

// Terminal pages configuration
const terminalPages = [
  { file: 'app/near-heathrow/terminal-2/page.tsx', terminal: 'Terminal 2' },
  { file: 'app/near-heathrow/terminal-3/page.tsx', terminal: 'Terminal 3' },
  { file: 'app/near-heathrow/terminal-4/page.tsx', terminal: 'Terminal 4' },
  { file: 'app/near-heathrow/terminal-5/page.tsx', terminal: 'Terminal 5' }
];

// Location pages configuration
const locationPages = [
  { file: 'app/ashford-pub/page.tsx', location: 'Ashford' },
  { file: 'app/bedfont-pub/page.tsx', location: 'Bedfont' },
  { file: 'app/egham-pub/page.tsx', location: 'Egham' },
  { file: 'app/feltham-pub/page.tsx', location: 'Feltham' },
  { file: 'app/staines-pub/page.tsx', location: 'Staines' },
  { file: 'app/stanwell-pub/page.tsx', location: 'Stanwell' },
  { file: 'app/windsor-pub/page.tsx', location: 'Windsor' },
  { file: 'app/heathrow-hotels-pub/page.tsx', location: 'Heathrow Hotels' },
  { file: 'app/m25-junction-14-pub/page.tsx', location: 'M25 Junction 14' }
];

// Food pages configuration
const foodPages = [
  { file: 'app/food-menu/page.tsx', breadcrumbs: [{ name: 'Food & Drink', href: '/food-menu' }, { name: 'Menu' }] },
  { file: 'app/drinks/page.tsx', breadcrumbs: [{ name: 'Food & Drink', href: '/food-menu' }, { name: 'Drinks' }] },
  { file: 'app/food/pizza/page.tsx', breadcrumbs: [{ name: 'Food & Drink', href: '/food-menu' }, { name: 'Pizza Menu' }] },
  { file: 'app/sunday-lunch/page.tsx', breadcrumbs: [{ name: 'Food & Drink', href: '/food-menu' }, { name: 'Sunday Lunch' }] }
];

// Venue pages configuration
const venuePages = [
  { file: 'app/function-room-hire/page.tsx', breadcrumbs: [{ name: 'Venue', href: '/function-room-hire' }, { name: 'Function Room Hire' }] },
  { file: 'app/private-party-venue/page.tsx', breadcrumbs: [{ name: 'Venue', href: '/function-room-hire' }, { name: 'Private Parties' }] },
  { file: 'app/corporate-events/page.tsx', breadcrumbs: [{ name: 'Venue', href: '/function-room-hire' }, { name: 'Corporate Events' }] },
  { file: 'app/christmas-parties/page.tsx', breadcrumbs: [{ name: 'Venue', href: '/function-room-hire' }, { name: 'Christmas Parties' }] },
  { file: 'app/beer-garden/page.tsx', breadcrumbs: [{ name: 'Venue', href: '/beer-garden' }, { name: 'Beer Garden' }] }
];

function updateFile(filePath, updateFunction) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Update imports if needed
    if (!content.includes('import { HeroWrapper, Breadcrumbs }') && content.includes('import { HeroWrapper }')) {
      content = content.replace("import { HeroWrapper }", "import { HeroWrapper, Breadcrumbs }");
    }
    
    // Apply the specific update function
    content = updateFunction(content);
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated ${filePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Update terminal pages
terminalPages.forEach(({ file, terminal }) => {
  updateFile(file, (content) => {
    // Find HeroWrapper and add breadcrumbs
    const heroWrapperRegex = /<HeroWrapper\s+([\s\S]*?)(\s+)(tags=|cta=)/;
    
    if (!content.includes('breadcrumbs=')) {
      const breadcrumbsCode = `breadcrumbs={
          <Breadcrumbs
            items={[
              { name: 'Near Heathrow', href: '/near-heathrow' },
              { name: '${terminal}' }
            ]}
            theme="dark"
          />
        }`;
      
      content = content.replace(heroWrapperRegex, (match, props, space, next) => {
        return `<HeroWrapper
        ${props.trim()}
        ${breadcrumbsCode}
        ${next}`;
      });
    }
    
    return content;
  });
});

// Update location pages
locationPages.forEach(({ file, location }) => {
  updateFile(file, (content) => {
    const heroWrapperRegex = /<HeroWrapper\s+([\s\S]*?)(\s+)(tags=|cta=|>)/;
    
    if (!content.includes('breadcrumbs=')) {
      const breadcrumbsCode = `breadcrumbs={
          <Breadcrumbs
            items={[
              { name: 'Locations', href: '/find-us' },
              { name: '${location}' }
            ]}
            theme="dark"
          />
        }`;
      
      content = content.replace(heroWrapperRegex, (match, props, space, next) => {
        return `<HeroWrapper
        ${props.trim()}
        ${breadcrumbsCode}
        ${next}`;
      });
    }
    
    return content;
  });
});

// Update food pages
foodPages.forEach(({ file, breadcrumbs }) => {
  updateFile(file, (content) => {
    const heroWrapperRegex = /<HeroWrapper\s+([\s\S]*?)(\s+)(tags=|cta=|>)/;
    
    if (!content.includes('breadcrumbs=')) {
      const items = breadcrumbs.map(item => 
        item.href 
          ? `{ name: '${item.name}', href: '${item.href}' }`
          : `{ name: '${item.name}' }`
      ).join(',\n              ');
      
      const breadcrumbsCode = `breadcrumbs={
          <Breadcrumbs
            items={[
              ${items}
            ]}
            theme="dark"
          />
        }`;
      
      content = content.replace(heroWrapperRegex, (match, props, space, next) => {
        return `<HeroWrapper
        ${props.trim()}
        ${breadcrumbsCode}
        ${next}`;
      });
    }
    
    return content;
  });
});

// Update venue pages
venuePages.forEach(({ file, breadcrumbs }) => {
  updateFile(file, (content) => {
    const heroWrapperRegex = /<HeroWrapper\s+([\s\S]*?)(\s+)(tags=|cta=|>)/;
    
    if (!content.includes('breadcrumbs=')) {
      const items = breadcrumbs.map(item => 
        item.href 
          ? `{ name: '${item.name}', href: '${item.href}' }`
          : `{ name: '${item.name}' }`
      ).join(',\n              ');
      
      const breadcrumbsCode = `breadcrumbs={
          <Breadcrumbs
            items={[
              ${items}
            ]}
            theme="dark"
          />
        }`;
      
      content = content.replace(heroWrapperRegex, (match, props, space, next) => {
        return `<HeroWrapper
        ${props.trim()}
        ${breadcrumbsCode}
        ${next}`;
      });
    }
    
    return content;
  });
});

console.log('\n🎉 Breadcrumbs update complete!');
