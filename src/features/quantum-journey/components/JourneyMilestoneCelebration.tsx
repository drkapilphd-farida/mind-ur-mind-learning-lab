'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { playRewardChime } from '@/app/unified-quantum-session-preview/components/soundEngine'

type JourneyMilestoneCelebrationProps = {
  // An exact-match 3/7/14/21-day streak (getMilestoneHitExactly's own
  // return value) — this component is only ever rendered when that's
  // non-null, so a milestone genuinely was just reached, never guessed.
  milestoneStreak: number
}

// Streak Milestone Celebration™ — getMilestoneHitExactly (see
// streakMotivation.ts) already detects 3/7/14-day streak milestones, but
// today that detection only ever feeds AI-coach prompt text — the
// student never sees or feels the moment. This gives it a real, small
// celebration: playRewardChime (an existing soundEngine.ts export, doc-
// commented for exactly this "XP/reward popup appearing" moment, but
// never actually called anywhere before this) plus one distinct haptic
// pulse. Deliberately NOT a <ConfettiBurst> — that effect stays reserved
// for the once-per-user Day 21 finale only (see ConfettiBurst.tsx's own
// doc comment); this is a smaller, more frequent moment and should read
// that way.
export function JourneyMilestoneCelebration({ milestoneStreak }: JourneyMilestoneCelebrationProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    playRewardChime()
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([15, 60, 15])
  }, [])

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent px-4 py-3 text-left"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400">
        <Flame className="size-4.5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">{milestoneStreak}-Day Streak Milestone!</p>
        <p className="text-xs text-muted-foreground">You&rsquo;re building real momentum — keep it going.</p>
      </div>
    </motion.div>
  )
}
