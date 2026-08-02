// Focus Discovery™ — Focus Profile Handoff. Sprint-2.0 PREPARATION FOR
// AI LEARNING STUDIO™ — "Pass behavioural profile internally... do not
// ask the user to configure anything. The next experience should
// already feel personalized." Mirrors
// `discover-learning-potential/readingSpeedHandoff.ts`'s own exact
// shape (same localStorage-with-safe-fallback pattern, same bounded
// recency): Focus Discovery writes its own real, already-computed
// report here once, at the very end; any future real consumer (AI
// Learning Studio™) reads it back gracefully — `null` if absent, never
// a hard dependency.

import type { FocusIntelligenceReport } from './focusIntelligenceEngine'

const FOCUS_PROFILE_KEY = 'discover-learning-potential-focus-profile'
// A stale profile (a very old visit) is a weaker real signal than a
// fresh one — mirrors `readingSpeedHandoff.ts`'s own bounded-recency
// discipline rather than trusting a value forever.
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30 // 30 days

// A real, honest snapshot of the already-computed report — never a
// second, divergent calculation. Every field here already exists on
// `FocusIntelligenceReport`; this is purely what gets persisted for a
// future real consumer, not a new AI calculation (Sprint-2.0 ROLE — "You
// are NOT changing AI calculations").
export type FocusProfileRecord = {
  profileName: string
  heroMetricLabel: string
  heroMetricPercent: number
  focusEfficiencyPercent: number
  strongestSkillLabel: string
  growthOpportunityLine: string
  reactionPrecisionPercent: number
  visualSearchAccuracyPercent: number
  ruleAdaptationPercent: number
  timestamp: number
}

export function recordFocusProfile(report: FocusIntelligenceReport): void {
  if (typeof window === 'undefined') return
  try {
    const record: FocusProfileRecord = {
      profileName: report.profileName,
      heroMetricLabel: report.heroMetricLabel,
      heroMetricPercent: report.heroMetricPercent,
      focusEfficiencyPercent: report.focusEfficiencyPercent,
      strongestSkillLabel: report.strongestSkillLabel,
      growthOpportunityLine: report.growthOpportunityLine,
      reactionPrecisionPercent: report.reactionPrecisionPercent,
      visualSearchAccuracyPercent: report.visualSearchAccuracyPercent,
      ruleAdaptationPercent: report.ruleAdaptationPercent,
      timestamp: Date.now(),
    }
    localStorage.setItem(FOCUS_PROFILE_KEY, JSON.stringify(record))
  } catch {
    // storage full or blocked — fail silently; a future real consumer
    // just falls back to its own default, unpersonalized experience.
  }
}

export function getFocusProfile(): FocusProfileRecord | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(FOCUS_PROFILE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || typeof (parsed as Partial<FocusProfileRecord>).timestamp !== 'number') {
      return null
    }
    const record = parsed as FocusProfileRecord
    if (Date.now() - record.timestamp > MAX_AGE_MS) return null
    return record
  } catch {
    return null
  }
}
