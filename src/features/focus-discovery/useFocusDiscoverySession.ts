import { useCallback, useRef } from 'react'
import { saveFocusDiscoverySession } from './actions/saveFocusDiscoverySession'
import type { FocusDiscoveryEvent, FocusDiscoverySceneId } from './types'

// Accumulates the observation log for one Focus Discovery™ run — per-
// scene dwell time plus each mission's own real, raw behavioural result
// — entirely client-side until the run finishes, then hands it to the
// Server Action once. No event is ever read back or displayed; this is
// write-only telemetry, mirroring `useMemoryDiscoverySession.ts` exactly.
type UseFocusDiscoverySessionResult = {
  enterScene: (scene: FocusDiscoverySceneId) => void
  recordSceneExit: (scene: FocusDiscoverySceneId) => void
  recordMissionResult: (event: Exclude<FocusDiscoveryEvent, { type: 'scene_timing' }>) => void
  submitSession: (completed: boolean) => void
}

export function useFocusDiscoverySession(): UseFocusDiscoverySessionResult {
  const events = useRef<FocusDiscoveryEvent[]>([])
  const sceneEnteredAt = useRef<number>(Date.now())

  const enterScene = useCallback((_scene: FocusDiscoverySceneId): void => {
    sceneEnteredAt.current = Date.now()
  }, [])

  const recordSceneExit = useCallback((scene: FocusDiscoverySceneId): void => {
    events.current.push({ type: 'scene_timing', scene, dwellMs: Date.now() - sceneEnteredAt.current })
  }, [])

  const recordMissionResult = useCallback((event: Exclude<FocusDiscoveryEvent, { type: 'scene_timing' }>): void => {
    events.current.push(event)
  }, [])

  const submitSession = useCallback((completed: boolean): void => {
    if (events.current.length === 0) return
    void saveFocusDiscoverySession({ events: events.current, completed })
  }, [])

  return { enterScene, recordSceneExit, recordMissionResult, submitSession }
}
