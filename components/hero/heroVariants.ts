import type { HeroSize } from './HeroSection'

export type HeroVariantName = 'default' | 'feature' | 'dark'
export type HeroStatusBarThemeKey = 'frosted' | 'darkGlass' | 'brand'
export type HeroCtaLayoutKey = 'stacked' | 'inline-center' | 'inline-left'
export type HeroTagAppearanceKey = 'frosted' | 'glass'

export interface HeroVariantConfig {
  size: HeroSize
  alignment: 'left' | 'center' | 'right'
  overlay: 'light' | 'medium' | 'dark' | 'gradient'
  showStatusBar: boolean
  statusBarPosition: 'above' | 'below' | 'none'
  statusBarVariant: 'default' | 'compact' | 'navigation' | 'hero'
  statusBarTheme: HeroStatusBarThemeKey
  ctaLayout: HeroCtaLayoutKey
  contentClassName?: string
  tagAppearance?: HeroTagAppearanceKey
  tagSize?: 'small' | 'medium' | 'large'
}

export const HERO_STATUS_BAR_THEMES: Record<HeroStatusBarThemeKey, {
  background: string
  border: string
  text: string
  accentText: string
}> = {
  frosted: {
    background: 'bg-white/80 backdrop-blur-sm',
    border: 'border border-white/60',
    text: 'text-anchor-green',
    accentText: 'text-anchor-gold-dark'
  },
  darkGlass: {
    background: 'bg-black/40 backdrop-blur-sm',
    border: 'border border-white/20',
    text: 'text-white',
    accentText: 'text-white/70'
  },
  brand: {
    background: 'bg-anchor-green',
    border: 'border border-anchor-gold-dark',
    text: 'text-white',
    accentText: 'text-anchor-gold-dark'
  }
}

export const HERO_TAG_APPEARANCES: Record<HeroTagAppearanceKey, string> = {
  frosted: '',
  glass: 'bg-white/15 text-white border border-white/25'
}

export const HERO_CTA_LAYOUTS: Record<HeroCtaLayoutKey, {
  container: string
  primary?: string
  secondary?: string
  info?: string
}> = {
  stacked: {
    container: 'flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center',
    primary: 'flex w-full sm:w-auto justify-center',
    secondary: 'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center',
    info: 'text-sm text-white/80 text-center sm:text-base'
  },
  'inline-center': {
    container: 'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center',
    primary: 'flex justify-center',
    secondary: 'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center',
    info: 'text-sm text-white/80 text-center sm:text-base'
  },
  'inline-left': {
    container: 'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-start',
    primary: 'flex justify-start',
    secondary: 'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-start',
    info: 'text-sm text-white/80 text-left sm:text-base'
  }
}

export const HERO_VARIANTS: Record<HeroVariantName, HeroVariantConfig> = {
  default: {
    size: 'large',
    alignment: 'center',
    overlay: 'dark',
    showStatusBar: false,
    statusBarPosition: 'none',
    statusBarVariant: 'hero',
    statusBarTheme: 'darkGlass',
    ctaLayout: 'stacked',
    contentClassName: 'max-w-4xl',
    tagAppearance: 'glass',
    tagSize: 'medium'
  },
  feature: {
    size: 'medium',
    alignment: 'left',
    overlay: 'light',
    showStatusBar: false,
    statusBarPosition: 'none',
    statusBarVariant: 'compact',
    statusBarTheme: 'brand',
    ctaLayout: 'inline-left',
    contentClassName: 'max-w-4xl',
    tagAppearance: 'frosted',
    tagSize: 'small'
  },
  dark: {
    size: 'hero',
    alignment: 'center',
    overlay: 'gradient',
    showStatusBar: false,
    statusBarPosition: 'none',
    statusBarVariant: 'hero',
    statusBarTheme: 'darkGlass',
    ctaLayout: 'stacked',
    contentClassName: 'max-w-5xl',
    tagAppearance: 'glass',
    tagSize: 'medium'
  }
}
