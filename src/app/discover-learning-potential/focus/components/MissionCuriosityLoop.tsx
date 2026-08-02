'use client'

import { CuriosityBridge } from '@/features/discover-learning-potential/components/CuriosityBridge'
import { FOCUS_MISSION_CURIOSITY_COPY, type FocusMissionId } from '@/features/focus-discovery/focusMissions'

type MissionCuriosityLoopProps = {
  nextMission: FocusMissionId
  onDone: () => void
}

// FIX-12 — "Journey Storytelling... the transition between missions
// should feel natural." Reuses `CuriosityBridge` verbatim (the shared
// Foundation-layer primitive Reading/Memory Discovery's own equivalents
// already reuse) with this experience's own real copy.
export function MissionCuriosityLoop({ nextMission, onDone }: MissionCuriosityLoopProps): React.JSX.Element {
  const headline = FOCUS_MISSION_CURIOSITY_COPY[nextMission] ?? "Let's explore another attention skill."
  return (
    <main className="bg-background">
      <CuriosityBridge moment={{ headline, tone: 'progress' }} onDone={onDone} />
    </main>
  )
}
