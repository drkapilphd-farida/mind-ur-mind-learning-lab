'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { useReadingRuntime } from '@/hooks/reading-engine/useReadingRuntime'
import { useReadingSession } from '@/hooks/reading-engine/useReadingSession'
import { loadBestWpm, recordBestWpmSession } from '@/features/reading-engine/readingLocalHistory'
import { ReadingSessionCompleteScreen } from '@/features/reading-engine/components/ReadingSessionCompleteScreen'
import type { ReadingSessionResult } from '@/features/reading-engine/types'
import { FLASH_RECALL_SPRINT_WORDS, FLASH_RECALL_SPRINT_QUESTIONS } from '../flashRecallSprintDataset'
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

// Top-level orchestrator for Flash Recall & Retention Sprint™ — completely
// redesigned around True RSVP. Previously this ran 6 separate rounds, each
// its own short flash immediately followed by a comprehension question
// (ComprehensionCheckpoint) before the next round could begin — repeatedly
// breaking the reading flow. Now it mirrors VerticalChunkSlidingExperience.tsx
// exactly: one continuous useReadingRuntime instance over the whole word
// list, zero interruptions, and a single post-session 3-question quiz
// gating the completion screen. FlashRecallSprintBlockRuntime.tsx (the old
// per-round wrapper) and ComprehensionCheckpoint are no longer used here —
// the latter stays fully intact for Sentence/Paragraph/Guided Paragraph
// Reading, which still rely on it.
export function FlashRecallSprintExperience({ onComplete }: FlashRecallSprintExperienceProps = {}): React.JSX.Element {
  const router = useRouter()

  const runtime = useReadingRuntime(FLASH_RECALL_SPRINT_WORDS)
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
    return <FlashRecallSprintSettings targetWpm={runtime.targetWpm} onSelectTargetWpm={runtime.setTargetWpm} onStart={handleStart} />
  }

  // The retention quiz gates the completion screen — it renders as soon as
  // the RSVP stream finishes and stays up until all 3 questions are
  // answered, independent of completedResult's own timing (the quiz never
  // needs that value, only the fixed question set).
  if (runtime.phase === 'complete' && quizScore === null) {
    return <FlashRecallSprintQuiz questions={FLASH_RECALL_SPRINT_QUESTIONS} onComplete={(score) => setQuizScore(score)} onExit={() => void handleExit()} />
  }

  if (runtime.phase === 'complete' && completedResult !== null) {
    return (
      <ReadingSessionCompleteScreen
        subtitle={quizScore !== null ? `Nice, sharp recall — retention: ${quizScore}/${FLASH_RECALL_SPRINT_QUESTIONS.length}.` : 'Nice, sharp recall.'}
        result={completedResult}
        bestWpm={bestWpm}
        onReadAgain={handleReadAgain}
        {...(onComplete ? { onContinue: () => onComplete(completedResult) } : {})}
      />
    )
  }

  return (
    <FlashRecallSprintCanvas
      words={FLASH_RECALL_SPRINT_WORDS}
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
