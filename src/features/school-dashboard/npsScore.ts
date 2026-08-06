// Standard Net Promoter Score categorization — 0-6 Detractor, 7-8
// Passive, 9-10 Promoter. Single source of truth shared by the Quality
// Control dashboard's aggregation and anywhere else NPS math is needed.
export type NpsCategory = 'promoter' | 'passive' | 'detractor'

export function deriveNpsCategory(score: number): NpsCategory {
  if (score >= 9) return 'promoter'
  if (score >= 7) return 'passive'
  return 'detractor'
}

// The standard NPS formula: %Promoters − %Detractors, range −100..100.
// Undefined (0) for zero responses — never divide by zero, and a tenant
// with no feedback yet isn't a "0 NPS," it's "no data."
export function computeNps(scores: readonly number[]): number {
  if (scores.length === 0) {
    return 0
  }

  let promoters = 0
  let detractors = 0
  for (const score of scores) {
    const category = deriveNpsCategory(score)
    if (category === 'promoter') promoters += 1
    else if (category === 'detractor') detractors += 1
  }

  return Math.round(((promoters - detractors) / scores.length) * 100)
}

export function computeAverageScore(scores: readonly number[]): number | null {
  if (scores.length === 0) {
    return null
  }
  return Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10
}

// A tenant is flagged for quality review when its NPS is negative (more
// detractors than promoters) — but only once there's enough feedback to
// be meaningful (fewer than this many responses, and a single sour
// rating would trigger an "audit" flag off pure noise).
export const QUALITY_REVIEW_MIN_RESPONSES = 3

export function needsQualityReview(scores: readonly number[]): boolean {
  return scores.length >= QUALITY_REVIEW_MIN_RESPONSES && computeNps(scores) < 0
}
