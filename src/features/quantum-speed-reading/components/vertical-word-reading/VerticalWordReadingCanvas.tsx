'use client'

import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingHeader } from '@/features/reading-engine/components/ReadingHeader'
import type { ReadingUnit } from '@/features/reading-engine/types'

const LINE_HEIGHT_PX = 56
const VIEWPORT_HEIGHT_PX = LINE_HEIGHT_PX * 7

// Shared motion language (Sprint 3.4A) — the same decelerate curve every
// Reading Mode's content transition uses.
const MOTION_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'
const WORD_TRANSITION_MS = 260

type VerticalWordReadingCanvasProps = {
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

// Sprint 3.2A — now inherits the shared ReadingLayout/ReadingHeader instead
// of hand-rolling its own outer container, Exit button, and stat grid.
// Sprint 3.4A — the current/not-current word distinction no longer swaps
// font-size (a layout-affecting property that reflowed on every advance,
// producing a visible size "snap"). Every word now renders at one constant
// font-size; emphasis comes from transform: scale + opacity + color only
// (all GPU-compositable), transitioned with the shared easing curve, so
// the highlight genuinely animates down the column instead of jumping.
export function VerticalWordReadingCanvas({
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
}: VerticalWordReadingCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  const translateY = VIEWPORT_HEIGHT_PX / 2 - LINE_HEIGHT_PX / 2 - currentUnitIndex * LINE_HEIGHT_PX

  return (
    <ReadingLayout maxWidthClassName="max-w-md" onExit={onExit}>
      <ReadingHeader
        modeLabel="Vertical Word Reading™"
        liveWpm={liveWpm}
        targetWpm={targetWpm}
        elapsedMs={elapsedMs}
        progressPercent={progressPercent}
      />

      <div
        className="relative mt-10 w-full overflow-hidden"
        style={{ height: VIEWPORT_HEIGHT_PX }}
        aria-live="off"
      >
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-14 -translate-y-1/2 rounded-2xl bg-muted/50" />
        <div
          className={prefersReducedMotion ? '' : 'transition-transform duration-300 ease-out'}
          style={{ transform: `translateY(${translateY}px)` }}
        >
          {units.map((unit, index) => (
            <div
              key={unit.id}
              className="flex items-center justify-center text-center"
              style={{ height: LINE_HEIGHT_PX }}
            >
              <span
                className={`relative z-20 inline-block origin-center text-2xl ${index === currentUnitIndex ? 'font-semibold' : 'font-normal'}`}
                style={{
                  color: index === currentUnitIndex ? 'var(--foreground)' : 'var(--muted-foreground)',
                  opacity: index === currentUnitIndex ? 1 : 0.4,
                  transform: index === currentUnitIndex ? 'scale(1)' : 'scale(0.8)',
                  transition: prefersReducedMotion
                    ? 'none'
                    : `transform ${WORD_TRANSITION_MS}ms ${MOTION_EASE}, opacity ${WORD_TRANSITION_MS}ms ${MOTION_EASE}, color ${WORD_TRANSITION_MS}ms ${MOTION_EASE}`,
                }}
              >
                {unit.text}
              </span>
            </div>
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
