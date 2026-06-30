'use client'

// SpeedControl™ — Student Speed Control™.
// Students choose Auto (AI-adaptive) or Manual (slider).
// Manual mode gives a slider from 1000ms → 50ms with the current level labeled.

import { cn } from '@/lib/utils'
import { SPEED_TIERS, getSpeedLabel, isValidSpeed } from '@/lib/exercise-engine/speedEngine'
import type { SpeedMs } from '@/types/exercise-engine'

type SpeedControlProps = {
  currentSpeedMs: SpeedMs
  isManual: boolean
  onSpeedChange: (ms: SpeedMs) => void
  onToggleMode: (manual: boolean) => void
  className?: string
}

export function SpeedControl({
  currentSpeedMs,
  isManual,
  onSpeedChange,
  onToggleMode,
  className,
}: SpeedControlProps): React.JSX.Element {
  // Slider index — SPEED_TIERS runs from fastest (50ms, high index) to slowest
  // We want the slider: left = slow (1000ms), right = fast (50ms)
  // SPEED_TIERS is [1000,900,...,50] so slowest is index 0, fastest is last index.
  const currentIdx = (SPEED_TIERS as readonly SpeedMs[]).indexOf(currentSpeedMs)
  const maxIdx = SPEED_TIERS.length - 1

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>): void {
    const idx = Number(e.target.value)
    const ms = SPEED_TIERS[idx]
    if (ms !== undefined && isValidSpeed(ms)) onSpeedChange(ms)
  }

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {/* Mode toggle */}
      <div className="flex items-center gap-1 rounded-full border bg-card p-0.5 text-xs">
        <button
          onClick={() => onToggleMode(false)}
          className={cn(
            'rounded-full px-3 py-1 font-medium transition-colors',
            !isManual ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Auto
        </button>
        <button
          onClick={() => onToggleMode(true)}
          className={cn(
            'rounded-full px-3 py-1 font-medium transition-colors',
            isManual ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Manual
        </button>
      </div>

      {/* Slider — only shown in manual mode */}
      {isManual && (
        <div className="flex w-full max-w-xs flex-col items-center gap-2">
          <input
            type="range"
            min={0}
            max={maxIdx}
            value={currentIdx >= 0 ? currentIdx : 0}
            onChange={handleSlider}
            className="w-full accent-foreground"
            aria-label="Flash duration in milliseconds"
            aria-valuetext={`${currentSpeedMs} milliseconds — ${getSpeedLabel(currentSpeedMs)} level`}
          />
          <div className="flex w-full items-center justify-between text-[10px] text-muted-foreground">
            <span>Slow · 1000ms</span>
            <span className="font-semibold text-foreground">
              {currentSpeedMs}ms · {getSpeedLabel(currentSpeedMs)}
            </span>
            <span>Fast · 50ms</span>
          </div>
        </div>
      )}

      {!isManual && (
        <p className="text-[10px] text-muted-foreground">
          AI adjusts speed based on your accuracy
        </p>
      )}
    </div>
  )
}
