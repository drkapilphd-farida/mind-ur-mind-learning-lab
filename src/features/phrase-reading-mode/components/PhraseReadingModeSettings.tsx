'use client'

import Link from 'next/link'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { Button } from '@/components/ui/button'

const TARGET_WPM_OPTIONS = [100, 150, 200, 250, 300, 350, 400, 450, 500] as const

export type PhraseSize = 'small' | 'medium' | 'large'
export type PhraseFlowOrientation = 'horizontal' | 'vertical'

const PHRASE_SIZE_OPTIONS: readonly { id: PhraseSize; label: string }[] = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
]

const ORIENTATION_OPTIONS: readonly { id: PhraseFlowOrientation; label: string; description: string }[] = [
  { id: 'horizontal', label: 'Horizontal Flow', description: 'Phrases glide left to right — lateral eye-span' },
  { id: 'vertical', label: 'Vertical Flow', description: 'Phrases glide top to bottom — vertical eye-span' },
]

type PhraseReadingModeSettingsProps = {
  targetWpm: number
  onSelectTargetWpm: (wpm: number) => void
  phraseSize: PhraseSize
  onSelectPhraseSize: (size: PhraseSize) => void
  orientation: PhraseFlowOrientation
  onSelectOrientation: (orientation: PhraseFlowOrientation) => void
  categoryLabel: string | null
  onStart: () => void
}

// Phrase Size is purely presentational (font-size only) — the Master
// Reading Engine never sees or needs it, so it stays local to this mode
// rather than touching the shared ReadingSettings type. Orientation is the
// same kind of purely presentational choice: both Canvases feed the engine
// the exact same units/pacing, just streaming them along a different axis.
export function PhraseReadingModeSettings({
  targetWpm,
  onSelectTargetWpm,
  phraseSize,
  onSelectPhraseSize,
  orientation,
  onSelectOrientation,
  categoryLabel,
  onStart,
}: PhraseReadingModeSettingsProps): React.JSX.Element {
  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <BrandWatermark className="absolute top-4 left-6" />
      <Link
        href="/labs/quantum-speed-reading"
        className="absolute top-4 right-6 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
      >
        Exit
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Phrase Reading Mode™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Read in natural chunks, not word by word. One calm phrase at a time.
        </p>
        {/* Deliberately null on both the server and the client's first
            paint (only ever set from a useEffect in the Experience
            orchestrator, never a lazy state initializer) — see
            phraseReadingModeDataset.ts's pickSessionCategory doc comment
            for why, to avoid a hydration mismatch. */}
        {categoryLabel && <p className="mt-2 text-xs font-medium text-muted-foreground">Today&rsquo;s passage: {categoryLabel}</p>}
      </div>

      <div className="w-full">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Flow Direction</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          {ORIENTATION_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelectOrientation(option.id)}
              aria-pressed={option.id === orientation}
              className={`flex-1 rounded-2xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${
                option.id === orientation
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border/60 bg-card text-foreground hover:border-foreground/40'
              }`}
            >
              <span className="block text-sm font-semibold">{option.label}</span>
              <span className={`mt-0.5 block text-xs ${option.id === orientation ? 'text-background/70' : 'text-muted-foreground'}`}>
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Target WPM</p>
        <div className="flex flex-wrap justify-center gap-2">
          {TARGET_WPM_OPTIONS.map((wpm) => (
            <Button key={wpm} variant={wpm === targetWpm ? 'default' : 'outline'} size="sm" onClick={() => onSelectTargetWpm(wpm)}>
              {wpm}
            </Button>
          ))}
        </div>
      </div>

      <div className="w-full">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Phrase Size</p>
        <div className="flex flex-wrap justify-center gap-2">
          {PHRASE_SIZE_OPTIONS.map((option) => (
            <Button
              key={option.id}
              variant={option.id === phraseSize ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSelectPhraseSize(option.id)}
            >
              {option.label}
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
