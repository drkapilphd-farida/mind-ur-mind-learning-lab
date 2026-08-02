'use client'

import { EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type ImagePersistenceCloseEyesProps = {
  onContinue: () => void
}

export function ImagePersistenceCloseEyes({ onContinue }: ImagePersistenceCloseEyesProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 text-center">
      <div
        className={cn('flex size-20 items-center justify-center rounded-full bg-primary/[0.07]', !prefersReducedMotion && 'animate-in zoom-in-75 duration-500')}
        aria-hidden="true"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/[0.12] text-primary">
          <EyeOff className="size-6" aria-hidden="true" />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Visual Reflection™</p>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">Take a moment.</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Close your eyes. Allow the image to naturally appear. Observe without forcing.
        </p>
      </div>

      <Button
        size="lg"
        className={cn('w-full rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
        onClick={onContinue}
      >
        Continue
      </Button>
    </div>
  )
}
