'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useReadingRuntime } from '@/hooks/reading-engine/useReadingRuntime'
import type { ReadingUnit, ReadingSessionResult } from '@/features/reading-engine/types'
import type { ParagraphReadingWidth, ParagraphFontSize } from './ParagraphReadingModeSettings'
import { ParagraphReadingModeCanvas } from './ParagraphReadingModeCanvas'

type ParagraphReadingModeBlockRuntimeProps = {
  blockUnits: readonly ReadingUnit[]
  targetWpm: number
  readingWidth: ParagraphReadingWidth
  fontSize: ParagraphFontSize
  onBlockComplete: (result: ReadingSessionResult) => void
  onExitRequested: (elapsedMs: number) => void
}

// True Multi-Line Comfort Window Sprint — a thin composition wrapper
// around the UNCHANGED `useReadingRuntime` hook, same pattern as before,
// but now feeding it *word-level* string units derived from the block's
// one long passage (`passageText.split(/\s+/)`) instead of the whole
// passage as a single unit. This is still exactly the same locked engine
// contract (`readonly string[]`, content-agnostic) — the engine has no
// idea these strings happen to be individual words of one longer text; it
// just paces through them one at a time at `computeUnitDwellMs` per unit
// (a 1-word unit dwells for `60000/targetWpm` ms, i.e. real per-word
// reading pace). `runtime.currentUnitIndex` is therefore exactly "which
// word is currently being read," letting the Canvas move a highlight
// across a fully static, always-visible multi-line passage rather than
// swapping or scrolling any content. The parent
// (ParagraphReadingModeExperience) still mounts this with
// `key={blockIndex}` for a fresh runtime per passage/block.
export function ParagraphReadingModeBlockRuntime({
  blockUnits,
  targetWpm,
  readingWidth,
  fontSize,
  onBlockComplete,
  onExitRequested,
}: ParagraphReadingModeBlockRuntimeProps): React.JSX.Element | null {
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
    <ParagraphReadingModeCanvas
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
