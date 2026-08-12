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
import { buildSpatialClustersForCategory, pickSessionCategory, type FlashRecallSprintCategory } from '../photographicReadingDataset'
import { assignSpatialQuadrants } from '../spatialQuadrantAssignment'
import { PhotographicReadingSettings } from './PhotographicReadingSettings'
import { PhotographicReadingCanvas } from './PhotographicReadingCanvas'
import { PhotographicReadingQuiz } from './PhotographicReadingQuiz'

const LAB_HREF = '/labs/quantum-speed-reading'
const BEST_WPM_STORAGE_KEY = 'qsr-photographic-reading-best'

type PhotographicReadingExperienceProps = {
  // QSR Pro Circuit™ seam — additive, optional, same pattern as every
  // other Reading Mode's identical prop. Standalone usage (this prop
  // omitted) is unaffected.
  onComplete?: (result: ReadingSessionResult) => void
}

// Top-level orchestrator for Photographic Reading™ — the Spatial Quadrant
// Flashing Engine over the exact same shared 25-category content library
// Flash Recall & Retention Sprint uses. Mirrors
// SubvocalizationDestroyerExperience.tsx exactly: a category is picked
// fresh per mount via pickSessionCategory (client-only, called only from
// this effect — never a lazy useState initializer — so the server-rendered
// 'settings' phase and the client's first paint always match), one
// continuous useReadingRuntime instance over the picked category's spatial
// clusters, zero interruptions, and a single post-session 3-question quiz
// gating the completion screen.
export function PhotographicReadingExperience({ onComplete }: PhotographicReadingExperienceProps = {}): React.JSX.Element {
  const router = useRouter()
  const curriculumSession = useCurriculumSessionCompletion('photographic-reading', LAB_HREF)

  const [sessionCategory, setSessionCategory] = useState<FlashRecallSprintCategory | null>(null)
  useEffect(() => {
    setSessionCategory(pickSessionCategory())
  }, [])

  const sessionClusters = useMemo(() => (sessionCategory ? buildSpatialClustersForCategory(sessionCategory) : []), [sessionCategory])

  // Computed once per picked category, not per render — assignSpatialQuadrants
  // is intentionally impure (Math.random by default), so it must only run
  // when the underlying cluster list itself actually changes.
  const sessionQuadrants = useMemo(() => assignSpatialQuadrants(sessionClusters.length), [sessionClusters])

  const runtime = useReadingRuntime(sessionClusters)
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'photographic-reading' })
  const readingSession = useReadingSession(session)

  const [bestWpm, setBestWpm] = useState(0)
  const [completedResult, setCompletedResult] = useState<ReadingSessionResult | null>(null)
  // Comprehension quiz gate — see PhotographicReadingQuiz.tsx's own doc
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
    if (sessionClusters.length === 0) return
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
    router.push(getCurriculumSmartExitHref('photographic-reading', LAB_HREF))
  }

  if (runtime.phase === 'settings') {
    return (
      <PhotographicReadingSettings
        targetWpm={runtime.targetWpm}
        onSelectTargetWpm={runtime.setTargetWpm}
        onStart={handleStart}
        categoryLabel={sessionCategory?.label ?? null}
      />
    )
  }

  // The retention quiz gates the completion screen — it renders as soon as
  // the spatial flash stream finishes and stays up until all 3 questions
  // are answered, independent of completedResult's own timing. This is the
  // ONLY quiz moment in the entire session, always after the full stream
  // has finished.
  if (runtime.phase === 'complete' && quizScore === null && sessionCategory !== null) {
    return (
      <PhotographicReadingQuiz
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
        subtitle={
          quizScore !== null
            ? `Spatial flash session complete — retention: ${quizScore}/${sessionCategory?.questions.length ?? 3}.`
            : 'Spatial flash session complete.'
        }
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
    <PhotographicReadingCanvas
      units={sessionClusters}
      quadrants={sessionQuadrants}
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
