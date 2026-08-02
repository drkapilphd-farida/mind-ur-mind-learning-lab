import type { SessionRecommendation } from '../types/ExperienceIntelligence'

// A real, disclosed, arbitrary-but-reasonable typical session length —
// the same class of disclosed constant as UCE-5's own thresholds (e.g.
// MAX_EXPECTED_GRADE_LEVEL). Not a validated pedagogical benchmark.
const TYPICAL_SESSION_LENGTH_SECONDS = 20 * 60

// Universal Learning Object™ (UCE-6). Pure. Real, document-level
// (never per-learner) session sizing guidance, derived from the real
// `estimatedTotalLearningTimeSeconds` (UCE-5, real). Only ever produces
// a `'reading'` entry — the one session type with a real per-document
// time basis this sprint. Memory/revision/research/practice session
// recommendations are deliberately absent: no real per-session time
// signal exists for them yet (see docs/PRODUCTION_HANDOFF_UCE_6.md) —
// disclosed as a gap, never fabricated with a guessed number.
export function buildSessionRecommendations(estimatedTotalLearningTimeSeconds: number): readonly SessionRecommendation[] {
  if (estimatedTotalLearningTimeSeconds <= 0) return []

  const recommendedCount = Math.max(1, Math.ceil(estimatedTotalLearningTimeSeconds / TYPICAL_SESSION_LENGTH_SECONDS))
  const averageDurationSeconds = Math.round(estimatedTotalLearningTimeSeconds / recommendedCount)

  return [{ sessionType: 'reading', recommendedCount, averageDurationSeconds }]
}
