import type { MemoryLearningProfile } from './types/MemoryLearningProfile'

// Memory Mode™ Sprint-3 — Adaptive Memory Intelligence™. Pure. Real,
// plain-language sentences built from `MemoryLearningProfile`'s own
// already-computed fields — template strings filled with real numbers,
// never AI-generated text, never a new metric. Vocabulary follows the
// platform's own Mastery Philosophy — no quiz/test/score/grade language,
// only Growth/Progress/Insight framing.
export function computeMemoryPerformanceInsights(profile: MemoryLearningProfile): readonly string[] {
  if (profile.sessionsCompleted === 0) {
    return ['No memory sessions completed yet — insights will appear after your first session.']
  }

  const insights: string[] = [
    `${profile.sessionsCompleted} memory session${profile.sessionsCompleted === 1 ? '' : 's'} completed so far.`,
    `${profile.totalConceptsReviewed} concept${profile.totalConceptsReviewed === 1 ? '' : 's'} reviewed in total.`,
  ]

  if (profile.trend === 'improving') insights.push('Confidence has been trending up across recent sessions.')
  else if (profile.trend === 'declining') insights.push('Confidence has dipped in recent sessions — a slower pace may help.')
  else if (profile.trend === 'steady') insights.push('Confidence has stayed steady across recent sessions.')

  return insights
}
