'use client'

import Link from 'next/link'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { ROUNDS_PER_SESSION, MAX_LIVES } from '../pictorialEssenceSprintDataset'

type PictorialEssenceSprintSettingsProps = {
  onStart: () => void
}

// No per-attempt configuration exists (flash duration is fixed and
// ultra-brief, and there's no target-pace concept for a pure essence-
// recall task), so this screen is purely the instructions/intro gate
// every advanced exercise has before Start.
export function PictorialEssenceSprintSettings({ onStart }: PictorialEssenceSprintSettingsProps): React.JSX.Element {
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
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">High-Speed Pictorial Essence Sprint™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Arcade Hard Mode. A glowing icon flashes for barely half a second, drawn from a huge pool spanning water,
          cosmic, earth, fire, sky, forest, abstract, and symbolic essences. Then spot the EXACT rendering among 4
          near-identical options — the other 3 are the same glyph with only a subtle rotation, shade, or size
          change. You get just {(1.5).toFixed(1)}s to answer, {MAX_LIVES} lives, and a streak multiplier plus a fast-reflex
          bonus on every correct hit. Lose all {MAX_LIVES} lives and it&apos;s Game Over.
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        {ROUNDS_PER_SESSION} rounds per sprint — every essence category appears exactly twice.
      </p>

      <button
        onClick={onStart}
        className="rounded-full bg-foreground px-10 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Start
      </button>
    </div>
  )
}
