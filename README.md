# The Anchor Website

A modern, SEO-optimised website for The Anchor pub in Stanwell Moor, featuring event management, menu displays, and location-based marketing for Heathrow travelers.

## Features

- 🎯 **Local SEO Optimised** - Targeting "near me" searches and Heathrow traffic
- 📱 **Mobile-First Design** - Responsive and fast on all devices
- 🎭 **Event Management** - Live event updates via Management API (external booking links)
- 🍽️ **Dynamic Menus** - Food and drinks menus with pricing
- ✈️ **Heathrow Landing Pages** - Terminal-specific pages for travelers
- 📝 **Blog System** - Markdown-based blog for news, offers, and updates
- ♿ **Accessible** - WCAG compliant with family-friendly design
- 🚀 **Performance** - Optimised images, lazy loading, and caching

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: The Anchor Management API
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- API key from The Anchor management system

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local and add your API key: ANCHOR_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
website/
├── app/                    # Next.js app directory
│   ├── (routes)/          # Page routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout with metadata
├── components/            # Reusable components
│   ├── Navigation.tsx     # Main navigation
│   ├── EventsToday.tsx    # Today's events display
│   └── ...
├── lib/                   # Utilities and API
│   ├── api.ts            # API client
│   └── schema.ts         # Schema.org definitions
├── public/               # Static assets
│   └── images/           # Optimised images
└── ...
```

## Key Pages

- **Homepage** (`/`) - Local SEO optimised landing
- **Food Menu** (`/food-menu`) - Complete menu with prices
- **Drinks** (`/drinks`) - Bar menu and cocktail collection
- **Sunday Lunch** (`/sunday-lunch`) - Dedicated Sunday roast page
- **What's On** (`/whats-on`) - Events calendar
- **Near Heathrow** (`/near-heathrow/*`) - Terminal-specific pages

## Development

### Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run optimize:images  # Optimise blog + public imagery
npm run type     # Type check with TypeScript
```

Image optimisation details live in `docs/image-optimization.md`.

### API Integration

The site integrates with The Anchor Management API for:
- Live event updates
- Menu management
- Business hours
- Booking availability

API documentation: [See API_SPEC.md]

### Adding New Pages

1. Create a new folder in `app/`
2. Add `page.tsx` with metadata
3. Include proper schema markup
4. Update sitemap in `app/sitemap.ts`
5. Add to navigation if needed

### Managing Blog Content

The website includes a blog system for news, updates, and promotional content.

#### Creating a New Blog Post

**Quick method using the script:**
```bash
./scripts/new-blog-post.sh "my-blog-post-slug"
```

**Manual method:**
1. Create a directory in `content/blog/` with your post slug
2. Copy `content/blog/TEMPLATE.md` to `content/blog/your-slug/index.md`
3. Edit the frontmatter and content
4. Add images (hero.jpg required, others optional)
5. Build and test

**Blog Structure:**
- Each post lives in its own directory under `content/blog/`
- Posts require an `index.md` file with frontmatter
- Images should be placed in the same directory
- See `content/blog/README.md` for detailed documentation

**Required Frontmatter:**
- title, description, date, author
- keywords (array), tags (array)
- hero (image filename)

**Optional Frontmatter:**
- featured (boolean)
- images (array of additional images)

## SEO Features

- Dynamic sitemap generation
- Schema.org markup (LocalBusiness, Restaurant, Event)
- Meta tags and Open Graph
- Terminal-specific landing pages
- Local business optimisation

## Performance

- Next.js Image optimisation
- Lazy loading components
- API response caching (5 minutes)
- Static page generation where possible
- Optimised fonts and CSS

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Contributing

1. Create a feature branch
2. Make your changes
3. Test on mobile and desktop
4. Run linting and type checks
5. Submit a pull request

## Support

For issues or questions:
- Technical: Check deployment logs
- Content: Use the management API
- Design: Follow brand guidelines

## Licence

© 2024 The Anchor. All rights reserved.
