'use client'

import { motion } from 'framer-motion'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { LearningPotentialLayout } from './LearningPotentialLayout'

type WhyContinueScreenProps = { onContinue: () => void }

// UDCE-1.5 Step-6 "Strengthen Why Continue™" — outcomes, never
// capabilities. "Always communicate benefit before capability."
const REASONS = ['Learn Faster', 'Remember Longer', 'Focus Better'] as const

const CARD_STEP_S = 0.12

// Screen 6 — Why Continue?™. Three plain cards, no extra explanation —
// per the locked brief.
export function WhyContinueScreen({ onContinue }: WhyContinueScreenProps): React.JSX.Element {
  return (
    <LearningPotentialLayout eyebrow="AI Learns With You." ctaLabel="Continue" onCta={onContinue}>
      <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="text-5xl" aria-hidden="true">
        ❤️
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
        className={cn(TYPOGRAPHY.h1, 'mt-4')}
      >
        Every Session Gets Smarter
      </motion.h1>
      <div className="mt-6 flex flex-col gap-2">
        {REASONS.map((reason, index) => (
          <motion.div
            key={reason}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.3 + index * CARD_STEP_S, ease: 'easeOut' }}
            className="rounded-xl border border-border/40 bg-card px-4 py-3 text-sm font-medium text-foreground"
          >
            {reason}
          </motion.div>
        ))}
      </div>
    </LearningPotentialLayout>
  )
}
