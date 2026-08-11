'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { useReadingRuntime } from '@/hooks/reading-engine/useReadingRuntime'
import { useReadingSession } from '@/hooks/reading-engine/useReadingSession'
import { loadBestWpm, recordBestWpmSession } from '@/features/reading-engine/readingLocalHistory'
import { ReadingSessionCompleteScreen } from '@/features/reading-engine/components/ReadingSessionCompleteScreen'
import type { ReadingSessionResult } from '@/features/reading-engine/types'
import { buildUnitsForCategory, pickSessionCategory, type VerticalWordReadingCategory } from '../verticalWordReadingDataset'
import { VerticalWordReadingSettings } from './VerticalWordReadingSettings'
import { VerticalWordReadingCanvas } from './VerticalWordReadingCanvas'

const LAB_HREF = '/labs/quantum-speed-reading'

// Same literal storage key the pre-migration version used — kept exact so
// an existing user's Best Record survives this reorganization into its
// own feature folder.
const BEST_WPM_STORAGE_KEY = 'qsr-vertical-word-reading-best'

type VerticalWordReadingExperienceProps = {
  // QSR Pro Circuit™ seam — additive, optional. RotatingQuantumReadingSprintPhase.tsx
  // (Phase 3 of the Unified Quantum Session) renders this exercise directly
  // with this prop as part of its Pro rotation pool — standalone usage
  // (this prop omitted) is unaffected.
  onComplete?: (result: ReadingSessionResult) => void
}

// Top-level orchestrator for Vertical Word Reading Engine™ — moved into
// its own feature folder (previously scattered across
// src/features/quantum-speed-reading/) and completely redesigned around a
// genuine 25-category vocabulary library with per-session non-repeating
// rotation, mirroring VerticalFlashRecallExperience.tsx / Vertical Chunk
// Sliding's identical pattern: a category is picked fresh per mount via
// pickSessionCategory (client-only, called only from this effect — never
// a lazy useState initializer — see that function's own doc comment for
// the full rationale). No comprehension quiz here — this exercise trains
// instant word recognition and eye movement, not comprehension, matching
// its original scope.
export function VerticalWordReadingExperience({ onComplete }: VerticalWordReadingExperienceProps = {}): React.JSX.Element {
  const router = useRouter()

  const [sessionCategory, setSessionCategory] = useState<VerticalWordReadingCategory | null>(null)
  useEffect(() => {
    setSessionCategory(pickSessionCategory())
  }, [])

  const sessionUnits = useMemo(() => (sessionCategory ? buildUnitsForCategory(sessionCategory) : []), [sessionCategory])
  const sessionWords = useMemo(() => sessionUnits.map((unit) => unit.text), [sessionUnits])

  const runtime = useReadingRuntime(sessionWords)
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'vertical-word-reading' })
  const readingSession = useReadingSession(session)

  const [bestWpm, setBestWpm] = useState(0)
  const [completedResult, setCompletedResult] = useState<ReadingSessionResult | null>(null)

  useEffect(() => {
    setBestWpm(loadBestWpm(BEST_WPM_STORAGE_KEY))
  }, [])

  useEffect(() => {
    if (runtime.phase !== 'complete' || completedResult !== null) return

    const result: ReadingSessionResult = {
      averageWpm: runtime.liveWpm,
      targetWpm: runtime.targetWpm,
      elapsedMs: runtime.elapsedMs,
      wordsRead: runtime.wordsRead,
      totalWords: runtime.totalWords,
      completionPercent: runtime.progressPercent,
      wasFinishedEarly: runtime.wasFinishedEarly,
    }
    setCompletedResult(result)
    setBestWpm(recordBestWpmSession(BEST_WPM_STORAGE_KEY, result.averageWpm))
    readingSession.recordResult(result)
  }, [
    runtime.phase,
    runtime.liveWpm,
    runtime.targetWpm,
    runtime.elapsedMs,
    runtime.wordsRead,
    runtime.totalWords,
    runtime.progressPercent,
    runtime.wasFinishedEarly,
    completedResult,
    readingSession,
  ])

  function handleStart(): void {
    if (sessionUnits.length === 0) return
    session.start()
    runtime.start()
  }

  function handleReadAgain(): void {
    readingSession.reset()
    setCompletedResult(null)
    session.start()
    runtime.restart()
  }

  function handleRestart(): void {
    readingSession.reset()
    setCompletedResult(null)
    runtime.restart()
  }

  async function handleExit(): Promise<void> {
    if (runtime.phase === 'reading' || runtime.phase === 'paused') {
      await session.recordExit(runtime.elapsedMs)
    }
    router.push(LAB_HREF)
  }

  if (runtime.phase === 'settings') {
    return (
      <VerticalWordReadingSettings
        targetWpm={runtime.targetWpm}
        onSelectTargetWpm={runtime.setTargetWpm}
        onStart={handleStart}
        categoryLabel={sessionCategory?.label ?? null}
      />
    )
  }

  if (runtime.phase === 'complete' && completedResult !== null) {
    return (
      <ReadingSessionCompleteScreen
        subtitle="Nice, steady reading."
        result={completedResult}
        bestWpm={bestWpm}
        onReadAgain={handleReadAgain}
        {...(onComplete ? { onContinue: () => onComplete(completedResult) } : {})}
      />
    )
  }

  return (
    <VerticalWordReadingCanvas
      units={sessionUnits}
      currentUnitIndex={runtime.currentUnitIndex}
      isPaused={runtime.phase === 'paused'}
      liveWpm={runtime.liveWpm}
      targetWpm={runtime.targetWpm}
      elapsedMs={runtime.elapsedMs}
      progressPercent={runtime.progressPercent}
      categoryLabel={sessionCategory?.label ?? null}
      onPause={runtime.pause}
      onResume={runtime.resume}
      onRestart={handleRestart}
      onFinish={runtime.finish}
      onExit={() => void handleExit()}
    />
  )
}
