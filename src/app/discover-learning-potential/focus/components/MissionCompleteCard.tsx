'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { FOCUS_MISSION_LABEL, MISSION_XP_AWARD, type FocusMissionId } from '@/features/focus-discovery/focusMissions'
import { FocusExperimentLayout } from './FocusExperimentLayout'

type MissionCompleteCardProps = {
  mission: FocusMissionId
  onContinue: () => void
  // Sprint-1.9 AI Presence Engine™ / AI Trust™ — the one real, short
  // line this exact mission's own real result earned
  // (`pickFocusEncouragement`), drawn from this session's own real
  // `AiVoiceMemory` so it's never repeated. `null` is a real, valid
  // outcome — "Silence is often more intelligent than unnecessary
  // feedback" — never a forced line just to fill the screen.
  aiLine?: string | null
  // Sprint-1.7 RULE-06 — `false` only for the very first mission (there's
  // no real "increased difficulty" to report yet before any mission has
  // actually run its own real ladder).
  showDifficultyNote?: boolean
}

// Sprint-1.6 FIX-10/FIX-11 — "Never interrupt attention after every
// tap... only celebrate when the mission ends... Duration:
// approximately 700-900ms. Then continue automatically." No CTA here
// anymore (Sprint-1's own manual "Continue" tap is gone) — this beat is
// purely timer-driven, exactly like `MicroInsightCard`/`CuriosityBridge`
// elsewhere in this codebase.
const AUTO_CONTINUE_MS = 900

// RULE-06 Mission Completion Experience™ — "Mission Complete → XP
// Earned → Difficulty Increased → Preparing Next Challenge → Next
// Mission." Sprint-1.9 AI Trust™ — dropped the old fixed, unconditional
// "Lightning Reflexes!"-style headline (shown regardless of actual
// performance): the ONE real message here is now always evidence-based,
// grounded in this exact mission's own real result — or real silence.
export function MissionCompleteCard({ mission, onContinue, aiLine, showDifficultyNote = true }: MissionCompleteCardProps): React.JSX.Element {
  useEffect(() => {
    const timer = window.setTimeout(onContinue, AUTO_CONTINUE_MS)
    return () => window.clearTimeout(timer)
  }, [onContinue])

  return (
    <FocusExperimentLayout>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }} className={cn(TYPOGRAPHY.h2)}>
        ✨ Mission Complete
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08, ease: 'easeOut' }}
        className="mt-1 text-sm font-medium text-muted-foreground"
      >
        {FOCUS_MISSION_LABEL[mission]}
      </motion.p>

      {aiLine !== null && aiLine !== undefined && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
          className="mt-8 text-xl font-semibold text-foreground"
        >
          {aiLine}
        </motion.p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3, ease: 'easeOut' }}
        className={cn('inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary', aiLine !== null && aiLine !== undefined ? 'mt-4' : 'mt-8')}
      >
        +{MISSION_XP_AWARD} XP
      </motion.div>

      {showDifficultyNote && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4, ease: 'easeOut' }}
          className="mt-3 text-xs text-muted-foreground/70"
        >
          Difficulty increases every round.
        </motion.p>
      )}
    </FocusExperimentLayout>
  )
}
