import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './utils/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem'
      },
      screens: {
        '2xl': '1440px'
      }
    },
    extend: {
      colors: {
        'anchor-green': '#005131',
        'anchor-gold': '#8b6914',  // Darkened from #a57626 for WCAG AA compliance (4.5:1)
        'anchor-cream': '#faf8f3',
        'anchor-charcoal': '#1a1a1a',
        'anchor-gold-light': '#a57626',  // Using old gold as light variant
        'anchor-green-dark': '#003d25',
        'anchor-warm-white': '#ffffff',
        'anchor-sage': '#7a8b7f',
        'anchor-sand': '#f5e6d3',
        // Additional accessible color variants
        'anchor-gold-dark': '#6b5010',  // Even darker for small text
        'anchor-green-light': '#006b45',  // Lighter but still accessible green
        'anchor-text-on-green': '#ffffff',  // Ensure white text on green bg
        'anchor-text-on-gold': '#1a1a1a',  // Dark text on gold backgrounds
        // Dark theme surface tokens (Barons-inspired)
        'anchor-bg': '#0c1d11',
        'anchor-bg-raised': '#132318',
        'anchor-bg-card': '#172d1e',
        'anchor-cream-text': '#f0e6c6',
        'anchor-gold-vivid': '#c9a020',
        'anchor-gold-bright': '#e0b830',
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'sans-serif'],
        serif: ['var(--font-merriweather)', 'serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'luxury': '0 10px 40px rgba(0, 0, 0, 0.1)',
        'luxury-lg': '0 20px 60px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config
