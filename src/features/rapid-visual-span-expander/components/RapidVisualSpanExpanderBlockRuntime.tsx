'use client'

import { useEffect, useRef } from 'react'
import { useReadingRuntime } from '@/hooks/reading-engine/useReadingRuntime'
import type { ReadingSessionResult } from '@/features/reading-engine/types'
import type { RapidVisualSpanPosition } from '../rapidVisualSpanExpanderDataset'
import { RapidVisualSpanExpanderCanvas } from './RapidVisualSpanExpanderCanvas'

type RapidVisualSpanExpanderBlockRuntimeProps = {
  roundTokens: readonly string[]
  roundPositions: readonly RapidVisualSpanPosition[]
  targetWpm: number
  roundIndex: number
  totalRounds: number
  onRoundComplete: (result: ReadingSessionResult) => void
  onExitRequested: (elapsedMs: number) => void
}

const ZERO_POSITION: RapidVisualSpanPosition = { xPercent: 0, yPercent: 0 }

// WPM-Based Timing Sprint — a thin composition wrapper around the
// UNCHANGED `useReadingRuntime` hook, same pattern every Reading Mode's
// own BlockRuntime already uses (see ParagraphReadingModeBlockRuntime.tsx):
// this round's tokens ARE the engine's `units` directly (each token is
// already a single word or number, so no further splitting is needed).
// The engine paces through them at `computeUnitDwellMs` per unit — a
// single-word token dwells for `60000/targetWpm` ms, i.e. real per-word
// reading pace — so raising target WPM (via the auto-progression in
// RapidVisualSpanExpanderExperience.tsx) genuinely speeds up the flashes,
// and slower settings genuinely keep tokens visible longer. This wrapper
// only adds *where* the current token renders (`roundPositions`,
// precomputed once per round in the Experience, indexed by
// `runtime.currentUnitIndex`) — the engine itself has no idea these units
// are positioned anywhere.
export function RapidVisualSpanExpanderBlockRuntime({
  roundTokens,
  roundPositions,
  targetWpm,
  roundIndex,
  totalRounds,
  onRoundComplete,
  onExitRequested,
}: RapidVisualSpanExpanderBlockRuntimeProps): React.JSX.Element | null {
  const runtime = useReadingRuntime(roundTokens, targetWpm)
  const hasStartedRef = useRef(false)
  const hasReportedCompleteRef = useRef(false)

  useEffect(() => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true
    runtime.start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (runtime.phase !== 'complete' || hasReportedCompleteRef.current) return
    hasReportedCompleteRef.current = true
    onRoundComplete({
      averageWpm: runtime.liveWpm,
      targetWpm: runtime.targetWpm,
      elapsedMs: runtime.elapsedMs,
      wordsRead: runtime.wordsRead,
      totalWords: runtime.totalWords,
      completionPercent: runtime.progressPercent,
      wasFinishedEarly: runtime.wasFinishedEarly,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtime.phase])

  if (runtime.phase === 'complete') {
    return null
  }

  const currentPosition = roundPositions[runtime.currentUnitIndex] ?? ZERO_POSITION

  return (
    <RapidVisualSpanExpanderCanvas
      roundIndex={roundIndex}
      totalRounds={totalRounds}
      currentToken={runtime.currentUnit}
      currentPosition={currentPosition}
      isPaused={runtime.phase === 'paused'}
      liveWpm={runtime.liveWpm}
      targetWpm={runtime.targetWpm}
      elapsedMs={runtime.elapsedMs}
      progressPercent={runtime.progressPercent}
      onPause={runtime.pause}
      onResume={runtime.resume}
      onRestart={runtime.restart}
      onFinish={runtime.finish}
      onExit={() => onExitRequested(runtime.elapsedMs)}
    />
  )
}
