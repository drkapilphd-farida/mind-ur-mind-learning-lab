'use client'

import Link from 'next/link'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { useIsEmbeddedExercise } from '@/features/thirty-day-curriculum/embeddedExerciseContext'
import { Button } from '@/components/ui/button'

// The same standard 100-500 band every other Reading Mode offers — this
// exercise's core challenge isn't raw speed, it's genuinely parallel
// processing of two simultaneous streams, which trains meaningfully even
// at ordinary reading pace.
const TARGET_WPM_OPTIONS = [100, 150, 200, 250, 300, 350, 400, 450, 500] as const

type DualStreamSplitReaderSettingsProps = {
  targetWpm: number
  onSelectTargetWpm: (wpm: number) => void
  onStart: () => void
  categoryLabel: string | null
}

export function DualStreamSplitReaderSettings({
  targetWpm,
  onSelectTargetWpm,
  onStart,
  categoryLabel,
}: DualStreamSplitReaderSettingsProps): React.JSX.Element {
  const isEmbedded = useIsEmbeddedExercise()
  return (
    <div className={`relative mx-auto flex ${isEmbedded ? 'h-full' : 'min-h-[100dvh]'} max-w-md flex-col items-center justify-center gap-8 px-6 py-16 text-center`}>
      {!isEmbedded && <BrandWatermark className="absolute top-4 left-6" />}
      {!isEmbedded && (
        <Link
          href="/labs/quantum-speed-reading"
          className="absolute top-4 right-6 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
        >
          Exit
        </Link>
      )}

      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Dual-Stream Split Reader™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Two synchronized word streams flow side by side, left and right — training bilateral focus and genuinely
          parallel processing. 3 quick questions check what stuck from both sides.
        </p>
        {/* Deliberately rendered as null on both the server and the
            client's first paint (only ever set from a useEffect in the
            Experience orchestrator, never a lazy state initializer) — see
            dualStreamSplitReaderDataset.ts's pickSessionCategory doc
            comment for why, to avoid a hydration mismatch. */}
        {categoryLabel && <p className="mt-2 text-xs font-medium text-muted-foreground">Today&rsquo;s reading: {categoryLabel}</p>}
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
        disabled={categoryLabel === null}
        className="rounded-full bg-foreground px-10 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {categoryLabel === null ? 'Preparing…' : 'Start'}
      </button>
    </div>
  )
}
