'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { useReadingRuntime } from '@/hooks/reading-engine/useReadingRuntime'
import { useReadingSession } from '@/hooks/reading-engine/useReadingSession'
import { loadBestWpm, recordBestWpmSession } from '@/features/reading-engine/readingLocalHistory'
import { ReadingSessionCompleteScreen } from '@/features/reading-engine/components/ReadingSessionCompleteScreen'
import type { ReadingSessionResult } from '@/features/reading-engine/types'
import { getCurriculumSmartExitHref } from '@/features/thirty-day-curriculum/curriculumReturnRouting'
import { useCurriculumSessionCompletion } from '@/features/thirty-day-curriculum/useCurriculumSessionCompletion'
import { buildUnitsForCategory, pickSessionCategory, type PhraseReadingModeCategory } from '../phraseReadingModeDataset'
import { PhraseReadingModeSettings, type PhraseSize, type PhraseFlowOrientation } from './PhraseReadingModeSettings'
import { PhraseReadingModeCanvas } from './PhraseReadingModeCanvas'
import { PhraseReadingModeVerticalCanvas } from './PhraseReadingModeVerticalCanvas'

const LAB_HREF = '/labs/quantum-speed-reading'

// Same literal storage key the pre-overhaul version used — kept exact so an
// existing user's Best Record survives this redesign.
const BEST_WPM_STORAGE_KEY = 'qsr-phrase-reading-mode-best'

// Top-level orchestrator for Phrase Reading Mode™ (10/10 Overhaul) — the
// Master Reading Engine's second mode. Structurally mirrors
// VerticalWordReadingExperience.tsx (same engine, same session pipeline,
// same local-history pattern), but now also owns an orientation choice
// (horizontal/vertical) that picks which Canvas renders — both feed the
// engine the exact same units/pacing, proving the engine itself needed no
// changes to support a second streaming axis. A category is picked fresh
// per mount via pickSessionCategory (client-only, called only from this
// effect — never a lazy useState initializer — see that function's own doc
// comment for the full rationale).
export function PhraseReadingModeExperience(): React.JSX.Element {
  const router = useRouter()
  const curriculumSession = useCurriculumSessionCompletion('phrase-reading-mode', LAB_HREF)

  const [sessionCategory, setSessionCategory] = useState<PhraseReadingModeCategory | null>(null)
  useEffect(() => {
    setSessionCategory(pickSessionCategory())
  }, [])

  const sessionUnits = useMemo(() => (sessionCategory ? buildUnitsForCategory(sessionCategory) : []), [sessionCategory])
  const sessionWords = useMemo(() => sessionUnits.map((unit) => unit.text), [sessionUnits])

  const runtime = useReadingRuntime(sessionWords)
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'phrase-reading-mode' })
  const readingSession = useReadingSession(session)

  const [bestWpm, setBestWpm] = useState(0)
  const [completedResult, setCompletedResult] = useState<ReadingSessionResult | null>(null)
  const [phraseSize, setPhraseSize] = useState<PhraseSize>('medium')
  const [orientation, setOrientation] = useState<PhraseFlowOrientation>('horizontal')

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
    router.push(getCurriculumSmartExitHref('phrase-reading-mode', LAB_HREF))
  }

  if (runtime.phase === 'settings') {
    return (
      <PhraseReadingModeSettings
        targetWpm={runtime.targetWpm}
        onSelectTargetWpm={runtime.setTargetWpm}
        phraseSize={phraseSize}
        onSelectPhraseSize={setPhraseSize}
        orientation={orientation}
        onSelectOrientation={setOrientation}
        categoryLabel={sessionCategory?.label ?? null}
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
        {...(curriculumSession.isActiveStep ? { onContinue: curriculumSession.advance } : {})}
      />
    )
  }

  const canvasProps = {
    units: sessionUnits,
    currentUnitIndex: runtime.currentUnitIndex,
    phraseSize,
    categoryLabel: sessionCategory?.label ?? null,
    isPaused: runtime.phase === 'paused',
    liveWpm: runtime.liveWpm,
    targetWpm: runtime.targetWpm,
    elapsedMs: runtime.elapsedMs,
    progressPercent: runtime.progressPercent,
    onPause: runtime.pause,
    onResume: runtime.resume,
    onRestart: handleRestart,
    onFinish: runtime.finish,
    onExit: () => void handleExit(),
  }

  return orientation === 'vertical' ? <PhraseReadingModeVerticalCanvas {...canvasProps} /> : <PhraseReadingModeCanvas {...canvasProps} />
}
