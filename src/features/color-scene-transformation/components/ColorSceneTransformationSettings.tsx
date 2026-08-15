'use client'

import Link from 'next/link'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { useIsEmbeddedExercise } from '@/features/thirty-day-curriculum/embeddedExerciseContext'
import { ROUNDS_PER_SESSION, RECALL_TIME_LIMIT_MS } from '../colorSceneTransformationDataset'

type ColorSceneTransformationSettingsProps = {
  onStart: () => void
}

// No per-attempt configuration exists (step pacing is fixed, and there's
// no target-pace concept for a scene-transformation journey), so this
// screen is purely the instructions/intro gate every advanced exercise
// has before Start.
export function ColorSceneTransformationSettings({ onStart }: ColorSceneTransformationSettingsProps): React.JSX.Element {
  const isEmbedded = useIsEmbeddedExercise()
  const recallSeconds = Math.round(RECALL_TIME_LIMIT_MS / 1000)

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
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Color & Scene Transformation Journey™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A serene scene appears and smoothly transforms — an ocean drifting from blue to golden, or a forest sliding
          from day into starry night. Watch each step, then the scene fades while you hold the final state in mind.
          Once it reappears as a question, you get {recallSeconds}s to say what it became — plus a streak multiplier
          and a fast-reflex bonus on every correct hit.
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        {ROUNDS_PER_SESSION} rounds per journey — half track color, half track time of day.
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
