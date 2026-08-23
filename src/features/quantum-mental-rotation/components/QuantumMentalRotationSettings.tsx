'use client'

import Link from 'next/link'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { useIsEmbeddedExercise } from '@/features/thirty-day-curriculum/embeddedExerciseContext'
import { ROUNDS_PER_SESSION, RECALL_TIME_LIMIT_MS } from '../quantumMentalRotationDataset'

type QuantumMentalRotationSettingsProps = {
  onStart: () => void
}

// No per-attempt configuration exists (presentation duration is
// randomized per round within the brief's own 2-3s range, and there's no
// target-pace concept for a mental-rotation task), so this screen is
// purely the instructions/intro gate every advanced exercise has before
// Start.
export function QuantumMentalRotationSettings({ onStart }: QuantumMentalRotationSettingsProps): React.JSX.Element {
  const isEmbedded = useIsEmbeddedExercise()
  const recallSeconds = Math.round(RECALL_TIME_LIMIT_MS / 1000)

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
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Quantum Mental Object Rotation™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A colored 3D object appears with every face labeled — memorize it. The object then hides while you&apos;re told a
          rotation to picture in your mind (a 90° turn, a 180° turn, or a flip upside down). Once it reappears as a
          question, you get {recallSeconds}s to say which color is now facing the named direction — plus a streak
          multiplier and a fast-reflex bonus on every correct hit.
        </p>
      </div>

      <p className="text-xs text-muted-foreground">{ROUNDS_PER_SESSION} rounds per sprint — every rotation type appears exactly 4 times.</p>

      <button
        onClick={onStart}
        className="rounded-full bg-foreground px-10 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Start
      </button>
    </div>
  )
}
