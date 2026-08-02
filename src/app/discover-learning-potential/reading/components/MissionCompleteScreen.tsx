'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { READING_SPRINT_LABEL, READING_SPRINT_ORDER, type ReadingSprintId } from '@/features/reading-discovery/readingSprints'
import { pickMissionAchievementMessage } from '@/features/reading-discovery/pickMissionAchievementMessage'
import type { SprintRuntimeCompletion } from '@/features/reading-discovery/useContinuousSprintRuntime'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'

type MissionCompleteScreenProps = {
  sprint: ReadingSprintId
  completion: SprintRuntimeCompletion
  onContinue: () => void
}

// Sprint-2.6 FIX-06/FIX-10/FIX-11 — "Mission Complete → Current Speed →
// One AI Insight → XP → Continue." Exactly one real emotional line per
// "Less Words. More Impact." Sprint-2.7 FIX-29 — that one line is now a
// real, sprint-specific achievement (`pickMissionAchievementMessage`),
// never the same generic celebration every mission — each Sprint
// celebrates the distinct real cognitive skill it just measured. Real
// measured WPM (never shown for Reading Understanding, which measures
// understanding, not speed) is the same realistic, ceiling-clamped value
// the Result screen uses (`clampToRealisticWpm`, FIX-01/FIX-13).
export function MissionCompleteScreen({ sprint, completion, onContinue }: MissionCompleteScreenProps): React.JSX.Element {
  const nextSprint = READING_SPRINT_ORDER[READING_SPRINT_ORDER.indexOf(sprint) + 1]
  const achievement = pickMissionAchievementMessage(sprint)

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16 text-center"
    >
      <LivingBrainLogo className="size-10 sm:size-12" />

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
        className={cn(TYPOGRAPHY.h2, 'mt-8')}
      >
        ✨ Mission Complete
      </motion.p>
      <p className="mt-1 text-sm font-medium text-muted-foreground">{READING_SPRINT_LABEL[sprint]}</p>

      {completion.finalWpm !== null && (
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.25, ease: 'easeOut' }}
          className="mt-8 rounded-2xl border border-border/40 bg-card px-8 py-5 shadow-md"
        >
          <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>Current Reading Speed</p>
          <p className="mt-1 font-heading text-4xl font-bold text-foreground">{completion.finalWpm} WPM</p>
        </motion.div>
      )}

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.42, ease: 'easeOut' }}
        className="mt-6 text-lg font-semibold text-foreground"
      >
        {achievement}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.56, ease: 'easeOut' }}
        className="mt-4 flex items-center gap-3 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary"
      >
        <span>+{completion.xpEarned} XP</span>
        {nextSprint !== undefined && <span className="text-muted-foreground">🔓 {READING_SPRINT_LABEL[nextSprint]} unlocked</span>}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.85, ease: 'easeOut' }} className="mt-10">
        <Button size="lg" className="min-h-14 min-w-[220px] rounded-full text-base shadow-sm" onClick={onContinue}>
          Continue
        </Button>
      </motion.div>
    </motion.div>
  )
}
