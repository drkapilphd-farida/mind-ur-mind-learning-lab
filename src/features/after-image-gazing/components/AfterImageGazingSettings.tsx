'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { useIsEmbeddedExercise } from '@/features/thirty-day-curriculum/embeddedExerciseContext'
import {
  ROUNDS_PER_SESSION,
  AFTERIMAGE_DURATION_MS,
  GAZE_ASSETS,
  GAZE_CATEGORY_LABELS,
  type GazeCategorySelection,
} from '../afterImageGazingDataset'

type AfterImageGazingSettingsProps = {
  onStart: (categorySelection: GazeCategorySelection) => void
}

const CATEGORY_OPTIONS: readonly { value: GazeCategorySelection; label: string; description: string }[] = [
  { value: 'master', label: `Mixed Master Deck (${GAZE_ASSETS.length}+ items)`, description: `Randomized across all ${GAZE_ASSETS.length} assets` },
  { value: 'silhouette', label: GAZE_CATEGORY_LABELS.silhouette, description: 'High-contrast duotone & true negative figure cards' },
  { value: 'geometric', label: GAZE_CATEGORY_LABELS.geometric, description: 'Circles, mandalas, polygons' },
  { value: 'cosmic', label: GAZE_CATEGORY_LABELS.cosmic, description: 'Sun, moon, lotus, and other cosmic symbols' },
]

function countForSelection(categorySelection: GazeCategorySelection): number {
  if (categorySelection === 'master') return GAZE_ASSETS.length
  return GAZE_ASSETS.filter((asset) => asset.category === categorySelection).length
}

// No per-attempt configuration exists beyond deck selection (gaze
// duration is randomized per round within the brief's own 15-30s range,
// and there's no target-pace concept for a gazing exercise) — this
// screen is the instructions/intro gate every advanced exercise has
// before Start, plus the deck picker this upgrade adds and an honest
// heads-up that what you notice varies naturally from person to person
// and round to round.
export function AfterImageGazingSettings({ onStart }: AfterImageGazingSettingsProps): React.JSX.Element {
  const isEmbedded = useIsEmbeddedExercise()
  const [categorySelection, setCategorySelection] = useState<GazeCategorySelection>('master')
  const afterimageSeconds = Math.round(AFTERIMAGE_DURATION_MS / 1000)

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
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">After-Image / Complementary Color Gazing™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A vibrant glowing shape holds steady in the center of the screen — fix your gaze on it, without blinking, for the full
          countdown. The screen then shifts to a neutral surface for {afterimageSeconds}s: keep looking at the same spot and notice
          whatever soft afterimage color lingers. There&apos;s no right answer — just report what you honestly saw.
        </p>
      </div>

      <div className="w-full">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Choose your deck</p>
        <div className="mt-3 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          {CATEGORY_OPTIONS.map((option) => {
            const isSelected = categorySelection === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setCategorySelection(option.value)}
                aria-pressed={isSelected}
                className={`rounded-2xl border-2 px-4 py-3 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${
                  isSelected ? 'border-foreground bg-accent/30' : 'border-border hover:border-primary/40'
                }`}
              >
                <p className="text-sm font-semibold text-foreground">{option.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{option.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {ROUNDS_PER_SESSION} rounds per session, drawn from {countForSelection(categorySelection)} unique assets — never repeated
        within a session.
      </p>

      <button
        onClick={() => onStart(categorySelection)}
        className="rounded-full bg-foreground px-10 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Start
      </button>
    </div>
  )
}
