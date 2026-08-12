import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './utils/**/*.{js,ts,jsx,tsx}',
  ],
  // Tailwind's own .container is switched off. The single .container rule lives
  // in app/globals.css, driven by --container-max / --container-pad, so page
  // width has exactly one definition site-wide.
  corePlugins: { container: false },
  theme: {
    extend: {
      colors: {
        // Raw brand palette (fixed across themes)
        anchor: {
          green: { DEFAULT: '#005131', dark: '#003d25', deep: '#0c1d11', raised: '#132318', card: '#172d1e', light: '#006b45' },
          gold: { DEFAULT: '#a57626', dark: '#8b6914', bright: '#c9a020' },
          sage: '#7a8b7f', charcoal: '#1a1a1a', cream: '#faf8f3',
          'cream-text': '#f0e6c6', sand: '#f5e6d3', grey: '#6f6a61',
          success: '#006b45', danger: '#b1372f',
        },
        // Semantic (theme-aware — re-map under .theme-dark automatically)
        canvas: 'var(--bg)',
        surface: { DEFAULT: 'var(--surface)', raised: 'var(--surface-raised)', sunk: 'var(--surface-sunk)', inverse: 'var(--surface-inverse)' },
        ink: { DEFAULT: 'var(--text)', strong: 'var(--text-strong)', muted: 'var(--text-muted)', inverse: 'var(--text-inverse)', 'on-green': 'var(--text-on-green)', 'on-gold': 'var(--text-on-gold)' },
        accent: { DEFAULT: 'var(--accent)', text: 'var(--accent-text)' },
        line: { DEFAULT: 'var(--border)', strong: 'var(--border-strong)', gold: 'var(--border-gold)' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Times New Roman', 'serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        script: ['var(--font-script)', 'cursive'],
      },
      fontSize: {
        display: ['clamp(3.5rem, 8vw, 7rem)', { lineHeight: '0.95' }],
        h1: ['clamp(2.75rem, 5.5vw, 4.75rem)', { lineHeight: '1.2' }],
        h2: ['clamp(2rem, 3.6vw, 3.25rem)', { lineHeight: '1.2' }],
        h3: ['clamp(1.5rem, 2.4vw, 2.25rem)', { lineHeight: '1.2' }],
        h4: ['clamp(1.25rem, 1.6vw, 1.5rem)', { lineHeight: '1.2' }],
        script: ['clamp(1.75rem, 3vw, 2.75rem)', { lineHeight: '1' }],
      },
      spacing: { 'section-y': 'var(--section-y)' },
      borderRadius: { xs: '3px', sm: '6px', md: '12px', pill: '999px' },
      boxShadow: {
        sm: '0 2px 8px rgba(26, 26, 26, 0.06)',
        md: '0 8px 20px rgba(26, 26, 26, 0.08)',
        lg: '0 10px 40px rgba(0, 0, 0, 0.10)',
        gold: '0 6px 24px rgba(165, 118, 38, 0.28)',
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
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config
