/**
 * BEXO Design Token System
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for the BEXO visual foundation.
 * Consumed by apps/web, apps/marketing, apps/admin, and any downstream
 * templates built by the rendering engine.
 *
 * Aesthetic: warm editorial — cream/terracotta base, confident serif headings.
 * NOT a generic SaaS palette.
 */

// ── Color Palette ────────────────────────────────────────────────────────────

export const colors = {
  /** Warm cream — primary page background */
  cream:  '#FDF6EC',
  /** Ivory — elevated surfaces, cards, panels */
  ivory:  '#FAF8F4',

  sand: {
    /** Very light warm sand — section backgrounds, hover states */
    50:  '#FAF5EC',
    /** Light sand — subtle fills */
    100: '#F5EEE4',
    /** Sand — borders, dividers */
    200: '#ECD9C4',
    /** Deep sand — dark borders, strong dividers */
    300: '#DDD0BC',
  },

  terracotta: {
    /** Soft terracotta — hover, highlights, links */
    400: '#D4795A',
    /** Terracotta — primary CTA, active step, ring focus */
    500: '#C1440E',
    /** Deep terracotta — hover on primary buttons */
    600: '#A33509',
    /** Very deep — pressed states */
    700: '#82290A',
  },

  brown: {
    /** Warm off-black — body text on white */
    50:  '#F8F2EC',
    /** Parchment brown — secondary text */
    200: '#D4B896',
    /** Warm medium brown — body copy */
    400: '#7A6854',
    /** Deeper warm brown — secondary headings */
    600: '#5C4A35',
    /** Dark warm brown */
    700: '#4A3728',
    /** Near-black charcoal — primary heading/text */
    900: '#1C1A18',
  },

  warmGray: {
    /** Very light muted */
    100: '#EDE5DA',
    /** Light muted — placeholder text */
    200: '#B8A898',
    /** Muted — helper text */
    400: '#9B8570',
    /** Medium warm gray — secondary body */
    600: '#7A6854',
  },

  sage: {
    /** Light sage — success backgrounds */
    100: '#C3DFC4',
    /** Sage — success icons, tags, badges */
    500: '#6B8F71',
    /** Deep sage — success text */
    700: '#2D5A2E',
  },

  amber: {
    /** Warm amber — accent / highlight */
    400: '#D4A853',
    /** Golden — decorative */
    300: '#E8C97A',
  },

  /** Pure white — input backgrounds, modals */
  white: '#FFFFFF',
  /** Rich black — inverted surfaces (dark template) */
  black: '#0A0908',
} as const;

// ── Semantic Aliases ─────────────────────────────────────────────────────────

export const semantic = {
  background:       colors.cream,
  surface:          colors.ivory,
  surfaceElevated:  colors.white,

  textPrimary:      colors.brown[900],
  textSecondary:    colors.brown[600],
  textMuted:        colors.warmGray[400],
  textDisabled:     colors.warmGray[200],
  textInverse:      colors.white,

  borderDefault:    colors.sand[300],
  borderStrong:     colors.sand[200],
  borderSubtle:     colors.sand[100],

  primaryDefault:   colors.terracotta[500],
  primaryHover:     colors.terracotta[600],
  primaryActive:    colors.terracotta[700],
  primaryForeground: colors.cream,

  successDefault:   colors.sage[500],
  successBg:        colors.sage[100],
  successText:      colors.sage[700],

  warningDefault:   colors.amber[400],
  destructiveDefault: '#D32F2F',
} as const;

// ── Typography ───────────────────────────────────────────────────────────────

export const typography = {
  /** Serif — editorial headings, display text, numbers */
  fontSerif: "'Playfair Display', Georgia, 'Times New Roman', serif",
  /** Sans — all UI text, body, labels, captions */
  fontSans:  "'Inter', system-ui, -apple-system, sans-serif",
  /** Mono — code, activation keys, URLs, data */
  fontMono:  "'JetBrains Mono', 'Fira Code', Menlo, monospace",

  /** Type scale (rem) */
  scale: {
    '2xs':  '0.625rem',   //  10px
    xs:     '0.75rem',    //  12px
    sm:     '0.875rem',   //  14px
    base:   '1rem',       //  16px
    lg:     '1.125rem',   //  18px
    xl:     '1.25rem',    //  20px
    '2xl':  '1.5rem',     //  24px
    '3xl':  '1.875rem',   //  30px
    '4xl':  '2.25rem',    //  36px
    '5xl':  '3rem',       //  48px
    '6xl':  '3.75rem',    //  60px
  },

  /** Line heights */
  leading: {
    tight:   1.2,
    snug:    1.35,
    normal:  1.5,
    relaxed: 1.65,
    loose:   2,
  },

  /** Letter spacing */
  tracking: {
    tight:   '-0.02em',
    normal:  '0em',
    wide:    '0.025em',
    wider:   '0.05em',
    widest:  '0.1em',
    display: '0.15em', // for uppercase label caps
  },

  /** Font weights */
  weight: {
    light:     300,
    regular:   400,
    medium:    500,
    semibold:  600,
    bold:      700,
  },
} as const;

// ── Spacing ──────────────────────────────────────────────────────────────────

/** 4-based spatial scale */
export const spacing = {
  0:    '0rem',
  0.5:  '0.125rem',   //  2px
  1:    '0.25rem',    //  4px
  1.5:  '0.375rem',   //  6px
  2:    '0.5rem',     //  8px
  3:    '0.75rem',    // 12px
  4:    '1rem',       // 16px
  5:    '1.25rem',    // 20px
  6:    '1.5rem',     // 24px
  8:    '2rem',       // 32px
  10:   '2.5rem',     // 40px
  12:   '3rem',       // 48px
  16:   '4rem',       // 64px
  20:   '5rem',       // 80px
  24:   '6rem',       // 96px
} as const;

// ── Border Radius ─────────────────────────────────────────────────────────────

export const radius = {
  none: '0',
  sm:   '0.25rem',   //  4px
  md:   '0.375rem',  //  6px
  lg:   '0.5rem',    //  8px
  xl:   '0.75rem',   // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
} as const;

// ── Shadows ──────────────────────────────────────────────────────────────────

/** Warm-tinted shadows for editorial surfaces */
export const shadows = {
  xs:  '0px 1px 3px 0px hsl(30 20% 20% / 0.07)',
  sm:  '0px 1px 3px 0px hsl(30 20% 20% / 0.07), 0px 1px 2px -1px hsl(30 20% 20% / 0.04)',
  md:  '0px 4px 12px -2px hsl(30 20% 20% / 0.11), 0px 2px 4px -1px hsl(30 20% 20% / 0.06)',
  lg:  '0px 8px 24px -4px hsl(30 20% 20% / 0.13), 0px 4px 8px -2px hsl(30 20% 20% / 0.07)',
  xl:  '0px 16px 40px -8px hsl(30 20% 20% / 0.16), 0px 8px 16px -4px hsl(30 20% 20% / 0.09)',
  '2xl': '0px 24px 60px -12px hsl(30 20% 20% / 0.22)',
} as const;

// ── Animation / Motion ────────────────────────────────────────────────────────

export const motion = {
  duration: {
    instant:  '0ms',
    fast:     '100ms',
    normal:   '200ms',
    slow:     '300ms',
    slower:   '500ms',
    slowest:  '700ms',
  },
  easing: {
    standard:   'cubic-bezier(0.4, 0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    spring:     'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

// ── Z-Index ───────────────────────────────────────────────────────────────────

export const zIndex = {
  base:       0,
  raised:     10,
  dropdown:   100,
  sticky:     200,
  overlay:    300,
  modal:      400,
  toast:      500,
  tooltip:    600,
} as const;

// ── Breakpoints ───────────────────────────────────────────────────────────────

export const breakpoints = {
  sm:  '640px',
  md:  '768px',
  lg:  '1024px',
  xl:  '1280px',
  '2xl': '1536px',
} as const;

// ── Component Tokens ──────────────────────────────────────────────────────────

/** Shared component-level tokens derived from the palette above */
export const components = {
  button: {
    primary: {
      bg:        colors.terracotta[500],
      bgHover:   colors.terracotta[600],
      bgActive:  colors.terracotta[700],
      text:      colors.cream,
      border:    colors.terracotta[600],
      shadow:    shadows.sm,
    },
    secondary: {
      bg:        colors.sand[100],
      bgHover:   colors.sand[200],
      text:      colors.brown[700],
      border:    colors.sand[300],
    },
    ghost: {
      bg:        'transparent',
      bgHover:   colors.sand[100],
      text:      colors.brown[600],
      border:    'transparent',
    },
    destructive: {
      bg:        '#D32F2F',
      bgHover:   '#B71C1C',
      text:      colors.white,
    },
  },

  input: {
    bg:           colors.white,
    bgDisabled:   colors.sand[100],
    border:       colors.sand[300],
    borderFocus:  colors.terracotta[500],
    borderError:  '#D32F2F',
    text:         colors.brown[900],
    placeholder:  colors.warmGray[200],
    shadow:       'none',
    shadowFocus:  `0 0 0 3px ${colors.terracotta[500]}20`,
    radius:       radius.lg,
    paddingX:     spacing[4],
    paddingY:     spacing[3],
    fontSize:     typography.scale.sm,
  },

  card: {
    bg:       colors.ivory,
    border:   colors.sand[300],
    radius:   radius.xl,
    shadow:   shadows.sm,
    padding:  spacing[6],
  },

  badge: {
    terracotta: { bg: '#FDF0EB', text: colors.terracotta[500], border: '#ECD9C4' },
    sage:       { bg: '#EEF6EE', text: colors.sage[700], border: colors.sage[100] },
    sand:       { bg: colors.sand[100], text: colors.brown[600], border: colors.sand[300] },
    amber:      { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
  },

  onboarding: {
    sidebar: {
      bg:           '#F0E6D3',
      border:       colors.sand[300],
      stepActive:   colors.terracotta[500],
      stepComplete: colors.sage[500],
      stepFuture:   colors.sand[300],
      progressBar:  colors.terracotta[500],
    },
    content: {
      bg:           colors.cream,
    },
  },
} as const;

// ── Re-export everything as a flat `tokens` object ───────────────────────────

export const tokens = {
  colors,
  semantic,
  typography,
  spacing,
  radius,
  shadows,
  motion,
  zIndex,
  breakpoints,
  components,
} as const;

export type Tokens = typeof tokens;
export default tokens;
