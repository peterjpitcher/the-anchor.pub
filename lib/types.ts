export interface NavigationItem {
  label: string
  href: string
  description?: string
  external?: boolean
  items?: NavigationItem[] // For dropdown items
}

export interface SocialLink {
  platform: 'instagram' | 'facebook' | 'twitter' | 'youtube' | 'tiktok' | 'google'
  href: string
  label?: string
}

export interface ContactInfo {
  phone?: string
  email?: string
  address?: string
}

export interface BusinessInfo {
  name: string
  description?: string
  logo?: string
  contact?: ContactInfo
  social?: SocialLink[]
}

export interface OpeningHours {
  day: string
  open: string
  close: string
  kitchen?: {
    open: string
    close: string
  }
}

export interface StatusInfo {
  isOpen: boolean
  message: string
  closesIn?: string
  opensIn?: string
}

export interface LoadingState {
  isLoading: boolean
  error?: string
}

export interface ThemeColors {
  primary: string
  secondary: string
  accent?: string
  text?: {
    primary: string
    secondary: string
    inverse: string
  }
  background?: {
    primary: string
    secondary: string
  }
}

export interface ComponentTheme {
  colors?: ThemeColors
  spacing?: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius?: {
    sm: string
    md: string
    lg: string
    full: string
  }
}
