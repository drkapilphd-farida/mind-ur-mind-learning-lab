'use client'

import Link from 'next/link'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { Button } from '@/components/ui/button'
import { ROUNDS_PER_SESSION, CATEGORY_LABELS, type PhotographicMemoryCategoryFilter } from '../photographicMemoryDataset'

const FILTER_OPTIONS: readonly { id: PhotographicMemoryCategoryFilter; label: string }[] = [
  { id: 'all', label: 'All Categories' },
  { id: 'mandala', label: CATEGORY_LABELS.mandala },
  { id: 'icon-cluster', label: CATEGORY_LABELS['icon-cluster'] },
  { id: 'flash-matrix', label: CATEGORY_LABELS['flash-matrix'] },
  { id: 'color-shape', label: CATEGORY_LABELS['color-shape'] },
]

type PhotographicMemorySettingsProps = {
  categoryFilter: PhotographicMemoryCategoryFilter
  onSelectCategoryFilter: (filter: PhotographicMemoryCategoryFilter) => void
  onStart: () => void
}

// The one genuine per-attempt choice this exercise has: which category
// (or all 4, cycled) to practice — everything else (flash duration,
// round count) is fixed, so there's no WPM-style numeric picker here.
export function PhotographicMemorySettings({
  categoryFilter,
  onSelectCategoryFilter,
  onStart,
}: PhotographicMemorySettingsProps): React.JSX.Element {
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
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Photographic Memory™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Something flashes for under a second — a geometric mandala, a cosmic icon cluster, a word or number code, or
          a grid of colored shapes. Then pick the exact match from 4 nearly-identical options; the decoys are the
          same content with only a subtle tweak, so only a true photographic memory catches the difference.
          You&apos;ve got a few seconds to answer before the window closes.
        </p>
      </div>

      <div className="w-full">
        <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">Category</p>
        <div className="flex flex-wrap justify-center gap-2">
          {FILTER_OPTIONS.map((option) => (
            <Button
              key={option.id}
              variant={option.id === categoryFilter ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSelectCategoryFilter(option.id)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {ROUNDS_PER_SESSION} rounds per sprint. Consecutive correct recalls build a streak multiplier for bonus
        points, and a flawless dash earns a bonus.
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
