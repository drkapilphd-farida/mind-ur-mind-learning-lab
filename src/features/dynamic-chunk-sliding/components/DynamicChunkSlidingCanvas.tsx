'use client'

import { useLayoutEffect, useMemo, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { computeContinuousStreamOffsetPx } from '@/hooks/reading-engine/continuousStreamOffset'
import { measureSingleLineWidthsPx } from '@/hooks/reading-engine/measureSingleLineWidths'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingHeader } from '@/features/reading-engine/components/ReadingHeader'
import type { ReadingUnit } from '@/features/reading-engine/types'

// Chunks here are always 3-4 words (see splitIntoChunks in the dataset
// file), a narrower and more consistent shape than Phrase Reading Mode's
// hand-authored 2-4 word phrases — so a single fixed viewport size is
// enough; no per-user size picker is needed. Sized with margin above the
// dataset's own longest real chunk, live-verified to not clip.
const CHUNK_VIEWPORT_WIDTH_PX = 640
const CHUNK_LINE_HEIGHT_PX = 84
const CHUNK_TEXT_CLASS_NAME = 'text-4xl font-semibold whitespace-nowrap'

// Real horizontal gap between consecutive chunks on the track.
const UNIT_GAP_PX = 64

// Same reasoning as PhraseReadingModeCanvas.tsx's own TRACK_TRANSITION_MS:
// intentionally linear, not eased — an ease curve reads as a discrete
// "arrival," and 100ms matches useReadingRuntime.ts's own internal tick
// rate, so the glide stays continuous rather than jump-then-pause.
const TRACK_TRANSITION_MS = 100

type DynamicChunkSlidingCanvasProps = {
  units: readonly ReadingUnit[]
  currentUnitIndex: number
  isPaused: boolean
  liveWpm: number
  targetWpm: number
  elapsedMs: number
  progressPercent: number
  onPause: () => void
  onResume: () => void
  onRestart: () => void
  onFinish: () => void
  onExit: () => void
}

// Dynamic Chunk Sliding™ — reuses the exact "no dimming, one continuous
// linear transform" streaming model already proven by Phrase Reading Mode
// (measureSingleLineWidthsPx for each chunk's true rendered width,
// computeContinuousStreamOffsetPx for the frame-by-frame glide) rather
// than forking a new motion system: every chunk renders at full opacity/
// foreground/scale at all times — nothing fades or dims, ever — and the
// viewport itself is the only thing that clips (`overflow: hidden`),
// matching the task's "zero text dimming or fading" requirement exactly.
export function DynamicChunkSlidingCanvas({
  units,
  currentUnitIndex,
  isPaused,
  liveWpm,
  targetWpm,
  elapsedMs,
  progressPercent,
  onPause,
  onResume,
  onRestart,
  onFinish,
  onExit,
}: DynamicChunkSlidingCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  const [unitWidths, setUnitWidths] = useState<number[] | null>(null)
  useLayoutEffect(() => {
    setUnitWidths(measureSingleLineWidthsPx(units.map((unit) => unit.text), CHUNK_TEXT_CLASS_NAME))
  }, [units])

  const cumulativeCenters = useMemo(() => {
    if (!unitWidths) return []
    const centers: number[] = []
    let cursor = 0
    for (const width of unitWidths) {
      centers.push(cursor + width / 2)
      cursor += width + UNIT_GAP_PX
    }
    return centers
  }, [unitWidths])

  const offsetForIndex = (index: number): number => cumulativeCenters[index] ?? 0
  const trackOffsetPx =
    unitWidths === null
      ? 0
      : prefersReducedMotion
        ? offsetForIndex(currentUnitIndex)
        : computeContinuousStreamOffsetPx({ units, currentUnitIndex, targetWpm, elapsedMs, offsetForIndex })

  return (
    <ReadingLayout maxWidthClassName="max-w-4xl" onExit={onExit}>
      <ReadingHeader
        modeLabel="Dynamic Chunk Sliding™"
        liveWpm={liveWpm}
        targetWpm={targetWpm}
        elapsedMs={elapsedMs}
        progressPercent={progressPercent}
      />

      <div
        className="relative mx-auto mt-6 w-full overflow-hidden rounded-2xl bg-muted/50"
        style={{ maxWidth: CHUNK_VIEWPORT_WIDTH_PX, height: CHUNK_LINE_HEIGHT_PX, visibility: unitWidths === null ? 'hidden' : 'visible' }}
        aria-live="off"
      >
        <div
          className="absolute top-0 flex h-full items-center"
          style={{
            left: '50%',
            gap: UNIT_GAP_PX,
            transform: `translateX(-${trackOffsetPx}px)`,
            transition: prefersReducedMotion || isPaused ? 'none' : `transform ${TRACK_TRANSITION_MS}ms linear`,
          }}
        >
          {units.map((unit) => (
            <span
              key={unit.id}
              className={CHUNK_TEXT_CLASS_NAME}
              style={{ color: 'var(--foreground)', opacity: 1, transform: 'scale(1)' }}
            >
              {unit.text}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
        {isPaused ? (
          <button onClick={onResume} className={PRIMARY_TEXT_BUTTON_CLASSES}>
            Resume
          </button>
        ) : (
          <button onClick={onPause} className={PRIMARY_TEXT_BUTTON_CLASSES}>
            Pause
          </button>
        )}
        <button onClick={onRestart} className={SECONDARY_TEXT_BUTTON_CLASSES}>
          Restart
        </button>
        <button onClick={onFinish} className={SECONDARY_TEXT_BUTTON_CLASSES}>
          Finish
        </button>
      </div>
    </ReadingLayout>
  )
}

const PRIMARY_TEXT_BUTTON_CLASSES =
  'rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50'
const SECONDARY_TEXT_BUTTON_CLASSES =
  'rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50'
