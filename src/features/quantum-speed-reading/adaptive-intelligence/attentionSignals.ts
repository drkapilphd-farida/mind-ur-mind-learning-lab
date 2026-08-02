type AttentionLevel = 'high' | 'medium' | 'low'

export type AttentionSignals = {
  score: number // 0-100
  level: AttentionLevel
  reasons: string[]
}

/**
 * Deterministic attention-signal calculation based only on runtime events.
 * Inputs are: readingTimeMs, pauseCount, resumeCount, completionPercent.
 */
export function computeAttentionSignals(params: {
  readingTimeMs: number
  pauseCount: number
  resumeCount: number
  completionPercent: number
}): AttentionSignals {
  const { readingTimeMs, pauseCount, resumeCount, completionPercent } = params

  const readingMinutes = Math.max( (readingTimeMs || 0) / 1000 / 60, 0.5 ) // floor to avoid div/0

  // Pause rate per minute
  const pauseRate = pauseCount / readingMinutes
  const resumeRate = resumeCount / readingMinutes

  const reasons: string[] = []

  // Completion penalty
  let completionPenalty = 0
  if (completionPercent < 50) {
    completionPenalty = 40
    reasons.push('low_completion')
  } else if (completionPercent < 80) {
    completionPenalty = 15
    reasons.push('partial_completion')
  } else if (completionPercent < 100) {
    completionPenalty = 5
    reasons.push('near_complete')
  }

  // Pause penalty: each pause per minute costs 10 points up to 30
  const pausePenalty = Math.min(30, Math.round(pauseRate * 10))
  if (pausePenalty > 0) reasons.push('frequent_pauses')

  // Resume penalty is smaller (brief distraction handling) — reduces score slightly
  const resumePenalty = Math.min(15, Math.round(resumeRate * 5))
  if (resumePenalty > 0) reasons.push('frequent_resumes')

  // Base score calculation
  let score = 100 - completionPenalty - pausePenalty - resumePenalty

  // Very short sessions are suspicious — penalize if total reading time < 3s
  if (readingTimeMs < 3000) {
    score = Math.min(score, 20)
    reasons.push('very_short_session')
  }

  // Clamp
  score = Math.max(0, Math.min(100, score))

  let level: AttentionLevel = 'high'
  if (score >= 75) level = 'high'
  else if (score >= 40) level = 'medium'
  else level = 'low'

  return { score, level, reasons }
}

export default computeAttentionSignals
