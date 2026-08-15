'use client'

import Link from 'next/link'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { useIsEmbeddedExercise } from '@/features/thirty-day-curriculum/embeddedExerciseContext'
import { FLUID_ENERGY_ROUNDS_PER_SESSION } from '../fluidEnergyEngine'

type FluidEnergyBalancerSettingsProps = {
  onStart: () => void
}

// No per-attempt configuration exists (the round progression is fixed and
// deliberately escalating), so this screen is purely the instructions/
// intro gate every mode has before Start — same visual convention as
// SchulteGridDrillSettings.tsx / EspZenerTelepathySettings.tsx's own
// screens, just with nothing to actually configure.
export function FluidEnergyBalancerSettings({ onStart }: FluidEnergyBalancerSettingsProps): React.JSX.Element {
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
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Fluid Energy Balancer™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Two opposing energies — heavy Earth &amp; Gold, light Air &amp; Water — pull against each other. Hold{' '}
          <span className="font-semibold text-foreground">Ground It</span> or{' '}
          <span className="font-semibold text-foreground">Lift It</span> to counteract the drift and hold perfect
          harmony. {FLUID_ENERGY_ROUNDS_PER_SESSION} rounds, each with tighter balance and stronger drift than the
          last.
        </p>
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
