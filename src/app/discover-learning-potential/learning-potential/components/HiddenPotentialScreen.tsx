'use client'

import { motion } from 'framer-motion'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { LearningPotentialLayout } from './LearningPotentialLayout'

type HiddenPotentialScreenProps = { outcomeMessage: string; onContinue: () => void }

// Screen 3 — Personal Possibility™ (UDCE-1.5 Step-2). The headline
// itself is the real, personal, outcome-focused message — never the old
// fixed "More Is Possible" heading. No percentages, no negative wording.
export function HiddenPotentialScreen({ outcomeMessage, onContinue }: HiddenPotentialScreenProps): React.JSX.Element {
  return (
    <LearningPotentialLayout eyebrow="Unlock Your Potential." ctaLabel="Continue" onCta={onContinue}>
      <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="text-5xl" aria-hidden="true">
        ✨
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
        className={cn(TYPOGRAPHY.h1, 'mt-4')}
      >
        {outcomeMessage}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.35, ease: 'easeOut' }}
        className={cn(TYPOGRAPHY.caption, 'mt-4')}
      >
        Today&apos;s assessment found opportunities to improve.
      </motion.p>
    </LearningPotentialLayout>
  )
}
