// The platform's typography scale — one named constant per tier, so every
// future Lab inherits the same hierarchy instead of re-deriving font sizes.
// Each value documents and formalizes a pattern already in production use
// across Sprints 1–2G (dashboard headings, card eyebrows, exercise screens);
// this does not change how any existing page looks, only names the pattern
// for reuse going forward. See docs/DESIGN_SYSTEM.md for usage guidance.

export const TYPOGRAPHY = {
  display: 'text-4xl font-semibold tracking-tight sm:text-5xl',
  h1: 'text-2xl font-semibold tracking-tight sm:text-3xl',
  h2: 'text-lg font-semibold tracking-tight',
  h3: 'text-base font-semibold',
  h4: 'text-sm font-semibold',
  bodyLarge: 'text-base leading-7',
  body: 'text-sm leading-6',
  small: 'text-sm text-muted-foreground',
  caption: 'text-xs text-muted-foreground',
  label: 'text-xs font-medium uppercase tracking-wider text-muted-foreground',
  button: 'text-sm font-medium',
} as const

export type TypographyTier = keyof typeof TYPOGRAPHY
