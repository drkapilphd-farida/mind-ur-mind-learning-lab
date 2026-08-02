'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { useReadingSession } from '@/hooks/reading-engine/useReadingSession'
import { loadBestWpm, recordBestWpmSession } from '@/features/reading-engine/readingLocalHistory'
import { computeWpm, countWords } from '@/features/reading-engine/readingMetrics'
import { ReadingSessionCompleteScreen } from '@/features/reading-engine/components/ReadingSessionCompleteScreen'
import { ComprehensionCheckpoint } from '@/features/reading-engine/components/ComprehensionCheckpoint'
import type { ReadingSessionResult, ReadingUnit } from '@/features/reading-engine/types'
import { SENTENCE_READING_MODE_UNITS } from '../sentenceReadingModeDataset'
import { SENTENCE_READING_MODE_COMPREHENSION_BLOCKS } from '../sentenceReadingModeComprehension'
import { SentenceReadingModeSettings, type SentenceWidth } from './SentenceReadingModeSettings'
import { SentenceReadingModeBlockRuntime } from './SentenceReadingModeBlockRuntime'

const LAB_HREF = '/labs/quantum-speed-reading'
const BEST_WPM_STORAGE_KEY = 'qsr-sentence-reading-mode-best'
const DEFAULT_TARGET_WPM = 250

// Comprehension Checkpoint Sprint — one block per existing dataset Level
// (6 sentences each, matching sentenceReadingModeDataset.ts's own
// LEVEL_1/2/3 grouping — 18 sentences / 6 per block = 3 blocks). Every
// block passes 5 hand-authored questions
// (sentenceReadingModeComprehension.ts); at least 3 correct unlocks
// "Next," which both advances to the next Level AND raises the target WPM
// for it.
const SENTENCES_PER_BLOCK = 6
const TOTAL_BLOCKS = Math.ceil(SENTENCE_READING_MODE_UNITS.length / SENTENCES_PER_BLOCK)
const PASS_THRESHOLD = 3
const WPM_INCREMENT = 25
const TOTAL_WORDS_ALL_BLOCKS = SENTENCE_READING_MODE_UNITS.reduce((sum, unit) => sum + countWords(unit.text), 0)

function getBlockUnits(blockIndex: number): readonly ReadingUnit[] {
  return SENTENCE_READING_MODE_UNITS.slice(blockIndex * SENTENCES_PER_BLOCK, (blockIndex + 1) * SENTENCES_PER_BLOCK)
}

type ExperiencePhase = 'settings' | 'block-reading' | 'comprehension-check' | 'complete'

// Top-level orchestrator for Sentence Reading Mode™. Comprehension
// Checkpoint Sprint — restructured from a single continuous
// useReadingRuntime session across all 18 sentences into a block-based
// flow: Settings (asked once) → N × (SentenceReadingModeBlockRuntime, each
// a fresh useReadingRuntime instance for one 6-sentence Level, keyed by
// blockIndex) → ComprehensionCheckpoint (after each block completes
// naturally) → the same shared ReadingSessionCompleteScreen once every
// block is done. An honest early Finish inside any block skips straight
// to the final completion screen (marked wasFinishedEarly) rather than
// forcing a quiz on a session the learner explicitly ended. Structurally
// mirrors ParagraphReadingModeExperience.tsx.
export function SentenceReadingModeExperience(): React.JSX.Element {
  const router = useRouter()
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'sentence-reading-mode' })
  const readingSession = useReadingSession(session)

  const [phase, setPhase] = useState<ExperiencePhase>('settings')
  const [blockIndex, setBlockIndex] = useState(0)
  const [restartNonce, setRestartNonce] = useState(0)
  const [currentTargetWpm, setCurrentTargetWpm] = useState(DEFAULT_TARGET_WPM)
  const [bestWpm, setBestWpm] = useState(0)
  const [completedResult, setCompletedResult] = useState<ReadingSessionResult | null>(null)
  const [sentenceWidth, setSentenceWidth] = useState<SentenceWidth>('comfortable')

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
      <SentenceReadingModeSettings
        targetWpm={currentTargetWpm}
        onSelectTargetWpm={setCurrentTargetWpm}
        sentenceWidth={sentenceWidth}
        onSelectSentenceWidth={setSentenceWidth}
        onStart={handleStart}
      />
    )
  }

  if (phase === 'comprehension-check') {
    const block = SENTENCE_READING_MODE_COMPREHENSION_BLOCKS[blockIndex]
    if (!block) return <></>
    const isLastBlock = blockIndex >= TOTAL_BLOCKS - 1
    return (
      <ComprehensionCheckpoint
        blockLabel={`Level ${blockIndex + 1} of ${TOTAL_BLOCKS}`}
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
        subtitle="Nice, natural sentence reading."
        result={completedResult}
        bestWpm={bestWpm}
        onReadAgain={handleReadAgain}
      />
    )
  }

  return (
    <SentenceReadingModeBlockRuntime
      key={`${blockIndex}-${restartNonce}`}
      blockUnits={getBlockUnits(blockIndex)}
      targetWpm={currentTargetWpm}
      sentenceWidth={sentenceWidth}
      onBlockComplete={handleBlockComplete}
      onExitRequested={handleExitRequested}
    />
  )
}
