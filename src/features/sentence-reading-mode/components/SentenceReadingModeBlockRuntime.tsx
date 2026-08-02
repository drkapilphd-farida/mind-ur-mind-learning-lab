'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useReadingRuntime } from '@/hooks/reading-engine/useReadingRuntime'
import type { ReadingUnit, ReadingSessionResult } from '@/features/reading-engine/types'
import type { SentenceWidth } from './SentenceReadingModeSettings'
import { SentenceReadingModeCanvas } from './SentenceReadingModeCanvas'

type SentenceReadingModeBlockRuntimeProps = {
  blockUnits: readonly ReadingUnit[]
  targetWpm: number
  sentenceWidth: SentenceWidth
  onBlockComplete: (result: ReadingSessionResult) => void
  onExitRequested: (elapsedMs: number) => void
}

// Comprehension Checkpoint Sprint — see
// ParagraphReadingModeBlockRuntime.tsx for the full rationale (identical
// pattern): a thin composition wrapper around the UNCHANGED
// `useReadingRuntime` hook, scoped to exactly one block's units (one
// 6-sentence Level). The parent (SentenceReadingModeExperience) mounts
// this with `key={blockIndex}` for a genuinely fresh runtime per block.
export function SentenceReadingModeBlockRuntime({
  blockUnits,
  targetWpm,
  sentenceWidth,
  onBlockComplete,
  onExitRequested,
}: SentenceReadingModeBlockRuntimeProps): React.JSX.Element | null {
  const unitTexts = useMemo(() => blockUnits.map((unit) => unit.text), [blockUnits])
  const runtime = useReadingRuntime(unitTexts, targetWpm)
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
    onBlockComplete({
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
    <SentenceReadingModeCanvas
      units={blockUnits}
      currentUnitIndex={runtime.currentUnitIndex}
      sentenceWidth={sentenceWidth}
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
