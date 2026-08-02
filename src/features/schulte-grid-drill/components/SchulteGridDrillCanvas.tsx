'use client'

import { useEffect, useRef, useState } from 'react'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingProgressBar } from '@/features/reading-engine/components/ReadingProgressBar'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import { generateShuffledSchulteGrid, SCHULTE_GRID_SIZE, SCHULTE_GRID_TOTAL_CELLS } from '../schulteGridDataset'

const TICK_MS = 100
const WRONG_FLASH_MS = 260

type SchulteGridDrillCanvasProps = {
  onComplete: (elapsedMs: number, mistakeCount: number) => void
  onExitRequested: (elapsedMs: number) => void
}

// Schulte Grid Speed Drill™ — deliberately NOT built on useReadingRuntime:
// that hook paces a fixed sequence of content forward automatically at a
// target WPM, but this drill has no pacing at all — the user finds each
// number at their own speed, and completion is driven entirely by real
// clicks, not a timer advancing content. Reusing it here would mean
// bending its contract to fit a task it was never designed for. Instead
// this owns its own minimal 100ms tick (matching useReadingRuntime.ts's
// own tick rate for consistency) purely to drive an honest live stopwatch
// display. ReadingHeader isn't reused either — its props are hard WPM-
// shaped (liveWpm/targetWpm), which don't exist here; instead this reuses
// the two genuinely generic shell atoms directly (ReadingProgressBar,
// ReadingStatTile), matching the design system without fabricating a WPM
// number just to satisfy that component's prop shape.
export function SchulteGridDrillCanvas({ onComplete, onExitRequested }: SchulteGridDrillCanvasProps): React.JSX.Element {
  const [grid] = useState<readonly number[]>(() => generateShuffledSchulteGrid())
  const [nextExpected, setNextExpected] = useState(1)
  const [mistakeCount, setMistakeCount] = useState(0)
  const [wrongCellIndex, setWrongCellIndex] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const hasCalledCompleteRef = useRef(false)

  useEffect(() => {
    if (isComplete) return
    const interval = setInterval(() => setElapsedMs((ms) => ms + TICK_MS), TICK_MS)
    return () => clearInterval(interval)
  }, [isComplete])

  useEffect(() => {
    if (wrongCellIndex === null) return
    const timeout = setTimeout(() => setWrongCellIndex(null), WRONG_FLASH_MS)
    return () => clearTimeout(timeout)
  }, [wrongCellIndex])

  function handleCellClick(cellIndex: number, value: number): void {
    if (isComplete) return
    if (value === nextExpected) {
      const next = nextExpected + 1
      setNextExpected(next)
      if (next > SCHULTE_GRID_TOTAL_CELLS) {
        setIsComplete(true)
        if (!hasCalledCompleteRef.current) {
          hasCalledCompleteRef.current = true
          onComplete(elapsedMs, mistakeCount)
        }
      }
    } else {
      setMistakeCount((count) => count + 1)
      setWrongCellIndex(cellIndex)
    }
  }

  const progressPercent = Math.round(((nextExpected - 1) / SCHULTE_GRID_TOTAL_CELLS) * 100)

  return (
    <ReadingLayout maxWidthClassName="max-w-lg" onExit={() => onExitRequested(elapsedMs)}>
      <div className="w-full max-w-md">
        <p className="mb-3 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
          Schulte Grid Speed Drill™
        </p>
        <div className="grid grid-cols-3 gap-x-4 text-center">
          <ReadingStatTile label="Time" value={formatElapsedTime(elapsedMs)} />
          <ReadingStatTile label="Next" value={nextExpected <= SCHULTE_GRID_TOTAL_CELLS ? String(nextExpected) : '—'} />
          <ReadingStatTile label="Mistakes" value={String(mistakeCount)} />
        </div>
        <div className="mt-4">
          <ReadingProgressBar progressPercent={progressPercent} />
        </div>
      </div>

      <div className="mt-8 grid gap-2" style={{ gridTemplateColumns: `repeat(${SCHULTE_GRID_SIZE}, minmax(0, 1fr))` }}>
        {grid.map((value, cellIndex) => {
          const isFound = value < nextExpected
          const isWrong = wrongCellIndex === cellIndex
          return (
            <button
              key={cellIndex}
              type="button"
              disabled={isFound}
              onClick={() => handleCellClick(cellIndex, value)}
              aria-label={`Grid cell ${value}`}
              className={`flex aspect-square items-center justify-center rounded-xl border text-lg font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${
                isWrong
                  ? 'border-red-500/60 bg-red-500/10 text-red-700'
                  : isFound
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700'
                    : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-accent/20'
              }`}
            >
              {value}
            </button>
          )
        })}
      </div>
    </ReadingLayout>
  )
}
