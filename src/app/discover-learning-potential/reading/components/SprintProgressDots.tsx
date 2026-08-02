'use client'

import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type SprintProgressDotsProps = {
  total: number
  currentIndex: number
}

// Reading Discovery Engine™ (Sprint-2 Part-1) — "● ○ ○ ○ ○", the
// brief's own example. Modeled on Focus Discovery's real
// `ProgressDots.tsx` pattern (same reduced-motion handling, same calm
// "never a percentage, never a score" discipline) but built embeddable
// (normal flow, not `fixed`) and on light-theme tokens (`primary`/
// `muted-foreground`, not Focus's dark-theme white/white-20) since
// Reading Discovery stays on the platform's light chrome throughout.
export function SprintProgressDots({ total, currentIndex }: SprintProgressDotsProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="flex items-center justify-center gap-1.5" role="img" aria-label={`Step ${currentIndex + 1} of ${total}`}>
      {Array.from({ length: total }, (_, index) => {
        const isDone = index < currentIndex
        const isCurrent = index === currentIndex
        return (
          <motion.span
            key={index}
            aria-hidden="true"
            className={cn('block size-1.5 rounded-full', isDone || isCurrent ? 'bg-primary' : 'bg-muted-foreground/25')}
            animate={{ scale: isCurrent ? 1.4 : 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35, ease: 'easeOut' }}
          />
        )
      })}
    </div>
  )
}
