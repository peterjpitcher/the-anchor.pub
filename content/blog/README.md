# Blog Content Guide

This guide explains how to create and structure blog posts for The Anchor website.

## Directory Structure

Each blog post must have its own directory under `/content/blog/` with the following structure:

```
/content/blog/
├── your-blog-post-slug/
│   ├── index.md          (required - the blog post content)
│   ├── hero.jpg          (required - main hero image)
│   ├── image1.jpg        (optional - additional images)
│   ├── image2.jpg        (optional - additional images)
│   └── image3.jpg        (optional - additional images)
└── README.md             (this file)
```

## Creating a New Blog Post

### 1. Create the Directory

Create a new directory with a URL-friendly slug (lowercase, hyphens instead of spaces):

```bash
mkdir content/blog/my-new-blog-post
```

### 2. Create index.md

Every blog post must have an `index.md` file with the following frontmatter structure:

```markdown
---
title: "Your Blog Post Title"
description: "A brief description of your blog post (used for SEO and previews)"
date: "YYYY-MM-DD"
author: "Author Name"
keywords:
  - keyword one
  - keyword two
  - keyword three
  - keyword four
tags:
  - tag1
  - tag2
  - tag3
featured: false
hero: "hero.jpg"
images:
  - "image1.jpg"
  - "image2.jpg"
  - "image3.jpg"
---

# Your Blog Post Title

Your blog content goes here in Markdown format...
```

## Frontmatter Fields Explained

### Required Fields

- **title** (string): The title of your blog post
- **description** (string): A brief summary (50-160 characters) for SEO and previews
- **date** (string): Publication date in YYYY-MM-DD format
- **author** (string): Name of the post author
- **keywords** (array): SEO keywords related to the post
- **tags** (array): Categories/tags for organising posts
- **hero** (string): Filename of the main hero image

### Optional Fields

- **featured** (boolean): Set to `true` to feature this post prominently. Default: `false`
- **images** (array): Additional images to be distributed throughout the post

## Image Guidelines

### Hero Image (Required)
- **Filename**: Should match what's specified in the frontmatter (e.g., `hero.jpg`)
- **Recommended size**: 1200x600px minimum
- **Format**: JPG or PNG
- **Purpose**: Displayed at the top of the blog post and in previews

### Additional Images (Optional)
- **Filenames**: Should match the array in the frontmatter
- **Recommended size**: 800x600px minimum
- **Format**: JPG or PNG
- **Purpose**: Automatically distributed throughout the blog content

## Content Writing Tips

### Markdown Formatting

Use standard Markdown syntax:

```markdown
# Main Heading (already in template)

## Section Heading

### Subsection Heading

**Bold text** for emphasis

*Italic text* for subtle emphasis

- Bullet point lists
- Another bullet point

1. Numbered lists
2. Another numbered item

[Link text](https://example.com)

> Blockquotes for featured text
```

### Best Practices

1. **SEO Optimisation**:
   - Use descriptive titles (50-60 characters)
   - Write compelling descriptions (120-160 characters)
   - Include relevant keywords naturally in the content
   - Use heading hierarchy (H2, H3) for structure

2. **Content Structure**:
   - Start with an engaging introduction
   - Break content into scannable sections
   - Use subheadings every 2-3 paragraphs
   - Include a call-to-action at the end

3. **Images**:
   - Optimise images for web (compress, appropriate dimensions)
   - Use descriptive filenames (e.g., `botanist-gin-special-offer.jpg`)
   - Ensure hero image is eye-catching and relevant

## Example Blog Post

Here's a complete example:

```markdown
---
title: "Summer Beer Garden Now Open"
description: "Our beautiful beer garden is now open for summer with stunning views and regular plane spotting"
date: "2024-06-01"
author: "The Anchor Team"
keywords:
  - beer garden stanwell moor
  - outdoor dining heathrow
  - plane spotting pub
  - summer drinks surrey
tags:
  - news
  - beer garden
  - summer
featured: true
hero: "beer-garden-summer.jpg"
images:
  - "outdoor-seating.jpg"
  - "plane-spotting.jpg"
---

# Summer Beer Garden Now Open

We're thrilled to announce that our beer garden is now fully open for the summer season!

## Perfect for Plane Spotting

Our unique location near Heathrow means you can enjoy your drink while watching planes fly overhead every 90 seconds. It's a plane spotter's paradise!

## What to Expect

- Comfortable outdoor seating for up to 50 guests
- Full table service
- Covered areas for those unpredictable British summer days
- Dog-friendly space with water bowls provided

## Summer Specials

Throughout June, we're offering:
- Pimm's jugs for £15
- BBQ menu every weekend
- Live acoustic music on Sunday afternoons

Visit us soon and make the most of the summer weather!
```

## Common Tag Categories

Use these standard tags for consistency:

- **news** - General pub news and updates
- **events** - Event announcements
- **offers** - Special offers and promotions
- **drinks** - Drink-related content
- **food** - Food-related content
- **community** - Local community news
- **seasonal** - Seasonal updates (summer, christmas, etc.)

## Publishing Checklist

Before publishing a new blog post, ensure:

- [ ] Directory is named with URL-friendly slug
- [ ] index.md has all required frontmatter fields
- [ ] Hero image is present and matches frontmatter
- [ ] All additional images referenced in frontmatter exist
- [ ] Content is proofread and formatted correctly
- [ ] Keywords and tags are relevant
- [ ] Description is compelling and correct length
- [ ] Date is in YYYY-MM-DD format

## Need Help?

If you have questions about creating blog content, contact the website administrator or refer to the main project documentation.
