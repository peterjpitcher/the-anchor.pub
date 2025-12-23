import fs from 'fs';
import path from 'path';

export interface HeaderImageConfig {
  src: string;
  alt: string;
  isFallback?: boolean;
  blurDataURL?: string;
  optimized?: {
    mobile: string;
    tablet: string;
    desktop: string;
    formats?: Array<'avif' | 'webp'>;
  };
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const OPTIMIZED_TARGETS = [
  { key: 'mobile', width: 640 },
  { key: 'tablet', width: 1024 },
  { key: 'desktop', width: 1920 }
] as const;

// Descriptive alt text for each page header
const PAGE_HEADER_ALT_TEXT: Record<string, string> = {
  'home': 'The Anchor pub entrance with warm lighting and traditional British pub signage',
  'whats-on': 'Collage of drag shows, quiz nights, and live music posters glowing under stage lights at The Anchor',
  'food-menu': 'Signature Anchor dishes including Sunday roast, gourmet burgers, and small plates styled on a wooden table',
  'drinks': 'Backlit bar showcasing cask ales, premium spirits, and wine glasses at The Anchor',
  'sunday-lunch': 'Traditional Sunday roast with Yorkshire puddings, roasted vegetables, and rich gravy at The Anchor',
  'beer-garden': 'Spacious beer garden with wooden tables, festoon lighting, and aircraft overhead near Heathrow',
  'find-us': 'The Anchor pub exterior on Horton Road, Stanwell Moor with clear signage',
  'near-heathrow': 'The Anchor pub entrance with a jet overhead highlighting its proximity to Heathrow',
  'blog': 'Cozy interior corner of The Anchor with vintage decor and warm atmosphere',
  'events': 'Packed event night at The Anchor with crowd enjoying live entertainment',
  'private-party-venue': 'Private function room dressed for a celebration with candlelight and balloons',
  'function-room-hire': 'Versatile function room at The Anchor staged for workshops with AV equipment',
  'corporate-events': 'Professional boardroom style layout in The Anchor function space ready for presentations',
  'christmas-parties': 'Festively decorated dining area with Christmas tree and holiday lights',
  'drag-shows': 'Drag performer in sequinned gown on stage at The Anchor with cheering audience',
  'ashford-pub': 'The Anchor pub showcasing its convenient location for Ashford residents',
  'staines-pub': 'Traditional British pub atmosphere at The Anchor, perfect for Staines locals',
  'm25-junction-14-pub': 'The Anchor pub exterior with easy access from M25 Junction 14',
  'stanwell-pub': 'The heart of Stanwell community - The Anchor pub welcoming entrance',
  'windsor-pub': 'The Anchor pub traditional British charm, short drive from Windsor',
  'heathrow-hotels-pub': 'Travellers relaxing at The Anchor terrace with Heathrow aircraft overhead',
  'bedfont-pub': 'Welcoming pub atmosphere at The Anchor for Bedfont community',
  'egham-pub': 'The Anchor traditional pub setting perfect for Egham visitors',
  'feltham-pub': 'Local favourite The Anchor pub serving Feltham community',
  'near-heathrow-terminal-2': 'Convenient pub location near Terminal 2 with aircraft in background',
  'near-heathrow-terminal-3': 'The Anchor pub garden with Terminal 3 flight path visible above',
  'near-heathrow-terminal-4': 'Traditional British pub experience near Terminal 4 at The Anchor',
  'near-heathrow-terminal-5': 'The Anchor pub exterior with Terminal 5 aircraft passing overhead'
};

function getOptimizedConfig(pageFolderPath: string): Pick<HeaderImageConfig, 'optimized' | 'blurDataURL'> | null {
  const optimizedDir = path.join(pageFolderPath, 'optimized');
  if (!fs.existsSync(optimizedDir)) {
    return null;
  }

  const heroMetaPath = path.join(optimizedDir, 'hero-metadata.json');
  if (fs.existsSync(heroMetaPath)) {
    try {
      const metadata = JSON.parse(fs.readFileSync(heroMetaPath, 'utf-8'));
      if (metadata?.optimized?.mobile && metadata?.optimized?.tablet && metadata?.optimized?.desktop) {
        return {
          optimized: metadata.optimized,
          blurDataURL: metadata.blurDataURL
        };
      }
    } catch (error) {
      console.warn('Failed to parse hero metadata', error);
    }
  }

  const metaFile = fs
    .readdirSync(optimizedDir)
    .find((file) => file.endsWith('.meta.json'));

  if (!metaFile) {
    return null;
  }

  try {
    const metadata = JSON.parse(
      fs.readFileSync(path.join(optimizedDir, metaFile), 'utf-8')
    );
    const optimizedImages = Array.isArray(metadata?.optimizedImages) ? metadata.optimizedImages : [];

    const jpgs = optimizedImages
      .filter((image: any) => image?.format === 'jpg' && typeof image?.width === 'number' && typeof image?.path === 'string')
      .sort((a: any, b: any) => a.width - b.width);

    if (!jpgs.length) {
      return null;
    }

    const optimized = OPTIMIZED_TARGETS.reduce((acc, target) => {
      const candidate = jpgs.find((image: any) => image.width >= target.width) || jpgs[jpgs.length - 1];
      if (candidate?.path) {
        acc[target.key] = candidate.path.replace(/\.jpg$/i, '');
      }
      return acc;
    }, {} as Record<typeof OPTIMIZED_TARGETS[number]['key'], string>);

    if (optimized.mobile && optimized.tablet && optimized.desktop) {
      return {
        optimized,
        blurDataURL: metadata?.blurDataURL
      };
    }
  } catch (error) {
    console.warn('Failed to parse optimized metadata', error);
  }

  return null;
}

/**
 * Gets the header image for a given page route
 * @param route - The page route (e.g., '/whats-on', '/food-menu')
 * @returns Image config or null if no image found
 */
export function getPageHeaderImage(route: string): HeaderImageConfig | null {
  // Convert route to folder name
  // '/' -> 'home'
  // '/whats-on' -> 'whats-on'
  // '/near-heathrow/terminal-5' -> 'near-heathrow-terminal-5'
  const folderName = route === '/' 
    ? 'home' 
    : route.replace(/\//g, '-').replace(/^-/, '');

  const headerImagesDir = path.join(process.cwd(), 'public/images/page-headers');
  const pageFolderPath = path.join(headerImagesDir, folderName);

  try {
    // Check if the folder exists
    if (fs.existsSync(pageFolderPath)) {
      // Read all files in the folder
      const files = fs.readdirSync(pageFolderPath);
      
      // Find the first image file (any name, supported extension)
      const imageFile = files.find(file => 
        IMAGE_EXTENSIONS.some(ext => file.toLowerCase().endsWith(ext))
      );

      if (imageFile) {
        // Get descriptive alt text or fall back to a generated one
        const altText = PAGE_HEADER_ALT_TEXT[folderName] || 
          `The Anchor pub ${route === '/' ? 'homepage' : route.replace(/\//g, ' ').replace(/-/g, ' ').trim()} header image`;
        const optimizedConfig = getOptimizedConfig(pageFolderPath);

        // Return the image configuration
        return {
          src: `/images/page-headers/${folderName}/${imageFile}`,
          alt: altText,
          isFallback: false,
          ...(optimizedConfig ?? {})
        };
      }
    }

    // If no image found for this route, check if it's a subpage and try to inherit from parent
    if (route.includes('/') && route !== '/') {
      const segments = route.split('/').filter(Boolean);
      
      // Try parent paths from most specific to least specific
      for (let i = segments.length - 1; i > 0; i--) {
        const parentRoute = '/' + segments.slice(0, i).join('/');
        const parentImage = getPageHeaderImage(parentRoute);
        
        if (parentImage) {
          // Adjust alt text for subpage
          const subpageAltText = PAGE_HEADER_ALT_TEXT[folderName] || 
            parentImage.alt.replace(' header image', '') + ` - ${segments[segments.length - 1].replace(/-/g, ' ')}`;
          
          return {
            src: parentImage.src,
            alt: subpageAltText,
            isFallback: true
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error(`Error reading header image for route ${route}:`, error);
    return null;
  }
}

/**
 * Gets a default header image if page-specific image is not found
 * Uses the homepage hero image as the default
 */
export function getDefaultHeaderImage(): HeaderImageConfig {
  const homeFolderPath = path.join(process.cwd(), 'public/images/page-headers/home');
  const optimizedConfig = getOptimizedConfig(homeFolderPath);

  return {
    src: '/images/page-headers/home/page-headers-homepage.jpg',
    alt: 'The Anchor pub entrance with warm lighting and traditional British pub signage',
    isFallback: true,
    ...(optimizedConfig ?? {})
  };
}
