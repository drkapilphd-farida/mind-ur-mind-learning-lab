'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { useReadingRuntime } from '@/hooks/reading-engine/useReadingRuntime'
import { useReadingSession } from '@/hooks/reading-engine/useReadingSession'
import { loadBestWpm, recordBestWpmSession } from '@/features/reading-engine/readingLocalHistory'
import { ReadingSessionCompleteScreen } from '@/features/reading-engine/components/ReadingSessionCompleteScreen'
import type { ReadingSessionResult } from '@/features/reading-engine/types'
import { VERTICAL_WORD_READING_UNITS } from '../verticalWordReadingDataset'
import { VerticalWordReadingSettings } from './vertical-word-reading/VerticalWordReadingSettings'
import { VerticalWordReadingCanvas } from './vertical-word-reading/VerticalWordReadingCanvas'

const LAB_HREF = '/labs/quantum-speed-reading'

// Same literal storage key verticalWordReadingLocalHistory.ts used before
// this migration — kept exact so an existing user's Best Record survives
// the move to the shared readingLocalHistory.ts module.
const BEST_WPM_STORAGE_KEY = 'qsr-vertical-word-reading-best'

const UNIT_TEXTS = VERTICAL_WORD_READING_UNITS.map((unit) => unit.text)

// Top-level orchestrator for Vertical Word Reading Engine™. Sprint 3.1B —
// migrated onto the Master Reading Engine™: the runtime, WPM/progress math,
// pause discipline, session-save decision, and Best Record persistence all
// now come from shared reading-engine modules; this file only wires them
// together and owns the one thing that can't move — freezing a
// ReadingSessionResult snapshot the instant the runtime completes, since
// runtime.restart() (for "Read Again") zeroes the runtime's live fields
// immediately and the Complete screen needs the frozen values.
export function VerticalWordReadingExperience(): React.JSX.Element {
  const router = useRouter()
  const runtime = useReadingRuntime(UNIT_TEXTS)
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
    return <VerticalWordReadingSettings targetWpm={runtime.targetWpm} onSelectTargetWpm={runtime.setTargetWpm} onStart={handleStart} />
  }

  if (runtime.phase === 'complete' && completedResult !== null) {
    return (
      <ReadingSessionCompleteScreen subtitle="Nice, steady reading." result={completedResult} bestWpm={bestWpm} onReadAgain={handleReadAgain} />
    )
  }

  return (
    <VerticalWordReadingCanvas
      units={VERTICAL_WORD_READING_UNITS}
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
