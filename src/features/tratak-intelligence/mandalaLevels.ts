// Visual Intelligence Lab™ — Mandala Tratak™ Multi-Level Progression, Sprint 10C.
// Mandala Tratak™'s 5-level roadmap — mirrors tratakMissionEngine.ts's
// sequential-unlock shape (Sprint 10A, unmodified), scoped to levels within
// this one mission's own session rows.

import type { TratakMissionSessionRecord } from './tratakTypes'

export type MandalaLevelDifficulty = 'Easy' | 'Easy+' | 'Medium' | 'Hard' | 'Expert'
export type MandalaLevelOrder = 1 | 2 | 3 | 4 | 5

export type MandalaLevelDefinition = {
  order: MandalaLevelOrder
  title: string
  durationSeconds: number
  xpReward: number
  difficulty: MandalaLevelDifficulty
}

// Sprint 10D: level titles/difficulty updated to match the Dynamic Mandala
// Intelligence™ brief's naming exactly. Duration/XP unchanged from Sprint-10C.
export const MANDALA_LEVELS: readonly MandalaLevelDefinition[] = [
  { order: 1, title: 'Simple Mandala', durationSeconds: 45, xpReward: 50, difficulty: 'Easy' },
  { order: 2, title: 'Symmetry Mandala', durationSeconds: 45, xpReward: 50, difficulty: 'Easy+' },
  { order: 3, title: 'Geometric Mandala', durationSeconds: 60, xpReward: 50, difficulty: 'Medium' },
  { order: 4, title: 'Sacred Geometry', durationSeconds: 60, xpReward: 50, difficulty: 'Hard' },
  { order: 5, title: 'Master Mandala', durationSeconds: 90, xpReward: 50, difficulty: 'Expert' },
] as const

const MANDALA_LEVEL_BY_ORDER: Record<MandalaLevelOrder, MandalaLevelDefinition> = Object.fromEntries(
  MANDALA_LEVELS.map((level) => [level.order, level]),
) as Record<MandalaLevelOrder, MandalaLevelDefinition>

export type MandalaLevelStatus = 'locked' | 'unlocked' | 'completed'

export type MandalaLevel = {
  order: MandalaLevelOrder
  title: string
  status: MandalaLevelStatus
}

// A level counts as completed the moment a real row exists for it —
// independent of that row's `completed` flag, which the save action
// deliberately sets false for levels 1-4 so Sprint-10A's (unmodified)
// tratakMissionEngine.ts only marks the whole mission 'completed' once
// level 5 lands. Never fabricates progress ahead of real saved rows.
export function computeMandalaLevelProgress(sessions: readonly TratakMissionSessionRecord[]): readonly MandalaLevel[] {
  const completedLevelOrders = new Set(
    sessions.filter((session) => session.missionId === 'mandala-persistence' && session.levelNumber !== null).map((session) => session.levelNumber as number),
  )

  const levels: MandalaLevel[] = []
  let previousCompleted = true // level 1 has no predecessor to gate it

  for (const definition of MANDALA_LEVELS) {
    const isCompleted = completedLevelOrders.has(definition.order)
    const status: MandalaLevelStatus = isCompleted ? 'completed' : previousCompleted ? 'unlocked' : 'locked'
    levels.push({ order: definition.order, title: definition.title, status })
    previousCompleted = isCompleted
  }

  return levels
}

export function computeMandalaLevelXpEarned(levels: readonly MandalaLevel[]): number {
  return levels.reduce((sum, level) => (level.status === 'completed' ? sum + MANDALA_LEVEL_BY_ORDER[level.order].xpReward : sum), 0)
}

export function computeMandalaLevelProgressPercent(levels: readonly MandalaLevel[]): number {
  if (levels.length === 0) return 0
  const completedCount = levels.filter((level) => level.status === 'completed').length
  return Math.round((completedCount / levels.length) * 100)
}

// The first level not yet completed, or null once all 5 are done.
export function computeMandalaCurrentLevelNumber(levels: readonly MandalaLevel[]): MandalaLevelOrder | null {
  return levels.find((level) => level.status !== 'completed')?.order ?? null
}

export function isMandalaMissionFullyComplete(levels: readonly MandalaLevel[]): boolean {
  return levels.length > 0 && levels.every((level) => level.status === 'completed')
}
