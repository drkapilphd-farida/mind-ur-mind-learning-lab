'use client'

import Link from 'next/link'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { useIsEmbeddedExercise } from '@/features/thirty-day-curriculum/embeddedExerciseContext'
import { Button } from '@/components/ui/button'
import { IMAGE_FLASH_GRID_ROUNDS_PER_SESSION, IMAGE_FLASH_GRID_SIZES, type ImageFlashGridSize } from '../imageFlashGridEngine'

type ImageFlashGridSettingsProps = {
  gridSize: ImageFlashGridSize
  onSelectGridSize: (gridSize: ImageFlashGridSize) => void
  onStart: () => void
}

export function ImageFlashGridSettings({ gridSize, onSelectGridSize, onStart }: ImageFlashGridSettingsProps): React.JSX.Element {
  const isEmbedded = useIsEmbeddedExercise()
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
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Image Flash Grid™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A handful of vibrant icons flash briefly across the grid — pure photographic recall, no words, no numbers.
          Memorize both where they were and what they were, then tap each cell and pick the icon you saw.{' '}
          {IMAGE_FLASH_GRID_ROUNDS_PER_SESSION} rounds, each tighter and busier than the last.
        </p>
      </div>

      <div className="w-full">
        <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">Grid Size</p>
        <div className="flex flex-wrap justify-center gap-2">
          {IMAGE_FLASH_GRID_SIZES.map((size) => (
            <Button key={size} variant={size === gridSize ? 'default' : 'outline'} size="sm" onClick={() => onSelectGridSize(size)}>
              {size} × {size}
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
