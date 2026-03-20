import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface MenuItem {
  name: string
  price: string
  description: string
  vegetarian?: boolean
  vegan?: boolean
  glutenFree?: boolean
  veganOptionAvailable?: boolean
  glutenFreeAvailable?: boolean
  special?: boolean
  featured?: boolean
  allergens?: string[]
}

export interface MenuSection {
  title: string
  description?: string
  items: MenuItem[]
  style?: 'grid' | 'list' | 'feature'
  highlight?: boolean
}

export interface MenuCategory {
  id: string
  title: string
  emoji?: string
  description?: string
  sections: MenuSection[]
}

export interface MenuData {
  title: string
  description: string
  lastUpdated: string
  kitchenHours?: {
    [key: string]: string
  }
  specialOffers?: {
    title: string
    description: string
    highlight?: string
  }[]
  categories: MenuCategory[]
  responsibleDrinking?: {
    title: string
    message: string
  }
}

export async function parseMenuMarkdown(menuType: 'food' | 'drinks'): Promise<MenuData | null> {
  try {
    const menuPath = path.join(process.cwd(), 'content', 'menu', `${menuType}.json`)
    
    if (!fs.existsSync(menuPath)) {
      return null
    }

    const fileContents = fs.readFileSync(menuPath, 'utf8')
    const menuData = JSON.parse(fileContents) as MenuData
    
    return menuData
  } catch (error) {
    console.error(`Error reading ${menuType} menu:`, error)
    return null
  }
}