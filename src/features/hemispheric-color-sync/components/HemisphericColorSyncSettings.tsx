'use client'

import Link from 'next/link'
import { ROUNDS_PER_SESSION, RECALL_TIME_LIMIT_MS } from '../hemisphericColorSyncDataset'

type HemisphericColorSyncSettingsProps = {
  onStart: () => void
}

// No per-attempt configuration exists (the recall window and round count
// are fixed, and there's no target-pace concept for a pure conflict-
// resolution task), so this screen is purely the instructions/intro gate
// every advanced exercise has before Start.
export function HemisphericColorSyncSettings({ onStart }: HemisphericColorSyncSettingsProps): React.JSX.Element {
  const recallSeconds = (RECALL_TIME_LIMIT_MS / 1000).toFixed(1)

  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <Link
        href="/labs/quantum-speed-reading"
        className="absolute top-4 right-6 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
      >
        Exit
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Hemispheric Color-Word Sync Grid™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A color name flashes on screen — always painted in a mismatched ink color, never its own. Each round tells you which
          hemisphere to trust: sometimes tap the swatch matching what the WORD says, sometimes the swatch matching the actual INK.
          You get just {recallSeconds}s per round, a streak multiplier, and a fast-reflex bonus on every correct hit.
        </p>
      </div>

      <p className="text-xs text-muted-foreground">{ROUNDS_PER_SESSION} rounds per sprint — word and ink prompts split exactly evenly.</p>

      <button
        onClick={onStart}
        className="rounded-full bg-foreground px-10 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Start
      </button>
    </div>
  )
}
