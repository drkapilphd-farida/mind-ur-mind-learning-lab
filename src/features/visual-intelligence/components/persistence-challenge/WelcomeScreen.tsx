'use client'

import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type WelcomeScreenProps = {
  onBegin: () => void
}

export function WelcomeScreen({ onBegin }: WelcomeScreenProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards' : ''
  const fadeStyle = (delayMs: number): React.CSSProperties | undefined =>
    !prefersReducedMotion ? { animationDelay: `${delayMs}ms`, animationFillMode: 'backwards' } : undefined

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 text-center">
      <div
        className={cn('flex size-24 items-center justify-center rounded-full bg-primary/[0.07]', !prefersReducedMotion && 'animate-in zoom-in-75 duration-700')}
        aria-hidden="true"
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/[0.12] text-primary">
          <Eye className="size-7" aria-hidden="true" />
        </div>
      </div>

      <div className={fadeClass} style={fadeStyle(120)}>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Visual Intelligence Lab™</p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground">Image Persistence Challenge™</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Train visual attention, observation and visual persistence through guided practice.
        </p>
      </div>

      <div className={cn('w-full', fadeClass)} style={fadeStyle(240)}>
        <Button
          size="lg"
          className={cn('w-full rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
          onClick={onBegin}
        >
          Begin Challenge
        </Button>
      </div>
    </div>
  )
}
