'use client'

import { useEffect, useRef, useState } from 'react'
import { ProgressRing } from '@/components/exercises/ProgressRing'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { FixationDot } from '../FixationDot'
import { pickRandomSymbol } from './peripheralSymbols'

type PeripheralSessionProps = {
  durationSeconds: number
  onComplete: (lastSymbol: string) => void
}

const QUADRANT_POSITIONS = [
  { top: '4%', left: '4%' },
  { top: '4%', right: '4%' },
  { bottom: '4%', left: '4%' },
  { bottom: '4%', right: '4%' },
] as const

const FLASH_INTERVAL_MS = 4000
const FLASH_VISIBLE_MS = 550

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

// Center fixation stays fixed; a symbol briefly flashes near one of the 4
// screen edges at intervals. This is honest "near the edge of your
// screen" peripheral practice, not a calibrated visual-angle measurement,
// and no camera/gaze tracking of any kind.
export function PeripheralSession({ durationSeconds, onComplete }: PeripheralSessionProps): React.JSX.Element {
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds)
  const [flash, setFlash] = useState<{ quadrantIndex: number; symbol: string } | null>(null)
  const [flashRoundIndex, setFlashRoundIndex] = useState(0)
  const prefersReducedMotion = usePrefersReducedMotion()

  const remainingSecondsRef = useRef(remainingSeconds)
  const lastSymbolRef = useRef<string>(pickRandomSymbol())

  useEffect(() => {
    remainingSecondsRef.current = remainingSeconds
  }, [remainingSeconds])

  useEffect(() => {
    if (remainingSeconds <= 0) {
      onComplete(lastSymbolRef.current)
      return
    }
    const tickTimer = setTimeout(() => setRemainingSeconds((seconds) => seconds - 1), 1000)
    return () => clearTimeout(tickTimer)
  }, [remainingSeconds, onComplete])

  // Flash lifecycle — independent of the 1s tick (re-runs only when a new
  // flash cycle starts, not every second) so flashes land on a real
  // FLASH_INTERVAL_MS cadence instead of being reset before they can fire.
  useEffect(() => {
    if (remainingSecondsRef.current <= 0) return

    const flashTimer = setTimeout(() => {
      if (remainingSecondsRef.current <= 0) return
      const symbol = pickRandomSymbol()
      const quadrantIndex = Math.floor(Math.random() * QUADRANT_POSITIONS.length)
      lastSymbolRef.current = symbol
      setFlash({ quadrantIndex, symbol })

      const hideTimer = setTimeout(() => {
        setFlash(null)
        setFlashRoundIndex((i) => i + 1)
      }, FLASH_VISIBLE_MS)
      return () => clearTimeout(hideTimer)
    }, FLASH_INTERVAL_MS)

    return () => clearTimeout(flashTimer)
  }, [flashRoundIndex])

  const elapsedSeconds = durationSeconds - remainingSeconds

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col items-center gap-8 text-center">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Keep your eyes on the center dot</p>

      <div className="relative h-72 w-full overflow-hidden rounded-3xl border bg-gradient-to-b from-primary/[0.06] to-transparent">
        <div className="flex h-full w-full items-center justify-center">
          <FixationDot size={20} />
        </div>

        {QUADRANT_POSITIONS.map((position, index) => (
          <div
            key={index}
            className={cn(
              'absolute flex size-10 items-center justify-center rounded-full border bg-card font-heading text-lg font-bold text-foreground shadow-sm',
              !prefersReducedMotion && 'transition-opacity duration-150',
              flash?.quadrantIndex === index ? 'opacity-100' : 'opacity-0',
            )}
            style={position}
            aria-hidden="true"
          >
            {flash?.quadrantIndex === index ? flash.symbol : ''}
          </div>
        ))}
      </div>

      <ProgressRing
        progress={elapsedSeconds / durationSeconds}
        size={64}
        label={formatTime(remainingSeconds)}
        accessibleLabel={`${formatTime(remainingSeconds)} remaining`}
      />
    </div>
  )
}
