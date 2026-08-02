import { useCallback, useRef } from 'react'
import { saveReadingDiscoverySession } from './actions/saveReadingDiscoverySession'
import type { ReadingDiscoveryEvent, ReadingDiscoverySceneId } from './types'

// Accumulates the observation log for one Reading Discovery™ run — real
// total dwell time per macro checkpoint (module intro, each of the 5
// Sprints, Reading Summary) — entirely client-side until the run
// finishes, then hands it to the Server Action once. No event is ever
// read back or displayed; this is write-only telemetry.
//
// Reading Runtime Engine™ (Sprint-2 Part-2) — `recordOptionResponse`
// removed: Meaning Sprint now answers many real questions per session
// through the continuous runtime, and that per-item signal lives in the
// in-session `LearningIntelligenceEngine` instead (see
// `readingSprints.ts`'s own comment on why this split makes sense) —
// nothing calls `recordOptionResponse` anymore. `recordSceneExit`
// returns the real dwell time it just recorded, so the orchestrator can
// also dispatch it as a `PerformanceSignal`, without a second,
// separately-tracked timer.
type UseReadingDiscoverySessionResult = {
  enterScene: (scene: ReadingDiscoverySceneId) => void
  recordSceneExit: (scene: ReadingDiscoverySceneId) => number
  submitSession: (completed: boolean) => void
}

export function useReadingDiscoverySession(): UseReadingDiscoverySessionResult {
  const events = useRef<ReadingDiscoveryEvent[]>([])
  const sceneEnteredAt = useRef<number>(Date.now())

  const enterScene = useCallback((_scene: ReadingDiscoverySceneId): void => {
    sceneEnteredAt.current = Date.now()
  }, [])

  const recordSceneExit = useCallback((scene: ReadingDiscoverySceneId): number => {
    const dwellMs = Date.now() - sceneEnteredAt.current
    events.current.push({ type: 'scene_timing', scene, dwellMs })
    return dwellMs
  }, [])

  const submitSession = useCallback((completed: boolean): void => {
    if (events.current.length === 0) return
    void saveReadingDiscoverySession({ events: events.current, completed })
  }, [])

  return { enterScene, recordSceneExit, submitSession }
}
