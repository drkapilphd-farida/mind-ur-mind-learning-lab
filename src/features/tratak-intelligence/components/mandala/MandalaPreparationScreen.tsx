'use client'

import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

const PREPARATION_INSTRUCTIONS = [
  'Sit comfortably.',
  'Keep your spine straight.',
  'Blink naturally.',
  'Do not strain your eyes.',
  'Focus gently on the center of the mandala.',
  'Remain relaxed.',
] as const

type MandalaPreparationScreenProps = {
  onReady: () => void
}

export function MandalaPreparationScreen({ onReady }: MandalaPreparationScreenProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''

  return (
    <div className={cn('mx-auto flex w-full max-w-md flex-col items-center gap-8 text-center', fadeClass)}>
      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Preparation</p>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">Get Ready to Focus</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Steady visual fixation trains the focus stamina that fluent reading requires.
        </p>
      </div>

      <div className="w-full rounded-2xl border bg-card p-6 text-left shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-muted-foreground" aria-hidden="true" />
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Before You Begin</p>
        </div>
        <ul className="mt-3 space-y-2.5">
          {PREPARATION_INSTRUCTIONS.map((instruction) => (
            <li key={instruction} className="flex items-center gap-2.5 text-sm text-foreground">
              <span className="size-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              {instruction}
            </li>
          ))}
        </ul>
      </div>

      <Button
        size="lg"
        className={cn('w-full rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
        onClick={onReady}
      >
        I&apos;m Ready
      </Button>
    </div>
  )
}
