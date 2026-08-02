'use client'

import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingHeader } from '@/features/reading-engine/components/ReadingHeader'
import type { RapidVisualSpanPosition } from '../rapidVisualSpanExpanderDataset'

type RapidVisualSpanExpanderCanvasProps = {
  roundIndex: number
  totalRounds: number
  currentToken: string | null
  currentPosition: RapidVisualSpanPosition
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

// True Peripheral Spread Sprint — now genuinely engine-driven (see
// RapidVisualSpanExpanderBlockRuntime.tsx), this Canvas reuses the shared
// ReadingHeader exactly as every Reading Mode does: liveWpm/targetWpm are
// real values now that flash timing comes from useReadingRuntime, so
// there's no fabrication in showing them (unlike the previous, purely
// custom-timed version, which deliberately skipped ReadingHeader because
// its WPM-shaped props didn't fit an unpaced click/flash task).
//
// The flash field is a responsive square (`w-full`, capped, `aspect-
// square`) so it scales correctly on any viewport instead of a fixed
// pixel box — mobile-safe by construction. Only a small, subtle dot
// marks the fixation point (no ring, no border, no intrusive circle);
// the current token renders at its own precomputed wide-spread position
// (see generateWidePeripheralPosition in the dataset file), which can
// land anywhere from near-center out to the field's own corners.
export function RapidVisualSpanExpanderCanvas({
  roundIndex,
  totalRounds,
  currentToken,
  currentPosition,
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
}: RapidVisualSpanExpanderCanvasProps): React.JSX.Element {
  return (
    <ReadingLayout maxWidthClassName="max-w-lg" onExit={onExit}>
      <ReadingHeader
        modeLabel="Rapid Visual Span Expander™"
        liveWpm={liveWpm}
        targetWpm={targetWpm}
        elapsedMs={elapsedMs}
        progressPercent={progressPercent}
      />
      <p className="-mt-2 mb-2 text-center text-xs text-muted-foreground">
        Round {roundIndex + 1} of {totalRounds}
      </p>

      <div
        className="relative mx-auto mt-8 w-full max-w-[440px] overflow-hidden rounded-2xl bg-muted/20"
        style={{ aspectRatio: '1 / 1' }}
        aria-live="off"
      >
        <div className="absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground/50" />
        {currentToken !== null && (
          <span
            className="absolute text-base font-semibold text-foreground sm:text-lg"
            style={{
              left: `calc(50% + ${currentPosition.xPercent}%)`,
              top: `calc(50% + ${currentPosition.yPercent}%)`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {currentToken}
          </span>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
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
