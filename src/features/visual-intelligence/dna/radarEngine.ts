// Visual Intelligence Lab™ — Visual DNA™, Sprint 8.
// Visual Intelligence Radar™ — 7 axes. Reuses the exact same scores as
// Strength Analysis wherever the concept overlaps (Observation, Peripheral
// Vision, Visual Speed, Image Persistence) instead of recomputing them —
// no duplicated calculations. Null values render as an honest gap on the
// chart, never a fabricated point.

import type { DnaContext } from './dnaContext'
import type { RadarAxis, StrengthCategory, StrengthCategoryId } from './dnaTypes'

const RADAR_AXIS_LABEL = {
  observation: 'Observation',
  focus: 'Focus',
  speed: 'Speed',
  persistence: 'Persistence',
  'peripheral-vision': 'Peripheral Vision',
  accuracy: 'Accuracy',
  adaptability: 'Adaptability',
} as const

export function computeRadarAxes(context: DnaContext, strengths: readonly StrengthCategory[]): readonly RadarAxis[] {
  const findScore = (id: StrengthCategoryId): number | null => strengths.find((s) => s.id === id)?.score ?? null

  const { imagePersistenceCompletedCount, fixationCompletedCount, persistenceChallengeCompletedCount, visualPreparationCompletedCount, successRate } =
    context.unifiedStats
  const breadth = [imagePersistenceCompletedCount, fixationCompletedCount, persistenceChallengeCompletedCount, visualPreparationCompletedCount].filter(
    (count) => count > 0,
  ).length

  return [
    { id: 'observation', label: RADAR_AXIS_LABEL.observation, value: findScore('observation') },
    { id: 'focus', label: RADAR_AXIS_LABEL.focus, value: Math.round(context.adaptiveResult.performance.focusGrowth) },
    { id: 'speed', label: RADAR_AXIS_LABEL.speed, value: findScore('visual-speed') },
    { id: 'persistence', label: RADAR_AXIS_LABEL.persistence, value: findScore('image-persistence') },
    { id: 'peripheral-vision', label: RADAR_AXIS_LABEL['peripheral-vision'], value: findScore('peripheral-vision') },
    { id: 'accuracy', label: RADAR_AXIS_LABEL.accuracy, value: successRate === null ? null : Math.round(successRate) },
    { id: 'adaptability', label: RADAR_AXIS_LABEL.adaptability, value: Math.round((breadth / 4) * 100) },
  ]
}
