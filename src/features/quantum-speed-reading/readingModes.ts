// Reading Mode Selection™ — Sprint 1 of the Quantum Speed Reading™ session
// setup flow. Presentational only this sprint: selecting a mode carries it
// forward via the URL (`?mode=...`) for Sprint 2's Adaptive Engine to
// eventually consume — it does not filter Passage Selection or affect
// pacing yet, which is disclosed rather than silently implied.
//
// Difficulty stars reuse the exact presentational transform already
// established in Sentence/Paragraph Reading (`'★'.repeat(n) + '☆'.repeat(5-n)`)
// — a purely visual rating, not a new gating concept.

import { BookOpen, Target, Zap, Sparkles, type LucideIcon } from 'lucide-react'

export type ReadingMode = 'learning' | 'focus' | 'speed' | 'quantum'

export type ReadingModeContent = {
  id: ReadingMode
  title: string
  description: string
  difficultyLevel: 1 | 2 | 3 | 4 | 5
  idealFor: string
  estimatedTimeMinutes: number
  targetWpm: number
}

export function readingModeDifficultyStars(level: 1 | 2 | 3 | 4 | 5): string {
  return '★'.repeat(level) + '☆'.repeat(5 - level)
}

export const READING_MODES: readonly ReadingModeContent[] = [
  {
    id: 'learning',
    title: 'Learning Mode',
    description: 'Read at a comfortable pace with no time pressure — ideal for absorbing new material deeply.',
    difficultyLevel: 1,
    idealFor: 'First-time passages and complex topics',
    estimatedTimeMinutes: 8,
    targetWpm: 150,
  },
  {
    id: 'focus',
    title: 'Focus Mode',
    description: 'A steady, distraction-free pace that trains sustained attention across a full passage.',
    difficultyLevel: 2,
    idealFor: 'Daily practice and building a consistent habit',
    estimatedTimeMinutes: 6,
    targetWpm: 200,
  },
  {
    id: 'speed',
    title: 'Speed Mode',
    description: 'A brisk pace that pushes your reading speed while holding comprehension steady.',
    difficultyLevel: 3,
    idealFor: 'Familiar topics and building reading stamina',
    estimatedTimeMinutes: 5,
    targetWpm: 260,
  },
  {
    id: 'quantum',
    title: 'Quantum Mode',
    description: 'The fastest pace this Lab offers — trains your brain to process meaning in larger visual chunks.',
    difficultyLevel: 4,
    idealFor: 'Experienced readers ready to push their limits',
    estimatedTimeMinutes: 4,
    targetWpm: 340,
  },
]

export function getReadingMode(id: string): ReadingModeContent | null {
  return READING_MODES.find((mode) => mode.id === id) ?? null
}

// Presentational only — same Record<mode, LucideIcon> convention already
// used for icon-per-category elsewhere in this app (FlashImagesExperience's
// ICON_MAP, assessments/page.tsx's journeySteps).
export const READING_MODE_ICON: Record<ReadingMode, LucideIcon> = {
  learning: BookOpen,
  focus: Target,
  speed: Zap,
  quantum: Sparkles,
}
