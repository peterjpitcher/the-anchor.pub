import fs from 'fs';
import path from 'path';

export type HeaderImageResolutionKind = 'exact' | 'alias' | 'inherited' | 'default';

export interface HeaderImageConfig {
  src: string;
  alt: string;
  isFallback?: boolean;
  blurDataURL?: string;
  resolution: HeaderImageResolutionKind;
  requestedRoute: string;
  resolvedFromRoute: string;
  resolvedFromFolder: string;
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Maps canonical route-derived folder names to legacy image folders.
const PAGE_HEADER_FOLDER_ALIASES: Record<string, string> = {
  'heathrow-parking': 'parking-near-heathrow',
  'heathrow-hotels-pub': 'hotel-near-heathrow',
};

// Descriptive alt text for each page header
const PAGE_HEADER_ALT_TEXT: Record<string, string> = {
  'home': 'The Anchor pub entrance with warm lighting and traditional British pub signage',
  'whats-on': 'Collage of hosted nights, quiz nights, and live music posters glowing under stage lights at The Anchor',
  'food-menu': 'Signature Anchor dishes including Sunday roast, gourmet burgers, and small plates styled on a wooden table',
  'drinks': 'Backlit bar showcasing draught lagers, bottled ales, premium spirits, and wine glasses at The Anchor',
  'sunday-lunch': 'Traditional Sunday roast with Yorkshire puddings, roasted vegetables, and rich gravy at The Anchor',
  'beer-garden': 'Spacious beer garden with wooden tables, festoon lighting, and aircraft overhead near Heathrow',
  'find-us': 'The Anchor pub exterior on Horton Road, Stanwell Moor with clear signage',
  'near-heathrow': 'The Anchor pub entrance with a jet overhead highlighting its proximity to Heathrow',
  'blog': 'Cozy interior corner of The Anchor with vintage decor and warm atmosphere',
  'events': 'Packed event night at The Anchor with crowd enjoying live entertainment',
  'private-hire': 'The Anchor private hire venue dressed for celebrations and group events near Heathrow',
  'heathrow-parking': 'Secure on-site parking at The Anchor near Heathrow with easy terminal access',
  'private-party-venue': 'Private function room dressed for a celebration with candlelight and balloons',
  'function-room-hire': 'Versatile function room at The Anchor staged for workshops with AV equipment',
  'corporate-events': 'Professional boardroom style layout in The Anchor function space ready for presentations',
  'christmas-parties': 'Festively decorated dining area with Christmas tree and holiday lights',
  'drag-shows': 'Host on stage at The Anchor during a special event night with cheering audience',
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

function normaliseRoute(route: string): string {
  if (!route) return '/';
  if (route === '/') return '/';
  return route.startsWith('/') ? route : `/${route}`;
}

function routeToFolderName(route: string): string {
  return route === '/'
    ? 'home'
    : route.replace(/\//g, '-').replace(/^-/, '');
}

function getAltTextForFolder(folderName: string, route: string): string {
  return PAGE_HEADER_ALT_TEXT[folderName] ||
    `The Anchor pub ${route === '/' ? 'homepage' : route.replace(/\//g, ' ').replace(/-/g, ' ').trim()} header image`;
}

function findImageInFolder(folderName: string): { folderName: string; src: string } | null {
  const headerImagesDir = path.join(process.cwd(), 'public/images/page-headers');
  const pageFolderPath = path.join(headerImagesDir, folderName);

  if (!fs.existsSync(pageFolderPath)) {
    return null;
  }

  const files = fs.readdirSync(pageFolderPath);
  const imageFile = files.find(file =>
    IMAGE_EXTENSIONS.some(ext => file.toLowerCase().endsWith(ext))
  );

  if (!imageFile) {
    return null;
  }

  return {
    folderName,
    src: `/images/page-headers/${folderName}/${imageFile}`,
  };
}

function resolveDirectRouteImage(route: string): {
  src: string;
  folderName: string;
  resolution: Extract<HeaderImageResolutionKind, 'exact' | 'alias'>;
} | null {
  const folderName = routeToFolderName(route);
  const exactImage = findImageInFolder(folderName);
  if (exactImage) {
    return {
      src: exactImage.src,
      folderName: exactImage.folderName,
      resolution: 'exact',
    };
  }

  const aliasedFolder = PAGE_HEADER_FOLDER_ALIASES[folderName];
  if (!aliasedFolder) {
    return null;
  }

  const aliasedImage = findImageInFolder(aliasedFolder);
  if (!aliasedImage) {
    return null;
  }

  return {
    src: aliasedImage.src,
    folderName: aliasedImage.folderName,
    resolution: 'alias',
  };
}

/**
 * Gets the header image for a given page route
 * @param route - The page route (e.g., '/whats-on', '/food-menu')
 * @returns Image config or null if no image found
 */
export function getPageHeaderImage(route: string): HeaderImageConfig | null {
  const requestedRoute = normaliseRoute(route);
  const requestedFolder = routeToFolderName(requestedRoute);

  try {
    const direct = resolveDirectRouteImage(requestedRoute);
    if (direct) {
      return {
        src: direct.src,
        alt: getAltTextForFolder(requestedFolder, requestedRoute),
        isFallback: false,
        resolution: direct.resolution,
        requestedRoute,
        resolvedFromRoute: requestedRoute,
        resolvedFromFolder: direct.folderName,
      };
    }

    // If no direct image exists for this route, inherit from nearest parent.
    if (requestedRoute.includes('/') && requestedRoute !== '/') {
      const segments = requestedRoute.split('/').filter(Boolean);

      for (let i = segments.length - 1; i > 0; i--) {
        const parentRoute = '/' + segments.slice(0, i).join('/');
        const parentImage = getPageHeaderImage(parentRoute);

        if (parentImage) {
          const subpageAltText = PAGE_HEADER_ALT_TEXT[requestedFolder] ||
            `${parentImage.alt.replace(' header image', '')} - ${segments[segments.length - 1].replace(/-/g, ' ')}`;

          return {
            src: parentImage.src,
            alt: subpageAltText,
            isFallback: true,
            resolution: 'inherited',
            requestedRoute,
            resolvedFromRoute: parentImage.resolvedFromRoute,
            resolvedFromFolder: parentImage.resolvedFromFolder,
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
export function getDefaultHeaderImage(requestedRoute: string = '/'): HeaderImageConfig {
  const normalisedRoute = normaliseRoute(requestedRoute);
  return {
    src: '/images/page-headers/home/page-headers-homepage.jpg',
    alt: 'The Anchor pub entrance with warm lighting and traditional British pub signage',
    isFallback: true,
    resolution: 'default',
    requestedRoute: normalisedRoute,
    resolvedFromRoute: '/',
    resolvedFromFolder: 'home',
  };
}

export { PAGE_HEADER_FOLDER_ALIASES };
