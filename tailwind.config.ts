import type { Config } from 'tailwindcss'

/**
 * A colour Tailwind cannot parse, such as a CSS variable, that still takes an
 * opacity modifier.
 *
 * Tailwind 3 can only put an alpha on a colour it can parse. Defined as a bare
 * 'var(--text-muted)', `bg-ink-muted/30` compiled to nothing at all, with no
 * warning. That hid the reviews carousel's inactive dots and the tint of every
 * error and success box until 5 October 2026.
 *
 * A class with no modifier keeps the bare value, so every solid colour still
 * works in a browser without color-mix() (Safari before 16.2). Only a class
 * with a modifier uses color-mix(), and without it that one class does what it
 * did before the fix: nothing.
 *
 * scripts/audit-opacity-modifiers.js fails if a class with a modifier compiles
 * to nothing, which is what happens to a token added here as a bare string.
 */
function mixable(colour: string): string {
  const resolve = ({ opacityVariable, opacityValue }: { opacityVariable?: string; opacityValue?: string | number }): string => {
    // Tailwind names its own opacity variable only for a class with no modifier.
    if (opacityValue === undefined || opacityVariable !== undefined) return colour
    const raw = String(opacityValue).trim()
    // An arbitrary modifier can already be a percentage (`/[30%]`). Read it as
    // one: multiplied by 100% below it is not valid CSS, and the browser drops
    // the declaration without a word.
    const percent = /^(\d*\.?\d+)%$/.exec(raw)
    const alpha = percent ? Number(percent[1]) / 100 : Number(raw)
    // A gradient's far stop asks for alpha 0. Answer without color-mix() so a
    // from-* or to-* on these tokens keeps working wherever it works today.
    if (alpha === 0) return 'transparent'
    const share = Number.isFinite(alpha) ? `${Math.round(alpha * 10000) / 100}%` : `calc(${raw} * 100%)`
    return `color-mix(in srgb, ${colour} ${share}, transparent)`
  }
  // Tailwind's types describe string colours only, but it calls a function
  // colour with the alpha it needs; its own <alpha-value> works the same way.
  return resolve as unknown as string
}

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
          // Kept in step with the --anchor-* variables in app/globals.css by
          // scripts/audit-palette.js. These are literals, not var() references,
          // so editing one side alone silently drifts: the CSS variable changes
          // and every `text-anchor-gold-bright` class keeps the old value.
          gold: { DEFAULT: '#a57626', dark: '#836313', bright: '#d9ae26' },
          sage: '#7a8b7f', charcoal: '#1a1a1a', cream: '#faf8f3',
          'cream-text': '#f0e6c6', sand: '#f5e6d3', grey: '#6f6a61',
          // Theme-aware: these two lift on dark surfaces (see globals.css).
          success: mixable('var(--status-success)'), danger: mixable('var(--status-danger)'),
        },
        // Semantic (theme-aware — re-map under .theme-dark automatically)
        // Every variable-backed colour goes through mixable(), or `/30` on it
        // compiles to nothing.
        canvas: mixable('var(--bg)'),
        surface: { DEFAULT: mixable('var(--surface)'), raised: mixable('var(--surface-raised)'), sunk: mixable('var(--surface-sunk)'), inverse: mixable('var(--surface-inverse)') },
        ink: { DEFAULT: mixable('var(--text)'), strong: mixable('var(--text-strong)'), muted: mixable('var(--text-muted)'), inverse: mixable('var(--text-inverse)'), 'on-green': mixable('var(--text-on-green)'), 'on-gold': mixable('var(--text-on-gold)') },
        accent: { DEFAULT: mixable('var(--accent)'), text: mixable('var(--accent-text)') },
        line: { DEFAULT: mixable('var(--border)'), strong: mixable('var(--border-strong)'), gold: mixable('var(--border-gold)') },
        // Warm accent tile (icon medallions, sand badges, "today" highlight).
        tile: { DEFAULT: mixable('var(--tile)'), ink: mixable('var(--tile-ink)') },
        // Tailwind's own `current` (currentColor) cannot take a modifier either.
        current: mixable('currentColor'),
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
