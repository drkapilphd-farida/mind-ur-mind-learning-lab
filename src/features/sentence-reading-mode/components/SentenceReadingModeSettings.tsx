'use client'

import Link from 'next/link'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { Button } from '@/components/ui/button'

const TARGET_WPM_OPTIONS = [100, 150, 200, 250, 300, 350, 400, 450, 500] as const

export type SentenceWidth = 'compact' | 'comfortable' | 'wide'

const SENTENCE_WIDTH_OPTIONS: readonly { id: SentenceWidth; label: string }[] = [
  { id: 'compact', label: 'Compact' },
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'wide', label: 'Wide' },
]

type SentenceReadingModeSettingsProps = {
  targetWpm: number
  onSelectTargetWpm: (wpm: number) => void
  sentenceWidth: SentenceWidth
  onSelectSentenceWidth: (width: SentenceWidth) => void
  onStart: () => void
}

// Sentence Width controls the reading container's line-wrap width, not font
// size (that's what makes it distinct from Phrase Reading's Phrase Size) —
// purely presentational, the engine never sees it.
export function SentenceReadingModeSettings({
  targetWpm,
  onSelectTargetWpm,
  sentenceWidth,
  onSelectSentenceWidth,
  onStart,
}: SentenceReadingModeSettingsProps): React.JSX.Element {
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
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Sentence Reading Mode™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Read one complete sentence at a time, at a natural, comfortable rhythm.
        </p>
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
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Sentence Width</p>
        <div className="flex flex-wrap justify-center gap-2">
          {SENTENCE_WIDTH_OPTIONS.map((option) => (
            <Button
              key={option.id}
              variant={option.id === sentenceWidth ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSelectSentenceWidth(option.id)}
            >
              {option.label}
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
