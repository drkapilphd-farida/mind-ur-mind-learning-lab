// Icon sets for Flash Images™ — uses lucide-react icons as visual stimuli.
// Premium and minimal; no cartoon images needed.

// Each entry: { id: lucide icon name, label: display label, group }
// The label is shown as text in the multiple-choice options.
export type IconItem = {
  id: string    // lucide icon component name (imported dynamically in FlashCanvas)
  label: string
}

// Tier 1 — universally recognised shapes and objects (easiest to identify)
export const ICONS_EASY: readonly IconItem[] = [
  { id: 'Sun', label: 'Sun' },
  { id: 'Moon', label: 'Moon' },
  { id: 'Star', label: 'Star' },
  { id: 'Heart', label: 'Heart' },
  { id: 'Home', label: 'Home' },
  { id: 'Eye', label: 'Eye' },
  { id: 'Zap', label: 'Lightning' },
  { id: 'Leaf', label: 'Leaf' },
  { id: 'Flame', label: 'Flame' },
  { id: 'Cloud', label: 'Cloud' },
]

// Tier 2 — common objects with more similar silhouettes
export const ICONS_MEDIUM: readonly IconItem[] = [
  { id: 'BookOpen', label: 'Book' },
  { id: 'Brain', label: 'Brain' },
  { id: 'Target', label: 'Target' },
  { id: 'Trophy', label: 'Trophy' },
  { id: 'Compass', label: 'Compass' },
  { id: 'Diamond', label: 'Diamond' },
  { id: 'Mountain', label: 'Mountain' },
  { id: 'Clock', label: 'Clock' },
  { id: 'Bell', label: 'Bell' },
  { id: 'Shield', label: 'Shield' },
]

// Tier 3 — more abstract or similar-looking (hardest)
export const ICONS_HARD: readonly IconItem[] = [
  { id: 'Settings', label: 'Settings' },
  { id: 'BarChart2', label: 'Chart' },
  { id: 'GitBranch', label: 'Branch' },
  { id: 'Hexagon', label: 'Hexagon' },
  { id: 'Octagon', label: 'Octagon' },
  { id: 'Triangle', label: 'Triangle' },
  { id: 'Pentagon', label: 'Pentagon' },
  { id: 'Circle', label: 'Circle' },
  { id: 'Square', label: 'Square' },
  { id: 'LayoutGrid', label: 'Grid' },
]

export function getIconsByDifficulty(flashDurationMs: number): readonly IconItem[] {
  if (flashDurationMs >= 300) return ICONS_EASY
  if (flashDurationMs >= 150) return [...ICONS_EASY, ...ICONS_MEDIUM]
  return [...ICONS_MEDIUM, ...ICONS_HARD]
}

// Generate 3 distractor icons from the same tier as the target
export function getIconDistractors(targetId: string, pool: readonly IconItem[]): IconItem[] {
  return pool.filter((i) => i.id !== targetId).slice(0, 3)
}
