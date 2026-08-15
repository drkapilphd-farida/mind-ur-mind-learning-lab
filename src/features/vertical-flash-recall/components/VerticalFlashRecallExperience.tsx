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
import type { ReadingSessionResult, ReadingUnit } from '@/features/reading-engine/types'
// The quiz screen is fully generic (questions/categoryLabel/callbacks,
// nothing coupled to the vertical streaming mechanic) and this exercise
// deliberately reuses the exact same 25-module content library — reusing
// the same quiz component too avoids maintaining a byte-for-byte
// duplicate of the same ~140 lines for no behavioral difference.
import { FlashRecallSprintQuiz } from '@/features/flash-recall-sprint/components/FlashRecallSprintQuiz'
import { buildWordsForCategory, pickSessionCategory, type FlashRecallSprintCategory } from '../verticalFlashRecallDataset'
import { VerticalFlashRecallSettings } from './VerticalFlashRecallSettings'
import { VerticalFlashRecallCanvas } from './VerticalFlashRecallCanvas'

const LAB_HREF = '/labs/quantum-speed-reading'
const BEST_WPM_STORAGE_KEY = 'qsr-vertical-flash-recall-best'

type VerticalFlashRecallExperienceProps = {
  // QSR Pro Circuit™ seam — additive, optional, same pattern as every
  // other Reading Mode's identical prop. Standalone usage (this prop
  // omitted) is unaffected.
  onComplete?: (result: ReadingSessionResult) => void
}

// Top-level orchestrator for Vertical Flash Recall & Retention Sprint™ —
// mirrors FlashRecallSprintExperience.tsx (same Master Reading Engine,
// same session pipeline, same client-only per-session category pick via
// pickSessionCategory — see that function's own doc comment for why it's
// called only from this effect, never a lazy useState initializer). The
// Canvas itself now streams continuously top-to-bottom (own-copy of
// Vertical Chunk Sliding's proven pattern) rather than cycling through
// fixed flash slots, which is why sessionUnits below exists alongside
// sessionWords: the runtime engine still paces itself on plain word
// strings (unchanged), but the Canvas's streaming math needs real
// ReadingUnit objects (an id per word, for React keys and for the shared
// computeContinuousStreamOffsetPx utility's own type).
export function VerticalFlashRecallExperience({ onComplete }: VerticalFlashRecallExperienceProps = {}): React.JSX.Element {
  const router = useRouter()
  const curriculumSession = useCurriculumSessionCompletion('vertical-flash-recall', LAB_HREF)

  const [sessionCategory, setSessionCategory] = useState<FlashRecallSprintCategory | null>(null)
  useEffect(() => {
    setSessionCategory(pickSessionCategory())
  }, [])

  const sessionWords = useMemo(() => (sessionCategory ? buildWordsForCategory(sessionCategory) : []), [sessionCategory])
  const sessionUnits: readonly ReadingUnit[] = useMemo(
    () => sessionWords.map((text, index) => ({ id: `word-${index}`, text })),
    [sessionWords],
  )

  const runtime = useReadingRuntime(sessionWords)
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'vertical-flash-recall' })
  const readingSession = useReadingSession(session)

  const [bestWpm, setBestWpm] = useState(0)
  const [completedResult, setCompletedResult] = useState<ReadingSessionResult | null>(null)
  // Comprehension quiz gate — see FlashRecallSprintQuiz.tsx's own doc
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
    if (sessionWords.length === 0) return
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
    router.push(getCurriculumSmartExitHref('vertical-flash-recall', LAB_HREF))
  }

  if (runtime.phase === 'settings') {
    return (
      <VerticalFlashRecallSettings
        targetWpm={runtime.targetWpm}
        onSelectTargetWpm={runtime.setTargetWpm}
        onStart={handleStart}
        categoryLabel={sessionCategory?.label ?? null}
      />
    )
  }

  // The retention quiz gates the completion screen — it renders as soon as
  // the vertical RSVP stream finishes and stays up until all 3 questions
  // are answered, independent of completedResult's own timing.
  if (runtime.phase === 'complete' && quizScore === null && sessionCategory !== null) {
    return (
      <FlashRecallSprintQuiz
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
        backHref={getWizardAwareBackHref('vertical-flash-recall', LAB_HREF)}
        subtitle={quizScore !== null ? `Nice, sharp vertical recall — retention: ${quizScore}/${sessionCategory?.questions.length ?? 3}.` : 'Nice, sharp vertical recall.'}
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
    <VerticalFlashRecallCanvas
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
