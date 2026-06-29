// Icon sizing tiers — formalizes the size-3.5 / size-4 / size-5 pattern
// already used consistently for lucide-react icons across Sprints 1–2G
// (button icons, card badges, status icons). Pass to an icon's className.
// See docs/DESIGN_SYSTEM.md for usage guidance.

export const ICON_SIZE = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
  xl: 'size-10',
} as const

export type IconSizeTier = keyof typeof ICON_SIZE
