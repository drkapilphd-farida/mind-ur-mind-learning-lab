// Intelligence Engine Foundation™ — shared types.
//
// Every Lab (Reading, Memory, Focus, Meditation, Emotional, Mind Fitness,
// AI Mentor) must describe itself using these types. No Lab-specific types
// should leak into shared components.

// ── Dimension types ───────────────────────────────────────────────────────

export type IntelligenceDimensionType =
  | 'reading'
  | 'memory'
  | 'focus'
  | 'meditation'
  | 'emotional'
  | 'fitness'
  | 'ai-mentor'

// Human-readable labels for each dimension — used in UI without any
// Lab-specific knowledge baked into components.
export const DIMENSION_LABELS: Record<IntelligenceDimensionType, string> = {
  'reading': 'Reading Intelligence™',
  'memory': 'Memory Intelligence™',
  'focus': 'Focus Intelligence™',
  'meditation': 'Meditation Intelligence™',
  'emotional': 'Emotional Intelligence™',
  'fitness': 'Mind Fitness™',
  'ai-mentor': 'AI Mentor™',
}

export const DIMENSION_SHORT_LABELS: Record<IntelligenceDimensionType, string> = {
  'reading': 'Reading',
  'memory': 'Memory',
  'focus': 'Focus',
  'meditation': 'Meditation',
  'emotional': 'Emotional',
  'fitness': 'Mind Fitness',
  'ai-mentor': 'AI Mentor',
}

// ── Activation status ─────────────────────────────────────────────────────

export type ActivationStatus = 'not-started' | 'in-progress' | 'activated'

// ── Dimension score ───────────────────────────────────────────────────────

export type IntelligenceDimension = {
  type: IntelligenceDimensionType
  score: number         // 0–100: real computed score, or 0 if locked
  trend: number | null  // % change vs prior period; null = not enough data
  status: ActivationStatus
  isActive: boolean     // true = Lab exists and student has real data for it
}

// ── Mind Score ────────────────────────────────────────────────────────────

export type MindScore = {
  total: number      // 0–1000
  label: string      // "Building Momentum", "Peak Performance", etc.
  description: string
}

// ── Transformation stage ──────────────────────────────────────────────────

export type TransformationStage =
  | 'Beginning'
  | 'Growing'
  | 'Accelerating'
  | 'Stable'
  | 'Recovering'

// ── Evolution state ───────────────────────────────────────────────────────

// Represents where a student is in their cross-Lab evolution journey.
export type EvolutionState = {
  currentDimension: IntelligenceDimensionType
  nextDimension: IntelligenceDimensionType | null
  mindScoreRequired: number | null    // null = next Lab is always accessible
  isReadyForEvolution: boolean        // true when current Lab is fully activated
  progressPercent: number             // 0–100: toward mindScoreRequired
}

// ── Journey state ─────────────────────────────────────────────────────────

export type JourneyState = {
  stage: TransformationStage
  momentumPercent: number    // 0–100
  consistencyPercent: number // 0–100: days active / 7
  currentStreak: number
  bestStreak: number
}

// ── AI Recommendation ─────────────────────────────────────────────────────

export type RecommendationType = 'practice' | 'evolve' | 'rest' | 'reflect'

export type Recommendation = {
  type: RecommendationType
  message: string
  detail: string | null
  actionLabel: string | null
  actionHref: string | null
  estimatedMinutes: number | null
}

// ── Timeline stage ────────────────────────────────────────────────────────

// Used by TransformationTimeline — describes one stage in a journey path.
export type TimelineStageStatus = 'completed' | 'active' | 'next' | 'locked'

export type TimelineStage = {
  id: string
  label: string
  description: string
  status: TimelineStageStatus
  unlockScore?: number       // Mind Score (0–1000) required to unlock
}

// ── Lab definition ────────────────────────────────────────────────────────

// A Lab registers itself with this shape — the Intelligence Engine uses it
// to render any Lab's progress without Lab-specific component code.
export type LabDefinition = {
  id: string
  dimensionType: IntelligenceDimensionType
  title: string
  description: string
  href: string
  totalActivations: number
  isAvailable: boolean     // false = coming soon
}
