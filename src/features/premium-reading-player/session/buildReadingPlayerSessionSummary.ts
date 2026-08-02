import type { ReadingIntelligenceExperienceResult } from '@/features/reading-intelligence'
import type { ReadingPlayerExerciseOutcome, ReadingPlayerSessionSummary } from '../types'

// Pure composition — packages the caller-reported exercise outcome together
// with Sprint 46's already-loaded reading-intelligence result. Recomputes no
// score, streak, Mind Score, or journey logic; every field here is either a
// direct pass-through or a direct read of an already-computed real value.
export function buildReadingPlayerSessionSummary(
  outcome: ReadingPlayerExerciseOutcome,
  experience: ReadingIntelligenceExperienceResult,
): ReadingPlayerSessionSummary {
  return {
    readingScore: outcome.accuracyPercent,
    mindScore: experience.journeyState.mindScore,
    mindScoreLabel: experience.journeyState.mindScoreLabel,
    xp: experience.xp,
    continueHref: experience.dailyMission.continueHref,
    continueLabel: experience.dailyMission.actionLabel,
  }
}
