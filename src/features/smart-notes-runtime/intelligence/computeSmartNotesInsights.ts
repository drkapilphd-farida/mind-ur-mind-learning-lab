import type { SmartNotesLearningProfile } from './types/SmartNotesLearningProfile'

// Smart Notes™ Sprint-3 — Adaptive Intelligence™. Pure. Real,
// plain-language sentences built from `SmartNotesLearningProfile`'s own
// already-computed fields — template strings filled with real numbers,
// never AI-generated text, never a reading or judgment of note content.
// Mirrors Memory Mode™'s own `computeMemoryPerformanceInsights`
// (Sprint-3) exactly, plus one real, structural fact Memory has no
// equivalent of: how many documents have real, saved notes.
export function computeSmartNotesInsights(profile: SmartNotesLearningProfile): readonly string[] {
  if (profile.sessionsCompleted === 0) {
    return ['No smart notes sessions completed yet — insights will appear after your first session.']
  }

  const insights: string[] = [
    `${profile.sessionsCompleted} smart notes session${profile.sessionsCompleted === 1 ? '' : 's'} completed so far.`,
    `${profile.totalConceptsReviewed} concept${profile.totalConceptsReviewed === 1 ? '' : 's'} reviewed in total.`,
  ]

  if (profile.documentsWithNotes > 0) {
    insights.push(`You've saved notes on ${profile.documentsWithNotes} document${profile.documentsWithNotes === 1 ? '' : 's'}.`)
  }

  if (profile.trend === 'improving') insights.push('Engagement has been trending up across recent sessions.')
  else if (profile.trend === 'declining') insights.push('Engagement has dipped in recent sessions — a slower pace may help.')
  else if (profile.trend === 'steady') insights.push('Engagement has stayed steady across recent sessions.')

  return insights
}
