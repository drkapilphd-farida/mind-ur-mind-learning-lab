'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useReadingRuntime } from '@/hooks/reading-engine/useReadingRuntime'
import type { ReadingSessionResult } from '@/features/reading-engine/types'
import { FlashRecallSprintCanvas } from './FlashRecallSprintCanvas'

type FlashRecallSprintBlockRuntimeProps = {
  passage: string
  targetWpm: number
  roundIndex: number
  totalRounds: number
  onFlashComplete: (result: ReadingSessionResult) => void
  onExitRequested: (elapsedMs: number) => void
}

// A thin composition wrapper around the UNCHANGED `useReadingRuntime` hook
// — same pattern every Reading Mode's own BlockRuntime already uses (see
// SentenceReadingModeBlockRuntime.tsx / RapidVisualSpanExpanderBlockRuntime.tsx).
// The round's whole passage is fed in as a SINGLE unit (not split into
// words) — a flash is meant to show the entire passage at once, so the
// engine's per-unit dwell time (word count * 60000/targetWpm) becomes the
// flash's total on-screen duration, and `runtime.phase === 'complete'` is
// exactly "the flash timed out," which hands control to the comprehension
// check in the parent Experience.
export function FlashRecallSprintBlockRuntime({
  passage,
  targetWpm,
  roundIndex,
  totalRounds,
  onFlashComplete,
  onExitRequested,
}: FlashRecallSprintBlockRuntimeProps): React.JSX.Element | null {
  const units = useMemo(() => [passage], [passage])
  const runtime = useReadingRuntime(units, targetWpm)
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
    onFlashComplete({
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

  return (
    <FlashRecallSprintCanvas
      roundIndex={roundIndex}
      totalRounds={totalRounds}
      passage={passage}
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
