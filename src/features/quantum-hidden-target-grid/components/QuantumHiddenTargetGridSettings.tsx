'use client'

import Link from 'next/link'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { useIsEmbeddedExercise } from '@/features/thirty-day-curriculum/embeddedExerciseContext'
import { WhyThisDrillWorks } from '@/components/exercises/WhyThisDrillWorks'
import { GRID_SIZE, GRID_ROWS, GRID_COLUMNS } from '../quantumHiddenTargetGridDataset'

type QuantumHiddenTargetGridSettingsProps = {
  onStart: () => void
}

// No per-attempt configuration exists (the grid is always the same
// 4×4 layout, and there's no target-pace concept for a pure guessing
// task), so this screen is purely the instructions/intro gate every
// advanced exercise has before Start — same visual convention as
// EspZenerTelepathySettings.tsx/SchulteGridDrillSettings.tsx.
export function QuantumHiddenTargetGridSettings({ onStart }: QuantumHiddenTargetGridSettingsProps): React.JSX.Element {
  const isEmbedded = useIsEmbeddedExercise()
  return (
    <div className={`relative mx-auto flex ${isEmbedded ? 'h-full' : 'min-h-[100dvh]'} max-w-md flex-col items-center justify-center gap-8 px-6 py-16 text-center`}>
      {!isEmbedded && <BrandWatermark className="absolute top-4 left-6" />}
      {!isEmbedded && (
        <Link
          href="/dashboard"
          className="absolute top-4 right-6 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
        >
          Exit
        </Link>
      )}

      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Quantum Hidden Target Grid™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A grid of hidden boxes holds one secret target each round. Don&apos;t think it through — tap the box your
          gut feels is right.
        </p>
      </div>

      <WhyThisDrillWorks>
        A {GRID_ROWS}×{GRID_COLUMNS} grid, {GRID_SIZE} rounds per sprint — every box is the target exactly once.
        Consecutive hits build a streak multiplier for bonus energy.
      </WhyThisDrillWorks>

      <button
        onClick={onStart}
        className="rounded-full bg-foreground px-10 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Start
      </button>
    </div>
  )
}
