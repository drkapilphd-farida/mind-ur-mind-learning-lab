'use client'

import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type MissionProgressDotsProps = {
  total: number
  currentIndex: number
}

// Memory Discovery Foundation™ (Sprint-1) FIX-03 — "Mission 2 of 5...
// Progress should feel like a journey, not a loading bar." Modeled on
// Reading Discovery's own identical `SprintProgressDots`, duplicated
// here rather than imported — each Discovery experience owns its own
// component tree (same convention `MemoryExperimentLayout`'s own comment
// already documents).
export function MissionProgressDots({ total, currentIndex }: MissionProgressDotsProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="flex items-center justify-center gap-1.5" role="img" aria-label={`Mission ${currentIndex + 1} of ${total}`}>
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
