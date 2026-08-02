'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Deliberately a narrow band, not the wide 100-500 range other modes use.
// Every passage in flashRecallSprintDataset.ts is a fixed 12 words, so the
// resulting single-flash dwell time (12 * 60000/targetWpm) needs to stay
// inside the required 3-5 second window: 150 WPM -> 4.8s, 175 -> 4.11s,
// 200 -> 3.6s, 225 -> 3.2s. A wider range would push some options outside
// that window for this exercise's fixed passage length.
export const TARGET_WPM_OPTIONS = [150, 175, 200, 225] as const
export type TargetWpm = (typeof TARGET_WPM_OPTIONS)[number]
export const DEFAULT_TARGET_WPM: TargetWpm = 175

type FlashRecallSprintSettingsProps = {
  targetWpm: number
  onSelectTargetWpm: (wpm: number) => void
  onStart: () => void
}

export function FlashRecallSprintSettings({
  targetWpm,
  onSelectTargetWpm,
  onStart,
}: FlashRecallSprintSettingsProps): React.JSX.Element {
  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <Link
        href="/labs/quantum-speed-reading"
        className="absolute top-4 right-6 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
      >
        Exit
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Flash Recall &amp; Retention Sprint™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A short passage flashes for a few seconds, then a quick question checks what you retained.
        </p>
      </div>

      <div className="w-full">
        <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">Target WPM</p>
        <div className="flex flex-wrap justify-center gap-2">
          {TARGET_WPM_OPTIONS.map((wpm) => (
            <Button key={wpm} variant={wpm === targetWpm ? 'default' : 'outline'} size="sm" onClick={() => onSelectTargetWpm(wpm)}>
              {wpm}
            </Button>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        className="rounded-full bg-foreground px-10 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Start
      </button>
    </div>
  )
}
