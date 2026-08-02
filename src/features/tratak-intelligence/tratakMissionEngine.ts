// Visual Intelligence Lab™ — Tratak Intelligence Journey™, Sprint 10A.
// Sequential mission unlock + journey progress — mirrors journeyProgressEngine.ts's
// live-derived-never-stored style, scoped to Tratak's own 6-mission table.

import { TRATAK_MISSIONS } from './tratakMissions'
import type { TratakMissionId, TratakMissionSessionRecord } from './tratakTypes'

export type TratakMissionStatus = 'locked' | 'unlocked' | 'completed'

export type TratakMission = {
  id: TratakMissionId
  order: 1 | 2 | 3 | 4 | 5 | 6
  title: string
  status: TratakMissionStatus
  completedSessionCount: number
}

// Mission 1 is always at least 'unlocked'; mission N (N>1) unlocks only once
// mission N-1 has a completed session — never fabricates progress ahead of
// what the (currently empty, pre-Sprint-10B) session log actually shows.
export function computeTratakMissionProgress(sessions: readonly TratakMissionSessionRecord[]): readonly TratakMission[] {
  const completedCountByMission = new Map<TratakMissionId, number>()
  for (const session of sessions) {
    if (!session.completed) continue
    completedCountByMission.set(session.missionId, (completedCountByMission.get(session.missionId) ?? 0) + 1)
  }

  const missions: TratakMission[] = []
  let previousCompleted = true // mission 1 has no predecessor to gate it

  for (const definition of TRATAK_MISSIONS) {
    const completedSessionCount = completedCountByMission.get(definition.id) ?? 0
    const isCompleted = completedSessionCount > 0
    const status: TratakMissionStatus = isCompleted ? 'completed' : previousCompleted ? 'unlocked' : 'locked'

    missions.push({
      id: definition.id,
      order: definition.order,
      title: definition.title,
      status,
      completedSessionCount,
    })

    previousCompleted = isCompleted
  }

  return missions
}

export function computeTratakJourneyProgressPercent(missions: readonly TratakMission[]): number {
  if (missions.length === 0) return 0
  const completedCount = missions.filter((mission) => mission.status === 'completed').length
  return Math.round((completedCount / missions.length) * 100)
}

export function computeTratakXp(missions: readonly TratakMission[]): number {
  return missions.reduce((sum, mission) => {
    if (mission.status !== 'completed') return sum
    const definition = TRATAK_MISSIONS.find((candidate) => candidate.id === mission.id)
    return sum + (definition?.xpReward ?? 0)
  }, 0)
}

// The first mission not yet completed, or null once all 6 are done.
export function computeTratakCurrentMissionId(missions: readonly TratakMission[]): TratakMissionId | null {
  return missions.find((mission) => mission.status !== 'completed')?.id ?? null
}

// Level = completed mission count + 1 (Level 1 through Level 6), tied
// directly to real mission completions rather than an invented threshold.
export function computeTratakLevel(missions: readonly TratakMission[]): number {
  const completedCount = missions.filter((mission) => mission.status === 'completed').length
  return Math.min(completedCount + 1, missions.length || 1)
}
