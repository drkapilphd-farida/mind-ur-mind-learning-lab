'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

const TARGET_WPM_OPTIONS = [100, 150, 200, 250, 300, 350, 400, 450, 500] as const

export type ParagraphReadingWidth = 'compact' | 'comfortable' | 'wide'
export type ParagraphFontSize = 'small' | 'medium' | 'large'

const READING_WIDTH_OPTIONS: readonly { id: ParagraphReadingWidth; label: string }[] = [
  { id: 'compact', label: 'Compact' },
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'wide', label: 'Wide' },
]

const FONT_SIZE_OPTIONS: readonly { id: ParagraphFontSize; label: string }[] = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
]

type ParagraphReadingModeSettingsProps = {
  targetWpm: number
  onSelectTargetWpm: (wpm: number) => void
  readingWidth: ParagraphReadingWidth
  onSelectReadingWidth: (width: ParagraphReadingWidth) => void
  fontSize: ParagraphFontSize
  onSelectFontSize: (size: ParagraphFontSize) => void
  onStart: () => void
}

// Reading Width and Font Size are both purely presentational — the engine
// never sees either, same as every prior mode's own settings.
export function ParagraphReadingModeSettings({
  targetWpm,
  onSelectTargetWpm,
  readingWidth,
  onSelectReadingWidth,
  fontSize,
  onSelectFontSize,
  onStart,
}: ParagraphReadingModeSettingsProps): React.JSX.Element {
  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <Link
        href="/labs/quantum-speed-reading"
        className="absolute top-4 right-6 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
      >
        Exit
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Paragraph Reading Mode™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Read full paragraphs continuously, at a comfortable width and size, without interruption.
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
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Reading Width</p>
        <div className="flex flex-wrap justify-center gap-2">
          {READING_WIDTH_OPTIONS.map((option) => (
            <Button
              key={option.id}
              variant={option.id === readingWidth ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSelectReadingWidth(option.id)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="w-full">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Font Size</p>
        <div className="flex flex-wrap justify-center gap-2">
          {FONT_SIZE_OPTIONS.map((option) => (
            <Button
              key={option.id}
              variant={option.id === fontSize ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSelectFontSize(option.id)}
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
