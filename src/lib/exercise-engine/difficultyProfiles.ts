// Difficulty Profiles™ — concrete parameters for each difficulty tier.
//
// A profile converts an abstract tier into specific exercise configuration:
// how long stimuli appear, how many items per session, required accuracy
// to advance, and the recommended speed. The Adaptive Difficulty Engine
// reads these profiles; no exercise code hard-codes these values.

import type { DifficultyTier, SpeedMs } from '@/types/exercise-engine'

export type DifficultyProfile = {
  tier: DifficultyTier
  // Flash duration — how long the stimulus is visible
  flashDurationMs: SpeedMs
  // Session length — items per session at this difficulty
  itemsPerSession: number
  // Minimum accuracy (across last 3 sessions) required to promote
  requiredAccuracyToPromote: number
  // Accuracy below which recovery is triggered (across last 2 sessions)
  recoveryAccuracyThreshold: number
  // Recommended starting speed for this tier
  defaultSpeedMs: SpeedMs
  // Maximum distractors shown in MCQ — harder tiers show more similar options
  maxDistractors: number
  // Reaction time ceiling (ms) — faster than this suggests ready to promote
  reactionTimeCeilingMs: number
  // Scoring bonus multiplier for this tier
  challengeMultiplier: number
  // Minimum sessions at this tier before promotion is considered
  minSessionsBeforePromotion: number
}

// ── Profiles per tier ────────────────────────────────────────────────────────

export const DIFFICULTY_PROFILES: Record<DifficultyTier, DifficultyProfile> = {
  beginner: {
    tier: 'beginner',
    flashDurationMs: 500,
    itemsPerSession: 20,
    requiredAccuracyToPromote: 85,
    recoveryAccuracyThreshold: 50,
    defaultSpeedMs: 500,
    maxDistractors: 2,
    reactionTimeCeilingMs: 3000,
    challengeMultiplier: 0.5,
    minSessionsBeforePromotion: 2,
  },
  easy: {
    tier: 'easy',
    flashDurationMs: 400,
    itemsPerSession: 25,
    requiredAccuracyToPromote: 88,
    recoveryAccuracyThreshold: 55,
    defaultSpeedMs: 400,
    maxDistractors: 3,
    reactionTimeCeilingMs: 2500,
    challengeMultiplier: 0.7,
    minSessionsBeforePromotion: 2,
  },
  medium: {
    tier: 'medium',
    flashDurationMs: 250,
    itemsPerSession: 30,
    requiredAccuracyToPromote: 90,
    recoveryAccuracyThreshold: 58,
    defaultSpeedMs: 250,
    maxDistractors: 4,
    reactionTimeCeilingMs: 2000,
    challengeMultiplier: 1.0,
    minSessionsBeforePromotion: 3,
  },
  advanced: {
    tier: 'advanced',
    flashDurationMs: 150,
    itemsPerSession: 40,
    requiredAccuracyToPromote: 92,
    recoveryAccuracyThreshold: 60,
    defaultSpeedMs: 150,
    maxDistractors: 5,
    reactionTimeCeilingMs: 1500,
    challengeMultiplier: 1.3,
    minSessionsBeforePromotion: 3,
  },
  expert: {
    tier: 'expert',
    flashDurationMs: 100,
    itemsPerSession: 50,
    requiredAccuracyToPromote: 93,
    recoveryAccuracyThreshold: 62,
    defaultSpeedMs: 100,
    maxDistractors: 6,
    reactionTimeCeilingMs: 1200,
    challengeMultiplier: 1.6,
    minSessionsBeforePromotion: 4,
  },
  elite: {
    tier: 'elite',
    flashDurationMs: 80,
    itemsPerSession: 60,
    requiredAccuracyToPromote: 95,
    recoveryAccuracyThreshold: 65,
    defaultSpeedMs: 80,
    maxDistractors: 8,
    reactionTimeCeilingMs: 900,
    challengeMultiplier: 2.0,
    minSessionsBeforePromotion: 5,
  },
  master: {
    tier: 'master',
    flashDurationMs: 50,
    itemsPerSession: 80,
    requiredAccuracyToPromote: 97,  // no promotion above master
    recoveryAccuracyThreshold: 68,
    defaultSpeedMs: 50,
    maxDistractors: 8,
    reactionTimeCeilingMs: 700,
    challengeMultiplier: 2.5,
    minSessionsBeforePromotion: 99, // effectively: no auto-promotion from master
  },
  adaptive: {
    tier: 'adaptive',
    flashDurationMs: 300,
    itemsPerSession: 20,
    requiredAccuracyToPromote: 90,
    recoveryAccuracyThreshold: 60,
    defaultSpeedMs: 300,
    maxDistractors: 4,
    reactionTimeCeilingMs: 2000,
    challengeMultiplier: 1.0,
    minSessionsBeforePromotion: 3,
  },
}

export function getDifficultyProfile(tier: DifficultyTier): DifficultyProfile {
  return DIFFICULTY_PROFILES[tier]
}
