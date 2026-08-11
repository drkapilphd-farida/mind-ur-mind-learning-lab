'use client'

import Link from 'next/link'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { Button } from '@/components/ui/button'

// The old narrow [150,175,200,225] band existed only to keep a single
// whole-passage flash inside a fixed 3-5 second window — that constraint
// no longer applies now that every unit is a single RSVP word with its
// own independent dwell time, so this uses the same standard 100-500
// band every other Reading Mode offers.
const TARGET_WPM_OPTIONS = [100, 150, 200, 250, 300, 350, 400, 450, 500] as const

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
      <BrandWatermark className="absolute top-4 left-6" />
      <Link
        href="/labs/quantum-speed-reading"
        className="absolute top-4 right-6 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
      >
        Exit
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Flash Recall &amp; Retention Sprint™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A true RSVP stream flashes one word at a time at your target pace — no stops — then 3 quick questions check what you retained.
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
