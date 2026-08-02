'use client'

import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingHeader } from '@/features/reading-engine/components/ReadingHeader'

type FlashRecallSprintCanvasProps = {
  roundIndex: number
  totalRounds: number
  passage: string
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

// Flash Recall & Retention Sprint™ — the flash phase shows its whole
// 12-word passage prominently, all at once, for the passage's full
// WPM-paced dwell duration (see flashRecallSprintDataset.ts) — a single
// "flash," not a streaming/sliding reveal like Dynamic Chunk Sliding or
// Phrase Reading. Reuses the shared ReadingLayout/ReadingHeader unforked.
export function FlashRecallSprintCanvas({
  roundIndex,
  totalRounds,
  passage,
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
}: FlashRecallSprintCanvasProps): React.JSX.Element {
  return (
    <ReadingLayout maxWidthClassName="max-w-2xl" onExit={onExit}>
      <ReadingHeader
        modeLabel="Flash Recall & Retention Sprint™"
        liveWpm={liveWpm}
        targetWpm={targetWpm}
        elapsedMs={elapsedMs}
        progressPercent={progressPercent}
      />
      <p className="-mt-2 mb-2 text-center text-xs text-muted-foreground">
        Round {roundIndex + 1} of {totalRounds}
      </p>

      <div className="mx-auto mt-8 flex min-h-40 w-full items-center justify-center rounded-2xl bg-muted/50 px-6 py-10 sm:px-10">
        <p className="text-center text-2xl leading-relaxed font-semibold text-foreground sm:text-3xl">{passage}</p>
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
