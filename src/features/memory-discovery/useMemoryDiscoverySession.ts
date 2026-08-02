import { useCallback, useRef } from 'react'
import { saveMemoryDiscoverySession } from './actions/saveMemoryDiscoverySession'
import type { DigitSpanResult } from './digitSpan'
import type { MemoryDiscoveryEvent, MemoryDiscoverySceneId } from './types'

// Accumulates the observation log for one Memory Discovery™ run —
// per-scene dwell time, single-choice picks, recalled items, and (Sprint-
// 1.5 FIX-10) Digit Span™'s own real structured multi-round result —
// entirely client-side until the run finishes, then hands it to the
// Server Action once. No event is ever read back or displayed; this is
// write-only telemetry.
type UseMemoryDiscoverySessionResult = {
  enterScene: (scene: MemoryDiscoverySceneId) => void
  recordSceneExit: (scene: MemoryDiscoverySceneId) => void
  recordOptionResponse: (questionId: string, selectedOptionId: string) => void
  recordRecallResponse: (questionId: string, selectedItems: string[]) => void
  recordDigitSpanResult: (result: DigitSpanResult) => void
  submitSession: (completed: boolean) => void
}

export function useMemoryDiscoverySession(): UseMemoryDiscoverySessionResult {
  const events = useRef<MemoryDiscoveryEvent[]>([])
  const sceneEnteredAt = useRef<number>(Date.now())

  const enterScene = useCallback((_scene: MemoryDiscoverySceneId): void => {
    sceneEnteredAt.current = Date.now()
  }, [])

  const recordSceneExit = useCallback((scene: MemoryDiscoverySceneId): void => {
    events.current.push({
      type: 'scene_timing',
      scene,
      dwellMs: Date.now() - sceneEnteredAt.current,
    })
  }, [])

  const recordOptionResponse = useCallback((questionId: string, selectedOptionId: string): void => {
    events.current.push({ type: 'option_response', questionId, selectedOptionId })
  }, [])

  const recordRecallResponse = useCallback((questionId: string, selectedItems: string[]): void => {
    events.current.push({ type: 'recall_response', questionId, selectedItems })
  }, [])

  const recordDigitSpanResult = useCallback((result: DigitSpanResult): void => {
    events.current.push({ type: 'digit_span_result', ...result })
  }, [])

  const submitSession = useCallback((completed: boolean): void => {
    if (events.current.length === 0) return
    void saveMemoryDiscoverySession({ events: events.current, completed })
  }, [])

  return { enterScene, recordSceneExit, recordOptionResponse, recordRecallResponse, recordDigitSpanResult, submitSession }
}
