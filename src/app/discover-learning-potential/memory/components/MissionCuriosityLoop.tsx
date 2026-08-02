'use client'

import { CuriosityBridge } from '@/features/discover-learning-potential/components/CuriosityBridge'
import { MEMORY_MISSION_CURIOSITY_COPY, type MemoryMissionId } from '@/features/memory-discovery/memoryMissions'

type MissionCuriosityLoopProps = {
  nextMission: MemoryMissionId
  onDone: () => void
}

// Memory Discovery Foundation™ (Sprint-1) FIX-05 — "Journey Storytelling…
// the transition between missions should feel natural." Reuses
// `CuriosityBridge` verbatim (the shared Foundation-layer primitive
// Reading Discovery's own `SprintCuriosityLoop` already reuses) with
// this experience's own real copy.
export function MissionCuriosityLoop({ nextMission, onDone }: MissionCuriosityLoopProps): React.JSX.Element {
  const headline = MEMORY_MISSION_CURIOSITY_COPY[nextMission] ?? 'Let’s explore another memory skill.'
  return (
    <main className="bg-background">
      <CuriosityBridge moment={{ headline, tone: 'progress' }} onDone={onDone} />
    </main>
  )
}
