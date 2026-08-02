'use client'

import { useRef } from 'react'
import type { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import type { ReadingSessionResult } from '@/features/reading-engine/types'

// useExerciseSession's own result type isn't exported (only
// ExerciseSessionStage is) — ReturnType avoids needing any change to that
// file, matching this sprint's "nothing existing touched" scope.
type ExerciseSession = ReturnType<typeof useExerciseSession>

export type UseReadingSessionResult = {
  recordResult: (result: ReadingSessionResult) => void
  reset: () => void
}

// Master Reading Engine™ (Sprint 3.1A) — persistence composition layer.
// Takes an already-constructed useExerciseSession result as a parameter
// (the caller still owns the labId/exerciseId decision, exactly as today)
// rather than calling useExerciseSession itself, keeping this hook a pure
// composition layer. Reproduces two things VerticalWordReadingExperience.tsx
// currently hand-rolls inline: the hasRecordedRef double-fire guard, and the
// "early finish isn't a completed exercise_progress attempt" decision — an
// honest early Finish still logs a practice_sessions row (via recordExit)
// but doesn't mark exercise_progress complete off a partial read.
//
// The double-fire guard resets only when the caller calls reset() (e.g. on
// "Read Again"/"Restart") — without that, a second attempt within the same
// mounted orchestrator would silently stop saving after the first.
export function useReadingSession(session: ExerciseSession): UseReadingSessionResult {
  const hasRecordedRef = useRef(false)

  function recordResult(result: ReadingSessionResult): void {
    if (hasRecordedRef.current) return
    hasRecordedRef.current = true

    if (result.wasFinishedEarly) {
      void session.recordExit(result.elapsedMs)
    } else {
      void session.recordCompletion(result.elapsedMs)
    }
  }

  function reset(): void {
    hasRecordedRef.current = false
  }

  return { recordResult, reset }
}
