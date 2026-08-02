'use client'

import { useLayoutEffect, useMemo, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { computeContinuousStreamOffsetPx } from '@/hooks/reading-engine/continuousStreamOffset'
import { measureSingleLineWidthsPx } from '@/hooks/reading-engine/measureSingleLineWidths'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingHeader } from '@/features/reading-engine/components/ReadingHeader'
import type { ReadingUnit } from '@/features/reading-engine/types'
import type { SentenceWidth } from './SentenceReadingModeSettings'

// Fixed viewport width per SentenceWidth — now purely "how much of the
// flowing single line is visible," not a per-unit column width (Strict
// Single-Line Sprint). Same px values as before (max-w-sm/xl/3xl
// equivalents), kept for continuity of what each setting means.
const SENTENCE_VIEWPORT_WIDTH_PX: Record<SentenceWidth, number> = {
  compact: 384,
  comfortable: 576,
  wide: 768,
}

// A single fixed line height, independent of SentenceWidth — since no
// wrapping is ever allowed now, height no longer varies with width the way
// the old multi-line row-height table needed it to.
const LINE_HEIGHT_PX = 56

// Real horizontal gap between consecutive sentences on the track, so
// adjacent sentences never visually run into each other during a
// transition.
const UNIT_GAP_PX = 72

const TEXT_CLASS_NAME = 'text-2xl leading-relaxed font-semibold whitespace-nowrap'

// The track's own position transition is intentionally linear, not eased
// — an ease curve reads as a discrete "arrival," which is exactly the
// jump-then-pause feel the earlier motion sprint replaced. 100ms matches
// useReadingRuntime.ts's own internal tick rate (see ARCHITECTURE.md).
const TRACK_TRANSITION_MS = 100

type SentenceReadingModeCanvasProps = {
  units: readonly ReadingUnit[]
  currentUnitIndex: number
  sentenceWidth: SentenceWidth
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

// Sprint 3.3 — third mode on the Master Reading Engine™, first to use the
// shared shell from day one. Sentence Width controls text container width.
// Sprint 3.4B — tried a static previous/current/next row set.
// Streaming Motion Sprint — two earlier passes moved through fixed-width
// columns sized for possible multi-line wrap, first as a discrete jump,
// then as a continuous glide (see continuousStreamOffset.ts).
// Strict Single-Line Sprint — replaces fixed, multi-line-safe columns with
// real per-sentence measured single-line widths (measureSingleLineWidthsPx):
// every sentence renders on exactly one line (`whitespace-nowrap`, no
// wrapping ever), spaced by its own true rendered width plus a fixed gap,
// and the outer viewport is now the visual "gray box" itself — strictly
// `overflow: hidden` at its own edges, with NO separate peeking-neighbor
// highlight overlay. Every unit (not just "current") renders fully
// opaque/foreground/full-scale at all times — no dimming, no opacity
// gradient, no blur — since the single-line clip means only the sentence
// actually inside the box is ever meaningfully visible; a neighbor is only
// ever seen mid-transition, sliding through, and must look exactly as
// sharp as the one it's replacing.
export function SentenceReadingModeCanvas({
  units,
  currentUnitIndex,
  sentenceWidth,
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
}: SentenceReadingModeCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const viewportWidth = SENTENCE_VIEWPORT_WIDTH_PX[sentenceWidth]

  const [unitWidths, setUnitWidths] = useState<number[] | null>(null)
  useLayoutEffect(() => {
    setUnitWidths(measureSingleLineWidthsPx(units.map((unit) => unit.text), TEXT_CLASS_NAME))
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
        modeLabel="Sentence Reading Mode™"
        liveWpm={liveWpm}
        targetWpm={targetWpm}
        elapsedMs={elapsedMs}
        progressPercent={progressPercent}
      />

      <div
        className="relative mx-auto mt-6 overflow-hidden rounded-2xl bg-muted/50"
        style={{ width: viewportWidth, height: LINE_HEIGHT_PX, visibility: unitWidths === null ? 'hidden' : 'visible' }}
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
            <span key={unit.id} className={TEXT_CLASS_NAME} style={{ color: 'var(--foreground)', opacity: 1, transform: 'scale(1)' }}>
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
