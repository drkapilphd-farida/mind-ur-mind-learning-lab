'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { useReadingRuntime } from '@/hooks/reading-engine/useReadingRuntime'
import { useReadingSession } from '@/hooks/reading-engine/useReadingSession'
import { loadBestWpm, recordBestWpmSession } from '@/features/reading-engine/readingLocalHistory'
import { ReadingSessionCompleteScreen } from '@/features/reading-engine/components/ReadingSessionCompleteScreen'
import { getCurriculumSmartExitHref, getWizardAwareBackHref } from '@/features/thirty-day-curriculum/curriculumReturnRouting'
import { useCurriculumSessionCompletion } from '@/features/thirty-day-curriculum/useCurriculumSessionCompletion'
import type { ReadingSessionResult } from '@/features/reading-engine/types'
import { buildUnitsForCategory, pickSessionCategory, type VerticalChunkSlidingCategory } from '../verticalChunkSlidingDataset'
import { VerticalChunkSlidingSettings } from './VerticalChunkSlidingSettings'
import { VerticalChunkSlidingCanvas } from './VerticalChunkSlidingCanvas'
import { VerticalChunkSlidingQuiz } from './VerticalChunkSlidingQuiz'

const LAB_HREF = '/labs/quantum-speed-reading'
const BEST_WPM_STORAGE_KEY = 'qsr-vertical-chunk-sliding-best'

type VerticalChunkSlidingExperienceProps = {
  // QSR Pro Circuit™ seam — additive, optional, same pattern as
  // DynamicChunkSlidingExperience.tsx's identical prop. Standalone usage
  // (this prop omitted) is unaffected.
  onComplete?: (result: ReadingSessionResult) => void
}

// Top-level orchestrator for Vertical Chunk Sliding™ — mirrors
// DynamicChunkSlidingExperience.tsx (same Master Reading Engine, same
// session pipeline, same local-history pattern). The one real difference:
// the unit list isn't a fixed module-level constant — a category is
// picked fresh per mount via pickSessionCategory (client-only, see that
// function's own doc comment on why it's called from this effect and
// never from a lazy useState initializer).
export function VerticalChunkSlidingExperience({ onComplete }: VerticalChunkSlidingExperienceProps = {}): React.JSX.Element {
  const router = useRouter()
  const curriculumSession = useCurriculumSessionCompletion('vertical-chunk-sliding', LAB_HREF)

  const [sessionCategory, setSessionCategory] = useState<VerticalChunkSlidingCategory | null>(null)
  useEffect(() => {
    setSessionCategory(pickSessionCategory())
  }, [])

  const sessionUnits = useMemo(() => (sessionCategory ? buildUnitsForCategory(sessionCategory) : []), [sessionCategory])
  const unitTexts = useMemo(() => sessionUnits.map((unit) => unit.text), [sessionUnits])

  const runtime = useReadingRuntime(unitTexts)
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'vertical-chunk-sliding' })
  const readingSession = useReadingSession(session)

  const [bestWpm, setBestWpm] = useState(0)
  const [completedResult, setCompletedResult] = useState<ReadingSessionResult | null>(null)
  // Comprehension quiz gate — see VerticalChunkSlidingQuiz.tsx's own doc
  // comment on why this lives here rather than as a new phase inside the
  // locked useReadingRuntime.ts. null means "not yet taken this session";
  // reset alongside completedResult on every restart/read-again.
  const [quizScore, setQuizScore] = useState<number | null>(null)

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
    setQuizScore(null)
    session.start()
    runtime.restart()
  }

  function handleRestart(): void {
    readingSession.reset()
    setCompletedResult(null)
    setQuizScore(null)
    runtime.restart()
  }

  async function handleExit(): Promise<void> {
    if (runtime.phase === 'reading' || runtime.phase === 'paused') {
      await session.recordExit(runtime.elapsedMs)
    }
    router.push(getCurriculumSmartExitHref('vertical-chunk-sliding', LAB_HREF))
  }

  if (runtime.phase === 'settings') {
    return (
      <VerticalChunkSlidingSettings
        targetWpm={runtime.targetWpm}
        onSelectTargetWpm={runtime.setTargetWpm}
        onStart={handleStart}
        categoryLabel={sessionCategory?.label ?? null}
      />
    )
  }

  // The comprehension quiz gates the completion screen — it renders as
  // soon as reading finishes and stays up until all 3 questions are
  // answered, independent of completedResult's own timing (the quiz never
  // needs that value, only the picked category's own questions).
  if (runtime.phase === 'complete' && quizScore === null && sessionCategory !== null) {
    return (
      <VerticalChunkSlidingQuiz
        questions={sessionCategory.questions}
        categoryLabel={sessionCategory.label}
        onComplete={(score) => setQuizScore(score)}
        onExit={() => void handleExit()}
      />
    )
  }

  if (runtime.phase === 'complete' && completedResult !== null) {
    return (
      <ReadingSessionCompleteScreen
        backHref={getWizardAwareBackHref('vertical-chunk-sliding', LAB_HREF)}
        subtitle={quizScore !== null ? `Nice, steady vertical reading — comprehension: ${quizScore}/${sessionCategory?.questions.length ?? 3}.` : 'Nice, steady vertical reading.'}
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
    <VerticalChunkSlidingCanvas
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
