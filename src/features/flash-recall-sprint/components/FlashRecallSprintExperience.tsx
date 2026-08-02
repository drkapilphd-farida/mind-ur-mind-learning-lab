'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { useReadingSession } from '@/hooks/reading-engine/useReadingSession'
import { loadBestWpm, recordBestWpmSession } from '@/features/reading-engine/readingLocalHistory'
import { computeWpm } from '@/features/reading-engine/readingMetrics'
import { ReadingSessionCompleteScreen } from '@/features/reading-engine/components/ReadingSessionCompleteScreen'
import { ComprehensionCheckpoint } from '@/features/reading-engine/components/ComprehensionCheckpoint'
import type { ReadingSessionResult } from '@/features/reading-engine/types'
import { FLASH_RECALL_SPRINT_ROUNDS, TOTAL_FLASH_RECALL_SPRINT_ROUNDS } from '../flashRecallSprintDataset'
import { FlashRecallSprintSettings, DEFAULT_TARGET_WPM } from './FlashRecallSprintSettings'
import { FlashRecallSprintBlockRuntime } from './FlashRecallSprintBlockRuntime'

const LAB_HREF = '/labs/quantum-speed-reading'
const BEST_WPM_STORAGE_KEY = 'qsr-flash-recall-sprint-best'

// A single comprehension question per round genuinely gates progression:
// passThreshold=1 against a 1-question array means a wrong answer forces
// ComprehensionCheckpoint's own built-in "Try Again" retry of that same
// question — the exact existing convention already used by Sentence/
// Paragraph Reading, not a new gate mechanic invented for this exercise.
const PASS_THRESHOLD = 1

type ExperiencePhase = 'settings' | 'flashing' | 'recall-check' | 'complete'

// Top-level orchestrator for Flash Recall & Retention Sprint™ — the fourth
// and final advanced training exercise. Structurally mirrors
// SentenceReadingModeExperience.tsx's block + comprehension-check flow
// (same UNCHANGED useReadingRuntime via FlashRecallSprintBlockRuntime.tsx,
// same useReadingSession persistence, same shared ComprehensionCheckpoint
// component, unforked). Unlike Sentence/RVSE, target WPM stays CONSTANT
// across rounds rather than auto-incrementing — every passage here is a
// fixed 12 words, and the Settings screen's own WPM band is specifically
// chosen to keep the flash's dwell duration inside the required 3-5
// second window (see FlashRecallSprintSettings.tsx); incrementing WPM
// round over round would eventually push later rounds' flash duration
// below 3 seconds, breaking that requirement.
export function FlashRecallSprintExperience(): React.JSX.Element {
  const router = useRouter()
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'flash-recall-sprint' })
  const readingSession = useReadingSession(session)

  const [phase, setPhase] = useState<ExperiencePhase>('settings')
  const [roundIndex, setRoundIndex] = useState(0)
  const [restartNonce, setRestartNonce] = useState(0)
  const [targetWpm, setTargetWpm] = useState<number>(DEFAULT_TARGET_WPM)
  const [bestWpm, setBestWpm] = useState(0)
  const [completedResult, setCompletedResult] = useState<ReadingSessionResult | null>(null)

  const accumulatedElapsedMsRef = useRef(0)
  const accumulatedWordsReadRef = useRef(0)
  const accumulatedTotalWordsRef = useRef(0)

  function finalizeSession(aggregate: {
    elapsedMs: number
    wordsRead: number
    totalWords: number
    targetWpmUsed: number
    wasFinishedEarly: boolean
  }): void {
    const averageWpm = computeWpm(aggregate.wordsRead, aggregate.elapsedMs)
    const completionPercent = aggregate.totalWords > 0 ? Math.round((aggregate.wordsRead / aggregate.totalWords) * 100) : 0
    const result: ReadingSessionResult = {
      averageWpm,
      targetWpm: aggregate.targetWpmUsed,
      elapsedMs: aggregate.elapsedMs,
      wordsRead: aggregate.wordsRead,
      totalWords: aggregate.totalWords,
      completionPercent,
      wasFinishedEarly: aggregate.wasFinishedEarly,
    }
    setCompletedResult(result)
    setBestWpm(recordBestWpmSession(BEST_WPM_STORAGE_KEY, result.averageWpm))
    readingSession.recordResult(result)
    setPhase('complete')
  }

  function handleStart(): void {
    setBestWpm(loadBestWpm(BEST_WPM_STORAGE_KEY))
    accumulatedElapsedMsRef.current = 0
    accumulatedWordsReadRef.current = 0
    accumulatedTotalWordsRef.current = 0
    setRoundIndex(0)
    session.start()
    setPhase('flashing')
  }

  function handleFlashComplete(result: ReadingSessionResult): void {
    if (result.wasFinishedEarly) {
      finalizeSession({
        elapsedMs: accumulatedElapsedMsRef.current + result.elapsedMs,
        wordsRead: accumulatedWordsReadRef.current + result.wordsRead,
        totalWords: accumulatedTotalWordsRef.current + result.totalWords,
        targetWpmUsed: result.targetWpm,
        wasFinishedEarly: true,
      })
      return
    }

    accumulatedElapsedMsRef.current += result.elapsedMs
    accumulatedWordsReadRef.current += result.wordsRead
    accumulatedTotalWordsRef.current += result.totalWords
    setPhase('recall-check')
  }

  function handleCheckpointPassContinue(): void {
    const isLastRound = roundIndex >= TOTAL_FLASH_RECALL_SPRINT_ROUNDS - 1
    if (isLastRound) {
      finalizeSession({
        elapsedMs: accumulatedElapsedMsRef.current,
        wordsRead: accumulatedWordsReadRef.current,
        totalWords: accumulatedTotalWordsRef.current,
        targetWpmUsed: targetWpm,
        wasFinishedEarly: false,
      })
      return
    }

    setRoundIndex((index) => index + 1)
    setPhase('flashing')
  }

  function handleExitRequested(elapsedMsInCurrentRound: number): void {
    void session.recordExit(accumulatedElapsedMsRef.current + elapsedMsInCurrentRound)
    router.push(LAB_HREF)
  }

  function handleReadAgain(): void {
    readingSession.reset()
    setCompletedResult(null)
    accumulatedElapsedMsRef.current = 0
    accumulatedWordsReadRef.current = 0
    accumulatedTotalWordsRef.current = 0
    setRoundIndex(0)
    setRestartNonce((nonce) => nonce + 1)
    session.start()
    setPhase('flashing')
  }

  if (phase === 'settings') {
    return <FlashRecallSprintSettings targetWpm={targetWpm} onSelectTargetWpm={setTargetWpm} onStart={handleStart} />
  }

  if (phase === 'recall-check') {
    const isLastRound = roundIndex >= TOTAL_FLASH_RECALL_SPRINT_ROUNDS - 1
    const currentRound = FLASH_RECALL_SPRINT_ROUNDS[roundIndex]
    if (currentRound === undefined) {
      return <></>
    }
    return (
      <ComprehensionCheckpoint
        blockLabel={`Round ${roundIndex + 1} of ${TOTAL_FLASH_RECALL_SPRINT_ROUNDS}`}
        questions={[currentRound.question]}
        passThreshold={PASS_THRESHOLD}
        isLastBlock={isLastRound}
        nextTargetWpm={targetWpm}
        onPassContinue={handleCheckpointPassContinue}
        onExit={() => handleExitRequested(0)}
      />
    )
  }

  if (phase === 'complete' && completedResult !== null) {
    return (
      <ReadingSessionCompleteScreen
        subtitle="Nice, sharp recall."
        result={completedResult}
        bestWpm={bestWpm}
        onReadAgain={handleReadAgain}
      />
    )
  }

  const currentRound = FLASH_RECALL_SPRINT_ROUNDS[roundIndex]
  if (currentRound === undefined) {
    return <></>
  }

  return (
    <FlashRecallSprintBlockRuntime
      key={`${roundIndex}-${restartNonce}`}
      passage={currentRound.passage}
      targetWpm={targetWpm}
      roundIndex={roundIndex}
      totalRounds={TOTAL_FLASH_RECALL_SPRINT_ROUNDS}
      onFlashComplete={handleFlashComplete}
      onExitRequested={handleExitRequested}
    />
  )
}
