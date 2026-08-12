'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { useReadingRuntime } from '@/hooks/reading-engine/useReadingRuntime'
import { useReadingSession } from '@/hooks/reading-engine/useReadingSession'
import { loadBestWpm, recordBestWpmSession } from '@/features/reading-engine/readingLocalHistory'
import { ReadingSessionCompleteScreen } from '@/features/reading-engine/components/ReadingSessionCompleteScreen'
import { getCurriculumSmartExitHref } from '@/features/thirty-day-curriculum/curriculumReturnRouting'
import { useCurriculumSessionCompletion } from '@/features/thirty-day-curriculum/useCurriculumSessionCompletion'
import type { ReadingSessionResult } from '@/features/reading-engine/types'
import { buildWordsForCategory, pickSessionCategory, type FlashRecallSprintCategory } from '../flashRecallSprintDataset'
import { FlashRecallSprintSettings } from './FlashRecallSprintSettings'
import { FlashRecallSprintCanvas } from './FlashRecallSprintCanvas'
import { FlashRecallSprintQuiz } from './FlashRecallSprintQuiz'

const LAB_HREF = '/labs/quantum-speed-reading'
const BEST_WPM_STORAGE_KEY = 'qsr-flash-recall-sprint-best'

type FlashRecallSprintExperienceProps = {
  // QSR Pro Circuit™ seam — additive, optional, same pattern as every
  // other Reading Mode's identical prop. Standalone usage (this prop
  // omitted) is unaffected.
  onComplete?: (result: ReadingSessionResult) => void
}

// Top-level orchestrator for Flash Recall & Retention Sprint™ — True RSVP
// over a genuine 25-category content library. Mirrors
// VerticalChunkSlidingExperience.tsx exactly: a category is picked fresh
// per mount via pickSessionCategory (client-only, called only from this
// effect — never a lazy useState initializer — so the server-rendered
// 'settings' phase and the client's first paint always match; see that
// function's own doc comment for the full rationale), one continuous
// useReadingRuntime instance over the picked category's word list, zero
// interruptions, and a single post-session 3-question quiz gating the
// completion screen.
export function FlashRecallSprintExperience({ onComplete }: FlashRecallSprintExperienceProps = {}): React.JSX.Element {
  const router = useRouter()
  const curriculumSession = useCurriculumSessionCompletion('flash-recall-sprint', LAB_HREF)

  const [sessionCategory, setSessionCategory] = useState<FlashRecallSprintCategory | null>(null)
  useEffect(() => {
    setSessionCategory(pickSessionCategory())
  }, [])

  const sessionWords = useMemo(() => (sessionCategory ? buildWordsForCategory(sessionCategory) : []), [sessionCategory])

  const runtime = useReadingRuntime(sessionWords)
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'flash-recall-sprint' })
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
    router.push(getCurriculumSmartExitHref('flash-recall-sprint', LAB_HREF))
  }

  if (runtime.phase === 'settings') {
    return (
      <FlashRecallSprintSettings
        targetWpm={runtime.targetWpm}
        onSelectTargetWpm={runtime.setTargetWpm}
        onStart={handleStart}
        categoryLabel={sessionCategory?.label ?? null}
      />
    )
  }

  // The retention quiz gates the completion screen — it renders as soon as
  // the RSVP stream finishes and stays up until all 3 questions are
  // answered, independent of completedResult's own timing (the quiz never
  // needs that value, only the picked category's own questions).
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
        subtitle={quizScore !== null ? `Nice, sharp recall — retention: ${quizScore}/${sessionCategory?.questions.length ?? 3}.` : 'Nice, sharp recall.'}
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
    <FlashRecallSprintCanvas
      words={sessionWords}
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
