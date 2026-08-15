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
import { buildUnitsForCategory, pickSessionCategory, type ParagraphReadingModeCategory } from '../paragraphReadingModeDataset'
import {
  ParagraphReadingModeSettings,
  type ParagraphReadingWidth,
  type ParagraphFontSize,
  type ParagraphFlowOrientation,
} from './ParagraphReadingModeSettings'
import { ParagraphReadingModeCanvas } from './ParagraphReadingModeCanvas'
import { ParagraphReadingModeVerticalCanvas } from './ParagraphReadingModeVerticalCanvas'
import { ParagraphReadingModeQuiz } from './ParagraphReadingModeQuiz'

const LAB_HREF = '/labs/quantum-speed-reading'

// Same literal storage key the pre-overhaul version used — kept exact so an
// existing user's Best Record survives this redesign.
const BEST_WPM_STORAGE_KEY = 'qsr-paragraph-reading-mode-best'

// Top-level orchestrator for Paragraph Reading Mode™ (10/10 Overhaul) — the
// Master Reading Engine's fourth mode. Fully replaces the previous
// block-gated architecture (5 fixed passages, each ending in a pass/retry
// ComprehensionCheckpoint before unlocking the next) with a single
// continuous useReadingRuntime session over one entire picked passage —
// zero mid-stream pop-ups, one post-reading quiz, one recap screen.
// Structurally mirrors SentenceReadingModeExperience.tsx (same engine,
// same session pipeline, same local-history pattern, same single ungated
// post-reading quiz gate), plus an orientation choice (horizontal/
// vertical) that picks which Canvas renders — both feed the engine the
// exact same word-level units/pacing. A category is picked fresh per
// mount via pickSessionCategory (client-only, called only from this
// effect — never a lazy useState initializer — see that function's own
// doc comment for the full rationale).
type ParagraphReadingModeExperienceProps = {
  // 30-Day Curriculum In-Page Master Player™ — additive, optional. Takes
  // priority over the internal curriculum-session hook below so a wizard
  // rendering this component directly in-page (no sessionStorage session
  // involved) still gets notified on natural completion.
  onComplete?: () => void
}

export function ParagraphReadingModeExperience({ onComplete }: ParagraphReadingModeExperienceProps = {}): React.JSX.Element {
  const router = useRouter()
  const curriculumSession = useCurriculumSessionCompletion('paragraph-reading-mode', LAB_HREF)

  const [sessionCategory, setSessionCategory] = useState<ParagraphReadingModeCategory | null>(null)
  useEffect(() => {
    setSessionCategory(pickSessionCategory())
  }, [])

  const sessionUnits = useMemo(() => (sessionCategory ? buildUnitsForCategory(sessionCategory) : []), [sessionCategory])
  const sessionWords = useMemo(() => sessionUnits.map((unit) => unit.text), [sessionUnits])

  const runtime = useReadingRuntime(sessionWords)
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'paragraph-reading-mode' })
  const readingSession = useReadingSession(session)

  const [bestWpm, setBestWpm] = useState(0)
  const [completedResult, setCompletedResult] = useState<ReadingSessionResult | null>(null)
  const [readingWidth, setReadingWidth] = useState<ParagraphReadingWidth>('comfortable')
  const [fontSize, setFontSize] = useState<ParagraphFontSize>('medium')
  const [orientation, setOrientation] = useState<ParagraphFlowOrientation>('horizontal')
  // Comprehension quiz gate — see ParagraphReadingModeQuiz.tsx's own doc
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
    router.push(getCurriculumSmartExitHref('paragraph-reading-mode', LAB_HREF))
  }

  if (runtime.phase === 'settings') {
    return (
      <ParagraphReadingModeSettings
        targetWpm={runtime.targetWpm}
        onSelectTargetWpm={runtime.setTargetWpm}
        readingWidth={readingWidth}
        onSelectReadingWidth={setReadingWidth}
        fontSize={fontSize}
        onSelectFontSize={setFontSize}
        orientation={orientation}
        onSelectOrientation={setOrientation}
        categoryLabel={sessionCategory?.label ?? null}
        onStart={handleStart}
      />
    )
  }

  // The comprehension quiz gates the completion/recap screen — it renders
  // as soon as reading finishes and stays up until all 3 questions are
  // answered, independent of completedResult's own timing (the quiz never
  // needs that value, only the picked category's own questions). This is
  // the ONLY quiz moment in the entire session, always after the full
  // passage has streamed to completion.
  if (runtime.phase === 'complete' && quizScore === null && sessionCategory !== null) {
    return (
      <ParagraphReadingModeQuiz
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
        {...(onComplete !== undefined ? { onContinue: onComplete } : curriculumSession.isActiveStep ? { onContinue: curriculumSession.advance } : {})}
        subtitle={quizScore !== null ? `Nice, continuous reading — comprehension: ${quizScore}/${sessionCategory?.questions.length ?? 3}.` : 'Nice, continuous reading.'}
        result={completedResult}
        bestWpm={bestWpm}
        onReadAgain={handleReadAgain}
      />
    )
  }

  const canvasProps = {
    units: sessionUnits,
    currentUnitIndex: runtime.currentUnitIndex,
    readingWidth,
    fontSize,
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

  return orientation === 'vertical' ? (
    <ParagraphReadingModeVerticalCanvas {...canvasProps} />
  ) : (
    <ParagraphReadingModeCanvas {...canvasProps} />
  )
}
