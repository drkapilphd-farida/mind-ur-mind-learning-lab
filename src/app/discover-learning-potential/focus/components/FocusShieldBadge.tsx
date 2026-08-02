'use client'

import { motion } from 'framer-motion'
import { FOCUS_SHIELD_LABEL, type FocusShieldLevel } from '@/features/focus-discovery/useFocusShield'

type FocusShieldBadgeProps = {
  level: FocusShieldLevel
}

// Hero Attention Metric™ — Sprint-1.5 FIX-10. Shown during every
// mission's own real interaction (never on Welcome/Mission
// Intro/Complete/Curiosity screens — FIX-11 "Less Words. More Focus™"
// keeps those calm and uncluttered). A real, live, qualitative read on
// this mission's own recent behaviour — never a number.
export function FocusShieldBadge({ level }: FocusShieldBadgeProps): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground"
    >
      <span aria-hidden="true">🛡️</span>
      {FOCUS_SHIELD_LABEL[level]}
    </motion.div>
  )
}
