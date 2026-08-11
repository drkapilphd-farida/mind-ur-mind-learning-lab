'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { useReadingRuntime } from '@/hooks/reading-engine/useReadingRuntime'
import { useReadingSession } from '@/hooks/reading-engine/useReadingSession'
import { loadBestWpm, recordBestWpmSession } from '@/features/reading-engine/readingLocalHistory'
import { ReadingSessionCompleteScreen } from '@/features/reading-engine/components/ReadingSessionCompleteScreen'
import type { ReadingSessionResult } from '@/features/reading-engine/types'
import { buildDualStreamsForCategory, pickSessionCategory, type FlashRecallSprintCategory } from '../dualStreamSplitReaderDataset'
import { DualStreamSplitReaderSettings } from './DualStreamSplitReaderSettings'
import { DualStreamSplitReaderCanvas } from './DualStreamSplitReaderCanvas'
import { DualStreamSplitReaderQuiz } from './DualStreamSplitReaderQuiz'

const LAB_HREF = '/labs/quantum-speed-reading'
const BEST_WPM_STORAGE_KEY = 'qsr-dual-stream-split-reader-best'

type DualStreamSplitReaderExperienceProps = {
  // QSR Pro Circuit™ seam — additive, optional, same pattern as every
  // other Reading Mode's identical prop. Standalone usage (this prop
  // omitted) is unaffected.
  onComplete?: (result: ReadingSessionResult) => void
}

// Top-level orchestrator for Dual-Stream Split Reader™ — the Dual-Column
// Synchronized RSVP/Chunk Engine over the exact same shared 25-category
// content library Flash Recall & Retention Sprint uses. Mirrors
// PhotographicReadingExperience.tsx exactly in shape: a category is picked
// fresh per mount via pickSessionCategory (client-only, called only from
// this effect — never a lazy useState initializer — so the server-rendered
// 'settings' phase and the client's first paint always match).
//
// The one genuinely new wrinkle: the locked useReadingRuntime only paces a
// single string array, but this exercise has two synchronized streams.
// Solved by feeding it a COMBINED array — each pair's left and right text
// joined with a space — so the engine's own word-count-based dwell timing
// (computeUnitDwellMs) naturally paces each pair by its true combined
// word count, and its wordsRead/totalWords/liveWpm metrics correctly
// reflect the full amount of content actually read across both streams.
// The Canvas re-splits each combined unit back into its left/right halves
// purely for display, via the exact same index the engine already tracks.
export function DualStreamSplitReaderExperience({ onComplete }: DualStreamSplitReaderExperienceProps = {}): React.JSX.Element {
  const router = useRouter()

  const [sessionCategory, setSessionCategory] = useState<FlashRecallSprintCategory | null>(null)
  useEffect(() => {
    setSessionCategory(pickSessionCategory())
  }, [])

  const dualStreams = useMemo(
    () => (sessionCategory ? buildDualStreamsForCategory(sessionCategory) : { leftUnits: [], rightUnits: [] }),
    [sessionCategory],
  )
  const { leftUnits, rightUnits } = dualStreams

  const combinedUnits = useMemo(() => leftUnits.map((left, index) => `${left} ${rightUnits[index] ?? ''}`.trim()), [leftUnits, rightUnits])

  const runtime = useReadingRuntime(combinedUnits)
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'dual-stream-split-reader' })
  const readingSession = useReadingSession(session)

  const [bestWpm, setBestWpm] = useState(0)
  const [completedResult, setCompletedResult] = useState<ReadingSessionResult | null>(null)
  // Comprehension quiz gate — see DualStreamSplitReaderQuiz.tsx's own doc
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
    if (combinedUnits.length === 0) return
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
    router.push(LAB_HREF)
  }

  if (runtime.phase === 'settings') {
    return (
      <DualStreamSplitReaderSettings
        targetWpm={runtime.targetWpm}
        onSelectTargetWpm={runtime.setTargetWpm}
        onStart={handleStart}
        categoryLabel={sessionCategory?.label ?? null}
      />
    )
  }

  // The retention quiz gates the completion screen — it renders as soon as
  // both streams have finished and stays up until all 3 questions are
  // answered, independent of completedResult's own timing. This is the
  // ONLY quiz moment in the entire session, always after both streams have
  // finished.
  if (runtime.phase === 'complete' && quizScore === null && sessionCategory !== null) {
    return (
      <DualStreamSplitReaderQuiz
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
            ? `Dual-stream session complete — retention: ${quizScore}/${sessionCategory?.questions.length ?? 3}.`
            : 'Dual-stream session complete.'
        }
        result={completedResult}
        bestWpm={bestWpm}
        onReadAgain={handleReadAgain}
        {...(onComplete ? { onContinue: () => onComplete(completedResult) } : {})}
      />
    )
  }

  return (
    <DualStreamSplitReaderCanvas
      leftUnits={leftUnits}
      rightUnits={rightUnits}
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
