// Visual Intelligence Lab™ — Visual DNA™, Sprint 8.
// Shared types for the Visual DNA profile engine. Every field is either a
// real stored value or a deterministic function of real stored values —
// no machine learning, no fabricated measurements.

export type VisualIdentity = {
  observationStyle: string
  focusStyle: string
  visualProcessingStyle: string
  peripheralStyle: string
}

export type StrengthTier = 'excellent' | 'good' | 'developing' | 'needs-practice' | 'more-training-required'

export type StrengthCategoryId =
  | 'eye-fixation'
  | 'observation'
  | 'peripheral-vision'
  | 'image-persistence'
  | 'visual-speed'
  | 'attention-stability'
  | 'visual-endurance'

export type StrengthCategory = {
  id: StrengthCategoryId
  label: string
  tier: StrengthTier
  /** 0-100, null only when tier is 'more-training-required'. */
  score: number | null
}

export type GrowthOpportunity = {
  categoryId: StrengthCategoryId
  label: string
  score: number
}

export type EvolutionStageStatus = 'completed' | 'available' | 'active' | 'not-tracked'

export type EvolutionStageId =
  | 'foundation-breathing-journey'
  | 'preparation'
  | 'visual-fixation'
  | 'image-persistence'
  | 'adaptive-intelligence'
  | 'visual-dna'

export type EvolutionStage = {
  id: EvolutionStageId
  label: string
  status: EvolutionStageStatus
}

export type RadarAxisId = 'observation' | 'focus' | 'speed' | 'persistence' | 'peripheral-vision' | 'accuracy' | 'adaptability'

export type RadarAxis = {
  id: RadarAxisId
  label: string
  /** 0-100, null = no data for this axis yet (an honest gap, not a fabricated 0). */
  value: number | null
}

export type DnaLevelNumber = 1 | 2 | 3 | 4 | 5 | 6
export type DnaLevelName = 'Beginner' | 'Explorer' | 'Practitioner' | 'Advanced' | 'Elite' | 'Master'

export type TodaysBestMissionBenefit = {
  metricLabel: string
  delta: number
}

export type TodaysBestMission = {
  exerciseLabel: string
  exerciseHref: string
  estimatedBenefits: readonly TodaysBestMissionBenefit[]
  estimatedTimeSeconds: number
}

export type DnaAchievement = {
  id: string
  title: string
  description: string
  unlocked: boolean
  /** 0-1, meaningful mainly while locked. */
  progressToward: number
  /** false for achievements that depend on data this lab has never
   * persisted anywhere (Foundation Journey) — shown locked with an honest
   * "not yet trackable" note rather than a real, ordinary progress bar. */
  trackable: boolean
}

export type MindPassportSnapshot = {
  visualDnaLevel: DnaLevelName
  visualIntelligenceScore: number
  primaryTrait: string
  observationStyle: string
  growthPercent: number | null
  achievementCount: number
  latestAiSummary: string
}

export type EvolutionNote = {
  weekLabel: string
  lines: readonly string[]
}

export type ScoreProgress = {
  currentScore: number
  previousScore: number | null
  growthPercent: number | null
  weeklyImprovementPercent: number | null
  monthlyImprovementPercent: number | null
}
