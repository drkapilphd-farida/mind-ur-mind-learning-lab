'use client'

import { motion } from 'framer-motion'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { MEMORY_MISSION_ACHIEVEMENT, MEMORY_MISSION_LABEL, MISSION_XP_AWARD, type MemoryMissionId } from '@/features/memory-discovery/memoryMissions'
import { MemoryExperimentLayout } from './MemoryExperimentLayout'

type MissionCompleteCardProps = {
  mission: MemoryMissionId
  onContinue: () => void
  // Sprint-3 FIX-07 — Adaptive Encouragement: a real, optional line
  // reacting to this session's own real cross-mission streak so far
  // (`null` when neither a real strong streak nor a real recent miss
  // applies yet — no forced line every single time).
  adaptiveEncouragement?: string | null
}

// Memory Discovery Foundation™ (Sprint-1) FIX-04 — "✨ Mission Complete →
// Memory Skill Completed → Short AI Insight → XP Earned → Continue...
// Each mission should celebrate a different achievement. Never repeat
// the same message." Mirrors Reading Discovery's own Mission Complete
// beat — one rewarding screen between every mission and whatever comes
// next, never skipped.
export function MissionCompleteCard({ mission, onContinue, adaptiveEncouragement }: MissionCompleteCardProps): React.JSX.Element {
  return (
    <MemoryExperimentLayout ctaLabel="Continue" onCta={onContinue}>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className={cn(TYPOGRAPHY.h2)}>
        ✨ Mission Complete
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12, ease: 'easeOut' }}
        className="mt-1 text-sm font-medium text-muted-foreground"
      >
        {MEMORY_MISSION_LABEL[mission]}
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
        className="mt-8 text-xl font-semibold text-foreground"
      >
        {MEMORY_MISSION_ACHIEVEMENT[mission]}
      </motion.p>

      {adaptiveEncouragement !== null && adaptiveEncouragement !== undefined && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
          className="mt-2 text-sm text-muted-foreground"
        >
          {adaptiveEncouragement}
        </motion.p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.46, ease: 'easeOut' }}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary"
      >
        +{MISSION_XP_AWARD} XP
      </motion.div>
    </MemoryExperimentLayout>
  )
}
