'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useReadingRuntime } from '@/hooks/reading-engine/useReadingRuntime'
import type { ReadingUnit, ReadingSessionResult } from '@/features/reading-engine/types'
import type { GuidedParagraphReadingWidth, GuidedParagraphFontSize } from './GuidedParagraphReadingModeSettings'
import { GuidedParagraphReadingModeCanvas } from './GuidedParagraphReadingModeCanvas'

type GuidedParagraphReadingModeBlockRuntimeProps = {
  blockUnits: readonly ReadingUnit[]
  targetWpm: number
  readingWidth: GuidedParagraphReadingWidth
  fontSize: GuidedParagraphFontSize
  onBlockComplete: (result: ReadingSessionResult) => void
  onExitRequested: (elapsedMs: number) => void
}

// Guided Paragraph Reading Mode™ — a thin composition wrapper around the
// UNCHANGED `useReadingRuntime` hook, identical in structure to
// ParagraphReadingModeBlockRuntime.tsx: the block's one long passage is
// split into word-level string units (`passageText.split(/\s+/)`), fed
// into the locked engine exactly as-is (`readonly string[]`, content-
// agnostic) — the engine has no idea these are words of one longer
// passage, it just paces through them one at a time at
// `computeUnitDwellMs` per unit. `runtime.currentUnitIndex` is therefore
// "which word is currently being read," which the Canvas uses to drive
// its own line-sweep guide bar. The parent
// (GuidedParagraphReadingModeExperience) mounts this with
// `key={blockIndex}` for a fresh runtime per passage/block.
export function GuidedParagraphReadingModeBlockRuntime({
  blockUnits,
  targetWpm,
  readingWidth,
  fontSize,
  onBlockComplete,
  onExitRequested,
}: GuidedParagraphReadingModeBlockRuntimeProps): React.JSX.Element | null {
  const passageText = blockUnits[0]?.text ?? ''
  const words = useMemo(() => passageText.trim().split(/\s+/).filter(Boolean), [passageText])
  const runtime = useReadingRuntime(words, targetWpm)
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
    <GuidedParagraphReadingModeCanvas
      words={words}
      currentWordIndex={runtime.currentUnitIndex}
      readingWidth={readingWidth}
      fontSize={fontSize}
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
