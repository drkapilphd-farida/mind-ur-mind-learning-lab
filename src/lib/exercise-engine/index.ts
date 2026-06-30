// Exercise Engine™ — barrel export.
// Import everything from here; internal module organisation may change.

export * from './speedEngine'
export * from './difficultyEngine'
export * from './randomizationEngine'
export * from './sessionEngine'
export * from './performanceEngine'
export * from './recommendationEngine'
export * from './contentEngine'

// Re-export types from the central type system for convenience
export type {
  ExerciseDefinition,
  ExerciseType,
  ContentType,
  InteractionType,
  SpeedMs,
  SpeedMode,
  DifficultyTier,
  AdaptiveRules,
  ScoringRules,
  ContentDataset,
  ContentItem,
  Locale,
  ExerciseSession,
  ExercisePhase,
  PerformanceMetrics,
  ExerciseRecommendation,
  ExerciseRecommendationAction,
  ExerciseAnalytics,
  ExercisePersistedState,
  ExerciseI18nKeys,
} from '@/types/exercise-engine'

export { DEFAULT_SCORING_RULES, SPEED_TIERS } from '@/types/exercise-engine'
