# Thin Tag Page Consolidation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate 10 thin blog tag pages via 301 redirects into parent tags, fix a guide/guides tag mismatch, and filter redirected tags from all user-facing tag surfaces.

**Architecture:** Blog post frontmatter rename first (prerequisite), then redirect config, then UI filtering on two tag pages, then dead code cleanup. Each task is independently committable.

**Tech Stack:** Next.js 14 App Router, TypeScript, JSON redirect config, Markdown frontmatter (YAML)

**Spec:** `docs/superpowers/specs/2026-04-12-thin-tag-page-consolidation-design.md`

---

### Task 1: Rename `guide` → `guides` in 16 blog post frontmatter files

**Files:**
- Modify: `content/blog/30th-birthday-party-ideas-venues/index.md`
- Modify: `content/blog/40th-birthday-party-ideas-venues/index.md`
- Modify: `content/blog/50th-birthday-party-ideas-venues/index.md`
- Modify: `content/blog/60th-birthday-party-ideas-venues/index.md`
- Modify: `content/blog/christening-party-ideas-venues/index.md`
- Modify: `content/blog/function-room-hire-near-heathrow-staines/index.md`
- Modify: `content/blog/gender-reveal-party-ideas-venues/index.md`
- Modify: `content/blog/how-to-plan-christening-reception/index.md`
- Modify: `content/blog/how-to-plan-surprise-birthday-party/index.md`
- Modify: `content/blog/leaving-party-ideas/index.md`
- Modify: `content/blog/private-party-venues-near-heathrow/index.md`
- Modify: `content/blog/private-room-hire-cost-near-heathrow/index.md`
- Modify: `content/blog/pub-vs-hotel-celebration-venue/index.md`
- Modify: `content/blog/pub-with-private-room-near-heathrow/index.md`
- Modify: `content/blog/retirement-party-ideas-venues/index.md`
- Modify: `content/blog/wake-venue-near-heathrow/index.md`

- [ ] **Step 1: Bulk rename guide → guides in all 16 files**

In each of the 16 files listed above, find the frontmatter tag line:
```yaml
  - guide
```
and replace with:
```yaml
  - guides
```

Use sed for efficiency:
```bash
for f in \
  content/blog/30th-birthday-party-ideas-venues/index.md \
  content/blog/40th-birthday-party-ideas-venues/index.md \
  content/blog/50th-birthday-party-ideas-venues/index.md \
  content/blog/60th-birthday-party-ideas-venues/index.md \
  content/blog/christening-party-ideas-venues/index.md \
  content/blog/function-room-hire-near-heathrow-staines/index.md \
  content/blog/gender-reveal-party-ideas-venues/index.md \
  content/blog/how-to-plan-christening-reception/index.md \
  content/blog/how-to-plan-surprise-birthday-party/index.md \
  content/blog/leaving-party-ideas/index.md \
  content/blog/private-party-venues-near-heathrow/index.md \
  content/blog/private-room-hire-cost-near-heathrow/index.md \
  content/blog/pub-vs-hotel-celebration-venue/index.md \
  content/blog/pub-with-private-room-near-heathrow/index.md \
  content/blog/retirement-party-ideas-venues/index.md \
  content/blog/wake-venue-near-heathrow/index.md; do
  sed -i '' 's/^  - guide$/  - guides/' "$f"
done
```

- [ ] **Step 2: Verify no `guide` (singular) tags remain**

```bash
grep -rn '^  - guide$' content/blog/*/index.md
```
Expected: no output (0 matches).

- [ ] **Step 3: Verify `guides` count increased**

```bash
grep -rn '^  - guides$' content/blog/*/index.md | wc -l
```
Expected: `43` (27 original + 16 renamed).

- [ ] **Step 4: Commit**

```bash
git add content/blog/*/index.md
git commit -m "fix: standardise 'guide' tag to 'guides' across 16 blog posts

16 blog posts used 'guide' (singular) while 27 used 'guides' (plural).
The system treats these as separate tags with exact string matching.
Standardises all to 'guides' so posts appear on the correct tag page.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Add all 11 redirects to tag-redirects.json

**Files:**
- Modify: `config/redirects/tag-redirects.json`

- [ ] **Step 1: Add 11 new redirect entries**

Open `config/redirects/tag-redirects.json`. Before the closing `]`, add these 11 entries (1 guide→guides + 10 thin tag consolidations):

```json
  {
    "source": "/blog/tag/guide",
    "destination": "/blog/tag/guides",
    "permanent": true
  },
  {
    "source": "/blog/tag/function-room",
    "destination": "/blog/tag/private-hire",
    "permanent": true
  },
  {
    "source": "/blog/tag/gender-reveal",
    "destination": "/blog/tag/private-hire",
    "permanent": true
  },
  {
    "source": "/blog/tag/wakes",
    "destination": "/blog/tag/private-hire",
    "permanent": true
  },
  {
    "source": "/blog/tag/christenings",
    "destination": "/blog/tag/private-hire",
    "permanent": true
  },
  {
    "source": "/blog/tag/work-events",
    "destination": "/blog/tag/private-hire",
    "permanent": true
  },
  {
    "source": "/blog/tag/plane-spotting",
    "destination": "/blog/tag/heathrow",
    "permanent": true
  },
  {
    "source": "/blog/tag/things-to-do",
    "destination": "/blog/tag/heathrow",
    "permanent": true
  },
  {
    "source": "/blog/tag/savings",
    "destination": "/blog/tag/guides",
    "permanent": true
  },
  {
    "source": "/blog/tag/pricing",
    "destination": "/blog/tag/guides",
    "permanent": true
  },
  {
    "source": "/blog/tag/comparison",
    "destination": "/blog/tag/guides",
    "permanent": true
  }
```

- [ ] **Step 2: Validate JSON syntax**

```bash
node -e "JSON.parse(require('fs').readFileSync('config/redirects/tag-redirects.json','utf8')); console.log('Valid JSON')"
```
Expected: `Valid JSON`

- [ ] **Step 3: Verify redirect count increased**

```bash
node -e "const r = require('./config/redirects/tag-redirects.json'); console.log(r.length + ' redirects')"
```
Expected: previous count + 11.

- [ ] **Step 4: Commit**

```bash
git add config/redirects/tag-redirects.json
git commit -m "feat: add 301 redirects for 10 thin tags + guide→guides

Consolidates thin tag pages into parent tags:
- function-room, gender-reveal, wakes, christenings, work-events → private-hire
- plane-spotting, things-to-do → heathrow
- savings, pricing, comparison → guides
- guide → guides (singular/plural standardisation)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Filter redirected tags from `/blog/tags` page and wire `getTagSEOContent()`

**Files:**
- Modify: `app/blog/tags/page.tsx`

- [ ] **Step 1: Replace imports and remove hardcoded tagInfo**

Replace the imports and the `tagInfo` constant (lines 1-37) with:

```tsx
import Link from 'next/link'
import { getAllBlogPosts } from '@/lib/markdown'
import { Button, Section } from '@/components/ui'
import { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BLOG_FALLBACK_IMAGE } from '@/lib/blog-image'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { getTagSEOContent } from '@/lib/tag-seo-content'
import tagRedirects from '@/config/redirects/tag-redirects.json'

export const metadata: Metadata = {
  title: 'All Blog Topics | The Anchor - Heathrow Pub & Dining',
  description: 'Browse all blog topics and categories from The Anchor. Find posts about food, drinks, events, and more.',
  openGraph: {
    title: 'All Blog Topics - The Anchor',
    description: 'Explore all blog categories and topics',
    images: [BLOG_FALLBACK_IMAGE],
  },
  twitter: getTwitterMetadata({
    title: 'All Blog Topics - The Anchor',
    description: 'Explore all blog categories and topics',
    images: [BLOG_FALLBACK_IMAGE]
  }),
  alternates: {
    canonical: '/blog/tags'
  }
}

// Build set of redirect-source tags to exclude from display
const redirectSourceTags = new Set(
  tagRedirects
    .filter((r: { source: string }) => r.source.startsWith('/blog/tag/'))
    .map((r: { source: string }) => r.source.replace('/blog/tag/', ''))
)
```

- [ ] **Step 2: Replace the page component body**

Replace the `AllTagsPage` function (lines 39-154) with:

```tsx
export default async function AllTagsPage() {
  const allPosts = await getAllBlogPosts()

  // Get all unique tags with counts, excluding redirected tags
  const tagCounts = new Map<string, number>()
  allPosts.forEach(post => {
    post.tags.forEach(tag => {
      if (!redirectSourceTags.has(tag)) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      }
    })
  })

  // Sort by count descending
  const sortedTags = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1])

  return (
    <>
      {/* Hero Section */}
      <HeroWrapper
        route="/blog/tags"
        title="All Blog Topics"
        description={`Explore all ${tagCounts.size} topics from our blog`}
        variant="feature"
        breadcrumbs={[
          { name: 'Blog', href: '/blog' },
          { name: 'All Topics' }
        ]}
        secondaryCta={
          <Link
            href="/blog"
            className="inline-flex items-center text-white/90 hover:text-white transition-colours"
          >
            ← Back to Blog
          </Link>
        }
      />

      {/* Tags Grid */}
      <Section spacing="lg" container containerSize="lg" className="bg-anchor-bg">
        <h2 className="text-2xl font-bold text-anchor-gold-vivid mb-6">
          Browse by Topic
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedTags.map(([tag, count]) => {
            const seoContent = getTagSEOContent(tag)

            return (
              <Link
                key={tag}
                href={`/blog/tag/${tag}`}
                className="group bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-4 hover:border-anchor-gold/40 transition-all"
              >
                <h3 className="font-semibold text-anchor-gold-vivid group-hover:text-anchor-gold transition-colours mb-1">
                  {seoContent.name}
                </h3>
                <p className="text-sm text-anchor-cream-text/70 mb-2 line-clamp-2">
                  {seoContent.description}
                </p>
                <span className="text-sm sm:text-xs bg-anchor-bg px-2 py-1 rounded-full text-anchor-cream-text/55">
                  {count} {count === 1 ? 'post' : 'posts'}
                </span>
              </Link>
            )
          })}
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="dark" spacing="md" container containerSize="md" className="text-center">
        <h2 className="text-3xl font-bold mb-8">
          Stay Updated
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Don't miss our latest stories, events, and special offers
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/blog">
            <Button variant="outline" size="lg" className="!text-white !border-white hover:!bg-white hover:!text-anchor-green">
              Back to Blog
            </Button>
          </Link>
          <Link href="/whats-on">
            <Button variant="outline" size="lg" className="!text-white !border-white hover:!bg-white hover:!text-anchor-green">
              Upcoming Events
            </Button>
          </Link>
        </div>
      </Section>
    </>
  )
}
```

- [ ] **Step 3: Verify build passes**

```bash
npm run build 2>&1 | tail -5
```
Expected: build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add app/blog/tags/page.tsx
git commit -m "refactor: wire /blog/tags to getTagSEOContent and filter redirected tags

Replaces hardcoded tagInfo (7 entries) with getTagSEOContent() for all tags.
Removes Core/Other category grouping — single grid sorted by post count.
Filters out redirect-source tags so consolidated thin tags don't appear.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Filter redirected tags from individual tag page cloud

**Files:**
- Modify: `app/blog/tag/[tag]/page.tsx`

- [ ] **Step 1: Add tagRedirects import**

At the top of `app/blog/tag/[tag]/page.tsx`, after the existing imports (line 11), add:

```tsx
import tagRedirects from '@/config/redirects/tag-redirects.json'
```

- [ ] **Step 2: Add redirect source set constant**

After the `revalidate` line (line 13), add:

```tsx
// Build set of redirect-source tags to exclude from tag cloud
const redirectSourceTags = new Set(
  tagRedirects
    .filter((r: { source: string }) => r.source.startsWith('/blog/tag/'))
    .map((r: { source: string }) => r.source.replace('/blog/tag/', ''))
)
```

- [ ] **Step 3: Filter the tag cloud in the page component**

In the `TagPage` component, find the "Explore More Topics" tag cloud section (the `{Array.from(allTags).sort().map(t =>` block around line 169). Replace:

```tsx
          {Array.from(allTags).sort().map(t => (
```

with:

```tsx
          {Array.from(allTags).filter(t => !redirectSourceTags.has(t)).sort().map(t => (
```

- [ ] **Step 4: Filter generateStaticParams to skip redirect-source tags**

In `generateStaticParams()` (around line 23-34), replace:

```tsx
  return Array.from(allTags).map(tag => ({
    tag: tag
  }))
```

with:

```tsx
  return Array.from(allTags)
    .filter(tag => !redirectSourceTags.has(tag))
    .map(tag => ({
      tag: tag
    }))
```

- [ ] **Step 5: Verify build passes**

```bash
npm run build 2>&1 | tail -5
```
Expected: build succeeds. Fewer tag pages generated than before (10 fewer static params).

- [ ] **Step 6: Commit**

```bash
git add app/blog/tag/[tag]/page.tsx
git commit -m "fix: filter redirected tags from tag page cloud and static params

Excludes redirect-source tags from the 'Explore More Topics' cloud on
individual tag pages. Also filters generateStaticParams to avoid building
static pages for tags that will be 301-redirected.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Remove consolidated tagSEOContent entries

**Files:**
- Modify: `lib/tag-seo-content.ts`

- [ ] **Step 1: Remove the `guide` entry (key `'guide'`)**

In `lib/tag-seo-content.ts`, find the entry with key `'guide'` (around line 662) and remove the entire object from `'guide': {` through its closing `},` (approximately lines 662-671). This entry is now dead — all posts use `guides` and the redirect handles stale URLs.

- [ ] **Step 2: Remove 10 consolidated thin-tag entries**

Under the `// Thin-page content fixes` comment (around line 783), find and remove these 10 entries by key name. Leave the 6 keepers (`food-and-drink`, `guides`, `private-hire`, `travel`, `heathrow`, `birthdays`) in place.

Remove these keys and their entire objects:
1. `'christenings'`
2. `'work-events'`
3. `'savings'`
4. `'function-room'`
5. `'gender-reveal'`
6. `'things-to-do'`
7. `'plane-spotting'`
8. `'pricing'`
9. `'comparison'`
10. `'wakes'`

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -5
```
Expected: no errors.

- [ ] **Step 4: Verify surviving entries still resolve**

```bash
npx tsx -e "
import { getTagSEOContent } from './lib/tag-seo-content';
const keepers = ['food-and-drink','guides','private-hire','travel','heathrow','birthdays'];
keepers.forEach(t => {
  const c = getTagSEOContent(t);
  const isFallback = c.heroContent.startsWith('Welcome to our');
  console.log(t + ': ' + (isFallback ? 'FALLBACK ✗' : 'CUSTOM ✓'));
});
"
```
Expected: all 6 show `CUSTOM ✓`.

- [ ] **Step 5: Verify removed entries fall back gracefully**

```bash
npx tsx -e "
import { getTagSEOContent } from './lib/tag-seo-content';
const removed = ['guide','christenings','work-events','savings','function-room','gender-reveal','things-to-do','plane-spotting','pricing','comparison','wakes'];
removed.forEach(t => {
  const c = getTagSEOContent(t);
  const isFallback = c.heroContent.startsWith('Welcome to our');
  console.log(t + ': ' + (isFallback ? 'FALLBACK ✓' : 'STILL CUSTOM ✗'));
});
"
```
Expected: all 11 show `FALLBACK ✓` (they'll never render because redirects fire first, but confirms the entries are gone).

- [ ] **Step 6: Commit**

```bash
git add lib/tag-seo-content.ts
git commit -m "chore: remove 11 dead tagSEOContent entries for redirected tags

Removes entries for: guide, christenings, work-events, savings,
function-room, gender-reveal, things-to-do, plane-spotting, pricing,
comparison, wakes. All are now 301-redirected and filtered from UI.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Full verification

**Files:** None (verification only)

- [ ] **Step 1: Run lint**

```bash
npm run lint
```
Expected: 0 errors, 0 warnings.

- [ ] **Step 2: Run type check**

```bash
npx tsc --noEmit
```
Expected: clean compilation.

- [ ] **Step 3: Run tests**

```bash
npm test
```
Expected: all tests pass.

- [ ] **Step 4: Run production build**

```bash
npm run build
```
Expected: successful build. Tag pages generated should not include the 11 redirected tags.

- [ ] **Step 5: Verify redirects work (dev server)**

```bash
npm run dev &
sleep 3
curl -sI http://localhost:3000/blog/tag/wakes | grep -i 'location\|status'
curl -sI http://localhost:3000/blog/tag/guide | grep -i 'location\|status'
curl -sI http://localhost:3000/blog/tag/plane-spotting | grep -i 'location\|status'
kill %1
```
Expected:
- `/blog/tag/wakes` → 308 redirect to `/blog/tag/private-hire`
- `/blog/tag/guide` → 308 redirect to `/blog/tag/guides`
- `/blog/tag/plane-spotting` → 308 redirect to `/blog/tag/heathrow`

(Next.js dev server uses 308 for permanent redirects; production uses 301.)
