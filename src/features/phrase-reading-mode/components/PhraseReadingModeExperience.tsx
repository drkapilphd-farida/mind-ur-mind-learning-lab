'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { useReadingRuntime } from '@/hooks/reading-engine/useReadingRuntime'
import { useReadingSession } from '@/hooks/reading-engine/useReadingSession'
import { loadBestWpm, recordBestWpmSession } from '@/features/reading-engine/readingLocalHistory'
import { ReadingSessionCompleteScreen } from '@/features/reading-engine/components/ReadingSessionCompleteScreen'
import type { ReadingSessionResult } from '@/features/reading-engine/types'
import { PHRASE_READING_MODE_UNITS } from '../phraseReadingModeDataset'
import { PhraseReadingModeSettings, type PhraseSize } from './PhraseReadingModeSettings'
import { PhraseReadingModeCanvas } from './PhraseReadingModeCanvas'

const LAB_HREF = '/labs/quantum-speed-reading'

// Own storage key, separate from Vertical Word Reading's Best Record.
const BEST_WPM_STORAGE_KEY = 'qsr-phrase-reading-mode-best'

const UNIT_TEXTS = PHRASE_READING_MODE_UNITS.map((unit) => unit.text)

// Top-level orchestrator for Phrase Reading Mode™ (Sprint 3.2) — the Master
// Reading Engine's second mode. Structurally mirrors
// VerticalWordReadingExperience.tsx (same engine, same session pipeline,
// same local-history pattern) but feeds it phrase-shaped ReadingUnits
// instead of word-shaped ones, proving the engine itself needed zero
// changes to support a different content shape. The only genuinely new
// piece here is phraseSize — a presentational setting the engine never
// sees, kept as local state.
export function PhraseReadingModeExperience(): React.JSX.Element {
  const router = useRouter()
  const runtime = useReadingRuntime(UNIT_TEXTS)
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'phrase-reading-mode' })
  const readingSession = useReadingSession(session)

  const [bestWpm, setBestWpm] = useState(0)
  const [completedResult, setCompletedResult] = useState<ReadingSessionResult | null>(null)
  const [phraseSize, setPhraseSize] = useState<PhraseSize>('medium')

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
    return (
      <PhraseReadingModeSettings
        targetWpm={runtime.targetWpm}
        onSelectTargetWpm={runtime.setTargetWpm}
        phraseSize={phraseSize}
        onSelectPhraseSize={setPhraseSize}
        onStart={handleStart}
      />
    )
  }

  if (runtime.phase === 'complete' && completedResult !== null) {
    return (
      <ReadingSessionCompleteScreen
        subtitle="Nice, steady chunk reading."
        result={completedResult}
        bestWpm={bestWpm}
        onReadAgain={handleReadAgain}
      />
    )
  }

  return (
    <PhraseReadingModeCanvas
      units={PHRASE_READING_MODE_UNITS}
      currentUnitIndex={runtime.currentUnitIndex}
      phraseSize={phraseSize}
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
