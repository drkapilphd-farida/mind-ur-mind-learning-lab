'use client'

import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import type { CurriculumPhase } from '../curriculumDatabase'

type PhaseCompleteCelebrationProps = {
  completedPhase: CurriculumPhase
  nextPhase: CurriculumPhase
}

// Phase-Complete Celebration Screens™ — a real, if brief, milestone
// moment: only 3 of these exist across the whole 30-day program (Day 7,
// 14, 21 — see getPhaseJustCompleted), so it clears the bar this app's
// own "no confetti for routine moments" house style sets (see
// ConfettiBurst.tsx's own comment on why THAT effect is reserved for a
// genuine once-per-user finale) — deliberately lighter than that: one
// spring pop-in, no canvas particle system, matching "lightweight" as
// asked. Purely presentational — the real phase transition already
// happened the moment this day's checkpoint was recorded.
export function PhaseCompleteCelebration({ completedPhase, nextPhase }: PhaseCompleteCelebrationProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 22 }}
      className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-6 text-center"
      data-phase-complete-celebration={completedPhase.id}
    >
      <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden="true" />
      <div className="relative flex flex-col items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-md">
          <Trophy className="size-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold tracking-widest text-emerald-600 uppercase dark:text-emerald-400">Phase {completedPhase.id} Complete!</p>
          <h2 className="mt-1 font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">{completedPhase.title}</h2>
        </div>
        <p className="max-w-sm text-sm text-muted-foreground">
          Up next — <span className="font-semibold text-foreground">Phase {nextPhase.id}: {nextPhase.title}</span>. {nextPhase.description}
        </p>
      </div>
    </motion.div>
  )
}
