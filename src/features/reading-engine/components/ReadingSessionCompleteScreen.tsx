'use client'

import Link from 'next/link'
import { ReadingStatTile } from './ReadingStatTile'
import type { ReadingSessionResult } from '../types'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'

type ReadingSessionCompleteScreenProps = {
  title?: string
  subtitle: string
  result: ReadingSessionResult
  bestWpm: number
  onReadAgain: () => void
  backHref?: string
}

// Sprint 3.2A — the one shared completion screen every Reading Mode
// inherits. Replaces VerticalWordReadingComplete.tsx and
// PhraseReadingModeComplete.tsx, which were byte-for-byte identical except
// for their subtitle copy — that copy is now the one thing modes still
// customize, via props, not by hand-rolling their own screen.
// Sprint 3.3 — "Average WPM" renamed to "Average Reading Pace" for
// terminology consistency with ReadingHeader's live "Reading Pace" label;
// applies identically to every mode using this shared screen.
export function ReadingSessionCompleteScreen({
  title = 'Session Complete',
  subtitle,
  result,
  bestWpm,
  onReadAgain,
  backHref = '/labs/quantum-speed-reading',
}: ReadingSessionCompleteScreenProps): React.JSX.Element {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="grid w-full grid-cols-2 gap-4">
        <ReadingStatTile variant="card" label="Average Reading Pace" value={String(result.averageWpm)} />
        <ReadingStatTile variant="card" label="Target WPM" value={String(result.targetWpm)} />
        <ReadingStatTile variant="card" label="Time" value={formatElapsedTime(result.elapsedMs)} />
        <ReadingStatTile variant="card" label="Words Read" value={String(result.wordsRead)} />
        <ReadingStatTile variant="card" label="Completion" value={`${result.completionPercent}%`} />
        <ReadingStatTile variant="card" label="Best Record" value={`${bestWpm} WPM`} />
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={onReadAgain}
          className="rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Read Again
        </button>
        <Link
          href={backHref}
          className="rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
        >
          Back to Lab
        </Link>
      </div>
    </div>
  )
}
