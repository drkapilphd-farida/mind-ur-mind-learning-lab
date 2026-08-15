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
import { buildUnitsForCategory, pickSessionCategory, type GuidedParagraphReadingModeCategory } from '../guidedParagraphReadingModeDataset'
import {
  GuidedParagraphReadingModeSettings,
  type GuidedParagraphReadingWidth,
  type GuidedParagraphFontSize,
  type GuidedParagraphOrientation,
} from './GuidedParagraphReadingModeSettings'
import { GuidedParagraphReadingModeCanvas } from './GuidedParagraphReadingModeCanvas'
import { GuidedParagraphReadingModeHorizontalCanvas } from './GuidedParagraphReadingModeHorizontalCanvas'
import { GuidedParagraphReadingModeQuiz } from './GuidedParagraphReadingModeQuiz'

const LAB_HREF = '/labs/quantum-speed-reading'
// Own storage key, unchanged — kept exact so an existing user's Best
// Record survives this redesign.
const BEST_WPM_STORAGE_KEY = 'qsr-guided-paragraph-reading-mode-best'

type GuidedParagraphReadingModeExperienceProps = {
  // QSR Pro Circuit™ — additive, optional. RotatingQuantumReadingSprintPhase.tsx
  // (Phase 3 of the Unified Quantum Session) renders this exercise directly
  // with this prop as part of its Pro rotation pool — this exact prop
  // shape (`(result: ReadingSessionResult) => void`) is a live, real
  // contract with that caller and must not change. Standalone usage (this
  // prop omitted) is unaffected.
  onComplete?: (result: ReadingSessionResult) => void
}

// Top-level orchestrator for Guided Paragraph Reading Mode™ (10/10
// Overhaul) — the Master Reading Engine's fifth mode. Fully replaces the
// previous block-gated architecture (5 fixed passages, each ending in a
// pass/retry ComprehensionCheckpoint before unlocking the next) with a
// single continuous useReadingRuntime session over one entire picked
// passage — zero mid-stream pop-ups, one post-reading quiz, one
// performance summary. Structurally mirrors ParagraphReadingModeExperience.tsx
// (same engine, same session pipeline, same local-history pattern, same
// single ungated post-reading quiz gate), plus an orientation choice
// (horizontal/vertical) that picks which Canvas renders — both feed the
// engine the exact same word-level units/pacing, and both keep the full
// passage statically visible rather than scrolling it (this mode's own
// distinguishing "guided" identity — a moving glow guide over static
// text, not streaming text under a static viewport). A category is picked
// fresh per mount via pickSessionCategory (client-only, called only from
// this effect — never a lazy useState initializer — see that function's
// own doc comment for the full rationale).
export function GuidedParagraphReadingModeExperience({ onComplete }: GuidedParagraphReadingModeExperienceProps = {}): React.JSX.Element {
  const router = useRouter()
  const curriculumSession = useCurriculumSessionCompletion('guided-paragraph-reading-mode', LAB_HREF)

  const [sessionCategory, setSessionCategory] = useState<GuidedParagraphReadingModeCategory | null>(null)
  useEffect(() => {
    setSessionCategory(pickSessionCategory())
  }, [])

  const sessionUnits = useMemo(() => (sessionCategory ? buildUnitsForCategory(sessionCategory) : []), [sessionCategory])
  const sessionWords = useMemo(() => sessionUnits.map((unit) => unit.text), [sessionUnits])

  const runtime = useReadingRuntime(sessionWords)
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'guided-paragraph-reading-mode' })
  const readingSession = useReadingSession(session)

  const [bestWpm, setBestWpm] = useState(0)
  const [completedResult, setCompletedResult] = useState<ReadingSessionResult | null>(null)
  const [readingWidth, setReadingWidth] = useState<GuidedParagraphReadingWidth>('comfortable')
  const [fontSize, setFontSize] = useState<GuidedParagraphFontSize>('medium')
  const [orientation, setOrientation] = useState<GuidedParagraphOrientation>('vertical')
  // Comprehension quiz gate — see GuidedParagraphReadingModeQuiz.tsx's own
  // doc comment on why this lives here rather than as a new phase inside
  // the locked useReadingRuntime.ts. null means "not yet taken this
  // session"; reset alongside completedResult on every restart/read-again.
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
    router.push(getCurriculumSmartExitHref('guided-paragraph-reading-mode', LAB_HREF))
  }

  if (runtime.phase === 'settings') {
    return (
      <GuidedParagraphReadingModeSettings
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
  // answered, independent of completedResult's own timing. This is the
  // ONLY quiz moment in the entire session, always after the full passage
  // has been read.
  if (runtime.phase === 'complete' && quizScore === null && sessionCategory !== null) {
    return (
      <GuidedParagraphReadingModeQuiz
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
        backHref={getWizardAwareBackHref('guided-paragraph-reading-mode', LAB_HREF)}
        subtitle={quizScore !== null ? `Nice, guided reading — comprehension: ${quizScore}/${sessionCategory?.questions.length ?? 3}.` : 'Nice, guided reading.'}
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

  return orientation === 'horizontal' ? (
    <GuidedParagraphReadingModeHorizontalCanvas {...canvasProps} />
  ) : (
    <GuidedParagraphReadingModeCanvas {...canvasProps} />
  )
}
