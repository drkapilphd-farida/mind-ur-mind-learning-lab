'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { useReadingSession } from '@/hooks/reading-engine/useReadingSession'
import { loadBestWpm, recordBestWpmSession } from '@/features/reading-engine/readingLocalHistory'
import { computeWpm, countWords } from '@/features/reading-engine/readingMetrics'
import { ReadingSessionCompleteScreen } from '@/features/reading-engine/components/ReadingSessionCompleteScreen'
import { ComprehensionCheckpoint } from '@/features/reading-engine/components/ComprehensionCheckpoint'
import type { ReadingSessionResult } from '@/features/reading-engine/types'
import { GUIDED_PARAGRAPH_READING_MODE_UNITS } from '../guidedParagraphReadingModeDataset'
import { GUIDED_PARAGRAPH_READING_MODE_COMPREHENSION_BLOCKS } from '../guidedParagraphReadingModeComprehension'
import {
  GuidedParagraphReadingModeSettings,
  type GuidedParagraphReadingWidth,
  type GuidedParagraphFontSize,
} from './GuidedParagraphReadingModeSettings'
import { GuidedParagraphReadingModeBlockRuntime } from './GuidedParagraphReadingModeBlockRuntime'

const LAB_HREF = '/labs/quantum-speed-reading'
// Own storage key, separate from every other mode's Best Record.
const BEST_WPM_STORAGE_KEY = 'qsr-guided-paragraph-reading-mode-best'
const DEFAULT_TARGET_WPM = 250

// One block per passage (each of the 5 long-form, single-topic passages
// in guidedParagraphReadingModeDataset.ts is already a natural, self-
// contained block). Every block passes 5 hand-authored questions
// (guidedParagraphReadingModeComprehension.ts); at least 3 correct
// unlocks "Next," which both advances to the next passage AND raises the
// target WPM for it — an honest, programmatic difficulty ramp, not a
// manual re-selection. Structurally identical to
// ParagraphReadingModeExperience.tsx.
const TOTAL_BLOCKS = GUIDED_PARAGRAPH_READING_MODE_UNITS.length
const PASS_THRESHOLD = 3
const WPM_INCREMENT = 25
const TOTAL_WORDS_ALL_BLOCKS = GUIDED_PARAGRAPH_READING_MODE_UNITS.reduce((sum, unit) => sum + countWords(unit.text), 0)

type ExperiencePhase = 'settings' | 'block-reading' | 'comprehension-check' | 'complete'

// Top-level orchestrator for Guided Paragraph Reading Mode™ — the Master
// Reading Engine's fifth and final mode. Same block-based flow every
// other Comprehension Checkpoint mode uses: Settings (asked once) → N ×
// (GuidedParagraphReadingModeBlockRuntime, each a fresh useReadingRuntime
// instance paced word-by-word through exactly one long passage, keyed by
// blockIndex so React remounts it cleanly per block) →
// ComprehensionCheckpoint (after each block completes naturally) → the
// same shared ReadingSessionCompleteScreen once every block is done. An
// honest early Finish inside any block skips straight to the final
// completion screen (marked wasFinishedEarly) rather than forcing a quiz
// on a session the learner explicitly ended. What's unique to this mode
// is entirely presentational (the guided line-sweep pacing bar) — see
// GuidedParagraphReadingModeCanvas.tsx.
export function GuidedParagraphReadingModeExperience(): React.JSX.Element {
  const router = useRouter()
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'guided-paragraph-reading-mode' })
  const readingSession = useReadingSession(session)

  const [phase, setPhase] = useState<ExperiencePhase>('settings')
  const [blockIndex, setBlockIndex] = useState(0)
  const [restartNonce, setRestartNonce] = useState(0)
  const [currentTargetWpm, setCurrentTargetWpm] = useState(DEFAULT_TARGET_WPM)
  const [bestWpm, setBestWpm] = useState(0)
  const [completedResult, setCompletedResult] = useState<ReadingSessionResult | null>(null)
  const [readingWidth, setReadingWidth] = useState<GuidedParagraphReadingWidth>('comfortable')
  const [fontSize, setFontSize] = useState<GuidedParagraphFontSize>('medium')

  const initialTargetWpmRef = useRef(DEFAULT_TARGET_WPM)
  const accumulatedElapsedMsRef = useRef(0)
  const accumulatedWordsReadRef = useRef(0)

  useEffect(() => {
    setBestWpm(loadBestWpm(BEST_WPM_STORAGE_KEY))
  }, [])

  function finalizeSession(aggregate: { elapsedMs: number; wordsRead: number; targetWpmUsed: number; wasFinishedEarly: boolean }): void {
    const totalWords = TOTAL_WORDS_ALL_BLOCKS
    const averageWpm = computeWpm(aggregate.wordsRead, aggregate.elapsedMs)
    const completionPercent = totalWords > 0 ? Math.round((aggregate.wordsRead / totalWords) * 100) : 0
    const result: ReadingSessionResult = {
      averageWpm,
      targetWpm: aggregate.targetWpmUsed,
      elapsedMs: aggregate.elapsedMs,
      wordsRead: aggregate.wordsRead,
      totalWords,
      completionPercent,
      wasFinishedEarly: aggregate.wasFinishedEarly,
    }
    setCompletedResult(result)
    setBestWpm(recordBestWpmSession(BEST_WPM_STORAGE_KEY, result.averageWpm))
    readingSession.recordResult(result)
    setPhase('complete')
  }

  function handleStart(): void {
    initialTargetWpmRef.current = currentTargetWpm
    accumulatedElapsedMsRef.current = 0
    accumulatedWordsReadRef.current = 0
    setBlockIndex(0)
    session.start()
    setPhase('block-reading')
  }

  function handleBlockComplete(result: ReadingSessionResult): void {
    if (result.wasFinishedEarly) {
      finalizeSession({
        elapsedMs: accumulatedElapsedMsRef.current + result.elapsedMs,
        wordsRead: accumulatedWordsReadRef.current + result.wordsRead,
        targetWpmUsed: result.targetWpm,
        wasFinishedEarly: true,
      })
      return
    }

    accumulatedElapsedMsRef.current += result.elapsedMs
    accumulatedWordsReadRef.current += result.wordsRead
    setPhase('comprehension-check')
  }

  function handleCheckpointPassContinue(): void {
    const isLastBlock = blockIndex >= TOTAL_BLOCKS - 1
    if (isLastBlock) {
      finalizeSession({
        elapsedMs: accumulatedElapsedMsRef.current,
        wordsRead: accumulatedWordsReadRef.current,
        targetWpmUsed: currentTargetWpm,
        wasFinishedEarly: false,
      })
      return
    }

    setCurrentTargetWpm((wpm) => wpm + WPM_INCREMENT)
    setBlockIndex((index) => index + 1)
    setPhase('block-reading')
  }

  function handleExitRequested(elapsedMsInCurrentBlock: number): void {
    void session.recordExit(accumulatedElapsedMsRef.current + elapsedMsInCurrentBlock)
    router.push(LAB_HREF)
  }

  function handleReadAgain(): void {
    readingSession.reset()
    setCompletedResult(null)
    accumulatedElapsedMsRef.current = 0
    accumulatedWordsReadRef.current = 0
    setCurrentTargetWpm(initialTargetWpmRef.current)
    setBlockIndex(0)
    setRestartNonce((nonce) => nonce + 1)
    session.start()
    setPhase('block-reading')
  }

  if (phase === 'settings') {
    return (
      <GuidedParagraphReadingModeSettings
        targetWpm={currentTargetWpm}
        onSelectTargetWpm={setCurrentTargetWpm}
        readingWidth={readingWidth}
        onSelectReadingWidth={setReadingWidth}
        fontSize={fontSize}
        onSelectFontSize={setFontSize}
        onStart={handleStart}
      />
    )
  }

  if (phase === 'comprehension-check') {
    const block = GUIDED_PARAGRAPH_READING_MODE_COMPREHENSION_BLOCKS[blockIndex]
    if (!block) return <></>
    const isLastBlock = blockIndex >= TOTAL_BLOCKS - 1
    return (
      <ComprehensionCheckpoint
        blockLabel={`Passage ${blockIndex + 1} of ${TOTAL_BLOCKS}`}
        questions={block.questions}
        passThreshold={PASS_THRESHOLD}
        isLastBlock={isLastBlock}
        nextTargetWpm={currentTargetWpm + WPM_INCREMENT}
        onPassContinue={handleCheckpointPassContinue}
        onExit={() => handleExitRequested(0)}
      />
    )
  }

  if (phase === 'complete' && completedResult !== null) {
    return (
      <ReadingSessionCompleteScreen
        subtitle="Nice, guided reading."
        result={completedResult}
        bestWpm={bestWpm}
        onReadAgain={handleReadAgain}
      />
    )
  }

  const blockUnit = GUIDED_PARAGRAPH_READING_MODE_UNITS[blockIndex]
  if (!blockUnit) return <></>

  return (
    <GuidedParagraphReadingModeBlockRuntime
      key={`${blockIndex}-${restartNonce}`}
      blockUnits={[blockUnit]}
      targetWpm={currentTargetWpm}
      readingWidth={readingWidth}
      fontSize={fontSize}
      onBlockComplete={handleBlockComplete}
      onExitRequested={handleExitRequested}
    />
  )
}
