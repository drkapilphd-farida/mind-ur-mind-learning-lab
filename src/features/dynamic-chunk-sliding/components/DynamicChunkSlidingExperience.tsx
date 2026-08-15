'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { useReadingRuntime } from '@/hooks/reading-engine/useReadingRuntime'
import { useReadingSession } from '@/hooks/reading-engine/useReadingSession'
import { loadBestWpm, recordBestWpmSession } from '@/features/reading-engine/readingLocalHistory'
import { ReadingSessionCompleteScreen } from '@/features/reading-engine/components/ReadingSessionCompleteScreen'
import { getCurriculumSmartExitHref, getWizardAwareBackHref } from '@/features/thirty-day-curriculum/curriculumReturnRouting'
import { useCurriculumSessionCompletion } from '@/features/thirty-day-curriculum/useCurriculumSessionCompletion'
import type { ReadingSessionResult } from '@/features/reading-engine/types'
import { DYNAMIC_CHUNK_SLIDING_UNITS } from '../dynamicChunkSlidingDataset'
import { DynamicChunkSlidingSettings } from './DynamicChunkSlidingSettings'
import { DynamicChunkSlidingCanvas } from './DynamicChunkSlidingCanvas'

const LAB_HREF = '/labs/quantum-speed-reading'
const BEST_WPM_STORAGE_KEY = 'qsr-dynamic-chunk-sliding-best'

const UNIT_TEXTS = DYNAMIC_CHUNK_SLIDING_UNITS.map((unit) => unit.text)

type DynamicChunkSlidingExperienceProps = {
  // QSR Pro Circuit™ — additive, optional. See
  // SchulteGridDrillExperience.tsx's identical seam for the full
  // rationale. Standalone usage (this prop omitted) is unchanged.
  onComplete?: (result: ReadingSessionResult) => void
}

// Top-level orchestrator for Dynamic Chunk Sliding™ — the third advanced
// training exercise. Structurally mirrors PhraseReadingModeExperience.tsx
// (same UNCHANGED Master Reading Engine, same session pipeline, same
// local-history pattern): one continuous useReadingRuntime instance over
// the whole chunked dataset, no comprehension/MCQ phase at all — purely a
// continuous sliding read-through, exactly as this exercise's own spec
// calls for (pure speed-and-flow training, not a recall check).
export function DynamicChunkSlidingExperience({ onComplete }: DynamicChunkSlidingExperienceProps = {}): React.JSX.Element {
  const router = useRouter()
  const curriculumSession = useCurriculumSessionCompletion('dynamic-chunk-sliding', LAB_HREF)
  const runtime = useReadingRuntime(UNIT_TEXTS)
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'dynamic-chunk-sliding' })
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
    router.push(getCurriculumSmartExitHref('dynamic-chunk-sliding', LAB_HREF))
  }

  if (runtime.phase === 'settings') {
    return <DynamicChunkSlidingSettings targetWpm={runtime.targetWpm} onSelectTargetWpm={runtime.setTargetWpm} onStart={handleStart} />
  }

  if (runtime.phase === 'complete' && completedResult !== null) {
    return (
      <ReadingSessionCompleteScreen
        backHref={getWizardAwareBackHref('dynamic-chunk-sliding', LAB_HREF)}
        subtitle="Nice, fluid chunk reading."
        result={completedResult}
        bestWpm={bestWpm}
        onReadAgain={handleReadAgain}
        {...(curriculumSession.isActiveStep
          ? { onContinue: curriculumSession.advance }
          : onComplete
            ? { onContinue: () => onComplete(completedResult) }
            : {})}
      />
    )
  }

  return (
    <DynamicChunkSlidingCanvas
      units={DYNAMIC_CHUNK_SLIDING_UNITS}
      currentUnitIndex={runtime.currentUnitIndex}
      isPaused={runtime.phase === 'paused'}
      liveWpm={runtime.liveWpm}
      targetWpm={runtime.targetWpm}
      elapsedMs={runtime.elapsedMs}
      progressPercent={runtime.progressPercent}
      onPause={runtime.pause}
      onResume={runtime.resume}
      onRestart={handleRestart}
      onFinish={runtime.finish}
      onExit={() => void handleExit()}
    />
  )
}
