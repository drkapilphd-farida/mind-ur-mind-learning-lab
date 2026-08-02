// Visual Intelligence Lab™ — Visual Intelligence Dashboard™, Sprint 9.
// Exercise Analytics™ — 7 category bars, entirely read-only reuse of
// already-computed Sprint-7/8 values, zero duplicated formulas. Foundation
// and Breathing show null ("Train more to unlock") — no persistence
// exists for either anywhere in this codebase.

import type { DnaContext } from '../dna/dnaContext'
import type { StrengthCategory, StrengthCategoryId } from '../dna/dnaTypes'

export type ExerciseAnalyticsCategoryId = 'foundation' | 'breathing' | 'fixation' | 'persistence' | 'observation' | 'peripheral' | 'adaptive'

export type ExerciseAnalyticsBar = {
  id: ExerciseAnalyticsCategoryId
  label: string
  /** 0-100, null when not yet trackable/measurable. */
  completionPercent: number | null
}

const CATEGORY_LABEL: Record<ExerciseAnalyticsCategoryId, string> = {
  foundation: 'Foundation',
  breathing: 'Breathing',
  fixation: 'Fixation',
  persistence: 'Persistence',
  observation: 'Observation',
  peripheral: 'Peripheral',
  adaptive: 'Adaptive',
}

export function computeExerciseAnalytics(context: DnaContext, strengths: readonly StrengthCategory[]): readonly ExerciseAnalyticsBar[] {
  const findScore = (id: StrengthCategoryId): number | null => strengths.find((s) => s.id === id)?.score ?? null

  return [
    { id: 'foundation', label: CATEGORY_LABEL.foundation, completionPercent: null },
    { id: 'breathing', label: CATEGORY_LABEL.breathing, completionPercent: null },
    { id: 'fixation', label: CATEGORY_LABEL.fixation, completionPercent: Math.round(context.adaptiveResult.performance.focusGrowth) },
    { id: 'persistence', label: CATEGORY_LABEL.persistence, completionPercent: findScore('image-persistence') },
    { id: 'observation', label: CATEGORY_LABEL.observation, completionPercent: findScore('observation') },
    { id: 'peripheral', label: CATEGORY_LABEL.peripheral, completionPercent: findScore('peripheral-vision') },
    { id: 'adaptive', label: CATEGORY_LABEL.adaptive, completionPercent: Math.round(context.adaptiveResult.performance.visualReadiness) },
  ]
}
