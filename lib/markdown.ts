import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import { getExistingBlogImageNames } from './blog-image'

const contentDirectory = path.join(process.cwd(), 'content')

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
}

function toOptionalTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author: string
  keywords: string[]
  tags: string[]
  featured?: boolean
  hero: string
  heroAlt?: string
  ogImage?: string
  ogImageAlt?: string
  images: string[]
  imageAlts: string[]
  content: string
  htmlContent?: string
}

export interface MenuItem {
  title: string
  description: string
  lastUpdated: string
  content: string
  htmlContent?: string
}

// Blog functions
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const blogDir = path.join(contentDirectory, 'blog')
  
  if (!fs.existsSync(blogDir)) {
    return []
  }

  const folders = fs.readdirSync(blogDir)
  
  const posts = await Promise.all(
    folders.map(async (folder) => {
      const post = await getBlogPost(folder)
      return post
    })
  )
  
  return posts
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const postPath = path.join(contentDirectory, 'blog', slug, 'index.md')
    
    if (!fs.existsSync(postPath)) {
      return null
    }

    const fileContents = fs.readFileSync(postPath, 'utf8')
    const { data, content } = matter(fileContents)
    
    // Process markdown to HTML
    const processedContent = await remark()
      .use(html)
      .process(content)
    
    const htmlContent = processedContent.toString()

    const rawImages = toStringArray(data.images)
    const rawImageAlts = toStringArray(data.imageAlts)
    const existingImages = getExistingBlogImageNames(slug, rawImages)
    const imageAltLookup = new Map<string, string>(
      rawImages.map((imageName, index) => [imageName, rawImageAlts[index] || ''])
    )
    const imageAlts = existingImages.map((imageName) => {
      const alt = imageAltLookup.get(imageName) || ''
      return alt || `Photo from The Anchor in Stanwell Moor`
    })

    return {
      slug,
      title: data.title || '',
      description: data.description || '',
      date: data.date || '',
      author: data.author || '',
      keywords: toStringArray(data.keywords),
      tags: toStringArray(data.tags),
      featured: data.featured || false,
      hero: data.hero || '',
      heroAlt: toOptionalTrimmedString(data.heroAlt),
      ogImage: toOptionalTrimmedString(data.ogImage),
      ogImageAlt: toOptionalTrimmedString(data.ogImageAlt),
      images: existingImages,
      imageAlts,
      content,
      htmlContent
    }
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error)
    return null
  }
}

// Menu functions
export async function getMenuContent(menuType: 'food' | 'drinks'): Promise<MenuItem | null> {
  try {
    const menuPath = path.join(contentDirectory, 'menu', `${menuType}.md`)
    
    if (!fs.existsSync(menuPath)) {
      return null
    }

    const fileContents = fs.readFileSync(menuPath, 'utf8')
    const { data, content } = matter(fileContents)
    
    // Process markdown to HTML
    const processedContent = await remark()
      .use(html)
      .process(content)
    
    const htmlContent = processedContent.toString()

    return {
      title: data.title || '',
      description: data.description || '',
      lastUpdated: data.lastUpdated || '',
      content,
      htmlContent
    }
  } catch (error) {
    console.error(`Error reading ${menuType} menu:`, error)
    return null
  }
}

// Utility function to distribute images throughout blog content
export function distributeImages(
  htmlContent: string,
  images: string[],
  blogSlug: string,
  imageAlts: string[] = []
): string {
  if (!images || images.length === 0) return htmlContent
  
  // Split content into paragraphs
  const paragraphs = htmlContent.split('</p>')
  
  if (paragraphs.length <= 1) return htmlContent
  
  // Calculate distribution
  const imageInterval = Math.max(1, Math.floor(paragraphs.length / (images.length + 1)))
  
  let result = ''
  let imageIndex = 0
  
  paragraphs.forEach((paragraph, index) => {
    result += paragraph + (paragraph.trim() ? '</p>' : '')
    
    // Insert image at calculated intervals
    if (imageIndex < images.length && 
        index > 0 && 
        index % imageInterval === 0 && 
        index < paragraphs.length - 1) {
      const imagePath = `/content/blog/${blogSlug}/${images[imageIndex]}`
      const imageAlt = escapeHtmlAttribute(
        imageAlts[imageIndex] || 'Photo from The Anchor in Stanwell Moor'
      )
      result += `
        <figure class="not-prose my-8 mx-auto w-full max-w-full sm:max-w-xl lg:max-w-[420px] xl:max-w-[460px]">
          <img 
            src="${imagePath}" 
            alt="${imageAlt}" 
            class="block w-full h-auto max-h-[520px] object-contain rounded-xl shadow-sm ring-1 ring-black/5"
            loading="lazy"
            decoding="async"
          />
        </figure>
      `
      imageIndex++
    }
  })
  
  return result
}

// Get featured blog posts
export async function getFeaturedPosts(limit: number = 3): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts()
  return allPosts
    .filter(post => post.featured)
    .slice(0, limit)
}

// Get posts by tag
export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts()
  return allPosts.filter(post => post.tags.includes(tag))
}
