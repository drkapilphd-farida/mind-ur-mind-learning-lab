'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { useReadingSession } from '@/hooks/reading-engine/useReadingSession'
import { loadBestWpm, recordBestWpmSession } from '@/features/reading-engine/readingLocalHistory'
import { computeWpm } from '@/features/reading-engine/readingMetrics'
import { ReadingSessionCompleteScreen } from '@/features/reading-engine/components/ReadingSessionCompleteScreen'
import type { ReadingSessionResult } from '@/features/reading-engine/types'
import {
  pickRandomTokens,
  generateWidePeripheralPosition,
  computeRoundWordCount,
  type RapidVisualSpanPosition,
} from '../rapidVisualSpanExpanderDataset'
import { RapidVisualSpanExpanderSettings, DEFAULT_TARGET_WPM } from './RapidVisualSpanExpanderSettings'
import { RapidVisualSpanExpanderBlockRuntime } from './RapidVisualSpanExpanderBlockRuntime'
import { RapidVisualSpanExpanderRoundTransition } from './RapidVisualSpanExpanderRoundTransition'

const LAB_HREF = '/labs/quantum-speed-reading'
const BEST_WPM_STORAGE_KEY = 'qsr-rapid-visual-span-expander-best'

// Pure Timed Progression Sprint — no more MCQ/recall gate: this is now a
// pure speed-and-peripheral training session. Each round runs for a fixed
// real-world duration (ROUND_DURATION_SECONDS) at the round's own target
// WPM — see computeRoundWordCount in the dataset file for how a duration
// is honestly achieved through the UNCHANGED useReadingRuntime, which only
// ever completes by exhausting its unit list. 4 rounds per session,
// matching this exercise's existing progression length; every completed
// round unconditionally advances (no pass/fail), bumping target WPM by
// WPM_INCREMENT each time.
const TOTAL_ROUNDS = 4
const ROUND_DURATION_SECONDS = 20
const WPM_INCREMENT = 25

type ExperiencePhase = 'settings' | 'round-flashing' | 'round-complete' | 'complete'

type RoundData = {
  tokens: string[]
  positions: RapidVisualSpanPosition[]
}

type RapidVisualSpanExpanderExperienceProps = {
  // QSR Pro Circuit™ — additive, optional. See
  // SchulteGridDrillExperience.tsx's identical seam for the full
  // rationale. Fires when the learner taps "Continue Session →" on the
  // real completion screen — never automatically — so
  // RotatingQuantumReadingSprintPhase.tsx regains control only after they
  // have actually seen their result. Standalone usage (this prop
  // omitted) is unchanged; useReadingSession's own recordResult still
  // fires unconditionally in finalizeSession below.
  onComplete?: (result: ReadingSessionResult) => void
}

function buildRoundData(targetWpm: number): RoundData {
  const wordCount = computeRoundWordCount(targetWpm, ROUND_DURATION_SECONDS)
  const tokens = [...pickRandomTokens(wordCount)]
  const positions = tokens.map(() => generateWidePeripheralPosition())
  return { tokens, positions }
}

// Top-level orchestrator for Rapid Visual Span Expander™. Pure Timed
// Progression Sprint — flash pacing still comes from the UNCHANGED
// useReadingRuntime (via RapidVisualSpanExpanderBlockRuntime.tsx, itself
// untouched — it was already generic over any token-list length), and
// persistence still goes through useReadingSession, matching every
// Reading Mode's block-based flow: Settings (Target WPM, default 175) →
// N timed rounds × (BlockRuntime flashing for ~ROUND_DURATION_SECONDS →
// RoundTransition breather) → on continue: advance + bump WPM by 25 → the
// same shared ReadingSessionCompleteScreen once every round is done. An
// honest early Finish inside any round still skips straight to the final
// completion screen (marked wasFinishedEarly), unchanged from before.
export function RapidVisualSpanExpanderExperience({ onComplete }: RapidVisualSpanExpanderExperienceProps = {}): React.JSX.Element {
  const router = useRouter()
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'rapid-visual-span-expander' })
  const readingSession = useReadingSession(session)

  const [phase, setPhase] = useState<ExperiencePhase>('settings')
  const [roundIndex, setRoundIndex] = useState(0)
  const [restartNonce, setRestartNonce] = useState(0)
  const [currentTargetWpm, setCurrentTargetWpm] = useState<number>(DEFAULT_TARGET_WPM)
  const [roundData, setRoundData] = useState<RoundData>(() => buildRoundData(DEFAULT_TARGET_WPM))
  const [lastRoundSummary, setLastRoundSummary] = useState<{ wordsFlashed: number; elapsedMs: number } | null>(null)
  const [bestWpm, setBestWpm] = useState(0)
  const [completedResult, setCompletedResult] = useState<ReadingSessionResult | null>(null)

  const initialTargetWpmRef = useRef<number>(DEFAULT_TARGET_WPM)
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
    initialTargetWpmRef.current = currentTargetWpm
    accumulatedElapsedMsRef.current = 0
    accumulatedWordsReadRef.current = 0
    accumulatedTotalWordsRef.current = 0
    setRoundIndex(0)
    setRoundData(buildRoundData(currentTargetWpm))
    session.start()
    setPhase('round-flashing')
  }

  function handleBlockRoundComplete(result: ReadingSessionResult): void {
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
    setLastRoundSummary({ wordsFlashed: result.wordsRead, elapsedMs: result.elapsedMs })
    setPhase('round-complete')
  }

  function handleContinueToNextRound(): void {
    const isLastRound = roundIndex >= TOTAL_ROUNDS - 1
    if (isLastRound) {
      finalizeSession({
        elapsedMs: accumulatedElapsedMsRef.current,
        wordsRead: accumulatedWordsReadRef.current,
        totalWords: accumulatedTotalWordsRef.current,
        targetWpmUsed: currentTargetWpm,
        wasFinishedEarly: false,
      })
      return
    }

    const nextWpm = currentTargetWpm + WPM_INCREMENT
    setCurrentTargetWpm(nextWpm)
    setRoundIndex((index) => index + 1)
    setRoundData(buildRoundData(nextWpm))
    setPhase('round-flashing')
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
    setCurrentTargetWpm(initialTargetWpmRef.current)
    setRoundIndex(0)
    setRoundData(buildRoundData(initialTargetWpmRef.current))
    setRestartNonce((nonce) => nonce + 1)
    session.start()
    setPhase('round-flashing')
  }

  if (phase === 'settings') {
    return (
      <RapidVisualSpanExpanderSettings targetWpm={currentTargetWpm} onSelectTargetWpm={setCurrentTargetWpm} onStart={handleStart} />
    )
  }

  if (phase === 'round-complete' && lastRoundSummary !== null) {
    const isLastRound = roundIndex >= TOTAL_ROUNDS - 1
    return (
      <RapidVisualSpanExpanderRoundTransition
        roundLabel={`Round ${roundIndex + 1} of ${TOTAL_ROUNDS}`}
        wordsFlashed={lastRoundSummary.wordsFlashed}
        roundElapsedMs={lastRoundSummary.elapsedMs}
        isLastRound={isLastRound}
        nextTargetWpm={currentTargetWpm + WPM_INCREMENT}
        onNext={handleContinueToNextRound}
        onExit={() => handleExitRequested(0)}
      />
    )
  }

  if (phase === 'complete' && completedResult !== null) {
    return (
      <ReadingSessionCompleteScreen
        subtitle="Nice, expanded awareness."
        result={completedResult}
        bestWpm={bestWpm}
        onReadAgain={handleReadAgain}
        {...(onComplete ? { onContinue: () => onComplete(completedResult) } : {})}
      />
    )
  }

  return (
    <RapidVisualSpanExpanderBlockRuntime
      key={`${roundIndex}-${restartNonce}`}
      roundTokens={roundData.tokens}
      roundPositions={roundData.positions}
      targetWpm={currentTargetWpm}
      roundIndex={roundIndex}
      totalRounds={TOTAL_ROUNDS}
      onRoundComplete={handleBlockRoundComplete}
      onExitRequested={handleExitRequested}
    />
  )
}
