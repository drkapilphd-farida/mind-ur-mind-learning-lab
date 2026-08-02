'use client'

import { useLayoutEffect, useMemo, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { computeContinuousStreamOffsetPx } from '@/hooks/reading-engine/continuousStreamOffset'
import { measureSingleLineWidthsPx } from '@/hooks/reading-engine/measureSingleLineWidths'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingHeader } from '@/features/reading-engine/components/ReadingHeader'
import type { ReadingUnit } from '@/features/reading-engine/types'
import type { PhraseSize } from './PhraseReadingModeSettings'

// Fixed viewport width per PhraseSize — "how much of the flowing single
// line is visible," not a per-unit column width (Strict Single-Line
// standard, ported from Sentence Reading). The old 280/380/520 values
// were sized for the previous 2-line-wrap-allowed model; live-measured
// against the real dataset's widest phrase at each size (Small: 339px,
// Medium: 509px, Large: 848px real max width) — since single-line means
// no wrap at all, the viewport must be at least that wide or the phrase
// gets clipped regardless of centering. Widened with margin accordingly.
const PHRASE_VIEWPORT_WIDTH_PX: Record<PhraseSize, number> = {
  small: 420,
  medium: 620,
  large: 1040,
}

// A single fixed line height per PhraseSize, independent of width — since
// no wrapping is ever allowed, height only needs to fit one line at that
// size's own font size. Live-measured against the actual dataset below.
const PHRASE_LINE_HEIGHT_PX: Record<PhraseSize, number> = {
  small: 56,
  medium: 76,
  large: 108,
}

const PHRASE_SIZE_TEXT_CLASSES: Record<PhraseSize, string> = {
  small: 'text-2xl font-semibold whitespace-nowrap',
  medium: 'text-4xl font-semibold whitespace-nowrap',
  large: 'text-6xl font-semibold whitespace-nowrap',
}

// Real horizontal gap between consecutive phrases on the track.
const UNIT_GAP_PX = 64

// The track's own position transition is intentionally linear, not eased
// — an ease curve reads as a discrete "arrival," which is exactly the
// jump-then-pause feel the earlier motion sprint replaced. 100ms matches
// useReadingRuntime.ts's own internal tick rate (see ARCHITECTURE.md).
const TRACK_TRANSITION_MS = 100

type PhraseReadingModeCanvasProps = {
  units: readonly ReadingUnit[]
  currentUnitIndex: number
  phraseSize: PhraseSize
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

// Sprint 3.2A — inherits the shared ReadingLayout/ReadingHeader.
// Sprint 3.4A/3.4B/3.4C/3.4D — earlier iterations: same-node crossfade,
// static previous/current/next row set, vertical scrolling column, then
// (2nd pass) rotated to a horizontal fixed-width-column scroll with
// dimmed peeking neighbors — first as a discrete jump, then (Streaming
// Motion Sprint) a continuous glide.
// Phrase Smoothness Sprint — the fixed-width-column model, sized generously
// for possible 2-line wrap, combined with a separate opacity/scale fade on
// the emphasis swap, was the source of the reported jitter: two
// independently-timed transitions (the 100ms linear track glide and the
// 260ms eased emphasis fade) fighting each other every tick, plus
// non-current phrases visibly dimming/scaling while still moving. This
// replaces it with exactly the model Sentence Reading already proved out
// (measureSingleLineWidthsPx + computeContinuousStreamOffsetPx, one single
// linear transition, zero dimming): every phrase renders on exactly one
// line at its own true measured width, every phrase (current or
// mid-transition neighbor) stays fully opaque/foreground/full-scale at
// all times, and the viewport is the visual "gray box" itself, strictly
// `overflow: hidden` — one continuous motion, nothing else animating
// underneath it.
export function PhraseReadingModeCanvas({
  units,
  currentUnitIndex,
  phraseSize,
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
}: PhraseReadingModeCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const viewportWidth = PHRASE_VIEWPORT_WIDTH_PX[phraseSize]
  const lineHeight = PHRASE_LINE_HEIGHT_PX[phraseSize]
  const textClassName = PHRASE_SIZE_TEXT_CLASSES[phraseSize]

  const [unitWidths, setUnitWidths] = useState<number[] | null>(null)
  useLayoutEffect(() => {
    setUnitWidths(measureSingleLineWidthsPx(units.map((unit) => unit.text), textClassName))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units, phraseSize])

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
    // maxWidthClassName widened from max-w-2xl (624px content width after
    // ReadingLayout's own px-6 padding) to max-w-6xl (1104px content
    // width). Required because a phrase now needs a real, explicit pixel
    // `width` viewport wide enough for its single-line text (up to 1040px
    // at `large`) — the old max-w-2xl container would otherwise clip it,
    // since 1040px > 624px. Live-verified: 1040px now fits inside 1104px
    // with margin to spare.
    <ReadingLayout maxWidthClassName="max-w-6xl" onExit={onExit}>
      <ReadingHeader
        modeLabel="Phrase Reading Mode™"
        liveWpm={liveWpm}
        targetWpm={targetWpm}
        elapsedMs={elapsedMs}
        progressPercent={progressPercent}
      />

      <div
        className="relative mx-auto mt-6 overflow-hidden rounded-2xl bg-muted/50"
        style={{ width: viewportWidth, height: lineHeight, visibility: unitWidths === null ? 'hidden' : 'visible' }}
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
            <span key={unit.id} className={textClassName} style={{ color: 'var(--foreground)', opacity: 1, transform: 'scale(1)' }}>
              {unit.text}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-10 flex items-center gap-6">
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
