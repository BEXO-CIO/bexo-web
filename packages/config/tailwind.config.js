/**
 * @bexo/config — Shared Tailwind CSS configuration
 *
 * Implements the BEXO editorial design system:
 * warm cream/terracotta base, confident serif headings.
 *
 * Extended by apps/web, apps/marketing, and apps/admin.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // ── Surfaces ─────────────────────────────────────────────────
        cream:  '#FDF6EC',  // primary page background
        ivory:  '#FAF8F4',  // cards, elevated panels

        // ── Sand (borders, dividers, subtle fills) ────────────────────
        sand: {
          50:  '#FAF5EC',
          100: '#F5EEE4',
          200: '#ECD9C4',
          300: '#DDD0BC',
          DEFAULT: '#DDD0BC',
        },

        // ── Terracotta (primary accent, CTAs) ─────────────────────────
        terracotta: {
          400: '#D4795A',
          500: '#C1440E',
          600: '#A33509',
          700: '#82290A',
          DEFAULT: '#C1440E',
        },

        // ── Warm Browns (text hierarchy) ──────────────────────────────
        charcoal: {
          DEFAULT: '#1C1A18',
          light: '#5C4A35',
        },
        'warm-brown': {
          700: '#4A3728',
          600: '#5C4A35',
          400: '#7A6854',
          200: '#B8A898',
          DEFAULT: '#7A6854',
        },

        // ── Warm Gray (muted text) ────────────────────────────────────
        'warm-gray': {
          600: '#7A6854',
          400: '#9B8570',
          200: '#B8A898',
          DEFAULT: '#9B8570',
        },

        // ── Sage (success, positive states) ──────────────────────────
        sage: {
          700: '#2D5A2E',
          500: '#6B8F71',
          100: '#C3DFC4',
          DEFAULT: '#6B8F71',
        },

        // ── Amber (highlights, accents) ───────────────────────────────
        amber: {
          400: '#D4A853',
          300: '#E8C97A',
          DEFAULT: '#D4A853',
        },

        // ── Semantic aliases ──────────────────────────────────────────
        brand: {
          primary:   '#C1440E',   // terracotta
          secondary: '#DDD0BC',   // sand
          accent:    '#D4A853',   // amber
          success:   '#6B8F71',   // sage
          bg:        '#FDF6EC',   // cream
          surface:   '#FAF8F4',   // ivory
          text:      '#1C1A18',   // charcoal
          muted:     '#9B8570',   // warm-gray
        },
      },

      fontFamily: {
        sans:  ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'Times New Roman', 'serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },

      borderRadius: {
        '4xl': '2rem',
      },

      boxShadow: {
        warm:    '0 1px 3px 0 hsl(30 20% 20% / 0.07)',
        'warm-md': '0 4px 12px -2px hsl(30 20% 20% / 0.11)',
        'warm-lg': '0 8px 24px -4px hsl(30 20% 20% / 0.13)',
      },

      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      animation: {
        'fade-in':  'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        shimmer:    'shimmer 2s linear infinite',
      },

      backgroundImage: {
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
};
