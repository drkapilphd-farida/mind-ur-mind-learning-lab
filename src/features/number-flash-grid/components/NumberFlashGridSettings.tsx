'use client'

import Link from 'next/link'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { useIsEmbeddedExercise } from '@/features/thirty-day-curriculum/embeddedExerciseContext'
import { Button } from '@/components/ui/button'
import { WhyThisDrillWorks } from '@/components/exercises/WhyThisDrillWorks'
import { NUMBER_FLASH_GRID_ROUNDS_PER_SESSION, NUMBER_FLASH_GRID_SIZES, type NumberFlashGridSize } from '../numberFlashGridEngine'

type NumberFlashGridSettingsProps = {
  gridSize: NumberFlashGridSize
  onSelectGridSize: (gridSize: NumberFlashGridSize) => void
  onStart: () => void
}

export function NumberFlashGridSettings({ gridSize, onSelectGridSize, onStart }: NumberFlashGridSettingsProps): React.JSX.Element {
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
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Number Flash Grid™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Digits flash briefly across the grid. Memorize where they were and what they were, then type back what you
          saw.
        </p>
      </div>

      <div className="w-full">
        <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">Grid Size</p>
        <div className="flex flex-wrap justify-center gap-2">
          {NUMBER_FLASH_GRID_SIZES.map((size) => (
            <Button key={size} variant={size === gridSize ? 'default' : 'outline'} size="sm" onClick={() => onSelectGridSize(size)}>
              {size} × {size}
            </Button>
          ))}
        </div>
      </div>

      <WhyThisDrillWorks>{NUMBER_FLASH_GRID_ROUNDS_PER_SESSION} rounds, each tighter and busier than the last.</WhyThisDrillWorks>

      <button
        onClick={onStart}
        className="rounded-full bg-foreground px-10 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Start
      </button>
    </div>
  )
}
